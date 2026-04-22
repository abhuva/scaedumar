export function createOverlayHooks(deps) {
  function updateGameplay(nowMs) {
    deps.updateSwarm(nowMs);
    deps.updateSwarmFollowCamera();
  }

  function renderOverlayIfNeeded(frameState) {
    const swarmEnabled = Boolean(frameState?.swarm?.enabled);
    if (deps.isOverlayDirty() || swarmEnabled) {
      deps.drawOverlay();
      deps.clearOverlayDirty();
    }
  }

  return {
    updateGameplay,
    renderOverlayIfNeeded,
  };
}
