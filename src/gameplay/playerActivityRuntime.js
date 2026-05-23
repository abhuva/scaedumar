export const ACTIVITY_IDLE = "idle";
export const ACTIVITY_NONE = ACTIVITY_IDLE;
export const ACTIVITY_TRAVEL = "travel";
export const ACTIVITY_GATHERING = "gathering";
export const ACTIVITY_GATHER_WATER = "gather_water";
export const ACTIVITY_INSPECT = "inspect";
export const ACTIVITY_REST = "rest";
export const ACTIVITY_TIME_SPEED_1X = 0.01;

const RECENT_CELL_LIMIT = 12;
const BASE_GATHER_CHANCE = 0.05;
const GATHER_REWARDS = [
  { itemId: "berries", weight: 0.45 },
  { itemId: "medicinal_herb", weight: 0.25 },
  { itemId: "plant_fiber", weight: 0.30 },
];
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

function cellKey(x, y) {
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
  if (total <= 0) return candidates[0] || null;
  let pick = random() * total;
  for (const candidate of candidates) {
    pick -= Math.max(0, finite(candidate.weight, 0));
    if (pick <= 0) return candidate;
  }
  return candidates[candidates.length - 1] || null;
}

export function chooseWeightedGatheringReward(input = {}) {
  const random = typeof input.random === "function" ? input.random : Math.random;
  const rewards = Array.isArray(input.rewards) && input.rewards.length ? input.rewards : GATHER_REWARDS;
  let total = 0;
  for (const reward of rewards) {
    total += Math.max(0, finite(reward.weight, 0));
  }
  if (total <= 0) return rewards[0] || null;
  let pick = random() * total;
  for (const reward of rewards) {
    pick -= Math.max(0, finite(reward.weight, 0));
    if (pick <= 0) return reward;
  }
  return rewards[rewards.length - 1] || null;
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
      const key = cellKey(x, y);
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

export function createPlayerActivityRuntime(deps) {
  const activityDefinitions = deps && deps.activityDefinitions && typeof deps.activityDefinitions === "object"
    ? deps.activityDefinitions
    : {};
  const runtime = {
    active: false,
    type: ACTIVITY_IDLE,
    originX: 0,
    originY: 0,
    radius: 0,
    stepsTaken: 0,
    foundCount: 0,
    visitedCells: new Set(),
    recentCells: [],
    ending: false,
    lastMessage: "",
    inspectX: null,
    inspectY: null,
    inspectHeight: null,
    inspectSlope: null,
    inspectResources: [],
    resourceId: "",
    lastResourceValue: null,
    lastSearchChance: null,
  };

  function getRecentSet() {
    return new Set(runtime.recentCells);
  }

  function getSnapshot() {
    const definition = activityDefinitions[runtime.type] || null;
    return {
      active: runtime.active,
      type: runtime.type,
      label: definition && definition.label ? definition.label : runtime.type,
      originX: runtime.originX,
      originY: runtime.originY,
      radius: runtime.radius,
      stepsTaken: runtime.stepsTaken,
      visitedCount: runtime.visitedCells.size,
      foundCount: runtime.foundCount,
      lastMessage: runtime.lastMessage,
      inspectX: runtime.inspectX,
      inspectY: runtime.inspectY,
      inspectHeight: runtime.inspectHeight,
      inspectSlope: runtime.inspectSlope,
      inspectResources: runtime.inspectResources.map((reading) => ({ ...reading })),
      resourceId: runtime.resourceId,
      lastResourceValue: runtime.lastResourceValue,
      lastSearchChance: runtime.lastSearchChance,
    };
  }

  function syncStore() {
    if (typeof deps.setActivitySnapshot === "function") {
      deps.setActivitySnapshot(getSnapshot());
    }
    if (typeof deps.onActivitySnapshot === "function") {
      deps.onActivitySnapshot(getSnapshot());
    }
    if (typeof deps.requestOverlayDraw === "function") {
      deps.requestOverlayDraw();
    }
  }

  function setActivitySpeed1x() {
    if (typeof deps.setCycleSpeed === "function") {
      deps.setCycleSpeed(ACTIVITY_TIME_SPEED_1X);
    }
  }

  function resetRuntime(lastMessage = "") {
    runtime.active = false;
    runtime.type = ACTIVITY_IDLE;
    runtime.originX = 0;
    runtime.originY = 0;
    runtime.radius = 0;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells.clear();
    runtime.recentCells = [];
    runtime.lastMessage = lastMessage;
    runtime.inspectX = null;
    runtime.inspectY = null;
    runtime.inspectHeight = null;
    runtime.inspectSlope = null;
    runtime.inspectResources = [];
    runtime.resourceId = "";
    runtime.lastResourceValue = null;
    runtime.lastSearchChance = null;
  }

  function getActivityDefinition(type) {
    return activityDefinitions[type] || null;
  }

  function getCancelLabel(type) {
    const definition = getActivityDefinition(type);
    return definition && definition.cancelLabel ? definition.cancelLabel : "Activity canceled.";
  }

  function getCompleteLabel(type, fallback) {
    const definition = getActivityDefinition(type);
    return definition && definition.completeLabel ? definition.completeLabel : fallback;
  }

  function startRuntimeActivity(type, message) {
    runtime.active = true;
    runtime.type = type;
    runtime.originX = Math.round(finite(deps.playerState.pixelX, 0));
    runtime.originY = Math.round(finite(deps.playerState.pixelY, 0));
    runtime.radius = 0;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set();
    runtime.recentCells = [];
    runtime.lastMessage = message;
    runtime.inspectX = null;
    runtime.inspectY = null;
    runtime.inspectHeight = null;
    runtime.inspectSlope = null;
    runtime.inspectResources = [];
    runtime.resourceId = "";
    runtime.lastResourceValue = null;
    runtime.lastSearchChance = null;
  }

  function pushRecent(x, y) {
    const key = cellKey(x, y);
    runtime.recentCells.push(key);
    while (runtime.recentCells.length > RECENT_CELL_LIMIT) {
      runtime.recentCells.shift();
    }
  }

  function buildCandidates(allowRecent) {
    const moveCostContext = typeof deps.getMoveCostContext === "function" ? deps.getMoveCostContext() : null;
    return buildGatheringMoveCandidates({
      currentX: deps.playerState.pixelX,
      currentY: deps.playerState.pixelY,
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
      stopActivity({ reason: "No valid nearby gathering movement.", cancelMovement: false });
      return false;
    }
    const path = [
      { x: deps.playerState.pixelX, y: deps.playerState.pixelY },
      { x: next.x, y: next.y },
    ];
    const queued = deps.replaceMovementQueue(path, { silent: true });
    if (!queued) {
      stopActivity({ reason: "Unable to queue gathering movement.", cancelMovement: false });
      return false;
    }
    return true;
  }

  function startGathering() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: "Cancel current travel before starting gathering." };
    }

    const stats = deps.playerState.stats || {};
    const radius = clamp(Math.round(finite(stats.gatherRadius, 30)), 1, 300);
    runtime.active = true;
    runtime.type = ACTIVITY_GATHERING;
    runtime.originX = Math.round(finite(deps.playerState.pixelX, 0));
    runtime.originY = Math.round(finite(deps.playerState.pixelY, 0));
    runtime.radius = radius;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set([cellKey(runtime.originX, runtime.originY)]);
    runtime.recentCells = [cellKey(runtime.originX, runtime.originY)];
    runtime.lastMessage = "Gathering started.";
    setActivitySpeed1x();
    syncStore();
    if (!queueNextStep()) {
      return { ok: false, reason: runtime.lastMessage || "Unable to start gathering." };
    }
    if (typeof deps.setStatus === "function") {
      deps.setStatus(`Gathering started within radius ${runtime.radius}.`);
    }
    return { ok: true };
  }

  function isResourceSearchActivity(type = runtime.type) {
    const definition = getActivityDefinition(type);
    return Boolean(definition && definition.resourceSearch);
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
    const stats = deps.playerState.stats || {};
    const radius = clamp(Math.round(finite(stats.gatherRadius, 30)), 1, 300);
    runtime.active = true;
    runtime.type = activityType;
    runtime.resourceId = definition.resourceSearch;
    runtime.originX = Math.round(finite(deps.playerState.pixelX, 0));
    runtime.originY = Math.round(finite(deps.playerState.pixelY, 0));
    runtime.radius = radius;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set([cellKey(runtime.originX, runtime.originY)]);
    runtime.recentCells = [cellKey(runtime.originX, runtime.originY)];
    runtime.lastMessage = `${definition.label} started.`;
    runtime.lastResourceValue = null;
    runtime.lastSearchChance = null;
    setActivitySpeed1x();
    syncStore();
    if (!queueNextStep()) {
      return { ok: false, reason: runtime.lastMessage || `Unable to start ${definition.label}.` };
    }
    if (typeof deps.setStatus === "function") {
      deps.setStatus(`${definition.label} started within radius ${runtime.radius}.`);
    }
    return { ok: true };
  }

  function startGatherWater() {
    return startResourceSearch(ACTIVITY_GATHER_WATER);
  }

  function startTravel() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (!movement || !movement.active) {
      return { ok: false, reason: "No queued travel path." };
    }
    startRuntimeActivity(ACTIVITY_TRAVEL, "Traveling.");
    setActivitySpeed1x();
    syncStore();
    return { ok: true };
  }

  function updateInspectAtPixel(pixelX, pixelY) {
    if (!runtime.active || runtime.type !== ACTIVITY_INSPECT) return false;
    const x = clamp(Math.round(finite(pixelX, 0)), 0, Math.max(0, deps.getMapWidth() - 1));
    const y = clamp(Math.round(finite(pixelY, 0)), 0, Math.max(0, deps.getMapHeight() - 1));
    runtime.inspectX = x;
    runtime.inspectY = y;
    runtime.inspectHeight = typeof deps.sampleHeight === "function" ? deps.sampleHeight(x, y) : null;
    runtime.inspectSlope = typeof deps.sampleSlope === "function" ? deps.sampleSlope(x, y) : null;
    runtime.inspectResources = typeof deps.getInspectResourceReadings === "function"
      ? deps.getInspectResourceReadings(x, y)
      : [];
    runtime.lastMessage = "Inspecting terrain.";
    syncStore();
    return true;
  }

  function startInspect() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: "Cancel current travel before inspecting." };
    }
    runtime.active = true;
    runtime.type = ACTIVITY_INSPECT;
    runtime.originX = Math.round(finite(deps.playerState.pixelX, 0));
    runtime.originY = Math.round(finite(deps.playerState.pixelY, 0));
    runtime.radius = 0;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set();
    runtime.recentCells = [];
    runtime.lastMessage = "Move cursor over terrain to inspect.";
    runtime.inspectX = null;
    runtime.inspectY = null;
    runtime.inspectHeight = null;
    runtime.inspectSlope = null;
    runtime.inspectResources = [];
    syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus("Inspecting terrain: move cursor over the map.");
    }
    return { ok: true };
  }

  function startRest() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: "Cancel current travel before resting." };
    }
    runtime.active = true;
    runtime.type = ACTIVITY_REST;
    runtime.originX = Math.round(finite(deps.playerState.pixelX, 0));
    runtime.originY = Math.round(finite(deps.playerState.pixelY, 0));
    runtime.radius = 0;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set();
    runtime.recentCells = [];
    runtime.lastMessage = "Resting.";
    runtime.inspectX = null;
    runtime.inspectY = null;
    runtime.inspectHeight = null;
    runtime.inspectSlope = null;
    runtime.inspectResources = [];
    setActivitySpeed1x();
    syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus("Resting: fatigue recovers while food and water slowly drain.");
    }
    return { ok: true };
  }

  function stopActivity(options = {}) {
    if (!runtime.active) return false;
    const reason = String(options.reason || "Activity stopped.");
    const cancelMovement = options.cancelMovement !== false;
    runtime.lastMessage = reason;
    runtime.ending = true;
    if (cancelMovement && typeof deps.cancelMovementQueue === "function") {
      deps.cancelMovementQueue();
    }
    runtime.ending = false;
    resetRuntime(reason);
    setActivitySpeed1x();
    syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus(reason);
    }
    return true;
  }

  function onStepCompleted(step) {
    if (!runtime.active || runtime.ending) return;
    if (runtime.type === ACTIVITY_TRAVEL) {
      runtime.stepsTaken += 1;
      runtime.lastMessage = "Traveling.";
      syncStore();
      return;
    }
    if (runtime.type !== ACTIVITY_GATHERING && !isResourceSearchActivity()) return;
    const x = Math.round(finite(step && step.toX, deps.playerState.pixelX));
    const y = Math.round(finite(step && step.toY, deps.playerState.pixelY));
    const key = cellKey(x, y);
    runtime.stepsTaken += 1;
    pushRecent(x, y);
    if (isResourceSearchActivity()) {
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
          runtime.foundCount += 1;
          let rewardName = "resource";
          if (typeof deps.onResourceFound === "function") {
            const result = deps.onResourceFound({
              activityType: runtime.type,
              resourceId: runtime.resourceId,
              x,
              y,
            });
            if (result && result.itemName) {
              rewardName = result.itemName;
            }
          }
          runtime.lastMessage = `Found ${rewardName}.`;
        } else {
          runtime.lastMessage = "Searching...";
        }
      } else {
        runtime.lastMessage = "Searching known ground...";
      }
      syncStore();
      return;
    }
    if (typeof deps.onGatheringSearch === "function") {
      deps.onGatheringSearch({ x, y, step });
    }
    if (!runtime.visitedCells.has(key)) {
      runtime.visitedCells.add(key);
      if ((deps.random || Math.random)() < BASE_GATHER_CHANCE) {
        runtime.foundCount += 1;
        const reward = chooseWeightedGatheringReward({ random: deps.random || Math.random });
        let rewardName = "plants";
        if (reward && typeof deps.onGatheringFound === "function") {
          const result = deps.onGatheringFound({
            itemId: reward.itemId,
            quantity: 1,
            x,
            y,
          });
          if (result && result.itemName) {
            rewardName = result.itemName;
          }
        }
        runtime.lastMessage = `Found ${rewardName}.`;
      } else {
        runtime.lastMessage = "Searching...";
      }
    } else {
      runtime.lastMessage = "Searching known ground...";
    }
    syncStore();
  }

  function onQueueCompleted() {
    if (!runtime.active || runtime.ending) return;
    if (runtime.type === ACTIVITY_TRAVEL) {
      stopActivity({
        reason: getCompleteLabel(ACTIVITY_TRAVEL, "Travel complete."),
        cancelMovement: false,
      });
      return;
    }
    if (runtime.type !== ACTIVITY_GATHERING && !isResourceSearchActivity()) return;
    queueNextStep();
  }

  function onMovementCanceled() {
    if (!runtime.active || runtime.ending) return;
    stopActivity({ reason: getCancelLabel(runtime.type), cancelMovement: false });
  }

  function applyUpkeepTicks(ticksToProcess) {
    for (let i = 0; i < ticksToProcess; i++) {
      if (typeof deps.onUpkeepTick === "function") {
        deps.onUpkeepTick({
          activityType: runtime.type,
          tickIndex: i,
        });
      }
    }
  }

  function update(ctx) {
    const time = ctx && ctx.time && ctx.time.systems ? ctx.time.systems.movement : null;
    const ticksToProcess = Math.max(0, Math.round(finite(time && time.ticksProcessed, 0)));
    if (ticksToProcess <= 0) return;

    applyUpkeepTicks(ticksToProcess);

    if (!runtime.active || runtime.ending || runtime.type !== ACTIVITY_REST) return;
    for (let i = 0; i < ticksToProcess && runtime.active && runtime.type === ACTIVITY_REST; i++) {
      if (typeof deps.onRestTick === "function") {
        deps.onRestTick({ tickIndex: runtime.stepsTaken });
      }
      runtime.stepsTaken += 1;
      runtime.lastMessage = "Resting.";
      const condition = typeof deps.getConditionSnapshot === "function" ? deps.getConditionSnapshot() : null;
      if (condition && Number(condition.fatigue) <= 1) {
        stopActivity({ reason: "Rest complete.", cancelMovement: false });
        return;
      }
    }
    syncStore();
  }

  return {
    startGathering,
    startGatherWater,
    startTravel,
    startInspect,
    startRest,
    updateInspectAtPixel,
    stopActivity,
    cancelActivity: () => {
      return stopActivity({ reason: getCancelLabel(runtime.type), cancelMovement: true });
    },
    isActivityActive: () => runtime.active,
    isInspectActive: () => runtime.active && runtime.type === ACTIVITY_INSPECT,
    getSnapshot,
    onStepCompleted,
    onQueueCompleted,
    onMovementCanceled,
    update,
  };
}

export const createGatheringActivityRuntime = createPlayerActivityRuntime;
