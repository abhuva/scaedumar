export function createInfoPanelRuntime(deps) {
  function formatEta(seconds) {
    if (seconds === Number.POSITIVE_INFINITY) return "paused";
    const safeSeconds = Math.max(0, Math.ceil(Number(seconds)));
    if (!Number.isFinite(safeSeconds)) return "--";
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const remainingSeconds = safeSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m ${remainingSeconds.toString().padStart(2, "0")}s`;
    }
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  }

  function setMovementPanelVisible(visible) {
    if (!deps.movementStatusPanelEl) return;
    deps.movementStatusPanelEl.classList.toggle("hidden", !visible);
  }

  function updateMovementPanel(movementSnapshot) {
    if (!movementSnapshot || !movementSnapshot.active) {
      setMovementPanelVisible(false);
      return;
    }
    const etaSeconds = typeof deps.getMovementEtaSeconds === "function"
      ? deps.getMovementEtaSeconds(movementSnapshot)
      : null;
    const remainingTicks = Math.max(0, Math.round(Number(movementSnapshot.totalTicksRemaining || 0)));
    const stepIndex = Math.max(0, Math.round(Number(movementSnapshot.currentStepIndex || 0))) + 1;
    const queueLength = Math.max(0, Math.round(Number(movementSnapshot.queueLength || 0)));
    if (deps.movementStatusEtaEl) {
      const etaLabel = etaSeconds == null ? "--" : formatEta(etaSeconds);
      deps.movementStatusEtaEl.textContent = `Estimated arrival: ${etaLabel}`;
    }
    if (deps.movementStatusDetailEl) {
      deps.movementStatusDetailEl.textContent = `Path: step ${stepIndex}/${queueLength}, ${remainingTicks} ticks remaining`;
    }
    setMovementPanelVisible(true);
  }

  return function updateInfoPanel() {
    const movementSnapshot = typeof deps.getMovementSnapshot === "function"
      ? deps.getMovementSnapshot()
      : null;
    updateMovementPanel(movementSnapshot);

    if (deps.isSwarmEnabled()) {
      const cursorMode = deps.getSwarmCursorMode();
      const nextPlayerInfo = `Swarm: ${deps.swarmState.count} agents`;
      const nextPathInfo = `Swarm Cursor: ${cursorMode}${deps.swarmCursorState.active ? " (active)" : ""}`;
      if (deps.playerInfoEl.textContent !== nextPlayerInfo) {
        deps.playerInfoEl.textContent = nextPlayerInfo;
      }
      if (deps.pathInfoEl.textContent !== nextPathInfo) {
        deps.pathInfoEl.textContent = nextPathInfo;
      }
      return;
    }

    const nextPlayerInfo = `Player: (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`;
    if (deps.playerInfoEl.textContent !== nextPlayerInfo) {
      deps.playerInfoEl.textContent = nextPlayerInfo;
    }

    const metrics = deps.getCurrentPathMetrics();
    if (movementSnapshot && movementSnapshot.active) {
      const nextPathInfo = `Move: active | q ${movementSnapshot.queueLength} | step ${movementSnapshot.currentStepIndex + 1} | ticks ${movementSnapshot.ticksRemaining} | cost ${movementSnapshot.currentStepCost.toFixed(2)}`;
      if (deps.pathInfoEl.textContent !== nextPathInfo) {
        deps.pathInfoEl.textContent = nextPathInfo;
      }
      return;
    }
    if (!metrics) {
      const nextPathInfo = "Path: len -- | cost -- | avg --";
      if (deps.pathInfoEl.textContent !== nextPathInfo) {
        deps.pathInfoEl.textContent = nextPathInfo;
      }
      return;
    }
    const nextPathInfo = `Path: len ${metrics.steps} | cost ${metrics.totalCost.toFixed(2)} | avg ${metrics.avgPerStep.toFixed(2)}`;
    if (deps.pathInfoEl.textContent !== nextPathInfo) {
      deps.pathInfoEl.textContent = nextPathInfo;
    }
  };
}
