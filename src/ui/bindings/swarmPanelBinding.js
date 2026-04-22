export function bindSwarmPanelControls(deps) {
  function dispatchSwarmSettingChange(action) {
    deps.dispatchCoreCommand({
      type: "core/swarm/settingsChanged",
      action,
    });
  }

  deps.swarmShowTerrainToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("showTerrainChanged");
  });

  deps.swarmLitModeToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("litModeChanged");
  });

  deps.swarmFollowZoomToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("followZoomToggleChanged");
  });

  deps.swarmFollowZoomInInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("followZoomInChanged");
  });

  deps.swarmFollowZoomOutInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("followZoomOutChanged");
  });

  deps.swarmFollowHawkRangeGizmoToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("followHawkRangeGizmoChanged");
  });

  deps.swarmFollowAgentSpeedSmoothingInput.addEventListener("input", () => dispatchSwarmSettingChange("followSmoothingChanged"));
  deps.swarmFollowAgentZoomSmoothingInput.addEventListener("input", () => dispatchSwarmSettingChange("followSmoothingChanged"));

  deps.swarmStatsPanelToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("statsPanelChanged");
  });

  deps.swarmBackgroundColorInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("backgroundColorChanged");
  });

  deps.swarmAgentCountInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("agentCountChanged");
  });

  deps.swarmUpdateIntervalInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));

  deps.swarmMaxSpeedInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("maxSpeedChanged");
  });

  deps.swarmSteeringMaxInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("maxSteeringChanged");
  });

  deps.swarmVariationStrengthInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("variationChanged");
  });

  deps.swarmNeighborRadiusInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));

  deps.swarmMinHeightInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("minHeightChanged");
  });

  deps.swarmMaxHeightInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("maxHeightChanged");
  });

  deps.swarmSeparationRadiusInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmAlignmentWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmCohesionWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmSeparationWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmWanderWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmRestChanceInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmRestTicksInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmBreedingThresholdInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmBreedingSpawnChanceInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));

  deps.swarmCursorModeInput.addEventListener("change", () => {
    dispatchSwarmSettingChange("cursorModeChanged");
  });

  deps.swarmCursorStrengthInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmCursorRadiusInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));

  deps.swarmHawkEnabledToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("hawkEnabledChanged");
  });

  deps.swarmHawkCountInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("hawkCountChanged");
  });

  deps.swarmHawkColorInput.addEventListener("input", () => dispatchSwarmSettingChange("hawkColorChanged"));
  deps.swarmHawkSpeedInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmHawkSteeringInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));
  deps.swarmHawkTargetRangeInput.addEventListener("input", () => dispatchSwarmSettingChange("labelOnlyChanged"));

  deps.swarmEnabledToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("enabledToggleChanged");
  });
}
