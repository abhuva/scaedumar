export function createOverlayHooks(deps) {
  function updateGameplay(nowMs) {
    deps.updateSwarm(nowMs);
    deps.updateSwarmFollowCamera();
  }

  function renderOverlayIfNeeded(frameState) {
    if (deps.isOverlayDirty() || frameState.swarm.enabled) {
      deps.drawOverlay();
      deps.clearOverlayDirty();
    }
  }

  return {
    updateGameplay,
    renderOverlayIfNeeded,
  };
}
