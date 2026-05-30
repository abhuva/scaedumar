export function createSwarmFollowCameraUpdater(deps) {
  const state = {
    key: "",
    x: Number.NaN,
    y: Number.NaN,
    zoom: Number.NaN,
    lastMs: Number.NaN,
  };

  function getZoomMin() {
    return typeof deps.getZoomMin === "function" ? deps.getZoomMin() : deps.zoomMin;
  }

  function getZoomMax() {
    return typeof deps.getZoomMax === "function" ? deps.getZoomMax() : deps.zoomMax;
  }

  function clampGain(value, fallback) {
    const parsed = Number(value);
    return deps.clamp(Number.isFinite(parsed) ? parsed : fallback, 0, 1);
  }

  function getFrameScale(nowMs) {
    const now = Number(nowMs);
    const last = Number(state.lastMs);
    if (!Number.isFinite(now) || !Number.isFinite(last) || now < last) return 1;
    return deps.clamp((now - last) / (1000 / 60), 0, 8);
  }

  function gainToAlpha(gain, frameScale) {
    if (gain <= 0) return 0;
    if (gain >= 1) return 1;
    return 1 - ((1 - gain) ** frameScale);
  }

  function getAgentId(index) {
    return deps.swarmState.agentId && Number.isFinite(Number(deps.swarmState.agentId[index]))
      ? Math.round(Number(deps.swarmState.agentId[index]))
      : index + 1;
  }

  function applyCameraTarget({ key, x, y, speedNorm, nowMs, settings }) {
    const currentZoom = deps.getZoom();
    const frameScale = getFrameScale(nowMs);
    const positionGain = clampGain(settings.followCameraPositionSmoothing, 0.12);
    const zoomGain = clampGain(settings.followAgentZoomSmoothing, 0.12);
    const targetChanged = state.key !== key || !Number.isFinite(state.x) || !Number.isFinite(state.y);

    if (targetChanged) {
      state.key = key;
      state.x = x;
      state.y = y;
      state.zoom = currentZoom;
    } else {
      const positionAlpha = gainToAlpha(positionGain, frameScale);
      state.x += (x - state.x) * positionAlpha;
      state.y += (y - state.y) * positionAlpha;
    }

    let nextZoom = Number.isFinite(state.zoom) ? state.zoom : currentZoom;
    const targetZoom = settings.followZoomIn
      + (settings.followZoomOut - settings.followZoomIn) * deps.clamp(speedNorm, 0, 1);
    nextZoom += (targetZoom - nextZoom) * gainToAlpha(zoomGain, frameScale);
    state.zoom = deps.clamp(nextZoom, getZoomMin(), getZoomMax());
    state.lastMs = Number.isFinite(Number(nowMs)) ? Number(nowMs) : state.lastMs;

    deps.dispatchCoreCommand({
      type: "core/camera/setPose",
      panX: state.x,
      panY: state.y,
      zoom: state.zoom,
      requestOverlay: false,
    });
  }

  return function updateSwarmFollowCamera(nowMs) {
    const follow = deps.getSwarmFollowSnapshot();
    if (!follow.enabled) return;
    if (!deps.isSwarmEnabled() || (deps.swarmState.count <= 0 && deps.swarmState.hawks.length <= 0)) {
      deps.stopSwarmFollow({ syncStore: true });
      return;
    }

    const settings = deps.getSwarmSettings();
    if (follow.targetType === "hawk") {
      if (!settings.useHawk || deps.swarmState.hawks.length <= 0) {
        deps.stopSwarmFollow({ targetType: "hawk", syncStore: true });
        return;
      }
      let hawkIndex = follow.hawkIndex;
      if (
        !Number.isInteger(hawkIndex)
        || hawkIndex < 0
        || hawkIndex >= deps.swarmState.hawks.length
      ) {
        hawkIndex = deps.chooseRandomFollowHawkIndex();
        deps.setSwarmFollowHawkIndex(hawkIndex);
      }
      if (hawkIndex < 0) return;

      const hawk = deps.swarmState.hawks[hawkIndex];
      const hawkPos = deps.writeInterpolatedSwarmHawkPos(hawkIndex, deps.swarmFollowHawkScratch);
      const hawkWorld = deps.mapCoordToWorld(hawkPos.x, hawkPos.y);
      applyCameraTarget({
        key: `hawk:${hawkIndex}`,
        x: hawkWorld.x,
        y: hawkWorld.y,
        speedNorm: Math.hypot(hawk.vx, hawk.vy) / Math.max(1, settings.hawkSpeed),
        nowMs,
        settings,
      });
      return;
    }

    let agentIndex = follow.agentIndex;
    if (
      !Number.isInteger(agentIndex)
      || agentIndex < 0
      || agentIndex >= deps.swarmState.count
    ) {
      agentIndex = deps.chooseRandomFollowAgentIndex();
      deps.setSwarmFollowAgentIndex(agentIndex);
    }
    if (agentIndex < 0) return;

    const agentPos = deps.writeInterpolatedSwarmAgentPos(agentIndex, deps.swarmFollowAgentScratch);
    const world = deps.mapCoordToWorld(agentPos.x, agentPos.y);
    applyCameraTarget({
      key: `agent:${getAgentId(agentIndex)}`,
      x: world.x,
      y: world.y,
      speedNorm: Math.hypot(deps.swarmState.vx[agentIndex], deps.swarmState.vy[agentIndex]) / Math.max(1, settings.maxSpeed),
      nowMs,
      settings,
    });
  };
}
