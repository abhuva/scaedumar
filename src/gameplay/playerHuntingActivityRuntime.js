import { getResourceSearchCellKey } from "./playerResourceSearchActivityRuntime.js";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distanceSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function buildDirectHuntingPath(input = {}) {
  const fromX = Math.round(finite(input.fromX, 0));
  const fromY = Math.round(finite(input.fromY, 0));
  const toX = Math.round(finite(input.toX, fromX));
  const toY = Math.round(finite(input.toY, fromY));
  const path = [{ x: fromX, y: fromY }];
  let x = fromX;
  let y = fromY;
  let guard = Math.max(1, Math.abs(toX - fromX) + Math.abs(toY - fromY) + 4);
  while ((x !== toX || y !== toY) && guard > 0) {
    const dx = Math.sign(toX - x);
    const dy = Math.sign(toY - y);
    x += dx;
    y += dy;
    path.push({ x, y });
    guard -= 1;
  }
  return path.length >= 2 ? path : [];
}

export function chooseHuntingPatrolTarget(input = {}) {
  const random = typeof input.random === "function" ? input.random : Math.random;
  const originX = Math.round(finite(input.originX, 0));
  const originY = Math.round(finite(input.originY, 0));
  const currentX = Math.round(finite(input.currentX, originX));
  const currentY = Math.round(finite(input.currentY, originY));
  const radius = Math.max(1, Math.round(finite(input.radius, 30)));
  const mapWidth = Math.max(1, Math.round(finite(input.mapWidth, 1)));
  const mapHeight = Math.max(1, Math.round(finite(input.mapHeight, 1)));
  const minDistance = Math.max(1, Math.round(finite(input.minDistance, radius * 0.25)));
  const recentCells = input.recentCells instanceof Set ? input.recentCells : new Set();
  const radiusSq = radius * radius;
  const minDistanceSq = minDistance * minDistance;

  let fallback = null;
  for (let attempt = 0; attempt < 48; attempt++) {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * radius;
    const x = clamp(Math.round(originX + Math.cos(angle) * distance), 0, mapWidth - 1);
    const y = clamp(Math.round(originY + Math.sin(angle) * distance), 0, mapHeight - 1);
    if (distanceSq(originX, originY, x, y) > radiusSq) continue;
    if (x === currentX && y === currentY) continue;
    const key = getResourceSearchCellKey(x, y);
    const candidate = { x, y, key };
    if (!fallback) fallback = candidate;
    if (recentCells.has(key)) continue;
    if (distanceSq(currentX, currentY, x, y) < minDistanceSq) continue;
    return candidate;
  }
  return fallback;
}

export function createHuntingActivityController(deps) {
  const runtime = deps.runtime;
  const playerState = deps.playerState;
  const activityType = deps.activityType;

  function pushRecent(x, y) {
    const key = getResourceSearchCellKey(x, y);
    runtime.recentCells.push(key);
    while (runtime.recentCells.length > 8) runtime.recentCells.shift();
  }

  function getRecentSet() {
    return new Set(runtime.recentCells);
  }

  function queueNextPatrol() {
    if (!runtime.active || runtime.ending || runtime.type !== activityType) return false;
    for (let attempt = 0; attempt < 24; attempt++) {
      const target = chooseHuntingPatrolTarget({
        originX: runtime.originX,
        originY: runtime.originY,
        currentX: playerState.pixelX,
        currentY: playerState.pixelY,
        radius: runtime.radius,
        mapWidth: deps.getMapWidth(),
        mapHeight: deps.getMapHeight(),
        recentCells: getRecentSet(),
        random: deps.random,
      });
      if (!target) break;
      const path = buildDirectHuntingPath({
        fromX: playerState.pixelX,
        fromY: playerState.pixelY,
        toX: target.x,
        toY: target.y,
      });
      if (deps.replaceMovementQueue(path, { silent: true })) return true;
      runtime.recentCells.push(target.key);
    }
    deps.stopActivity({ reason: "Unable to queue hunting movement.", cancelMovement: false });
    return false;
  }

  function startHunting() {
    if (runtime.active) return { ok: false, reason: "An activity is already active." };
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: "Cancel current travel before starting Hunting." };
    }
    const settings = typeof deps.getHuntingSettings === "function" ? deps.getHuntingSettings() : {};
    const radius = clamp(Math.round(finite(settings.radius, 30)), 1, 300);
    runtime.active = true;
    runtime.type = activityType;
    runtime.originX = Math.round(finite(playerState.pixelX, 0));
    runtime.originY = Math.round(finite(playerState.pixelY, 0));
    runtime.radius = radius;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set([getResourceSearchCellKey(runtime.originX, runtime.originY)]);
    runtime.recentCells = [getResourceSearchCellKey(runtime.originX, runtime.originY)];
    runtime.lastMessage = "Hunting started.";
    runtime.resourceId = "game";
    runtime.lastResourceValue = null;
    runtime.lastSearchChance = null;
    runtime.huntingAvailability = null;
    runtime.huntingRawAvailability = null;
    deps.setActivitySpeed1x();
    deps.syncStore();
    if (!queueNextPatrol()) return { ok: false, reason: runtime.lastMessage || "Unable to start Hunting." };
    deps.setStatus?.(`Hunting started within radius ${runtime.radius}.`);
    return { ok: true };
  }

  function onStepCompleted(step) {
    if (!runtime.active || runtime.ending || runtime.type !== activityType) return false;
    const x = Math.round(finite(step && step.toX, playerState.pixelX));
    const y = Math.round(finite(step && step.toY, playerState.pixelY));
    runtime.stepsTaken += 1;
    pushRecent(x, y);
    const settings = typeof deps.getHuntingSettings === "function" ? deps.getHuntingSettings() : {};
    deps.onHuntingSearch?.({ activityType, x, y });
    const sample = deps.sampleHuntingAvailability?.({
      x: runtime.originX,
      y: runtime.originY,
      radius: runtime.radius,
      effectiveMax: settings.trailEffectiveMax,
    }) || { availability: 0, rawAverage: 0 };
    const availability = clamp(finite(sample.availability, 0), 0, 1);
    const chance = clamp(availability * finite(settings.maxChance, 1), 0, 1);
    runtime.huntingAvailability = availability;
    runtime.huntingRawAvailability = finite(sample.rawAverage, 0);
    runtime.lastResourceValue = availability;
    runtime.lastSearchChance = chance;
    if ((deps.random || Math.random)() < chance) {
      runtime.foundCount += 1;
      runtime.lastMessage = `Hunting success (${Math.round(availability * 100)}% availability).`;
      deps.onHuntingSuccess?.({
        x,
        y,
        radius: finite(settings.depletionRadius, 45),
        trailClear: finite(settings.depletionTrailClear, 0.85),
      });
    } else {
      runtime.lastMessage = `Tracking (${Math.round(availability * 100)}% availability).`;
    }
    deps.syncStore();
    return true;
  }

  function onQueueCompleted() {
    if (!runtime.active || runtime.ending || runtime.type !== activityType) return false;
    queueNextPatrol();
    return true;
  }

  return {
    startHunting,
    onStepCompleted,
    onQueueCompleted,
  };
}
