const visibilityRasterCache = new Map();
const CACHE_LIMIT = 3;

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

function ditherHash(x, y, scale) {
  const cellX = Math.floor(x / Math.max(0.03125, scale));
  const cellY = Math.floor(y / Math.max(0.03125, scale));
  let value = Math.imul(cellX + 374761393, 668265263) ^ Math.imul(cellY + 1442695041, 2246822519);
  value ^= value >>> 13;
  value = Math.imul(value, 1274126177);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967295;
}

function sampleKnowledge(snapshot, x, y, gamma) {
  const gx = clamp(Math.floor((x / Math.max(1, snapshot.mapWidth)) * snapshot.width), 0, snapshot.width - 1);
  const gy = clamp(Math.floor((y / Math.max(1, snapshot.mapHeight)) * snapshot.height), 0, snapshot.height - 1);
  const raw = (snapshot.cells[gy * snapshot.width + gx] || 0) / 255;
  return Math.pow(clamp(raw, 0, 1), Math.max(0.1, gamma));
}

function sampleTerrainGray(imageData, x, y, mapWidth, mapHeight) {
  if (!imageData || !imageData.data || !imageData.width || !imageData.height) return 96;
  const sx = clamp(Math.floor((x / Math.max(1, mapWidth)) * imageData.width), 0, imageData.width - 1);
  const sy = clamp(Math.floor((y / Math.max(1, mapHeight)) * imageData.height), 0, imageData.height - 1);
  const index = (sy * imageData.width + sx) * 4;
  const r = imageData.data[index] || 0;
  const g = imageData.data[index + 1] || 0;
  const b = imageData.data[index + 2] || 0;
  return Math.round(r * 0.299 + g * 0.587 + b * 0.114);
}

export function shouldSkipDiscoveryTerrainVisibilityRaster(snapshot, settings = {}) {
  if (!snapshot || !snapshot.cells || !snapshot.width || !snapshot.height) return false;
  if (settings.mode === "debug") return false;
  const darkness = clamp(finite(settings.unknownDarkness, 1), 0, 1);
  if (darkness <= 0) return true;
  const gamma = Math.max(0.1, finite(settings.knowledgeGamma, 1));
  const baseVisibility = clamp(finite(settings.baseVisibility, 0), 0, 1);
  const fullVisibilityThreshold = clamp(finite(settings.fullVisibilityThreshold, 0.98), 0, 1);
  if (baseVisibility >= fullVisibilityThreshold) return true;
  for (let i = 0; i < snapshot.cells.length; i++) {
    const raw = (snapshot.cells[i] || 0) / 255;
    if (Math.max(baseVisibility, Math.pow(clamp(raw, 0, 1), gamma)) < fullVisibilityThreshold) {
      return false;
    }
  }
  return true;
}

function getRaster(snapshot, settings, terrainImageData) {
  if (shouldSkipDiscoveryTerrainVisibilityRaster(snapshot, settings)) return null;
  const mapWidth = Math.max(1, Math.round(finite(snapshot.mapWidth, snapshot.width)));
  const mapHeight = Math.max(1, Math.round(finite(snapshot.mapHeight, snapshot.height)));
  const ditherScale = Math.max(0.03125, finite(settings.ditherScale, 1));
  const gamma = Math.max(0.1, finite(settings.knowledgeGamma, 1));
  const baseVisibility = clamp(finite(settings.baseVisibility, 0), 0, 1);
  const fullVisibilityThreshold = clamp(finite(settings.fullVisibilityThreshold, 0.98), 0, 1);
  const darkness = clamp(finite(settings.unknownDarkness, 1), 0, 1);
  const mode = settings.mode || "black";
  const terrainVersion = terrainImageData && terrainImageData.width && terrainImageData.height
    ? `${terrainImageData.width}x${terrainImageData.height}:${terrainImageData.data && terrainImageData.data.length ? terrainImageData.data[0] : 0}`
    : "none";
  const key = `${snapshot.resourceId}|${snapshot.version}|${mapWidth}|${mapHeight}|${mode}|${terrainVersion}|${ditherScale}|${gamma}|${baseVisibility}|${fullVisibilityThreshold}|${darkness}`;
  if (visibilityRasterCache.has(key)) {
    const cached = visibilityRasterCache.get(key);
    visibilityRasterCache.delete(key);
    visibilityRasterCache.set(key, cached);
    return cached;
  }

  const canvas = createCanvas(mapWidth, mapHeight);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const imageData = ctx.createImageData(mapWidth, mapHeight);
  const out = imageData.data;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const knowledge = Math.max(baseVisibility, sampleKnowledge(snapshot, x, y, gamma));
      const index = (y * mapWidth + x) * 4;
      if (mode === "debug") {
        const value = Math.round(knowledge * 255);
        out[index] = value;
        out[index + 1] = value;
        out[index + 2] = value;
        out[index + 3] = 255;
        continue;
      }
      if (knowledge >= fullVisibilityThreshold || ditherHash(x, y, ditherScale) < knowledge) {
        out[index + 3] = 0;
        continue;
      }
      const value = mode === "greyscale"
        ? sampleTerrainGray(terrainImageData, x, y, mapWidth, mapHeight)
        : 0;
      out[index] = value;
      out[index + 1] = value;
      out[index + 2] = value;
      out[index + 3] = Math.round(darkness * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  visibilityRasterCache.set(key, canvas);
  while (visibilityRasterCache.size > CACHE_LIMIT) {
    visibilityRasterCache.delete(visibilityRasterCache.keys().next().value);
  }
  return canvas;
}

export function drawDiscoveryTerrainVisibilityOverlay(input) {
  const ctx = input && input.ctx;
  const snapshot = input && input.snapshot;
  const settings = input && input.settings ? input.settings : {};
  const terrainImageData = input && input.terrainImageData ? input.terrainImageData : null;
  if (!ctx || !snapshot || !snapshot.cells || !snapshot.width || !snapshot.height) return;
  if (settings.enabled !== true) return;
  if (typeof input.mapPixelToWorld !== "function" || typeof input.worldToScreen !== "function") return;
  const raster = getRaster(snapshot, settings, terrainImageData);
  if (!raster) return;
  const mapWidth = Math.max(1, finite(snapshot.mapWidth, snapshot.width));
  const mapHeight = Math.max(1, finite(snapshot.mapHeight, snapshot.height));
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
