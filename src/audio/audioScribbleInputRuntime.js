export function createAudioScribbleInputRuntime(deps) {
  let isPointerDown = false;
  let redrawFrameId = null;

  function scheduleRedraw() {
    if (redrawFrameId !== null) return;
    redrawFrameId = requestAnimationFrame(() => {
      redrawFrameId = null;
      deps.redraw();
    });
  }

  function canvasToGrid(event) {
    const rect = deps.canvas.getBoundingClientRect();
    const xNorm = (event.clientX - rect.left) / Math.max(1, rect.width);
    const yNorm = 1 - ((event.clientY - rect.top) / Math.max(1, rect.height));
    return {
      x: Math.round(xNorm * (deps.scribble.widthBins - 1)),
      y: Math.round(yNorm * (deps.scribble.heightBins - 1)),
    };
  }

  function paint(event) {
    if (!deps.getStft()) return;
    const point = canvasToGrid(event);
    const settings = deps.getSettings();
    deps.scribble.paintAt(
      point.x,
      point.y,
      settings.brushSize,
      settings.brushStrength,
      event.buttons === 2 || Boolean(settings.eraseMode),
    );
    scheduleRedraw();
  }

  function bind() {
    deps.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    deps.canvas.addEventListener("pointerdown", (event) => {
      isPointerDown = true;
      deps.canvas.setPointerCapture(event.pointerId);
      paint(event);
    });
    deps.canvas.addEventListener("pointermove", (event) => {
      if (!isPointerDown) return;
      paint(event);
    });
    deps.canvas.addEventListener("pointerup", (event) => {
      isPointerDown = false;
      if (deps.canvas.hasPointerCapture(event.pointerId)) {
        deps.canvas.releasePointerCapture(event.pointerId);
      }
    });
    deps.canvas.addEventListener("pointercancel", () => {
      isPointerDown = false;
    });
  }

  return {
    bind,
  };
}
