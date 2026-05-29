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
import { createEventBus, RuntimeEvents } from "./core/eventBus.js";
import { registerRuntimeEventHandlers } from "./core/runtimeEventHandlers.js";
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
  DEFAULT_CLOUD_SETTINGS,
  DEFAULT_WATER_SETTINGS,
  DEFAULT_DETAIL_SETTINGS,
  DEFAULT_CAMERA_SETTINGS,
  DEFAULT_INTERACTION_SETTINGS,
  DEFAULT_SWARM_SETTINGS,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_SLIME_SETTINGS,
  registerMainSettingsContracts,
} from "./core/mainSettingsContracts.js";
import { buildFrameRenderState } from "./render/frameRenderState.js";
import { buildUniformInputState } from "./render/uniformInputState.js";
import { createRenderBootstrapState } from "./render/renderBootstrapState.js";
import {
  VERT_SRC,
  FRAG_SRC,
  SWARM_VERT_SRC,
  SWARM_FRAG_SRC,
  SHADOW_FRAG_SRC,
  SHADOW_BLUR_FRAG_SRC,
} from "./render/shaders.js";
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
import { createDetailAtlasRuntime } from "./render/detailAtlasRuntime.js";
import { createFrameUiRuntime } from "./render/frameUiRuntime.js";
import { updateWeatherFieldMeta } from "./render/weatherFieldRuntime.js";
import { renderFrameSwarmLayers } from "./render/frameSwarmRenderRuntime.js";
import { computeFrameTiming } from "./render/frameTimeRuntime.js";
import { createCloudNoiseImage as createCloudNoiseImageRender, uploadCloudNoiseTexture as uploadCloudNoiseTextureRender } from "./render/cloudNoiseRuntime.js";
import { createRenderSupportRuntime } from "./render/renderSupportRuntime.js";
import { createWaterParticleTrailRuntime, DEFAULT_WATER_TRAIL_SETTINGS } from "./render/waterParticleTrailRuntime.js";
import { sampleSunAtHour as sampleSunAtHourModel } from "./sim/sunModel.js";
import { createTimeLightingSetupRuntime } from "./sim/timeLightingSetupRuntime.js";
import { createEntityStore } from "./gameplay/entityStore.js";
import { createMovementSystem } from "./gameplay/movementSystem.js";
import { createMovementStoreSyncRuntime } from "./gameplay/movementStoreSyncRuntime.js";
import { createActivityStoreSyncRuntime } from "./gameplay/activityStoreSyncRuntime.js";
import { createInventoryStoreSyncRuntime } from "./gameplay/inventoryStoreSyncRuntime.js";
import { createConditionStoreSyncRuntime } from "./gameplay/conditionStoreSyncRuntime.js";
import { createPlayerActivityRuntime } from "./gameplay/playerActivityRuntime.js";
import { createInventoryRuntime } from "./gameplay/inventoryRuntime.js";
import { createConditionRuntime } from "./gameplay/conditionRuntime.js";
import { loadActivityDefinitions } from "./gameplay/activityRegistry.js";
import { loadActivityCosts } from "./gameplay/activityCostRegistry.js";
import { createActivityEffectRuntime } from "./gameplay/activityEffectRuntime.js";
import { loadConditionThresholds } from "./gameplay/conditionThresholdRegistry.js";
import { loadConditionEffects } from "./gameplay/conditionEffectRegistry.js";
import { createConditionEventTriggerRuntime } from "./gameplay/conditionEventTriggerRuntime.js";
import {
  applyConditionEffectModifiers,
  compareConditionEffectSnapshots,
  createConditionEffectRuntime,
  resolveConditionEffects,
} from "./gameplay/conditionEffectRuntime.js";
import { loadResourceSearches } from "./gameplay/resourceSearchRegistry.js";
import { computeResourceSearchChance, createResourceSearchRuntime } from "./gameplay/resourceSearchRuntime.js";
import { loadResourceStockSettings } from "./gameplay/resourceStockRegistry.js";
import { createResourceStockRuntime } from "./gameplay/resourceStockRuntime.js";
import { createResourceDiscoveryRuntime } from "./gameplay/resourceDiscoveryRuntime.js";
import {
  createInspectPerceptionRuntime,
  getInspectOverlayDebugLayer,
  getInspectOverlayDisplayLabel,
  getInspectOverlayResourceId,
} from "./gameplay/inspectPerceptionRuntime.js";
import { loadDiscoverySettings } from "./gameplay/discoverySettingsRegistry.js";
import {
  createDefaultResourceDebugSettings,
  getResourceDebugBandColors,
  normalizeResourceDebugSettings,
  serializeResourceDebugSettings,
} from "./gameplay/resourceDebugSettings.js";
import { createTravelEstimateRuntime } from "./gameplay/travelEstimateRuntime.js";
import { createTravelPlanningRuntime } from "./gameplay/travelPlanningRuntime.js";
import { createRoutePlanningRuntime } from "./gameplay/routePlanningRuntime.js";
import { DEFAULT_ROUTE_PLANNING_SETTINGS } from "./gameplay/routePlanningCostModel.js";
import { loadItemDefinitions } from "./gameplay/itemRegistry.js";
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
import { createAudioRuntimeState, DEFAULT_AUDIO_SIMULATION_STATE } from "./audio/audioState.js";
import { createAudioEngineRuntime } from "./audio/audioEngineRuntime.js";
import { createAudioAnalysisRuntime } from "./audio/audioAnalysisRuntime.js";
import { createSpectrogramRuntime } from "./audio/spectrogramRuntime.js";
import { createScribbleCanvasRuntime } from "./audio/scribbleCanvasRuntime.js";
import { createResynthesisRuntime } from "./audio/resynthesisRuntime.js";
import { createSynthesisRuntime, createDefaultSynthesisOscillator, normalizeSynthesisSettings } from "./audio/synthesisRuntime.js";
import {
  createSoundscapeLayerForRole,
  applySoundscapeRolePreset,
  normalizeSoundscapeSettings,
  soundscapeToSynthesisSettings,
  soundscapeToLiveSynthesisSettings,
  soundscapeLayerToFrequency,
  getSoundscapeScaleDegreeCount,
  createSoundscapeLayerRuntimeState,
  updateSoundscapeLayerRuntimeStates,
  randomizeSoundscapeSettings,
} from "./audio/soundscapeRuntime.js";
import { createAudioScribbleInputRuntime } from "./audio/audioScribbleInputRuntime.js";
import { createAudioPanelRuntime } from "./ui/audioPanelRuntime.js";
import { createSlimeMainRenderRuntime } from "./slime/slimeMainRenderRuntime.js";
import { DEFAULT_SLIME_SIMULATION_STATE, normalizeSlimeSettings } from "./slime/slimeState.js";
import {
  createEmptySlimeAvailabilityGrid,
  sampleSlimeAvailabilityCircle,
} from "./slime/slimeAvailabilityRuntime.js";
import { createSlimePanelRuntime } from "./ui/slimePanelRuntime.js";
import { createInteractionModeUiRuntime } from "./ui/interactionModeUiRuntime.js";
import { createPointLightIoUiRuntime } from "./ui/pointLightIoUiRuntime.js";
import { createWorkspaceRuntime } from "./ui/workspaceRuntime.js";
import { createGameTimeDioramaRuntime } from "./ui/gameTimeDioramaRuntime.js";
import { createDetailPanelRuntime } from "./ui/detailPanelRuntime.js";
import { createModulePresetRuntime } from "./ui/modulePresetRuntime.js";
import { createInventoryPanelRuntime } from "./ui/inventoryPanelRuntime.js";
import { createResourceDebugPanelRuntime } from "./ui/resourceDebugPanelRuntime.js";
import { injectResourceDebugMarkup } from "./ui/rd/resourceDebugMarkupRuntime.js";
import { createRdOverlayShortcutRailRuntime } from "./ui/rdOverlayShortcutRailRuntime.js";
import { createGameplayHudRuntime } from "./ui/gameplayHudRuntime.js";
import { createLocalActivityMenuRuntime } from "./ui/localActivityMenuRuntime.js";
import {
  createContentRegistry,
  validateContentReferences,
  WIKI_ARTICLE_PATHS,
} from "./content/contentRegistry.js";
import {
  GLOBAL_EVENT_DEFINITION_PATHS,
  loadEventDefinitionFiles,
} from "./content/eventDefinitionLoader.js";
import {
  createContentValidationError,
  formatContentValidationError,
} from "./content/contentValidationError.js";
import { createWikiRuntime } from "./gameplay/wikiRuntime.js";
import { createJournalRuntime } from "./gameplay/journalRuntime.js";
import { createEventRuntime } from "./gameplay/eventRuntime.js";
import { createEventDialogPersistenceRuntime } from "./gameplay/eventDialogPersistenceRuntime.js";
import { createWikiPanelRuntime } from "./ui/wikiPanelRuntime.js";
import { createJournalFeedRuntime, createJournalPanelRuntime } from "./ui/journalPanelRuntime.js";
import { createEncounterPanelRuntime } from "./ui/encounterPanelRuntime.js";
import { createEventDebugPanelRuntime } from "./ui/eventDebugPanelRuntime.js";
import { createSideDockRuntime } from "./ui/sideDockRuntime.js";
import { createUiHighlightRuntime, SEMANTIC_UI_HIGHLIGHT_TARGET_IDS } from "./ui/uiHighlightRuntime.js";

const ITEM_DEFINITIONS = await loadItemDefinitions();
const ACTIVITY_DEFINITIONS = await loadActivityDefinitions();
const ACTIVITY_COSTS = await loadActivityCosts();
const CONDITION_THRESHOLDS = await loadConditionThresholds();
const CONDITION_EFFECTS = await loadConditionEffects();
const RESOURCE_SEARCHES = await loadResourceSearches();
const RESOURCE_STOCK_SETTINGS = await loadResourceStockSettings({ resourceIds: Object.keys(RESOURCE_SEARCHES) });
const DISCOVERY_SETTINGS = await loadDiscoverySettings();
let EVENT_DEFINITIONS = [];
let activeEventDefinitions = [];
let activeMapEventDefinitionCount = 0;
let lastContentValidation = { ok: true, missing: [] };
let lastContentValidationError = "";
const WORLD_KNOWLEDGE_MAP_ID = "world";
const TRACKS_KNOWLEDGE_MAP_ID = "tracks";
const SLIME_HUNT_FLEE_EFFECT_ID = "slime_hunt_flee";
const DEFAULT_LOCAL_ACTIVITY_MENU_RADIUS = 72;
const DEFAULT_HUNTING_SETTINGS = {
  radius: 30,
  trailEffectiveMax: 0.7,
  maxChance: 0.35,
  depletionRadius: 45,
  killCount: 1,
  fleeSteps: 100,
  fleeWeight: 80,
};
const DEFAULT_RESOURCE_DEBUG_SETTINGS = createDefaultResourceDebugSettings(RESOURCE_SEARCHES, "water", DISCOVERY_SETTINGS);
let resourceDebugSettings = normalizeResourceDebugSettings(null, DEFAULT_RESOURCE_DEBUG_SETTINGS);
let localActivityMenuRadius = DEFAULT_LOCAL_ACTIVITY_MENU_RADIUS;

function getActivityCostKey(activityId, costRole, fallback) {
  const definition = ACTIVITY_DEFINITIONS[activityId];
  const costKeys = definition && definition.costKeys && typeof definition.costKeys === "object"
    ? definition.costKeys
    : null;
  return costKeys && typeof costKeys[costRole] === "string" && costKeys[costRole]
    ? costKeys[costRole]
    : fallback;
}
const runtimeCore = createRuntimeCore();
const dispatchCoreCommand = createCoreCommandDispatch(runtimeCore);
const eventBus = createEventBus();
const entityStore = createEntityStore();

injectResourceDebugMarkup();

const bodyEl = document.body;
const titleScreenEl = getRequiredElementById("titleScreen");
const titleNewGameBtn = getRequiredElementById("titleNewGameBtn");
const titleQuitGameBtn = getRequiredElementById("titleQuitGameBtn");
const titleStatusEl = getRequiredElementById("titleStatus");
const titleProgressFillEl = getRequiredElementById("titleProgressFill");
const dockExitToTitleBtn = getRequiredElementById("dockExitToTitleBtn");
const canvas = getRequiredElementById("glCanvas");
const overlayCanvas = getRequiredElementById("overlayCanvas");
const workspaceButtons = getRequiredElements(".workspace-btn");
const workspacePanels = getRequiredElements(".workspace-root");
const audioModeButtons = getRequiredElements(".audio-mode-btn");
const audioModeSurfaces = getRequiredElements(".audio-mode-surface");
const audioControlPanels = getRequiredElements(".audio-control-section");
const topicButtons = getRequiredElements(".topic-btn");
const topicPanelEl = getRequiredElementById("topicPanel");
const topicPanelTitleEl = getRequiredElementById("topicPanelTitle");
const perfOverlayToggleBtn = getRequiredElementById("perfOverlayToggleBtn");
const rdPerformanceOverlayToggleBtn = getRequiredElementById("rdPerformanceOverlayToggleBtn");
const topicPanelCloseBtn = getRequiredElementById("topicPanelClose");
const performanceOverlayPanelEl = getRequiredElementById("performanceOverlayPanel");
const performanceOverlayCopyBtn = getRequiredElementById("performanceOverlayCopyBtn");
const performanceOverlayGraphEl = getRequiredElementById("performanceOverlayGraph");
const performanceOverlayTextEl = getRequiredElementById("performanceOverlayText");
const topicCards = getRequiredElements(".topic-card");
const statusEl = getRequiredElementById("status");
const statusRuntime = createStatusRuntime({ statusEl, titleStatusEl, titleProgressFillEl });
const cycleInfoEl = getRequiredElementById("cycleInfo");
const frameInfoEl = getRequiredElementById("frameInfo");
const frameProfileInfoEl = getRequiredElementById("frameProfileInfo");
const gpuProfileInfoEl = getRequiredElementById("gpuProfileInfo");
const detailInfoEl = getRequiredElementById("detailInfo");
const playerInfoEl = getRequiredElementById("playerInfo");
const pathInfoEl = getRequiredElementById("pathInfo");
const movementStatusPanelEl = getRequiredElementById("movementStatusPanel");
const movementStatusTitleEl = getRequiredElementById("movementStatusTitle");
const movementStatusEtaEl = getRequiredElementById("movementStatusEta");
const movementStatusDetailEl = getRequiredElementById("movementStatusDetail");
const huntingAvailabilityRowEl = getRequiredElementById("huntingAvailabilityRow");
const huntingAvailabilityLabelEl = getRequiredElementById("huntingAvailabilityLabel");
const huntingAvailabilityBarFillEl = getRequiredElementById("huntingAvailabilityBarFill");
const routePlanningControlsEl = getRequiredElementById("routePlanningControls");
const routeSectionTimeValue = getRequiredElementById("routeSectionTimeValue");
const routeTotalTimeValue = getRequiredElementById("routeTotalTimeValue");
const routeDeleteAllBtn = getRequiredElementById("routeDeleteAllBtn");
const routeWaypointMenuEl = getRequiredElementById("routeWaypointMenu");
const routeWaypointExtendBtn = getRequiredElementById("routeWaypointExtendBtn");
const routeWaypointDeleteBtn = getRequiredElementById("routeWaypointDeleteBtn");
const movementActionBtn = getRequiredElementById("movementActionBtn");
const inspectStatusPanelEl = getRequiredElementById("inspectStatusPanel");
const inspectStatusTitleEl = getRequiredElementById("inspectStatusTitle");
const inspectStatusEtaEl = getRequiredElementById("inspectStatusEta");
const inspectStatusDetailEl = getRequiredElementById("inspectStatusDetail");
const inspectResourceRowEl = getRequiredElementById("inspectResourceRow");
const inspectResourceLabelEl = getRequiredElementById("inspectResourceLabel");
const inspectResourceBarFillEl = getRequiredElementById("inspectResourceBarFill");
const mapPathInput = getRequiredElementById("mapPathInput");
const mapPathLoadBtn = getRequiredElementById("mapPathLoadBtn");
const mapFolderInput = getRequiredElementById("mapFolderInput");
const mapSaveAllBtn = getRequiredElementById("mapSaveAllBtn");
const gameplayHudEl = getRequiredElementById("gameplayHud");
const conditionEffectStripEl = getRequiredElementById("conditionEffectStrip");
const conditionEffectTooltipEl = getRequiredElementById("conditionEffectTooltip");
const hudRoutePlanningBtn = getRequiredElementById("hudRoutePlanningBtn");
const hudInventoryBtn = getRequiredElementById("hudInventoryBtn");
const hudShowPlayerBtn = getRequiredElementById("hudShowPlayerBtn");
const localActivityMenuEl = getRequiredElementById("localActivityMenu");
const hudWikiHelpBtn = getRequiredElementById("hudWikiHelpBtn");
const hudWikiOpenBtn = getRequiredElementById("hudWikiOpenBtn");
const hudJournalOpenBtn = getRequiredElementById("hudJournalOpenBtn");
const journalFeedEl = getRequiredElementById("journalFeed");
const journalFeedToggleBtn = getRequiredElementById("journalFeedToggleBtn");
const journalFeedEntriesEl = getRequiredElementById("journalFeedEntries");
const wikiPanelEl = getRequiredElementById("wikiPanel");
const wikiPanelTitleEl = getRequiredElementById("wikiPanelTitle");
const wikiPanelSummaryEl = getRequiredElementById("wikiPanelSummary");
const wikiPanelBodyEl = getRequiredElementById("wikiPanelBody");
const wikiChoiceListEl = getRequiredElementById("wikiChoiceList");
const wikiCloseBtn = getRequiredElementById("wikiCloseBtn");
const wikiBackBtn = getRequiredElementById("wikiBackBtn");
const wikiSwapSideBtn = getRequiredElementById("wikiSwapSideBtn");
const wikiResetStateBtn = getRequiredElementById("wikiResetStateBtn");
const journalPanelEl = getRequiredElementById("journalPanel");
const journalPanelListEl = getRequiredElementById("journalPanelList");
const journalCategoryFilterEl = getRequiredElementById("journalCategoryFilter");
const journalCloseBtn = getRequiredElementById("journalCloseBtn");
const journalSwapSideBtn = getRequiredElementById("journalSwapSideBtn");
const encounterBackdropEl = getRequiredElementById("encounterBackdrop");
const encounterPanelEl = getRequiredElementById("encounterPanel");
const encounterPanelTitleEl = getRequiredElementById("encounterPanelTitle");
const encounterPanelSummaryEl = getRequiredElementById("encounterPanelSummary");
const encounterPanelBodyEl = getRequiredElementById("encounterPanelBody");
const encounterChoiceListEl = getRequiredElementById("encounterChoiceList");
const encounterCloseBtn = getRequiredElementById("encounterCloseBtn");
const eventDebugTriggerDialogBtn = getRequiredElementById("eventDebugTriggerDialogBtn");
const eventDebugTriggerNoticeBtn = getRequiredElementById("eventDebugTriggerNoticeBtn");
const eventDebugTriggerGameplayStartedBtn = getRequiredElementById("eventDebugTriggerGameplayStartedBtn");
const eventDebugTriggerHydrationLowBtn = getRequiredElementById("eventDebugTriggerHydrationLowBtn");
const eventDebugTriggerFatigueHighBtn = getRequiredElementById("eventDebugTriggerFatigueHighBtn");
const eventDebugResetBtn = getRequiredElementById("eventDebugResetBtn");
const eventDebugRefreshBtn = getRequiredElementById("eventDebugRefreshBtn");
const eventDebugValidateContentBtn = getRequiredElementById("eventDebugValidateContentBtn");
const eventDebugPreviewSelect = getRequiredElementById("eventDebugPreviewSelect");
const eventDebugPreviewBtn = getRequiredElementById("eventDebugPreviewBtn");
const eventDebugPreviewValue = getRequiredElementById("eventDebugPreviewValue");
const eventDebugContentHealthValue = getRequiredElementById("eventDebugContentHealthValue");
const eventDebugLastTriggerValue = getRequiredElementById("eventDebugLastTriggerValue");
const eventDebugActiveValue = getRequiredElementById("eventDebugActiveValue");
const eventDebugQueueValue = getRequiredElementById("eventDebugQueueValue");
const eventDebugDefinitionsValue = getRequiredElementById("eventDebugDefinitionsValue");
const eventDebugSeenValue = getRequiredElementById("eventDebugSeenValue");
const eventDebugFlagsValue = getRequiredElementById("eventDebugFlagsValue");
const eventDebugJournalValue = getRequiredElementById("eventDebugJournalValue");
const cameraResetViewBtn = getRequiredElementById("cameraResetViewBtn");
const cameraCenterPlayerBtn = getRequiredElementById("cameraCenterPlayerBtn");
const cameraZoomOutBtn = getRequiredElementById("cameraZoomOutBtn");
const cameraZoomInBtn = getRequiredElementById("cameraZoomInBtn");
const resourceDebugDevTabButtons = getRequiredElements(".rd-dev-tab");
const resourceDebugDevTabPanels = getRequiredElements(".rd-dev-panel");
const resourceDebugTabGroups = getRequiredElements("[data-rd-tab-group]");
const resourceDebugTabButtons = getRequiredElements(".rd-tab");
const resourceDebugTabPanels = getRequiredElements(".rd-tab-panel");
const rdOverlayRailEl = getRequiredElementById("rdOverlayRail");
const resourceDebugLayerInput = getRequiredElementById("resourceDebugLayer");
const resourceDebugTintColorInput = getRequiredElementById("resourceDebugTintColor");
const resourceDebugDiscoveryGridInput = getRequiredElementById("resourceDebugDiscoveryGrid");
const resourceDebugDiscoveryGridValue = getRequiredElementById("resourceDebugDiscoveryGridValue");
const resourceDebugRevealRadiusInput = getRequiredElementById("resourceDebugRevealRadius");
const resourceDebugRevealRadiusValue = getRequiredElementById("resourceDebugRevealRadiusValue");
const resourceDebugRevealFalloffInput = getRequiredElementById("resourceDebugRevealFalloff");
const resourceDebugRevealFalloffValue = getRequiredElementById("resourceDebugRevealFalloffValue");
const resourceDebugDecayEnabledInput = getRequiredElementById("resourceDebugDecayEnabled");
const resourceDebugDecayIntervalInput = getRequiredElementById("resourceDebugDecayInterval");
const resourceDebugDecayIntervalValue = getRequiredElementById("resourceDebugDecayIntervalValue");
const resourceDebugDecayAmountInput = getRequiredElementById("resourceDebugDecayAmount");
const resourceDebugDecayAmountValue = getRequiredElementById("resourceDebugDecayAmountValue");
const resourceDebugShowMaskOverlayInput = getRequiredElementById("resourceDebugShowMaskOverlay");
const resourceDebugMaskOverlayOpacityInput = getRequiredElementById("resourceDebugMaskOverlayOpacity");
const resourceDebugMaskOverlayOpacityValue = getRequiredElementById("resourceDebugMaskOverlayOpacityValue");
const resourceDebugSampleStepInput = getRequiredElementById("resourceDebugSampleStep");
const resourceDebugSampleStepValue = getRequiredElementById("resourceDebugSampleStepValue");
const resourceDebugKnowledgeThresholdInput = getRequiredElementById("resourceDebugKnowledgeThreshold");
const resourceDebugKnowledgeThresholdValue = getRequiredElementById("resourceDebugKnowledgeThresholdValue");
const resourceDebugLineWidthInput = getRequiredElementById("resourceDebugLineWidth");
const resourceDebugLineWidthValue = getRequiredElementById("resourceDebugLineWidthValue");
const resourceDebugBand1Input = getRequiredElementById("resourceDebugBand1");
const resourceDebugBand1Value = getRequiredElementById("resourceDebugBand1Value");
const resourceDebugBand1EnabledInput = getRequiredElementById("resourceDebugBand1Enabled");
const resourceDebugBand2Input = getRequiredElementById("resourceDebugBand2");
const resourceDebugBand2Value = getRequiredElementById("resourceDebugBand2Value");
const resourceDebugBand2EnabledInput = getRequiredElementById("resourceDebugBand2Enabled");
const resourceDebugBand3Input = getRequiredElementById("resourceDebugBand3");
const resourceDebugBand3Value = getRequiredElementById("resourceDebugBand3Value");
const resourceDebugBand3EnabledInput = getRequiredElementById("resourceDebugBand3Enabled");
const resourceDebugBand4Input = getRequiredElementById("resourceDebugBand4");
const resourceDebugBand4Value = getRequiredElementById("resourceDebugBand4Value");
const resourceDebugBand4EnabledInput = getRequiredElementById("resourceDebugBand4Enabled");
const resourceDebugBand5Input = getRequiredElementById("resourceDebugBand5");
const resourceDebugBand5Value = getRequiredElementById("resourceDebugBand5Value");
const resourceDebugBand5EnabledInput = getRequiredElementById("resourceDebugBand5Enabled");
const resourceDebugSaveBtn = getRequiredElementById("resourceDebugSaveBtn");
const discoveryVisibilityEnabledInput = getRequiredElementById("discoveryVisibilityEnabled");
const discoveryVisibilityResourceInput = getRequiredElementById("discoveryVisibilityResource");
const discoveryVisibilityModeInput = getRequiredElementById("discoveryVisibilityMode");
const discoveryVisibilityDitherScaleInput = getRequiredElementById("discoveryVisibilityDitherScale");
const discoveryVisibilityDitherScaleValue = getRequiredElementById("discoveryVisibilityDitherScaleValue");
const discoveryVisibilityKnowledgeGammaInput = getRequiredElementById("discoveryVisibilityKnowledgeGamma");
const discoveryVisibilityKnowledgeGammaValue = getRequiredElementById("discoveryVisibilityKnowledgeGammaValue");
const discoveryVisibilityBaseInput = getRequiredElementById("discoveryVisibilityBase");
const discoveryVisibilityBaseValue = getRequiredElementById("discoveryVisibilityBaseValue");
const discoveryVisibilityFullThresholdInput = getRequiredElementById("discoveryVisibilityFullThreshold");
const discoveryVisibilityFullThresholdValue = getRequiredElementById("discoveryVisibilityFullThresholdValue");
const discoveryVisibilityUnknownDarknessInput = getRequiredElementById("discoveryVisibilityUnknownDarkness");
const discoveryVisibilityUnknownDarknessValue = getRequiredElementById("discoveryVisibilityUnknownDarknessValue");
const discoveryNoiseSeedInput = getRequiredElementById("discoveryNoiseSeed");
const discoveryNoiseSeedValue = getRequiredElementById("discoveryNoiseSeedValue");
const discoveryNoiseScaleInput = getRequiredElementById("discoveryNoiseScale");
const discoveryNoiseScaleValue = getRequiredElementById("discoveryNoiseScaleValue");
const discoveryNoiseMinInput = getRequiredElementById("discoveryNoiseMin");
const discoveryNoiseMinValue = getRequiredElementById("discoveryNoiseMinValue");
const discoveryNoiseMaxInput = getRequiredElementById("discoveryNoiseMax");
const discoveryNoiseMaxValue = getRequiredElementById("discoveryNoiseMaxValue");
const discoveryNoiseApplyBtn = getRequiredElementById("discoveryNoiseApplyBtn");
const discoveryFillKnownBtn = getRequiredElementById("discoveryFillKnownBtn");
const discoveryFillUnknownBtn = getRequiredElementById("discoveryFillUnknownBtn");
const resourceStockResourceInput = getRequiredElementById("resourceStockResource");
const resourceStockOverlayModeInput = getRequiredElementById("resourceStockOverlayMode");
const resourceStockGridSizeInput = getRequiredElementById("resourceStockGridSize");
const resourceStockGridSizeValue = getRequiredElementById("resourceStockGridSizeValue");
const resourceStockDepleteAmountInput = getRequiredElementById("resourceStockDepleteAmount");
const resourceStockDepleteAmountValue = getRequiredElementById("resourceStockDepleteAmountValue");
const resourceStockNeighborDepleteAmountInput = getRequiredElementById("resourceStockNeighborDepleteAmount");
const resourceStockNeighborDepleteAmountValue = getRequiredElementById("resourceStockNeighborDepleteAmountValue");
const resourceStockDepleteRadiusInput = getRequiredElementById("resourceStockDepleteRadius");
const resourceStockDepleteRadiusValue = getRequiredElementById("resourceStockDepleteRadiusValue");
const resourceStockReplenishIntervalInput = getRequiredElementById("resourceStockReplenishInterval");
const resourceStockReplenishIntervalValue = getRequiredElementById("resourceStockReplenishIntervalValue");
const resourceStockReplenishAmountInput = getRequiredElementById("resourceStockReplenishAmount");
const resourceStockReplenishAmountValue = getRequiredElementById("resourceStockReplenishAmountValue");
const resourceStockReadout = getRequiredElementById("resourceStockReadout");
const resourceStockDepleteHereBtn = getRequiredElementById("resourceStockDepleteHereBtn");
const resourceStockRevealHereBtn = getRequiredElementById("resourceStockRevealHereBtn");
const resourceStockFillFullBtn = getRequiredElementById("resourceStockFillFullBtn");
const resourceStockFillEmptyBtn = getRequiredElementById("resourceStockFillEmptyBtn");
const resourceStockResetBtn = getRequiredElementById("resourceStockResetBtn");
const slimeAvailabilityOverlayEnabledInput = getRequiredElementById("slimeAvailabilityOverlayEnabled");
const slimeAvailabilityOverlayOpacityInput = getRequiredElementById("slimeAvailabilityOverlayOpacity");
const slimeAvailabilityOverlayOpacityValue = getRequiredElementById("slimeAvailabilityOverlayOpacityValue");
const slimeAvailabilityOverlayThresholdInput = getRequiredElementById("slimeAvailabilityOverlayThreshold");
const slimeAvailabilityOverlayThresholdValue = getRequiredElementById("slimeAvailabilityOverlayThresholdValue");
const slimeGameTicksPerSlimeStepInput = getRequiredElementById("slimeGameTicksPerSlimeStep");
const slimeGameTicksPerSlimeStepValue = getRequiredElementById("slimeGameTicksPerSlimeStepValue");
const slimeHuntingFleeStepsInput = getRequiredElementById("slimeHuntingFleeSteps");
const slimeHuntingFleeStepsValue = getRequiredElementById("slimeHuntingFleeStepsValue");
const slimeHuntingFleeWeightInput = getRequiredElementById("slimeHuntingFleeWeight");
const slimeHuntingFleeWeightValue = getRequiredElementById("slimeHuntingFleeWeightValue");
const slimeHuntingFleeRadiusInput = getRequiredElementById("slimeHuntingFleeRadius");
const slimeHuntingFleeRadiusValue = getRequiredElementById("slimeHuntingFleeRadiusValue");
const slimeTracksKnowledgeCutoffInput = getRequiredElementById("slimeTracksKnowledgeCutoff");
const slimeTracksKnowledgeCutoffValue = getRequiredElementById("slimeTracksKnowledgeCutoffValue");
const slimeTracksClearBtn = getRequiredElementById("slimeTracksClearBtn");
const slimeTracksFillBtn = getRequiredElementById("slimeTracksFillBtn");
const slimeTracksNoiseBtn = getRequiredElementById("slimeTracksNoiseBtn");
const slimeAvailabilityReadout = getRequiredElementById("slimeAvailabilityReadout");
const routeArrowColorInput = getRequiredElementById("routeArrowColor");
const routeArrowSpacingInput = getRequiredElementById("routeArrowSpacing");
const routeArrowSpacingValue = getRequiredElementById("routeArrowSpacingValue");
const routeArrowOpacityInput = getRequiredElementById("routeArrowOpacity");
const routeArrowOpacityValue = getRequiredElementById("routeArrowOpacityValue");
const routeArrowSizeInput = getRequiredElementById("routeArrowSize");
const routeArrowSizeValue = getRequiredElementById("routeArrowSizeValue");
const routeEndpointSkipRatioInput = getRequiredElementById("routeEndpointSkipRatio");
const routeEndpointSkipRatioValue = getRequiredElementById("routeEndpointSkipRatioValue");
const routePreviewPointRadiusInput = getRequiredElementById("routePreviewPointRadius");
const routePreviewPointRadiusValue = getRequiredElementById("routePreviewPointRadiusValue");
const routePreviewOpacityInput = getRequiredElementById("routePreviewOpacity");
const routePreviewOpacityValue = getRequiredElementById("routePreviewOpacityValue");
const routeDiscoveryCutoffInput = getRequiredElementById("routeDiscoveryCutoff");
const routeDiscoveryCutoffValue = getRequiredElementById("routeDiscoveryCutoffValue");
const routePlanningSlopeMulInput = getRequiredElementById("routePlanningSlopeMul");
const routePlanningSlopeMulValue = getRequiredElementById("routePlanningSlopeMulValue");
const routePlanningHeightMulInput = getRequiredElementById("routePlanningHeightMul");
const routePlanningHeightMulValue = getRequiredElementById("routePlanningHeightMulValue");
const routePlanningWaterMulInput = getRequiredElementById("routePlanningWaterMul");
const routePlanningWaterMulValue = getRequiredElementById("routePlanningWaterMulValue");
const routePlanningSlopeCutoffAddInput = getRequiredElementById("routePlanningSlopeCutoffAdd");
const routePlanningSlopeCutoffAddValue = getRequiredElementById("routePlanningSlopeCutoffAddValue");
const routeDebugOverlayModeInput = getRequiredElementById("routeDebugOverlayMode");
const routeClearBtn = getRequiredElementById("routeClearBtn");
const localActivityMenuRadiusInput = getRequiredElementById("localActivityMenuRadius");
const localActivityMenuRadiusValue = getRequiredElementById("localActivityMenuRadiusValue");
const terrainDebugViewModeInput = getRequiredElementById("terrainDebugViewMode");
const inspectLayerControlsEl = getRequiredElementById("inspectLayerControls");
const inspectTracksLayerBtn = getRequiredElementById("inspectTracksLayerBtn");
const inspectWetnessLayerBtn = getRequiredElementById("inspectWetnessLayerBtn");
const inspectPlantsLayerBtn = getRequiredElementById("inspectPlantsLayerBtn");
const inspectHeightLayerBtn = getRequiredElementById("inspectHeightLayerBtn");
const inspectSlopeLayerBtn = getRequiredElementById("inspectSlopeLayerBtn");
const inspectRouteLayerBtn = getRequiredElementById("inspectRouteLayerBtn");
const conditionStatEls = {
  nutrition: gameplayHudEl.querySelector('[data-condition-stat="nutrition"]'),
  hydration: gameplayHudEl.querySelector('[data-condition-stat="hydration"]'),
  fatigue: gameplayHudEl.querySelector('[data-condition-stat="fatigue"]'),
  load: gameplayHudEl.querySelector('[data-condition-stat="load"]'),
};
const inventoryPanelEl = getRequiredElementById("inventoryPanel");
const inventoryCloseBtn = getRequiredElementById("inventoryCloseBtn");
const inventoryPlayerCapacityEl = getRequiredElementById("inventoryPlayerCapacity");
const inventoryOpenCapacityEl = getRequiredElementById("inventoryOpenCapacity");
const inventoryOpenTitleEl = getRequiredElementById("inventoryOpenTitle");
const inventoryOpenHintEl = getRequiredElementById("inventoryOpenHint");
const inventoryPlayerListEl = getRequiredElementById("inventoryPlayerList");
const inventoryOpenListEl = getRequiredElementById("inventoryOpenList");
const inventorySelectedNameEl = getRequiredElementById("inventorySelectedName");
const inventorySelectedDescriptionEl = getRequiredElementById("inventorySelectedDescription");
const inventorySelectedStatsEl = getRequiredElementById("inventorySelectedStats");
const inventoryUseBtn = getRequiredElementById("inventoryUseBtn");
const inventoryDropBundleBtn = getRequiredElementById("inventoryDropBundleBtn");
const inventoryMoveToBundleBtn = getRequiredElementById("inventoryMoveToBundleBtn");
const inventoryMoveToPlayerBtn = getRequiredElementById("inventoryMoveToPlayerBtn");
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
const gameTimeDioramaEl = getRequiredElementById("gameTimeDiorama");
const gameTimeSunEl = getRequiredElementById("gameTimeSun");
const gameTimeMoonEl = getRequiredElementById("gameTimeMoon");
const gameTimeSpeedButtons = getRequiredElements(".time-speed-btn");
const shadowsToggle = getRequiredElementById("shadowsToggle");
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
const waterPresetSelect = getRequiredElementById("waterPresetSelect");
const waterPresetNameInput = getRequiredElementById("waterPresetName");
const waterPresetApplyBtn = getRequiredElementById("waterPresetApplyBtn");
const waterPresetSaveBtn = getRequiredElementById("waterPresetSaveBtn");
const waterFxToggle = getRequiredElementById("waterFxToggle");
const waterFlowSourceInput = getRequiredElementById("waterFlowSource");
const waterFlowRenderModeInput = getRequiredElementById("waterFlowRenderMode");
const waterFlowChannelPairInput = getRequiredElementById("waterFlowChannelPair");
const waterFlowFlipXToggle = getRequiredElementById("waterFlowFlipXToggle");
const waterFlowFlipYToggle = getRequiredElementById("waterFlowFlipYToggle");
const waterFlowUseMagnitudeToggle = getRequiredElementById("waterFlowUseMagnitudeToggle");
const waterFlowInvertDownhillToggle = getRequiredElementById("waterFlowInvertDownhillToggle");
const waterFlowDebugToggle = getRequiredElementById("waterFlowDebugToggle");
const waterFlowDirectionInput = getRequiredElementById("waterFlowDirection");
const waterFlowDirectionValue = getRequiredElementById("waterFlowDirectionValue");
const waterFlowStrengthInput = getRequiredElementById("waterFlowStrength");
const waterFlowStrengthValue = getRequiredElementById("waterFlowStrengthValue");
const waterFlowMapStrengthInput = getRequiredElementById("waterFlowMapStrength");
const waterFlowMapStrengthValue = getRequiredElementById("waterFlowMapStrengthValue");
const waterFlowVisibilityInput = getRequiredElementById("waterFlowVisibility");
const waterFlowVisibilityValue = getRequiredElementById("waterFlowVisibilityValue");
const waterStreamlineDensityInput = getRequiredElementById("waterStreamlineDensity");
const waterStreamlineDensityValue = getRequiredElementById("waterStreamlineDensityValue");
const waterStreamlineSharpnessInput = getRequiredElementById("waterStreamlineSharpness");
const waterStreamlineSharpnessValue = getRequiredElementById("waterStreamlineSharpnessValue");
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
const waterBaseColorInput = getRequiredElementById("waterBaseColor");
const waterOpacityInput = getRequiredElementById("waterOpacity");
const waterOpacityValue = getRequiredElementById("waterOpacityValue");
const waterTintColorInput = getRequiredElementById("waterTintColor");
const waterTintStrengthInput = getRequiredElementById("waterTintStrength");
const waterTintStrengthValue = getRequiredElementById("waterTintStrengthValue");
const waterTimeRoutingInput = getRequiredElementById("waterTimeRouting");
const waterTrailDebugToggle = getRequiredElementById("waterTrailDebugToggle");
const waterTrailPresetSelect = getRequiredElementById("waterTrailPresetSelect");
const waterTrailPresetNameInput = getRequiredElementById("waterTrailPresetName");
const waterTrailPresetApplyBtn = getRequiredElementById("waterTrailPresetApplyBtn");
const waterTrailPresetSaveBtn = getRequiredElementById("waterTrailPresetSaveBtn");
const slimePresetSelect = getRequiredElementById("slimePresetSelect");
const slimePresetNameInput = getRequiredElementById("slimePresetName");
const slimePresetApplyBtn = getRequiredElementById("slimePresetApplyBtn");
const slimePresetSaveBtn = getRequiredElementById("slimePresetSaveBtn");
const slimeSaveBtn = getRequiredElementById("slimeSaveBtn");
const heightScaleInput = getRequiredElementById("heightScale");
const shadowStrengthInput = getRequiredElementById("shadowStrength");
const shadowBlurInput = getRequiredElementById("shadowBlur");
const shadowBlurValue = getRequiredElementById("shadowBlurValue");
const detailDebugChannelInput = getRequiredElementById("detailDebugChannel");
const ambientInput = getRequiredElementById("ambient");
const ambientValue = getRequiredElementById("ambientValue");
const diffuseInput = getRequiredElementById("diffuse");
const diffuseValue = getRequiredElementById("diffuseValue");
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
const pointLightGizmoToggle = getRequiredElementById("pointLightGizmoToggle");
const pointLightLiveUpdateToggle = getRequiredElementById("pointLightLiveUpdateToggle");
const lightSaveBtn = getRequiredElementById("lightSaveBtn");
const lightCancelBtn = getRequiredElementById("lightCancelBtn");
const lightDeleteBtn = getRequiredElementById("lightDeleteBtn");
const pointLightsSaveAllBtn = getRequiredElementById("pointLightsSaveAllBtn");
const pointLightsLoadAllBtn = getRequiredElementById("pointLightsLoadAllBtn");
const pointLightsLoadInput = getRequiredElementById("pointLightsLoadInput");
const audioMinHzInput = getRequiredElementById("audioMinHz");
const audioMaxHzInput = getRequiredElementById("audioMaxHz");
const audioBrushSizeInput = getRequiredElementById("audioBrushSize");
const audioBrushSizeValue = getRequiredElementById("audioBrushSizeValue");
const audioBrushStrengthInput = getRequiredElementById("audioBrushStrength");
const audioBrushStrengthValue = getRequiredElementById("audioBrushStrengthValue");
const audioEraseModeToggle = getRequiredElementById("audioEraseModeToggle");
const audioAutoThresholdInput = getRequiredElementById("audioAutoThreshold");
const audioAutoThresholdValue = getRequiredElementById("audioAutoThresholdValue");
const audioAutoContrastInput = getRequiredElementById("audioAutoContrast");
const audioAutoContrastValue = getRequiredElementById("audioAutoContrastValue");
const audioAutoGainInput = getRequiredElementById("audioAutoGain");
const audioAutoGainValue = getRequiredElementById("audioAutoGainValue");
const audioAutoClearToggle = getRequiredElementById("audioAutoClearToggle");
const audioApproxMaxStrokesInput = getRequiredElementById("audioApproxMaxStrokes");
const audioApproxMinStrengthInput = getRequiredElementById("audioApproxMinStrength");
const audioApproxMinStrengthValue = getRequiredElementById("audioApproxMinStrengthValue");
const audioMasterGainInput = getRequiredElementById("audioMasterGain");
const audioMasterGainValue = getRequiredElementById("audioMasterGainValue");
const audioPlaybackRateInput = getRequiredElementById("audioPlaybackRate");
const audioPlaybackRateValue = getRequiredElementById("audioPlaybackRateValue");
const audioFileInput = getRequiredElementById("audioFileInput");
const audioPlayBtn = getRequiredElementById("audioPlayBtn");
const audioPlayOriginalBtn = getRequiredElementById("audioPlayOriginalBtn");
const audioPlayScribbleBtn = getRequiredElementById("audioPlayScribbleBtn");
const audioAutoPaintBtn = getRequiredElementById("audioAutoPaintBtn");
const audioApproximateBtn = getRequiredElementById("audioApproximateBtn");
const audioStopBtn = getRequiredElementById("audioStopBtn");
const audioClearBtn = getRequiredElementById("audioClearBtn");
const audioStatusValue = getRequiredElementById("audioStatusValue");
const audioFileStatusValue = getRequiredElementById("audioFileStatusValue");
const audioSpectrogramCanvas = getRequiredElementById("audioSpectrogramCanvas");
const audioSynthesisCanvas = getRequiredElementById("audioSynthesisCanvas");
const audioSoundscapeCanvas = getRequiredElementById("audioSoundscapeCanvas");
const audioSynthesisDurationInput = getRequiredElementById("audioSynthesisDuration");
const audioSynthesisDurationValue = getRequiredElementById("audioSynthesisDurationValue");
const audioSynthesisMasterGainInput = getRequiredElementById("audioSynthesisMasterGain");
const audioSynthesisMasterGainValue = getRequiredElementById("audioSynthesisMasterGainValue");
const audioSynthesisLoopToggle = getRequiredElementById("audioSynthesisLoopToggle");
const audioSynthesisPlayBtn = getRequiredElementById("audioSynthesisPlayBtn");
const audioSynthesisAddOscillatorBtn = getRequiredElementById("audioSynthesisAddOscillatorBtn");
const audioSynthesisStopBtn = getRequiredElementById("audioSynthesisStopBtn");
const audioSynthesisOscillatorList = getRequiredElementById("audioSynthesisOscillatorList");
const audioSoundscapeRootInput = getRequiredElementById("audioSoundscapeRoot");
const audioSoundscapeScaleInput = getRequiredElementById("audioSoundscapeScale");
const audioSoundscapeDurationInput = getRequiredElementById("audioSoundscapeDuration");
const audioSoundscapeDurationValue = getRequiredElementById("audioSoundscapeDurationValue");
const audioSoundscapeMasterGainInput = getRequiredElementById("audioSoundscapeMasterGain");
const audioSoundscapeMasterGainValue = getRequiredElementById("audioSoundscapeMasterGainValue");
const audioSoundscapeLoopToggle = getRequiredElementById("audioSoundscapeLoopToggle");
const audioSoundscapeSeedInput = getRequiredElementById("audioSoundscapeSeed");
const audioSoundscapePlayBtn = getRequiredElementById("audioSoundscapePlayBtn");
const audioSoundscapeRandomizeBtn = getRequiredElementById("audioSoundscapeRandomizeBtn");
const audioSoundscapeAddDroneBtn = getRequiredElementById("audioSoundscapeAddDroneBtn");
const audioSoundscapeAddResonanceBtn = getRequiredElementById("audioSoundscapeAddResonanceBtn");
const audioSoundscapeAddShimmerBtn = getRequiredElementById("audioSoundscapeAddShimmerBtn");
const audioSoundscapeAddCallBtn = getRequiredElementById("audioSoundscapeAddCallBtn");
const audioSoundscapeAddWindBtn = getRequiredElementById("audioSoundscapeAddWindBtn");
const audioSoundscapeAddRumbleBtn = getRequiredElementById("audioSoundscapeAddRumbleBtn");
const audioSoundscapeAddAirBtn = getRequiredElementById("audioSoundscapeAddAirBtn");
const audioSoundscapeStopBtn = getRequiredElementById("audioSoundscapeStopBtn");
const audioSoundscapeLayerList = getRequiredElementById("audioSoundscapeLayerList");
const slimeStartBtn = getRequiredElementById("slimeStartBtn");
const slimeStopBtn = getRequiredElementById("slimeStopBtn");
const slimeResetBtn = getRequiredElementById("slimeResetBtn");
const slimeRandomizeBtn = getRequiredElementById("slimeRandomizeBtn");
const slimeAgentCountInput = getRequiredElementById("slimeAgentCount");
const slimeAgentCountValue = getRequiredElementById("slimeAgentCountValue");
const slimeSimSizeInput = getRequiredElementById("slimeSimSize");
const slimeStepsPerFrameInput = getRequiredElementById("slimeStepsPerFrame");
const slimeStepsPerFrameValue = getRequiredElementById("slimeStepsPerFrameValue");
const slimeTimeModeInput = getRequiredElementById("slimeTimeMode");
const slimeStepsPerGameTickInput = getRequiredElementById("slimeStepsPerGameTick");
const slimeStepsPerGameTickValue = getRequiredElementById("slimeStepsPerGameTickValue");
const slimeGameSpeedBtns = getRequiredElements(".slime-game-speed-btn");
const slimeWarmupEnabledInput = getRequiredElementById("slimeWarmupEnabled");
const slimeWarmupStepsInput = getRequiredElementById("slimeWarmupSteps");
const slimeWarmupStepsValue = getRequiredElementById("slimeWarmupStepsValue");
const slimeAvailabilityGridSizeInput = getRequiredElementById("slimeAvailabilityGridSize");
const slimeAvailabilityGridSizeValue = getRequiredElementById("slimeAvailabilityGridSizeValue");
const slimeAvailabilityEffectiveMaxInput = getRequiredElementById("slimeAvailabilityEffectiveMax");
const slimeAvailabilityEffectiveMaxValue = getRequiredElementById("slimeAvailabilityEffectiveMaxValue");
const slimeAvailabilityUpdateTickIntervalInput = getRequiredElementById("slimeAvailabilityUpdateTickInterval");
const slimeAvailabilityUpdateTickIntervalValue = getRequiredElementById("slimeAvailabilityUpdateTickIntervalValue");
const slimePlantStockSyncTickIntervalInput = getRequiredElementById("slimePlantStockSyncTickInterval");
const slimePlantStockSyncTickIntervalValue = getRequiredElementById("slimePlantStockSyncTickIntervalValue");
const slimeSensorDistanceInput = getRequiredElementById("slimeSensorDistance");
const slimeSensorDistanceValue = getRequiredElementById("slimeSensorDistanceValue");
const slimeSensorAngleInput = getRequiredElementById("slimeSensorAngle");
const slimeSensorAngleValue = getRequiredElementById("slimeSensorAngleValue");
const slimeSensorSizeInput = getRequiredElementById("slimeSensorSize");
const slimeSensorSizeValue = getRequiredElementById("slimeSensorSizeValue");
const slimeSensorNoiseInput = getRequiredElementById("slimeSensorNoise");
const slimeSensorNoiseValue = getRequiredElementById("slimeSensorNoiseValue");
const slimeStepSizeInput = getRequiredElementById("slimeStepSize");
const slimeStepSizeValue = getRequiredElementById("slimeStepSizeValue");
const slimeTurnAngleInput = getRequiredElementById("slimeTurnAngle");
const slimeTurnAngleValue = getRequiredElementById("slimeTurnAngleValue");
const slimeWanderChanceInput = getRequiredElementById("slimeWanderChance");
const slimeWanderChanceValue = getRequiredElementById("slimeWanderChanceValue");
const slimeWanderStrengthInput = getRequiredElementById("slimeWanderStrength");
const slimeWanderStrengthValue = getRequiredElementById("slimeWanderStrengthValue");
const slimeDepositAmountInput = getRequiredElementById("slimeDepositAmount");
const slimeDepositAmountValue = getRequiredElementById("slimeDepositAmountValue");
const slimeDepositSizeInput = getRequiredElementById("slimeDepositSize");
const slimeDepositSizeValue = getRequiredElementById("slimeDepositSizeValue");
const slimeDiffusionInput = getRequiredElementById("slimeDiffusion");
const slimeDiffusionValue = getRequiredElementById("slimeDiffusionValue");
const slimeDecayInput = getRequiredElementById("slimeDecay");
const slimeDecayValue = getRequiredElementById("slimeDecayValue");
const slimeTrailGainInput = getRequiredElementById("slimeTrailGain");
const slimeTrailGainValue = getRequiredElementById("slimeTrailGainValue");
const slimeTrailGammaInput = getRequiredElementById("slimeTrailGamma");
const slimeTrailGammaValue = getRequiredElementById("slimeTrailGammaValue");
const slimePaletteInput = getRequiredElementById("slimePalette");
const slimeWrapEdgesToggle = getRequiredElementById("slimeWrapEdges");
const slimeSpawnModeInput = getRequiredElementById("slimeSpawnMode");
const slimeUseTerrainToggle = getRequiredElementById("slimeUseTerrain");
const slimeShowTerrainUnderlayToggle = getRequiredElementById("slimeShowTerrainUnderlay");
const slimeTerrainMixInput = getRequiredElementById("slimeTerrainMix");
const slimeTerrainMixValue = getRequiredElementById("slimeTerrainMixValue");
const slimeSlopeBiasInput = getRequiredElementById("slimeSlopeBias");
const slimeSlopeBiasValue = getRequiredElementById("slimeSlopeBiasValue");
const slimeSlopeCutoffInput = getRequiredElementById("slimeSlopeCutoff");
const slimeSlopeCutoffValue = getRequiredElementById("slimeSlopeCutoffValue");
const slimeHeightBiasInput = getRequiredElementById("slimeHeightBias");
const slimeHeightBiasValue = getRequiredElementById("slimeHeightBiasValue");
const slimeHeightMinInput = getRequiredElementById("slimeHeightMin");
const slimeHeightMinValue = getRequiredElementById("slimeHeightMinValue");
const slimeHeightMaxInput = getRequiredElementById("slimeHeightMax");
const slimeHeightMaxValue = getRequiredElementById("slimeHeightMaxValue");
const slimeHeightBandWeightInput = getRequiredElementById("slimeHeightBandWeight");
const slimeHeightBandWeightValue = getRequiredElementById("slimeHeightBandWeightValue");
const slimeWaterBiasInput = getRequiredElementById("slimeWaterBias");
const slimeWaterBiasValue = getRequiredElementById("slimeWaterBiasValue");
const slimePlantBiasInput = getRequiredElementById("slimePlantBias");
const slimePlantBiasValue = getRequiredElementById("slimePlantBiasValue");
const slimePlantFloorInput = getRequiredElementById("slimePlantFloor");
const slimePlantFloorValue = getRequiredElementById("slimePlantFloorValue");
const slimePlantEatAmountInput = getRequiredElementById("slimePlantEatAmount");
const slimePlantEatAmountValue = getRequiredElementById("slimePlantEatAmountValue");
const slimePlantEatTickIntervalInput = getRequiredElementById("slimePlantEatTickInterval");
const slimePlantEatTickIntervalValue = getRequiredElementById("slimePlantEatTickIntervalValue");
const slimePlantRegenAmountInput = getRequiredElementById("slimePlantRegenAmount");
const slimePlantRegenAmountValue = getRequiredElementById("slimePlantRegenAmountValue");
const slimePlantRegenTickIntervalInput = getRequiredElementById("slimePlantRegenTickInterval");
const slimePlantRegenTickIntervalValue = getRequiredElementById("slimePlantRegenTickIntervalValue");
const slimeBrushRadiusInput = getRequiredElementById("slimeBrushRadius");
const slimeBrushRadiusValue = getRequiredElementById("slimeBrushRadiusValue");
const slimeBrushTrailClearInput = getRequiredElementById("slimeBrushTrailClear");
const slimeBrushTrailClearValue = getRequiredElementById("slimeBrushTrailClearValue");
const slimeSeedInput = getRequiredElementById("slimeSeed");
const slimeStatusValue = getRequiredElementById("slimeStatusValue");
const slimeStatsValue = getRequiredElementById("slimeStatsValue");
const interactionModeUiRuntime = createInteractionModeUiRuntime({
  pointLightGizmoToggle,
});
const pointLightIoUiRuntime = createPointLightIoUiRuntime({
  pointLightsLoadInput,
  pointLightsSaveAllBtn,
});
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
  defaultMapFolder: "assets/map3/",
  windowEl: window,
  applyMapSizeChangeIfNeeded: (...args) => applyMapSizeChangeIfNeeded(...args),
  resetCamera: () => resetCamera(),
  extractImageData: (...args) => extractImageDataRender(...args),
  uploadImageToTexture: (tex, image) => renderSupportRuntime.uploadImageToTexture(tex, image),
  rebuildFlowMapTexture: () => renderSupportRuntime.rebuildFlowMapTexture(),
  setFlowMapImage: (image) => {
    renderSupportRuntime.setFlowMapImage(image);
    if (waterParticleTrailRuntime) {
      waterParticleTrailRuntime.clear();
    }
  },
  syncMapStateToStore: () => syncMapStateToStore(),
  getPointLightBakeWorker: () => pointLightBakeRuntimeBinding.getWorker(),
  clamp: clampUtil,
  getNormalsImageData: () => normalsImageData,
  setSplatImageData: (value) => {
    splatImageData = value;
  },
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
    if (waterParticleTrailRuntime) {
      waterParticleTrailRuntime.clear();
    }
  },
  setWetnessImageData: (value) => {
    wetnessImageData = value;
  },
  setFlowImageData: (value) => {
    flowImageData = value;
    if (waterParticleTrailRuntime) {
      waterParticleTrailRuntime.clear();
    }
  },
  getSplatSize: () => splatSize,
  setSplatSize: (width, height) => {
    splatSize.width = width;
    splatSize.height = height;
  },
  getHeightSize: () => heightSize,
  setHeightSize: (width, height) => {
    heightSize.width = width;
    heightSize.height = height;
  },
  getNormalsSize: () => normalsSize,
  setNormalsSize: (width, height) => {
    normalsSize.width = width;
    normalsSize.height = height;
  },
  getSplatTex: () => splatTex,
  getNormalsTex: () => normalsTex,
  getHeightTex: () => heightTex,
  getSlopeTex: () => slopeTex,
  getWetnessTex: () => wetnessTex,
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
  defaultWaterTrailSettings: DEFAULT_WATER_TRAIL_SETTINGS,
  defaultDetailSettings: DEFAULT_DETAIL_SETTINGS,
  defaultCameraSettings: DEFAULT_CAMERA_SETTINGS,
  normalizeTimeRouting,
  normalizeRoutingMode,
  normalizeSimTickHours,
  getCoreState: () => runtimeCore.store.getState(),
  clamp: clampUtil,
  simSecondsPerHour: SIM_SECONDS_PER_HOUR,
  getSettingsRuntimeBinding: () => settingsRuntimeBinding,
  getCompatBindings: () => settingsCompatBindings,
}));
const {
  getDefaultTimeRouting,
  getConfiguredSimTickHours,
  getCurrentTimeRoutingFromStoreOrDefaults,
  getConfiguredSimTickHoursFromStoreOrDefaults,
  getInterpolatedRoutedTimeSec,
} = settingsCoreSetupRuntime.timeStateRuntime;
let settingsRuntimeBinding = null;
let settingsCompatBindings = null;
const simulationKnobAccess = settingsCoreSetupRuntime.simulationKnobAccess;
const settingsApplyRuntime = settingsCoreSetupRuntime.settingsApplyRuntime;
const settingsCompatRuntime = settingsCoreSetupRuntime.settingsCompatRuntime;
const audioSimulationState = { ...DEFAULT_AUDIO_SIMULATION_STATE };
const audioRuntimeState = createAudioRuntimeState();
const audioScribbleRuntime = createScribbleCanvasRuntime(256, 256);
const slimeGameplaySimulationState = { ...DEFAULT_SLIME_SIMULATION_STATE };
let slimeAvailabilityGrid = createEmptySlimeAvailabilityGrid(DEFAULT_SLIME_SETTINGS.availabilityGridSize);
let slimeAvailabilityOverlaySettings = {
  enabled: false,
  opacity: 1,
  threshold: 0.061,
  tracksKnowledgeCutoff: 0.2,
};
let slimeAvailabilityTickCounter = 0;
let slimePlantSyncTickCounter = 0;
let slimeFreeOverlayRefreshCounter = 0;
let tracksDiscoveryInitialized = false;

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
  serializeLightingSettingsCompat,
  applyLightingSettingsCompat,
  serializeFogSettingsCompat,
  applyFogSettingsCompat,
  serializeCloudSettingsCompat,
  applyCloudSettingsCompat,
  serializeWaterSettingsCompat,
  applyWaterSettingsCompat,
  serializeDetailSettingsCompat,
  applyDetailSettingsCompat,
  serializeCameraSettingsCompat,
  applyCameraSettingsCompat,
  serializeInteractionSettingsCompat,
  applyInteractionSettingsCompat,
  serializeAudioSettingsCompat,
  applyAudioSettingsCompat,
  serializeSwarmDataCompat,
  applySwarmSettingsCompat,
  applySwarmData,
  syncPathfindingSettingsUi,
  serializeLightingSettings,
  applyLightingSettings,
  serializeFogSettings,
  applyFogSettings,
  serializeCloudSettings,
  applyCloudSettings,
  serializeWaterSettings,
  applyWaterSettings,
  serializeDetailSettings,
  applyDetailSettings,
  serializeCameraSettings,
  applyCameraSettings,
  serializeInteractionSettings,
  applyInteractionSettings,
  serializeAudioSettings,
  applyAudioSettings,
  serializeSwarmData,
  applySwarmSettings,
} = settingsCompatRuntime;
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
  getZoomMin,
  getZoomMax,
  normalizeRoutingMode,
  getCurrentMapFolderPath,
  getSplatSize: () => splatSize,
  getCursorLightState: () => cursorLightState,
  updateStoreFromAppliedSettings: (key, normalized) =>
    settingsApplyRuntime.updateStoreFromAppliedSettings(key, normalized),
  normalizeAppliedSettings: (key, rawData, fallbackDefaults) =>
    settingsApplyRuntime.normalizeAppliedSettings(key, rawData, fallbackDefaults),
  applySwarmSettingsCompat,
  getStopSwarmFollow: () => stopSwarmFollow,
  getSwarmState: () => swarmState,
});
function getSettingsDefaults(key, fallback) {
  return settingsCompatRuntime.getSettingsDefaults(key, fallback);
}

function getAudioSettings() {
  return getSimulationKnobSectionFromStore("audio") || getSettingsDefaults("audio", DEFAULT_AUDIO_SETTINGS);
}

function getAudioSimulationState() {
  return audioSimulationState;
}

function getSlimeSettings() {
  return normalizeSlimeSettings(
    getSimulationKnobSectionFromStore("slime") || getSettingsDefaults("slime", DEFAULT_SLIME_SETTINGS),
    DEFAULT_SLIME_SETTINGS,
  );
}

function getDetailSettings() {
  return getSimulationKnobSectionFromStore("detail") || getSettingsDefaults("detail", DEFAULT_DETAIL_SETTINGS);
}

function getCameraSettings() {
  return getSimulationKnobSectionFromStore("camera") || getSettingsDefaults("camera", DEFAULT_CAMERA_SETTINGS);
}

function smoothstepValue(edge0, edge1, value) {
  const span = Math.max(0.0001, Number(edge1) - Number(edge0));
  const t = clamp((Number(value) - Number(edge0)) / span, 0, 1);
  return t * t * (3 - 2 * t);
}

function getDetailDebugInfo() {
  const camera = getCameraRuntimeBinding().getActiveCameraState();
  const viewHalf = getCameraRuntimeBinding().getViewHalfExtents(camera.zoom);
  const mapPixelWorldSize = 1 / Math.max(1, Number(heightSize.height) || 1);
  const pxPerMeterX = (canvas.width * mapPixelWorldSize) / Math.max(0.001, 2 * viewHalf.x);
  const pxPerMeterY = (canvas.height * mapPixelWorldSize) / Math.max(0.001, 2 * viewHalf.y);
  const pxPerMeter = Math.min(pxPerMeterX, pxPerMeterY);
  const detail = serializeDetailSettings();
  const startPxPerMeter = clamp(Number(detail.zoom.startPxPerMeter), 0, 512);
  const fullPxPerMeter = Math.max(startPxPerMeter + 0.001, clamp(Number(detail.zoom.fullPxPerMeter), 0, 1024));
  return {
    zoom: camera.zoom,
    pxPerMeter,
    pxPerMeterX,
    pxPerMeterY,
    startPxPerMeter,
    fullPxPerMeter,
    fade: smoothstepValue(startPxPerMeter, fullPxPerMeter, pxPerMeter),
    atlasAvailable: Boolean(detailAtlasState.available),
    loadedSourceCount: Number(detailAtlasState.loadedSourceCount) || 0,
    materialSplatAvailable: Boolean(detailAtlasState.materialSplatAvailable),
  };
}

function getFrameDebugInfo() {
  const nowMs = Number(runtimeCore.frame.lastNowMs);
  const dtSec = Number(runtimeCore.frame.lastDtSec);
  if (!Number.isFinite(nowMs) || !Number.isFinite(dtSec) || dtSec <= 0) {
    return null;
  }
  return {
    nowMs,
    frameMs: dtSec * 1000,
    profile: runtimeCore.frame.profile || null,
    gpuProfile: renderer && typeof renderer.getGpuProfile === "function"
      ? renderer.getGpuProfile()
      : null,
  };
}

function getZoomBounds() {
  const camera = getCameraSettings();
  return {
    min: clamp(Number(camera.zoomMin), 0.05, 32),
    max: clamp(Number(camera.zoomMax), Math.max(0.05, Number(camera.zoomMin) || 0.05), 512),
  };
}

function getZoomMin() {
  return getZoomBounds().min;
}

function getZoomMax() {
  return getZoomBounds().max;
}

function clampCameraToBounds() {
  const state = runtimeCore.store.getState();
  const camera = state.camera || {};
  const bounds = getZoomBounds();
  const zoom = clamp(Number(camera.zoom), bounds.min, bounds.max);
  if (zoom === camera.zoom) return;
  mainRuntimeStateBinding.setCameraPoseToStore(
    Number.isFinite(Number(camera.panX)) ? Number(camera.panX) : 0,
    Number.isFinite(Number(camera.panY)) ? Number(camera.panY) : 0,
    zoom,
  );
}

let detailAtlasRuntime = null;
let detailPanelRuntime = null;
let waterParticleTrailRuntime = null;
function rebuildDetailAtlas() {
  if (!detailAtlasRuntime) return Promise.resolve(null);
  return detailAtlasRuntime.rebuild(getDetailSettings());
}

function syncDetailUi() {
  if (detailPanelRuntime) {
    detailPanelRuntime.syncDetailUi();
  }
}

function getSlimeSimulationState() {
  return slimeGameplaySimulationState;
}

function getGameplaySlimeSimulationState() {
  return slimeGameplaySimulationState;
}

function setSlimeRuntimeError(state, error) {
  state.error = error instanceof Error ? error.message : String(error);
  return state.error;
}

const audioEngineRuntime = createAudioEngineRuntime({
  runtime: audioRuntimeState,
  getSettings: () => getAudioSettings(),
  setPlaying: (isPlaying) => {
    audioSimulationState.isPlaying = Boolean(isPlaying);
  },
});

const audioAnalysisRuntime = createAudioAnalysisRuntime();

const spectrogramRuntime = createSpectrogramRuntime({
  canvas: audioSpectrogramCanvas,
  runtime: audioRuntimeState,
  getSettings: () => getAudioSettings(),
  getAudioContext: () => audioRuntimeState.audioContext,
  getAnalyserNode: () => audioRuntimeState.analyserNode,
  getFrequencyData: () => audioRuntimeState.frequencyData,
  requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
  cancelAnimationFrame: (id) => window.cancelAnimationFrame(id),
});

const resynthesisRuntime = createResynthesisRuntime({
  scribble: audioScribbleRuntime,
});
const synthesisRuntime = createSynthesisRuntime();

function redrawAudioSpectrogram() {
  spectrogramRuntime.drawStaticSpectrogram(audioRuntimeState.stft, audioScribbleRuntime);
}

function redrawSynthesisWaveform() {
  synthesisRuntime.drawWaveform(audioSynthesisCanvas, getAudioSettings().synthesis);
}

function getSoundscapeSettings() {
  return normalizeSoundscapeSettings(getAudioSettings().soundscape, DEFAULT_AUDIO_SETTINGS.soundscape);
}

function getSoundscapeSynthesisSettings() {
  return soundscapeToSynthesisSettings(getSoundscapeSettings(), DEFAULT_AUDIO_SETTINGS.soundscape);
}

function getLiveSoundscapeSynthesisSettings(nowSec = 0) {
  return soundscapeToLiveSynthesisSettings(
    getSoundscapeSettings(),
    DEFAULT_AUDIO_SETTINGS.soundscape,
    audioRuntimeState.soundscapeLayerStates,
    nowSec,
  );
}

function redrawSoundscapeWaveform() {
  synthesisRuntime.drawWaveform(audioSoundscapeCanvas, getSoundscapeSynthesisSettings());
}

const audioScribbleInputRuntime = createAudioScribbleInputRuntime({
  canvas: audioSpectrogramCanvas,
  scribble: audioScribbleRuntime,
  getSettings: () => getAudioSettings(),
  getStft: () => audioRuntimeState.stft,
  redraw: () => redrawAudioSpectrogram(),
});
audioScribbleInputRuntime.bind();

const audioPanelRuntime = createAudioPanelRuntime({
  getAudioSettings: () => getAudioSettings(),
  getAudioSimulationState: () => getAudioSimulationState(),
  audioModeButtons,
  audioModeSurfaces,
  audioControlPanels,
  audioMinHzInput,
  audioMaxHzInput,
  audioBrushSizeInput,
  audioBrushSizeValue,
  audioBrushStrengthInput,
  audioBrushStrengthValue,
  audioEraseModeToggle,
  audioAutoThresholdInput,
  audioAutoThresholdValue,
  audioAutoContrastInput,
  audioAutoContrastValue,
  audioAutoGainInput,
  audioAutoGainValue,
  audioAutoClearToggle,
  audioApproxMaxStrokesInput,
  audioApproxMinStrengthInput,
  audioApproxMinStrengthValue,
  audioMasterGainInput,
  audioMasterGainValue,
  audioPlaybackRateInput,
  audioPlaybackRateValue,
  audioSynthesisDurationInput,
  audioSynthesisDurationValue,
  audioSynthesisMasterGainInput,
  audioSynthesisMasterGainValue,
  audioSynthesisLoopToggle,
  audioSynthesisOscillatorList,
  audioSoundscapeRootInput,
  audioSoundscapeScaleInput,
  audioSoundscapeDurationInput,
  audioSoundscapeDurationValue,
  audioSoundscapeMasterGainInput,
  audioSoundscapeMasterGainValue,
  audioSoundscapeLoopToggle,
  audioSoundscapeSeedInput,
  audioSoundscapeLayerList,
  getSoundscapeLayerFrequency: (settings, layer) => soundscapeLayerToFrequency(settings, layer),
  getSoundscapeScaleDegreeCount,
  audioStatusValue,
  audioFileStatusValue,
  drawSynthesisWaveform: () => redrawSynthesisWaveform(),
  drawSoundscapeWaveform: () => redrawSoundscapeWaveform(),
});

function syncAudioUi() {
  audioPanelRuntime.syncAudioUi();
}

const slimePanelRuntime = createSlimePanelRuntime({
  getSlimeSettings: () => getSlimeSettings(),
  getSlimeSimulationState: () => getSlimeSimulationState(),
  slimeStartBtn,
  slimeStopBtn,
  slimeAgentCountInput,
  slimeAgentCountValue,
  slimeSimSizeInput,
  slimeStepsPerFrameInput,
  slimeStepsPerFrameValue,
  slimeTimeModeInput,
  slimeStepsPerGameTickInput,
  slimeStepsPerGameTickValue,
  slimeWarmupEnabledInput,
  slimeWarmupStepsInput,
  slimeWarmupStepsValue,
  slimeAvailabilityGridSizeInput,
  slimeAvailabilityGridSizeValue,
  slimeAvailabilityEffectiveMaxInput,
  slimeAvailabilityEffectiveMaxValue,
  slimeAvailabilityUpdateTickIntervalInput,
  slimeAvailabilityUpdateTickIntervalValue,
  slimePlantStockSyncTickIntervalInput,
  slimePlantStockSyncTickIntervalValue,
  slimeSensorDistanceInput,
  slimeSensorDistanceValue,
  slimeSensorAngleInput,
  slimeSensorAngleValue,
  slimeSensorSizeInput,
  slimeSensorSizeValue,
  slimeSensorNoiseInput,
  slimeSensorNoiseValue,
  slimeStepSizeInput,
  slimeStepSizeValue,
  slimeTurnAngleInput,
  slimeTurnAngleValue,
  slimeWanderChanceInput,
  slimeWanderChanceValue,
  slimeWanderStrengthInput,
  slimeWanderStrengthValue,
  slimeDepositAmountInput,
  slimeDepositAmountValue,
  slimeDepositSizeInput,
  slimeDepositSizeValue,
  slimeDiffusionInput,
  slimeDiffusionValue,
  slimeDecayInput,
  slimeDecayValue,
  slimeTrailGainInput,
  slimeTrailGainValue,
  slimeTrailGammaInput,
  slimeTrailGammaValue,
  slimePaletteInput,
  slimeWrapEdgesToggle,
  slimeSpawnModeInput,
  slimeUseTerrainToggle,
  slimeShowTerrainUnderlayToggle,
  slimeTerrainMixInput,
  slimeTerrainMixValue,
  slimeSlopeBiasInput,
  slimeSlopeBiasValue,
  slimeSlopeCutoffInput,
  slimeSlopeCutoffValue,
  slimeHeightBiasInput,
  slimeHeightBiasValue,
  slimeHeightMinInput,
  slimeHeightMinValue,
  slimeHeightMaxInput,
  slimeHeightMaxValue,
  slimeHeightBandWeightInput,
  slimeHeightBandWeightValue,
  slimeWaterBiasInput,
  slimeWaterBiasValue,
  slimePlantBiasInput,
  slimePlantBiasValue,
  slimePlantFloorInput,
  slimePlantFloorValue,
  slimePlantEatAmountInput,
  slimePlantEatAmountValue,
  slimePlantEatTickIntervalInput,
  slimePlantEatTickIntervalValue,
  slimePlantRegenAmountInput,
  slimePlantRegenAmountValue,
  slimePlantRegenTickIntervalInput,
  slimePlantRegenTickIntervalValue,
  slimeBrushRadiusInput,
  slimeBrushRadiusValue,
  slimeBrushTrailClearInput,
  slimeBrushTrailClearValue,
  slimeSeedInput,
  slimeStatusValue,
  slimeStatsValue,
});

function syncSlimeUi() {
  slimePanelRuntime.syncSlimeUi();
}

function syncSlimeAvailabilityDebugUi() {
  if (slimeAvailabilityOverlayEnabledInput) {
    slimeAvailabilityOverlayEnabledInput.checked = slimeAvailabilityOverlaySettings.enabled === true;
  }
  if (slimeAvailabilityOverlayOpacityInput) {
    slimeAvailabilityOverlayOpacityInput.value = String(slimeAvailabilityOverlaySettings.opacity);
  }
  if (slimeAvailabilityOverlayOpacityValue) {
    slimeAvailabilityOverlayOpacityValue.textContent = Number(slimeAvailabilityOverlaySettings.opacity).toFixed(2);
  }
  if (slimeAvailabilityOverlayThresholdInput) {
    slimeAvailabilityOverlayThresholdInput.value = String(slimeAvailabilityOverlaySettings.threshold);
  }
  if (slimeAvailabilityOverlayThresholdValue) {
    slimeAvailabilityOverlayThresholdValue.textContent = Number(slimeAvailabilityOverlaySettings.threshold).toFixed(3);
  }
  const slimeSettings = getSlimeSettings();
  if (slimeGameTicksPerSlimeStepInput) {
    slimeGameTicksPerSlimeStepInput.value = String(slimeSettings.gameTicksPerSlimeStep);
  }
  if (slimeGameTicksPerSlimeStepValue) {
    slimeGameTicksPerSlimeStepValue.textContent = String(Math.round(Number(slimeSettings.gameTicksPerSlimeStep) || 1));
  }
  if (slimeHuntingFleeStepsInput) {
    slimeHuntingFleeStepsInput.value = String(slimeSettings.huntingFleeSteps);
  }
  if (slimeHuntingFleeStepsValue) {
    slimeHuntingFleeStepsValue.textContent = String(Math.round(Number(slimeSettings.huntingFleeSteps) || 0));
  }
  if (slimeHuntingFleeWeightInput) {
    slimeHuntingFleeWeightInput.value = String(slimeSettings.huntingFleeWeight);
  }
  if (slimeHuntingFleeWeightValue) {
    slimeHuntingFleeWeightValue.textContent = Number(slimeSettings.huntingFleeWeight || 0).toFixed(1);
  }
  if (slimeHuntingFleeRadiusInput) {
    slimeHuntingFleeRadiusInput.value = String(slimeSettings.huntingFleeRadius);
  }
  if (slimeHuntingFleeRadiusValue) {
    slimeHuntingFleeRadiusValue.textContent = String(Math.round(Number(slimeSettings.huntingFleeRadius) || 1));
  }
  if (slimeTracksKnowledgeCutoffInput) {
    slimeTracksKnowledgeCutoffInput.value = String(slimeAvailabilityOverlaySettings.tracksKnowledgeCutoff);
  }
  if (slimeTracksKnowledgeCutoffValue) {
    slimeTracksKnowledgeCutoffValue.textContent = Number(slimeAvailabilityOverlaySettings.tracksKnowledgeCutoff).toFixed(2);
  }
  if (slimeAvailabilityReadout) {
    const grid = slimeAvailabilityGrid;
    if (grid && grid.version && grid.data) {
      let max = 0;
      let activeCells = 0;
      const threshold = Number(slimeAvailabilityOverlaySettings.threshold) || 0;
      for (let i = 0; i < grid.data.length; i++) {
        const value = Number(grid.data[i]) || 0;
        if (value > max) max = value;
        if (value >= threshold) activeCells += 1;
      }
      const runtime = getGameplaySlimeRuntime();
      const textureVersion = runtime && typeof runtime.getTrailTextureVersion === "function"
        ? ` | trail tex v${runtime.getTrailTextureVersion()}`
        : "";
      slimeAvailabilityReadout.textContent = `${grid.width}x${grid.height} | max ${max.toFixed(3)} | cells ${activeCells} | v${grid.version}${textureVersion}`;
    } else {
      slimeAvailabilityReadout.textContent = getGameplaySlimeSimulationState().running
        ? "waiting for first trail readback"
        : "not running";
    }
  }
}

function isInspectTracksOverlayActive() {
  const inspect = getInspectSnapshot();
  if (!inspect || inspect.enabled !== true || inspect.layer !== "tracks") return false;
  return !isInspectBlockedByActivity(getActivitySnapshot());
}

function shouldRenderSlimeTrailOverlay() {
  return slimeAvailabilityOverlaySettings.enabled === true || isInspectTracksOverlayActive();
}

function getSlimeTrailOverlaySnapshot() {
  if (!shouldRenderSlimeTrailOverlay()) return null;
  const settings = getSlimeSettings();
  const runtime = getGameplaySlimeRuntime();
  const texture = typeof runtime.getTrailTexture === "function" ? runtime.getTrailTexture() : null;
  if (texture) {
    return {
      texture,
      rawTrail: true,
      width: settings.simSize,
      height: settings.simSize,
      version: typeof runtime.getTrailTextureVersion === "function" ? runtime.getTrailTextureVersion() : 0,
      gain: settings.trailGain,
      gamma: settings.trailGamma,
      threshold: slimeAvailabilityOverlaySettings.threshold,
      opacity: slimeAvailabilityOverlaySettings.opacity,
      tracksMask: isInspectTracksOverlayActive()
        ? resourceDiscoveryRuntime?.getSnapshot(TRACKS_KNOWLEDGE_MAP_ID)
        : null,
      tracksKnowledgeCutoff: slimeAvailabilityOverlaySettings.tracksKnowledgeCutoff,
    };
  }
  return null;
}

function getSlimeTerrainUnderlaySnapshot() {
  const settings = getSlimeSettings();
  if (!settings || settings.enabled !== true || settings.showTerrainUnderlay !== true) return null;
  const runtime = getGameplaySlimeRuntime();
  const plantTexture = runtime && typeof runtime.getPlantTexture === "function"
    ? runtime.getPlantTexture()
    : null;
  if (!plantTexture) return null;
  return {
    enabled: true,
    plantTexture,
  };
}

const slimeMainRenderRuntime = createSlimeMainRenderRuntime({
  canvas,
  gl,
  state: slimeGameplaySimulationState,
  getTerrainSource: () => ({
    heightImageData,
    slopeImageData,
    waterImageData,
    plantBaseImageData: getSlimePlantBaseResourceImageData(),
    plantStockImageData: getSlimePlantResourceImageData(),
  }),
  onFrame: () => handleSlimeRuntimeFrame(),
});

function getGameplaySlimeRuntime() {
  return slimeMainRenderRuntime;
}

function serializeSlimeSettingsCompatImpl() {
  return getSlimeSettings();
}

function applySlimeSettingsCompatImpl(rawData) {
  const next = normalizeSlimeSettings(rawData, getSlimeSettings());
  settingsApplyRuntime.updateStoreFromAppliedSettings("slime", next);
  slimeMainRenderRuntime.applySettings(next);
  if (next.enabled) {
    slimeMainRenderRuntime.start(next);
  } else {
    slimeMainRenderRuntime.stop();
  }
  syncSlimeUi();
  syncSlimeAvailabilityDebugUi();
}

function patchSlimeSettings(patch) {
  const next = normalizeSlimeSettings({
    ...getSlimeSettings(),
    ...(patch && typeof patch === "object" ? patch : {}),
  }, DEFAULT_SLIME_SETTINGS);
  try {
    slimeMainRenderRuntime.applySettings(next);
    settingsApplyRuntime.updateStoreFromAppliedSettings("slime", next);
  } catch (error) {
    const message = setSlimeRuntimeError(slimeGameplaySimulationState, error);
    setStatus(`Slime settings failed: ${message}`);
  }
  syncSlimeUi();
  syncSlimeAvailabilityDebugUi();
}

function refreshSlimeAvailabilityGrid(force = false) {
  const settings = getSlimeSettings();
  if (!force && settings.timeMode !== "gameTick") return false;
  try {
    const runtime = getGameplaySlimeRuntime();
    const grid = runtime.readTrailAvailabilityGrid({
      gridSize: settings.availabilityGridSize,
      effectiveMax: settings.availabilityEffectiveMax,
      threshold: slimeAvailabilityOverlaySettings.threshold,
      gain: settings.trailGain,
      gamma: settings.trailGamma,
    });
    if (!grid) return false;
    slimeAvailabilityGrid = grid;
    syncSlimeAvailabilityDebugUi();
    overlayDirtyRuntime.requestOverlayDraw();
    return true;
  } catch (error) {
    const message = setSlimeRuntimeError(slimeGameplaySimulationState, error);
    setStatus(`Slime availability readback failed: ${message}`);
    syncSlimeUi();
    return false;
  }
}

function syncSlimePlantStockToGameplay() {
  if (!resourceStockRuntime || typeof resourceStockRuntime.applyStockImageData !== "function") return false;
  const stockSnapshot = typeof resourceStockRuntime.getSnapshot === "function"
    ? resourceStockRuntime.getSnapshot("plants")
    : null;
  const runtime = getGameplaySlimeRuntime();
  const plantStockFactor = typeof runtime.readPlantStockFactorImageData === "function"
    ? runtime.readPlantStockFactorImageData({
      width: stockSnapshot?.width || getSlimeSettings().availabilityGridSize,
      height: stockSnapshot?.height || getSlimeSettings().availabilityGridSize,
    })
    : null;
  if (!plantStockFactor || !plantStockFactor.data) return false;
  const changed = resourceStockRuntime.applyStockImageData("plants", plantStockFactor, {
    channelOffset: 0,
    updateKnown: "lower",
    onlyLower: true,
  });
  if (changed) {
    slimePlantResourceCache = null;
  }
  return changed;
}

function updateSlimeForGameTicks(ctx = {}) {
  const settings = getSlimeSettings();
  if (!getGameplaySlimeSimulationState().running || settings.timeMode !== "gameTick") return;
  const ticks = Math.max(0, Math.round(Number(ctx.time && ctx.time.ticksProcessed) || 0));
  if (ticks <= 0) return;
  const steps = getGameplaySlimeRuntime().stepGameTicks(ticks, settings);
  if (steps <= 0) return;
  conditionEffectRuntime?.tickTemporaryEffects?.(steps);
  slimeAvailabilityTickCounter += steps;
  slimePlantSyncTickCounter += steps;
  const interval = Math.max(1, Math.round(Number(settings.availabilityUpdateTickInterval) || 1));
  const plantInterval = Math.max(10, Math.round(Number(settings.plantStockSyncTickInterval) || 120));
  if (slimeAvailabilityTickCounter >= interval) {
    slimeAvailabilityTickCounter = 0;
    refreshSlimeAvailabilityGrid(true);
  }
  if (slimePlantSyncTickCounter >= plantInterval) {
    slimePlantSyncTickCounter = 0;
    syncSlimePlantStockToGameplay();
  }
}

function waitForStartupPaint() {
  return new Promise((resolve) => {
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    window.setTimeout(resolve, 0);
  });
}

function resetSkippedSlimeWarmupState(settings = getSlimeSettings()) {
  slimeAvailabilityGrid = createEmptySlimeAvailabilityGrid(settings.availabilityGridSize);
  slimeAvailabilityTickCounter = 0;
  slimePlantSyncTickCounter = 0;
  slimeFreeOverlayRefreshCounter = 0;
  slimePlantResourceCache = null;
  syncSlimeAvailabilityDebugUi();
  overlayDirtyRuntime.requestOverlayDraw();
}

async function warmupSlimeOnMapLoaded() {
  const settings = getSlimeSettings();
  if (!settings.enabled) {
    resetSkippedSlimeWarmupState(settings);
    return false;
  }
  if (settings.warmupEnabled === false) {
    resetSkippedSlimeWarmupState(settings);
    return false;
  }
  const steps = Math.max(0, Math.round(Number(settings.warmupSteps) || 0));
  const runtime = getGameplaySlimeRuntime();
  if (steps <= 0 || typeof runtime.warmupSteps !== "function") {
    resetSkippedSlimeWarmupState(settings);
    return false;
  }
  try {
    runtime.start(settings);
    let completed = 0;
    const chunkSize = Math.max(50, Math.min(250, Math.ceil(steps / 20)));
    while (completed < steps) {
      const requested = Math.min(chunkSize, steps - completed);
      const chunkCompleted = runtime.warmupSteps(requested, settings);
      if (chunkCompleted <= 0) break;
      completed += chunkCompleted;
      const progress = 0.72 + (0.22 * (completed / steps));
      setStatus(`Warming Slime trails: ${completed}/${steps} steps...`, { progress });
      await waitForStartupPaint();
    }
    if (completed <= 0) {
      resetSkippedSlimeWarmupState(settings);
      return false;
    }
    slimeAvailabilityTickCounter = 0;
    slimePlantSyncTickCounter = 0;
    setStatus("Syncing Slime plant stock...", { progress: 0.95 });
    syncSlimePlantStockToGameplay();
    setStatus("Reading Slime trail availability...", { progress: 0.97 });
    refreshSlimeAvailabilityGrid(true);
    setStatus(`Slime warmup completed: ${completed} steps.`, { progress: 0.99 });
    return true;
  } catch (error) {
    const message = setSlimeRuntimeError(slimeGameplaySimulationState, error);
    setStatus(`Slime warmup failed: ${message}`);
    syncSlimeUi();
    return false;
  }
}

async function finalizeMapGameplayState() {
  setStatus("Loading map event definitions...", { progress: 0.705 });
  await reloadEventDefinitionsForCurrentMap();
  setStatus("Initializing gameplay knowledge map...", { progress: 0.71 });
  resetKnowledgeMapForConfig();
  await warmupSlimeOnMapLoaded();
}

function handleSlimeRuntimeFrame() {
  syncSlimeUi();
  const settings = getSlimeSettings();
  if (!getGameplaySlimeSimulationState().running || settings.timeMode === "gameTick" || !shouldRenderSlimeTrailOverlay()) return;
  slimeFreeOverlayRefreshCounter += 1;
  const interval = Math.max(3, Math.round(Number(settings.availabilityUpdateTickInterval) || 1));
  if (slimeFreeOverlayRefreshCounter < interval) return;
  slimeFreeOverlayRefreshCounter = 0;
  refreshSlimeAvailabilityGrid(true);
}

slimeSaveBtn.addEventListener("click", () => {
  saveSlimeSettingsFile();
});
slimeAvailabilityOverlayEnabledInput.addEventListener("change", () => {
  slimeAvailabilityOverlaySettings.enabled = slimeAvailabilityOverlayEnabledInput.checked;
  if (slimeAvailabilityOverlaySettings.enabled) {
    refreshSlimeAvailabilityGrid(true);
  }
  syncSlimeAvailabilityDebugUi();
  overlayDirtyRuntime.requestOverlayDraw();
});
slimeAvailabilityOverlayOpacityInput.addEventListener("input", () => {
  slimeAvailabilityOverlaySettings.opacity = clampUtil(Number(slimeAvailabilityOverlayOpacityInput.value) || 0, 0, 1);
  if (shouldRenderSlimeTrailOverlay()) {
    refreshSlimeAvailabilityGrid(true);
  }
  syncSlimeAvailabilityDebugUi();
  overlayDirtyRuntime.requestOverlayDraw();
});
slimeAvailabilityOverlayThresholdInput.addEventListener("input", () => {
  slimeAvailabilityOverlaySettings.threshold = clampUtil(Number(slimeAvailabilityOverlayThresholdInput.value) || 0, 0, 1);
  if (shouldRenderSlimeTrailOverlay()) {
    refreshSlimeAvailabilityGrid(true);
  }
  syncSlimeAvailabilityDebugUi();
  overlayDirtyRuntime.requestOverlayDraw();
});
slimeGameTicksPerSlimeStepInput.addEventListener("input", () => {
  const value = Math.round(clampUtil(Number(slimeGameTicksPerSlimeStepInput.value) || 1, 1, 10));
  patchSlimeSettings({ gameTicksPerSlimeStep: value });
  syncSlimeAvailabilityDebugUi();
});
slimeHuntingFleeStepsInput.addEventListener("input", () => {
  const value = Math.round(clampUtil(Number(slimeHuntingFleeStepsInput.value) || 0, 0, 1000));
  patchSlimeSettings({ huntingFleeSteps: value });
  syncSlimeAvailabilityDebugUi();
});
slimeHuntingFleeWeightInput.addEventListener("input", () => {
  const value = clampUtil(Number(slimeHuntingFleeWeightInput.value) || 0, 0, 200);
  patchSlimeSettings({ huntingFleeWeight: value });
  syncSlimeAvailabilityDebugUi();
});
slimeHuntingFleeRadiusInput.addEventListener("input", () => {
  const value = Math.round(clampUtil(Number(slimeHuntingFleeRadiusInput.value) || 1, 1, 512));
  patchSlimeSettings({ huntingFleeRadius: value });
  syncSlimeAvailabilityDebugUi();
});
slimeTracksKnowledgeCutoffInput.addEventListener("input", () => {
  slimeAvailabilityOverlaySettings.tracksKnowledgeCutoff = clampUtil(Number(slimeTracksKnowledgeCutoffInput.value) || 0, 0, 1);
  updateTracksDiscoveryOverlayState();
});
slimeTracksClearBtn.addEventListener("click", () => {
  tracksDiscoveryInitialized = true;
  resourceDiscoveryRuntime?.fill(TRACKS_KNOWLEDGE_MAP_ID, 0);
  updateTracksDiscoveryOverlayState("Track Knowledge cleared.");
});
slimeTracksFillBtn.addEventListener("click", () => {
  tracksDiscoveryInitialized = true;
  resourceDiscoveryRuntime?.fill(TRACKS_KNOWLEDGE_MAP_ID, 1);
  updateTracksDiscoveryOverlayState("Track Knowledge filled.");
});
slimeTracksNoiseBtn.addEventListener("click", () => {
  tracksDiscoveryInitialized = true;
  seedDiscoveryNoise(TRACKS_KNOWLEDGE_MAP_ID);
  updateTracksDiscoveryOverlayState("Track Knowledge noise populated.");
});
syncSlimeAvailabilityDebugUi();

function startSlimeExperiment() {
  try {
    const settings = getSlimeSettings();
    slimeMainRenderRuntime.start(settings);
    if (settings.timeMode === "gameTick") {
      slimeMainRenderRuntime.stepGameTicks(1, settings);
      refreshSlimeAvailabilityGrid(true);
    }
  } catch (error) {
    const message = setSlimeRuntimeError(slimeGameplaySimulationState, error);
    setStatus(`Slime start failed: ${message}`);
  }
}

function stopSlimeExperiment() {
  slimeMainRenderRuntime.stop();
}

function resetSlimeExperiment() {
  try {
    const settings = getSlimeSettings();
    slimeMainRenderRuntime.reset(settings);
    if (settings.enabled) {
      slimeMainRenderRuntime.start(settings);
    }
  } catch (error) {
    const message = setSlimeRuntimeError(slimeGameplaySimulationState, error);
    setStatus(`Slime reset failed: ${message}`);
  }
}

function syncAudioEngine() {
  audioEngineRuntime.syncMasterGain();
  audioEngineRuntime.syncAnalyserSettings();
  if (audioRuntimeState.stft && audioSimulationState.playbackKind !== "osc") {
    redrawAudioSpectrogram();
  }
  if (audioSimulationState.isPlaying && audioSimulationState.playbackKind === "osc") {
    spectrogramRuntime.start();
  }
  redrawSynthesisWaveform();
  redrawSoundscapeWaveform();
}

function stopSynthesisAudio() {
  synthesisRuntime.stopLive(audioRuntimeState);
}

function stopSoundscapeEvolution() {
  if (audioRuntimeState.soundscapeFrameId !== null) {
    window.cancelAnimationFrame(audioRuntimeState.soundscapeFrameId);
    audioRuntimeState.soundscapeFrameId = null;
  }
}

function startSoundscapeEvolution() {
  stopSoundscapeEvolution();
  const tick = () => {
    if (!audioSimulationState.isPlaying || audioSimulationState.playbackKind !== "soundscape") {
      audioRuntimeState.soundscapeFrameId = null;
      return;
    }
    const context = audioRuntimeState.audioContext;
    if (context) {
      const nowSec = context.currentTime - audioRuntimeState.soundscapeStartedAtSec;
      const soundscape = getSoundscapeSettings();
      audioRuntimeState.soundscapeLayerStates = updateSoundscapeLayerRuntimeStates(
        soundscape,
        audioRuntimeState.soundscapeLayerStates,
        nowSec,
      );
      synthesisRuntime.updateLive(context, audioRuntimeState, getLiveSoundscapeSynthesisSettings(nowSec));
    }
    audioRuntimeState.soundscapeFrameId = window.requestAnimationFrame(tick);
  };
  audioRuntimeState.soundscapeFrameId = window.requestAnimationFrame(tick);
}

function patchAudioSettings(patch) {
  const current = serializeAudioSettingsCompatImpl();
  settingsApplyRuntime.updateStoreFromAppliedSettings("audio", {
    ...current,
    ...patch,
  });
  syncAudioUi();
  syncAudioEngine();
}

function getSynthesisSettings() {
  return normalizeSynthesisSettings(getAudioSettings().synthesis, DEFAULT_AUDIO_SETTINGS.synthesis);
}

function playAudio() {
  try {
    stopSoundscapeEvolution();
    stopSynthesisAudio();
    audioEngineRuntime.play();
    audioSimulationState.playbackKind = "osc";
    spectrogramRuntime.start();
    audioSimulationState.lastError = "";
  } catch (error) {
    audioSimulationState.lastError = error instanceof Error ? error.message : String(error);
    setStatus(`Audio play failed: ${audioSimulationState.lastError}`);
  }
}

async function loadAudioFile(file) {
  if (!file) return;
  try {
    const context = audioEngineRuntime.ensureContext();
    const bytes = await file.arrayBuffer();
    const decoded = await context.decodeAudioData(bytes.slice(0));
    const samples = audioAnalysisRuntime.audioBufferToMonoSamples(decoded);
    const settings = getAudioSettings();
    const stft = audioAnalysisRuntime.computeStft(samples, decoded.sampleRate, {
      windowSize: settings.fftSize,
      hopSize: settings.hopSize,
      windowType: settings.windowType,
    });
    audioRuntimeState.decodedAudioBuffer = decoded;
    audioRuntimeState.decodedFileName = file.name;
    audioRuntimeState.stft = stft;
    audioScribbleRuntime.resize(stft.segmentCount, stft.frequencyBinCount);
    audioSimulationState.hasInputSignal = true;
    audioSimulationState.durationSec = stft.durationSec;
    audioSimulationState.fileName = file.name;
    audioSimulationState.lastError = "";
    spectrogramRuntime.invalidateBase();
    redrawAudioSpectrogram();
    syncAudioUi();
    setStatus(`Loaded audio file: ${file.name}`);
  } catch (error) {
    audioSimulationState.lastError = error instanceof Error ? error.message : String(error);
    setStatus(`Audio file load failed: ${audioSimulationState.lastError}`);
    syncAudioUi();
  } finally {
    audioFileInput.value = "";
  }
}

function playOriginalAudio() {
  try {
    stopSoundscapeEvolution();
    stopSynthesisAudio();
    if (!audioRuntimeState.decodedAudioBuffer) {
      setStatus("Load an audio file first.");
      return;
    }
    audioEngineRuntime.playBuffer(audioRuntimeState.decodedAudioBuffer, {
      playbackRate: getAudioSettings().playbackRate,
    });
    audioSimulationState.playbackKind = "original";
    redrawAudioSpectrogram();
    syncAudioUi();
  } catch (error) {
    audioSimulationState.lastError = error instanceof Error ? error.message : String(error);
    setStatus(`Original playback failed: ${audioSimulationState.lastError}`);
  }
}

function playScribbleAudio() {
  try {
    stopSoundscapeEvolution();
    stopSynthesisAudio();
    if (!audioRuntimeState.stft) {
      setStatus("Load an audio file first.");
      return;
    }
    const context = audioEngineRuntime.ensureContext();
    const buffer = resynthesisRuntime.synthesizeScribbleToAudioBuffer(context, audioRuntimeState.stft, {
      gain: getAudioSettings().masterGain,
      minHz: getAudioSettings().minHz,
      maxHz: getAudioSettings().maxHz,
      frequencyScale: "log",
    });
    audioEngineRuntime.playBuffer(buffer, {
      playbackRate: getAudioSettings().playbackRate,
    });
    audioSimulationState.playbackKind = "scribble";
    redrawAudioSpectrogram();
    syncAudioUi();
  } catch (error) {
    audioSimulationState.lastError = error instanceof Error ? error.message : String(error);
    setStatus(`Scribble playback failed: ${audioSimulationState.lastError}`);
  }
}

function playSynthesisAudio() {
  try {
    stopSoundscapeEvolution();
    const context = audioEngineRuntime.ensureContext();
    const synthesis = getSynthesisSettings();
    stopSynthesisAudio();
    audioEngineRuntime.stop();
    synthesisRuntime.startLive(context, audioRuntimeState.analyserNode, audioRuntimeState, synthesis);
    audioSimulationState.isPlaying = true;
    audioSimulationState.playbackKind = "synthesis";
    audioSimulationState.durationSec = synthesis.durationSec;
    audioSimulationState.lastError = "";
    redrawSynthesisWaveform();
    syncAudioUi();
  } catch (error) {
    audioSimulationState.lastError = error instanceof Error ? error.message : String(error);
    setStatus(`Synthesis playback failed: ${audioSimulationState.lastError}`);
  }
}

function playSoundscapeAudio() {
  try {
    stopSoundscapeEvolution();
    const context = audioEngineRuntime.ensureContext();
    const soundscape = getSoundscapeSettings();
    audioRuntimeState.soundscapeStartedAtSec = context.currentTime;
    audioRuntimeState.soundscapeLayerStates = createSoundscapeLayerRuntimeState(soundscape, 0);
    const synthesis = getLiveSoundscapeSynthesisSettings(0);
    stopSynthesisAudio();
    audioEngineRuntime.stop();
    synthesisRuntime.startLive(context, audioRuntimeState.analyserNode, audioRuntimeState, synthesis);
    audioSimulationState.isPlaying = true;
    audioSimulationState.playbackKind = "soundscape";
    audioSimulationState.durationSec = soundscape.durationSec;
    audioSimulationState.lastError = "";
    startSoundscapeEvolution();
    redrawSoundscapeWaveform();
    syncAudioUi();
  } catch (error) {
    audioSimulationState.lastError = error instanceof Error ? error.message : String(error);
    setStatus(`Soundscape playback failed: ${audioSimulationState.lastError}`);
  }
}

function stopAudio() {
  const wasSoundscape = audioSimulationState.playbackKind === "soundscape";
  stopSoundscapeEvolution();
  if (wasSoundscape && audioRuntimeState.audioContext) {
    const maxReleaseSec = Math.max(
      0,
      ...getSoundscapeSettings().layers.map((layer) => Number(layer.releaseSec) || 0),
    );
    synthesisRuntime.stopLive(audioRuntimeState, {
      audioContext: audioRuntimeState.audioContext,
      releaseSec: maxReleaseSec,
    });
  } else {
    stopSynthesisAudio();
  }
  audioEngineRuntime.stop();
  audioSimulationState.playbackKind = "none";
  spectrogramRuntime.stop();
  redrawAudioSpectrogram();
  redrawSynthesisWaveform();
  redrawSoundscapeWaveform();
}

function setAudioMode(mode) {
  patchAudioSettings({ activeMode: ["spectrogram", "synthesis", "soundscape"].includes(mode) ? mode : "spectrogram" });
}

function updateSynthesisSettings(patch) {
  patchAudioSettings({
    synthesis: normalizeSynthesisSettings({
      ...getSynthesisSettings(),
      ...(patch && typeof patch === "object" ? patch : {}),
    }, DEFAULT_AUDIO_SETTINGS.synthesis),
  });
  if (audioSimulationState.isPlaying && audioSimulationState.playbackKind === "synthesis") {
    const context = audioRuntimeState.audioContext;
    if (context) {
      synthesisRuntime.updateLive(context, audioRuntimeState, getSynthesisSettings());
    }
  }
}

function updateSoundscapeSettings(patch) {
  patchAudioSettings({
    soundscape: normalizeSoundscapeSettings({
      ...getSoundscapeSettings(),
      ...(patch && typeof patch === "object" ? patch : {}),
    }, DEFAULT_AUDIO_SETTINGS.soundscape),
  });
  if (audioSimulationState.isPlaying && audioSimulationState.playbackKind === "soundscape") {
    const context = audioRuntimeState.audioContext;
    const nowSec = context ? context.currentTime - audioRuntimeState.soundscapeStartedAtSec : 0;
    if (context) {
      synthesisRuntime.updateLive(context, audioRuntimeState, getLiveSoundscapeSynthesisSettings(nowSec));
    }
  }
}

function addSoundscapeLayer() {
  addSoundscapeLayerForRole("drone");
}

function addSoundscapeLayerForRole(role) {
  const soundscape = getSoundscapeSettings();
  updateSoundscapeSettings({
    layers: [
      ...soundscape.layers,
      createSoundscapeLayerForRole(role || "drone"),
    ],
  });
}

function randomizeSoundscape() {
  updateSoundscapeSettings(randomizeSoundscapeSettings(getSoundscapeSettings(), DEFAULT_AUDIO_SETTINGS.soundscape));
}

function removeSoundscapeLayer(id) {
  const soundscape = getSoundscapeSettings();
  updateSoundscapeSettings({
    layers: soundscape.layers.filter((layer) => layer.id !== id),
  });
}

function updateSoundscapeLayer(id, patch) {
  const soundscape = getSoundscapeSettings();
  updateSoundscapeSettings({
    layers: soundscape.layers.map((layer) => (
      layer.id === id
        ? (patch.role ? applySoundscapeRolePreset({ ...layer, ...patch }, patch.role) : { ...layer, ...patch })
        : layer
    )),
  });
}

function addSynthesisOscillator() {
  const synthesis = getSynthesisSettings();
  updateSynthesisSettings({
    oscillators: [
      ...synthesis.oscillators,
      createDefaultSynthesisOscillator(synthesis.oscillators.length),
    ],
  });
}

function removeSynthesisOscillator(id) {
  const synthesis = getSynthesisSettings();
  updateSynthesisSettings({
    oscillators: synthesis.oscillators.filter((oscillator) => oscillator.id !== id),
  });
}

function updateSynthesisOscillator(id, patch) {
  const synthesis = getSynthesisSettings();
  updateSynthesisSettings({
    oscillators: synthesis.oscillators.map((oscillator) => (
      oscillator.id === id ? { ...oscillator, ...patch } : oscillator
    )),
  });
}

function clearAudioScribble() {
  audioScribbleRuntime.clear();
  redrawAudioSpectrogram();
}

function autoPaintAudioScribble() {
  if (!audioRuntimeState.stft) {
    setStatus("Load an audio file before auto-painting.");
    return;
  }
  const settings = getAudioSettings();
  const paintedCount = audioScribbleRuntime.autoPaintFromStft(audioRuntimeState.stft, {
    threshold: settings.autoThreshold,
    contrast: settings.autoContrast,
    gain: settings.autoGain,
    clearBeforePaint: settings.autoClearBeforePaint,
    loudnessFloorDb: settings.loudnessFloorDb,
    minHz: settings.minHz,
    maxHz: settings.maxHz,
    frequencyScale: "log",
  });
  redrawAudioSpectrogram();
  setStatus(`Auto-painted ${paintedCount} spectrogram bins into the scribble layer.`);
}

function approximateAudioScribble() {
  const settings = getAudioSettings();
  const result = audioScribbleRuntime.approximateWithBrushStrokes({
    maxStrokes: settings.approximationMaxStrokes,
    minStrength: settings.approximationMinStrength,
  });
  redrawAudioSpectrogram();
  setStatus(`Approximated ${result.sourceActiveCount} active bins with ${result.strokeCount} brush blobs.`);
}

function serializeAudioSettingsCompatImpl() {
  return {
    ...getAudioSettings(),
    synthesis: getSynthesisSettings(),
    soundscape: getSoundscapeSettings(),
  };
}

function applyAudioSettingsCompatImpl(rawData) {
  const current = getAudioSettings();
  const next = (rawData && typeof rawData === "object") ? rawData : {};
  audioMinHzInput.value = String(next.minHz ?? current.minHz);
  audioMaxHzInput.value = String(next.maxHz ?? current.maxHz);
  audioBrushSizeInput.value = String(next.brushSize ?? current.brushSize);
  audioBrushStrengthInput.value = String(next.brushStrength ?? current.brushStrength);
  audioEraseModeToggle.checked = Boolean(next.eraseMode ?? current.eraseMode);
  audioAutoThresholdInput.value = String(next.autoThreshold ?? current.autoThreshold);
  audioAutoContrastInput.value = String(next.autoContrast ?? current.autoContrast);
  audioAutoGainInput.value = String(next.autoGain ?? current.autoGain);
  audioAutoClearToggle.checked = Boolean(next.autoClearBeforePaint ?? current.autoClearBeforePaint);
  audioApproxMaxStrokesInput.value = String(next.approximationMaxStrokes ?? current.approximationMaxStrokes);
  audioApproxMinStrengthInput.value = String(next.approximationMinStrength ?? current.approximationMinStrength);
  audioMasterGainInput.value = String(next.masterGain ?? current.masterGain);
  audioPlaybackRateInput.value = String(next.playbackRate ?? current.playbackRate);
  if (next.activeMode || next.synthesis || next.soundscape) {
    settingsApplyRuntime.updateStoreFromAppliedSettings("audio", {
      ...current,
      ...next,
      activeMode: next.activeMode ?? current.activeMode,
      synthesis: normalizeSynthesisSettings(next.synthesis, current.synthesis || DEFAULT_AUDIO_SETTINGS.synthesis),
      soundscape: normalizeSoundscapeSettings(next.soundscape, current.soundscape || DEFAULT_AUDIO_SETTINGS.soundscape),
    });
  }
  syncAudioUi();
  syncAudioEngine();
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

function saveSlimeSettingsFile() {
  return mapLifecycleRuntime.saveMapDataFile("slime.json");
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

function setStatus(text, options = {}) {
  statusRuntime.setStatus(text, options);
}

const contentRegistry = createContentRegistry();
try {
  setStatus("Loading wiki articles...", { progress: 0.015 });
  await contentRegistry.loadArticles(WIKI_ARTICLE_PATHS);
  setStatus("Loading global encounter definitions...", { progress: 0.03 });
  EVENT_DEFINITIONS = await loadEventDefinitionFiles(GLOBAL_EVENT_DEFINITION_PATHS);
  activeEventDefinitions = EVENT_DEFINITIONS;
  const contentValidation = validateContentReferences(contentRegistry, {
    eventDefinitions: EVENT_DEFINITIONS,
    uiHighlightTargetIds: SEMANTIC_UI_HIGHLIGHT_TARGET_IDS,
  });
  lastContentValidation = contentValidation;
  lastContentValidationError = "";
  if (!contentValidation.ok) {
    throw createContentValidationError("Global wiki/encounter definitions", contentValidation);
  }
} catch (error) {
  lastContentValidationError = formatContentValidationError(error);
  setStatus(formatContentValidationError(error), { kind: "error", progress: 1 });
  throw error;
}
function buildMapEventDefinitionPath(mapFolderPath) {
  const folder = normalizeMapFolderPath(mapFolderPath);
  if (!folder) return "";
  return isAbsoluteFsPath(folder) ? joinFsPath(folder, "events.json") : buildMapAssetPath(folder, "events.json");
}
async function reloadEventDefinitionsForCurrentMap() {
  const mapEventPath = buildMapEventDefinitionPath(getCurrentMapFolderPath());
  const mapDefinitions = mapEventPath
    ? await loadEventDefinitionFiles([{ path: mapEventPath, optional: true }], {
        fetchJson: (path) => tryLoadJsonFromUrl(path),
      })
    : [];
  const globalEventIds = new Set(EVENT_DEFINITIONS.map((definition) => definition.id));
  const duplicateMapDefinition = mapDefinitions.find((definition) => globalEventIds.has(definition.id));
  if (duplicateMapDefinition) {
    const validation = {
      ok: false,
      missing: [{
        source: "duplicate event ID already defined globally",
        contentId: duplicateMapDefinition.id,
      }],
    };
    const error = createContentValidationError(`Map encounter definitions (${mapEventPath})`, validation);
    lastContentValidation = validation;
    lastContentValidationError = formatContentValidationError(error);
    throw error;
  }
  const definitions = [...EVENT_DEFINITIONS, ...mapDefinitions];
  const validation = validateContentReferences(contentRegistry, {
    eventDefinitions: definitions,
    uiHighlightTargetIds: SEMANTIC_UI_HIGHLIGHT_TARGET_IDS,
  });
  lastContentValidation = validation;
  lastContentValidationError = "";
  if (!validation.ok) {
    lastContentValidationError = formatContentValidationError(
      createContentValidationError(`Map encounter definitions (${mapEventPath})`, validation),
    );
    throw createContentValidationError(`Map encounter definitions (${mapEventPath})`, validation);
  }
  activeEventDefinitions = definitions;
  activeMapEventDefinitionCount = mapDefinitions.length;
  eventRuntime?.replaceDefinitions?.(activeEventDefinitions);
  eventDebugPanelRuntime?.sync?.();
  return {
    globalCount: EVENT_DEFINITIONS.length,
    mapCount: mapDefinitions.length,
    totalCount: definitions.length,
  };
}

function getContentHealthSnapshot() {
  return {
    articleCount: contentRegistry.getSnapshot().articles.length,
    globalEncounterCount: EVENT_DEFINITIONS.length,
    mapEncounterCount: activeMapEventDefinitionCount,
    activeEncounterCount: activeEventDefinitions.length,
    validation: lastContentValidation,
    lastError: lastContentValidationError,
  };
}

function validateActiveContentReferences() {
  const validation = validateContentReferences(contentRegistry, {
    eventDefinitions: activeEventDefinitions,
    uiHighlightTargetIds: SEMANTIC_UI_HIGHLIGHT_TARGET_IDS,
  });
  lastContentValidation = validation;
  if (validation.ok) {
    lastContentValidationError = "";
    setStatus("Content validation passed.");
  } else {
    const error = createContentValidationError("Active wiki/encounter definitions", validation);
    lastContentValidationError = formatContentValidationError(error);
    setStatus(lastContentValidationError, { kind: "error" });
  }
  eventDebugPanelRuntime?.sync?.();
  return validation;
}

let wikiPanelRuntime = null;
let journalPanelRuntime = null;
let journalFeedRuntime = null;
let sideDockRuntime = null;
let uiHighlightRuntime = null;
let eventRuntime = null;
let eventDialogPersistenceRuntime = null;
let eventDebugPanelRuntime = null;
let encounterPanelRuntime = null;
let wikiJournalSides = {
  wiki: "right",
  journal: "left",
};
function applyWikiJournalSideClasses() {
  wikiPanelEl.classList.toggle("panel-side-left", wikiJournalSides.wiki === "left");
  wikiPanelEl.classList.toggle("panel-side-right", wikiJournalSides.wiki === "right");
  journalPanelEl.classList.toggle("panel-side-left", wikiJournalSides.journal === "left");
  journalPanelEl.classList.toggle("panel-side-right", wikiJournalSides.journal === "right");
  wikiSwapSideBtn.setAttribute("aria-label", `Swap Wiki to the ${wikiJournalSides.wiki === "left" ? "right" : "left"} side`);
  journalSwapSideBtn.setAttribute("aria-label", `Swap Journal to the ${wikiJournalSides.journal === "left" ? "right" : "left"} side`);
}
function applySideDockClass(element, side) {
  element.classList.toggle("panel-side-left", side === "left");
  element.classList.toggle("panel-side-right", side === "right");
}
function swapWikiJournalSides() {
  wikiJournalSides = {
    wiki: wikiJournalSides.journal,
    journal: wikiJournalSides.wiki,
  };
  sideDockRuntime?.setPanelPreferredSide?.("wiki", wikiJournalSides.wiki);
  sideDockRuntime?.setPanelPreferredSide?.("journal", wikiJournalSides.journal);
  if (wikiRuntime?.getSnapshot?.().article) {
    sideDockRuntime?.openPanel?.("wiki", { side: wikiJournalSides.wiki, reason: "wiki-journal-side-swap" });
  }
  if (journalPanelRuntime?.isOpen?.()) {
    sideDockRuntime?.openPanel?.("journal", { side: wikiJournalSides.journal, reason: "wiki-journal-side-swap" });
  }
  applyWikiJournalSideClasses();
}
function persistEventDialogState() {
  eventDialogPersistenceRuntime?.save();
}
function resetEventDialogState() {
  eventRuntime?.resetPersistenceState?.();
  journalRuntime?.resetPersistenceState?.();
  eventDialogPersistenceRuntime?.clear?.();
  wikiPanelRuntime?.sync?.();
  encounterPanelRuntime?.sync?.();
  journalPanelRuntime?.sync?.();
  journalFeedRuntime?.sync?.();
  eventDebugPanelRuntime?.sync?.();
  setStatus("Tutorial and journal state reset.");
}
const journalRuntime = createJournalRuntime({
  getTimeTick: () => Math.round(Number(runtimeCore.store.getState().systems?.time?.ticksProcessed || 0)),
  onChanged: () => {
    wikiPanelRuntime?.sync();
    journalPanelRuntime?.sync();
    journalFeedRuntime?.sync();
    eventDebugPanelRuntime?.sync();
    persistEventDialogState();
  },
  onNotice: (notice) => {
    const article = contentRegistry.getArticle(notice.contentId);
    setStatus(article?.title ? `Journal updated: ${article.title}.` : "Journal updated.");
  },
});
const wikiRuntime = createWikiRuntime({
  contentRegistry,
  onChanged: () => {
    if (wikiRuntime?.getSnapshot?.().article) {
      sideDockRuntime?.openPanel?.("wiki", { reason: "wiki-runtime-open" });
    }
    wikiPanelRuntime?.sync();
  },
});
eventRuntime = createEventRuntime({
  wikiRuntime,
  journalRuntime,
  getTimeSpeed: () => Number(runtimeCore.store.getState().systems?.time?.cycleSpeedHoursPerSec ?? 0),
  getTimeTick: () => Number(runtimeCore.store.getState().systems?.time?.ticksProcessed ?? 0),
  dispatchCommand: (command) => dispatchCoreCommand(command),
  setTimeSpeed: (cycleSpeed) => dispatchCoreCommand({
    type: "core/time/setCycleSpeed",
    cycleSpeed: Number.isFinite(Number(cycleSpeed)) ? Number(cycleSpeed) : 0,
  }),
  onChanged: () => {
    wikiPanelRuntime?.sync();
    encounterPanelRuntime?.sync();
    eventDebugPanelRuntime?.sync();
    persistEventDialogState();
  },
});
eventRuntime.loadDefinitions(activeEventDefinitions);
applyWikiJournalSideClasses();
wikiSwapSideBtn.addEventListener("click", swapWikiJournalSides);
journalSwapSideBtn.addEventListener("click", swapWikiJournalSides);
eventDialogPersistenceRuntime = createEventDialogPersistenceRuntime({
  storage: window.localStorage,
  eventRuntime,
  journalRuntime,
  onError: (error) => {
    console.warn("Failed to persist event/dialog state.", error);
  },
});
eventDialogPersistenceRuntime.load();
sideDockRuntime = createSideDockRuntime();
uiHighlightRuntime = createUiHighlightRuntime();
uiHighlightRuntime.registerTarget("hud.inspect", inspectStatusPanelEl);
sideDockRuntime.registerPanel({
  id: "rd",
  priority: 4,
  preferredSide: "left",
  isOpen: () => !topicPanelEl.classList.contains("hidden") && topicPanelEl.dataset.activeTopic === "resource-debug",
  open: () => {},
  close: () => setActiveTopicBase(""),
  setSide: () => {},
});
wikiPanelRuntime = createWikiPanelRuntime({
  document,
  rootEl: wikiPanelEl,
  titleEl: wikiPanelTitleEl,
  summaryEl: wikiPanelSummaryEl,
  bodyEl: wikiPanelBodyEl,
  choicesEl: wikiChoiceListEl,
  closeBtn: wikiCloseBtn,
  backBtn: wikiBackBtn,
  resetStateBtn: wikiResetStateBtn,
  helpBtn: hudWikiHelpBtn,
  wikiRuntime,
  eventRuntime,
  resetEventDialogState,
});
wikiPanelRuntime.bind();
journalPanelRuntime = createJournalPanelRuntime({
  document,
  rootEl: journalPanelEl,
  listEl: journalPanelListEl,
  filterEl: journalCategoryFilterEl,
  openBtn: hudJournalOpenBtn,
  closeBtn: journalCloseBtn,
  journalRuntime,
  wikiRuntime,
  getArticle: (id) => contentRegistry.getArticle(id),
  requestOpen: () => sideDockRuntime?.openPanel?.("journal", { reason: "journal-request-open" })?.ok !== false,
});
journalPanelRuntime.bind();
sideDockRuntime.registerPanel({
  id: "journal",
  priority: 1,
  preferredSide: "left",
  isOpen: () => journalPanelRuntime?.isOpen?.() || false,
  open: (reason) => journalPanelRuntime?.open?.(reason),
  close: () => journalPanelRuntime?.close?.(),
  setSide: (side) => {
    wikiJournalSides.journal = side;
    applyWikiJournalSideClasses();
  },
});
sideDockRuntime.registerPanel({
  id: "wiki",
  priority: 3,
  preferredSide: "right",
  isOpen: () => Boolean(wikiRuntime?.getSnapshot?.().article),
  open: () => {},
  close: () => wikiRuntime?.close?.(),
  setSide: (side) => {
    wikiJournalSides.wiki = side;
    applyWikiJournalSideClasses();
  },
});
journalFeedRuntime = createJournalFeedRuntime({
  document,
  rootEl: journalFeedEl,
  toggleBtn: journalFeedToggleBtn,
  entriesEl: journalFeedEntriesEl,
  journalRuntime,
  wikiRuntime,
  getArticle: (id) => contentRegistry.getArticle(id),
});
journalFeedRuntime.bind();
encounterPanelRuntime = createEncounterPanelRuntime({
  document,
  backdropEl: encounterBackdropEl,
  rootEl: encounterPanelEl,
  titleEl: encounterPanelTitleEl,
  summaryEl: encounterPanelSummaryEl,
  bodyEl: encounterPanelBodyEl,
  choicesEl: encounterChoiceListEl,
  closeBtn: encounterCloseBtn,
  eventRuntime,
  wikiRuntime,
  uiHighlightRuntime,
  getArticle: (id) => contentRegistry.getArticle(id),
});
encounterPanelRuntime.bind();
hudWikiOpenBtn.addEventListener("click", () => {
  wikiRuntime.openArticle("wiki.index", { reason: "wiki-button" });
});
eventDebugPanelRuntime = createEventDebugPanelRuntime({
  eventRuntime,
  journalRuntime,
  getEventDefinitions: () => activeEventDefinitions.map((definition) => ({ ...definition })),
  getArticle: (id) => contentRegistry.getArticle(id),
  openArticle: (id, options) => wikiRuntime.openArticle(id, options),
  getContentHealthSnapshot,
  validateContent: validateActiveContentReferences,
  resetEventDialogState,
  triggerDialogBtn: eventDebugTriggerDialogBtn,
  triggerNoticeBtn: eventDebugTriggerNoticeBtn,
  triggerGameplayStartedBtn: eventDebugTriggerGameplayStartedBtn,
  triggerHydrationLowBtn: eventDebugTriggerHydrationLowBtn,
  triggerFatigueHighBtn: eventDebugTriggerFatigueHighBtn,
  resetBtn: eventDebugResetBtn,
  refreshBtn: eventDebugRefreshBtn,
  validateContentBtn: eventDebugValidateContentBtn,
  previewSelectEl: eventDebugPreviewSelect,
  previewBtn: eventDebugPreviewBtn,
  previewValueEl: eventDebugPreviewValue,
  contentHealthEl: eventDebugContentHealthValue,
  lastTriggerEl: eventDebugLastTriggerValue,
  activeEl: eventDebugActiveValue,
  queueEl: eventDebugQueueValue,
  definitionsEl: eventDebugDefinitionsValue,
  seenEl: eventDebugSeenValue,
  flagsEl: eventDebugFlagsValue,
  journalEl: eventDebugJournalValue,
});
eventDebugPanelRuntime.bind();
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

let performanceOverlayEnabled = false;
function setPerformanceOverlayEnabled(enabled) {
  performanceOverlayEnabled = Boolean(enabled);
  performanceOverlayPanelEl.classList.toggle("hidden", !performanceOverlayEnabled);
  perfOverlayToggleBtn.classList.toggle("active", performanceOverlayEnabled);
  perfOverlayToggleBtn.setAttribute("aria-pressed", performanceOverlayEnabled ? "true" : "false");
  rdPerformanceOverlayToggleBtn.classList.toggle("active", performanceOverlayEnabled);
  rdPerformanceOverlayToggleBtn.setAttribute("aria-pressed", performanceOverlayEnabled ? "true" : "false");
  rdPerformanceOverlayToggleBtn.textContent = performanceOverlayEnabled ? "Hide" : "Show";
}
perfOverlayToggleBtn.addEventListener("click", () => {
  setPerformanceOverlayEnabled(!performanceOverlayEnabled);
});
rdPerformanceOverlayToggleBtn.addEventListener("click", () => {
  setPerformanceOverlayEnabled(!performanceOverlayEnabled);
});
setPerformanceOverlayEnabled(false);

async function copyPerformanceOverlayText() {
  const text = (performanceOverlayTextEl && typeof performanceOverlayTextEl.textContent === "string")
    ? performanceOverlayTextEl.textContent
    : "";
  if (!text) return false;
  const clipboard = window.navigator && window.navigator.clipboard;
  if (clipboard && typeof clipboard.writeText === "function") {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // fall back below
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.left = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied === true;
  } catch {
    return false;
  }
}

performanceOverlayCopyBtn.addEventListener("click", async () => {
  const previous = performanceOverlayCopyBtn.textContent;
  const ok = await copyPerformanceOverlayText();
  performanceOverlayCopyBtn.textContent = ok ? "Copied" : "Failed";
  window.setTimeout(() => {
    performanceOverlayCopyBtn.textContent = previous || "Copy";
  }, 900);
});

function getCameraPoseForUi() {
  const camera = runtimeCore.store.getState().camera || {};
  return {
    panX: Number.isFinite(Number(camera.panX)) ? Number(camera.panX) : 0,
    panY: Number.isFinite(Number(camera.panY)) ? Number(camera.panY) : 0,
    zoom: Number.isFinite(Number(camera.zoom)) ? Number(camera.zoom) : 1,
  };
}

function zoomCameraFromPanel(multiplier) {
  const camera = getCameraPoseForUi();
  const bounds = getZoomBounds();
  dispatchCoreCommand({
    type: "core/camera/setPose",
    panX: camera.panX,
    panY: camera.panY,
    zoom: clamp(camera.zoom * multiplier, bounds.min, bounds.max),
  });
}

cameraResetViewBtn.addEventListener("click", () => {
  dispatchCoreCommand({ type: "core/camera/reset" });
  setStatus("Camera view reset.");
});
cameraCenterPlayerBtn.addEventListener("click", () => {
  dispatchCoreCommand({ type: "core/player/show" });
});
cameraZoomOutBtn.addEventListener("click", () => {
  zoomCameraFromPanel(0.8);
});
cameraZoomInBtn.addEventListener("click", () => {
  zoomCameraFromPanel(1.25);
});

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
  uSlope: gl.getUniformLocation(program, "uSlope"),
  uPointLightTex: gl.getUniformLocation(program, "uPointLightTex"),
  uCloudNoiseTex: gl.getUniformLocation(program, "uCloudNoiseTex"),
  uShadowTex: gl.getUniformLocation(program, "uShadowTex"),
  uWater: gl.getUniformLocation(program, "uWater"),
  uFlowMap: gl.getUniformLocation(program, "uFlowMap"),
  uWaterTrailTex: gl.getUniformLocation(program, "uWaterTrailTex"),
  uMaterialSplat: gl.getUniformLocation(program, "uMaterialSplat"),
  uDetailMicroColor: gl.getUniformLocation(program, "uDetailMicroColor"),
  uDiscoveryMask: gl.getUniformLocation(program, "uDiscoveryMask"),
  uSlimeTrailOverlay: gl.getUniformLocation(program, "uSlimeTrailOverlay"),
  uSlimeTracksMask: gl.getUniformLocation(program, "uSlimeTracksMask"),
  uSlimeTerrainUnderlayPlant: gl.getUniformLocation(program, "uSlimeTerrainUnderlayPlant"),
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
  uUseDetail: gl.getUniformLocation(program, "uUseDetail"),
  uDetailBlend: gl.getUniformLocation(program, "uDetailBlend"),
  uDetailBlendMode: gl.getUniformLocation(program, "uDetailBlendMode"),
  uDetailDebugMode: gl.getUniformLocation(program, "uDetailDebugMode"),
  uDetailWeightQuantization: gl.getUniformLocation(program, "uDetailWeightQuantization"),
  uDetailDitherScale: gl.getUniformLocation(program, "uDetailDitherScale"),
  uDetailDitherStrength: gl.getUniformLocation(program, "uDetailDitherStrength"),
  uDetailMinWeight: gl.getUniformLocation(program, "uDetailMinWeight"),
  uDetailMaterialPriority: gl.getUniformLocation(program, "uDetailMaterialPriority"),
  uDiscoveryVisibilityEnabled: gl.getUniformLocation(program, "uDiscoveryVisibilityEnabled"),
  uDiscoveryVisibilityMode: gl.getUniformLocation(program, "uDiscoveryVisibilityMode"),
  uSlimeTrailOverlayEnabled: gl.getUniformLocation(program, "uSlimeTrailOverlayEnabled"),
  uSlimeTrailOverlayRaw: gl.getUniformLocation(program, "uSlimeTrailOverlayRaw"),
  uSlimeTrailOverlayGain: gl.getUniformLocation(program, "uSlimeTrailOverlayGain"),
  uSlimeTrailOverlayGamma: gl.getUniformLocation(program, "uSlimeTrailOverlayGamma"),
  uSlimeTrailOverlayThreshold: gl.getUniformLocation(program, "uSlimeTrailOverlayThreshold"),
  uSlimeTrailOverlayOpacity: gl.getUniformLocation(program, "uSlimeTrailOverlayOpacity"),
  uSlimeTracksMaskEnabled: gl.getUniformLocation(program, "uSlimeTracksMaskEnabled"),
  uSlimeTracksKnowledgeCutoff: gl.getUniformLocation(program, "uSlimeTracksKnowledgeCutoff"),
  uSlimeTerrainUnderlayEnabled: gl.getUniformLocation(program, "uSlimeTerrainUnderlayEnabled"),
  uTerrainDebugViewMode: gl.getUniformLocation(program, "uTerrainDebugViewMode"),
  uDiscoveryDitherScale: gl.getUniformLocation(program, "uDiscoveryDitherScale"),
  uDiscoveryKnowledgeGamma: gl.getUniformLocation(program, "uDiscoveryKnowledgeGamma"),
  uDiscoveryUnknownDarkness: gl.getUniformLocation(program, "uDiscoveryUnknownDarkness"),
  uDetailMicroRect0: gl.getUniformLocation(program, "uDetailMicroRect0"),
  uDetailMicroRect1: gl.getUniformLocation(program, "uDetailMicroRect1"),
  uDetailMicroRect2: gl.getUniformLocation(program, "uDetailMicroRect2"),
  uDetailMicroRect3: gl.getUniformLocation(program, "uDetailMicroRect3"),
  uDetailMicroScale0: gl.getUniformLocation(program, "uDetailMicroScale0"),
  uDetailMicroScale1: gl.getUniformLocation(program, "uDetailMicroScale1"),
  uUseFog: gl.getUniformLocation(program, "uUseFog"),
  uFogColor: gl.getUniformLocation(program, "uFogColor"),
  uFogMinAlpha: gl.getUniformLocation(program, "uFogMinAlpha"),
  uFogMaxAlpha: gl.getUniformLocation(program, "uFogMaxAlpha"),
  uFogFalloff: gl.getUniformLocation(program, "uFogFalloff"),
  uFogStartOffset: gl.getUniformLocation(program, "uFogStartOffset"),
  uCameraHeightNorm: gl.getUniformLocation(program, "uCameraHeightNorm"),
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
  uUseWaterFx: gl.getUniformLocation(program, "uUseWaterFx"),
  uWaterFlowSource: gl.getUniformLocation(program, "uWaterFlowSource"),
  uWaterFlowRenderMode: gl.getUniformLocation(program, "uWaterFlowRenderMode"),
  uWaterFlowDownhill: gl.getUniformLocation(program, "uWaterFlowDownhill"),
  uWaterFlowChannelPair: gl.getUniformLocation(program, "uWaterFlowChannelPair"),
  uWaterFlowFlip: gl.getUniformLocation(program, "uWaterFlowFlip"),
  uWaterFlowUseMagnitude: gl.getUniformLocation(program, "uWaterFlowUseMagnitude"),
  uWaterFlowInvertDownhill: gl.getUniformLocation(program, "uWaterFlowInvertDownhill"),
  uWaterFlowDebug: gl.getUniformLocation(program, "uWaterFlowDebug"),
  uWaterFlowDir: gl.getUniformLocation(program, "uWaterFlowDir"),
  uWaterLocalFlowMix: gl.getUniformLocation(program, "uWaterLocalFlowMix"),
  uWaterDownhillBoost: gl.getUniformLocation(program, "uWaterDownhillBoost"),
  uWaterFlowStrength: gl.getUniformLocation(program, "uWaterFlowStrength"),
  uWaterFlowMapStrength: gl.getUniformLocation(program, "uWaterFlowMapStrength"),
  uWaterFlowVisibility: gl.getUniformLocation(program, "uWaterFlowVisibility"),
  uWaterStreamlineDensity: gl.getUniformLocation(program, "uWaterStreamlineDensity"),
  uWaterStreamlineSharpness: gl.getUniformLocation(program, "uWaterStreamlineSharpness"),
  uWaterFlowSpeed: gl.getUniformLocation(program, "uWaterFlowSpeed"),
  uWaterFlowScale: gl.getUniformLocation(program, "uWaterFlowScale"),
  uWaterShimmerStrength: gl.getUniformLocation(program, "uWaterShimmerStrength"),
  uWaterGlintStrength: gl.getUniformLocation(program, "uWaterGlintStrength"),
  uWaterGlintSharpness: gl.getUniformLocation(program, "uWaterGlintSharpness"),
  uWaterShoreFoamStrength: gl.getUniformLocation(program, "uWaterShoreFoamStrength"),
  uWaterShoreWidth: gl.getUniformLocation(program, "uWaterShoreWidth"),
  uWaterReflectivity: gl.getUniformLocation(program, "uWaterReflectivity"),
  uWaterBaseColor: gl.getUniformLocation(program, "uWaterBaseColor"),
  uWaterOpacity: gl.getUniformLocation(program, "uWaterOpacity"),
  uUseWaterTrail: gl.getUniformLocation(program, "uUseWaterTrail"),
  uWaterTrailStrength: gl.getUniformLocation(program, "uWaterTrailStrength"),
  uWaterTrailHeadroom: gl.getUniformLocation(program, "uWaterTrailHeadroom"),
  uWaterTrailDebug: gl.getUniformLocation(program, "uWaterTrailDebug"),
  uWaterTrailColor: gl.getUniformLocation(program, "uWaterTrailColor"),
  uWaterGlitterStrength: gl.getUniformLocation(program, "uWaterGlitterStrength"),
  uWaterGlitterDensity: gl.getUniformLocation(program, "uWaterGlitterDensity"),
  uWaterGlitterSpeed: gl.getUniformLocation(program, "uWaterGlitterSpeed"),
  uWaterGlitterSize: gl.getUniformLocation(program, "uWaterGlitterSize"),
  uWaterGlitterSharpness: gl.getUniformLocation(program, "uWaterGlitterSharpness"),
  uWaterGlitterWakeSuppression: gl.getUniformLocation(program, "uWaterGlitterWakeSuppression"),
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
  slopeTex,
  wetnessTex,
  waterTex,
  flowMapTex,
  waterTrailTex,
  materialSplatTex,
  detailMicroColorTex,
  discoveryMaskTex,
  slimeTrailOverlayTex,
  slimeTracksMaskTex,
  slimeTrailOverlayTextureState,
  discoveryMaskTextureState,
  slimeTracksMaskTextureState,
  detailAtlasState,
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
detailAtlasRuntime = createDetailAtlasRuntime({
  gl,
  loadImageFromUrl,
  defaultDetailSettings: DEFAULT_DETAIL_SETTINGS,
  state: detailAtlasState,
  materialSplatTex,
  microColorTex: detailMicroColorTex,
});
rebuildDetailAtlas().catch((error) => {
  console.warn("Failed to build zoom-detail atlas; terrain detail will remain neutral.", error);
});
uploadCloudNoiseTexture();

const DEFAULT_POINT_LIGHT_FLICKER = 0.7;
const DEFAULT_POINT_LIGHT_FLICKER_SPEED = 0.5;
const pointLights = [];
let nextPointLightId = 1;
let splatImageData = null;
let normalsImageData = null;
let heightImageData = null;
let slopeImageData = null;
let waterImageData = null;
let wetnessImageData = null;
let flowImageData = null;
waterParticleTrailRuntime = createWaterParticleTrailRuntime({
  gl,
  document,
  texture: waterTrailTex,
  getWaterImageData: () => waterImageData,
  getFlowImageData: () => flowImageData,
});
function serializeWaterTrailSettings() {
  return waterParticleTrailRuntime.serializeSettings();
}
function applyWaterTrailSettings(rawData) {
  waterParticleTrailRuntime.applySettings(rawData);
}

function applyWaterPresetSettings(settings) {
  applyWaterSettings(settings);
  applyWaterSettingsCompat();
  syncRenderFxWaterUi();
  renderSupportRuntime.rebuildFlowMapTexture();
}

createModulePresetRuntime({
  kind: "waterfx",
  label: "Water FX",
  basePath: "assets/presets/waterfx",
  document,
  select: waterPresetSelect,
  nameInput: waterPresetNameInput,
  applyButton: waterPresetApplyBtn,
  saveButton: waterPresetSaveBtn,
  loadJson: (path) => tryLoadJsonFromUrl(path),
  serializeSettings: () => serializeWaterSettings(),
  applySettings: (settings) => applyWaterPresetSettings(settings),
  getCurrentMapFolderPath,
  tauriInvoke,
  invokeTauri,
  isAbsoluteFsPath,
  joinFsPath,
  downloadTextFile,
  storage: window.localStorage,
  showDirectoryPicker:
    typeof window.showDirectoryPicker === "function" ? window.showDirectoryPicker.bind(window) : null,
  confirm: (text) => window.confirm(text),
  setStatus,
});
createModulePresetRuntime({
  kind: "watertrails",
  label: "Water Trails",
  basePath: "assets/presets/watertrails",
  document,
  select: waterTrailPresetSelect,
  nameInput: waterTrailPresetNameInput,
  applyButton: waterTrailPresetApplyBtn,
  saveButton: waterTrailPresetSaveBtn,
  loadJson: (path) => tryLoadJsonFromUrl(path),
  serializeSettings: () => serializeWaterTrailSettings(),
  applySettings: (settings) => applyWaterTrailSettings(settings),
  getCurrentMapFolderPath,
  tauriInvoke,
  invokeTauri,
  isAbsoluteFsPath,
  joinFsPath,
  downloadTextFile,
  storage: window.localStorage,
  showDirectoryPicker:
    typeof window.showDirectoryPicker === "function" ? window.showDirectoryPicker.bind(window) : null,
  confirm: (text) => window.confirm(text),
  setStatus,
});
createModulePresetRuntime({
  kind: "slime",
  label: "Slime",
  basePath: "assets/presets/slime",
  document,
  select: slimePresetSelect,
  nameInput: slimePresetNameInput,
  applyButton: slimePresetApplyBtn,
  saveButton: slimePresetSaveBtn,
  loadJson: (path) => tryLoadJsonFromUrl(path),
  serializeSettings: () => serializeSlimeSettingsCompatImpl(),
  applySettings: (settings) => applySlimeSettingsCompatImpl(settings),
  getCurrentMapFolderPath,
  tauriInvoke,
  invokeTauri,
  isAbsoluteFsPath,
  joinFsPath,
  downloadTextFile,
  storage: window.localStorage,
  showDirectoryPicker:
    typeof window.showDirectoryPicker === "function" ? window.showDirectoryPicker.bind(window) : null,
  confirm: (text) => window.confirm(text),
  setStatus,
});
const POINT_LIGHT_BLEND_EXPOSURE = 0.65;
const POINT_LIGHT_SELECT_RADIUS = 3;
const POINT_LIGHT_BAKE_LIVE_SCALE = 0.5;
const POINT_LIGHT_BAKE_DEBOUNCE_MS = 80;
const SWARM_POINT_LIGHT_EDGE_MIN = 0.08;
const overlayDirtyRuntime = createOverlayDirtyRuntime(true);
const DEFAULT_MAP_FOLDER = "assets/map3/";
const DEFAULT_MAP_FOLDER_CANDIDATES = tauriInvoke
  ? ["assets/map3/", "assets/"]
  : ["assets/map3/", "assets/"];
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
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
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
  slopeTex,
  wetnessTex,
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
  setWetnessImageData: (value) => {
    wetnessImageData = value;
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
const getMoveCostContext = (...args) => pathfindingRuntimeBinding.createMoveCostContext(...args);
const computeMoveStepCost = (...args) => pathfindingRuntimeBinding.computeMoveStepCost(...args);
const rebuildMovementField = (...args) => pathfindingRuntimeBinding.rebuildMovementField(...args);
const extractPathTo = (...args) => pathfindingRuntimeBinding.extractPathTo(...args);
const refreshPathPreview = (...args) => pathfindingRuntimeBinding.refreshPathPreview(...args);
const updatePathPreviewFromPointer = (...args) => pathfindingRuntimeBinding.updatePathPreviewFromPointer(...args);
const getCurrentPathMetrics = (...args) => pathfindingRuntimeBinding.getCurrentPathMetrics(...args);
const updateRoutePreviewFromPointer = (...args) => routePlanningRuntime?.updateHoverFromPointer?.(...args);

const updatePathfindingRangeLabel = (...args) => pathfindingLabelRuntime.updatePathfindingRangeLabel(...args);
const updatePathWeightLabels = (...args) => pathfindingLabelRuntime.updatePathWeightLabels(...args);
const updatePathSlopeCutoffLabel = (...args) => pathfindingLabelRuntime.updatePathSlopeCutoffLabel(...args);
const updatePathBaseCostLabel = (...args) => pathfindingLabelRuntime.updatePathBaseCostLabel(...args);

const updateShadowBlurLabel = (...args) => renderFxUiRuntime.updateShadowBlurLabel(...args);
const updateLightingBalanceLabels = (...args) => renderFxUiRuntime.updateLightingBalanceLabels(...args);
const updateSimTickLabel = (...args) => renderFxUiRuntime.updateSimTickLabel(...args);
const updateFogAlphaLabels = (...args) => renderFxUiRuntime.updateFogAlphaLabels(...args);
const updateFogFalloffLabel = (...args) => renderFxUiRuntime.updateFogFalloffLabel(...args);
const updateFogStartOffsetLabel = (...args) => renderFxUiRuntime.updateFogStartOffsetLabel(...args);
const updatePointFlickerLabels = (...args) => renderFxUiRuntime.updatePointFlickerLabels(...args);
const updatePointFlickerUi = (...args) => renderFxUiRuntime.updatePointFlickerUi(...args);
const updateCloudLabels = (...args) => renderFxUiRuntime.updateCloudLabels(...args);
const updateWaterLabels = (...args) => renderFxUiRuntime.updateWaterLabels(...args);
const updateFogUi = (...args) => renderFxUiRuntime.updateFogUi(...args);
const updateCloudUi = (...args) => renderFxUiRuntime.updateCloudUi(...args);
const updateWaterUi = (...args) => renderFxUiRuntime.updateWaterUi(...args);

const syncRenderFxLightingUi = (...args) => renderFxSettingsSyncRuntime.syncLightingUi(...args);
const syncRenderFxFogUi = (...args) => renderFxSettingsSyncRuntime.syncFogUi(...args);
const syncRenderFxCloudUi = (...args) => renderFxSettingsSyncRuntime.syncCloudUi(...args);
const syncRenderFxWaterUi = (...args) => renderFxSettingsSyncRuntime.syncWaterUi(...args);

const updatePointLightStrengthLabel = (...args) => lightLabelRuntime.updatePointLightStrengthLabel(...args);
const updatePointLightIntensityLabel = (...args) => lightLabelRuntime.updatePointLightIntensityLabel(...args);
const updatePointLightHeightOffsetLabel = (...args) => lightLabelRuntime.updatePointLightHeightOffsetLabel(...args);
const updatePointLightFlickerLabel = (...args) => lightLabelRuntime.updatePointLightFlickerLabel(...args);
const updatePointLightFlickerSpeedLabel = (...args) => lightLabelRuntime.updatePointLightFlickerSpeedLabel(...args);
const updateCursorLightStrengthLabel = (...args) => lightLabelRuntime.updateCursorLightStrengthLabel(...args);
const updateCursorLightHeightOffsetLabel = (...args) => lightLabelRuntime.updateCursorLightHeightOffsetLabel(...args);

({
  pointLightRuntime,
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
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
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
  clearPointLightsLoadInput: pointLightIoUiRuntime.clearPointLightsLoadInput,
  openPointLightsLoadInput: pointLightIoUiRuntime.openPointLightsLoadInput,
  setSaveButtonText: pointLightIoUiRuntime.setSaveButtonText,
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
  defaultInteractionSettings: DEFAULT_INTERACTION_SETTINGS,
  defaultFogSettings: DEFAULT_FOG_SETTINGS,
  defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
  defaultWaterSettings: DEFAULT_WATER_SETTINGS,
  defaultWaterTrailSettings: DEFAULT_WATER_TRAIL_SETTINGS,
  defaultSlimeSettings: DEFAULT_SLIME_SETTINGS,
  defaultDetailSettings: DEFAULT_DETAIL_SETTINGS,
  defaultCameraSettings: DEFAULT_CAMERA_SETTINGS,
  defaultAudioSettings: DEFAULT_AUDIO_SETTINGS,
  defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
  applyLightingSettings: (...args) => applyLightingSettings(...args),
  applyInteractionSettings: (...args) => applyInteractionSettings(...args),
  applyFogSettings: (...args) => applyFogSettings(...args),
  applyCloudSettings: (...args) => applyCloudSettings(...args),
  applyWaterSettings: (...args) => applyWaterSettings(...args),
  applyWaterTrailSettings: (...args) => applyWaterTrailSettings(...args),
  applySlimeSettings: (...args) => applySlimeSettingsCompatImpl(...args),
  applyDetailSettings: (...args) => applyDetailSettings(...args),
  applyCameraSettings: (...args) => applyCameraSettings(...args),
  applyAudioSettings: (...args) => applyAudioSettings(...args),
  applyResourceDebugSettings: (...args) => applyResourceDebugSettingsRuntime(...args),
  applyResourceStockSettings: (...args) => applyResourceStockSettingsRuntime(...args),
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
  getRequiredGameplayMapFiles: () => {
    const names = Object.values(RESOURCE_SEARCHES)
      .map((search) => search && search.map ? `${search.map}.png` : "")
      .filter(Boolean);
    return [...new Set(names)];
  },
  onMapLoaded: () => finalizeMapGameplayState(),
  serializeLightingSettings: (...args) => serializeLightingSettings(...args),
  serializeInteractionSettings: (...args) => serializeInteractionSettings(...args),
  serializeFogSettings: (...args) => serializeFogSettings(...args),
  serializeCloudSettings: (...args) => serializeCloudSettings(...args),
  serializeWaterSettings: (...args) => serializeWaterSettings(...args),
  serializeWaterTrailSettings: (...args) => serializeWaterTrailSettings(...args),
  serializeSlimeSettings: (...args) => serializeSlimeSettingsCompatImpl(...args),
  serializeDetailSettings: (...args) => serializeDetailSettings(...args),
  serializeCameraSettings: (...args) => serializeCameraSettings(...args),
  serializeAudioSettings: (...args) => serializeAudioSettings(...args),
  serializeResourceDebugSettings: () => serializeResourceDebugSettingsRuntime(),
  serializeResourceStockSettings: () => serializeResourceStockSettingsRuntime(),
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
} = pointLightRuntime;

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
  setInteractionMode: (...args) => setInteractionMode(...args),
  setStatus,
  resolveInteractionModeSnapshot,
  getCoreGameplay: () => runtimeCore.store.getState().gameplay || null,
});
const getRuntimeMode = modeInteractionRuntimeBinding.getRuntimeMode;
const canUseTopicInCurrentMode = modeInteractionRuntimeBinding.canUseTopicInCurrentMode;
const canUseInteractionInCurrentMode = modeInteractionRuntimeBinding.canUseInteractionInCurrentMode;
const setTopicPanelVisible = modeInteractionRuntimeBinding.setTopicPanelVisible;
const setActiveTopicBase = modeInteractionRuntimeBinding.setActiveTopic;
function setActiveTopic(topicName) {
  const nextTopic = String(topicName || "");
  if (nextTopic === "resource-debug") {
    const result = sideDockRuntime?.openPanel?.("rd", { reason: "rd-topic-open" });
    if (result && result.ok === false) return;
  }
  setActiveTopicBase(nextTopic);
}
const updateModeCapabilitiesUi = modeInteractionRuntimeBinding.updateModeCapabilitiesUi;
const getInteractionModeSnapshot = modeInteractionRuntimeBinding.getInteractionModeSnapshot;
const workspaceRuntime = createWorkspaceRuntime({
  workspacePanels,
  workspaceButtons,
  setActiveTopic,
  setInteractionMode: (mode) => setInteractionMode(mode),
});

const applyMapSizeChangeIfNeeded = (changed) => mapLifecycleRuntime.applyMapSizeChangeIfNeeded(changed);
bakePointLightsTexture();
updateLightEditorUi();

function applyRuntimeCameraPose() {}

let isMiddleDragging = false;
let lastDragClient = { x: 0, y: 0 };
let fogColorManual = false;
const timeLightingSetupRuntime = createTimeLightingSetupRuntime(createTimeLightingAssemblyRuntime({
  initialHour: 9.5,
  getCycleHour: () => {
    const uiState = runtimeCore.store.getState().ui || {};
    return Number.isFinite(Number(uiState.cycleHour)) ? Number(uiState.cycleHour) : 9.5;
  },
  setCycleHour: (hour) => mainRuntimeStateBinding.setCycleHourUiToStore(hour),
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
  getZoomMin,
  getZoomMax,
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
const gameTimeDioramaRuntime = createGameTimeDioramaRuntime({
  rootEl: gameTimeDioramaEl,
  sunEl: gameTimeSunEl,
  moonEl: gameTimeMoonEl,
  speedButtons: gameTimeSpeedButtons,
  sampleSunAtHour,
  dispatchCoreCommand,
});
gameTimeDioramaRuntime.bind();
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
const activityStoreSyncRuntime = createActivityStoreSyncRuntime({
  store: runtimeCore.store,
});
const inventoryStoreSyncRuntime = createInventoryStoreSyncRuntime({
  store: runtimeCore.store,
});
const conditionStoreSyncRuntime = createConditionStoreSyncRuntime({
  store: runtimeCore.store,
});
let playerActivityRuntime = null;
let inventoryPanelRuntime = null;
let activityEffectRuntime = null;
let conditionEffectRuntime = null;
let conditionEventTriggerRuntime = null;
let travelEstimateRuntime = null;
let travelPlanningRuntime = null;
let routePlanningRuntime = null;
let resourceSearchRuntime = null;
let resourceStockRuntime = null;
let resourceDiscoveryRuntime = null;
let gameplayHudRuntime = null;
let localActivityMenuRuntime = null;
let resourceDebugPanelRuntime = null;
let rdOverlayShortcutRailRuntime = null;
let inspectPerceptionRuntime = null;
let resourceContourOverlayVersion = 0;
let resourceStockOverlayMode = "known";
let resourceDebugOverlayResourceId = "water";
let terrainDebugViewMode = "none";
let slimePlantBaseResourceCache = null;
let slimePlantResourceCache = null;

function invalidateResourceContourOverlay() {
  resourceContourOverlayVersion += 1;
}

function emitActivityChanged(payload = {}) {
  eventBus.emit(RuntimeEvents.ACTIVITY_CHANGED, payload);
}

function emitInspectChanged(payload = {}) {
  eventBus.emit(RuntimeEvents.INSPECT_CHANGED, payload);
}

function emitResourceDiscoveryChanged(payload = {}) {
  eventBus.emit(RuntimeEvents.RESOURCE_DISCOVERY_CHANGED, payload);
}

function emitResourceStockChanged(payload = {}) {
  eventBus.emit(RuntimeEvents.RESOURCE_STOCK_CHANGED, payload);
}

function emitTravelPlanningChanged(payload = {}) {
  eventBus.emit(RuntimeEvents.TRAVEL_PLANNING_CHANGED, payload);
}

travelPlanningRuntime = createTravelPlanningRuntime({
  onChange: emitTravelPlanningChanged,
});

const routePlanningRuntimeProxy = {
  setActive: (...args) => routePlanningRuntime?.setActive?.(...args),
  updateHoverAtPixel: (...args) => routePlanningRuntime?.updateHoverAtPixel?.(...args),
  updateHoverFromPointer: (...args) => routePlanningRuntime?.updateHoverFromPointer?.(...args),
  clearHover: (...args) => routePlanningRuntime?.clearHover?.(...args),
  commitHover: (...args) => routePlanningRuntime?.commitHover?.(...args),
  clearCommitted: (...args) => routePlanningRuntime?.clearCommitted?.(...args),
  updateSettings: (...args) => routePlanningRuntime?.updateSettings?.(...args),
  setShowCommittedOverlay: (...args) => routePlanningRuntime?.setShowCommittedOverlay?.(...args),
  setWaypointPlacementActive: (...args) => routePlanningRuntime?.setWaypointPlacementActive?.(...args),
  selectSegment: (...args) => routePlanningRuntime?.selectSegment?.(...args),
  selectWaypointAtPixel: (...args) => routePlanningRuntime?.selectWaypointAtPixel?.(...args),
  selectWaypointFromEndpoint: (...args) => routePlanningRuntime?.selectWaypointFromEndpoint?.(...args),
  clearSelection: (...args) => routePlanningRuntime?.clearSelection?.(...args),
  deleteSegment: (...args) => routePlanningRuntime?.deleteSegment?.(...args),
  deleteSelectedSegment: (...args) => routePlanningRuntime?.deleteSelectedSegment?.(...args),
  deleteSelectedWaypoint: (...args) => routePlanningRuntime?.deleteSelectedWaypoint?.(...args),
  setAnchorFromEndpoint: (...args) => routePlanningRuntime?.setAnchorFromEndpoint?.(...args),
  hitTestAtPixel: (...args) => routePlanningRuntime?.hitTestAtPixel?.(...args),
  getSnapshot: (...args) => routePlanningRuntime?.getSnapshot?.(...args),
};

function getResourceContourCacheVersion(resourceId) {
  const discoveryVersion = typeof resourceDiscoveryRuntime?.getVersion === "function"
    ? resourceDiscoveryRuntime.getVersion(resourceId)
    : 0;
  const stockVersion = typeof resourceStockRuntime?.getVersion === "function"
    ? resourceStockRuntime.getVersion(resourceId)
    : 0;
  return `${resourceContourOverlayVersion}:${discoveryVersion}:${stockVersion}`;
}

function getResourceContourDiscoveryCacheVersion(resourceId) {
  const discoveryVersion = typeof resourceDiscoveryRuntime?.getVersion === "function"
    ? resourceDiscoveryRuntime.getVersion(resourceId)
    : 0;
  return `${resourceContourOverlayVersion}:${discoveryVersion}`;
}

function getResourceDebugLayerSettings(layer = getInspectOverlayLayer()) {
  const layerId = layer === "plants" || layer === "height" || layer === "slope" ? layer : "water";
  return resourceDebugSettings.layers[layerId] || resourceDebugSettings.layers.water;
}

function syncResourceDebugPanel() {
  resourceDebugPanelRuntime?.sync();
  rdOverlayShortcutRailRuntime?.sync();
}

function resetKnowledgeMapForConfig() {
  resourceDiscoveryRuntime?.reset(WORLD_KNOWLEDGE_MAP_ID);
  tracksDiscoveryInitialized = false;
  seedDiscoveryNoise(WORLD_KNOWLEDGE_MAP_ID);
  resourceDiscoveryRuntime?.revealMovement(WORLD_KNOWLEDGE_MAP_ID, playerState.pixelX, playerState.pixelY);
  initializeTracksDiscoveryMap({ force: true });
  for (const resourceId of getResourceSearchIds()) {
    resourceStockRuntime?.revealKnown(resourceId, playerState.pixelX, playerState.pixelY, resolveDiscoveryRevealRadius(
      resourceId,
      getResourceMovementRevealRadius(resourceId),
    ));
  }
}

function initializeTracksDiscoveryMap(options = {}) {
  if (!resourceDiscoveryRuntime || (tracksDiscoveryInitialized && options.force !== true)) return false;
  const fillValue = Number.isFinite(Number(options.fillValue)) ? clampUtil(Number(options.fillValue), 0, 1) : 0;
  const changed = resourceDiscoveryRuntime.fill(TRACKS_KNOWLEDGE_MAP_ID, fillValue) === true;
  tracksDiscoveryInitialized = true;
  return changed;
}

function updateTracksDiscoveryOverlayState(message = "") {
  if (shouldRenderSlimeTrailOverlay()) {
    refreshSlimeAvailabilityGrid(true);
  }
  syncSlimeAvailabilityDebugUi();
  overlayDirtyRuntime.requestOverlayDraw();
  if (message) setStatus(message);
}

function normalizeAndApplyResourceDebugSettings(nextSettings, options = {}) {
  const previousGridSize = resourceDebugSettings.discovery.gridSize;
  const previousRevealRadius = resourceDebugSettings.discovery.movementRevealRadius;
  const previousRevealFalloff = resourceDebugSettings.discovery.revealFalloff;
  resourceDebugSettings = normalizeResourceDebugSettings(nextSettings, DEFAULT_RESOURCE_DEBUG_SETTINGS);
  const gridChanged = resourceDebugSettings.discovery.gridSize !== previousGridSize;
  const revealRadiusChanged = resourceDebugSettings.discovery.movementRevealRadius !== previousRevealRadius;
  const revealFalloffChanged = resourceDebugSettings.discovery.revealFalloff !== previousRevealFalloff;
  if (options.resetDiscovery) {
    resetKnowledgeMapForConfig();
  } else if (gridChanged || revealRadiusChanged || revealFalloffChanged) {
    resetKnowledgeMapForConfig();
    overlayDirtyRuntime.requestOverlayDraw();
  }
  syncResourceDebugPanel();
  const currentLayer = getInspectOverlayLayer();
  setInspectOverlayLayer(currentLayer === "none" ? "none" : currentLayer, {
    reason: "settings-sync",
    revealKnowledge: false,
  });
}

function serializeResourceDebugSettingsRuntime() {
  return serializeResourceDebugSettings(resourceDebugSettings, DEFAULT_RESOURCE_DEBUG_SETTINGS);
}

function applyResourceDebugSettingsRuntime(rawData) {
  normalizeAndApplyResourceDebugSettings(rawData);
}

function serializeResourceStockSettingsRuntime() {
  return resourceStockRuntime && typeof resourceStockRuntime.serializeSettings === "function"
    ? resourceStockRuntime.serializeSettings()
    : RESOURCE_STOCK_SETTINGS;
}

function applyResourceStockSettingsRuntime(rawData) {
  if (resourceStockRuntime && typeof resourceStockRuntime.applySettings === "function") {
    resourceStockRuntime.applySettings(rawData || RESOURCE_STOCK_SETTINGS);
    emitResourceStockChanged({ resourceId: "*", reason: "settings-applied" });
  }
}

function getResourceSearchIds() {
  return Object.keys(RESOURCE_SEARCHES);
}

function getResourceDisplayLabel(resourceId) {
  if (resourceId === "water") return "Water";
  if (resourceId === "plants") return "Plants";
  return resourceId;
}

function getInspectOverlayLayer() {
  return inspectPerceptionRuntime?.getLayer() || "none";
}

function setInspectOverlayLayer(layer, options = {}) {
  const nextLayer = inspectPerceptionRuntime?.setLayer(layer, options);
  if (nextLayer === "tracks") {
    initializeTracksDiscoveryMap();
    refreshSlimeAvailabilityGrid(true);
  } else if (layer === "tracks" || nextLayer === "none") {
    overlayDirtyRuntime.requestOverlayDraw();
  }
  return nextLayer;
}

function getActivitySnapshot() {
  if (playerActivityRuntime) {
    return playerActivityRuntime.getSnapshot();
  }
  const state = runtimeCore.store.getState();
  return state && state.gameplay ? state.gameplay.activity || null : null;
}

function getInspectResourceReadings(pixelX, pixelY) {
  return getResourceSearchIds()
    .map((resourceId) => {
      const search = resourceSearchRuntime?.getSearch(resourceId);
      if (!search) return null;
      const value = resourceSearchRuntime.sample(resourceId, pixelX, pixelY);
      const baseChance = resourceSearchRuntime.hasMap(resourceId)
        ? computeResourceSearchChance(search, value)
        : 0;
      const liveChance = resourceSearchRuntime.chance(resourceId, pixelX, pixelY);
      const knowledge = resourceDiscoveryRuntime?.sampleKnowledge(resourceId, pixelX, pixelY) || 0;
      const stock = resourceStockRuntime?.sampleFactor(resourceId, pixelX, pixelY) ?? 1;
      const knownStock = resourceStockRuntime?.sampleKnownFactor(resourceId, pixelX, pixelY) ?? 0;
      const knownChance = baseChance * knownStock;
      return {
        resourceId,
        label: getResourceDisplayLabel(resourceId),
        map: search.map,
        value,
        chance: knownChance,
        knownChance,
        liveChance,
        baseChance,
        knowledge,
        stock,
        knownStock,
      };
    })
    .filter(Boolean);
}

function sampleInspectTracks(pixelX, pixelY) {
  const sample = sampleSlimeAvailabilityCircle(slimeAvailabilityGrid, {
    x: pixelX,
    y: pixelY,
    radius: 0,
    mapWidth: splatSize.width,
    mapHeight: splatSize.height,
    effectiveMax: getSlimeSettings().availabilityEffectiveMax,
  });
  return sample.availability;
}

function getKnowledgeMapId(resourceId = "") {
  if (resourceId === TRACKS_KNOWLEDGE_MAP_ID) return TRACKS_KNOWLEDGE_MAP_ID;
  return WORLD_KNOWLEDGE_MAP_ID;
}

function getResourceDiscoveryConfig(resourceId = "") {
  return {
    gridSize: resourceDebugSettings.discovery.gridSize,
    movementRevealRadius: resourceDebugSettings.discovery.movementRevealRadius,
    revealFalloff: resourceDebugSettings.discovery.revealFalloff,
  };
}

function getResourceDiscoveryDecayConfig(resourceId = "") {
  if (resourceId === TRACKS_KNOWLEDGE_MAP_ID) {
    return { enabled: false, intervalTicks: 1, amount: 0 };
  }
  return resourceDebugSettings.discovery.decay;
}

function isDiscoveryDaytime() {
  const sun = sampleSunAtHour(cycleState.hour);
  return Number(sun && sun.altitudeDeg) > 0;
}

function getDiscoveryRevealRadiusMultiplier() {
  const timeSettings = DISCOVERY_SETTINGS.timeOfDay || {};
  const multiplier = isDiscoveryDaytime()
    ? timeSettings.dayRevealMultiplier
    : timeSettings.nightRevealMultiplier;
  return Math.max(0, Number.isFinite(Number(multiplier)) ? Number(multiplier) : 1);
}

function resolveDiscoveryRevealRadius(resourceId, radius) {
  if (!resourceDiscoveryRuntime || typeof resourceDiscoveryRuntime.resolveRevealRadius !== "function") {
    return Math.max(0, Number(radius) || 0);
  }
  return resourceDiscoveryRuntime.resolveRevealRadius(resourceId, radius);
}

function getResourceMovementRevealRadius(resourceId) {
  const search = resourceSearchRuntime?.getSearch(resourceId);
  const configured = getResourceDiscoveryConfig(resourceId);
  const discovery = (search && search.discovery) || configured || {};
  return Number.isFinite(Number(discovery.movementRevealRadius)) ? Number(discovery.movementRevealRadius) : 80;
}

function revealResourceMovementKnowledge(resourceId, x, y) {
  const discoveryChanged = resourceDiscoveryRuntime?.revealMovement(resourceId, x, y) === true;
  const stockChanged = resourceStockRuntime?.revealKnown(resourceId, x, y, resolveDiscoveryRevealRadius(
    resourceId,
    getResourceMovementRevealRadius(resourceId),
  )) === true;
  return discoveryChanged || stockChanged;
}

function revealTrackMovementKnowledge(x, y) {
  return resourceDiscoveryRuntime?.revealMovement(TRACKS_KNOWLEDGE_MAP_ID, x, y) === true;
}

function refreshPlayerLocalResourceKnowledgeForTicks(ctx = {}) {
  const ticks = Math.max(0, Math.round(Number(ctx.time && ctx.time.ticksProcessed) || 0));
  if (ticks <= 0) return false;
  let changed = false;
  changed = revealTrackMovementKnowledge(playerState.pixelX, playerState.pixelY) || changed;
  for (const resourceId of getResourceSearchIds()) {
    changed = revealResourceMovementKnowledge(resourceId, playerState.pixelX, playerState.pixelY) || changed;
  }
  return changed;
}

function getResourceStockOverlayFactor(resourceId, x, y) {
  if (resourceStockOverlayMode === "live") {
    return resourceStockRuntime?.sampleFactor(resourceId, x, y) ?? 1;
  }
  if (resourceStockOverlayMode === "none") {
    return 1;
  }
  return resourceStockRuntime?.sampleKnownFactor(resourceId, x, y) ?? 1;
}

function getResourceMapImageDataByName(mapName) {
  if (mapName === "wetness") return wetnessImageData;
  if (mapName === "water") return waterImageData;
  return null;
}

function getSlimePlantBaseResourceImageData() {
  const resourceId = "plants";
  const search = resourceSearchRuntime?.getSearch(resourceId);
  const sourceImageData = getResourceMapImageDataByName(search && search.map);
  if (!resourceSearchRuntime || !search || !sourceImageData || !sourceImageData.data) return null;
  if (
    slimePlantBaseResourceCache
    && slimePlantBaseResourceCache.sourceImageData === sourceImageData
  ) {
    return slimePlantBaseResourceCache.imageData;
  }

  const width = sourceImageData.width;
  const height = sourceImageData.height;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = resourceSearchRuntime.sample(resourceId, x, y);
      const byte = Math.max(0, Math.min(255, Math.round(value * 255)));
      const index = (y * width + x) * 4;
      data[index] = byte;
      data[index + 1] = byte;
      data[index + 2] = byte;
      data[index + 3] = 255;
    }
  }
  slimePlantBaseResourceCache = {
    sourceImageData,
    imageData: { width, height, data },
  };
  return slimePlantBaseResourceCache.imageData;
}

function getSlimePlantResourceImageData() {
  const resourceId = "plants";
  const search = resourceSearchRuntime?.getSearch(resourceId);
  const sourceImageData = getResourceMapImageDataByName(search && search.map);
  if (!resourceSearchRuntime || !search || !sourceImageData || !sourceImageData.data) return null;
  const stockVersion = resourceStockRuntime?.getVersion(resourceId) || 0;
  if (
    slimePlantResourceCache
    && slimePlantResourceCache.sourceImageData === sourceImageData
    && slimePlantResourceCache.stockVersion === stockVersion
  ) {
    return slimePlantResourceCache.imageData;
  }

  const width = sourceImageData.width;
  const height = sourceImageData.height;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = resourceSearchRuntime.sample(resourceId, x, y)
        * (resourceStockRuntime?.sampleFactor(resourceId, x, y) ?? 1);
      const byte = Math.max(0, Math.min(255, Math.round(value * 255)));
      const index = (y * width + x) * 4;
      data[index] = byte;
      data[index + 1] = byte;
      data[index + 2] = byte;
      data[index + 3] = 255;
    }
  }
  slimePlantResourceCache = {
    sourceImageData,
    stockVersion,
    imageData: { width, height, data },
  };
  return slimePlantResourceCache.imageData;
}

function formatPct(value) {
  const safe = Number(value);
  return Number.isFinite(safe) ? `${Math.round(safe * 100)}%` : "--";
}

function formatInspectResourceReading(reading) {
  if (!reading) return "";
  const label = reading.label || getResourceDisplayLabel(reading.resourceId);
  const value = Number(reading.value);
  const chance = Number(reading.chance);
  const knowledge = Number(reading.knowledge);
  const stock = Number(reading.stock);
  const knownStock = Number(reading.knownStock);
  return `${label}: map ${Number.isFinite(value) ? value.toFixed(2) : "--"} | known chance ${formatPct(chance)} | known ${formatPct(knowledge)} | live stock ${formatPct(stock)} | known stock ${formatPct(knownStock)}`;
}

function formatInspectRuntimeDetails(compact = false) {
  const inspect = getInspectSnapshot();
  const height = Number(inspect.inspectHeight);
  const slope = Number(inspect.inspectSlope);
  const x = inspect.inspectX ?? "--";
  const y = inspect.inspectY ?? "--";
  const terrainText = `Inspect (${x}, ${y}) | H ${Number.isFinite(height) ? height.toFixed(3) : "--"} | S ${Number.isFinite(slope) ? `${(slope * 90).toFixed(1)} deg` : "--"}`;
  if (compact) return terrainText;
  const resourceText = inspect.inspectResources.map(formatInspectResourceReading).filter(Boolean).join("\n");
  return terrainText + (resourceText ? `\n${resourceText}` : "");
}

function getInspectLayerBarValue(layer = getInspectOverlayLayer()) {
  return inspectPerceptionRuntime?.getLayerBarValue(layer, resourceStockOverlayMode) || 0;
}

function isInspectBlockedByActivity(activitySnapshot) {
  return Boolean(activitySnapshot && activitySnapshot.active && (activitySnapshot.type === "rest" || activitySnapshot.type === "scout"));
}

function updateInspectStatusPanel(activitySnapshot = getActivitySnapshot()) {
  refreshInspectSample();
  const inspect = getInspectSnapshot();
  const layer = getInspectOverlayLayer();
  const focused = inspect.enabled && !isInspectBlockedByActivity(activitySnapshot);
  inspectStatusPanelEl.classList.toggle("inspect-disabled", !focused);
  inspectLayerControlsEl.classList.remove("hidden");
  for (const button of inspectLayerControlsEl.querySelectorAll("button")) {
    button.disabled = !focused;
  }
  inspectStatusTitleEl.textContent = "Inspect:";
  inspectStatusEtaEl.textContent = "";
  const hasInspectLayer = layer !== "none";
  inspectResourceRowEl.classList.toggle("hidden", !focused || !hasInspectLayer);
  if (focused && hasInspectLayer) {
    const value = getInspectLayerBarValue(layer);
    inspectResourceLabelEl.textContent = getInspectOverlayDisplayLabel(layer);
    inspectResourceBarFillEl.style.width = `${Math.round(value * 100)}%`;
    inspectStatusDetailEl.textContent = `${inspectResourceLabelEl.textContent}: ${Math.round(value * 100)}%`;
  } else {
    inspectResourceBarFillEl.style.width = "0%";
    inspectStatusDetailEl.textContent = isInspectBlockedByActivity(activitySnapshot)
      ? "Inspect focus unavailable during this activity."
      : (focused ? "Inspect active. No layer selected." : "Inspect focus off.");
  }
}

function getResourceStockReadout(resourceId) {
  const id = resourceId || "water";
  const x = playerState.pixelX;
  const y = playerState.pixelY;
  const live = resourceStockRuntime?.sampleFactor(id, x, y);
  const known = resourceStockRuntime?.sampleKnownFactor(id, x, y);
  const liveChance = resourceSearchRuntime?.chance(id, x, y);
  const baseValue = resourceSearchRuntime?.sample(id, x, y);
  const search = resourceSearchRuntime?.getSearch(id);
  const baseChance = search && resourceSearchRuntime?.hasMap(id)
    ? computeResourceSearchChance(search, baseValue)
    : 0;
  const knownChance = baseChance * (Number.isFinite(Number(known)) ? Number(known) : 0);
  const snapshot = resourceStockRuntime?.getSnapshot(id);
  const grid = snapshot ? `${snapshot.width}x${snapshot.height}` : "--";
  return `Stock: ${formatPct(live)} | Known: ${formatPct(known)} | Chance known/live/base: ${formatPct(knownChance)} / ${formatPct(liveChance)} / ${formatPct(baseChance)} | Map: ${formatPct(baseValue)} | Grid: ${grid}`;
}

function getResourceOverlayConfig(search) {
  if (!search) return search;
  const layer = getInspectOverlayLayer();
  const layerSettings = getResourceDebugLayerSettings(getInspectOverlayDebugLayer(layer));
  const enabledBands = Array.isArray(layerSettings.bands)
    ? layerSettings.bands
      .map((band, index) => ({ ...band, color: getResourceDebugBandColors(layerSettings)[index] }))
      .filter((band) => band && band.enabled !== false && Number.isFinite(Number(band.threshold)))
      .sort((a, b) => Number(a.threshold) - Number(b.threshold))
    : [];
  return {
    ...search,
    overlay: {
      ...(search.overlay || {}),
      type: "contour",
      enabledInInspect: true,
      sampleStep: layerSettings.sampleStep,
      knowledgeThreshold: layerSettings.knowledgeThreshold,
      lineWidth: layerSettings.lineWidth,
      thresholds: enabledBands.map((band) => Number(band.threshold)),
      colors: enabledBands.map((band) => band.color),
    },
  };
}

function createTerrainContourSearch(layer) {
  if (layer !== "height" && layer !== "slope") return null;
  return {
    id: layer,
    map: layer,
    channel: "r",
    overlay: {
      type: "contour",
      enabledInInspect: true,
    },
  };
}

function getResourceContourOverlaySnapshot() {
  const inspect = getInspectSnapshot();
  if (!inspect || !inspect.enabled) return null;
  const activity = getActivitySnapshot();
  if (activity && activity.active && (activity.type === "rest" || activity.type === "scout")) return null;
  const layer = getInspectOverlayLayer();
  if (layer === "none") return null;
  const resourceId = getInspectOverlayResourceId(layer);
  const isTerrainLayer = layer === "height" || layer === "slope";
  const discoveryResourceId = isTerrainLayer ? resourceDebugOverlayResourceId || "water" : resourceId;
  const search = isTerrainLayer
    ? createTerrainContourSearch(layer)
    : resourceSearchRuntime?.getSearch(resourceId);
  if (!search || !search.overlay || search.overlay.type !== "contour") return null;
  const imageData = layer === "height"
    ? heightImageData
    : (layer === "slope" ? slopeImageData : wetnessImageData);
  if (!imageData) return null;
  return {
    resourceId,
    search: getResourceOverlayConfig(search),
    imageData,
    overlayLayer: layer,
    contourVersion: isTerrainLayer
      ? `terrain:${layer}:${getResourceContourDiscoveryCacheVersion(discoveryResourceId)}`
      : getResourceContourCacheVersion(resourceId),
    stockVersion: isTerrainLayer ? 0 : resourceStockRuntime?.getVersion(resourceId) || 0,
    sampleKnowledge: isTerrainLayer
      ? (_id, x, y) => resourceDiscoveryRuntime?.sampleKnowledge(discoveryResourceId, x, y) || 0
      : (id, x, y) => resourceDiscoveryRuntime?.sampleKnowledge(id, x, y) || 0,
    sampleStockFactor: isTerrainLayer ? () => 1 : getResourceStockOverlayFactor,
  };
}

function getDiscoveryMaskOverlaySnapshot() {
  if (resourceDebugSettings.discovery.showMaskOverlay !== true) return null;
  const snapshot = resourceDiscoveryRuntime?.getSnapshot(WORLD_KNOWLEDGE_MAP_ID);
  if (!snapshot) return null;
  return {
    ...snapshot,
    opacity: resourceDebugSettings.discovery.maskOverlayOpacity,
  };
}

function getDiscoveryVisibilitySettings() {
  const visibility = resourceDebugSettings.discovery && resourceDebugSettings.discovery.terrainVisibility
    ? resourceDebugSettings.discovery.terrainVisibility
    : {};
  const navActive = routePlanningRuntime?.getSnapshot?.().active === true;
  return {
    ...visibility,
    enabled: visibility.enabled === true && navActive,
    resourceId: WORLD_KNOWLEDGE_MAP_ID,
  };
}

function getDiscoveryVisibilitySnapshot(resourceId = null) {
  const id = resourceId || WORLD_KNOWLEDGE_MAP_ID;
  return resourceDiscoveryRuntime?.getSnapshot(id) || null;
}

function getDiscoveryNoiseSettings() {
  const visibility = getDiscoveryVisibilitySettings();
  return {
    seed: visibility.noiseSeed,
    scale: visibility.noiseScale,
    min: visibility.noiseMin,
    max: visibility.noiseMax,
  };
}

function seedDiscoveryNoise(resourceId = null) {
  if (!resourceDiscoveryRuntime || typeof resourceDiscoveryRuntime.fillNoise !== "function") return false;
  const ids = resourceId ? [resourceId] : getResourceSearchIds();
  const settings = getDiscoveryNoiseSettings();
  let changed = false;
  for (const id of ids) {
    changed = resourceDiscoveryRuntime.fillNoise(id, settings) || changed;
  }
  if (changed) {
    overlayDirtyRuntime.requestOverlayDraw();
  }
  return changed;
}

function getDiscoveryTerrainVisibilityOverlaySnapshot() {
  const settings = getDiscoveryVisibilitySettings();
  if (settings.enabled !== true) return null;
  const snapshot = getDiscoveryVisibilitySnapshot(settings.resourceId);
  if (!snapshot) return null;
  return {
    snapshot,
    settings,
    terrainImageData: splatImageData,
  };
}

function sampleInspectGray(imageData, pixelX, pixelY) {
  if (!imageData || !imageData.data) return 0;
  const w = imageData.width || 1;
  const h = imageData.height || 1;
  const srcW = Math.max(1, Number(splatSize.width) || 1);
  const srcH = Math.max(1, Number(splatSize.height) || 1);
  const nx = (Number(pixelX) + 0.5) / srcW;
  const ny = (Number(pixelY) + 0.5) / srcH;
  const sx = clamp(Math.round(nx * w - 0.5), 0, Math.max(0, w - 1));
  const sy = clamp(Math.round(ny * h - 0.5), 0, Math.max(0, h - 1));
  return imageData.data[(sy * w + sx) * 4] / 255;
}

function refreshInspectSample() {
  inspectPerceptionRuntime?.refreshSample();
}

function getInspectSnapshot() {
  return inspectPerceptionRuntime?.getSnapshot({ stockOverlayMode: resourceStockOverlayMode }) || {
    enabled: false,
    layer: getInspectOverlayLayer(),
    inspectX: null,
    inspectY: null,
    inspectHeight: null,
    inspectSlope: null,
    inspectTracks: 0,
    inspectResources: [],
    stockOverlayMode: resourceStockOverlayMode,
  };
}

function toggleInspectRuntime() {
  return inspectPerceptionRuntime?.toggle() || { ok: false, reason: "Inspect runtime unavailable." };
}

function setActivityTimeSpeed1x() {
  dispatchCoreCommand({
    type: "core/time/setCycleSpeed",
    cycleSpeed: 0.01,
  });
}

function updateInspectFromPointer(clientX, clientY) {
  if (!inspectPerceptionRuntime?.isEnabled()) return;
  const ndc = clientToNdc(clientX, clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) return;
  const pixel = uvToMapPixelIndex(uv);
  inspectPerceptionRuntime.updateFromMapPixel(pixel.x, pixel.y, "pointer");
}

function clearCommittedTravelPathPreview() {
  travelPlanningRuntime.clearCommitted("committed-cleared");
}

function advanceCommittedTravelPathPreview() {
  travelPlanningRuntime.advanceCommittedPathToPixel({
    x: playerState.pixelX,
    y: playerState.pixelY,
  }, "committed-progress");
}

function formatMovementDuration(hoursValue) {
  const safeHours = Number(hoursValue);
  if (!Number.isFinite(safeHours)) return "--";
  const totalMinutes = Math.max(0, Math.round(safeHours * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function getMovementDurationHours(movementSnapshot) {
  const state = runtimeCore.store.getState();
  const timeState = state && state.systems ? state.systems.time || {} : {};
  const simTickHours = normalizeSimTickHours(timeState.simTickHours);
  const totalTicks = Math.max(0, Number(movementSnapshot && movementSnapshot.totalTicksRemaining) || 0);
  return totalTicks * simTickHours;
}

function syncHuntingAvailabilityPanel(activitySnapshot = null) {
  const active = activitySnapshot && activitySnapshot.active && activitySnapshot.type === "hunting";
  huntingAvailabilityRowEl.classList.toggle("hidden", !active);
  if (!active) {
    huntingAvailabilityBarFillEl.style.width = "0%";
    return;
  }
  const availability = clampUtil(Number(activitySnapshot.huntingAvailability) || 0, 0, 1);
  const chance = clampUtil(Number(activitySnapshot.lastSearchChance) || 0, 0, 1);
  const valueEl = document.createElement("span");
  valueEl.className = "activity-meter-label-value";
  valueEl.textContent = `${Math.round(availability * 100)}%`;
  huntingAvailabilityLabelEl.replaceChildren("Tracks ", valueEl);
  huntingAvailabilityBarFillEl.style.width = `${Math.round(availability * 100)}%`;
  huntingAvailabilityRowEl.title = `Hunting chance ${Math.round(chance * 100)}%`;
}

function updateMovementStatusPanel(movementSnapshot) {
  movementActionBtn.classList.add("hidden");
  movementActionBtn.disabled = true;
  const activitySnapshot = getActivitySnapshot();
  syncHuntingAvailabilityPanel(activitySnapshot);
  updateInspectStatusPanel(activitySnapshot);
  if (activitySnapshot && activitySnapshot.active) {
    if (activitySnapshot.type === "inspect") {
      movementStatusPanelEl.classList.add("hidden");
      return;
    } else if (activitySnapshot.type === "scout") {
      const phase = activitySnapshot.scoutPhase === "possessed" ? "possessed" : "scanning";
      const rawCandidateIndex = Number(activitySnapshot.scoutCandidateIndex);
      const candidateIndex = Number.isFinite(rawCandidateIndex) ? Math.round(rawCandidateIndex) : -1;
      const disconnectReason = typeof activitySnapshot.scoutDisconnectReason === "string"
        ? activitySnapshot.scoutDisconnectReason
        : "";
      movementStatusTitleEl.textContent = phase === "possessed" ? "Bird Scout" : "Scouting";
      movementStatusEtaEl.textContent = phase === "possessed"
        ? "Bird possessed"
        : (candidateIndex >= 0 ? "Bird is within reach" : "Listening");
      movementStatusDetailEl.textContent = phase === "possessed"
        ? ""
        : disconnectReason;
      movementActionBtn.textContent = "Possess Bird";
      movementActionBtn.disabled = phase === "possessed" || candidateIndex < 0;
      movementActionBtn.classList.toggle("hidden", phase === "possessed");
    } else if (activitySnapshot.type === "rest") {
      movementStatusTitleEl.textContent = "Resting";
      movementStatusEtaEl.textContent = "Recovering fatigue";
      movementStatusDetailEl.textContent = "";
    } else {
      movementStatusTitleEl.textContent = activitySnapshot.type === "gathering"
        ? "Gathering"
        : (activitySnapshot.type === "hunting" ? "Hunting" : "Activity");
      movementStatusEtaEl.textContent = "";
      const found = Math.max(0, Math.round(Number(activitySnapshot.foundCount) || 0));
      movementStatusDetailEl.textContent = found > 0 ? `Found: ${found}` : "";
    }
    movementStatusPanelEl.classList.remove("hidden");
    return;
  }
  if (!movementSnapshot || !movementSnapshot.active) {
    movementStatusTitleEl.textContent = "Idle";
    movementStatusEtaEl.textContent = "Awaiting activity";
    movementStatusDetailEl.textContent = "No active task.";
    movementStatusPanelEl.classList.remove("hidden");
    return;
  }
  movementStatusTitleEl.textContent = "Traveling";
  movementStatusEtaEl.textContent = `Travel time: ${formatMovementDuration(getMovementDurationHours(movementSnapshot))} hours`;
  movementStatusDetailEl.textContent = "";
  movementStatusPanelEl.classList.remove("hidden");
}

const movementSystem = createMovementSystem(createMovementAssemblyRuntime({
  entityStore,
  playerState,
  getMapWidth: () => splatSize.width,
  getMapHeight: () => splatSize.height,
  computeMoveStepCost,
  getMoveCostContext,
  rebuildMovementField,
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
  setStatus,
  setPlayerSnapshot: movementStoreSyncRuntime.setPlayerSnapshot,
  setMovementSnapshot: movementStoreSyncRuntime.setMovementSnapshot,
  onMovementSnapshot: updateMovementStatusPanel,
  onStepCompleted: (step, snapshot) => {
    for (const resourceId of getResourceSearchIds()) {
      revealResourceMovementKnowledge(resourceId, playerState.pixelX, playerState.pixelY);
    }
    emitInspectChanged({ reason: "movement-step" });
    advanceCommittedTravelPathPreview();
    const conditionModifiers = conditionEffectRuntime?.getModifiers() || {};
    activityEffectRuntime?.apply(getActivityCostKey("travel", "movement", "movement.step"), {
      movementCost: Math.max(0, Number(step && step.cost) || 0),
      load: conditionRuntime?.getSnapshot().load || 0,
      conditionModifiers,
    });
    playerActivityRuntime?.onStepCompleted(step, snapshot);
    inventoryRuntime?.sync();
  },
  onQueueCompleted: (...args) => {
    const activityWasActive = Boolean(playerActivityRuntime?.isActivityActive());
    playerActivityRuntime?.onQueueCompleted(...args);
    if (!activityWasActive) {
      setActivityTimeSpeed1x();
    }
    clearCommittedTravelPathPreview();
  },
  onMovementCanceled: (...args) => {
    const activityWasActive = Boolean(playerActivityRuntime?.isActivityActive());
    playerActivityRuntime?.onMovementCanceled(...args);
    if (!activityWasActive) {
      setActivityTimeSpeed1x();
    }
    clearCommittedTravelPathPreview();
  },
}));
registerRuntimeEventHandlers(eventBus, {
  invalidateResourceContourOverlay,
  syncResourceStockPanel: () => resourceDebugPanelRuntime?.syncStock?.(),
  refreshInspectSample,
  syncGameplayHud: () => {
    gameplayHudRuntime?.sync();
    localActivityMenuRuntime?.sync();
  },
  updateMovementStatusPanel: () => updateMovementStatusPanel(movementSystem.getSnapshot()),
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
});
const conditionRuntime = createConditionRuntime({
  setConditionSnapshot: conditionStoreSyncRuntime.setConditionSnapshot,
  onConditionSnapshot: () => {
    conditionEffectRuntime?.sync();
    conditionEventTriggerRuntime?.sync("condition-change");
    inventoryPanelRuntime?.sync();
    gameplayHudRuntime?.sync();
    localActivityMenuRuntime?.sync();
  },
});
conditionEventTriggerRuntime = createConditionEventTriggerRuntime({
  getConditionSnapshot: () => conditionRuntime.getSnapshot(),
  triggerEvent: (triggerType, payload) => eventRuntime?.trigger(triggerType, payload),
  hydrationThreshold: CONDITION_THRESHOLDS.hydration?.warning,
  fatigueThreshold: CONDITION_THRESHOLDS.fatigue?.warning,
});
conditionEventTriggerRuntime.resetBaseline();
conditionEffectRuntime = createConditionEffectRuntime({
  conditionEffects: CONDITION_EFFECTS,
  getConditionSnapshot: () => conditionRuntime.getSnapshot(),
  onConditionEffectsSnapshot: (snapshot) => {
    conditionStoreSyncRuntime.setConditionSnapshot({
      activeEffects: snapshot.activeEffects,
      modifiers: snapshot.modifiers,
    });
    gameplayHudRuntime?.sync();
  },
  setStatus,
});
activityEffectRuntime = createActivityEffectRuntime({
  activityCosts: ACTIVITY_COSTS,
  applyConditionEffectModifiers,
  applyConditionEffects: (effects) => conditionRuntime.applyEffects(effects),
});
travelEstimateRuntime = createTravelEstimateRuntime({
  getTravelPlanningSnapshot: () => travelPlanningRuntime.getSnapshot(),
  computeMoveStepCost,
  getMoveCostContext,
  resolveActivityEffects: (activityType, context) => activityEffectRuntime.resolve(activityType, context),
  getMovementCostKey: () => getActivityCostKey("travel", "movement", "movement.step"),
  getUpkeepCostKey: () => getActivityCostKey("idle", "upkeep", "idle.tick"),
  getConditionSnapshot: () => conditionRuntime.getSnapshot(),
  getConditionEffectsSnapshot: () => conditionEffectRuntime.getSnapshot(),
  getProjectedConditionWarnings: (projectedCondition) => {
    const current = conditionEffectRuntime.getSnapshot();
    const projected = resolveConditionEffects(CONDITION_EFFECTS, projectedCondition || {});
    return compareConditionEffectSnapshots(current.activeEffects, projected.activeEffects);
  },
  getTimeState: () => {
    const state = runtimeCore.store.getState();
    return state && state.systems ? state.systems.time || {} : {};
  },
});
resourceStockRuntime = createResourceStockRuntime({
  resourceSearches: RESOURCE_SEARCHES,
  resourceStockSettings: RESOURCE_STOCK_SETTINGS,
  getMapWidth: () => splatSize.width,
  getMapHeight: () => splatSize.height,
  onChange: (resourceId = "*") => {
    emitResourceStockChanged({ resourceId, reason: "runtime-change" });
  },
});
resourceSearchRuntime = createResourceSearchRuntime({
  resourceSearches: RESOURCE_SEARCHES,
  getResourceMapImageData: getResourceMapImageDataByName,
  getResourceStockFactor: (resourceId, x, y) => resourceStockRuntime?.sampleFactor(resourceId, x, y) ?? 1,
});
resourceDiscoveryRuntime = createResourceDiscoveryRuntime({
  resourceSearches: RESOURCE_SEARCHES,
  getMapWidth: () => splatSize.width,
  getMapHeight: () => splatSize.height,
  getDiscoveryConfig: getResourceDiscoveryConfig,
  getDecayConfig: getResourceDiscoveryDecayConfig,
  getKnowledgeMapId,
  getRevealRadiusMultiplier: getDiscoveryRevealRadiusMultiplier,
  onChange: () => {
    emitResourceDiscoveryChanged({ resourceId: "*", reason: "runtime-change" });
  },
});
inspectPerceptionRuntime = createInspectPerceptionRuntime({
  initialEnabled: true,
  initialLayer: "none",
  getMapSize: () => splatSize,
  getFallbackPixel: () => ({ x: playerState.pixelX, y: playerState.pixelY }),
  sampleHeight: (pixelX, pixelY) => sampleInspectGray(heightImageData, pixelX, pixelY),
  sampleSlope: (pixelX, pixelY) => sampleInspectGray(slopeImageData, pixelX, pixelY),
  sampleTracks: sampleInspectTracks,
  getResourceReadings: getInspectResourceReadings,
  getLayerButtons: () => [
    ["tracks", inspectTracksLayerBtn],
    ["water", inspectWetnessLayerBtn],
    ["plants", inspectPlantsLayerBtn],
    ["height", inspectHeightLayerBtn],
    ["slope", inspectSlopeLayerBtn],
  ],
  canEnable: () => !isInspectBlockedByActivity(getActivitySnapshot()),
  getBlockedReason: () => "Inspect is unavailable during this activity.",
  onResourceLayerSelected: (resourceId) => {
    resourceDebugOverlayResourceId = resourceId;
  },
  revealResourceKnowledge: (resourceId) => {
    revealResourceMovementKnowledge(resourceId, playerState.pixelX, playerState.pixelY);
  },
  onDebugLayerSelected: (debugLayer) => {
    resourceDebugSettings = normalizeResourceDebugSettings({
      ...resourceDebugSettings,
      activeLayer: debugLayer,
    }, DEFAULT_RESOURCE_DEBUG_SETTINGS);
  },
  syncDebugPanel: syncResourceDebugPanel,
  onChanged: emitInspectChanged,
  setStatus,
});
resourceStockResourceInput.textContent = "";
discoveryVisibilityResourceInput.textContent = "";
for (const resourceId of Object.keys(RESOURCE_SEARCHES)) {
  const option = document.createElement("option");
  option.value = resourceId;
  option.textContent = getResourceDisplayLabel(resourceId);
  resourceStockResourceInput.appendChild(option);
}
const knowledgeOption = document.createElement("option");
knowledgeOption.value = WORLD_KNOWLEDGE_MAP_ID;
knowledgeOption.textContent = "Shared Knowledge Map";
discoveryVisibilityResourceInput.appendChild(knowledgeOption);
discoveryVisibilityResourceInput.value = WORLD_KNOWLEDGE_MAP_ID;
if (!resourceStockResourceInput.value) {
  const option = document.createElement("option");
  option.value = "water";
  option.textContent = "Water";
  resourceStockResourceInput.appendChild(option);
}
resourceDebugPanelRuntime = createResourceDebugPanelRuntime({
  devTabButtons: resourceDebugDevTabButtons,
  devTabPanels: resourceDebugDevTabPanels,
  tabGroups: resourceDebugTabGroups,
  tabButtons: resourceDebugTabButtons,
  tabPanels: resourceDebugTabPanels,
  layerInput: resourceDebugLayerInput,
  tintColorInput: resourceDebugTintColorInput,
  discoveryGridInput: resourceDebugDiscoveryGridInput,
  discoveryGridValue: resourceDebugDiscoveryGridValue,
  revealRadiusInput: resourceDebugRevealRadiusInput,
  revealRadiusValue: resourceDebugRevealRadiusValue,
  revealFalloffInput: resourceDebugRevealFalloffInput,
  revealFalloffValue: resourceDebugRevealFalloffValue,
  decayEnabledInput: resourceDebugDecayEnabledInput,
  decayIntervalInput: resourceDebugDecayIntervalInput,
  decayIntervalValue: resourceDebugDecayIntervalValue,
  decayAmountInput: resourceDebugDecayAmountInput,
  decayAmountValue: resourceDebugDecayAmountValue,
  showMaskOverlayInput: resourceDebugShowMaskOverlayInput,
  maskOverlayOpacityInput: resourceDebugMaskOverlayOpacityInput,
  maskOverlayOpacityValue: resourceDebugMaskOverlayOpacityValue,
  sampleStepInput: resourceDebugSampleStepInput,
  sampleStepValue: resourceDebugSampleStepValue,
  knowledgeThresholdInput: resourceDebugKnowledgeThresholdInput,
  knowledgeThresholdValue: resourceDebugKnowledgeThresholdValue,
  lineWidthInput: resourceDebugLineWidthInput,
  lineWidthValue: resourceDebugLineWidthValue,
  band1Input: resourceDebugBand1Input,
  band1Value: resourceDebugBand1Value,
  band1EnabledInput: resourceDebugBand1EnabledInput,
  band2Input: resourceDebugBand2Input,
  band2Value: resourceDebugBand2Value,
  band2EnabledInput: resourceDebugBand2EnabledInput,
  band3Input: resourceDebugBand3Input,
  band3Value: resourceDebugBand3Value,
  band3EnabledInput: resourceDebugBand3EnabledInput,
  band4Input: resourceDebugBand4Input,
  band4Value: resourceDebugBand4Value,
  band4EnabledInput: resourceDebugBand4EnabledInput,
  band5Input: resourceDebugBand5Input,
  band5Value: resourceDebugBand5Value,
  band5EnabledInput: resourceDebugBand5EnabledInput,
  saveSettingsBtn: resourceDebugSaveBtn,
  discoveryVisibilityEnabledInput,
  discoveryVisibilityResourceInput,
  discoveryVisibilityModeInput,
  discoveryVisibilityDitherScaleInput,
  discoveryVisibilityDitherScaleValue,
  discoveryVisibilityKnowledgeGammaInput,
  discoveryVisibilityKnowledgeGammaValue,
  discoveryVisibilityBaseInput,
  discoveryVisibilityBaseValue,
  discoveryVisibilityFullThresholdInput,
  discoveryVisibilityFullThresholdValue,
  discoveryVisibilityUnknownDarknessInput,
  discoveryVisibilityUnknownDarknessValue,
  discoveryNoiseSeedInput,
  discoveryNoiseSeedValue,
  discoveryNoiseScaleInput,
  discoveryNoiseScaleValue,
  discoveryNoiseMinInput,
  discoveryNoiseMinValue,
  discoveryNoiseMaxInput,
  discoveryNoiseMaxValue,
  discoveryNoiseApplyBtn,
  discoveryFillKnownBtn,
  discoveryFillUnknownBtn,
  stockResourceInput: resourceStockResourceInput,
  stockOverlayModeInput: resourceStockOverlayModeInput,
  stockGridSizeInput: resourceStockGridSizeInput,
  stockGridSizeValue: resourceStockGridSizeValue,
  stockDepleteAmountInput: resourceStockDepleteAmountInput,
  stockDepleteAmountValue: resourceStockDepleteAmountValue,
  stockNeighborDepleteAmountInput: resourceStockNeighborDepleteAmountInput,
  stockNeighborDepleteAmountValue: resourceStockNeighborDepleteAmountValue,
  stockDepleteRadiusInput: resourceStockDepleteRadiusInput,
  stockDepleteRadiusValue: resourceStockDepleteRadiusValue,
  stockReplenishIntervalInput: resourceStockReplenishIntervalInput,
  stockReplenishIntervalValue: resourceStockReplenishIntervalValue,
  stockReplenishAmountInput: resourceStockReplenishAmountInput,
  stockReplenishAmountValue: resourceStockReplenishAmountValue,
  stockReadout: resourceStockReadout,
  stockDepleteHereBtn: resourceStockDepleteHereBtn,
  stockRevealHereBtn: resourceStockRevealHereBtn,
  stockFillFullBtn: resourceStockFillFullBtn,
  stockFillEmptyBtn: resourceStockFillEmptyBtn,
  stockResetBtn: resourceStockResetBtn,
  routeArrowColorInput,
  routeArrowSpacingInput,
  routeArrowSpacingValue,
  routeArrowOpacityInput,
  routeArrowOpacityValue,
  routeArrowSizeInput,
  routeArrowSizeValue,
  routeEndpointSkipRatioInput,
  routeEndpointSkipRatioValue,
  routePreviewPointRadiusInput,
  routePreviewPointRadiusValue,
  routePreviewOpacityInput,
  routePreviewOpacityValue,
  routeDiscoveryCutoffInput,
  routeDiscoveryCutoffValue,
  routePlanningSlopeMulInput,
  routePlanningSlopeMulValue,
  routePlanningHeightMulInput,
  routePlanningHeightMulValue,
  routePlanningWaterMulInput,
  routePlanningWaterMulValue,
  routePlanningSlopeCutoffAddInput,
  routePlanningSlopeCutoffAddValue,
  routeDebugOverlayModeInput,
  routeClearBtn,
  localActivityMenuRadiusInput,
  localActivityMenuRadiusValue,
  getLocalActivityMenuRadius: () => localActivityMenuRadius,
  setLocalActivityMenuRadius: (value) => {
    localActivityMenuRadius = Math.max(24, Math.min(140, Math.round(Number(value) || DEFAULT_LOCAL_ACTIVITY_MENU_RADIUS)));
    localActivityMenuRuntime?.setRadius(localActivityMenuRadius);
    setStatus(`Activity menu radius: ${localActivityMenuRadius}px.`);
  },
  getSettings: () => resourceDebugSettings,
  getStockSettings: (resourceId) => resourceStockRuntime.getResourceSettings(resourceId),
  updateStockSettings: (resourceId, patch) => {
    resourceStockRuntime.updateResourceSettings(resourceId, patch);
    setStatus(`Resource stock ${resourceId} settings updated.`);
  },
  getStockOverlayMode: () => resourceStockOverlayMode,
  setStockOverlayMode: (mode) => {
    resourceStockOverlayMode = mode === "live" || mode === "none" ? mode : "known";
    emitResourceStockChanged({ resourceId: "*", reason: "overlay-mode" });
    setStatus(`Resource stock overlay mode: ${resourceStockOverlayMode}.`);
  },
  getStockReadout: getResourceStockReadout,
  depleteStockAtPlayer: (resourceId) => {
    const changed = resourceStockRuntime.deplete(resourceId, playerState.pixelX, playerState.pixelY);
    setStatus(changed ? `Depleted ${resourceId} stock at player.` : `No ${resourceId} stock changed at player.`);
  },
  revealStockAtPlayer: (resourceId) => {
    revealResourceMovementKnowledge(resourceId, playerState.pixelX, playerState.pixelY);
    setStatus(`Refreshed known ${resourceId} stock at player.`);
  },
  fillStock: (resourceId, value) => {
    resourceStockRuntime.fill(resourceId, value, "both");
    setStatus(`${resourceId} stock filled to ${value}.`);
  },
  resetStock: (resourceId) => {
    resourceStockRuntime.reset(resourceId);
    revealResourceMovementKnowledge(resourceId, playerState.pixelX, playerState.pixelY);
    setStatus(`${resourceId} stock reset.`);
  },
  getRouteSettings: () => routePlanningRuntime?.getSnapshot?.().settings || DEFAULT_ROUTE_PLANNING_SETTINGS,
  updateRouteSettings: (patch) => {
    routePlanningRuntime?.updateSettings?.(patch, "resource-debug-route-settings");
    setStatus("Route settings updated.");
  },
  clearRoute: () => {
    routePlanningRuntime?.clearCommitted?.("resource-debug-clear-route");
    setStatus("Committed route cleared.");
  },
  setActiveLayer: (layer) => setInspectOverlayLayer(layer),
  updateDiscovery: (patch) => {
    normalizeAndApplyResourceDebugSettings({
      ...resourceDebugSettings,
      discovery: {
        ...resourceDebugSettings.discovery,
        ...patch,
      },
    });
  },
  updateDiscoveryDecay: (patch) => {
    normalizeAndApplyResourceDebugSettings({
      ...resourceDebugSettings,
      discovery: {
        ...resourceDebugSettings.discovery,
        decay: {
          ...resourceDebugSettings.discovery.decay,
          ...patch,
        },
      },
    });
  },
  updateDiscoveryVisibility: (patch) => {
    normalizeAndApplyResourceDebugSettings({
      ...resourceDebugSettings,
      discovery: {
        ...resourceDebugSettings.discovery,
        terrainVisibility: {
          ...resourceDebugSettings.discovery.terrainVisibility,
          ...patch,
        },
      },
    });
    overlayDirtyRuntime.requestOverlayDraw();
  },
  updateActiveLayer: (patch) => {
    const activeLayer = resourceDebugSettings.activeLayer;
    normalizeAndApplyResourceDebugSettings({
      ...resourceDebugSettings,
      layers: {
        ...resourceDebugSettings.layers,
        [activeLayer]: {
          ...getResourceDebugLayerSettings(activeLayer),
          ...patch,
        },
      },
    });
  },
  updateActiveBand: (index, patch) => {
    const activeLayer = resourceDebugSettings.activeLayer;
    const layerSettings = getResourceDebugLayerSettings(activeLayer);
    const bands = Array.isArray(layerSettings.bands) ? layerSettings.bands.map((band) => ({ ...band })) : [];
    bands[index] = {
      ...(bands[index] || {}),
      ...patch,
    };
    normalizeAndApplyResourceDebugSettings({
      ...resourceDebugSettings,
      layers: {
        ...resourceDebugSettings.layers,
        [activeLayer]: {
          ...layerSettings,
          bands,
        },
      },
    });
  },
  fillDiscoveryNoise: () => {
    seedDiscoveryNoise(WORLD_KNOWLEDGE_MAP_ID);
    setStatus("Shared Knowledge Map noise populated.");
  },
  fillVisibilityDiscovery: (value) => {
    resourceDiscoveryRuntime.fill(WORLD_KNOWLEDGE_MAP_ID, value);
    setStatus(value >= 1
      ? "Shared Knowledge Map filled known."
      : "Shared Knowledge Map filled unknown.");
  },
  saveSettings: () => saveAllMapDataFiles(),
});

terrainDebugViewModeInput.addEventListener("change", () => {
  const next = terrainDebugViewModeInput.value;
  terrainDebugViewMode = next === "height" || next === "slope" || next === "wetness" || next === "water" ? next : "none";
  terrainDebugViewModeInput.value = terrainDebugViewMode;
  rdOverlayShortcutRailRuntime?.sync();
});

rdOverlayShortcutRailRuntime = createRdOverlayShortcutRailRuntime({
  railEl: rdOverlayRailEl,
  terrainDebugViewModeInput,
  waterFlowDebugToggle,
  waterTrailDebugToggle,
  detailDebugChannelInput,
  slimeShowTerrainUnderlayToggle,
  slimeAvailabilityOverlayEnabledInput,
  resourceDebugShowMaskOverlayInput,
  routeDebugOverlayModeInput,
});

for (const [layer, button] of [
  ["tracks", inspectTracksLayerBtn],
  ["water", inspectWetnessLayerBtn],
  ["plants", inspectPlantsLayerBtn],
  ["height", inspectHeightLayerBtn],
  ["slope", inspectSlopeLayerBtn],
]) {
  button.addEventListener("click", () => {
    const nextLayer = getInspectOverlayLayer() === layer ? "none" : layer;
    setInspectOverlayLayer(nextLayer);
  });
}
inspectRouteLayerBtn.addEventListener("click", () => {
  const visible = routePlanningRuntime?.getSnapshot?.().showCommittedOverlay !== false;
  routePlanningRuntime?.setShowCommittedOverlay?.(!visible, "inspect-route-overlay-toggle");
  setStatus(!visible ? "Route overlay visible in Inspect." : "Route overlay hidden in Inspect.");
  overlayDirtyRuntime.requestOverlayDraw();
  updateInfoPanel?.();
});
setInspectOverlayLayer("none", { reason: "startup-init", revealKnowledge: false });
const inventoryRuntime = createInventoryRuntime({
  playerState,
  entityStore,
  itemRegistry: ITEM_DEFINITIONS,
  startingItems: [
    { itemId: "water_skin", quantity: 10 },
  ],
  setInventorySnapshot: inventoryStoreSyncRuntime.setInventorySnapshot,
  onInventorySnapshot: (snapshot) => {
    conditionRuntime.updateLoadFromCapacity(snapshot.playerCapacity);
    inventoryPanelRuntime?.sync(snapshot);
  },
  applyItemUse: ({ effects }) => {
    conditionRuntime.applyEffects(effects || {});
    return { ok: true };
  },
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
});
let scoutSpeedNormFiltered = Number.NaN;

function findScoutBirdCandidate(centerX, centerY, radiusPx) {
  if (!mainRuntimeStateBinding.isSwarmEnabled() || !swarmState || swarmState.count <= 0) return null;
  const radius = Math.max(0, Number(radiusPx) || 0);
  if (radius <= 0) return null;
  const radiusSq = radius * radius;
  let best = null;
  for (let i = 0; i < swarmState.count; i++) {
    const x = Number(swarmState.x[i]);
    const y = Number(swarmState.y[i]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const dx = x - centerX;
    const dy = y - centerY;
    const distSq = dx * dx + dy * dy;
    if (distSq > radiusSq) continue;
    if (!best || distSq < best.distSq) {
      best = { index: i, x, y, distSq };
    }
  }
  if (!best) return null;
  return {
    index: best.index,
    agentId: swarmState.agentId && Number.isFinite(Number(swarmState.agentId[best.index]))
      ? Math.round(Number(swarmState.agentId[best.index]))
      : 0,
    x: best.x,
    y: best.y,
    distance: Math.sqrt(best.distSq),
  };
}

function findSwarmAgentIndexById(agentId) {
  const id = Math.round(Number(agentId) || 0);
  if (id <= 0 || !swarmState.agentId) return -1;
  for (let i = 0; i < swarmState.count; i++) {
    if (swarmState.agentId[i] === id) return i;
  }
  return -1;
}

function updatePossessedScoutBird(target) {
  const agentId = Math.round(Number(target && target.agentId) || 0);
  const fallbackIndex = Math.round(Number(target && target.index));
  const index = agentId > 0 ? findSwarmAgentIndexById(agentId) : fallbackIndex;
  const revealRadius = Number(target && target.revealRadius);
  if (!mainRuntimeStateBinding.isSwarmEnabled() || !Number.isInteger(index) || index < 0 || index >= swarmState.count) {
    return { valid: false };
  }
  const rawX = Number(swarmState.x[index]);
  const rawY = Number(swarmState.y[index]);
  if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) {
    return { valid: false };
  }
  let effectiveRevealRadius = 0;
  for (const resourceId of getResourceSearchIds()) {
    resourceDiscoveryRuntime?.revealCircle(resourceId, rawX, rawY, revealRadius, 1);
    const resourceRevealRadius = resolveDiscoveryRevealRadius(resourceId, revealRadius);
    resourceStockRuntime?.revealKnown(resourceId, rawX, rawY, resourceRevealRadius);
    effectiveRevealRadius = Math.max(effectiveRevealRadius, resourceRevealRadius);
  }
  const cameraPos = writeInterpolatedSwarmAgentPos(index, {});
  const cameraX = Number.isFinite(Number(cameraPos && cameraPos.x)) ? Number(cameraPos.x) : rawX;
  const cameraY = Number.isFinite(Number(cameraPos && cameraPos.y)) ? Number(cameraPos.y) : rawY;
  const world = mapCoordToWorld(cameraX, cameraY);
  const camera = runtimeCore.store.getState().camera || {};
  const scoutCamera = DISCOVERY_SETTINGS.scout?.camera || {};
  let nextZoom = Number.isFinite(Number(camera.zoom)) ? Number(camera.zoom) : 35;
  if (scoutCamera.speedZoomEnabled !== false) {
    const speed = Math.hypot(Number(swarmState.vx[index]) || 0, Number(swarmState.vy[index]) || 0);
    const speedNormRaw = clamp(speed / Math.max(1, Number(scoutCamera.speedForZoomOut) || 1), 0, 1);
    const speedSmoothing = clamp(Number(scoutCamera.speedSmoothing), 0, 1);
    const zoomSmoothing = clamp(Number(scoutCamera.zoomSmoothing), 0, 1);
    scoutSpeedNormFiltered = Number.isFinite(scoutSpeedNormFiltered)
      ? scoutSpeedNormFiltered + (speedNormRaw - scoutSpeedNormFiltered) * speedSmoothing
      : speedNormRaw;
    const zoomIn = clamp(Number(scoutCamera.zoomIn), getZoomMin(), getZoomMax());
    const zoomOut = clamp(Number(scoutCamera.zoomOut), getZoomMin(), getZoomMax());
    const targetZoom = zoomIn + (zoomOut - zoomIn) * scoutSpeedNormFiltered;
    nextZoom = clamp(nextZoom + (targetZoom - nextZoom) * zoomSmoothing, getZoomMin(), getZoomMax());
  }
  dispatchCoreCommand({
    type: "core/camera/setPose",
    panX: world.x,
    panY: world.y,
    zoom: nextZoom,
    requestOverlay: true,
  });
  return {
    valid: true,
    index,
    agentId: swarmState.agentId && swarmState.agentId[index] ? swarmState.agentId[index] : agentId,
    x: rawX,
    y: rawY,
    effectiveRevealRadius,
  };
}

function restoreCameraAfterScout() {
  scoutSpeedNormFiltered = Number.NaN;
  dispatchCoreCommand({ type: "core/player/show" });
}

function getHuntingSettings() {
  const slimeSettings = getSlimeSettings();
  return {
    ...DEFAULT_HUNTING_SETTINGS,
    trailEffectiveMax: slimeSettings.availabilityEffectiveMax || DEFAULT_HUNTING_SETTINGS.trailEffectiveMax,
    fleeSteps: slimeSettings.huntingFleeSteps,
    fleeWeight: slimeSettings.huntingFleeWeight,
  };
}

function sampleHuntingAvailability(input) {
  const sample = sampleSlimeAvailabilityCircle(slimeAvailabilityGrid, {
    ...input,
    mapWidth: splatSize.width,
    mapHeight: splatSize.height,
    hotSampleRatio: 0.5,
  });
  return {
    ...sample,
    availability: sample.hotAvailability ?? sample.availability,
    rawAverage: sample.hotRawAverage ?? sample.rawAverage,
  };
}

function activateSlimeHuntFleeEffect(steps, weight) {
  const duration = Math.max(0, Math.round(Number(steps) || 0));
  if (duration <= 0 || !conditionEffectRuntime?.addTemporaryEffect) return false;
  const fleeWeight = Math.max(0, Number(weight) || 0);
  return conditionEffectRuntime.addTemporaryEffect({
    id: SLIME_HUNT_FLEE_EFFECT_ID,
    category: "slime_hunt_flee",
    label: "Tracks Scattering",
    description: "Nearby slime agents are fleeing the player after the hunt.",
    severity: "warning",
    icon: "T",
    priority: 10,
    modifiers: {},
    effectsText: [
      `Flee weight ${fleeWeight.toFixed(1)}.`,
    ],
  }, duration);
}

function applyHuntingSuccess(input = {}) {
  const killCount = Math.max(1, Math.round(Number(input.killCount) || DEFAULT_HUNTING_SETTINGS.killCount));
  const runtime = getGameplaySlimeRuntime();
  const huntResult = typeof runtime.huntAgentsAtMapPixel === "function"
    ? runtime.huntAgentsAtMapPixel(
      input.x,
      input.y,
      splatSize.width,
      splatSize.height,
      {
        radius: input.radius,
        maxKills: killCount,
      },
    )
    : { available: 0, killed: 0 };
  const killed = Math.max(0, Math.round(Number(huntResult && huntResult.killed) || 0));
  if (killed <= 0) {
    refreshSlimeAvailabilityGrid(true);
    const message = "Shot missed; no game was inside the track circle.";
    setStatus(message);
    return { killed: 0, available: huntResult.available || 0, message };
  }
  const fleeStarted = typeof runtime.activateFleeAtMapPixel === "function"
    ? runtime.activateFleeAtMapPixel(
      playerState.pixelX,
      playerState.pixelY,
      splatSize.width,
      splatSize.height,
      {
        steps: input.fleeSteps,
        weight: input.fleeWeight,
      },
    )
    : false;
  if (fleeStarted) {
    activateSlimeHuntFleeEffect(input.fleeSteps, input.fleeWeight);
  }
  refreshSlimeAvailabilityGrid(true);
  const result = inventoryRuntime.addToPlayer("raw_meat", killed);
  if (!result.ok) {
    const message = `Hunted ${killed}, but could not carry Raw Meat: ${result.reason}`;
    setStatus(message);
    return { killed, available: huntResult.available || killed, message };
  }
  const message = fleeStarted
    ? `Hunted ${killed}; nearby tracks are scattering.`
    : `Hunted ${killed}.`;
  setStatus(message);
  return { killed, available: huntResult.available || killed, message };
}

playerActivityRuntime = createPlayerActivityRuntime({
  activityDefinitions: ACTIVITY_DEFINITIONS,
  playerState,
  getMapWidth: () => splatSize.width,
  getMapHeight: () => splatSize.height,
  computeMoveStepCost,
  getMoveCostContext,
  sampleHeight: (pixelX, pixelY) => sampleInspectGray(heightImageData, pixelX, pixelY),
  sampleSlope: (pixelX, pixelY) => sampleInspectGray(slopeImageData, pixelX, pixelY),
  getInspectResourceReadings,
  getResourceValue: (resourceId, pixelX, pixelY) => resourceSearchRuntime.sample(resourceId, pixelX, pixelY),
  getResourceSearchChance: (resourceId, pixelX, pixelY) => resourceSearchRuntime.chance(resourceId, pixelX, pixelY),
  getResourceMovementBias: (resourceId, pixelX, pixelY) => resourceSearchRuntime.movementBias(resourceId, pixelX, pixelY),
  getHuntingSettings,
  sampleHuntingAvailability,
  onHuntingSuccess: applyHuntingSuccess,
  getScoutSettings: () => DISCOVERY_SETTINGS.scout,
  resolveDiscoveryRevealRadius,
  findScoutBirdCandidate,
  updatePossessedScoutBird,
  onScoutStopped: restoreCameraAfterScout,
  getMovementSnapshot: () => movementSystem.getSnapshot(),
  replaceMovementQueue: (pathPixels, options = {}) =>
    movementSystem.replaceQueue(pathPixels, runtimeCore.store.getState().systems.time.simTickHours, options),
  cancelMovementQueue: () => movementSystem.cancelQueue(),
  setCycleSpeed: (cycleSpeed) => dispatchCoreCommand({ type: "core/time/setCycleSpeed", cycleSpeed }),
  setActivitySnapshot: activityStoreSyncRuntime.setActivitySnapshot,
  onActivitySnapshot: () => {
    emitActivityChanged({ reason: "activity-snapshot" });
  },
  onResourceSearch: ({ activityType }) => {
    const conditionModifiers = conditionEffectRuntime?.getModifiers() || {};
    activityEffectRuntime.apply(getActivityCostKey(activityType, "work", `${activityType}.search`), {
      activityIntensity: 1,
      load: conditionRuntime.getSnapshot().load || 0,
      conditionModifiers,
    });
  },
  onHuntingSearch: ({ activityType }) => {
    const conditionModifiers = conditionEffectRuntime?.getModifiers() || {};
    activityEffectRuntime.apply(getActivityCostKey(activityType, "work", "hunting.search"), {
      activityIntensity: 1,
      load: conditionRuntime.getSnapshot().load || 0,
      conditionModifiers,
    });
  },
  onUpkeepTick: () => {
    const conditionModifiers = conditionEffectRuntime?.getModifiers() || {};
    activityEffectRuntime.apply(getActivityCostKey("idle", "upkeep", "idle.tick"), {
      activityIntensity: 1,
      conditionModifiers,
    });
  },
  onRestTick: () => {
    const conditionModifiers = conditionEffectRuntime?.getModifiers() || {};
    activityEffectRuntime.apply(getActivityCostKey("rest", "recovery", "rest.tick"), {
      activityIntensity: 1,
      conditionModifiers,
    });
  },
  getConditionSnapshot: () => conditionRuntime.getSnapshot(),
  onResourceFound: ({ resourceId, x, y }) => {
    const reward = resourceSearchRuntime.resolveReward(resourceId, x, y);
    if (!reward) {
      return { ok: false, itemName: resourceId };
    }
    if (reward.type === "fillContainer") {
      const result = inventoryRuntime.fillTaggedPlayerContainer(reward.tag, reward.quantity || 1);
      if (!result.ok) {
        setStatus(`Could not store ${resourceId}: ${result.reason}`);
        return { ok: false, itemName: resourceId, reason: `Could not store ${getResourceDisplayLabel(resourceId).toLowerCase()}: ${result.reason}` };
      }
      resourceStockRuntime?.deplete(resourceId, x, y);
      return {
        ok: true,
        itemName: `${result.filled} ${result.itemName} portion${result.filled === 1 ? "" : "s"}`,
      };
    }
    if (reward.type !== "item" || !reward.itemId) {
      return { ok: false, itemName: resourceId };
    }
    const result = inventoryRuntime.addToPlayer(reward.itemId, reward.quantity || 1);
    const item = ITEM_DEFINITIONS[reward.itemId];
    const itemName = item ? item.name : reward.itemId;
    if (!result.ok) {
      setStatus(`Could not carry ${itemName}: ${result.reason}`);
      return { ok: false, itemName, reason: `Could not carry ${itemName}: ${result.reason}` };
    }
    resourceStockRuntime?.deplete(resourceId, x, y);
    return { ok: true, itemName };
  },
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
  setStatus,
});
inventoryPanelRuntime = createInventoryPanelRuntime({
  document,
  itemRegistry: ITEM_DEFINITIONS,
  panelEl: inventoryPanelEl,
  toggleBtn: null,
  closeBtn: inventoryCloseBtn,
  playerCapacityEl: inventoryPlayerCapacityEl,
  openCapacityEl: inventoryOpenCapacityEl,
  openTitleEl: inventoryOpenTitleEl,
  openHintEl: inventoryOpenHintEl,
  playerListEl: inventoryPlayerListEl,
  openListEl: inventoryOpenListEl,
  selectedNameEl: inventorySelectedNameEl,
  selectedDescriptionEl: inventorySelectedDescriptionEl,
  selectedStatsEl: inventorySelectedStatsEl,
  useBtn: inventoryUseBtn,
  dropBundleBtn: inventoryDropBundleBtn,
  moveToBundleBtn: inventoryMoveToBundleBtn,
  moveToPlayerBtn: inventoryMoveToPlayerBtn,
  getInventorySnapshot: () => inventoryRuntime.getSnapshot(),
  getConditionSnapshot: () => conditionRuntime.getSnapshot(),
  selectInventoryStack: (containerId, slotIndex) => inventoryRuntime.selectStack(containerId, slotIndex),
  useSelectedItem: () => inventoryRuntime.useSelectedItem(),
  dropSelectedBundle: () => inventoryRuntime.dropSelectedBundle(),
  moveSelectedToOpenContainer: () => inventoryRuntime.moveSelectedToOpenContainer(),
  moveSelectedToPlayer: () => inventoryRuntime.moveSelectedToPlayer(),
  requestOpen: () => sideDockRuntime?.openPanel?.("inventory", { reason: "inventory-request-open" })?.ok !== false,
  setStatus,
});
sideDockRuntime.registerPanel({
  id: "inventory",
  priority: 2,
  preferredSide: "left",
  isOpen: () => inventoryPanelRuntime?.isVisible?.() || false,
  open: (reason) => inventoryPanelRuntime?.setVisible?.(true, reason),
  close: () => inventoryPanelRuntime?.setVisible?.(false),
  setSide: (side) => applySideDockClass(inventoryPanelEl, side),
});
localActivityMenuRuntime = createLocalActivityMenuRuntime({
  document,
  rootEl: localActivityMenuEl,
  activityDefinitions: ACTIVITY_DEFINITIONS,
  dispatchCoreCommand,
  getInteractionMode: () => getInteractionModeSnapshot(),
  getActivitySnapshot,
  getMovementSnapshot: () => movementSystem.getSnapshot(),
  rebuildMovementField,
  radius: localActivityMenuRadius,
  setStatus,
});
uiHighlightRuntime.registerTarget("hud.activity.pathfinding", localActivityMenuEl);
uiHighlightRuntime.registerTarget("hud.activity.gathering", localActivityMenuEl);
uiHighlightRuntime.registerTarget("hud.activity.water", localActivityMenuEl);
gameplayHudRuntime = createGameplayHudRuntime({
  document,
  activityDefinitions: ACTIVITY_DEFINITIONS,
  statEls: conditionStatEls,
  conditionThresholds: CONDITION_THRESHOLDS,
  conditionEffectStripEl,
  conditionEffectTooltipEl,
  pathfindingBtn: null,
  routePlanningBtn: hudRoutePlanningBtn,
  gatheringBtn: null,
  gatherWaterBtn: null,
  huntingBtn: null,
  inspectBtn: null,
  scoutBtn: null,
  restBtn: null,
  inventoryBtn: hudInventoryBtn,
  showPlayerBtn: hudShowPlayerBtn,
  dispatchCoreCommand,
  getInteractionMode: () => getInteractionModeSnapshot(),
  isActivityActive: () => playerActivityRuntime.isActivityActive(),
  getActivitySnapshot,
  getInspectSnapshot,
  getTravelPreviewEstimate: () => travelEstimateRuntime.getEstimate(),
  rebuildMovementField,
  getConditionSnapshot: () => conditionRuntime.getSnapshot(),
  getConditionEffectsSnapshot: () => conditionEffectRuntime.getSnapshot(),
  toggleInventory: () => {
    if (inventoryPanelRuntime.isVisible()) {
      return sideDockRuntime?.closePanel?.("inventory", "hud-toggle-inventory");
    }
    return sideDockRuntime?.openPanel?.("inventory", { reason: "hud-toggle-inventory" });
  },
  setStatus,
});
inventoryRuntime.sync();
registerMainSettingsContracts(runtimeCore.settingsRegistry, {
  serializeLighting: serializeLightingSettingsCompat,
  applyLighting: applyLightingSettingsCompat,
  serializeFog: serializeFogSettingsCompat,
  applyFog: applyFogSettingsCompat,
  serializeClouds: serializeCloudSettingsCompat,
  applyClouds: applyCloudSettingsCompat,
  serializeWater: serializeWaterSettingsCompat,
  applyWater: applyWaterSettingsCompat,
  serializeDetail: serializeDetailSettingsCompat,
  applyDetail: applyDetailSettingsCompat,
  serializeCamera: serializeCameraSettingsCompat,
  applyCamera: applyCameraSettingsCompat,
  serializeInteraction: serializeInteractionSettingsCompat,
  applyInteraction: applyInteractionSettingsCompat,
  serializeAudio: serializeAudioSettingsCompat,
  applyAudio: applyAudioSettingsCompat,
  serializeSlime: () => serializeSlimeSettingsCompatImpl(),
  applySlime: (input) => applySlimeSettingsCompatImpl(input),
  serializeSwarm: serializeSwarmDataCompat,
  applySwarm: applySwarmData,
});
const renderPipelineRuntime = createRenderPipelineRuntime(createRenderPipelineAssemblyRuntime({
  gl,
  document,
  canvas,
  program,
  uniforms,
  splatTex,
  normalsTex,
  heightTex,
  slopeTex,
  wetnessTex,
  pointLightTex,
  cloudNoiseTex,
  shadowBlurTex,
  shadowRawTex,
  waterTex,
  flowMapTex,
  waterTrailTex,
  materialSplatTex,
  detailMicroColorTex,
  discoveryMaskTex,
  slimeTrailOverlayTex,
  slimeTracksMaskTex,
  slimeTrailOverlayTextureState,
  discoveryMaskTextureState,
  slimeTracksMaskTextureState,
  detailAtlasState,
  heightSize,
  splatSize,
  getViewHalfExtents: (...args) => getViewHalfExtents(...args),
  cursorLightState,
  applyPointLightUsagePass,
  getDiscoveryVisibilitySettings,
  getDiscoveryVisibilitySnapshot,
  getSlimeTrailOverlaySnapshot,
  getSlimeTerrainUnderlaySnapshot,
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

detailPanelRuntime = createDetailPanelRuntime({
  document,
  serializeDetailSettings,
  defaultDetailSettings: DEFAULT_DETAIL_SETTINGS,
  dispatchCoreCommand,
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: (id) => window.clearTimeout(id),
  requestAnimationFrame: (fn) => window.requestAnimationFrame(fn),
});

registerMainCommands(runtimeCore.commandBus, createMainCommandAssemblyRuntime({
  getZoomMin,
  getZoomMax,
  lastDragClient,
  cycleState,
  cursorLightState,
  travelPlanningRuntime,
  routePlanningRuntime: routePlanningRuntimeProxy,
  getActivitySnapshot,
  playerState,
  swarmFollowState,
  getSwarmFollowSnapshot: swarmFollowRuntimeState.getSwarmFollowSnapshot,
  swarmState,
  swarmFollowTargetInput,
  applyCameraPose: applyRuntimeCameraPose,
  getInteractionMode: () => getInteractionModeSnapshot(),
  getRuntimeMode: () => getRuntimeMode(),
  setMiddleDragging: (value) => {
    isMiddleDragging = value;
  },
  setCycleHourScrubbing: (value) => {
    isCycleHourScrubbing = value;
  },
  clamp,
  clientToNdc: (...args) => clientToNdc(...args),
  worldFromNdc: (...args) => worldFromNdc(...args),
  mapPixelToWorld: (...args) => mapPixelToWorld(...args),
  getCursorLightSnapshot: (...args) => getCursorLightSnapshot(...args),
  applyCursorLightConfigSnapshot: (...args) => applyCursorLightConfigSnapshot(...args),
  clearCursorLightPointerState: (...args) => clearCursorLightPointerState(...args),
  setInteractionMode: (...args) => setInteractionMode(...args),
  triggerEvent: (triggerType, payload) => eventRuntime?.trigger(triggerType, payload),
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
  emitTravelPlanningChanged,
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
  replaceMovementQueue: (pathPixels) => {
    const replaced = movementSystem.replaceQueue(
      pathPixels,
      normalizeSimTickHours(runtimeCore.store.getState().systems.time.simTickHours ?? getConfiguredSimTickHours()),
    );
    if (replaced) {
      setActivityTimeSpeed1x();
    }
    return replaced;
  },
  cancelMovementQueue: () => movementSystem.cancelQueue(),
  getMovementStateSnapshot: () => movementSystem.getSnapshot(),
  startGatheringActivity: () => playerActivityRuntime.startGathering(),
  startGatherWaterActivity: () => playerActivityRuntime.startGatherWater(),
  startHuntingActivity: () => playerActivityRuntime.startHunting(),
  startTravelActivity: () => playerActivityRuntime.startTravel(),
  startInspectActivity: () => toggleInspectRuntime(),
  startScoutActivity: () => {
    stopSwarmFollow({ syncStore: true });
    scoutSpeedNormFiltered = Number.NaN;
    return playerActivityRuntime.startScout();
  },
  possessScoutBird: () => {
    scoutSpeedNormFiltered = Number.NaN;
    return playerActivityRuntime.possessScoutCandidate();
  },
  startRestActivity: () => playerActivityRuntime.startRest(),
  updateInspectActivityAt: (pixelX, pixelY) => {
    return inspectPerceptionRuntime?.updateFromMapPixel(pixelX, pixelY, "command") || false;
  },
  cancelActivity: () => playerActivityRuntime.cancelActivity(),
  isActivityActive: () => playerActivityRuntime.isActivityActive(),
  rebuildMovementField,
  getPathfindingStateSnapshot: (...args) => getPathfindingStateSnapshot(...args),
  syncPathfindingSettingsUi,
  syncPointLightLiveUpdateToggle: (liveUpdate) => interactionUiSyncRuntime.syncPointLightLiveUpdateToggle(liveUpdate),
  syncPointLightsStateToStore: (...args) => mainRuntimeStateBinding.syncPointLightsStateToStore(...args),
  patchSwarmSettingsToStore: (...args) => mainRuntimeStateBinding.patchSwarmSettingsToStore(...args),
  syncCursorLightStateToStore: (...args) => mainRuntimeStateBinding.syncCursorLightStateToStore(...args),
  setModeToStore: (...args) => mainRuntimeStateBinding.setModeToStore(...args),
  setWorkspaceToStore: (...args) => mainRuntimeStateBinding.setWorkspaceToStore(...args),
  syncWorkspaceUi: (workspace) => workspaceRuntime.syncWorkspaceUi(workspace),
  setCameraPoseToStore: (...args) => mainRuntimeStateBinding.setCameraPoseToStore(...args),
  setCycleHourUiToStore: (...args) => mainRuntimeStateBinding.setCycleHourUiToStore(...args),
  patchPathfindingStateToStore: (...args) => mainRuntimeStateBinding.patchPathfindingStateToStore(...args),
  syncPathfindingStateToStore: (...args) => mainRuntimeStateBinding.syncPathfindingStateToStore(...args),
  patchSimulationKnobSectionToStore: (...args) => mainRuntimeStateBinding.patchSimulationKnobSectionToStore(...args),
  setCycleSpeedToStore: (...args) => mainRuntimeStateBinding.setCycleSpeedToStore(...args),
  setSimTickHoursToStore: (...args) => mainRuntimeStateBinding.setSimTickHoursToStore(...args),
  setTimeRoutingModeToStore: (...args) => mainRuntimeStateBinding.setTimeRoutingModeToStore(...args),
  syncRenderFxLightingUi,
  syncRenderFxFogUi,
  markFogColorManual: () => {
    fogColorManual = true;
  },
  syncRenderFxCloudUi,
  syncRenderFxWaterUi,
  syncDetailUi,
  rebuildFlowMapTexture,
  rebuildDetailAtlas,
  schedulePointLightBake,
  serializeLightingSettings,
  serializeFogSettings,
  serializeCloudSettings,
  serializeWaterSettings,
  serializeDetailSettings,
  defaultDetailSettings: DEFAULT_DETAIL_SETTINGS,
  serializeAudioSettingsCompat,
  serializeAudioSettings,
  syncAudioUi,
  syncAudioEngine,
  playAudio,
  loadAudioFile,
  playOriginalAudio,
  playScribbleAudio,
  playSynthesisAudio,
  stopAudio,
  clearAudioScribble,
  autoPaintAudioScribble,
  approximateAudioScribble,
  setAudioMode,
  addSynthesisOscillator,
  removeSynthesisOscillator,
  updateSynthesisSettings,
  updateSynthesisOscillator,
  playSoundscapeAudio,
  addSoundscapeLayer,
  addSoundscapeLayerForRole,
  removeSoundscapeLayer,
  randomizeSoundscape,
  updateSoundscapeSettings,
  updateSoundscapeLayer,
  getAudioSimulationState,
  patchSlimeSettings,
  startSlime: () => startSlimeExperiment(),
  stopSlime: () => stopSlimeExperiment(),
  resetSlime: () => resetSlimeExperiment(),
  syncSlimeUi,
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

pointLightGizmoToggle.addEventListener("change", () => {
  if (!pointLightGizmoToggle.checked) {
    runtimeCore.commandBus.dispatch({ type: "core/interaction/setMode", mode: "none" });
    setStatus("Point-light gizmos hidden.");
    return;
  }
  if (playerActivityRuntime.isActivityActive()) {
    runtimeCore.commandBus.dispatch({ type: "core/interaction/setMode", mode: "none" });
    pointLightGizmoToggle.checked = false;
    setStatus("Stop the current activity before editing point lights.");
    return;
  }
  if (!canUseInteractionInCurrentMode("lighting")) {
    runtimeCore.commandBus.dispatch({ type: "core/interaction/setMode", mode: "none" });
    pointLightGizmoToggle.checked = false;
    setStatus("Point-light gizmos are unavailable in current runtime mode.");
    return;
  }
  runtimeCore.commandBus.dispatch({ type: "core/interaction/setMode", mode: "lighting" });
  travelPlanningRuntime.clearPreview("point-light-gizmos");
  setStatus("Point-light gizmos shown: click terrain to add/select point lights.");
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

setupRuntimeSystems(createRuntimeSystemsAssemblyRuntime({
  scheduler: runtimeCore.scheduler,
  movementSystem,
  activitySystem: playerActivityRuntime,
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
  getZoomMin,
  getZoomMax,
  normalizeRoutingMode,
  getCurrentMapFolderPath,
  splatSize,
  cursorLightState,
  updateStoreFromAppliedSettings: (key, normalized) =>
    settingsApplyRuntime.updateStoreFromAppliedSettings(key, normalized),
  normalizeAppliedSettings: (key, rawData, fallbackDefaults) =>
    settingsApplyRuntime.normalizeAppliedSettings(key, rawData, fallbackDefaults),
  applySwarmSettingsCompat,
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
    requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
    applySwarmSettings,
    applySwarmFollowState,
    syncSwarmRuntimeStateToStore: (...args) => swarmRuntime.syncSwarmRuntimeStateToStore(...args),
    settingsApplyRuntime,
    settingsCompatRuntime,
    syncSwarmStateToStore: (...args) => swarmRuntime.syncSwarmStateToStore(...args),
    defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
    defaultFogSettings: DEFAULT_FOG_SETTINGS,
      defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
    defaultWaterSettings: DEFAULT_WATER_SETTINGS,
    defaultDetailSettings: DEFAULT_DETAIL_SETTINGS,
    defaultCameraSettings: DEFAULT_CAMERA_SETTINGS,
    defaultInteractionSettings: DEFAULT_INTERACTION_SETTINGS,
    defaultSwarmSettings: DEFAULT_SWARM_SETTINGS,
    defaultAudioSettings: DEFAULT_AUDIO_SETTINGS,
    settingsCompat: {
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
      getCloudSettings: () => getSimulationKnobSectionFromStore("clouds") || getSettingsDefaults("clouds", DEFAULT_CLOUD_SETTINGS),
      getWaterSettings: () => getSimulationKnobSectionFromStore("waterFx") || getSettingsDefaults("waterfx", DEFAULT_WATER_SETTINGS),
      getDetailSettings,
      getCameraSettings,
      getCameraState: () => runtimeCore.store.getState().camera || {},
      clampCameraToBounds,
      mapPixelToWorld: (...args) => mapPixelToWorld(...args),
      setCameraPoseToStore: (...args) => mainRuntimeStateBinding.setCameraPoseToStore(...args),
      rebuildDetailAtlas,
      syncDetailUi,
      getTimeState: () => runtimeCore.store.getState().systems.time || {},
      shadowsToggle,
      heightScaleInput,
      shadowStrengthInput,
      shadowBlurInput,
      ambientInput,
      diffuseInput,
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
      cloudToggle,
      cloudCoverageInput,
      cloudSoftnessInput,
      cloudOpacityInput,
      cloudScaleInput,
      cloudSpeed1Input,
      cloudSpeed2Input,
      cloudTimeRoutingInput,
      waterFxToggle,
      waterFlowSourceInput,
      waterFlowRenderModeInput,
      waterFlowChannelPairInput,
      waterFlowFlipXToggle,
      waterFlowFlipYToggle,
      waterFlowUseMagnitudeToggle,
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
      waterFlowMapStrengthInput,
      waterFlowVisibilityInput,
      waterStreamlineDensityInput,
      waterStreamlineSharpnessInput,
      waterFlowSpeedInput,
      waterFlowScaleInput,
      waterShimmerStrengthInput,
      waterGlintStrengthInput,
      waterGlintSharpnessInput,
      waterShoreFoamStrengthInput,
      waterShoreWidthInput,
      waterReflectivityInput,
      waterBaseColorInput,
      waterOpacityInput,
      waterTintColorInput,
      waterTintStrengthInput,
      waterTimeRoutingInput,
      clamp,
      clampRound,
      normalizeSimTickHours,
      normalizeRoutingMode,
      rgbToHex,
      updateShadowBlurLabel,
      updateLightingBalanceLabels,
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
      updateCloudLabels,
      updateCloudUi,
      updateWaterLabels,
      updateWaterUi,
      rebuildFlowMapTexture,
      getConfiguredSimTickHours,
      serializeAudioSettingsCompat: () => serializeAudioSettingsCompatImpl(),
      applyAudioSettingsCompat: (rawData) => applyAudioSettingsCompatImpl(rawData),
    },
    swarmCursorState,
    swarmZNeighborScale: SWARM_Z_NEIGHBOR_SCALE,
    swarmRenderState,
    isSwarmEnabled,
    swarmFollowHawkScratch,
    swarmFollowAgentScratch,
    mapCoordToWorld: (...args) => mapCoordToWorld(...args),
    getZoomMin,
    getZoomMax,
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
      getTravelPreviewEstimate: () => travelEstimateRuntime.getEstimate(),
      getRoutePlanningSnapshot: () => routePlanningRuntime?.getSnapshot?.() || null,
      getInteractionMode: () => getInteractionModeSnapshot(),
      getMovementSnapshot: () => movementSystem.getSnapshot(),
      getActivitySnapshot,
      getInspectSnapshot,
      getMovementDurationHours,
      getConfiguredSimTickHours: getConfiguredSimTickHoursFromStoreOrDefaults,
      getFrameDebugInfo,
      getDetailDebugInfo,
      frameInfoEl,
      frameProfileInfoEl,
      gpuProfileInfoEl,
      performanceOverlayPanelEl,
      performanceOverlayGraphEl,
      performanceOverlayTextEl,
      isPerformanceOverlayEnabled: () => performanceOverlayEnabled,
      detailInfoEl,
      playerInfoEl,
    pathInfoEl,
      movementStatusPanelEl,
      movementStatusTitleEl,
      movementStatusEtaEl,
      movementStatusDetailEl,
      huntingAvailabilityRowEl,
      huntingAvailabilityLabelEl,
      huntingAvailabilityBarFillEl,
      routePlanningControlsEl,
      routeSectionTimeValue,
      routeTotalTimeValue,
      routeDeleteAllBtn,
      movementActionBtn,
      inspectStatusPanelEl,
      inspectStatusTitleEl,
      inspectStatusEtaEl,
      inspectStatusDetailEl,
      inspectResourceRowEl,
      inspectResourceLabelEl,
      inspectResourceBarFillEl,
      inspectLayerControlsEl,
      inspectRouteLayerBtn,
    applyInteractionMode,
    canUseInteractionInCurrentMode,
    syncInteractionModeUi: interactionModeUiRuntime.syncInteractionModeUi,
    travelPlanningRuntime,
    routePlanningRuntime: routePlanningRuntimeProxy,
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
settingsCompatBindings = swarmIntegrationSetupRuntime.settingsCompatBindings;
settingsRuntimeBinding = swarmIntegrationSetupRuntime.settingsRuntimeBinding;
detailPanelRuntime.bindDetailControls();
const swarmRenderSetupRuntime = swarmIntegrationSetupRuntime.swarmRenderSetupRuntime;
const swarmLoopRuntime = swarmRenderSetupRuntime.swarmLoopRuntime;
const writeInterpolatedSwarmAgentPos = swarmLoopRuntime.writeInterpolatedSwarmAgentPos;
const writeInterpolatedSwarmHawkPos = swarmLoopRuntime.writeInterpolatedSwarmHawkPos;
const updateSwarm = swarmLoopRuntime.updateSwarm;
const updateSwarmFollowCamera = swarmLoopRuntime.updateSwarmFollowCamera;
function updateSwarmFollowAndScoutCamera(nowMs) {
  updateSwarmFollowCamera();
  playerActivityRuntime?.updateScout(nowMs);
}

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
  clientToMapPixel,
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

routePlanningRuntime = createRoutePlanningRuntime({
  playerState,
  getMapSize: () => splatSize,
  getSlopeImageData: () => slopeImageData,
  getHeightImageData: () => heightImageData,
  getWaterImageData: () => waterImageData,
  getPathfindingStateSnapshot,
  getNavigationKnowledgeSnapshots: () => [resourceDiscoveryRuntime?.getSnapshot?.(WORLD_KNOWLEDGE_MAP_ID)].filter(Boolean),
  clientToNdc,
  worldFromNdc,
  worldToUv,
  uvToMapPixelIndex,
  onChange: () => {
    overlayDirtyRuntime.requestOverlayDraw();
    updateInfoPanel?.();
    updateRouteWaypointMenu();
  },
});

let routeWaypointMenuFollowRaf = 0;

function scheduleRouteWaypointMenuFollow() {
  if (routeWaypointMenuFollowRaf) return;
  routeWaypointMenuFollowRaf = window.requestAnimationFrame(() => {
    routeWaypointMenuFollowRaf = 0;
    updateRouteWaypointMenu();
  });
}

function updateRouteWaypointMenu() {
  const snapshot = routePlanningRuntime?.getSnapshot?.();
  const waypoint = snapshot && snapshot.active && snapshot.waypointPlacementActive === false
    ? snapshot.selectedWaypoint
    : null;
  if (!waypoint || !routeWaypointMenuEl) {
    routeWaypointMenuEl?.classList.add("hidden");
    return;
  }
  const screen = worldToScreen(mapPixelToWorld(waypoint.x, waypoint.y));
  if (!Number.isFinite(screen.x) || !Number.isFinite(screen.y)) {
    routeWaypointMenuEl.classList.add("hidden");
    return;
  }
  const rect = overlayCanvas.getBoundingClientRect();
  const cssX = rect.left + (screen.x / Math.max(1, overlayCanvas.width)) * rect.width;
  const cssY = rect.top + (screen.y / Math.max(1, overlayCanvas.height)) * rect.height;
  routeWaypointDeleteBtn.disabled = snapshot.canDeleteSelectedWaypoint !== true;
  routeWaypointMenuEl.style.left = `${Math.round(cssX)}px`;
  routeWaypointMenuEl.style.top = `${Math.round(cssY)}px`;
  routeWaypointMenuEl.classList.remove("hidden");
  scheduleRouteWaypointMenuFollow();
}

routeWaypointExtendBtn.addEventListener("click", () => {
  const snapshot = routePlanningRuntime?.getSnapshot?.();
  const waypoint = snapshot && snapshot.selectedWaypoint;
  if (!waypoint) {
    setStatus("Select a route waypoint first.");
    return;
  }
  routePlanningRuntime?.setAnchorAtPixel?.(waypoint, "route-waypoint-menu-extend");
  setStatus("Route extension started.");
  overlayDirtyRuntime.requestOverlayDraw();
  updateRouteWaypointMenu();
});

routeWaypointDeleteBtn.addEventListener("click", () => {
  const deleted = routePlanningRuntime?.deleteSelectedWaypoint?.("route-waypoint-menu-delete");
  setStatus(deleted ? "Selected waypoint deleted." : "Select a leaf waypoint to delete.");
  overlayDirtyRuntime.requestOverlayDraw();
  updateRouteWaypointMenu();
});

routeDeleteAllBtn.addEventListener("click", () => {
  routePlanningRuntime?.clearCommitted?.("route-panel-delete-all");
  setStatus("All route segments deleted.");
  overlayDirtyRuntime.requestOverlayDraw();
  updateRouteWaypointMenu();
});

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
  travelPlanningRuntime,
  getInteractionModeSnapshot,
  requestOverlayDraw: () => overlayDirtyRuntime.requestOverlayDraw(),
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
  serializeCloudSettings,
  serializeWaterSettings,
  shadowBlurValue,
  ambientValue,
  diffuseValue,
  simTickHoursValue,
  fogMinAlphaValue,
  fogMaxAlphaValue,
  fogFalloffValue,
  fogStartOffsetValue,
  pointFlickerStrengthValue,
  pointFlickerSpeedValue,
  pointFlickerSpatialValue,
  cloudCoverageValue,
  cloudSoftnessValue,
  cloudOpacityValue,
  cloudScaleValue,
  cloudSpeed1Value,
  cloudSpeed2Value,
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
      waterFlowMapStrengthValue,
      waterFlowVisibilityValue,
      waterStreamlineDensityValue,
      waterStreamlineSharpnessValue,
  waterFlowSpeedValue,
  waterFlowScaleValue,
  waterShimmerStrengthValue,
  waterGlintStrengthValue,
  waterGlintSharpnessValue,
  waterShoreFoamStrengthValue,
  waterShoreWidthValue,
  waterReflectivityValue,
      waterOpacityValue,
  waterTintStrengthValue,
  pointFlickerStrengthInput,
  pointFlickerSpeedInput,
  pointFlickerSpatialInput,
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
  waterFlowSourceInput,
      waterFlowRenderModeInput,
      waterFlowChannelPairInput,
      waterFlowFlipXToggle,
      waterFlowFlipYToggle,
      waterFlowUseMagnitudeToggle,
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
      waterFlowMapStrengthInput,
      waterFlowVisibilityInput,
      waterStreamlineDensityInput,
      waterStreamlineSharpnessInput,
  waterFlowSpeedInput,
  waterFlowScaleInput,
  waterShimmerStrengthInput,
  waterGlintStrengthInput,
  waterGlintSharpnessInput,
  waterShoreFoamStrengthInput,
  waterShoreWidthInput,
  waterReflectivityInput,
      waterBaseColorInput,
      waterOpacityInput,
  waterTintColorInput,
  waterTintStrengthInput,
  updateShadowBlurLabel,
  updateLightingBalanceLabels,
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
  getPathfindingStateSnapshot,
  getLightEditDraft,
  getPointLights: () => pointLights,
  isPointLightSelected,
  mapPixelToWorld,
  worldToScreen,
  clamp,
  getCursorLightSnapshot,
  cursorLightState,
  getTravelPlanningSnapshot: () => travelPlanningRuntime.getSnapshot(),
  getRoutePlanningSnapshot: () => routePlanningRuntime?.getSnapshot?.() || null,
  getActivitySnapshot,
  getInspectSnapshot,
  getResourceContourOverlaySnapshot,
  getDiscoveryMaskOverlaySnapshot,
  getDiscoveryTerrainVisibilityOverlaySnapshot,
  getInventoryBundles: () => inventoryRuntime.listBundles(),
  playerState,
  drawSwarmUnlitOverlay,
  drawSwarmGizmos,
  updateSwarm,
  updateSwarmFollowCamera: updateSwarmFollowAndScoutCamera,
  computeFrameTiming,
  runtimeFrame: runtimeCore.frame,
  getCoreState: () => runtimeCore.store.getState(),
  buildFrameTimeState,
  getConfiguredSimTickHoursFromStoreOrDefaults,
  getCurrentTimeRoutingFromStoreOrDefaults,
  getRoutedSystemTime,
  getInterpolatedRoutedTimeSec,
  schedulerUpdateAll: (ctx, state) => {
    updateSlimeForGameTicks(ctx);
    runtimeCore.scheduler.updateAll(ctx, state);
    resourceStockRuntime?.update(ctx, state);
    resourceDiscoveryRuntime?.update(ctx, state);
    refreshPlayerLocalResourceKnowledgeForTicks(ctx);
  },
  computeLightingParams,
  getFrameUiRuntime,
  buildUniformInputState,
  getSettingsDefaults,
  defaultLightingSettings: DEFAULT_LIGHTING_SETTINGS,
  defaultFogSettings: DEFAULT_FOG_SETTINGS,
  defaultCloudSettings: DEFAULT_CLOUD_SETTINGS,
  defaultWaterSettings: DEFAULT_WATER_SETTINGS,
  defaultDetailSettings: DEFAULT_DETAIL_SETTINGS,
  hexToRgb01,
  updateInfoPanel,
  updateSwarmStatsPanel,
  updateCycleHourLabel,
  updateGameTimeDiorama: (hour, cycleSpeed) => gameTimeDioramaRuntime.update(hour, cycleSpeed),
  updateWaterParticleTrails: (dtSec) => waterParticleTrailRuntime.update(dtSec),
  getWaterParticleTrailUniformState: () => waterParticleTrailRuntime.getUniformState(),
  getTerrainDebugViewMode: () => terrainDebugViewMode,
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
workspaceRuntime.syncWorkspaceUi(runtimeCore.store.getState().ui.workspace);
syncAudioUi();
syncSlimeUi();
spectrogramRuntime.clear();

runAppShellLifecycleRuntime(createAppShellLifecycleAssemblyRuntime({
  windowEl: window,
  bodyEl,
  titleScreenEl,
  titleNewGameBtn,
  titleQuitGameBtn,
  dockExitToTitleBtn,
  initialMode: normalizeRuntimeMode(runtimeCore.store.getState().mode),
  isTauriRuntime: Boolean(tauriInvoke),
  invokeTauri,
  dispatchCoreCommand,
  bindings: createMainBindingsLifecycleAssemblyRuntime({
    canvas,
    windowEl: window,
    workspaceButtons,
    dispatchCoreCommand,
    updateSwarmCursorFromPointer,
    updateCursorLightFromPointer,
    updatePathPreviewFromPointer,
    updateRoutePreviewFromPointer,
    updateInspectFromPointer,
    openLocalActivityMenu: (input) => localActivityMenuRuntime?.openAt(input),
    canHandleTerrainClicks: () => getRuntimeMode() === "gameplay" && titleScreenEl.classList.contains("hidden"),
    isMiddleDragging: () => isMiddleDragging,
    isCursorLightEnabled: () => getCursorLightSnapshot().enabled,
    getInteractionMode: () => getInteractionModeSnapshot(),
    requestOverlayDraw,
    clientToNdc,
    worldFromNdc,
    worldToUv,
    clientToMapPixel,
    uvToMapPixelIndex,
    swarmCursorState,
    cursorLightState,
    travelPlanningRuntime,
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
    swarmFollowZoomInValue,
    swarmFollowZoomOutInput,
    swarmFollowZoomOutValue,
    swarmFollowHawkRangeGizmoToggle,
    swarmFollowAgentSpeedSmoothingInput,
    swarmFollowAgentSpeedSmoothingValue,
    swarmFollowAgentZoomSmoothingInput,
    swarmFollowAgentZoomSmoothingValue,
    swarmStatsPanelToggle,
    swarmBackgroundColorInput,
    swarmAgentCountInput,
    swarmAgentCountValue,
    swarmUpdateIntervalInput,
    swarmUpdateIntervalValue,
    swarmMaxSpeedInput,
    swarmMaxSpeedValue,
    swarmSteeringMaxInput,
    swarmSteeringMaxValue,
    swarmVariationStrengthInput,
    swarmVariationStrengthValue,
    swarmNeighborRadiusInput,
    swarmNeighborRadiusValue,
    swarmMinHeightInput,
    swarmMinHeightValue,
    swarmMaxHeightInput,
    swarmMaxHeightValue,
    swarmSeparationRadiusInput,
    swarmSeparationRadiusValue,
    swarmAlignmentWeightInput,
    swarmAlignmentWeightValue,
    swarmCohesionWeightInput,
    swarmCohesionWeightValue,
    swarmSeparationWeightInput,
    swarmSeparationWeightValue,
    swarmWanderWeightInput,
    swarmWanderWeightValue,
    swarmRestChanceInput,
    swarmRestChanceValue,
    swarmRestTicksInput,
    swarmRestTicksValue,
    swarmBreedingThresholdInput,
    swarmBreedingThresholdValue,
    swarmBreedingSpawnChanceInput,
    swarmBreedingSpawnChanceValue,
    swarmCursorModeInput,
    swarmCursorStrengthInput,
    swarmCursorStrengthValue,
    swarmCursorRadiusInput,
    swarmCursorRadiusValue,
    swarmHawkEnabledToggle,
    swarmHawkCountInput,
    swarmHawkCountValue,
    swarmHawkColorInput,
    swarmHawkSpeedInput,
    swarmHawkSpeedValue,
    swarmHawkSteeringInput,
    swarmHawkSteeringValue,
    swarmHawkTargetRangeInput,
    swarmHawkTargetRangeValue,
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
    movementActionBtn,
    cycleSpeedInput,
    cycleHourInput,
    simTickHoursInput,
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
        shadowsToggle,
    heightScaleInput,
    shadowStrengthInput,
    shadowBlurInput,
    ambientInput,
    diffuseInput,
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
      waterFlowMapStrengthInput,
      waterFlowVisibilityInput,
      waterStreamlineDensityInput,
      waterStreamlineSharpnessInput,
    waterFlowSpeedInput,
    waterFlowScaleInput,
    waterShimmerStrengthInput,
    waterGlintStrengthInput,
    waterGlintSharpnessInput,
    waterShoreFoamStrengthInput,
    waterShoreWidthInput,
    waterReflectivityInput,
      waterBaseColorInput,
      waterOpacityInput,
    waterTintColorInput,
    waterTintStrengthInput,
    waterFxToggle,
    waterFlowSourceInput,
      waterFlowRenderModeInput,
      waterFlowChannelPairInput,
      waterFlowFlipXToggle,
      waterFlowFlipYToggle,
      waterFlowUseMagnitudeToggle,
    waterFlowInvertDownhillToggle,
    waterFlowDebugToggle,
    waterTimeRoutingInput,
          updateShadowBlurLabel,
    updateLightingBalanceLabels,
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
    commandBus: runtimeCore.commandBus,
    audioModeButtons,
    audioMinHzInput,
    audioMaxHzInput,
    audioBrushSizeInput,
    audioBrushStrengthInput,
    audioEraseModeToggle,
    audioAutoThresholdInput,
    audioAutoContrastInput,
    audioAutoGainInput,
    audioAutoClearToggle,
    audioApproxMaxStrokesInput,
    audioApproxMinStrengthInput,
    audioMasterGainInput,
    audioPlaybackRateInput,
    audioFileInput,
    audioPlayBtn,
    audioPlayOriginalBtn,
    audioPlayScribbleBtn,
    audioAutoPaintBtn,
    audioApproximateBtn,
    audioStopBtn,
    audioClearBtn,
    audioSynthesisPlayBtn,
    audioSynthesisAddOscillatorBtn,
    audioSynthesisStopBtn,
    audioSynthesisDurationInput,
    audioSynthesisMasterGainInput,
    audioSynthesisLoopToggle,
    audioSynthesisOscillatorList,
    audioSoundscapeRootInput,
    audioSoundscapeScaleInput,
    audioSoundscapePlayBtn,
    audioSoundscapeRandomizeBtn,
    audioSoundscapeAddDroneBtn,
    audioSoundscapeAddResonanceBtn,
    audioSoundscapeAddShimmerBtn,
    audioSoundscapeAddCallBtn,
    audioSoundscapeAddWindBtn,
    audioSoundscapeAddRumbleBtn,
    audioSoundscapeAddAirBtn,
    audioSoundscapeStopBtn,
    audioSoundscapeDurationInput,
    audioSoundscapeMasterGainInput,
    audioSoundscapeLoopToggle,
    audioSoundscapeSeedInput,
    audioSoundscapeLayerList,
    slimeStartBtn,
    slimeStopBtn,
    slimeResetBtn,
    slimeRandomizeBtn,
    slimeAgentCountInput,
    slimeAgentCountValue,
    slimeSimSizeInput,
    slimeStepsPerFrameInput,
    slimeTimeModeInput,
    slimeStepsPerGameTickInput,
    slimeWarmupEnabledInput,
    slimeWarmupStepsInput,
    slimeWarmupStepsValue,
    slimeGameSpeedBtns,
    slimeAvailabilityGridSizeInput,
    slimeAvailabilityEffectiveMaxInput,
    slimeAvailabilityUpdateTickIntervalInput,
    slimePlantStockSyncTickIntervalInput,
    slimeSensorDistanceInput,
    slimeSensorAngleInput,
    slimeSensorSizeInput,
    slimeSensorNoiseInput,
    slimeStepSizeInput,
    slimeTurnAngleInput,
    slimeWanderChanceInput,
    slimeWanderStrengthInput,
    slimeDepositAmountInput,
    slimeDepositSizeInput,
    slimeDiffusionInput,
    slimeDecayInput,
    slimeTrailGainInput,
    slimeTrailGammaInput,
    slimePaletteInput,
    slimeWrapEdgesToggle,
    slimeSpawnModeInput,
    slimeUseTerrainToggle,
    slimeShowTerrainUnderlayToggle,
    slimeTerrainMixInput,
    slimeSlopeBiasInput,
    slimeSlopeCutoffInput,
    slimeHeightBiasInput,
    slimeHeightMinInput,
    slimeHeightMaxInput,
    slimeHeightBandWeightInput,
    slimeWaterBiasInput,
    slimePlantBiasInput,
    slimePlantFloorInput,
    slimePlantEatAmountInput,
    slimePlantEatTickIntervalInput,
    slimePlantRegenAmountInput,
    slimePlantRegenTickIntervalInput,
    slimeBrushRadiusInput,
    slimeBrushTrailClearInput,
    slimeSeedInput,
  }),
  tryAutoLoadDefaultMap,
  startNewGame: async () => {
    if (!mapLifecycleRuntime.hasLoadedMap()) {
      await mapLifecycleRuntime.loadMapFromPath(mapLifecycleRuntime.getCurrentMapFolderPath());
    }
    eventRuntime.trigger("gameplay_started");
  },
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
  updateShadowBlurLabel,
  updateLightingBalanceLabels,
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
