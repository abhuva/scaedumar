import { createMapSidecarLoader } from "./mapSidecarLoader.js";
import { createMapLoader } from "./mapLoader.js";

export function createMapLoadingRuntime(deps) {
  const mapSidecarLoader = createMapSidecarLoader({
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
  });
  return {
    loadMapFromPath: (mapFolderPath) => mapLoader.loadMapFromPath(mapFolderPath),
    loadMapFromFolderSelection: (fileList) => mapLoader.loadMapFromFolderSelection(fileList),
  };
}
