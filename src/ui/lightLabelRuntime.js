export function createLightLabelRuntime(deps) {
  function updatePointLightStrengthLabel() {
    const value = Math.round(deps.clamp(Number(deps.pointLightStrengthInput.value), 1, 200));
    deps.pointLightStrengthValue.textContent = `${value} px`;
  }

  function updatePointLightIntensityLabel() {
    const value = deps.clamp(Number(deps.pointLightIntensityInput.value), 0, 4);
    deps.pointLightIntensityValue.textContent = `${value.toFixed(2)}x`;
  }

  function updatePointLightHeightOffsetLabel() {
    const value = Math.round(deps.clamp(Number(deps.pointLightHeightOffsetInput.value), -120, 240));
    deps.pointLightHeightOffsetValue.textContent = `${value} px`;
  }

  function updatePointLightFlickerLabel() {
    const value = deps.clamp(Number(deps.pointLightFlickerInput.value), 0, 1);
    deps.pointLightFlickerValue.textContent = value.toFixed(2);
  }

  function updatePointLightFlickerSpeedLabel() {
    const value = deps.clamp(Number(deps.pointLightFlickerSpeedInput.value), 0, 1);
    deps.pointLightFlickerSpeedValue.textContent = value.toFixed(2);
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
