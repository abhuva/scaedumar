export function createMapImageRuntime(deps) {
  function getSplatSize() {
    return deps.getSplatSize();
  }

  function getNormalsSize() {
    return deps.getNormalsSize();
  }

  function getHeightSize() {
    return deps.getHeightSize();
  }

  function setSplatSizeFromImage(img) {
    const splatSize = getSplatSize();
    const prevW = splatSize.width;
    const prevH = splatSize.height;
    splatSize.width = img.width || 1;
    splatSize.height = img.height || 1;
    return splatSize.width !== prevW || splatSize.height !== prevH;
  }

  function setHeightSizeFromImage(img) {
    const heightSize = getHeightSize();
    heightSize.width = img.width || 1;
    heightSize.height = img.height || 1;
  }

  function setNormalsSizeFromImage(img) {
    const normalsSize = getNormalsSize();
    normalsSize.width = img.width || 1;
    normalsSize.height = img.height || 1;
  }

  function syncPointLightWorkerMapData() {
    const pointLightBakeWorker = deps.getPointLightBakeWorker();
    const normalsImageData = deps.getNormalsImageData();
    const heightImageData = deps.getHeightImageData();
    if (!pointLightBakeWorker || !normalsImageData || !heightImageData) return;
    const splatSize = getSplatSize();
    const normalsSize = getNormalsSize();
    const heightSize = getHeightSize();
    pointLightBakeWorker.postMessage({
      type: "setMapData",
      splatWidth: splatSize.width,
      splatHeight: splatSize.height,
      normalsWidth: normalsSize.width,
      normalsHeight: normalsSize.height,
      heightWidth: heightSize.width,
      heightHeight: heightSize.height,
      normalsData: normalsImageData.data,
      heightData: heightImageData.data,
    });
  }

  async function applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage) {
    deps.uploadImageToTexture(deps.getSplatTex(), splatImage);
    const sizeChanged = setSplatSizeFromImage(splatImage);
    deps.resetCamera();

    deps.uploadImageToTexture(deps.getNormalsTex(), normalsImage);
    setNormalsSizeFromImage(normalsImage);
    deps.setNormalsImageData(deps.extractImageData(normalsImage));

    deps.uploadImageToTexture(deps.getHeightTex(), heightImage);
    setHeightSizeFromImage(heightImage);
    deps.setHeightImageData(deps.extractImageData(heightImage));
    deps.rebuildFlowMapTexture();
    deps.uploadImageToTexture(deps.getWaterTex(), waterImage);
    deps.setSlopeImageData(deps.extractImageData(slopeImage));
    deps.setWaterImageData(deps.extractImageData(waterImage));
    syncPointLightWorkerMapData();
    deps.syncMapStateToStore();
    deps.applyMapSizeChangeIfNeeded(sizeChanged);
  }

  return {
    applyMapImages,
    syncPointLightWorkerMapData,
    setSplatSizeFromImage,
    setHeightSizeFromImage,
    setNormalsSizeFromImage,
  };
}
