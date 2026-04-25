export function createSwarmReseeder(deps) {
  return function reseedSwarmAgents(count = deps.getSwarmSettings().agentCount) {
    deps.invalidateSwarmInterpolation();
    deps.ensureSwarmBuffers(count);
    const settings = deps.getSwarmSettings();
    const maxSpeed = settings.maxSpeed;
    const minFlight = settings.minHeight;
    const maxFlight = settings.maxHeight;
    const minSpeed = Math.min(Math.max(10, maxSpeed * 0.45), maxSpeed);
    const variation = settings.variationStrengthPct * 0.01;
    const width = Math.max(1, deps.splatSize.width);
    const height = Math.max(1, deps.splatSize.height);
    for (let i = 0; i < deps.swarmState.count; i++) {
      let spawnX = 0;
      let spawnY = 0;
      let found = false;
      for (let tries = 0; tries < 40; tries++) {
        const tx = Math.random() * Math.max(1, width - 1);
        const ty = Math.random() * Math.max(1, height - 1);
        if (!deps.isSwarmCoordFlyable(tx, ty, maxFlight)) continue;
        spawnX = tx;
        spawnY = ty;
        found = true;
        break;
      }
      if (!found) {
        spawnX = Math.random() * Math.max(1, width - 1);
        spawnY = Math.random() * Math.max(1, height - 1);
      }
      deps.swarmState.x[i] = spawnX;
      deps.swarmState.y[i] = spawnY;
      const zMin = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(spawnX, spawnY));
      deps.swarmState.z[i] = deps.clamp(zMin + Math.random() * Math.max(0, maxFlight - zMin), 0, maxFlight);
      const angle = Math.random() * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      deps.swarmState.vx[i] = Math.cos(angle) * speed;
      deps.swarmState.vy[i] = Math.sin(angle) * speed;
      deps.swarmState.vz[i] = (Math.random() * 2 - 1) * speed * 0.2;
      deps.swarmState.speedScale[i] = 1 + (Math.random() * 2 - 1) * variation;
      deps.swarmState.steerScale[i] = 1 + (Math.random() * 2 - 1) * variation;
      deps.swarmState.isResting[i] = 0;
      deps.swarmState.restTicksLeft[i] = 0;
    }
    deps.swarmState.lastUpdateMs = null;
    deps.swarmState.stepCount = 0;
    deps.swarmState.hawkKillIntervalSum = 0;
    deps.swarmState.hawkKillCount = 0;
    deps.swarmState.breedingActive = false;
    deps.swarmState.hawks = [];
    if (settings.useHawk) {
      for (let i = 0; i < settings.hawkCount; i++) {
        deps.swarmState.hawks.push(deps.createSpawnedHawk(minFlight, maxFlight, settings.hawkTargetRange));
      }
    }
    if (deps.swarmFollowState.enabled && deps.swarmFollowState.targetType === "agent") {
      deps.swarmFollowState.agentIndex = deps.chooseRandomFollowAgentIndex();
    } else if (!deps.swarmFollowState.enabled) {
      deps.swarmFollowState.agentIndex = -1;
    }
    deps.requestOverlayDraw();
  };
}
