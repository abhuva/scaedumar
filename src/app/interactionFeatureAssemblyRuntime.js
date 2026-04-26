export function createLightInteractionAssemblyRuntime(deps) {
  return {
    clamp: deps.clamp,
    hexToRgb01: deps.hexToRgb01,
    rgbToHex: deps.rgbToHex,
    cursorLightDefaults: deps.cursorLightDefaults,
    getCursorLightSnapshot: deps.getCursorLightSnapshot,
    clientToNdc: deps.clientToNdc,
    worldFromNdc: deps.worldFromNdc,
    worldToUv: deps.worldToUv,
    cursorLightHeightOffsetInput: deps.cursorLightHeightOffsetInput,
    syncPointLightEditorUi: deps.syncPointLightEditorUi,
    getSelectedPointLight: deps.getSelectedPointLight,
    getLightEditDraft: deps.getLightEditDraft,
    lightEditorEmptyEl: deps.lightEditorEmptyEl,
    lightEditorFieldsEl: deps.lightEditorFieldsEl,
    lightCoordEl: deps.lightCoordEl,
    pointLightColorInput: deps.pointLightColorInput,
    pointLightStrengthInput: deps.pointLightStrengthInput,
    pointLightIntensityInput: deps.pointLightIntensityInput,
    pointLightHeightOffsetInput: deps.pointLightHeightOffsetInput,
    pointLightFlickerInput: deps.pointLightFlickerInput,
    pointLightFlickerSpeedInput: deps.pointLightFlickerSpeedInput,
    updatePointLightStrengthLabel: deps.updatePointLightStrengthLabel,
    updatePointLightIntensityLabel: deps.updatePointLightIntensityLabel,
    updatePointLightHeightOffsetLabel: deps.updatePointLightHeightOffsetLabel,
    updatePointLightFlickerLabel: deps.updatePointLightFlickerLabel,
    updatePointLightFlickerSpeedLabel: deps.updatePointLightFlickerSpeedLabel,
    getPointLightRuntime: deps.getPointLightRuntime,
  };
}

export function createSystemStoreSyncAssemblyRuntime(deps) {
  return {
    store: deps.store,
    clamp: deps.clamp,
    cycleState: deps.cycleState,
  };
}

export function createMovementAssemblyRuntime(deps) {
  return {
    entityStore: deps.entityStore,
    playerState: deps.playerState,
    getMapWidth: deps.getMapWidth,
    getMapHeight: deps.getMapHeight,
    computeMoveStepCost: deps.computeMoveStepCost,
    rebuildMovementField: deps.rebuildMovementField,
    requestOverlayDraw: deps.requestOverlayDraw,
    setStatus: deps.setStatus,
    setPlayerSnapshot: deps.setPlayerSnapshot,
    setMovementSnapshot: deps.setMovementSnapshot,
  };
}
