import { createRenderResources } from "./resources.js";
import { createRenderer } from "./renderer.js";
import { createTerrainUniformUploader } from "./uniformUploader.js";
import { createShadowPass } from "./passes/shadowPass.js";
import { createBlurPass } from "./passes/blurPass.js";
import { createMainTerrainPass } from "./passes/mainTerrainPass.js";
import { createStructurePass } from "./passes/structurePass.js";
import { createAgentSpritePass } from "./passes/agentSpritePass.js";
import { createMapSpriteRenderer } from "./mapSpriteRenderer.js";

const DEFAULT_BG = [0, 0, 0];

export function createRenderPipelineRuntime(deps) {
  const renderResources = createRenderResources({ gl: deps.gl, canvas: deps.canvas });
  const renderer = createRenderer({ resources: renderResources, gl: deps.gl });
  const structureRenderer = createMapSpriteRenderer({
    gl: deps.gl,
    document: deps.document,
    loadImageFromUrl: deps.loadImageFromUrl,
    normalsTex: deps.normalsTex,
    pointLightTex: deps.pointLightTex,
    shadowBlurTex: deps.shadowBlurTex,
    shadowRawTex: deps.shadowRawTex,
    splatSize: deps.splatSize,
    getViewHalfExtents: deps.getViewHalfExtents,
    getMapAspect: deps.getMapAspect,
  });
  const agentSpriteRenderer = createMapSpriteRenderer({
    gl: deps.gl,
    document: deps.document,
    loadImageFromUrl: deps.loadImageFromUrl,
    normalsTex: deps.normalsTex,
    pointLightTex: deps.pointLightTex,
    shadowBlurTex: deps.shadowBlurTex,
    shadowRawTex: deps.shadowRawTex,
    splatSize: deps.splatSize,
    getViewHalfExtents: deps.getViewHalfExtents,
    getMapAspect: deps.getMapAspect,
  });
  const uploadUniforms = createTerrainUniformUploader({
    gl: deps.gl,
    document: deps.document,
    program: deps.program,
    uniforms: deps.uniforms,
    splatTex: deps.splatTex,
    normalsTex: deps.normalsTex,
    heightTex: deps.heightTex,
    slopeTex: deps.slopeTex,
    wetnessTex: deps.wetnessTex,
    pointLightTex: deps.pointLightTex,
    cloudNoiseTex: deps.cloudNoiseTex,
    shadowBlurTex: deps.shadowBlurTex,
    shadowRawTex: deps.shadowRawTex,
    waterTex: deps.waterTex,
    flowMapTex: deps.flowMapTex,
    waterTrailTex: deps.waterTrailTex,
    materialSplatTex: deps.materialSplatTex,
    detailMicroColorTex: deps.detailMicroColorTex,
    discoveryMaskTex: deps.discoveryMaskTex,
    slimeTrailOverlayTex: deps.slimeTrailOverlayTex,
    slimeTracksMaskTex: deps.slimeTracksMaskTex,
    slimeTrailOverlayTextureState: deps.slimeTrailOverlayTextureState,
    discoveryMaskTextureState: deps.discoveryMaskTextureState,
    slimeTracksMaskTextureState: deps.slimeTracksMaskTextureState,
    detailAtlasState: deps.detailAtlasState,
    heightSize: deps.heightSize,
    splatSize: deps.splatSize,
    canvas: deps.canvas,
    getViewHalfExtents: deps.getViewHalfExtents,
    cursorLightState: deps.cursorLightState,
    applyPointLightUsagePass: deps.applyPointLightUsagePass,
    getDiscoveryVisibilitySettings: deps.getDiscoveryVisibilitySettings,
    getDiscoveryVisibilitySnapshot: deps.getDiscoveryVisibilitySnapshot,
    getSlimeTrailOverlaySnapshot: deps.getSlimeTrailOverlaySnapshot,
    getSlimeTerrainUnderlaySnapshot: deps.getSlimeTerrainUnderlaySnapshot,
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

  renderer.registerPass("structures", createStructurePass({
    structureRenderer,
    getStructureRenderSnapshot: deps.getStructureRenderSnapshot,
    isVisible: deps.isStructureRenderVisible,
  }));

  renderer.registerPass("agentSprites", createAgentSpritePass({
    agentSpriteRenderer,
    getAgentSpriteRenderSnapshot: deps.getAgentSpriteRenderSnapshot,
    isVisible: deps.isAgentSpriteRenderVisible,
  }));

  renderer.registerPass("backgroundClear", {
    execute(frame) {
      const bg = frame.backgroundColorRgb || DEFAULT_BG;
      renderResources.clearColor(bg[0], bg[1], bg[2], 1);
    },
  });

  return {
    renderResources,
    renderer,
  };
}
