export function createMapImageRuntime(deps) {
  function setSplatSizeFromImage(img) {
    const prevW = deps.splatSize.width;
    const prevH = deps.splatSize.height;
    deps.splatSize.width = img.width || 1;
    deps.splatSize.height = img.height || 1;
    return deps.splatSize.width !== prevW || deps.splatSize.height !== prevH;
  }

  function setHeightSizeFromImage(img) {
    deps.heightSize.width = img.width || 1;
    deps.heightSize.height = img.height || 1;
  }

  function setNormalsSizeFromImage(img) {
    deps.normalsSize.width = img.width || 1;
    deps.normalsSize.height = img.height || 1;
  }

  function syncPointLightWorkerMapData() {
    const pointLightBakeWorker = deps.getPointLightBakeWorker();
    const normalsImageData = deps.getNormalsImageData();
    const heightImageData = deps.getHeightImageData();
    if (!pointLightBakeWorker || !normalsImageData || !heightImageData) return;
    pointLightBakeWorker.postMessage({
      type: "setMapData",
      splatWidth: deps.splatSize.width,
      splatHeight: deps.splatSize.height,
      normalsWidth: deps.normalsSize.width,
      normalsHeight: deps.normalsSize.height,
      heightWidth: deps.heightSize.width,
      heightHeight: deps.heightSize.height,
      normalsData: normalsImageData.data,
      heightData: heightImageData.data,
    });
  }

  async function applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage) {
    deps.uploadImageToTexture(deps.splatTex, splatImage);
    const sizeChanged = setSplatSizeFromImage(splatImage);
    deps.applyMapSizeChangeIfNeeded(sizeChanged);
    deps.resetCamera();

    deps.uploadImageToTexture(deps.normalsTex, normalsImage);
    setNormalsSizeFromImage(normalsImage);
    deps.setNormalsImageData(deps.extractImageData(normalsImage));

    deps.uploadImageToTexture(deps.heightTex, heightImage);
    setHeightSizeFromImage(heightImage);
    deps.setHeightImageData(deps.extractImageData(heightImage));
    deps.rebuildFlowMapTexture();
    deps.uploadImageToTexture(deps.waterTex, waterImage);
    deps.setSlopeImageData(deps.extractImageData(slopeImage));
    deps.setWaterImageData(deps.extractImageData(waterImage));
    syncPointLightWorkerMapData();
    deps.syncMapStateToStore();
  }

  return {
    applyMapImages,
    syncPointLightWorkerMapData,
    setSplatSizeFromImage,
    setHeightSizeFromImage,
    setNormalsSizeFromImage,
  };
}
