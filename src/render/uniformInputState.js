export function buildUniformInputState(deps) {
  const lighting = deps.lightingSettings || deps.defaultLightingSettings || {};
  const parallax = deps.parallaxSettings || deps.defaultParallaxSettings || {};
  const fog = deps.fogState || deps.defaultFogSettings || {};
  const cloud = deps.cloudState || deps.defaultCloudSettings || {};
  const water = deps.waterFxState || deps.defaultWaterSettings || {};
  const weather = deps.weatherState || null;
  const flowDeg = deps.clamp(Number(water.waterFlowDirectionDeg), 0, 360);
  const flowRad = (flowDeg * Math.PI) / 180;
  const cursorLight = deps.cursorLightState || null;
  const cloudTimeSec = Number.isFinite(Number(deps.cloudTimeSec)) ? Number(deps.cloudTimeSec) : 0;
  const waterTimeSec = Number.isFinite(Number(deps.waterTimeSec)) ? Number(deps.waterTimeSec) : 0;

  return {
    shadowBlurPx: deps.clamp(Number(lighting.shadowBlur), 0, 3),
    mapAspect: deps.getMapAspect(),
    heightScale: Number(lighting.heightScale),
    shadowStrength: Number(lighting.shadowStrength),
    useShadows: Boolean(lighting.useShadows),
    useParallax: Boolean(parallax.useParallax),
    parallaxStrength: deps.clamp(Number(parallax.parallaxStrength), 0, 1),
    parallaxBands: Math.round(deps.clamp(Number(parallax.parallaxBands), 2, 256)),
    useFog: Boolean(fog.useFog),
    fogMinAlpha: deps.clamp(Number(fog.fogMinAlpha), 0, 1),
    fogMaxAlpha: deps.clamp(Number(fog.fogMaxAlpha), 0, 1),
    fogFalloff: deps.clamp(Number(fog.fogFalloff), 0.2, 4),
    fogStartOffset: deps.clamp(Number(fog.fogStartOffset), 0, 1),
    useVolumetric: Boolean(lighting.useVolumetric),
    volumetricStrength: deps.clamp(Number(lighting.volumetricStrength), 0, 1),
    volumetricDensity: deps.clamp(Number(lighting.volumetricDensity), 0, 2),
    volumetricAnisotropy: deps.clamp(Number(lighting.volumetricAnisotropy), 0, 0.95),
    volumetricLength: Math.round(deps.clamp(Number(lighting.volumetricLength), 8, 160)),
    volumetricSamples: Math.round(deps.clamp(Number(lighting.volumetricSamples), 4, 24)),
    pointFlickerEnabled: Boolean(lighting.pointFlickerEnabled),
    pointFlickerStrength: deps.clamp(Number(lighting.pointFlickerStrength), 0, 1),
    pointFlickerSpeed: deps.clamp(Number(lighting.pointFlickerSpeed), 0.1, 12),
    pointFlickerSpatial: deps.clamp(Number(lighting.pointFlickerSpatial), 0, 4),
    useClouds: Boolean(cloud.useClouds),
    cloudCoverage: deps.clamp(Number(cloud.cloudCoverage), 0, 1),
    cloudSoftness: deps.clamp(Number(cloud.cloudSoftness), 0.01, 0.35),
    cloudOpacity: deps.clamp(Number(cloud.cloudOpacity), 0, 1),
    cloudScale: deps.clamp(Number(cloud.cloudScale), 0.5, 8),
    cloudSpeed1: deps.clamp(Number(cloud.cloudSpeed1), -0.3, 0.3),
    cloudSpeed2: deps.clamp(Number(cloud.cloudSpeed2), -0.3, 0.3),
    cloudSunParallax: deps.clamp(Number(cloud.cloudSunParallax), 0, 2),
    cloudUseSunProjection: Boolean(cloud.cloudUseSunProjection),
    useWaterFx: Boolean(water.useWaterFx),
    waterFlowDownhill: Boolean(water.waterFlowDownhill),
    waterFlowInvertDownhill: Boolean(water.waterFlowInvertDownhill),
    waterFlowDebug: Boolean(water.waterFlowDebug),
    waterFlowDirX: Number.isFinite(Number(water.waterFlowDirX)) ? Number(water.waterFlowDirX) : Math.cos(flowRad),
    waterFlowDirY: Number.isFinite(Number(water.waterFlowDirY)) ? Number(water.waterFlowDirY) : Math.sin(flowRad),
    waterLocalFlowMix: deps.clamp(Number(water.waterLocalFlowMix), 0, 1),
    waterDownhillBoost: deps.clamp(Number(water.waterDownhillBoost), 0, 4),
    waterFlowStrength: deps.clamp(Number(water.waterFlowStrength), 0, 0.15),
    waterFlowSpeed: deps.clamp(Number(water.waterFlowSpeed), 0, 2.5),
    waterFlowScale: deps.clamp(Number(water.waterFlowScale), 0.5, 14),
    waterShimmerStrength: deps.clamp(Number(water.waterShimmerStrength), 0, 0.2),
    waterGlintStrength: deps.clamp(Number(water.waterGlintStrength), 0, 1.5),
    waterGlintSharpness: deps.clamp(Number(water.waterGlintSharpness), 0, 1),
    waterShoreFoamStrength: deps.clamp(Number(water.waterShoreFoamStrength), 0, 0.5),
    waterShoreWidth: deps.clamp(Number(water.waterShoreWidth), 0.4, 6),
    waterReflectivity: deps.clamp(Number(water.waterReflectivity), 0, 1),
    waterTintColor: Array.isArray(water.waterTintColor) ? water.waterTintColor : deps.hexToRgb01(String(water.waterTintColor || "#5ea6d6")),
    waterTintStrength: deps.clamp(Number(water.waterTintStrength), 0, 1),
    cloudTimeSec,
    waterTimeSec,
    weatherType: weather ? weather.type : "clear",
    weatherIntensity: weather ? weather.intensity : 0,
    weatherWindDirX: weather ? weather.windDirX : 1,
    weatherWindDirY: weather ? weather.windDirY : 0,
    weatherWindSpeed: weather ? weather.windSpeed : 0,
    weatherLocalModulation: weather ? weather.localModulation : 0,
    useCursorLight: Boolean(cursorLight && cursorLight.enabled && cursorLight.active),
  };
}
