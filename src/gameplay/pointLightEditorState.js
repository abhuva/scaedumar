export function createPointLightEditorState(deps) {
  let selectedLightId = null;
  let lightEditDraft = null;

  function createDraft(light) {
    if (!light) return null;
    return {
      color: Array.isArray(light.color) ? [...light.color] : [1, 1, 1],
      strength: Number(light.strength) || 30,
      intensity: Number.isFinite(Number(light.intensity)) ? Number(light.intensity) : 1,
      heightOffset: Number.isFinite(Number(light.heightOffset)) ? Number(light.heightOffset) : 8,
      flicker: deps.clamp(
        Number.isFinite(Number(light.flicker)) ? Number(light.flicker) : deps.defaultFlicker,
        0,
        1,
      ),
      flickerSpeed: deps.clamp(
        Number.isFinite(Number(light.flickerSpeed)) ? Number(light.flickerSpeed) : deps.defaultFlickerSpeed,
        0,
        1,
      ),
    };
  }

  function getSelectedLight(pointLights) {
    return pointLights.find((light) => light.id === selectedLightId) || null;
  }

  function clearSelection() {
    selectedLightId = null;
    lightEditDraft = null;
  }

  function setSelection(light) {
    if (!light) {
      clearSelection();
      return;
    }
    selectedLightId = light.id;
    lightEditDraft = createDraft(light);
  }

  function hasDraft() {
    return Boolean(lightEditDraft);
  }

  function getDraft() {
    return lightEditDraft;
  }

  function mutateDraft(mutator) {
    if (!lightEditDraft || typeof mutator !== "function") return false;
    mutator(lightEditDraft);
    return true;
  }

  function applyDraftToLight(light) {
    if (!light || !lightEditDraft) return null;
    light.color = [...lightEditDraft.color];
    light.strength = Math.round(deps.clamp(lightEditDraft.strength, 1, 200));
    light.intensity = deps.clamp(Number(lightEditDraft.intensity), 0, 4);
    light.heightOffset = Math.round(deps.clamp(lightEditDraft.heightOffset, -120, 240));
    light.flicker = deps.clamp(Number(lightEditDraft.flicker), 0, 1);
    light.flickerSpeed = deps.clamp(Number(lightEditDraft.flickerSpeed), 0, 1);
    return light;
  }

  function isSelectedLight(light) {
    return Boolean(light) && light.id === selectedLightId;
  }

  return {
    getSelectedLight,
    clearSelection,
    setSelection,
    hasDraft,
    getDraft,
    mutateDraft,
    applyDraftToLight,
    isSelectedLight,
  };
}
