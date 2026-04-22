export function bindCanvasControls(deps) {
  deps.canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      deps.dispatchCoreCommand({
        type: "core/camera/zoomAtClient",
        clientX: e.clientX,
        clientY: e.clientY,
        deltaY: e.deltaY,
      });
    },
    { passive: false },
  );

  deps.canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 1) return;
    e.preventDefault();
    deps.dispatchCoreCommand({
      type: "core/camera/beginMiddleDrag",
      clientX: e.clientX,
      clientY: e.clientY,
    });
  });

  deps.windowEl.addEventListener("mouseup", (e) => {
    if (e.button !== 1) return;
    deps.dispatchCoreCommand({ type: "core/camera/endMiddleDrag" });
  });

  deps.canvas.addEventListener("mousemove", (e) => {
    deps.updateSwarmCursorFromPointer(e.clientX, e.clientY);
    deps.updateCursorLightFromPointer(e.clientX, e.clientY);
    deps.updatePathPreviewFromPointer(e.clientX, e.clientY);
    if (!deps.isMiddleDragging()) {
      if (deps.cursorLightModeToggle.checked || deps.getInteractionMode() === "pathfinding") {
        deps.requestOverlayDraw();
      }
      return;
    }
    deps.dispatchCoreCommand({
      type: "core/camera/dragToClient",
      clientX: e.clientX,
      clientY: e.clientY,
    });
  });

  deps.canvas.addEventListener("click", (e) => {
    if (e.button !== 0) return;
    const ndc = deps.clientToNdc(e.clientX, e.clientY);
    const world = deps.worldFromNdc(ndc);
    const uv = deps.worldToUv(world);
    if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
      return;
    }

    const pixel = deps.uvToMapPixelIndex(uv);
    deps.dispatchCoreCommand({
      type: "core/interaction/clickMapPixel",
      x: pixel.x,
      y: pixel.y,
    });
  });

  deps.canvas.addEventListener("auxclick", (e) => {
    if (e.button === 1) e.preventDefault();
  });

  deps.canvas.addEventListener("mouseleave", () => {
    deps.dispatchCoreCommand({ type: "core/canvas/leave" });
  });
}
