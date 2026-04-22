export function createShadowPass(deps) {
  return {
    execute(frame) {
      deps.renderShadowPipeline(frame.lightingParams);
    },
  };
}
