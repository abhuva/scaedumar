import { createMapImageRuntime } from "./mapImageRuntime.js";
import { createMapSampling } from "./mapSampling.js";
import { createShadowOcclusion } from "./shadowOcclusion.js";
import {
  normalizeMapFolderPath as normalizeMapFolderPathUtil,
  isAbsoluteFsPath as isAbsoluteFsPathUtil,
  joinFsPath as joinFsPathUtil,
  buildMapAssetPath as buildMapAssetPathUtil,
  toAbsoluteFileUrl as toAbsoluteFileUrlUtil,
} from "./mapPathUtils.js";
import { resolveTauriInvoke, createTauriRuntimeHelpers } from "./tauriRuntime.js";
import {
  getFileFromFolderSelection as selectFileFromFolder,
  createMapIoHelpers,
} from "./mapIoHelpers.js";

export function createMapSupportRuntime(deps) {
  let mapImageRuntime = null;
  let mapSamplingRuntime = null;
  let shadowOcclusionRuntime = null;
  const getSplatSize = () => (typeof deps.getSplatSize === "function" ? deps.getSplatSize() : deps.splatSize);
  const getNormalsSize = () => (typeof deps.getNormalsSize === "function" ? deps.getNormalsSize() : deps.normalsSize);
  const getHeightSize = () => (typeof deps.getHeightSize === "function" ? deps.getHeightSize() : deps.heightSize);
  const getSplatTex = () => (typeof deps.getSplatTex === "function" ? deps.getSplatTex() : deps.splatTex);
  const getNormalsTex = () => (typeof deps.getNormalsTex === "function" ? deps.getNormalsTex() : deps.normalsTex);
  const getHeightTex = () => (typeof deps.getHeightTex === "function" ? deps.getHeightTex() : deps.heightTex);
  const getWaterTex = () => (typeof deps.getWaterTex === "function" ? deps.getWaterTex() : deps.waterTex);
  const normalizeMapFolderPath = (path) => normalizeMapFolderPathUtil(path, deps.defaultMapFolder);
  const isAbsoluteFsPath = (path) => isAbsoluteFsPathUtil(path);
  const joinFsPath = (folder, fileName) => joinFsPathUtil(folder, fileName);
  const buildMapAssetPath = (folder, fileName) => buildMapAssetPathUtil(folder, fileName);
  const toAbsoluteFileUrl = (path) => toAbsoluteFileUrlUtil(path);
  const tauriInvoke = resolveTauriInvoke(deps.windowEl);
  const tauriRuntimeHelpers = createTauriRuntimeHelpers({
    tauriInvoke,
    normalizeMapFolderPath,
    isAbsoluteFsPath,
  });

  const mapIoHelpers = createMapIoHelpers({
    tauriInvoke,
    isAbsoluteFsPath,
    invokeTauri: (command, args) => tauriRuntimeHelpers.invokeTauri(command, args),
    toAbsoluteFileUrl,
  });

  function getMapImageRuntime() {
    if (mapImageRuntime) return mapImageRuntime;
    mapImageRuntime = createMapImageRuntime({
      getSplatSize,
      getNormalsSize,
      getHeightSize,
      getSplatTex,
      getNormalsTex,
      getHeightTex,
      getWaterTex,
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
    mapSamplingRuntime = createMapSampling({
      clamp: deps.clamp,
      getSplatSize,
      getNormalsSize,
      getHeightSize,
      getNormalsImageData: deps.getNormalsImageData,
      getHeightImageData: deps.getHeightImageData,
    });
    return mapSamplingRuntime;
  }

  function getShadowOcclusionRuntime() {
    if (shadowOcclusionRuntime) return shadowOcclusionRuntime;
    shadowOcclusionRuntime = createShadowOcclusion({
      getSplatSize,
      sampleHeightAtMapCoord: (mapX, mapY) => getMapSamplingRuntime().sampleHeightAtMapCoord(mapX, mapY),
      sampleHeightAtMapPixel: (pixelX, pixelY) => getMapSamplingRuntime().sampleHeightAtMapPixel(pixelX, pixelY),
      swarmZMax: deps.swarmZMax,
    });
    return shadowOcclusionRuntime;
  }

  return {
    getMapImageRuntime: () => getMapImageRuntime(),
    tauriInvoke,
    normalizeMapFolderPath,
    isAbsoluteFsPath,
    joinFsPath,
    buildMapAssetPath,
    invokeTauri: (command, args) => tauriRuntimeHelpers.invokeTauri(command, args),
    toAbsoluteFileUrl,
    pickMapFolderViaTauri: () => tauriRuntimeHelpers.pickMapFolderViaTauri(),
    validateMapFolderViaTauri: (folderPath) => tauriRuntimeHelpers.validateMapFolderViaTauri(folderPath),
    applyMapImages: (splatImage, normalsImage, heightImage, slopeImage, waterImage) =>
      getMapImageRuntime().applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage),
    syncPointLightWorkerMapData: () => getMapImageRuntime().syncPointLightWorkerMapData(),
    getFileFromFolderSelection: (files, fileName) => selectFileFromFolder(files, fileName),
    tryLoadJsonFromUrl: (path) => mapIoHelpers.tryLoadJsonFromUrl(path),
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
