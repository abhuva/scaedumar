function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resetInspectFields(runtime) {
  runtime.inspectX = null;
  runtime.inspectY = null;
  runtime.inspectHeight = null;
  runtime.inspectSlope = null;
  runtime.inspectResources = [];
}

export function createRestActivityController(deps) {
  const runtime = deps.runtime;
  const playerState = deps.playerState;
  const activityType = deps.activityType;

  function startRest() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: "Cancel current travel before resting." };
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
    runtime.lastMessage = "Resting.";
    resetInspectFields(runtime);
    deps.setActivitySpeed1x();
    deps.syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus("Resting: fatigue recovers while food and water slowly drain.");
    }
    return { ok: true };
  }

  function updateRestTicks(ticksToProcess) {
    if (!runtime.active || runtime.ending || runtime.type !== activityType) return false;
    for (let i = 0; i < ticksToProcess && runtime.active && runtime.type === activityType; i++) {
      if (typeof deps.onRestTick === "function") {
        deps.onRestTick({ tickIndex: runtime.stepsTaken });
      }
      runtime.stepsTaken += 1;
      runtime.lastMessage = "Resting.";
      const condition = typeof deps.getConditionSnapshot === "function" ? deps.getConditionSnapshot() : null;
      if (condition && Number(condition.fatigue) <= 1) {
        deps.stopActivity({ reason: "Rest complete.", cancelMovement: false });
        return true;
      }
    }
    deps.syncStore();
    return true;
  }

  return {
    startRest,
    updateRestTicks,
  };
}
