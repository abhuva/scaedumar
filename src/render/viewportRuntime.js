export function resizeViewport(deps) {
  const dpr = Math.min(deps.getDevicePixelRatio(), 2);
  const w = Math.floor(deps.getWindowInnerWidth() * dpr);
  const h = Math.floor(deps.getWindowInnerHeight() * dpr);
  let overlayResized = false;
  if (deps.canvas.width !== w || deps.canvas.height !== h) {
    deps.canvas.width = w;
    deps.canvas.height = h;
  }
  if (deps.overlayCanvas.width !== w || deps.overlayCanvas.height !== h) {
    deps.overlayCanvas.width = w;
    deps.overlayCanvas.height = h;
    overlayResized = true;
  }
  deps.gl.viewport(0, 0, deps.canvas.width, deps.canvas.height);
  if (overlayResized) {
    deps.requestOverlayDraw();
  }
}
