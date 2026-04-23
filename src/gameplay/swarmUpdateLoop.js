export function createSwarmUpdateLoop(deps) {
  return function updateSwarm(nowMs, dtSec, routedTiming) {
    deps.swarmRenderState.alpha = routedTiming && Number.isFinite(Number(routedTiming.interpolationAlpha))
      ? deps.clamp(Number(routedTiming.interpolationAlpha), 0, 1)
      : 1;
    if (!deps.isSwarmEnabled()) {
      return;
    }

    const settings = deps.getSwarmSettings();
    if (deps.swarmState.count <= 0 && (!settings.useHawk || deps.swarmState.hawks.length <= 0)) {
      return;
    }

    const baseDt = routedTiming && Number.isFinite(Number(routedTiming.dtSec))
      ? Number(routedTiming.dtSec)
      : Math.min(0.25, Math.max(0, Number(dtSec) || 0));
    const scaledDt = baseDt * settings.simulationSpeed;
    if (scaledDt <= 0) return;

    deps.captureSwarmRenderPreviousState();
    let remaining = scaledDt;
    const maxStep = 0.05;
    let guard = 0;
    while (remaining > 0.000001 && guard < 8) {
      const stepDt = Math.min(maxStep, remaining);
      deps.stepSwarm(settings, stepDt, nowMs);
      deps.swarmState.stepCount += 1;
      remaining -= stepDt;
      guard++;
    }
    deps.syncSwarmRuntimeStateToStore();
  };
}
