export function createRenderFxDataSerializer(deps) {
  function serializeLightingSettingsLegacy() {
    const state = deps.getCoreState();
    const lighting = deps.getLightingSettings();
    const timeState = state.systems && state.systems.time ? state.systems.time : {};
    return {
      version: 1,
      useShadows: Boolean(lighting.useShadows),
      heightScale: Math.round(deps.clamp(Number(lighting.heightScale), 1, 300)),
      shadowStrength: deps.clampRound(Number(lighting.shadowStrength), 0, 1),
      shadowBlur: deps.clampRound(Number(lighting.shadowBlur), 0, 3),
      ambient: deps.clampRound(Number(lighting.ambient), 0, 1),
      diffuse: deps.clampRound(Number(lighting.diffuse), 0, 2),
      useVolumetric: Boolean(lighting.useVolumetric),
      volumetricStrength: deps.clampRound(Number(lighting.volumetricStrength), 0, 1),
      volumetricDensity: deps.clampRound(Number(lighting.volumetricDensity), 0, 2),
      volumetricAnisotropy: deps.clampRound(Number(lighting.volumetricAnisotropy), 0, 0.95),
      volumetricLength: Math.round(deps.clamp(Number(lighting.volumetricLength), 8, 160)),
      volumetricSamples: Math.round(deps.clamp(Number(lighting.volumetricSamples), 4, 24)),
      cycleHour: deps.clampRound(Number(deps.cycleState.hour), 0, 24),
      cycleSpeed: deps.clampRound(Number(timeState.cycleSpeedHoursPerSec ?? lighting.cycleSpeed), 0, 1),
      simTickHours: deps.clampRound(Number(timeState.simTickHours ?? deps.getConfiguredSimTickHours()), 0.001, 0.1),
      pointFlickerEnabled: Boolean(lighting.pointFlickerEnabled),
      pointFlickerStrength: deps.clampRound(Number(lighting.pointFlickerStrength), 0, 1),
      pointFlickerSpeed: deps.clampRound(Number(lighting.pointFlickerSpeed), 0.1, 12),
      pointFlickerSpatial: deps.clampRound(Number(lighting.pointFlickerSpatial), 0, 4),
    };
  }

  function serializeFogSettingsLegacy() {
    const fog = deps.getFogSettings();
    return {
      version: 1,
      useFog: Boolean(fog.useFog),
      fogColor: typeof fog.fogColor === "string" ? fog.fogColor : "#ffffff",
      fogColorManual: Boolean(fog.fogColorManual),
      fogMinAlpha: deps.clamp(Number(fog.fogMinAlpha), 0, 1),
      fogMaxAlpha: deps.clamp(Number(fog.fogMaxAlpha), 0, 1),
      fogFalloff: deps.clamp(Number(fog.fogFalloff), 0.2, 4),
      fogStartOffset: deps.clamp(Number(fog.fogStartOffset), 0, 1),
    };
  }

  function serializeParallaxSettingsLegacy() {
    const parallax = deps.getParallaxSettings();
    return {
      version: 1,
      useParallax: Boolean(parallax.useParallax),
      parallaxStrength: deps.clamp(Number(parallax.parallaxStrength), 0, 1),
      parallaxBands: Math.round(deps.clamp(Number(parallax.parallaxBands), 2, 256)),
    };
  }

  function serializeCloudSettingsLegacy() {
    const clouds = deps.getCloudSettings();
    const timeState = deps.getTimeState();
    return {
      version: 1,
      useClouds: Boolean(clouds.useClouds),
      cloudCoverage: deps.clamp(Number(clouds.cloudCoverage), 0, 1),
      cloudSoftness: deps.clamp(Number(clouds.cloudSoftness), 0.01, 0.35),
      cloudOpacity: deps.clamp(Number(clouds.cloudOpacity), 0, 1),
      cloudScale: deps.clamp(Number(clouds.cloudScale), 0.5, 8),
      cloudSpeed1: deps.clamp(Number(clouds.cloudSpeed1), -0.3, 0.3),
      cloudSpeed2: deps.clamp(Number(clouds.cloudSpeed2), -0.3, 0.3),
      cloudSunParallax: deps.clamp(Number(clouds.cloudSunParallax), 0, 2),
      cloudUseSunProjection: Boolean(clouds.cloudUseSunProjection),
      timeRouting: deps.normalizeRoutingMode(timeState.routing && timeState.routing.clouds, "global"),
    };
  }

  function serializeWaterSettingsLegacy() {
    const water = deps.getWaterSettings();
    const timeState = deps.getTimeState();
    return {
      version: 1,
      useWaterFx: Boolean(water.useWaterFx),
      waterFlowDownhill: Boolean(water.waterFlowDownhill),
      waterFlowInvertDownhill: Boolean(water.waterFlowInvertDownhill),
      waterFlowDebug: Boolean(water.waterFlowDebug),
      waterFlowDirectionDeg: Math.round(deps.clamp(Number(water.waterFlowDirectionDeg), 0, 360)),
      waterLocalFlowMix: deps.clamp(Number(water.waterLocalFlowMix), 0, 1),
      waterDownhillBoost: deps.clamp(Number(water.waterDownhillBoost), 0, 4),
      waterFlowRadius1: Math.round(deps.clamp(Number(water.waterFlowRadius1), 1, 12)),
      waterFlowRadius2: Math.round(deps.clamp(Number(water.waterFlowRadius2), 1, 24)),
      waterFlowRadius3: Math.round(deps.clamp(Number(water.waterFlowRadius3), 1, 40)),
      waterFlowWeight1: deps.clamp(Number(water.waterFlowWeight1), 0, 1),
      waterFlowWeight2: deps.clamp(Number(water.waterFlowWeight2), 0, 1),
      waterFlowWeight3: deps.clamp(Number(water.waterFlowWeight3), 0, 1),
      waterFlowStrength: deps.clamp(Number(water.waterFlowStrength), 0, 0.15),
      waterFlowSpeed: deps.clamp(Number(water.waterFlowSpeed), 0, 2.5),
      waterFlowScale: deps.clamp(Number(water.waterFlowScale), 0.5, 14),
      waterShimmerStrength: deps.clamp(Number(water.waterShimmerStrength), 0, 0.2),
      waterGlintStrength: deps.clamp(Number(water.waterGlintStrength), 0, 1.5),
      waterGlintSharpness: deps.clamp(Number(water.waterGlintSharpness), 0, 1),
      waterShoreFoamStrength: deps.clamp(Number(water.waterShoreFoamStrength), 0, 0.5),
      waterShoreWidth: deps.clamp(Number(water.waterShoreWidth), 0.4, 6),
      waterReflectivity: deps.clamp(Number(water.waterReflectivity), 0, 1),
      waterTintColor: Array.isArray(water.waterTintColor) ? deps.rgbToHex(water.waterTintColor) : String(water.waterTintColor || "#5ea6d6"),
      waterTintStrength: deps.clamp(Number(water.waterTintStrength), 0, 1),
      timeRouting: deps.normalizeRoutingMode(timeState.routing && timeState.routing.water, "detached"),
    };
  }

  return {
    serializeLightingSettingsLegacy,
    serializeFogSettingsLegacy,
    serializeParallaxSettingsLegacy,
    serializeCloudSettingsLegacy,
    serializeWaterSettingsLegacy,
  };
}
