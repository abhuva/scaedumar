import { createPointLightEditorState } from "./pointLightEditorState.js";
import { createPointLightDraftRuntime } from "./pointLightDraftRuntime.js";
import { createPointLightEditorController } from "./pointLightEditorController.js";
import { createPointLightEditorRuntime } from "./pointLightEditorRuntime.js";
import { createPointLightSelectionRuntime } from "./pointLightSelectionRuntime.js";
import { createPointLightIoRuntime } from "./pointLightIoRuntime.js";

export function createPointLightRuntime(deps) {
  const pointLightEditorState = createPointLightEditorState({
    clamp: deps.clamp,
    defaultFlicker: deps.defaultFlicker,
    defaultFlickerSpeed: deps.defaultFlickerSpeed,
  });

  const pointLightDraftRuntime = createPointLightDraftRuntime({
    pointLightEditorState,
  });

  const pointLightEditorController = createPointLightEditorController({
    pointLights: deps.pointLights,
    editorState: pointLightEditorState,
    selectRadiusPx: deps.selectRadiusPx,
    defaultFlicker: deps.defaultFlicker,
    defaultFlickerSpeed: deps.defaultFlickerSpeed,
    nextLightId: deps.nextLightId,
    hexToRgb01: deps.hexToRgb01,
    bakePointLightsTexture: deps.bakePointLightsTexture,
    schedulePointLightBake: deps.schedulePointLightBake,
    isPointLightLiveUpdateEnabled: deps.isPointLightLiveUpdateEnabled,
    onSelectionChanged: deps.onSelectionChanged,
    setStatus: deps.setStatus,
  });

  const pointLightEditorRuntime = createPointLightEditorRuntime({
    pointLightEditorController,
  });

  const pointLightSelectionRuntime = createPointLightSelectionRuntime({
    pointLightEditorController,
  });

  const pointLightIoRuntime = createPointLightIoRuntime({
    pointLights: deps.pointLights,
    splatSize: deps.splatSize,
    clamp: deps.clamp,
    defaultFlicker: deps.defaultFlicker,
    defaultFlickerSpeed: deps.defaultFlickerSpeed,
    parsePointLightsPayload: deps.parsePointLightsPayload,
    serializePointLightsPayload: deps.serializePointLightsPayload,
    nextPointLightId: deps.nextLightId,
    clearLightEditSelection: () => pointLightSelectionRuntime.clearLightEditSelection(),
    bakePointLightsTexture: deps.bakePointLightsTexture,
    updateLightEditorUi: deps.updateLightEditorUi,
    requestOverlayDraw: deps.requestOverlayDraw,
    setStatus: deps.setStatus,
    tauriInvoke: deps.tauriInvoke,
    isAbsoluteFsPath: deps.isAbsoluteFsPath,
    joinFsPath: deps.joinFsPath,
    invokeTauri: deps.invokeTauri,
    showSaveFilePicker: deps.showSaveFilePicker,
    normalizeMapFolderPath: deps.normalizeMapFolderPath,
    downloadTextFile: deps.downloadTextFile,
    getCurrentMapFolderPath: deps.getCurrentMapFolderPath,
    tryLoadJsonFromUrl: deps.tryLoadJsonFromUrl,
    clearPointLightsLoadInput: deps.clearPointLightsLoadInput,
    openPointLightsLoadInput: deps.openPointLightsLoadInput,
    setSaveButtonText: deps.setSaveButtonText,
    syncPointLightsStateToStore: deps.syncPointLightsStateToStore,
    setTimeout: deps.setTimeout,
    clearTimeout: deps.clearTimeout,
  });

  return {
    getSelectedPointLight: () => pointLightSelectionRuntime.getSelectedPointLight(),
    clearLightEditSelection: () => pointLightSelectionRuntime.clearLightEditSelection(),
    setLightEditSelection: (light) => pointLightSelectionRuntime.setLightEditSelection(light),
    hasLightEditDraft: () => pointLightDraftRuntime.hasLightEditDraft(),
    setLightEditDraftColor: (value) => pointLightDraftRuntime.setLightEditDraftColor(value),
    setLightEditDraftStrength: (value) => pointLightDraftRuntime.setLightEditDraftStrength(value),
    setLightEditDraftIntensity: (value) => pointLightDraftRuntime.setLightEditDraftIntensity(value),
    setLightEditDraftHeightOffset: (value) => pointLightDraftRuntime.setLightEditDraftHeightOffset(value),
    setLightEditDraftFlicker: (value) => pointLightDraftRuntime.setLightEditDraftFlicker(value),
    setLightEditDraftFlickerSpeed: (value) => pointLightDraftRuntime.setLightEditDraftFlickerSpeed(value),
    getDraft: () => pointLightEditorState.getDraft(),
    isSelectedLight: (light) => pointLightEditorState.isSelectedLight(light),
    beginLightEdit: (light) => pointLightEditorRuntime.beginLightEdit(light),
    applyDraftToSelectedPointLight: () => pointLightEditorRuntime.applyDraftToSelectedPointLight(),
    rebakeIfPointLightLiveUpdateEnabled: () => pointLightEditorRuntime.rebakeIfPointLightLiveUpdateEnabled(),
    findPointLightAtPixel: (pixelX, pixelY, radiusPx) =>
      pointLightEditorRuntime.findPointLightAtPixel(pixelX, pixelY, radiusPx),
    createPointLight: (pixelX, pixelY) => pointLightEditorRuntime.createPointLight(pixelX, pixelY),
    deletePointLightById: (id) => pointLightEditorRuntime.deletePointLightById(id),
    clearPointLights: () => pointLightIoRuntime.clearPointLights(),
    resetPointLightsSaveConfirmation: () => pointLightIoRuntime.resetPointLightsSaveConfirmation(),
    armPointLightsSaveConfirmation: () => pointLightIoRuntime.armPointLightsSaveConfirmation(),
    serializePointLights: () => pointLightIoRuntime.serializePointLights(),
    applyLoadedPointLights: (rawData, sourceLabel, options = {}) =>
      pointLightIoRuntime.applyLoadedPointLights(rawData, sourceLabel, options),
    isPointLightsSaveConfirmArmed: () => pointLightIoRuntime.isPointLightsSaveConfirmArmed(),
    savePointLightsJson: () => pointLightIoRuntime.savePointLightsJson(),
    loadPointLightsFromAssetsOrPrompt: () => pointLightIoRuntime.loadPointLightsFromAssetsOrPrompt(),
  };
}
