export function createInteractionModeRuntime(deps) {
  function setInteractionMode(mode) {
    deps.applyInteractionMode(
      {
        canUseInteractionInCurrentMode: deps.canUseInteractionInCurrentMode,
        dockLightingModeToggle: deps.dockLightingModeToggle,
        dockPathfindingModeToggle: deps.dockPathfindingModeToggle,
        movePreviewState: deps.movePreviewState,
        store: deps.store,
        requestOverlayDraw: deps.requestOverlayDraw,
      },
      mode,
    );
  }

  return {
    setInteractionMode,
  };
}
