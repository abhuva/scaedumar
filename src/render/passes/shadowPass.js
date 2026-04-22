export function createShadowPass(deps) {
  if (!deps || typeof deps.renderShadowPipeline !== "function") {
    throw new Error("createShadowPass requires deps.renderShadowPipeline(frameLightingParams).");
  }
  return {
    execute(frame) {
      deps.renderShadowPipeline(frame.lightingParams);
    },
  };
}
