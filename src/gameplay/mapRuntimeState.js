export function createMapRuntimeState(deps) {
  function setCurrentMapFolderPath(nextPath) {
    deps.setCurrentMapFolderPathValue(deps.normalizeMapFolderPath(nextPath));
    deps.syncMapPathInput(deps.getCurrentMapFolderPath());
    deps.syncMapStateToStore();
  }

  function applyDefaultMapSettings() {
    deps.applyLightingSettings(deps.getSettingsDefaults("lighting", deps.defaultLightingSettings));
    deps.applyInteractionSettings(deps.getSettingsDefaults("interaction", deps.defaultInteractionSettings));
    deps.applyFogSettings(deps.getSettingsDefaults("fog", deps.defaultFogSettings));
    deps.applyCloudSettings(deps.getSettingsDefaults("clouds", deps.defaultCloudSettings));
    deps.applyWaterSettings(deps.getSettingsDefaults("waterfx", deps.defaultWaterSettings));
    deps.applyWaterTrailSettings(deps.defaultWaterTrailSettings);
    deps.applyDetailSettings(deps.getSettingsDefaults("detail", deps.defaultDetailSettings));
    deps.applyCameraSettings(deps.getSettingsDefaults("camera", deps.defaultCameraSettings));
    deps.applyAudioSettings(deps.getSettingsDefaults("audio", deps.defaultAudioSettings));
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
