export function createRenderer(deps) {
  if (!deps || typeof deps !== "object") {
    throw new Error("createRenderer requires a deps object.");
  }
  if (!deps.resources || typeof deps.resources !== "object") {
    throw new Error("createRenderer requires deps.resources.");
  }
  if (typeof deps.resources.setViewport !== "function") {
    throw new Error("createRenderer requires deps.resources.setViewport().");
  }
  if (typeof deps.resources.hasDrawableSurface !== "function") {
    throw new Error("createRenderer requires deps.resources.hasDrawableSurface().");
  }

  const passes = new Map();

  function registerPass(id, pass) {
    if (!id || typeof id !== "string") {
      throw new Error("Render pass id must be a non-empty string.");
    }
    if (!pass || typeof pass.execute !== "function") {
      throw new Error(`Render pass '${id}' must provide execute(frame).`);
    }
    if (passes.has(id)) {
      throw new Error(`Render pass '${id}' is already registered.`);
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
      if (!frame || typeof frame !== "object") {
        throw new TypeError("renderTerrainFrame requires a valid frame object.");
      }
      if (!deps.resources.hasDrawableSurface()) {
        return;
      }
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
