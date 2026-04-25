export function updatePointLightEditorUi(deps) {
  const selected = deps.selectedLight;
  const draft = deps.lightEditDraft;
  if (!selected || !draft) {
    deps.lightEditorEmptyEl.style.display = "block";
    deps.lightEditorFieldsEl.classList.remove("active");
    deps.lightCoordEl.textContent = "Coord: (-, -)";
    return;
  }

  deps.lightEditorEmptyEl.style.display = "none";
  deps.lightEditorFieldsEl.classList.add("active");
  deps.lightCoordEl.textContent = `Coord: (${selected.pixelX}, ${selected.pixelY})`;
  deps.pointLightColorInput.value = deps.rgbToHex(draft.color);
  const clampedStrength = deps.clamp(draft.strength, 1, 200);
  const clampedIntensity = deps.clamp(draft.intensity, 0, 4);
  const clampedHeightOffset = deps.clamp(draft.heightOffset, -120, 240);
  const clampedFlicker = deps.clamp(draft.flicker, 0, 1);
  const clampedFlickerSpeed = deps.clamp(draft.flickerSpeed, 0, 1);
  deps.pointLightStrengthInput.value = String(Math.round(clampedStrength));
  deps.pointLightIntensityInput.value = String(clampedIntensity);
  deps.pointLightHeightOffsetInput.value = String(Math.round(clampedHeightOffset));
  deps.pointLightFlickerInput.value = String(clampedFlicker);
  deps.pointLightFlickerSpeedInput.value = String(clampedFlickerSpeed);
  deps.updatePointLightStrengthLabel(clampedStrength);
  deps.updatePointLightIntensityLabel(clampedIntensity);
  deps.updatePointLightHeightOffsetLabel(clampedHeightOffset);
  deps.updatePointLightFlickerLabel(clampedFlicker);
  deps.updatePointLightFlickerSpeedLabel(clampedFlickerSpeed);
}
