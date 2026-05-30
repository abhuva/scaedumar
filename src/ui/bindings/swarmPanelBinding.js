export function bindSwarmPanelControls(deps) {
  function syncFollowZoomControlsFromDom() {
    const enabled = Boolean(deps.swarmEnabledToggle.checked);
    deps.swarmFollowZoomInInput.disabled = !enabled;
    deps.swarmFollowZoomOutInput.disabled = !enabled;
    deps.swarmFollowAgentZoomSmoothingInput.disabled = !enabled;
    if (deps.swarmFollowCameraPositionSmoothingInput) deps.swarmFollowCameraPositionSmoothingInput.disabled = !deps.swarmEnabledToggle.checked;
  }

  function setText(el, value) {
    if (el) {
      el.textContent = value;
    }
  }

  function rounded(value) {
    return String(Math.round(Number(value) || 0));
  }

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

  deps.swarmFollowZoomInInput.addEventListener("input", () => {
    setText(deps.swarmFollowZoomInValue, `${Number(deps.swarmFollowZoomInInput.value).toFixed(1)}x`);
    dispatchSwarmSettingChange("followZoomInChanged", {
      zoomIn: Number(deps.swarmFollowZoomInInput.value),
    });
  });

  deps.swarmFollowZoomOutInput.addEventListener("input", () => {
    setText(deps.swarmFollowZoomOutValue, `${Number(deps.swarmFollowZoomOutInput.value).toFixed(1)}x`);
    dispatchSwarmSettingChange("followZoomOutChanged", {
      zoomOut: Number(deps.swarmFollowZoomOutInput.value),
    });
  });

  deps.swarmFollowHawkRangeGizmoToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("followHawkRangeGizmoChanged", {
      value: deps.swarmFollowHawkRangeGizmoToggle.checked,
    });
  });

  deps.swarmFollowAgentZoomSmoothingInput.addEventListener("input", () => {
    setText(deps.swarmFollowAgentZoomSmoothingValue, Number(deps.swarmFollowAgentZoomSmoothingInput.value).toFixed(2));
    dispatchSwarmSettingChange("followAgentZoomSmoothingChanged", {
      value: Number(deps.swarmFollowAgentZoomSmoothingInput.value),
    });
  });
  if (deps.swarmFollowCameraPositionSmoothingInput) {
    deps.swarmFollowCameraPositionSmoothingInput.addEventListener("input", () => {
      setText(deps.swarmFollowCameraPositionSmoothingValue, Number(deps.swarmFollowCameraPositionSmoothingInput.value).toFixed(2));
      dispatchSwarmSettingChange("followCameraPositionSmoothingChanged", {
        value: Number(deps.swarmFollowCameraPositionSmoothingInput.value),
      });
    });
  }
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
    setText(deps.swarmAgentCountValue, rounded(deps.swarmAgentCountInput.value));
    dispatchSwarmSettingChange("agentCountChanged", {
      value: Number(deps.swarmAgentCountInput.value),
    });
  });

  deps.swarmUpdateIntervalInput.addEventListener("input", () => {
    setText(deps.swarmUpdateIntervalValue, `${fixed(deps.swarmUpdateIntervalInput.value, 1)}x`);
    dispatchSwarmSettingChange("simulationSpeedChanged", {
      value: Number(deps.swarmUpdateIntervalInput.value),
    });
  });

  deps.swarmMaxSpeedInput.addEventListener("input", () => {
    setText(deps.swarmMaxSpeedValue, `${rounded(deps.swarmMaxSpeedInput.value)} px/s`);
    dispatchSwarmSettingChange("maxSpeedChanged", {
      value: Number(deps.swarmMaxSpeedInput.value),
    });
  });

  deps.swarmSteeringMaxInput.addEventListener("input", () => {
    setText(deps.swarmSteeringMaxValue, `${rounded(deps.swarmSteeringMaxInput.value)} px/s^2`);
    dispatchSwarmSettingChange("maxSteeringChanged", {
      value: Number(deps.swarmSteeringMaxInput.value),
    });
  });

  deps.swarmVariationStrengthInput.addEventListener("input", () => {
    setText(deps.swarmVariationStrengthValue, `${rounded(deps.swarmVariationStrengthInput.value)}%`);
    dispatchSwarmSettingChange("variationChanged", {
      value: Number(deps.swarmVariationStrengthInput.value),
    });
  });

  deps.swarmNeighborRadiusInput.addEventListener("input", () => {
    setText(deps.swarmNeighborRadiusValue, `${rounded(deps.swarmNeighborRadiusInput.value)} px`);
    dispatchSwarmSettingChange("neighborRadiusChanged", {
      value: Number(deps.swarmNeighborRadiusInput.value),
    });
  });

  deps.swarmMinHeightInput.addEventListener("input", () => {
    setText(deps.swarmMinHeightValue, rounded(deps.swarmMinHeightInput.value));
    dispatchSwarmSettingChange("minHeightChanged", {
      minHeight: Number(deps.swarmMinHeightInput.value),
    });
  });

  deps.swarmMaxHeightInput.addEventListener("input", () => {
    setText(deps.swarmMaxHeightValue, rounded(deps.swarmMaxHeightInput.value));
    dispatchSwarmSettingChange("maxHeightChanged", {
      maxHeight: Number(deps.swarmMaxHeightInput.value),
    });
  });

  deps.swarmSeparationRadiusInput.addEventListener("input", () => {
    setText(deps.swarmSeparationRadiusValue, `${rounded(deps.swarmSeparationRadiusInput.value)} px`);
    dispatchSwarmSettingChange("separationRadiusChanged", { value: Number(deps.swarmSeparationRadiusInput.value) });
  });
  deps.swarmAlignmentWeightInput.addEventListener("input", () => {
    setText(deps.swarmAlignmentWeightValue, fixed(deps.swarmAlignmentWeightInput.value, 2));
    dispatchSwarmSettingChange("alignmentWeightChanged", { value: Number(deps.swarmAlignmentWeightInput.value) });
  });
  deps.swarmCohesionWeightInput.addEventListener("input", () => {
    setText(deps.swarmCohesionWeightValue, fixed(deps.swarmCohesionWeightInput.value, 2));
    dispatchSwarmSettingChange("cohesionWeightChanged", { value: Number(deps.swarmCohesionWeightInput.value) });
  });
  deps.swarmSeparationWeightInput.addEventListener("input", () => {
    setText(deps.swarmSeparationWeightValue, fixed(deps.swarmSeparationWeightInput.value, 2));
    dispatchSwarmSettingChange("separationWeightChanged", { value: Number(deps.swarmSeparationWeightInput.value) });
  });
  deps.swarmWanderWeightInput.addEventListener("input", () => {
    setText(deps.swarmWanderWeightValue, fixed(deps.swarmWanderWeightInput.value, 2));
    dispatchSwarmSettingChange("wanderWeightChanged", { value: Number(deps.swarmWanderWeightInput.value) });
  });
  deps.swarmRestChanceInput.addEventListener("input", () => {
    setText(deps.swarmRestChanceValue, fixed(deps.swarmRestChanceInput.value, 4));
    dispatchSwarmSettingChange("restChanceChanged", { value: Number(deps.swarmRestChanceInput.value) });
  });
  deps.swarmRestTicksInput.addEventListener("input", () => {
    setText(deps.swarmRestTicksValue, rounded(deps.swarmRestTicksInput.value));
    dispatchSwarmSettingChange("restTicksChanged", { value: Number(deps.swarmRestTicksInput.value) });
  });
  deps.swarmBreedingThresholdInput.addEventListener("input", () => {
    setText(deps.swarmBreedingThresholdValue, rounded(deps.swarmBreedingThresholdInput.value));
    dispatchSwarmSettingChange("breedingThresholdChanged", { value: Number(deps.swarmBreedingThresholdInput.value) });
  });
  deps.swarmBreedingSpawnChanceInput.addEventListener("input", () => {
    setText(deps.swarmBreedingSpawnChanceValue, `${Math.round((Number(deps.swarmBreedingSpawnChanceInput.value) || 0) * 100)}%`);
    dispatchSwarmSettingChange("breedingSpawnChanceChanged", { value: Number(deps.swarmBreedingSpawnChanceInput.value) });
  });

  deps.swarmCursorModeInput.addEventListener("change", () => {
    dispatchSwarmSettingChange("cursorModeChanged", {
      value: deps.swarmCursorModeInput.value,
    });
  });

  deps.swarmCursorStrengthInput.addEventListener("input", () => {
    setText(deps.swarmCursorStrengthValue, fixed(deps.swarmCursorStrengthInput.value, 1));
    dispatchSwarmSettingChange("cursorStrengthChanged", { value: Number(deps.swarmCursorStrengthInput.value) });
  });
  deps.swarmCursorRadiusInput.addEventListener("input", () => {
    setText(deps.swarmCursorRadiusValue, `${rounded(deps.swarmCursorRadiusInput.value)} px`);
    dispatchSwarmSettingChange("cursorRadiusChanged", { value: Number(deps.swarmCursorRadiusInput.value) });
  });

  deps.swarmHawkEnabledToggle.addEventListener("change", () => {
    dispatchSwarmSettingChange("hawkEnabledChanged", {
      value: deps.swarmHawkEnabledToggle.checked,
    });
  });

  deps.swarmHawkCountInput.addEventListener("input", () => {
    setText(deps.swarmHawkCountValue, rounded(deps.swarmHawkCountInput.value));
    dispatchSwarmSettingChange("hawkCountChanged", {
      value: Number(deps.swarmHawkCountInput.value),
    });
  });

  deps.swarmHawkColorInput.addEventListener("input", () => dispatchSwarmSettingChange("hawkColorChanged", { value: deps.swarmHawkColorInput.value }));
  deps.swarmHawkSpeedInput.addEventListener("input", () => {
    setText(deps.swarmHawkSpeedValue, `${rounded(deps.swarmHawkSpeedInput.value)} px/s`);
    dispatchSwarmSettingChange("hawkSpeedChanged", { value: Number(deps.swarmHawkSpeedInput.value) });
  });
  deps.swarmHawkSteeringInput.addEventListener("input", () => {
    setText(deps.swarmHawkSteeringValue, `${rounded(deps.swarmHawkSteeringInput.value)} px/s^2`);
    dispatchSwarmSettingChange("hawkSteeringChanged", { value: Number(deps.swarmHawkSteeringInput.value) });
  });
  deps.swarmHawkTargetRangeInput.addEventListener("input", () => {
    setText(deps.swarmHawkTargetRangeValue, `${rounded(deps.swarmHawkTargetRangeInput.value)} px`);
    dispatchSwarmSettingChange("hawkTargetRangeChanged", { value: Number(deps.swarmHawkTargetRangeInput.value) });
  });

  deps.swarmEnabledToggle.addEventListener("change", () => {
    syncFollowZoomControlsFromDom();
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

  syncFollowZoomControlsFromDom();
}
