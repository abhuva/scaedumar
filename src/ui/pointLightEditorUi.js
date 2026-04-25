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
  deps.pointLightStrengthInput.value = String(Math.round(draft.strength));
  const clampedIntensity = deps.clamp(draft.intensity, 0, 4);
  const clampedFlicker = deps.clamp(draft.flicker, 0, 1);
  const clampedFlickerSpeed = deps.clamp(draft.flickerSpeed, 0, 1);
  deps.pointLightIntensityInput.value = String(clampedIntensity);
  deps.pointLightHeightOffsetInput.value = String(Math.round(draft.heightOffset));
  deps.pointLightFlickerInput.value = String(clampedFlicker);
  deps.pointLightFlickerSpeedInput.value = String(clampedFlickerSpeed);
  deps.updatePointLightStrengthLabel(draft.strength);
  deps.updatePointLightIntensityLabel(clampedIntensity);
  deps.updatePointLightHeightOffsetLabel(draft.heightOffset);
  deps.updatePointLightFlickerLabel(clampedFlicker);
  deps.updatePointLightFlickerSpeedLabel(clampedFlickerSpeed);
}
