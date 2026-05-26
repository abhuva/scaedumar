function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createEmptySlimeAvailabilityGrid(size = 128) {
  const gridSize = Math.max(1, Math.round(finite(size, 128)));
  return {
    width: gridSize,
    height: gridSize,
    data: new Float32Array(gridSize * gridSize),
    rawData: new Float32Array(gridSize * gridSize),
    version: 0,
    effectiveMax: 0.7,
  };
}

export function buildSlimeAvailabilityGrid(input) {
  const sourceWidth = Math.max(1, Math.round(finite(input && input.sourceWidth, 1)));
  const sourceHeight = Math.max(1, Math.round(finite(input && input.sourceHeight, 1)));
  const gridSize = Math.max(1, Math.round(finite(input && input.gridSize, 128)));
  const effectiveMax = Math.max(0.0001, finite(input && input.effectiveMax, 0.7));
  const source = input && input.source;
  const sourceStride = Math.max(1, Math.round(finite(input && input.sourceStride, 4)));
  const sourceOffset = Math.max(0, Math.round(finite(input && input.sourceOffset, 0)));
  const flipY = input && input.flipY === true;
  const data = new Float32Array(gridSize * gridSize);
  const rawData = new Float32Array(gridSize * gridSize);
  const sums = new Float64Array(gridSize * gridSize);
  const counts = new Uint32Array(gridSize * gridSize);

  if (!source || typeof source.length !== "number") {
    return { width: gridSize, height: gridSize, data, rawData, version: 0, effectiveMax };
  }

  for (let y = 0; y < sourceHeight; y++) {
    const gy = Math.min(gridSize - 1, Math.floor(y * gridSize / sourceHeight));
    const sourceY = flipY ? sourceHeight - y - 1 : y;
    for (let x = 0; x < sourceWidth; x++) {
      const gx = Math.min(gridSize - 1, Math.floor(x * gridSize / sourceWidth));
      const sourceIndex = (sourceY * sourceWidth + x) * sourceStride + sourceOffset;
      const value = Math.max(0, finite(source[sourceIndex], 0));
      const gridIndex = gy * gridSize + gx;
      sums[gridIndex] += value;
      counts[gridIndex] += 1;
    }
  }

  for (let i = 0; i < data.length; i++) {
    const raw = counts[i] > 0 ? sums[i] / counts[i] : 0;
    rawData[i] = raw;
    data[i] = clamp(raw / effectiveMax, 0, 1);
  }

  return {
    width: gridSize,
    height: gridSize,
    data,
    rawData,
    version: Math.max(0, Math.round(finite(input && input.version, 0))),
    effectiveMax,
  };
}

export function sampleSlimeAvailabilityCircle(grid, input = {}) {
  if (!grid || !grid.data || !grid.width || !grid.height) {
    return { rawAverage: 0, availability: 0, samples: 0 };
  }
  const mapWidth = Math.max(1, Math.round(finite(input.mapWidth, grid.width)));
  const mapHeight = Math.max(1, Math.round(finite(input.mapHeight, grid.height)));
  const centerX = finite(input.x, 0);
  const centerY = finite(input.y, 0);
  const radius = Math.max(0, finite(input.radius, 0));
  const effectiveMax = Math.max(0.0001, finite(input.effectiveMax, grid.effectiveMax || 0.7));
  const centerGx = centerX / mapWidth * grid.width;
  const centerGy = centerY / mapHeight * grid.height;
  const radiusGx = radius / mapWidth * grid.width;
  const radiusGy = radius / mapHeight * grid.height;
  const minX = Math.max(0, Math.floor(centerGx - radiusGx));
  const maxX = Math.min(grid.width - 1, Math.ceil(centerGx + radiusGx));
  const minY = Math.max(0, Math.floor(centerGy - radiusGy));
  const maxY = Math.min(grid.height - 1, Math.ceil(centerGy + radiusGy));
  let rawSum = 0;
  let availabilitySum = 0;
  let samples = 0;
  const values = [];

  for (let y = minY; y <= maxY; y++) {
    const dy = radiusGy > 0 ? (y + 0.5 - centerGy) / radiusGy : 0;
    for (let x = minX; x <= maxX; x++) {
      const dx = radiusGx > 0 ? (x + 0.5 - centerGx) / radiusGx : 0;
      if (dx * dx + dy * dy > 1) continue;
      const index = y * grid.width + x;
      const raw = grid.rawData && grid.rawData.length === grid.data.length
        ? Math.max(0, finite(grid.rawData[index], 0))
        : Math.max(0, finite(grid.data[index], 0)) * effectiveMax;
      rawSum += raw;
      const availability = clamp(raw / effectiveMax, 0, 1);
      availabilitySum += availability;
      values.push({ raw, availability });
      samples += 1;
    }
  }

  if (samples <= 0) return { rawAverage: 0, availability: 0, samples: 0 };
  values.sort((a, b) => b.availability - a.availability);
  const hotSampleRatio = clamp(finite(input.hotSampleRatio, 0.25), 0.01, 1);
  const hotCount = Math.max(1, Math.ceil(values.length * hotSampleRatio));
  let hotRawSum = 0;
  let hotAvailabilitySum = 0;
  for (let i = 0; i < hotCount; i++) {
    hotRawSum += values[i].raw;
    hotAvailabilitySum += values[i].availability;
  }
  const hotAvailability = clamp(hotAvailabilitySum / hotCount, 0, 1);
  return {
    rawAverage: rawSum / samples,
    availability: clamp(availabilitySum / samples, 0, 1),
    hotRawAverage: hotRawSum / hotCount,
    hotAvailability,
    samples,
    hotSamples: hotCount,
  };
}
