export function createSwarmSettingsApplier(deps) {
  return function applySwarmSettingsCompat() {
    const settings = deps.getSwarmSettings();
    deps.swarmEnabledToggle.checked = Boolean(settings.useAgentSwarm);
    deps.swarmLitModeToggle.checked = Boolean(settings.useLitSwarm);
    deps.swarmFollowZoomToggle.checked = Boolean(settings.followZoomBySpeed);
    deps.swarmFollowZoomInInput.value = settings.followZoomIn.toFixed(1);
    deps.swarmFollowZoomOutInput.value = settings.followZoomOut.toFixed(1);
    deps.swarmFollowHawkRangeGizmoToggle.checked = Boolean(settings.followHawkRangeGizmo);
    deps.swarmFollowAgentSpeedSmoothingInput.value = settings.followAgentSpeedSmoothing.toFixed(2);
    deps.swarmFollowAgentZoomSmoothingInput.value = settings.followAgentZoomSmoothing.toFixed(2);
    deps.swarmStatsPanelToggle.checked = Boolean(settings.showStatsPanel);
    deps.swarmShowTerrainToggle.checked = Boolean(settings.showTerrainInSwarm);
    deps.swarmBackgroundColorInput.value = settings.backgroundColor;
    deps.swarmAgentCountInput.value = String(settings.agentCount);
    deps.swarmUpdateIntervalInput.value = String(settings.simulationSpeed);
    deps.swarmMaxSpeedInput.value = String(settings.maxSpeed);
    deps.swarmSteeringMaxInput.value = String(settings.maxSteering);
    deps.swarmVariationStrengthInput.value = String(settings.variationStrengthPct);
    deps.swarmNeighborRadiusInput.value = String(settings.neighborRadius);
    deps.swarmMinHeightInput.value = String(settings.minHeight);
    deps.swarmMaxHeightInput.value = String(settings.maxHeight);
    deps.swarmSeparationRadiusInput.value = String(settings.separationRadius);
    deps.swarmAlignmentWeightInput.value = String(settings.alignmentWeight);
    deps.swarmCohesionWeightInput.value = String(settings.cohesionWeight);
    deps.swarmSeparationWeightInput.value = String(settings.separationWeight);
    deps.swarmWanderWeightInput.value = String(settings.wanderWeight);
    deps.swarmRestChanceInput.value = String(settings.restChancePct);
    deps.swarmRestTicksInput.value = String(settings.restTicks);
    deps.swarmBreedingThresholdInput.value = String(settings.breedingThreshold);
    deps.swarmBreedingSpawnChanceInput.value = String(settings.breedingSpawnChance);
    deps.swarmCursorModeInput.value = settings.cursorMode;
    deps.swarmCursorStrengthInput.value = String(settings.cursorStrength);
    deps.swarmCursorRadiusInput.value = String(settings.cursorRadius);
    deps.swarmHawkEnabledToggle.checked = Boolean(settings.useHawk);
    deps.swarmHawkCountInput.value = String(settings.hawkCount);
    deps.swarmHawkColorInput.value = settings.hawkColor;
    deps.swarmHawkSpeedInput.value = String(settings.hawkSpeed);
    deps.swarmHawkSteeringInput.value = String(settings.hawkSteering);
    deps.swarmHawkTargetRangeInput.value = String(settings.hawkTargetRange);
    if (deps.swarmTimeRoutingInput) {
      deps.swarmTimeRoutingInput.value = settings.timeRouting;
    }
    const defaultFollowTarget = deps.swarmFollowTargetInput && deps.swarmFollowTargetInput.options && deps.swarmFollowTargetInput.options.length > 0
      ? deps.swarmFollowTargetInput.options[0].value
      : "agent";
    deps.applySwarmFollowState({
      enabled: false,
      targetType: defaultFollowTarget,
      agentIndex: -1,
      hawkIndex: -1,
    });
    deps.swarmState.breedingActive = false;
    deps.normalizeSwarmFollowZoomInputs("out", {
      zoomOut: settings.followZoomOut,
      zoomIn: settings.followZoomIn,
    });
    deps.normalizeSwarmHeightRangeInputs("min", {
      minHeight: settings.minHeight,
      maxHeight: settings.maxHeight,
    });
    deps.updateSwarmLabels();
    deps.updateSwarmUi();
    deps.syncSwarmFollowToStore();
  };
}
