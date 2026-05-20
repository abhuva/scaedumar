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

function mergeLayer(input, fallback) {
  const source = input && typeof input === "object" ? input : {};
  return {
    src: typeof source.src === "string" && source.src ? source.src : fallback.src,
    scaleMeters: clamp(finiteOr(source.scaleMeters, fallback.scaleMeters), 0.25, 4096),
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
  const fallbackMaterials = Array.isArray(fallback.materials) ? fallback.materials : DEFAULT_DETAIL_SETTINGS.materials;
  const sourceSplat = source.splat && typeof source.splat === "object" ? source.splat : {};
  const sourceAtlas = source.atlas && typeof source.atlas === "object" ? source.atlas : {};
  const sourceZoom = source.zoom && typeof source.zoom === "object" ? source.zoom : {};

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
