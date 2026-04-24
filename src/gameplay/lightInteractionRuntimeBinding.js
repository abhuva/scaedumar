import { createCursorLightRuntimeState } from "./cursorLightState.js";
import { createCursorLightPointerStateRuntime } from "./cursorLightPointerStateRuntime.js";
import { createCursorLightPointerBindingRuntime } from "./cursorLightPointerBindingRuntime.js";
import { createCursorLightModeUiBindingRuntime } from "../ui/cursorLightModeUiBindingRuntime.js";
import { createPointLightEditorUiBindingRuntime } from "../ui/pointLightEditorUiBindingRuntime.js";

export function createLightInteractionRuntimeBinding(deps) {
  const cursorLightRuntime = createCursorLightRuntimeState({
    clamp: deps.clamp,
    hexToRgb01: deps.hexToRgb01,
    defaults: deps.cursorLightDefaults,
  });
  const cursorLightState = cursorLightRuntime.state;

  const cursorLightPointerStateRuntime = createCursorLightPointerStateRuntime({
    cursorLightRuntime,
  });

  const cursorLightPointerBindingRuntime = createCursorLightPointerBindingRuntime({
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    clearCursorLightPointerState: () => cursorLightPointerStateRuntime.clearCursorLightPointerState(),
    clientToNdc: deps.clientToNdc,
    worldFromNdc: deps.worldFromNdc,
    worldToUv: deps.worldToUv,
    setCursorLightPointerUv: (uvX, uvY) => cursorLightPointerStateRuntime.setCursorLightPointerUv(uvX, uvY),
  });

  const cursorLightModeUiBindingRuntime = createCursorLightModeUiBindingRuntime({
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    cursorLightHeightOffsetInput: deps.cursorLightHeightOffsetInput,
  });

  const pointLightEditorUiBindingRuntime = createPointLightEditorUiBindingRuntime({
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
    clearCursorLightPointerState: () => cursorLightPointerStateRuntime.clearCursorLightPointerState(),
    setCursorLightPointerUv: (uvX, uvY) => cursorLightPointerStateRuntime.setCursorLightPointerUv(uvX, uvY),
    applyCursorLightConfigSnapshot: (snapshot) => cursorLightRuntime.applyConfigSnapshot(snapshot),
    updateCursorLightFromPointer: (clientX, clientY) =>
      cursorLightPointerBindingRuntime.updateCursorLightFromPointer(clientX, clientY),
    updateCursorLightModeUi: () => cursorLightModeUiBindingRuntime.updateCursorLightModeUi(),
    updateLightEditorUi: () => pointLightEditorUiBindingRuntime.updateLightEditorUi(),
    beginLightEdit: (light) => deps.pointLightRuntime.beginLightEdit(light),
    applyDraftToSelectedPointLight: () => deps.pointLightRuntime.applyDraftToSelectedPointLight(),
    rebakeIfPointLightLiveUpdateEnabled: () => deps.pointLightRuntime.rebakeIfPointLightLiveUpdateEnabled(),
    findPointLightAtPixel: (pixelX, pixelY, radiusPx) =>
      deps.pointLightRuntime.findPointLightAtPixel(pixelX, pixelY, radiusPx),
    createPointLight: (pixelX, pixelY) => deps.pointLightRuntime.createPointLight(pixelX, pixelY),
  };
}
