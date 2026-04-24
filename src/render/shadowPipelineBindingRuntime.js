import { createShadowPipelineRuntime } from "./shadowPipelineRuntime.js";

export function createShadowPipelineBindingRuntime(deps) {
  const shadowPipelineRuntime = createShadowPipelineRuntime({
    gl: deps.gl,
    shadowSize: deps.shadowSize,
    shadowRawTex: deps.shadowRawTex,
    shadowBlurTex: deps.shadowBlurTex,
    shadowRawFbo: deps.shadowRawFbo,
    shadowBlurFbo: deps.shadowBlurFbo,
    shadowProgram: deps.shadowProgram,
    shadowUniforms: deps.shadowUniforms,
    heightTex: deps.heightTex,
    getHeightSize: deps.getHeightSize,
    getLightingSettings: deps.getLightingSettings,
    getShadowMapScale: deps.getShadowMapScale,
  });
  return {
    ensureShadowTargets: () => shadowPipelineRuntime.ensureShadowTargets(),
    renderShadowPipeline: (params) => shadowPipelineRuntime.renderShadowPipeline(params),
  };
}
