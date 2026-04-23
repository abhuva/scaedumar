export function createSwarmFollowCameraUpdater(deps) {
  return function updateSwarmFollowCamera() {
    if (!deps.swarmFollowState.enabled) return;
    if (!deps.isSwarmEnabled() || deps.swarmState.count <= 0) {
      deps.stopSwarmFollow({ syncStore: true });
      return;
    }

    const settings = deps.getSwarmSettings();
    if (deps.swarmFollowState.targetType === "hawk") {
      if (!settings.useHawk || deps.swarmState.hawks.length <= 0) {
        deps.stopSwarmFollow({ targetType: "hawk", syncStore: true });
        return;
      }
      if (
        !Number.isInteger(deps.swarmFollowState.hawkIndex)
        || deps.swarmFollowState.hawkIndex < 0
        || deps.swarmFollowState.hawkIndex >= deps.swarmState.hawks.length
      ) {
        deps.swarmFollowState.hawkIndex = deps.chooseRandomFollowHawkIndex();
      }
      if (deps.swarmFollowState.hawkIndex < 0) return;

      const hawk = deps.swarmState.hawks[deps.swarmFollowState.hawkIndex];
      const hawkPos = deps.writeInterpolatedSwarmHawkPos(deps.swarmFollowState.hawkIndex, deps.swarmFollowHawkScratch);
      const hawkWorld = deps.mapCoordToWorld(hawkPos.x, hawkPos.y);
      let nextZoom = deps.getZoom();
      if (settings.followZoomBySpeed) {
        const speedNormRaw = deps.clamp(Math.hypot(hawk.vx, hawk.vy) / Math.max(1, settings.hawkSpeed), 0, 1);
        if (!Number.isFinite(deps.swarmFollowState.speedNormFiltered)) {
          deps.swarmFollowState.speedNormFiltered = speedNormRaw;
        } else {
          deps.swarmFollowState.speedNormFiltered += (speedNormRaw - deps.swarmFollowState.speedNormFiltered) * 0.18;
        }
        const targetZoom = settings.followZoomIn + (settings.followZoomOut - settings.followZoomIn) * deps.swarmFollowState.speedNormFiltered;
        nextZoom = deps.clamp(deps.getZoom() + (targetZoom - deps.getZoom()) * 0.14, deps.zoomMin, deps.zoomMax);
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

    if (
      !Number.isInteger(deps.swarmFollowState.agentIndex)
      || deps.swarmFollowState.agentIndex < 0
      || deps.swarmFollowState.agentIndex >= deps.swarmState.count
    ) {
      deps.swarmFollowState.agentIndex = deps.chooseRandomFollowAgentIndex();
    }
    if (deps.swarmFollowState.agentIndex < 0) return;

    const followIndex = deps.swarmFollowState.agentIndex;
    const agentPos = deps.writeInterpolatedSwarmAgentPos(followIndex, deps.swarmFollowAgentScratch);
    const world = deps.mapCoordToWorld(agentPos.x, agentPos.y);
    let nextZoom = deps.getZoom();
    if (settings.followZoomBySpeed) {
      const speedNormRaw = deps.clamp(
        Math.hypot(deps.swarmState.vx[followIndex], deps.swarmState.vy[followIndex]) / Math.max(1, settings.maxSpeed),
        0,
        1,
      );
      if (!Number.isFinite(deps.swarmFollowState.speedNormFiltered)) {
        deps.swarmFollowState.speedNormFiltered = speedNormRaw;
      } else {
        deps.swarmFollowState.speedNormFiltered += (speedNormRaw - deps.swarmFollowState.speedNormFiltered) * settings.followAgentSpeedSmoothing;
      }
      const targetZoom = settings.followZoomIn + (settings.followZoomOut - settings.followZoomIn) * deps.swarmFollowState.speedNormFiltered;
      nextZoom = deps.clamp(
        deps.getZoom() + (targetZoom - deps.getZoom()) * settings.followAgentZoomSmoothing,
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
