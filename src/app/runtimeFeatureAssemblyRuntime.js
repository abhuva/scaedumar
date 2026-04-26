export function createTimeLightingAssemblyRuntime(deps) {
  return {
    initialHour: deps.initialHour,
    getCycleHour: deps.getCycleHour,
    setCycleHour: deps.setCycleHour,
    getSettingsDefaults: deps.getSettingsDefaults,
    defaultLightingSettings: deps.defaultLightingSettings,
    defaultFogSettings: deps.defaultFogSettings,
    sampleSunAtHour: deps.sampleSunAtHour,
    wrapHour: deps.wrapHour,
    clamp: deps.clamp,
    smoothstep: deps.smoothstep,
    lerpVec3: deps.lerpVec3,
    getFogColorManual: deps.getFogColorManual,
    rgbToHex: deps.rgbToHex,
    hexToRgb01: deps.hexToRgb01,
    zoomMin: deps.zoomMin,
    zoomMax: deps.zoomMax,
    cycleHourInput: deps.cycleHourInput,
    cycleHourValue: deps.cycleHourValue,
    formatHour: deps.formatHour,
  };
}

export function createSwarmRuntimeAssemblyRuntime(deps) {
  return {
    store: deps.store,
    isSwarmEnabled: deps.isSwarmEnabled,
    getSwarmSettings: deps.getSwarmSettings,
    swarmState: deps.swarmState,
    swarmFollowState: deps.swarmFollowState,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    setSwarmFollowEnabled: deps.setSwarmFollowEnabled,
    setSwarmFollowTargetType: deps.setSwarmFollowTargetType,
    setSwarmFollowAgentIndex: deps.setSwarmFollowAgentIndex,
    setSwarmFollowHawkIndex: deps.setSwarmFollowHawkIndex,
    swarmFollowTargetInput: deps.swarmFollowTargetInput,
    syncSwarmFollowTargetInput: deps.syncSwarmFollowTargetInput,
    resetSwarmFollowSpeedSmoothing: deps.resetSwarmFollowSpeedSmoothing,
    updateSwarmFollowButtonUi: deps.updateSwarmFollowButtonUi,
  };
}

export function createRenderPipelineAssemblyRuntime(deps) {
  return {
    gl: deps.gl,
    canvas: deps.canvas,
    program: deps.program,
    uniforms: deps.uniforms,
    splatTex: deps.splatTex,
    normalsTex: deps.normalsTex,
    heightTex: deps.heightTex,
    pointLightTex: deps.pointLightTex,
    cloudNoiseTex: deps.cloudNoiseTex,
    shadowBlurTex: deps.shadowBlurTex,
    shadowRawTex: deps.shadowRawTex,
    waterTex: deps.waterTex,
    flowMapTex: deps.flowMapTex,
    heightSize: deps.heightSize,
    splatSize: deps.splatSize,
    getViewHalfExtents: deps.getViewHalfExtents,
    cursorLightState: deps.cursorLightState,
    applyPointLightUsagePass: deps.applyPointLightUsagePass,
    renderShadowPipeline: deps.renderShadowPipeline,
    shadowSize: deps.shadowSize,
    shadowBlurFbo: deps.shadowBlurFbo,
    shadowBlurProgram: deps.shadowBlurProgram,
    shadowBlurUniforms: deps.shadowBlurUniforms,
    getBlurRadiusPx: deps.getBlurRadiusPx,
  };
}
