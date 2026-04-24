import { bindCanvasControls } from "./bindings/canvasBinding.js";

export function bindCanvasRuntime(deps) {
  bindCanvasControls({
    canvas: deps.canvas,
    windowEl: deps.windowEl,
    dispatchCoreCommand: deps.dispatchCoreCommand,
    updateSwarmCursorFromPointer: deps.updateSwarmCursorFromPointer,
    updateCursorLightFromPointer: deps.updateCursorLightFromPointer,
    updatePathPreviewFromPointer: deps.updatePathPreviewFromPointer,
    isMiddleDragging: deps.isMiddleDragging,
    isCursorLightEnabled: deps.isCursorLightEnabled,
    getInteractionMode: deps.getInteractionMode,
    requestOverlayDraw: deps.requestOverlayDraw,
    clientToNdc: deps.clientToNdc,
    worldFromNdc: deps.worldFromNdc,
    worldToUv: deps.worldToUv,
    uvToMapPixelIndex: deps.uvToMapPixelIndex,
    swarmCursorState: deps.swarmCursorState,
    cursorLightState: deps.cursorLightState,
    movePreviewState: deps.movePreviewState,
  });
}
