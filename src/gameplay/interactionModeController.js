import { setInteractionModeState } from "./stateSync.js";

export function setInteractionMode(deps, mode) {
  const requestedMode = mode === "lighting" || mode === "pathfinding" ? mode : "none";
  const nextMode = deps.canUseInteractionInCurrentMode(requestedMode) ? requestedMode : "none";
  deps.syncInteractionModeUi(nextMode);
  if (nextMode !== "pathfinding") {
    try {
      deps.travelPlanningRuntime?.clearPreview?.("interaction-mode", { emit: false });
    } catch (error) {
      console.error("Failed clearing travel preview for interaction mode:", error);
    }
  }
  setInteractionModeState({
    store: deps.store,
    interactionMode: nextMode,
  });
  deps.requestOverlayDraw();
}
