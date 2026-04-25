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
  deps.pointLightIntensityInput.value = String(deps.clamp(draft.intensity, 0, 4));
  deps.pointLightHeightOffsetInput.value = String(Math.round(draft.heightOffset));
  deps.pointLightFlickerInput.value = String(deps.clamp(draft.flicker, 0, 1));
  deps.pointLightFlickerSpeedInput.value = String(deps.clamp(draft.flickerSpeed, 0, 1));
  deps.updatePointLightStrengthLabel();
  deps.updatePointLightIntensityLabel();
  deps.updatePointLightHeightOffsetLabel();
  deps.updatePointLightFlickerLabel();
  deps.updatePointLightFlickerSpeedLabel();
}
