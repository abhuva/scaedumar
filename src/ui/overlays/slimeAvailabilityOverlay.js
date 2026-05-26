const rasterCache = new Map();
const CACHE_LIMIT = 4;

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, finite(value, 0)));
}

function createCanvas(width, height) {
  if (typeof globalThis.OffscreenCanvas === "function") {
    return new globalThis.OffscreenCanvas(width, height);
  }
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  return null;
}

function getRaster(grid, settings) {
  const opacity = clamp01(settings.opacity ?? 0.45);
  const threshold = clamp01(settings.threshold ?? 0.005);
  const key = `${grid.width}x${grid.height}|${grid.version}|${opacity.toFixed(3)}|${threshold.toFixed(4)}`;
  if (rasterCache.has(key)) {
    const cached = rasterCache.get(key);
    rasterCache.delete(key);
    rasterCache.set(key, cached);
    return cached;
  }

  const canvas = createCanvas(grid.width, grid.height);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const imageData = ctx.createImageData(grid.width, grid.height);
  const out = imageData.data;

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      // gl.readPixels is bottom-left origin; canvas/map overlays are top-left origin.
      const sourceY = grid.height - y - 1;
      const value = clamp01(grid.data[sourceY * grid.width + x]);
      if (value < threshold) continue;
      const normalized = threshold < 1 ? clamp01((value - threshold) / Math.max(0.0001, 1 - threshold)) : value;
      const alpha = Math.round(clamp01(opacity * (0.35 + Math.pow(normalized, 0.6) * 0.65)) * 255);
      const index = (y * grid.width + x) * 4;
      out[index] = 255;
      out[index + 1] = Math.round(120 + normalized * 120);
      out[index + 2] = Math.round(24 + normalized * 24);
      out[index + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  rasterCache.set(key, canvas);
  while (rasterCache.size > CACHE_LIMIT) {
    rasterCache.delete(rasterCache.keys().next().value);
  }
  return canvas;
}

function getTrailRasterCanvas(trailRaster) {
  if (!trailRaster || !trailRaster.data || !trailRaster.width || !trailRaster.height) return null;
  const key = `trail|${trailRaster.width}x${trailRaster.height}|${trailRaster.version}`;
  if (rasterCache.has(key)) {
    const cached = rasterCache.get(key);
    rasterCache.delete(key);
    rasterCache.set(key, cached);
    return cached;
  }
  const canvas = createCanvas(trailRaster.width, trailRaster.height);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const imageData = ctx.createImageData(trailRaster.width, trailRaster.height);
  imageData.data.set(trailRaster.data);
  ctx.putImageData(imageData, 0, 0);
  rasterCache.set(key, canvas);
  while (rasterCache.size > CACHE_LIMIT) {
    rasterCache.delete(rasterCache.keys().next().value);
  }
  return canvas;
}

export function drawSlimeAvailabilityOverlay(input) {
  const ctx = input && input.ctx;
  const grid = input && input.grid;
  const trailRaster = input && input.trailRaster;
  const settings = input && input.settings ? input.settings : {};
  if (!ctx || settings.enabled !== true) return;
  if (typeof input.mapPixelToWorld !== "function" || typeof input.worldToScreen !== "function") return;
  const raster = trailRaster ? getTrailRasterCanvas(trailRaster) : getRaster(grid, settings);
  if (!raster) return;

  const mapWidth = Math.max(1, finite(input.mapWidth, trailRaster?.width || grid?.width || 1));
  const mapHeight = Math.max(1, finite(input.mapHeight, trailRaster?.height || grid?.height || 1));
  const topLeft = input.worldToScreen(input.mapPixelToWorld(-0.5, -0.5));
  const bottomRight = input.worldToScreen(input.mapPixelToWorld(mapWidth - 0.5, mapHeight - 0.5));
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
