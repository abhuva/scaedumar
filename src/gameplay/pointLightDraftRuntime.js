export function createPointLightDraftRuntime(deps) {
  function hasLightEditDraft() {
    return deps.pointLightEditorState.hasDraft();
  }

  function setLightEditDraftColor(value) {
    deps.pointLightEditorState.setDraftColor(value);
  }

  function setLightEditDraftStrength(value) {
    deps.pointLightEditorState.setDraftStrength(value);
  }

  function setLightEditDraftIntensity(value) {
    deps.pointLightEditorState.setDraftIntensity(value);
  }

  function setLightEditDraftHeightOffset(value) {
    deps.pointLightEditorState.setDraftHeightOffset(value);
  }

  function setLightEditDraftFlicker(value) {
    deps.pointLightEditorState.setDraftFlicker(value);
  }

  function setLightEditDraftFlickerSpeed(value) {
    deps.pointLightEditorState.setDraftFlickerSpeed(value);
  }

  return {
    hasLightEditDraft,
    setLightEditDraftColor,
    setLightEditDraftStrength,
    setLightEditDraftIntensity,
    setLightEditDraftHeightOffset,
    setLightEditDraftFlicker,
    setLightEditDraftFlickerSpeed,
  };
}
