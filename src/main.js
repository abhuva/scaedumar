import { createRuntimeCore, createCoreCommandDispatch } from "./core/runtimeCore.js";
import { bindPointLightWorker } from "./core/pointLightWorkerBinding.js";
import { registerMainCommands } from "./core/registerMainCommands.js";
import {
  SIM_SECONDS_PER_HOUR,
  buildFrameTimeState,
  getRoutedSystemTime,
  normalizeRoutingMode,
  normalizeSimTickHours,
  normalizeTimeRouting,
} from "./core/timeRouter.js";
import { createTimeStateAccess } from "./core/timeStateAccess.js";
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
import { createRenderResources } from "./render/resources.js";
import { createRenderer } from "./render/renderer.js";
import { buildFrameRenderState } from "./render/frameRenderState.js";
import { buildUniformInputState } from "./render/uniformInputState.js";
import { createTerrainUniformUploader } from "./render/uniformUploader.js";
import { createSwarmLitRenderer } from "./render/swarmLitRenderer.js";
import {
  createFlatNormalImage as createFlatNormalImageRender,
  createFlatHeightImage as createFlatHeightImageRender,
  createFlatSlopeImage as createFlatSlopeImageRender,
  createFlatWaterImage as createFlatWaterImageRender,
  createFallbackSplat as createFallbackSplatRender,
  extractImageData as extractImageDataRender,
} from "./render/fallbackMapImages.js";
import { createShadowPass } from "./render/passes/shadowPass.js";
import { createMainTerrainPass } from "./render/passes/mainTerrainPass.js";
import { createBlurPass } from "./render/passes/blurPass.js";
import { applyPointLightUsagePass } from "./render/passes/pointLightUsagePass.js";
import { rebuildFlowMapTexture as rebuildFlowMapTexturePrecompute } from "./render/precompute/flowMap.js";
import { createPointLightBakeOrchestrator } from "./render/precompute/pointLightBake.js";
import { createPointLightBakeCanvasRuntime } from "./render/pointLightBakeCanvasRuntime.js";
import { createPointLightBakeSync } from "./render/pointLightBakeSync.js";
import { createTimeSystem } from "./sim/timeSystem.js";
import { createLightingSystem } from "./sim/lightingSystem.js";
import { createFogSystem } from "./sim/fogSystem.js";
import { createCloudSystem } from "./sim/cloudSystem.js";
import { createWaterFxSystem } from "./sim/waterFxSystem.js";
import { createWeatherSystem } from "./sim/weatherSystem.js";
import { sampleSunAtHour as sampleSunAtHourModel } from "./sim/sunModel.js";
import { createEntityStore } from "./gameplay/entityStore.js";
import { createCursorLightRuntimeState } from "./gameplay/cursorLightState.js";
import { createMovementSystem } from "./gameplay/movementSystem.js";
import { createPointLightEditorState } from "./gameplay/pointLightEditorState.js";
import { createPointLightEditorController } from "./gameplay/pointLightEditorController.js";
import { createPointLightIoController } from "./gameplay/pointLightIoController.js";
import { createMapDataSaveController } from "./gameplay/mapDataSaveController.js";
import { createMapSidecarLoader } from "./gameplay/mapSidecarLoader.js";
import { createMapLoader } from "./gameplay/mapLoader.js";
import { createMapImageRuntime } from "./gameplay/mapImageRuntime.js";
import { createMapSampling } from "./gameplay/mapSampling.js";
import { createShadowOcclusion } from "./gameplay/shadowOcclusion.js";
import {
  normalizeMapFolderPath as normalizeMapFolderPathUtil,
  isAbsoluteFsPath as isAbsoluteFsPathUtil,
  joinFsPath as joinFsPathUtil,
  buildMapAssetPath as buildMapAssetPathUtil,
  toAbsoluteFileUrl as toAbsoluteFileUrlUtil,
} from "./gameplay/mapPathUtils.js";
import { resolveTauriInvoke, createTauriRuntimeHelpers } from "./gameplay/tauriRuntime.js";
import { getFileFromFolderSelection as selectFileFromFolder, createMapIoHelpers } from "./gameplay/mapIoHelpers.js";
import { parsePointLightsPayload, serializePointLightsPayload } from "./gameplay/pointLightsPersistence.js";
import { createSwarmFollowCameraUpdater } from "./gameplay/swarmFollowCamera.js";
import { createSwarmUpdateLoop } from "./gameplay/swarmUpdateLoop.js";
import { createSwarmStepFunction } from "./gameplay/swarmStep.js";
import { createSwarmInterpolation } from "./gameplay/swarmInterpolation.js";
import { createSwarmReseeder } from "./gameplay/swarmReseed.js";
import { createSwarmTargeting } from "./gameplay/swarmTargeting.js";
import { createSwarmEnvironment } from "./gameplay/swarmEnvironment.js";
import { createSwarmAgentStateMutator } from "./gameplay/swarmAgentStateMutator.js";
import { createSwarmFollowStateController } from "./gameplay/swarmFollowStateController.js";
import { createSwarmDataApplier } from "./gameplay/swarmDataApplier.js";
import { createSwarmDataSerializer } from "./gameplay/swarmDataSerializer.js";
import { createInteractionDataSerializer } from "./gameplay/interactionDataSerializer.js";
import { createNpcPersistence } from "./gameplay/npcPersistence.js";
import { createRenderFxDataSerializer } from "./gameplay/renderFxDataSerializer.js";
import { syncMapState, syncPlayerState, syncPointLightsState } from "./gameplay/stateSync.js";
import { getCursorLightSnapshot as buildCursorLightSnapshot, isPointLightLiveUpdateEnabled as getPointLightLiveUpdateEnabled } from "./gameplay/interactionStateAccess.js";
import { setSwarmDefaults as applySwarmDefaults, isSwarmEnabled as resolveSwarmEnabled } from "./gameplay/swarmStateAccess.js";
import {
  getInteractionModeSnapshot as resolveInteractionModeSnapshot,
  getSwarmCursorMode as resolveSwarmCursorMode,
  getSwarmSettings as resolveSwarmSettings,
  getPathfindingStateSnapshot as resolvePathfindingStateSnapshot,
} from "./gameplay/runtimeStateSnapshots.js";
import { createPathfindingPreviewRuntime } from "./gameplay/pathfindingPreviewRuntime.js";
import { setInteractionMode as applyInteractionMode } from "./gameplay/interactionModeController.js";
import { createPathfindingCostModel } from "./gameplay/pathfindingCostModel.js";
import {
  getSwarmRuntimeStateSnapshot as buildSwarmRuntimeStateSnapshot,
  syncSwarmFollowToStore as syncSwarmFollowToStoreState,
  syncSwarmRuntimeStateToStore as syncSwarmRuntimeStateToStoreState,
} from "./gameplay/swarmStoreSync.js";
import {
  getBaseViewHalfExtents as getBaseViewHalfExtentsTransform,
  getActiveCameraState as getActiveCameraStateTransform,
  getViewHalfExtents as getViewHalfExtentsTransform,
  clientToNdc as clientToNdcTransform,
  worldFromNdc as worldFromNdcTransform,
  worldToUv as worldToUvTransform,
  uvToMapPixelIndex as uvToMapPixelIndexTransform,
  mapPixelIndexToUv as mapPixelIndexToUvTransform,
  mapPixelToWorld as mapPixelToWorldTransform,
  mapCoordToWorld as mapCoordToWorldTransform,
  worldToScreen as worldToScreenTransform,
} from "./gameplay/cameraTransforms.js";
import { bindCanvasControls } from "./ui/bindings/canvasBinding.js";
import { updatePointLightEditorUi as syncPointLightEditorUi } from "./ui/pointLightEditorUi.js";
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
import { createOverlayDrawer } from "./ui/overlays/drawOverlay.js";
import { createSwarmInputNormalization } from "./ui/swarmInputNormalization.js";
import { createSwarmPanelUi } from "./ui/swarmPanelUi.js";
import { createSwarmSettingsApplier } from "./ui/swarmSettingsApplier.js";
import { createInteractionSettingsApplier } from "./ui/interactionSettingsApplier.js";
import { createLightingSettingsApplier } from "./ui/lightingSettingsApplier.js";
import { createRenderFxSettingsApplier } from "./ui/renderFxSettingsApplier.js";
import { createInfoPanelRuntime } from "./ui/infoPanelRuntime.js";
import { createModeCapabilitiesUi } from "./ui/modeCapabilitiesUi.js";
import { createLightLabelRuntime } from "./ui/lightLabelRuntime.js";
import { createTimeUiRuntime } from "./ui/timeUiRuntime.js";
import * as renderFxUiRuntime from "./ui/renderFxUiRuntime.js";
import * as pathfindingLabelUi from "./ui/pathfindingLabelUi.js";

const runtimeCore = createRuntimeCore();
const dispatchCoreCommand = createCoreCommandDispatch(runtimeCore);
const entityStore = createEntityStore();

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
  const waterSettings = getSimulationKnobSectionFromStore("waterFx") || getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS);
  rebuildFlowMapTexturePrecompute({
    gl,
    flowMapTex,
    heightImageData,
    heightSize,
    clamp,
    settings: {
      radius1: waterSettings.waterFlowRadius1,
      radius2: waterSettings.waterFlowRadius2,
      radius3: waterSettings.waterFlowRadius3,
      weight1: waterSettings.waterFlowWeight1,
      weight2: waterSettings.waterFlowWeight2,
      weight3: waterSettings.waterFlowWeight3,
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
  const lightingSettings = getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS);
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
  gl.uniform1f(shadowUniforms.uHeightScale, Number(lightingSettings.heightScale));
  gl.uniform1f(shadowUniforms.uShadowStrength, Number(lightingSettings.shadowStrength));
  gl.uniform1f(shadowUniforms.uUseShadows, lightingSettings.useShadows ? 1 : 0);
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
  return normalizeMapFolderPathUtil(path, DEFAULT_MAP_FOLDER);
}

const tauriInvoke = resolveTauriInvoke(window);

function isAbsoluteFsPath(path) {
  return isAbsoluteFsPathUtil(path);
}

function joinFsPath(folder, fileName) {
  return joinFsPathUtil(folder, fileName);
}

function buildMapAssetPath(folder, fileName) {
  return buildMapAssetPathUtil(folder, fileName);
}

const tauriRuntimeHelpers = createTauriRuntimeHelpers({
  tauriInvoke,
  normalizeMapFolderPath,
  isAbsoluteFsPath,
});

async function invokeTauri(command, args) {
  return tauriRuntimeHelpers.invokeTauri(command, args);
}

function toAbsoluteFileUrl(path) {
  return toAbsoluteFileUrlUtil(path);
}

async function pickMapFolderViaTauri() {
  return tauriRuntimeHelpers.pickMapFolderViaTauri();
}

async function validateMapFolderViaTauri(folderPath) {
  return tauriRuntimeHelpers.validateMapFolderViaTauri(folderPath);
}

let mapImageRuntime = null;
function getMapImageRuntime() {
  if (mapImageRuntime) return mapImageRuntime;
  mapImageRuntime = createMapImageRuntime({
    splatSize,
    normalsSize,
    heightSize,
    splatTex,
    normalsTex,
    heightTex,
    waterTex,
    uploadImageToTexture,
    applyMapSizeChangeIfNeeded,
    resetCamera,
    extractImageData,
    rebuildFlowMapTexture,
    syncMapStateToStore,
    getPointLightBakeWorker: () => pointLightBakeWorker,
    getNormalsImageData: () => normalsImageData,
    getHeightImageData: () => heightImageData,
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
  return mapImageRuntime;
}

let mapSamplingRuntime = null;
function getMapSamplingRuntime() {
  if (mapSamplingRuntime) return mapSamplingRuntime;
  mapSamplingRuntime = createMapSampling({
    clamp,
    getSplatSize: () => splatSize,
    getNormalsSize: () => normalsSize,
    getHeightSize: () => heightSize,
    getNormalsImageData: () => normalsImageData,
    getHeightImageData: () => heightImageData,
  });
  return mapSamplingRuntime;
}

let shadowOcclusionRuntime = null;
function getShadowOcclusionRuntime() {
  if (shadowOcclusionRuntime) return shadowOcclusionRuntime;
  shadowOcclusionRuntime = createShadowOcclusion({
    getSplatSize: () => splatSize,
    sampleHeightAtMapCoord,
    sampleHeightAtMapPixel,
    swarmZMax: SWARM_Z_MAX,
  });
  return shadowOcclusionRuntime;
}

async function applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage) {
  await getMapImageRuntime().applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage);
}

function syncPointLightWorkerMapData() {
  getMapImageRuntime().syncPointLightWorkerMapData();
}

function getFileFromFolderSelection(files, fileName) {
  return selectFileFromFolder(files, fileName);
}

const mapIoHelpers = createMapIoHelpers({
  tauriInvoke,
  isAbsoluteFsPath,
  invokeTauri,
  toAbsoluteFileUrl,
});

async function tryLoadJsonFromUrl(path) {
  return mapIoHelpers.tryLoadJsonFromUrl(path);
}

const SWARM_Z_MAX = 256;
const SWARM_TERRAIN_CLEARANCE = 1;
const SWARM_Z_NEIGHBOR_SCALE = 1;
const LIGHTING_SAVE_PRECISION = 2;

const timeStateAccess = createTimeStateAccess({
  getSettingsDefaults,
  defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
  defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
  defaultWaterSettings: DEFAULT_WATER_SETTINGS,
  normalizeTimeRouting,
  normalizeRoutingMode,
  normalizeSimTickHours,
  getCoreState: () => runtimeCore.store.getState(),
  clamp,
  simSecondsPerHour: SIM_SECONDS_PER_HOUR,
});

function getDefaultTimeRouting() {
  return timeStateAccess.getDefaultTimeRouting();
}

function getConfiguredSimTickHours() {
  return timeStateAccess.getConfiguredSimTickHours();
}

function getCurrentTimeRoutingFromStoreOrDefaults() {
  return timeStateAccess.getCurrentTimeRoutingFromStoreOrDefaults();
}

function getConfiguredSimTickHoursFromStoreOrDefaults() {
  return timeStateAccess.getConfiguredSimTickHoursFromStoreOrDefaults();
}

function getInterpolatedRoutedTimeSec(systemTiming) {
  return timeStateAccess.getInterpolatedRoutedTimeSec(systemTiming);
}

function serializeLightingSettingsLegacy() {
  return serializeLightingSettingsLegacyImpl();
}

function applyLightingSettingsLegacy(rawData) {
  applyLightingSettingsLegacyImpl(rawData);
}

function serializeFogSettingsLegacy() {
  return serializeFogSettingsLegacyImpl();
}

function serializeParallaxSettingsLegacy() {
  return serializeParallaxSettingsLegacyImpl();
}

function serializeCloudSettingsLegacy() {
  return serializeCloudSettingsLegacyImpl();
}

function serializeWaterSettingsLegacy() {
  return serializeWaterSettingsLegacyImpl();
}

function serializeInteractionSettingsLegacy() {
  return serializeInteractionSettingsImpl();
}

function serializeNpcState() {
  return serializeNpcStateImpl();
}

function serializeSwarmDataLegacy() {
  return serializeSwarmDataImpl();
}

function applySwarmSettingsLegacy(rawData) {
  applySwarmSettingsLegacyImpl(rawData);
}

function applySwarmData(rawData) {
  applySwarmDataImpl(rawData);
}

function applyFogSettingsLegacy(rawData) {
  applyFogSettingsLegacyImpl(rawData);
}

function applyParallaxSettingsLegacy(rawData) {
  applyParallaxSettingsLegacyImpl(rawData);
}

function applyCloudSettingsLegacy(rawData) {
  applyCloudSettingsLegacyImpl(rawData);
}

function applyWaterSettingsLegacy(rawData) {
  applyWaterSettingsLegacyImpl(rawData);
}

function applyInteractionSettingsLegacy(rawData) {
  applyInteractionSettingsLegacyImpl(rawData);
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

function normalizeAppliedSettings(key, rawData, fallbackDefaults) {
  const defaults = getSettingsDefaults(key, fallbackDefaults);
  const input = rawData && typeof rawData === "object" ? rawData : {};
  return {
    ...defaults,
    ...input,
  };
}

function updateStoreFromAppliedSettings(key, normalized) {
  runtimeCore.store.update((prev) => {
    if (key === "lighting") {
      const cycleSpeed = clamp(Number(normalized.cycleSpeed), 0, 1);
      const simTickHours = normalizeSimTickHours(normalized.simTickHours);
      return {
        ...prev,
        clock: {
          ...prev.clock,
          timeScale: cycleSpeed,
        },
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            lighting: { ...normalized },
          },
        },
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            cycleSpeedHoursPerSec: cycleSpeed,
            simTickHours,
          },
        },
        ui: {
          ...prev.ui,
          cycleHour: Number.isFinite(Number(normalized.cycleHour)) ? clamp(Number(normalized.cycleHour), 0, 24) : prev.ui.cycleHour,
        },
      };
    }
    if (key === "fog") {
      return {
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            fog: { ...normalized },
          },
        },
      };
    }
    if (key === "parallax") {
      return {
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            parallax: { ...normalized },
          },
        },
      };
    }
    if (key === "clouds") {
      return {
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            clouds: { ...normalized },
          },
        },
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            routing: {
              ...prev.systems.time.routing,
              clouds: normalizeRoutingMode(normalized.timeRouting, "global"),
            },
          },
        },
      };
    }
    if (key === "waterfx") {
      return {
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            waterFx: { ...normalized },
          },
        },
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            routing: {
              ...prev.systems.time.routing,
              water: normalizeRoutingMode(normalized.timeRouting, "detached"),
            },
          },
        },
      };
    }
    if (key === "interaction") {
      return {
        ...prev,
        gameplay: {
          ...prev.gameplay,
          pathfinding: {
            ...prev.gameplay.pathfinding,
            range: Math.round(clamp(Number(normalized.pathfindingRange), 30, 300)),
            weightSlope: clamp(Number(normalized.pathWeightSlope), 0, 10),
            weightHeight: clamp(Number(normalized.pathWeightHeight), 0, 10),
            weightWater: clamp(Number(normalized.pathWeightWater), 0, 100),
            slopeCutoff: Math.round(clamp(Number(normalized.pathSlopeCutoff), 0, 90)),
            baseCost: clamp(Number(normalized.pathBaseCost), 0, 2),
          },
          cursorLight: {
            ...prev.gameplay.cursorLight,
            enabled: Boolean(normalized.cursorLightEnabled),
            useTerrainHeight: Boolean(normalized.cursorLightFollowHeight),
            strength: Math.round(clamp(Number(normalized.cursorLightStrength), 1, 200)),
            heightOffset: Math.round(clamp(Number(normalized.cursorLightHeightOffset), 0, 120)),
            color: typeof normalized.cursorLightColor === "string" ? normalized.cursorLightColor : prev.gameplay.cursorLight.color,
            showGizmo: Boolean(normalized.cursorLightGizmo),
          },
          pointLights: {
            ...(prev.gameplay && prev.gameplay.pointLights ? prev.gameplay.pointLights : {}),
            liveUpdate: Boolean(normalized.pointLightLiveUpdate),
          },
        },
      };
    }
    if (key === "swarm") {
      return {
        ...prev,
        gameplay: {
          ...prev.gameplay,
          swarm: {
            ...prev.gameplay.swarm,
            ...normalized,
            timeRouting: normalizeRoutingMode(normalized.timeRouting, "global"),
          },
        },
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            routing: {
              ...prev.systems.time.routing,
              swarm: normalizeRoutingMode(normalized.timeRouting, "global"),
            },
          },
        },
      };
    }
    return prev;
  });
}

function serializeLightingSettings() {
  return serializeSettingsByKey("lighting", serializeLightingSettingsLegacy);
}

function applyLightingSettings(rawData) {
  updateStoreFromAppliedSettings("lighting", normalizeAppliedSettings("lighting", rawData, DEFAULT_LIGHTING_SETTINGS));
  applySettingsByKey("lighting", rawData, applyLightingSettingsLegacy);
}

function serializeFogSettings() {
  return serializeSettingsByKey("fog", serializeFogSettingsLegacy);
}

function applyFogSettings(rawData) {
  updateStoreFromAppliedSettings("fog", normalizeAppliedSettings("fog", rawData, DEFAULT_FOG_SETTINGS));
  applySettingsByKey("fog", rawData, applyFogSettingsLegacy);
}

function serializeParallaxSettings() {
  return serializeSettingsByKey("parallax", serializeParallaxSettingsLegacy);
}

function applyParallaxSettings(rawData) {
  updateStoreFromAppliedSettings("parallax", normalizeAppliedSettings("parallax", rawData, DEFAULT_PARALLAX_SETTINGS));
  applySettingsByKey("parallax", rawData, applyParallaxSettingsLegacy);
}

function serializeCloudSettings() {
  return serializeSettingsByKey("clouds", serializeCloudSettingsLegacy);
}

function applyCloudSettings(rawData) {
  updateStoreFromAppliedSettings("clouds", normalizeAppliedSettings("clouds", rawData, DEFAULT_CLOUD_SETTINGS));
  applySettingsByKey("clouds", rawData, applyCloudSettingsLegacy);
}

function serializeWaterSettings() {
  return serializeSettingsByKey("waterfx", serializeWaterSettingsLegacy);
}

function applyWaterSettings(rawData) {
  updateStoreFromAppliedSettings("waterfx", normalizeAppliedSettings("waterfx", rawData, DEFAULT_WATER_SETTINGS));
  applySettingsByKey("waterfx", rawData, applyWaterSettingsLegacy);
}

function serializeInteractionSettings() {
  return serializeSettingsByKey("interaction", serializeInteractionSettingsLegacy);
}

function applyInteractionSettings(rawData) {
  updateStoreFromAppliedSettings("interaction", normalizeAppliedSettings("interaction", rawData, DEFAULT_INTERACTION_SETTINGS));
  applySettingsByKey("interaction", rawData, applyInteractionSettingsLegacy);
}

function serializeSwarmData() {
  return serializeSettingsByKey("swarm", serializeSwarmDataLegacy);
}

function applySwarmSettings(rawData) {
  updateStoreFromAppliedSettings("swarm", normalizeAppliedSettings("swarm", rawData, DEFAULT_SWARM_SETTINGS));
  applySwarmSettingsLegacy(rawData);
  syncSwarmRuntimeStateToStore();
}

function getSettingsDefaults(key, fallback) {
  if (!runtimeCore.settingsRegistry.has(key)) {
    return fallback;
  }
  return runtimeCore.settingsRegistry.getDefaults(key) || fallback;
}

function setCurrentMapFolderPath(nextPath) {
  currentMapFolderPath = normalizeMapFolderPath(nextPath);
  mapPathInput.value = currentMapFolderPath;
  syncMapStateToStore();
}

function applyDefaultMapSettings() {
  applyLightingSettings(getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS));
  applyParallaxSettings(getSettingsDefaults("parallax", DEFAULT_PARALLAX_SETTINGS));
  applyInteractionSettings(getSettingsDefaults("interaction", DEFAULT_INTERACTION_SETTINGS));
  applyFogSettings(getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS));
  applyCloudSettings(getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS));
  applyWaterSettings(getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS));
  applySwarmSettings(getSettingsDefaults("swarm", DEFAULT_SWARM_SETTINGS));
}

function resetMapRuntimeStateAfterImages() {
  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
  applyDefaultMapSettings();
  reseedSwarmAgents(getSwarmSettings().agentCount);
  requestOverlayDraw();
}

const mapDataSaveController = createMapDataSaveController({
  serializePointLights,
  serializeLightingSettings,
  serializeParallaxSettings,
  serializeInteractionSettings,
  serializeFogSettings,
  serializeCloudSettings,
  serializeWaterSettings,
  serializeSwarmData,
  serializeNpcState,
  normalizeMapFolderPath,
  getCurrentMapFolderPath: () => currentMapFolderPath,
  confirm: (text) => window.confirm(text),
  setStatus,
  tauriInvoke,
  isAbsoluteFsPath,
  pickMapFolderViaTauri,
  joinFsPath,
  invokeTauri,
  showDirectoryPicker:
    typeof window.showDirectoryPicker === "function" ? window.showDirectoryPicker.bind(window) : null,
});

function createMapDataFileTexts() {
  return mapDataSaveController.createMapDataFileTexts();
}

function downloadTextFile(fileName, text) {
  mapDataSaveController.downloadTextFile(fileName, text);
}

async function saveAllMapDataFiles() {
  await mapDataSaveController.saveAllMapDataFiles();
}

async function loadMapFromPath(mapFolderPath) {
  await mapLoader.loadMapFromPath(mapFolderPath);
}

async function loadMapFromFolderSelection(fileList) {
  await mapLoader.loadMapFromFolderSelection(fileList);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function clamp(v, min, max) {
  return clampUtil(v, min, max);
}

function clampRound(v, min, max, decimals = LIGHTING_SAVE_PRECISION) {
  return clampRoundUtil(v, min, max, decimals);
}

function lerp(a, b, t) {
  return lerpUtil(a, b, t);
}

function lerpVec3(a, b, t) {
  return lerpVec3Util(a, b, t);
}

function lerpAngleDeg(a, b, t) {
  return lerpAngleDegUtil(a, b, t);
}

function smoothstep(edge0, edge1, x) {
  return smoothstepUtil(edge0, edge1, x);
}

function wrapHour(hour) {
  return wrapHourUtil(hour);
}

function formatHour(hour) {
  return formatHourUtil(hour);
}

function setCycleHourSliderFromState() {
  getTimeUiRuntime().setCycleHourSliderFromState();
}

function sampleSunAtHour(hour) {
  return sampleSunAtHourModel(hour);
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

const DEFAULT_POINT_LIGHT_FLICKER = 0.7;
const DEFAULT_POINT_LIGHT_FLICKER_SPEED = 0.5;
const pointLights = [];
const pointLightEditorState = createPointLightEditorState({
  clamp,
  defaultFlicker: DEFAULT_POINT_LIGHT_FLICKER,
  defaultFlickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
});
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
const pointLightEditorController = createPointLightEditorController({
  pointLights,
  editorState: pointLightEditorState,
  selectRadiusPx: POINT_LIGHT_SELECT_RADIUS,
  defaultFlicker: DEFAULT_POINT_LIGHT_FLICKER,
  defaultFlickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
  nextLightId: () => nextPointLightId++,
  hexToRgb01,
  bakePointLightsTexture,
  schedulePointLightBake,
  isPointLightLiveUpdateEnabled,
  onSelectionChanged: updateLightEditorUi,
  setStatus,
});
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
const mapSidecarLoader = createMapSidecarLoader({
  tryLoadJsonFromUrl,
  applyLoadedPointLights,
  applyLightingSettings,
  applyParallaxSettings,
  applyInteractionSettings,
  applyFogSettings,
  applyCloudSettings,
  applyWaterSettings,
  applySwarmData,
  applyLoadedNpc,
  getFileFromFolderSelection,
  defaultPlayer: DEFAULT_PLAYER,
});
const mapLoader = createMapLoader({
  normalizeMapFolderPath,
  tauriInvoke,
  isAbsoluteFsPath,
  validateMapFolderViaTauri,
  joinFsPath,
  buildMapAssetPath,
  loadImageFromUrl,
  loadImageFromFile,
  applyMapImages,
  setCurrentMapFolderPath,
  resetMapRuntimeStateAfterImages,
  mapSidecarLoader,
  rebuildMovementField,
  setStatus,
  getFileFromFolderSelection,
});
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
const swarmRenderState = {
  prevX: new Float32Array(0),
  prevY: new Float32Array(0),
  prevZ: new Float32Array(0),
  prevHawkX: new Float32Array(0),
  prevHawkY: new Float32Array(0),
  prevHawkZ: new Float32Array(0),
  alpha: 1,
  hasPrev: false,
};
const swarmFollowAgentScratch = { x: 0, y: 0, z: 0 };
const swarmFollowHawkScratch = { x: 0, y: 0, z: 0 };
const swarmOverlayAgentScratch = { x: 0, y: 0, z: 0 };
const swarmOverlayHawkScratch = { x: 0, y: 0, z: 0 };
const swarmGizmoHawkScratch = { x: 0, y: 0, z: 0 };
const swarmLitAgentScratch = { x: 0, y: 0, z: 0 };
const swarmLitHawkScratch = { x: 0, y: 0, z: 0 };

function invalidateSwarmInterpolation() {
  swarmRenderState.hasPrev = false;
  swarmRenderState.alpha = 1;
}
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
const pointLightBakeCanvasRuntime = createPointLightBakeCanvasRuntime({
  getMapSize: () => splatSize,
  pointLightBakeCanvas,
  pointLightBakeCtx,
  pointLightBakeTempCanvas,
  pointLightBakeTempCtx,
  pointLightTex,
  uploadImageToTexture,
  requestOverlayDraw,
});
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
  isLiveUpdateEnabled: () => isPointLightLiveUpdateEnabled(),
  ensureBakeSize: ensurePointLightBakeSize,
  hasBakeInputs: () => Boolean(normalsImageData && heightImageData),
  bakeSync: (useReducedResolution) => bakePointLightsTextureSync(useReducedResolution),
  getFullBakeSize: () => ({ width: pointLightBakeCanvas.width, height: pointLightBakeCanvas.height }),
  getLights: () => pointLights,
  getHeightScaleValue: () => {
    const lightingSettings = getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS);
    return Math.max(1, Number(lightingSettings.heightScale) || 1);
  },
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
  return createFlatNormalImageRender(size);
}

function createFlatHeightImage(size = 2) {
  return createFlatHeightImageRender(size);
}

function createFlatSlopeImage(size = 2) {
  return createFlatSlopeImageRender(size);
}

function createFlatWaterImage(size = 2) {
  return createFlatWaterImageRender(size);
}

function createFallbackSplat(size = 512) {
  return createFallbackSplatRender(size);
}

function setSplatSizeFromImage(img) {
  return getMapImageRuntime().setSplatSizeFromImage(img);
}

function setHeightSizeFromImage(img) {
  getMapImageRuntime().setHeightSizeFromImage(img);
}

function setNormalsSizeFromImage(img) {
  getMapImageRuntime().setNormalsSizeFromImage(img);
}

function extractImageData(source) {
  return extractImageDataRender(source);
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
  return pointLightEditorController.getSelectedPointLight();
}

function clearLightEditSelection() {
  pointLightEditorController.clearLightEditSelection();
}

function setLightEditSelection(light) {
  pointLightEditorController.setLightEditSelection(light);
}

const pointLightIoController = createPointLightIoController({
  pointLights,
  splatSize,
  clamp,
  defaultFlicker: DEFAULT_POINT_LIGHT_FLICKER,
  defaultFlickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
  parsePointLightsPayload,
  serializePointLightsPayload,
  nextPointLightId: () => nextPointLightId++,
  clearLightEditSelection,
  bakePointLightsTexture,
  updateLightEditorUi,
  requestOverlayDraw,
  setStatus,
  tauriInvoke,
  isAbsoluteFsPath,
  joinFsPath,
  invokeTauri,
  showSaveFilePicker:
    typeof window.showSaveFilePicker === "function" ? window.showSaveFilePicker.bind(window) : null,
  normalizeMapFolderPath,
  downloadTextFile,
  getCurrentMapFolderPath: () => currentMapFolderPath,
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
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: (id) => window.clearTimeout(id),
});

function clearPointLights() {
  pointLightIoController.clearPointLights();
}

function resetPointLightsSaveConfirmation() {
  pointLightIoController.resetPointLightsSaveConfirmation();
}

function armPointLightsSaveConfirmation() {
  pointLightIoController.armPointLightsSaveConfirmation();
}

function serializePointLights() {
  return pointLightIoController.serializePointLights();
}

function applyLoadedPointLights(rawData, sourceLabel, options = {}) {
  return pointLightIoController.applyLoadedPointLights(rawData, sourceLabel, options);
}

async function savePointLightsJson() {
  await pointLightIoController.savePointLightsJson();
}

async function loadPointLightsFromAssetsOrPrompt() {
  await pointLightIoController.loadPointLightsFromAssetsOrPrompt();
}

function ensurePointLightBakeSize() {
  pointLightBakeCanvasRuntime.ensurePointLightBakeSize();
}

function normalize3(x, y, z) {
  return getMapSamplingRuntime().normalize3(x, y, z);
}

function sampleNormalAtMapPixel(pixelX, pixelY) {
  return getMapSamplingRuntime().sampleNormalAtMapPixel(pixelX, pixelY);
}

function sampleHeightAtMapPixel(pixelX, pixelY) {
  return getMapSamplingRuntime().sampleHeightAtMapPixel(pixelX, pixelY);
}

function sampleHeightAtMapCoord(mapX, mapY) {
  return getMapSamplingRuntime().sampleHeightAtMapCoord(mapX, mapY);
}

function computeSwarmDirectionalShadow(mapX, mapY, sourceHeight, lightDir, blockedShadowFactor) {
  return getShadowOcclusionRuntime().computeSwarmDirectionalShadow(mapX, mapY, sourceHeight, lightDir, blockedShadowFactor);
}

function hasLineOfSightToLight(surfaceX, surfaceY, surfaceH, lightX, lightY, lightH, heightScaleValue) {
  return getShadowOcclusionRuntime().hasLineOfSightToLight(
    surfaceX,
    surfaceY,
    surfaceH,
    lightX,
    lightY,
    lightH,
    heightScaleValue,
  );
}

function applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight) {
  pointLightBakeCanvasRuntime.applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight);
}

function schedulePointLightBake() {
  pointLightBakeOrchestrator.scheduleBake();
}

function bakePointLightsTexture() {
  pointLightBakeOrchestrator.bakeNow();
}

let pointLightBakeSyncRuntime = null;
function getPointLightBakeSyncRuntime() {
  if (pointLightBakeSyncRuntime) return pointLightBakeSyncRuntime;
  pointLightBakeSyncRuntime = createPointLightBakeSync({
    getFullBakeSize: () => ({ width: pointLightBakeCanvas.width, height: pointLightBakeCanvas.height }),
    pointLightBakeLiveScale: POINT_LIGHT_BAKE_LIVE_SCALE,
    getLightingSettings: () => getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS),
    getLights: () => pointLights,
    clamp,
    defaultPointLightFlicker: DEFAULT_POINT_LIGHT_FLICKER,
    defaultPointLightFlickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
    sampleHeightAtMapPixel,
    hasLineOfSightToLight,
    sampleNormalAtMapPixel,
    normalize3,
    pointLightBlendExposure: POINT_LIGHT_BLEND_EXPOSURE,
    applyPointLightBakeRgba,
  });
  return pointLightBakeSyncRuntime;
}

function bakePointLightsTextureSync(useReducedResolution = false) {
  getPointLightBakeSyncRuntime().bakePointLightsTextureSync(useReducedResolution);
}

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
  getCursorLightSnapshot,
  cursorLightStrengthValue,
  cursorLightHeightOffsetValue,
});

function updatePointLightStrengthLabel() {
  lightLabelRuntime.updatePointLightStrengthLabel();
}

function updatePointLightIntensityLabel() {
  lightLabelRuntime.updatePointLightIntensityLabel();
}

function updatePointLightHeightOffsetLabel() {
  lightLabelRuntime.updatePointLightHeightOffsetLabel();
}

function updatePointLightFlickerLabel() {
  lightLabelRuntime.updatePointLightFlickerLabel();
}

function updatePointLightFlickerSpeedLabel() {
  lightLabelRuntime.updatePointLightFlickerSpeedLabel();
}

function updateCursorLightStrengthLabel() {
  lightLabelRuntime.updateCursorLightStrengthLabel();
}

function updateCursorLightHeightOffsetLabel() {
  lightLabelRuntime.updateCursorLightHeightOffsetLabel();
}

function updateCursorLightModeUi() {
  const followTerrain = getCursorLightSnapshot().useTerrainHeight;
  cursorLightHeightOffsetInput.disabled = !followTerrain;
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

const modeCapabilitiesUi = createModeCapabilitiesUi({
  topicButtons,
  topicCards,
  topicPanelEl,
  topicPanelTitleEl,
  dockLightingModeToggle,
  dockPathfindingModeToggle,
  getRuntimeMode,
  canUseModeTopic,
  canUseModeInteraction,
  getInteractionModeSnapshot,
  setInteractionMode,
});

function setTopicPanelVisible(visible) {
  modeCapabilitiesUi.setTopicPanelVisible(visible);
}

function setActiveTopic(topicName) {
  if (topicName && !canUseTopicInCurrentMode(topicName)) {
    setStatus(`'${topicName}' panel is unavailable in ${getRuntimeMode()} mode.`);
    topicName = "";
  }
  modeCapabilitiesUi.setActiveTopic(topicName);
}

function updateModeCapabilitiesUi() {
  modeCapabilitiesUi.updateModeCapabilitiesUi();
}

function getInteractionModeSnapshot() {
  return resolveInteractionModeSnapshot({
    getCoreGameplay: () => runtimeCore.store.getState().gameplay || null,
  });
}

function updateCursorLightFromPointer(clientX, clientY) {
  if (!getCursorLightSnapshot().enabled) {
    clearCursorLightPointerState();
    return;
  }
  const ndc = clientToNdc(clientX, clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  const inside = uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1;
  if (!inside) {
    clearCursorLightPointerState();
    return;
  }
  setCursorLightPointerUv(uv.x, uv.y);
}

function updateLightEditorUi() {
  syncPointLightEditorUi({
    selectedLight: getSelectedPointLight(),
    lightEditDraft: pointLightEditorState.getDraft(),
    lightEditorEmptyEl,
    lightEditorFieldsEl,
    lightCoordEl,
    pointLightColorInput,
    pointLightStrengthInput,
    pointLightIntensityInput,
    pointLightHeightOffsetInput,
    pointLightFlickerInput,
    pointLightFlickerSpeedInput,
    rgbToHex,
    clamp,
    updatePointLightStrengthLabel,
    updatePointLightIntensityLabel,
    updatePointLightHeightOffsetLabel,
    updatePointLightFlickerLabel,
    updatePointLightFlickerSpeedLabel,
  });
}

function beginLightEdit(light) {
  pointLightEditorController.beginLightEdit(light);
}

function applyDraftToSelectedPointLight() {
  return pointLightEditorController.applyDraftToSelectedPointLight();
}

function rebakeIfPointLightLiveUpdateEnabled() {
  pointLightEditorController.rebakeIfPointLightLiveUpdateEnabled();
}

function findPointLightAtPixel(pixelX, pixelY, radiusPx = POINT_LIGHT_SELECT_RADIUS) {
  return pointLightEditorController.findPointLightAtPixel(pixelX, pixelY, radiusPx);
}

function createPointLight(pixelX, pixelY) {
  pointLightEditorController.createPointLight(pixelX, pixelY);
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

const zoomMin = 0.5;
const zoomMax = 32;
function applyRuntimeCameraPose() {}

let isMiddleDragging = false;
let lastDragClient = { x: 0, y: 0 };
let fogColorManual = false;
const interactionDefaults = DEFAULT_INTERACTION_SETTINGS;
const cursorLightRuntime = createCursorLightRuntimeState({
  clamp,
  hexToRgb01,
  defaults: {
    enabled: interactionDefaults.cursorLightEnabled,
    colorHex: interactionDefaults.cursorLightColor,
    strength: interactionDefaults.cursorLightStrength,
    heightOffset: interactionDefaults.cursorLightHeightOffset,
    useTerrainHeight: interactionDefaults.cursorLightFollowHeight,
    showGizmo: interactionDefaults.cursorLightGizmo,
  },
});
const cursorLightState = cursorLightRuntime.state;
const clearCursorLightPointerState = () => cursorLightRuntime.clearPointer();
const setCursorLightPointerUv = (uvX, uvY) => cursorLightRuntime.setPointerUv(uvX, uvY);
const applyCursorLightConfigSnapshot = (snapshot) => cursorLightRuntime.applyConfigSnapshot(snapshot);

const cycleState = {
  hour: 9.5,
};
let isCycleHourScrubbing = false;
let timeUiRuntime = null;
function getTimeUiRuntime() {
  if (timeUiRuntime) return timeUiRuntime;
  timeUiRuntime = createTimeUiRuntime({
    cycleHourInput,
    cycleHourValue,
    cycleState,
    clamp,
    formatHour,
  });
  return timeUiRuntime;
}

function getSimulationKnobSectionFromStore(key) {
  const knobs = runtimeCore.store.getState().simulation.knobs || {};
  return knobs && key in knobs ? knobs[key] : null;
}

function syncSwarmFollowToStore() {
  syncSwarmFollowToStoreState({
    store: runtimeCore.store,
    getSwarmRuntimeStateSnapshot,
  });
}

const swarmFollowStateController = createSwarmFollowStateController({
  swarmFollowState,
  swarmFollowTargetInput,
  resetSwarmFollowSpeedSmoothing,
  updateSwarmFollowButtonUi,
  syncSwarmFollowToStore,
});

function applySwarmFollowState(nextState, options = {}) {
  swarmFollowStateController.applySwarmFollowState(nextState, options);
}

function stopSwarmFollow(options = {}) {
  swarmFollowStateController.stopSwarmFollow(options);
}

const movementSystem = createMovementSystem({
  entityStore,
  playerState,
  getMapWidth: () => splatSize.width,
  getMapHeight: () => splatSize.height,
  computeMoveStepCost,
  rebuildMovementField,
  requestOverlayDraw,
  setStatus,
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
  setMovementSnapshot: (value) => {
    runtimeCore.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        movement: {
          ...(prev.gameplay && prev.gameplay.movement ? prev.gameplay.movement : {}),
          ...value,
        },
      },
    }));
  },
});
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
const uploadUniforms = createTerrainUniformUploader({
  gl,
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
  canvas,
  getViewHalfExtents,
  cursorLightState,
  applyPointLightUsagePass,
});
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
    getBlurRadiusPx: () => {
      const lightingSettings = getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS);
      return clamp(Number(lightingSettings.shadowBlur), 0, 3);
    },
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
  applyCameraPose: applyRuntimeCameraPose,
  getInteractionMode: () => getInteractionModeSnapshot(),
  setMiddleDragging: (value) => {
    isMiddleDragging = value;
  },
  setCycleHourScrubbing: (value) => {
    isCycleHourScrubbing = value;
  },
  clamp,
  clientToNdc,
  worldFromNdc,
  getCursorLightSnapshot,
  applyCursorLightConfigSnapshot,
  clearCursorLightPointerState,
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
  syncPlayerStateToStore,
  replaceMovementQueue: (pathPixels) => {
    const simTickHours = normalizeSimTickHours(
      runtimeCore.store.getState().systems.time.simTickHours ?? getConfiguredSimTickHours(),
    );
    return movementSystem.replaceQueue(pathPixels, simTickHours);
  },
  cancelMovementQueue: () => {
    movementSystem.cancelQueue();
  },
  getMovementStateSnapshot: () => movementSystem.getSnapshot(),
  rebuildMovementField,
  getPathfindingStateSnapshot,
  pathfindingRangeInput,
  pathWeightSlopeInput,
  pathWeightHeightInput,
  pathWeightWaterInput,
  pathSlopeCutoffInput,
  pathBaseCostInput,
  pointLightLiveUpdateToggle,
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
  serializeLightingSettings,
  serializeParallaxSettings,
  serializeFogSettings,
  serializeCloudSettings,
  serializeWaterSettings,
  updateSwarmUi: () => updateSwarmUi(),
  updateSwarmLabels: () => updateSwarmLabels(),
  updateSwarmStatsPanel: () => updateSwarmStatsPanel(),
  applySwarmFollowState,
  stopSwarmFollow,
  syncSwarmFollowToStore,
  swarmFollowZoomInInput,
  swarmFollowZoomOutInput,
  swarmFollowAgentSpeedSmoothingInput,
  swarmFollowAgentZoomSmoothingInput,
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
  swarmCursorStrengthInput,
  swarmCursorRadiusInput,
  swarmHawkCountInput,
  swarmHawkSpeedInput,
  swarmHawkSteeringInput,
  swarmHawkTargetRangeInput,
  normalizeSwarmFollowZoomInputs: (...args) => normalizeSwarmFollowZoomInputs(...args),
  normalizeSwarmHeightRangeInputs: (...args) => normalizeSwarmHeightRangeInputs(...args),
  reseedSwarmAgents: (...args) => reseedSwarmAgents(...args),
  swarmAgentCountInput,
  swarmEnabledToggle,
  swarmCursorState,
  isSwarmEnabled,
  getSwarmSettings,
  resetSwarmFollowSpeedSmoothing,
  updateSwarmFollowButtonUi: () => updateSwarmFollowButtonUi(),
  chooseRandomFollowHawkIndex: (...args) => chooseRandomFollowHawkIndex(...args),
  chooseRandomFollowAgentIndex: (...args) => chooseRandomFollowAgentIndex(...args),
  simTickHoursInput,
  updateSimTickLabel,
  swarmTimeRoutingInput,
  cloudTimeRoutingInput,
  waterTimeRoutingInput,
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
    cycleState,
    isCycleHourScrubbing: () => isCycleHourScrubbing,
    setCycleHourSliderFromState,
    setTimeState: () => {},
    updateStoreTime: (value) => {
      runtimeCore.store.update((prev) => ({
        ...prev,
        clock: {
          ...prev.clock,
          nowSec: Math.max(0, Number(value.nowSec) || 0),
          timeScale: clamp(Number(value.cycleSpeedHoursPerSec), 0, 1),
        },
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            ...value,
          },
        },
        ui: {
          ...prev.ui,
          cycleHour: cycleState.hour,
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

runtimeCore.scheduler.addSystem(movementSystem);

runtimeCore.scheduler.initAll({ nowMs: 0, dtSec: 0 }, runtimeCore.store.getState());
syncMapStateToStore();
syncPlayerStateToStore();
syncSwarmRuntimeStateToStore();
syncPointLightsStateToStore();

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
  return resolveSwarmCursorMode({
    getCoreSwarm: () => runtimeCore.store.getState().gameplay.swarm || null,
    getSettingsDefaults,
    defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
  });
}

function getSwarmSettings() {
  return resolveSwarmSettings({
    getCoreSwarm: () => runtimeCore.store.getState().gameplay.swarm || {},
    getSettingsDefaults,
    defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
    clamp,
    swarmZMax: SWARM_Z_MAX,
    zoomMin,
    zoomMax,
    normalizeRoutingMode,
  });
}

function getPathfindingStateSnapshot() {
  return resolvePathfindingStateSnapshot({
    getCorePathfinding: () => runtimeCore.store.getState().gameplay.pathfinding || {},
    clamp,
  });
}

function getSwarmRuntimeStateSnapshot() {
  return buildSwarmRuntimeStateSnapshot({
    isSwarmEnabled,
    swarmState,
    swarmFollowState,
  });
}

function syncSwarmRuntimeStateToStore() {
  syncSwarmRuntimeStateToStoreState({
    store: runtimeCore.store,
    getSwarmRuntimeStateSnapshot,
  });
}

function syncMapStateToStore() {
  syncMapState({
    store: runtimeCore.store,
    currentMapFolderPath,
    splatSize,
  });
}

function syncPlayerStateToStore() {
  syncPlayerState({
    store: runtimeCore.store,
    playerState,
  });
}

function syncPointLightsStateToStore(nextLiveUpdate = null) {
  syncPointLightsState({
    store: runtimeCore.store,
    isPointLightLiveUpdateEnabled,
    nextLiveUpdate,
  });
}

function getCursorLightSnapshot() {
  return buildCursorLightSnapshot({
    getCoreCursorLight: () => runtimeCore.store.getState().gameplay.cursorLight || null,
    cursorLightState,
    clamp,
  });
}

function isPointLightLiveUpdateEnabled() {
  return getPointLightLiveUpdateEnabled({
    getCorePointLights: () => runtimeCore.store.getState().gameplay.pointLights || null,
  });
}

function setSwarmDefaults() {
  applySwarmDefaults({
    updateStoreFromAppliedSettings,
    normalizeAppliedSettings,
    defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
    applySwarmSettingsLegacy,
    stopSwarmFollow,
    swarmState,
  });
}

function isSwarmEnabled() {
  return resolveSwarmEnabled({ getSwarmSettings });
}

const swarmInputNormalization = createSwarmInputNormalization({
  clamp,
  swarmMinHeightInput,
  swarmMaxHeightInput,
  swarmFollowZoomInInput,
  swarmFollowZoomOutInput,
  swarmHeightMax: SWARM_Z_MAX,
  zoomMin,
  zoomMax,
});
const normalizeSwarmHeightRangeInputs = swarmInputNormalization.normalizeSwarmHeightRangeInputs;
const normalizeSwarmFollowZoomInputs = swarmInputNormalization.normalizeSwarmFollowZoomInputs;
const swarmPanelUi = createSwarmPanelUi({
  getSwarmSettings,
  swarmState,
  swarmFollowState,
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
  swarmShowTerrainToggle,
  swarmLitModeToggle,
  swarmFollowTargetInput,
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
});
const updateSwarmLabels = swarmPanelUi.updateSwarmLabels;
const updateSwarmUi = swarmPanelUi.updateSwarmUi;
const updateSwarmStatsPanel = swarmPanelUi.updateSwarmStatsPanel;
const updateSwarmFollowButtonUi = swarmPanelUi.updateSwarmFollowButtonUi;
const applySwarmSettingsLegacyImpl = createSwarmSettingsApplier({
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
  syncSwarmFollowToStore,
});

function resetSwarmFollowSpeedSmoothing() {
  swarmFollowState.speedNormFiltered = null;
}

const swarmEnvironment = createSwarmEnvironment({
  sampleHeightAtMapPixel,
  getGrayAt,
  waterImageData,
  swarmHeightMax: SWARM_Z_MAX,
  terrainClearance: SWARM_TERRAIN_CLEARANCE,
});
const terrainFloorAtSwarmCoord = swarmEnvironment.terrainFloorAtSwarmCoord;
const isWaterAtSwarmCoord = swarmEnvironment.isWaterAtSwarmCoord;
const isSwarmCoordFlyable = swarmEnvironment.isSwarmCoordFlyable;
const swarmTargeting = createSwarmTargeting({
  swarmState,
  splatSize,
  terrainFloorAtSwarmCoord,
  clamp,
});
const chooseRandomSwarmTargetIndexNear = swarmTargeting.chooseRandomSwarmTargetIndexNear;
const chooseRandomFollowAgentIndex = swarmTargeting.chooseRandomFollowAgentIndex;
const chooseRandomFollowHawkIndex = swarmTargeting.chooseRandomFollowHawkIndex;
const swarmAgentStateMutator = createSwarmAgentStateMutator({
  swarmState,
  swarmFollowState,
  invalidateSwarmInterpolation,
  getSwarmSettings,
  chooseRandomSwarmTargetIndexNear,
  chooseRandomFollowAgentIndex,
  stopSwarmFollow,
  clamp,
  splatSize,
  isSwarmCoordFlyable,
  isWaterAtSwarmCoord,
  terrainFloorAtSwarmCoord,
});
const ensureSwarmBuffers = swarmAgentStateMutator.ensureSwarmBuffers;

const reseedSwarmAgents = createSwarmReseeder({
  getSwarmSettings,
  invalidateSwarmInterpolation,
  ensureSwarmBuffers: swarmAgentStateMutator.ensureSwarmBuffers,
  splatSize,
  isSwarmCoordFlyable,
  terrainFloorAtSwarmCoord,
  clamp,
  swarmState,
  swarmFollowState,
  chooseRandomFollowAgentIndex,
  createSpawnedHawk: swarmTargeting.createSpawnedHawk,
  requestOverlayDraw,
});
const applySwarmDataImpl = createSwarmDataApplier({
  applySwarmSettings,
  getSwarmSettings,
  swarmState,
  clamp,
  ensureSwarmBuffers: swarmAgentStateMutator.ensureSwarmBuffers,
  splatSize,
  isSwarmCoordFlyable,
  terrainFloorAtSwarmCoord,
  chooseRandomSwarmTargetIndexNear,
  reseedSwarmAgents,
  applySwarmFollowState,
  invalidateSwarmInterpolation,
  syncSwarmRuntimeStateToStore,
  requestOverlayDraw,
});
const serializeSwarmDataImpl = createSwarmDataSerializer({
  getSwarmSettings,
  swarmFollowState,
  swarmState,
});
const serializeInteractionSettingsImpl = createInteractionDataSerializer({
  getPathfindingStateSnapshot,
  getCursorLightSnapshot,
  getPointLightsState: () => runtimeCore.store.getState().gameplay.pointLights,
  clamp,
});
const applyInteractionSettingsLegacyImpl = createInteractionSettingsApplier({
  getPathfindingStateSnapshot,
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
  getCursorLightSnapshot,
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
});
const applyLightingSettingsLegacyImpl = createLightingSettingsApplier({
  getCoreState: () => runtimeCore.store.getState(),
  getLightingSettings: () => getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS),
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
  clamp,
  normalizeSimTickHours,
  updateVolumetricLabels,
  updateVolumetricUi,
  updateShadowBlurLabel,
  updatePointFlickerLabels,
  updatePointFlickerUi,
  updateSimTickLabel,
  setCycleHourSliderFromState,
  updateCycleHourLabel,
  schedulePointLightBake,
});
const renderFxSettingsApplier = createRenderFxSettingsApplier({
  getFogSettings: () => getSimulationKnobSectionFromStore("fog") || getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS),
  getParallaxSettings: () => getSimulationKnobSectionFromStore("parallax") || getSettingsDefaults("parallax", DEFAULT_PARALLAX_SETTINGS),
  getCloudSettings: () => getSimulationKnobSectionFromStore("clouds") || getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS),
  getWaterSettings: () => getSimulationKnobSectionFromStore("waterFx") || getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS),
  getTimeState: () => runtimeCore.store.getState().systems.time || {},
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
  normalizeRoutingMode,
  rgbToHex,
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
});
const applyFogSettingsLegacyImpl = renderFxSettingsApplier.applyFogSettingsLegacy;
const applyParallaxSettingsLegacyImpl = renderFxSettingsApplier.applyParallaxSettingsLegacy;
const applyCloudSettingsLegacyImpl = renderFxSettingsApplier.applyCloudSettingsLegacy;
const applyWaterSettingsLegacyImpl = renderFxSettingsApplier.applyWaterSettingsLegacy;
const renderFxDataSerializer = createRenderFxDataSerializer({
  getCoreState: () => runtimeCore.store.getState(),
  getLightingSettings: () => getSimulationKnobSectionFromStore("lighting") || getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS),
  getFogSettings: () => getSimulationKnobSectionFromStore("fog") || getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS),
  getParallaxSettings: () => getSimulationKnobSectionFromStore("parallax") || getSettingsDefaults("parallax", DEFAULT_PARALLAX_SETTINGS),
  getCloudSettings: () => getSimulationKnobSectionFromStore("clouds") || getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS),
  getWaterSettings: () => getSimulationKnobSectionFromStore("waterFx") || getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS),
  getTimeState: () => runtimeCore.store.getState().systems.time || {},
  cycleState,
  getConfiguredSimTickHours,
  clamp,
  clampRound,
  normalizeRoutingMode,
  rgbToHex,
});
const serializeLightingSettingsLegacyImpl = renderFxDataSerializer.serializeLightingSettingsLegacy;
const serializeFogSettingsLegacyImpl = renderFxDataSerializer.serializeFogSettingsLegacy;
const serializeParallaxSettingsLegacyImpl = renderFxDataSerializer.serializeParallaxSettingsLegacy;
const serializeCloudSettingsLegacyImpl = renderFxDataSerializer.serializeCloudSettingsLegacy;
const serializeWaterSettingsLegacyImpl = renderFxDataSerializer.serializeWaterSettingsLegacy;
const npcPersistence = createNpcPersistence({
  playerState,
  defaultPlayer: DEFAULT_PLAYER,
  clamp,
  splatSize,
  setPlayerPosition,
  syncPlayerStateToStore,
});
const serializeNpcStateImpl = npcPersistence.serializeNpcState;
const parseNpcPlayerImpl = npcPersistence.parseNpcPlayer;
const applyLoadedNpcImpl = npcPersistence.applyLoadedNpc;
const updateInfoPanelImpl = createInfoPanelRuntime({
  isSwarmEnabled,
  getSwarmCursorMode,
  swarmState,
  swarmCursorState,
  playerState,
  getCurrentPathMetrics,
  getMovementSnapshot: () => (typeof movementSystem.getSnapshot === "function" ? movementSystem.getSnapshot() : null),
  playerInfoEl,
  pathInfoEl,
});

const stepSwarm = createSwarmStepFunction({
  splatSize,
  swarmState,
  clamp,
  swarmCursorState,
  swarmZNeighborScale: SWARM_Z_NEIGHBOR_SCALE,
  isWaterAtSwarmCoord,
  terrainFloorAtSwarmCoord,
  isSwarmCoordFlyable,
  spawnRestingBirdNear: swarmAgentStateMutator.spawnRestingBirdNear,
  removeSwarmAgentAtIndex: swarmAgentStateMutator.removeSwarmAgentAtIndex,
  chooseRandomSwarmTargetIndexNear,
});

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

const swarmInterpolation = createSwarmInterpolation({
  swarmState,
  swarmRenderState,
  clamp,
});
const writeInterpolatedSwarmAgentPos = swarmInterpolation.writeInterpolatedAgentPos;
const writeInterpolatedSwarmHawkPos = swarmInterpolation.writeInterpolatedHawkPos;

const updateSwarm = createSwarmUpdateLoop({
  swarmRenderState,
  clamp,
  isSwarmEnabled,
  getSwarmSettings,
  swarmState,
  captureSwarmRenderPreviousState: swarmInterpolation.capturePreviousState,
  stepSwarm,
  syncSwarmRuntimeStateToStore,
});

const updateSwarmFollowCamera = createSwarmFollowCameraUpdater({
  swarmFollowState,
  swarmState,
  isSwarmEnabled,
  stopSwarmFollow,
  getSwarmSettings,
  chooseRandomFollowHawkIndex,
  chooseRandomFollowAgentIndex,
  writeInterpolatedSwarmHawkPos: swarmInterpolation.writeInterpolatedHawkPos,
  writeInterpolatedSwarmAgentPos: swarmInterpolation.writeInterpolatedAgentPos,
  swarmFollowHawkScratch,
  swarmFollowAgentScratch,
  mapCoordToWorld,
  clamp,
  zoomMin,
  zoomMax,
  getZoom: () => getActiveCameraState().zoom,
  dispatchCoreCommand,
});

function drawSwarmUnlitOverlay(settings) {
  const tintAlpha = settings.showTerrainInSwarm ? 0.55 : 0.95;
  const agentPos = swarmOverlayAgentScratch;
  for (let i = 0; i < swarmState.count; i++) {
    writeInterpolatedSwarmAgentPos(i, agentPos);
    const mapX = agentPos.x;
    const mapY = agentPos.y;
    const centerWorld = mapCoordToWorld(mapX, mapY);
    const rightWorld = mapCoordToWorld(mapX + 1, mapY);
    const downWorld = mapCoordToWorld(mapX, mapY + 1);
    const center = worldToScreen(centerWorld);
    const right = worldToScreen(rightWorld);
    const down = worldToScreen(downWorld);
    const texelW = Math.max(0.25, Math.abs(right.x - center.x));
    const texelH = Math.max(0.25, Math.abs(down.y - center.y));
    const z = clamp(agentPos.z / SWARM_Z_MAX, 0, 1);
    const lum = Math.round((0.28 + z * 0.72) * 255);
    overlayCtx.fillStyle = `rgba(${lum}, ${lum}, ${lum}, ${tintAlpha})`;
    overlayCtx.fillRect(center.x - texelW * 0.5, center.y - texelH * 0.5, texelW, texelH);
  }

  if (settings.useHawk && swarmState.hawks.length > 0) {
    const hawk0 = writeInterpolatedSwarmHawkPos(0, swarmOverlayHawkScratch);
    const hawkCenterWorld = mapCoordToWorld(hawk0.x, hawk0.y);
    const hawkRightWorld = mapCoordToWorld(hawk0.x + 1, hawk0.y);
    const hawkDownWorld = mapCoordToWorld(hawk0.x, hawk0.y + 1);
    const hawkCenter = worldToScreen(hawkCenterWorld);
    const hawkRight = worldToScreen(hawkRightWorld);
    const hawkDown = worldToScreen(hawkDownWorld);
    const w = Math.max(0.25, Math.abs(hawkRight.x - hawkCenter.x));
    const h = Math.max(0.25, Math.abs(hawkDown.y - hawkCenter.y));
    const hawkRgb = hexToRgb01(settings.hawkColor).map((v) => Math.round(clamp(v, 0, 1) * 255));
    const hawkAlpha = settings.showTerrainInSwarm ? 0.85 : 1.0;
    overlayCtx.fillStyle = `rgba(${hawkRgb[0]}, ${hawkRgb[1]}, ${hawkRgb[2]}, ${hawkAlpha})`;
    for (let i = 0; i < swarmState.hawks.length; i++) {
      const hawk = writeInterpolatedSwarmHawkPos(i, swarmOverlayHawkScratch);
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
      const hawk = writeInterpolatedSwarmHawkPos(followHawkIndex, swarmGizmoHawkScratch);
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

const renderSwarmLit = createSwarmLitRenderer({
  swarmState,
  clamp,
  writeInterpolatedSwarmAgentPos: swarmInterpolation.writeInterpolatedAgentPos,
  writeInterpolatedSwarmHawkPos: swarmInterpolation.writeInterpolatedHawkPos,
  swarmLitAgentScratch,
  swarmLitHawkScratch,
  computeSwarmDirectionalShadow,
  getViewHalfExtents,
  getMapAspect,
  hexToRgb01,
  gl,
  swarmProgram,
  swarmUniforms,
  normalsTex,
  heightTex,
  pointLightTex,
  cloudNoiseTex,
  heightSize,
  splatSize,
  canvas,
  swarmHeightMax: SWARM_Z_MAX,
  pointLightEdgeMin: SWARM_POINT_LIGHT_EDGE_MIN,
  swarmPointVao,
  swarmPointBuffer,
});

function getBaseViewHalfExtents() {
  return getBaseViewHalfExtentsTransform({
    getScreenAspect,
    getMapAspect,
  });
}

function getActiveCameraState() {
  return getActiveCameraStateTransform({
    getCameraState: () => runtimeCore.store.getState().camera || {},
  });
}

function getViewHalfExtents(zoomValue = null) {
  return getViewHalfExtentsTransform({
    zoomValue,
    getActiveCameraState,
    getBaseViewHalfExtents,
  });
}

function clientToNdc(clientX, clientY) {
  return clientToNdcTransform({
    clientX,
    clientY,
    getCanvasRect: () => canvas.getBoundingClientRect(),
  });
}

function worldFromNdc(ndc, zoomValue = null, pan = null) {
  return worldFromNdcTransform({
    ndc,
    zoomValue,
    pan,
    getActiveCameraState,
    getViewHalfExtents,
  });
}

function worldToUv(world) {
  return worldToUvTransform({
    world,
    getMapAspect,
  });
}

function uvToMapPixelIndex(uv) {
  return uvToMapPixelIndexTransform({
    uv,
    clamp,
    splatSize,
  });
}

function mapPixelIndexToUv(pixelX, pixelY) {
  return mapPixelIndexToUvTransform({
    pixelX,
    pixelY,
    splatSize,
  });
}

function mapPixelToWorld(pixelX, pixelY) {
  return mapPixelToWorldTransform({
    pixelX,
    pixelY,
    mapPixelIndexToUv,
    getMapAspect,
  });
}

function mapCoordToWorld(mapX, mapY) {
  return mapCoordToWorldTransform({
    mapX,
    mapY,
    splatSize,
    getMapAspect,
  });
}

function worldToScreen(world) {
  return worldToScreenTransform({
    world,
    getActiveCameraState,
    getViewHalfExtents,
    overlayCanvas,
  });
}

function updatePathfindingRangeLabel() {
  pathfindingLabelUi.updatePathfindingRangeLabel({
    getPathfindingStateSnapshot,
    pathfindingRangeValue,
  });
}

function updatePathWeightLabels() {
  pathfindingLabelUi.updatePathWeightLabels({
    getPathfindingStateSnapshot,
    pathWeightSlopeValue,
    pathWeightHeightValue,
    pathWeightWaterValue,
  });
}

function updatePathSlopeCutoffLabel() {
  pathfindingLabelUi.updatePathSlopeCutoffLabel({
    getPathfindingStateSnapshot,
    pathSlopeCutoffValue,
  });
}

function updatePathBaseCostLabel() {
  pathfindingLabelUi.updatePathBaseCostLabel({
    getPathfindingStateSnapshot,
    pathBaseCostValue,
  });
}

function setInteractionMode(mode) {
  applyInteractionMode({
    canUseInteractionInCurrentMode,
    dockLightingModeToggle,
    dockPathfindingModeToggle,
    movePreviewState,
    store: runtimeCore.store,
    requestOverlayDraw,
  }, mode);
}

function setPlayerPosition(pixelX, pixelY) {
  playerState.pixelX = clamp(Math.round(Number(pixelX)), 0, Math.max(0, splatSize.width - 1));
  playerState.pixelY = clamp(Math.round(Number(pixelY)), 0, Math.max(0, splatSize.height - 1));
}

function parseNpcPlayer(rawData) {
  return parseNpcPlayerImpl(rawData);
}

function applyLoadedNpc(rawData) {
  applyLoadedNpcImpl(rawData);
}

const pathfindingCostModel = createPathfindingCostModel({
  clamp,
  playerState,
  getMapSize: () => splatSize,
  getPathfindingStateSnapshot,
  getSlopeImageData: () => slopeImageData,
  getHeightImageData: () => heightImageData,
  getWaterImageData: () => waterImageData,
});

function getGrayAt(imageData, x, y, sourceWidth = splatSize.width, sourceHeight = splatSize.height) {
  return pathfindingCostModel.getGrayAt(imageData, x, y, sourceWidth, sourceHeight);
}

function movementWindowBounds() {
  return pathfindingCostModel.movementWindowBounds();
}

function computeMoveStepCost(fromX, fromY, toX, toY) {
  return pathfindingCostModel.computeMoveStepCost(fromX, fromY, toX, toY);
}

const pathfindingPreviewRuntime = createPathfindingPreviewRuntime({
  movementWindowBounds,
  computeMoveStepCost,
  playerState,
  getMovementField: () => movementField,
  setMovementField: (value) => {
    movementField = value;
  },
  movePreviewState,
  getInteractionModeSnapshot,
  requestOverlayDraw,
  clientToNdc,
  worldFromNdc,
  worldToUv,
  uvToMapPixelIndex,
});

function rebuildMovementField() {
  pathfindingPreviewRuntime.rebuildMovementField();
}

function extractPathTo(pixelX, pixelY) {
  return pathfindingPreviewRuntime.extractPathTo(pixelX, pixelY);
}

function refreshPathPreview() {
  pathfindingPreviewRuntime.refreshPathPreview();
}

function updatePathPreviewFromPointer(clientX, clientY) {
  pathfindingPreviewRuntime.updatePathPreviewFromPointer(clientX, clientY);
}

function getCurrentPathMetrics() {
  return pathfindingPreviewRuntime.getCurrentPathMetrics();
}

function updateInfoPanel() {
  updateInfoPanelImpl();
}

function updateParallaxStrengthLabel() {
  renderFxUiRuntime.updateParallaxStrengthLabel({
    clamp,
    serializeParallaxSettings,
    parallaxStrengthValue,
  });
}

function updateParallaxBandsLabel() {
  renderFxUiRuntime.updateParallaxBandsLabel({
    clamp,
    serializeParallaxSettings,
    parallaxBandsValue,
  });
}

function updateShadowBlurLabel() {
  renderFxUiRuntime.updateShadowBlurLabel({
    clamp,
    serializeLightingSettings,
    shadowBlurValue,
  });
}

function updateSimTickLabel() {
  renderFxUiRuntime.updateSimTickLabel({
    normalizeSimTickHours,
    serializeLightingSettings,
    simTickHoursValue,
  });
}

function updateFogAlphaLabels() {
  renderFxUiRuntime.updateFogAlphaLabels({
    clamp,
    serializeFogSettings,
    fogMinAlphaValue,
    fogMaxAlphaValue,
  });
}

function updateFogFalloffLabel() {
  renderFxUiRuntime.updateFogFalloffLabel({
    clamp,
    serializeFogSettings,
    fogFalloffValue,
  });
}

function updateFogStartOffsetLabel() {
  renderFxUiRuntime.updateFogStartOffsetLabel({
    clamp,
    serializeFogSettings,
    fogStartOffsetValue,
  });
}

function updatePointFlickerLabels() {
  renderFxUiRuntime.updatePointFlickerLabels({
    clamp,
    serializeLightingSettings,
    pointFlickerStrengthValue,
    pointFlickerSpeedValue,
    pointFlickerSpatialValue,
  });
}

function updatePointFlickerUi() {
  renderFxUiRuntime.updatePointFlickerUi({
    pointFlickerStrengthInput,
    pointFlickerSpeedInput,
    pointFlickerSpatialInput,
  });
}

function updateVolumetricLabels() {
  renderFxUiRuntime.updateVolumetricLabels({
    clamp,
    serializeLightingSettings,
    volumetricStrengthValue,
    volumetricDensityValue,
    volumetricAnisotropyValue,
    volumetricLengthValue,
    volumetricSamplesValue,
  });
}

function updateVolumetricUi() {
  renderFxUiRuntime.updateVolumetricUi({
    volumetricStrengthInput,
    volumetricDensityInput,
    volumetricAnisotropyInput,
    volumetricLengthInput,
    volumetricSamplesInput,
  });
}

function updateCloudLabels() {
  renderFxUiRuntime.updateCloudLabels({
    clamp,
    serializeCloudSettings,
    cloudCoverageValue,
    cloudSoftnessValue,
    cloudOpacityValue,
    cloudScaleValue,
    cloudSpeed1Value,
    cloudSpeed2Value,
    cloudSunParallaxValue,
  });
}

function updateWaterLabels() {
  renderFxUiRuntime.updateWaterLabels({
    clamp,
    serializeWaterSettings,
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
  });
}

function updateParallaxUi() {
  renderFxUiRuntime.updateParallaxUi({
    parallaxStrengthInput,
    parallaxBandsInput,
  });
}

function updateFogUi() {
  renderFxUiRuntime.updateFogUi({
    fogColorInput,
    fogMinAlphaInput,
    fogMaxAlphaInput,
    fogFalloffInput,
    fogStartOffsetInput,
  });
}

function updateCloudUi() {
  renderFxUiRuntime.updateCloudUi({
    cloudCoverageInput,
    cloudSoftnessInput,
    cloudOpacityInput,
    cloudScaleInput,
    cloudSpeed1Input,
    cloudSpeed2Input,
    cloudSunParallaxInput,
    cloudSunProjectToggle,
  });
}

function updateWaterUi() {
  renderFxUiRuntime.updateWaterUi({
    serializeWaterSettings,
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
  });
}

function updateCycleHourLabel() {
  getTimeUiRuntime().updateCycleHourLabel();
}

function requestOverlayDraw() {
  overlayDirty = true;
}

const overlayHooks = createOverlayHooks({
  updateSwarm,
  updateSwarmFollowCamera,
  drawOverlay: (...args) => drawOverlay(...args),
  shouldAnimateOverlay: () => {
    if (!isSwarmEnabled()) {
      return false;
    }
    const settings = getSwarmSettings();
    if (!settings.useLitSwarm) {
      return true;
    }
    return Boolean(
      (swarmCursorState.active && settings.cursorMode !== "none")
      || (settings.followHawkRangeGizmo
        && swarmFollowState.enabled
        && swarmFollowState.targetType === "hawk")
    );
  },
  isOverlayDirty: () => overlayDirty,
  clearOverlayDirty: () => {
    overlayDirty = false;
  },
});

function rgbToHex(rgb) {
  return rgbToHexUtil(rgb, clamp);
}

function hexToRgb01(hex) {
  return hexToRgb01Util(hex);
}

const drawOverlay = createOverlayDrawer({
  overlayCtx,
  overlayCanvas,
  getMapAspect,
  splatSize,
  getInteractionMode: () => getInteractionModeSnapshot(),
  getLightEditDraft: () => pointLightEditorState.getDraft(),
  getPointLights: () => pointLights,
  isPointLightSelected: (light) => pointLightEditorState.isSelectedLight(light),
  mapPixelToWorld,
  worldToScreen,
  clamp,
  getCursorLightSnapshot,
  cursorLightState,
  movePreviewState,
  playerState,
  isSwarmEnabled,
  getSwarmSettings,
  drawSwarmUnlitOverlay,
  drawSwarmGizmos,
});

bindCanvasControls({
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
  swarmTimeRoutingInput,
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
  cycleSpeedInput,
  cycleHourInput,
  simTickHoursInput,
  dispatchCoreCommand,
  getInteractionMode: () => getInteractionModeSnapshot(),
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
  hasLightEditDraft: () => pointLightEditorState.hasDraft(),
  setLightEditDraftColor: (value) => pointLightEditorState.setDraftColor(value),
  setLightEditDraftStrength: (value) => pointLightEditorState.setDraftStrength(value),
  setLightEditDraftIntensity: (value) => pointLightEditorState.setDraftIntensity(value),
  setLightEditDraftHeightOffset: (value) => pointLightEditorState.setDraftHeightOffset(value),
  setLightEditDraftFlicker: (value) => pointLightEditorState.setDraftFlicker(value),
  setLightEditDraftFlickerSpeed: (value) => pointLightEditorState.setDraftFlickerSpeed(value),
  updatePointLightStrengthLabel,
  updatePointLightIntensityLabel,
  updatePointLightHeightOffsetLabel,
  updatePointLightFlickerLabel,
  updatePointLightFlickerSpeedLabel,
  rebakeIfPointLightLiveUpdateEnabled,
  requestOverlayDraw,
  applyDraftToSelectedPointLight,
  bakePointLightsTexture,
  dispatchCoreCommand,
  syncPointLightsStateToStore,
  updateLightEditorUi,
  getSelectedPointLight,
  deletePointLightById: (id) => {
    pointLightEditorController.deletePointLightById(id);
  },
  clearLightEditSelection,
  isPointLightsSaveConfirmArmed: () => pointLightIoController.isPointLightsSaveConfirmArmed(),
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

function computeLightingParams(coreState = null) {
  const simulation = coreState && coreState.simulation ? coreState.simulation : null;
  const knobs = simulation && simulation.knobs ? simulation.knobs : null;
  const coreCamera = coreState && coreState.camera ? coreState.camera : null;
  const cameraZoom = coreCamera && Number.isFinite(Number(coreCamera.zoom)) ? Number(coreCamera.zoom) : 1;
  const lightingSettings = knobs && knobs.lighting ? knobs.lighting : getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS);
  const fogSettings = knobs && knobs.fog ? knobs.fog : getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS);
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

  const ambientBase = clamp(Number(lightingSettings.ambient), 0, 1);
  const diffuseBase = clamp(Number(lightingSettings.diffuse), 0, 2);
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
  const zoomNorm = clamp((cameraZoom - zoomMin) / (zoomMax - zoomMin), 0, 1);
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
  const resolvedFogColorManual = fogSettings ? Boolean(fogSettings.fogColorManual) : fogColorManual;
  const autoFogHex = rgbToHex(fogColorAuto);
  const fogColor = resolvedFogColorManual
    ? hexToRgb01(typeof fogSettings.fogColor === "string" ? fogSettings.fogColor : "#ffffff")
    : fogColorAuto;
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
    autoFogHex,
    fogColorManual: resolvedFogColorManual,
    skyColor,
    cameraHeightNorm,
  };
}

function render(nowMs) {
  const dtSec =
    runtimeCore.frame.lastNowMs === null
      ? 0
      : Math.min(0.25, Math.max(0, (nowMs - runtimeCore.frame.lastNowMs) * 0.001));
  runtimeCore.frame.lastNowMs = nowMs;
  const preUpdateState = runtimeCore.store.getState();
  const prevTimeState = preUpdateState.systems && preUpdateState.systems.time
    ? preUpdateState.systems.time
    : null;
  const cycleSpeedHoursPerSec = clamp(Number(preUpdateState.clock && preUpdateState.clock.timeScale), 0, 1);
  const frameTimeState = buildFrameTimeState({
    prevTimeState,
    dtSec,
    cycleSpeedHoursPerSec,
    simTickHours: getConfiguredSimTickHoursFromStoreOrDefaults(),
    routing: getCurrentTimeRoutingFromStoreOrDefaults(),
  });
  const routedTime = {
    movement: getRoutedSystemTime(frameTimeState, "movement", dtSec),
    swarm: getRoutedSystemTime(frameTimeState, "swarm", dtSec),
    clouds: getRoutedSystemTime(frameTimeState, "clouds", dtSec),
    water: getRoutedSystemTime(frameTimeState, "water", dtSec),
    weather: getRoutedSystemTime(frameTimeState, "weather", dtSec),
  };
  const smoothCloudTimeSec = getInterpolatedRoutedTimeSec(routedTime.clouds);
  runtimeCore.scheduler.updateAll({ nowMs, dtSec, time: { ...frameTimeState, systems: routedTime } }, preUpdateState);
  const coreState = runtimeCore.store.getState();

  resize();
  overlayHooks.updateGameplay(nowMs, dtSec, routedTime.swarm);
  const systemState = coreState.systems || {};
  const simulationState = coreState.simulation || {};
  const simulationKnobs = simulationState.knobs || {};
  const simulationWeather = simulationState.weather || null;
  const lightingParams = systemState.lighting && systemState.lighting.lightingParams
    ? systemState.lighting.lightingParams
    : computeLightingParams(coreState);
  if (!lightingParams.fogColorManual && typeof lightingParams.autoFogHex === "string" && fogColorInput.value !== lightingParams.autoFogHex) {
    fogColorInput.value = lightingParams.autoFogHex;
  }
  const uniformInput = buildUniformInputState({
    clamp,
    getMapAspect,
    cursorLightState,
    lightingSettings: simulationKnobs.lighting || null,
    parallaxSettings: simulationKnobs.parallax || null,
    defaultLightingSettings: getSettingsDefaults("lighting", DEFAULT_LIGHTING_SETTINGS),
    defaultParallaxSettings: getSettingsDefaults("parallax", DEFAULT_PARALLAX_SETTINGS),
    defaultFogSettings: getSettingsDefaults("fog", DEFAULT_FOG_SETTINGS),
    defaultCloudSettings: getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS),
    defaultWaterSettings: getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS),
    hexToRgb01,
    fogState: systemState.fog || null,
    cloudState: systemState.clouds || null,
    waterFxState: systemState.waterFx || null,
    weatherState: simulationWeather,
    cloudTimeSec: smoothCloudTimeSec,
    waterTimeSec: routedTime.water.timeSec,
  });
  const cycleSpeed = Number(systemState.time && systemState.time.cycleSpeedHoursPerSec) || 0;
  const simTick = normalizeSimTickHours(systemState.time && systemState.time.simTickHours != null
    ? systemState.time.simTickHours
    : getConfiguredSimTickHours());
  const nextCycleInfo = `Time: ${formatHour(cycleState.hour)} | Speed: ${cycleSpeed.toFixed(2)} h/s | Tick: ${simTick.toFixed(3)}h`;
  if (cycleInfoEl.textContent !== nextCycleInfo) {
    cycleInfoEl.textContent = nextCycleInfo;
  }
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
    cloudTimeSec: smoothCloudTimeSec,
    currentMapFolderPath,
    splatSize,
    lightingParams,
    uniformInput,
    showTerrain,
    backgroundColorRgb: hexToRgb01(swarmSettings.backgroundColor),
    swarmEnabled,
    swarmLitEnabled: swarmSettings.useLitSwarm,
  });
  renderer.renderTerrainFrame(frameState);
  if (frameState.swarm.enabled && frameState.swarm.litEnabled) {
    renderSwarmLit(frameState.lightingParams, frameState.time, swarmSettings, frameState.uniformInput, frameState.camera);
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
updateSimTickLabel();
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
