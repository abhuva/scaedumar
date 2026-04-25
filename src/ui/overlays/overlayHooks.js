export function createOverlayHooks(deps) {
  function updateGameplay(nowMs, dtSec, swarmTiming) {
    deps.updateSwarm(nowMs, dtSec, swarmTiming);
    deps.updateSwarmFollowCamera();
  }

  function renderOverlayIfNeeded(frameState) {
    const animateOverlay = typeof deps.shouldAnimateOverlay === "function"
      ? deps.shouldAnimateOverlay(frameState)
      : Boolean(frameState?.swarm?.enabled);
    if (deps.isOverlayDirty() || animateOverlay) {
      deps.drawOverlay();
      deps.clearOverlayDirty();
    }
  }

  return {
    updateGameplay,
    renderOverlayIfNeeded,
  };
}
