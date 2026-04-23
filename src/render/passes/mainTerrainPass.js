export function createMainTerrainPass(deps) {
  if (!deps || !deps.resources || typeof deps.resources !== "object") {
    throw new Error("createMainTerrainPass requires deps.resources.");
  }
  if (typeof deps.resources.setViewport !== "function") {
    throw new Error("createMainTerrainPass requires deps.resources.setViewport().");
  }
  if (typeof deps.resources.clearColor !== "function") {
    throw new Error("createMainTerrainPass requires deps.resources.clearColor().");
  }
  if (typeof deps.uploadUniforms !== "function") {
    throw new Error("createMainTerrainPass requires deps.uploadUniforms().");
  }
  if (typeof deps.drawTerrain !== "function") {
    throw new Error("createMainTerrainPass requires deps.drawTerrain().");
  }

  return {
    execute(frame) {
      deps.resources.setViewport();
      deps.resources.clearColor(0, 0, 0, 1);
      deps.uploadUniforms(frame.lightingParams, frame.time, frame.uniformInput, frame.camera || null);
      deps.drawTerrain();
    },
  };
}
