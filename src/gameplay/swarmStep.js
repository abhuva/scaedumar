export function createSwarmStepFunction(deps) {
  function limitVector3(x, y, z, maxLen) {
    const len = Math.hypot(x, y, z);
    if (len <= maxLen || len <= 0.000001) {
      return [x, y, z];
    }
    const scale = maxLen / len;
    return [x * scale, y * scale, z * scale];
  }

  function hash01(seed) {
    const s = Math.sin(seed) * 43758.5453123;
    return s - Math.floor(s);
  }

  return function stepSwarm(settings, dt, nowMs) {
    const width = Math.max(1, deps.splatSize.width);
    const height = Math.max(1, deps.splatSize.height);
    const maxX = Math.max(0, width - 1);
    const maxY = Math.max(0, height - 1);
    const neighborRadiusSq = settings.neighborRadius * settings.neighborRadius;
    const separationRadiusSq = settings.separationRadius * settings.separationRadius;
    const cursorRadiusSq = settings.cursorRadius * settings.cursorRadius;
    const minFlight = settings.minHeight;
    const maxFlight = settings.maxHeight;
    const hawks = deps.swarmState.hawks;
    const restChancePerTick = deps.clamp(settings.restChancePct, 0, 0.002);
    const restTicks = Math.round(deps.clamp(settings.restTicks, 100, 10000));
    const hawkThreatRadiusSq = cursorRadiusSq;
    const maxBirds = Math.max(0, Math.round(settings.agentCount));
    const breedingThreshold = Math.round(deps.clamp(Number(settings.breedingThreshold), 0, maxBirds));
    const breedingSpawnChance = deps.clamp(Number(settings.breedingSpawnChance), 0, 1);
    const pendingRestBirths = [];

    if (!deps.swarmState.breedingActive && deps.swarmState.count < breedingThreshold) {
      deps.swarmState.breedingActive = true;
    } else if (deps.swarmState.breedingActive && deps.swarmState.count >= maxBirds) {
      deps.swarmState.breedingActive = false;
    }

    for (let i = 0; i < deps.swarmState.count; i++) {
      const px = deps.swarmState.x[i];
      const py = deps.swarmState.y[i];
      const pz = deps.swarmState.z[i];
      const vx = deps.swarmState.vx[i];
      const vy = deps.swarmState.vy[i];
      const vz = deps.swarmState.vz[i];
      const speedScale = deps.swarmState.speedScale[i] > 0 ? deps.swarmState.speedScale[i] : 1;
      const steerScale = deps.swarmState.steerScale[i] > 0 ? deps.swarmState.steerScale[i] : 1;
      const agentMaxSpeed = settings.maxSpeed * speedScale;
      const agentMaxSteering = settings.maxSteering * steerScale;
      let hawkThreat = false;
      if (settings.useHawk && hawks.length > 0) {
        for (const hawk of hawks) {
          const hdx = hawk.x - px;
          const hdy = hawk.y - py;
          const hawkDistSq = hdx * hdx + hdy * hdy;
          if (hawkDistSq <= hawkThreatRadiusSq) {
            hawkThreat = true;
            break;
          }
        }
      }
      const onWater = deps.isWaterAtSwarmCoord(px, py);
      if (deps.swarmState.isResting[i]) {
        if (hawkThreat) {
          deps.swarmState.isResting[i] = 0;
          deps.swarmState.restTicksLeft[i] = 0;
        } else if (onWater) {
          deps.swarmState.isResting[i] = 0;
          deps.swarmState.restTicksLeft[i] = 0;
        } else {
          if (deps.swarmState.restTicksLeft[i] > 0) {
            deps.swarmState.restTicksLeft[i] -= 1;
          }
          if (deps.swarmState.restTicksLeft[i] === 0) {
            deps.swarmState.isResting[i] = 0;
          } else {
            const floorZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(px, py));
            deps.swarmState.vx[i] = 0;
            deps.swarmState.vy[i] = 0;
            deps.swarmState.vz[i] = 0;
            deps.swarmState.z[i] = deps.clamp(floorZ, minFlight, maxFlight);
            deps.swarmState.ax[i] = 0;
            deps.swarmState.ay[i] = 0;
            deps.swarmState.az[i] = 0;
            continue;
          }
        }
      }
      let alignX = 0;
      let alignY = 0;
      let alignZ = 0;
      let cohX = 0;
      let cohY = 0;
      let cohZ = 0;
      let sepX = 0;
      let sepY = 0;
      let sepZ = 0;
      let neighborCount = 0;
      let separationCount = 0;

      for (let j = 0; j < deps.swarmState.count; j++) {
        if (i === j) continue;
        if (deps.swarmState.isResting[j]) continue;
        const dx = deps.swarmState.x[j] - px;
        const dy = deps.swarmState.y[j] - py;
        const dz = deps.swarmState.z[j] - pz;
        const dzScaled = dz * deps.swarmZNeighborScale;
        const distSq = dx * dx + dy * dy + dzScaled * dzScaled;
        if (distSq > neighborRadiusSq || distSq <= 0.000001) continue;
        neighborCount++;
        alignX += deps.swarmState.vx[j];
        alignY += deps.swarmState.vy[j];
        alignZ += deps.swarmState.vz[j];
        cohX += deps.swarmState.x[j];
        cohY += deps.swarmState.y[j];
        cohZ += deps.swarmState.z[j];
        if (distSq <= separationRadiusSq) {
          const invDist = 1 / Math.max(0.001, Math.sqrt(distSq));
          sepX -= dx * invDist;
          sepY -= dy * invDist;
          sepZ -= dzScaled * invDist;
          separationCount++;
        }
      }

      let accX = 0;
      let accY = 0;
      let accZ = 0;
      if (neighborCount > 0) {
        const invNeighbor = 1 / neighborCount;
        const avgVx = alignX * invNeighbor;
        const avgVy = alignY * invNeighbor;
        const avgVz = alignZ * invNeighbor;
        const alignLen = Math.hypot(avgVx, avgVy, avgVz);
        let alignTargetX = 0;
        let alignTargetY = 0;
        let alignTargetZ = 0;
        if (alignLen > 0.000001) {
          alignTargetX = (avgVx / alignLen) * settings.maxSpeed * speedScale;
          alignTargetY = (avgVy / alignLen) * settings.maxSpeed * speedScale;
          alignTargetZ = (avgVz / alignLen) * settings.maxSpeed * speedScale;
        }
        accX += (alignTargetX - vx) * settings.alignmentWeight;
        accY += (alignTargetY - vy) * settings.alignmentWeight;
        accZ += (alignTargetZ - vz) * settings.alignmentWeight;

        const centerX = cohX * invNeighbor;
        const centerY = cohY * invNeighbor;
        const centerZ = cohZ * invNeighbor;
        const toCenterX = centerX - px;
        const toCenterY = centerY - py;
        const toCenterZ = (centerZ - pz) * deps.swarmZNeighborScale;
        const toCenterLen = Math.hypot(toCenterX, toCenterY, toCenterZ);
        if (toCenterLen > 0.000001) {
          const cohTargetX = (toCenterX / toCenterLen) * settings.maxSpeed * speedScale;
          const cohTargetY = (toCenterY / toCenterLen) * settings.maxSpeed * speedScale;
          const cohTargetZ = (toCenterZ / toCenterLen) * settings.maxSpeed * speedScale;
          accX += (cohTargetX - vx) * settings.cohesionWeight;
          accY += (cohTargetY - vy) * settings.cohesionWeight;
          accZ += (cohTargetZ - vz) * settings.cohesionWeight;
        }
      }
      if (separationCount > 0) {
        const invSep = 1 / separationCount;
        const sepDirX = sepX * invSep;
        const sepDirY = sepY * invSep;
        const sepDirZ = sepZ * invSep;
        const sepLen = Math.hypot(sepDirX, sepDirY, sepDirZ);
        if (sepLen > 0.000001) {
          const sepTargetX = (sepDirX / sepLen) * settings.maxSpeed * speedScale;
          const sepTargetY = (sepDirY / sepLen) * settings.maxSpeed * speedScale;
          const sepTargetZ = (sepDirZ / sepLen) * settings.maxSpeed * speedScale;
          accX += (sepTargetX - vx) * settings.separationWeight;
          accY += (sepTargetY - vy) * settings.separationWeight;
          accZ += (sepTargetZ - vz) * settings.separationWeight;
        }
      }

      if (settings.wanderWeight > 0.0001) {
        const seed = (i + 1) * 12.9898 + nowMs * 0.0021;
        const angle = hash01(seed) * Math.PI * 2;
        accX += Math.cos(angle) * agentMaxSteering * settings.wanderWeight;
        accY += Math.sin(angle) * agentMaxSteering * settings.wanderWeight;
        accZ += (hash01(seed * 1.37 + 19.17) * 2 - 1) * agentMaxSteering * settings.wanderWeight * 0.35;
      }

      if (deps.swarmCursorState.active && settings.cursorMode !== "none" && settings.cursorStrength > 0.0001) {
        const cdx = deps.swarmCursorState.x - px;
        const cdy = deps.swarmCursorState.y - py;
        const cursorDistSq = cdx * cdx + cdy * cdy;
        if (cursorDistSq <= cursorRadiusSq && cursorDistSq > 0.000001) {
          const cursorDist = Math.sqrt(cursorDistSq);
          const cursorFalloff = 1 - cursorDist / settings.cursorRadius;
          const dirSign = settings.cursorMode === "attract" ? 1 : -1;
          const force = dirSign * settings.cursorStrength * agentMaxSteering * cursorFalloff;
          accX += (cdx / cursorDist) * force;
          accY += (cdy / cursorDist) * force;
        }
      }

      if (settings.useHawk && hawks.length > 0) {
        for (const hawk of hawks) {
          const hdx = hawk.x - px;
          const hdy = hawk.y - py;
          const hawkDistSq = hdx * hdx + hdy * hdy;
          if (hawkDistSq <= cursorRadiusSq && hawkDistSq > 0.000001) {
            const hawkDist = Math.sqrt(hawkDistSq);
            const hawkFalloff = 1 - hawkDist / settings.cursorRadius;
            const force = settings.cursorStrength * agentMaxSteering * hawkFalloff;
            accX -= (hdx / hawkDist) * force;
            accY -= (hdy / hawkDist) * force;
          }
        }
      }

      if (!hawkThreat && !onWater && restChancePerTick > 0 && Math.random() < restChancePerTick) {
        deps.swarmState.isResting[i] = 1;
        deps.swarmState.restTicksLeft[i] = restTicks;
        const floorZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(px, py));
        deps.swarmState.vx[i] = 0;
        deps.swarmState.vy[i] = 0;
        deps.swarmState.vz[i] = 0;
        deps.swarmState.z[i] = deps.clamp(floorZ, minFlight, maxFlight);
        deps.swarmState.ax[i] = 0;
        deps.swarmState.ay[i] = 0;
        deps.swarmState.az[i] = 0;
        if (
          deps.swarmState.breedingActive
          && breedingSpawnChance > 0
          && deps.swarmState.count + pendingRestBirths.length < maxBirds
          && Math.random() < breedingSpawnChance
        ) {
          pendingRestBirths.push({ x: px, y: py });
        }
        continue;
      }

      [deps.swarmState.ax[i], deps.swarmState.ay[i], deps.swarmState.az[i]] = limitVector3(accX, accY, accZ, agentMaxSteering);
    }

    for (let i = 0; i < deps.swarmState.count; i++) {
      if (deps.swarmState.isResting[i]) {
        const floorZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(deps.swarmState.x[i], deps.swarmState.y[i]));
        deps.swarmState.vx[i] = 0;
        deps.swarmState.vy[i] = 0;
        deps.swarmState.vz[i] = 0;
        deps.swarmState.z[i] = deps.clamp(floorZ, minFlight, maxFlight);
        continue;
      }
      const nextVx = deps.swarmState.vx[i] + deps.swarmState.ax[i] * dt;
      const nextVy = deps.swarmState.vy[i] + deps.swarmState.ay[i] * dt;
      const nextVz = deps.swarmState.vz[i] + deps.swarmState.az[i] * dt;
      const speedScale = deps.swarmState.speedScale[i] > 0 ? deps.swarmState.speedScale[i] : 1;
      const agentMaxSpeed = settings.maxSpeed * speedScale;
      const agentMinSpeed = Math.max(10, agentMaxSpeed * 0.45);
      const speed = Math.hypot(nextVx, nextVy, nextVz);
      let finalVx = nextVx;
      let finalVy = nextVy;
      let finalVz = nextVz;
      if (speed > agentMaxSpeed) {
        const scale = agentMaxSpeed / speed;
        finalVx *= scale;
        finalVy *= scale;
        finalVz *= scale;
      } else if (speed < agentMinSpeed) {
        const dirX = speed > 0.000001 ? nextVx / speed : Math.cos(i * 0.61803398875);
        const dirY = speed > 0.000001 ? nextVy / speed : Math.sin(i * 0.61803398875);
        const dirZ = speed > 0.000001 ? nextVz / speed : Math.sin(i * 0.38196601125) * 0.2;
        finalVx = dirX * agentMinSpeed;
        finalVy = dirY * agentMinSpeed;
        finalVz = dirZ * agentMinSpeed;
      }
      deps.swarmState.vx[i] = finalVx;
      deps.swarmState.vy[i] = finalVy;
      deps.swarmState.vz[i] = finalVz;

      let nx = deps.swarmState.x[i] + finalVx * dt;
      let ny = deps.swarmState.y[i] + finalVy * dt;
      let nz = deps.swarmState.z[i] + finalVz * dt;
      if (nx < 0) {
        nx = 0;
        deps.swarmState.vx[i] = Math.abs(deps.swarmState.vx[i]) * 0.75;
      } else if (nx > maxX) {
        nx = maxX;
        deps.swarmState.vx[i] = -Math.abs(deps.swarmState.vx[i]) * 0.75;
      }
      if (ny < 0) {
        ny = 0;
        deps.swarmState.vy[i] = Math.abs(deps.swarmState.vy[i]) * 0.75;
      } else if (ny > maxY) {
        ny = maxY;
        deps.swarmState.vy[i] = -Math.abs(deps.swarmState.vy[i]) * 0.75;
      }
      if (!deps.isSwarmCoordFlyable(nx, ny, maxFlight)) {
        nx = deps.swarmState.x[i];
        ny = deps.swarmState.y[i];
        deps.swarmState.vx[i] = -deps.swarmState.vx[i] * 0.6;
        deps.swarmState.vy[i] = -deps.swarmState.vy[i] * 0.6;
      }
      const minAllowedZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(nx, ny));
      if (nz < minAllowedZ) {
        nz = minAllowedZ;
        deps.swarmState.vz[i] = Math.abs(deps.swarmState.vz[i]) * 0.75;
      }
      if (nz < minFlight) {
        nz = minFlight + (minFlight - nz);
        deps.swarmState.vz[i] = Math.abs(deps.swarmState.vz[i]) * 0.75;
      } else if (nz > maxFlight) {
        nz = maxFlight - (nz - maxFlight);
        deps.swarmState.vz[i] = -Math.abs(deps.swarmState.vz[i]) * 0.75;
      }
      deps.swarmState.x[i] = nx;
      deps.swarmState.y[i] = ny;
      deps.swarmState.z[i] = deps.clamp(nz, minFlight, maxFlight);
    }

    if (deps.swarmState.breedingActive && pendingRestBirths.length > 0) {
      for (const birth of pendingRestBirths) {
        if (deps.swarmState.count >= maxBirds) break;
        deps.spawnRestingBirdNear(birth.x, birth.y, settings);
      }
    }
    if (!deps.swarmState.breedingActive && deps.swarmState.count < breedingThreshold) {
      deps.swarmState.breedingActive = true;
    } else if (deps.swarmState.breedingActive && deps.swarmState.count >= maxBirds) {
      deps.swarmState.breedingActive = false;
    }

    if (!settings.useHawk || hawks.length === 0) return;

    const currentTick = Math.max(0, Math.round(deps.swarmState.stepCount));
    for (let hawkIndex = hawks.length - 1; hawkIndex >= 0; hawkIndex--) {
      const hawk = hawks[hawkIndex];
      if (!Number.isInteger(hawk.targetIndex) || hawk.targetIndex < 0 || hawk.targetIndex >= deps.swarmState.count) {
        hawk.targetIndex = deps.chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, settings.hawkTargetRange);
      }
      if (deps.swarmState.count <= 0 || hawk.targetIndex < 0) continue;
      const targetX = deps.swarmState.x[hawk.targetIndex];
      const targetY = deps.swarmState.y[hawk.targetIndex];
      const targetZ = deps.swarmState.z[hawk.targetIndex];
      const toTargetX = targetX - hawk.x;
      const toTargetY = targetY - hawk.y;
      const toTargetZ = (targetZ - hawk.z) * deps.swarmZNeighborScale;
      const toTargetLen = Math.hypot(toTargetX, toTargetY, toTargetZ);
      if (toTargetLen <= 2) {
        const killInterval = Math.max(0, currentTick - Math.max(0, Math.round(Number(hawk.lastKillTick) || 0)));
        deps.swarmState.hawkKillIntervalSum += killInterval;
        deps.swarmState.hawkKillCount += 1;
        deps.removeSwarmAgentAtIndex(hawk.targetIndex);
        hawk.lastKillTick = currentTick;
        hawk.targetIndex = deps.chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, settings.hawkTargetRange);
        continue;
      }
      const aimX = deps.swarmState.x[hawk.targetIndex] - hawk.x;
      const aimY = deps.swarmState.y[hawk.targetIndex] - hawk.y;
      const aimZ = (deps.swarmState.z[hawk.targetIndex] - hawk.z) * deps.swarmZNeighborScale;
      const aimLen = Math.hypot(aimX, aimY, aimZ);
      const desiredVx = aimLen > 0.000001 ? (aimX / aimLen) * settings.hawkSpeed : 0;
      const desiredVy = aimLen > 0.000001 ? (aimY / aimLen) * settings.hawkSpeed : 0;
      const desiredVz = aimLen > 0.000001 ? (aimZ / aimLen) * settings.hawkSpeed : 0;
      const steerX = desiredVx - hawk.vx;
      const steerY = desiredVy - hawk.vy;
      const steerZ = desiredVz - hawk.vz;
      [hawk.ax, hawk.ay, hawk.az] = limitVector3(steerX, steerY, steerZ, settings.hawkSteering);

      hawk.vx += hawk.ax * dt;
      hawk.vy += hawk.ay * dt;
      hawk.vz += hawk.az * dt;
      const hawkSpeed = Math.hypot(hawk.vx, hawk.vy, hawk.vz);
      if (hawkSpeed > settings.hawkSpeed) {
        const scale = settings.hawkSpeed / hawkSpeed;
        hawk.vx *= scale;
        hawk.vy *= scale;
        hawk.vz *= scale;
      }

      let hx = hawk.x + hawk.vx * dt;
      let hy = hawk.y + hawk.vy * dt;
      let hz = hawk.z + hawk.vz * dt;
      if (hx < 0) {
        hx = 0;
        hawk.vx = Math.abs(hawk.vx) * 0.75;
      } else if (hx > maxX) {
        hx = maxX;
        hawk.vx = -Math.abs(hawk.vx) * 0.75;
      }
      if (hy < 0) {
        hy = 0;
        hawk.vy = Math.abs(hawk.vy) * 0.75;
      } else if (hy > maxY) {
        hy = maxY;
        hawk.vy = -Math.abs(hawk.vy) * 0.75;
      }
      if (!deps.isSwarmCoordFlyable(hx, hy, maxFlight)) {
        hx = hawk.x;
        hy = hawk.y;
        hawk.vx = -hawk.vx * 0.6;
        hawk.vy = -hawk.vy * 0.6;
        hawk.targetIndex = deps.chooseRandomSwarmTargetIndexNear(hawk.x, hawk.y, settings.hawkTargetRange);
      }
      const hawkMinZ = Math.max(minFlight, deps.terrainFloorAtSwarmCoord(hx, hy));
      hz = deps.clamp(hz, hawkMinZ, maxFlight);
      hawk.x = hx;
      hawk.y = hy;
      hawk.z = hz;
    }
  };
}
