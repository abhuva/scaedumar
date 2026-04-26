import { createDefaultMapImageRuntime } from "../render/defaultMapImageRuntime.js";
import { createCameraRuntimeBinding } from "../gameplay/cameraRuntimeBinding.js";

export function createDefaultMapImageAssemblyRuntime(deps) {
  return {
    createFlatNormalImage: deps.createFlatNormalImage,
    createFlatHeightImage: deps.createFlatHeightImage,
    createFlatSlopeImage: deps.createFlatSlopeImage,
    createFlatWaterImage: deps.createFlatWaterImage,
    createFallbackSplat: deps.createFallbackSplat,
    uploadImageToTexture: deps.uploadImageToTexture,
    normalsTex: deps.normalsTex,
    heightTex: deps.heightTex,
    splatTex: deps.splatTex,
    waterTex: deps.waterTex,
    setSplatSizeFromImage: deps.setSplatSizeFromImage,
    setHeightSizeFromImage: deps.setHeightSizeFromImage,
    setNormalsSizeFromImage: deps.setNormalsSizeFromImage,
    extractImageData: deps.extractImageData,
    rebuildFlowMapTexture: deps.rebuildFlowMapTexture,
    syncPointLightWorkerMapData: deps.syncPointLightWorkerMapData,
    setNormalsImageData: deps.setNormalsImageData,
    setHeightImageData: deps.setHeightImageData,
    setSlopeImageData: deps.setSlopeImageData,
    setWaterImageData: deps.setWaterImageData,
  };
}

export function initializeDefaultMapImagesRuntime(deps) {
  return createDefaultMapImageRuntime(createDefaultMapImageAssemblyRuntime(deps)).initializeDefaultMapImages();
}

export function createCameraAssemblyRuntime(deps) {
  return {
    dispatchCoreCommand: deps.dispatchCoreCommand,
    canvas: deps.canvas,
    overlayCanvas: deps.overlayCanvas,
    splatSize: deps.splatSize,
    clamp: deps.clamp,
    getCameraState: deps.getCameraState,
  };
}

export function createCameraSetupRuntime(deps) {
  return createCameraRuntimeBinding(createCameraAssemblyRuntime(deps));
}
