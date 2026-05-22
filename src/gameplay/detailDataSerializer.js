function createLayer(src, scaleMeters, colorStrength = 1) {
  return { src, scaleMeters, colorStrength };
}

function createMaterial(id, slot, microScale) {
  return {
    id,
    slot,
    micro: createLayer(`assets/detail/default/${id}_micro.png`, microScale),
  };
}

const DEFAULT_DETAIL_MATERIALS = [
  createMaterial("dirt", 0, 2),
  createMaterial("rock", 1, 2),
  createMaterial("grass", 2, 2),
  createMaterial("snow", 3, 2),
];

export const DEFAULT_DETAIL_SETTINGS = {
  version: 3,
  enabled: true,
  splat: {
    src: "assets/detail/default/materials.png",
    filter: "linear",
  },
  atlas: {
    microPaddingPx: 2,
    microFilter: "linear",
    generateMipmaps: false,
  },
  zoom: {
    startPxPerMeter: 4,
    fullPxPerMeter: 16,
  },
  materials: DEFAULT_DETAIL_MATERIALS,
  transition: {
    blendMode: "smooth",
    quantizationSteps: 0,
    ditherScale: 0.25,
    ditherStrength: 0.18,
    minWeight: 0,
    debugChannel: "none",
    priorities: [-0.02, 0.05, 0, 0.03],
  },
  waterSuppression: 1,
};

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSlot(value, fallback) {
  return Math.round(clamp(finiteOr(value, fallback), 0, 3));
}

function normalizeBlendMode(value, fallback) {
  if (value === "smooth" || value === "dithered" || value === "priorityDither") return value;
  if (fallback === "smooth" || fallback === "dithered" || fallback === "priorityDither") return fallback;
  return "smooth";
}

function normalizeDebugChannel(value, fallback) {
  if (value === "none" || value === "rgba" || value === "red" || value === "green" || value === "blue" || value === "alpha") return value;
  if (fallback === "none" || fallback === "rgba" || fallback === "red" || fallback === "green" || fallback === "blue" || fallback === "alpha") return fallback;
  return "none";
}

function normalizePriorityList(value, fallback) {
  const source = Array.isArray(value) ? value : [];
  const fallbackList = Array.isArray(fallback) ? fallback : DEFAULT_DETAIL_SETTINGS.transition.priorities;
  return [0, 1, 2, 3].map((index) => clamp(finiteOr(source[index], fallbackList[index] ?? 0), -0.5, 0.5));
}

function normalizeDitherScale(value, fallback) {
  const allowed = [1, 0.5, 0.25, 0.125, 0.0625, 0.03125];
  const raw = clamp(finiteOr(value, fallback ?? 0.25), 0.03125, 1);
  return allowed.reduce((best, candidate) => (
    Math.abs(candidate - raw) < Math.abs(best - raw) ? candidate : best
  ), allowed[0]);
}

function normalizeMicroScale(value, fallback) {
  const allowed = [1, 2, 4, 8, 16, 32];
  const raw = clamp(finiteOr(value, fallback ?? 2), 1, 32);
  return allowed.reduce((best, candidate) => (
    Math.abs(candidate - raw) < Math.abs(best - raw) ? candidate : best
  ), allowed[0]);
}

function mergeLayer(input, fallback) {
  const source = input && typeof input === "object" ? input : {};
  return {
    src: typeof source.src === "string" && source.src ? source.src : fallback.src,
    scaleMeters: normalizeMicroScale(source.scaleMeters, fallback.scaleMeters),
    colorStrength: clamp(finiteOr(source.colorStrength, fallback.colorStrength ?? 1), 0, 1),
  };
}

function mergeMaterial(sourceMaterials, fallback, index) {
  const source = Array.isArray(sourceMaterials) && sourceMaterials[index] && typeof sourceMaterials[index] === "object"
    ? sourceMaterials[index]
    : {};
  return {
    id: typeof source.id === "string" && source.id ? source.id : fallback.id,
    slot: normalizeSlot(source.slot, fallback.slot),
    micro: mergeLayer(source.micro, fallback.micro),
  };
}

export function normalizeDetailSettings(rawData, fallback = DEFAULT_DETAIL_SETTINGS) {
  const source = rawData && typeof rawData === "object" ? rawData : {};
  const fallbackSplat = fallback.splat || DEFAULT_DETAIL_SETTINGS.splat;
  const fallbackAtlas = fallback.atlas || DEFAULT_DETAIL_SETTINGS.atlas;
  const fallbackZoom = fallback.zoom || DEFAULT_DETAIL_SETTINGS.zoom;
  const fallbackTransition = fallback.transition || DEFAULT_DETAIL_SETTINGS.transition;
  const fallbackMaterials = Array.isArray(fallback.materials) ? fallback.materials : DEFAULT_DETAIL_SETTINGS.materials;
  const sourceSplat = source.splat && typeof source.splat === "object" ? source.splat : {};
  const sourceAtlas = source.atlas && typeof source.atlas === "object" ? source.atlas : {};
  const sourceZoom = source.zoom && typeof source.zoom === "object" ? source.zoom : {};
  const sourceTransition = source.transition && typeof source.transition === "object" ? source.transition : {};

  return {
    version: 3,
    enabled: source.enabled === undefined ? Boolean(fallback.enabled) : Boolean(source.enabled),
    splat: {
      src: typeof sourceSplat.src === "string" && sourceSplat.src ? sourceSplat.src : fallbackSplat.src,
      filter: sourceSplat.filter === "nearest" ? "nearest" : "linear",
    },
    atlas: {
      microPaddingPx: Math.round(clamp(finiteOr(sourceAtlas.microPaddingPx, fallbackAtlas.microPaddingPx), 0, 16)),
      microFilter: sourceAtlas.microFilter === "nearest" ? "nearest" : "linear",
      generateMipmaps: Boolean(sourceAtlas.generateMipmaps && false),
    },
    zoom: {
      startPxPerMeter: clamp(finiteOr(sourceZoom.startPxPerMeter, fallbackZoom.startPxPerMeter), 0, 512),
      fullPxPerMeter: clamp(finiteOr(sourceZoom.fullPxPerMeter, fallbackZoom.fullPxPerMeter), 0, 1024),
    },
    materials: fallbackMaterials.map((material, index) => mergeMaterial(source.materials, material, index)),
    transition: {
      blendMode: normalizeBlendMode(sourceTransition.blendMode, fallbackTransition.blendMode),
      quantizationSteps: Math.round(clamp(finiteOr(sourceTransition.quantizationSteps, fallbackTransition.quantizationSteps ?? 0), 0, 32)),
      ditherScale: normalizeDitherScale(sourceTransition.ditherScale, fallbackTransition.ditherScale ?? 0.25),
      ditherStrength: clamp(finiteOr(sourceTransition.ditherStrength, fallbackTransition.ditherStrength ?? 0.18), 0, 1),
      minWeight: clamp(finiteOr(sourceTransition.minWeight, fallbackTransition.minWeight ?? 0), 0, 0.5),
      debugChannel: normalizeDebugChannel(sourceTransition.debugChannel, fallbackTransition.debugChannel),
      priorities: normalizePriorityList(sourceTransition.priorities, fallbackTransition.priorities),
    },
    waterSuppression: clamp(finiteOr(source.waterSuppression, fallback.waterSuppression ?? 1), 0, 1),
  };
}

export function createDetailDataSerializer(deps) {
  function serializeDetailSettingsCompat() {
    return normalizeDetailSettings(deps.getDetailSettings(), deps.defaultDetailSettings);
  }

  function applyDetailSettingsCompat() {
    if (typeof deps.syncDetailUi === "function") {
      deps.syncDetailUi();
    }
    if (typeof deps.rebuildDetailAtlas === "function") {
      deps.rebuildDetailAtlas();
    }
  }

  return {
    serializeDetailSettingsCompat,
    applyDetailSettingsCompat,
  };
}
