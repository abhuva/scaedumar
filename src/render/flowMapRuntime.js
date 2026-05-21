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
  let imageFlowMap = null;

  function uploadFlowMapImage(image) {
    gl.bindTexture(gl.TEXTURE_2D, flowMapTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }

  function clearFlowMapTexture() {
    const empty = new Uint8Array([128, 128, 0, 255]);
    gl.bindTexture(gl.TEXTURE_2D, flowMapTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, empty);
  }

  function setFlowMapImage(image) {
    imageFlowMap = image || null;
  }

  function rebuildFlowMapTexture() {
    const waterSettings = getWaterSettings();
    const flowSource = waterSettings.waterFlowSource === "image"
      ? "image"
      : (waterSettings.waterFlowSource === "fixed" ? "fixed" : "height");
    if (flowSource === "image") {
      if (imageFlowMap) {
        uploadFlowMapImage(imageFlowMap);
      } else {
        console.warn("Water flow source is image, but no flow.png image is loaded for the current map.");
        clearFlowMapTexture();
      }
      return;
    }
    if (flowSource === "fixed") {
      return;
    }
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
    setFlowMapImage,
  };
}
