export function createSwarmDataApplier(deps) {
  return function applySwarmData(rawData) {
    const data = rawData && typeof rawData === "object" ? rawData : {};
    deps.applySwarmSettings(data.settings && typeof data.settings === "object" ? data.settings : data);
    const settings = deps.getSwarmSettings();
    const state = data.state && typeof data.state === "object" ? data.state : null;
    let loadedState = false;
    deps.swarmState.stepCount = 0;
    deps.swarmState.hawkKillIntervalSum = 0;
    deps.swarmState.hawkKillCount = 0;
    deps.swarmState.breedingActive = false;

    if (state && Number.isFinite(Number(state.count))) {
      const count = Math.round(deps.clamp(Number(state.count), 0, 2000));
      if (count > 0 && Array.isArray(state.x) && Array.isArray(state.y) && Array.isArray(state.z) && state.x.length >= count && state.y.length >= count && state.z.length >= count) {
        deps.ensureSwarmBuffers(count);
        const maxX = Math.max(0, deps.splatSize.width - 1);
        const maxY = Math.max(0, deps.splatSize.height - 1);
        const maxFlight = settings.maxHeight;
        const minFlight = settings.minHeight;
        loadedState = true;
        for (let i = 0; i < count; i++) {
          const x = deps.clamp(Number(state.x[i]), 0, maxX);
          const y = deps.clamp(Number(state.y[i]), 0, maxY);
          if (!deps.isSwarmCoordFlyable(x, y, maxFlight)) {
            loadedState = false;
            break;
          }
          const minAllowedZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(x, y));
          deps.swarmState.x[i] = x;
          deps.swarmState.y[i] = y;
          deps.swarmState.z[i] = deps.clamp(Number(state.z[i]), minAllowedZ, maxFlight);
          deps.swarmState.vx[i] = Number.isFinite(Number(state.vx && state.vx[i])) ? Number(state.vx[i]) : 0;
          deps.swarmState.vy[i] = Number.isFinite(Number(state.vy && state.vy[i])) ? Number(state.vy[i]) : 0;
          deps.swarmState.vz[i] = Number.isFinite(Number(state.vz && state.vz[i])) ? Number(state.vz[i]) : 0;
          deps.swarmState.speedScale[i] = deps.clamp(Number.isFinite(Number(state.speedScale && state.speedScale[i])) ? Number(state.speedScale[i]) : 1, 0.5, 1.5);
          deps.swarmState.steerScale[i] = deps.clamp(Number.isFinite(Number(state.steerScale && state.steerScale[i])) ? Number(state.steerScale[i]) : 1, 0.5, 1.5);
          deps.swarmState.isResting[i] = Number(state.isResting && state.isResting[i]) ? 1 : 0;
          deps.swarmState.restTicksLeft[i] = Math.round(deps.clamp(Number(state.restTicksLeft && state.restTicksLeft[i]), 0, 10000));
        }
        if (loadedState) {
          deps.swarmState.count = count;
          deps.swarmState.stepCount = Math.max(0, Math.round(Number(state.stepCount) || 0));
          deps.swarmState.hawkKillIntervalSum = Math.max(0, Number(state.hawkKillIntervalSum) || 0);
          deps.swarmState.hawkKillCount = Math.max(0, Math.round(Number(state.hawkKillCount) || 0));
          deps.swarmState.breedingActive = Boolean(state.breedingActive);
          deps.swarmState.hawks = [];
          const hawks = Array.isArray(state.hawks) ? state.hawks : [];
          if (settings.useHawk) {
            for (const rawHawk of hawks.slice(0, 20)) {
              if (!rawHawk || typeof rawHawk !== "object") continue;
              const hx = deps.clamp(Number(rawHawk.x), 0, maxX);
              const hy = deps.clamp(Number(rawHawk.y), 0, maxY);
              if (!deps.isSwarmCoordFlyable(hx, hy, maxFlight)) continue;
              const hawkMinZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(hx, hy));
              deps.swarmState.hawks.push({
                x: hx,
                y: hy,
                z: deps.clamp(Number(rawHawk.z), hawkMinZ, maxFlight),
                vx: Number.isFinite(Number(rawHawk.vx)) ? Number(rawHawk.vx) : 0,
                vy: Number.isFinite(Number(rawHawk.vy)) ? Number(rawHawk.vy) : 0,
                vz: Number.isFinite(Number(rawHawk.vz)) ? Number(rawHawk.vz) : 0,
                ax: Number.isFinite(Number(rawHawk.ax)) ? Number(rawHawk.ax) : 0,
                ay: Number.isFinite(Number(rawHawk.ay)) ? Number(rawHawk.ay) : 0,
                az: Number.isFinite(Number(rawHawk.az)) ? Number(rawHawk.az) : 0,
                targetIndex: Number.isFinite(Number(rawHawk.targetIndex))
                  ? Math.round(deps.clamp(Number(rawHawk.targetIndex), 0, Math.max(0, count - 1)))
                  : deps.chooseRandomSwarmTargetIndexNear(hx, hy, settings.hawkTargetRange),
                lastKillTick: Math.max(0, Math.round(Number(rawHawk.lastKillTick) || 0)),
              });
            }
          }
        }
      }
    }

    if (!loadedState) {
      deps.reseedSwarmAgents(settings.agentCount);
    }

    const follow = data.follow && typeof data.follow === "object" ? data.follow : {};
    deps.applySwarmFollowState({
      enabled: settings.useAgentSwarm && Boolean(follow.enabled),
      targetType: follow.targetType,
      agentIndex: follow.agentIndex,
      hawkIndex: follow.hawkIndex,
    });
    deps.invalidateSwarmInterpolation();
    deps.syncSwarmRuntimeStateToStore();
    deps.requestOverlayDraw();
  };
}
