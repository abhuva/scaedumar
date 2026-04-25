import { createGlResourceBindingRuntime } from "./glResourceBindingRuntime.js";
import { createFlowMapBindingRuntime } from "./flowMapBindingRuntime.js";
import { createShadowPipelineBindingRuntime } from "./shadowPipelineBindingRuntime.js";

export function createRenderSupportRuntime(deps) {
  let glResourceBindingRuntime = null;
  let flowMapBindingRuntime = null;
  let shadowPipelineBindingRuntime = null;

  function getGlResourceBindingRuntime() {
    if (glResourceBindingRuntime) return glResourceBindingRuntime;
    glResourceBindingRuntime = createGlResourceBindingRuntime({ gl: deps.gl });
    return glResourceBindingRuntime;
  }

  function getFlowMapBindingRuntime() {
    if (flowMapBindingRuntime) return flowMapBindingRuntime;
    flowMapBindingRuntime = createFlowMapBindingRuntime({
      rebuildFlowMapTexturePrecompute: deps.rebuildFlowMapTexturePrecompute,
      gl: deps.gl,
      flowMapTex: deps.getFlowMapTex(),
      getHeightImageData: deps.getHeightImageData,
      getHeightSize: deps.getHeightSize,
      clamp: deps.clamp,
      getWaterSettings: deps.getWaterSettings,
    });
    return flowMapBindingRuntime;
  }

  function getShadowPipelineBindingRuntime() {
    if (shadowPipelineBindingRuntime) return shadowPipelineBindingRuntime;
    shadowPipelineBindingRuntime = createShadowPipelineBindingRuntime({
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
    return shadowPipelineBindingRuntime;
  }

  async function loadImageFromUrl(url) {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  }

  async function loadImageFromFile(file) {
    const image = new Image();
    image.decoding = "async";
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    image.src = dataUrl;
    await image.decode();
    return image;
  }

  return {
    createShader: (type, src) => getGlResourceBindingRuntime().createShader(type, src),
    createProgram: (vsSrc, fsSrc) => getGlResourceBindingRuntime().createProgram(vsSrc, fsSrc),
    createTexture: () => getGlResourceBindingRuntime().createTexture(),
    createLinearTexture: () => getGlResourceBindingRuntime().createLinearTexture(),
    uploadImageToTexture: (tex, image) => getGlResourceBindingRuntime().uploadImageToTexture(tex, image),
    rebuildFlowMapTexture: () => getFlowMapBindingRuntime().rebuildFlowMapTexture(),
    ensureShadowTargets: () => getShadowPipelineBindingRuntime().ensureShadowTargets(),
    renderShadowPipeline: (params) => getShadowPipelineBindingRuntime().renderShadowPipeline(params),
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
