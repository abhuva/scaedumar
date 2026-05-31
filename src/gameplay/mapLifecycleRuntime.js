import { createMapRuntimeState } from "./mapRuntimeState.js";
import { createMapLoadingRuntime } from "./mapLoadingRuntime.js";
import { createMapDataSaveRuntime } from "./mapDataSaveRuntime.js";
import { createMapBootstrap } from "./mapBootstrap.js";

export function createMapLifecycleRuntime(deps) {
  let currentMapFolderPath = deps.defaultMapFolder;
  let mapRuntimeState = null;
  let hasLoadedMap = false;

  function getCurrentMapFolderPath() {
    return currentMapFolderPath;
  }

  function getMapRuntimeState() {
    if (mapRuntimeState) return mapRuntimeState;
    mapRuntimeState = createMapRuntimeState({
      normalizeMapFolderPath: deps.normalizeMapFolderPath,
      setCurrentMapFolderPathValue: (value) => {
        currentMapFolderPath = value;
      },
      getCurrentMapFolderPath,
      syncMapPathInput: deps.syncMapPathInput,
      syncMapStateToStore: deps.syncMapStateToStore,
      getSettingsDefaults: deps.getSettingsDefaults,
      defaultLightingSettings: deps.defaultLightingSettings,
      defaultInteractionSettings: deps.defaultInteractionSettings,
      defaultFogSettings: deps.defaultFogSettings,
      defaultCloudSettings: deps.defaultCloudSettings,
      defaultWaterSettings: deps.defaultWaterSettings,
      defaultWaterTrailSettings: deps.defaultWaterTrailSettings,
      defaultSlimeSettings: deps.defaultSlimeSettings,
      defaultDetailSettings: deps.defaultDetailSettings,
      defaultCameraSettings: deps.defaultCameraSettings,
      defaultAudioSettings: deps.defaultAudioSettings,
      defaultSwarmSettings: deps.defaultSwarmSettings,
      applyLightingSettings: deps.applyLightingSettings,
      applyInteractionSettings: deps.applyInteractionSettings,
      applyFogSettings: deps.applyFogSettings,
      applyCloudSettings: deps.applyCloudSettings,
      applyWaterSettings: deps.applyWaterSettings,
      applyWaterTrailSettings: deps.applyWaterTrailSettings,
      applySlimeSettings: deps.applySlimeSettings,
      applyDetailSettings: deps.applyDetailSettings,
      applyCameraSettings: deps.applyCameraSettings,
      applyAudioSettings: deps.applyAudioSettings,
      applySwarmSettings: deps.applySwarmSettings,
      clearPointLights: deps.clearPointLights,
      bakePointLightsTexture: deps.bakePointLightsTexture,
      updateLightEditorUi: deps.updateLightEditorUi,
      reseedSwarmAgents: deps.reseedSwarmAgents,
      getSwarmSettings: deps.getSwarmSettings,
      requestOverlayDraw: deps.requestOverlayDraw,
    });
    return mapRuntimeState;
  }

  const mapLoadingRuntime = createMapLoadingRuntime({
    tryLoadJsonFromUrl: deps.tryLoadJsonFromUrl,
    applyLoadedPointLights: deps.applyLoadedPointLights,
    applyLightingSettings: deps.applyLightingSettings,
    applyInteractionSettings: deps.applyInteractionSettings,
    applyFogSettings: deps.applyFogSettings,
    applyCloudSettings: deps.applyCloudSettings,
    applyWaterSettings: deps.applyWaterSettings,
    applyWaterTrailSettings: deps.applyWaterTrailSettings,
    applySlimeSettings: deps.applySlimeSettings,
    applyDetailSettings: deps.applyDetailSettings,
    applyCameraSettings: deps.applyCameraSettings,
    applyAudioSettings: deps.applyAudioSettings,
    applyResourceDebugSettings: deps.applyResourceDebugSettings,
    applyResourceStockSettings: deps.applyResourceStockSettings,
    applySwarmData: deps.applySwarmData,
    applyStructureData: deps.applyStructureData,
    applyLoadedNpc: deps.applyLoadedNpc,
    getFileFromFolderSelection: deps.getFileFromFolderSelection,
    getSettingsDefaults: deps.getSettingsDefaults,
    defaultPlayer: deps.defaultPlayer,
    defaultWaterTrailSettings: deps.defaultWaterTrailSettings,
    normalizeMapFolderPath: deps.normalizeMapFolderPath,
    tauriInvoke: deps.tauriInvoke,
    isAbsoluteFsPath: deps.isAbsoluteFsPath,
    validateMapFolderViaTauri: deps.validateMapFolderViaTauri,
    joinFsPath: deps.joinFsPath,
    buildMapAssetPath: deps.buildMapAssetPath,
    loadImageFromUrl: deps.loadImageFromUrl,
    loadImageFromFile: deps.loadImageFromFile,
    applyMapImages: deps.applyMapImages,
    setCurrentMapFolderPath: (nextPath) => getMapRuntimeState().setCurrentMapFolderPath(nextPath),
    resetMapRuntimeStateAfterImages: () => getMapRuntimeState().resetMapRuntimeStateAfterImages(),
    rebuildMovementField: deps.rebuildMovementField,
    setStatus: deps.setStatus,
    getRequiredGameplayMapFiles: deps.getRequiredGameplayMapFiles,
    onMapLoaded: deps.onMapLoaded,
  });

  async function loadMapFromPath(mapFolderPath) {
    await mapLoadingRuntime.loadMapFromPath(mapFolderPath);
    hasLoadedMap = true;
  }

  async function loadMapFromFolderSelection(fileList) {
    await mapLoadingRuntime.loadMapFromFolderSelection(fileList);
    hasLoadedMap = true;
  }

  const mapDataSaveRuntime = createMapDataSaveRuntime({
    serializePointLights: deps.serializePointLights,
    serializeLightingSettings: deps.serializeLightingSettings,
    serializeInteractionSettings: deps.serializeInteractionSettings,
    serializeFogSettings: deps.serializeFogSettings,
    serializeCloudSettings: deps.serializeCloudSettings,
    serializeWaterSettings: deps.serializeWaterSettings,
    serializeWaterTrailSettings: deps.serializeWaterTrailSettings,
    serializeSlimeSettings: deps.serializeSlimeSettings,
    serializeDetailSettings: deps.serializeDetailSettings,
    serializeCameraSettings: deps.serializeCameraSettings,
    serializeAudioSettings: deps.serializeAudioSettings,
    serializeResourceDebugSettings: deps.serializeResourceDebugSettings,
    serializeResourceStockSettings: deps.serializeResourceStockSettings,
    serializeSwarmData: deps.serializeSwarmData,
    serializeStructureData: deps.serializeStructureData,
    serializeNpcState: deps.serializeNpcState,
    normalizeMapFolderPath: deps.normalizeMapFolderPath,
    getCurrentMapFolderPath,
    confirm: deps.confirm,
    setStatus: deps.setStatus,
    tauriInvoke: deps.tauriInvoke,
    isAbsoluteFsPath: deps.isAbsoluteFsPath,
    pickMapFolderViaTauri: deps.pickMapFolderViaTauri,
    joinFsPath: deps.joinFsPath,
    invokeTauri: deps.invokeTauri,
    showDirectoryPicker: deps.showDirectoryPicker,
  });

  const mapBootstrap = createMapBootstrap({
    defaultMapFolderCandidates: deps.defaultMapFolderCandidates,
    loadMapFromPath,
    setStatus: deps.setStatus,
  });

  return {
    getCurrentMapFolderPath,
    setCurrentMapFolderPath: (nextPath) => getMapRuntimeState().setCurrentMapFolderPath(nextPath),
    applyDefaultMapSettings: () => getMapRuntimeState().applyDefaultMapSettings(),
    resetMapRuntimeStateAfterImages: () => getMapRuntimeState().resetMapRuntimeStateAfterImages(),
    applyMapSizeChangeIfNeeded: (changed) => getMapRuntimeState().applyMapSizeChangeIfNeeded(changed),
    createMapDataFileTexts: () => mapDataSaveRuntime.createMapDataFileTexts(),
    downloadTextFile: (fileName, text) => mapDataSaveRuntime.downloadTextFile(fileName, text),
    saveAllMapDataFiles: () => mapDataSaveRuntime.saveAllMapDataFiles(),
    saveMapDataFile: (fileName) => mapDataSaveRuntime.saveMapDataFile(fileName),
    hasLoadedMap: () => hasLoadedMap,
    loadMapFromPath,
    loadMapFromFolderSelection,
    tryAutoLoadDefaultMap: () => mapBootstrap.tryAutoLoadDefaultMap(),
  };
}
