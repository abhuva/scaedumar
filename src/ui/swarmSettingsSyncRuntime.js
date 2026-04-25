export function createSwarmSettingsSyncRuntime(deps) {
  function finiteOr(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function stringOr(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
  }

  function syncSwarmSettingsInputs() {
    const settings = deps.getSwarmSettings();
    const swarmHeightMax = Number.isFinite(Number(deps.swarmHeightMax)) ? Number(deps.swarmHeightMax) : 256;
    deps.swarmEnabledToggle.checked = Boolean(settings.useAgentSwarm);
    deps.swarmLitModeToggle.checked = Boolean(settings.useLitSwarm);
    deps.swarmFollowZoomToggle.checked = Boolean(settings.followZoomBySpeed);
    deps.swarmFollowZoomInInput.value = deps.clamp(finiteOr(settings.followZoomIn, 1), deps.zoomMin, deps.zoomMax).toFixed(1);
    deps.swarmFollowZoomOutInput.value = deps.clamp(finiteOr(settings.followZoomOut, 1), deps.zoomMin, deps.zoomMax).toFixed(1);
    deps.swarmFollowHawkRangeGizmoToggle.checked = Boolean(settings.followHawkRangeGizmo);
    deps.swarmFollowAgentSpeedSmoothingInput.value = deps.clamp(finiteOr(settings.followAgentSpeedSmoothing, 0.1), 0.01, 0.25).toFixed(2);
    deps.swarmFollowAgentZoomSmoothingInput.value = deps.clamp(finiteOr(settings.followAgentZoomSmoothing, 0.1), 0.01, 0.25).toFixed(2);
    deps.swarmStatsPanelToggle.checked = Boolean(settings.showStatsPanel);
    deps.swarmShowTerrainToggle.checked = Boolean(settings.showTerrainInSwarm);
    deps.swarmBackgroundColorInput.value = stringOr(settings.backgroundColor, "#000000");
    deps.swarmAgentCountInput.value = String(Math.round(deps.clamp(finiteOr(settings.agentCount, 300), 100, 1000)));
    deps.swarmUpdateIntervalInput.value = String(deps.clamp(finiteOr(settings.simulationSpeed, 1), 0.1, 20));
    deps.swarmMaxSpeedInput.value = String(deps.clamp(finiteOr(settings.maxSpeed, 90), 30, 300));
    deps.swarmSteeringMaxInput.value = String(deps.clamp(finiteOr(settings.maxSteering, 180), 10, 500));
    deps.swarmVariationStrengthInput.value = String(Math.round(deps.clamp(finiteOr(settings.variationStrengthPct, 12), 0, 50)));
    deps.swarmNeighborRadiusInput.value = String(deps.clamp(finiteOr(settings.neighborRadius, 60), 10, 200));
    deps.swarmMinHeightInput.value = String(Math.round(deps.clamp(finiteOr(settings.minHeight, 16), 0, swarmHeightMax)));
    deps.swarmMaxHeightInput.value = String(Math.round(deps.clamp(finiteOr(settings.maxHeight, 64), 0, swarmHeightMax)));
    deps.swarmSeparationRadiusInput.value = String(deps.clamp(finiteOr(settings.separationRadius, 24), 6, 120));
    deps.swarmAlignmentWeightInput.value = String(deps.clamp(finiteOr(settings.alignmentWeight, 1), 0, 4));
    deps.swarmCohesionWeightInput.value = String(deps.clamp(finiteOr(settings.cohesionWeight, 1), 0, 4));
    deps.swarmSeparationWeightInput.value = String(deps.clamp(finiteOr(settings.separationWeight, 1.2), 0, 6));
    deps.swarmWanderWeightInput.value = String(deps.clamp(finiteOr(settings.wanderWeight, 0.35), 0, 2));
    deps.swarmRestChanceInput.value = String(deps.clamp(finiteOr(settings.restChancePct, 0.0002), 0, 0.002));
    deps.swarmRestTicksInput.value = String(Math.round(deps.clamp(finiteOr(settings.restTicks, 1800), 100, 10000)));
    deps.swarmBreedingThresholdInput.value = String(Math.round(deps.clamp(finiteOr(settings.breedingThreshold, 500), 0, 1000)));
    deps.swarmBreedingSpawnChanceInput.value = String(deps.clamp(finiteOr(settings.breedingSpawnChance, 0.5), 0, 1));
    deps.swarmCursorModeInput.value = settings.cursorMode === "repel" || settings.cursorMode === "attract" ? settings.cursorMode : "none";
    deps.swarmCursorStrengthInput.value = String(deps.clamp(finiteOr(settings.cursorStrength, 1), 0, 8));
    deps.swarmCursorRadiusInput.value = String(deps.clamp(finiteOr(settings.cursorRadius, 80), 20, 260));
    deps.swarmHawkEnabledToggle.checked = Boolean(settings.useHawk);
    deps.swarmHawkCountInput.value = String(Math.round(deps.clamp(finiteOr(settings.hawkCount, 2), 0, 20)));
    deps.swarmHawkColorInput.value = stringOr(settings.hawkColor, "#ff6633");
    deps.swarmHawkSpeedInput.value = String(deps.clamp(finiteOr(settings.hawkSpeed, 180), 30, 420));
    deps.swarmHawkSteeringInput.value = String(deps.clamp(finiteOr(settings.hawkSteering, 180), 20, 700));
    deps.swarmHawkTargetRangeInput.value = String(Math.round(deps.clamp(finiteOr(settings.hawkTargetRange, 140), 20, 500)));
    if (deps.swarmTimeRoutingInput) {
      const normalizeRoutingMode = typeof deps.normalizeRoutingMode === "function"
        ? deps.normalizeRoutingMode
        : ((value, fallback) => (value === "detached" ? "detached" : fallback));
      deps.swarmTimeRoutingInput.value = normalizeRoutingMode(settings.timeRouting, "global");
    }
  }

  function syncSwarmPanelUi() {
    syncSwarmSettingsInputs();
    deps.updateSwarmLabels();
    deps.updateSwarmUi();
  }

  return {
    syncSwarmSettingsInputs,
    syncSwarmPanelUi,
  };
}
