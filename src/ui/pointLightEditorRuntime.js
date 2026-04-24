export function createPointLightEditorRuntime(deps) {
  function updateLightEditorUi() {
    deps.syncPointLightEditorUi({
      selectedLight: deps.getSelectedPointLight(),
      lightEditDraft: deps.getLightEditDraft(),
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
  }

  return {
    updateLightEditorUi,
  };
}
