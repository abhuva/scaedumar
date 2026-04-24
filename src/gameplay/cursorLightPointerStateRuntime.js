export function createCursorLightPointerStateRuntime(deps) {
  function clearCursorLightPointerState() {
    deps.cursorLightRuntime.clearPointer();
  }

  function setCursorLightPointerUv(uvX, uvY) {
    deps.cursorLightRuntime.setPointerUv(uvX, uvY);
  }

  return {
    clearCursorLightPointerState,
    setCursorLightPointerUv,
  };
}
