export function createInteractionSettingsApplier(deps) {
  return function applyInteractionSettingsCompat() {
    deps.syncPathfindingSettingsUi();

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
