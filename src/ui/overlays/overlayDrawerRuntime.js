import { createOverlayDrawer } from "./drawOverlay.js";

export function createOverlayDrawerRuntime(deps) {
  return createOverlayDrawer({
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
}
