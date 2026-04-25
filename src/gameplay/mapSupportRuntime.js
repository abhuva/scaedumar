import { createMapImageRuntimeBinding } from "./mapImageRuntimeBinding.js";
import { createMapSamplingRuntimeBinding } from "./mapSamplingRuntimeBinding.js";
import { createShadowOcclusionRuntimeBinding } from "./shadowOcclusionRuntimeBinding.js";
import { createMapPathBindingRuntime } from "./mapPathBindingRuntime.js";
import { createTauriRuntimeBinding } from "./tauriRuntimeBinding.js";
import { getFileFromFolderSelection as selectFileFromFolder } from "./mapIoHelpers.js";
import { createMapIoHelpersRuntime } from "./mapIoHelpersRuntime.js";

export function createMapSupportRuntime(deps) {
  let mapPathBindingRuntime = null;
  let mapImageRuntime = null;
  let mapSamplingRuntime = null;
  let shadowOcclusionRuntime = null;

  function getMapPathBindingRuntime() {
    if (mapPathBindingRuntime) return mapPathBindingRuntime;
    mapPathBindingRuntime = createMapPathBindingRuntime({
      defaultMapFolder: deps.defaultMapFolder,
    });
    return mapPathBindingRuntime;
  }

  const tauriRuntimeBinding = createTauriRuntimeBinding({
    windowEl: deps.windowEl,
    normalizeMapFolderPath: (path) => getMapPathBindingRuntime().normalizeMapFolderPath(path),
    isAbsoluteFsPath: (path) => getMapPathBindingRuntime().isAbsoluteFsPath(path),
  });

  const mapIoHelpersRuntime = createMapIoHelpersRuntime({
    tauriInvoke: tauriRuntimeBinding.tauriInvoke,
    isAbsoluteFsPath: (path) => getMapPathBindingRuntime().isAbsoluteFsPath(path),
    invokeTauri: (command, args) => tauriRuntimeBinding.invokeTauri(command, args),
    toAbsoluteFileUrl: (path) => getMapPathBindingRuntime().toAbsoluteFileUrl(path),
  });

  function getMapImageRuntime() {
    if (mapImageRuntime) return mapImageRuntime;
    mapImageRuntime = createMapImageRuntimeBinding({
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
    return mapImageRuntime;
  }

  function getMapSamplingRuntime() {
    if (mapSamplingRuntime) return mapSamplingRuntime;
    mapSamplingRuntime = createMapSamplingRuntimeBinding({
      clamp: deps.clamp,
      getSplatSize: deps.getSplatSize,
      getNormalsSize: deps.getNormalsSize,
      getHeightSize: deps.getHeightSize,
      getNormalsImageData: deps.getNormalsImageData,
      getHeightImageData: deps.getHeightImageData,
    });
    return mapSamplingRuntime;
  }

  function getShadowOcclusionRuntime() {
    if (shadowOcclusionRuntime) return shadowOcclusionRuntime;
    shadowOcclusionRuntime = createShadowOcclusionRuntimeBinding({
      getSplatSize: deps.getSplatSize,
      sampleHeightAtMapCoord: (mapX, mapY) => getMapSamplingRuntime().sampleHeightAtMapCoord(mapX, mapY),
      sampleHeightAtMapPixel: (pixelX, pixelY) => getMapSamplingRuntime().sampleHeightAtMapPixel(pixelX, pixelY),
      swarmZMax: deps.swarmZMax,
    });
    return shadowOcclusionRuntime;
  }

  return {
    getMapImageRuntime: () => getMapImageRuntime(),
    tauriInvoke: tauriRuntimeBinding.tauriInvoke,
    normalizeMapFolderPath: (path) => getMapPathBindingRuntime().normalizeMapFolderPath(path),
    isAbsoluteFsPath: (path) => getMapPathBindingRuntime().isAbsoluteFsPath(path),
    joinFsPath: (folder, fileName) => getMapPathBindingRuntime().joinFsPath(folder, fileName),
    buildMapAssetPath: (folder, fileName) => getMapPathBindingRuntime().buildMapAssetPath(folder, fileName),
    invokeTauri: (command, args) => tauriRuntimeBinding.invokeTauri(command, args),
    toAbsoluteFileUrl: (path) => getMapPathBindingRuntime().toAbsoluteFileUrl(path),
    pickMapFolderViaTauri: () => tauriRuntimeBinding.pickMapFolderViaTauri(),
    validateMapFolderViaTauri: (folderPath) => tauriRuntimeBinding.validateMapFolderViaTauri(folderPath),
    applyMapImages: (splatImage, normalsImage, heightImage, slopeImage, waterImage) =>
      getMapImageRuntime().applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage),
    syncPointLightWorkerMapData: () => getMapImageRuntime().syncPointLightWorkerMapData(),
    getFileFromFolderSelection: (files, fileName) => selectFileFromFolder(files, fileName),
    tryLoadJsonFromUrl: (path) => mapIoHelpersRuntime.tryLoadJsonFromUrl(path),
    normalize3: (x, y, z) => getMapSamplingRuntime().normalize3(x, y, z),
    sampleNormalAtMapPixel: (pixelX, pixelY) => getMapSamplingRuntime().sampleNormalAtMapPixel(pixelX, pixelY),
    sampleHeightAtMapPixel: (pixelX, pixelY) => getMapSamplingRuntime().sampleHeightAtMapPixel(pixelX, pixelY),
    sampleHeightAtMapCoord: (mapX, mapY) => getMapSamplingRuntime().sampleHeightAtMapCoord(mapX, mapY),
    computeSwarmDirectionalShadow: (mapX, mapY, sourceHeight, lightDir, blockedShadowFactor) =>
      getShadowOcclusionRuntime().computeSwarmDirectionalShadow(mapX, mapY, sourceHeight, lightDir, blockedShadowFactor),
    hasLineOfSightToLight: (surfaceX, surfaceY, surfaceH, lightX, lightY, lightH, heightScaleValue) =>
      getShadowOcclusionRuntime().hasLineOfSightToLight(
        surfaceX,
        surfaceY,
        surfaceH,
        lightX,
        lightY,
        lightH,
        heightScaleValue,
      ),
  };
}
