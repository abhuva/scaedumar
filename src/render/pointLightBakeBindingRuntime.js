export function createPointLightBakeBindingRuntime(deps) {
  function ensurePointLightBakeSize() {
    deps.pointLightBakeCanvasRuntime.ensurePointLightBakeSize();
  }

  function applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight) {
    deps.pointLightBakeCanvasRuntime.applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight);
  }

  function schedulePointLightBake() {
    deps.pointLightBakeRuntime.scheduleBake();
  }

  function bakePointLightsTexture() {
    deps.pointLightBakeRuntime.bakeNow();
  }

  return {
    ensurePointLightBakeSize,
    applyPointLightBakeRgba,
    schedulePointLightBake,
    bakePointLightsTexture,
  };
}
