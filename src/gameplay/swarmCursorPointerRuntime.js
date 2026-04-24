export function createSwarmCursorPointerRuntime(deps) {
  function updateSwarmCursorFromPointer(clientX, clientY) {
    if (!deps.isSwarmEnabled()) {
      deps.swarmCursorState.active = false;
      return;
    }
    const ndc = deps.clientToNdc(clientX, clientY);
    const world = deps.worldFromNdc(ndc);
    const uv = deps.worldToUv(world);
    const inside = uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1;
    deps.swarmCursorState.active = inside;
    if (!inside) return;
    deps.swarmCursorState.x = deps.clamp(uv.x * deps.splatSize.width, 0, Math.max(0, deps.splatSize.width - 1));
    deps.swarmCursorState.y = deps.clamp((1 - uv.y) * deps.splatSize.height, 0, Math.max(0, deps.splatSize.height - 1));
  }

  return {
    updateSwarmCursorFromPointer,
  };
}
