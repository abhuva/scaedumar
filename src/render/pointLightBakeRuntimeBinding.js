import { bindPointLightWorker } from "../core/pointLightWorkerBinding.js";
import { createPointLightBakeCanvasRuntime } from "./pointLightBakeCanvasRuntime.js";
import { createPointLightBakeSync } from "./pointLightBakeSync.js";
import { createPointLightBakeRuntime } from "./pointLightBakeRuntime.js";

export function createPointLightBakeRuntimeBinding(deps) {
  const pointLightBakeTempCanvas = deps.document.createElement("canvas");
  const pointLightBakeTempCtx = pointLightBakeTempCanvas.getContext("2d");

  const pointLightBakeCanvasRuntime = createPointLightBakeCanvasRuntime({
    getMapSize: deps.getMapSize,
    pointLightBakeCanvas: deps.pointLightBakeCanvas,
    pointLightBakeCtx: deps.pointLightBakeCtx,
    pointLightBakeTempCanvas,
    pointLightBakeTempCtx,
    pointLightTex: deps.pointLightTex,
    uploadImageToTexture: deps.uploadImageToTexture,
    requestOverlayDraw: deps.requestOverlayDraw,
  });

  function getFullBakeSize() {
    return {
      width: deps.pointLightBakeCanvas.width,
      height: deps.pointLightBakeCanvas.height,
    };
  }

  function applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight) {
    pointLightBakeCanvasRuntime.applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight);
  }

  let pointLightBakeSyncRuntime = null;
  function getPointLightBakeSyncRuntime() {
    if (pointLightBakeSyncRuntime) return pointLightBakeSyncRuntime;
    pointLightBakeSyncRuntime = createPointLightBakeSync({
      getFullBakeSize,
      pointLightBakeLiveScale: deps.pointLightBakeLiveScale,
      getLightingSettings: deps.getLightingSettings,
      getLights: deps.getLights,
      clamp: deps.clamp,
      defaultPointLightFlicker: deps.defaultPointLightFlicker,
      defaultPointLightFlickerSpeed: deps.defaultPointLightFlickerSpeed,
      sampleHeightAtMapPixel: deps.sampleHeightAtMapPixel,
      hasLineOfSightToLight: deps.hasLineOfSightToLight,
      sampleNormalAtMapPixel: deps.sampleNormalAtMapPixel,
      normalize3: deps.normalize3,
      pointLightBlendExposure: deps.pointLightBlendExposure,
      applyPointLightBakeRgba,
    });
    return pointLightBakeSyncRuntime;
  }

  function bakePointLightsTextureSync(useReducedResolution = false) {
    getPointLightBakeSyncRuntime().bakePointLightsTextureSync(useReducedResolution);
  }

  const pointLightBakeRuntime = createPointLightBakeRuntime({
    windowEl: deps.windowEl,
    requestAnimationFrame: deps.requestAnimationFrame,
    createWorker: deps.createWorker,
    bindPointLightWorker,
    debounceMs: deps.debounceMs,
    liveScale: deps.pointLightBakeLiveScale,
    blendExposure: deps.pointLightBlendExposure,
    isLiveUpdateEnabled: deps.isLiveUpdateEnabled,
    ensureBakeSize: () => pointLightBakeCanvasRuntime.ensurePointLightBakeSize(),
    hasBakeInputs: deps.hasBakeInputs,
    bakeSync: (useReducedResolution) => bakePointLightsTextureSync(useReducedResolution),
    getFullBakeSize,
    getLights: deps.getLights,
    getHeightScaleValue: deps.getHeightScaleValue,
    bakePointLightsTextureSync,
    applyPointLightBakeRgba,
  });

  return {
    getWorker: () => pointLightBakeRuntime.getWorker(),
    ensurePointLightBakeSize: () => pointLightBakeCanvasRuntime.ensurePointLightBakeSize(),
    applyPointLightBakeRgba,
    schedulePointLightBake: () => pointLightBakeRuntime.scheduleBake(),
    bakePointLightsTexture: () => pointLightBakeRuntime.bakeNow(),
    getPointLightBakeSyncRuntime,
    bakePointLightsTextureSync,
  };
}
