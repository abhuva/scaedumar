export function createSwarmFollowCameraUpdater(deps) {
  function clampSmoothing(value) {
    return deps.clamp(Number(value), 0, 1);
  }

  return function updateSwarmFollowCamera() {
    const follow = deps.getSwarmFollowSnapshot();
    if (!follow.enabled) return;
    if (!deps.isSwarmEnabled() || deps.swarmState.count <= 0) {
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
      let nextZoom = deps.getZoom();
      if (settings.followZoomBySpeed) {
        const speedNormRaw = deps.clamp(Math.hypot(hawk.vx, hawk.vy) / Math.max(1, settings.hawkSpeed), 0, 1);
        const speedSmoothing = clampSmoothing(settings.followAgentSpeedSmoothing);
        const zoomSmoothing = clampSmoothing(settings.followAgentZoomSmoothing);
        const speedNormFiltered = deps.getSwarmFollowSpeedNormFiltered();
        if (!Number.isFinite(speedNormFiltered)) {
          deps.setSwarmFollowSpeedNormFiltered(speedNormRaw);
        } else {
          deps.setSwarmFollowSpeedNormFiltered(speedNormFiltered + (speedNormRaw - speedNormFiltered) * speedSmoothing);
        }
        const targetZoom = settings.followZoomIn
          + (settings.followZoomOut - settings.followZoomIn) * deps.getSwarmFollowSpeedNormFiltered();
        nextZoom = deps.clamp(deps.getZoom() + (targetZoom - deps.getZoom()) * zoomSmoothing, deps.zoomMin, deps.zoomMax);
      }
      deps.dispatchCoreCommand({
        type: "core/camera/setPose",
        panX: hawkWorld.x,
        panY: hawkWorld.y,
        zoom: nextZoom,
        requestOverlay: false,
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
    let nextZoom = deps.getZoom();
    if (settings.followZoomBySpeed) {
      const speedNormRaw = deps.clamp(
        Math.hypot(deps.swarmState.vx[agentIndex], deps.swarmState.vy[agentIndex]) / Math.max(1, settings.maxSpeed),
        0,
        1,
      );
      const speedNormFiltered = deps.getSwarmFollowSpeedNormFiltered();
      if (!Number.isFinite(speedNormFiltered)) {
        deps.setSwarmFollowSpeedNormFiltered(speedNormRaw);
      } else {
        deps.setSwarmFollowSpeedNormFiltered(
          speedNormFiltered + (speedNormRaw - speedNormFiltered) * clampSmoothing(settings.followAgentSpeedSmoothing),
        );
      }
      const targetZoom = settings.followZoomIn
        + (settings.followZoomOut - settings.followZoomIn) * deps.getSwarmFollowSpeedNormFiltered();
      nextZoom = deps.clamp(
        deps.getZoom() + (targetZoom - deps.getZoom()) * clampSmoothing(settings.followAgentZoomSmoothing),
        deps.zoomMin,
        deps.zoomMax,
      );
    }
    deps.dispatchCoreCommand({
      type: "core/camera/setPose",
      panX: world.x,
      panY: world.y,
      zoom: nextZoom,
      requestOverlay: false,
    });
  };
}
