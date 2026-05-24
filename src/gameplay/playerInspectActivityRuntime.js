function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resetInspectFields(runtime) {
  runtime.inspectX = null;
  runtime.inspectY = null;
  runtime.inspectHeight = null;
  runtime.inspectSlope = null;
  runtime.inspectResources = [];
}

export function createInspectActivityController(deps) {
  const runtime = deps.runtime;
  const playerState = deps.playerState;
  const activityType = deps.activityType;

  function startInspect() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: "Cancel current travel before inspecting." };
    }
    runtime.active = true;
    runtime.type = activityType;
    runtime.originX = Math.round(finite(playerState.pixelX, 0));
    runtime.originY = Math.round(finite(playerState.pixelY, 0));
    runtime.radius = 0;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set();
    runtime.recentCells = [];
    runtime.lastMessage = "Move cursor over terrain to inspect.";
    resetInspectFields(runtime);
    deps.syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus("Inspecting terrain: move cursor over the map.");
    }
    return { ok: true };
  }

  function updateInspectAtPixel(pixelX, pixelY) {
    if (!runtime.active || runtime.type !== activityType) return false;
    const mapWidth = typeof deps.getMapWidth === "function" ? deps.getMapWidth() : 1;
    const mapHeight = typeof deps.getMapHeight === "function" ? deps.getMapHeight() : 1;
    const x = clamp(Math.round(finite(pixelX, 0)), 0, Math.max(0, mapWidth - 1));
    const y = clamp(Math.round(finite(pixelY, 0)), 0, Math.max(0, mapHeight - 1));
    runtime.inspectX = x;
    runtime.inspectY = y;
    runtime.inspectHeight = typeof deps.sampleHeight === "function" ? deps.sampleHeight(x, y) : null;
    runtime.inspectSlope = typeof deps.sampleSlope === "function" ? deps.sampleSlope(x, y) : null;
    runtime.inspectResources = typeof deps.getInspectResourceReadings === "function"
      ? deps.getInspectResourceReadings(x, y)
      : [];
    runtime.lastMessage = "Inspecting terrain.";
    deps.syncStore();
    return true;
  }

  return {
    startInspect,
    updateInspectAtPixel,
  };
}
