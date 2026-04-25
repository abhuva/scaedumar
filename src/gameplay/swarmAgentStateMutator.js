export function createSwarmAgentStateMutator(deps) {
  function ensureSwarmBuffers(count) {
    if (deps.swarmState.count === count) return;
    deps.invalidateSwarmInterpolation();
    deps.swarmState.count = count;
    deps.swarmState.x = new Float32Array(count);
    deps.swarmState.y = new Float32Array(count);
    deps.swarmState.z = new Float32Array(count);
    deps.swarmState.vx = new Float32Array(count);
    deps.swarmState.vy = new Float32Array(count);
    deps.swarmState.vz = new Float32Array(count);
    deps.swarmState.speedScale = new Float32Array(count);
    deps.swarmState.steerScale = new Float32Array(count);
    deps.swarmState.isResting = new Uint8Array(count);
    deps.swarmState.restTicksLeft = new Uint16Array(count);
    deps.swarmState.ax = new Float32Array(count);
    deps.swarmState.ay = new Float32Array(count);
    deps.swarmState.az = new Float32Array(count);
  }

  function removeSwarmAgentAtIndex(removeIndex) {
    if (!Number.isInteger(removeIndex) || removeIndex < 0 || removeIndex >= deps.swarmState.count) return false;
    deps.invalidateSwarmInterpolation();
    const oldCount = deps.swarmState.count;
    const newCount = oldCount - 1;
    if (newCount <= 0) {
      ensureSwarmBuffers(0);
      for (const hawk of deps.swarmState.hawks) {
        hawk.targetIndex = -1;
      }
      if (deps.swarmFollowState.targetType === "agent") {
        deps.stopSwarmFollow();
      } else {
        deps.swarmFollowState.agentIndex = -1;
      }
      return true;
    }

    const lastIndex = oldCount - 1;
    if (removeIndex !== lastIndex) {
      deps.swarmState.x[removeIndex] = deps.swarmState.x[lastIndex];
      deps.swarmState.y[removeIndex] = deps.swarmState.y[lastIndex];
      deps.swarmState.z[removeIndex] = deps.swarmState.z[lastIndex];
      deps.swarmState.vx[removeIndex] = deps.swarmState.vx[lastIndex];
      deps.swarmState.vy[removeIndex] = deps.swarmState.vy[lastIndex];
      deps.swarmState.vz[removeIndex] = deps.swarmState.vz[lastIndex];
      deps.swarmState.speedScale[removeIndex] = deps.swarmState.speedScale[lastIndex];
      deps.swarmState.steerScale[removeIndex] = deps.swarmState.steerScale[lastIndex];
      deps.swarmState.isResting[removeIndex] = deps.swarmState.isResting[lastIndex];
      deps.swarmState.restTicksLeft[removeIndex] = deps.swarmState.restTicksLeft[lastIndex];
      deps.swarmState.ax[removeIndex] = deps.swarmState.ax[lastIndex];
      deps.swarmState.ay[removeIndex] = deps.swarmState.ay[lastIndex];
      deps.swarmState.az[removeIndex] = deps.swarmState.az[lastIndex];
    }
    deps.swarmState.count = newCount;

    const hawkTargetRange = deps.getSwarmSettings().hawkTargetRange;
    for (const hawk of deps.swarmState.hawks) {
      if (!Number.isInteger(hawk.targetIndex)) {
        hawk.targetIndex = deps.chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, hawkTargetRange);
        continue;
      }
      if (hawk.targetIndex === removeIndex) {
        hawk.targetIndex = deps.chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, hawkTargetRange);
      } else if (hawk.targetIndex === lastIndex && removeIndex !== lastIndex) {
        hawk.targetIndex = removeIndex;
      }
    }

    if (deps.swarmFollowState.targetType === "agent") {
      if (deps.swarmFollowState.agentIndex === removeIndex) {
        deps.swarmFollowState.agentIndex = deps.chooseRandomFollowAgentIndex();
        if (deps.swarmFollowState.agentIndex < 0) {
          deps.stopSwarmFollow({ resetSpeed: true });
        }
      } else if (deps.swarmFollowState.agentIndex === lastIndex && removeIndex !== lastIndex) {
        deps.swarmFollowState.agentIndex = removeIndex;
      }
    }

    return true;
  }

  function appendSwarmAgentState(agent) {
    deps.invalidateSwarmInterpolation();
    const oldCount = deps.swarmState.count;
    const newCount = oldCount + 1;
    const nextX = new Float32Array(newCount);
    const nextY = new Float32Array(newCount);
    const nextZ = new Float32Array(newCount);
    const nextVx = new Float32Array(newCount);
    const nextVy = new Float32Array(newCount);
    const nextVz = new Float32Array(newCount);
    const nextSpeedScale = new Float32Array(newCount);
    const nextSteerScale = new Float32Array(newCount);
    const nextIsResting = new Uint8Array(newCount);
    const nextRestTicksLeft = new Uint16Array(newCount);
    const nextAx = new Float32Array(newCount);
    const nextAy = new Float32Array(newCount);
    const nextAz = new Float32Array(newCount);
    if (oldCount > 0) {
      nextX.set(deps.swarmState.x);
      nextY.set(deps.swarmState.y);
      nextZ.set(deps.swarmState.z);
      nextVx.set(deps.swarmState.vx);
      nextVy.set(deps.swarmState.vy);
      nextVz.set(deps.swarmState.vz);
      nextSpeedScale.set(deps.swarmState.speedScale);
      nextSteerScale.set(deps.swarmState.steerScale);
      nextIsResting.set(deps.swarmState.isResting);
      nextRestTicksLeft.set(deps.swarmState.restTicksLeft);
      nextAx.set(deps.swarmState.ax);
      nextAy.set(deps.swarmState.ay);
      nextAz.set(deps.swarmState.az);
    }
    nextX[oldCount] = Number(agent.x) || 0;
    nextY[oldCount] = Number(agent.y) || 0;
    nextZ[oldCount] = Number(agent.z) || 0;
    nextVx[oldCount] = Number(agent.vx) || 0;
    nextVy[oldCount] = Number(agent.vy) || 0;
    nextVz[oldCount] = Number(agent.vz) || 0;
    nextSpeedScale[oldCount] = Number.isFinite(Number(agent.speedScale)) ? Number(agent.speedScale) : 1;
    nextSteerScale[oldCount] = Number.isFinite(Number(agent.steerScale)) ? Number(agent.steerScale) : 1;
    nextIsResting[oldCount] = Number(agent.isResting) ? 1 : 0;
    nextRestTicksLeft[oldCount] = Math.round(Math.max(0, Number(agent.restTicksLeft) || 0));
    nextAx[oldCount] = Number(agent.ax) || 0;
    nextAy[oldCount] = Number(agent.ay) || 0;
    nextAz[oldCount] = Number(agent.az) || 0;
    deps.swarmState.count = newCount;
    deps.swarmState.x = nextX;
    deps.swarmState.y = nextY;
    deps.swarmState.z = nextZ;
    deps.swarmState.vx = nextVx;
    deps.swarmState.vy = nextVy;
    deps.swarmState.vz = nextVz;
    deps.swarmState.speedScale = nextSpeedScale;
    deps.swarmState.steerScale = nextSteerScale;
    deps.swarmState.isResting = nextIsResting;
    deps.swarmState.restTicksLeft = nextRestTicksLeft;
    deps.swarmState.ax = nextAx;
    deps.swarmState.ay = nextAy;
    deps.swarmState.az = nextAz;
  }

  function spawnRestingBirdNear(parentX, parentY, settings) {
    const maxFlight = settings.maxHeight;
    const minFlight = settings.minHeight;
    const variation = settings.variationStrengthPct * 0.01;
    let spawnX = deps.clamp(parentX + (Math.random() * 2 - 1) * 2, 0, Math.max(0, deps.splatSize.width - 1));
    let spawnY = deps.clamp(parentY + (Math.random() * 2 - 1) * 2, 0, Math.max(0, deps.splatSize.height - 1));
    let found = false;
    for (let tries = 0; tries < 12; tries++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 2.2;
      const tx = deps.clamp(parentX + Math.cos(angle) * radius, 0, Math.max(0, deps.splatSize.width - 1));
      const ty = deps.clamp(parentY + Math.sin(angle) * radius, 0, Math.max(0, deps.splatSize.height - 1));
      if (!deps.isSwarmCoordFlyable(tx, ty, maxFlight)) continue;
      if (deps.isWaterAtSwarmCoord(tx, ty)) continue;
      spawnX = tx;
      spawnY = ty;
      found = true;
      break;
    }
    if (!found && (!deps.isSwarmCoordFlyable(spawnX, spawnY, maxFlight) || deps.isWaterAtSwarmCoord(spawnX, spawnY))) {
      return false;
    }
    const floorZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(spawnX, spawnY));
    appendSwarmAgentState({
      x: spawnX,
      y: spawnY,
      z: deps.clamp(floorZ, minFlight, maxFlight),
      vx: 0,
      vy: 0,
      vz: 0,
      speedScale: 1 + (Math.random() * 2 - 1) * variation,
      steerScale: 1 + (Math.random() * 2 - 1) * variation,
      isResting: 1,
      restTicksLeft: Math.round(deps.clamp(Number(settings.restTicks), 100, 10000)),
      ax: 0,
      ay: 0,
      az: 0,
    });
    return true;
  }

  return {
    ensureSwarmBuffers,
    removeSwarmAgentAtIndex,
    appendSwarmAgentState,
    spawnRestingBirdNear,
  };
}
