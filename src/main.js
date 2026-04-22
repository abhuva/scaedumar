import { createRuntimeCore, createCoreCommandDispatch } from "./core/runtimeCore.js";
import { bindPointLightWorker } from "./core/pointLightWorkerBinding.js";
import { registerMainCommands } from "./core/registerMainCommands.js";
import { updateCoreFrameSnapshot } from "./core/frameSnapshot.js";
import { applyRuntimeParityFromCoreState } from "./core/runtimeParityAdapter.js";
import { normalizeRuntimeMode, canUseInteractionMode as canUseModeInteraction, canUseTopic as canUseModeTopic } from "./core/modeCapabilities.js";
import {
  DEFAULT_LIGHTING_SETTINGS,
  DEFAULT_FOG_SETTINGS,
  DEFAULT_PARALLAX_SETTINGS,
  DEFAULT_CLOUD_SETTINGS,
  DEFAULT_WATER_SETTINGS,
  DEFAULT_INTERACTION_SETTINGS,
  DEFAULT_SWARM_SETTINGS,
  registerMainSettingsContracts,
} from "./core/mainSettingsContracts.js";
import { createRenderResources } from "./render/resources.js";
import { createRenderer } from "./render/renderer.js";
import { buildFrameRenderState } from "./render/frameRenderState.js";
import { buildUniformInputState } from "./render/uniformInputState.js";
import { createShadowPass } from "./render/passes/shadowPass.js";
import { createMainTerrainPass } from "./render/passes/mainTerrainPass.js";
import { createBlurPass } from "./render/passes/blurPass.js";
import { applyPointLightUsagePass } from "./render/passes/pointLightUsagePass.js";
import { rebuildFlowMapTexture as rebuildFlowMapTexturePrecompute } from "./render/precompute/flowMap.js";
import { createPointLightBakeOrchestrator } from "./render/precompute/pointLightBake.js";
import { createTimeSystem } from "./sim/timeSystem.js";
import { createLightingSystem } from "./sim/lightingSystem.js";
import { createFogSystem } from "./sim/fogSystem.js";
import { createCloudSystem } from "./sim/cloudSystem.js";
import { createWaterFxSystem } from "./sim/waterFxSystem.js";
import { createWeatherSystem } from "./sim/weatherSystem.js";
import { createEntityStore } from "./gameplay/entityStore.js";
import { createPathfindingSystem } from "./gameplay/pathfindingSystem.js";
import { createMovementSystem } from "./gameplay/movementSystem.js";
import { bindCanvasControls } from "./ui/bindings/canvasBinding.js";
import { bindTopicPanelControls } from "./ui/bindings/topicPanelBinding.js";
import { bindInteractionAndCycleControls } from "./ui/bindings/interactionBinding.js";
import { bindPathfindingControls } from "./ui/bindings/pathfindingBinding.js";
import { bindCursorLightControls } from "./ui/bindings/cursorLightBinding.js";
import { bindSwarmFollowControls } from "./ui/bindings/swarmFollowBinding.js";
import { bindPointLightEditorControls } from "./ui/bindings/pointLightEditorBinding.js";
import { bindMapIoControls } from "./ui/bindings/mapIoBinding.js";
import { bindRenderFxControls } from "./ui/bindings/renderFxBinding.js";
import { bindSwarmPanelControls } from "./ui/bindings/swarmPanelBinding.js";
import { bindRuntimeControls } from "./ui/bindings/runtimeBinding.js";
import { createOverlayHooks } from "./ui/overlays/overlayHooks.js";

function getRequiredElementById(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing required element with id '${id}'.`);
  }
  return el;
}

function getRequiredElements(selector) {
  const els = Array.from(document.querySelectorAll(selector));
  if (els.length === 0) {
    throw new Error(`Missing required elements for selector '${selector}'.`);
  }
  return els;
}
const canvas = getRequiredElementById("glCanvas");
const overlayCanvas = getRequiredElementById("overlayCanvas");
const topicButtons = getRequiredElements(".topic-btn");
const topicPanelEl = getRequiredElementById("topicPanel");
const topicPanelTitleEl = getRequiredElementById("topicPanelTitle");
const topicPanelCloseBtn = getRequiredElementById("topicPanelClose");
const topicCards = getRequiredElements(".topic-card");
const statusEl = getRequiredElementById("status");
const cycleInfoEl = getRequiredElementById("cycleInfo");
const playerInfoEl = getRequiredElementById("playerInfo");
const pathInfoEl = getRequiredElementById("pathInfo");
const mapPathInput = getRequiredElementById("mapPathInput");
const mapPathLoadBtn = getRequiredElementById("mapPathLoadBtn");
const mapFolderInput = getRequiredElementById("mapFolderInput");
const mapSaveAllBtn = getRequiredElementById("mapSaveAllBtn");
const dockLightingModeToggle = getRequiredElementById("dockLightingModeToggle");
const dockPathfindingModeToggle = getRequiredElementById("dockPathfindingModeToggle");
const pathfindingRangeInput = getRequiredElementById("pathfindingRange");
const pathfindingRangeValue = getRequiredElementById("pathfindingRangeValue");
const pathWeightSlopeInput = getRequiredElementById("pathWeightSlope");
const pathWeightSlopeValue = getRequiredElementById("pathWeightSlopeValue");
const pathWeightHeightInput = getRequiredElementById("pathWeightHeight");
const pathWeightHeightValue = getRequiredElementById("pathWeightHeightValue");
const pathWeightWaterInput = getRequiredElementById("pathWeightWater");
const pathWeightWaterValue = getRequiredElementById("pathWeightWaterValue");
const pathSlopeCutoffInput = getRequiredElementById("pathSlopeCutoff");
const pathSlopeCutoffValue = getRequiredElementById("pathSlopeCutoffValue");
const pathBaseCostInput = getRequiredElementById("pathBaseCost");
const pathBaseCostValue = getRequiredElementById("pathBaseCostValue");
const cursorLightModeToggle = getRequiredElementById("cursorLightModeToggle");
const cursorLightFollowHeightToggle = getRequiredElementById("cursorLightFollowHeightToggle");
const cursorLightColorInput = getRequiredElementById("cursorLightColor");
const cursorLightStrengthInput = getRequiredElementById("cursorLightStrength");
const cursorLightStrengthValue = getRequiredElementById("cursorLightStrengthValue");
const cursorLightHeightOffsetInput = getRequiredElementById("cursorLightHeightOffset");
const cursorLightHeightOffsetValue = getRequiredElementById("cursorLightHeightOffsetValue");
const cursorLightGizmoToggle = getRequiredElementById("cursorLightGizmoToggle");
const swarmEnabledToggle = getRequiredElementById("swarmEnabledToggle");
const swarmFollowToggleBtn = getRequiredElementById("swarmFollowToggle");
const swarmFollowTargetInput = getRequiredElementById("swarmFollowTarget");
const swarmFollowZoomToggle = getRequiredElementById("swarmFollowZoomToggle");
const swarmFollowZoomInInput = getRequiredElementById("swarmFollowZoomIn");
const swarmFollowZoomInValue = getRequiredElementById("swarmFollowZoomInValue");
const swarmFollowZoomOutInput = getRequiredElementById("swarmFollowZoomOut");
const swarmFollowZoomOutValue = getRequiredElementById("swarmFollowZoomOutValue");
const swarmFollowHawkRangeGizmoToggle = getRequiredElementById("swarmFollowHawkRangeGizmoToggle");
const swarmFollowAgentSpeedSmoothingInput = getRequiredElementById("swarmFollowAgentSpeedSmoothing");
const swarmFollowAgentSpeedSmoothingValue = getRequiredElementById("swarmFollowAgentSpeedSmoothingValue");
const swarmFollowAgentZoomSmoothingInput = getRequiredElementById("swarmFollowAgentZoomSmoothing");
const swarmFollowAgentZoomSmoothingValue = getRequiredElementById("swarmFollowAgentZoomSmoothingValue");
const swarmStatsPanelToggle = getRequiredElementById("swarmStatsPanelToggle");
const swarmShowTerrainToggle = getRequiredElementById("swarmShowTerrainToggle");
const swarmLitModeToggle = getRequiredElementById("swarmLitModeToggle");
const swarmBackgroundColorInput = getRequiredElementById("swarmBackgroundColor");
const swarmAgentCountInput = getRequiredElementById("swarmAgentCount");
const swarmAgentCountValue = getRequiredElementById("swarmAgentCountValue");
const swarmUpdateIntervalInput = getRequiredElementById("swarmUpdateInterval");
const swarmUpdateIntervalValue = getRequiredElementById("swarmUpdateIntervalValue");
const swarmMaxSpeedInput = getRequiredElementById("swarmMaxSpeed");
const swarmMaxSpeedValue = getRequiredElementById("swarmMaxSpeedValue");
const swarmSteeringMaxInput = getRequiredElementById("swarmSteeringMax");
const swarmSteeringMaxValue = getRequiredElementById("swarmSteeringMaxValue");
const swarmVariationStrengthInput = getRequiredElementById("swarmVariationStrength");
const swarmVariationStrengthValue = getRequiredElementById("swarmVariationStrengthValue");
const swarmNeighborRadiusInput = getRequiredElementById("swarmNeighborRadius");
const swarmNeighborRadiusValue = getRequiredElementById("swarmNeighborRadiusValue");
const swarmMinHeightInput = getRequiredElementById("swarmMinHeight");
const swarmMinHeightValue = getRequiredElementById("swarmMinHeightValue");
const swarmMaxHeightInput = getRequiredElementById("swarmMaxHeight");
const swarmMaxHeightValue = getRequiredElementById("swarmMaxHeightValue");
const swarmSeparationRadiusInput = getRequiredElementById("swarmSeparationRadius");
const swarmSeparationRadiusValue = getRequiredElementById("swarmSeparationRadiusValue");
const swarmAlignmentWeightInput = getRequiredElementById("swarmAlignmentWeight");
const swarmAlignmentWeightValue = getRequiredElementById("swarmAlignmentWeightValue");
const swarmCohesionWeightInput = getRequiredElementById("swarmCohesionWeight");
const swarmCohesionWeightValue = getRequiredElementById("swarmCohesionWeightValue");
const swarmSeparationWeightInput = getRequiredElementById("swarmSeparationWeight");
const swarmSeparationWeightValue = getRequiredElementById("swarmSeparationWeightValue");
const swarmWanderWeightInput = getRequiredElementById("swarmWanderWeight");
const swarmWanderWeightValue = getRequiredElementById("swarmWanderWeightValue");
const swarmRestChanceInput = getRequiredElementById("swarmRestChance");
const swarmRestChanceValue = getRequiredElementById("swarmRestChanceValue");
const swarmRestTicksInput = getRequiredElementById("swarmRestTicks");
const swarmRestTicksValue = getRequiredElementById("swarmRestTicksValue");
const swarmBreedingThresholdInput = getRequiredElementById("swarmBreedingThreshold");
const swarmBreedingThresholdValue = getRequiredElementById("swarmBreedingThresholdValue");
const swarmBreedingSpawnChanceInput = getRequiredElementById("swarmBreedingSpawnChance");
const swarmBreedingSpawnChanceValue = getRequiredElementById("swarmBreedingSpawnChanceValue");
const swarmCursorModeInput = getRequiredElementById("swarmCursorMode");
const swarmCursorStrengthInput = getRequiredElementById("swarmCursorStrength");
const swarmCursorStrengthValue = getRequiredElementById("swarmCursorStrengthValue");
const swarmCursorRadiusInput = getRequiredElementById("swarmCursorRadius");
const swarmCursorRadiusValue = getRequiredElementById("swarmCursorRadiusValue");
const swarmHawkEnabledToggle = getRequiredElementById("swarmHawkEnabledToggle");
const swarmHawkCountInput = getRequiredElementById("swarmHawkCount");
const swarmHawkCountValue = getRequiredElementById("swarmHawkCountValue");
const swarmHawkColorInput = getRequiredElementById("swarmHawkColor");
const swarmHawkSpeedInput = getRequiredElementById("swarmHawkSpeed");
const swarmHawkSpeedValue = getRequiredElementById("swarmHawkSpeedValue");
const swarmHawkSteeringInput = getRequiredElementById("swarmHawkSteering");
const swarmHawkSteeringValue = getRequiredElementById("swarmHawkSteeringValue");
const swarmHawkTargetRangeInput = getRequiredElementById("swarmHawkTargetRange");
const swarmHawkTargetRangeValue = getRequiredElementById("swarmHawkTargetRangeValue");
const swarmStatsPanelEl = getRequiredElementById("swarmStatsPanel");
const swarmStatsBirdsValue = getRequiredElementById("swarmStatsBirdsValue");
const swarmStatsHawksValue = getRequiredElementById("swarmStatsHawksValue");
const swarmStatsStepsValue = getRequiredElementById("swarmStatsStepsValue");
const swarmStatsAvgHawkKillValue = getRequiredElementById("swarmStatsAvgHawkKillValue");
const cycleSpeedInput = getRequiredElementById("cycleSpeed");
const cycleHourInput = getRequiredElementById("cycleHour");
const cycleHourValue = getRequiredElementById("cycleHourValue");
const shadowsToggle = getRequiredElementById("shadowsToggle");
const parallaxToggle = getRequiredElementById("parallaxToggle");
const parallaxStrengthInput = getRequiredElementById("parallaxStrength");
const parallaxStrengthValue = getRequiredElementById("parallaxStrengthValue");
const parallaxBandsInput = getRequiredElementById("parallaxBands");
const parallaxBandsValue = getRequiredElementById("parallaxBandsValue");
const fogToggle = getRequiredElementById("fogToggle");
const fogColorInput = getRequiredElementById("fogColor");
const fogMinAlphaInput = getRequiredElementById("fogMinAlpha");
const fogMinAlphaValue = getRequiredElementById("fogMinAlphaValue");
const fogMaxAlphaInput = getRequiredElementById("fogMaxAlpha");
const fogMaxAlphaValue = getRequiredElementById("fogMaxAlphaValue");
const fogFalloffInput = getRequiredElementById("fogFalloff");
const fogFalloffValue = getRequiredElementById("fogFalloffValue");
const fogStartOffsetInput = getRequiredElementById("fogStartOffset");
const fogStartOffsetValue = getRequiredElementById("fogStartOffsetValue");
const cloudToggle = getRequiredElementById("cloudToggle");
const cloudCoverageInput = getRequiredElementById("cloudCoverage");
const cloudCoverageValue = getRequiredElementById("cloudCoverageValue");
const cloudSoftnessInput = getRequiredElementById("cloudSoftness");
const cloudSoftnessValue = getRequiredElementById("cloudSoftnessValue");
const cloudOpacityInput = getRequiredElementById("cloudOpacity");
const cloudOpacityValue = getRequiredElementById("cloudOpacityValue");
const cloudScaleInput = getRequiredElementById("cloudScale");
const cloudScaleValue = getRequiredElementById("cloudScaleValue");
const cloudSpeed1Input = getRequiredElementById("cloudSpeed1");
const cloudSpeed1Value = getRequiredElementById("cloudSpeed1Value");
const cloudSpeed2Input = getRequiredElementById("cloudSpeed2");
const cloudSpeed2Value = getRequiredElementById("cloudSpeed2Value");
const cloudSunParallaxInput = getRequiredElementById("cloudSunParallax");
const cloudSunParallaxValue = getRequiredElementById("cloudSunParallaxValue");
const cloudSunProjectToggle = getRequiredElementById("cloudSunProjectToggle");
const waterFxToggle = getRequiredElementById("waterFxToggle");
const waterFlowDownhillToggle = getRequiredElementById("waterFlowDownhillToggle");
const waterFlowInvertDownhillToggle = getRequiredElementById("waterFlowInvertDownhillToggle");
const waterFlowDebugToggle = getRequiredElementById("waterFlowDebugToggle");
const waterFlowDirectionInput = getRequiredElementById("waterFlowDirection");
const waterFlowDirectionValue = getRequiredElementById("waterFlowDirectionValue");
const waterFlowStrengthInput = getRequiredElementById("waterFlowStrength");
const waterFlowStrengthValue = getRequiredElementById("waterFlowStrengthValue");
const waterFlowSpeedInput = getRequiredElementById("waterFlowSpeed");
const waterFlowSpeedValue = getRequiredElementById("waterFlowSpeedValue");
const waterFlowScaleInput = getRequiredElementById("waterFlowScale");
const waterFlowScaleValue = getRequiredElementById("waterFlowScaleValue");
const waterLocalFlowMixInput = getRequiredElementById("waterLocalFlowMix");
const waterLocalFlowMixValue = getRequiredElementById("waterLocalFlowMixValue");
const waterDownhillBoostInput = getRequiredElementById("waterDownhillBoost");
const waterDownhillBoostValue = getRequiredElementById("waterDownhillBoostValue");
const waterFlowRadius1Input = getRequiredElementById("waterFlowRadius1");
const waterFlowRadius1Value = getRequiredElementById("waterFlowRadius1Value");
const waterFlowRadius2Input = getRequiredElementById("waterFlowRadius2");
const waterFlowRadius2Value = getRequiredElementById("waterFlowRadius2Value");
const waterFlowRadius3Input = getRequiredElementById("waterFlowRadius3");
const waterFlowRadius3Value = getRequiredElementById("waterFlowRadius3Value");
const waterFlowWeight1Input = getRequiredElementById("waterFlowWeight1");
const waterFlowWeight1Value = getRequiredElementById("waterFlowWeight1Value");
const waterFlowWeight2Input = getRequiredElementById("waterFlowWeight2");
const waterFlowWeight2Value = getRequiredElementById("waterFlowWeight2Value");
const waterFlowWeight3Input = getRequiredElementById("waterFlowWeight3");
const waterFlowWeight3Value = getRequiredElementById("waterFlowWeight3Value");
const waterShimmerStrengthInput = getRequiredElementById("waterShimmerStrength");
const waterShimmerStrengthValue = getRequiredElementById("waterShimmerStrengthValue");
const waterGlintStrengthInput = getRequiredElementById("waterGlintStrength");
const waterGlintStrengthValue = getRequiredElementById("waterGlintStrengthValue");
const waterGlintSharpnessInput = getRequiredElementById("waterGlintSharpness");
const waterGlintSharpnessValue = getRequiredElementById("waterGlintSharpnessValue");
const waterShoreFoamStrengthInput = getRequiredElementById("waterShoreFoamStrength");
const waterShoreFoamStrengthValue = getRequiredElementById("waterShoreFoamStrengthValue");
const waterShoreWidthInput = getRequiredElementById("waterShoreWidth");
const waterShoreWidthValue = getRequiredElementById("waterShoreWidthValue");
const waterReflectivityInput = getRequiredElementById("waterReflectivity");
const waterReflectivityValue = getRequiredElementById("waterReflectivityValue");
const waterTintColorInput = getRequiredElementById("waterTintColor");
const waterTintStrengthInput = getRequiredElementById("waterTintStrength");
const waterTintStrengthValue = getRequiredElementById("waterTintStrengthValue");
const heightScaleInput = getRequiredElementById("heightScale");
const shadowStrengthInput = getRequiredElementById("shadowStrength");
const shadowBlurInput = getRequiredElementById("shadowBlur");
const shadowBlurValue = getRequiredElementById("shadowBlurValue");
const ambientInput = getRequiredElementById("ambient");
const diffuseInput = getRequiredElementById("diffuse");
const volumetricToggle = getRequiredElementById("volumetricToggle");
const volumetricStrengthInput = getRequiredElementById("volumetricStrength");
const volumetricStrengthValue = getRequiredElementById("volumetricStrengthValue");
const volumetricDensityInput = getRequiredElementById("volumetricDensity");
const volumetricDensityValue = getRequiredElementById("volumetricDensityValue");
const volumetricAnisotropyInput = getRequiredElementById("volumetricAnisotropy");
const volumetricAnisotropyValue = getRequiredElementById("volumetricAnisotropyValue");
const volumetricLengthInput = getRequiredElementById("volumetricLength");
const volumetricLengthValue = getRequiredElementById("volumetricLengthValue");
const volumetricSamplesInput = getRequiredElementById("volumetricSamples");
const volumetricSamplesValue = getRequiredElementById("volumetricSamplesValue");
const pointFlickerToggle = getRequiredElementById("pointFlickerToggle");
const pointFlickerStrengthInput = getRequiredElementById("pointFlickerStrength");
const pointFlickerStrengthValue = getRequiredElementById("pointFlickerStrengthValue");
const pointFlickerSpeedInput = getRequiredElementById("pointFlickerSpeed");
const pointFlickerSpeedValue = getRequiredElementById("pointFlickerSpeedValue");
const pointFlickerSpatialInput = getRequiredElementById("pointFlickerSpatial");
const pointFlickerSpatialValue = getRequiredElementById("pointFlickerSpatialValue");
const lightEditorEmptyEl = getRequiredElementById("lightEditorEmpty");
const lightEditorFieldsEl = getRequiredElementById("lightEditorFields");
const lightCoordEl = getRequiredElementById("lightCoord");
const pointLightColorInput = getRequiredElementById("pointLightColor");
const pointLightStrengthInput = getRequiredElementById("pointLightStrength");
const pointLightStrengthValue = getRequiredElementById("pointLightStrengthValue");
const pointLightIntensityInput = getRequiredElementById("pointLightIntensity");
const pointLightIntensityValue = getRequiredElementById("pointLightIntensityValue");
const pointLightHeightOffsetInput = getRequiredElementById("pointLightHeightOffset");
const pointLightHeightOffsetValue = getRequiredElementById("pointLightHeightOffsetValue");
const pointLightFlickerInput = getRequiredElementById("pointLightFlicker");
const pointLightFlickerValue = getRequiredElementById("pointLightFlickerValue");
const pointLightFlickerSpeedInput = getRequiredElementById("pointLightFlickerSpeed");
const pointLightFlickerSpeedValue = getRequiredElementById("pointLightFlickerSpeedValue");
const pointLightLiveUpdateToggle = getRequiredElementById("pointLightLiveUpdateToggle");
const lightSaveBtn = getRequiredElementById("lightSaveBtn");
const lightCancelBtn = getRequiredElementById("lightCancelBtn");
const lightDeleteBtn = getRequiredElementById("lightDeleteBtn");
const pointLightsSaveAllBtn = getRequiredElementById("pointLightsSaveAllBtn");
const pointLightsLoadAllBtn = getRequiredElementById("pointLightsLoadAllBtn");
const pointLightsLoadInput = getRequiredElementById("pointLightsLoadInput");
const overlayCtx = overlayCanvas.getContext("2d");
if (!overlayCtx) {
  throw new Error("2D overlay context is required for this prototype.");
}

const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL2 is required for this prototype.");
}
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

const VERT_SRC = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uSplat;
uniform sampler2D uNormals;
uniform sampler2D uHeight;
uniform sampler2D uPointLightTex;
uniform sampler2D uCloudNoiseTex;
uniform sampler2D uShadowTex;
uniform sampler2D uWater;
uniform sampler2D uFlowMap;
uniform float uUseCursorLight;
uniform vec2 uCursorLightUv;
uniform vec3 uCursorLightColor;
uniform float uCursorLightStrength;
uniform float uCursorLightHeightOffset;
uniform float uUseCursorTerrainHeight;
uniform vec2 uCursorLightMapSize;
uniform vec2 uMapTexelSize;
uniform vec2 uResolution;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunStrength;
uniform vec3 uMoonDir;
uniform vec3 uMoonColor;
uniform float uMoonStrength;
uniform vec3 uAmbientColor;
uniform float uAmbient;
uniform float uHeightScale;
uniform float uShadowStrength;
uniform float uUseShadows;
uniform float uUseParallax;
uniform float uParallaxStrength;
uniform float uParallaxBands;
uniform float uZoom;
uniform float uUseFog;
uniform vec3 uFogColor;
uniform float uFogMinAlpha;
uniform float uFogMaxAlpha;
uniform float uFogFalloff;
uniform float uFogStartOffset;
uniform float uCameraHeightNorm;
uniform float uUseVolumetric;
uniform float uVolumetricStrength;
uniform float uVolumetricDensity;
uniform float uVolumetricAnisotropy;
uniform float uVolumetricLength;
uniform float uVolumetricSamples;
uniform float uMapAspect;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;
uniform float uTimeSec;
uniform float uPointFlickerEnabled;
uniform float uPointFlickerStrength;
uniform float uPointFlickerSpeed;
uniform float uPointFlickerSpatial;
uniform float uUseClouds;
uniform float uCloudCoverage;
uniform float uCloudSoftness;
uniform float uCloudOpacity;
uniform float uCloudScale;
uniform float uCloudSpeed1;
uniform float uCloudSpeed2;
uniform float uCloudSunParallax;
uniform float uCloudUseSunProjection;
uniform float uUseWaterFx;
uniform float uWaterFlowDownhill;
uniform float uWaterFlowInvertDownhill;
uniform float uWaterFlowDebug;
uniform vec2 uWaterFlowDir;
uniform float uWaterLocalFlowMix;
uniform float uWaterDownhillBoost;
uniform float uWaterFlowStrength;
uniform float uWaterFlowSpeed;
uniform float uWaterFlowScale;
uniform float uWaterShimmerStrength;
uniform float uWaterGlintStrength;
uniform float uWaterGlintSharpness;
uniform float uWaterShoreFoamStrength;
uniform float uWaterShoreWidth;
uniform float uWaterReflectivity;
uniform vec3 uWaterTintColor;
uniform float uWaterTintStrength;
uniform vec3 uSkyColor;

float readHeight(vec2 uv) {
  return texture(uHeight, uv).r * uHeightScale;
}

vec2 applyParallax(vec2 baseUv, vec2 focalUv) {
  if (uUseParallax < 0.5) return baseUv;

  float hRaw = texture(uHeight, baseUv).r;
  vec2 fromFocal = baseUv - focalUv;
  float dist = length(fromFocal);
  float edgeBoost = smoothstep(0.0, 0.9, dist);
  float zoomNorm = max(0.35, uZoom);
  float amount = uParallaxStrength * (0.35 + 0.65 * edgeBoost) * zoomNorm;

  float centeredHeight = hRaw - 0.5;
  vec2 continuousOffset = -fromFocal * (centeredHeight * amount * 0.48);

  float bandSteps = max(2.0, uParallaxBands);
  float bandNorm = floor(hRaw * bandSteps) / max(1.0, bandSteps - 1.0);
  float centeredBand = bandNorm - 0.5;
  vec2 bandOffset = -fromFocal * (centeredBand * amount * 0.70);

  return baseUv + continuousOffset + bandOffset;
}

vec2 fitUvOffsetToBounds(vec2 baseUv, vec2 displacedUv) {
  vec2 offset = displacedUv - baseUv;
  float scale = 1.0;

  if (offset.x > 0.0) {
    scale = min(scale, (1.0 - baseUv.x) / max(0.000001, offset.x));
  } else if (offset.x < 0.0) {
    scale = min(scale, baseUv.x / max(0.000001, -offset.x));
  }

  if (offset.y > 0.0) {
    scale = min(scale, (1.0 - baseUv.y) / max(0.000001, offset.y));
  } else if (offset.y < 0.0) {
    scale = min(scale, baseUv.y / max(0.000001, -offset.y));
  }

  scale = clamp(scale, 0.0, 1.0);
  return baseUv + offset * scale;
}

float uvHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float fogAmountAtUv(vec2 uv) {
  float terrainHeight = texture(uHeight, uv).r;
  float heightDelta = max(0.0, uCameraHeightNorm - terrainHeight);
  float adjustedDelta = max(0.0, heightDelta - uFogStartOffset);
  float fogBase = smoothstep(0.02, 0.92, adjustedDelta);
  return pow(clamp(fogBase, 0.0, 1.0), max(0.05, uFogFalloff));
}

float fogAlphaFromAmount(float fogAmount) {
  float fogMin = min(uFogMinAlpha, uFogMaxAlpha);
  float fogMax = max(uFogMinAlpha, uFogMaxAlpha);
  return mix(fogMin, fogMax, clamp(fogAmount, 0.0, 1.0));
}

float cloudMaskAtUv(vec2 uv, float timeSec, vec3 sunDir) {
  if (uUseClouds < 0.5 || uCloudOpacity <= 0.0001) return 0.0;
  float cloudScale = max(0.05, uCloudScale);
  float soft = max(0.001, uCloudSoftness);
  float threshold = clamp(uCloudCoverage, 0.0, 1.0);
  vec2 sunShift = vec2(0.0);
  if (uCloudUseSunProjection > 0.5) {
    float sunZ = max(0.12, sunDir.z);
    sunShift = -sunDir.xy / sunZ * (uCloudSunParallax * 0.03);
  }
  vec2 cloudUvA = fract((uv + sunShift + vec2(timeSec * uCloudSpeed1, timeSec * uCloudSpeed1 * 0.63)) * cloudScale);
  vec2 cloudUvB = fract((uv + sunShift * 1.55 + vec2(-timeSec * uCloudSpeed2 * 0.74, timeSec * uCloudSpeed2)) * (cloudScale * 1.93));
  float noiseA = texture(uCloudNoiseTex, cloudUvA).r;
  float noiseB = texture(uCloudNoiseTex, cloudUvB).r;
  float maskA = smoothstep(threshold - soft, threshold + soft, noiseA);
  float maskB = smoothstep(threshold - soft, threshold + soft, noiseB);
  return clamp(maskA * 0.66 + maskB * 0.34, 0.0, 1.0);
}

vec3 applyWaterFx(vec2 uv, vec3 baseLit, vec3 terrainN, float timeSec, float sunVisibility) {
  if (uUseWaterFx < 0.5) return baseLit;
  // Lock water evaluation to terrain texel centers so each map pixel gets one water result.
  vec2 waterUv = (floor(uv / uMapTexelSize) + vec2(0.5)) * uMapTexelSize;
  waterUv = clamp(waterUv, vec2(0.0), vec2(1.0));
  float waterRaw = texture(uWater, waterUv).r;
  float waterMask = smoothstep(0.46, 0.54, waterRaw);
  if (waterMask <= 0.0001) return baseLit;

  vec2 flowDir = normalize(uWaterFlowDir);
  if (uWaterFlowDownhill > 0.5) {
    vec2 mapDir = texture(uFlowMap, waterUv).xy * 2.0 - 1.0;
    float mapLen = length(mapDir);
    float hL = texture(uHeight, clamp(waterUv - vec2(uMapTexelSize.x, 0.0), vec2(0.0), vec2(1.0))).r;
    float hR = texture(uHeight, clamp(waterUv + vec2(uMapTexelSize.x, 0.0), vec2(0.0), vec2(1.0))).r;
    float hD = texture(uHeight, clamp(waterUv - vec2(0.0, uMapTexelSize.y), vec2(0.0), vec2(1.0))).r;
    float hU = texture(uHeight, clamp(waterUv + vec2(0.0, uMapTexelSize.y), vec2(0.0), vec2(1.0))).r;
    vec2 localDir = vec2(0.0);
    float localLen = length(vec2(hR - hL, hU - hD));
    if (localLen > 0.00002) {
      localDir = normalize(-vec2(hR - hL, hU - hD));
    }

    // In downhill mode, do not seed direction from the fixed-direction slider.
    if (mapLen > 0.00002 && localLen > 0.00002) {
      flowDir = normalize(mix(mapDir / mapLen, localDir, clamp(uWaterLocalFlowMix, 0.0, 1.0)));
    } else if (localLen > 0.00002) {
      flowDir = localDir;
    } else if (mapLen > 0.00002) {
      flowDir = mapDir / mapLen;
    } else {
      flowDir = vec2(0.0, 1.0);
    }
    if (uWaterFlowInvertDownhill > 0.5) {
      flowDir = -flowDir;
    }
  }

  float flowScale = max(0.05, uWaterFlowScale);
  float flowSpeed = max(0.0, uWaterFlowSpeed);
  float downhillBoost = (uWaterFlowDownhill > 0.5) ? max(0.0, uWaterDownhillBoost) : 1.0;
  float flowStrength = uWaterFlowStrength * downhillBoost;
  vec2 flowOffset = flowDir * (timeSec * flowSpeed * 0.045);
  vec2 sideDir = vec2(-flowDir.y, flowDir.x);
  float nA = texture(uCloudNoiseTex, fract(waterUv * flowScale + flowOffset)).r;
  float nB = texture(uCloudNoiseTex, fract(waterUv * (flowScale * 1.73) + sideDir * 0.29 - flowOffset * 1.31)).r;
  float nC = texture(uCloudNoiseTex, fract(waterUv * (flowScale * 3.4) + flowOffset * 2.2)).r;
  float shimmer = ((nA * 0.5 + nB * 0.35 + nC * 0.15) - 0.5) * 2.0;

  float alongCoord = dot(waterUv * (flowScale * 2.1), flowDir);
  float lineWave = 0.5 + 0.5 * sin(alongCoord * 48.0 + timeSec * flowSpeed * 6.0 + (nB - 0.5) * 5.0);
  float flowLines = smoothstep(0.58, 0.96, lineWave * 0.7 + nA * 0.3);

  vec3 waterN = normalize(vec3(
    terrainN.x + shimmer * flowStrength * 1.9,
    terrainN.y + (nB - 0.5) * flowStrength * 1.6,
    max(0.05, terrainN.z)
  ));

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVecSun = normalize(uSunDir + viewDir);
  float glintPow = mix(14.0, 190.0, clamp(uWaterGlintSharpness, 0.0, 1.0));
  float sunGlintCore = pow(max(dot(waterN, halfVecSun), 0.0), glintPow);
  float lowSunBoost = pow(1.0 - clamp(uSunDir.z, 0.0, 1.0), 0.6);
  float sunGlint = sunGlintCore * uWaterGlintStrength * lowSunBoost * max(0.0, uSunStrength) * sunVisibility;

  vec3 halfVecMoon = normalize(uMoonDir + viewDir);
  float moonGlintCore = pow(max(dot(waterN, halfVecMoon), 0.0), mix(20.0, 120.0, clamp(uWaterGlintSharpness, 0.0, 1.0)));
  float moonGlint = moonGlintCore * (uWaterGlintStrength * 0.16) * max(0.0, uMoonStrength);

  float hEdge = abs(texture(uWater, clamp(waterUv - vec2(uMapTexelSize.x * uWaterShoreWidth, 0.0), vec2(0.0), vec2(1.0))).r - waterRaw);
  float vEdge = abs(texture(uWater, clamp(waterUv - vec2(0.0, uMapTexelSize.y * uWaterShoreWidth), vec2(0.0), vec2(1.0))).r - waterRaw);
  float shoreline = smoothstep(0.02, 0.33, max(hEdge, vEdge)) * waterMask;
  float foamPulse = 0.45 + 0.55 * (0.5 + 0.5 * sin(timeSec * (2.2 + flowSpeed * 1.6) + nC * 6.2831853));
  float foam = shoreline * uWaterShoreFoamStrength * foamPulse;

  float fakeFresnel = 0.10 + 0.55 * (1.0 - clamp(waterN.z, 0.0, 1.0));
  vec3 reflection = uSkyColor * uWaterReflectivity * (0.24 + 0.76 * fakeFresnel);
  vec3 flowTint = vec3(shimmer * uWaterShimmerStrength * 0.55 + flowLines * flowStrength * 0.35);
  vec3 glintColor = mix(uSunColor, vec3(1.0), 0.35) * sunGlint + uMoonColor * moonGlint;
  vec3 shoreFoamColor = vec3(0.78, 0.86, 0.92) * foam;

  vec3 waterLit = baseLit;
  waterLit = waterLit + flowTint + reflection + glintColor + shoreFoamColor;
  waterLit = mix(waterLit, waterLit * uWaterTintColor, clamp(uWaterTintStrength, 0.0, 1.0));
  if (uWaterFlowDebug > 0.5) {
    vec3 debugColor = vec3(0.5 + 0.5 * flowDir.x, 0.5 + 0.5 * flowDir.y, 0.22 + 0.78 * flowLines);
    return mix(baseLit, debugColor, waterMask);
  }
  return mix(baseLit, waterLit, waterMask);
}

vec3 computeVolumetricScattering(vec2 uv, float timeSec, float sunVisibility) {
  if (uUseVolumetric < 0.5 || uVolumetricStrength <= 0.0001 || sunVisibility <= 0.0001) return vec3(0.0);
  float sunPlanarLen = length(uSunDir.xy);
  if (sunPlanarLen < 0.0001) return vec3(0.0);
  float sunLateral = clamp(sunPlanarLen, 0.0, 1.0);
  float altitudeStretch = mix(0.18, 1.0, pow(sunLateral, 0.85));
  float altitudeScatterGain = mix(0.22, 1.0, pow(sunLateral, 0.65));
  float sampleCount = max(1.0, floor(clamp(uVolumetricSamples, 4.0, 24.0) + 0.5));
  vec2 rayDir = -uSunDir.xy / sunPlanarLen;
  float rayLengthPx = clamp(uVolumetricLength * altitudeStretch, 2.0, 160.0);
  vec2 rayStepUv = rayDir * uMapTexelSize * (rayLengthPx / sampleCount);
  float g = clamp(uVolumetricAnisotropy, 0.0, 0.95);
  float cosTheta = clamp(uSunDir.z, 0.0, 1.0);
  float phaseDenom = pow(max(0.001, 1.0 + g * g - 2.0 * g * cosTheta), 1.5);
  float phase = (1.0 - g * g) / phaseDenom;
  float extinctionScale = 0.08;
  float accum = 0.0;
  float transmittance = 1.0;
  for (int i = 0; i < 24; i++) {
    if (float(i) >= sampleCount) break;
    vec2 sampleUv = uv + rayStepUv * (float(i) + 1.0);
    if (sampleUv.x <= 0.0 || sampleUv.y <= 0.0 || sampleUv.x >= 1.0 || sampleUv.y >= 1.0) break;
    float fogAmount = fogAmountAtUv(sampleUv);
    float fogAlpha = fogAlphaFromAmount(fogAmount);
    float localDensity = clamp(fogAlpha * uVolumetricDensity, 0.0, 1.5);
    if (localDensity <= 0.0001) continue;
    float localCloudMask = cloudMaskAtUv(sampleUv, timeSec, uSunDir);
    float localSun = 1.0 - localCloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility;
    float scatter = localSun * localDensity * phase;
    accum += transmittance * scatter;
    transmittance *= exp(-localDensity * extinctionScale);
    if (transmittance <= 0.0005) break;
  }
  vec3 scatterColor = mix(uFogColor, uSunColor, 0.72);
  float scatterEnergy = accum * uVolumetricStrength * altitudeScatterGain * 0.16;
  float compressedEnergy = scatterEnergy / (1.0 + scatterEnergy * 1.85);
  return scatterColor * compressedEnergy;
}

void main() {
  vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  vec2 world = uPanWorld + ndc * uViewHalfExtents;
  vec2 baseUv = vec2(world.x / uMapAspect + 0.5, world.y + 0.5);

  if (baseUv.x < 0.0 || baseUv.y < 0.0 || baseUv.x > 1.0 || baseUv.y > 1.0) {
    outColor = vec4(0.02, 0.025, 0.03, 1.0);
    return;
  }

  vec2 focalUv = vec2(uPanWorld.x / uMapAspect + 0.5, uPanWorld.y + 0.5);
  vec2 uv = fitUvOffsetToBounds(baseUv, applyParallax(baseUv, focalUv));

  vec3 base = texture(uSplat, uv).rgb;
  vec3 n = texture(uNormals, uv).xyz * 2.0 - 1.0;
  n = normalize(n);

  float sunDiffuse = max(dot(n, uSunDir), 0.0);
  float moonDiffuse = max(dot(n, uMoonDir), 0.0);
  vec2 shadowSample = texture(uShadowTex, uv).rg;
  float sunShadow = (uUseShadows > 0.5 && sunDiffuse > 0.0001 && uSunStrength > 0.0001) ? shadowSample.r : 1.0;
  float moonShadow = (uUseShadows > 0.5 && moonDiffuse > 0.0001 && uMoonStrength > 0.0001) ? shadowSample.g : 1.0;

  vec3 ambientLit = base * (uAmbient * uAmbientColor);
  vec3 sunLit = base * (sunDiffuse * sunShadow * uSunStrength) * uSunColor;
  vec3 moonLit = base * (moonDiffuse * moonShadow * uMoonStrength) * uMoonColor;
  vec4 pointLightSample = texture(uPointLightTex, uv);
  vec3 pointLightIntensity = pointLightSample.rgb;
  float packedFlicker = floor(pointLightSample.a * 255.0 + 0.5);
  float pointFlickerMask = floor(packedFlicker / 16.0) / 15.0;
  float pointFlickerSpeedLocal = 0.35 + 2.65 * (mod(packedFlicker, 16.0) / 15.0);
  float pointFlickerFactor = 1.0;
  if (uPointFlickerEnabled > 0.5 && pointFlickerMask > 0.0001 && uPointFlickerStrength > 0.0001) {
    float phase = uvHash(uv * 809.3) * 6.2831853 * max(0.0, uPointFlickerSpatial);
    float t = max(0.0, uTimeSec) * max(0.01, uPointFlickerSpeed) * pointFlickerSpeedLocal;
    float waveA = 0.5 + 0.5 * sin(t * 6.2831853 + phase);
    float waveB = 0.5 + 0.5 * sin(t * 11.3097336 + phase * 1.618);
    float wave = clamp(waveA * 0.65 + waveB * 0.35, 0.0, 1.0);
    pointFlickerFactor = 1.0 - clamp(uPointFlickerStrength * pointFlickerMask * wave, 0.0, 0.98);
  }
  vec3 pointLit = base * (pointLightIntensity * pointFlickerFactor);
  vec3 cursorLit = vec3(0.0);
  if (uUseCursorLight > 0.5 && uCursorLightStrength > 0.001) {
    vec2 deltaPx = (uCursorLightUv - uv) * uCursorLightMapSize;
    float distPx = length(deltaPx);
    float atten = max(0.0, 1.0 - distPx / uCursorLightStrength);
    if (atten > 0.0) {
      float dz = max(1.5, uCursorLightStrength * 0.2);
      if (uUseCursorTerrainHeight > 0.5) {
        float surfaceHeight = readHeight(uv);
        float lightGroundHeight = readHeight(uCursorLightUv);
        float lightHeight = lightGroundHeight + uCursorLightHeightOffset;
        dz = max(0.5, lightHeight - surfaceHeight);
      }
      vec3 toCursorLight = normalize(vec3(deltaPx, dz));
      float cursorDiffuse = max(dot(n, toCursorLight), 0.0);
      cursorLit = base * (atten * cursorDiffuse) * uCursorLightColor;
    }
  }
  vec3 lit = clamp(ambientLit + sunLit + moonLit + pointLit + cursorLit, 0.0, 1.0);
  float timeSec = max(0.0, uTimeSec);
  float sunVisibility = smoothstep(-0.04, 0.15, uSunDir.z);

  if (sunVisibility > 0.0001) {
    float cloudMask = cloudMaskAtUv(uv, timeSec, uSunDir);
    float cloudShade = 1.0 - (cloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility);
    lit *= cloudShade;
  }

  lit = applyWaterFx(uv, lit, n, timeSec, sunVisibility);

  float fogAmount = fogAmountAtUv(uv);
  float fogAlpha = fogAlphaFromAmount(fogAmount);
  vec3 volumetricScatter = computeVolumetricScattering(uv, timeSec, sunVisibility);

  if (uUseFog > 0.5) {
    lit = mix(lit, uFogColor, fogAlpha);
  }

  lit = clamp(lit + volumetricScatter * (1.0 - lit), 0.0, 1.0);
  outColor = vec4(lit, 1.0);
}`;

const SWARM_VERT_SRC = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aMapPos;
layout(location = 1) in float aAgentType;
layout(location = 2) in float aSunShadow;
layout(location = 3) in float aMoonShadow;

uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform float uMapAspect;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;

out vec2 vUv;
out float vSwarmZ;
flat out float vAgentType;
out float vSunShadow;
out float vMoonShadow;

void main() {
  vec2 uv = vec2(
    (aMapPos.x + 0.5) / max(1.0, uMapSize.x),
    1.0 - (aMapPos.y + 0.5) / max(1.0, uMapSize.y)
  );
  vec2 world = vec2((uv.x - 0.5) * uMapAspect, uv.y - 0.5);
  vec2 ndc = (world - uPanWorld) / uViewHalfExtents;
  gl_Position = vec4(ndc, 0.0, 1.0);
  float pxPerWorldX = uResolution.x / max(0.001, (2.0 * uViewHalfExtents.x));
  float pxPerWorldY = uResolution.y / max(0.001, (2.0 * uViewHalfExtents.y));
  float texelWorldX = uMapAspect / max(1.0, uMapSize.x);
  float texelWorldY = 1.0 / max(1.0, uMapSize.y);
  gl_PointSize = max(1.0, max(texelWorldX * pxPerWorldX, texelWorldY * pxPerWorldY));
  vUv = uv;
  vSwarmZ = aMapPos.z;
  vAgentType = aAgentType;
  vSunShadow = aSunShadow;
  vMoonShadow = aMoonShadow;
}`;

const SWARM_FRAG_SRC = `#version 300 es
precision highp float;

out vec4 outColor;

uniform sampler2D uNormals;
uniform sampler2D uHeight;
uniform sampler2D uPointLightTex;
uniform sampler2D uCloudNoiseTex;

uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunStrength;
uniform vec3 uMoonDir;
uniform vec3 uMoonColor;
uniform float uMoonStrength;
uniform vec3 uAmbientColor;
uniform float uAmbient;

uniform float uUseShadows;
uniform float uUseFog;
uniform vec3 uFogColor;
uniform float uFogMinAlpha;
uniform float uFogMaxAlpha;
uniform float uFogFalloff;
uniform float uFogStartOffset;
uniform float uCameraHeightNorm;
uniform float uUseVolumetric;
uniform float uVolumetricStrength;
uniform float uVolumetricDensity;
uniform float uVolumetricAnisotropy;
uniform float uVolumetricLength;
uniform float uVolumetricSamples;
uniform float uMapAspect;
uniform vec2 uMapTexelSize;
uniform float uTimeSec;
uniform float uPointFlickerEnabled;
uniform float uPointFlickerStrength;
uniform float uPointFlickerSpeed;
uniform float uPointFlickerSpatial;
uniform float uUseClouds;
uniform float uCloudCoverage;
uniform float uCloudSoftness;
uniform float uCloudOpacity;
uniform float uCloudScale;
uniform float uCloudSpeed1;
uniform float uCloudSpeed2;
uniform float uCloudSunParallax;
uniform float uCloudUseSunProjection;
uniform vec3 uHawkColor;
uniform float uSwarmHeightMax;
uniform float uPointLightEdgeMin;
uniform float uSwarmAlpha;

in vec2 vUv;
in float vSwarmZ;
flat in float vAgentType;
in float vSunShadow;
in float vMoonShadow;

float uvHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float fogAmountAtUv(vec2 uv) {
  float terrainHeight = texture(uHeight, uv).r;
  float heightDelta = max(0.0, uCameraHeightNorm - terrainHeight);
  float adjustedDelta = max(0.0, heightDelta - uFogStartOffset);
  float fogBase = smoothstep(0.02, 0.92, adjustedDelta);
  return pow(clamp(fogBase, 0.0, 1.0), max(0.05, uFogFalloff));
}

float fogAlphaFromAmount(float fogAmount) {
  float fogMin = min(uFogMinAlpha, uFogMaxAlpha);
  float fogMax = max(uFogMinAlpha, uFogMaxAlpha);
  return mix(fogMin, fogMax, clamp(fogAmount, 0.0, 1.0));
}

float cloudMaskAtUv(vec2 uv, float timeSec, vec3 sunDir) {
  if (uUseClouds < 0.5 || uCloudOpacity <= 0.0001) return 0.0;
  float cloudScale = max(0.05, uCloudScale);
  float soft = max(0.001, uCloudSoftness);
  float threshold = clamp(uCloudCoverage, 0.0, 1.0);
  vec2 sunShift = vec2(0.0);
  if (uCloudUseSunProjection > 0.5) {
    float sunZ = max(0.12, sunDir.z);
    sunShift = -sunDir.xy / sunZ * (uCloudSunParallax * 0.03);
  }
  vec2 cloudUvA = fract((uv + sunShift + vec2(timeSec * uCloudSpeed1, timeSec * uCloudSpeed1 * 0.63)) * cloudScale);
  vec2 cloudUvB = fract((uv + sunShift * 1.55 + vec2(-timeSec * uCloudSpeed2 * 0.74, timeSec * uCloudSpeed2)) * (cloudScale * 1.93));
  float noiseA = texture(uCloudNoiseTex, cloudUvA).r;
  float noiseB = texture(uCloudNoiseTex, cloudUvB).r;
  float maskA = smoothstep(threshold - soft, threshold + soft, noiseA);
  float maskB = smoothstep(threshold - soft, threshold + soft, noiseB);
  return clamp(maskA * 0.66 + maskB * 0.34, 0.0, 1.0);
}

vec3 computeVolumetricScattering(vec2 uv, float timeSec, float sunVisibility) {
  if (uUseVolumetric < 0.5 || uVolumetricStrength <= 0.0001 || sunVisibility <= 0.0001) return vec3(0.0);
  float sunPlanarLen = length(uSunDir.xy);
  if (sunPlanarLen < 0.0001) return vec3(0.0);
  float sunLateral = clamp(sunPlanarLen, 0.0, 1.0);
  float altitudeStretch = mix(0.18, 1.0, pow(sunLateral, 0.85));
  float altitudeScatterGain = mix(0.22, 1.0, pow(sunLateral, 0.65));
  float sampleCount = max(1.0, floor(clamp(uVolumetricSamples, 4.0, 24.0) + 0.5));
  vec2 rayDir = -uSunDir.xy / sunPlanarLen;
  float rayLengthPx = clamp(uVolumetricLength * altitudeStretch, 2.0, 160.0);
  vec2 rayStepUv = rayDir * uMapTexelSize * (rayLengthPx / sampleCount);
  float g = clamp(uVolumetricAnisotropy, 0.0, 0.95);
  float cosTheta = clamp(uSunDir.z, 0.0, 1.0);
  float phaseDenom = pow(max(0.001, 1.0 + g * g - 2.0 * g * cosTheta), 1.5);
  float phase = (1.0 - g * g) / phaseDenom;
  float extinctionScale = 0.08;
  float accum = 0.0;
  float transmittance = 1.0;
  for (int i = 0; i < 24; i++) {
    if (float(i) >= sampleCount) break;
    vec2 sampleUv = uv + rayStepUv * (float(i) + 1.0);
    if (sampleUv.x <= 0.0 || sampleUv.y <= 0.0 || sampleUv.x >= 1.0 || sampleUv.y >= 1.0) break;
    float fogAmount = fogAmountAtUv(sampleUv);
    float fogAlpha = fogAlphaFromAmount(fogAmount);
    float localDensity = clamp(fogAlpha * uVolumetricDensity, 0.0, 1.5);
    if (localDensity <= 0.0001) continue;
    float localCloudMask = cloudMaskAtUv(sampleUv, timeSec, uSunDir);
    float localSun = 1.0 - localCloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility;
    float scatter = localSun * localDensity * phase;
    accum += transmittance * scatter;
    transmittance *= exp(-localDensity * extinctionScale);
    if (transmittance <= 0.0005) break;
  }
  vec3 scatterColor = mix(uFogColor, uSunColor, 0.72);
  float scatterEnergy = accum * uVolumetricStrength * altitudeScatterGain * 0.16;
  float compressedEnergy = scatterEnergy / (1.0 + scatterEnergy * 1.85);
  return scatterColor * compressedEnergy;
}

void main() {
  vec3 base = (vAgentType > 0.5)
    ? uHawkColor
    : vec3(clamp(0.28 + (vSwarmZ / max(1.0, uSwarmHeightMax)) * 0.72, 0.0, 1.0));
  // Swarm agents are airborne markers, so use a stable normal instead of terrain normals.
  vec3 n = vec3(0.0, 0.0, 1.0);

  float sunDiffuse = max(dot(n, uSunDir), 0.0);
  float moonDiffuse = max(dot(n, uMoonDir), 0.0);
  float sunShadow = (uUseShadows > 0.5 && sunDiffuse > 0.0001 && uSunStrength > 0.0001) ? vSunShadow : 1.0;
  float moonShadow = (uUseShadows > 0.5 && moonDiffuse > 0.0001 && uMoonStrength > 0.0001) ? vMoonShadow : 1.0;

  vec3 ambientLit = base * (uAmbient * uAmbientColor);
  vec3 sunLit = base * (sunDiffuse * sunShadow * uSunStrength) * uSunColor;
  vec3 moonLit = base * (moonDiffuse * moonShadow * uMoonStrength) * uMoonColor;
  vec4 pointLightSample = texture(uPointLightTex, vUv);
  vec3 pointLightIntensity = pointLightSample.rgb;
  float packedFlicker = floor(pointLightSample.a * 255.0 + 0.5);
  float pointFlickerMask = floor(packedFlicker / 16.0) / 15.0;
  float pointFlickerSpeedLocal = 0.35 + 2.65 * (mod(packedFlicker, 16.0) / 15.0);
  float pointFlickerFactor = 1.0;
  if (uPointFlickerEnabled > 0.5 && pointFlickerMask > 0.0001 && uPointFlickerStrength > 0.0001) {
    float phase = uvHash(vUv * 809.3) * 6.2831853 * max(0.0, uPointFlickerSpatial);
    float t = max(0.0, uTimeSec) * max(0.01, uPointFlickerSpeed) * pointFlickerSpeedLocal;
    float waveA = 0.5 + 0.5 * sin(t * 6.2831853 + phase);
    float waveB = 0.5 + 0.5 * sin(t * 11.3097336 + phase * 1.618);
    float wave = clamp(waveA * 0.65 + waveB * 0.35, 0.0, 1.0);
    pointFlickerFactor = 1.0 - clamp(uPointFlickerStrength * pointFlickerMask * wave, 0.0, 0.98);
  }

  // Height-aware point-light attenuation for swarm:
  // brightness (0..255) is treated as vertical reach from terrain height to agent height.
  float brightnessRange = max(pointLightIntensity.r, max(pointLightIntensity.g, pointLightIntensity.b)) * 255.0;
  float terrainHeight = texture(uHeight, vUv).r * uSwarmHeightMax;
  float aboveTerrain = max(0.0, vSwarmZ - terrainHeight);
  float withinReach = step(aboveTerrain, brightnessRange);
  float rangeNorm = aboveTerrain / max(0.001, brightnessRange);
  float rangeFalloff = 1.0 - clamp(rangeNorm, 0.0, 1.0);
  float pointHeightAtten = withinReach * (uPointLightEdgeMin + (1.0 - uPointLightEdgeMin) * rangeFalloff);

  vec3 pointLit = base * (pointLightIntensity * pointFlickerFactor * pointHeightAtten);
  vec3 lit = clamp(ambientLit + sunLit + moonLit + pointLit, 0.0, 1.0);
  float timeSec = max(0.0, uTimeSec);
  float sunVisibility = smoothstep(-0.04, 0.15, uSunDir.z);
  if (sunVisibility > 0.0001) {
    float cloudMask = cloudMaskAtUv(vUv, timeSec, uSunDir);
    float cloudShade = 1.0 - (cloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility);
    lit *= cloudShade;
  }

  float fogAmount = fogAmountAtUv(vUv);
  float fogAlpha = fogAlphaFromAmount(fogAmount);
  vec3 volumetricScatter = computeVolumetricScattering(vUv, timeSec, sunVisibility);
  if (uUseFog > 0.5) {
    lit = mix(lit, uFogColor, fogAlpha);
  }
  lit = clamp(lit + volumetricScatter * (1.0 - lit), 0.0, 1.0);
  outColor = vec4(lit, uSwarmAlpha);
}`;

const SHADOW_FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uHeight;
uniform vec2 uMapTexelSize;
uniform vec2 uShadowResolution;
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform float uHeightScale;
uniform float uShadowStrength;
uniform float uUseShadows;

float readHeight(vec2 uv) {
  return texture(uHeight, uv).r * uHeightScale;
}

float calcShadow(vec2 uv, vec3 lightDir) {
  if (uUseShadows < 0.5) return 1.0;
  if (lightDir.z <= 0.01) return 0.0;
  float dirLen = length(lightDir.xy);
  if (dirLen < 0.0001) return 1.0;
  vec2 dir2 = lightDir.xy / dirLen;
  float h0 = readHeight(uv);
  float slope = lightDir.z / max(dirLen, 0.0001);
  float bias = 0.7;
  float stepPixels = 1.5;
  vec2 stepUv = dir2 * uMapTexelSize * stepPixels;
  vec2 p = uv;
  float traveledPixels = 0.0;
  for (int i = 0; i < 120; i++) {
    p += stepUv;
    traveledPixels += stepPixels;
    if (p.x <= 0.0 || p.y <= 0.0 || p.x >= 1.0 || p.y >= 1.0) {
      break;
    }
    float h = readHeight(p);
    float rayH = h0 + slope * traveledPixels;
    if (h > rayH + bias) {
      return 1.0 - uShadowStrength;
    }
  }
  return 1.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uShadowResolution;
  float sunShadow = calcShadow(uv, uSunDir);
  float moonShadow = calcShadow(uv, uMoonDir);
  outColor = vec4(sunShadow, moonShadow, 0.0, 1.0);
}`;

const SHADOW_BLUR_FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uShadowRawTex;
uniform vec2 uShadowResolution;
uniform float uBlurRadiusPx;

void main() {
  vec2 uv = gl_FragCoord.xy / uShadowResolution;
  float radius = max(0.0, uBlurRadiusPx);
  if (radius <= 0.001) {
    outColor = texture(uShadowRawTex, uv);
    return;
  }

  vec2 texel = vec2(1.0) / uShadowResolution;
  vec2 offset = texel * radius;
  vec2 sum = vec2(0.0);
  float weight = 0.0;

  float centerW = 0.36;
  sum += texture(uShadowRawTex, uv).rg * centerW;
  weight += centerW;

  float axisW = 0.14;
  sum += texture(uShadowRawTex, clamp(uv + vec2(offset.x, 0.0), vec2(0.0), vec2(1.0))).rg * axisW;
  sum += texture(uShadowRawTex, clamp(uv - vec2(offset.x, 0.0), vec2(0.0), vec2(1.0))).rg * axisW;
  sum += texture(uShadowRawTex, clamp(uv + vec2(0.0, offset.y), vec2(0.0), vec2(1.0))).rg * axisW;
  sum += texture(uShadowRawTex, clamp(uv - vec2(0.0, offset.y), vec2(0.0), vec2(1.0))).rg * axisW;
  weight += axisW * 4.0;

  if (radius >= 1.6) {
    float diagW = 0.02;
    sum += texture(uShadowRawTex, clamp(uv + vec2(offset.x, offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    sum += texture(uShadowRawTex, clamp(uv + vec2(-offset.x, offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    sum += texture(uShadowRawTex, clamp(uv + vec2(offset.x, -offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    sum += texture(uShadowRawTex, clamp(uv + vec2(-offset.x, -offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    weight += diagW * 4.0;
  }

  vec2 blurred = sum / max(0.0001, weight);
  outColor = vec4(blurred, 0.0, 1.0);
}`;

function createShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Shader compilation failed.");
  }
  return shader;
}

function createProgram(vsSrc, fsSrc) {
  const vs = createShader(gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "Program linking failed.");
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

function createTexture() {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function createLinearTexture() {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function uploadImageToTexture(tex, image) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function rebuildFlowMapTexture() {
  rebuildFlowMapTexturePrecompute({
    gl,
    flowMapTex,
    heightImageData,
    heightSize,
    clamp,
    settings: {
      radius1: waterFlowRadius1Input.value,
      radius2: waterFlowRadius2Input.value,
      radius3: waterFlowRadius3Input.value,
      weight1: waterFlowWeight1Input.value,
      weight2: waterFlowWeight2Input.value,
      weight3: waterFlowWeight3Input.value,
    },
  });
}

function resizeRenderTexture(tex, width, height) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Math.max(1, width), Math.max(1, height), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
}

function attachColorTexture(fbo, tex) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Framebuffer incomplete: ${status}`);
  }
}

function ensureShadowTargets() {
  const targetW = Math.max(1, Math.floor(heightSize.width * SHADOW_MAP_SCALE));
  const targetH = Math.max(1, Math.floor(heightSize.height * SHADOW_MAP_SCALE));
  if (shadowSize.width === targetW && shadowSize.height === targetH) {
    return;
  }
  shadowSize.width = targetW;
  shadowSize.height = targetH;
  resizeRenderTexture(shadowRawTex, targetW, targetH);
  resizeRenderTexture(shadowBlurTex, targetW, targetH);
  attachColorTexture(shadowRawFbo, shadowRawTex);
  attachColorTexture(shadowBlurFbo, shadowBlurTex);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderShadowPipeline(params) {
  ensureShadowTargets();
  gl.disable(gl.BLEND);
  gl.viewport(0, 0, shadowSize.width, shadowSize.height);

  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowRawFbo);
  gl.useProgram(shadowProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, heightTex);
  gl.uniform1i(shadowUniforms.uHeight, 0);
  gl.uniform2f(shadowUniforms.uMapTexelSize, 1 / heightSize.width, 1 / heightSize.height);
  gl.uniform2f(shadowUniforms.uShadowResolution, shadowSize.width, shadowSize.height);
  gl.uniform3f(shadowUniforms.uSunDir, params.sunDir[0], params.sunDir[1], params.sunDir[2]);
  gl.uniform3f(shadowUniforms.uMoonDir, params.moonDir[0], params.moonDir[1], params.moonDir[2]);
  gl.uniform1f(shadowUniforms.uHeightScale, Number(heightScaleInput.value));
  gl.uniform1f(shadowUniforms.uShadowStrength, Number(shadowStrengthInput.value));
  gl.uniform1f(shadowUniforms.uUseShadows, shadowsToggle.checked ? 1 : 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function fract(v) {
  return v - Math.floor(v);
}

function valueNoise2D(x, y, seed) {
  const n = Math.sin((x + seed * 17.13) * 127.1 + (y + seed * 31.7) * 311.7) * 43758.5453123;
  return fract(n);
}

function wrapInt(value, period) {
  const p = Math.max(1, Math.floor(period));
  const v = Math.floor(value) % p;
  return v < 0 ? v + p : v;
}

function periodicValueNoise2D(ix, iy, period, seed) {
  return valueNoise2D(wrapInt(ix, period), wrapInt(iy, period), seed);
}

function smoothPeriodicValueNoise2D(x, y, period, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const n00 = periodicValueNoise2D(x0, y0, period, seed);
  const n10 = periodicValueNoise2D(x0 + 1, y0, period, seed);
  const n01 = periodicValueNoise2D(x0, y0 + 1, period, seed);
  const n11 = periodicValueNoise2D(x0 + 1, y0 + 1, period, seed);
  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;
}

function createCloudNoiseImage(size = 128) {
  const imageData = new ImageData(size, size);
  const data = imageData.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let f = 0;
      let amp = 0.58;
      let ampSum = 0;
      for (let octave = 0; octave < 4; octave++) {
        const period = 8 * (1 << octave);
        const nx = (x / size) * period;
        const ny = (y / size) * period;
        f += smoothPeriodicValueNoise2D(nx, ny, period, 2.31 + octave * 13.7) * amp;
        ampSum += amp;
        amp *= 0.5;
      }
      const v = Math.round(clamp(f / Math.max(0.0001, ampSum), 0, 1) * 255);
      const idx = (y * size + x) * 4;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }
  return imageData;
}

function uploadCloudNoiseTexture() {
  gl.bindTexture(gl.TEXTURE_2D, cloudNoiseTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  const cloudNoiseImage = createCloudNoiseImage();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cloudNoiseImage.width, cloudNoiseImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, cloudNoiseImage.data);
}

async function loadImageFromUrl(url) {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return image;
}

async function loadImageFromFile(file) {
  const image = new Image();
  image.decoding = "async";
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  image.src = dataUrl;
  await image.decode();
  return image;
}

function normalizeMapFolderPath(path) {
  const text = String(path || "").trim();
  if (!text) return DEFAULT_MAP_FOLDER;
  return text.replace(/[\\/]+$/, "");
}

function getTauriInvoke() {
  const tauriCore = window.__TAURI__ && window.__TAURI__.core;
  if (!tauriCore || typeof tauriCore.invoke !== "function") {
    return null;
  }
  return tauriCore.invoke.bind(tauriCore);
}

const tauriInvoke = getTauriInvoke();

function isAbsoluteFsPath(path) {
  const text = String(path || "").trim();
  if (!text) return false;
  return /^[a-zA-Z]:[\\/]/.test(text) || text.startsWith("/") || text.startsWith("\\\\");
}

function joinFsPath(folder, fileName) {
  const base = String(folder || "").replace(/[\\/]+$/, "");
  if (base.includes("\\")) {
    return `${base}\\${fileName}`;
  }
  return `${base}/${fileName}`;
}

function buildMapAssetPath(folder, fileName) {
  const base = String(folder || "").replace(/[\\/]+$/, "");
  if (base.startsWith("file://")) {
    return `${base}/${fileName}`;
  }
  if (isAbsoluteFsPath(base)) {
    const normalized = base.replace(/\\/g, "/");
    if (/^[a-zA-Z]:\//.test(normalized)) {
      return `file:///${encodeURI(normalized)}/${fileName}`;
    }
    if (normalized.startsWith("//")) {
      return `file:${encodeURI(normalized)}/${fileName}`;
    }
    return `file://${encodeURI(normalized)}/${fileName}`;
  }
  return `${base}/${fileName}`;
}

async function invokeTauri(command, args) {
  if (!tauriInvoke) {
    throw new Error("Tauri invoke is unavailable in this runtime.");
  }
  return tauriInvoke(command, args);
}

function toAbsoluteFileUrl(path) {
  const normalized = String(path || "").trim().replace(/\\/g, "/");
  if (!normalized) return "";
  if (normalized.startsWith("file://")) return normalized;
  if (/^[a-zA-Z]:\//.test(normalized)) {
    return `file:///${encodeURI(normalized)}`;
  }
  if (normalized.startsWith("//")) {
    return `file:${encodeURI(normalized)}`;
  }
  return `file://${encodeURI(normalized)}`;
}

async function pickMapFolderViaTauri() {
  if (!tauriInvoke) return null;
  const selected = await invokeTauri("pick_map_folder");
  if (!selected) return null;
  return normalizeMapFolderPath(selected);
}

async function validateMapFolderViaTauri(folderPath) {
  if (!tauriInvoke || !isAbsoluteFsPath(folderPath)) {
    return { is_valid: true, missing_files: [] };
  }
  return invokeTauri("validate_map_folder", { path: folderPath });
}

async function applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage) {
  uploadImageToTexture(splatTex, splatImage);
  const sizeChanged = setSplatSizeFromImage(splatImage);
  applyMapSizeChangeIfNeeded(sizeChanged);
  resetCamera();

  uploadImageToTexture(normalsTex, normalsImage);
  setNormalsSizeFromImage(normalsImage);
  normalsImageData = extractImageData(normalsImage);

  uploadImageToTexture(heightTex, heightImage);
  setHeightSizeFromImage(heightImage);
  heightImageData = extractImageData(heightImage);
  rebuildFlowMapTexture();
  uploadImageToTexture(waterTex, waterImage);
  slopeImageData = extractImageData(slopeImage);
  waterImageData = extractImageData(waterImage);
  syncPointLightWorkerMapData();
}

function syncPointLightWorkerMapData() {
  if (!pointLightBakeWorker || !normalsImageData || !heightImageData) return;
  pointLightBakeWorker.postMessage({
    type: "setMapData",
    splatWidth: splatSize.width,
    splatHeight: splatSize.height,
    normalsWidth: normalsSize.width,
    normalsHeight: normalsSize.height,
    heightWidth: heightSize.width,
    heightHeight: heightSize.height,
    normalsData: normalsImageData.data,
    heightData: heightImageData.data,
  });
}

function getFileFromFolderSelection(files, fileName) {
  const lower = fileName.toLowerCase();
  for (const file of files) {
    if (String(file.name || "").toLowerCase() === lower) {
      return file;
    }
  }
  return null;
}

async function tryLoadJsonFromUrl(path) {
  if (tauriInvoke && isAbsoluteFsPath(path)) {
    try {
      const text = await invokeTauri("load_json_file", { path });
      return JSON.parse(text);
    } catch (error) {
      console.warn(`Tauri JSON load failed for ${path}, trying fetch fallback.`, error);
      const fileUrl = toAbsoluteFileUrl(path);
      if (fileUrl) {
        const response = await fetch(fileUrl, { cache: "no-store" });
        if (response.ok) {
          return response.json();
        }
      }
      throw error;
    }
  }
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

const SWARM_Z_MAX = 256;
const SWARM_TERRAIN_CLEARANCE = 1;
const SWARM_Z_NEIGHBOR_SCALE = 1;
const LIGHTING_SAVE_PRECISION = 2;

function serializeLightingSettingsLegacy() {
  return {
    version: 1,
    useShadows: shadowsToggle.checked,
    heightScale: Math.round(clamp(Number(heightScaleInput.value), 1, 300)),
    shadowStrength: clampRound(Number(shadowStrengthInput.value), 0, 1),
    shadowBlur: clampRound(Number(shadowBlurInput.value), 0, 3),
    ambient: clampRound(Number(ambientInput.value), 0, 1),
    diffuse: clampRound(Number(diffuseInput.value), 0, 2),
    useVolumetric: volumetricToggle.checked,
    volumetricStrength: clampRound(Number(volumetricStrengthInput.value), 0, 1),
    volumetricDensity: clampRound(Number(volumetricDensityInput.value), 0, 2),
    volumetricAnisotropy: clampRound(Number(volumetricAnisotropyInput.value), 0, 0.95),
    volumetricLength: Math.round(clamp(Number(volumetricLengthInput.value), 8, 160)),
    volumetricSamples: Math.round(clamp(Number(volumetricSamplesInput.value), 4, 24)),
    cycleHour: clampRound(Number(cycleState.hour), 0, 24),
    cycleSpeed: clampRound(Number(cycleSpeedInput.value), 0, 1),
    pointFlickerEnabled: pointFlickerToggle.checked,
    pointFlickerStrength: clampRound(Number(pointFlickerStrengthInput.value), 0, 1),
    pointFlickerSpeed: clampRound(Number(pointFlickerSpeedInput.value), 0.1, 12),
    pointFlickerSpatial: clampRound(Number(pointFlickerSpatialInput.value), 0, 4),
  };
}

function applyLightingSettingsLegacy(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useShadows === "boolean") {
    shadowsToggle.checked = data.useShadows;
  }
  if (Number.isFinite(Number(data.heightScale))) {
    heightScaleInput.value = String(clamp(Number(data.heightScale), 1, 300));
  }
  if (Number.isFinite(Number(data.shadowStrength))) {
    shadowStrengthInput.value = String(clamp(Number(data.shadowStrength), 0, 1));
  }
  if (Number.isFinite(Number(data.shadowBlur))) {
    shadowBlurInput.value = String(clamp(Number(data.shadowBlur), 0, 3));
  }
  if (Number.isFinite(Number(data.ambient))) {
    ambientInput.value = String(clamp(Number(data.ambient), 0, 1));
  }
  if (Number.isFinite(Number(data.diffuse))) {
    diffuseInput.value = String(clamp(Number(data.diffuse), 0, 2));
  }
  if (typeof data.useVolumetric === "boolean") {
    volumetricToggle.checked = data.useVolumetric;
  }
  if (Number.isFinite(Number(data.volumetricStrength))) {
    volumetricStrengthInput.value = String(clamp(Number(data.volumetricStrength), 0, 1));
  }
  if (Number.isFinite(Number(data.volumetricDensity))) {
    volumetricDensityInput.value = String(clamp(Number(data.volumetricDensity), 0, 2));
  }
  if (Number.isFinite(Number(data.volumetricAnisotropy))) {
    volumetricAnisotropyInput.value = String(clamp(Number(data.volumetricAnisotropy), 0, 0.95));
  }
  if (Number.isFinite(Number(data.volumetricLength))) {
    volumetricLengthInput.value = String(Math.round(clamp(Number(data.volumetricLength), 8, 160)));
  }
  if (Number.isFinite(Number(data.volumetricSamples))) {
    volumetricSamplesInput.value = String(Math.round(clamp(Number(data.volumetricSamples), 4, 24)));
  }
  if (Number.isFinite(Number(data.cycleHour))) {
    cycleState.hour = clamp(Number(data.cycleHour), 0, 24);
  }
  if (Number.isFinite(Number(data.cycleSpeed))) {
    cycleSpeedInput.value = String(clamp(Number(data.cycleSpeed), 0, 1));
  }
  if (typeof data.pointFlickerEnabled === "boolean") {
    pointFlickerToggle.checked = data.pointFlickerEnabled;
  }
  if (Number.isFinite(Number(data.pointFlickerStrength))) {
    pointFlickerStrengthInput.value = String(clamp(Number(data.pointFlickerStrength), 0, 1));
  }
  if (Number.isFinite(Number(data.pointFlickerSpeed))) {
    pointFlickerSpeedInput.value = String(clamp(Number(data.pointFlickerSpeed), 0.1, 12));
  }
  if (Number.isFinite(Number(data.pointFlickerSpatial))) {
    pointFlickerSpatialInput.value = String(clamp(Number(data.pointFlickerSpatial), 0, 4));
  }
  updateVolumetricLabels();
  updateVolumetricUi();
  updateShadowBlurLabel();
  updatePointFlickerLabels();
  updatePointFlickerUi();
  setCycleHourSliderFromState();
  updateCycleHourLabel();
  schedulePointLightBake();
}

function serializeFogSettingsLegacy() {
  return {
    version: 1,
    useFog: fogToggle.checked,
    fogColor: fogColorInput.value,
    fogColorManual,
    fogMinAlpha: clamp(Number(fogMinAlphaInput.value), 0, 1),
    fogMaxAlpha: clamp(Number(fogMaxAlphaInput.value), 0, 1),
    fogFalloff: clamp(Number(fogFalloffInput.value), 0.2, 4),
    fogStartOffset: clamp(Number(fogStartOffsetInput.value), 0, 1),
  };
}

function serializeParallaxSettingsLegacy() {
  return {
    version: 1,
    useParallax: parallaxToggle.checked,
    parallaxStrength: clamp(Number(parallaxStrengthInput.value), 0, 1),
    parallaxBands: Math.round(clamp(Number(parallaxBandsInput.value), 2, 256)),
  };
}

function serializeCloudSettingsLegacy() {
  return {
    version: 1,
    useClouds: cloudToggle.checked,
    cloudCoverage: clamp(Number(cloudCoverageInput.value), 0, 1),
    cloudSoftness: clamp(Number(cloudSoftnessInput.value), 0.01, 0.35),
    cloudOpacity: clamp(Number(cloudOpacityInput.value), 0, 1),
    cloudScale: clamp(Number(cloudScaleInput.value), 0.5, 8),
    cloudSpeed1: clamp(Number(cloudSpeed1Input.value), -0.3, 0.3),
    cloudSpeed2: clamp(Number(cloudSpeed2Input.value), -0.3, 0.3),
    cloudSunParallax: clamp(Number(cloudSunParallaxInput.value), 0, 2),
    cloudUseSunProjection: cloudSunProjectToggle.checked,
  };
}

function serializeWaterSettingsLegacy() {
  return {
    version: 1,
    useWaterFx: waterFxToggle.checked,
    waterFlowDownhill: waterFlowDownhillToggle.checked,
    waterFlowInvertDownhill: waterFlowInvertDownhillToggle.checked,
    waterFlowDebug: waterFlowDebugToggle.checked,
    waterFlowDirectionDeg: Math.round(clamp(Number(waterFlowDirectionInput.value), 0, 360)),
    waterLocalFlowMix: clamp(Number(waterLocalFlowMixInput.value), 0, 1),
    waterDownhillBoost: clamp(Number(waterDownhillBoostInput.value), 0, 4),
    waterFlowRadius1: Math.round(clamp(Number(waterFlowRadius1Input.value), 1, 12)),
    waterFlowRadius2: Math.round(clamp(Number(waterFlowRadius2Input.value), 1, 24)),
    waterFlowRadius3: Math.round(clamp(Number(waterFlowRadius3Input.value), 1, 40)),
    waterFlowWeight1: clamp(Number(waterFlowWeight1Input.value), 0, 1),
    waterFlowWeight2: clamp(Number(waterFlowWeight2Input.value), 0, 1),
    waterFlowWeight3: clamp(Number(waterFlowWeight3Input.value), 0, 1),
    waterFlowStrength: clamp(Number(waterFlowStrengthInput.value), 0, 0.15),
    waterFlowSpeed: clamp(Number(waterFlowSpeedInput.value), 0, 2.5),
    waterFlowScale: clamp(Number(waterFlowScaleInput.value), 0.5, 14),
    waterShimmerStrength: clamp(Number(waterShimmerStrengthInput.value), 0, 0.2),
    waterGlintStrength: clamp(Number(waterGlintStrengthInput.value), 0, 1.5),
    waterGlintSharpness: clamp(Number(waterGlintSharpnessInput.value), 0, 1),
    waterShoreFoamStrength: clamp(Number(waterShoreFoamStrengthInput.value), 0, 0.5),
    waterShoreWidth: clamp(Number(waterShoreWidthInput.value), 0.4, 6),
    waterReflectivity: clamp(Number(waterReflectivityInput.value), 0, 1),
    waterTintColor: waterTintColorInput.value,
    waterTintStrength: clamp(Number(waterTintStrengthInput.value), 0, 1),
  };
}

function serializeInteractionSettingsLegacy() {
  return {
    version: 1,
    pathfindingRange: Math.round(clamp(Number(pathfindingRangeInput.value), 30, 300)),
    pathWeightSlope: clamp(Number(pathWeightSlopeInput.value), 0, 10),
    pathWeightHeight: clamp(Number(pathWeightHeightInput.value), 0, 10),
    pathWeightWater: clamp(Number(pathWeightWaterInput.value), 0, 100),
    pathSlopeCutoff: Math.round(clamp(Number(pathSlopeCutoffInput.value), 0, 90)),
    pathBaseCost: clamp(Number(pathBaseCostInput.value), 0, 2),
    cursorLightEnabled: cursorLightModeToggle.checked,
    cursorLightFollowHeight: cursorLightFollowHeightToggle.checked,
    cursorLightColor: cursorLightColorInput.value,
    cursorLightStrength: Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200)),
    cursorLightHeightOffset: Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120)),
    cursorLightGizmo: cursorLightGizmoToggle.checked,
    pointLightLiveUpdate: pointLightLiveUpdateToggle.checked,
  };
}

function serializeNpcState() {
  return {
    version: 1,
    charID: playerState.charID,
    pixelX: playerState.pixelX,
    pixelY: playerState.pixelY,
    color: playerState.color,
  };
}

function serializeSwarmDataLegacy() {
  const settings = getSwarmSettings();
  return {
    version: 1,
    settings,
    follow: {
      enabled: swarmFollowState.enabled,
      targetType: swarmFollowState.targetType,
      agentIndex: swarmFollowState.agentIndex,
      hawkIndex: swarmFollowState.hawkIndex,
    },
    state: {
      count: swarmState.count,
      stepCount: Math.round(Math.max(0, swarmState.stepCount)),
      hawkKillIntervalSum: Math.max(0, Number(swarmState.hawkKillIntervalSum) || 0),
      hawkKillCount: Math.max(0, Math.round(Number(swarmState.hawkKillCount) || 0)),
      breedingActive: Boolean(swarmState.breedingActive),
      x: Array.from(swarmState.x),
      y: Array.from(swarmState.y),
      z: Array.from(swarmState.z),
      vx: Array.from(swarmState.vx),
      vy: Array.from(swarmState.vy),
      vz: Array.from(swarmState.vz),
      speedScale: Array.from(swarmState.speedScale),
      steerScale: Array.from(swarmState.steerScale),
      isResting: Array.from(swarmState.isResting),
      restTicksLeft: Array.from(swarmState.restTicksLeft),
      hawks: swarmState.hawks.map((hawk) => ({
        x: hawk.x,
        y: hawk.y,
        z: hawk.z,
        vx: hawk.vx,
        vy: hawk.vy,
        vz: hawk.vz,
        ax: hawk.ax,
        ay: hawk.ay,
        az: hawk.az,
        targetIndex: hawk.targetIndex,
        lastKillTick: Math.round(Math.max(0, Number(hawk.lastKillTick) || 0)),
      })),
    },
  };
}

function applySwarmSettingsLegacy(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useAgentSwarm === "boolean") swarmEnabledToggle.checked = data.useAgentSwarm;
  if (typeof data.useLitSwarm === "boolean") swarmLitModeToggle.checked = data.useLitSwarm;
  if (typeof data.followZoomBySpeed === "boolean") swarmFollowZoomToggle.checked = data.followZoomBySpeed;
  if (Number.isFinite(Number(data.followZoomIn))) swarmFollowZoomInInput.value = String(clamp(Number(data.followZoomIn), zoomMin, zoomMax));
  if (Number.isFinite(Number(data.followZoomOut))) swarmFollowZoomOutInput.value = String(clamp(Number(data.followZoomOut), zoomMin, zoomMax));
  if (typeof data.followHawkRangeGizmo === "boolean") swarmFollowHawkRangeGizmoToggle.checked = data.followHawkRangeGizmo;
  if (Number.isFinite(Number(data.followAgentSpeedSmoothing))) swarmFollowAgentSpeedSmoothingInput.value = String(clamp(Number(data.followAgentSpeedSmoothing), 0.01, 0.25));
  if (Number.isFinite(Number(data.followAgentZoomSmoothing))) swarmFollowAgentZoomSmoothingInput.value = String(clamp(Number(data.followAgentZoomSmoothing), 0.01, 0.25));
  if (typeof data.showStatsPanel === "boolean") swarmStatsPanelToggle.checked = data.showStatsPanel;
  if (typeof data.showTerrainInSwarm === "boolean") swarmShowTerrainToggle.checked = data.showTerrainInSwarm;
  if (typeof data.backgroundColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(data.backgroundColor)) {
    swarmBackgroundColorInput.value = data.backgroundColor.startsWith("#") ? data.backgroundColor : `#${data.backgroundColor}`;
  }
  if (Number.isFinite(Number(data.agentCount))) swarmAgentCountInput.value = String(Math.round(clamp(Number(data.agentCount), 100, 1000)));
  if (Number.isFinite(Number(data.simulationSpeed))) swarmUpdateIntervalInput.value = String(clamp(Number(data.simulationSpeed), 0.1, 20));
  if (Number.isFinite(Number(data.maxSpeed))) swarmMaxSpeedInput.value = String(clamp(Number(data.maxSpeed), 30, 300));
  if (Number.isFinite(Number(data.maxSteering))) swarmSteeringMaxInput.value = String(clamp(Number(data.maxSteering), 10, 500));
  if (Number.isFinite(Number(data.variationStrengthPct))) swarmVariationStrengthInput.value = String(Math.round(clamp(Number(data.variationStrengthPct), 0, 50)));
  if (Number.isFinite(Number(data.neighborRadius))) swarmNeighborRadiusInput.value = String(clamp(Number(data.neighborRadius), 10, 200));
  if (Number.isFinite(Number(data.minHeight))) swarmMinHeightInput.value = String(Math.round(clamp(Number(data.minHeight), 0, SWARM_Z_MAX)));
  if (Number.isFinite(Number(data.maxHeight))) swarmMaxHeightInput.value = String(Math.round(clamp(Number(data.maxHeight), 0, SWARM_Z_MAX)));
  if (Number.isFinite(Number(data.separationRadius))) swarmSeparationRadiusInput.value = String(clamp(Number(data.separationRadius), 6, 120));
  if (Number.isFinite(Number(data.alignmentWeight))) swarmAlignmentWeightInput.value = String(clamp(Number(data.alignmentWeight), 0, 4));
  if (Number.isFinite(Number(data.cohesionWeight))) swarmCohesionWeightInput.value = String(clamp(Number(data.cohesionWeight), 0, 4));
  if (Number.isFinite(Number(data.separationWeight))) swarmSeparationWeightInput.value = String(clamp(Number(data.separationWeight), 0, 6));
  if (Number.isFinite(Number(data.wanderWeight))) swarmWanderWeightInput.value = String(clamp(Number(data.wanderWeight), 0, 2));
  if (Number.isFinite(Number(data.restChancePct))) swarmRestChanceInput.value = String(clamp(Number(data.restChancePct), 0, 0.002));
  if (Number.isFinite(Number(data.restTicks))) swarmRestTicksInput.value = String(Math.round(clamp(Number(data.restTicks), 100, 10000)));
  if (Number.isFinite(Number(data.breedingThreshold))) swarmBreedingThresholdInput.value = String(Math.round(clamp(Number(data.breedingThreshold), 0, 1000)));
  if (Number.isFinite(Number(data.breedingSpawnChance))) swarmBreedingSpawnChanceInput.value = String(clamp(Number(data.breedingSpawnChance), 0, 1));
  if (typeof data.cursorMode === "string") swarmCursorModeInput.value = ["none", "attract", "repel"].includes(data.cursorMode) ? data.cursorMode : "none";
  if (Number.isFinite(Number(data.cursorStrength))) swarmCursorStrengthInput.value = String(clamp(Number(data.cursorStrength), 0, 8));
  if (Number.isFinite(Number(data.cursorRadius))) swarmCursorRadiusInput.value = String(clamp(Number(data.cursorRadius), 20, 260));
  if (typeof data.useHawk === "boolean") swarmHawkEnabledToggle.checked = data.useHawk;
  if (Number.isFinite(Number(data.hawkCount))) swarmHawkCountInput.value = String(Math.round(clamp(Number(data.hawkCount), 0, 20)));
  if (typeof data.hawkColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(data.hawkColor)) {
    swarmHawkColorInput.value = data.hawkColor.startsWith("#") ? data.hawkColor : `#${data.hawkColor}`;
  }
  if (Number.isFinite(Number(data.hawkSpeed))) swarmHawkSpeedInput.value = String(clamp(Number(data.hawkSpeed), 30, 420));
  if (Number.isFinite(Number(data.hawkSteering))) swarmHawkSteeringInput.value = String(clamp(Number(data.hawkSteering), 20, 700));
  if (Number.isFinite(Number(data.hawkTargetRange))) swarmHawkTargetRangeInput.value = String(Math.round(clamp(Number(data.hawkTargetRange), 20, 500)));
  const defaultFollowTarget = swarmFollowTargetInput && swarmFollowTargetInput.options && swarmFollowTargetInput.options.length > 0
    ? swarmFollowTargetInput.options[0].value
    : "agent";
  swarmFollowTargetInput.value = defaultFollowTarget;
  swarmFollowState.enabled = false;
  swarmFollowState.targetType = "";
  swarmFollowState.agentIndex = -1;
  swarmFollowState.hawkIndex = -1;
  swarmState.breedingActive = false;
  resetSwarmFollowSpeedSmoothing();
  normalizeSwarmFollowZoomInputs("out");
  normalizeSwarmHeightRangeInputs("min");
  updateSwarmLabels();
  updateSwarmUi();
  updateSwarmFollowButtonUi();
}

function applySwarmData(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  applySwarmSettings(data.settings && typeof data.settings === "object" ? data.settings : data);
  const settings = getSwarmSettings();
  const state = data.state && typeof data.state === "object" ? data.state : null;
  let loadedState = false;
  swarmState.stepCount = 0;
  swarmState.hawkKillIntervalSum = 0;
  swarmState.hawkKillCount = 0;
  swarmState.breedingActive = false;

  if (state && Number.isFinite(Number(state.count))) {
    const count = Math.round(clamp(Number(state.count), 0, 2000));
    if (count > 0 && Array.isArray(state.x) && Array.isArray(state.y) && Array.isArray(state.z) && state.x.length >= count && state.y.length >= count && state.z.length >= count) {
      ensureSwarmBuffers(count);
      const maxX = Math.max(0, splatSize.width - 1);
      const maxY = Math.max(0, splatSize.height - 1);
      const maxFlight = settings.maxHeight;
      const minFlight = settings.minHeight;
      loadedState = true;
      for (let i = 0; i < count; i++) {
        const x = clamp(Number(state.x[i]), 0, maxX);
        const y = clamp(Number(state.y[i]), 0, maxY);
        if (!isSwarmCoordFlyable(x, y, maxFlight)) {
          loadedState = false;
          break;
        }
        const minAllowedZ = Math.max(minFlight, terrainFloorAtSwarmCoord(x, y));
        swarmState.x[i] = x;
        swarmState.y[i] = y;
        swarmState.z[i] = clamp(Number(state.z[i]), minAllowedZ, maxFlight);
        swarmState.vx[i] = Number.isFinite(Number(state.vx && state.vx[i])) ? Number(state.vx[i]) : 0;
        swarmState.vy[i] = Number.isFinite(Number(state.vy && state.vy[i])) ? Number(state.vy[i]) : 0;
        swarmState.vz[i] = Number.isFinite(Number(state.vz && state.vz[i])) ? Number(state.vz[i]) : 0;
        swarmState.speedScale[i] = clamp(Number.isFinite(Number(state.speedScale && state.speedScale[i])) ? Number(state.speedScale[i]) : 1, 0.5, 1.5);
        swarmState.steerScale[i] = clamp(Number.isFinite(Number(state.steerScale && state.steerScale[i])) ? Number(state.steerScale[i]) : 1, 0.5, 1.5);
        swarmState.isResting[i] = Number(state.isResting && state.isResting[i]) ? 1 : 0;
        swarmState.restTicksLeft[i] = Math.round(clamp(Number(state.restTicksLeft && state.restTicksLeft[i]), 0, 10000));
      }
      if (loadedState) {
        swarmState.count = count;
        swarmState.stepCount = Math.max(0, Math.round(Number(state.stepCount) || 0));
        swarmState.hawkKillIntervalSum = Math.max(0, Number(state.hawkKillIntervalSum) || 0);
        swarmState.hawkKillCount = Math.max(0, Math.round(Number(state.hawkKillCount) || 0));
        swarmState.breedingActive = Boolean(state.breedingActive);
        swarmState.hawks = [];
        const hawks = Array.isArray(state.hawks) ? state.hawks : [];
        if (settings.useHawk) {
          for (const rawHawk of hawks.slice(0, 20)) {
            if (!rawHawk || typeof rawHawk !== "object") continue;
            const hx = clamp(Number(rawHawk.x), 0, maxX);
            const hy = clamp(Number(rawHawk.y), 0, maxY);
            if (!isSwarmCoordFlyable(hx, hy, maxFlight)) continue;
            const hawkMinZ = Math.max(minFlight, terrainFloorAtSwarmCoord(hx, hy));
            swarmState.hawks.push({
              x: hx,
              y: hy,
              z: clamp(Number(rawHawk.z), hawkMinZ, maxFlight),
              vx: Number.isFinite(Number(rawHawk.vx)) ? Number(rawHawk.vx) : 0,
              vy: Number.isFinite(Number(rawHawk.vy)) ? Number(rawHawk.vy) : 0,
              vz: Number.isFinite(Number(rawHawk.vz)) ? Number(rawHawk.vz) : 0,
              ax: Number.isFinite(Number(rawHawk.ax)) ? Number(rawHawk.ax) : 0,
              ay: Number.isFinite(Number(rawHawk.ay)) ? Number(rawHawk.ay) : 0,
              az: Number.isFinite(Number(rawHawk.az)) ? Number(rawHawk.az) : 0,
              targetIndex: Number.isFinite(Number(rawHawk.targetIndex))
                ? Math.round(clamp(Number(rawHawk.targetIndex), 0, Math.max(0, count - 1)))
                : chooseRandomSwarmTargetIndexNear(hx, hy, settings.hawkTargetRange),
              lastKillTick: Math.max(0, Math.round(Number(rawHawk.lastKillTick) || 0)),
            });
          }
        }
      }
    }
  }

  if (!loadedState) {
    reseedSwarmAgents(settings.agentCount);
  }

  const follow = data.follow && typeof data.follow === "object" ? data.follow : {};
  swarmFollowState.enabled = settings.useAgentSwarm && Boolean(follow.enabled);
  swarmFollowState.targetType = follow.targetType === "hawk" ? "hawk" : "agent";
  swarmFollowState.agentIndex = Number.isFinite(Number(follow.agentIndex)) ? Math.round(Number(follow.agentIndex)) : -1;
  swarmFollowState.hawkIndex = Number.isFinite(Number(follow.hawkIndex)) ? Math.round(Number(follow.hawkIndex)) : -1;
  resetSwarmFollowSpeedSmoothing();
  swarmFollowTargetInput.value = swarmFollowState.targetType;
  updateSwarmFollowButtonUi();
  requestOverlayDraw();
}

function applyFogSettingsLegacy(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useFog === "boolean") {
    fogToggle.checked = data.useFog;
  }
  if (typeof data.fogColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(data.fogColor)) {
    fogColorInput.value = data.fogColor.startsWith("#") ? data.fogColor : `#${data.fogColor}`;
  }
  fogColorManual = Boolean(data.fogColorManual);
  if (Number.isFinite(Number(data.fogMinAlpha))) {
    fogMinAlphaInput.value = String(clamp(Number(data.fogMinAlpha), 0, 1));
  }
  if (Number.isFinite(Number(data.fogMaxAlpha))) {
    fogMaxAlphaInput.value = String(clamp(Number(data.fogMaxAlpha), 0, 1));
  }
  if (Number.isFinite(Number(data.fogFalloff))) {
    fogFalloffInput.value = String(clamp(Number(data.fogFalloff), 0.2, 4));
  }
  if (Number.isFinite(Number(data.fogStartOffset))) {
    fogStartOffsetInput.value = String(clamp(Number(data.fogStartOffset), 0, 1));
  }
  updateFogAlphaLabels();
  updateFogFalloffLabel();
  updateFogStartOffsetLabel();
  updateFogUi();
}

function applyParallaxSettingsLegacy(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useParallax === "boolean") {
    parallaxToggle.checked = data.useParallax;
  }
  if (Number.isFinite(Number(data.parallaxStrength))) {
    parallaxStrengthInput.value = String(clamp(Number(data.parallaxStrength), 0, 1));
  }
  if (Number.isFinite(Number(data.parallaxBands))) {
    parallaxBandsInput.value = String(Math.round(clamp(Number(data.parallaxBands), 2, 256)));
  }
  updateParallaxStrengthLabel();
  updateParallaxBandsLabel();
  updateParallaxUi();
}

function applyCloudSettingsLegacy(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useClouds === "boolean") {
    cloudToggle.checked = data.useClouds;
  }
  if (Number.isFinite(Number(data.cloudCoverage))) {
    cloudCoverageInput.value = String(clamp(Number(data.cloudCoverage), 0, 1));
  }
  if (Number.isFinite(Number(data.cloudSoftness))) {
    cloudSoftnessInput.value = String(clamp(Number(data.cloudSoftness), 0.01, 0.35));
  }
  if (Number.isFinite(Number(data.cloudOpacity))) {
    cloudOpacityInput.value = String(clamp(Number(data.cloudOpacity), 0, 1));
  }
  if (Number.isFinite(Number(data.cloudScale))) {
    cloudScaleInput.value = String(clamp(Number(data.cloudScale), 0.5, 8));
  }
  if (Number.isFinite(Number(data.cloudSpeed1))) {
    cloudSpeed1Input.value = String(clamp(Number(data.cloudSpeed1), -0.3, 0.3));
  }
  if (Number.isFinite(Number(data.cloudSpeed2))) {
    cloudSpeed2Input.value = String(clamp(Number(data.cloudSpeed2), -0.3, 0.3));
  }
  if (Number.isFinite(Number(data.cloudSunParallax))) {
    cloudSunParallaxInput.value = String(clamp(Number(data.cloudSunParallax), 0, 2));
  }
  if (typeof data.cloudUseSunProjection === "boolean") {
    cloudSunProjectToggle.checked = data.cloudUseSunProjection;
  }
  updateCloudLabels();
  updateCloudUi();
}

function applyWaterSettingsLegacy(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useWaterFx === "boolean") {
    waterFxToggle.checked = data.useWaterFx;
  }
  if (typeof data.waterFlowDownhill === "boolean") {
    waterFlowDownhillToggle.checked = data.waterFlowDownhill;
  }
  if (typeof data.waterFlowInvertDownhill === "boolean") {
    waterFlowInvertDownhillToggle.checked = data.waterFlowInvertDownhill;
  }
  if (typeof data.waterFlowDebug === "boolean") {
    waterFlowDebugToggle.checked = data.waterFlowDebug;
  }
  if (Number.isFinite(Number(data.waterFlowDirectionDeg))) {
    waterFlowDirectionInput.value = String(Math.round(clamp(Number(data.waterFlowDirectionDeg), 0, 360)));
  }
  if (Number.isFinite(Number(data.waterLocalFlowMix))) {
    waterLocalFlowMixInput.value = String(clamp(Number(data.waterLocalFlowMix), 0, 1));
  }
  if (Number.isFinite(Number(data.waterDownhillBoost))) {
    waterDownhillBoostInput.value = String(clamp(Number(data.waterDownhillBoost), 0, 4));
  }
  if (Number.isFinite(Number(data.waterFlowRadius1))) {
    waterFlowRadius1Input.value = String(Math.round(clamp(Number(data.waterFlowRadius1), 1, 12)));
  }
  if (Number.isFinite(Number(data.waterFlowRadius2))) {
    waterFlowRadius2Input.value = String(Math.round(clamp(Number(data.waterFlowRadius2), 1, 24)));
  }
  if (Number.isFinite(Number(data.waterFlowRadius3))) {
    waterFlowRadius3Input.value = String(Math.round(clamp(Number(data.waterFlowRadius3), 1, 40)));
  }
  if (Number.isFinite(Number(data.waterFlowWeight1))) {
    waterFlowWeight1Input.value = String(clamp(Number(data.waterFlowWeight1), 0, 1));
  }
  if (Number.isFinite(Number(data.waterFlowWeight2))) {
    waterFlowWeight2Input.value = String(clamp(Number(data.waterFlowWeight2), 0, 1));
  }
  if (Number.isFinite(Number(data.waterFlowWeight3))) {
    waterFlowWeight3Input.value = String(clamp(Number(data.waterFlowWeight3), 0, 1));
  }
  if (Number.isFinite(Number(data.waterFlowStrength))) {
    waterFlowStrengthInput.value = String(clamp(Number(data.waterFlowStrength), 0, 0.15));
  }
  if (Number.isFinite(Number(data.waterFlowSpeed))) {
    waterFlowSpeedInput.value = String(clamp(Number(data.waterFlowSpeed), 0, 2.5));
  }
  if (Number.isFinite(Number(data.waterFlowScale))) {
    waterFlowScaleInput.value = String(clamp(Number(data.waterFlowScale), 0.5, 14));
  }
  if (Number.isFinite(Number(data.waterShimmerStrength))) {
    waterShimmerStrengthInput.value = String(clamp(Number(data.waterShimmerStrength), 0, 0.2));
  }
  if (Number.isFinite(Number(data.waterGlintStrength))) {
    waterGlintStrengthInput.value = String(clamp(Number(data.waterGlintStrength), 0, 1.5));
  }
  if (Number.isFinite(Number(data.waterGlintSharpness))) {
    waterGlintSharpnessInput.value = String(clamp(Number(data.waterGlintSharpness), 0, 1));
  }
  if (Number.isFinite(Number(data.waterShoreFoamStrength))) {
    waterShoreFoamStrengthInput.value = String(clamp(Number(data.waterShoreFoamStrength), 0, 0.5));
  }
  if (Number.isFinite(Number(data.waterShoreWidth))) {
    waterShoreWidthInput.value = String(clamp(Number(data.waterShoreWidth), 0.4, 6));
  }
  if (Number.isFinite(Number(data.waterReflectivity))) {
    waterReflectivityInput.value = String(clamp(Number(data.waterReflectivity), 0, 1));
  }
  if (typeof data.waterTintColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(data.waterTintColor)) {
    waterTintColorInput.value = data.waterTintColor.startsWith("#") ? data.waterTintColor : `#${data.waterTintColor}`;
  }
  if (Number.isFinite(Number(data.waterTintStrength))) {
    waterTintStrengthInput.value = String(clamp(Number(data.waterTintStrength), 0, 1));
  }
  updateWaterLabels();
  updateWaterUi();
  rebuildFlowMapTexture();
}

function applyInteractionSettingsLegacy(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (Number.isFinite(Number(data.pathfindingRange))) {
    pathfindingRangeInput.value = String(Math.round(clamp(Number(data.pathfindingRange), 30, 300)));
  }
  if (Number.isFinite(Number(data.pathWeightSlope))) {
    pathWeightSlopeInput.value = String(clamp(Number(data.pathWeightSlope), 0, 10));
  }
  if (Number.isFinite(Number(data.pathWeightHeight))) {
    pathWeightHeightInput.value = String(clamp(Number(data.pathWeightHeight), 0, 10));
  }
  if (Number.isFinite(Number(data.pathWeightWater))) {
    pathWeightWaterInput.value = String(clamp(Number(data.pathWeightWater), 0, 100));
  }
  if (Number.isFinite(Number(data.pathSlopeCutoff))) {
    pathSlopeCutoffInput.value = String(Math.round(clamp(Number(data.pathSlopeCutoff), 0, 90)));
  }
  if (Number.isFinite(Number(data.pathBaseCost))) {
    pathBaseCostInput.value = String(clamp(Number(data.pathBaseCost), 0, 2));
  }
  if (typeof data.cursorLightEnabled === "boolean") {
    cursorLightModeToggle.checked = data.cursorLightEnabled;
  }
  if (typeof data.cursorLightFollowHeight === "boolean") {
    cursorLightFollowHeightToggle.checked = data.cursorLightFollowHeight;
  }
  if (typeof data.cursorLightColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(data.cursorLightColor)) {
    cursorLightColorInput.value = data.cursorLightColor.startsWith("#") ? data.cursorLightColor : `#${data.cursorLightColor}`;
  }
  if (Number.isFinite(Number(data.cursorLightStrength))) {
    cursorLightStrengthInput.value = String(Math.round(clamp(Number(data.cursorLightStrength), 1, 200)));
  }
  if (Number.isFinite(Number(data.cursorLightHeightOffset))) {
    cursorLightHeightOffsetInput.value = String(Math.round(clamp(Number(data.cursorLightHeightOffset), 0, 120)));
  }
  if (typeof data.cursorLightGizmo === "boolean") {
    cursorLightGizmoToggle.checked = data.cursorLightGizmo;
  }
  if (typeof data.pointLightLiveUpdate === "boolean") {
    pointLightLiveUpdateToggle.checked = data.pointLightLiveUpdate;
  }

  updatePathfindingRangeLabel();
  updatePathWeightLabels();
  updatePathSlopeCutoffLabel();
  updatePathBaseCostLabel();
  cursorLightState.color = hexToRgb01(cursorLightColorInput.value);
  cursorLightState.strength = Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200));
  cursorLightState.heightOffset = Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120));
  cursorLightState.useTerrainHeight = cursorLightFollowHeightToggle.checked;
  cursorLightState.showGizmo = cursorLightGizmoToggle.checked;
  if (!cursorLightModeToggle.checked) {
    cursorLightState.active = false;
  }
  updateCursorLightStrengthLabel();
  updateCursorLightHeightOffsetLabel();
  updateCursorLightModeUi();
}

function serializeSettingsByKey(key, fallbackSerialize) {
  if (!runtimeCore.settingsRegistry.has(key)) {
    return fallbackSerialize();
  }
  return runtimeCore.settingsRegistry.serialize(key, null);
}

function applySettingsByKey(key, rawData, fallbackApply) {
  if (!runtimeCore.settingsRegistry.has(key)) {
    fallbackApply(rawData);
    return;
  }
  if (!runtimeCore.settingsRegistry.validate(key, rawData)) {
    fallbackApply(rawData);
    return;
  }
  runtimeCore.settingsRegistry.apply(key, rawData, null);
}

function serializeLightingSettings() {
  return serializeSettingsByKey("lighting", serializeLightingSettingsLegacy);
}

function applyLightingSettings(rawData) {
  markSimulationKnobsDirty("lighting");
  applySettingsByKey("lighting", rawData, applyLightingSettingsLegacy);
}

function serializeFogSettings() {
  return serializeSettingsByKey("fog", serializeFogSettingsLegacy);
}

function applyFogSettings(rawData) {
  markSimulationKnobsDirty("fog");
  applySettingsByKey("fog", rawData, applyFogSettingsLegacy);
}

function serializeParallaxSettings() {
  return serializeSettingsByKey("parallax", serializeParallaxSettingsLegacy);
}

function applyParallaxSettings(rawData) {
  markSimulationKnobsDirty("parallax");
  applySettingsByKey("parallax", rawData, applyParallaxSettingsLegacy);
}

function serializeCloudSettings() {
  return serializeSettingsByKey("clouds", serializeCloudSettingsLegacy);
}

function applyCloudSettings(rawData) {
  markSimulationKnobsDirty("clouds");
  applySettingsByKey("clouds", rawData, applyCloudSettingsLegacy);
}

function serializeWaterSettings() {
  return serializeSettingsByKey("waterfx", serializeWaterSettingsLegacy);
}

function applyWaterSettings(rawData) {
  markSimulationKnobsDirty("waterfx");
  applySettingsByKey("waterfx", rawData, applyWaterSettingsLegacy);
}

function serializeInteractionSettings() {
  return serializeSettingsByKey("interaction", serializeInteractionSettingsLegacy);
}

function applyInteractionSettings(rawData) {
  applySettingsByKey("interaction", rawData, applyInteractionSettingsLegacy);
}

function serializeSwarmData() {
  return serializeSettingsByKey("swarm", serializeSwarmDataLegacy);
}

function applySwarmSettings(rawData) {
  applySwarmSettingsLegacy(rawData);
}

function getSettingsDefaults(key, fallback) {
  if (!runtimeCore.settingsRegistry.has(key)) {
    return fallback;
  }
  return runtimeCore.settingsRegistry.getDefaults(key) || fallback;
}

function createMapDataFileTexts() {
  return {
    "pointlights.json": `${JSON.stringify(serializePointLights(), null, 2)}\n`,
    "lighting.json": `${JSON.stringify(serializeLightingSettings(), null, 2)}\n`,
    "parallax.json": `${JSON.stringify(serializeParallaxSettings(), null, 2)}\n`,
    "interaction.json": `${JSON.stringify(serializeInteractionSettings(), null, 2)}\n`,
    "fog.json": `${JSON.stringify(serializeFogSettings(), null, 2)}\n`,
    "clouds.json": `${JSON.stringify(serializeCloudSettings(), null, 2)}\n`,
    "waterfx.json": `${JSON.stringify(serializeWaterSettings(), null, 2)}\n`,
    "swarm.json": `${JSON.stringify(serializeSwarmData(), null, 2)}\n`,
    "npc.json": `${JSON.stringify(serializeNpcState(), null, 2)}\n`,
  };
}

function downloadTextFile(fileName, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function saveAllMapDataFiles() {
  const files = createMapDataFileTexts();
  const folder = normalizeMapFolderPath(currentMapFolderPath);
  const names = Object.keys(files).join(", ");
  const confirmed = window.confirm(`Save map data files (${names}) for ${folder}?`);
  if (!confirmed) {
    setStatus("Save all canceled.");
    return;
  }

  if (tauriInvoke) {
    try {
      let targetFolder = folder;
      if (!isAbsoluteFsPath(targetFolder)) {
        targetFolder = await pickMapFolderViaTauri();
        if (!targetFolder) {
          setStatus("Save all canceled.");
          return;
        }
      }
      for (const [name, text] of Object.entries(files)) {
        const targetPath = joinFsPath(targetFolder, name);
        await invokeTauri("save_json_file", { path: targetPath, content: text });
      }
      setStatus(`Saved map data (${names}) to ${targetFolder}.`);
      return;
    } catch (error) {
      console.warn("Tauri Save All failed, falling back to browser flow.", error);
      setStatus("Native Save All failed. Trying browser fallback...");
    }
  }

  if (typeof window.showDirectoryPicker === "function") {
    const dir = await window.showDirectoryPicker();
    for (const [name, text] of Object.entries(files)) {
      const handle = await dir.getFileHandle(name, { create: true });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
    }
    setStatus(`Saved map data (${names}) to selected folder. Recommended map path: ${folder}`);
    return;
  }

  for (const [name, text] of Object.entries(files)) {
    downloadTextFile(name, text);
  }
  setStatus(`Downloaded ${names}. Move them to ${folder}.`);
}

async function loadMapFromPath(mapFolderPath) {
  const folder = normalizeMapFolderPath(mapFolderPath);
  if (tauriInvoke && isAbsoluteFsPath(folder)) {
    const validation = await validateMapFolderViaTauri(folder);
    if (!validation.is_valid) {
      throw new Error(`Missing required files: ${validation.missing_files.join(", ")}`);
    }
  }

  const jsonPath = (name) => (isAbsoluteFsPath(folder) ? joinFsPath(folder, name) : `${folder}/${name}`);
  const [splat, normals, height, slope, water] = await Promise.all([
    loadImageFromUrl(buildMapAssetPath(folder, "splat.png")),
    loadImageFromUrl(buildMapAssetPath(folder, "normals.png")),
    loadImageFromUrl(buildMapAssetPath(folder, "height.png")),
    loadImageFromUrl(buildMapAssetPath(folder, "slope.png")),
    loadImageFromUrl(buildMapAssetPath(folder, "water.png")),
  ]);

  await applyMapImages(splat, normals, height, slope, water);
  currentMapFolderPath = folder;
  mapPathInput.value = folder;

  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
  applyLightingSettings(getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS));
  applyParallaxSettings(getSettingsDefaults("parallax", DEFAULT_PARALLAX_SETTINGS));
  applyInteractionSettings(getSettingsDefaults("interaction", DEFAULT_INTERACTION_SETTINGS));
  applyFogSettings(getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS));
  applyCloudSettings(getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS));
  applyWaterSettings(getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS));
  applySwarmSettings(getSettingsDefaults("swarm", DEFAULT_SWARM_SETTINGS));
  reseedSwarmAgents(getSwarmSettings().agentCount);
  requestOverlayDraw();

  let loadedPointLights = false;
  let loadedLighting = false;
  let loadedParallax = false;
  let loadedInteraction = false;
  let loadedFog = false;
  let loadedClouds = false;
  let loadedWaterFx = false;
  let loadedSwarm = false;
  let loadedNpc = false;

  try {
    const pointLightsJsonPath = jsonPath("pointlights.json");
    const pointLightsJson = await tryLoadJsonFromUrl(pointLightsJsonPath);
    applyLoadedPointLights(pointLightsJson, pointLightsJsonPath, { suppressStatus: true });
    loadedPointLights = true;
  } catch (err) {
    console.warn(`No pointlights.json found in ${folder}`, err);
  }

  try {
    const lightingJson = await tryLoadJsonFromUrl(jsonPath("lighting.json"));
    applyLightingSettings(lightingJson);
    loadedLighting = true;
  } catch (err) {
    console.warn(`No lighting.json found in ${folder}`, err);
  }

  try {
    const parallaxJson = await tryLoadJsonFromUrl(jsonPath("parallax.json"));
    applyParallaxSettings(parallaxJson);
    loadedParallax = true;
  } catch (err) {
    console.warn(`No parallax.json found in ${folder}`, err);
  }

  try {
    const interactionJson = await tryLoadJsonFromUrl(jsonPath("interaction.json"));
    applyInteractionSettings(interactionJson);
    loadedInteraction = true;
  } catch (err) {
    console.warn(`No interaction.json found in ${folder}`, err);
  }

  try {
    const fogJson = await tryLoadJsonFromUrl(jsonPath("fog.json"));
    applyFogSettings(fogJson);
    loadedFog = true;
  } catch (err) {
    console.warn(`No fog.json found in ${folder}`, err);
  }

  try {
    const cloudsJson = await tryLoadJsonFromUrl(jsonPath("clouds.json"));
    applyCloudSettings(cloudsJson);
    loadedClouds = true;
  } catch (err) {
    console.warn(`No clouds.json found in ${folder}`, err);
  }

  try {
    const waterFxJson = await tryLoadJsonFromUrl(jsonPath("waterfx.json"));
    applyWaterSettings(waterFxJson);
    loadedWaterFx = true;
  } catch (err) {
    console.warn(`No waterfx.json found in ${folder}`, err);
  }

  try {
    const swarmJson = await tryLoadJsonFromUrl(jsonPath("swarm.json"));
    applySwarmData(swarmJson);
    loadedSwarm = true;
  } catch (err) {
    console.warn(`No swarm.json found in ${folder}`, err);
  }

  try {
    const npcJson = await tryLoadJsonFromUrl(jsonPath("npc.json"));
    applyLoadedNpc(npcJson);
    loadedNpc = true;
  } catch (err) {
    applyLoadedNpc(DEFAULT_PLAYER);
    console.warn(`No npc.json found in ${folder}`, err);
  }

  rebuildMovementField();
  setStatus(`Loaded map ${folder} | pointlights: ${loadedPointLights ? "yes" : "no"} | lighting: ${loadedLighting ? "yes" : "no"} | parallax: ${loadedParallax ? "yes" : "no"} | interaction: ${loadedInteraction ? "yes" : "no"} | fog: ${loadedFog ? "yes" : "no"} | clouds: ${loadedClouds ? "yes" : "no"} | waterfx: ${loadedWaterFx ? "yes" : "no"} | swarm: ${loadedSwarm ? "yes" : "default"} | npc: ${loadedNpc ? "yes" : "default"}`);
}

async function loadMapFromFolderSelection(fileList) {
  const files = Array.from(fileList || []);
  const splatFile = getFileFromFolderSelection(files, "splat.png");
  const normalsFile = getFileFromFolderSelection(files, "normals.png");
  const heightFile = getFileFromFolderSelection(files, "height.png");
  const slopeFile = getFileFromFolderSelection(files, "slope.png");
  const waterFile = getFileFromFolderSelection(files, "water.png");
  if (!splatFile || !normalsFile || !heightFile || !slopeFile || !waterFile) {
    throw new Error("Folder must contain splat.png, normals.png, height.png, slope.png, and water.png.");
  }

  const [splat, normals, height, slope, water] = await Promise.all([
    loadImageFromFile(splatFile),
    loadImageFromFile(normalsFile),
    loadImageFromFile(heightFile),
    loadImageFromFile(slopeFile),
    loadImageFromFile(waterFile),
  ]);
  await applyMapImages(splat, normals, height, slope, water);

  const relPath = String(splatFile.webkitRelativePath || "");
  const firstFolder = relPath.includes("/") ? relPath.split("/")[0] : "";
  if (firstFolder) {
    currentMapFolderPath = `assets/${firstFolder}/`;
    mapPathInput.value = currentMapFolderPath;
  }

  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
  applyLightingSettings(getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS));
  applyParallaxSettings(getSettingsDefaults("parallax", DEFAULT_PARALLAX_SETTINGS));
  applyInteractionSettings(getSettingsDefaults("interaction", DEFAULT_INTERACTION_SETTINGS));
  applyFogSettings(getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS));
  applyCloudSettings(getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS));
  applyWaterSettings(getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS));
  applySwarmSettings(getSettingsDefaults("swarm", DEFAULT_SWARM_SETTINGS));
  reseedSwarmAgents(getSwarmSettings().agentCount);
  requestOverlayDraw();

  let loadedPointLights = false;
  let loadedLighting = false;
  let loadedParallax = false;
  let loadedInteraction = false;
  let loadedFog = false;
  let loadedClouds = false;
  let loadedWaterFx = false;
  let loadedSwarm = false;
  let loadedNpc = false;

  const pointLightsFile = getFileFromFolderSelection(files, "pointlights.json");
  if (pointLightsFile) {
    try {
      const rawData = JSON.parse(await pointLightsFile.text());
      applyLoadedPointLights(rawData, pointLightsFile.name, { suppressStatus: true });
      loadedPointLights = true;
    } catch (err) {
      console.warn("Failed to parse pointlights.json from selected folder", err);
    }
  } else {
    console.warn("No pointlights.json found in selected folder");
  }

  const lightingFile = getFileFromFolderSelection(files, "lighting.json");
  if (lightingFile) {
    try {
      const rawData = JSON.parse(await lightingFile.text());
      applyLightingSettings(rawData);
      loadedLighting = true;
    } catch (err) {
      console.warn("Failed to parse lighting.json from selected folder", err);
    }
  }

  const parallaxFile = getFileFromFolderSelection(files, "parallax.json");
  if (parallaxFile) {
    try {
      const rawData = JSON.parse(await parallaxFile.text());
      applyParallaxSettings(rawData);
      loadedParallax = true;
    } catch (err) {
      console.warn("Failed to parse parallax.json from selected folder", err);
    }
  }

  const interactionFile = getFileFromFolderSelection(files, "interaction.json");
  if (interactionFile) {
    try {
      const rawData = JSON.parse(await interactionFile.text());
      applyInteractionSettings(rawData);
      loadedInteraction = true;
    } catch (err) {
      console.warn("Failed to parse interaction.json from selected folder", err);
    }
  }

  const fogFile = getFileFromFolderSelection(files, "fog.json");
  if (fogFile) {
    try {
      const rawData = JSON.parse(await fogFile.text());
      applyFogSettings(rawData);
      loadedFog = true;
    } catch (err) {
      console.warn("Failed to parse fog.json from selected folder", err);
    }
  }

  const cloudsFile = getFileFromFolderSelection(files, "clouds.json");
  if (cloudsFile) {
    try {
      const rawData = JSON.parse(await cloudsFile.text());
      applyCloudSettings(rawData);
      loadedClouds = true;
    } catch (err) {
      console.warn("Failed to parse clouds.json from selected folder", err);
    }
  }

  const waterFxFile = getFileFromFolderSelection(files, "waterfx.json");
  if (waterFxFile) {
    try {
      const rawData = JSON.parse(await waterFxFile.text());
      applyWaterSettings(rawData);
      loadedWaterFx = true;
    } catch (err) {
      console.warn("Failed to parse waterfx.json from selected folder", err);
    }
  }

  const swarmFile = getFileFromFolderSelection(files, "swarm.json");
  if (swarmFile) {
    try {
      const rawData = JSON.parse(await swarmFile.text());
      applySwarmData(rawData);
      loadedSwarm = true;
    } catch (err) {
      console.warn("Failed to parse swarm.json from selected folder", err);
    }
  }

  const npcFile = getFileFromFolderSelection(files, "npc.json");
  if (npcFile) {
    try {
      const rawData = JSON.parse(await npcFile.text());
      applyLoadedNpc(rawData);
      loadedNpc = true;
    } catch (err) {
      console.warn("Failed to parse npc.json from selected folder", err);
      applyLoadedNpc(DEFAULT_PLAYER);
    }
  } else {
    applyLoadedNpc(DEFAULT_PLAYER);
  }

  rebuildMovementField();
  setStatus(`Loaded map folder | pointlights: ${loadedPointLights ? "yes" : "no"} | lighting: ${loadedLighting ? "yes" : "no"} | parallax: ${loadedParallax ? "yes" : "no"} | interaction: ${loadedInteraction ? "yes" : "no"} | fog: ${loadedFog ? "yes" : "no"} | clouds: ${loadedClouds ? "yes" : "no"} | waterfx: ${loadedWaterFx ? "yes" : "no"} | swarm: ${loadedSwarm ? "yes" : "default"} | npc: ${loadedNpc ? "yes" : "default"}`);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function clampRound(v, min, max, decimals = LIGHTING_SAVE_PRECISION) {
  const clamped = clamp(v, min, max);
  return Number(clamped.toFixed(decimals));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec3(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

function lerpAngleDeg(a, b, t) {
  const delta = ((b - a + 540) % 360) - 180;
  return a + delta * t;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function wrapHour(hour) {
  const h = hour % 24;
  return h < 0 ? h + 24 : h;
}

function formatHour(hour) {
  const h = wrapHour(hour);
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function setCycleHourSliderFromState() {
  cycleHourInput.value = String(clamp(cycleState.hour, 0, 24));
}

const SUN_KEYS = [
  { hour: 0, azimuthDeg: -170, altitudeDeg: -60, sunColor: [0.08, 0.10, 0.20], ambientColor: [0.06, 0.08, 0.12], ambientScale: 0.18 },
  { hour: 4, azimuthDeg: -135, altitudeDeg: -22, sunColor: [0.35, 0.26, 0.22], ambientColor: [0.14, 0.10, 0.12], ambientScale: 0.22 },
  { hour: 6, azimuthDeg: -108, altitudeDeg: 3, sunColor: [1.00, 0.50, 0.30], ambientColor: [0.42, 0.22, 0.15], ambientScale: 0.30 },
  { hour: 8, azimuthDeg: -72, altitudeDeg: 24, sunColor: [1.00, 0.82, 0.62], ambientColor: [0.44, 0.34, 0.28], ambientScale: 0.45 },
  { hour: 12, azimuthDeg: 0, altitudeDeg: 64, sunColor: [1.00, 0.98, 0.92], ambientColor: [0.58, 0.62, 0.68], ambientScale: 0.70 },
  { hour: 16, azimuthDeg: 72, altitudeDeg: 26, sunColor: [1.00, 0.84, 0.65], ambientColor: [0.44, 0.35, 0.30], ambientScale: 0.50 },
  { hour: 18, azimuthDeg: 108, altitudeDeg: 4, sunColor: [1.00, 0.48, 0.28], ambientColor: [0.45, 0.23, 0.16], ambientScale: 0.32 },
  { hour: 20, azimuthDeg: 138, altitudeDeg: -14, sunColor: [0.42, 0.25, 0.24], ambientColor: [0.18, 0.10, 0.14], ambientScale: 0.22 },
  { hour: 24, azimuthDeg: 190, altitudeDeg: -60, sunColor: [0.08, 0.10, 0.20], ambientColor: [0.06, 0.08, 0.12], ambientScale: 0.18 },
];

function sampleSunAtHour(hour) {
  const h = wrapHour(hour);
  for (let i = 0; i < SUN_KEYS.length - 1; i++) {
    const a = SUN_KEYS[i];
    const b = SUN_KEYS[i + 1];
    if (h >= a.hour && h <= b.hour) {
      const span = Math.max(0.0001, b.hour - a.hour);
      const t = (h - a.hour) / span;
      return {
        azimuthDeg: lerpAngleDeg(a.azimuthDeg, b.azimuthDeg, t),
        altitudeDeg: lerp(a.altitudeDeg, b.altitudeDeg, t),
        sunColor: lerpVec3(a.sunColor, b.sunColor, t),
        ambientColor: lerpVec3(a.ambientColor, b.ambientColor, t),
        ambientScale: lerp(a.ambientScale, b.ambientScale, t),
      };
    }
  }
  return SUN_KEYS[0];
}

const program = createProgram(VERT_SRC, FRAG_SRC);
const swarmProgram = createProgram(SWARM_VERT_SRC, SWARM_FRAG_SRC);
const shadowProgram = createProgram(VERT_SRC, SHADOW_FRAG_SRC);
const shadowBlurProgram = createProgram(VERT_SRC, SHADOW_BLUR_FRAG_SRC);
gl.useProgram(program);

const uniforms = {
  uSplat: gl.getUniformLocation(program, "uSplat"),
  uNormals: gl.getUniformLocation(program, "uNormals"),
  uHeight: gl.getUniformLocation(program, "uHeight"),
  uPointLightTex: gl.getUniformLocation(program, "uPointLightTex"),
  uCloudNoiseTex: gl.getUniformLocation(program, "uCloudNoiseTex"),
  uShadowTex: gl.getUniformLocation(program, "uShadowTex"),
  uWater: gl.getUniformLocation(program, "uWater"),
  uFlowMap: gl.getUniformLocation(program, "uFlowMap"),
  uUseCursorLight: gl.getUniformLocation(program, "uUseCursorLight"),
  uCursorLightUv: gl.getUniformLocation(program, "uCursorLightUv"),
  uCursorLightColor: gl.getUniformLocation(program, "uCursorLightColor"),
  uCursorLightStrength: gl.getUniformLocation(program, "uCursorLightStrength"),
  uCursorLightHeightOffset: gl.getUniformLocation(program, "uCursorLightHeightOffset"),
  uUseCursorTerrainHeight: gl.getUniformLocation(program, "uUseCursorTerrainHeight"),
  uCursorLightMapSize: gl.getUniformLocation(program, "uCursorLightMapSize"),
  uMapTexelSize: gl.getUniformLocation(program, "uMapTexelSize"),
  uResolution: gl.getUniformLocation(program, "uResolution"),
  uSunDir: gl.getUniformLocation(program, "uSunDir"),
  uSunColor: gl.getUniformLocation(program, "uSunColor"),
  uSunStrength: gl.getUniformLocation(program, "uSunStrength"),
  uMoonDir: gl.getUniformLocation(program, "uMoonDir"),
  uMoonColor: gl.getUniformLocation(program, "uMoonColor"),
  uMoonStrength: gl.getUniformLocation(program, "uMoonStrength"),
  uAmbientColor: gl.getUniformLocation(program, "uAmbientColor"),
  uAmbient: gl.getUniformLocation(program, "uAmbient"),
  uHeightScale: gl.getUniformLocation(program, "uHeightScale"),
  uShadowStrength: gl.getUniformLocation(program, "uShadowStrength"),
  uUseShadows: gl.getUniformLocation(program, "uUseShadows"),
  uUseParallax: gl.getUniformLocation(program, "uUseParallax"),
  uParallaxStrength: gl.getUniformLocation(program, "uParallaxStrength"),
  uParallaxBands: gl.getUniformLocation(program, "uParallaxBands"),
  uZoom: gl.getUniformLocation(program, "uZoom"),
  uUseFog: gl.getUniformLocation(program, "uUseFog"),
  uFogColor: gl.getUniformLocation(program, "uFogColor"),
  uFogMinAlpha: gl.getUniformLocation(program, "uFogMinAlpha"),
  uFogMaxAlpha: gl.getUniformLocation(program, "uFogMaxAlpha"),
  uFogFalloff: gl.getUniformLocation(program, "uFogFalloff"),
  uFogStartOffset: gl.getUniformLocation(program, "uFogStartOffset"),
  uCameraHeightNorm: gl.getUniformLocation(program, "uCameraHeightNorm"),
  uUseVolumetric: gl.getUniformLocation(program, "uUseVolumetric"),
  uVolumetricStrength: gl.getUniformLocation(program, "uVolumetricStrength"),
  uVolumetricDensity: gl.getUniformLocation(program, "uVolumetricDensity"),
  uVolumetricAnisotropy: gl.getUniformLocation(program, "uVolumetricAnisotropy"),
  uVolumetricLength: gl.getUniformLocation(program, "uVolumetricLength"),
  uVolumetricSamples: gl.getUniformLocation(program, "uVolumetricSamples"),
  uMapAspect: gl.getUniformLocation(program, "uMapAspect"),
  uViewHalfExtents: gl.getUniformLocation(program, "uViewHalfExtents"),
  uPanWorld: gl.getUniformLocation(program, "uPanWorld"),
  uTimeSec: gl.getUniformLocation(program, "uTimeSec"),
  uPointFlickerEnabled: gl.getUniformLocation(program, "uPointFlickerEnabled"),
  uPointFlickerStrength: gl.getUniformLocation(program, "uPointFlickerStrength"),
  uPointFlickerSpeed: gl.getUniformLocation(program, "uPointFlickerSpeed"),
  uPointFlickerSpatial: gl.getUniformLocation(program, "uPointFlickerSpatial"),
  uUseClouds: gl.getUniformLocation(program, "uUseClouds"),
  uCloudCoverage: gl.getUniformLocation(program, "uCloudCoverage"),
  uCloudSoftness: gl.getUniformLocation(program, "uCloudSoftness"),
  uCloudOpacity: gl.getUniformLocation(program, "uCloudOpacity"),
  uCloudScale: gl.getUniformLocation(program, "uCloudScale"),
  uCloudSpeed1: gl.getUniformLocation(program, "uCloudSpeed1"),
  uCloudSpeed2: gl.getUniformLocation(program, "uCloudSpeed2"),
  uCloudSunParallax: gl.getUniformLocation(program, "uCloudSunParallax"),
  uCloudUseSunProjection: gl.getUniformLocation(program, "uCloudUseSunProjection"),
  uUseWaterFx: gl.getUniformLocation(program, "uUseWaterFx"),
  uWaterFlowDownhill: gl.getUniformLocation(program, "uWaterFlowDownhill"),
  uWaterFlowInvertDownhill: gl.getUniformLocation(program, "uWaterFlowInvertDownhill"),
  uWaterFlowDebug: gl.getUniformLocation(program, "uWaterFlowDebug"),
  uWaterFlowDir: gl.getUniformLocation(program, "uWaterFlowDir"),
  uWaterLocalFlowMix: gl.getUniformLocation(program, "uWaterLocalFlowMix"),
  uWaterDownhillBoost: gl.getUniformLocation(program, "uWaterDownhillBoost"),
  uWaterFlowStrength: gl.getUniformLocation(program, "uWaterFlowStrength"),
  uWaterFlowSpeed: gl.getUniformLocation(program, "uWaterFlowSpeed"),
  uWaterFlowScale: gl.getUniformLocation(program, "uWaterFlowScale"),
  uWaterShimmerStrength: gl.getUniformLocation(program, "uWaterShimmerStrength"),
  uWaterGlintStrength: gl.getUniformLocation(program, "uWaterGlintStrength"),
  uWaterGlintSharpness: gl.getUniformLocation(program, "uWaterGlintSharpness"),
  uWaterShoreFoamStrength: gl.getUniformLocation(program, "uWaterShoreFoamStrength"),
  uWaterShoreWidth: gl.getUniformLocation(program, "uWaterShoreWidth"),
  uWaterReflectivity: gl.getUniformLocation(program, "uWaterReflectivity"),
  uWaterTintColor: gl.getUniformLocation(program, "uWaterTintColor"),
  uWaterTintStrength: gl.getUniformLocation(program, "uWaterTintStrength"),
  uSkyColor: gl.getUniformLocation(program, "uSkyColor"),
};

const shadowUniforms = {
  uHeight: gl.getUniformLocation(shadowProgram, "uHeight"),
  uMapTexelSize: gl.getUniformLocation(shadowProgram, "uMapTexelSize"),
  uShadowResolution: gl.getUniformLocation(shadowProgram, "uShadowResolution"),
  uSunDir: gl.getUniformLocation(shadowProgram, "uSunDir"),
  uMoonDir: gl.getUniformLocation(shadowProgram, "uMoonDir"),
  uHeightScale: gl.getUniformLocation(shadowProgram, "uHeightScale"),
  uShadowStrength: gl.getUniformLocation(shadowProgram, "uShadowStrength"),
  uUseShadows: gl.getUniformLocation(shadowProgram, "uUseShadows"),
};

const swarmUniforms = {
  uNormals: gl.getUniformLocation(swarmProgram, "uNormals"),
  uHeight: gl.getUniformLocation(swarmProgram, "uHeight"),
  uPointLightTex: gl.getUniformLocation(swarmProgram, "uPointLightTex"),
  uCloudNoiseTex: gl.getUniformLocation(swarmProgram, "uCloudNoiseTex"),
  uSunDir: gl.getUniformLocation(swarmProgram, "uSunDir"),
  uSunColor: gl.getUniformLocation(swarmProgram, "uSunColor"),
  uSunStrength: gl.getUniformLocation(swarmProgram, "uSunStrength"),
  uMoonDir: gl.getUniformLocation(swarmProgram, "uMoonDir"),
  uMoonColor: gl.getUniformLocation(swarmProgram, "uMoonColor"),
  uMoonStrength: gl.getUniformLocation(swarmProgram, "uMoonStrength"),
  uAmbientColor: gl.getUniformLocation(swarmProgram, "uAmbientColor"),
  uAmbient: gl.getUniformLocation(swarmProgram, "uAmbient"),
  uUseShadows: gl.getUniformLocation(swarmProgram, "uUseShadows"),
  uUseFog: gl.getUniformLocation(swarmProgram, "uUseFog"),
  uFogColor: gl.getUniformLocation(swarmProgram, "uFogColor"),
  uFogMinAlpha: gl.getUniformLocation(swarmProgram, "uFogMinAlpha"),
  uFogMaxAlpha: gl.getUniformLocation(swarmProgram, "uFogMaxAlpha"),
  uFogFalloff: gl.getUniformLocation(swarmProgram, "uFogFalloff"),
  uFogStartOffset: gl.getUniformLocation(swarmProgram, "uFogStartOffset"),
  uCameraHeightNorm: gl.getUniformLocation(swarmProgram, "uCameraHeightNorm"),
  uUseVolumetric: gl.getUniformLocation(swarmProgram, "uUseVolumetric"),
  uVolumetricStrength: gl.getUniformLocation(swarmProgram, "uVolumetricStrength"),
  uVolumetricDensity: gl.getUniformLocation(swarmProgram, "uVolumetricDensity"),
  uVolumetricAnisotropy: gl.getUniformLocation(swarmProgram, "uVolumetricAnisotropy"),
  uVolumetricLength: gl.getUniformLocation(swarmProgram, "uVolumetricLength"),
  uVolumetricSamples: gl.getUniformLocation(swarmProgram, "uVolumetricSamples"),
  uMapAspect: gl.getUniformLocation(swarmProgram, "uMapAspect"),
  uMapTexelSize: gl.getUniformLocation(swarmProgram, "uMapTexelSize"),
  uMapSize: gl.getUniformLocation(swarmProgram, "uMapSize"),
  uResolution: gl.getUniformLocation(swarmProgram, "uResolution"),
  uViewHalfExtents: gl.getUniformLocation(swarmProgram, "uViewHalfExtents"),
  uPanWorld: gl.getUniformLocation(swarmProgram, "uPanWorld"),
  uTimeSec: gl.getUniformLocation(swarmProgram, "uTimeSec"),
  uPointFlickerEnabled: gl.getUniformLocation(swarmProgram, "uPointFlickerEnabled"),
  uPointFlickerStrength: gl.getUniformLocation(swarmProgram, "uPointFlickerStrength"),
  uPointFlickerSpeed: gl.getUniformLocation(swarmProgram, "uPointFlickerSpeed"),
  uPointFlickerSpatial: gl.getUniformLocation(swarmProgram, "uPointFlickerSpatial"),
  uUseClouds: gl.getUniformLocation(swarmProgram, "uUseClouds"),
  uCloudCoverage: gl.getUniformLocation(swarmProgram, "uCloudCoverage"),
  uCloudSoftness: gl.getUniformLocation(swarmProgram, "uCloudSoftness"),
  uCloudOpacity: gl.getUniformLocation(swarmProgram, "uCloudOpacity"),
  uCloudScale: gl.getUniformLocation(swarmProgram, "uCloudScale"),
  uCloudSpeed1: gl.getUniformLocation(swarmProgram, "uCloudSpeed1"),
  uCloudSpeed2: gl.getUniformLocation(swarmProgram, "uCloudSpeed2"),
  uCloudSunParallax: gl.getUniformLocation(swarmProgram, "uCloudSunParallax"),
  uCloudUseSunProjection: gl.getUniformLocation(swarmProgram, "uCloudUseSunProjection"),
  uHawkColor: gl.getUniformLocation(swarmProgram, "uHawkColor"),
  uSwarmHeightMax: gl.getUniformLocation(swarmProgram, "uSwarmHeightMax"),
  uPointLightEdgeMin: gl.getUniformLocation(swarmProgram, "uPointLightEdgeMin"),
  uSwarmAlpha: gl.getUniformLocation(swarmProgram, "uSwarmAlpha"),
};

const shadowBlurUniforms = {
  uShadowRawTex: gl.getUniformLocation(shadowBlurProgram, "uShadowRawTex"),
  uShadowResolution: gl.getUniformLocation(shadowBlurProgram, "uShadowResolution"),
  uBlurRadiusPx: gl.getUniformLocation(shadowBlurProgram, "uBlurRadiusPx"),
};

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]),
  gl.STATIC_DRAW
);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

const swarmPointVao = gl.createVertexArray();
const swarmPointBuffer = gl.createBuffer();
if (!swarmPointVao || !swarmPointBuffer) {
  throw new Error("Failed to allocate swarm render buffers.");
}
gl.bindVertexArray(swarmPointVao);
gl.bindBuffer(gl.ARRAY_BUFFER, swarmPointBuffer);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 24, 12);
gl.enableVertexAttribArray(2);
gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 24, 16);
gl.enableVertexAttribArray(3);
gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 24, 20);
gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, quad);

const splatTex = createTexture();
const normalsTex = createTexture();
const heightTex = createTexture();
const waterTex = createTexture();
const flowMapTex = createLinearTexture();
const pointLightTex = createTexture();
const cloudNoiseTex = gl.createTexture();
const shadowRawTex = createTexture();
const shadowBlurTex = createTexture();
const shadowRawFbo = gl.createFramebuffer();
const shadowBlurFbo = gl.createFramebuffer();
const SHADOW_MAP_SCALE = 0.5;
const shadowSize = { width: 1, height: 1 };
uploadCloudNoiseTexture();

const splatSize = { width: 1, height: 1 };
const heightSize = { width: 1, height: 1 };
const normalsSize = { width: 1, height: 1 };

const pointLightBakeCanvas = document.createElement("canvas");
const pointLightBakeCtx = pointLightBakeCanvas.getContext("2d");
if (!pointLightBakeCtx) {
  throw new Error("Point-light bake canvas 2D context is required.");
}

const pointLights = [];
let selectedLightId = null;
let lightEditDraft = null;
let nextPointLightId = 1;
let pointLightsSaveConfirmArmed = false;
let pointLightsSaveConfirmTimer = null;
let normalsImageData = null;
let heightImageData = null;
let slopeImageData = null;
let waterImageData = null;
const POINT_LIGHT_BLEND_EXPOSURE = 0.65;
const POINT_LIGHT_SELECT_RADIUS = 3;
const POINT_LIGHT_BAKE_LIVE_SCALE = 0.5;
const POINT_LIGHT_BAKE_DEBOUNCE_MS = 80;
const DEFAULT_POINT_LIGHT_FLICKER = 0.7;
const DEFAULT_POINT_LIGHT_FLICKER_SPEED = 0.5;
const SWARM_POINT_LIGHT_EDGE_MIN = 0.08;
let swarmPointVertexData = new Float32Array(0);
let overlayDirty = true;
const DEFAULT_MAP_FOLDER = "assets/Map 1/";
let currentMapFolderPath = DEFAULT_MAP_FOLDER;
const DEFAULT_MAP_FOLDER_CANDIDATES = ["assets/Map 1/", "assets/"];
const DEFAULT_PLAYER = {
  charID: "player",
  pixelX: 120,
  pixelY: 96,
  color: "#ff69b4",
};
const playerState = {
  charID: DEFAULT_PLAYER.charID,
  pixelX: DEFAULT_PLAYER.pixelX,
  pixelY: DEFAULT_PLAYER.pixelY,
  color: DEFAULT_PLAYER.color,
};
const movePreviewState = {
  hoverPixel: null,
  pathPixels: [],
};
let interactionMode = "none";
const swarmState = {
  x: new Float32Array(0),
  y: new Float32Array(0),
  z: new Float32Array(0),
  vx: new Float32Array(0),
  vy: new Float32Array(0),
  vz: new Float32Array(0),
  speedScale: new Float32Array(0),
  steerScale: new Float32Array(0),
  isResting: new Uint8Array(0),
  restTicksLeft: new Uint16Array(0),
  ax: new Float32Array(0),
  ay: new Float32Array(0),
  az: new Float32Array(0),
  count: 0,
  lastUpdateMs: null,
  stepSec: 1 / 60,
  stepCount: 0,
  hawkKillIntervalSum: 0,
  hawkKillCount: 0,
  breedingActive: false,
  hawks: [],
};
const swarmCursorState = {
  x: 0,
  y: 0,
  active: false,
};
const swarmFollowState = {
  enabled: false,
  targetType: "agent",
  agentIndex: -1,
  hawkIndex: -1,
  speedNormFiltered: null,
};
let movementField = null;
const pointLightBakeTempCanvas = document.createElement("canvas");
const pointLightBakeTempCtx = pointLightBakeTempCanvas.getContext("2d");
let pointLightBakeWorker = null;
try {
  pointLightBakeWorker = new Worker(new URL("./pointLightBakeWorker.js", import.meta.url), { type: "module" });
} catch (err) {
  console.warn("Point-light bake worker unavailable; falling back to main-thread baking.", err);
}

const pointLightBakeOrchestrator = createPointLightBakeOrchestrator({
  windowEl: window,
  requestAnimationFrame: (cb) => requestAnimationFrame(cb),
  debounceMs: POINT_LIGHT_BAKE_DEBOUNCE_MS,
  liveScale: POINT_LIGHT_BAKE_LIVE_SCALE,
  blendExposure: POINT_LIGHT_BLEND_EXPOSURE,
  getWorker: () => pointLightBakeWorker,
  isLiveUpdateEnabled: () => pointLightLiveUpdateToggle.checked,
  ensureBakeSize: ensurePointLightBakeSize,
  hasBakeInputs: () => Boolean(normalsImageData && heightImageData),
  bakeSync: (useReducedResolution) => bakePointLightsTextureSync(useReducedResolution),
  getFullBakeSize: () => ({ width: pointLightBakeCanvas.width, height: pointLightBakeCanvas.height }),
  getLights: () => pointLights,
  getHeightScaleValue: () => Math.max(1, Number(heightScaleInput.value) || 1),
});

if (pointLightBakeWorker) {
  bindPointLightWorker(pointLightBakeWorker, {
    getPendingRequestId: () => pointLightBakeOrchestrator.getPendingRequestId(),
    setPendingRequestId: (value) => pointLightBakeOrchestrator.setPendingRequestId(value),
    bakePointLightsTextureSync,
    applyPointLightBakeRgba,
  });
}

function createFlatNormalImage(size = 2) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(128,128,255)";
  ctx.fillRect(0, 0, size, size);
  return c;
}

function createFlatHeightImage(size = 2) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, size, size);
  return c;
}

function createFlatSlopeImage(size = 2) {
  return createFlatHeightImage(size);
}

function createFlatWaterImage(size = 2) {
  return createFlatHeightImage(size);
}

function createFallbackSplat(size = 512) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0.0, "#567d46");
  g.addColorStop(0.5, "#7a8f5a");
  g.addColorStop(1.0, "#b2a87a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1 + Math.random() * 2;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(70,92,58,0.35)" : "rgba(147,132,91,0.25)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function setSplatSizeFromImage(img) {
  const prevW = splatSize.width;
  const prevH = splatSize.height;
  splatSize.width = img.width || 1;
  splatSize.height = img.height || 1;
  return splatSize.width !== prevW || splatSize.height !== prevH;
}

function setHeightSizeFromImage(img) {
  heightSize.width = img.width || 1;
  heightSize.height = img.height || 1;
}

function setNormalsSizeFromImage(img) {
  normalsSize.width = img.width || 1;
  normalsSize.height = img.height || 1;
}

function extractImageData(source) {
  const width = source.width || 1;
  const height = source.height || 1;
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  ctx.drawImage(source, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

const defaultNormalImage = createFlatNormalImage();
const defaultHeightImage = createFlatHeightImage();
const defaultSlopeImage = createFlatSlopeImage();
const defaultWaterImage = createFlatWaterImage();
const defaultSplatImage = createFallbackSplat();
uploadImageToTexture(normalsTex, defaultNormalImage);
uploadImageToTexture(heightTex, defaultHeightImage);
uploadImageToTexture(splatTex, defaultSplatImage);
uploadImageToTexture(waterTex, defaultWaterImage);
setSplatSizeFromImage(defaultSplatImage);
setHeightSizeFromImage(defaultHeightImage);
setNormalsSizeFromImage(defaultNormalImage);
normalsImageData = extractImageData(defaultNormalImage);
heightImageData = extractImageData(defaultHeightImage);
rebuildFlowMapTexture();
slopeImageData = extractImageData(defaultSlopeImage);
waterImageData = extractImageData(defaultWaterImage);
syncPointLightWorkerMapData();

function getSelectedPointLight() {
  return pointLights.find((light) => light.id === selectedLightId) || null;
}

function clearPointLights() {
  pointLights.length = 0;
  selectedLightId = null;
  lightEditDraft = null;
  resetPointLightsSaveConfirmation();
}

function resetPointLightsSaveConfirmation() {
  pointLightsSaveConfirmArmed = false;
  pointLightsSaveAllBtn.textContent = "Save All";
  if (pointLightsSaveConfirmTimer !== null) {
    window.clearTimeout(pointLightsSaveConfirmTimer);
    pointLightsSaveConfirmTimer = null;
  }
}

function armPointLightsSaveConfirmation() {
  pointLightsSaveConfirmArmed = true;
  pointLightsSaveAllBtn.textContent = "Confirm Save";
  if (pointLightsSaveConfirmTimer !== null) {
    window.clearTimeout(pointLightsSaveConfirmTimer);
  }
  pointLightsSaveConfirmTimer = window.setTimeout(() => {
    resetPointLightsSaveConfirmation();
  }, 5000);
}

function normalizeImportedPointLightColor(rawColor) {
  if (!Array.isArray(rawColor) || rawColor.length < 3) return null;
  const channelRaw = [Number(rawColor[0]), Number(rawColor[1]), Number(rawColor[2])];
  if (!channelRaw.every((v) => Number.isFinite(v))) return null;
  const uses255Range = channelRaw.some((v) => v > 1);
  if (uses255Range) {
    return channelRaw.map((v) => clamp(v / 255, 0, 1));
  }
  return channelRaw.map((v) => clamp(v, 0, 1));
}

function serializePointLights() {
  return {
    version: 1,
    mapSize: {
      width: splatSize.width,
      height: splatSize.height,
    },
    lights: pointLights.map((light) => ({
      x: light.pixelX,
      y: light.pixelY,
      range: light.strength,
      intensity: light.intensity,
      heightOffset: light.heightOffset,
      flicker: clamp(Number.isFinite(Number(light.flicker)) ? Number(light.flicker) : DEFAULT_POINT_LIGHT_FLICKER, 0, 1),
      flickerSpeed: clamp(Number.isFinite(Number(light.flickerSpeed)) ? Number(light.flickerSpeed) : DEFAULT_POINT_LIGHT_FLICKER_SPEED, 0, 1),
      color: [light.color[0], light.color[1], light.color[2]],
    })),
  };
}

function parsePointLightsFromJson(rawData) {
  let rawLights = null;
  if (Array.isArray(rawData)) {
    rawLights = rawData;
  } else if (rawData && Array.isArray(rawData.lights)) {
    rawLights = rawData.lights;
  }
  if (!rawLights) {
    throw new Error("JSON must be an array of lights or an object with a lights array.");
  }

  const parsedLights = [];
  let skippedCount = 0;

  for (const rawLight of rawLights) {
    const rawX = rawLight && (rawLight.pixelX ?? rawLight.x);
    const rawY = rawLight && (rawLight.pixelY ?? rawLight.y);
    const rawStrength = rawLight && (rawLight.strength ?? rawLight.range);
    const rawIntensity = rawLight && (rawLight.intensity ?? rawLight.power ?? 1);
    const rawHeightOffset = rawLight && (rawLight.heightOffset ?? rawLight.height ?? 8);
    const rawFlicker = rawLight && (rawLight.flicker ?? rawLight.flickerAmount ?? DEFAULT_POINT_LIGHT_FLICKER);
    const rawFlickerSpeed = rawLight && (rawLight.flickerSpeed ?? rawLight.flickerRate ?? DEFAULT_POINT_LIGHT_FLICKER_SPEED);
    const color = normalizeImportedPointLightColor(rawLight && rawLight.color);
    const pixelX = Math.round(Number(rawX));
    const pixelY = Math.round(Number(rawY));
    const strength = Math.round(Number(rawStrength));
    const intensity = Number(rawIntensity);
    const heightOffset = Math.round(Number(rawHeightOffset));
    const flicker = Number(rawFlicker);
    const flickerSpeed = Number(rawFlickerSpeed);
    if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY) || !Number.isFinite(strength) || !Number.isFinite(intensity) || !Number.isFinite(heightOffset) || !Number.isFinite(flicker) || !Number.isFinite(flickerSpeed) || !color) {
      skippedCount += 1;
      continue;
    }

    parsedLights.push({
      pixelX: clamp(pixelX, 0, Math.max(0, splatSize.width - 1)),
      pixelY: clamp(pixelY, 0, Math.max(0, splatSize.height - 1)),
      strength: Math.round(clamp(strength, 1, 200)),
      intensity: clamp(intensity, 0, 4),
      heightOffset: Math.round(clamp(heightOffset, -120, 240)),
      flicker: clamp(flicker, 0, 1),
      flickerSpeed: clamp(flickerSpeed, 0, 1),
      color,
    });
  }

  return { parsedLights, skippedCount };
}

function applyLoadedPointLights(rawData, sourceLabel, options = {}) {
  const suppressStatus = Boolean(options.suppressStatus);
  const { parsedLights, skippedCount } = parsePointLightsFromJson(rawData);

  clearPointLights();
  for (const light of parsedLights) {
    pointLights.push({
      id: nextPointLightId++,
      pixelX: light.pixelX,
      pixelY: light.pixelY,
      strength: light.strength,
      intensity: light.intensity,
      heightOffset: light.heightOffset,
      flicker: light.flicker,
      flickerSpeed: light.flickerSpeed,
      color: [...light.color],
    });
  }

  bakePointLightsTexture();
  updateLightEditorUi();
  requestOverlayDraw();

  if (!suppressStatus) {
    const skippedNote = skippedCount > 0 ? ` | Skipped invalid entries: ${skippedCount}` : "";
    setStatus(`Loaded point lights from ${sourceLabel}: ${parsedLights.length}${skippedNote}`);
  }

  return { loadedCount: parsedLights.length, skippedCount };
}

async function savePointLightsJson() {
  const payload = serializePointLights();
  const text = `${JSON.stringify(payload, null, 2)}\n`;

  if (tauriInvoke && isAbsoluteFsPath(currentMapFolderPath)) {
    try {
      const targetPath = joinFsPath(currentMapFolderPath, "pointlights.json");
      await invokeTauri("save_json_file", { path: targetPath, content: text });
      setStatus(`Saved ${payload.lights.length} point lights to ${targetPath}.`);
      return;
    } catch (error) {
      console.warn("Tauri pointlights save failed, falling back to browser flow.", error);
      setStatus("Native pointlights save failed. Trying browser fallback...");
    }
  }

  if (typeof window.showSaveFilePicker === "function") {
    const handle = await window.showSaveFilePicker({
      suggestedName: "pointlights.json",
      types: [
        {
          description: "JSON",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    setStatus(`Saved ${payload.lights.length} point lights. Place pointlights.json in ${normalizeMapFolderPath(currentMapFolderPath)} for map reloads.`);
    return;
  }

  downloadTextFile("pointlights.json", text);
  setStatus(`Downloaded pointlights.json with ${payload.lights.length} point lights. Place it in ${normalizeMapFolderPath(currentMapFolderPath)}.`);
}

async function loadPointLightsFromAssetsOrPrompt() {
  const folder = normalizeMapFolderPath(currentMapFolderPath);
  const pointLightsPath = isAbsoluteFsPath(folder)
    ? joinFsPath(folder, "pointlights.json")
    : `${folder}/pointlights.json`;
  try {
    const rawData = await tryLoadJsonFromUrl(pointLightsPath);
    applyLoadedPointLights(rawData, pointLightsPath);
    return;
  } catch (err) {
    console.warn(`Failed to load ${pointLightsPath}`, err);
  }

  setStatus(`${pointLightsPath} not found. Select a pointlights JSON file to load.`);
  pointLightsLoadInput.value = "";
  pointLightsLoadInput.click();
}

function ensurePointLightBakeSize() {
  const w = Math.max(1, Math.floor(splatSize.width));
  const h = Math.max(1, Math.floor(splatSize.height));
  if (pointLightBakeCanvas.width !== w || pointLightBakeCanvas.height !== h) {
    pointLightBakeCanvas.width = w;
    pointLightBakeCanvas.height = h;
  }
}

function normalize3(x, y, z) {
  const len = Math.hypot(x, y, z);
  if (len < 0.000001) return [0, 0, 1];
  return [x / len, y / len, z / len];
}

function sampleNormalAtMapPixel(pixelX, pixelY) {
  if (!normalsImageData || !normalsImageData.data) {
    return [0, 0, 1];
  }
  const nx = clamp(Math.round((pixelX + 0.5) / splatSize.width * normalsSize.width - 0.5), 0, normalsSize.width - 1);
  const ny = clamp(Math.round((pixelY + 0.5) / splatSize.height * normalsSize.height - 0.5), 0, normalsSize.height - 1);
  const idx = (ny * normalsSize.width + nx) * 4;
  const d = normalsImageData.data;
  const vx = (d[idx] / 255) * 2 - 1;
  const vy = (d[idx + 1] / 255) * 2 - 1;
  const vz = (d[idx + 2] / 255) * 2 - 1;
  return normalize3(vx, vy, vz);
}

function sampleHeightAtMapPixel(pixelX, pixelY) {
  if (!heightImageData || !heightImageData.data) {
    return 0;
  }
  const hx = clamp(Math.round((pixelX + 0.5) / splatSize.width * heightSize.width - 0.5), 0, heightSize.width - 1);
  const hy = clamp(Math.round((pixelY + 0.5) / splatSize.height * heightSize.height - 0.5), 0, heightSize.height - 1);
  const idx = (hy * heightSize.width + hx) * 4;
  return heightImageData.data[idx] / 255;
}

function sampleHeightAtMapCoord(mapX, mapY) {
  if (!heightImageData || !heightImageData.data) {
    return 0;
  }
  const hx = clamp(Math.round((mapX + 0.5) / splatSize.width * heightSize.width - 0.5), 0, heightSize.width - 1);
  const hy = clamp(Math.round((mapY + 0.5) / splatSize.height * heightSize.height - 0.5), 0, heightSize.height - 1);
  const idx = (hy * heightSize.width + hx) * 4;
  return heightImageData.data[idx] / 255;
}

function computeSwarmDirectionalShadow(mapX, mapY, sourceHeight, lightDir, blockedShadowFactor) {
  const lx = Number(lightDir[0]) || 0;
  const ly = Number(lightDir[1]) || 0;
  const lz = Number(lightDir[2]) || 0;
  if (lz <= 0.01) return 0;
  const dirLen = Math.hypot(lx, ly);
  if (dirLen < 0.0001) return 1;

  const stepPixels = 1.5;
  const maxSteps = 120;
  const slope = lz / Math.max(dirLen, 0.0001);
  const stepX = (lx / dirLen) * stepPixels;
  const stepY = (ly / dirLen) * stepPixels;
  const heightBias = 0.7;
  let rayX = mapX;
  let rayY = mapY;
  let traveledPixels = 0;
  for (let i = 0; i < maxSteps; i++) {
    rayX += stepX;
    rayY += stepY;
    traveledPixels += stepPixels;
    if (rayX <= 0 || rayY <= 0 || rayX >= splatSize.width - 1 || rayY >= splatSize.height - 1) {
      break;
    }
    const terrainH = sampleHeightAtMapCoord(rayX, rayY) * SWARM_Z_MAX;
    const rayH = sourceHeight + slope * traveledPixels;
    if (terrainH > rayH + heightBias) {
      return blockedShadowFactor;
    }
  }
  return 1;
}

function hasLineOfSightToLight(surfaceX, surfaceY, surfaceH, lightX, lightY, lightH, heightScaleValue) {
  const dx = lightX - surfaceX;
  const dy = lightY - surfaceY;
  const dist = Math.hypot(dx, dy);
  if (dist <= 1.0) return true;

  const stepSize = 1.0;
  const stepCount = Math.max(1, Math.floor(dist / stepSize));
  const invSteps = 1 / stepCount;
  const heightBias = 0.7;

  for (let i = 1; i < stepCount; i++) {
    const t = i * invSteps;
    const sx = surfaceX + dx * t;
    const sy = surfaceY + dy * t;
    const rayH = surfaceH + (lightH - surfaceH) * t;
    const terrainH = sampleHeightAtMapPixel(sx, sy) * heightScaleValue;
    if (terrainH > rayH + heightBias) {
      return false;
    }
  }

  return true;
}

function applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight) {
  if (sourceWidth === pointLightBakeCanvas.width && sourceHeight === pointLightBakeCanvas.height) {
    pointLightBakeCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
  } else if (pointLightBakeTempCtx) {
    pointLightBakeTempCanvas.width = sourceWidth;
    pointLightBakeTempCanvas.height = sourceHeight;
    pointLightBakeTempCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
    pointLightBakeCtx.imageSmoothingEnabled = false;
    pointLightBakeCtx.clearRect(0, 0, pointLightBakeCanvas.width, pointLightBakeCanvas.height);
    pointLightBakeCtx.drawImage(pointLightBakeTempCanvas, 0, 0, pointLightBakeCanvas.width, pointLightBakeCanvas.height);
  } else {
    pointLightBakeCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
  }
  uploadImageToTexture(pointLightTex, pointLightBakeCanvas);
  requestOverlayDraw();
}

function schedulePointLightBake() {
  pointLightBakeOrchestrator.scheduleBake();
}

function bakePointLightsTexture() {
  pointLightBakeOrchestrator.bakeNow();
}

function bakePointLightsTextureSync(useReducedResolution = false) {
  const fullWidth = pointLightBakeCanvas.width;
  const fullHeight = pointLightBakeCanvas.height;
  const scale = useReducedResolution ? POINT_LIGHT_BAKE_LIVE_SCALE : 1;
  const w = Math.max(1, Math.round(fullWidth * scale));
  const h = Math.max(1, Math.round(fullHeight * scale));
  const mapScaleX = fullWidth / w;
  const mapScaleY = fullHeight / h;
  const heightScaleValue = Math.max(1, Number(heightScaleInput.value) || 1);
  const pixelCount = w * h;
  const rgba = new Uint8ClampedArray(pixelCount * 4);
  const accumColor = new Float32Array(pixelCount * 3);
  const accumWeight = new Float32Array(pixelCount);
  const accumFlicker = new Float32Array(pixelCount);
  const accumFlickerSpeed = new Float32Array(pixelCount);

  if (pointLights.length > 0) {
    for (const light of pointLights) {
      const radiusMapPx = Math.max(1, Number(light.strength) || 1);
      const intensityMul = clamp(Number(light.intensity), 0, 4);
      const flickerRaw = Number(light.flicker);
      const flickerMul = clamp(Number.isFinite(flickerRaw) ? flickerRaw : DEFAULT_POINT_LIGHT_FLICKER, 0, 1);
      const flickerSpeedRaw = Number(light.flickerSpeed);
      const flickerSpeedMul = clamp(Number.isFinite(flickerSpeedRaw) ? flickerSpeedRaw : DEFAULT_POINT_LIGHT_FLICKER_SPEED, 0, 1);
      if (intensityMul <= 0.0001) continue;
      const lightTerrainHeight = sampleHeightAtMapPixel(light.pixelX, light.pixelY) * heightScaleValue;
      const lightHeight = lightTerrainHeight + (Number(light.heightOffset) || 0);
      const minX = Math.max(0, Math.floor((light.pixelX - radiusMapPx) / mapScaleX));
      const maxX = Math.min(w - 1, Math.ceil((light.pixelX + radiusMapPx) / mapScaleX));
      const minY = Math.max(0, Math.floor((light.pixelY - radiusMapPx) / mapScaleY));
      const maxY = Math.min(h - 1, Math.ceil((light.pixelY + radiusMapPx) / mapScaleY));
      const radiusSq = radiusMapPx * radiusMapPx;

      for (let y = minY; y <= maxY; y++) {
        const mapY = (y + 0.5) * mapScaleY - 0.5;
        const dy = light.pixelY - mapY;
        for (let x = minX; x <= maxX; x++) {
          const mapX = (x + 0.5) * mapScaleX - 0.5;
          const dx = light.pixelX - mapX;
          const distSq = dx * dx + dy * dy;
          if (distSq > radiusSq) continue;
          const falloff = Math.max(0, 1 - Math.sqrt(distSq) / radiusMapPx);
          if (falloff <= 0) continue;
          const surfaceHeight = sampleHeightAtMapPixel(mapX, mapY) * heightScaleValue;
          if (!hasLineOfSightToLight(mapX, mapY, surfaceHeight, light.pixelX, light.pixelY, lightHeight, heightScaleValue)) {
            continue;
          }
          const normal = sampleNormalAtMapPixel(mapX, mapY);
          const toLight = normalize3(dx, dy, lightHeight - surfaceHeight);
          const ndotl = Math.max(0, normal[0] * toLight[0] + normal[1] * toLight[1] + normal[2] * toLight[2]);
          const contribution = falloff * ndotl * intensityMul;
          if (contribution <= 0) continue;
          const pixelIdx = y * w + x;
          const baseIdx = pixelIdx * 3;
          accumWeight[pixelIdx] += contribution;
          accumFlicker[pixelIdx] += contribution * flickerMul;
          accumFlickerSpeed[pixelIdx] += contribution * flickerSpeedMul;
          accumColor[baseIdx] += light.color[0] * contribution;
          accumColor[baseIdx + 1] += light.color[1] * contribution;
          accumColor[baseIdx + 2] += light.color[2] * contribution;
        }
      }
    }
  }

  for (let pixelIdx = 0, j = 0; pixelIdx < accumWeight.length; pixelIdx++, j += 4) {
    const weight = accumWeight[pixelIdx];
    if (weight <= 0.000001) continue;
    const baseIdx = pixelIdx * 3;
    const intensityR = 1 - Math.exp(-accumColor[baseIdx] * POINT_LIGHT_BLEND_EXPOSURE);
    const intensityG = 1 - Math.exp(-accumColor[baseIdx + 1] * POINT_LIGHT_BLEND_EXPOSURE);
    const intensityB = 1 - Math.exp(-accumColor[baseIdx + 2] * POINT_LIGHT_BLEND_EXPOSURE);
    rgba[j] = Math.round(clamp(accumColor[baseIdx] * intensityR, 0, 1) * 255);
    rgba[j + 1] = Math.round(clamp(accumColor[baseIdx + 1] * intensityG, 0, 1) * 255);
    rgba[j + 2] = Math.round(clamp(accumColor[baseIdx + 2] * intensityB, 0, 1) * 255);
    const flickerAvg = clamp(accumFlicker[pixelIdx] / weight, 0, 1);
    const flickerSpeedAvg = clamp(accumFlickerSpeed[pixelIdx] / weight, 0, 1);
    const flickerNibble = Math.round(flickerAvg * 15);
    const flickerSpeedNibble = Math.round(flickerSpeedAvg * 15);
    rgba[j + 3] = flickerNibble * 16 + flickerSpeedNibble;
  }

  applyPointLightBakeRgba(rgba, w, h);
}

function updatePointLightStrengthLabel() {
  const value = Math.round(clamp(Number(pointLightStrengthInput.value), 1, 200));
  pointLightStrengthValue.textContent = `${value} px`;
}

function updatePointLightIntensityLabel() {
  const value = clamp(Number(pointLightIntensityInput.value), 0, 4);
  pointLightIntensityValue.textContent = `${value.toFixed(2)}x`;
}

function updatePointLightHeightOffsetLabel() {
  const value = Math.round(clamp(Number(pointLightHeightOffsetInput.value), -120, 240));
  pointLightHeightOffsetValue.textContent = `${value} px`;
}

function updatePointLightFlickerLabel() {
  const value = clamp(Number(pointLightFlickerInput.value), 0, 1);
  pointLightFlickerValue.textContent = value.toFixed(2);
}

function updatePointLightFlickerSpeedLabel() {
  const value = clamp(Number(pointLightFlickerSpeedInput.value), 0, 1);
  pointLightFlickerSpeedValue.textContent = value.toFixed(2);
}

function updateCursorLightStrengthLabel() {
  const value = Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200));
  cursorLightStrengthValue.textContent = `${value} px`;
}

function updateCursorLightHeightOffsetLabel() {
  const value = Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120));
  cursorLightHeightOffsetValue.textContent = `${value}`;
}

function updateCursorLightModeUi() {
  const followTerrain = cursorLightFollowHeightToggle.checked;
  cursorLightHeightOffsetInput.disabled = !followTerrain;
}

function setTopicPanelVisible(visible) {
  topicPanelEl.classList.toggle("hidden", !visible);
}

function getRuntimeMode() {
  return normalizeRuntimeMode(runtimeCore.store.getState().mode);
}

function canUseTopicInCurrentMode(topic) {
  return canUseModeTopic(getRuntimeMode(), topic);
}

function canUseInteractionInCurrentMode(mode) {
  return canUseModeInteraction(getRuntimeMode(), mode);
}

function setActiveTopic(topicName) {
  if (topicName && !canUseTopicInCurrentMode(topicName)) {
    setStatus(`'${topicName}' panel is unavailable in ${getRuntimeMode()} mode.`);
    topicName = "";
  }
  let opened = false;
  for (const btn of topicButtons) {
    const active = btn.dataset.topic === topicName;
    btn.classList.toggle("active", active);
    if (active) opened = true;
  }
  for (const card of topicCards) {
    const active = card.dataset.topic === topicName;
    card.classList.toggle("active", active);
    if (active) {
      topicPanelTitleEl.textContent = card.dataset.title || "Settings";
    }
  }
  setTopicPanelVisible(opened);
}

function updateModeCapabilitiesUi() {
  const mode = getRuntimeMode();
  for (const btn of topicButtons) {
    const topic = btn.dataset.topic || "";
    const enabled = canUseModeTopic(mode, topic);
    btn.disabled = !enabled;
    btn.classList.toggle("disabled", !enabled);
  }
  const activeTopicButton = topicButtons.find((btn) => btn.classList.contains("active"));
  const activeTopic = activeTopicButton ? activeTopicButton.dataset.topic || "" : "";
  if (activeTopic && !canUseModeTopic(mode, activeTopic)) {
    setActiveTopic("");
  }
  const canLighting = canUseModeInteraction(mode, "lighting");
  const canPathfinding = canUseModeInteraction(mode, "pathfinding");
  dockLightingModeToggle.disabled = !canLighting;
  dockPathfindingModeToggle.disabled = !canPathfinding;
  if (!canUseModeInteraction(mode, interactionMode)) {
    setInteractionMode("none");
  }
}

function updateCursorLightFromPointer(clientX, clientY) {
  if (!cursorLightModeToggle.checked) {
    cursorLightState.active = false;
    return;
  }
  const ndc = clientToNdc(clientX, clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  const inside = uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1;
  cursorLightState.active = inside;
  if (!inside) return;
  cursorLightState.uvX = uv.x;
  cursorLightState.uvY = uv.y;
}

function updateLightEditorUi() {
  const selected = getSelectedPointLight();
  if (!selected || !lightEditDraft) {
    lightEditorEmptyEl.style.display = "block";
    lightEditorFieldsEl.classList.remove("active");
    lightCoordEl.textContent = "Coord: (-, -)";
    return;
  }

  lightEditorEmptyEl.style.display = "none";
  lightEditorFieldsEl.classList.add("active");
  lightCoordEl.textContent = `Coord: (${selected.pixelX}, ${selected.pixelY})`;
  pointLightColorInput.value = rgbToHex(lightEditDraft.color);
  pointLightStrengthInput.value = String(Math.round(lightEditDraft.strength));
  pointLightIntensityInput.value = String(clamp(lightEditDraft.intensity, 0, 4));
  pointLightHeightOffsetInput.value = String(Math.round(lightEditDraft.heightOffset));
  pointLightFlickerInput.value = String(clamp(lightEditDraft.flicker, 0, 1));
  pointLightFlickerSpeedInput.value = String(clamp(lightEditDraft.flickerSpeed, 0, 1));
  updatePointLightStrengthLabel();
  updatePointLightIntensityLabel();
  updatePointLightHeightOffsetLabel();
  updatePointLightFlickerLabel();
  updatePointLightFlickerSpeedLabel();
}

function beginLightEdit(light) {
  const flickerRaw = Number(light.flicker);
  const flickerSpeedRaw = Number(light.flickerSpeed);
  selectedLightId = light.id;
  lightEditDraft = {
    color: [...light.color],
    strength: light.strength,
    intensity: light.intensity,
    heightOffset: light.heightOffset,
    flicker: clamp(Number.isFinite(flickerRaw) ? flickerRaw : DEFAULT_POINT_LIGHT_FLICKER, 0, 1),
    flickerSpeed: clamp(Number.isFinite(flickerSpeedRaw) ? flickerSpeedRaw : DEFAULT_POINT_LIGHT_FLICKER_SPEED, 0, 1),
  };
  updateLightEditorUi();
}

function applyDraftToSelectedPointLight() {
  const selected = getSelectedPointLight();
  if (!selected || !lightEditDraft) return null;
  selected.color = [...lightEditDraft.color];
  selected.strength = Math.round(clamp(lightEditDraft.strength, 1, 200));
  selected.intensity = clamp(Number(lightEditDraft.intensity), 0, 4);
  selected.heightOffset = Math.round(clamp(lightEditDraft.heightOffset, -120, 240));
  selected.flicker = clamp(Number(lightEditDraft.flicker), 0, 1);
  selected.flickerSpeed = clamp(Number(lightEditDraft.flickerSpeed), 0, 1);
  return selected;
}

function rebakeIfPointLightLiveUpdateEnabled() {
  if (!pointLightLiveUpdateToggle.checked) return;
  if (!applyDraftToSelectedPointLight()) return;
  schedulePointLightBake();
}

function findPointLightAtPixel(pixelX, pixelY, radiusPx = POINT_LIGHT_SELECT_RADIUS) {
  const maxDistSq = radiusPx * radiusPx;
  let best = null;
  let bestDistSq = Infinity;
  for (const light of pointLights) {
    const dx = light.pixelX - pixelX;
    const dy = light.pixelY - pixelY;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxDistSq || distSq >= bestDistSq) continue;
    bestDistSq = distSq;
    best = light;
  }
  return best;
}

function createPointLight(pixelX, pixelY) {
  const light = {
    id: nextPointLightId++,
    pixelX,
    pixelY,
    strength: 30,
    intensity: 1,
    heightOffset: 8,
    flicker: DEFAULT_POINT_LIGHT_FLICKER,
    flickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
    color: hexToRgb01("#ff9b2f"),
  };
  pointLights.push(light);
  bakePointLightsTexture();
  beginLightEdit(light);
  setStatus(`Created point light at (${pixelX}, ${pixelY})`);
}

function applyMapSizeChangeIfNeeded(changed) {
  if (!changed) return;
  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
  reseedSwarmAgents(getSwarmSettings().agentCount);
}
bakePointLightsTexture();
updateLightEditorUi();

let zoom = 1;
const zoomMin = 0.5;
const zoomMax = 32;
const panWorld = { x: 0, y: 0 };
let isMiddleDragging = false;
let lastDragClient = { x: 0, y: 0 };
let fogColorManual = false;
const cursorLightState = {
  uvX: 0.5,
  uvY: 0.5,
  active: false,
  color: hexToRgb01(cursorLightColorInput.value),
  strength: Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200)),
  heightOffset: Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120)),
  useTerrainHeight: cursorLightFollowHeightToggle.checked,
  showGizmo: cursorLightGizmoToggle.checked,
};

const cycleState = {
  hour: 9.5,
};
let isCycleHourScrubbing = false;

const runtimeCore = createRuntimeCore();
const dispatchCoreCommand = createCoreCommandDispatch(runtimeCore);
const entityStore = createEntityStore();
registerMainSettingsContracts(runtimeCore.settingsRegistry, {
  serializeLighting: serializeLightingSettingsLegacy,
  applyLighting: applyLightingSettingsLegacy,
  serializeFog: serializeFogSettingsLegacy,
  applyFog: applyFogSettingsLegacy,
  serializeParallax: serializeParallaxSettingsLegacy,
  applyParallax: applyParallaxSettingsLegacy,
  serializeClouds: serializeCloudSettingsLegacy,
  applyClouds: applyCloudSettingsLegacy,
  serializeWater: serializeWaterSettingsLegacy,
  applyWater: applyWaterSettingsLegacy,
  serializeInteraction: serializeInteractionSettingsLegacy,
  applyInteraction: applyInteractionSettingsLegacy,
  serializeSwarm: serializeSwarmDataLegacy,
  applySwarm: applySwarmData,
});
const renderResources = createRenderResources({ gl, canvas });
const renderer = createRenderer({ resources: renderResources });
renderer.registerPass("shadow", createShadowPass({ renderShadowPipeline }));
renderer.registerPass(
  "shadowBlur",
  createBlurPass({
    gl,
    shadowSize,
    shadowBlurFbo,
    shadowBlurProgram,
    shadowRawTex,
    shadowBlurUniforms,
    getBlurRadiusPx: () => clamp(Number(shadowBlurInput.value), 0, 3),
  }),
);
renderer.registerPass(
  "mainTerrain",
  createMainTerrainPass({
    resources: renderResources,
    uploadUniforms,
    drawTerrain: () => {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  }),
);
renderer.registerPass("backgroundClear", {
    execute(frame) {
      const bg = frame.backgroundColorRgb || [0, 0, 0];
      renderResources.clearColor(bg[0], bg[1], bg[2], 1);
    },
});

registerMainCommands(runtimeCore.commandBus, {
  panWorld,
  zoomMin,
  zoomMax,
  lastDragClient,
  cycleState,
  cursorLightState,
  movePreviewState,
  playerState,
  swarmFollowState,
  swarmState,
  swarmFollowTargetInput,
  getZoom: () => zoom,
  setZoom: (value) => {
    zoom = value;
  },
  getInteractionMode: () => interactionMode,
  setMiddleDragging: (value) => {
    isMiddleDragging = value;
  },
  setCycleHourScrubbing: (value) => {
    isCycleHourScrubbing = value;
  },
  clamp,
  clientToNdc,
  worldFromNdc,
  setInteractionMode,
  requestOverlayDraw,
  updateCycleHourLabel,
  updateCursorLightModeUi,
  updateCursorLightStrengthLabel,
  updateCursorLightHeightOffsetLabel,
  hexToRgb01,
  findPointLightAtPixel,
  beginLightEdit,
  setStatus,
  createPointLight,
  extractPathTo,
  setPlayerPosition,
  rebuildMovementField,
  getPathfindingStateSnapshot,
  updatePathfindingRangeLabel,
  updatePathWeightLabels,
  updatePathSlopeCutoffLabel,
  updatePathBaseCostLabel,
  updateParallaxStrengthLabel,
  updateParallaxBandsLabel,
  updateParallaxUi,
  updateShadowBlurLabel,
  updateVolumetricLabels,
  updateVolumetricUi,
  updatePointFlickerLabels,
  updatePointFlickerUi,
  updateFogAlphaLabels,
  updateFogFalloffLabel,
  updateFogStartOffsetLabel,
  updateFogUi,
  markFogColorManual: () => {
    fogColorManual = true;
  },
  updateCloudLabels,
  updateCloudUi,
  updateWaterLabels,
  updateWaterUi,
  rebuildFlowMapTexture,
  markSimulationKnobsDirty,
  serializeLightingSettings,
  serializeParallaxSettings,
  serializeFogSettings,
  serializeCloudSettings,
  serializeWaterSettings,
  updateSwarmUi,
  updateSwarmLabels,
  updateSwarmStatsPanel,
  normalizeSwarmFollowZoomInputs,
  normalizeSwarmHeightRangeInputs,
  reseedSwarmAgents,
  swarmAgentCountInput,
  swarmEnabledToggle,
  swarmCursorState,
  isSwarmEnabled,
  getSwarmSettings,
  resetSwarmFollowSpeedSmoothing,
  updateSwarmFollowButtonUi,
  chooseRandomFollowHawkIndex,
  chooseRandomFollowAgentIndex,
});
let previousMode = normalizeRuntimeMode(runtimeCore.store.getState().mode);
runtimeCore.store.subscribe((nextState) => {
  const nextMode = normalizeRuntimeMode(nextState ? nextState.mode : previousMode);
  if (nextMode === previousMode) {
    return;
  }
  previousMode = nextMode;
  updateModeCapabilitiesUi();
});

runtimeCore.scheduler.addSystem(
  createTimeSystem({
    clamp,
    wrapHour,
    cycleSpeedInput,
    cycleState,
    isCycleHourScrubbing: () => isCycleHourScrubbing,
    setCycleHourSliderFromState,
    setTimeState: () => {},
    updateStoreTime: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            ...value,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.addSystem(
  createLightingSystem({
    computeLightingParams,
    setLightingState: () => {},
    updateStoreLighting: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          lighting: {
            ...prev.systems.lighting,
            ...value,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.addSystem(
  createFogSystem({
    clamp,
    fogToggle,
    fogMinAlphaInput,
    fogMaxAlphaInput,
    fogFalloffInput,
    fogStartOffsetInput,
    setFogState: () => {},
    updateStoreFog: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          fog: {
            ...prev.systems.fog,
            ...value,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.addSystem(
  createCloudSystem({
    clamp,
    cloudToggle,
    cloudCoverageInput,
    cloudSoftnessInput,
    cloudOpacityInput,
    cloudScaleInput,
    cloudSpeed1Input,
    cloudSpeed2Input,
    cloudSunParallaxInput,
    cloudSunProjectToggle,
    setCloudState: () => {},
    updateStoreClouds: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          clouds: {
            ...prev.systems.clouds,
            ...value,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.addSystem(
  createWaterFxSystem({
    clamp,
    hexToRgb01,
    waterFxToggle,
    waterFlowDownhillToggle,
    waterFlowInvertDownhillToggle,
    waterFlowDebugToggle,
    waterFlowDirectionInput,
    waterLocalFlowMixInput,
    waterDownhillBoostInput,
    waterFlowStrengthInput,
    waterFlowSpeedInput,
    waterFlowScaleInput,
    waterShimmerStrengthInput,
    waterGlintStrengthInput,
    waterGlintSharpnessInput,
    waterShoreFoamStrengthInput,
    waterShoreWidthInput,
    waterReflectivityInput,
    waterTintColorInput,
    waterTintStrengthInput,
    setWaterFxState: () => {},
    updateStoreWaterFx: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          waterFx: {
            ...prev.systems.waterFx,
            ...value,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.addSystem(
  createWeatherSystem({
    clamp,
    updateStoreWeather: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          weather: {
            ...prev.simulation.weather,
            ...value,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.addSystem(
  createPathfindingSystem({
    getPathfindingState: getPathfindingStateSnapshot,
    setPathfindingState: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        gameplay: {
          ...prev.gameplay,
          pathfinding: {
            ...prev.gameplay.pathfinding,
            ...value,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.addSystem(
  createMovementSystem({
    entityStore,
    getPlayerState: () => ({
      pixelX: playerState.pixelX,
      pixelY: playerState.pixelY,
    }),
    setPlayerSnapshot: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        gameplay: {
          ...prev.gameplay,
          player: {
            ...prev.gameplay.player,
            pixelX: value.pixelX,
            pixelY: value.pixelY,
          },
        },
      }));
    },
  }),
);

runtimeCore.scheduler.initAll({ nowMs: 0, dtSec: 0 }, runtimeCore.store.getState());

function resetCamera() {
  dispatchCoreCommand({ type: "core/camera/reset" });
}

function getScreenAspect() {
  return canvas.width > 0 && canvas.height > 0 ? canvas.width / canvas.height : 1;
}

function getMapAspect() {
  return splatSize.width / splatSize.height;
}

function getSwarmCursorMode() {
  const mode = String(swarmCursorModeInput.value || "none");
  if (mode === "attract" || mode === "repel") return mode;
  return "none";
}

function getSwarmSettings() {
  const minHeight = Math.round(clamp(Number(swarmMinHeightInput.value), 0, SWARM_Z_MAX));
  const rawMaxHeight = Math.round(clamp(Number(swarmMaxHeightInput.value), 0, SWARM_Z_MAX));
  const maxHeight = Math.max(minHeight, rawMaxHeight);
  const followZoomOut = clamp(Number(swarmFollowZoomOutInput.value), zoomMin, zoomMax);
  const rawFollowZoomIn = clamp(Number(swarmFollowZoomInInput.value), zoomMin, zoomMax);
  const followZoomIn = Math.max(followZoomOut, rawFollowZoomIn);
  const followAgentSpeedSmoothing = clamp(Number(swarmFollowAgentSpeedSmoothingInput.value), 0.01, 0.25);
  const followAgentZoomSmoothing = clamp(Number(swarmFollowAgentZoomSmoothingInput.value), 0.01, 0.25);
  return {
    useAgentSwarm: swarmEnabledToggle.checked,
    useLitSwarm: swarmLitModeToggle.checked,
    followZoomBySpeed: swarmFollowZoomToggle.checked,
    followZoomIn,
    followZoomOut,
    followHawkRangeGizmo: swarmFollowHawkRangeGizmoToggle.checked,
    followAgentSpeedSmoothing,
    followAgentZoomSmoothing,
    showStatsPanel: swarmStatsPanelToggle.checked,
    showTerrainInSwarm: swarmShowTerrainToggle.checked,
    backgroundColor: swarmBackgroundColorInput.value,
    agentCount: Math.round(clamp(Number(swarmAgentCountInput.value), 100, 1000)),
    simulationSpeed: clamp(Number(swarmUpdateIntervalInput.value), 0.1, 20),
    maxSpeed: clamp(Number(swarmMaxSpeedInput.value), 30, 300),
    maxSteering: clamp(Number(swarmSteeringMaxInput.value), 10, 500),
    variationStrengthPct: Math.round(clamp(Number(swarmVariationStrengthInput.value), 0, 50)),
    neighborRadius: clamp(Number(swarmNeighborRadiusInput.value), 10, 200),
    minHeight,
    maxHeight,
    separationRadius: clamp(Number(swarmSeparationRadiusInput.value), 6, 120),
    alignmentWeight: clamp(Number(swarmAlignmentWeightInput.value), 0, 4),
    cohesionWeight: clamp(Number(swarmCohesionWeightInput.value), 0, 4),
    separationWeight: clamp(Number(swarmSeparationWeightInput.value), 0, 6),
    wanderWeight: clamp(Number(swarmWanderWeightInput.value), 0, 2),
    restChancePct: clamp(Number(swarmRestChanceInput.value), 0, 0.002),
    restTicks: Math.round(clamp(Number(swarmRestTicksInput.value), 100, 10000)),
    breedingThreshold: Math.round(clamp(Number(swarmBreedingThresholdInput.value), 0, 1000)),
    breedingSpawnChance: clamp(Number(swarmBreedingSpawnChanceInput.value), 0, 1),
    cursorMode: getSwarmCursorMode(),
    cursorStrength: clamp(Number(swarmCursorStrengthInput.value), 0, 8),
    cursorRadius: clamp(Number(swarmCursorRadiusInput.value), 20, 260),
    useHawk: swarmHawkEnabledToggle.checked,
    hawkCount: Math.round(clamp(Number(swarmHawkCountInput.value), 0, 20)),
    hawkColor: swarmHawkColorInput.value,
    hawkSpeed: clamp(Number(swarmHawkSpeedInput.value), 30, 420),
    hawkSteering: clamp(Number(swarmHawkSteeringInput.value), 20, 700),
    hawkTargetRange: Math.round(clamp(Number(swarmHawkTargetRangeInput.value), 20, 500)),
  };
}

function getPathfindingStateSnapshot() {
  return {
    range: Math.round(clamp(Number(pathfindingRangeInput.value), 30, 300)),
    weightSlope: clamp(Number(pathWeightSlopeInput.value), 0, 10),
    weightHeight: clamp(Number(pathWeightHeightInput.value), 0, 10),
    weightWater: clamp(Number(pathWeightWaterInput.value), 0, 100),
    slopeCutoff: Math.round(clamp(Number(pathSlopeCutoffInput.value), 0, 90)),
    baseCost: clamp(Number(pathBaseCostInput.value), 0, 2),
  };
}

function getSwarmRuntimeStateSnapshot() {
  return {
    enabled: isSwarmEnabled(),
    count: Math.max(0, Math.round(Number(swarmState.count) || 0)),
    followEnabled: Boolean(swarmFollowState.enabled),
    followTargetType: swarmFollowState.targetType === "hawk" ? "hawk" : "agent",
  };
}

function getWeatherInputSnapshot() {
  const prev = runtimeCore.store.getState().simulation.weather;
  return {
    type: typeof prev.type === "string" ? prev.type : "clear",
    intensity: clamp(Number(prev.intensity), 0, 1),
    windDirDeg: clamp(Number(prev.windDirDeg), 0, 360),
    windSpeed: clamp(Number(prev.windSpeed), 0, 1),
    localModulation: clamp(Number(prev.localModulation), 0, 1),
  };
}

const simulationKnobDirty = {
  lighting: true,
  parallax: true,
  fog: true,
  clouds: true,
  waterFx: true,
};
let cachedSimulationKnobs = null;

function markSimulationKnobsDirty(section) {
  if (section === "lighting" || section === "parallax" || section === "fog" || section === "clouds") {
    simulationKnobDirty[section] = true;
    return;
  }
  if (section === "waterfx") {
    simulationKnobDirty.waterFx = true;
    return;
  }
  simulationKnobDirty.lighting = true;
  simulationKnobDirty.parallax = true;
  simulationKnobDirty.fog = true;
  simulationKnobDirty.clouds = true;
  simulationKnobDirty.waterFx = true;
}

function getSimulationKnobsSnapshot() {
  const nextLighting = serializeLightingSettings();
  const nextFog = serializeFogSettings();

  if (!cachedSimulationKnobs) {
    cachedSimulationKnobs = {
      lighting: nextLighting,
      parallax: serializeParallaxSettings(),
      fog: nextFog,
      clouds: serializeCloudSettings(),
      waterFx: serializeWaterSettings(),
    };
    simulationKnobDirty.lighting = false;
    simulationKnobDirty.parallax = false;
    simulationKnobDirty.fog = false;
    simulationKnobDirty.clouds = false;
    simulationKnobDirty.waterFx = false;
    return cachedSimulationKnobs;
  }
  if (
    && !simulationKnobDirty.parallax
    && !simulationKnobDirty.clouds
    && !simulationKnobDirty.waterFx
  ) {
    cachedSimulationKnobs.lighting = nextLighting;
    cachedSimulationKnobs.fog = nextFog;
    return cachedSimulationKnobs;
  }
  cachedSimulationKnobs.lighting = nextLighting;
  simulationKnobDirty.lighting = false;
  if (simulationKnobDirty.parallax) {
    cachedSimulationKnobs.parallax = serializeParallaxSettings();
    simulationKnobDirty.parallax = false;
  }
  cachedSimulationKnobs.fog = nextFog;
  simulationKnobDirty.fog = false;
  if (simulationKnobDirty.clouds) {
    cachedSimulationKnobs.clouds = serializeCloudSettings();
    simulationKnobDirty.clouds = false;
  }
  if (simulationKnobDirty.waterFx) {
    cachedSimulationKnobs.waterFx = serializeWaterSettings();
    simulationKnobDirty.waterFx = false;
  }
  return cachedSimulationKnobs;
}

function getCursorLightSnapshot() {
  return {
    enabled: cursorLightModeToggle.checked,
    useTerrainHeight: Boolean(cursorLightState.useTerrainHeight),
    strength: Math.round(clamp(Number(cursorLightState.strength), 1, 200)),
    heightOffset: Math.round(clamp(Number(cursorLightState.heightOffset), 0, 120)),
  };
}

function setSwarmDefaults() {
  swarmEnabledToggle.checked = DEFAULT_SWARM_SETTINGS.useAgentSwarm;
  swarmLitModeToggle.checked = DEFAULT_SWARM_SETTINGS.useLitSwarm;
  swarmFollowZoomToggle.checked = DEFAULT_SWARM_SETTINGS.followZoomBySpeed;
  swarmFollowZoomInInput.value = String(DEFAULT_SWARM_SETTINGS.followZoomIn);
  swarmFollowZoomOutInput.value = String(DEFAULT_SWARM_SETTINGS.followZoomOut);
  swarmFollowHawkRangeGizmoToggle.checked = DEFAULT_SWARM_SETTINGS.followHawkRangeGizmo;
  swarmFollowAgentSpeedSmoothingInput.value = String(DEFAULT_SWARM_SETTINGS.followAgentSpeedSmoothing);
  swarmFollowAgentZoomSmoothingInput.value = String(DEFAULT_SWARM_SETTINGS.followAgentZoomSmoothing);
  swarmStatsPanelToggle.checked = DEFAULT_SWARM_SETTINGS.showStatsPanel;
  swarmShowTerrainToggle.checked = DEFAULT_SWARM_SETTINGS.showTerrainInSwarm;
  swarmBackgroundColorInput.value = DEFAULT_SWARM_SETTINGS.backgroundColor;
  swarmAgentCountInput.value = String(DEFAULT_SWARM_SETTINGS.agentCount);
  swarmUpdateIntervalInput.value = String(DEFAULT_SWARM_SETTINGS.simulationSpeed);
  swarmMaxSpeedInput.value = String(DEFAULT_SWARM_SETTINGS.maxSpeed);
  swarmSteeringMaxInput.value = String(DEFAULT_SWARM_SETTINGS.maxSteering);
  swarmVariationStrengthInput.value = String(DEFAULT_SWARM_SETTINGS.variationStrengthPct);
  swarmNeighborRadiusInput.value = String(DEFAULT_SWARM_SETTINGS.neighborRadius);
  swarmMinHeightInput.value = String(DEFAULT_SWARM_SETTINGS.minHeight);
  swarmMaxHeightInput.value = String(DEFAULT_SWARM_SETTINGS.maxHeight);
  swarmSeparationRadiusInput.value = String(DEFAULT_SWARM_SETTINGS.separationRadius);
  swarmAlignmentWeightInput.value = String(DEFAULT_SWARM_SETTINGS.alignmentWeight);
  swarmCohesionWeightInput.value = String(DEFAULT_SWARM_SETTINGS.cohesionWeight);
  swarmSeparationWeightInput.value = String(DEFAULT_SWARM_SETTINGS.separationWeight);
  swarmWanderWeightInput.value = String(DEFAULT_SWARM_SETTINGS.wanderWeight);
  swarmRestChanceInput.value = String(DEFAULT_SWARM_SETTINGS.restChancePct);
  swarmRestTicksInput.value = String(DEFAULT_SWARM_SETTINGS.restTicks);
  swarmBreedingThresholdInput.value = String(DEFAULT_SWARM_SETTINGS.breedingThreshold);
  swarmBreedingSpawnChanceInput.value = String(DEFAULT_SWARM_SETTINGS.breedingSpawnChance);
  swarmCursorModeInput.value = DEFAULT_SWARM_SETTINGS.cursorMode;
  swarmCursorStrengthInput.value = String(DEFAULT_SWARM_SETTINGS.cursorStrength);
  swarmCursorRadiusInput.value = String(DEFAULT_SWARM_SETTINGS.cursorRadius);
  swarmHawkEnabledToggle.checked = DEFAULT_SWARM_SETTINGS.useHawk;
  swarmHawkCountInput.value = String(DEFAULT_SWARM_SETTINGS.hawkCount);
  swarmHawkColorInput.value = DEFAULT_SWARM_SETTINGS.hawkColor;
  swarmHawkSpeedInput.value = String(DEFAULT_SWARM_SETTINGS.hawkSpeed);
  swarmHawkSteeringInput.value = String(DEFAULT_SWARM_SETTINGS.hawkSteering);
  swarmHawkTargetRangeInput.value = String(DEFAULT_SWARM_SETTINGS.hawkTargetRange);
  swarmFollowTargetInput.value = "agent";
  swarmFollowState.enabled = false;
  swarmFollowState.targetType = "agent";
  swarmFollowState.agentIndex = -1;
  swarmFollowState.hawkIndex = -1;
  swarmState.breedingActive = false;
  resetSwarmFollowSpeedSmoothing();
}

function isSwarmEnabled() {
  return swarmEnabledToggle.checked;
}

function updateSwarmLabels() {
  const settings = getSwarmSettings();
  swarmAgentCountValue.textContent = String(settings.agentCount);
  swarmFollowZoomInValue.textContent = `${settings.followZoomIn.toFixed(1)}x`;
  swarmFollowZoomOutValue.textContent = `${settings.followZoomOut.toFixed(1)}x`;
  swarmFollowAgentSpeedSmoothingValue.textContent = settings.followAgentSpeedSmoothing.toFixed(2);
  swarmFollowAgentZoomSmoothingValue.textContent = settings.followAgentZoomSmoothing.toFixed(2);
  swarmUpdateIntervalValue.textContent = `${settings.simulationSpeed.toFixed(1)}x`;
  swarmMaxSpeedValue.textContent = `${Math.round(settings.maxSpeed)} px/s`;
  swarmSteeringMaxValue.textContent = `${Math.round(settings.maxSteering)} px/s^2`;
  swarmVariationStrengthValue.textContent = `${Math.round(settings.variationStrengthPct)}%`;
  swarmNeighborRadiusValue.textContent = `${Math.round(settings.neighborRadius)} px`;
  swarmMinHeightValue.textContent = `${Math.round(settings.minHeight)}`;
  swarmMaxHeightValue.textContent = `${Math.round(settings.maxHeight)}`;
  swarmSeparationRadiusValue.textContent = `${Math.round(settings.separationRadius)} px`;
  swarmAlignmentWeightValue.textContent = settings.alignmentWeight.toFixed(2);
  swarmCohesionWeightValue.textContent = settings.cohesionWeight.toFixed(2);
  swarmSeparationWeightValue.textContent = settings.separationWeight.toFixed(2);
  swarmWanderWeightValue.textContent = settings.wanderWeight.toFixed(2);
  swarmRestChanceValue.textContent = settings.restChancePct.toFixed(4);
  swarmRestTicksValue.textContent = `${Math.round(settings.restTicks)}`;
  swarmBreedingThresholdValue.textContent = `${Math.round(settings.breedingThreshold)}`;
  swarmBreedingSpawnChanceValue.textContent = `${Math.round(settings.breedingSpawnChance * 100)}%`;
  swarmCursorStrengthValue.textContent = settings.cursorStrength.toFixed(1);
  swarmCursorRadiusValue.textContent = `${Math.round(settings.cursorRadius)} px`;
  swarmHawkCountValue.textContent = String(settings.hawkCount);
  swarmHawkSpeedValue.textContent = `${Math.round(settings.hawkSpeed)} px/s`;
  swarmHawkSteeringValue.textContent = `${Math.round(settings.hawkSteering)} px/s^2`;
  swarmHawkTargetRangeValue.textContent = `${Math.round(settings.hawkTargetRange)} px`;
}

function updateSwarmUi() {
  const swarmEnabled = isSwarmEnabled();
  const cursorMode = getSwarmCursorMode();
  const cursorControlsEnabled = swarmEnabled && cursorMode !== "none";
  const followZoomControlsEnabled = swarmEnabled && swarmFollowZoomToggle.checked;
  syncSwarmStatsPanelVisibility();
  swarmShowTerrainToggle.disabled = !swarmEnabled;
  swarmLitModeToggle.disabled = !swarmEnabled;
  swarmFollowToggleBtn.disabled = !swarmEnabled;
  swarmFollowTargetInput.disabled = !swarmEnabled;
  swarmFollowZoomToggle.disabled = !swarmEnabled;
  swarmFollowZoomInInput.disabled = !followZoomControlsEnabled;
  swarmFollowZoomOutInput.disabled = !followZoomControlsEnabled;
  swarmFollowHawkRangeGizmoToggle.disabled = !swarmEnabled;
  swarmFollowAgentSpeedSmoothingInput.disabled = !followZoomControlsEnabled;
  swarmFollowAgentZoomSmoothingInput.disabled = !followZoomControlsEnabled;
  swarmStatsPanelToggle.disabled = false;
  swarmBackgroundColorInput.disabled = !swarmEnabled;
  swarmAgentCountInput.disabled = !swarmEnabled;
  swarmUpdateIntervalInput.disabled = !swarmEnabled;
  swarmMaxSpeedInput.disabled = !swarmEnabled;
  swarmSteeringMaxInput.disabled = !swarmEnabled;
  swarmVariationStrengthInput.disabled = !swarmEnabled;
  swarmNeighborRadiusInput.disabled = !swarmEnabled;
  swarmMinHeightInput.disabled = !swarmEnabled;
  swarmMaxHeightInput.disabled = !swarmEnabled;
  swarmSeparationRadiusInput.disabled = !swarmEnabled;
  swarmAlignmentWeightInput.disabled = !swarmEnabled;
  swarmCohesionWeightInput.disabled = !swarmEnabled;
  swarmSeparationWeightInput.disabled = !swarmEnabled;
  swarmWanderWeightInput.disabled = !swarmEnabled;
  swarmRestChanceInput.disabled = !swarmEnabled;
  swarmRestTicksInput.disabled = !swarmEnabled;
  swarmBreedingThresholdInput.disabled = !swarmEnabled;
  swarmBreedingSpawnChanceInput.disabled = !swarmEnabled;
  swarmCursorModeInput.disabled = !swarmEnabled;
  swarmCursorStrengthInput.disabled = !cursorControlsEnabled;
  swarmCursorRadiusInput.disabled = !cursorControlsEnabled;
  swarmHawkEnabledToggle.disabled = !swarmEnabled;
  swarmHawkCountInput.disabled = !swarmEnabled || !swarmHawkEnabledToggle.checked;
  swarmHawkColorInput.disabled = !swarmEnabled || !swarmHawkEnabledToggle.checked;
  swarmHawkSpeedInput.disabled = !swarmEnabled || !swarmHawkEnabledToggle.checked;
  swarmHawkSteeringInput.disabled = !swarmEnabled || !swarmHawkEnabledToggle.checked;
  swarmHawkTargetRangeInput.disabled = !swarmEnabled || !swarmHawkEnabledToggle.checked;
}

function ensureSwarmBuffers(count) {
  if (swarmState.count === count) return;
  swarmState.count = count;
  swarmState.x = new Float32Array(count);
  swarmState.y = new Float32Array(count);
  swarmState.z = new Float32Array(count);
  swarmState.vx = new Float32Array(count);
  swarmState.vy = new Float32Array(count);
  swarmState.vz = new Float32Array(count);
  swarmState.speedScale = new Float32Array(count);
  swarmState.steerScale = new Float32Array(count);
  swarmState.isResting = new Uint8Array(count);
  swarmState.restTicksLeft = new Uint16Array(count);
  swarmState.ax = new Float32Array(count);
  swarmState.ay = new Float32Array(count);
  swarmState.az = new Float32Array(count);
}

function removeSwarmAgentAtIndex(removeIndex) {
  if (!Number.isInteger(removeIndex) || removeIndex < 0 || removeIndex >= swarmState.count) return false;
  const oldCount = swarmState.count;
  const newCount = oldCount - 1;
  if (newCount <= 0) {
    ensureSwarmBuffers(0);
    for (const hawk of swarmState.hawks) {
      hawk.targetIndex = -1;
    }
    swarmFollowState.agentIndex = -1;
    if (swarmFollowState.targetType === "agent") {
      swarmFollowState.enabled = false;
      resetSwarmFollowSpeedSmoothing();
    }
    return true;
  }

  const nextX = new Float32Array(newCount);
  const nextY = new Float32Array(newCount);
  const nextZ = new Float32Array(newCount);
  const nextVx = new Float32Array(newCount);
  const nextVy = new Float32Array(newCount);
  const nextVz = new Float32Array(newCount);
  const nextSpeedScale = new Float32Array(newCount);
  const nextSteerScale = new Float32Array(newCount);
  const nextIsResting = new Uint8Array(newCount);
  const nextRestTicksLeft = new Uint16Array(newCount);
  const nextAx = new Float32Array(newCount);
  const nextAy = new Float32Array(newCount);
  const nextAz = new Float32Array(newCount);

  let w = 0;
  for (let i = 0; i < oldCount; i++) {
    if (i === removeIndex) continue;
    nextX[w] = swarmState.x[i];
    nextY[w] = swarmState.y[i];
    nextZ[w] = swarmState.z[i];
    nextVx[w] = swarmState.vx[i];
    nextVy[w] = swarmState.vy[i];
    nextVz[w] = swarmState.vz[i];
    nextSpeedScale[w] = swarmState.speedScale[i];
    nextSteerScale[w] = swarmState.steerScale[i];
    nextIsResting[w] = swarmState.isResting[i];
    nextRestTicksLeft[w] = swarmState.restTicksLeft[i];
    nextAx[w] = swarmState.ax[i];
    nextAy[w] = swarmState.ay[i];
    nextAz[w] = swarmState.az[i];
    w++;
  }

  swarmState.count = newCount;
  swarmState.x = nextX;
  swarmState.y = nextY;
  swarmState.z = nextZ;
  swarmState.vx = nextVx;
  swarmState.vy = nextVy;
  swarmState.vz = nextVz;
  swarmState.speedScale = nextSpeedScale;
  swarmState.steerScale = nextSteerScale;
  swarmState.isResting = nextIsResting;
  swarmState.restTicksLeft = nextRestTicksLeft;
  swarmState.ax = nextAx;
  swarmState.ay = nextAy;
  swarmState.az = nextAz;

  const hawkTargetRange = getSwarmSettings().hawkTargetRange;
  for (const hawk of swarmState.hawks) {
    if (!Number.isInteger(hawk.targetIndex)) {
      hawk.targetIndex = chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, hawkTargetRange);
      continue;
    }
    if (hawk.targetIndex === removeIndex) {
      hawk.targetIndex = chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, hawkTargetRange);
    } else if (hawk.targetIndex > removeIndex) {
      hawk.targetIndex -= 1;
    }
  }

  if (swarmFollowState.targetType === "agent") {
    if (swarmFollowState.agentIndex === removeIndex) {
      swarmFollowState.agentIndex = chooseRandomFollowAgentIndex();
      if (swarmFollowState.agentIndex < 0) {
        swarmFollowState.enabled = false;
        resetSwarmFollowSpeedSmoothing();
      }
    } else if (swarmFollowState.agentIndex > removeIndex) {
      swarmFollowState.agentIndex -= 1;
    }
  }

  return true;
}

function appendSwarmAgentState(agent) {
  const oldCount = swarmState.count;
  const newCount = oldCount + 1;
  const nextX = new Float32Array(newCount);
  const nextY = new Float32Array(newCount);
  const nextZ = new Float32Array(newCount);
  const nextVx = new Float32Array(newCount);
  const nextVy = new Float32Array(newCount);
  const nextVz = new Float32Array(newCount);
  const nextSpeedScale = new Float32Array(newCount);
  const nextSteerScale = new Float32Array(newCount);
  const nextIsResting = new Uint8Array(newCount);
  const nextRestTicksLeft = new Uint16Array(newCount);
  const nextAx = new Float32Array(newCount);
  const nextAy = new Float32Array(newCount);
  const nextAz = new Float32Array(newCount);
  if (oldCount > 0) {
    nextX.set(swarmState.x);
    nextY.set(swarmState.y);
    nextZ.set(swarmState.z);
    nextVx.set(swarmState.vx);
    nextVy.set(swarmState.vy);
    nextVz.set(swarmState.vz);
    nextSpeedScale.set(swarmState.speedScale);
    nextSteerScale.set(swarmState.steerScale);
    nextIsResting.set(swarmState.isResting);
    nextRestTicksLeft.set(swarmState.restTicksLeft);
    nextAx.set(swarmState.ax);
    nextAy.set(swarmState.ay);
    nextAz.set(swarmState.az);
  }
  nextX[oldCount] = Number(agent.x) || 0;
  nextY[oldCount] = Number(agent.y) || 0;
  nextZ[oldCount] = Number(agent.z) || 0;
  nextVx[oldCount] = Number(agent.vx) || 0;
  nextVy[oldCount] = Number(agent.vy) || 0;
  nextVz[oldCount] = Number(agent.vz) || 0;
  nextSpeedScale[oldCount] = Number.isFinite(Number(agent.speedScale)) ? Number(agent.speedScale) : 1;
  nextSteerScale[oldCount] = Number.isFinite(Number(agent.steerScale)) ? Number(agent.steerScale) : 1;
  nextIsResting[oldCount] = Number(agent.isResting) ? 1 : 0;
  nextRestTicksLeft[oldCount] = Math.round(Math.max(0, Number(agent.restTicksLeft) || 0));
  nextAx[oldCount] = Number(agent.ax) || 0;
  nextAy[oldCount] = Number(agent.ay) || 0;
  nextAz[oldCount] = Number(agent.az) || 0;
  swarmState.count = newCount;
  swarmState.x = nextX;
  swarmState.y = nextY;
  swarmState.z = nextZ;
  swarmState.vx = nextVx;
  swarmState.vy = nextVy;
  swarmState.vz = nextVz;
  swarmState.speedScale = nextSpeedScale;
  swarmState.steerScale = nextSteerScale;
  swarmState.isResting = nextIsResting;
  swarmState.restTicksLeft = nextRestTicksLeft;
  swarmState.ax = nextAx;
  swarmState.ay = nextAy;
  swarmState.az = nextAz;
}

function spawnRestingBirdNear(parentX, parentY, settings) {
  const maxFlight = settings.maxHeight;
  const minFlight = settings.minHeight;
  const variation = settings.variationStrengthPct * 0.01;
  let spawnX = clamp(parentX + (Math.random() * 2 - 1) * 2, 0, Math.max(0, splatSize.width - 1));
  let spawnY = clamp(parentY + (Math.random() * 2 - 1) * 2, 0, Math.max(0, splatSize.height - 1));
  let found = false;
  for (let tries = 0; tries < 12; tries++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.8 + Math.random() * 2.2;
    const tx = clamp(parentX + Math.cos(angle) * radius, 0, Math.max(0, splatSize.width - 1));
    const ty = clamp(parentY + Math.sin(angle) * radius, 0, Math.max(0, splatSize.height - 1));
    if (!isSwarmCoordFlyable(tx, ty, maxFlight)) continue;
    if (isWaterAtSwarmCoord(tx, ty)) continue;
    spawnX = tx;
    spawnY = ty;
    found = true;
    break;
  }
  if (!found && (!isSwarmCoordFlyable(spawnX, spawnY, maxFlight) || isWaterAtSwarmCoord(spawnX, spawnY))) {
    return false;
  }
  const floorZ = Math.max(minFlight, terrainFloorAtSwarmCoord(spawnX, spawnY));
  appendSwarmAgentState({
    x: spawnX,
    y: spawnY,
    z: clamp(floorZ, minFlight, maxFlight),
    vx: 0,
    vy: 0,
    vz: 0,
    speedScale: 1 + (Math.random() * 2 - 1) * variation,
    steerScale: 1 + (Math.random() * 2 - 1) * variation,
    isResting: 1,
    restTicksLeft: Math.round(clamp(Number(settings.restTicks), 100, 10000)),
    ax: 0,
    ay: 0,
    az: 0,
  });
  return true;
}

function normalizeSwarmHeightRangeInputs(changed = "min") {
  let minHeight = Math.round(clamp(Number(swarmMinHeightInput.value), 0, SWARM_Z_MAX));
  let maxHeight = Math.round(clamp(Number(swarmMaxHeightInput.value), 0, SWARM_Z_MAX));
  if (minHeight > maxHeight) {
    if (changed === "min") {
      maxHeight = minHeight;
    } else {
      minHeight = maxHeight;
    }
  }
  swarmMinHeightInput.value = String(minHeight);
  swarmMaxHeightInput.value = String(maxHeight);
}

function normalizeSwarmFollowZoomInputs(changed = "out") {
  let zoomOut = clamp(Number(swarmFollowZoomOutInput.value), zoomMin, zoomMax);
  let zoomIn = clamp(Number(swarmFollowZoomInInput.value), zoomMin, zoomMax);
  if (zoomOut > zoomIn) {
    if (changed === "out") {
      zoomIn = zoomOut;
    } else {
      zoomOut = zoomIn;
    }
  }
  swarmFollowZoomOutInput.value = zoomOut.toFixed(1);
  swarmFollowZoomInInput.value = zoomIn.toFixed(1);
}

function chooseRandomSwarmTargetIndex() {
  if (swarmState.count <= 0) return -1;
  return Math.floor(Math.random() * swarmState.count);
}

function chooseRandomSwarmTargetIndexNear(centerX, centerY, rangePx) {
  if (swarmState.count <= 0) return -1;
  const radius = Math.max(0, Number(rangePx) || 0);
  if (radius <= 0) return chooseRandomSwarmTargetIndex();
  const radiusSq = radius * radius;
  let selected = -1;
  let matches = 0;
  for (let i = 0; i < swarmState.count; i++) {
    const dx = swarmState.x[i] - centerX;
    const dy = swarmState.y[i] - centerY;
    if (dx * dx + dy * dy > radiusSq) continue;
    matches += 1;
    if (Math.random() < 1 / matches) {
      selected = i;
    }
  }
  return selected >= 0 ? selected : chooseRandomSwarmTargetIndex();
}

function chooseRandomFollowAgentIndex() {
  return chooseRandomSwarmTargetIndex();
}

function chooseRandomFollowHawkIndex() {
  if (swarmState.hawks.length <= 0) return -1;
  return Math.floor(Math.random() * swarmState.hawks.length);
}

function updateSwarmFollowButtonUi() {
  const noun = swarmFollowState.targetType === "hawk" ? "Hawk" : "Agent";
  swarmFollowToggleBtn.textContent = swarmFollowState.enabled ? "Stop Follow" : `Follow ${noun} Mode`;
}

function resetSwarmFollowSpeedSmoothing() {
  swarmFollowState.speedNormFiltered = null;
}

function createSpawnedHawk(minFlight, maxFlight, targetRangePx) {
  const width = Math.max(1, splatSize.width);
  const height = Math.max(1, splatSize.height);
  const x = Math.random() * Math.max(1, width - 1);
  const y = Math.random() * Math.max(1, height - 1);
  const z = clamp(Math.max(minFlight, terrainFloorAtSwarmCoord(x, y) + 4), minFlight, maxFlight);
  return {
    x,
    y,
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    ax: 0,
    ay: 0,
    az: 0,
    targetIndex: chooseRandomSwarmTargetIndexNear(x, y, targetRangePx),
    lastKillTick: Math.max(0, Math.round(swarmState.stepCount)),
  };
}

function terrainFloorAtSwarmCoord(mapX, mapY) {
  return sampleHeightAtMapPixel(mapX, mapY) * SWARM_Z_MAX + SWARM_TERRAIN_CLEARANCE;
}

function isWaterAtSwarmCoord(mapX, mapY) {
  if (!waterImageData || !waterImageData.data) return false;
  return getGrayAt(waterImageData, mapX, mapY) > 0.01;
}

function isSwarmCoordFlyable(mapX, mapY, maxFlight) {
  return terrainFloorAtSwarmCoord(mapX, mapY) <= maxFlight;
}

function reseedSwarmAgents(count = getSwarmSettings().agentCount) {
  ensureSwarmBuffers(count);
  const settings = getSwarmSettings();
  const maxSpeed = settings.maxSpeed;
  const minFlight = settings.minHeight;
  const maxFlight = settings.maxHeight;
  const minSpeed = Math.max(10, maxSpeed * 0.45);
  const variation = settings.variationStrengthPct * 0.01;
  const width = Math.max(1, splatSize.width);
  const height = Math.max(1, splatSize.height);
  for (let i = 0; i < swarmState.count; i++) {
    let spawnX = 0;
    let spawnY = 0;
    let found = false;
    for (let tries = 0; tries < 40; tries++) {
      const tx = Math.random() * Math.max(1, width - 1);
      const ty = Math.random() * Math.max(1, height - 1);
      if (!isSwarmCoordFlyable(tx, ty, maxFlight)) continue;
      spawnX = tx;
      spawnY = ty;
      found = true;
      break;
    }
    if (!found) {
      spawnX = Math.random() * Math.max(1, width - 1);
      spawnY = Math.random() * Math.max(1, height - 1);
    }
    swarmState.x[i] = spawnX;
    swarmState.y[i] = spawnY;
    const zMin = Math.max(minFlight, terrainFloorAtSwarmCoord(spawnX, spawnY));
    swarmState.z[i] = clamp(zMin + Math.random() * Math.max(0, maxFlight - zMin), 0, maxFlight);
    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    swarmState.vx[i] = Math.cos(angle) * speed;
    swarmState.vy[i] = Math.sin(angle) * speed;
    swarmState.vz[i] = (Math.random() * 2 - 1) * speed * 0.2;
    swarmState.speedScale[i] = 1 + (Math.random() * 2 - 1) * variation;
    swarmState.steerScale[i] = 1 + (Math.random() * 2 - 1) * variation;
    swarmState.isResting[i] = 0;
    swarmState.restTicksLeft[i] = 0;
  }
  swarmState.lastUpdateMs = null;
  swarmState.stepCount = 0;
  swarmState.hawkKillIntervalSum = 0;
  swarmState.hawkKillCount = 0;
  swarmState.breedingActive = false;
  swarmState.hawks = [];
  if (settings.useHawk) {
    for (let i = 0; i < settings.hawkCount; i++) {
      swarmState.hawks.push(createSpawnedHawk(minFlight, maxFlight, settings.hawkTargetRange));
    }
  }
  swarmFollowState.agentIndex = swarmFollowState.enabled ? chooseRandomFollowAgentIndex() : -1;
  requestOverlayDraw();
}

function updateSwarmCursorFromPointer(clientX, clientY) {
  if (!isSwarmEnabled()) {
    swarmCursorState.active = false;
    return;
  }
  const ndc = clientToNdc(clientX, clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  const inside = uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1;
  swarmCursorState.active = inside;
  if (!inside) return;
  swarmCursorState.x = clamp(uv.x * splatSize.width, 0, Math.max(0, splatSize.width - 1));
  swarmCursorState.y = clamp((1 - uv.y) * splatSize.height, 0, Math.max(0, splatSize.height - 1));
}

function limitVector3(x, y, z, maxLen) {
  const len = Math.hypot(x, y, z);
  if (len <= maxLen || len <= 0.000001) {
    return [x, y, z];
  }
  const scale = maxLen / len;
  return [x * scale, y * scale, z * scale];
}

function hash01(seed) {
  const s = Math.sin(seed) * 43758.5453123;
  return s - Math.floor(s);
}

function stepSwarm(settings, dt, nowMs) {
  const width = Math.max(1, splatSize.width);
  const height = Math.max(1, splatSize.height);
  const maxX = Math.max(0, width - 1);
  const maxY = Math.max(0, height - 1);
  const neighborRadiusSq = settings.neighborRadius * settings.neighborRadius;
  const separationRadiusSq = settings.separationRadius * settings.separationRadius;
  const cursorRadiusSq = settings.cursorRadius * settings.cursorRadius;
  const minFlight = settings.minHeight;
  const maxFlight = settings.maxHeight;
  const hawks = swarmState.hawks;
  const restChancePerTick = clamp(settings.restChancePct, 0, 0.002);
  const restTicks = Math.round(clamp(settings.restTicks, 100, 10000));
  const hawkThreatRadiusSq = cursorRadiusSq;
  const maxBirds = Math.max(0, Math.round(settings.agentCount));
  const breedingThreshold = Math.round(clamp(Number(settings.breedingThreshold), 0, maxBirds));
  const breedingSpawnChance = clamp(Number(settings.breedingSpawnChance), 0, 1);
  const pendingRestBirths = [];

  if (!swarmState.breedingActive && swarmState.count < breedingThreshold) {
    swarmState.breedingActive = true;
  } else if (swarmState.breedingActive && swarmState.count >= maxBirds) {
    swarmState.breedingActive = false;
  }

  for (let i = 0; i < swarmState.count; i++) {
    const px = swarmState.x[i];
    const py = swarmState.y[i];
    const pz = swarmState.z[i];
    const vx = swarmState.vx[i];
    const vy = swarmState.vy[i];
    const vz = swarmState.vz[i];
    const speedScale = swarmState.speedScale[i] > 0 ? swarmState.speedScale[i] : 1;
    const steerScale = swarmState.steerScale[i] > 0 ? swarmState.steerScale[i] : 1;
    const agentMaxSpeed = settings.maxSpeed * speedScale;
    const agentMaxSteering = settings.maxSteering * steerScale;
    let hawkThreat = false;
    if (settings.useHawk && hawks.length > 0) {
      for (const hawk of hawks) {
        const hdx = hawk.x - px;
        const hdy = hawk.y - py;
        const hawkDistSq = hdx * hdx + hdy * hdy;
        if (hawkDistSq <= hawkThreatRadiusSq) {
          hawkThreat = true;
          break;
        }
      }
    }
    const onWater = isWaterAtSwarmCoord(px, py);
    if (swarmState.isResting[i]) {
      if (hawkThreat) {
        swarmState.isResting[i] = 0;
        swarmState.restTicksLeft[i] = 0;
      } else if (onWater) {
        swarmState.isResting[i] = 0;
        swarmState.restTicksLeft[i] = 0;
      } else {
        if (swarmState.restTicksLeft[i] > 0) {
          swarmState.restTicksLeft[i] -= 1;
        }
        if (swarmState.restTicksLeft[i] === 0) {
          swarmState.isResting[i] = 0;
        } else {
          const floorZ = Math.max(minFlight, terrainFloorAtSwarmCoord(px, py));
          swarmState.vx[i] = 0;
          swarmState.vy[i] = 0;
          swarmState.vz[i] = 0;
          swarmState.z[i] = clamp(floorZ, minFlight, maxFlight);
          swarmState.ax[i] = 0;
          swarmState.ay[i] = 0;
          swarmState.az[i] = 0;
          continue;
        }
      }
    }
    let alignX = 0;
    let alignY = 0;
    let alignZ = 0;
    let cohX = 0;
    let cohY = 0;
    let cohZ = 0;
    let sepX = 0;
    let sepY = 0;
    let sepZ = 0;
    let neighborCount = 0;
    let separationCount = 0;

    for (let j = 0; j < swarmState.count; j++) {
      if (i === j) continue;
      if (swarmState.isResting[j]) continue;
      const dx = swarmState.x[j] - px;
      const dy = swarmState.y[j] - py;
      const dz = swarmState.z[j] - pz;
      const dzScaled = dz * SWARM_Z_NEIGHBOR_SCALE;
      const distSq = dx * dx + dy * dy + dzScaled * dzScaled;
      if (distSq > neighborRadiusSq || distSq <= 0.000001) continue;
      neighborCount++;
      alignX += swarmState.vx[j];
      alignY += swarmState.vy[j];
      alignZ += swarmState.vz[j];
      cohX += swarmState.x[j];
      cohY += swarmState.y[j];
      cohZ += swarmState.z[j];
      if (distSq <= separationRadiusSq) {
        const invDist = 1 / Math.max(0.001, Math.sqrt(distSq));
        sepX -= dx * invDist;
        sepY -= dy * invDist;
        sepZ -= dzScaled * invDist;
        separationCount++;
      }
    }

    let accX = 0;
    let accY = 0;
    let accZ = 0;
    if (neighborCount > 0) {
      const invNeighbor = 1 / neighborCount;
      const avgVx = alignX * invNeighbor;
      const avgVy = alignY * invNeighbor;
      const avgVz = alignZ * invNeighbor;
      const alignLen = Math.hypot(avgVx, avgVy, avgVz);
      let alignTargetX = 0;
      let alignTargetY = 0;
      let alignTargetZ = 0;
      if (alignLen > 0.000001) {
        alignTargetX = (avgVx / alignLen) * settings.maxSpeed * speedScale;
        alignTargetY = (avgVy / alignLen) * settings.maxSpeed * speedScale;
        alignTargetZ = (avgVz / alignLen) * settings.maxSpeed * speedScale;
      }
      accX += (alignTargetX - vx) * settings.alignmentWeight;
      accY += (alignTargetY - vy) * settings.alignmentWeight;
      accZ += (alignTargetZ - vz) * settings.alignmentWeight;

      const centerX = cohX * invNeighbor;
      const centerY = cohY * invNeighbor;
      const centerZ = cohZ * invNeighbor;
      const toCenterX = centerX - px;
      const toCenterY = centerY - py;
      const toCenterZ = (centerZ - pz) * SWARM_Z_NEIGHBOR_SCALE;
      const toCenterLen = Math.hypot(toCenterX, toCenterY, toCenterZ);
      if (toCenterLen > 0.000001) {
        const cohTargetX = (toCenterX / toCenterLen) * settings.maxSpeed * speedScale;
        const cohTargetY = (toCenterY / toCenterLen) * settings.maxSpeed * speedScale;
        const cohTargetZ = (toCenterZ / toCenterLen) * settings.maxSpeed * speedScale;
        accX += (cohTargetX - vx) * settings.cohesionWeight;
        accY += (cohTargetY - vy) * settings.cohesionWeight;
        accZ += (cohTargetZ - vz) * settings.cohesionWeight;
      }
    }
    if (separationCount > 0) {
      const invSep = 1 / separationCount;
      const sepDirX = sepX * invSep;
      const sepDirY = sepY * invSep;
      const sepDirZ = sepZ * invSep;
      const sepLen = Math.hypot(sepDirX, sepDirY, sepDirZ);
      if (sepLen > 0.000001) {
        const sepTargetX = (sepDirX / sepLen) * settings.maxSpeed * speedScale;
        const sepTargetY = (sepDirY / sepLen) * settings.maxSpeed * speedScale;
        const sepTargetZ = (sepDirZ / sepLen) * settings.maxSpeed * speedScale;
        accX += (sepTargetX - vx) * settings.separationWeight;
        accY += (sepTargetY - vy) * settings.separationWeight;
        accZ += (sepTargetZ - vz) * settings.separationWeight;
      }
    }

    if (settings.wanderWeight > 0.0001) {
      const seed = (i + 1) * 12.9898 + nowMs * 0.0021;
      const angle = hash01(seed) * Math.PI * 2;
      accX += Math.cos(angle) * agentMaxSteering * settings.wanderWeight;
      accY += Math.sin(angle) * agentMaxSteering * settings.wanderWeight;
      accZ += (hash01(seed * 1.37 + 19.17) * 2 - 1) * agentMaxSteering * settings.wanderWeight * 0.35;
    }

    if (swarmCursorState.active && settings.cursorMode !== "none" && settings.cursorStrength > 0.0001) {
      const cdx = swarmCursorState.x - px;
      const cdy = swarmCursorState.y - py;
      const cursorDistSq = cdx * cdx + cdy * cdy;
      if (cursorDistSq <= cursorRadiusSq && cursorDistSq > 0.000001) {
        const cursorDist = Math.sqrt(cursorDistSq);
        const cursorFalloff = 1 - cursorDist / settings.cursorRadius;
        const dirSign = settings.cursorMode === "attract" ? 1 : -1;
        const force = dirSign * settings.cursorStrength * agentMaxSteering * cursorFalloff;
        accX += (cdx / cursorDist) * force;
        accY += (cdy / cursorDist) * force;
      }
    }

    if (settings.useHawk && hawks.length > 0) {
      for (const hawk of hawks) {
        const hdx = hawk.x - px;
        const hdy = hawk.y - py;
        const hawkDistSq = hdx * hdx + hdy * hdy;
        if (hawkDistSq <= cursorRadiusSq && hawkDistSq > 0.000001) {
          const hawkDist = Math.sqrt(hawkDistSq);
          const hawkFalloff = 1 - hawkDist / settings.cursorRadius;
          const force = settings.cursorStrength * agentMaxSteering * hawkFalloff;
          accX -= (hdx / hawkDist) * force;
          accY -= (hdy / hawkDist) * force;
        }
      }
    }

    if (!hawkThreat && !onWater && restChancePerTick > 0 && Math.random() < restChancePerTick) {
      swarmState.isResting[i] = 1;
      swarmState.restTicksLeft[i] = restTicks;
      const floorZ = Math.max(minFlight, terrainFloorAtSwarmCoord(px, py));
      swarmState.vx[i] = 0;
      swarmState.vy[i] = 0;
      swarmState.vz[i] = 0;
      swarmState.z[i] = clamp(floorZ, minFlight, maxFlight);
      swarmState.ax[i] = 0;
      swarmState.ay[i] = 0;
      swarmState.az[i] = 0;
      if (
        swarmState.breedingActive
        && breedingSpawnChance > 0
        && swarmState.count + pendingRestBirths.length < maxBirds
        && Math.random() < breedingSpawnChance
      ) {
        pendingRestBirths.push({ x: px, y: py });
      }
      continue;
    }

    [swarmState.ax[i], swarmState.ay[i], swarmState.az[i]] = limitVector3(accX, accY, accZ, agentMaxSteering);
  }

  for (let i = 0; i < swarmState.count; i++) {
    if (swarmState.isResting[i]) {
      const floorZ = Math.max(minFlight, terrainFloorAtSwarmCoord(swarmState.x[i], swarmState.y[i]));
      swarmState.vx[i] = 0;
      swarmState.vy[i] = 0;
      swarmState.vz[i] = 0;
      swarmState.z[i] = clamp(floorZ, minFlight, maxFlight);
      continue;
    }
    const nextVx = swarmState.vx[i] + swarmState.ax[i] * dt;
    const nextVy = swarmState.vy[i] + swarmState.ay[i] * dt;
    const nextVz = swarmState.vz[i] + swarmState.az[i] * dt;
    const speedScale = swarmState.speedScale[i] > 0 ? swarmState.speedScale[i] : 1;
    const agentMaxSpeed = settings.maxSpeed * speedScale;
    const agentMinSpeed = Math.max(10, agentMaxSpeed * 0.45);
    const speed = Math.hypot(nextVx, nextVy, nextVz);
    let finalVx = nextVx;
    let finalVy = nextVy;
    let finalVz = nextVz;
    if (speed > agentMaxSpeed) {
      const scale = agentMaxSpeed / speed;
      finalVx *= scale;
      finalVy *= scale;
      finalVz *= scale;
    } else if (speed < agentMinSpeed) {
      const dirX = speed > 0.000001 ? nextVx / speed : Math.cos(i * 0.61803398875);
      const dirY = speed > 0.000001 ? nextVy / speed : Math.sin(i * 0.61803398875);
      const dirZ = speed > 0.000001 ? nextVz / speed : Math.sin(i * 0.38196601125) * 0.2;
      finalVx = dirX * agentMinSpeed;
      finalVy = dirY * agentMinSpeed;
      finalVz = dirZ * agentMinSpeed;
    }
    swarmState.vx[i] = finalVx;
    swarmState.vy[i] = finalVy;
    swarmState.vz[i] = finalVz;

    let nx = swarmState.x[i] + finalVx * dt;
    let ny = swarmState.y[i] + finalVy * dt;
    let nz = swarmState.z[i] + finalVz * dt;
    if (nx < 0) {
      nx = 0;
      swarmState.vx[i] = Math.abs(swarmState.vx[i]) * 0.75;
    } else if (nx > maxX) {
      nx = maxX;
      swarmState.vx[i] = -Math.abs(swarmState.vx[i]) * 0.75;
    }
    if (ny < 0) {
      ny = 0;
      swarmState.vy[i] = Math.abs(swarmState.vy[i]) * 0.75;
    } else if (ny > maxY) {
      ny = maxY;
      swarmState.vy[i] = -Math.abs(swarmState.vy[i]) * 0.75;
    }
    if (!isSwarmCoordFlyable(nx, ny, maxFlight)) {
      nx = swarmState.x[i];
      ny = swarmState.y[i];
      swarmState.vx[i] = -swarmState.vx[i] * 0.6;
      swarmState.vy[i] = -swarmState.vy[i] * 0.6;
    }
    const minAllowedZ = Math.max(minFlight, terrainFloorAtSwarmCoord(nx, ny));
    if (nz < minAllowedZ) {
      nz = minAllowedZ;
      swarmState.vz[i] = Math.abs(swarmState.vz[i]) * 0.75;
    }
    if (nz < minFlight) {
      nz = minFlight + (minFlight - nz);
      swarmState.vz[i] = Math.abs(swarmState.vz[i]) * 0.75;
    } else if (nz > maxFlight) {
      nz = maxFlight - (nz - maxFlight);
      swarmState.vz[i] = -Math.abs(swarmState.vz[i]) * 0.75;
    }
    swarmState.x[i] = nx;
    swarmState.y[i] = ny;
    swarmState.z[i] = clamp(nz, minFlight, maxFlight);
  }

  if (swarmState.breedingActive && pendingRestBirths.length > 0) {
    for (const birth of pendingRestBirths) {
      if (swarmState.count >= maxBirds) break;
      spawnRestingBirdNear(birth.x, birth.y, settings);
    }
  }
  if (!swarmState.breedingActive && swarmState.count < breedingThreshold) {
    swarmState.breedingActive = true;
  } else if (swarmState.breedingActive && swarmState.count >= maxBirds) {
    swarmState.breedingActive = false;
  }

  if (!settings.useHawk || hawks.length === 0) return;

  const currentTick = Math.max(0, Math.round(swarmState.stepCount));
  for (let hawkIndex = hawks.length - 1; hawkIndex >= 0; hawkIndex--) {
    const hawk = hawks[hawkIndex];
    if (!Number.isInteger(hawk.targetIndex) || hawk.targetIndex < 0 || hawk.targetIndex >= swarmState.count) {
      hawk.targetIndex = chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, settings.hawkTargetRange);
    }
    if (swarmState.count <= 0 || hawk.targetIndex < 0) continue;
    const targetX = swarmState.x[hawk.targetIndex];
    const targetY = swarmState.y[hawk.targetIndex];
    const targetZ = swarmState.z[hawk.targetIndex];
    const toTargetX = targetX - hawk.x;
    const toTargetY = targetY - hawk.y;
    const toTargetZ = (targetZ - hawk.z) * SWARM_Z_NEIGHBOR_SCALE;
    const toTargetLen = Math.hypot(toTargetX, toTargetY, toTargetZ);
    if (toTargetLen <= 2) {
      const killInterval = Math.max(0, currentTick - Math.max(0, Math.round(Number(hawk.lastKillTick) || 0)));
      swarmState.hawkKillIntervalSum += killInterval;
      swarmState.hawkKillCount += 1;
      removeSwarmAgentAtIndex(hawk.targetIndex);
      hawk.lastKillTick = currentTick;
      hawk.targetIndex = chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, settings.hawkTargetRange);
      continue;
    }
    const aimX = swarmState.x[hawk.targetIndex] - hawk.x;
    const aimY = swarmState.y[hawk.targetIndex] - hawk.y;
    const aimZ = (swarmState.z[hawk.targetIndex] - hawk.z) * SWARM_Z_NEIGHBOR_SCALE;
    const aimLen = Math.hypot(aimX, aimY, aimZ);
    const desiredVx = aimLen > 0.000001 ? (aimX / aimLen) * settings.hawkSpeed : 0;
    const desiredVy = aimLen > 0.000001 ? (aimY / aimLen) * settings.hawkSpeed : 0;
    const desiredVz = aimLen > 0.000001 ? (aimZ / aimLen) * settings.hawkSpeed : 0;
    const steerX = desiredVx - hawk.vx;
    const steerY = desiredVy - hawk.vy;
    const steerZ = desiredVz - hawk.vz;
    [hawk.ax, hawk.ay, hawk.az] = limitVector3(steerX, steerY, steerZ, settings.hawkSteering);

    hawk.vx += hawk.ax * dt;
    hawk.vy += hawk.ay * dt;
    hawk.vz += hawk.az * dt;
    const hawkSpeed = Math.hypot(hawk.vx, hawk.vy, hawk.vz);
    if (hawkSpeed > settings.hawkSpeed) {
      const scale = settings.hawkSpeed / hawkSpeed;
      hawk.vx *= scale;
      hawk.vy *= scale;
      hawk.vz *= scale;
    }

    let hx = hawk.x + hawk.vx * dt;
    let hy = hawk.y + hawk.vy * dt;
    let hz = hawk.z + hawk.vz * dt;
    if (hx < 0) {
      hx = 0;
      hawk.vx = Math.abs(hawk.vx) * 0.75;
    } else if (hx > maxX) {
      hx = maxX;
      hawk.vx = -Math.abs(hawk.vx) * 0.75;
    }
    if (hy < 0) {
      hy = 0;
      hawk.vy = Math.abs(hawk.vy) * 0.75;
    } else if (hy > maxY) {
      hy = maxY;
      hawk.vy = -Math.abs(hawk.vy) * 0.75;
    }
    if (!isSwarmCoordFlyable(hx, hy, maxFlight)) {
      hx = hawk.x;
      hy = hawk.y;
      hawk.vx = -hawk.vx * 0.6;
      hawk.vy = -hawk.vy * 0.6;
      hawk.targetIndex = chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, settings.hawkTargetRange);
    }
    const hawkMinZ = Math.max(minFlight, terrainFloorAtSwarmCoord(hx, hy));
    hz = clamp(hz, hawkMinZ, maxFlight);
    hawk.x = hx;
    hawk.y = hy;
    hawk.z = hz;
  }
}

function updateSwarm(nowMs) {
  if (!isSwarmEnabled()) {
    swarmState.lastUpdateMs = nowMs;
    return;
  }
  const settings = getSwarmSettings();
  if (swarmState.count <= 0 && (!settings.useHawk || swarmState.hawks.length <= 0)) {
    swarmState.lastUpdateMs = nowMs;
    return;
  }
  if (swarmState.lastUpdateMs === null) {
    swarmState.lastUpdateMs = nowMs;
    return;
  }
  const elapsedSec = Math.min(0.25, Math.max(0, (nowMs - swarmState.lastUpdateMs) * 0.001));
  swarmState.lastUpdateMs = nowMs;
  const scaledDt = elapsedSec * settings.simulationSpeed;
  if (scaledDt <= 0) return;
  let remaining = scaledDt;
  const maxStep = 0.05;
  let guard = 0;
  while (remaining > 0.000001 && guard < 8) {
    const dt = Math.min(maxStep, remaining);
    stepSwarm(settings, dt, nowMs);
    swarmState.stepCount += 1;
    remaining -= dt;
    guard++;
  }
}

function updateSwarmFollowCamera() {
  if (!swarmFollowState.enabled) return;
  if (!isSwarmEnabled() || swarmState.count <= 0) {
    swarmFollowState.enabled = false;
    swarmFollowState.hawkIndex = -1;
    swarmFollowState.agentIndex = -1;
    resetSwarmFollowSpeedSmoothing();
    updateSwarmFollowButtonUi();
    return;
  }
  const settings = getSwarmSettings();
  if (swarmFollowState.targetType === "hawk") {
    if (!settings.useHawk || swarmState.hawks.length <= 0) {
      swarmFollowState.enabled = false;
      swarmFollowState.hawkIndex = -1;
      resetSwarmFollowSpeedSmoothing();
      updateSwarmFollowButtonUi();
      return;
    }
    if (!Number.isInteger(swarmFollowState.hawkIndex) || swarmFollowState.hawkIndex < 0 || swarmFollowState.hawkIndex >= swarmState.hawks.length) {
      swarmFollowState.hawkIndex = chooseRandomFollowHawkIndex();
    }
    if (swarmFollowState.hawkIndex < 0) return;
    const hawk = swarmState.hawks[swarmFollowState.hawkIndex];
    const hawkWorld = mapCoordToWorld(hawk.x, hawk.y);
    panWorld.x = hawkWorld.x;
    panWorld.y = hawkWorld.y;
    if (settings.followZoomBySpeed) {
      const speedNormRaw = clamp(Math.hypot(hawk.vx, hawk.vy) / Math.max(1, settings.hawkSpeed), 0, 1);
      if (!Number.isFinite(swarmFollowState.speedNormFiltered)) {
        swarmFollowState.speedNormFiltered = speedNormRaw;
      } else {
        swarmFollowState.speedNormFiltered += (speedNormRaw - swarmFollowState.speedNormFiltered) * 0.18;
      }
      const targetZoom = settings.followZoomIn + (settings.followZoomOut - settings.followZoomIn) * swarmFollowState.speedNormFiltered;
      zoom = clamp(zoom + (targetZoom - zoom) * 0.14, zoomMin, zoomMax);
    }
    return;
  }
  if (!Number.isInteger(swarmFollowState.agentIndex) || swarmFollowState.agentIndex < 0 || swarmFollowState.agentIndex >= swarmState.count) {
    swarmFollowState.agentIndex = chooseRandomFollowAgentIndex();
  }
  if (swarmFollowState.agentIndex < 0) return;
  const followIndex = swarmFollowState.agentIndex;
  const world = mapCoordToWorld(swarmState.x[followIndex], swarmState.y[followIndex]);
  panWorld.x = world.x;
  panWorld.y = world.y;
  if (settings.followZoomBySpeed) {
    const speedNormRaw = clamp(Math.hypot(swarmState.vx[followIndex], swarmState.vy[followIndex]) / Math.max(1, settings.maxSpeed), 0, 1);
    if (!Number.isFinite(swarmFollowState.speedNormFiltered)) {
      swarmFollowState.speedNormFiltered = speedNormRaw;
    } else {
      swarmFollowState.speedNormFiltered += (speedNormRaw - swarmFollowState.speedNormFiltered) * settings.followAgentSpeedSmoothing;
    }
    const targetZoom = settings.followZoomIn + (settings.followZoomOut - settings.followZoomIn) * swarmFollowState.speedNormFiltered;
    zoom = clamp(zoom + (targetZoom - zoom) * settings.followAgentZoomSmoothing, zoomMin, zoomMax);
  }
}

function drawSwarmUnlitOverlay(settings) {
  const tintAlpha = settings.showTerrainInSwarm ? 0.55 : 0.95;
  for (let i = 0; i < swarmState.count; i++) {
    const mapX = swarmState.x[i];
    const mapY = swarmState.y[i];
    const centerWorld = mapCoordToWorld(mapX, mapY);
    const rightWorld = mapCoordToWorld(mapX + 1, mapY);
    const downWorld = mapCoordToWorld(mapX, mapY + 1);
    const center = worldToScreen(centerWorld);
    const right = worldToScreen(rightWorld);
    const down = worldToScreen(downWorld);
    const texelW = Math.max(0.25, Math.abs(right.x - center.x));
    const texelH = Math.max(0.25, Math.abs(down.y - center.y));
    const z = clamp(swarmState.z[i] / SWARM_Z_MAX, 0, 1);
    const lum = Math.round((0.28 + z * 0.72) * 255);
    overlayCtx.fillStyle = `rgba(${lum}, ${lum}, ${lum}, ${tintAlpha})`;
    overlayCtx.fillRect(center.x - texelW * 0.5, center.y - texelH * 0.5, texelW, texelH);
  }

  if (settings.useHawk && swarmState.hawks.length > 0) {
    const hawkCenterWorld = mapCoordToWorld(swarmState.hawks[0].x, swarmState.hawks[0].y);
    const hawkRightWorld = mapCoordToWorld(swarmState.hawks[0].x + 1, swarmState.hawks[0].y);
    const hawkDownWorld = mapCoordToWorld(swarmState.hawks[0].x, swarmState.hawks[0].y + 1);
    const hawkCenter = worldToScreen(hawkCenterWorld);
    const hawkRight = worldToScreen(hawkRightWorld);
    const hawkDown = worldToScreen(hawkDownWorld);
    const w = Math.max(0.25, Math.abs(hawkRight.x - hawkCenter.x));
    const h = Math.max(0.25, Math.abs(hawkDown.y - hawkCenter.y));
    const hawkRgb = hexToRgb01(settings.hawkColor).map((v) => Math.round(clamp(v, 0, 1) * 255));
    const hawkAlpha = settings.showTerrainInSwarm ? 0.85 : 1.0;
    overlayCtx.fillStyle = `rgba(${hawkRgb[0]}, ${hawkRgb[1]}, ${hawkRgb[2]}, ${hawkAlpha})`;
    for (const hawk of swarmState.hawks) {
      const centerWorld = mapCoordToWorld(hawk.x, hawk.y);
      const center = worldToScreen(centerWorld);
      overlayCtx.fillRect(center.x - w * 0.5, center.y - h * 0.5, w, h);
    }
  }
}

function drawSwarmGizmos(settings) {
  if (settings.followHawkRangeGizmo && swarmFollowState.enabled && swarmFollowState.targetType === "hawk") {
    const followHawkIndex = swarmFollowState.hawkIndex;
    if (Number.isInteger(followHawkIndex) && followHawkIndex >= 0 && followHawkIndex < swarmState.hawks.length) {
      const hawk = swarmState.hawks[followHawkIndex];
      const centerWorld = mapCoordToWorld(hawk.x, hawk.y);
      const edgeWorld = mapCoordToWorld(hawk.x + settings.hawkTargetRange, hawk.y);
      const centerScreen = worldToScreen(centerWorld);
      const edgeScreen = worldToScreen(edgeWorld);
      const radiusScreen = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      overlayCtx.beginPath();
      overlayCtx.arc(centerScreen.x, centerScreen.y, radiusScreen, 0, Math.PI * 2);
      overlayCtx.lineWidth = 1.5;
      overlayCtx.strokeStyle = "rgba(255, 124, 92, 0.85)";
      overlayCtx.stroke();
    }
  }

  if (swarmCursorState.active && settings.cursorMode !== "none") {
    const centerWorld = mapCoordToWorld(swarmCursorState.x, swarmCursorState.y);
    const edgeWorld = mapCoordToWorld(swarmCursorState.x + settings.cursorRadius, swarmCursorState.y);
    const centerScreen = worldToScreen(centerWorld);
    const edgeScreen = worldToScreen(edgeWorld);
    const radiusScreen = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
    overlayCtx.beginPath();
    overlayCtx.arc(centerScreen.x, centerScreen.y, radiusScreen, 0, Math.PI * 2);
    overlayCtx.lineWidth = 1.5;
    overlayCtx.strokeStyle = settings.cursorMode === "attract" ? "rgba(110, 255, 170, 0.75)" : "rgba(255, 128, 128, 0.75)";
    overlayCtx.stroke();
  }
}

function ensureSwarmPointVertexCapacity(vertexCount) {
  const required = Math.max(0, vertexCount) * 6;
  if (swarmPointVertexData.length >= required) return;
  swarmPointVertexData = new Float32Array(required);
}

function renderSwarmLit(params, nowSec, settings) {
  const hawkCount = settings.useHawk ? swarmState.hawks.length : 0;
  const totalCount = swarmState.count + hawkCount;
  if (totalCount <= 0) return;

  ensureSwarmPointVertexCapacity(totalCount);
  const useAgentRayShadows = shadowsToggle.checked;
  const blockedShadowFactor = 1 - clamp(Number(shadowStrengthInput.value), 0, 1);
  let writeIndex = 0;
  for (let i = 0; i < swarmState.count; i++) {
    const mapX = swarmState.x[i];
    const mapY = swarmState.y[i];
    const agentZ = swarmState.z[i];
    const sunShadow = useAgentRayShadows
      ? computeSwarmDirectionalShadow(mapX, mapY, agentZ, params.sunDir, blockedShadowFactor)
      : 1;
    const moonShadow = useAgentRayShadows
      ? computeSwarmDirectionalShadow(mapX, mapY, agentZ, params.moonDir, blockedShadowFactor)
      : 1;
    swarmPointVertexData[writeIndex++] = mapX;
    swarmPointVertexData[writeIndex++] = mapY;
    swarmPointVertexData[writeIndex++] = agentZ;
    swarmPointVertexData[writeIndex++] = 0;
    swarmPointVertexData[writeIndex++] = sunShadow;
    swarmPointVertexData[writeIndex++] = moonShadow;
  }
  if (settings.useHawk) {
    for (const hawk of swarmState.hawks) {
      const sunShadow = useAgentRayShadows
        ? computeSwarmDirectionalShadow(hawk.x, hawk.y, hawk.z, params.sunDir, blockedShadowFactor)
        : 1;
      const moonShadow = useAgentRayShadows
        ? computeSwarmDirectionalShadow(hawk.x, hawk.y, hawk.z, params.moonDir, blockedShadowFactor)
        : 1;
      swarmPointVertexData[writeIndex++] = hawk.x;
      swarmPointVertexData[writeIndex++] = hawk.y;
      swarmPointVertexData[writeIndex++] = hawk.z;
      swarmPointVertexData[writeIndex++] = 1;
      swarmPointVertexData[writeIndex++] = sunShadow;
      swarmPointVertexData[writeIndex++] = moonShadow;
    }
  }

  const viewHalf = getViewHalfExtents();
  const hawkColor = hexToRgb01(settings.hawkColor);
  gl.useProgram(swarmProgram);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, normalsTex);
  gl.uniform1i(swarmUniforms.uNormals, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, heightTex);
  gl.uniform1i(swarmUniforms.uHeight, 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, pointLightTex);
  gl.uniform1i(swarmUniforms.uPointLightTex, 2);

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, cloudNoiseTex);
  gl.uniform1i(swarmUniforms.uCloudNoiseTex, 3);

  gl.uniform3f(swarmUniforms.uSunDir, params.sunDir[0], params.sunDir[1], params.sunDir[2]);
  gl.uniform3f(swarmUniforms.uSunColor, params.sun.sunColor[0], params.sun.sunColor[1], params.sun.sunColor[2]);
  gl.uniform1f(swarmUniforms.uSunStrength, params.sunStrength);
  gl.uniform3f(swarmUniforms.uMoonDir, params.moonDir[0], params.moonDir[1], params.moonDir[2]);
  gl.uniform3f(swarmUniforms.uMoonColor, params.moonColor[0], params.moonColor[1], params.moonColor[2]);
  gl.uniform1f(swarmUniforms.uMoonStrength, params.moonStrength);
  gl.uniform3f(swarmUniforms.uAmbientColor, params.ambientColor[0], params.ambientColor[1], params.ambientColor[2]);
  gl.uniform1f(swarmUniforms.uAmbient, params.ambientFinal);
  gl.uniform1f(swarmUniforms.uUseShadows, shadowsToggle.checked ? 1 : 0);
  gl.uniform1f(swarmUniforms.uUseFog, fogToggle.checked ? 1 : 0);
  gl.uniform3f(swarmUniforms.uFogColor, params.fogColor[0], params.fogColor[1], params.fogColor[2]);
  gl.uniform1f(swarmUniforms.uFogMinAlpha, clamp(Number(fogMinAlphaInput.value), 0, 1));
  gl.uniform1f(swarmUniforms.uFogMaxAlpha, clamp(Number(fogMaxAlphaInput.value), 0, 1));
  gl.uniform1f(swarmUniforms.uFogFalloff, clamp(Number(fogFalloffInput.value), 0.2, 4));
  gl.uniform1f(swarmUniforms.uFogStartOffset, clamp(Number(fogStartOffsetInput.value), 0, 1));
  gl.uniform1f(swarmUniforms.uCameraHeightNorm, params.cameraHeightNorm);
  gl.uniform1f(swarmUniforms.uUseVolumetric, volumetricToggle.checked ? 1 : 0);
  gl.uniform1f(swarmUniforms.uVolumetricStrength, clamp(Number(volumetricStrengthInput.value), 0, 1));
  gl.uniform1f(swarmUniforms.uVolumetricDensity, clamp(Number(volumetricDensityInput.value), 0, 2));
  gl.uniform1f(swarmUniforms.uVolumetricAnisotropy, clamp(Number(volumetricAnisotropyInput.value), 0, 0.95));
  gl.uniform1f(swarmUniforms.uVolumetricLength, Math.round(clamp(Number(volumetricLengthInput.value), 8, 160)));
  gl.uniform1f(swarmUniforms.uVolumetricSamples, Math.round(clamp(Number(volumetricSamplesInput.value), 4, 24)));
  gl.uniform1f(swarmUniforms.uMapAspect, getMapAspect());
  gl.uniform2f(swarmUniforms.uMapTexelSize, 1 / heightSize.width, 1 / heightSize.height);
  gl.uniform2f(swarmUniforms.uMapSize, splatSize.width, splatSize.height);
  gl.uniform2f(swarmUniforms.uResolution, canvas.width, canvas.height);
  gl.uniform2f(swarmUniforms.uViewHalfExtents, viewHalf.x, viewHalf.y);
  gl.uniform2f(swarmUniforms.uPanWorld, panWorld.x, panWorld.y);
  gl.uniform1f(swarmUniforms.uTimeSec, Math.max(0, Number(nowSec) || 0));
  gl.uniform1f(swarmUniforms.uPointFlickerEnabled, pointFlickerToggle.checked ? 1 : 0);
  gl.uniform1f(swarmUniforms.uPointFlickerStrength, clamp(Number(pointFlickerStrengthInput.value), 0, 1));
  gl.uniform1f(swarmUniforms.uPointFlickerSpeed, clamp(Number(pointFlickerSpeedInput.value), 0.1, 12));
  gl.uniform1f(swarmUniforms.uPointFlickerSpatial, clamp(Number(pointFlickerSpatialInput.value), 0, 4));
  gl.uniform1f(swarmUniforms.uUseClouds, cloudToggle.checked ? 1 : 0);
  gl.uniform1f(swarmUniforms.uCloudCoverage, clamp(Number(cloudCoverageInput.value), 0, 1));
  gl.uniform1f(swarmUniforms.uCloudSoftness, clamp(Number(cloudSoftnessInput.value), 0.01, 0.35));
  gl.uniform1f(swarmUniforms.uCloudOpacity, clamp(Number(cloudOpacityInput.value), 0, 1));
  gl.uniform1f(swarmUniforms.uCloudScale, clamp(Number(cloudScaleInput.value), 0.5, 8));
  gl.uniform1f(swarmUniforms.uCloudSpeed1, clamp(Number(cloudSpeed1Input.value), -0.3, 0.3));
  gl.uniform1f(swarmUniforms.uCloudSpeed2, clamp(Number(cloudSpeed2Input.value), -0.3, 0.3));
  gl.uniform1f(swarmUniforms.uCloudSunParallax, clamp(Number(cloudSunParallaxInput.value), 0, 2));
  gl.uniform1f(swarmUniforms.uCloudUseSunProjection, cloudSunProjectToggle.checked ? 1 : 0);
  gl.uniform3f(swarmUniforms.uHawkColor, hawkColor[0], hawkColor[1], hawkColor[2]);
  gl.uniform1f(swarmUniforms.uSwarmHeightMax, SWARM_Z_MAX);
  gl.uniform1f(swarmUniforms.uPointLightEdgeMin, SWARM_POINT_LIGHT_EDGE_MIN);
  gl.uniform1f(swarmUniforms.uSwarmAlpha, 1.0);

  gl.bindVertexArray(swarmPointVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, swarmPointBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, swarmPointVertexData.subarray(0, totalCount * 6), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, totalCount);
  gl.bindVertexArray(null);
}

function getBaseViewHalfExtents() {
  const screenAspect = getScreenAspect();
  const mapAspect = getMapAspect();
  if (screenAspect >= mapAspect) {
    return { x: screenAspect, y: 1 };
  }
  return { x: mapAspect, y: mapAspect / screenAspect };
}

function getViewHalfExtents(zoomValue = zoom) {
  const base = getBaseViewHalfExtents();
  return {
    x: base.x / zoomValue,
    y: base.y / zoomValue,
  };
}

function clientToNdc(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((clientY - rect.top) / rect.height) * 2;
  return { x, y };
}

function worldFromNdc(ndc, zoomValue = zoom, pan = panWorld) {
  const ext = getViewHalfExtents(zoomValue);
  return {
    x: pan.x + ndc.x * ext.x,
    y: pan.y + ndc.y * ext.y,
  };
}

function worldToUv(world) {
  return {
    x: world.x / getMapAspect() + 0.5,
    y: world.y + 0.5,
  };
}

function uvToMapPixelIndex(uv) {
  return {
    x: Math.floor(clamp(uv.x, 0, 0.999999) * splatSize.width),
    y: Math.floor((1 - clamp(uv.y, 0, 0.999999)) * splatSize.height),
  };
}

function mapPixelIndexToUv(pixelX, pixelY) {
  return {
    x: (pixelX + 0.5) / splatSize.width,
    y: 1 - (pixelY + 0.5) / splatSize.height,
  };
}

function mapPixelToWorld(pixelX, pixelY) {
  const uv = mapPixelIndexToUv(pixelX, pixelY);
  return {
    x: (uv.x - 0.5) * getMapAspect(),
    y: uv.y - 0.5,
  };
}

function mapCoordToWorld(mapX, mapY) {
  const safeW = Math.max(1, splatSize.width);
  const safeH = Math.max(1, splatSize.height);
  const uvX = (mapX + 0.5) / safeW;
  const uvY = 1 - (mapY + 0.5) / safeH;
  return {
    x: (uvX - 0.5) * getMapAspect(),
    y: uvY - 0.5,
  };
}

function worldToScreen(world) {
  const viewHalf = getViewHalfExtents();
  const ndcX = (world.x - panWorld.x) / viewHalf.x;
  const ndcY = (world.y - panWorld.y) / viewHalf.y;
  return {
    x: (ndcX * 0.5 + 0.5) * overlayCanvas.width,
    y: (1 - (ndcY * 0.5 + 0.5)) * overlayCanvas.height,
  };
}

function updatePathfindingRangeLabel() {
  const value = Math.round(clamp(Number(pathfindingRangeInput.value), 30, 300));
  pathfindingRangeValue.textContent = `${value} x ${value}`;
}

function updatePathWeightLabels() {
  const slopeWeight = clamp(Number(pathWeightSlopeInput.value), 0, 10);
  const heightWeight = clamp(Number(pathWeightHeightInput.value), 0, 10);
  const waterWeight = clamp(Number(pathWeightWaterInput.value), 0, 100);
  pathWeightSlopeValue.textContent = slopeWeight.toFixed(1);
  pathWeightHeightValue.textContent = heightWeight.toFixed(1);
  pathWeightWaterValue.textContent = waterWeight.toFixed(1);
}

function updatePathSlopeCutoffLabel() {
  const cutoff = Math.round(clamp(Number(pathSlopeCutoffInput.value), 0, 90));
  pathSlopeCutoffValue.textContent = `${cutoff} deg`;
}

function updatePathBaseCostLabel() {
  const baseCost = clamp(Number(pathBaseCostInput.value), 0, 2);
  pathBaseCostValue.textContent = baseCost.toFixed(1);
}

function setInteractionMode(mode) {
  const requestedMode = mode === "lighting" || mode === "pathfinding" ? mode : "none";
  const nextMode = canUseInteractionInCurrentMode(requestedMode) ? requestedMode : "none";
  interactionMode = nextMode;
  dockLightingModeToggle.classList.toggle("active", nextMode === "lighting");
  dockPathfindingModeToggle.classList.toggle("active", nextMode === "pathfinding");
  dockLightingModeToggle.setAttribute("aria-pressed", nextMode === "lighting" ? "true" : "false");
  dockPathfindingModeToggle.setAttribute("aria-pressed", nextMode === "pathfinding" ? "true" : "false");
  if (nextMode !== "pathfinding") {
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
  }
  requestOverlayDraw();
}

function setPlayerPosition(pixelX, pixelY) {
  playerState.pixelX = clamp(Math.round(Number(pixelX)), 0, Math.max(0, splatSize.width - 1));
  playerState.pixelY = clamp(Math.round(Number(pixelY)), 0, Math.max(0, splatSize.height - 1));
}

function parseNpcPlayer(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  const charID = String(data.charID || DEFAULT_PLAYER.charID);
  const color = /^#?[0-9a-fA-F]{6}$/.test(String(data.color || "")) ? String(data.color).replace(/^([^#])/, "#$1") : DEFAULT_PLAYER.color;
  const pixelX = Number.isFinite(Number(data.pixelX)) ? Number(data.pixelX) : DEFAULT_PLAYER.pixelX;
  const pixelY = Number.isFinite(Number(data.pixelY)) ? Number(data.pixelY) : DEFAULT_PLAYER.pixelY;
  return {
    charID,
    color,
    pixelX: clamp(Math.round(pixelX), 0, Math.max(0, splatSize.width - 1)),
    pixelY: clamp(Math.round(pixelY), 0, Math.max(0, splatSize.height - 1)),
  };
}

function applyLoadedNpc(rawData) {
  const player = parseNpcPlayer(rawData);
  playerState.charID = player.charID;
  playerState.color = player.color;
  setPlayerPosition(player.pixelX, player.pixelY);
}

function getGrayAt(imageData, x, y, sourceWidth = splatSize.width, sourceHeight = splatSize.height) {
  if (!imageData || !imageData.data) return 0;
  const w = imageData.width || 1;
  const h = imageData.height || 1;
  const srcW = Math.max(1, Number(sourceWidth) || 1);
  const srcH = Math.max(1, Number(sourceHeight) || 1);
  const nx = (Number(x) + 0.5) / srcW;
  const ny = (Number(y) + 0.5) / srcH;
  const sx = clamp(Math.round(nx * w - 0.5), 0, Math.max(0, w - 1));
  const sy = clamp(Math.round(ny * h - 0.5), 0, Math.max(0, h - 1));
  const idx = (sy * w + sx) * 4;
  return imageData.data[idx] / 255;
}

function movementWindowBounds() {
  const size = Math.round(clamp(Number(pathfindingRangeInput.value), 30, 300));
  const halfA = Math.floor((size - 1) / 2);
  const halfB = size - halfA - 1;
  return {
    minX: clamp(playerState.pixelX - halfA, 0, Math.max(0, splatSize.width - 1)),
    maxX: clamp(playerState.pixelX + halfB, 0, Math.max(0, splatSize.width - 1)),
    minY: clamp(playerState.pixelY - halfA, 0, Math.max(0, splatSize.height - 1)),
    maxY: clamp(playerState.pixelY + halfB, 0, Math.max(0, splatSize.height - 1)),
  };
}

function computeMoveStepCost(fromX, fromY, toX, toY) {
  const isDiag = fromX !== toX && fromY !== toY;
  const dist = isDiag ? Math.SQRT2 : 1;
  const slope = getGrayAt(slopeImageData, toX, toY);
  const sourceHeight = getGrayAt(heightImageData, fromX, fromY);
  const destHeight = getGrayAt(heightImageData, toX, toY);
  const heightDelta = destHeight - sourceHeight;
  const uphill = Math.max(heightDelta, 0);
  const water = getGrayAt(waterImageData, toX, toY);
  const slopeDeg = slope * 90;
  const slopeCutoffDeg = clamp(Number(pathSlopeCutoffInput.value), 0, 90);
  if (slopeDeg > slopeCutoffDeg) {
    return Number.POSITIVE_INFINITY;
  }
  const slopeWeight = clamp(Number(pathWeightSlopeInput.value), 0, 10);
  const heightWeight = clamp(Number(pathWeightHeightInput.value), 0, 10);
  const waterWeight = clamp(Number(pathWeightWaterInput.value), 0, 100);
  const baseCost = clamp(Number(pathBaseCostInput.value), 0, 2);
  const weightedCost = slopeWeight * slope + heightWeight * uphill + waterWeight * water;
  return dist * (baseCost + weightedCost);
}

class MinHeap {
  constructor() {
    this.items = [];
  }

  push(node) {
    this.items.push(node);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.items[p].dist <= node.dist) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = node;
  }

  pop() {
    if (this.items.length === 0) return null;
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length === 0 || !last) return root;
    let i = 0;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      if (l >= this.items.length) break;
      let c = l;
      if (r < this.items.length && this.items[r].dist < this.items[l].dist) c = r;
      if (this.items[c].dist >= last.dist) break;
      this.items[i] = this.items[c];
      i = c;
    }
    this.items[i] = last;
    return root;
  }
}

function rebuildMovementField() {
  const bounds = movementWindowBounds();
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  if (width <= 0 || height <= 0) {
    movementField = null;
    movePreviewState.pathPixels = [];
    return;
  }

  const len = width * height;
  const dist = new Float64Array(len);
  const parent = new Int32Array(len);
  dist.fill(Number.POSITIVE_INFINITY);
  parent.fill(-1);

  const indexOf = (x, y) => (y - bounds.minY) * width + (x - bounds.minX);
  const startIdx = indexOf(playerState.pixelX, playerState.pixelY);
  dist[startIdx] = 0;

  const heap = new MinHeap();
  heap.push({ x: playerState.pixelX, y: playerState.pixelY, dist: 0 });
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];

  while (true) {
    const current = heap.pop();
    if (!current) break;
    const idx = indexOf(current.x, current.y);
    if (current.dist > dist[idx]) continue;
    for (const dir of dirs) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      if (nx < bounds.minX || nx > bounds.maxX || ny < bounds.minY || ny > bounds.maxY) continue;
      const nIdx = indexOf(nx, ny);
      const stepCost = computeMoveStepCost(current.x, current.y, nx, ny);
      if (!Number.isFinite(stepCost)) continue;
      const nextDist = dist[idx] + stepCost;
      if (nextDist < dist[nIdx]) {
        dist[nIdx] = nextDist;
        parent[nIdx] = idx;
        heap.push({ x: nx, y: ny, dist: nextDist });
      }
    }
  }

  movementField = {
    ...bounds,
    width,
    height,
    dist,
    parent,
  };
  refreshPathPreview();
}

function extractPathTo(pixelX, pixelY) {
  if (!movementField) return [];
  if (pixelX < movementField.minX || pixelX > movementField.maxX || pixelY < movementField.minY || pixelY > movementField.maxY) return [];
  const indexOf = (x, y) => (y - movementField.minY) * movementField.width + (x - movementField.minX);
  const indexToPixel = (idx) => ({
    x: movementField.minX + (idx % movementField.width),
    y: movementField.minY + Math.floor(idx / movementField.width),
  });
  const targetIdx = indexOf(pixelX, pixelY);
  if (!Number.isFinite(movementField.dist[targetIdx])) return [];
  const path = [];
  let cursor = targetIdx;
  const maxSteps = movementField.width * movementField.height;
  for (let i = 0; i < maxSteps && cursor >= 0; i++) {
    const p = indexToPixel(cursor);
    path.push({ x: p.x, y: p.y });
    if (p.x === playerState.pixelX && p.y === playerState.pixelY) break;
    cursor = movementField.parent[cursor];
  }
  if (path.length === 0) return [];
  path.reverse();
  return path;
}

function refreshPathPreview() {
  if (interactionMode !== "pathfinding" || !movePreviewState.hoverPixel) {
    movePreviewState.pathPixels = [];
    requestOverlayDraw();
    return;
  }
  movePreviewState.pathPixels = extractPathTo(movePreviewState.hoverPixel.x, movePreviewState.hoverPixel.y);
  requestOverlayDraw();
}

function updatePathPreviewFromPointer(clientX, clientY) {
  if (interactionMode !== "pathfinding") {
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
    return;
  }
  const ndc = clientToNdc(clientX, clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
    requestOverlayDraw();
    return;
  }
  const pixel = uvToMapPixelIndex(uv);
  if (movePreviewState.hoverPixel && movePreviewState.hoverPixel.x === pixel.x && movePreviewState.hoverPixel.y === pixel.y) {
    return;
  }
  movePreviewState.hoverPixel = { x: pixel.x, y: pixel.y };
  refreshPathPreview();
}

function getCurrentPathMetrics() {
  if (!movementField || !movePreviewState.hoverPixel || movePreviewState.pathPixels.length === 0) return null;
  const targetX = movePreviewState.hoverPixel.x;
  const targetY = movePreviewState.hoverPixel.y;
  if (targetX < movementField.minX || targetX > movementField.maxX || targetY < movementField.minY || targetY > movementField.maxY) return null;
  const idx = (targetY - movementField.minY) * movementField.width + (targetX - movementField.minX);
  const totalCost = movementField.dist[idx];
  if (!Number.isFinite(totalCost)) return null;
  const nodeCount = movePreviewState.pathPixels.length;
  if (nodeCount <= 0) return null;
  const steps = Math.max(0, nodeCount - 1);
  return {
    steps,
    totalCost,
    avgPerStep: steps > 0 ? totalCost / steps : 0,
  };
}

function updateInfoPanel() {
  if (isSwarmEnabled()) {
    const cursorMode = getSwarmCursorMode();
    playerInfoEl.textContent = `Swarm: ${swarmState.count} agents`;
    pathInfoEl.textContent = `Swarm Cursor: ${cursorMode}${swarmCursorState.active ? " (active)" : ""}`;
    return;
  }
  playerInfoEl.textContent = `Player: (${playerState.pixelX}, ${playerState.pixelY})`;
  const metrics = getCurrentPathMetrics();
  if (!metrics) {
    pathInfoEl.textContent = "Path: len -- | cost -- | avg --";
    return;
  }
  pathInfoEl.textContent = `Path: len ${metrics.steps} | cost ${metrics.totalCost.toFixed(2)} | avg ${metrics.avgPerStep.toFixed(2)}`;
}

function syncSwarmStatsPanelVisibility() {
  const showStatsPanel = swarmStatsPanelToggle.checked;
  swarmStatsPanelEl.hidden = !showStatsPanel;
  swarmStatsPanelEl.classList.toggle("hidden", !showStatsPanel);
  swarmStatsPanelEl.style.display = showStatsPanel ? "block" : "none";
}

function updateSwarmStatsPanel() {
  syncSwarmStatsPanelVisibility();
  swarmStatsBirdsValue.textContent = String(swarmState.count);
  swarmStatsHawksValue.textContent = String(swarmState.hawks.length);
  swarmStatsStepsValue.textContent = Math.round(Math.max(0, swarmState.stepCount)).toLocaleString();
  if (swarmState.hawkKillCount > 0) {
    const avg = swarmState.hawkKillIntervalSum / swarmState.hawkKillCount;
    swarmStatsAvgHawkKillValue.textContent = `${avg.toFixed(1)} ticks`;
  } else {
    swarmStatsAvgHawkKillValue.textContent = "--";
  }
}

function updateParallaxStrengthLabel() {
  const value = clamp(Number(parallaxStrengthInput.value), 0, 1);
  parallaxStrengthValue.textContent = value.toFixed(2);
}

function updateParallaxBandsLabel() {
  const value = Math.round(clamp(Number(parallaxBandsInput.value), 2, 256));
  parallaxBandsValue.textContent = String(value);
}

function updateShadowBlurLabel() {
  const value = clamp(Number(shadowBlurInput.value), 0, 3);
  shadowBlurValue.textContent = `${value.toFixed(2)} px`;
}

function updateFogAlphaLabels() {
  fogMinAlphaValue.textContent = clamp(Number(fogMinAlphaInput.value), 0, 1).toFixed(2);
  fogMaxAlphaValue.textContent = clamp(Number(fogMaxAlphaInput.value), 0, 1).toFixed(2);
}

function updateFogFalloffLabel() {
  fogFalloffValue.textContent = clamp(Number(fogFalloffInput.value), 0.2, 4).toFixed(2);
}

function updateFogStartOffsetLabel() {
  fogStartOffsetValue.textContent = clamp(Number(fogStartOffsetInput.value), 0, 1).toFixed(2);
}

function updatePointFlickerLabels() {
  pointFlickerStrengthValue.textContent = clamp(Number(pointFlickerStrengthInput.value), 0, 1).toFixed(2);
  pointFlickerSpeedValue.textContent = `${clamp(Number(pointFlickerSpeedInput.value), 0.1, 12).toFixed(2)} Hz`;
  pointFlickerSpatialValue.textContent = clamp(Number(pointFlickerSpatialInput.value), 0, 4).toFixed(2);
}

function updatePointFlickerUi() {
  const enabled = pointFlickerToggle.checked;
  pointFlickerStrengthInput.disabled = !enabled;
  pointFlickerSpeedInput.disabled = !enabled;
  pointFlickerSpatialInput.disabled = !enabled;
}

function updateVolumetricLabels() {
  volumetricStrengthValue.textContent = clamp(Number(volumetricStrengthInput.value), 0, 1).toFixed(2);
  volumetricDensityValue.textContent = clamp(Number(volumetricDensityInput.value), 0, 2).toFixed(2);
  volumetricAnisotropyValue.textContent = clamp(Number(volumetricAnisotropyInput.value), 0, 0.95).toFixed(2);
  volumetricLengthValue.textContent = `${Math.round(clamp(Number(volumetricLengthInput.value), 8, 160))} px`;
  volumetricSamplesValue.textContent = String(Math.round(clamp(Number(volumetricSamplesInput.value), 4, 24)));
}

function updateVolumetricUi() {
  const enabled = volumetricToggle.checked;
  volumetricStrengthInput.disabled = !enabled;
  volumetricDensityInput.disabled = !enabled;
  volumetricAnisotropyInput.disabled = !enabled;
  volumetricLengthInput.disabled = !enabled;
  volumetricSamplesInput.disabled = !enabled;
}

function updateCloudLabels() {
  cloudCoverageValue.textContent = clamp(Number(cloudCoverageInput.value), 0, 1).toFixed(2);
  cloudSoftnessValue.textContent = clamp(Number(cloudSoftnessInput.value), 0.01, 0.35).toFixed(2);
  cloudOpacityValue.textContent = clamp(Number(cloudOpacityInput.value), 0, 1).toFixed(2);
  cloudScaleValue.textContent = clamp(Number(cloudScaleInput.value), 0.5, 8).toFixed(2);
  cloudSpeed1Value.textContent = clamp(Number(cloudSpeed1Input.value), -0.3, 0.3).toFixed(3);
  cloudSpeed2Value.textContent = clamp(Number(cloudSpeed2Input.value), -0.3, 0.3).toFixed(3);
  cloudSunParallaxValue.textContent = clamp(Number(cloudSunParallaxInput.value), 0, 2).toFixed(2);
}

function updateWaterLabels() {
  waterFlowDirectionValue.textContent = `${Math.round(clamp(Number(waterFlowDirectionInput.value), 0, 360))} deg`;
  waterLocalFlowMixValue.textContent = clamp(Number(waterLocalFlowMixInput.value), 0, 1).toFixed(2);
  waterDownhillBoostValue.textContent = clamp(Number(waterDownhillBoostInput.value), 0, 4).toFixed(2);
  waterFlowRadius1Value.textContent = String(Math.round(clamp(Number(waterFlowRadius1Input.value), 1, 12)));
  waterFlowRadius2Value.textContent = String(Math.round(clamp(Number(waterFlowRadius2Input.value), 1, 24)));
  waterFlowRadius3Value.textContent = String(Math.round(clamp(Number(waterFlowRadius3Input.value), 1, 40)));
  waterFlowWeight1Value.textContent = clamp(Number(waterFlowWeight1Input.value), 0, 1).toFixed(2);
  waterFlowWeight2Value.textContent = clamp(Number(waterFlowWeight2Input.value), 0, 1).toFixed(2);
  waterFlowWeight3Value.textContent = clamp(Number(waterFlowWeight3Input.value), 0, 1).toFixed(2);
  waterFlowStrengthValue.textContent = clamp(Number(waterFlowStrengthInput.value), 0, 0.15).toFixed(3);
  waterFlowSpeedValue.textContent = clamp(Number(waterFlowSpeedInput.value), 0, 2.5).toFixed(2);
  waterFlowScaleValue.textContent = clamp(Number(waterFlowScaleInput.value), 0.5, 14).toFixed(2);
  waterShimmerStrengthValue.textContent = clamp(Number(waterShimmerStrengthInput.value), 0, 0.2).toFixed(3);
  waterGlintStrengthValue.textContent = clamp(Number(waterGlintStrengthInput.value), 0, 1.5).toFixed(2);
  waterGlintSharpnessValue.textContent = clamp(Number(waterGlintSharpnessInput.value), 0, 1).toFixed(2);
  waterShoreFoamStrengthValue.textContent = clamp(Number(waterShoreFoamStrengthInput.value), 0, 0.5).toFixed(2);
  waterShoreWidthValue.textContent = `${clamp(Number(waterShoreWidthInput.value), 0.4, 6).toFixed(1)} px`;
  waterReflectivityValue.textContent = clamp(Number(waterReflectivityInput.value), 0, 1).toFixed(2);
  waterTintStrengthValue.textContent = clamp(Number(waterTintStrengthInput.value), 0, 1).toFixed(2);
}

function updateParallaxUi() {
  parallaxStrengthInput.disabled = !parallaxToggle.checked;
  parallaxBandsInput.disabled = !parallaxToggle.checked;
}

function updateFogUi() {
  const enabled = fogToggle.checked;
  fogColorInput.disabled = !enabled;
  fogMinAlphaInput.disabled = !enabled;
  fogMaxAlphaInput.disabled = !enabled;
  fogFalloffInput.disabled = !enabled;
  fogStartOffsetInput.disabled = !enabled;
}

function updateCloudUi() {
  const enabled = cloudToggle.checked;
  cloudCoverageInput.disabled = !enabled;
  cloudSoftnessInput.disabled = !enabled;
  cloudOpacityInput.disabled = !enabled;
  cloudScaleInput.disabled = !enabled;
  cloudSpeed1Input.disabled = !enabled;
  cloudSpeed2Input.disabled = !enabled;
  cloudSunParallaxInput.disabled = !enabled;
  cloudSunProjectToggle.disabled = !enabled;
}

function updateWaterUi() {
  const enabled = waterFxToggle.checked;
  const downhill = waterFlowDownhillToggle.checked;
  waterFlowDownhillToggle.disabled = !enabled;
  waterFlowInvertDownhillToggle.disabled = !enabled || !downhill;
  waterFlowDebugToggle.disabled = !enabled;
  waterFlowDirectionInput.disabled = !enabled || downhill;
  waterLocalFlowMixInput.disabled = !enabled || !downhill;
  waterDownhillBoostInput.disabled = !enabled || !downhill;
  waterFlowRadius1Input.disabled = !enabled || !downhill;
  waterFlowRadius2Input.disabled = !enabled || !downhill;
  waterFlowRadius3Input.disabled = !enabled || !downhill;
  waterFlowWeight1Input.disabled = !enabled || !downhill;
  waterFlowWeight2Input.disabled = !enabled || !downhill;
  waterFlowWeight3Input.disabled = !enabled || !downhill;
  waterFlowStrengthInput.disabled = !enabled;
  waterFlowSpeedInput.disabled = !enabled;
  waterFlowScaleInput.disabled = !enabled;
  waterShimmerStrengthInput.disabled = !enabled;
  waterGlintStrengthInput.disabled = !enabled;
  waterGlintSharpnessInput.disabled = !enabled;
  waterShoreFoamStrengthInput.disabled = !enabled;
  waterShoreWidthInput.disabled = !enabled;
  waterReflectivityInput.disabled = !enabled;
  waterTintColorInput.disabled = !enabled;
  waterTintStrengthInput.disabled = !enabled;
}

function updateCycleHourLabel() {
  cycleHourValue.textContent = formatHour(cycleState.hour);
}

function requestOverlayDraw() {
  overlayDirty = true;
}

const overlayHooks = createOverlayHooks({
  updateSwarm,
  updateSwarmFollowCamera,
  drawOverlay,
  isOverlayDirty: () => overlayDirty,
  clearOverlayDirty: () => {
    overlayDirty = false;
  },
});

function rgbToHex(rgb) {
  const r = Math.round(clamp(rgb[0], 0, 1) * 255);
  const g = Math.round(clamp(rgb[1], 0, 1) * 255);
  const b = Math.round(clamp(rgb[2], 0, 1) * 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb01(hex) {
  const text = String(hex || "").trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(text);
  if (!match) return [0.5, 0.5, 0.5];
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

function drawOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  const worldPerMapPixel = getMapAspect() / splatSize.width;

  if (interactionMode === "lighting") {
    for (const light of pointLights) {
      const selected = light.id === selectedLightId;
      const displayStrength = selected && lightEditDraft ? lightEditDraft.strength : light.strength;
      const displayColor = selected && lightEditDraft ? lightEditDraft.color : light.color;
      const centerWorld = mapPixelToWorld(light.pixelX, light.pixelY);
      const centerScreen = worldToScreen(centerWorld);
      const edgeWorld = { x: centerWorld.x + worldPerMapPixel * displayStrength, y: centerWorld.y };
      const edgeScreen = worldToScreen(edgeWorld);
      const screenRadius = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      const rgb = displayColor.map((v) => Math.round(clamp(v, 0, 1) * 255));

      overlayCtx.beginPath();
      overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
      overlayCtx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${selected ? 0.95 : 0.7})`;
      overlayCtx.lineWidth = selected ? 2 : 1;
      overlayCtx.stroke();

      overlayCtx.beginPath();
      overlayCtx.arc(centerScreen.x, centerScreen.y, selected ? 5 : 4, 0, Math.PI * 2);
      overlayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      overlayCtx.fill();

      if (selected) {
        overlayCtx.beginPath();
        overlayCtx.arc(centerScreen.x, centerScreen.y, 7, 0, Math.PI * 2);
        overlayCtx.strokeStyle = "rgba(255,255,255,0.85)";
        overlayCtx.lineWidth = 1.5;
        overlayCtx.stroke();
      }
    }
  }

  if (cursorLightModeToggle.checked && cursorLightState.active && cursorLightState.showGizmo) {
    const cursorPixelX = clamp(Math.floor(cursorLightState.uvX * splatSize.width), 0, splatSize.width - 1);
    const cursorPixelY = clamp(Math.floor((1 - cursorLightState.uvY) * splatSize.height), 0, splatSize.height - 1);
    const centerWorld = mapPixelToWorld(cursorPixelX, cursorPixelY);
    const centerScreen = worldToScreen(centerWorld);
    const edgeWorld = { x: centerWorld.x + worldPerMapPixel * cursorLightState.strength, y: centerWorld.y };
    const edgeScreen = worldToScreen(edgeWorld);
    const screenRadius = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
    const rgb = cursorLightState.color.map((v) => Math.round(clamp(v, 0, 1) * 255));

    overlayCtx.beginPath();
    overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
    overlayCtx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`;
    overlayCtx.lineWidth = 2;
    overlayCtx.stroke();

    overlayCtx.beginPath();
    overlayCtx.arc(centerScreen.x, centerScreen.y, 4.5, 0, Math.PI * 2);
    overlayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    overlayCtx.fill();
  }

  const drawMapDot = (pixelX, pixelY, color, radiusMapPx = 0.5) => {
    const centerWorld = mapPixelToWorld(pixelX, pixelY);
    const centerScreen = worldToScreen(centerWorld);
    const edgeWorld = { x: centerWorld.x + worldPerMapPixel * radiusMapPx, y: centerWorld.y };
    const edgeScreen = worldToScreen(edgeWorld);
    const screenRadius = Math.max(0.001, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
    overlayCtx.beginPath();
    overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
    overlayCtx.fillStyle = color;
    overlayCtx.fill();
  };

  if (interactionMode === "pathfinding" && movePreviewState.pathPixels.length > 0) {
    for (const node of movePreviewState.pathPixels) {
      drawMapDot(node.x, node.y, "rgba(112, 214, 255, 0.9)");
    }
  }

  drawMapDot(playerState.pixelX, playerState.pixelY, playerState.color);
  if (isSwarmEnabled()) {
    const swarmSettings = getSwarmSettings();
    if (!swarmSettings.useLitSwarm) {
      drawSwarmUnlitOverlay(swarmSettings);
    }
    drawSwarmGizmos(swarmSettings);
  }
}

bindCanvasControls({
  canvas,
  windowEl: window,
  dispatchCoreCommand,
  updateSwarmCursorFromPointer,
  updateCursorLightFromPointer,
  updatePathPreviewFromPointer,
  isMiddleDragging: () => isMiddleDragging,
  cursorLightModeToggle,
  getInteractionMode: () => interactionMode,
  requestOverlayDraw,
  clientToNdc,
  worldFromNdc,
  worldToUv,
  uvToMapPixelIndex,
  swarmCursorState,
  cursorLightState,
  movePreviewState,
});

bindPathfindingControls({
  pathfindingRangeInput,
  pathWeightSlopeInput,
  pathWeightHeightInput,
  pathWeightWaterInput,
  pathSlopeCutoffInput,
  pathBaseCostInput,
  dispatchCoreCommand,
});

bindSwarmPanelControls({
  swarmShowTerrainToggle,
  swarmLitModeToggle,
  swarmFollowZoomToggle,
  swarmFollowZoomInInput,
  swarmFollowZoomOutInput,
  swarmFollowHawkRangeGizmoToggle,
  swarmFollowAgentSpeedSmoothingInput,
  swarmFollowAgentZoomSmoothingInput,
  swarmStatsPanelToggle,
  swarmBackgroundColorInput,
  swarmAgentCountInput,
  swarmUpdateIntervalInput,
  swarmMaxSpeedInput,
  swarmSteeringMaxInput,
  swarmVariationStrengthInput,
  swarmNeighborRadiusInput,
  swarmMinHeightInput,
  swarmMaxHeightInput,
  swarmSeparationRadiusInput,
  swarmAlignmentWeightInput,
  swarmCohesionWeightInput,
  swarmSeparationWeightInput,
  swarmWanderWeightInput,
  swarmRestChanceInput,
  swarmRestTicksInput,
  swarmBreedingThresholdInput,
  swarmBreedingSpawnChanceInput,
  swarmCursorModeInput,
  swarmCursorStrengthInput,
  swarmCursorRadiusInput,
  swarmHawkEnabledToggle,
  swarmHawkCountInput,
  swarmHawkColorInput,
  swarmHawkSpeedInput,
  swarmHawkSteeringInput,
  swarmHawkTargetRangeInput,
  swarmEnabledToggle,
  dispatchCoreCommand,
  swarmState,
  swarmCursorState,
  swarmFollowState,
  clamp,
  getSwarmSettings,
  updateSwarmUi,
  updateSwarmLabels,
  updateSwarmStatsPanel,
  normalizeSwarmFollowZoomInputs,
  normalizeSwarmHeightRangeInputs,
  reseedSwarmAgents,
  resetSwarmFollowSpeedSmoothing,
  updateSwarmFollowButtonUi,
  requestOverlayDraw,
  setStatus,
});

bindSwarmFollowControls({
  swarmFollowToggleBtn,
  swarmFollowTargetInput,
  dispatchCoreCommand,
});
bindTopicPanelControls({
  topicButtons,
  topicPanelCloseBtn,
  windowEl: window,
  setActiveTopic,
  canUseTopic: canUseTopicInCurrentMode,
  setStatus,
});

bindInteractionAndCycleControls({
  windowEl: window,
  dockLightingModeToggle,
  dockPathfindingModeToggle,
  cycleHourInput,
  dispatchCoreCommand,
  getInteractionMode: () => interactionMode,
  canUseInteractionMode: canUseInteractionInCurrentMode,
  movePreviewState,
  rebuildMovementField,
  requestOverlayDraw,
  setStatus,
});

bindCursorLightControls({
  cursorLightModeToggle,
  cursorLightFollowHeightToggle,
  cursorLightColorInput,
  cursorLightStrengthInput,
  cursorLightHeightOffsetInput,
  cursorLightGizmoToggle,
  dispatchCoreCommand,
  setStatus,
});

bindPointLightEditorControls({
  pointLightColorInput,
  pointLightStrengthInput,
  pointLightIntensityInput,
  pointLightHeightOffsetInput,
  pointLightFlickerInput,
  pointLightFlickerSpeedInput,
  pointLightLiveUpdateToggle,
  lightSaveBtn,
  lightCancelBtn,
  lightDeleteBtn,
  pointLightsSaveAllBtn,
  pointLightsLoadAllBtn,
  pointLightsLoadInput,
  clamp,
  hexToRgb01,
  hasLightEditDraft: () => Boolean(lightEditDraft),
  setLightEditDraftColor: (value) => {
    if (!lightEditDraft) return;
    lightEditDraft.color = value;
  },
  setLightEditDraftStrength: (value) => {
    if (!lightEditDraft) return;
    lightEditDraft.strength = value;
  },
  setLightEditDraftIntensity: (value) => {
    if (!lightEditDraft) return;
    lightEditDraft.intensity = value;
  },
  setLightEditDraftHeightOffset: (value) => {
    if (!lightEditDraft) return;
    lightEditDraft.heightOffset = value;
  },
  setLightEditDraftFlicker: (value) => {
    if (!lightEditDraft) return;
    lightEditDraft.flicker = value;
  },
  setLightEditDraftFlickerSpeed: (value) => {
    if (!lightEditDraft) return;
    lightEditDraft.flickerSpeed = value;
  },
  updatePointLightStrengthLabel,
  updatePointLightIntensityLabel,
  updatePointLightHeightOffsetLabel,
  updatePointLightFlickerLabel,
  updatePointLightFlickerSpeedLabel,
  rebakeIfPointLightLiveUpdateEnabled,
  requestOverlayDraw,
  applyDraftToSelectedPointLight,
  bakePointLightsTexture,
  updateLightEditorUi,
  getSelectedPointLight,
  deletePointLightById: (id) => {
    const idx = pointLights.findIndex((light) => light.id === id);
    if (idx >= 0) {
      pointLights.splice(idx, 1);
    }
  },
  clearLightEditSelection: () => {
    selectedLightId = null;
    lightEditDraft = null;
  },
  isPointLightsSaveConfirmArmed: () => pointLightsSaveConfirmArmed,
  armPointLightsSaveConfirmation,
  resetPointLightsSaveConfirmation,
  savePointLightsJson,
  loadPointLightsFromAssetsOrPrompt,
  applyLoadedPointLights,
  setStatus,
});

bindRenderFxControls({
  parallaxStrengthInput,
  parallaxBandsInput,
  parallaxToggle,
  shadowBlurInput,
  volumetricStrengthInput,
  volumetricDensityInput,
  volumetricAnisotropyInput,
  volumetricLengthInput,
  volumetricSamplesInput,
  volumetricToggle,
  pointFlickerStrengthInput,
  pointFlickerSpeedInput,
  pointFlickerSpatialInput,
  pointFlickerToggle,
  fogMinAlphaInput,
  fogMaxAlphaInput,
  fogFalloffInput,
  fogStartOffsetInput,
  fogToggle,
  fogColorInput,
  cloudCoverageInput,
  cloudSoftnessInput,
  cloudOpacityInput,
  cloudScaleInput,
  cloudSpeed1Input,
  cloudSpeed2Input,
  cloudSunParallaxInput,
  cloudToggle,
  waterFlowDirectionInput,
  waterLocalFlowMixInput,
  waterDownhillBoostInput,
  waterFlowRadius1Input,
  waterFlowRadius2Input,
  waterFlowRadius3Input,
  waterFlowWeight1Input,
  waterFlowWeight2Input,
  waterFlowWeight3Input,
  waterFlowStrengthInput,
  waterFlowSpeedInput,
  waterFlowScaleInput,
  waterShimmerStrengthInput,
  waterGlintStrengthInput,
  waterGlintSharpnessInput,
  waterShoreFoamStrengthInput,
  waterShoreWidthInput,
  waterReflectivityInput,
  waterTintStrengthInput,
  waterFxToggle,
  waterFlowDownhillToggle,
  waterFlowInvertDownhillToggle,
  dispatchCoreCommand,
  updateParallaxStrengthLabel,
  updateParallaxBandsLabel,
  updateParallaxUi,
  updateShadowBlurLabel,
  updateVolumetricLabels,
  updateVolumetricUi,
  updatePointFlickerLabels,
  updatePointFlickerUi,
  updateFogAlphaLabels,
  updateFogFalloffLabel,
  updateFogStartOffsetLabel,
  updateFogUi,
  markFogColorManual: () => {
    fogColorManual = true;
  },
  updateCloudLabels,
  updateCloudUi,
  updateWaterLabels,
  updateWaterUi,
  rebuildFlowMapTexture,
});

async function tryAutoLoadDefaultMap() {
  for (const candidate of DEFAULT_MAP_FOLDER_CANDIDATES) {
    try {
      await loadMapFromPath(candidate);
      return;
    } catch (err) {
      console.warn(`Failed to load default map folder ${candidate}`, err);
    }
  }

  setStatus("Using fallback textures. Load a map folder to begin.");
}

bindMapIoControls({
  mapPathInput,
  mapPathLoadBtn,
  mapFolderInput,
  mapSaveAllBtn,
  normalizeMapFolderPath,
  tauriInvoke,
  pickMapFolderViaTauri,
  loadMapFromPath,
  loadMapFromFolderSelection,
  saveAllMapDataFiles,
  setStatus,
});

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  let overlayResized = false;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  if (overlayCanvas.width !== w || overlayCanvas.height !== h) {
    overlayCanvas.width = w;
    overlayCanvas.height = h;
    overlayResized = true;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  if (overlayResized) {
    requestOverlayDraw();
  }
}

function computeLightingParams() {
  const sun = sampleSunAtHour(cycleState.hour);
  const moonTrack = sampleSunAtHour(wrapHour(cycleState.hour + 12));
  const azimuthRad = sun.azimuthDeg * Math.PI / 180;
  const altitudeRad = sun.altitudeDeg * Math.PI / 180;
  const cosAlt = Math.cos(altitudeRad);
  const sunDir = [
    Math.cos(azimuthRad) * cosAlt,
    Math.sin(azimuthRad) * cosAlt,
    Math.sin(altitudeRad),
  ];
  const moonAzimuthRad = moonTrack.azimuthDeg * Math.PI / 180;
  const moonAltitudeDeg = moonTrack.altitudeDeg * 0.9;
  const moonAltitudeRad = moonAltitudeDeg * Math.PI / 180;
  const moonCosAlt = Math.cos(moonAltitudeRad);
  const moonDir = [
    Math.cos(moonAzimuthRad) * moonCosAlt,
    Math.sin(moonAzimuthRad) * moonCosAlt,
    Math.sin(moonAltitudeRad),
  ];

  const ambientBase = Number(ambientInput.value);
  const diffuseBase = clamp(Number(diffuseInput.value), 0, 2);
  const sunVisible = smoothstep(-4, 2, sun.altitudeDeg);
  const moonVisible = smoothstep(-10, 6, moonAltitudeDeg);
  const sunStrength = sunVisible * diffuseBase;
  const moonStrength = 0.22 * moonVisible * diffuseBase;

  const moonAmbientColor = [0.20, 0.26, 0.40];
  const sunAmbientWeight = sun.ambientScale;
  const moonAmbientWeight = 0.24 * moonVisible;
  const totalAmbientWeight = sunAmbientWeight + moonAmbientWeight;
  let ambientColor = [0.08, 0.10, 0.14];
  if (totalAmbientWeight > 0.0001) {
    ambientColor = [
      (sun.ambientColor[0] * sunAmbientWeight + moonAmbientColor[0] * moonAmbientWeight) / totalAmbientWeight,
      (sun.ambientColor[1] * sunAmbientWeight + moonAmbientColor[1] * moonAmbientWeight) / totalAmbientWeight,
      (sun.ambientColor[2] * sunAmbientWeight + moonAmbientColor[2] * moonAmbientWeight) / totalAmbientWeight,
    ];
  }
  const nightFactor = 1 - smoothstep(-2, 8, sun.altitudeDeg);
  const nightAmbientColor = [0.14, 0.22, 0.34];
  ambientColor = lerpVec3(ambientColor, nightAmbientColor, 0.45 * nightFactor);
  const ambientFinal = clamp(ambientBase * (sunAmbientWeight + moonAmbientWeight) + 0.05 * nightFactor, 0, 1);
  const moonColor = [0.34, 0.40, 0.54];
  const zoomNorm = clamp((zoom - zoomMin) / (zoomMax - zoomMin), 0, 1);
  const cameraHeightNorm = 1 - zoomNorm;

  const fogSunWeight = 0.16 + 0.28 * sunVisible;
  const fogMoonWeight = 0.10 * moonVisible;
  const fogAmbientWeight = 0.70;
  const fogBaseWeight = 0.35;
  const fogBaseColor = [0.34, 0.40, 0.46];
  const fogWeightSum = fogSunWeight + fogMoonWeight + fogAmbientWeight + fogBaseWeight;
  const fogColorAuto = [
    (sun.sunColor[0] * fogSunWeight + moonColor[0] * fogMoonWeight + ambientColor[0] * fogAmbientWeight + fogBaseColor[0] * fogBaseWeight) / fogWeightSum,
    (sun.sunColor[1] * fogSunWeight + moonColor[1] * fogMoonWeight + ambientColor[1] * fogAmbientWeight + fogBaseColor[1] * fogBaseWeight) / fogWeightSum,
    (sun.sunColor[2] * fogSunWeight + moonColor[2] * fogMoonWeight + ambientColor[2] * fogAmbientWeight + fogBaseColor[2] * fogBaseWeight) / fogWeightSum,
  ];
  if (!fogColorManual) {
    fogColorInput.value = rgbToHex(fogColorAuto);
  }
  const fogColor = fogColorManual ? hexToRgb01(fogColorInput.value) : fogColorAuto;
  const skySunWeight = 0.65 * sunVisible;
  const skyMoonWeight = 0.35 * moonVisible;
  const skyBaseWeight = 0.45;
  const skyBaseColor = [0.18, 0.24, 0.33];
  const skyWeightSum = skySunWeight + skyMoonWeight + skyBaseWeight;
  const skyColor = [
    (sun.sunColor[0] * skySunWeight + moonColor[0] * skyMoonWeight + skyBaseColor[0] * skyBaseWeight) / skyWeightSum,
    (sun.sunColor[1] * skySunWeight + moonColor[1] * skyMoonWeight + skyBaseColor[1] * skyBaseWeight) / skyWeightSum,
    (sun.sunColor[2] * skySunWeight + moonColor[2] * skyMoonWeight + skyBaseColor[2] * skyBaseWeight) / skyWeightSum,
  ];

  return {
    sun,
    sunDir,
    sunStrength,
    moonDir,
    moonColor,
    moonStrength,
    ambientColor,
    ambientFinal,
    fogColor,
    skyColor,
    cameraHeightNorm,
  };
}

function uploadUniforms(params, nowSec, input) {
  gl.useProgram(program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, splatTex);
  gl.uniform1i(uniforms.uSplat, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, normalsTex);
  gl.uniform1i(uniforms.uNormals, 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, heightTex);
  gl.uniform1i(uniforms.uHeight, 2);

  applyPointLightUsagePass({
    gl,
    uniforms,
    pointLightTex,
    pointFlickerEnabled: input.pointFlickerEnabled,
    pointFlickerStrength: input.pointFlickerStrength,
    pointFlickerSpeed: input.pointFlickerSpeed,
    pointFlickerSpatial: input.pointFlickerSpatial,
  });

  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, cloudNoiseTex);
  gl.uniform1i(uniforms.uCloudNoiseTex, 4);

  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, input.shadowBlurPx > 0.001 ? shadowBlurTex : shadowRawTex);
  gl.uniform1i(uniforms.uShadowTex, 5);

  gl.activeTexture(gl.TEXTURE6);
  gl.bindTexture(gl.TEXTURE_2D, waterTex);
  gl.uniform1i(uniforms.uWater, 6);

  gl.activeTexture(gl.TEXTURE7);
  gl.bindTexture(gl.TEXTURE_2D, flowMapTex);
  gl.uniform1i(uniforms.uFlowMap, 7);

  const viewHalf = getViewHalfExtents();
  gl.uniform2f(uniforms.uMapTexelSize, 1 / heightSize.width, 1 / heightSize.height);
  gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
  gl.uniform3f(uniforms.uSunDir, params.sunDir[0], params.sunDir[1], params.sunDir[2]);
  gl.uniform3f(uniforms.uSunColor, params.sun.sunColor[0], params.sun.sunColor[1], params.sun.sunColor[2]);
  gl.uniform1f(uniforms.uSunStrength, params.sunStrength);
  gl.uniform3f(uniforms.uMoonDir, params.moonDir[0], params.moonDir[1], params.moonDir[2]);
  gl.uniform3f(uniforms.uMoonColor, params.moonColor[0], params.moonColor[1], params.moonColor[2]);
  gl.uniform1f(uniforms.uMoonStrength, params.moonStrength);
  gl.uniform3f(uniforms.uAmbientColor, params.ambientColor[0], params.ambientColor[1], params.ambientColor[2]);
  gl.uniform1f(uniforms.uAmbient, params.ambientFinal);
  gl.uniform1f(uniforms.uHeightScale, input.heightScale);
  gl.uniform1f(uniforms.uShadowStrength, input.shadowStrength);
  gl.uniform1f(uniforms.uUseShadows, input.useShadows ? 1 : 0);
  gl.uniform1f(uniforms.uUseParallax, input.useParallax ? 1 : 0);
  gl.uniform1f(uniforms.uParallaxStrength, input.parallaxStrength);
  gl.uniform1f(uniforms.uParallaxBands, input.parallaxBands);
  gl.uniform1f(uniforms.uZoom, zoom);
  gl.uniform1f(uniforms.uUseFog, input.useFog ? 1 : 0);
  gl.uniform3f(uniforms.uFogColor, params.fogColor[0], params.fogColor[1], params.fogColor[2]);
  gl.uniform1f(uniforms.uFogMinAlpha, input.fogMinAlpha);
  gl.uniform1f(uniforms.uFogMaxAlpha, input.fogMaxAlpha);
  gl.uniform1f(uniforms.uFogFalloff, input.fogFalloff);
  gl.uniform1f(uniforms.uFogStartOffset, input.fogStartOffset);
  gl.uniform1f(uniforms.uCameraHeightNorm, params.cameraHeightNorm);
  gl.uniform1f(uniforms.uUseVolumetric, input.useVolumetric ? 1 : 0);
  gl.uniform1f(uniforms.uVolumetricStrength, input.volumetricStrength);
  gl.uniform1f(uniforms.uVolumetricDensity, input.volumetricDensity);
  gl.uniform1f(uniforms.uVolumetricAnisotropy, input.volumetricAnisotropy);
  gl.uniform1f(uniforms.uVolumetricLength, input.volumetricLength);
  gl.uniform1f(uniforms.uVolumetricSamples, input.volumetricSamples);
  gl.uniform1f(uniforms.uMapAspect, input.mapAspect);
  gl.uniform1f(uniforms.uUseCursorLight, input.useCursorLight ? 1 : 0);
  gl.uniform2f(uniforms.uCursorLightUv, cursorLightState.uvX, cursorLightState.uvY);
  gl.uniform3f(uniforms.uCursorLightColor, cursorLightState.color[0], cursorLightState.color[1], cursorLightState.color[2]);
  gl.uniform1f(uniforms.uCursorLightStrength, cursorLightState.strength);
  gl.uniform1f(uniforms.uCursorLightHeightOffset, cursorLightState.heightOffset);
  gl.uniform1f(uniforms.uUseCursorTerrainHeight, cursorLightState.useTerrainHeight ? 1 : 0);
  gl.uniform2f(uniforms.uCursorLightMapSize, splatSize.width, splatSize.height);
  gl.uniform2f(uniforms.uViewHalfExtents, viewHalf.x, viewHalf.y);
  gl.uniform2f(uniforms.uPanWorld, panWorld.x, panWorld.y);
  gl.uniform1f(uniforms.uTimeSec, Math.max(0, Number(nowSec) || 0));
  gl.uniform1f(uniforms.uUseClouds, input.useClouds ? 1 : 0);
  gl.uniform1f(uniforms.uCloudCoverage, input.cloudCoverage);
  gl.uniform1f(uniforms.uCloudSoftness, input.cloudSoftness);
  gl.uniform1f(uniforms.uCloudOpacity, input.cloudOpacity);
  gl.uniform1f(uniforms.uCloudScale, input.cloudScale);
  gl.uniform1f(uniforms.uCloudSpeed1, input.cloudSpeed1);
  gl.uniform1f(uniforms.uCloudSpeed2, input.cloudSpeed2);
  gl.uniform1f(uniforms.uCloudSunParallax, input.cloudSunParallax);
  gl.uniform1f(uniforms.uCloudUseSunProjection, input.cloudUseSunProjection ? 1 : 0);
  gl.uniform1f(uniforms.uUseWaterFx, input.useWaterFx ? 1 : 0);
  gl.uniform1f(uniforms.uWaterFlowDownhill, input.waterFlowDownhill ? 1 : 0);
  gl.uniform1f(uniforms.uWaterFlowInvertDownhill, input.waterFlowInvertDownhill ? 1 : 0);
  gl.uniform1f(uniforms.uWaterFlowDebug, input.waterFlowDebug ? 1 : 0);
  gl.uniform2f(uniforms.uWaterFlowDir, input.waterFlowDirX, input.waterFlowDirY);
  gl.uniform1f(uniforms.uWaterLocalFlowMix, input.waterLocalFlowMix);
  gl.uniform1f(uniforms.uWaterDownhillBoost, input.waterDownhillBoost);
  gl.uniform1f(uniforms.uWaterFlowStrength, input.waterFlowStrength);
  gl.uniform1f(uniforms.uWaterFlowSpeed, input.waterFlowSpeed);
  gl.uniform1f(uniforms.uWaterFlowScale, input.waterFlowScale);
  gl.uniform1f(uniforms.uWaterShimmerStrength, input.waterShimmerStrength);
  gl.uniform1f(uniforms.uWaterGlintStrength, input.waterGlintStrength);
  gl.uniform1f(uniforms.uWaterGlintSharpness, input.waterGlintSharpness);
  gl.uniform1f(uniforms.uWaterShoreFoamStrength, input.waterShoreFoamStrength);
  gl.uniform1f(uniforms.uWaterShoreWidth, input.waterShoreWidth);
  gl.uniform1f(uniforms.uWaterReflectivity, input.waterReflectivity);
  const waterTintColor = input.waterTintColor;
  gl.uniform3f(uniforms.uWaterTintColor, waterTintColor[0], waterTintColor[1], waterTintColor[2]);
  gl.uniform1f(uniforms.uWaterTintStrength, input.waterTintStrength);
  gl.uniform3f(uniforms.uSkyColor, params.skyColor[0], params.skyColor[1], params.skyColor[2]);
}

function render(nowMs) {
  const dtSec =
    runtimeCore.frame.lastNowMs === null
      ? 0
      : Math.min(0.25, Math.max(0, (nowMs - runtimeCore.frame.lastNowMs) * 0.001));
  runtimeCore.frame.lastNowMs = nowMs;
  updateCoreFrameSnapshot(runtimeCore.store, nowMs, {
    clamp,
    cycleSpeedInput,
    panWorld,
    getZoom: () => zoom,
    currentMapFolderPath,
    splatSize,
    getInteractionMode: () => interactionMode,
    getPlayerState: () => playerState,
    getPathfindingState: getPathfindingStateSnapshot,
    getSwarmRuntimeState: getSwarmRuntimeStateSnapshot,
    getWeatherInput: getWeatherInputSnapshot,
    getSimulationKnobs: getSimulationKnobsSnapshot,
    getCursorLightState: getCursorLightSnapshot,
  });
  runtimeCore.scheduler.updateAll({ nowMs, dtSec }, runtimeCore.store.getState());
  const coreState = runtimeCore.store.getState();
  applyRuntimeParityFromCoreState(coreState, {
    clamp,
    panWorld,
    cycleSpeedInput,
    setZoom: (value) => {
      zoom = value;
    },
    setInteractionMode,
    pathfindingRangeInput,
    pathWeightSlopeInput,
    pathWeightHeightInput,
    pathWeightWaterInput,
    pathSlopeCutoffInput,
    pathBaseCostInput,
  });

  resize();
  overlayHooks.updateGameplay(nowMs);
  const systemState = coreState.systems || {};
  const simulationState = coreState.simulation || {};
  const simulationWeather = simulationState.weather || null;
  const lightingParams = systemState.lighting && systemState.lighting.lightingParams
    ? systemState.lighting.lightingParams
    : computeLightingParams();
  const uniformInput = buildUniformInputState({
    clamp,
    getMapAspect,
    cursorLightState,
    cursorLightModeToggle,
    heightScaleInput,
    shadowStrengthInput,
    shadowBlurInput,
    shadowsToggle,
    parallaxToggle,
    parallaxStrengthInput,
    parallaxBandsInput,
    fogToggle,
    fogMinAlphaInput,
    fogMaxAlphaInput,
    fogFalloffInput,
    fogStartOffsetInput,
    volumetricToggle,
    volumetricStrengthInput,
    volumetricDensityInput,
    volumetricAnisotropyInput,
    volumetricLengthInput,
    volumetricSamplesInput,
    pointFlickerToggle,
    pointFlickerStrengthInput,
    pointFlickerSpeedInput,
    pointFlickerSpatialInput,
    cloudToggle,
    cloudCoverageInput,
    cloudSoftnessInput,
    cloudOpacityInput,
    cloudScaleInput,
    cloudSpeed1Input,
    cloudSpeed2Input,
    cloudSunParallaxInput,
    cloudSunProjectToggle,
    waterFxToggle,
    waterFlowDownhillToggle,
    waterFlowInvertDownhillToggle,
    waterFlowDebugToggle,
    waterFlowDirectionInput,
    waterLocalFlowMixInput,
    waterDownhillBoostInput,
    waterFlowStrengthInput,
    waterFlowSpeedInput,
    waterFlowScaleInput,
    waterShimmerStrengthInput,
    waterGlintStrengthInput,
    waterGlintSharpnessInput,
    waterShoreFoamStrengthInput,
    waterShoreWidthInput,
    waterReflectivityInput,
    waterTintColorInput,
    waterTintStrengthInput,
    hexToRgb01,
    fogState: systemState.fog || null,
    cloudState: systemState.clouds || null,
    waterFxState: systemState.waterFx || null,
    weatherState: simulationWeather,
  });
  const cycleSpeed = Number(systemState.time && systemState.time.cycleSpeedHoursPerSec) || 0;
  cycleInfoEl.textContent = `Time: ${formatHour(cycleState.hour)} | Speed: ${cycleSpeed.toFixed(2)} h/s`;
  updateInfoPanel();
  updateSwarmStatsPanel();
  updateCycleHourLabel();

  const swarmSettings = getSwarmSettings();
  const swarmEnabled = swarmSettings.useAgentSwarm;
  const showTerrain = !swarmEnabled || swarmSettings.showTerrainInSwarm;
  renderResources.setWeatherFieldMeta({
    width: Math.max(1, Math.floor(splatSize.width * 0.25)),
    height: Math.max(1, Math.floor(splatSize.height * 0.25)),
    updatedAtSec:
      simulationWeather != null && simulationWeather.timeSec != null
        ? Number(simulationWeather.timeSec)
        : nowMs * 0.001,
  });
  const frameState = buildFrameRenderState({
    coreState,
    nowMs,
    dtSec,
    cycleHour: cycleState.hour,
    cycleSpeedHoursPerSec: cycleSpeed,
    panWorld,
    zoom,
    currentMapFolderPath,
    splatSize,
    lightingParams,
    uniformInput,
    showTerrain,
    backgroundColorRgb: hexToRgb01(swarmBackgroundColorInput.value),
    swarmEnabled,
    swarmLitEnabled: swarmSettings.useLitSwarm,
  });
  renderer.renderTerrainFrame(frameState);
  if (frameState.swarm.enabled && frameState.swarm.litEnabled) {
    renderSwarmLit(frameState.lightingParams, frameState.time.nowSec, swarmSettings);
  }

  overlayHooks.renderOverlayIfNeeded(frameState);
  requestAnimationFrame(render);
}

bindRuntimeControls({
  windowEl: window,
  heightScaleInput,
  schedulePointLightBake,
  resize,
});

void tryAutoLoadDefaultMap().catch((error) => {
  console.error("Default map auto-load failed:", error);
  const message = error instanceof Error ? error.message : String(error);
  setStatus(`Default map auto-load failed: ${message}`);
});
setSwarmDefaults();
normalizeSwarmHeightRangeInputs("min");
updatePathfindingRangeLabel();
updatePathWeightLabels();
updatePathSlopeCutoffLabel();
updatePathBaseCostLabel();
updateSwarmLabels();
updateSwarmUi();
updateSwarmStatsPanel();
updateSwarmFollowButtonUi();
updateParallaxStrengthLabel();
updateParallaxBandsLabel();
updateShadowBlurLabel();
updateVolumetricLabels();
updatePointFlickerLabels();
updateFogAlphaLabels();
updateFogFalloffLabel();
updateFogStartOffsetLabel();
updateCloudLabels();
updateWaterLabels();
updatePointLightStrengthLabel();
updatePointLightIntensityLabel();
updatePointLightHeightOffsetLabel();
updatePointLightFlickerLabel();
updatePointLightFlickerSpeedLabel();
updateCursorLightStrengthLabel();
updateCursorLightHeightOffsetLabel();
setCycleHourSliderFromState();
updateCycleHourLabel();
mapPathInput.value = currentMapFolderPath;
updateLightEditorUi();
updateCursorLightModeUi();
updateParallaxUi();
updateVolumetricUi();
updatePointFlickerUi();
updateFogUi();
updateCloudUi();
updateWaterUi();
setActiveTopic("");
setInteractionMode("none");
updateModeCapabilitiesUi();
reseedSwarmAgents(getSwarmSettings().agentCount);
setStatus(`${statusEl.textContent} | Load maps by folder/path, use left dock mode toggles (LM/PF), wheel zoom + middle-drag pan for terrain, and Agent Swarm panel toggle for boid testing.`);
requestAnimationFrame(render);
