import { createMapDataSaveController } from "./mapDataSaveController.js";

export function createMapDataSaveRuntime(deps) {
  const controller = createMapDataSaveController({
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
    getCurrentMapFolderPath: deps.getCurrentMapFolderPath,
    confirm: deps.confirm,
    setStatus: deps.setStatus,
    tauriInvoke: deps.tauriInvoke,
    isAbsoluteFsPath: deps.isAbsoluteFsPath,
    pickMapFolderViaTauri: deps.pickMapFolderViaTauri,
    joinFsPath: deps.joinFsPath,
    invokeTauri: deps.invokeTauri,
    showDirectoryPicker: deps.showDirectoryPicker,
  });
  return {
    createMapDataFileTexts: () => controller.createMapDataFileTexts(),
    downloadTextFile: (fileName, text) => controller.downloadTextFile(fileName, text),
    saveAllMapDataFiles: () => controller.saveAllMapDataFiles(),
    saveMapDataFile: (fileName) => controller.saveMapDataFile(fileName),
  };
}
