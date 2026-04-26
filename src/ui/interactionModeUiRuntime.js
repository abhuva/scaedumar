export function createInteractionModeUiRuntime(deps) {
  function syncInteractionModeUi(mode) {
    const isLighting = mode === "lighting";
    const isPathfinding = mode === "pathfinding";
    if (deps.dockLightingModeToggle) {
      deps.dockLightingModeToggle.classList.toggle("active", isLighting);
      deps.dockLightingModeToggle.setAttribute("aria-pressed", isLighting ? "true" : "false");
    }
    if (deps.dockPathfindingModeToggle) {
      deps.dockPathfindingModeToggle.classList.toggle("active", isPathfinding);
      deps.dockPathfindingModeToggle.setAttribute("aria-pressed", isPathfinding ? "true" : "false");
    }
  }

  return {
    syncInteractionModeUi,
  };
}
