export function createSwarmTargeting(deps) {
  function chooseRandomSwarmTargetIndex() {
    if (deps.swarmState.count <= 0) return -1;
    return Math.floor(Math.random() * deps.swarmState.count);
  }

  function chooseRandomSwarmTargetIndexNear(centerX, centerY, rangePx) {
    if (deps.swarmState.count <= 0) return -1;
    const radius = Math.max(0, Number(rangePx) || 0);
    if (radius <= 0) return chooseRandomSwarmTargetIndex();
    const radiusSq = radius * radius;
    let selected = -1;
    let matches = 0;
    for (let i = 0; i < deps.swarmState.count; i++) {
      const dx = deps.swarmState.x[i] - centerX;
      const dy = deps.swarmState.y[i] - centerY;
      if (dx * dx + dy * dy > radiusSq) continue;
      matches += 1;
      if (Math.random() < 1 / matches) {
        selected = i;
      }
    }
    return selected >= 0 ? selected : chooseRandomSwarmTargetIndex();
  }

  function chooseRandomFollowAgentIndex() {
    return chooseRandomSwarmTargetIndex();
  }

  function chooseRandomFollowHawkIndex() {
    if (deps.swarmState.hawks.length <= 0) return -1;
    return Math.floor(Math.random() * deps.swarmState.hawks.length);
  }

  function createSpawnedHawk(minFlight, maxFlight, targetRangePx) {
    const width = Math.max(1, deps.splatSize.width);
    const height = Math.max(1, deps.splatSize.height);
    const x = Math.random() * Math.max(1, width - 1);
    const y = Math.random() * Math.max(1, height - 1);
    const z = deps.clamp(deps.terrainFloorAtSwarmCoord(x, y) + 4, minFlight, maxFlight);
    return {
      x,
      y,
      z,
      vx: 0,
      vy: 0,
      vz: 0,
      ax: 0,
      ay: 0,
      az: 0,
      targetIndex: chooseRandomSwarmTargetIndexNear(x, y, targetRangePx),
      lastKillTick: Math.max(0, Math.round(deps.swarmState.stepCount)),
    };
  }

  return {
    chooseRandomSwarmTargetIndex,
    chooseRandomSwarmTargetIndexNear,
    chooseRandomFollowAgentIndex,
    chooseRandomFollowHawkIndex,
    createSpawnedHawk,
  };
}
