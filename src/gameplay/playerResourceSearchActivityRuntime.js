export const RECENT_RESOURCE_SEARCH_CELL_LIMIT = 12;

const COST_BIAS = 1.7;
const RECENT_WEIGHT_MULTIPLIER = 0.12;
const UNVISITED_WEIGHT_MULTIPLIER = 1.6;

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getResourceSearchCellKey(x, y) {
  return `${Math.round(Number(x) || 0)},${Math.round(Number(y) || 0)}`;
}

function distanceSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function chooseWeightedGatheringCandidate(input) {
  const candidates = Array.isArray(input && input.candidates) ? input.candidates : [];
  if (!candidates.length) return null;
  const random = typeof input.random === "function" ? input.random : Math.random;
  let total = 0;
  for (const candidate of candidates) {
    total += Math.max(0, finite(candidate.weight, 0));
  }
  if (total <= 0) {
    const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
    return candidates[index] || null;
  }
  let pick = random() * total;
  for (const candidate of candidates) {
    pick -= Math.max(0, finite(candidate.weight, 0));
    if (pick <= 0) return candidate;
  }
  return candidates[candidates.length - 1] || null;
}

export function buildGatheringMoveCandidates(input) {
  const currentX = Math.round(finite(input && input.currentX, 0));
  const currentY = Math.round(finite(input && input.currentY, 0));
  const originX = Math.round(finite(input && input.originX, currentX));
  const originY = Math.round(finite(input && input.originY, currentY));
  const radius = Math.max(1, Math.round(finite(input && input.radius, 1)));
  const mapWidth = Math.max(1, Math.round(finite(input && input.mapWidth, 1)));
  const mapHeight = Math.max(1, Math.round(finite(input && input.mapHeight, 1)));
  const computeMoveStepCost = input && typeof input.computeMoveStepCost === "function"
    ? input.computeMoveStepCost
    : () => Number.POSITIVE_INFINITY;
  const moveCostContext = input && input.moveCostContext;
  const recentCells = input && input.recentCells instanceof Set ? input.recentCells : new Set();
  const visitedCells = input && input.visitedCells instanceof Set ? input.visitedCells : new Set();
  const candidateWeightMultiplier = input && typeof input.candidateWeightMultiplier === "function"
    ? input.candidateWeightMultiplier
    : () => 1;
  const allowRecent = Boolean(input && input.allowRecent);
  const candidates = [];
  const radiusSq = radius * radius;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const x = currentX + dx;
      const y = currentY + dy;
      if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) continue;
      if (distanceSq(originX, originY, x, y) > radiusSq) continue;
      const cost = finite(computeMoveStepCost(currentX, currentY, x, y, moveCostContext), Number.POSITIVE_INFINITY);
      if (!Number.isFinite(cost) || cost <= 0) continue;
      const key = getResourceSearchCellKey(x, y);
      const isRecent = recentCells.has(key);
      if (isRecent && !allowRecent) continue;
      const isVisited = visitedCells.has(key);
      let weight = 1 / Math.pow(cost + 0.001, COST_BIAS);
      if (isRecent) weight *= RECENT_WEIGHT_MULTIPLIER;
      if (!isVisited) weight *= UNVISITED_WEIGHT_MULTIPLIER;
      weight *= Math.max(0, finite(candidateWeightMultiplier(x, y), 1));
      candidates.push({
        x,
        y,
        cost,
        weight,
        key,
        isVisited,
        isRecent,
      });
    }
  }

  return candidates;
}

export function createResourceSearchActivityController(deps) {
  const runtime = deps.runtime;
  const playerState = deps.playerState;

  function getActivityDefinition(type) {
    return typeof deps.getActivityDefinition === "function" ? deps.getActivityDefinition(type) : null;
  }

  function getRecentSet() {
    return new Set(runtime.recentCells);
  }

  function pushRecent(x, y) {
    const key = getResourceSearchCellKey(x, y);
    runtime.recentCells.push(key);
    while (runtime.recentCells.length > RECENT_RESOURCE_SEARCH_CELL_LIMIT) {
      runtime.recentCells.shift();
    }
  }

  function isResourceSearchActivity(type = runtime.type) {
    const definition = getActivityDefinition(type);
    return Boolean(definition && definition.resourceSearch);
  }

  function buildCandidates(allowRecent) {
    const moveCostContext = typeof deps.getMoveCostContext === "function" ? deps.getMoveCostContext() : null;
    return buildGatheringMoveCandidates({
      currentX: playerState.pixelX,
      currentY: playerState.pixelY,
      originX: runtime.originX,
      originY: runtime.originY,
      radius: runtime.radius,
      mapWidth: deps.getMapWidth(),
      mapHeight: deps.getMapHeight(),
      computeMoveStepCost: deps.computeMoveStepCost,
      moveCostContext,
      recentCells: getRecentSet(),
      visitedCells: runtime.visitedCells,
      allowRecent,
      candidateWeightMultiplier: (x, y) => {
        if (!runtime.resourceId || typeof deps.getResourceMovementBias !== "function") return 1;
        return deps.getResourceMovementBias(runtime.resourceId, x, y);
      },
    });
  }

  function queueNextStep() {
    if (!runtime.active || runtime.ending) return false;
    let candidates = buildCandidates(false);
    if (!candidates.length) {
      candidates = buildCandidates(true);
    }
    const next = chooseWeightedGatheringCandidate({
      candidates,
      random: deps.random || Math.random,
    });
    if (!next) {
      deps.stopActivity({ reason: "No valid nearby gathering movement.", cancelMovement: false });
      return false;
    }
    const path = [
      { x: playerState.pixelX, y: playerState.pixelY },
      { x: next.x, y: next.y },
    ];
    const queued = deps.replaceMovementQueue(path, { silent: true });
    if (!queued) {
      deps.stopActivity({ reason: "Unable to queue gathering movement.", cancelMovement: false });
      return false;
    }
    return true;
  }

  function startResourceSearch(activityType) {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const definition = getActivityDefinition(activityType);
    if (!definition || !definition.resourceSearch) {
      return { ok: false, reason: "Unknown resource search activity." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: `Cancel current travel before starting ${definition.label}.` };
    }
    const stats = playerState.stats || {};
    const radius = clamp(Math.round(finite(stats.gatherRadius, 30)), 1, 300);
    runtime.active = true;
    runtime.type = activityType;
    runtime.resourceId = definition.resourceSearch;
    runtime.originX = Math.round(finite(playerState.pixelX, 0));
    runtime.originY = Math.round(finite(playerState.pixelY, 0));
    runtime.radius = radius;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set([getResourceSearchCellKey(runtime.originX, runtime.originY)]);
    runtime.recentCells = [getResourceSearchCellKey(runtime.originX, runtime.originY)];
    runtime.lastMessage = `${definition.label} started.`;
    runtime.lastResourceValue = null;
    runtime.lastSearchChance = null;
    deps.syncStore();
    if (!queueNextStep()) {
      return { ok: false, reason: runtime.lastMessage || `Unable to start ${definition.label}.` };
    }
    deps.setActivitySpeed20x?.();
    if (typeof deps.setStatus === "function") {
      deps.setStatus(`${definition.label} started within radius ${runtime.radius}.`);
    }
    return { ok: true };
  }

  function onStepCompleted(step) {
    if (!runtime.active || runtime.ending || !isResourceSearchActivity()) return false;
    const x = Math.round(finite(step && step.toX, playerState.pixelX));
    const y = Math.round(finite(step && step.toY, playerState.pixelY));
    const key = getResourceSearchCellKey(x, y);
    runtime.stepsTaken += 1;
    pushRecent(x, y);
    if (typeof deps.onResourceSearch === "function") {
      deps.onResourceSearch({ activityType: runtime.type, resourceId: runtime.resourceId, x, y, step });
    }
    const resourceValue = typeof deps.getResourceValue === "function" ? deps.getResourceValue(runtime.resourceId, x, y) : 0;
    const chance = typeof deps.getResourceSearchChance === "function" ? deps.getResourceSearchChance(runtime.resourceId, x, y) : 0;
    runtime.lastResourceValue = resourceValue;
    runtime.lastSearchChance = chance;
    if (!runtime.visitedCells.has(key)) {
      runtime.visitedCells.add(key);
      if ((deps.random || Math.random)() < chance) {
        let rewardName = "resource";
        if (typeof deps.onResourceFound === "function") {
          const result = deps.onResourceFound({
            activityType: runtime.type,
            resourceId: runtime.resourceId,
            x,
            y,
          });
          if (result && result.ok === false) {
            deps.stopActivity({
              reason: result.reason || `Could not gather ${runtime.resourceId || "resource"}.`,
              cancelMovement: false,
            });
            return true;
          }
          if (result && result.itemName) {
            rewardName = result.itemName;
          }
        }
        runtime.foundCount += 1;
        runtime.lastMessage = `Found ${rewardName}.`;
      } else {
        runtime.lastMessage = "Searching...";
      }
    } else {
      runtime.lastMessage = "Searching known ground...";
    }
    deps.syncStore();
    return true;
  }

  function onQueueCompleted() {
    if (!runtime.active || runtime.ending || !isResourceSearchActivity()) return false;
    queueNextStep();
    return true;
  }

  return {
    isResourceSearchActivity,
    queueNextStep,
    startResourceSearch,
    onStepCompleted,
    onQueueCompleted,
  };
}
