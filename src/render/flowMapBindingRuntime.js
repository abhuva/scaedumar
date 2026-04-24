import { createFlowMapRuntime } from "./flowMapRuntime.js";

export function createFlowMapBindingRuntime(deps) {
  const flowMapRuntime = createFlowMapRuntime({
    rebuildFlowMapTexturePrecompute: deps.rebuildFlowMapTexturePrecompute,
    gl: deps.gl,
    flowMapTex: deps.flowMapTex,
    getHeightImageData: deps.getHeightImageData,
    getHeightSize: deps.getHeightSize,
    clamp: deps.clamp,
    getWaterSettings: deps.getWaterSettings,
  });
  return {
    rebuildFlowMapTexture: () => flowMapRuntime.rebuildFlowMapTexture(),
  };
}
