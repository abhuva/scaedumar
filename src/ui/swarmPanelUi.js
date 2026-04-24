export function createSwarmPanelUi(deps) {
  const {
    getSwarmSettings,
    swarmState,
    getSwarmFollowSnapshot,
    swarmFollowToggleBtn,
    swarmStatsPanelEl,
    swarmStatsBirdsValue,
    swarmStatsHawksValue,
    swarmStatsStepsValue,
    swarmStatsAvgHawkKillValue,
    swarmAgentCountValue,
    swarmFollowZoomInValue,
    swarmFollowZoomOutValue,
    swarmFollowAgentSpeedSmoothingValue,
    swarmFollowAgentZoomSmoothingValue,
    swarmUpdateIntervalValue,
    swarmMaxSpeedValue,
    swarmSteeringMaxValue,
    swarmVariationStrengthValue,
    swarmNeighborRadiusValue,
    swarmMinHeightValue,
    swarmMaxHeightValue,
    swarmSeparationRadiusValue,
    swarmAlignmentWeightValue,
    swarmCohesionWeightValue,
    swarmSeparationWeightValue,
    swarmWanderWeightValue,
    swarmRestChanceValue,
    swarmRestTicksValue,
    swarmBreedingThresholdValue,
    swarmBreedingSpawnChanceValue,
    swarmCursorStrengthValue,
    swarmCursorRadiusValue,
    swarmHawkCountValue,
    swarmHawkSpeedValue,
    swarmHawkSteeringValue,
    swarmHawkTargetRangeValue,
    swarmShowTerrainToggle,
    swarmLitModeToggle,
    swarmFollowTargetInput,
    swarmFollowZoomToggle,
    swarmFollowZoomInInput,
    swarmFollowZoomOutInput,
    swarmFollowHawkRangeGizmoToggle,
    swarmFollowAgentSpeedSmoothingInput,
    swarmFollowAgentZoomSmoothingInput,
    swarmStatsPanelToggle,
    swarmBackgroundColorInput,
    swarmAgentCountInput,
    swarmUpdateIntervalInput,
    swarmMaxSpeedInput,
    swarmSteeringMaxInput,
    swarmVariationStrengthInput,
    swarmNeighborRadiusInput,
    swarmMinHeightInput,
    swarmMaxHeightInput,
    swarmSeparationRadiusInput,
    swarmAlignmentWeightInput,
    swarmCohesionWeightInput,
    swarmSeparationWeightInput,
    swarmWanderWeightInput,
    swarmRestChanceInput,
    swarmRestTicksInput,
    swarmBreedingThresholdInput,
    swarmBreedingSpawnChanceInput,
    swarmCursorModeInput,
    swarmCursorStrengthInput,
    swarmCursorRadiusInput,
    swarmHawkEnabledToggle,
    swarmHawkCountInput,
    swarmHawkColorInput,
    swarmHawkSpeedInput,
    swarmHawkSteeringInput,
    swarmHawkTargetRangeInput,
  } = deps;

  function updateSwarmLabels() {
    const settings = getSwarmSettings();
    swarmAgentCountValue.textContent = String(settings.agentCount);
    swarmFollowZoomInValue.textContent = `${settings.followZoomIn.toFixed(1)}x`;
    swarmFollowZoomOutValue.textContent = `${settings.followZoomOut.toFixed(1)}x`;
    swarmFollowAgentSpeedSmoothingValue.textContent = settings.followAgentSpeedSmoothing.toFixed(2);
    swarmFollowAgentZoomSmoothingValue.textContent = settings.followAgentZoomSmoothing.toFixed(2);
    swarmUpdateIntervalValue.textContent = `${settings.simulationSpeed.toFixed(1)}x`;
    swarmMaxSpeedValue.textContent = `${Math.round(settings.maxSpeed)} px/s`;
    swarmSteeringMaxValue.textContent = `${Math.round(settings.maxSteering)} px/s^2`;
    swarmVariationStrengthValue.textContent = `${Math.round(settings.variationStrengthPct)}%`;
    swarmNeighborRadiusValue.textContent = `${Math.round(settings.neighborRadius)} px`;
    swarmMinHeightValue.textContent = `${Math.round(settings.minHeight)}`;
    swarmMaxHeightValue.textContent = `${Math.round(settings.maxHeight)}`;
    swarmSeparationRadiusValue.textContent = `${Math.round(settings.separationRadius)} px`;
    swarmAlignmentWeightValue.textContent = settings.alignmentWeight.toFixed(2);
    swarmCohesionWeightValue.textContent = settings.cohesionWeight.toFixed(2);
    swarmSeparationWeightValue.textContent = settings.separationWeight.toFixed(2);
    swarmWanderWeightValue.textContent = settings.wanderWeight.toFixed(2);
    swarmRestChanceValue.textContent = settings.restChancePct.toFixed(4);
    swarmRestTicksValue.textContent = `${Math.round(settings.restTicks)}`;
    swarmBreedingThresholdValue.textContent = `${Math.round(settings.breedingThreshold)}`;
    swarmBreedingSpawnChanceValue.textContent = `${Math.round(settings.breedingSpawnChance * 100)}%`;
    swarmCursorStrengthValue.textContent = settings.cursorStrength.toFixed(1);
    swarmCursorRadiusValue.textContent = `${Math.round(settings.cursorRadius)} px`;
    swarmHawkCountValue.textContent = String(settings.hawkCount);
    swarmHawkSpeedValue.textContent = `${Math.round(settings.hawkSpeed)} px/s`;
    swarmHawkSteeringValue.textContent = `${Math.round(settings.hawkSteering)} px/s^2`;
    swarmHawkTargetRangeValue.textContent = `${Math.round(settings.hawkTargetRange)} px`;
  }

  function syncSwarmStatsPanelVisibility() {
    const showStatsPanel = Boolean(getSwarmSettings().showStatsPanel);
    swarmStatsPanelEl.hidden = !showStatsPanel;
    swarmStatsPanelEl.classList.toggle("hidden", !showStatsPanel);
    swarmStatsPanelEl.style.display = showStatsPanel ? "block" : "none";
  }

  function updateSwarmUi() {
    const settings = getSwarmSettings();
    const swarmEnabled = Boolean(settings.useAgentSwarm);
    const cursorMode = settings.cursorMode;
    const cursorControlsEnabled = swarmEnabled && cursorMode !== "none";
    const followZoomControlsEnabled = swarmEnabled && Boolean(settings.followZoomBySpeed);
    syncSwarmStatsPanelVisibility();
    swarmShowTerrainToggle.disabled = !swarmEnabled;
    swarmLitModeToggle.disabled = !swarmEnabled;
    swarmFollowToggleBtn.disabled = !swarmEnabled;
    swarmFollowTargetInput.disabled = !swarmEnabled;
    swarmFollowZoomToggle.disabled = !swarmEnabled;
    swarmFollowZoomInInput.disabled = !followZoomControlsEnabled;
    swarmFollowZoomOutInput.disabled = !followZoomControlsEnabled;
    swarmFollowHawkRangeGizmoToggle.disabled = !swarmEnabled;
    swarmFollowAgentSpeedSmoothingInput.disabled = !followZoomControlsEnabled;
    swarmFollowAgentZoomSmoothingInput.disabled = !followZoomControlsEnabled;
    swarmStatsPanelToggle.disabled = false;
    swarmBackgroundColorInput.disabled = !swarmEnabled;
    swarmAgentCountInput.disabled = !swarmEnabled;
    swarmUpdateIntervalInput.disabled = !swarmEnabled;
    swarmMaxSpeedInput.disabled = !swarmEnabled;
    swarmSteeringMaxInput.disabled = !swarmEnabled;
    swarmVariationStrengthInput.disabled = !swarmEnabled;
    swarmNeighborRadiusInput.disabled = !swarmEnabled;
    swarmMinHeightInput.disabled = !swarmEnabled;
    swarmMaxHeightInput.disabled = !swarmEnabled;
    swarmSeparationRadiusInput.disabled = !swarmEnabled;
    swarmAlignmentWeightInput.disabled = !swarmEnabled;
    swarmCohesionWeightInput.disabled = !swarmEnabled;
    swarmSeparationWeightInput.disabled = !swarmEnabled;
    swarmWanderWeightInput.disabled = !swarmEnabled;
    swarmRestChanceInput.disabled = !swarmEnabled;
    swarmRestTicksInput.disabled = !swarmEnabled;
    swarmBreedingThresholdInput.disabled = !swarmEnabled;
    swarmBreedingSpawnChanceInput.disabled = !swarmEnabled;
    swarmCursorModeInput.disabled = !swarmEnabled;
    swarmCursorStrengthInput.disabled = !cursorControlsEnabled;
    swarmCursorRadiusInput.disabled = !cursorControlsEnabled;
    swarmHawkEnabledToggle.disabled = !swarmEnabled;
    swarmHawkCountInput.disabled = !swarmEnabled || !settings.useHawk;
    swarmHawkColorInput.disabled = !swarmEnabled || !settings.useHawk;
    swarmHawkSpeedInput.disabled = !swarmEnabled || !settings.useHawk;
    swarmHawkSteeringInput.disabled = !swarmEnabled || !settings.useHawk;
    swarmHawkTargetRangeInput.disabled = !swarmEnabled || !settings.useHawk;
  }

  function updateSwarmStatsPanel() {
    syncSwarmStatsPanelVisibility();
    const birdsText = String(swarmState.count);
    const hawksText = String(swarmState.hawks.length);
    const stepsText = Math.round(Math.max(0, swarmState.stepCount)).toLocaleString();
    if (swarmStatsBirdsValue.textContent !== birdsText) {
      swarmStatsBirdsValue.textContent = birdsText;
    }
    if (swarmStatsHawksValue.textContent !== hawksText) {
      swarmStatsHawksValue.textContent = hawksText;
    }
    if (swarmStatsStepsValue.textContent !== stepsText) {
      swarmStatsStepsValue.textContent = stepsText;
    }
    if (swarmState.hawkKillCount > 0) {
      const avg = swarmState.hawkKillIntervalSum / swarmState.hawkKillCount;
      const avgText = `${avg.toFixed(1)} ticks`;
      if (swarmStatsAvgHawkKillValue.textContent !== avgText) {
        swarmStatsAvgHawkKillValue.textContent = avgText;
      }
    } else if (swarmStatsAvgHawkKillValue.textContent !== "--") {
      swarmStatsAvgHawkKillValue.textContent = "--";
    }
  }

  function updateSwarmFollowButtonUi() {
    const follow = getSwarmFollowSnapshot();
    const noun = follow.targetType === "hawk" ? "Hawk" : "Agent";
    swarmFollowToggleBtn.textContent = follow.enabled ? "Stop Follow" : `Follow ${noun} Mode`;
  }

  return {
    updateSwarmLabels,
    updateSwarmUi,
    updateSwarmStatsPanel,
    updateSwarmFollowButtonUi,
    syncSwarmStatsPanelVisibility,
  };
}
