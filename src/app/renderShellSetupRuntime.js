import { createOverlaySetupRuntime } from "../ui/overlaySetupRuntime.js";
import { resizeViewport } from "../render/viewportRuntime.js";
import { createFrameRuntime } from "../render/frameRuntime.js";

export function createRenderShellSetupRuntime(deps) {
  function requestOverlayDraw() {
    deps.overlayDirtyRuntime.requestOverlayDraw();
  }

  const { drawOverlay, overlayHooks } = createOverlaySetupRuntime({
    ...deps.overlay,
    isOverlayDirty: () => deps.overlayDirtyRuntime.isOverlayDirty(),
    clearOverlayDirty: () => deps.overlayDirtyRuntime.clearOverlayDirty(),
  });

  function resize() {
    resizeViewport({
      getDevicePixelRatio: () => deps.windowEl.devicePixelRatio || 1,
      getWindowInnerWidth: () => deps.windowEl.innerWidth,
      getWindowInnerHeight: () => deps.windowEl.innerHeight,
      canvas: deps.canvas,
      overlayCanvas: deps.overlayCanvas,
      gl: deps.gl,
      requestOverlayDraw,
    });
  }

  let frameRuntime = null;
  function getFrameRuntime() {
    if (frameRuntime) return frameRuntime;
    frameRuntime = createFrameRuntime({
      ...deps.frameLoop,
      resize,
      overlayHooks,
      requestAnimationFrame: (cb) => deps.windowEl.requestAnimationFrame(cb),
      renderCallback: render,
    });
    return frameRuntime;
  }

  function render(nowMs) {
    getFrameRuntime().render(nowMs);
  }

  return {
    drawOverlay,
    overlayHooks,
    requestOverlayDraw,
    resize,
    render,
    getFrameLoopBindingRuntime: getFrameRuntime,
  };
}
