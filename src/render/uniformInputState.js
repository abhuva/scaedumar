import { DEFAULT_DETAIL_SETTINGS, normalizeDetailSettings } from "../gameplay/detailDataSerializer.js";

export function buildUniformInputState(deps) {
  const lighting = deps.lightingSettings || deps.defaultLightingSettings || {};
  const fog = deps.fogState || deps.defaultFogSettings || {};
  const cloud = deps.cloudState || deps.defaultCloudSettings || {};
  const water = deps.waterFxState || deps.defaultWaterSettings || {};
  const defaultWaterTrailSettings = deps.defaultWaterTrailSettings || {};
  const waterTrail = deps.waterTrailState || defaultWaterTrailSettings;
  const detail = normalizeDetailSettings(
    deps.detailState || deps.defaultDetailSettings || DEFAULT_DETAIL_SETTINGS,
    deps.defaultDetailSettings || DEFAULT_DETAIL_SETTINGS,
  );
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
    useFog: Boolean(fog.useFog),
    fogMinAlpha: deps.clamp(Number(fog.fogMinAlpha), 0, 1),
    fogMaxAlpha: deps.clamp(Number(fog.fogMaxAlpha), 0, 1),
    fogFalloff: deps.clamp(Number(fog.fogFalloff), 0.2, 4),
    fogStartOffset: deps.clamp(Number(fog.fogStartOffset), 0, 1),
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
    useWaterFx: Boolean(water.useWaterFx),
    waterFlowSource: water.waterFlowSource === "fixed" || water.waterFlowSource === "height" || water.waterFlowSource === "image"
      ? water.waterFlowSource
      : (water.waterFlowDownhill === false ? "fixed" : "height"),
    waterFlowRenderMode: water.waterFlowRenderMode === "procedural" ? "procedural" : "streamlines",
    waterFlowChannelPair: water.waterFlowChannelPair === "gb" || water.waterFlowChannelPair === "rb" ? water.waterFlowChannelPair : "rg",
    waterFlowFlipX: Boolean(water.waterFlowFlipX),
    waterFlowFlipY: Boolean(water.waterFlowFlipY),
    waterFlowUseMagnitude: Boolean(water.waterFlowUseMagnitude),
    waterFlowDownhill: Boolean(water.waterFlowDownhill),
    waterFlowInvertDownhill: Boolean(water.waterFlowInvertDownhill),
    waterFlowDebug: Boolean(water.waterFlowDebug),
    waterFlowDirX: Number.isFinite(Number(water.waterFlowDirX)) ? Number(water.waterFlowDirX) : Math.cos(flowRad),
    waterFlowDirY: Number.isFinite(Number(water.waterFlowDirY)) ? Number(water.waterFlowDirY) : Math.sin(flowRad),
    waterLocalFlowMix: deps.clamp(Number(water.waterLocalFlowMix), 0, 1),
    waterDownhillBoost: deps.clamp(Number(water.waterDownhillBoost), 0, 4),
    waterFlowStrength: deps.clamp(Number(water.waterFlowStrength), 0, 0.15),
    waterFlowMapStrength: deps.clamp(Number(water.waterFlowMapStrength), 0, 4),
    waterFlowVisibility: deps.clamp(Number(water.waterFlowVisibility), 0, 4),
    waterStreamlineDensity: deps.clamp(Number(water.waterStreamlineDensity), 4, 80),
    waterStreamlineSharpness: deps.clamp(Number(water.waterStreamlineSharpness), 0, 1),
    waterFlowSpeed: deps.clamp(Number(water.waterFlowSpeed), 0, 2.5),
    waterFlowScale: deps.clamp(Number(water.waterFlowScale), 0.5, 14),
    waterShimmerStrength: deps.clamp(Number(water.waterShimmerStrength), 0, 0.2),
    waterGlintStrength: deps.clamp(Number(water.waterGlintStrength), 0, 1.5),
    waterGlintSharpness: deps.clamp(Number(water.waterGlintSharpness), 0, 1),
    waterShoreFoamStrength: deps.clamp(Number(water.waterShoreFoamStrength), 0, 0.5),
    waterShoreWidth: deps.clamp(Number(water.waterShoreWidth), 0.4, 6),
    waterReflectivity: deps.clamp(Number(water.waterReflectivity), 0, 1),
    waterBaseColor: Array.isArray(water.waterBaseColor) ? water.waterBaseColor : deps.hexToRgb01(String(water.waterBaseColor || "#245f73")),
    waterOpacity: deps.clamp(Number(water.waterOpacity), 0, 1),
    useWaterTrail: Boolean(waterTrail.enabled),
    waterTrailStrength: deps.clamp(Number(waterTrail.strength ?? waterTrail.trailStrength), 0, 6),
    waterTrailHeadroom: deps.clamp(Number(waterTrail.headroom ?? waterTrail.trailHeadroom), 1, 12),
    waterTrailDebug: Boolean(waterTrail.debug),
    waterTrailColor: Array.isArray(waterTrail.tintColor) ? waterTrail.tintColor : [0.494, 0.843, 1],
    waterGlitterStrength: deps.clamp(Number(waterTrail.glitterStrength), 0, 2),
    waterGlitterDensity: deps.clamp(Number(waterTrail.glitterDensity), 0.001, 0.25),
    waterGlitterSpeed: deps.clamp(Number(waterTrail.glitterSpeed), 0, 12),
    waterGlitterSize: Math.round(deps.clamp(Number(waterTrail.glitterSize), 1, 12)),
    waterGlitterSharpness: deps.clamp(Number(waterTrail.glitterSharpness), 1, 24),
    waterGlitterWakeSuppression: deps.clamp(Number(waterTrail.glitterWakeSuppression), 0, 1),
    waterTintColor: Array.isArray(water.waterTintColor) ? water.waterTintColor : deps.hexToRgb01(String(water.waterTintColor || "#5ea6d6")),
    waterTintStrength: deps.clamp(Number(water.waterTintStrength), 0, 1),
    useDetail: Boolean(detail.enabled),
    detailStartPxPerMeter: deps.clamp(Number(detail.zoom.startPxPerMeter), 0, 512),
    detailFullPxPerMeter: deps.clamp(Number(detail.zoom.fullPxPerMeter), 0, 1024),
    detailBlendMode: detail.transition.blendMode,
    detailDebugChannel: detail.transition.debugChannel,
    terrainDebugViewMode: deps.terrainDebugViewMode || "none",
    detailQuantizationSteps: Math.round(deps.clamp(Number(detail.transition.quantizationSteps), 0, 32)),
    detailDitherScale: deps.clamp(Number(detail.transition.ditherScale), 0.03125, 1),
    detailDitherStrength: deps.clamp(Number(detail.transition.ditherStrength), 0, 1),
    detailMinWeight: deps.clamp(Number(detail.transition.minWeight), 0, 0.5),
    detailMaterialPriorities: Array.isArray(detail.transition.priorities)
      ? detail.transition.priorities.slice(0, 4)
      : [0, 0, 0, 0],
    detailMaterial0MicroScale: deps.clamp(Number(detail.materials[0].micro.scaleMeters), 1, 32),
    detailMaterial1MicroScale: deps.clamp(Number(detail.materials[1].micro.scaleMeters), 1, 32),
    detailMaterial2MicroScale: deps.clamp(Number(detail.materials[2].micro.scaleMeters), 1, 32),
    detailMaterial3MicroScale: deps.clamp(Number(detail.materials[3].micro.scaleMeters), 1, 32),
    detailMaterial0MicroColor: deps.clamp(Number(detail.materials[0].micro.colorStrength), 0, 1),
    detailMaterial1MicroColor: deps.clamp(Number(detail.materials[1].micro.colorStrength), 0, 1),
    detailMaterial2MicroColor: deps.clamp(Number(detail.materials[2].micro.colorStrength), 0, 1),
    detailMaterial3MicroColor: deps.clamp(Number(detail.materials[3].micro.colorStrength), 0, 1),
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
