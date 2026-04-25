import { createOverlayAnimationRuntime } from "./overlays/overlayAnimationRuntime.js";
import { createOverlayHooksRuntime } from "./overlays/overlayHooksRuntime.js";
import { createOverlayDrawerRuntime } from "./overlays/overlayDrawerRuntime.js";

export function createOverlaySetupRuntime(deps) {
  const overlayAnimationRuntime = createOverlayAnimationRuntime({
    isSwarmEnabled: deps.isSwarmEnabled,
    getSwarmSettings: deps.getSwarmSettings,
    swarmCursorState: deps.swarmCursorState,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
  });

  const drawOverlay = createOverlayDrawerRuntime({
    overlayCtx: deps.overlayCtx,
    overlayCanvas: deps.overlayCanvas,
    getMapAspect: deps.getMapAspect,
    splatSize: deps.splatSize,
    getInteractionMode: deps.getInteractionMode,
    getLightEditDraft: deps.getLightEditDraft,
    getPointLights: deps.getPointLights,
    isPointLightSelected: deps.isPointLightSelected,
    mapPixelToWorld: deps.mapPixelToWorld,
    worldToScreen: deps.worldToScreen,
    clamp: deps.clamp,
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    cursorLightState: deps.cursorLightState,
    movePreviewState: deps.movePreviewState,
    playerState: deps.playerState,
    isSwarmEnabled: deps.isSwarmEnabled,
    getSwarmSettings: deps.getSwarmSettings,
    drawSwarmUnlitOverlay: deps.drawSwarmUnlitOverlay,
    drawSwarmGizmos: deps.drawSwarmGizmos,
  });

  const overlayHooks = createOverlayHooksRuntime({
    updateSwarm: deps.updateSwarm,
    updateSwarmFollowCamera: deps.updateSwarmFollowCamera,
    drawOverlay,
    shouldAnimateOverlay: () => overlayAnimationRuntime.shouldAnimateOverlay(),
    isOverlayDirty: deps.isOverlayDirty,
    clearOverlayDirty: deps.clearOverlayDirty,
  });

  return {
    drawOverlay,
    overlayHooks,
  };
}
