import { createMapSidecarLoader } from "./mapSidecarLoader.js";
import { createMapLoader } from "./mapLoader.js";

export function createMapLoadingRuntime(deps) {
  const mapSidecarLoader = createMapSidecarLoader({
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
    applyLoadedNpc: deps.applyLoadedNpc,
    getFileFromFolderSelection: deps.getFileFromFolderSelection,
    getSettingsDefaults: deps.getSettingsDefaults,
    defaultPlayer: deps.defaultPlayer,
    defaultWaterTrailSettings: deps.defaultWaterTrailSettings,
    defaultSlimeSettings: deps.defaultSlimeSettings,
    setStatus: deps.setStatus,
  });
  const mapLoader = createMapLoader({
    normalizeMapFolderPath: deps.normalizeMapFolderPath,
    tauriInvoke: deps.tauriInvoke,
    isAbsoluteFsPath: deps.isAbsoluteFsPath,
    validateMapFolderViaTauri: deps.validateMapFolderViaTauri,
    joinFsPath: deps.joinFsPath,
    buildMapAssetPath: deps.buildMapAssetPath,
    loadImageFromUrl: deps.loadImageFromUrl,
    loadImageFromFile: deps.loadImageFromFile,
    applyMapImages: deps.applyMapImages,
    setCurrentMapFolderPath: deps.setCurrentMapFolderPath,
    resetMapRuntimeStateAfterImages: deps.resetMapRuntimeStateAfterImages,
    mapSidecarLoader,
    rebuildMovementField: deps.rebuildMovementField,
    setStatus: deps.setStatus,
    getFileFromFolderSelection: deps.getFileFromFolderSelection,
    getRequiredGameplayMapFiles: deps.getRequiredGameplayMapFiles,
    onMapLoaded: deps.onMapLoaded,
  });
  return {
    loadMapFromPath: (mapFolderPath) => mapLoader.loadMapFromPath(mapFolderPath),
    loadMapFromFolderSelection: (fileList) => mapLoader.loadMapFromFolderSelection(fileList),
  };
}
