export function createOverlayHooks(deps) {
  const animatedOverlayMinIntervalMs = 1000 / 60;
  let lastAnimatedOverlayDrawMs = -Infinity;

  function updateGameplay(nowMs, dtSec, swarmTiming) {
    deps.updateSwarm(nowMs, dtSec, swarmTiming);
    deps.updateSwarmFollowCamera(nowMs);
  }

  function renderOverlayIfNeeded(frameState) {
    const animateOverlay = typeof deps.shouldAnimateOverlay === "function"
      ? deps.shouldAnimateOverlay(frameState)
      : Boolean(frameState?.swarm?.enabled);
    const dirty = deps.isOverlayDirty();
    const nowMs = Number(frameState?.time?.nowMs);
    const canDrawAnimatedOverlay = animateOverlay
      && (!Number.isFinite(nowMs) || nowMs - lastAnimatedOverlayDrawMs >= animatedOverlayMinIntervalMs);
    if (dirty || canDrawAnimatedOverlay) {
      deps.drawOverlay();
      if (animateOverlay && Number.isFinite(nowMs)) {
        lastAnimatedOverlayDrawMs = nowMs;
      }
      deps.clearOverlayDirty();
    }
  }

  return {
    updateGameplay,
    renderOverlayIfNeeded,
  };
}
