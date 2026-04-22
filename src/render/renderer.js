export function createRenderer(deps) {
  const passes = new Map();

  function registerPass(id, pass) {
    if (!id || typeof id !== "string") {
      throw new Error("Render pass id must be a non-empty string.");
    }
    if (!pass || typeof pass.execute !== "function") {
      throw new Error(`Render pass '${id}' must provide execute(frame).`);
    }
    passes.set(id, pass);
  }

  function executePass(id, frame) {
    const pass = passes.get(id);
    if (!pass) {
      throw new Error(`Render pass '${id}' is not registered.`);
    }
    pass.execute(frame);
  }

  return {
    registerPass,
    hasPass(id) {
      return passes.has(id);
    },
    listPasses() {
      return Array.from(passes.keys());
    },
    renderTerrainFrame(frame) {
      deps.resources.setViewport();
      if (frame.showTerrain) {
        executePass("shadow", frame);
        executePass("shadowBlur", frame);
        executePass("mainTerrain", frame);
        return;
      }
      executePass("backgroundClear", frame);
    },
  };
}
