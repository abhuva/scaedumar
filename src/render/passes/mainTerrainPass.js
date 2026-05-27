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
      if (deps.resources.gl && typeof deps.resources.gl.bindFramebuffer === "function") {
        deps.resources.gl.bindFramebuffer(deps.resources.gl.FRAMEBUFFER, null);
      }
      deps.resources.setViewport();
      deps.resources.clearColor(0, 0, 0, 1);
      deps.uploadUniforms(frame.lightingParams, frame.time, frame.uniformInput, frame.camera || null);
      deps.drawTerrain();
    },
  };
}
