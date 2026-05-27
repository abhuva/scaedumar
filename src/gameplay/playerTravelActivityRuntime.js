export function createTravelActivityController(deps) {
  const runtime = deps.runtime;
  const activityType = deps.activityType;

  function startTravel() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (!movement || !movement.active) {
      return { ok: false, reason: "No queued travel path." };
    }
    deps.startRuntimeActivity(activityType, "Traveling.");
    deps.setActivitySpeed20x?.();
    deps.syncStore();
    return { ok: true };
  }

  function onStepCompleted() {
    if (!runtime.active || runtime.ending || runtime.type !== activityType) return false;
    runtime.stepsTaken += 1;
    runtime.lastMessage = "Traveling.";
    deps.syncStore();
    return true;
  }

  function onQueueCompleted() {
    if (!runtime.active || runtime.ending || runtime.type !== activityType) return false;
    deps.stopActivity({
      reason: deps.getCompleteLabel(activityType, "Travel complete."),
      cancelMovement: false,
    });
    return true;
  }

  return {
    startTravel,
    onStepCompleted,
    onQueueCompleted,
  };
}
