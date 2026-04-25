import { createRenderResources } from "./resources.js";
import { createRenderer } from "./renderer.js";
import { createTerrainUniformUploader } from "./uniformUploader.js";
import { createShadowPass } from "./passes/shadowPass.js";
import { createBlurPass } from "./passes/blurPass.js";
import { createMainTerrainPass } from "./passes/mainTerrainPass.js";

export function createRenderPipelineRuntime(deps) {
  const renderResources = createRenderResources({ gl: deps.gl, canvas: deps.canvas });
  const renderer = createRenderer({ resources: renderResources });
  const uploadUniforms = createTerrainUniformUploader({
    gl: deps.gl,
    program: deps.program,
    uniforms: deps.uniforms,
    splatTex: deps.splatTex,
    normalsTex: deps.normalsTex,
    heightTex: deps.heightTex,
    pointLightTex: deps.pointLightTex,
    cloudNoiseTex: deps.cloudNoiseTex,
    shadowBlurTex: deps.shadowBlurTex,
    shadowRawTex: deps.shadowRawTex,
    waterTex: deps.waterTex,
    flowMapTex: deps.flowMapTex,
    heightSize: deps.heightSize,
    splatSize: deps.splatSize,
    canvas: deps.canvas,
    getViewHalfExtents: deps.getViewHalfExtents,
    cursorLightState: deps.cursorLightState,
    applyPointLightUsagePass: deps.applyPointLightUsagePass,
  });

  renderer.registerPass("shadow", createShadowPass({
    renderShadowPipeline: deps.renderShadowPipeline,
  }));

  renderer.registerPass("shadowBlur", createBlurPass({
    gl: deps.gl,
    shadowSize: deps.shadowSize,
    shadowBlurFbo: deps.shadowBlurFbo,
    shadowBlurProgram: deps.shadowBlurProgram,
    shadowRawTex: deps.shadowRawTex,
    shadowBlurUniforms: deps.shadowBlurUniforms,
    getBlurRadiusPx: deps.getBlurRadiusPx,
  }));

  renderer.registerPass("mainTerrain", createMainTerrainPass({
    resources: renderResources,
    uploadUniforms,
    drawTerrain: () => {
      deps.gl.drawArrays(deps.gl.TRIANGLES, 0, 6);
    },
  }));

  renderer.registerPass("backgroundClear", {
    execute(frame) {
      const bg = frame.backgroundColorRgb || [0, 0, 0];
      renderResources.clearColor(bg[0], bg[1], bg[2], 1);
    },
  });

  return {
    renderResources,
    renderer,
  };
}
