export function createRenderBootstrapState(deps) {
  const splatTex = deps.createTexture();
  const normalsTex = deps.createTexture();
  const heightTex = deps.createTexture();
  const waterTex = deps.createTexture();
  const flowMapTex = deps.createLinearTexture();
  const waterTrailTex = deps.createLinearTexture();
  const materialSplatTex = deps.createLinearTexture();
  const detailMicroColorTex = deps.createLinearTexture();
  const detailAtlasState = {
    available: false,
    loadedSourceCount: 0,
    microRects: [
      [0, 0, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
    materialSplatAvailable: false,
    settings: null,
  };
  const pointLightTex = deps.createTexture();
  const cloudNoiseTex = deps.gl.createTexture();
  const shadowRawTex = deps.createTexture();
  const shadowBlurTex = deps.createTexture();
  const shadowRawFbo = deps.gl.createFramebuffer();
  const shadowBlurFbo = deps.gl.createFramebuffer();
  const shadowSize = { width: 1, height: 1 };
  const splatSize = { width: 1, height: 1 };
  const heightSize = { width: 1, height: 1 };
  const normalsSize = { width: 1, height: 1 };
  const pointLightBakeCanvas = deps.document.createElement("canvas");
  const pointLightBakeCtx = pointLightBakeCanvas.getContext("2d");
  if (!pointLightBakeCtx) {
    throw new Error("Point-light bake canvas 2D context is required.");
  }

  return {
    splatTex,
    normalsTex,
    heightTex,
    waterTex,
    flowMapTex,
    waterTrailTex,
    materialSplatTex,
    detailMicroColorTex,
    detailAtlasState,
    pointLightTex,
    cloudNoiseTex,
    shadowRawTex,
    shadowBlurTex,
    shadowRawFbo,
    shadowBlurFbo,
    shadowSize,
    splatSize,
    heightSize,
    normalsSize,
    pointLightBakeCanvas,
    pointLightBakeCtx,
  };
}
