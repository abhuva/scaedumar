export function createPointLightEditorRuntime(deps) {
  function beginLightEdit(light) {
    deps.pointLightEditorController.beginLightEdit(light);
  }

  function applyDraftToSelectedPointLight() {
    return deps.pointLightEditorController.applyDraftToSelectedPointLight();
  }

  function rebakeIfPointLightLiveUpdateEnabled() {
    deps.pointLightEditorController.rebakeIfPointLightLiveUpdateEnabled();
  }

  function findPointLightAtPixel(pixelX, pixelY, radiusPx) {
    return deps.pointLightEditorController.findPointLightAtPixel(pixelX, pixelY, radiusPx);
  }

  function createPointLight(pixelX, pixelY) {
    deps.pointLightEditorController.createPointLight(pixelX, pixelY);
  }

  function deletePointLightById(id) {
    deps.pointLightEditorController.deletePointLightById(id);
  }

  return {
    beginLightEdit,
    applyDraftToSelectedPointLight,
    rebakeIfPointLightLiveUpdateEnabled,
    findPointLightAtPixel,
    createPointLight,
    deletePointLightById,
  };
}
