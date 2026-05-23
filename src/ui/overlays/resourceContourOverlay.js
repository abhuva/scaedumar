import { sampleResourceMapValue } from "../../gameplay/resourceSearchRuntime.js";

const SEGMENT_CACHE_LIMIT = 8;
const segmentCache = new Map();
const rasterCache = new Map();

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function interpolatePoint(ax, ay, av, bx, by, bv, threshold) {
  const span = bv - av;
  const t = Math.abs(span) < 0.00001 ? 0.5 : (threshold - av) / span;
  return {
    x: ax + (bx - ax) * Math.max(0, Math.min(1, t)),
    y: ay + (by - ay) * Math.max(0, Math.min(1, t)),
  };
}

function getContourSegments(cell, threshold) {
  const { x0, y0, x1, y1, tl, tr, br, bl } = cell;
  const points = [];
  if ((tl >= threshold) !== (tr >= threshold)) {
    points.push(interpolatePoint(x0, y0, tl, x1, y0, tr, threshold));
  }
  if ((tr >= threshold) !== (br >= threshold)) {
    points.push(interpolatePoint(x1, y0, tr, x1, y1, br, threshold));
  }
  if ((br >= threshold) !== (bl >= threshold)) {
    points.push(interpolatePoint(x1, y1, br, x0, y1, bl, threshold));
  }
  if ((bl >= threshold) !== (tl >= threshold)) {
    points.push(interpolatePoint(x0, y1, bl, x0, y0, tl, threshold));
  }

  if (points.length < 2) return [];
  if (points.length === 2) return [[points[0], points[1]]];
  if (points.length === 4) {
    return [
      [points[0], points[1]],
      [points[2], points[3]],
    ];
  }
  return [];
}

function makeCacheKey(input, imageData, search, overlay, thresholds, step, knowledgeThreshold) {
  const version = input.contourVersion == null ? 0 : input.contourVersion;
  return [
    search.id,
    search.map,
    input.overlayLayer || "",
    search.channel,
    imageData.width,
    imageData.height,
    version,
    overlay.renderMode === "marching" ? "marching" : "raster",
    step,
    knowledgeThreshold.toFixed(4),
    finite(overlay.lineWidth, 1.25).toFixed(4),
    finite(overlay.bandWidth, 0.018).toFixed(4),
    Array.isArray(overlay.colors) ? overlay.colors.join(",") : "",
    thresholds.map((value) => finite(value, 0).toFixed(4)).join(","),
  ].join("|");
}

function parseRgba(color, fallback = [116, 215, 245, 148]) {
  const match = typeof color === "string"
    ? color.match(/rgba?\(([^)]+)\)/i)
    : null;
  if (!match) return fallback;
  const parts = match[1].split(",").map((part) => part.trim());
  const r = Math.max(0, Math.min(255, Math.round(finite(parts[0], fallback[0]))));
  const g = Math.max(0, Math.min(255, Math.round(finite(parts[1], fallback[1]))));
  const b = Math.max(0, Math.min(255, Math.round(finite(parts[2], fallback[2]))));
  const alpha = parts.length > 3 ? finite(parts[3], fallback[3] / 255) * 255 : fallback[3];
  const a = Math.max(0, Math.min(255, Math.round(alpha)));
  return [r, g, b, a];
}

function getCachedContourGroups(input, imageData, search, overlay, thresholds, step, knowledgeThreshold) {
  const cacheKey = makeCacheKey(input, imageData, search, overlay, thresholds, step, knowledgeThreshold);
  if (segmentCache.has(cacheKey)) {
    const cached = segmentCache.get(cacheKey);
    segmentCache.delete(cacheKey);
    segmentCache.set(cacheKey, cached);
    return cached;
  }

  const sampleKnowledge = typeof input.sampleKnowledge === "function" ? input.sampleKnowledge : () => 0;
  const maxX = Math.max(1, imageData.width - 1);
  const maxY = Math.max(1, imageData.height - 1);
  const groups = thresholds.map((threshold, thresholdIndex) => ({
    threshold,
    color: Array.isArray(overlay.colors) && overlay.colors[thresholdIndex]
      ? overlay.colors[thresholdIndex]
      : "rgba(116, 215, 245, 0.58)",
    lineWidth: Math.max(0.25, finite(overlay.lineWidth, 1.25)) + thresholdIndex * 0.25,
    segments: [],
  }));

  for (let y = 0; y < maxY; y += step) {
    const y1 = Math.min(maxY, y + step);
    for (let x = 0; x < maxX; x += step) {
      const x1 = Math.min(maxX, x + step);
      const centerX = (x + x1) * 0.5;
      const centerY = (y + y1) * 0.5;
      if (sampleKnowledge(search.id, centerX, centerY) < knowledgeThreshold) continue;
      const cell = {
        x0: x,
        y0: y,
        x1,
        y1,
        tl: sampleResourceMapValue(imageData, x, y, search.channel),
        tr: sampleResourceMapValue(imageData, x1, y, search.channel),
        br: sampleResourceMapValue(imageData, x1, y1, search.channel),
        bl: sampleResourceMapValue(imageData, x, y1, search.channel),
      };
      for (const group of groups) {
        const segments = getContourSegments(cell, group.threshold);
        for (const [a, b] of segments) {
          group.segments.push([a.x, a.y, b.x, b.y]);
        }
      }
    }
  }

  segmentCache.set(cacheKey, groups);
  while (segmentCache.size > SEGMENT_CACHE_LIMIT) {
    segmentCache.delete(segmentCache.keys().next().value);
  }
  return groups;
}

function createCanvas(width, height) {
  if (typeof OffscreenCanvas === "function") {
    return new OffscreenCanvas(width, height);
  }
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  return null;
}

function getCachedContourRaster(input, imageData, search, overlay, thresholds, step, knowledgeThreshold) {
  const cacheKey = makeCacheKey(input, imageData, search, overlay, thresholds, step, knowledgeThreshold);
  if (rasterCache.has(cacheKey)) {
    const cached = rasterCache.get(cacheKey);
    rasterCache.delete(cacheKey);
    rasterCache.set(cacheKey, cached);
    return cached;
  }

  const groups = getCachedContourGroups(input, imageData, search, overlay, thresholds, step, knowledgeThreshold);
  const canvas = createCanvas(imageData.width, imageData.height);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const group of groups) {
    if (!group.segments.length) continue;
    ctx.beginPath();
    ctx.strokeStyle = group.color;
    ctx.lineWidth = group.lineWidth;
    for (const [ax, ay, bx, by] of group.segments) {
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }

  rasterCache.set(cacheKey, canvas);
  while (rasterCache.size > SEGMENT_CACHE_LIMIT) {
    rasterCache.delete(rasterCache.keys().next().value);
  }
  return canvas;
}

function getCachedBandRaster(input, imageData, search, overlay, thresholds, step, knowledgeThreshold) {
  void step;
  const cacheKey = makeCacheKey(input, imageData, search, overlay, thresholds, 0, knowledgeThreshold);
  if (rasterCache.has(cacheKey)) {
    const cached = rasterCache.get(cacheKey);
    rasterCache.delete(cacheKey);
    rasterCache.set(cacheKey, cached);
    return cached;
  }

  const sampleKnowledge = typeof input.sampleKnowledge === "function" ? input.sampleKnowledge : () => 0;
  const canvas = createCanvas(imageData.width, imageData.height);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const output = ctx.createImageData(imageData.width, imageData.height);
  const out = output.data;
  const bandWidth = Math.max(0.0001, finite(overlay.bandWidth, 0.018));
  const colors = thresholds.map((_, index) => parseRgba(
    Array.isArray(overlay.colors) ? overlay.colors[index] : null,
  ));

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      if (sampleKnowledge(search.id, x, y) < knowledgeThreshold) continue;
      const wetness = sampleResourceMapValue(imageData, x, y, search.channel);
      let bestIndex = -1;
      let bestAlpha = 0;
      for (let i = 0; i < thresholds.length; i++) {
        const distance = Math.abs(wetness - thresholds[i]);
        if (distance > bandWidth) continue;
        const alpha = 1 - distance / bandWidth;
        if (alpha > bestAlpha) {
          bestAlpha = alpha;
          bestIndex = i;
        }
      }
      if (bestIndex < 0) continue;
      const color = colors[bestIndex];
      const idx = (y * imageData.width + x) * 4;
      out[idx] = color[0];
      out[idx + 1] = color[1];
      out[idx + 2] = color[2];
      out[idx + 3] = Math.round(color[3] * bestAlpha);
    }
  }

  ctx.putImageData(output, 0, 0);
  rasterCache.set(cacheKey, canvas);
  while (rasterCache.size > SEGMENT_CACHE_LIMIT) {
    rasterCache.delete(rasterCache.keys().next().value);
  }
  return canvas;
}

export function drawResourceContourOverlay(input) {
  const ctx = input && input.ctx;
  const imageData = input && input.imageData;
  const search = input && input.search;
  const overlay = search && search.overlay ? search.overlay : null;
  if (!ctx || !imageData || !imageData.data || !search || !overlay || overlay.type !== "contour") return;
  if (overlay.enabledInInspect === false) return;
  const thresholds = Array.isArray(overlay.thresholds) ? overlay.thresholds : [];
  if (!thresholds.length) return;
  const mapPixelToWorld = input.mapPixelToWorld;
  const worldToScreen = input.worldToScreen;
  if (typeof mapPixelToWorld !== "function" || typeof worldToScreen !== "function") return;

  const step = Math.max(1, Math.round(finite(overlay.sampleStep, 8)));
  const knowledgeThreshold = Math.max(0, Math.min(1, finite(overlay.knowledgeThreshold, 0.25)));
  const raster = overlay.renderMode === "marching"
    ? getCachedContourRaster(input, imageData, search, overlay, thresholds, step, knowledgeThreshold)
    : getCachedBandRaster(input, imageData, search, overlay, thresholds, step, knowledgeThreshold);
  if (!raster) return;
  const topLeft = worldToScreen(mapPixelToWorld(-0.5, -0.5));
  const bottomRight = worldToScreen(mapPixelToWorld(imageData.width - 0.5, imageData.height - 0.5));
  const dx = topLeft.x;
  const dy = topLeft.y;
  const dw = bottomRight.x - topLeft.x;
  const dh = bottomRight.y - topLeft.y;
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dw) || !Number.isFinite(dh)) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(raster, dx, dy, dw, dh);
  ctx.restore();
}
