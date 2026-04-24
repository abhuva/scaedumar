import { createMapRuntimeState } from "./mapRuntimeState.js";

export function createMapRuntimeStateBinding(deps) {
  return createMapRuntimeState({
    normalizeMapFolderPath: deps.normalizeMapFolderPath,
    setCurrentMapFolderPathValue: deps.setCurrentMapFolderPathValue,
    getCurrentMapFolderPath: deps.getCurrentMapFolderPath,
    mapPathInput: deps.mapPathInput,
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
}
