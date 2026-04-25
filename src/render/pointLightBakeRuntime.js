import { createPointLightBakeOrchestrator } from "./precompute/pointLightBake.js";

export function createPointLightBakeRuntime(deps) {
  let pointLightBakeWorker = null;
  try {
    pointLightBakeWorker = deps.createWorker();
  } catch (err) {
    console.warn("Point-light bake worker unavailable; falling back to main-thread baking.", err);
  }

  const orchestrator = createPointLightBakeOrchestrator({
    windowEl: deps.windowEl,
    requestAnimationFrame: deps.requestAnimationFrame,
    debounceMs: deps.debounceMs,
    liveScale: deps.liveScale,
    blendExposure: deps.blendExposure,
    getWorker: () => pointLightBakeWorker,
    isLiveUpdateEnabled: deps.isLiveUpdateEnabled,
    ensureBakeSize: deps.ensureBakeSize,
    hasBakeInputs: deps.hasBakeInputs,
    bakeSync: deps.bakeSync,
    getFullBakeSize: deps.getFullBakeSize,
    getLights: deps.getLights,
    getHeightScaleValue: deps.getHeightScaleValue,
  });

  if (pointLightBakeWorker) {
    deps.bindPointLightWorker(pointLightBakeWorker, {
      getPendingRequestId: () => orchestrator.getPendingRequestId(),
      setPendingRequestId: (value) => orchestrator.setPendingRequestId(value),
      bakePointLightsTextureSync: deps.bakePointLightsTextureSync,
      applyPointLightBakeRgba: deps.applyPointLightBakeRgba,
    });
  }

  return {
    scheduleBake: () => orchestrator.scheduleBake(),
    bakeNow: () => orchestrator.bakeNow(),
  };
}
