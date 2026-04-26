export function createCursorLightPointerRuntime(deps) {
  function updateCursorLightFromPointer(clientX, clientY) {
    if (!deps.getCursorLightSnapshot().enabled) {
      deps.clearCursorLightPointerState();
      return;
    }
    const ndc = deps.clientToNdc(clientX, clientY);
    const world = deps.worldFromNdc(ndc);
    const uv = deps.worldToUv(world);
    const inside = uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1;
    if (!inside) {
      deps.clearCursorLightPointerState();
      return;
    }
    deps.setCursorLightPointerUv(uv.x, uv.y);
  }

  return {
    updateCursorLightFromPointer,
  };
}
