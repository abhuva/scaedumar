export function createStructurePass(deps) {
  if (!deps || typeof deps !== "object") {
    throw new Error("createStructurePass requires deps.");
  }
  if (!deps.structureRenderer || typeof deps.structureRenderer.render !== "function") {
    throw new Error("createStructurePass requires deps.structureRenderer.render().");
  }

  return {
    execute(frame) {
      if (typeof deps.isVisible === "function" && !deps.isVisible()) {
        return;
      }
      const snapshot = typeof deps.getStructureRenderSnapshot === "function"
        ? deps.getStructureRenderSnapshot()
        : null;
      deps.structureRenderer.render(frame, snapshot);
    },
  };
}
