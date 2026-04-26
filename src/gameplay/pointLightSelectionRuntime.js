export function createPointLightSelectionRuntime(deps) {
  function getSelectedPointLight() {
    return deps.pointLightEditorController.getSelectedPointLight();
  }

  function clearLightEditSelection() {
    deps.pointLightEditorController.clearLightEditSelection();
  }

  function setLightEditSelection(light) {
    deps.pointLightEditorController.setLightEditSelection(light);
  }

  return {
    getSelectedPointLight,
    clearLightEditSelection,
    setLightEditSelection,
  };
}
