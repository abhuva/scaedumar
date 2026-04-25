export function createMapRuntimeState(deps) {
  function setCurrentMapFolderPath(nextPath) {
    deps.setCurrentMapFolderPathValue(deps.normalizeMapFolderPath(nextPath));
    deps.mapPathInput.value = deps.getCurrentMapFolderPath();
    deps.syncMapStateToStore();
  }

  function applyDefaultMapSettings() {
    deps.applyLightingSettings(deps.getSettingsDefaults("lighting", deps.defaultLightingSettings));
    deps.applyParallaxSettings(deps.getSettingsDefaults("parallax", deps.defaultParallaxSettings));
    deps.applyInteractionSettings(deps.getSettingsDefaults("interaction", deps.defaultInteractionSettings));
    deps.applyFogSettings(deps.getSettingsDefaults("fog", deps.defaultFogSettings));
    deps.applyCloudSettings(deps.getSettingsDefaults("clouds", deps.defaultCloudSettings));
    deps.applyWaterSettings(deps.getSettingsDefaults("waterfx", deps.defaultWaterSettings));
    deps.applySwarmSettings(deps.getSettingsDefaults("swarm", deps.defaultSwarmSettings));
  }

  function applyMapSizeChangeIfNeeded(changed) {
    if (!changed) return;
    rebuildLightsAndReseed();
  }

  function rebuildLightsAndReseed() {
    deps.clearPointLights();
    deps.bakePointLightsTexture();
    deps.updateLightEditorUi();
    deps.reseedSwarmAgents(deps.getSwarmSettings().agentCount);
  }

  function resetMapRuntimeStateAfterImages() {
    rebuildLightsAndReseed();
    applyDefaultMapSettings();
    deps.requestOverlayDraw();
  }

  return {
    setCurrentMapFolderPath,
    applyDefaultMapSettings,
    applyMapSizeChangeIfNeeded,
    resetMapRuntimeStateAfterImages,
  };
}
