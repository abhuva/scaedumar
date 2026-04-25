import { createPointLightIoController } from "./pointLightIoController.js";

export function createPointLightIoRuntime(deps) {
  const pointLightIoController = createPointLightIoController({
    pointLights: deps.pointLights,
    splatSize: deps.splatSize,
    clamp: deps.clamp,
    defaultFlicker: deps.defaultFlicker,
    defaultFlickerSpeed: deps.defaultFlickerSpeed,
    parsePointLightsPayload: deps.parsePointLightsPayload,
    serializePointLightsPayload: deps.serializePointLightsPayload,
    nextPointLightId: deps.nextPointLightId,
    clearLightEditSelection: deps.clearLightEditSelection,
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

  function clearPointLights() {
    pointLightIoController.clearPointLights();
  }

  function resetPointLightsSaveConfirmation() {
    pointLightIoController.resetPointLightsSaveConfirmation();
  }

  function armPointLightsSaveConfirmation() {
    pointLightIoController.armPointLightsSaveConfirmation();
  }

  function serializePointLights() {
    return pointLightIoController.serializePointLights();
  }

  function applyLoadedPointLights(rawData, sourceLabel, options = {}) {
    return pointLightIoController.applyLoadedPointLights(rawData, sourceLabel, options);
  }

  function isPointLightsSaveConfirmArmed() {
    return pointLightIoController.isPointLightsSaveConfirmArmed();
  }

  async function savePointLightsJson() {
    return pointLightIoController.savePointLightsJson();
  }

  async function loadPointLightsFromAssetsOrPrompt() {
    return pointLightIoController.loadPointLightsFromAssetsOrPrompt();
  }

  return {
    clearPointLights,
    resetPointLightsSaveConfirmation,
    armPointLightsSaveConfirmation,
    serializePointLights,
    applyLoadedPointLights,
    isPointLightsSaveConfirmArmed,
    savePointLightsJson,
    loadPointLightsFromAssetsOrPrompt,
  };
}
