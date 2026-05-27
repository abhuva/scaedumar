export function createInteractionModeUiRuntime(deps) {
  function syncInteractionModeUi(mode) {
    const isLighting = mode === "lighting";
    const isPathfinding = mode === "pathfinding";
    const isRoutePlanning = mode === "routePlanning";
    if (deps.dockLightingModeToggle) {
      deps.dockLightingModeToggle.classList.toggle("active", isLighting);
      deps.dockLightingModeToggle.setAttribute("aria-pressed", isLighting ? "true" : "false");
    }
    if (deps.pointLightGizmoToggle) {
      deps.pointLightGizmoToggle.checked = isLighting;
    }
    if (deps.dockPathfindingModeToggle) {
      deps.dockPathfindingModeToggle.classList.toggle("active", isPathfinding);
      deps.dockPathfindingModeToggle.setAttribute("aria-pressed", isPathfinding ? "true" : "false");
    }
    if (deps.dockRoutePlanningModeToggle) {
      deps.dockRoutePlanningModeToggle.classList.toggle("active", isRoutePlanning);
      deps.dockRoutePlanningModeToggle.setAttribute("aria-pressed", isRoutePlanning ? "true" : "false");
    }
  }

  return {
    syncInteractionModeUi,
  };
}
