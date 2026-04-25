export function setInteractionMode(deps, mode) {
  const requestedMode = mode === "lighting" || mode === "pathfinding" ? mode : "none";
  const nextMode = deps.canUseInteractionInCurrentMode(requestedMode) ? requestedMode : "none";
  deps.dockLightingModeToggle.classList.toggle("active", nextMode === "lighting");
  deps.dockPathfindingModeToggle.classList.toggle("active", nextMode === "pathfinding");
  deps.dockLightingModeToggle.setAttribute("aria-pressed", nextMode === "lighting" ? "true" : "false");
  deps.dockPathfindingModeToggle.setAttribute("aria-pressed", nextMode === "pathfinding" ? "true" : "false");
  if (nextMode !== "pathfinding") {
    deps.movePreviewState.hoverPixel = null;
    deps.movePreviewState.pathPixels = [];
  }
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      interactionMode: nextMode,
    },
  }));
  deps.requestOverlayDraw();
}
