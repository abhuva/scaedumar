export const ACTIVITY_NONE = "none";
export const ACTIVITY_GATHERING = "gathering";
export const ACTIVITY_INSPECT = "inspect";
export const ACTIVITY_TIME_SPEED_1X = 0.01;

const RECENT_CELL_LIMIT = 12;
const BASE_GATHER_CHANCE = 0.05;
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

export function createGatheringActivityRuntime(deps) {
  const runtime = {
    active: false,
    type: ACTIVITY_NONE,
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
  };

  function getRecentSet() {
    return new Set(runtime.recentCells);
  }

  function getSnapshot() {
    return {
      active: runtime.active,
      type: runtime.type,
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
    runtime.type = ACTIVITY_NONE;
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

  function updateInspectAtPixel(pixelX, pixelY) {
    if (!runtime.active || runtime.type !== ACTIVITY_INSPECT) return false;
    const x = clamp(Math.round(finite(pixelX, 0)), 0, Math.max(0, deps.getMapWidth() - 1));
    const y = clamp(Math.round(finite(pixelY, 0)), 0, Math.max(0, deps.getMapHeight() - 1));
    runtime.inspectX = x;
    runtime.inspectY = y;
    runtime.inspectHeight = typeof deps.sampleHeight === "function" ? deps.sampleHeight(x, y) : null;
    runtime.inspectSlope = typeof deps.sampleSlope === "function" ? deps.sampleSlope(x, y) : null;
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
    syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus("Inspecting terrain: move cursor over the map.");
    }
    return { ok: true };
  }

  function stopActivity(options = {}) {
    if (!runtime.active) return false;
    const reason = String(options.reason || "Gathering stopped.");
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
    if (!runtime.active || runtime.ending || runtime.type !== ACTIVITY_GATHERING) return;
    const x = Math.round(finite(step && step.toX, deps.playerState.pixelX));
    const y = Math.round(finite(step && step.toY, deps.playerState.pixelY));
    const key = cellKey(x, y);
    runtime.stepsTaken += 1;
    pushRecent(x, y);
    if (!runtime.visitedCells.has(key)) {
      runtime.visitedCells.add(key);
      if ((deps.random || Math.random)() < BASE_GATHER_CHANCE) {
        runtime.foundCount += 1;
        runtime.lastMessage = "Found plants.";
      } else {
        runtime.lastMessage = "Searching...";
      }
    } else {
      runtime.lastMessage = "Searching known ground...";
    }
    syncStore();
  }

  function onQueueCompleted() {
    if (!runtime.active || runtime.ending || runtime.type !== ACTIVITY_GATHERING) return;
    queueNextStep();
  }

  function onMovementCanceled() {
    if (!runtime.active || runtime.ending) return;
    stopActivity({ reason: "Gathering canceled.", cancelMovement: false });
  }

  return {
    startGathering,
    startInspect,
    updateInspectAtPixel,
    stopActivity,
    cancelActivity: () => {
      const label = runtime.type === ACTIVITY_INSPECT ? "Inspect canceled." : "Gathering canceled.";
      return stopActivity({ reason: label, cancelMovement: true });
    },
    isActivityActive: () => runtime.active,
    isInspectActive: () => runtime.active && runtime.type === ACTIVITY_INSPECT,
    getSnapshot,
    onStepCompleted,
    onQueueCompleted,
    onMovementCanceled,
  };
}
