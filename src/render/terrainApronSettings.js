export const DEFAULT_TERRAIN_APRON_SETTINGS = {
  version: 1,
  enabled: false,
  resolution: 1024,
  fadeStart: 0.05,
  fadeEnd: 1,
  ditherScalePx: 3,
  ditherStrength: 0.65,
  useAuthoredImage: false,
  flipX: false,
  flipY: false,
  backgroundColor: "#000000",
};

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeResolution(value, fallback) {
  const allowed = [256, 512, 1024, 2048];
  const raw = Math.round(clamp(finiteOr(value, fallback), 256, 2048));
  return allowed.reduce((best, candidate) => (
    Math.abs(candidate - raw) < Math.abs(best - raw) ? candidate : best
  ), allowed[0]);
}

function normalizeHexColor(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  if (/^#[0-9a-fA-F]{6}$/.test(text)) return text;
  return /^#[0-9a-fA-F]{6}$/.test(fallback) ? fallback : "#000000";
}

export function normalizeTerrainApronSettings(rawData, fallback = DEFAULT_TERRAIN_APRON_SETTINGS) {
  const source = rawData && typeof rawData === "object" ? rawData : {};
  const fb = fallback && typeof fallback === "object" ? fallback : DEFAULT_TERRAIN_APRON_SETTINGS;
  const fadeStart = clamp(finiteOr(source.fadeStart, fb.fadeStart ?? 0.05), 0, 1);
  const fadeEnd = clamp(finiteOr(source.fadeEnd, fb.fadeEnd ?? 1), 0, 1);
  return {
    version: 1,
    enabled: source.enabled === undefined ? Boolean(fb.enabled) : Boolean(source.enabled),
    resolution: normalizeResolution(source.resolution, fb.resolution ?? 1024),
    fadeStart: Math.min(fadeStart, fadeEnd),
    fadeEnd: Math.max(fadeStart, fadeEnd),
    ditherScalePx: Math.round(clamp(finiteOr(source.ditherScalePx, fb.ditherScalePx ?? 3), 1, 32)),
    ditherStrength: clamp(finiteOr(source.ditherStrength, fb.ditherStrength ?? 0.65), 0, 1),
    useAuthoredImage: source.useAuthoredImage === undefined ? Boolean(fb.useAuthoredImage) : Boolean(source.useAuthoredImage),
    flipX: source.flipX === undefined ? Boolean(fb.flipX) : Boolean(source.flipX),
    flipY: source.flipY === undefined ? Boolean(fb.flipY) : Boolean(source.flipY),
    backgroundColor: normalizeHexColor(source.backgroundColor, fb.backgroundColor),
  };
}
