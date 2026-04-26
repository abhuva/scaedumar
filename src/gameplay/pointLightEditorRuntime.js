export function createPointLightEditorRuntime(deps) {
  return {
    beginLightEdit: deps.pointLightEditorController.beginLightEdit.bind(deps.pointLightEditorController),
    applyDraftToSelectedPointLight: deps.pointLightEditorController.applyDraftToSelectedPointLight.bind(deps.pointLightEditorController),
    rebakeIfPointLightLiveUpdateEnabled: deps.pointLightEditorController.rebakeIfPointLightLiveUpdateEnabled.bind(deps.pointLightEditorController),
    findPointLightAtPixel: deps.pointLightEditorController.findPointLightAtPixel.bind(deps.pointLightEditorController),
    createPointLight: deps.pointLightEditorController.createPointLight.bind(deps.pointLightEditorController),
    deletePointLightById: deps.pointLightEditorController.deletePointLightById.bind(deps.pointLightEditorController),
  };
}
