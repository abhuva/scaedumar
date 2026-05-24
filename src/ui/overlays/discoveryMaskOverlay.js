const maskRasterCache = new Map();
const CACHE_LIMIT = 4;

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

function getMaskRaster(snapshot) {
  const key = `${snapshot.resourceId}|${snapshot.width}|${snapshot.height}|${snapshot.version}`;
  if (maskRasterCache.has(key)) {
    const cached = maskRasterCache.get(key);
    maskRasterCache.delete(key);
    maskRasterCache.set(key, cached);
    return cached;
  }
  const canvas = createCanvas(snapshot.width, snapshot.height);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const imageData = ctx.createImageData(snapshot.width, snapshot.height);
  const out = imageData.data;
  for (let i = 0; i < snapshot.cells.length; i++) {
    const value = snapshot.cells[i] || 0;
    const index = i * 4;
    out[index] = 90;
    out[index + 1] = 205;
    out[index + 2] = 245;
    out[index + 3] = value;
  }
  ctx.putImageData(imageData, 0, 0);
  maskRasterCache.set(key, canvas);
  while (maskRasterCache.size > CACHE_LIMIT) {
    maskRasterCache.delete(maskRasterCache.keys().next().value);
  }
  return canvas;
}

export function drawDiscoveryMaskOverlay(input) {
  const ctx = input && input.ctx;
  const snapshot = input && input.snapshot;
  if (!ctx || !snapshot || !snapshot.cells || !snapshot.width || !snapshot.height) return;
  if (typeof input.mapPixelToWorld !== "function" || typeof input.worldToScreen !== "function") return;
  const raster = getMaskRaster(snapshot);
  if (!raster) return;
  const topLeft = input.worldToScreen(input.mapPixelToWorld(-0.5, -0.5));
  const bottomRight = input.worldToScreen(input.mapPixelToWorld(snapshot.mapWidth - 0.5, snapshot.mapHeight - 0.5));
  const dx = topLeft.x;
  const dy = topLeft.y;
  const dw = bottomRight.x - topLeft.x;
  const dh = bottomRight.y - topLeft.y;
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dw) || !Number.isFinite(dh)) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, finite(snapshot.opacity, 0.45)));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(raster, dx, dy, dw, dh);
  ctx.restore();
}
