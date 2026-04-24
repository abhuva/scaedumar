import { createMapImageRuntime } from "./mapImageRuntime.js";

export function createMapImageRuntimeBinding(deps) {
  return createMapImageRuntime({
    splatSize: deps.splatSize,
    normalsSize: deps.normalsSize,
    heightSize: deps.heightSize,
    splatTex: deps.splatTex,
    normalsTex: deps.normalsTex,
    heightTex: deps.heightTex,
    waterTex: deps.waterTex,
    uploadImageToTexture: deps.uploadImageToTexture,
    applyMapSizeChangeIfNeeded: deps.applyMapSizeChangeIfNeeded,
    resetCamera: deps.resetCamera,
    extractImageData: deps.extractImageData,
    rebuildFlowMapTexture: deps.rebuildFlowMapTexture,
    syncMapStateToStore: deps.syncMapStateToStore,
    getPointLightBakeWorker: deps.getPointLightBakeWorker,
    getNormalsImageData: deps.getNormalsImageData,
    getHeightImageData: deps.getHeightImageData,
    setNormalsImageData: deps.setNormalsImageData,
    setHeightImageData: deps.setHeightImageData,
    setSlopeImageData: deps.setSlopeImageData,
    setWaterImageData: deps.setWaterImageData,
  });
}
