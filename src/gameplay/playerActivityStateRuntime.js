export const DEFAULT_SCOUT_SCAN_RADIUS = 30;
export const DEFAULT_SCOUT_REVEAL_RADIUS = 40;

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function createPlayerActivityState(idleType = "idle") {
  return {
    active: false,
    type: idleType,
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
    scoutPhase: "idle",
    scoutScanRadius: DEFAULT_SCOUT_SCAN_RADIUS,
    scoutRevealRadius: DEFAULT_SCOUT_REVEAL_RADIUS,
    scoutEffectiveRevealRadius: DEFAULT_SCOUT_REVEAL_RADIUS,
    scoutCandidateIndex: -1,
    scoutCandidateId: 0,
    scoutCandidateDistance: null,
    scoutPossessedIndex: -1,
    scoutPossessedId: 0,
    scoutBirdX: null,
    scoutBirdY: null,
    scoutDisconnectReason: "",
    lastScoutSyncMs: 0,
    resourceId: "",
    lastResourceValue: null,
    lastSearchChance: null,
  };
}

export function resetPlayerActivityState(runtime, idleType = "idle", lastMessage = "") {
  runtime.active = false;
  runtime.type = idleType;
  runtime.originX = 0;
  runtime.originY = 0;
  runtime.radius = 0;
  runtime.stepsTaken = 0;
  runtime.foundCount = 0;
  runtime.ending = false;
  runtime.visitedCells.clear();
  runtime.recentCells = [];
  runtime.lastMessage = lastMessage;
  runtime.inspectX = null;
  runtime.inspectY = null;
  runtime.inspectHeight = null;
  runtime.inspectSlope = null;
  runtime.inspectResources = [];
  runtime.scoutPhase = "idle";
  runtime.scoutScanRadius = DEFAULT_SCOUT_SCAN_RADIUS;
  runtime.scoutRevealRadius = DEFAULT_SCOUT_REVEAL_RADIUS;
  runtime.scoutEffectiveRevealRadius = DEFAULT_SCOUT_REVEAL_RADIUS;
  runtime.scoutCandidateIndex = -1;
  runtime.scoutCandidateId = 0;
  runtime.scoutCandidateDistance = null;
  runtime.scoutPossessedIndex = -1;
  runtime.scoutPossessedId = 0;
  runtime.scoutBirdX = null;
  runtime.scoutBirdY = null;
  runtime.scoutDisconnectReason = "";
  runtime.lastScoutSyncMs = 0;
  runtime.resourceId = "";
  runtime.lastResourceValue = null;
  runtime.lastSearchChance = null;
}

export function startBaseActivityState(runtime, type, message, playerState) {
  runtime.active = true;
  runtime.type = type;
  runtime.originX = Math.round(finite(playerState && playerState.pixelX, 0));
  runtime.originY = Math.round(finite(playerState && playerState.pixelY, 0));
  runtime.radius = 0;
  runtime.stepsTaken = 0;
  runtime.foundCount = 0;
  runtime.ending = false;
  runtime.visitedCells = new Set();
  runtime.recentCells = [];
  runtime.lastMessage = message;
  runtime.inspectX = null;
  runtime.inspectY = null;
  runtime.inspectHeight = null;
  runtime.inspectSlope = null;
  runtime.inspectResources = [];
  runtime.scoutPhase = "idle";
  runtime.scoutScanRadius = DEFAULT_SCOUT_SCAN_RADIUS;
  runtime.scoutRevealRadius = DEFAULT_SCOUT_REVEAL_RADIUS;
  runtime.scoutEffectiveRevealRadius = DEFAULT_SCOUT_REVEAL_RADIUS;
  runtime.scoutCandidateIndex = -1;
  runtime.scoutCandidateId = 0;
  runtime.scoutCandidateDistance = null;
  runtime.scoutPossessedIndex = -1;
  runtime.scoutPossessedId = 0;
  runtime.scoutBirdX = null;
  runtime.scoutBirdY = null;
  runtime.scoutDisconnectReason = "";
  runtime.lastScoutSyncMs = 0;
  runtime.resourceId = "";
  runtime.lastResourceValue = null;
  runtime.lastSearchChance = null;
}

export function getPlayerActivitySnapshot(runtime, activityDefinitions = {}) {
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
    scoutPhase: runtime.scoutPhase,
    scoutScanRadius: runtime.scoutScanRadius,
    scoutRevealRadius: runtime.scoutRevealRadius,
    scoutEffectiveRevealRadius: runtime.scoutEffectiveRevealRadius,
    scoutCandidateIndex: runtime.scoutCandidateIndex,
    scoutCandidateId: runtime.scoutCandidateId,
    scoutCandidateDistance: runtime.scoutCandidateDistance,
    scoutPossessedIndex: runtime.scoutPossessedIndex,
    scoutPossessedId: runtime.scoutPossessedId,
    scoutBirdX: runtime.scoutBirdX,
    scoutBirdY: runtime.scoutBirdY,
    scoutDisconnectReason: runtime.scoutDisconnectReason,
    resourceId: runtime.resourceId,
    lastResourceValue: runtime.lastResourceValue,
    lastSearchChance: runtime.lastSearchChance,
  };
}
