import { createCursorLightModeUiRuntime } from "./cursorLightModeUiRuntime.js";

export function createCursorLightModeUiBindingRuntime(deps) {
  const cursorLightModeUiRuntime = createCursorLightModeUiRuntime({
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    cursorLightHeightOffsetInput: deps.cursorLightHeightOffsetInput,
  });
  return {
    updateCursorLightModeUi: () => cursorLightModeUiRuntime.updateCursorLightModeUi(),
  };
}
