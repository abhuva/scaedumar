export function bindSwarmPanelControls(deps) {
  deps.swarmShowTerrainToggle.addEventListener("change", () => {
    deps.requestOverlayDraw();
  });

  deps.swarmLitModeToggle.addEventListener("change", () => {
    deps.requestOverlayDraw();
  });

  deps.swarmFollowZoomToggle.addEventListener("change", () => {
    deps.updateSwarmUi();
    deps.updateSwarmLabels();
  });

  deps.swarmFollowZoomInInput.addEventListener("input", () => {
    deps.normalizeSwarmFollowZoomInputs("in");
    deps.updateSwarmLabels();
  });

  deps.swarmFollowZoomOutInput.addEventListener("input", () => {
    deps.normalizeSwarmFollowZoomInputs("out");
    deps.updateSwarmLabels();
  });

  deps.swarmFollowHawkRangeGizmoToggle.addEventListener("change", () => {
    deps.updateSwarmUi();
    deps.requestOverlayDraw();
  });

  deps.swarmFollowAgentSpeedSmoothingInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmFollowAgentZoomSmoothingInput.addEventListener("input", deps.updateSwarmLabels);

  deps.swarmStatsPanelToggle.addEventListener("change", () => {
    deps.updateSwarmUi();
    deps.updateSwarmStatsPanel();
  });

  deps.swarmBackgroundColorInput.addEventListener("input", () => {
    deps.requestOverlayDraw();
  });

  deps.swarmAgentCountInput.addEventListener("input", () => {
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(Math.round(deps.clamp(Number(deps.swarmAgentCountInput.value), 100, 1000)));
  });

  deps.swarmUpdateIntervalInput.addEventListener("input", deps.updateSwarmLabels);

  deps.swarmMaxSpeedInput.addEventListener("input", () => {
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
  });

  deps.swarmSteeringMaxInput.addEventListener("input", () => {
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
  });

  deps.swarmVariationStrengthInput.addEventListener("input", () => {
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
  });

  deps.swarmNeighborRadiusInput.addEventListener("input", deps.updateSwarmLabels);

  deps.swarmMinHeightInput.addEventListener("input", () => {
    deps.normalizeSwarmHeightRangeInputs("min");
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(deps.swarmState.count);
  });

  deps.swarmMaxHeightInput.addEventListener("input", () => {
    deps.normalizeSwarmHeightRangeInputs("max");
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(deps.swarmState.count);
  });

  deps.swarmSeparationRadiusInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmAlignmentWeightInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmCohesionWeightInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmSeparationWeightInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmWanderWeightInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmRestChanceInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmRestTicksInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmBreedingThresholdInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmBreedingSpawnChanceInput.addEventListener("input", deps.updateSwarmLabels);

  deps.swarmCursorModeInput.addEventListener("change", () => {
    deps.updateSwarmUi();
    deps.requestOverlayDraw();
  });

  deps.swarmCursorStrengthInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmCursorRadiusInput.addEventListener("input", deps.updateSwarmLabels);

  deps.swarmHawkEnabledToggle.addEventListener("change", () => {
    deps.updateSwarmUi();
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
  });

  deps.swarmHawkCountInput.addEventListener("input", () => {
    deps.updateSwarmLabels();
    deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
  });

  deps.swarmHawkColorInput.addEventListener("input", deps.requestOverlayDraw);
  deps.swarmHawkSpeedInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmHawkSteeringInput.addEventListener("input", deps.updateSwarmLabels);
  deps.swarmHawkTargetRangeInput.addEventListener("input", deps.updateSwarmLabels);

  deps.swarmEnabledToggle.addEventListener("change", () => {
    deps.updateSwarmUi();
    deps.swarmState.lastUpdateMs = null;
    deps.swarmCursorState.active = false;
    if (deps.swarmEnabledToggle.checked) {
      deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
      deps.setStatus("Agent swarm enabled.");
    } else {
      deps.swarmFollowState.enabled = false;
      deps.swarmFollowState.agentIndex = -1;
      deps.swarmFollowState.hawkIndex = -1;
      deps.resetSwarmFollowSpeedSmoothing();
      deps.updateSwarmFollowButtonUi();
      deps.requestOverlayDraw();
      deps.setStatus("Agent swarm disabled.");
    }
  });
}
