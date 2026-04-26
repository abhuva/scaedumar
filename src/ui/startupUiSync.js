export function runStartupUiSync(deps) {
  const baseStatus = deps.baseStatus || deps.statusTextEl.textContent || "Ready.";
  deps.setSwarmDefaults();
  const swarmSettings = deps.getSwarmSettings();
  deps.normalizeSwarmHeightRangeInputs("min", {
    minHeight: swarmSettings.minHeight,
    maxHeight: swarmSettings.maxHeight,
  });
  deps.updatePathfindingRangeLabel();
  deps.updatePathWeightLabels();
  deps.updatePathSlopeCutoffLabel();
  deps.updatePathBaseCostLabel();
  deps.updateSwarmLabels();
  deps.updateSwarmUi();
  deps.updateSwarmStatsPanel();
  deps.updateSwarmFollowButtonUi();
  deps.updateParallaxStrengthLabel();
  deps.updateParallaxBandsLabel();
  deps.updateShadowBlurLabel();
  deps.updateVolumetricLabels();
  deps.updatePointFlickerLabels();
  deps.updateSimTickLabel();
  deps.updateFogAlphaLabels();
  deps.updateFogFalloffLabel();
  deps.updateFogStartOffsetLabel();
  deps.updateCloudLabels();
  deps.updateWaterLabels();
  deps.updatePointLightStrengthLabel();
  deps.updatePointLightIntensityLabel();
  deps.updatePointLightHeightOffsetLabel();
  deps.updatePointLightFlickerLabel();
  deps.updatePointLightFlickerSpeedLabel();
  deps.updateCursorLightStrengthLabel();
  deps.updateCursorLightHeightOffsetLabel();
  deps.setCycleHourSliderFromState();
  deps.updateCycleHourLabel();
  deps.syncMapPathInput(deps.currentMapFolderPath);
  deps.updateLightEditorUi();
  deps.updateCursorLightModeUi();
  deps.updateParallaxUi();
  deps.updateVolumetricUi();
  deps.updatePointFlickerUi();
  deps.updateFogUi();
  deps.updateCloudUi();
  deps.updateWaterUi();
  deps.setActiveTopic("");
  deps.setInteractionMode("none");
  deps.updateModeCapabilitiesUi();
  deps.reseedSwarmAgents(swarmSettings.agentCount);
  deps.setStatus(
    `${baseStatus} | Load maps by folder/path, use left dock mode toggles (LM/PF), wheel zoom + middle-drag pan for terrain, and Agent Swarm panel toggle for boid testing.`,
  );
}
