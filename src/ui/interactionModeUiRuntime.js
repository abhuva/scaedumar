export function createInteractionModeUiRuntime(deps) {
  function syncInteractionModeUi(mode) {
    const isLighting = mode === "lighting";
    if (deps.pointLightGizmoToggle) {
      deps.pointLightGizmoToggle.checked = isLighting;
    }
  }

  return {
    syncInteractionModeUi,
  };
}
