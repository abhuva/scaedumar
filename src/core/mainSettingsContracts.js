export const DEFAULT_LIGHTING_SETTINGS = {
  useShadows: true,
  heightScale: 80,
  shadowStrength: 0.6,
  shadowBlur: 0,
  ambient: 0.35,
  diffuse: 1,
  useVolumetric: false,
  volumetricStrength: 0.24,
  volumetricDensity: 0.85,
  volumetricAnisotropy: 0.45,
  volumetricLength: 52,
  volumetricSamples: 12,
  cycleHour: 9.5,
  cycleSpeed: 0.08,
  simTickHours: 0.01,
  pointFlickerEnabled: true,
  pointFlickerStrength: 0.55,
  pointFlickerSpeed: 2.4,
  pointFlickerSpatial: 1.0,
};

export const DEFAULT_FOG_SETTINGS = {
  useFog: false,
  fogColor: "#7f8d99",
  fogColorManual: false,
  fogMinAlpha: 0.06,
  fogMaxAlpha: 0.55,
  fogFalloff: 1.2,
  fogStartOffset: 0,
};

export const DEFAULT_PARALLAX_SETTINGS = {
  useParallax: false,
  parallaxStrength: 0.35,
  parallaxBands: 6,
};

export const DEFAULT_CLOUD_SETTINGS = {
  useClouds: false,
  cloudCoverage: 0.58,
  cloudSoftness: 0.12,
  cloudOpacity: 0.35,
  cloudScale: 2.2,
  cloudSpeed1: 0.018,
  cloudSpeed2: -0.012,
  cloudSunParallax: 0.45,
  cloudUseSunProjection: true,
  timeRouting: "global",
};

export const DEFAULT_WATER_SETTINGS = {
  useWaterFx: false,
  waterFlowDownhill: true,
  waterFlowInvertDownhill: false,
  waterFlowDebug: false,
  waterFlowDirectionDeg: 135,
  waterLocalFlowMix: 0.35,
  waterDownhillBoost: 1.0,
  waterFlowRadius1: 1,
  waterFlowRadius2: 3,
  waterFlowRadius3: 6,
  waterFlowWeight1: 0.22,
  waterFlowWeight2: 0.33,
  waterFlowWeight3: 0.45,
  waterFlowStrength: 0.045,
  waterFlowSpeed: 0.75,
  waterFlowScale: 4.2,
  waterShimmerStrength: 0.05,
  waterGlintStrength: 0.55,
  waterGlintSharpness: 0.55,
  waterShoreFoamStrength: 0.14,
  waterShoreWidth: 2.2,
  waterReflectivity: 0.33,
  waterTintColor: "#4aa6c8",
  waterTintStrength: 0.2,
  timeRouting: "detached",
};

export const DEFAULT_INTERACTION_SETTINGS = {
  pathfindingRange: 30,
  pathWeightSlope: 1.8,
  pathWeightHeight: 3.0,
  pathWeightWater: 0.0,
  pathSlopeCutoff: 90,
  pathBaseCost: 1.0,
  cursorLightEnabled: false,
  cursorLightFollowHeight: true,
  cursorLightColor: "#ff9b2f",
  cursorLightStrength: 30,
  cursorLightHeightOffset: 8,
  cursorLightGizmo: false,
  pointLightLiveUpdate: false,
};

export const DEFAULT_SWARM_SETTINGS = {
  useAgentSwarm: false,
  useLitSwarm: false,
  followZoomBySpeed: false,
  followZoomIn: 2.2,
  followZoomOut: 0.8,
  followHawkRangeGizmo: false,
  followAgentSpeedSmoothing: 0.04,
  followAgentZoomSmoothing: 0.07,
  showStatsPanel: false,
  showTerrainInSwarm: false,
  backgroundColor: "#1c2b44",
  agentCount: 300,
  simulationSpeed: 1.0,
  maxSpeed: 120,
  maxSteering: 140,
  variationStrengthPct: 0,
  neighborRadius: 52,
  minHeight: 0,
  maxHeight: 256,
  separationRadius: 22,
  alignmentWeight: 1.1,
  cohesionWeight: 0.85,
  separationWeight: 2.4,
  wanderWeight: 0.22,
  restChancePct: 0,
  restTicks: 1000,
  breedingThreshold: 180,
  breedingSpawnChance: 0.35,
  cursorMode: "none",
  cursorStrength: 2.5,
  cursorRadius: 130,
  useHawk: false,
  hawkCount: 1,
  hawkColor: "#ff7c5c",
  hawkSpeed: 180,
  hawkSteering: 240,
  hawkTargetRange: 180,
  timeRouting: "global",
};

function createObjectValidator() {
  return (input) => (
    input === null
    || input === undefined
    || (typeof input === "object" && !Array.isArray(input))
  );
}

export function registerMainSettingsContracts(settingsRegistry, deps) {
  const validateObject = createObjectValidator();
  const descriptors = [
    {
      key: "lighting",
      defaults: DEFAULT_LIGHTING_SETTINGS,
      serialize: () => deps.serializeLighting(),
      apply: (input) => deps.applyLighting(input),
    },
    {
      key: "fog",
      defaults: DEFAULT_FOG_SETTINGS,
      serialize: () => deps.serializeFog(),
      apply: (input) => deps.applyFog(input),
    },
    {
      key: "parallax",
      defaults: DEFAULT_PARALLAX_SETTINGS,
      serialize: () => deps.serializeParallax(),
      apply: (input) => deps.applyParallax(input),
    },
    {
      key: "clouds",
      defaults: DEFAULT_CLOUD_SETTINGS,
      serialize: () => deps.serializeClouds(),
      apply: (input) => deps.applyClouds(input),
    },
    {
      key: "waterfx",
      defaults: DEFAULT_WATER_SETTINGS,
      serialize: () => deps.serializeWater(),
      apply: (input) => deps.applyWater(input),
    },
    {
      key: "interaction",
      defaults: DEFAULT_INTERACTION_SETTINGS,
      serialize: () => deps.serializeInteraction(),
      apply: (input) => deps.applyInteraction(input),
    },
    {
      key: "swarm",
      defaults: DEFAULT_SWARM_SETTINGS,
      serialize: () => deps.serializeSwarm(),
      apply: (input) => deps.applySwarm(input),
    },
  ];

  for (const descriptor of descriptors) {
    settingsRegistry.register(descriptor.key, {
      defaults: () => ({ ...descriptor.defaults }),
      validate: validateObject,
      serialize: descriptor.serialize,
      apply: descriptor.apply,
    });
  }
}
