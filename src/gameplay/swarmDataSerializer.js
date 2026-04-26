export function createSwarmDataSerializer(deps) {
  return function serializeSwarmData() {
    const settings = deps.getSwarmSettings();
    const follow = deps.getSwarmFollowSnapshot();
    return {
      version: 1,
      settings,
      follow: {
        enabled: follow.enabled,
        targetType: follow.targetType,
        agentIndex: follow.agentIndex,
        hawkIndex: follow.hawkIndex,
      },
      state: {
        count: deps.swarmState.count,
        stepCount: Math.round(Math.max(0, deps.swarmState.stepCount)),
        hawkKillIntervalSum: Math.max(0, Number(deps.swarmState.hawkKillIntervalSum) || 0),
        hawkKillCount: Math.max(0, Math.round(Number(deps.swarmState.hawkKillCount) || 0)),
        breedingActive: Boolean(deps.swarmState.breedingActive),
        x: Array.from(deps.swarmState.x),
        y: Array.from(deps.swarmState.y),
        z: Array.from(deps.swarmState.z),
        vx: Array.from(deps.swarmState.vx),
        vy: Array.from(deps.swarmState.vy),
        vz: Array.from(deps.swarmState.vz),
        speedScale: Array.from(deps.swarmState.speedScale),
        steerScale: Array.from(deps.swarmState.steerScale),
        isResting: Array.from(deps.swarmState.isResting),
        restTicksLeft: Array.from(deps.swarmState.restTicksLeft),
        hawks: deps.swarmState.hawks.map((hawk) => ({
          x: Number(hawk.x) || 0,
          y: Number(hawk.y) || 0,
          z: Number(hawk.z) || 0,
          vx: Number(hawk.vx) || 0,
          vy: Number(hawk.vy) || 0,
          vz: Number(hawk.vz) || 0,
          ax: Number(hawk.ax) || 0,
          ay: Number(hawk.ay) || 0,
          az: Number(hawk.az) || 0,
          targetIndex: Math.round(Math.max(-1, Number(hawk.targetIndex) || -1)),
          lastKillTick: Math.round(Math.max(0, Number(hawk.lastKillTick) || 0)),
        })),
      },
    };
  };
}
