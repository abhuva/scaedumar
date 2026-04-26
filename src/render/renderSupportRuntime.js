import { createGlResourceRuntime } from "./glResourceRuntime.js";
import { createFlowMapRuntime } from "./flowMapRuntime.js";
import { createShadowPipelineRuntime } from "./shadowPipelineRuntime.js";

export function createRenderSupportRuntime(deps) {
  let glResourceRuntime = null;
  let flowMapRuntime = null;
  let shadowPipelineRuntime = null;

  function getGlResourceRuntime() {
    if (glResourceRuntime) return glResourceRuntime;
    glResourceRuntime = createGlResourceRuntime({ gl: deps.gl });
    return glResourceRuntime;
  }

  function getFlowMapRuntime() {
    if (flowMapRuntime) return flowMapRuntime;
    flowMapRuntime = createFlowMapRuntime({
      rebuildFlowMapTexturePrecompute: deps.rebuildFlowMapTexturePrecompute,
      gl: deps.gl,
      flowMapTex: deps.getFlowMapTex(),
      getHeightImageData: deps.getHeightImageData,
      getHeightSize: deps.getHeightSize,
      clamp: deps.clamp,
      getWaterSettings: deps.getWaterSettings,
    });
    return flowMapRuntime;
  }

  function getShadowPipelineRuntime() {
    if (shadowPipelineRuntime) return shadowPipelineRuntime;
    shadowPipelineRuntime = createShadowPipelineRuntime({
      gl: deps.gl,
      shadowSize: deps.getShadowSize(),
      shadowRawTex: deps.getShadowRawTex(),
      shadowBlurTex: deps.getShadowBlurTex(),
      shadowRawFbo: deps.getShadowRawFbo(),
      shadowBlurFbo: deps.getShadowBlurFbo(),
      shadowProgram: deps.getShadowProgram(),
      shadowUniforms: deps.getShadowUniforms(),
      heightTex: deps.getHeightTex(),
      getHeightSize: deps.getHeightSize,
      getLightingSettings: deps.getLightingSettings,
      getShadowMapScale: deps.getShadowMapScale,
    });
    return shadowPipelineRuntime;
  }

  async function loadImageFromUrl(url) {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    try {
      await image.decode();
    } catch (error) {
      throw new Error(
        `Failed to decode image from ${url}: ${error instanceof Error ? error.message : error}`,
        { cause: error },
      );
    }
    return image;
  }

  async function loadImageFromFile(file) {
    const image = new Image();
    image.decoding = "async";
    const blobUrl = URL.createObjectURL(file);
    image.src = blobUrl;
    try {
      await image.decode();
      return image;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  return {
    createShader: (type, src) => getGlResourceRuntime().createShader(type, src),
    createProgram: (vsSrc, fsSrc) => getGlResourceRuntime().createProgram(vsSrc, fsSrc),
    createTexture: () => getGlResourceRuntime().createTexture(),
    createLinearTexture: () => getGlResourceRuntime().createLinearTexture(),
    uploadImageToTexture: (tex, image) => getGlResourceRuntime().uploadImageToTexture(tex, image),
    rebuildFlowMapTexture: () => getFlowMapRuntime().rebuildFlowMapTexture(),
    ensureShadowTargets: () => getShadowPipelineRuntime().ensureShadowTargets(),
    renderShadowPipeline: (params) => getShadowPipelineRuntime().renderShadowPipeline(params),
    createCloudNoiseImage: (size = 128) => deps.createCloudNoiseImageRender(size, deps.clamp),
    uploadCloudNoiseTexture: () => deps.uploadCloudNoiseTextureRender({
      gl: deps.gl,
      cloudNoiseTex: deps.getCloudNoiseTex(),
      clamp: deps.clamp,
    }),
    loadImageFromUrl,
    loadImageFromFile,
  };
}
