export function createDefaultMapImageRuntime(deps) {
  function initializeDefaultMapImages() {
    const defaultNormalImage = deps.createFlatNormalImage();
    const defaultHeightImage = deps.createFlatHeightImage();
    const defaultSlopeImage = deps.createFlatSlopeImage();
    const defaultWetnessImage = deps.createFlatWaterImage();
    const defaultWaterImage = deps.createFlatWaterImage();
    const defaultSplatImage = deps.createFallbackSplat();

    deps.uploadImageToTexture(deps.normalsTex, defaultNormalImage);
    deps.uploadImageToTexture(deps.heightTex, defaultHeightImage);
    deps.uploadImageToTexture(deps.slopeTex, defaultSlopeImage);
    deps.uploadImageToTexture(deps.wetnessTex, defaultWetnessImage);
    deps.uploadImageToTexture(deps.splatTex, defaultSplatImage);
    deps.uploadImageToTexture(deps.waterTex, defaultWaterImage);

    deps.setSplatSizeFromImage(defaultSplatImage);
    deps.setHeightSizeFromImage(defaultHeightImage);
    deps.setNormalsSizeFromImage(defaultNormalImage);

    deps.setNormalsImageData(deps.extractImageData(defaultNormalImage));
    deps.setHeightImageData(deps.extractImageData(defaultHeightImage));
    deps.rebuildFlowMapTexture();
    deps.setSlopeImageData(deps.extractImageData(defaultSlopeImage));
    deps.setWetnessImageData(deps.extractImageData(defaultWetnessImage));
    deps.setWaterImageData(deps.extractImageData(defaultWaterImage));
    deps.syncPointLightWorkerMapData();
  }

  return {
    initializeDefaultMapImages,
  };
}
