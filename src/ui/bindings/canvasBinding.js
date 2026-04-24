export function bindCanvasControls(deps) {
  function isInsideCanvas(clientX, clientY) {
    const rect = deps.canvas.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  function isUiTarget(target) {
    if (!target || typeof target.closest !== "function") return false;
    return Boolean(target.closest(".topic-dock, .topic-panel, .swarm-stats-panel"));
  }

  function handlePointerMove(clientX, clientY) {
    deps.updateSwarmCursorFromPointer(clientX, clientY);
    deps.updateCursorLightFromPointer(clientX, clientY);
    deps.updatePathPreviewFromPointer(clientX, clientY);
    if (!deps.isMiddleDragging()) {
      if (deps.isCursorLightEnabled() || deps.getInteractionMode() === "pathfinding") {
        deps.requestOverlayDraw();
      }
      return;
    }
    deps.dispatchCoreCommand({
      type: "core/camera/dragToClient",
      clientX,
      clientY,
    });
  }

  function handleMapClick(clientX, clientY, button) {
    if (button !== 0) return;
    const ndc = deps.clientToNdc(clientX, clientY);
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
  }

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

  deps.canvas.addEventListener("pointerdown", (e) => {
    if (e.button === 0) {
      handleMapClick(e.clientX, e.clientY, e.button);
      return;
    }
    if (e.button !== 1) return;
    e.preventDefault();
    deps.dispatchCoreCommand({
      type: "core/camera/beginMiddleDrag",
      clientX: e.clientX,
      clientY: e.clientY,
    });
  });

  deps.windowEl.addEventListener("pointerup", (e) => {
    if (e.button !== 1) return;
    deps.dispatchCoreCommand({ type: "core/camera/endMiddleDrag" });
  });

  deps.canvas.addEventListener("pointermove", (e) => {
    handlePointerMove(e.clientX, e.clientY);
  });

  deps.canvas.addEventListener("auxclick", (e) => {
    if (e.button === 1) e.preventDefault();
  });

  deps.canvas.addEventListener("pointerleave", () => {
    deps.dispatchCoreCommand({ type: "core/canvas/leave" });
  });

  // Fallback: some layouts/overlays can prevent direct canvas event targeting.
  deps.windowEl.addEventListener("pointermove", (e) => {
    if (e.target === deps.canvas) return;
    if (isUiTarget(e.target)) return;
    if (!isInsideCanvas(e.clientX, e.clientY)) return;
    handlePointerMove(e.clientX, e.clientY);
  }, true);

  deps.windowEl.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (e.target === deps.canvas) return;
    if (isUiTarget(e.target)) return;
    if (!isInsideCanvas(e.clientX, e.clientY)) return;
    handleMapClick(e.clientX, e.clientY, e.button);
  }, true);
}
