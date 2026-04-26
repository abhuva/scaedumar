export function createFlowMapRuntime(deps) {
  const {
    rebuildFlowMapTexturePrecompute,
    gl,
    flowMapTex,
    getHeightImageData,
    getHeightSize,
    clamp,
    getWaterSettings,
  } = deps;

  function rebuildFlowMapTexture() {
    const waterSettings = getWaterSettings();
    rebuildFlowMapTexturePrecompute({
      gl,
      flowMapTex,
      heightImageData: getHeightImageData(),
      heightSize: getHeightSize(),
      clamp,
      settings: {
        radius1: waterSettings.waterFlowRadius1,
        radius2: waterSettings.waterFlowRadius2,
        radius3: waterSettings.waterFlowRadius3,
        weight1: waterSettings.waterFlowWeight1,
        weight2: waterSettings.waterFlowWeight2,
        weight3: waterSettings.waterFlowWeight3,
      },
    });
  }

  return {
    rebuildFlowMapTexture,
  };
}
