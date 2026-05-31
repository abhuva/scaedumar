export function createAgentSpritePass(deps) {
  if (!deps || typeof deps !== "object") {
    throw new Error("createAgentSpritePass requires deps.");
  }
  if (!deps.agentSpriteRenderer || typeof deps.agentSpriteRenderer.render !== "function") {
    throw new Error("createAgentSpritePass requires deps.agentSpriteRenderer.render().");
  }

  return {
    execute(frame) {
      if (typeof deps.isVisible === "function" && !deps.isVisible()) {
        return;
      }
      const snapshot = typeof deps.getAgentSpriteRenderSnapshot === "function"
        ? deps.getAgentSpriteRenderSnapshot(frame)
        : null;
      deps.agentSpriteRenderer.render(frame, snapshot);
    },
  };
}
