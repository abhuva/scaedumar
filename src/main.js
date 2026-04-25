import { createRuntimeCore, createCoreCommandDispatch } from "./core/runtimeCore.js";
import { registerMainCommands } from "./core/registerMainCommands.js";
import {
  SIM_SECONDS_PER_HOUR,
  buildFrameTimeState,
  getRoutedSystemTime,
  normalizeRoutingMode,
  normalizeSimTickHours,
  normalizeTimeRouting,
} from "./core/timeRouter.js";
import { createSettingsCoreSetupRuntime } from "./core/settingsCoreSetupRuntime.js";
import { setupRuntimeSystems } from "./core/runtimeSystemSetup.js";
import { createSystemStoreSyncRuntime } from "./core/systemStoreSyncRuntime.js";
import { createSwarmIntegrationSetupRuntime } from "./app/swarmIntegrationSetupRuntime.js";
import { createSwarmIntegrationAssemblyRuntime } from "./app/swarmIntegrationAssemblyRuntime.js";
import { createAppShellLifecycleAssemblyRuntime } from "./app/appShellLifecycleAssemblyRuntime.js";
import { createMapLightingSetupRuntime } from "./app/mapLightingAssemblyRuntime.js";
import { createRenderSupportAssemblyRuntime, createMapSupportAssemblyRuntime } from "./app/runtimeSupportAssemblyRuntime.js";
import { createSettingsCoreAssemblyRuntime } from "./app/settingsCoreAssemblyRuntime.js";
import {
  createTimeLightingAssemblyRuntime,
  createSwarmRuntimeAssemblyRuntime,
  createRenderPipelineAssemblyRuntime,
} from "./app/runtimeFeatureAssemblyRuntime.js";
import {
  createLightInteractionAssemblyRuntime,
  createSystemStoreSyncAssemblyRuntime,
  createMovementAssemblyRuntime,
} from "./app/interactionFeatureAssemblyRuntime.js";
import {
  initializeDefaultMapImagesRuntime,
  createCameraSetupRuntime,
} from "./app/bootstrapFeatureAssemblyRuntime.js";
import { createInteractionUiAssemblyRuntime } from "./app/interactionUiAssemblyRuntime.js";
import { createInteractionUiSetupRuntime } from "./app/interactionUiSetupRuntime.js";
import { createMainCommandAssemblyRuntime } from "./app/mainCommandAssemblyRuntime.js";
import { createMainBindingsLifecycleAssemblyRuntime } from "./app/mainBindingsLifecycleAssemblyRuntime.js";
import { createRenderShellAssemblyRuntime } from "./app/renderShellAssemblyRuntime.js";
import { createRenderShellSetupRuntime } from "./app/renderShellSetupRuntime.js";
import { createRuntimeSystemsAssemblyRuntime } from "./app/runtimeSystemsAssemblyRuntime.js";
import { createSwarmUiSetupRuntime } from "./app/swarmUiAssemblyRuntime.js";
import { runAppShellLifecycleRuntime } from "./app/appShellLifecycleRuntime.js";
import { rgbToHex as rgbToHexUtil, hexToRgb01 as hexToRgb01Util } from "./core/colorUtils.js";
import {
  clamp as clampUtil,
  clampRound as clampRoundUtil,
  lerp as lerpUtil,
  lerpVec3 as lerpVec3Util,
  lerpAngleDeg as lerpAngleDegUtil,
  smoothstep as smoothstepUtil,
  wrapHour as wrapHourUtil,
  formatHour as formatHourUtil,
} from "./core/mathUtils.js";
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
import { buildFrameRenderState } from "./render/frameRenderState.js";
import { buildUniformInputState } from "./render/uniformInputState.js";
import { createRenderBootstrapState } from "./render/renderBootstrapState.js";
import {
  createFlatNormalImage as createFlatNormalImageRender,
  createFlatHeightImage as createFlatHeightImageRender,
  createFlatSlopeImage as createFlatSlopeImageRender,
  createFlatWaterImage as createFlatWaterImageRender,
  createFallbackSplat as createFallbackSplatRender,
  extractImageData as extractImageDataRender,
} from "./render/fallbackMapImages.js";
import { applyPointLightUsagePass } from "./render/passes/pointLightUsagePass.js";
import { rebuildFlowMapTexture as rebuildFlowMapTexturePrecompute } from "./render/precompute/flowMap.js";
import { createPointLightBakeRuntimeBinding } from "./render/pointLightBakeRuntimeBinding.js";
import { createRenderPipelineRuntime } from "./render/renderPipelineRuntime.js";
import { createFrameUiRuntime } from "./render/frameUiRuntime.js";
import { updateWeatherFieldMeta } from "./render/weatherFieldRuntime.js";
import { renderFrameSwarmLayers } from "./render/frameSwarmRenderRuntime.js";
import { computeFrameTiming } from "./render/frameTimeRuntime.js";
import { createCloudNoiseImage as createCloudNoiseImageRender, uploadCloudNoiseTexture as uploadCloudNoiseTextureRender } from "./render/cloudNoiseRuntime.js";
import { createRenderSupportRuntime } from "./render/renderSupportRuntime.js";
import { sampleSunAtHour as sampleSunAtHourModel } from "./sim/sunModel.js";
import { createTimeLightingSetupRuntime } from "./sim/timeLightingSetupRuntime.js";
import { createEntityStore } from "./gameplay/entityStore.js";
import { createMovementSystem } from "./gameplay/movementSystem.js";
import { createMovementStoreSyncRuntime } from "./gameplay/movementStoreSyncRuntime.js";
import { createLightInteractionRuntimeBinding } from "./gameplay/lightInteractionRuntimeBinding.js";
import { createMapSupportRuntime } from "./gameplay/mapSupportRuntime.js";
import { parsePointLightsPayload, serializePointLightsPayload } from "./gameplay/pointLightsPersistence.js";
import { createSwarmFollowSmoothingRuntime } from "./gameplay/swarmFollowSmoothingRuntime.js";
import { createSwarmFollowRuntimeState } from "./gameplay/swarmFollowRuntimeState.js";
import { createSwarmRuntime } from "./gameplay/swarmRuntime.js";
import { createGameplayBootstrapState } from "./gameplay/gameplayBootstrapState.js";
import { syncPlayerState } from "./gameplay/stateSync.js";
import {
  getInteractionModeSnapshot as resolveInteractionModeSnapshot,
} from "./gameplay/runtimeStateSnapshots.js";
import { createPlayerRuntimeBinding } from "./gameplay/playerRuntimeBinding.js";
import { setInteractionMode as applyInteractionMode } from "./gameplay/interactionModeController.js";
import { createMainRuntimeStateBinding } from "./gameplay/mainRuntimeStateBinding.js";
import { updatePointLightEditorUi as syncPointLightEditorUi } from "./ui/pointLightEditorUi.js";
import { getRequiredElementById, getRequiredElements } from "./ui/domElementLookup.js";
import { createOverlayDirtyRuntime } from "./ui/overlays/overlayDirtyRuntime.js";
import { createStatusRuntime } from "./ui/statusRuntime.js";
import { createInteractionUiSyncRuntime } from "./ui/interactionUiSyncRuntime.js";
import { createMapPathUiSyncRuntime } from "./ui/mapPathUiSyncRuntime.js";
import { createLightLabelRuntime } from "./ui/lightLabelRuntime.js";
import { createModeInteractionRuntimeBinding } from "./ui/modeInteractionRuntimeBinding.js";

const runtimeCore = createRuntimeCore();
const dispatchCoreCommand = createCoreCommandDispatch(runtimeCore);
const entityStore = createEntityStore();

const canvas = getRequiredElementById("glCanvas");
const overlayCanvas = getRequiredElementById("overlayCanvas");
const topicButtons = getRequiredElements(".topic-btn");
const topicPanelEl = getRequiredElementById("topicPanel");
const topicPanelTitleEl = getRequiredElementById("topicPanelTitle");
const topicPanelCloseBtn = getRequiredElementById("topicPanelClose");
const topicCards = getRequiredElements(".topic-card");
const statusEl = getRequiredElementById("status");
const statusRuntime = createStatusRuntime({ statusEl });
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
const swarmTimeRoutingInput = getRequiredElementById("swarmTimeRouting");
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
const simTickHoursInput = getRequiredElementById("simTickHours");
const simTickHoursValue = getRequiredElementById("simTickHoursValue");
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
const cloudTimeRoutingInput = getRequiredElementById("cloudTimeRouting");
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
const waterTimeRoutingInput = getRequiredElementById("waterTimeRouting");
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
const interactionUiSyncRuntime = createInteractionUiSyncRuntime({
  pointLightLiveUpdateToggle,
  swarmFollowTargetInput,
});
const mapPathUiSyncRuntime = createMapPathUiSyncRuntime({
  mapPathInput,
});
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
uniform float uCloudTimeSec;
uniform float uWaterTimeSec;
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
  float cloudTimeSec = max(0.0, uCloudTimeSec);
  float waterTimeSec = max(0.0, uWaterTimeSec);
  float sunVisibility = smoothstep(-0.04, 0.15, uSunDir.z);

  if (sunVisibility > 0.0001) {
    float cloudMask = cloudMaskAtUv(uv, cloudTimeSec, uSunDir);
    float cloudShade = 1.0 - (cloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility);
    lit *= cloudShade;
  }

  lit = applyWaterFx(uv, lit, n, waterTimeSec, sunVisibility);

  float fogAmount = fogAmountAtUv(uv);
  float fogAlpha = fogAlphaFromAmount(fogAmount);
  vec3 volumetricScatter = computeVolumetricScattering(uv, cloudTimeSec, sunVisibility);

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
uniform float uCloudTimeSec;
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
  float cloudTimeSec = max(0.0, uCloudTimeSec);
  float sunVisibility = smoothstep(-0.04, 0.15, uSunDir.z);
  if (sunVisibility > 0.0001) {
    float cloudMask = cloudMaskAtUv(vUv, cloudTimeSec, uSunDir);
    float cloudShade = 1.0 - (cloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility);
    lit *= cloudShade;
  }

  float fogAmount = fogAmountAtUv(vUv);
  float fogAlpha = fogAlphaFromAmount(fogAmount);
  vec3 volumetricScatter = computeVolumetricScattering(vUv, cloudTimeSec, sunVisibility);
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

const renderSupportRuntime = createRenderSupportRuntime(createRenderSupportAssemblyRuntime({
  gl,
  getFlowMapTex: () => flowMapTex,
  clamp: clampUtil,
  rebuildFlowMapTexturePrecompute,
  getHeightImageData: () => heightImageData,
  getHeightSize: () => heightSize,
  getWaterSettings: () => getSimulationKnobSectionFromStore("waterFx") || getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS),
  getShadowSize: () => shadowSize,
  getShadowRawTex: () => shadowRawTex,
  getShadowBlurTex: () => shadowBlurTex,
  getShadowRawFbo: () => shadowRawFbo,
  getShadowBlurFbo: () => shadowBlurFbo,
  getShadowProgram: () => shadowProgram,
  getShadowUniforms: () => shadowUniforms,
  getHeightTex: () => heightTex,
  getLightingSettings: () => getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS),
  getShadowMapScale: () => SHADOW_MAP_SCALE,
  getCloudNoiseTex: () => cloudNoiseTex,
  createCloudNoiseImageRender,
  uploadCloudNoiseTextureRender,
}));
const mapSupportRuntime = createMapSupportRuntime(createMapSupportAssemblyRuntime({
  defaultMapFolder: "assets/Map 1/",
  windowEl: window,
  applyMapSizeChangeIfNeeded: (...args) => applyMapSizeChangeIfNeeded(...args),
  resetCamera: () => resetCamera(),
  extractImageData: (...args) => extractImageDataRender(...args),
  uploadImageToTexture: (tex, image) => renderSupportRuntime.uploadImageToTexture(tex, image),
  rebuildFlowMapTexture: () => renderSupportRuntime.rebuildFlowMapTexture(),
  syncMapStateToStore: () => syncMapStateToStore(),
  getPointLightBakeWorker: () => pointLightBakeRuntimeBinding.getWorker(),
  clamp: clampUtil,
  getNormalsImageData: () => normalsImageData,
  setNormalsImageData: (value) => {
    normalsImageData = value;
  },
  setHeightImageData: (value) => {
    heightImageData = value;
  },
  setSlopeImageData: (value) => {
    slopeImageData = value;
  },
  setWaterImageData: (value) => {
    waterImageData = value;
  },
  getSplatSize: () => splatSize,
  getHeightSize: () => heightSize,
  getNormalsSize: () => normalsSize,
  getSplatTex: () => splatTex,
  getNormalsTex: () => normalsTex,
  getHeightTex: () => heightTex,
  getWaterTex: () => waterTex,
  getHeightImageData: () => heightImageData,
  swarmZMax: 256,
}));
const {
  createShader,
  createProgram,
  createTexture,
  createLinearTexture,
  uploadImageToTexture,
  rebuildFlowMapTexture,
  ensureShadowTargets,
  renderShadowPipeline,
  createCloudNoiseImage,
  uploadCloudNoiseTexture,
  loadImageFromUrl,
  loadImageFromFile,
} = renderSupportRuntime;
const {
  normalizeMapFolderPath,
  tauriInvoke,
  isAbsoluteFsPath,
  joinFsPath,
  buildMapAssetPath,
  invokeTauri,
  toAbsoluteFileUrl,
  pickMapFolderViaTauri,
  validateMapFolderViaTauri,
  applyMapImages,
  syncPointLightWorkerMapData,
  getFileFromFolderSelection,
  tryLoadJsonFromUrl,
  getMapImageRuntime,
  normalize3,
  sampleNormalAtMapPixel,
  sampleHeightAtMapPixel,
  sampleHeightAtMapCoord,
  computeSwarmDirectionalShadow,
  hasLineOfSightToLight,
} = mapSupportRuntime;

const SWARM_Z_MAX = 256;
const SWARM_TERRAIN_CLEARANCE = 1;
const SWARM_Z_NEIGHBOR_SCALE = 1;
const LIGHTING_SAVE_PRECISION = 2;

const settingsCoreSetupRuntime = createSettingsCoreSetupRuntime(createSettingsCoreAssemblyRuntime({
  runtimeCore,
  settingsRegistry: runtimeCore.settingsRegistry,
  getSettingsDefaults,
  defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
  defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
  defaultWaterSettings: DEFAULT_WATER_SETTINGS,
  normalizeTimeRouting,
  normalizeRoutingMode,
  normalizeSimTickHours,
  getCoreState: () => runtimeCore.store.getState(),
  clamp: clampUtil,
  simSecondsPerHour: SIM_SECONDS_PER_HOUR,
  getSettingsRuntimeBinding: () => settingsRuntimeBinding,
  getLegacyBindings: () => settingsLegacyBindings,
}));
const {
  getDefaultTimeRouting,
  getConfiguredSimTickHours,
  getCurrentTimeRoutingFromStoreOrDefaults,
  getConfiguredSimTickHoursFromStoreOrDefaults,
  getInterpolatedRoutedTimeSec,
} = settingsCoreSetupRuntime.timeStateRuntime;
let settingsRuntimeBinding = null;
let settingsLegacyBindings = null;
const simulationKnobAccess = settingsCoreSetupRuntime.simulationKnobAccess;
const settingsApplyRuntime = settingsCoreSetupRuntime.settingsApplyRuntime;
const settingsBridgeRuntime = settingsCoreSetupRuntime.settingsBridgeRuntime;

let frameUiRuntime = null;
function getFrameUiRuntime() {
  if (frameUiRuntime) return frameUiRuntime;
  frameUiRuntime = createFrameUiRuntime({
    fogColorInput,
    cycleInfoEl,
    normalizeSimTickHours,
    getConfiguredSimTickHours,
    formatHour,
    cycleState,
  });
  return frameUiRuntime;
}

const {
  serializeLightingSettingsLegacy,
  applyLightingSettingsLegacy,
  serializeFogSettingsLegacy,
  applyFogSettingsLegacy,
  serializeParallaxSettingsLegacy,
  applyParallaxSettingsLegacy,
  serializeCloudSettingsLegacy,
  applyCloudSettingsLegacy,
  serializeWaterSettingsLegacy,
  applyWaterSettingsLegacy,
  serializeInteractionSettingsLegacy,
  applyInteractionSettingsLegacy,
  serializeSwarmDataLegacy,
  applySwarmSettingsLegacy,
  applySwarmData,
  syncPathfindingSettingsUi,
  serializeLightingSettings,
  applyLightingSettings,
  serializeFogSettings,
  applyFogSettings,
  serializeParallaxSettings,
  applyParallaxSettings,
  serializeCloudSettings,
  applyCloudSettings,
  serializeWaterSettings,
  applyWaterSettings,
  serializeInteractionSettings,
  applyInteractionSettings,
  serializeSwarmData,
  applySwarmSettings,
} = settingsBridgeRuntime;
let cursorLightState = null;
let stopSwarmFollow = () => {};
const mainRuntimeStateBinding = createMainRuntimeStateBinding({
  store: runtimeCore.store,
  getCoreSwarm: () => runtimeCore.store.getState().gameplay.swarm || {},
  getCorePathfinding: () => runtimeCore.store.getState().gameplay.pathfinding || {},
  getCoreCursorLight: () => runtimeCore.store.getState().gameplay.cursorLight || null,
  getCorePointLights: () => runtimeCore.store.getState().gameplay.pointLights || null,
  getSettingsDefaults,
  defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
  clamp: clampUtil,
  swarmZMax: SWARM_Z_MAX,
  zoomMin: 0.5,
  zoomMax: 32,
  normalizeRoutingMode,
  getCurrentMapFolderPath,
  getSplatSize: () => splatSize,
  getCursorLightState: () => cursorLightState,
  updateStoreFromAppliedSettings: (key, normalized) =>
    settingsApplyRuntime.updateStoreFromAppliedSettings(key, normalized),
  normalizeAppliedSettings: (key, rawData, fallbackDefaults) =>
    settingsApplyRuntime.normalizeAppliedSettings(key, rawData, fallbackDefaults),
  applySwarmSettingsLegacy,
  getStopSwarmFollow: () => stopSwarmFollow,
  getSwarmState: () => swarmState,
});
function getSettingsDefaults(key, fallback) {
  return settingsBridgeRuntime.getSettingsDefaults(key, fallback);
}

let mapLifecycleRuntime = null;
function setCurrentMapFolderPath(nextPath) {
  mapLifecycleRuntime.setCurrentMapFolderPath(nextPath);
}

function applyDefaultMapSettings() {
  mapLifecycleRuntime.applyDefaultMapSettings();
}

function resetMapRuntimeStateAfterImages() {
  mapLifecycleRuntime.resetMapRuntimeStateAfterImages();
}

function createMapDataFileTexts() {
  return mapLifecycleRuntime.createMapDataFileTexts();
}

function downloadTextFile(fileName, text) {
  mapLifecycleRuntime.downloadTextFile(fileName, text);
}

function saveAllMapDataFiles() {
  return mapLifecycleRuntime.saveAllMapDataFiles();
}

function loadMapFromPath(mapFolderPath) {
  return mapLifecycleRuntime.loadMapFromPath(mapFolderPath);
}

function loadMapFromFolderSelection(fileList) {
  return mapLifecycleRuntime.loadMapFromFolderSelection(fileList);
}

function tryAutoLoadDefaultMap() {
  return mapLifecycleRuntime.tryAutoLoadDefaultMap();
}

function getCurrentMapFolderPath() {
  return mapLifecycleRuntime.getCurrentMapFolderPath();
}

function setStatus(text) {
  statusRuntime.setStatus(text);
}
const {
  clamp,
  clampRound: clampRoundBase,
  lerp,
  lerpVec3,
  lerpAngleDeg,
  smoothstep,
  wrapHour,
  formatHour,
} = {
  clamp: clampUtil,
  clampRound: clampRoundUtil,
  lerp: lerpUtil,
  lerpVec3: lerpVec3Util,
  lerpAngleDeg: lerpAngleDegUtil,
  smoothstep: smoothstepUtil,
  wrapHour: wrapHourUtil,
  formatHour: formatHourUtil,
};
const clampRound = (v, min, max, decimals = LIGHTING_SAVE_PRECISION) =>
  clampRoundBase(v, min, max, decimals);
const rgbToHex = (rgb) => rgbToHexUtil(rgb, clamp);
const hexToRgb01 = (hex) => hexToRgb01Util(hex);

const sampleSunAtHour = sampleSunAtHourModel;

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
  uCloudTimeSec: gl.getUniformLocation(program, "uCloudTimeSec"),
  uWaterTimeSec: gl.getUniformLocation(program, "uWaterTimeSec"),
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
  uCloudTimeSec: gl.getUniformLocation(swarmProgram, "uCloudTimeSec"),
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

const SHADOW_MAP_SCALE = 0.5;
const {
  splatTex,
  normalsTex,
  heightTex,
  waterTex,
  flowMapTex,
  pointLightTex,
  cloudNoiseTex,
  shadowRawTex,
  shadowBlurTex,
  shadowRawFbo,
  shadowBlurFbo,
  shadowSize,
  splatSize,
  heightSize,
  normalsSize,
  pointLightBakeCanvas,
  pointLightBakeCtx,
  defaultPlayer: DEFAULT_PLAYER,
  playerState,
  movePreviewState,
  swarmState,
  swarmRenderState,
  swarmCursorState,
  swarmFollowState,
  swarmFollowAgentScratch,
  swarmFollowHawkScratch,
  swarmOverlayAgentScratch,
  swarmOverlayHawkScratch,
  swarmGizmoHawkScratch,
  swarmLitAgentScratch,
  swarmLitHawkScratch,
  invalidateSwarmInterpolation,
} = {
  ...createRenderBootstrapState({
    gl,
    document,
    createTexture,
    createLinearTexture,
  }),
  ...createGameplayBootstrapState(),
};
uploadCloudNoiseTexture();

const DEFAULT_POINT_LIGHT_FLICKER = 0.7;
const DEFAULT_POINT_LIGHT_FLICKER_SPEED = 0.5;
const pointLights = [];
let nextPointLightId = 1;
let normalsImageData = null;
let heightImageData = null;
let slopeImageData = null;
let waterImageData = null;
const POINT_LIGHT_BLEND_EXPOSURE = 0.65;
const POINT_LIGHT_SELECT_RADIUS = 3;
const POINT_LIGHT_BAKE_LIVE_SCALE = 0.5;
const POINT_LIGHT_BAKE_DEBOUNCE_MS = 80;
const SWARM_POINT_LIGHT_EDGE_MIN = 0.08;
const overlayDirtyRuntime = createOverlayDirtyRuntime(true);
const DEFAULT_MAP_FOLDER = "assets/Map 1/";
const DEFAULT_MAP_FOLDER_CANDIDATES = ["assets/Map 1/", "assets/"];
const playerRuntimeBinding = createPlayerRuntimeBinding({
  store: runtimeCore.store,
  playerState,
  defaultPlayer: DEFAULT_PLAYER,
  clamp,
  splatSize,
});
const swarmFollowRuntimeState = createSwarmFollowRuntimeState({
  getStore: () => runtimeCore.store,
  swarmFollowState,
});
const swarmFollowSmoothingRuntime = createSwarmFollowSmoothingRuntime({
  resetSwarmFollowSpeedNormFiltered: swarmFollowRuntimeState.resetSwarmFollowSpeedNormFiltered,
});
const serializeNpcStateFromBinding = playerRuntimeBinding.serializeNpcState;
const parseNpcPlayerFromBinding = playerRuntimeBinding.parseNpcPlayer;
const applyLoadedNpcFromBinding = playerRuntimeBinding.applyLoadedNpc;
const getSwarmFollowSnapshot = swarmFollowRuntimeState.getSwarmFollowSnapshot;
const resetSwarmFollowSpeedSmoothing = swarmFollowSmoothingRuntime.resetSwarmFollowSpeedSmoothing;

const pointLightBakeRuntimeBinding = createPointLightBakeRuntimeBinding({
  document,
  windowEl: window,
  requestAnimationFrame: (cb) => requestAnimationFrame(cb),
  createWorker: () => new Worker(new URL("./pointLightBakeWorker.js", import.meta.url), { type: "module" }),
  getMapSize: () => splatSize,
  pointLightBakeCanvas,
  pointLightBakeCtx,
  pointLightTex,
  uploadImageToTexture,
  requestOverlayDraw: () => requestOverlayDraw(),
  debounceMs: POINT_LIGHT_BAKE_DEBOUNCE_MS,
  pointLightBakeLiveScale: POINT_LIGHT_BAKE_LIVE_SCALE,
  pointLightBlendExposure: POINT_LIGHT_BLEND_EXPOSURE,
  isLiveUpdateEnabled: (...args) => mainRuntimeStateBinding.isPointLightLiveUpdateEnabled(...args),
  hasBakeInputs: () => Boolean(normalsImageData && heightImageData),
  getLights: () => pointLights,
  getHeightScaleValue: () => {
    const lightingSettings = getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS);
    return Math.max(1, Number(lightingSettings.heightScale) || 1);
  },
  getLightingSettings: () => getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS),
  clamp,
  defaultPointLightFlicker: DEFAULT_POINT_LIGHT_FLICKER,
  defaultPointLightFlickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
  sampleHeightAtMapPixel,
  hasLineOfSightToLight,
  sampleNormalAtMapPixel,
  normalize3,
});

let pointLightRuntime = null;
let pointLightApi = null;
let pathfindingRuntimeBinding = null;
let pathfindingLabelRuntime = null;
let renderFxUiRuntime = null;
let renderFxSettingsSyncRuntime = null;

initializeDefaultMapImagesRuntime({
  createFlatNormalImage: createFlatNormalImageRender,
  createFlatHeightImage: createFlatHeightImageRender,
  createFlatSlopeImage: createFlatSlopeImageRender,
  createFlatWaterImage: createFlatWaterImageRender,
  createFallbackSplat: createFallbackSplatRender,
  uploadImageToTexture,
  normalsTex,
  heightTex,
  splatTex,
  waterTex,
  setSplatSizeFromImage: (img) => getMapImageRuntime().setSplatSizeFromImage(img),
  setHeightSizeFromImage: (img) => getMapImageRuntime().setHeightSizeFromImage(img),
  setNormalsSizeFromImage: (img) => getMapImageRuntime().setNormalsSizeFromImage(img),
  extractImageData: extractImageDataRender,
  rebuildFlowMapTexture,
  syncPointLightWorkerMapData,
  setNormalsImageData: (value) => {
    normalsImageData = value;
  },
  setHeightImageData: (value) => {
    heightImageData = value;
  },
  setSlopeImageData: (value) => {
    slopeImageData = value;
  },
  setWaterImageData: (value) => {
    waterImageData = value;
  },
});

const interactionDefaults = DEFAULT_INTERACTION_SETTINGS;
const lightInteractionRuntimeBinding = createLightInteractionRuntimeBinding(createLightInteractionAssemblyRuntime({
  clamp,
  hexToRgb01,
  rgbToHex,
  cursorLightDefaults: {
    enabled: interactionDefaults.cursorLightEnabled,
    colorHex: interactionDefaults.cursorLightColor,
    strength: interactionDefaults.cursorLightStrength,
    heightOffset: interactionDefaults.cursorLightHeightOffset,
    useTerrainHeight: interactionDefaults.cursorLightFollowHeight,
    showGizmo: interactionDefaults.cursorLightGizmo,
  },
  getCursorLightSnapshot: (...args) => mainRuntimeStateBinding.getCursorLightSnapshot(...args),
  clientToNdc: (...args) => clientToNdc(...args),
  worldFromNdc: (...args) => worldFromNdc(...args),
  worldToUv: (...args) => worldToUv(...args),
  cursorLightHeightOffsetInput,
  syncPointLightEditorUi,
  getSelectedPointLight: () => pointLightRuntime.getSelectedPointLight(),
  getLightEditDraft: () => pointLightRuntime.getDraft(),
  lightEditorEmptyEl,
  lightEditorFieldsEl,
  lightCoordEl,
  pointLightColorInput,
  pointLightStrengthInput,
  pointLightIntensityInput,
  pointLightHeightOffsetInput,
  pointLightFlickerInput,
  pointLightFlickerSpeedInput,
  updatePointLightStrengthLabel: (...args) => updatePointLightStrengthLabel(...args),
  updatePointLightIntensityLabel: (...args) => updatePointLightIntensityLabel(...args),
  updatePointLightHeightOffsetLabel: (...args) => updatePointLightHeightOffsetLabel(...args),
  updatePointLightFlickerLabel: (...args) => updatePointLightFlickerLabel(...args),
  updatePointLightFlickerSpeedLabel: (...args) => updatePointLightFlickerSpeedLabel(...args),
  getPointLightRuntime: () => pointLightRuntime,
}));
cursorLightState = lightInteractionRuntimeBinding.cursorLightState;
const clearCursorLightPointerState = lightInteractionRuntimeBinding.clearCursorLightPointerState;
const setCursorLightPointerUv = lightInteractionRuntimeBinding.setCursorLightPointerUv;
const applyCursorLightConfigSnapshot = lightInteractionRuntimeBinding.applyCursorLightConfigSnapshot;
const updateCursorLightFromPointer = lightInteractionRuntimeBinding.updateCursorLightFromPointer;
const updateCursorLightModeUi = lightInteractionRuntimeBinding.updateCursorLightModeUi;
const {
  updateLightEditorUi,
  beginLightEdit,
  applyDraftToSelectedPointLight,
  rebakeIfPointLightLiveUpdateEnabled,
  findPointLightAtPixel,
  createPointLight,
} = lightInteractionRuntimeBinding;
const getGrayAt = (...args) => pathfindingRuntimeBinding.getGrayAt(...args);
const computeMoveStepCost = (...args) => pathfindingRuntimeBinding.computeMoveStepCost(...args);
const rebuildMovementField = (...args) => pathfindingRuntimeBinding.rebuildMovementField(...args);
const extractPathTo = (...args) => pathfindingRuntimeBinding.extractPathTo(...args);
const refreshPathPreview = (...args) => pathfindingRuntimeBinding.refreshPathPreview(...args);
const updatePathPreviewFromPointer = (...args) => pathfindingRuntimeBinding.updatePathPreviewFromPointer(...args);
const getCurrentPathMetrics = (...args) => pathfindingRuntimeBinding.getCurrentPathMetrics(...args);

const updatePathfindingRangeLabel = (...args) => pathfindingLabelRuntime.updatePathfindingRangeLabel(...args);
const updatePathWeightLabels = (...args) => pathfindingLabelRuntime.updatePathWeightLabels(...args);
const updatePathSlopeCutoffLabel = (...args) => pathfindingLabelRuntime.updatePathSlopeCutoffLabel(...args);
const updatePathBaseCostLabel = (...args) => pathfindingLabelRuntime.updatePathBaseCostLabel(...args);

const updateParallaxStrengthLabel = (...args) => renderFxUiRuntime.updateParallaxStrengthLabel(...args);
const updateParallaxBandsLabel = (...args) => renderFxUiRuntime.updateParallaxBandsLabel(...args);
const updateShadowBlurLabel = (...args) => renderFxUiRuntime.updateShadowBlurLabel(...args);
const updateSimTickLabel = (...args) => renderFxUiRuntime.updateSimTickLabel(...args);
const updateFogAlphaLabels = (...args) => renderFxUiRuntime.updateFogAlphaLabels(...args);
const updateFogFalloffLabel = (...args) => renderFxUiRuntime.updateFogFalloffLabel(...args);
const updateFogStartOffsetLabel = (...args) => renderFxUiRuntime.updateFogStartOffsetLabel(...args);
const updatePointFlickerLabels = (...args) => renderFxUiRuntime.updatePointFlickerLabels(...args);
const updatePointFlickerUi = (...args) => renderFxUiRuntime.updatePointFlickerUi(...args);
const updateVolumetricLabels = (...args) => renderFxUiRuntime.updateVolumetricLabels(...args);
const updateVolumetricUi = (...args) => renderFxUiRuntime.updateVolumetricUi(...args);
const updateCloudLabels = (...args) => renderFxUiRuntime.updateCloudLabels(...args);
const updateWaterLabels = (...args) => renderFxUiRuntime.updateWaterLabels(...args);
const updateParallaxUi = (...args) => renderFxUiRuntime.updateParallaxUi(...args);
const updateFogUi = (...args) => renderFxUiRuntime.updateFogUi(...args);
const updateCloudUi = (...args) => renderFxUiRuntime.updateCloudUi(...args);
const updateWaterUi = (...args) => renderFxUiRuntime.updateWaterUi(...args);

const syncRenderFxParallaxUi = (...args) => renderFxSettingsSyncRuntime.syncRenderFxParallaxUi(...args);
const syncRenderFxLightingUi = (...args) => renderFxSettingsSyncRuntime.syncRenderFxLightingUi(...args);
const syncRenderFxFogUi = (...args) => renderFxSettingsSyncRuntime.syncRenderFxFogUi(...args);
const syncRenderFxCloudUi = (...args) => renderFxSettingsSyncRuntime.syncRenderFxCloudUi(...args);
const syncRenderFxWaterUi = (...args) => renderFxSettingsSyncRuntime.syncRenderFxWaterUi(...args);

const updatePointLightStrengthLabel = (...args) => lightLabelRuntime.updatePointLightStrengthLabel(...args);
const updatePointLightIntensityLabel = (...args) => lightLabelRuntime.updatePointLightIntensityLabel(...args);
const updatePointLightHeightOffsetLabel = (...args) => lightLabelRuntime.updatePointLightHeightOffsetLabel(...args);
const updatePointLightFlickerLabel = (...args) => lightLabelRuntime.updatePointLightFlickerLabel(...args);
const updatePointLightFlickerSpeedLabel = (...args) => lightLabelRuntime.updatePointLightFlickerSpeedLabel(...args);
const updateCursorLightStrengthLabel = (...args) => lightLabelRuntime.updateCursorLightStrengthLabel(...args);
const updateCursorLightHeightOffsetLabel = (...args) => lightLabelRuntime.updateCursorLightHeightOffsetLabel(...args);

({
  pointLightRuntime,
  pointLightApi,
  mapLifecycleRuntime,
} = createMapLightingSetupRuntime({
  pointLights,
  clamp,
  splatSize,
  selectRadiusPx: POINT_LIGHT_SELECT_RADIUS,
  defaultFlicker: DEFAULT_POINT_LIGHT_FLICKER,
  defaultFlickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
  nextPointLightId: () => nextPointLightId++,
  hexToRgb01,
  bakePointLightsTexture: () => bakePointLightsTexture(),
  schedulePointLightBake: () => schedulePointLightBake(),
  isPointLightLiveUpdateEnabled: () => isPointLightLiveUpdateEnabled(),
  updateLightEditorUi: () => updateLightEditorUi(),
  requestOverlayDraw: () => requestOverlayDraw(),
  setStatus,
  parsePointLightsPayload,
  serializePointLightsPayload,
  tauriInvoke,
  isAbsoluteFsPath,
  joinFsPath,
  invokeTauri,
  showSaveFilePicker:
    typeof window.showSaveFilePicker === "function" ? window.showSaveFilePicker.bind(window) : null,
  normalizeMapFolderPath,
  downloadTextFile,
  getCurrentMapFolderPath,
  tryLoadJsonFromUrl,
  clearPointLightsLoadInput: () => {
    pointLightsLoadInput.value = "";
  },
  openPointLightsLoadInput: () => {
    pointLightsLoadInput.click();
  },
  setSaveButtonText: (text) => {
    pointLightsSaveAllBtn.textContent = text;
  },
  syncPointLightsStateToStore: (...args) => mainRuntimeStateBinding.syncPointLightsStateToStore(...args),
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: (id) => window.clearTimeout(id),
  defaultMapFolder: DEFAULT_MAP_FOLDER,
  defaultMapFolderCandidates: DEFAULT_MAP_FOLDER_CANDIDATES,
  defaultPlayer: DEFAULT_PLAYER,
  syncMapPathInput: (nextPath) => mapPathUiSyncRuntime.syncMapPathInput(nextPath),
  syncMapStateToStore: (...args) => mainRuntimeStateBinding.syncMapStateToStore(...args),
  getSettingsDefaults,
  defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
  defaultParallaxSettings: DEFAULT_PARALLAX_SETTINGS,
  defaultInteractionSettings: DEFAULT_INTERACTION_SETTINGS,
  defaultFogSettings: DEFAULT_FOG_SETTINGS,
  defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
  defaultWaterSettings: DEFAULT_WATER_SETTINGS,
  defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
  applyLightingSettings: (...args) => applyLightingSettings(...args),
  applyParallaxSettings: (...args) => applyParallaxSettings(...args),
  applyInteractionSettings: (...args) => applyInteractionSettings(...args),
  applyFogSettings: (...args) => applyFogSettings(...args),
  applyCloudSettings: (...args) => applyCloudSettings(...args),
  applyWaterSettings: (...args) => applyWaterSettings(...args),
  applySwarmSettings: (...args) => applySwarmSettings(...args),
  reseedSwarmAgents: (...args) => reseedSwarmAgents(...args),
  getSwarmSettings: (...args) => getSwarmSettings(...args),
  applySwarmData: (...args) => applySwarmData(...args),
  applyLoadedNpc: (...args) => applyLoadedNpcFromBinding(...args),
  getFileFromFolderSelection,
  validateMapFolderViaTauri,
  buildMapAssetPath,
  loadImageFromUrl,
  loadImageFromFile,
  applyMapImages,
  rebuildMovementField,
  serializeLightingSettings: (...args) => serializeLightingSettings(...args),
  serializeParallaxSettings: (...args) => serializeParallaxSettings(...args),
  serializeInteractionSettings: (...args) => serializeInteractionSettings(...args),
  serializeFogSettings: (...args) => serializeFogSettings(...args),
  serializeCloudSettings: (...args) => serializeCloudSettings(...args),
  serializeWaterSettings: (...args) => serializeWaterSettings(...args),
  serializeSwarmData: (...args) => serializeSwarmData(...args),
  serializeNpcState: (...args) => serializeNpcStateFromBinding(...args),
  confirm: (text) => window.confirm(text),
  pickMapFolderViaTauri,
  showDirectoryPicker:
    typeof window.showDirectoryPicker === "function" ? window.showDirectoryPicker.bind(window) : null,
}));
const {
  hasLightEditDraft,
  setLightEditDraftColor,
  setLightEditDraftStrength,
  setLightEditDraftIntensity,
  setLightEditDraftHeightOffset,
  setLightEditDraftFlicker,
  setLightEditDraftFlickerSpeed,
  getDraft: getLightEditDraft,
  isSelectedLight: isPointLightSelected,
  deletePointLightById,
} = pointLightRuntime;
const {
  getSelectedPointLight,
  clearLightEditSelection,
  armPointLightsSaveConfirmation,
  resetPointLightsSaveConfirmation,
  savePointLightsJson,
  loadPointLightsFromAssetsOrPrompt,
  applyLoadedPointLights,
} = pointLightApi;

const {
  ensurePointLightBakeSize,
  applyPointLightBakeRgba,
  schedulePointLightBake,
  bakePointLightsTexture,
  getPointLightBakeSyncRuntime,
  bakePointLightsTextureSync,
} = pointLightBakeRuntimeBinding;

const lightLabelRuntime = createLightLabelRuntime({
  clamp,
  pointLightStrengthInput,
  pointLightStrengthValue,
  pointLightIntensityInput,
  pointLightIntensityValue,
  pointLightHeightOffsetInput,
  pointLightHeightOffsetValue,
  pointLightFlickerInput,
  pointLightFlickerValue,
  pointLightFlickerSpeedInput,
  pointLightFlickerSpeedValue,
  getCursorLightSnapshot: (...args) => mainRuntimeStateBinding.getCursorLightSnapshot(...args),
  cursorLightStrengthValue,
  cursorLightHeightOffsetValue,
});
const modeInteractionRuntimeBinding = createModeInteractionRuntimeBinding({
  getModeValue: () => runtimeCore.store.getState().mode,
  normalizeRuntimeMode,
  canUseModeTopic,
  canUseModeInteraction,
  topicButtons,
  topicCards,
  topicPanelEl,
  topicPanelTitleEl,
  dockLightingModeToggle,
  dockPathfindingModeToggle,
  setInteractionMode: (...args) => setInteractionMode(...args),
  setStatus,
  resolveInteractionModeSnapshot,
  getCoreGameplay: () => runtimeCore.store.getState().gameplay || null,
});
const getRuntimeMode = modeInteractionRuntimeBinding.getRuntimeMode;
const canUseTopicInCurrentMode = modeInteractionRuntimeBinding.canUseTopicInCurrentMode;
const canUseInteractionInCurrentMode = modeInteractionRuntimeBinding.canUseInteractionInCurrentMode;
const setTopicPanelVisible = modeInteractionRuntimeBinding.setTopicPanelVisible;
const setActiveTopic = modeInteractionRuntimeBinding.setActiveTopic;
const updateModeCapabilitiesUi = modeInteractionRuntimeBinding.updateModeCapabilitiesUi;
const getInteractionModeSnapshot = modeInteractionRuntimeBinding.getInteractionModeSnapshot;

const applyMapSizeChangeIfNeeded = (changed) => mapLifecycleRuntime.applyMapSizeChangeIfNeeded(changed);
bakePointLightsTexture();
updateLightEditorUi();

const zoomMin = 0.5;
const zoomMax = 32;
function applyRuntimeCameraPose() {}

let isMiddleDragging = false;
let lastDragClient = { x: 0, y: 0 };
let fogColorManual = false;
const timeLightingSetupRuntime = createTimeLightingSetupRuntime(createTimeLightingAssemblyRuntime({
  initialHour: 9.5,
  getSettingsDefaults,
  defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
  defaultFogSettings: DEFAULT_FOG_SETTINGS,
  sampleSunAtHour,
  wrapHour,
  clamp,
  smoothstep,
  lerpVec3,
  getFogColorManual: () => fogColorManual,
  rgbToHex,
  hexToRgb01,
  zoomMin,
  zoomMax,
  cycleHourInput,
  cycleHourValue,
  formatHour,
}));
const cycleState = timeLightingSetupRuntime.cycleState;
const {
  getLightingParamsRuntime,
  getTimeUiRuntime,
  computeLightingParams,
  setCycleHourSliderFromState,
  updateCycleHourLabel,
} = timeLightingSetupRuntime;
let isCycleHourScrubbing = false;
const systemStoreSyncRuntime = createSystemStoreSyncRuntime(createSystemStoreSyncAssemblyRuntime({
  store: runtimeCore.store,
  clamp,
  cycleState,
}));

function getSimulationKnobSectionFromStore(key) {
  return simulationKnobAccess.getSimulationKnobSectionFromStore(key);
}

const swarmRuntime = createSwarmRuntime(createSwarmRuntimeAssemblyRuntime({
  store: runtimeCore.store,
  isSwarmEnabled: (...args) => mainRuntimeStateBinding.isSwarmEnabled(...args),
  getSwarmSettings: (...args) => mainRuntimeStateBinding.getSwarmSettings(...args),
  swarmState,
  swarmFollowState,
  getSwarmFollowSnapshot: swarmFollowRuntimeState.getSwarmFollowSnapshot,
  setSwarmFollowEnabled: swarmFollowRuntimeState.setSwarmFollowEnabled,
  setSwarmFollowTargetType: swarmFollowRuntimeState.setSwarmFollowTargetType,
  setSwarmFollowAgentIndex: swarmFollowRuntimeState.setSwarmFollowAgentIndex,
  setSwarmFollowHawkIndex: swarmFollowRuntimeState.setSwarmFollowHawkIndex,
  swarmFollowTargetInput,
  syncSwarmFollowTargetInput: (targetType) => interactionUiSyncRuntime.syncSwarmFollowTargetInput(targetType),
  resetSwarmFollowSpeedSmoothing,
  updateSwarmFollowButtonUi: () => updateSwarmFollowButtonUi(),
}));
const applySwarmFollowState = swarmRuntime.applySwarmFollowState;
stopSwarmFollow = swarmRuntime.stopSwarmFollow;
const syncSwarmFollowToStore = swarmRuntime.syncSwarmFollowToStore;
const syncSwarmRuntimeStateToStore = swarmRuntime.syncSwarmRuntimeStateToStore;
const syncSwarmStateToStore = swarmRuntime.syncSwarmStateToStore;
const movementStoreSyncRuntime = createMovementStoreSyncRuntime({
  store: runtimeCore.store,
});

const movementSystem = createMovementSystem(createMovementAssemblyRuntime({
  entityStore,
  playerState,
  getMapWidth: () => splatSize.width,
  getMapHeight: () => splatSize.height,
  computeMoveStepCost,
  rebuildMovementField,
  requestOverlayDraw: () => requestOverlayDraw(),
  setStatus,
  setPlayerSnapshot: movementStoreSyncRuntime.setPlayerSnapshot,
  setMovementSnapshot: movementStoreSyncRuntime.setMovementSnapshot,
}));
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
const renderPipelineRuntime = createRenderPipelineRuntime(createRenderPipelineAssemblyRuntime({
  gl,
  canvas,
  program,
  uniforms,
  splatTex,
  normalsTex,
  heightTex,
  pointLightTex,
  cloudNoiseTex,
  shadowBlurTex,
  shadowRawTex,
  waterTex,
  flowMapTex,
  heightSize,
  splatSize,
  getViewHalfExtents: (...args) => getViewHalfExtents(...args),
  cursorLightState,
  applyPointLightUsagePass,
  renderShadowPipeline,
  shadowSize,
  shadowBlurFbo,
  shadowBlurProgram,
  shadowBlurUniforms,
  getBlurRadiusPx: () => {
    const lightingSettings = getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS);
    return clamp(Number(lightingSettings.shadowBlur), 0, 3);
  },
}));
const renderResources = renderPipelineRuntime.renderResources;
const renderer = renderPipelineRuntime.renderer;

registerMainCommands(runtimeCore.commandBus, createMainCommandAssemblyRuntime({
  zoomMin,
  zoomMax,
  lastDragClient,
  cycleState,
  cursorLightState,
  movePreviewState,
  playerState,
  swarmFollowState,
  getSwarmFollowSnapshot: swarmFollowRuntimeState.getSwarmFollowSnapshot,
  swarmState,
  swarmFollowTargetInput,
  applyCameraPose: applyRuntimeCameraPose,
  getInteractionMode: () => getInteractionModeSnapshot(),
  setMiddleDragging: (value) => {
    isMiddleDragging = value;
  },
  setCycleHourScrubbing: (value) => {
    isCycleHourScrubbing = value;
  },
  clamp,
  clientToNdc: (...args) => clientToNdc(...args),
  worldFromNdc: (...args) => worldFromNdc(...args),
  getCursorLightSnapshot: (...args) => getCursorLightSnapshot(...args),
  applyCursorLightConfigSnapshot: (...args) => applyCursorLightConfigSnapshot(...args),
  clearCursorLightPointerState: (...args) => clearCursorLightPointerState(...args),
  setInteractionMode: (...args) => setInteractionMode(...args),
  requestOverlayDraw: () => requestOverlayDraw(),
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
  setPlayerPosition: (...args) => setPlayerPosition(...args),
  syncPlayerStateToStore: (...args) => playerRuntimeBinding.syncPlayerStateToStore(...args),
  replaceMovementQueue: (pathPixels) =>
    movementSystem.replaceQueue(
      pathPixels,
      normalizeSimTickHours(runtimeCore.store.getState().systems.time.simTickHours ?? getConfiguredSimTickHours()),
    ),
  cancelMovementQueue: () => movementSystem.cancelQueue(),
  getMovementStateSnapshot: () => movementSystem.getSnapshot(),
  rebuildMovementField,
  getPathfindingStateSnapshot: (...args) => getPathfindingStateSnapshot(...args),
  syncPathfindingSettingsUi,
  syncPointLightLiveUpdateToggle: (liveUpdate) => interactionUiSyncRuntime.syncPointLightLiveUpdateToggle(liveUpdate),
  syncPointLightsStateToStore: (...args) => mainRuntimeStateBinding.syncPointLightsStateToStore(...args),
  patchSwarmSettingsToStore: (...args) => mainRuntimeStateBinding.patchSwarmSettingsToStore(...args),
  syncCursorLightStateToStore: (...args) => mainRuntimeStateBinding.syncCursorLightStateToStore(...args),
  setModeToStore: (...args) => mainRuntimeStateBinding.setModeToStore(...args),
  setCameraPoseToStore: (...args) => mainRuntimeStateBinding.setCameraPoseToStore(...args),
  setCycleHourUiToStore: (...args) => mainRuntimeStateBinding.setCycleHourUiToStore(...args),
  patchPathfindingStateToStore: (...args) => mainRuntimeStateBinding.patchPathfindingStateToStore(...args),
  syncPathfindingStateToStore: (...args) => mainRuntimeStateBinding.syncPathfindingStateToStore(...args),
  patchSimulationKnobSectionToStore: (...args) => mainRuntimeStateBinding.patchSimulationKnobSectionToStore(...args),
  setCycleSpeedToStore: (...args) => mainRuntimeStateBinding.setCycleSpeedToStore(...args),
  setSimTickHoursToStore: (...args) => mainRuntimeStateBinding.setSimTickHoursToStore(...args),
  setTimeRoutingModeToStore: (...args) => mainRuntimeStateBinding.setTimeRoutingModeToStore(...args),
  syncRenderFxParallaxUi,
  syncRenderFxLightingUi,
  syncRenderFxFogUi,
  markFogColorManual: () => {
    fogColorManual = true;
  },
  syncRenderFxCloudUi,
  syncRenderFxWaterUi,
  rebuildFlowMapTexture,
  schedulePointLightBake,
  serializeLightingSettings,
  serializeParallaxSettings,
  serializeFogSettings,
  serializeCloudSettings,
  serializeWaterSettings,
  updateSwarmUi: () => updateSwarmUi(),
  updateSwarmLabels: () => updateSwarmLabels(),
  syncSwarmSettingsInputs: () => syncSwarmSettingsInputs(),
  syncSwarmPanelUi: () => syncSwarmPanelUi(),
  updateSwarmStatsPanel: () => updateSwarmStatsPanel(),
  applySwarmFollowState,
  stopSwarmFollow,
  syncSwarmFollowToStore: (...args) => swarmRuntime.syncSwarmFollowToStore(...args),
  syncSwarmStateToStore: (...args) => swarmRuntime.syncSwarmStateToStore(...args),
  normalizeSwarmFollowZoomInputs: (...args) => normalizeSwarmFollowZoomInputs(...args),
  normalizeSwarmHeightRangeInputs: (...args) => normalizeSwarmHeightRangeInputs(...args),
  reseedSwarmAgents: (...args) => reseedSwarmAgents(...args),
  swarmAgentCountInput,
  swarmEnabledToggle,
  swarmCursorState,
  isSwarmEnabled: () => isSwarmEnabled(),
  getSwarmSettings: (...args) => getSwarmSettings(...args),
  resetSwarmFollowSpeedSmoothing,
  updateSwarmFollowButtonUi: () => updateSwarmFollowButtonUi(),
  chooseRandomFollowHawkIndex: (...args) => chooseRandomFollowHawkIndex(...args),
  chooseRandomFollowAgentIndex: (...args) => chooseRandomFollowAgentIndex(...args),
  updateSimTickLabel,
  syncSimTickHoursInput: (value) => syncSimTickHoursInput(value),
  syncCycleSpeedInput: (value) => syncCycleSpeedInput(value),
  syncRoutingInput: (target, mode) => syncRoutingInput(target, mode),
}));
let previousMode = normalizeRuntimeMode(runtimeCore.store.getState().mode);
runtimeCore.store.subscribe((nextState) => {
  const nextMode = normalizeRuntimeMode(nextState ? nextState.mode : previousMode);
  if (nextMode === previousMode) {
    return;
  }
  previousMode = nextMode;
  updateModeCapabilitiesUi();
});

setupRuntimeSystems(createRuntimeSystemsAssemblyRuntime({
  scheduler: runtimeCore.scheduler,
  movementSystem,
  getState: () => runtimeCore.store.getState(),
  clamp,
  wrapHour,
  cycleState,
  isCycleHourScrubbing: () => isCycleHourScrubbing,
  setCycleHourSliderFromState,
  computeLightingParams,
  hexToRgb01,
  updateStoreTime: systemStoreSyncRuntime.updateStoreTime,
  updateStoreLighting: systemStoreSyncRuntime.updateStoreLighting,
  updateStoreFog: systemStoreSyncRuntime.updateStoreFog,
  updateStoreClouds: systemStoreSyncRuntime.updateStoreClouds,
  updateStoreWaterFx: systemStoreSyncRuntime.updateStoreWaterFx,
  updateStoreWeather: systemStoreSyncRuntime.updateStoreWeather,
  syncMapStateToStore: (...args) => mainRuntimeStateBinding.syncMapStateToStore(...args),
  syncPlayerStateToStore: (...args) => playerRuntimeBinding.syncPlayerStateToStore(...args),
  syncSwarmStateToStore: (...args) => swarmRuntime.syncSwarmStateToStore(...args),
  syncPointLightsStateToStore: (...args) => mainRuntimeStateBinding.syncPointLightsStateToStore(...args),
}));

let cameraRuntimeBinding = null;
function getCameraRuntimeBinding() {
  if (cameraRuntimeBinding) return cameraRuntimeBinding;
  cameraRuntimeBinding = createCameraSetupRuntime({
    dispatchCoreCommand,
    canvas,
    overlayCanvas,
    splatSize,
    clamp,
    getCameraState: () => runtimeCore.store.getState().camera || {},
  });
  return cameraRuntimeBinding;
}

function resetCamera() {
  return getCameraRuntimeBinding().resetCamera();
}

function getScreenAspect() {
  return getCameraRuntimeBinding().getScreenAspect();
}

function getMapAspect() {
  return getCameraRuntimeBinding().getMapAspect();
}

const {
  swarmUiRuntimeBinding,
  getSwarmCursorMode,
  getSwarmSettings,
  getPathfindingStateSnapshot,
  syncMapStateToStore,
  syncPointLightsStateToStore,
  getCursorLightSnapshot,
  isPointLightLiveUpdateEnabled,
  isPointLightsSaveConfirmArmed,
  setSwarmDefaults,
  isSwarmEnabled,
  normalizeSwarmHeightRangeInputs,
  normalizeSwarmFollowZoomInputs,
  updateSwarmLabels,
  updateSwarmUi,
  updateSwarmStatsPanel,
  updateSwarmFollowButtonUi,
  syncSwarmSettingsInputs,
  syncSwarmPanelUi,
  syncSimTickHoursInput,
  syncCycleSpeedInput,
  syncRoutingInput,
} = createSwarmUiSetupRuntime({
  mainRuntimeStateBinding,
  store: runtimeCore.store,
  getCoreSwarm: () => runtimeCore.store.getState().gameplay.swarm || {},
  getCorePathfinding: () => runtimeCore.store.getState().gameplay.pathfinding || {},
  getCoreCursorLight: () => runtimeCore.store.getState().gameplay.cursorLight || null,
  getCorePointLights: () => runtimeCore.store.getState().gameplay.pointLights || null,
  getSettingsDefaults,
  defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
  clamp,
  swarmZMax: SWARM_Z_MAX,
  zoomMin,
  zoomMax,
  normalizeRoutingMode,
  getCurrentMapFolderPath,
  splatSize,
  cursorLightState,
  updateStoreFromAppliedSettings: (key, normalized) =>
    settingsApplyRuntime.updateStoreFromAppliedSettings(key, normalized),
  normalizeAppliedSettings: (key, rawData, fallbackDefaults) =>
    settingsApplyRuntime.normalizeAppliedSettings(key, rawData, fallbackDefaults),
  applySwarmSettingsLegacy,
  stopSwarmFollow,
  swarmState,
  getSwarmFollowSnapshot: swarmFollowRuntimeState.getSwarmFollowSnapshot,
  swarmFollowToggleBtn,
  swarmStatsPanelEl,
  swarmStatsBirdsValue,
  swarmStatsHawksValue,
  swarmStatsStepsValue,
  swarmStatsAvgHawkKillValue,
  swarmAgentCountValue,
  swarmFollowZoomInValue,
  swarmFollowZoomOutValue,
  swarmFollowAgentSpeedSmoothingValue,
  swarmFollowAgentZoomSmoothingValue,
  swarmUpdateIntervalValue,
  swarmMaxSpeedValue,
  swarmSteeringMaxValue,
  swarmVariationStrengthValue,
  swarmNeighborRadiusValue,
  swarmMinHeightValue,
  swarmMaxHeightValue,
  swarmSeparationRadiusValue,
  swarmAlignmentWeightValue,
  swarmCohesionWeightValue,
  swarmSeparationWeightValue,
  swarmWanderWeightValue,
  swarmRestChanceValue,
  swarmRestTicksValue,
  swarmBreedingThresholdValue,
  swarmBreedingSpawnChanceValue,
  swarmCursorStrengthValue,
  swarmCursorRadiusValue,
  swarmHawkCountValue,
  swarmHawkSpeedValue,
  swarmHawkSteeringValue,
  swarmHawkTargetRangeValue,
  swarmEnabledToggle,
  swarmLitModeToggle,
  swarmFollowTargetInput,
  swarmFollowZoomToggle,
  swarmFollowZoomInInput,
  swarmFollowZoomOutInput,
  swarmFollowHawkRangeGizmoToggle,
  swarmFollowAgentSpeedSmoothingInput,
  swarmFollowAgentZoomSmoothingInput,
  swarmStatsPanelToggle,
  swarmShowTerrainToggle,
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
  swarmTimeRoutingInput,
  cloudTimeRoutingInput,
  waterTimeRoutingInput,
  simTickHoursInput,
  cycleSpeedInput,
});

const swarmIntegrationSetupRuntime = createSwarmIntegrationSetupRuntime(
  createSwarmIntegrationAssemblyRuntime({
    sampleHeightAtMapPixel,
    getGrayAt,
    waterImageData,
    swarmHeightMax: SWARM_Z_MAX,
    terrainClearance: SWARM_TERRAIN_CLEARANCE,
    swarmState,
    splatSize,
    clamp,
    getSwarmSettings,
    getSwarmFollowSnapshot,
    setSwarmFollowAgentIndex: swarmFollowRuntimeState.setSwarmFollowAgentIndex,
    stopSwarmFollow,
    invalidateSwarmInterpolation,
    requestOverlayDraw: () => requestOverlayDraw(),
    applySwarmSettings,
    applySwarmFollowState,
    syncSwarmRuntimeStateToStore: (...args) => swarmRuntime.syncSwarmRuntimeStateToStore(...args),
    settingsApplyRuntime,
    settingsBridgeRuntime,
    syncSwarmStateToStore: (...args) => swarmRuntime.syncSwarmStateToStore(...args),
    defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
    defaultFogSettings: DEFAULT_FOG_SETTINGS,
    defaultParallaxSettings: DEFAULT_PARALLAX_SETTINGS,
    defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
    defaultWaterSettings: DEFAULT_WATER_SETTINGS,
    defaultInteractionSettings: DEFAULT_INTERACTION_SETTINGS,
    defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
    settingsLegacy: {
      getSwarmSettings,
      swarmEnabledToggle,
      swarmLitModeToggle,
      swarmFollowZoomToggle,
      swarmFollowZoomInInput,
      swarmFollowZoomOutInput,
      swarmFollowHawkRangeGizmoToggle,
      swarmFollowAgentSpeedSmoothingInput,
      swarmFollowAgentZoomSmoothingInput,
      swarmStatsPanelToggle,
      swarmShowTerrainToggle,
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
      swarmTimeRoutingInput,
      swarmFollowTargetInput,
      applySwarmFollowState,
      swarmState,
      normalizeSwarmFollowZoomInputs,
      normalizeSwarmHeightRangeInputs,
      updateSwarmLabels,
      updateSwarmUi,
      syncSwarmFollowToStore: (...args) => swarmRuntime.syncSwarmFollowToStore(...args),
      getPathfindingStateSnapshot,
      getCursorLightSnapshot,
      getPointLightsState: () => runtimeCore.store.getState().gameplay.pointLights,
      pathfindingRangeInput,
      pathWeightSlopeInput,
      pathWeightHeightInput,
      pathWeightWaterInput,
      pathSlopeCutoffInput,
      pathBaseCostInput,
      updatePathfindingRangeLabel,
      updatePathWeightLabels,
      updatePathSlopeCutoffLabel,
      updatePathBaseCostLabel,
      applyCursorLightConfigSnapshot,
      cursorLightState,
      cursorLightModeToggle,
      cursorLightFollowHeightToggle,
      cursorLightColorInput,
      cursorLightStrengthInput,
      cursorLightHeightOffsetInput,
      cursorLightGizmoToggle,
      pointLightLiveUpdateToggle,
      isPointLightLiveUpdateEnabled,
      updateCursorLightStrengthLabel,
      updateCursorLightHeightOffsetLabel,
      updateCursorLightModeUi,
      getCoreState: () => runtimeCore.store.getState(),
      getLightingSettings: () => getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS),
      getFogSettings: () => getSimulationKnobSectionFromStore("fog") || getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS),
      getParallaxSettings: () => getSimulationKnobSectionFromStore("parallax") || getSettingsDefaults("parallax", DEFAULT_PARALLAX_SETTINGS),
      getCloudSettings: () => getSimulationKnobSectionFromStore("clouds") || getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS),
      getWaterSettings: () => getSimulationKnobSectionFromStore("waterFx") || getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS),
      getTimeState: () => runtimeCore.store.getState().systems.time || {},
      shadowsToggle,
      heightScaleInput,
      shadowStrengthInput,
      shadowBlurInput,
      ambientInput,
      diffuseInput,
      volumetricToggle,
      volumetricStrengthInput,
      volumetricDensityInput,
      volumetricAnisotropyInput,
      volumetricLengthInput,
      volumetricSamplesInput,
      cycleState,
      cycleSpeedInput,
      simTickHoursInput,
      pointFlickerToggle,
      pointFlickerStrengthInput,
      pointFlickerSpeedInput,
      pointFlickerSpatialInput,
      fogToggle,
      fogColorInput,
      setFogColorManual: (value) => {
        fogColorManual = Boolean(value);
      },
      fogMinAlphaInput,
      fogMaxAlphaInput,
      fogFalloffInput,
      fogStartOffsetInput,
      parallaxToggle,
      parallaxStrengthInput,
      parallaxBandsInput,
      cloudToggle,
      cloudCoverageInput,
      cloudSoftnessInput,
      cloudOpacityInput,
      cloudScaleInput,
      cloudSpeed1Input,
      cloudSpeed2Input,
      cloudSunParallaxInput,
      cloudSunProjectToggle,
      cloudTimeRoutingInput,
      waterFxToggle,
      waterFlowDownhillToggle,
      waterFlowInvertDownhillToggle,
      waterFlowDebugToggle,
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
      waterTintColorInput,
      waterTintStrengthInput,
      waterTimeRoutingInput,
      clamp,
      clampRound,
      normalizeSimTickHours,
      normalizeRoutingMode,
      rgbToHex,
      updateVolumetricLabels,
      updateVolumetricUi,
      updateShadowBlurLabel,
      updatePointFlickerLabels,
      updatePointFlickerUi,
      updateSimTickLabel,
      setCycleHourSliderFromState,
      updateCycleHourLabel,
      schedulePointLightBake,
      updateFogAlphaLabels,
      updateFogFalloffLabel,
      updateFogStartOffsetLabel,
      updateFogUi,
      updateParallaxStrengthLabel,
      updateParallaxBandsLabel,
      updateParallaxUi,
      updateCloudLabels,
      updateCloudUi,
      updateWaterLabels,
      updateWaterUi,
      rebuildFlowMapTexture,
      getConfiguredSimTickHours,
    },
    swarmCursorState,
    swarmZNeighborScale: SWARM_Z_NEIGHBOR_SCALE,
    swarmRenderState,
    isSwarmEnabled,
    swarmFollowHawkScratch,
    swarmFollowAgentScratch,
    mapCoordToWorld: (...args) => mapCoordToWorld(...args),
    zoomMin,
    zoomMax,
    getZoom: () => getActiveCameraState().zoom,
    dispatchCoreCommand,
    setSwarmFollowHawkIndex: swarmFollowRuntimeState.setSwarmFollowHawkIndex,
    getSwarmFollowSpeedNormFiltered: swarmFollowRuntimeState.getSwarmFollowSpeedNormFiltered,
    setSwarmFollowSpeedNormFiltered: swarmFollowRuntimeState.setSwarmFollowSpeedNormFiltered,
    swarmOverlayAgentScratch,
    swarmOverlayHawkScratch,
    swarmGizmoHawkScratch,
    worldToScreen: (...args) => worldToScreen(...args),
    overlayCtx,
    hexToRgb01,
    swarmZMax: SWARM_Z_MAX,
    swarmLitAgentScratch,
    swarmLitHawkScratch,
    computeSwarmDirectionalShadow,
    getViewHalfExtents: (...args) => getViewHalfExtents(...args),
    getMapAspect: (...args) => getMapAspect(...args),
    gl,
    swarmProgram,
    swarmUniforms,
    normalsTex,
    heightTex,
    pointLightTex,
    cloudNoiseTex,
    heightSize,
    canvas,
    pointLightEdgeMin: SWARM_POINT_LIGHT_EDGE_MIN,
    swarmPointVao,
    swarmPointBuffer,
    getSwarmCursorMode,
    playerState,
    getCurrentPathMetrics,
    getMovementSnapshot: () => movementSystem.getSnapshot(),
    playerInfoEl,
    pathInfoEl,
    applyInteractionMode,
    canUseInteractionInCurrentMode,
    dockLightingModeToggle,
    dockPathfindingModeToggle,
    movePreviewState,
    store: runtimeCore.store,
    getCameraRuntimeBinding,
    playerRuntimeBinding,
    parseNpcPlayerImpl: parseNpcPlayerFromBinding,
    applyLoadedNpcImpl: applyLoadedNpcFromBinding,
  }),
);
const swarmGameplayRuntime = swarmIntegrationSetupRuntime.swarmGameplayRuntime;
const terrainFloorAtSwarmCoord = swarmIntegrationSetupRuntime.terrainFloorAtSwarmCoord;
const isWaterAtSwarmCoord = swarmIntegrationSetupRuntime.isWaterAtSwarmCoord;
const isSwarmCoordFlyable = swarmIntegrationSetupRuntime.isSwarmCoordFlyable;
const chooseRandomSwarmTargetIndexNear = swarmIntegrationSetupRuntime.chooseRandomSwarmTargetIndexNear;
const chooseRandomFollowAgentIndex = swarmIntegrationSetupRuntime.chooseRandomFollowAgentIndex;
const chooseRandomFollowHawkIndex = swarmIntegrationSetupRuntime.chooseRandomFollowHawkIndex;
const ensureSwarmBuffers = swarmIntegrationSetupRuntime.ensureSwarmBuffers;
const reseedSwarmAgents = swarmIntegrationSetupRuntime.reseedSwarmAgents;
settingsLegacyBindings = swarmIntegrationSetupRuntime.settingsLegacyBindings;
settingsRuntimeBinding = swarmIntegrationSetupRuntime.settingsRuntimeBinding;
const swarmRenderSetupRuntime = swarmIntegrationSetupRuntime.swarmRenderSetupRuntime;
const swarmLoopRuntime = swarmRenderSetupRuntime.swarmLoopRuntime;
const writeInterpolatedSwarmAgentPos = swarmLoopRuntime.writeInterpolatedSwarmAgentPos;
const writeInterpolatedSwarmHawkPos = swarmLoopRuntime.writeInterpolatedSwarmHawkPos;
const updateSwarm = swarmLoopRuntime.updateSwarm;
const updateSwarmFollowCamera = swarmLoopRuntime.updateSwarmFollowCamera;

function drawSwarmUnlitOverlay(settings) {
  swarmOverlayRuntime.drawSwarmUnlitOverlay(settings);
}

function drawSwarmGizmos(settings) {
  swarmOverlayRuntime.drawSwarmGizmos(settings);
}

const swarmOverlayRuntime = swarmIntegrationSetupRuntime.swarmOverlayRuntime;
const renderSwarmLit = swarmIntegrationSetupRuntime.renderSwarmLit;
const updateInfoPanel = swarmIntegrationSetupRuntime.updateInfoPanel;
const interactionModeBinding = swarmIntegrationSetupRuntime.interactionModeBinding;
const mainInteractionBindings = swarmIntegrationSetupRuntime.mainInteractionBindings;
const {
  getBaseViewHalfExtents,
  getActiveCameraState,
  getViewHalfExtents,
  clientToNdc,
  worldFromNdc,
  worldToUv,
  uvToMapPixelIndex,
  mapPixelIndexToUv,
  mapPixelToWorld,
  mapCoordToWorld,
  worldToScreen,
  setInteractionMode,
  setPlayerPosition,
  parseNpcPlayer,
  applyLoadedNpc,
} = mainInteractionBindings;

const interactionUiSetupRuntime = createInteractionUiSetupRuntime(createInteractionUiAssemblyRuntime({
  isSwarmEnabled,
  swarmCursorState,
  clientToNdc,
  worldFromNdc,
  worldToUv,
  clamp,
  splatSize,
  playerState,
  getMapSize: () => splatSize,
  getPathfindingStateSnapshot,
  getSlopeImageData: () => slopeImageData,
  getHeightImageData: () => heightImageData,
  getWaterImageData: () => waterImageData,
  movePreviewState,
  getInteractionModeSnapshot,
  requestOverlayDraw: () => requestOverlayDraw(),
  uvToMapPixelIndex,
  pathfindingRangeValue,
  pathWeightSlopeValue,
  pathWeightHeightValue,
  pathWeightWaterValue,
  pathSlopeCutoffValue,
  pathBaseCostValue,
  normalizeSimTickHours,
  serializeLightingSettings,
  serializeFogSettings,
  serializeParallaxSettings,
  serializeCloudSettings,
  serializeWaterSettings,
  parallaxStrengthValue,
  parallaxBandsValue,
  shadowBlurValue,
  simTickHoursValue,
  fogMinAlphaValue,
  fogMaxAlphaValue,
  fogFalloffValue,
  fogStartOffsetValue,
  pointFlickerStrengthValue,
  pointFlickerSpeedValue,
  pointFlickerSpatialValue,
  volumetricStrengthValue,
  volumetricDensityValue,
  volumetricAnisotropyValue,
  volumetricLengthValue,
  volumetricSamplesValue,
  cloudCoverageValue,
  cloudSoftnessValue,
  cloudOpacityValue,
  cloudScaleValue,
  cloudSpeed1Value,
  cloudSpeed2Value,
  cloudSunParallaxValue,
  waterFlowDirectionValue,
  waterLocalFlowMixValue,
  waterDownhillBoostValue,
  waterFlowRadius1Value,
  waterFlowRadius2Value,
  waterFlowRadius3Value,
  waterFlowWeight1Value,
  waterFlowWeight2Value,
  waterFlowWeight3Value,
  waterFlowStrengthValue,
  waterFlowSpeedValue,
  waterFlowScaleValue,
  waterShimmerStrengthValue,
  waterGlintStrengthValue,
  waterGlintSharpnessValue,
  waterShoreFoamStrengthValue,
  waterShoreWidthValue,
  waterReflectivityValue,
  waterTintStrengthValue,
  pointFlickerStrengthInput,
  pointFlickerSpeedInput,
  pointFlickerSpatialInput,
  volumetricStrengthInput,
  volumetricDensityInput,
  volumetricAnisotropyInput,
  volumetricLengthInput,
  volumetricSamplesInput,
  parallaxStrengthInput,
  parallaxBandsInput,
  fogColorInput,
  fogMinAlphaInput,
  fogMaxAlphaInput,
  fogFalloffInput,
  fogStartOffsetInput,
  cloudCoverageInput,
  cloudSoftnessInput,
  cloudOpacityInput,
  cloudScaleInput,
  cloudSpeed1Input,
  cloudSpeed2Input,
  cloudSunParallaxInput,
  cloudSunProjectToggle,
  waterFlowDownhillToggle,
  waterFlowInvertDownhillToggle,
  waterFlowDebugToggle,
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
  waterTintColorInput,
  waterTintStrengthInput,
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
  updateCloudLabels,
  updateCloudUi,
  updateWaterLabels,
  updateWaterUi,
}));
const updateSwarmCursorFromPointer = interactionUiSetupRuntime.updateSwarmCursorFromPointer;
pathfindingRuntimeBinding = interactionUiSetupRuntime.pathfindingRuntimeBinding;
pathfindingLabelRuntime = interactionUiSetupRuntime.pathfindingLabelRuntime;
renderFxUiRuntime = interactionUiSetupRuntime.renderFxUiRuntime;
renderFxSettingsSyncRuntime = interactionUiSetupRuntime.renderFxSettingsSyncRuntime;

const renderShellSetupRuntime = createRenderShellSetupRuntime(createRenderShellAssemblyRuntime({
  windowEl: window,
  canvas,
  overlayCanvas,
  gl,
  overlayDirtyRuntime,
  isSwarmEnabled,
  getSwarmSettings,
  swarmCursorState,
  getSwarmFollowSnapshot: swarmFollowRuntimeState.getSwarmFollowSnapshot,
  overlayCtx,
  getMapAspect,
  splatSize,
  getInteractionMode: () => getInteractionModeSnapshot(),
  getLightEditDraft,
  getPointLights: () => pointLights,
  isPointLightSelected,
  mapPixelToWorld,
  worldToScreen,
  clamp,
  getCursorLightSnapshot,
  cursorLightState,
  movePreviewState,
  playerState,
  drawSwarmUnlitOverlay,
  drawSwarmGizmos,
  updateSwarm,
  updateSwarmFollowCamera,
  computeFrameTiming,
  runtimeFrame: runtimeCore.frame,
  getCoreState: () => runtimeCore.store.getState(),
  buildFrameTimeState,
  getConfiguredSimTickHoursFromStoreOrDefaults,
  getCurrentTimeRoutingFromStoreOrDefaults,
  getRoutedSystemTime,
  getInterpolatedRoutedTimeSec,
  schedulerUpdateAll: (ctx, state) => runtimeCore.scheduler.updateAll(ctx, state),
  computeLightingParams,
  getFrameUiRuntime,
  buildUniformInputState,
  getSettingsDefaults,
  defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
  defaultParallaxSettings: DEFAULT_PARALLAX_SETTINGS,
  defaultFogSettings: DEFAULT_FOG_SETTINGS,
  defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
  defaultWaterSettings: DEFAULT_WATER_SETTINGS,
  hexToRgb01,
  updateInfoPanel,
  updateSwarmStatsPanel,
  updateCycleHourLabel,
  updateWeatherFieldMeta,
  renderResources,
  renderFrameSwarmLayers,
  buildFrameRenderState,
  cycleState,
  getCurrentMapFolderPath,
  renderer,
  renderSwarmLit,
}));
const overlayHooks = renderShellSetupRuntime.overlayHooks;
const requestOverlayDraw = renderShellSetupRuntime.requestOverlayDraw;
const resize = renderShellSetupRuntime.resize;
const render = renderShellSetupRuntime.render;

runAppShellLifecycleRuntime(createAppShellLifecycleAssemblyRuntime({
  windowEl: window,
  bindings: createMainBindingsLifecycleAssemblyRuntime({
    canvas,
    windowEl: window,
    dispatchCoreCommand,
    updateSwarmCursorFromPointer,
    updateCursorLightFromPointer,
    updatePathPreviewFromPointer,
    isMiddleDragging: () => isMiddleDragging,
    isCursorLightEnabled: () => getCursorLightSnapshot().enabled,
    getInteractionMode: () => getInteractionModeSnapshot(),
    requestOverlayDraw,
    clientToNdc,
    worldFromNdc,
    worldToUv,
    uvToMapPixelIndex,
    swarmCursorState,
    cursorLightState,
    movePreviewState,
    pathfindingRangeInput,
    pathWeightSlopeInput,
    pathWeightHeightInput,
    pathWeightWaterInput,
    pathSlopeCutoffInput,
    pathBaseCostInput,
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
    swarmTimeRoutingInput,
    swarmEnabledToggle,
    swarmState,
    swarmFollowState,
    getSwarmSettings,
    updateSwarmUi,
    updateSwarmLabels,
    updateSwarmStatsPanel,
    normalizeSwarmFollowZoomInputs,
    normalizeSwarmHeightRangeInputs,
    reseedSwarmAgents,
    resetSwarmFollowSpeedSmoothing,
    updateSwarmFollowButtonUi,
    setStatus,
    swarmFollowToggleBtn,
    swarmFollowTargetInput,
    topicButtons,
    topicPanelCloseBtn,
    setActiveTopic,
    canUseTopic: canUseTopicInCurrentMode,
    dockLightingModeToggle,
    dockPathfindingModeToggle,
    cycleSpeedInput,
    cycleHourInput,
    simTickHoursInput,
    canUseInteractionMode: canUseInteractionInCurrentMode,
    rebuildMovementField,
    cursorLightModeToggle,
    cursorLightFollowHeightToggle,
    cursorLightColorInput,
    cursorLightStrengthInput,
    cursorLightHeightOffsetInput,
    cursorLightGizmoToggle,
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
    hasLightEditDraft,
    setLightEditDraftColor,
    setLightEditDraftStrength,
    setLightEditDraftIntensity,
    setLightEditDraftHeightOffset,
    setLightEditDraftFlicker,
    setLightEditDraftFlickerSpeed,
    updatePointLightStrengthLabel,
    updatePointLightIntensityLabel,
    updatePointLightHeightOffsetLabel,
    updatePointLightFlickerLabel,
    updatePointLightFlickerSpeedLabel,
    rebakeIfPointLightLiveUpdateEnabled,
    applyDraftToSelectedPointLight,
    bakePointLightsTexture,
    syncPointLightsStateToStore,
    updateLightEditorUi,
    getSelectedPointLight,
    deletePointLightById,
    clearLightEditSelection,
    isPointLightsSaveConfirmArmed,
    armPointLightsSaveConfirmation,
    resetPointLightsSaveConfirmation,
    savePointLightsJson,
    loadPointLightsFromAssetsOrPrompt,
    applyLoadedPointLights,
    parallaxStrengthInput,
    parallaxBandsInput,
    parallaxToggle,
    shadowsToggle,
    heightScaleInput,
    shadowStrengthInput,
    shadowBlurInput,
    ambientInput,
    diffuseInput,
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
    cloudSunProjectToggle,
    cloudToggle,
    cloudTimeRoutingInput,
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
    waterTintColorInput,
    waterTintStrengthInput,
    waterFxToggle,
    waterFlowDownhillToggle,
    waterFlowInvertDownhillToggle,
    waterFlowDebugToggle,
    waterTimeRoutingInput,
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
    schedulePointLightBake,
  }),
  tryAutoLoadDefaultMap,
  setStatus,
  setSwarmDefaults,
  normalizeSwarmHeightRangeInputs,
  updatePathfindingRangeLabel,
  updatePathWeightLabels,
  updatePathSlopeCutoffLabel,
  updatePathBaseCostLabel,
  updateSwarmLabels,
  updateSwarmUi,
  updateSwarmStatsPanel,
  updateSwarmFollowButtonUi,
  updateParallaxStrengthLabel,
  updateParallaxBandsLabel,
  updateShadowBlurLabel,
  updateVolumetricLabels,
  updatePointFlickerLabels,
  updateSimTickLabel,
  updateFogAlphaLabels,
  updateFogFalloffLabel,
  updateFogStartOffsetLabel,
  updateCloudLabels,
  updateWaterLabels,
  updatePointLightStrengthLabel,
  updatePointLightIntensityLabel,
  updatePointLightHeightOffsetLabel,
  updatePointLightFlickerLabel,
  updatePointLightFlickerSpeedLabel,
  updateCursorLightStrengthLabel,
  updateCursorLightHeightOffsetLabel,
  setCycleHourSliderFromState,
  updateCycleHourLabel,
  syncMapPathInput: (nextPath) => mapPathUiSyncRuntime.syncMapPathInput(nextPath),
  currentMapFolderPath: getCurrentMapFolderPath(),
  updateLightEditorUi,
  updateCursorLightModeUi,
  updateParallaxUi,
  updateVolumetricUi,
  updatePointFlickerUi,
  updateFogUi,
  updateCloudUi,
  updateWaterUi,
  setActiveTopic,
  setInteractionMode,
  updateModeCapabilitiesUi,
  reseedSwarmAgents,
  getSwarmSettings,
  statusTextEl: statusEl,
  resize,
  render,
}));
