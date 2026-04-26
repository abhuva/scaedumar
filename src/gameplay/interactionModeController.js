import { setInteractionModeState } from "./stateSync.js";

export function setInteractionMode(deps, mode) {
  const requestedMode = mode === "lighting" || mode === "pathfinding" ? mode : "none";
  const nextMode = deps.canUseInteractionInCurrentMode(requestedMode) ? requestedMode : "none";
  deps.syncInteractionModeUi(nextMode);
  if (nextMode !== "pathfinding") {
    deps.movePreviewState.hoverPixel = null;
    deps.movePreviewState.pathPixels = [];
  }
  setInteractionModeState({
    store: deps.store,
    interactionMode: nextMode,
  });
  deps.requestOverlayDraw();
}
