import { createGlResourceRuntime } from "./glResourceRuntime.js";
import { createFlowMapRuntime } from "./flowMapRuntime.js";
import { createShadowPipelineRuntime } from "./shadowPipelineRuntime.js";

export function withImageCacheBust(url, nowMs = undefined) {
  const text = String(url || "");
  if (!text || text.startsWith("data:") || text.startsWith("blob:")) return text;
  if (
    text.startsWith("asset:")
    || text.startsWith("file:")
    || text.startsWith("assets/")
    || text.startsWith("./assets/")
    || text.startsWith("../assets/")
    || nowMs == null
  ) {
    return text;
  }
  const separator = text.includes("?") ? "&" : "?";
  return `${text}${separator}terrainImageBust=${Math.max(0, Math.round(Number(nowMs) || 0))}`;
}

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

  function getImageUrlCandidates(url) {
    const primary = withImageCacheBust(url);
    const candidates = [primary];
    const noDot = primary.startsWith("./") ? primary.slice(2) : primary;
    const rootRelative = noDot.startsWith("/") ? noDot : `/${noDot}`;
    candidates.push(noDot, rootRelative);
    for (const candidate of [...candidates]) {
      if (!candidate.includes("%") && /\s/.test(candidate)) {
        candidates.push(encodeURI(candidate));
      }
    }
    return [...new Set(candidates)];
  }

  async function tryLoadImageFromUrl(url) {
    const image = new Image();
    image.decoding = "async";
    const loaded = new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image load error"));
      image.src = url;
    });
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("image load timed out")), 10000);
    });
    try {
      await Promise.race([loaded, timeout]);
      if (typeof image.decode === "function") {
        await image.decode();
      }
      return image;
    } finally {
      image.onload = null;
      image.onerror = null;
    }
  }

  async function loadImageFromUrl(url) {
    const errors = [];
    for (const imageUrl of getImageUrlCandidates(url)) {
      try {
        return await tryLoadImageFromUrl(imageUrl);
      } catch (error) {
        errors.push(`${imageUrl}: ${error instanceof Error ? error.message : error}`);
      }
    }
    throw new Error(`Failed to load image from ${url}: ${errors.join(" | ")}`);
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
    setFlowMapImage: (image) => getFlowMapRuntime().setFlowMapImage(image),
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
