function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getProcessedMovementTicks(ctx) {
  const time = ctx && ctx.time && ctx.time.systems ? ctx.time.systems.movement : null;
  return Math.max(0, Math.round(finite(time && time.ticksProcessed, 0)));
}

export function createPlayerActivityUpkeepController(deps) {
  const runtime = deps.runtime;

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
    const ticksToProcess = getProcessedMovementTicks(ctx);
    if (ticksToProcess <= 0) return 0;
    applyUpkeepTicks(ticksToProcess);
    return ticksToProcess;
  }

  return {
    applyUpkeepTicks,
    update,
  };
}
