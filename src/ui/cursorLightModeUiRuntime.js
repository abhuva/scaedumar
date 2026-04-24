export function createCursorLightModeUiRuntime(deps) {
  function updateCursorLightModeUi() {
    const followTerrain = deps.getCursorLightSnapshot().useTerrainHeight;
    deps.cursorLightHeightOffsetInput.disabled = !followTerrain;
  }

  return {
    updateCursorLightModeUi,
  };
}
