function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toSafePixel(value, max) {
  return clamp(Math.round(finite(value, 0)), 0, Math.max(0, max));
}

export function createMovementSystem(deps) {
  const runtime = {
    queue: [],
    currentStepIndex: 0,
    ticksRemaining: 0,
    active: false,
    currentCost: 0,
  };

  function resetRuntime() {
    runtime.queue = [];
    runtime.currentStepIndex = 0;
    runtime.ticksRemaining = 0;
    runtime.active = false;
    runtime.currentCost = 0;
  }

  function emitHook(name, ...args) {
    const hook = deps && deps[name];
    if (typeof hook === "function") {
      hook(...args);
    }
  }

  function syncActiveStepFromIndex() {
    if (!runtime.active) return;
    const current = runtime.queue[runtime.currentStepIndex] || null;
    if (!current) {
      resetRuntime();
      return;
    }
    runtime.ticksRemaining = Math.max(1, Math.round(finite(current.ticksRequired, 1)));
    runtime.currentCost = finite(current.cost, 0);
    emitHook("onStepStarted", current, getSnapshot());
  }

  function buildQueueFromPath(pathPixels, simTickHours) {
    if (!Array.isArray(pathPixels) || pathPixels.length < 2) {
      return [];
    }
    void simTickHours;
    const moveCostContext = typeof deps.getMoveCostContext === "function" ? deps.getMoveCostContext() : null;
    const queue = [];
    for (let i = 1; i < pathPixels.length; i++) {
      const from = pathPixels[i - 1];
      const to = pathPixels[i];
      const cost = finite(
        deps.computeMoveStepCost(from.x, from.y, to.x, to.y, moveCostContext),
        Number.POSITIVE_INFINITY,
      );
      if (!Number.isFinite(cost) || cost <= 0) {
        return [];
      }
      const ticksRequired = Math.max(1, Math.ceil(cost));
      queue.push({
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        cost,
        ticksRequired,
      });
    }
    return queue;
  }

  function setQueue(pathPixels, simTickHours) {
    const nextQueue = buildQueueFromPath(pathPixels, simTickHours);
    if (!nextQueue.length) {
      return false;
    }
    runtime.queue = nextQueue;
    runtime.currentStepIndex = 0;
    runtime.active = true;
    runtime.ticksRemaining = Math.max(1, Math.round(nextQueue[0].ticksRequired));
    runtime.currentCost = finite(nextQueue[0].cost, 0);
    return true;
  }

  let lastSynced = {
    playerX: NaN,
    playerY: NaN,
    movementKey: "",
  };

  function buildMovementKey(snapshot) {
    return [
      snapshot.active ? "1" : "0",
      snapshot.queueLength,
      snapshot.currentStepIndex,
      snapshot.ticksRemaining,
      snapshot.currentStepCost.toFixed(6),
    ].join("|");
  }

  function syncStore(options = {}) {
    const snapshot = getSnapshot();
    const movementKey = buildMovementKey(snapshot);
    const playerChanged = options.forcePlayerSync || deps.playerState.pixelX !== lastSynced.playerX || deps.playerState.pixelY !== lastSynced.playerY;
    const movementChanged = options.forceMovementSync || movementKey !== lastSynced.movementKey;

    if (playerChanged && typeof deps.setPlayerSnapshot === "function") {
      deps.setPlayerSnapshot({
        pixelX: deps.playerState.pixelX,
        pixelY: deps.playerState.pixelY,
      });
    }
    if (movementChanged && typeof deps.setMovementSnapshot === "function") {
      deps.setMovementSnapshot(snapshot);
    }
    if (movementChanged && typeof deps.onMovementSnapshot === "function") {
      deps.onMovementSnapshot(snapshot);
    }
    if (playerChanged && deps.entityStore && typeof deps.entityStore.upsert === "function") {
      deps.entityStore.upsert({
        id: "player",
        type: "player",
        pixelX: deps.playerState.pixelX,
        pixelY: deps.playerState.pixelY,
      });
    }
    if (options.rebuildMovementField && typeof deps.rebuildMovementField === "function") {
      deps.rebuildMovementField();
    }
    if ((playerChanged || movementChanged || options.requestOverlayDraw) && typeof deps.requestOverlayDraw === "function") {
      deps.requestOverlayDraw();
    }
    lastSynced = {
      playerX: deps.playerState.pixelX,
      playerY: deps.playerState.pixelY,
      movementKey,
    };
  }

  function getSnapshot() {
    let totalTicksRemaining = 0;
    if (runtime.active) {
      // totalTicksRemaining allows runtime.ticksRemaining to be 0 for the
      // current finishing step; future runtime.queue steps still reserve at
      // least one tick, matching syncActiveStepFromIndex().
      totalTicksRemaining = Math.max(0, runtime.ticksRemaining);
      for (let i = runtime.currentStepIndex + 1; i < runtime.queue.length; i++) {
        totalTicksRemaining += Math.max(1, Math.round(finite(runtime.queue[i].ticksRequired, 1)));
      }
    }
    return {
      active: runtime.active,
      queueLength: runtime.queue.length,
      currentStepIndex: runtime.currentStepIndex,
      ticksRemaining: runtime.active ? runtime.ticksRemaining : 0,
      currentStepCost: runtime.active ? runtime.currentCost : 0,
      totalTicksRemaining,
    };
  }

  function replaceQueue(pathPixels, simTickHours, options = {}) {
    const replaced = setQueue(pathPixels, simTickHours);
    if (replaced && !options.silent && typeof deps.setStatus === "function") {
      deps.setStatus(`Movement queued (${runtime.queue.length} steps).`);
    }
    if (replaced) {
      emitHook("onMovementStarted", getSnapshot());
      emitHook("onStepStarted", runtime.queue[0], getSnapshot());
      syncStore({
        forceMovementSync: true,
        requestOverlayDraw: true,
      });
    }
    return replaced;
  }

  function cancelQueue() {
    const wasActive = runtime.active;
    const snapshotBeforeCancel = getSnapshot();
    resetRuntime();
    if (wasActive) {
      emitHook("onMovementCanceled", snapshotBeforeCancel);
    }
    syncStore({
      forceMovementSync: true,
      rebuildMovementField: true,
      requestOverlayDraw: true,
    });
  }

  return {
    replaceQueue,
    cancelQueue,
    getSnapshot,
    update(ctx, state) {
      const time = ctx && ctx.time && ctx.time.systems ? ctx.time.systems.movement : null;
      const ticksToProcess = Math.max(0, Math.round(finite(time && time.ticksProcessed, 0)));
      if (ticksToProcess <= 0 || !runtime.active) {
        syncStore();
        return;
      }

      const maxX = Math.max(0, finite(deps.getMapWidth && deps.getMapWidth(), 1) - 1);
      const maxY = Math.max(0, finite(deps.getMapHeight && deps.getMapHeight(), 1) - 1);
      let remaining = ticksToProcess;
      const wasActive = runtime.active;
      let moved = false;
      while (remaining > 0 && runtime.active) {
        if (runtime.ticksRemaining > 0) {
          runtime.ticksRemaining -= 1;
          remaining -= 1;
        }
        if (runtime.ticksRemaining > 0) {
          continue;
        }
        const currentStep = runtime.queue[runtime.currentStepIndex] || null;
        if (!currentStep) {
          resetRuntime();
          break;
        }
        deps.playerState.pixelX = toSafePixel(currentStep.toX, maxX);
        deps.playerState.pixelY = toSafePixel(currentStep.toY, maxY);
        moved = true;
        emitHook("onStepCompleted", currentStep, getSnapshot());
        runtime.currentStepIndex += 1;
        if (runtime.currentStepIndex >= runtime.queue.length) {
          const completedSnapshot = getSnapshot();
          resetRuntime();
          emitHook("onQueueCompleted", completedSnapshot);
          break;
        }
        syncActiveStepFromIndex();
      }

      syncStore({
        forceMovementSync: true,
        rebuildMovementField: wasActive && !runtime.active,
        requestOverlayDraw: moved,
      });
    },
  };
}
