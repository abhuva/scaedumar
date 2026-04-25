export function createLightLabelRuntime(deps) {
  function updatePointLightStrengthLabel(value = null) {
    const rawValue = value == null ? deps.pointLightStrengthInput.value : value;
    const nextValue = Math.round(deps.clamp(Number(rawValue), 1, 200));
    deps.pointLightStrengthValue.textContent = `${nextValue} px`;
  }

  function updatePointLightIntensityLabel(value = null) {
    const rawValue = value == null ? deps.pointLightIntensityInput.value : value;
    const nextValue = deps.clamp(Number(rawValue), 0, 4);
    deps.pointLightIntensityValue.textContent = `${nextValue.toFixed(2)}x`;
  }

  function updatePointLightHeightOffsetLabel(value = null) {
    const rawValue = value == null ? deps.pointLightHeightOffsetInput.value : value;
    const nextValue = Math.round(deps.clamp(Number(rawValue), -120, 240));
    deps.pointLightHeightOffsetValue.textContent = `${nextValue} px`;
  }

  function updatePointLightFlickerLabel(value = null) {
    const rawValue = value == null ? deps.pointLightFlickerInput.value : value;
    const nextValue = deps.clamp(Number(rawValue), 0, 1);
    deps.pointLightFlickerValue.textContent = nextValue.toFixed(2);
  }

  function updatePointLightFlickerSpeedLabel(value = null) {
    const rawValue = value == null ? deps.pointLightFlickerSpeedInput.value : value;
    const nextValue = deps.clamp(Number(rawValue), 0, 1);
    deps.pointLightFlickerSpeedValue.textContent = nextValue.toFixed(2);
  }

  function updateCursorLightStrengthLabel() {
    const value = Math.round(deps.clamp(Number(deps.getCursorLightSnapshot().strength), 1, 200));
    deps.cursorLightStrengthValue.textContent = `${value} px`;
  }

  function updateCursorLightHeightOffsetLabel() {
    const value = Math.round(deps.clamp(Number(deps.getCursorLightSnapshot().heightOffset), 0, 120));
    deps.cursorLightHeightOffsetValue.textContent = `${value} px`;
  }

  return {
    updatePointLightStrengthLabel,
    updatePointLightIntensityLabel,
    updatePointLightHeightOffsetLabel,
    updatePointLightFlickerLabel,
    updatePointLightFlickerSpeedLabel,
    updateCursorLightStrengthLabel,
    updateCursorLightHeightOffsetLabel,
  };
}
