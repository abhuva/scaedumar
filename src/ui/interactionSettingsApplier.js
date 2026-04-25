export function createInteractionSettingsApplier(deps) {
  return function applyInteractionSettingsLegacy() {
    const pathfinding = deps.getPathfindingStateSnapshot();
    deps.pathfindingRangeInput.value = String(pathfinding.range);
    deps.pathWeightSlopeInput.value = String(pathfinding.weightSlope);
    deps.pathWeightHeightInput.value = String(pathfinding.weightHeight);
    deps.pathWeightWaterInput.value = String(pathfinding.weightWater);
    deps.pathSlopeCutoffInput.value = String(pathfinding.slopeCutoff);
    deps.pathBaseCostInput.value = String(pathfinding.baseCost);

    deps.updatePathfindingRangeLabel();
    deps.updatePathWeightLabels();
    deps.updatePathSlopeCutoffLabel();
    deps.updatePathBaseCostLabel();

    const cursorLight = deps.getCursorLightSnapshot();
    deps.applyCursorLightConfigSnapshot(cursorLight);
    deps.cursorLightModeToggle.checked = deps.cursorLightState.enabled;
    deps.cursorLightFollowHeightToggle.checked = deps.cursorLightState.useTerrainHeight;
    deps.cursorLightColorInput.value = deps.cursorLightState.colorHex;
    deps.cursorLightStrengthInput.value = String(deps.cursorLightState.strength);
    deps.cursorLightHeightOffsetInput.value = String(deps.cursorLightState.heightOffset);
    deps.cursorLightGizmoToggle.checked = deps.cursorLightState.showGizmo;
    deps.pointLightLiveUpdateToggle.checked = deps.isPointLightLiveUpdateEnabled();
    deps.updateCursorLightStrengthLabel();
    deps.updateCursorLightHeightOffsetLabel();
    deps.updateCursorLightModeUi();
  };
}
