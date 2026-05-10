import { rowToSourceBin } from "./frequencyMappingRuntime.js";

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function amplitudeToDisplay(amplitude, maxAmplitude, floorDb) {
  if (maxAmplitude <= 0 || amplitude <= 0) return 0;
  const db = 20 * Math.log10(amplitude / maxAmplitude);
  return clamp01((db - floorDb) / -floorDb);
}

const APPROX_BRUSHES = [
  [2, 2],
  [4, 2],
  [6, 3],
  [10, 4],
  [16, 6],
  [24, 8],
  [36, 10],
  [52, 14],
];

export function createScribbleCanvasRuntime(widthBins = 256, heightBins = 256) {
  let activeWidthBins = widthBins;
  let activeHeightBins = heightBins;
  let grid = new Float32Array(activeWidthBins * activeHeightBins);

  function index(x, y) {
    return y * activeWidthBins + x;
  }

  function clear() {
    grid.fill(0);
  }

  function resize(nextWidthBins, nextHeightBins) {
    activeWidthBins = Math.max(1, Math.round(Number(nextWidthBins) || widthBins));
    activeHeightBins = Math.max(1, Math.round(Number(nextHeightBins) || heightBins));
    grid = new Float32Array(activeWidthBins * activeHeightBins);
  }

  function paintAt(x, y, radius, strength, eraseMode) {
    const r = Math.max(1, Math.round(Number(radius) || 1));
    const value = clamp01(strength);
    const cx = Math.round(Number(x) || 0);
    const cy = Math.round(Number(y) || 0);
    for (let py = Math.max(0, cy - r); py <= Math.min(activeHeightBins - 1, cy + r); py += 1) {
      for (let px = Math.max(0, cx - r); px <= Math.min(activeWidthBins - 1, cx + r); px += 1) {
        const dx = px - cx;
        const dy = py - cy;
        if ((dx * dx) + (dy * dy) > (r * r)) continue;
        const i = index(px, py);
        grid[i] = eraseMode ? 0 : Math.max(grid[i], value);
      }
    }
  }

  function paintEllipseInto(targetGrid, cx, cy, radiusX, radiusY, strength) {
    const rx = Math.max(1, Math.round(Number(radiusX) || 1));
    const ry = Math.max(1, Math.round(Number(radiusY) || 1));
    const x0 = Math.max(0, Math.round(cx) - rx);
    const x1 = Math.min(activeWidthBins - 1, Math.round(cx) + rx);
    const y0 = Math.max(0, Math.round(cy) - ry);
    const y1 = Math.min(activeHeightBins - 1, Math.round(cy) + ry);
    for (let py = y0; py <= y1; py += 1) {
      for (let px = x0; px <= x1; px += 1) {
        const nx = (px - cx) / rx;
        const ny = (py - cy) / ry;
        const distanceSq = (nx * nx) + (ny * ny);
        if (distanceSq > 1) continue;
        const falloff = 1 - Math.sqrt(distanceSq);
        const value = clamp01(strength * (0.35 + (0.65 * falloff)));
        const i = index(px, py);
        targetGrid[i] = Math.max(targetGrid[i], value);
      }
    }
  }

  function scoreEllipse(targetGrid, approxGrid, cx, cy, radiusX, radiusY, minStrength) {
    const rx = Math.max(1, Math.round(radiusX));
    const ry = Math.max(1, Math.round(radiusY));
    const x0 = Math.max(0, Math.round(cx) - rx);
    const x1 = Math.min(activeWidthBins - 1, Math.round(cx) + rx);
    const y0 = Math.max(0, Math.round(cy) - ry);
    const y1 = Math.min(activeHeightBins - 1, Math.round(cy) + ry);
    let weightedSum = 0;
    let weightSum = 0;

    for (let py = y0; py <= y1; py += 1) {
      for (let px = x0; px <= x1; px += 1) {
        const nx = (px - cx) / rx;
        const ny = (py - cy) / ry;
        const distanceSq = (nx * nx) + (ny * ny);
        if (distanceSq > 1) continue;
        const falloff = 0.35 + (0.65 * (1 - Math.sqrt(distanceSq)));
        const i = index(px, py);
        const remaining = Math.max(0, targetGrid[i] - approxGrid[i]);
        weightedSum += remaining * falloff;
        weightSum += falloff * falloff;
      }
    }

    const strength = clamp01(weightSum > 0 ? weightedSum / weightSum : 0);
    if (strength < minStrength) return null;

    let improvement = 0;
    for (let py = y0; py <= y1; py += 1) {
      for (let px = x0; px <= x1; px += 1) {
        const nx = (px - cx) / rx;
        const ny = (py - cy) / ry;
        const distanceSq = (nx * nx) + (ny * ny);
        if (distanceSq > 1) continue;
        const falloff = 0.35 + (0.65 * (1 - Math.sqrt(distanceSq)));
        const i = index(px, py);
        const before = targetGrid[i] - approxGrid[i];
        const afterApprox = Math.max(approxGrid[i], clamp01(strength * falloff));
        const after = targetGrid[i] - afterApprox;
        improvement += (before * before) - (after * after);
      }
    }

    return improvement > 0 ? { improvement, strength } : null;
  }

  function findMaxResidual(targetGrid, approxGrid, minStrength) {
    let bestIndex = -1;
    let bestResidual = minStrength;
    for (let i = 0; i < targetGrid.length; i += 1) {
      const residual = targetGrid[i] - approxGrid[i];
      if (residual > bestResidual) {
        bestResidual = residual;
        bestIndex = i;
      }
    }
    if (bestIndex === -1) return null;
    return {
      x: bestIndex % activeWidthBins,
      y: Math.floor(bestIndex / activeWidthBins),
      residual: bestResidual,
    };
  }

  function approximateWithBrushStrokes(options = {}) {
    const targetGrid = new Float32Array(grid);
    const approxGrid = new Float32Array(grid.length);
    const maxStrokes = Math.max(1, Math.min(1000, Math.round(Number(options.maxStrokes) || 100)));
    const minStrength = clamp01(options.minStrength ?? 0.05);
    const strokes = [];

    for (let strokeIndex = 0; strokeIndex < maxStrokes; strokeIndex += 1) {
      const pivot = findMaxResidual(targetGrid, approxGrid, minStrength);
      if (!pivot) break;

      let best = null;
      for (const [rx, ry] of APPROX_BRUSHES) {
        const score = scoreEllipse(targetGrid, approxGrid, pivot.x, pivot.y, rx, ry, minStrength);
        if (!score) continue;
        if (!best || score.improvement > best.improvement) {
          best = { ...score, radiusX: rx, radiusY: ry };
        }
      }
      if (!best) break;

      paintEllipseInto(approxGrid, pivot.x, pivot.y, best.radiusX, best.radiusY, best.strength);
      strokes.push({
        x: pivot.x / Math.max(1, activeWidthBins - 1),
        y: pivot.y / Math.max(1, activeHeightBins - 1),
        rx: best.radiusX / Math.max(1, activeWidthBins),
        ry: best.radiusY / Math.max(1, activeHeightBins),
        strength: Number(best.strength.toFixed(4)),
      });
    }

    grid = approxGrid;
    return {
      strokes,
      strokeCount: strokes.length,
      sourceActiveCount: targetGrid.reduce((sum, value) => sum + (value > minStrength ? 1 : 0), 0),
    };
  }

  function autoPaintFromStft(stft, options = {}) {
    if (!stft) return 0;
    if (activeWidthBins !== stft.segmentCount || activeHeightBins !== stft.frequencyBinCount) {
      resize(stft.segmentCount, stft.frequencyBinCount);
    }
    if (options.clearBeforePaint !== false) {
      clear();
    }

    const threshold = clamp01(options.threshold ?? 0.62);
    const contrast = Math.max(0.1, Number(options.contrast) || 1);
    const gain = Math.max(0, Number(options.gain) || 1);
    const floorDb = Math.min(-1, Number(options.loudnessFloorDb) || -72);
    const maxAmplitude = stft.maxAmplitude || 1;
    let paintedCount = 0;

    for (let segment = 0; segment < stft.segmentCount; segment += 1) {
      for (let bin = 0; bin < activeHeightBins; bin += 1) {
        const sourceBin = rowToSourceBin(bin, activeHeightBins, options, stft);
        const sourceIndex = (segment * stft.frequencyBinCount) + sourceBin;
        const displayValue = amplitudeToDisplay(stft.amplitudes[sourceIndex], maxAmplitude, floorDb);
        if (displayValue < threshold) continue;
        const isolated = (displayValue - threshold) / Math.max(0.0001, 1 - threshold);
        const strength = clamp01((isolated ** contrast) * gain);
        if (strength <= 0.001) continue;
        const gridIndex = (bin * activeWidthBins) + segment;
        grid[gridIndex] = Math.max(grid[gridIndex], strength);
        paintedCount += 1;
      }
    }
    return paintedCount;
  }

  function exportGridData() {
    return Array.from(grid, (v) => Number(v.toFixed(4)));
  }

  function importGridData(data) {
    if (!Array.isArray(data)) return false;
    const count = Math.min(grid.length, data.length);
    for (let i = 0; i < count; i += 1) {
      grid[i] = clamp01(data[i]);
    }
    for (let i = count; i < grid.length; i += 1) {
      grid[i] = 0;
    }
    return true;
  }

  return {
    get widthBins() { return activeWidthBins; },
    get heightBins() { return activeHeightBins; },
    get grid() { return grid; },
    clear,
    resize,
    paintAt,
    autoPaintFromStft,
    approximateWithBrushStrokes,
    exportGridData,
    importGridData,
  };
}
