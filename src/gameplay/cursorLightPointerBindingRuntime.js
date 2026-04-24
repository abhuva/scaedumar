import { createCursorLightPointerRuntime } from "./cursorLightPointerRuntime.js";

export function createCursorLightPointerBindingRuntime(deps) {
  const cursorLightPointerRuntime = createCursorLightPointerRuntime({
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    clearCursorLightPointerState: deps.clearCursorLightPointerState,
    clientToNdc: deps.clientToNdc,
    worldFromNdc: deps.worldFromNdc,
    worldToUv: deps.worldToUv,
    setCursorLightPointerUv: deps.setCursorLightPointerUv,
  });
  return {
    updateCursorLightFromPointer: (clientX, clientY) =>
      cursorLightPointerRuntime.updateCursorLightFromPointer(clientX, clientY),
  };
}
