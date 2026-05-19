const DEFAULT_DETAIL_MATERIALS = {
  dirt: {
    micro: {
      src: "assets/detail/default/dirt_micro.png",
      scaleMeters: 2,
      colorStrength: 1,
    },
    macro: {
      src: "assets/detail/default/dirt_macro.png",
      scaleMeters: 192,
      colorStrength: 1,
    },
  },
  rock: {
    micro: {
      src: "assets/detail/default/rock_micro.png",
      scaleMeters: 2,
      colorStrength: 1,
    },
    macro: {
      src: "assets/detail/default/rock_macro.png",
      scaleMeters: 256,
      colorStrength: 1,
    },
  },
};

export const DEFAULT_DETAIL_SETTINGS = {
  version: 1,
  enabled: true,
  atlas: {
    microPaddingPx: 2,
    macroPaddingPx: 4,
    microFilter: "linear",
    macroFilter: "linear",
    generateMipmaps: false,
  },
  zoom: {
    startPxPerMeter: 4,
    fullPxPerMeter: 16,
  },
  materials: DEFAULT_DETAIL_MATERIALS,
  rules: {
    defaultMaterial: "dirt",
    rock: {
      slopeStart: 0.35,
      slopeEnd: 0.75,
      noiseScale: 0.03,
      noiseStrength: 0.12,
    },
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

function mergeLayer(input, fallback) {
  const source = input && typeof input === "object" ? input : {};
  return {
    src: typeof source.src === "string" && source.src ? source.src : fallback.src,
    scaleMeters: clamp(finiteOr(source.scaleMeters, fallback.scaleMeters), 0.25, 4096),
    colorStrength: clamp(finiteOr(source.colorStrength, fallback.colorStrength ?? 0), 0, 1),
  };
}

function mergeMaterial(input, fallback) {
  const source = input && typeof input === "object" ? input : {};
  return {
    micro: mergeLayer(source.micro, fallback.micro),
    macro: mergeLayer(source.macro, fallback.macro),
  };
}

export function normalizeDetailSettings(rawData, fallback = DEFAULT_DETAIL_SETTINGS) {
  const source = rawData && typeof rawData === "object" ? rawData : {};
  const fallbackAtlas = fallback.atlas || DEFAULT_DETAIL_SETTINGS.atlas;
  const fallbackZoom = fallback.zoom || DEFAULT_DETAIL_SETTINGS.zoom;
  const fallbackMaterials = fallback.materials || DEFAULT_DETAIL_SETTINGS.materials;
  const fallbackRules = fallback.rules || DEFAULT_DETAIL_SETTINGS.rules;
  const sourceAtlas = source.atlas && typeof source.atlas === "object" ? source.atlas : {};
  const sourceZoom = source.zoom && typeof source.zoom === "object" ? source.zoom : {};
  const sourceMaterials = source.materials && typeof source.materials === "object" ? source.materials : {};
  const sourceRules = source.rules && typeof source.rules === "object" ? source.rules : {};
  const sourceRock = sourceRules.rock && typeof sourceRules.rock === "object" ? sourceRules.rock : {};
  const fallbackRock = fallbackRules.rock || DEFAULT_DETAIL_SETTINGS.rules.rock;

  return {
    version: 1,
    enabled: source.enabled === undefined ? Boolean(fallback.enabled) : Boolean(source.enabled),
    atlas: {
      microPaddingPx: Math.round(clamp(finiteOr(sourceAtlas.microPaddingPx, fallbackAtlas.microPaddingPx), 0, 16)),
      macroPaddingPx: Math.round(clamp(finiteOr(sourceAtlas.macroPaddingPx, fallbackAtlas.macroPaddingPx), 0, 32)),
      microFilter: sourceAtlas.microFilter === "nearest" ? "nearest" : "linear",
      macroFilter: sourceAtlas.macroFilter === "nearest" ? "nearest" : "linear",
      generateMipmaps: Boolean(sourceAtlas.generateMipmaps && false),
    },
    zoom: {
      startPxPerMeter: clamp(finiteOr(sourceZoom.startPxPerMeter, fallbackZoom.startPxPerMeter), 0, 512),
      fullPxPerMeter: clamp(finiteOr(sourceZoom.fullPxPerMeter, fallbackZoom.fullPxPerMeter), 0, 1024),
    },
    materials: {
      dirt: mergeMaterial(sourceMaterials.dirt, fallbackMaterials.dirt),
      rock: mergeMaterial(sourceMaterials.rock, fallbackMaterials.rock),
    },
    rules: {
      defaultMaterial: "dirt",
      rock: {
        slopeStart: clamp(finiteOr(sourceRock.slopeStart, fallbackRock.slopeStart), 0, 1),
        slopeEnd: clamp(finiteOr(sourceRock.slopeEnd, fallbackRock.slopeEnd), 0, 1),
        noiseScale: clamp(finiteOr(sourceRock.noiseScale, fallbackRock.noiseScale), 0, 8),
        noiseStrength: clamp(finiteOr(sourceRock.noiseStrength, fallbackRock.noiseStrength), 0, 1),
      },
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
