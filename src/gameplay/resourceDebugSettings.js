export const RESOURCE_DEBUG_LAYERS = ["wetness", "height", "slope"];

const FALLBACK_BANDS = [0.2, 0.35, 0.5, 0.65, 0.8];
const FALLBACK_WETNESS_COLORS = [
  "rgba(86, 190, 226, 0.34)",
  "rgba(96, 208, 237, 0.44)",
  "rgba(116, 215, 245, 0.58)",
  "rgba(142, 228, 252, 0.70)",
  "rgba(182, 244, 255, 0.82)",
];
const FALLBACK_HEIGHT_COLORS = [
  "rgba(190, 170, 120, 0.34)",
  "rgba(210, 185, 132, 0.44)",
  "rgba(232, 205, 150, 0.58)",
  "rgba(245, 223, 174, 0.70)",
  "rgba(255, 241, 205, 0.82)",
];
const FALLBACK_SLOPE_COLORS = [
  "rgba(201, 112, 89, 0.34)",
  "rgba(219, 132, 92, 0.44)",
  "rgba(239, 157, 98, 0.58)",
  "rgba(252, 185, 111, 0.70)",
  "rgba(255, 218, 145, 0.82)",
];
const BAND_ALPHA_RAMP = [0.34, 0.44, 0.58, 0.7, 0.82];

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max, fallback = min) {
  return Math.max(min, Math.min(max, finite(value, fallback)));
}

function normalizeLayerId(layer) {
  return RESOURCE_DEBUG_LAYERS.includes(layer) ? layer : "wetness";
}

function defaultColorsForLayer(layer, overlay) {
  if (layer === "height") return FALLBACK_HEIGHT_COLORS;
  if (layer === "slope") return FALLBACK_SLOPE_COLORS;
  const overlayColors = overlay && Array.isArray(overlay.colors) ? overlay.colors.filter(Boolean) : [];
  return overlayColors.length ? overlayColors : FALLBACK_WETNESS_COLORS;
}

function toHexComponent(value) {
  return Math.max(0, Math.min(255, Math.round(finite(value, 0))))
    .toString(16)
    .padStart(2, "0");
}

function colorToHex(value, fallback = "#74d7f5") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
  const shortHex = trimmed.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (shortHex) {
    return `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`.toLowerCase();
  }
  const rgba = trimmed.match(/rgba?\(([^)]+)\)/i);
  if (!rgba) return fallback;
  const parts = rgba[1].split(",").map((part) => part.trim());
  return `#${toHexComponent(parts[0])}${toHexComponent(parts[1])}${toHexComponent(parts[2])}`;
}

function rgbaFromTint(hexColor, alpha) {
  const hex = colorToHex(hexColor);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

function normalizeBand(rawBand, fallbackThreshold) {
  const source = rawBand && typeof rawBand === "object" ? rawBand : {};
  return {
    enabled: source.enabled !== false,
    threshold: clamp(source.threshold, 0, 1, fallbackThreshold),
  };
}

function createDefaultLayerSettings(layer, overlay = {}) {
  const thresholds = Array.isArray(overlay.thresholds) && overlay.thresholds.length
    ? overlay.thresholds
    : FALLBACK_BANDS;
  const colors = defaultColorsForLayer(layer, overlay);
  return {
    renderMode: overlay.renderMode === "raster" ? "raster" : "marching",
    sampleStep: Math.round(clamp(overlay.sampleStep, 1, 128, 8)),
    knowledgeThreshold: clamp(overlay.knowledgeThreshold, 0, 1, 0.25),
    lineWidth: clamp(overlay.lineWidth, 0.25, 8, 1.25),
    bandWidth: clamp(overlay.bandWidth, 0.0001, 1, 0.018),
    tintColor: colorToHex(colors[2] || colors[0] || "#74d7f5"),
    bands: FALLBACK_BANDS.map((fallbackThreshold, index) => normalizeBand(
      null,
      thresholds[index] == null ? fallbackThreshold : thresholds[index],
    )),
  };
}

function normalizeLayerSettings(rawLayer, fallbackLayer) {
  const source = rawLayer && typeof rawLayer === "object" ? rawLayer : {};
  const fallbackBands = Array.isArray(fallbackLayer.bands) ? fallbackLayer.bands : [];
  const rawBands = Array.isArray(source.bands) ? source.bands : [];
  return {
    renderMode: source.renderMode === "raster" ? "raster" : "marching",
    sampleStep: Math.round(clamp(source.sampleStep, 1, 128, fallbackLayer.sampleStep)),
    knowledgeThreshold: clamp(source.knowledgeThreshold, 0, 1, fallbackLayer.knowledgeThreshold),
    lineWidth: clamp(source.lineWidth, 0.25, 8, fallbackLayer.lineWidth),
    bandWidth: clamp(source.bandWidth, 0.0001, 1, fallbackLayer.bandWidth),
    tintColor: colorToHex(source.tintColor || (rawBands.find((band) => band && band.color) || {}).color, fallbackLayer.tintColor),
    bands: fallbackBands.map((fallbackBand, index) => normalizeBand(rawBands[index], fallbackBand.threshold)),
  };
}

export function createDefaultResourceDebugSettings(resourceSearches = {}, resourceId = "water") {
  const search = resourceSearches[resourceId] || {};
  const discovery = search.discovery || {};
  const overlay = search.overlay || {};
  const layers = {};
  for (const layer of RESOURCE_DEBUG_LAYERS) {
    layers[layer] = createDefaultLayerSettings(layer, overlay);
  }
  return {
    version: 1,
    activeLayer: "wetness",
    discovery: {
      gridSize: Math.round(clamp(discovery.gridSize, 8, 2048, 256)),
      movementRevealRadius: clamp(discovery.movementRevealRadius, 0, 4096, 30),
    },
    layers,
  };
}

export function normalizeResourceDebugSettings(rawSettings, fallbackSettings) {
  const fallback = fallbackSettings || createDefaultResourceDebugSettings();
  const source = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const rawDiscovery = source.discovery && typeof source.discovery === "object" ? source.discovery : {};
  const rawLayers = source.layers && typeof source.layers === "object" ? source.layers : {};
  const layers = {};
  for (const layer of RESOURCE_DEBUG_LAYERS) {
    layers[layer] = normalizeLayerSettings(rawLayers[layer], fallback.layers[layer]);
  }
  return {
    version: 1,
    activeLayer: normalizeLayerId(source.activeLayer || fallback.activeLayer),
    discovery: {
      gridSize: Math.round(clamp(rawDiscovery.gridSize, 8, 2048, fallback.discovery.gridSize)),
      movementRevealRadius: clamp(rawDiscovery.movementRevealRadius, 0, 4096, fallback.discovery.movementRevealRadius),
    },
    layers,
  };
}

export function serializeResourceDebugSettings(settings, fallbackSettings) {
  return normalizeResourceDebugSettings(settings, fallbackSettings);
}

export function getResourceDebugBandColors(layerSettings) {
  const tintColor = layerSettings && layerSettings.tintColor ? layerSettings.tintColor : "#74d7f5";
  return BAND_ALPHA_RAMP.map((alpha) => rgbaFromTint(tintColor, alpha));
}
