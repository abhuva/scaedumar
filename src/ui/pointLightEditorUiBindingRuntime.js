import { createPointLightEditorRuntime } from "./pointLightEditorRuntime.js";

export function createPointLightEditorUiBindingRuntime(deps) {
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
    updateLightEditorUi: () => pointLightEditorUiRuntime.updateLightEditorUi(),
  };
}
