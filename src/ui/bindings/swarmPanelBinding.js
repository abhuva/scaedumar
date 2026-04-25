export function bindSwarmPanelControls(deps) {
  function dispatchSwarmSettingChange(action, payload = {}) {
    deps.dispatchCoreCommand({
      type: "core/swarm/settingsChanged",
      action,
      ...payload,
    });
  }

  deps.swarmShowTerrainToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("showTerrainChanged", {
      value: deps.swarmShowTerrainToggle.checked,
    });
  });

  deps.swarmLitModeToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("litModeChanged", {
      value: deps.swarmLitModeToggle.checked,
    });
  });

  deps.swarmFollowZoomToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("followZoomToggleChanged", {
      value: deps.swarmFollowZoomToggle.checked,
    });
  });

  deps.swarmFollowZoomInInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("followZoomInChanged", {
      zoomIn: Number(deps.swarmFollowZoomInInput.value),
      zoomOut: Number(deps.swarmFollowZoomOutInput.value),
    });
  });

  deps.swarmFollowZoomOutInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("followZoomOutChanged", {
      zoomIn: Number(deps.swarmFollowZoomInInput.value),
      zoomOut: Number(deps.swarmFollowZoomOutInput.value),
    });
  });

  deps.swarmFollowHawkRangeGizmoToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("followHawkRangeGizmoChanged", {
      value: deps.swarmFollowHawkRangeGizmoToggle.checked,
    });
  });

  deps.swarmFollowAgentSpeedSmoothingInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("followAgentSpeedSmoothingChanged", {
      value: Number(deps.swarmFollowAgentSpeedSmoothingInput.value),
    });
  });
  deps.swarmFollowAgentZoomSmoothingInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("followAgentZoomSmoothingChanged", {
      value: Number(deps.swarmFollowAgentZoomSmoothingInput.value),
    });
  });

  deps.swarmStatsPanelToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("statsPanelChanged", {
      value: deps.swarmStatsPanelToggle.checked,
    });
  });

  deps.swarmBackgroundColorInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("backgroundColorChanged", {
      value: deps.swarmBackgroundColorInput.value,
    });
  });

  deps.swarmAgentCountInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("agentCountChanged", {
      value: Number(deps.swarmAgentCountInput.value),
    });
  });

  deps.swarmUpdateIntervalInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("simulationSpeedChanged", {
      value: Number(deps.swarmUpdateIntervalInput.value),
    });
  });

  deps.swarmMaxSpeedInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("maxSpeedChanged", {
      value: Number(deps.swarmMaxSpeedInput.value),
    });
  });

  deps.swarmSteeringMaxInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("maxSteeringChanged", {
      value: Number(deps.swarmSteeringMaxInput.value),
    });
  });

  deps.swarmVariationStrengthInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("variationChanged", {
      value: Number(deps.swarmVariationStrengthInput.value),
    });
  });

  deps.swarmNeighborRadiusInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("neighborRadiusChanged", {
      value: Number(deps.swarmNeighborRadiusInput.value),
    });
  });

  deps.swarmMinHeightInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("minHeightChanged", {
      minHeight: Number(deps.swarmMinHeightInput.value),
      maxHeight: Number(deps.swarmMaxHeightInput.value),
    });
  });

  deps.swarmMaxHeightInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("maxHeightChanged", {
      minHeight: Number(deps.swarmMinHeightInput.value),
      maxHeight: Number(deps.swarmMaxHeightInput.value),
    });
  });

  deps.swarmSeparationRadiusInput.addEventListener("input", () => dispatchSwarmSettingChange("separationRadiusChanged", { value: Number(deps.swarmSeparationRadiusInput.value) }));
  deps.swarmAlignmentWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("alignmentWeightChanged", { value: Number(deps.swarmAlignmentWeightInput.value) }));
  deps.swarmCohesionWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("cohesionWeightChanged", { value: Number(deps.swarmCohesionWeightInput.value) }));
  deps.swarmSeparationWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("separationWeightChanged", { value: Number(deps.swarmSeparationWeightInput.value) }));
  deps.swarmWanderWeightInput.addEventListener("input", () => dispatchSwarmSettingChange("wanderWeightChanged", { value: Number(deps.swarmWanderWeightInput.value) }));
  deps.swarmRestChanceInput.addEventListener("input", () => dispatchSwarmSettingChange("restChanceChanged", { value: Number(deps.swarmRestChanceInput.value) }));
  deps.swarmRestTicksInput.addEventListener("input", () => dispatchSwarmSettingChange("restTicksChanged", { value: Number(deps.swarmRestTicksInput.value) }));
  deps.swarmBreedingThresholdInput.addEventListener("input", () => dispatchSwarmSettingChange("breedingThresholdChanged", { value: Number(deps.swarmBreedingThresholdInput.value) }));
  deps.swarmBreedingSpawnChanceInput.addEventListener("input", () => dispatchSwarmSettingChange("breedingSpawnChanceChanged", { value: Number(deps.swarmBreedingSpawnChanceInput.value) }));

  deps.swarmCursorModeInput.addEventListener("change", () => {
    dispatchSwarmSettingChange("cursorModeChanged", {
      value: deps.swarmCursorModeInput.value,
    });
  });

  deps.swarmCursorStrengthInput.addEventListener("input", () => dispatchSwarmSettingChange("cursorStrengthChanged", { value: Number(deps.swarmCursorStrengthInput.value) }));
  deps.swarmCursorRadiusInput.addEventListener("input", () => dispatchSwarmSettingChange("cursorRadiusChanged", { value: Number(deps.swarmCursorRadiusInput.value) }));

  deps.swarmHawkEnabledToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("hawkEnabledChanged", {
      value: deps.swarmHawkEnabledToggle.checked,
    });
  });

  deps.swarmHawkCountInput.addEventListener("input", () => {
    dispatchSwarmSettingChange("hawkCountChanged", {
      value: Number(deps.swarmHawkCountInput.value),
    });
  });

  deps.swarmHawkColorInput.addEventListener("input", () => dispatchSwarmSettingChange("hawkColorChanged", { value: deps.swarmHawkColorInput.value }));
  deps.swarmHawkSpeedInput.addEventListener("input", () => dispatchSwarmSettingChange("hawkSpeedChanged", { value: Number(deps.swarmHawkSpeedInput.value) }));
  deps.swarmHawkSteeringInput.addEventListener("input", () => dispatchSwarmSettingChange("hawkSteeringChanged", { value: Number(deps.swarmHawkSteeringInput.value) }));
  deps.swarmHawkTargetRangeInput.addEventListener("input", () => dispatchSwarmSettingChange("hawkTargetRangeChanged", { value: Number(deps.swarmHawkTargetRangeInput.value) }));

  deps.swarmEnabledToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("enabledToggleChanged", {
      value: deps.swarmEnabledToggle.checked,
    });
  });

  if (deps.swarmTimeRoutingInput) {
    deps.swarmTimeRoutingInput.addEventListener("change", () => {
      deps.dispatchCoreCommand({
        type: "core/time/setRouting",
        target: "swarm",
        mode: deps.swarmTimeRoutingInput.value,
      });
    });
  }
}
