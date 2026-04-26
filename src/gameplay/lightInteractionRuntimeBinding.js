import { createCursorLightRuntimeState } from "./cursorLightState.js";
import { createCursorLightPointerRuntime } from "./cursorLightPointerRuntime.js";
import { createCursorLightModeUiRuntime } from "../ui/cursorLightModeUiRuntime.js";
import { createPointLightEditorRuntime } from "../ui/pointLightEditorRuntime.js";

export function createLightInteractionRuntimeBinding(deps) {
  const cursorLightRuntime = createCursorLightRuntimeState({
    clamp: deps.clamp,
    hexToRgb01: deps.hexToRgb01,
    defaults: deps.cursorLightDefaults,
  });
  const cursorLightState = cursorLightRuntime.state;

  const cursorLightPointerRuntime = createCursorLightPointerRuntime({
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    clearCursorLightPointerState: () => cursorLightRuntime.clearPointer(),
    clientToNdc: deps.clientToNdc,
    worldFromNdc: deps.worldFromNdc,
    worldToUv: deps.worldToUv,
    setCursorLightPointerUv: (uvX, uvY) => cursorLightRuntime.setPointerUv(uvX, uvY),
  });

  const cursorLightModeUiRuntime = createCursorLightModeUiRuntime({
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    cursorLightHeightOffsetInput: deps.cursorLightHeightOffsetInput,
  });

  const pointLightEditorUiRuntime = createPointLightEditorRuntime({
    syncPointLightEditorUi: deps.syncPointLightEditorUi,
    getSelectedPointLight: deps.getSelectedPointLight,
    getLightEditDraft: deps.getLightEditDraft,
    lightEditorEmptyEl: deps.lightEditorEmptyEl,
    lightEditorFieldsEl: deps.lightEditorFieldsEl,
    lightCoordEl: deps.lightCoordEl,
    pointLightColorInput: deps.pointLightColorInput,
    pointLightStrengthInput: deps.pointLightStrengthInput,
    pointLightIntensityInput: deps.pointLightIntensityInput,
    pointLightHeightOffsetInput: deps.pointLightHeightOffsetInput,
    pointLightFlickerInput: deps.pointLightFlickerInput,
    pointLightFlickerSpeedInput: deps.pointLightFlickerSpeedInput,
    rgbToHex: deps.rgbToHex,
    clamp: deps.clamp,
    updatePointLightStrengthLabel: deps.updatePointLightStrengthLabel,
    updatePointLightIntensityLabel: deps.updatePointLightIntensityLabel,
    updatePointLightHeightOffsetLabel: deps.updatePointLightHeightOffsetLabel,
    updatePointLightFlickerLabel: deps.updatePointLightFlickerLabel,
    updatePointLightFlickerSpeedLabel: deps.updatePointLightFlickerSpeedLabel,
  });

  return {
    cursorLightState,
    clearCursorLightPointerState: () => cursorLightRuntime.clearPointer(),
    setCursorLightPointerUv: (uvX, uvY) => cursorLightRuntime.setPointerUv(uvX, uvY),
    applyCursorLightConfigSnapshot: (snapshot) => cursorLightRuntime.applyConfigSnapshot(snapshot),
    updateCursorLightFromPointer: (clientX, clientY) =>
      cursorLightPointerRuntime.updateCursorLightFromPointer(clientX, clientY),
    updateCursorLightModeUi: () => cursorLightModeUiRuntime.updateCursorLightModeUi(),
    updateLightEditorUi: () => pointLightEditorUiRuntime.updateLightEditorUi(),
    beginLightEdit: (light) => deps.getPointLightRuntime().beginLightEdit(light),
    applyDraftToSelectedPointLight: () => deps.getPointLightRuntime().applyDraftToSelectedPointLight(),
    rebakeIfPointLightLiveUpdateEnabled: () => deps.getPointLightRuntime().rebakeIfPointLightLiveUpdateEnabled(),
    findPointLightAtPixel: (pixelX, pixelY, radiusPx) =>
      deps.getPointLightRuntime().findPointLightAtPixel(pixelX, pixelY, radiusPx),
    createPointLight: (pixelX, pixelY) => deps.getPointLightRuntime().createPointLight(pixelX, pixelY),
  };
}
