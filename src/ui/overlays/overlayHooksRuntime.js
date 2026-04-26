import { createOverlayHooks } from "./overlayHooks.js";

export function createOverlayHooksRuntime(deps) {
  return createOverlayHooks({
    updateSwarm: deps.updateSwarm,
    updateSwarmFollowCamera: deps.updateSwarmFollowCamera,
    drawOverlay: deps.drawOverlay,
    shouldAnimateOverlay: deps.shouldAnimateOverlay,
    isOverlayDirty: deps.isOverlayDirty,
    clearOverlayDirty: deps.clearOverlayDirty,
  });
}
