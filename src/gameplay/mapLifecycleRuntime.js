import { createMapRuntimeState } from "./mapRuntimeState.js";
import { createMapLoadingRuntime } from "./mapLoadingRuntime.js";
import { createMapDataSaveRuntime } from "./mapDataSaveRuntime.js";
import { createMapBootstrap } from "./mapBootstrap.js";

export function createMapLifecycleRuntime(deps) {
  let currentMapFolderPath = deps.defaultMapFolder;
  let mapRuntimeState = null;

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
      defaultParallaxSettings: deps.defaultParallaxSettings,
      defaultInteractionSettings: deps.defaultInteractionSettings,
      defaultFogSettings: deps.defaultFogSettings,
      defaultCloudSettings: deps.defaultCloudSettings,
      defaultWaterSettings: deps.defaultWaterSettings,
      defaultSwarmSettings: deps.defaultSwarmSettings,
      applyLightingSettings: deps.applyLightingSettings,
      applyParallaxSettings: deps.applyParallaxSettings,
      applyInteractionSettings: deps.applyInteractionSettings,
      applyFogSettings: deps.applyFogSettings,
      applyCloudSettings: deps.applyCloudSettings,
      applyWaterSettings: deps.applyWaterSettings,
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
    applyParallaxSettings: deps.applyParallaxSettings,
    applyInteractionSettings: deps.applyInteractionSettings,
    applyFogSettings: deps.applyFogSettings,
    applyCloudSettings: deps.applyCloudSettings,
    applyWaterSettings: deps.applyWaterSettings,
    applySwarmData: deps.applySwarmData,
    applyLoadedNpc: deps.applyLoadedNpc,
    getFileFromFolderSelection: deps.getFileFromFolderSelection,
    defaultPlayer: deps.defaultPlayer,
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
  });

  const mapDataSaveRuntime = createMapDataSaveRuntime({
    serializePointLights: deps.serializePointLights,
    serializeLightingSettings: deps.serializeLightingSettings,
    serializeParallaxSettings: deps.serializeParallaxSettings,
    serializeInteractionSettings: deps.serializeInteractionSettings,
    serializeFogSettings: deps.serializeFogSettings,
    serializeCloudSettings: deps.serializeCloudSettings,
    serializeWaterSettings: deps.serializeWaterSettings,
    serializeSwarmData: deps.serializeSwarmData,
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
    loadMapFromPath: (mapFolderPath) => mapLoadingRuntime.loadMapFromPath(mapFolderPath),
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
    loadMapFromPath: (mapFolderPath) => mapLoadingRuntime.loadMapFromPath(mapFolderPath),
    loadMapFromFolderSelection: (fileList) => mapLoadingRuntime.loadMapFromFolderSelection(fileList),
    tryAutoLoadDefaultMap: () => mapBootstrap.tryAutoLoadDefaultMap(),
  };
}
