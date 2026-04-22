export function createMainTerrainPass(deps) {
  return {
    execute(frame) {
      deps.resources.setViewport();
      deps.resources.clearColor(0, 0, 0, 1);
      deps.uploadUniforms(frame.lightingParams, frame.time.nowSec, frame.uniformInput);
      deps.drawTerrain();
    },
  };
}
