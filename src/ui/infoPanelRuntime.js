export function createInfoPanelRuntime(deps) {
  const frameStats = {
    initialized: false,
    fps: 0,
    frameMs: 0,
    profile: null,
    lastUpdateMs: 0,
  };

  function formatGameDuration(hoursValue) {
    const safeHours = Number(hoursValue);
    if (!Number.isFinite(safeHours)) return "--";
    const totalMinutes = Math.max(0, Math.round(safeHours * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }

  function setMovementPanelVisible(visible) {
    if (!deps.movementStatusPanelEl) return;
    deps.movementStatusPanelEl.classList.toggle("hidden", !visible);
  }

  function formatSigned(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || Math.abs(number) < 0.0005) return "0.00";
    return `${number > 0 ? "+" : ""}${number.toFixed(2)}`;
  }

  function updateTravelPreviewPanel() {
    const estimate = typeof deps.getTravelPreviewEstimate === "function"
      ? deps.getTravelPreviewEstimate()
      : null;
    setMovementPanelVisible(true);
    if (deps.movementStatusTitleEl) {
      deps.movementStatusTitleEl.textContent = "Plan Travel";
    }
    if (!estimate || estimate.state === "empty") {
      if (deps.movementStatusEtaEl) {
        deps.movementStatusEtaEl.textContent = "Hover a reachable destination.";
      }
      if (deps.movementStatusDetailEl) {
        deps.movementStatusDetailEl.textContent = "No cost paid until you click to confirm.";
      }
      if (deps.movementCancelBtn) {
        deps.movementCancelBtn.textContent = "Cancel Planning";
      }
      return;
    }
    if (!estimate.reachable) {
      const destination = estimate.destination
        ? `${estimate.destination.x}, ${estimate.destination.y}`
        : "--";
      if (deps.movementStatusEtaEl) {
        deps.movementStatusEtaEl.textContent = `Destination: ${destination}`;
      }
      if (deps.movementStatusDetailEl) {
        deps.movementStatusDetailEl.textContent = estimate.message || "No reachable path.";
      }
      if (deps.movementCancelBtn) {
        deps.movementCancelBtn.textContent = "Cancel Planning";
      }
      return;
    }

    const duration = formatGameDuration(estimate.durationHours);
    const destination = `${estimate.destination.x}, ${estimate.destination.y}`;
    if (deps.movementStatusEtaEl) {
      deps.movementStatusEtaEl.textContent = `Destination: ${destination} | Travel time: ${duration} / ${estimate.ticks} ticks`;
    }
    if (deps.movementStatusDetailEl) {
      const effects = estimate.effects || {};
      const modifierText = Array.isArray(estimate.modifiers) && estimate.modifiers.length
        ? `\nModifiers: ${estimate.modifiers.map((modifier) => modifier.label).join(", ")}`
        : "";
      const warningText = Array.isArray(estimate.projectedWarnings) && estimate.projectedWarnings.length
        ? `\nWarning: ${estimate.projectedWarnings.map((warning) => warning.label).join(", ")}`
        : "";
      deps.movementStatusDetailEl.textContent = [
        `Steps: ${estimate.steps} | Avg cost: ${Number(estimate.avgPerStep || 0).toFixed(2)}`,
        `Cost: N ${formatSigned(effects.nutrition)} | H ${formatSigned(effects.hydration)} | F ${formatSigned(effects.fatigue)}`,
      ].join("\n") + modifierText + warningText;
    }
    if (deps.movementCancelBtn) {
      deps.movementCancelBtn.textContent = "Cancel Planning";
    }
  }

  function updateMovementPanel(movementSnapshot, activitySnapshot) {
    if (activitySnapshot && activitySnapshot.active) {
      setMovementPanelVisible(true);
      if (deps.movementStatusTitleEl) {
        deps.movementStatusTitleEl.textContent = activitySnapshot.type === "gathering"
          ? "Gathering"
          : (activitySnapshot.type === "inspect"
            ? "Inspect Terrain"
            : (activitySnapshot.type === "rest"
              ? "Resting"
              : (activitySnapshot.type === "travel" ? "Travel" : (activitySnapshot.label || "Activity"))));
      }
      if (activitySnapshot.type === "travel") {
        if (deps.inspectLayerControlsEl) deps.inspectLayerControlsEl.classList.add("hidden");
        const durationHours = typeof deps.getMovementDurationHours === "function"
          ? deps.getMovementDurationHours(movementSnapshot)
          : null;
        const remainingTicks = Math.max(0, Math.round(Number(movementSnapshot && movementSnapshot.totalTicksRemaining || 0)));
        const stepIndex = Math.max(0, Math.round(Number(movementSnapshot && movementSnapshot.currentStepIndex || 0))) + 1;
        const queueLength = Math.max(0, Math.round(Number(movementSnapshot && movementSnapshot.queueLength || 0)));
        if (deps.movementStatusEtaEl) {
          deps.movementStatusEtaEl.textContent = `Travel time remaining: ${durationHours == null ? "--" : formatGameDuration(durationHours)}`;
        }
        if (deps.movementStatusDetailEl) {
          deps.movementStatusDetailEl.textContent = `Path: step ${stepIndex}/${queueLength}, ${remainingTicks} ticks remaining`;
        }
        if (deps.movementCancelBtn) {
          deps.movementCancelBtn.textContent = "Cancel Travel";
        }
        return;
      }
      if (activitySnapshot.type === "inspect") {
        if (deps.inspectLayerControlsEl) deps.inspectLayerControlsEl.classList.remove("hidden");
        const x = activitySnapshot.inspectX == null ? "--" : Math.round(Number(activitySnapshot.inspectX));
        const y = activitySnapshot.inspectY == null ? "--" : Math.round(Number(activitySnapshot.inspectY));
        const height = Number(activitySnapshot.inspectHeight);
        const slope = Number(activitySnapshot.inspectSlope);
        const resourceReadings = Array.isArray(activitySnapshot.inspectResources)
          ? activitySnapshot.inspectResources
          : [];
        const waterReading = resourceReadings.find((reading) => reading && reading.resourceId === "water") || null;
        if (deps.movementStatusEtaEl) {
          deps.movementStatusEtaEl.textContent = `Position: ${x}, ${y}`;
        }
        if (deps.movementStatusDetailEl) {
          const terrainText = `Height: ${Number.isFinite(height) ? height.toFixed(3) : "--"} | Slope: ${Number.isFinite(slope) ? `${(slope * 90).toFixed(1)} deg` : "--"}`;
          const wetness = Number(waterReading && waterReading.value);
          const chance = Number(waterReading && waterReading.chance);
          const knowledge = Number(waterReading && waterReading.knowledge);
          const waterText = waterReading
            ? `\nWater: wetness ${Number.isFinite(wetness) ? wetness.toFixed(2) : "--"} | chance ${Number.isFinite(chance) ? `${Math.round(chance * 100)}%` : "--"} | known ${Number.isFinite(knowledge) ? `${Math.round(knowledge * 100)}%` : "--"}`
            : "";
          deps.movementStatusDetailEl.textContent = terrainText + waterText;
        }
        if (deps.movementCancelBtn) {
          deps.movementCancelBtn.textContent = "Stop Inspect";
        }
        return;
      }
      if (activitySnapshot.type === "rest") {
        if (deps.inspectLayerControlsEl) deps.inspectLayerControlsEl.classList.add("hidden");
        if (deps.movementStatusEtaEl) {
          deps.movementStatusEtaEl.textContent = "Recovering fatigue";
        }
        if (deps.movementStatusDetailEl) {
          const steps = Math.max(0, Math.round(Number(activitySnapshot.stepsTaken) || 0));
          deps.movementStatusDetailEl.textContent = `Ticks: ${steps}`;
        }
        if (deps.movementCancelBtn) {
          deps.movementCancelBtn.textContent = "Stop Rest";
        }
        return;
      }
      if (deps.movementStatusEtaEl) {
        if (deps.inspectLayerControlsEl) deps.inspectLayerControlsEl.classList.add("hidden");
        if (activitySnapshot.resourceId) {
          const value = Number(activitySnapshot.lastResourceValue);
          const chance = Number(activitySnapshot.lastSearchChance);
          deps.movementStatusEtaEl.textContent = `Radius: ${Math.max(0, Math.round(Number(activitySnapshot.radius) || 0))} | Wetness: ${Number.isFinite(value) ? value.toFixed(2) : "--"} | Chance: ${Number.isFinite(chance) ? `${Math.round(chance * 100)}%` : "--"}`;
        } else {
          deps.movementStatusEtaEl.textContent = `Radius: ${Math.max(0, Math.round(Number(activitySnapshot.radius) || 0))}`;
        }
      }
      if (deps.movementStatusDetailEl) {
        const steps = Math.max(0, Math.round(Number(activitySnapshot.stepsTaken) || 0));
        const visited = Math.max(0, Math.round(Number(activitySnapshot.visitedCount) || 0));
        const found = Math.max(0, Math.round(Number(activitySnapshot.foundCount) || 0));
        deps.movementStatusDetailEl.textContent = `Steps: ${steps} | Visited: ${visited} | Found: ${found}`;
      }
      if (deps.movementCancelBtn) {
        deps.movementCancelBtn.textContent = activitySnapshot.type === "gathering" ? "Stop Gathering" : "Stop Activity";
      }
      return;
    }
    if (!movementSnapshot || !movementSnapshot.active) {
      if (typeof deps.getInteractionMode === "function" && deps.getInteractionMode() === "pathfinding") {
        updateTravelPreviewPanel();
        return;
      }
      setMovementPanelVisible(false);
      if (deps.inspectLayerControlsEl) deps.inspectLayerControlsEl.classList.add("hidden");
      return;
    }
    if (deps.inspectLayerControlsEl) deps.inspectLayerControlsEl.classList.add("hidden");
    if (deps.movementStatusTitleEl) {
      deps.movementStatusTitleEl.textContent = "Player Moving";
    }
    const durationHours = typeof deps.getMovementDurationHours === "function"
      ? deps.getMovementDurationHours(movementSnapshot)
      : null;
    const remainingTicks = Math.max(0, Math.round(Number(movementSnapshot.totalTicksRemaining || 0)));
    const stepIndex = Math.max(0, Math.round(Number(movementSnapshot.currentStepIndex || 0))) + 1;
    const queueLength = Math.max(0, Math.round(Number(movementSnapshot.queueLength || 0)));
    if (deps.movementStatusEtaEl) {
      const durationLabel = durationHours == null ? "--" : formatGameDuration(durationHours);
      deps.movementStatusEtaEl.textContent = `Travel time remaining: ${durationLabel}`;
    }
    if (deps.movementStatusDetailEl) {
      deps.movementStatusDetailEl.textContent = `Path: step ${stepIndex}/${queueLength}, ${remainingTicks} ticks remaining`;
    }
    if (deps.movementCancelBtn) {
      deps.movementCancelBtn.textContent = "Cancel Travel";
    }
    setMovementPanelVisible(true);
  }

  function updateFrameInfo() {
    if (!deps.frameInfoEl || typeof deps.getFrameDebugInfo !== "function") return;
    const info = deps.getFrameDebugInfo();
    if (!info) return;
    const rawFrameMs = Number(info.frameMs);
    if (!Number.isFinite(rawFrameMs) || rawFrameMs <= 0) return;
    const rawFps = 1000 / rawFrameMs;
    if (!frameStats.initialized) {
      frameStats.initialized = true;
      frameStats.fps = rawFps;
      frameStats.frameMs = rawFrameMs;
      frameStats.profile = info.profile || null;
    } else {
      frameStats.fps = frameStats.fps * 0.9 + rawFps * 0.1;
      frameStats.frameMs = frameStats.frameMs * 0.9 + rawFrameMs * 0.1;
      if (info.profile) {
        const current = frameStats.profile || {};
        frameStats.profile = {};
        for (const [key, value] of Object.entries(info.profile)) {
          const numeric = Number(value);
          if (!Number.isFinite(numeric)) continue;
          const previous = Number(current[key]);
          frameStats.profile[key] = Number.isFinite(previous)
            ? previous * 0.9 + numeric * 0.1
            : numeric;
        }
      }
    }
    const nowMs = Number(info.nowMs);
    if (Number.isFinite(nowMs) && nowMs - frameStats.lastUpdateMs < 250) return;
    frameStats.lastUpdateMs = Number.isFinite(nowMs) ? nowMs : frameStats.lastUpdateMs;
    const nextFrameInfo = `FPS: ${frameStats.fps.toFixed(1)} | Frame: ${frameStats.frameMs.toFixed(1)} ms`;
    if (deps.frameInfoEl.textContent !== nextFrameInfo) {
      deps.frameInfoEl.textContent = nextFrameInfo;
    }
    if (deps.frameProfileInfoEl && frameStats.profile) {
      const p = frameStats.profile;
      const cpu = Number(p.totalCpuMs) || 0;
      const update = (Number(p.systemsMs) || 0) + (Number(p.gameplayMs) || 0);
      const ui = Number(p.uiMs) || 0;
      const render = Number(p.renderMs) || 0;
      const terrain = Number(p.terrainRenderMs) || 0;
      const swarm = Number(p.swarmLitRenderMs) || 0;
      const overlay = Number(p.overlayMs) || 0;
      const nextProfileInfo = `CPU: ${cpu.toFixed(1)} | Update: ${update.toFixed(1)} | UI: ${ui.toFixed(1)} | Render: ${render.toFixed(1)} (T ${terrain.toFixed(1)} / S ${swarm.toFixed(1)}) | Overlay: ${overlay.toFixed(1)}`;
      if (deps.frameProfileInfoEl.textContent !== nextProfileInfo) {
        deps.frameProfileInfoEl.textContent = nextProfileInfo;
      }
    }
    if (deps.gpuProfileInfoEl) {
      const gpu = info.gpuProfile;
      let nextGpuInfo = "GPU: unavailable";
      if (gpu && gpu.supported) {
        const passes = gpu.passes || {};
        const shadow = Number(passes.shadow) || 0;
        const blur = Number(passes.shadowBlur) || 0;
        const terrain = Number(passes.mainTerrain) || 0;
        const background = Number(passes.backgroundClear) || 0;
        const total = shadow + blur + terrain + background;
        nextGpuInfo = `GPU: ${total.toFixed(1)} | Shadow: ${shadow.toFixed(1)} | Blur: ${blur.toFixed(1)} | Terrain: ${terrain.toFixed(1)}`;
      }
      if (deps.gpuProfileInfoEl.textContent !== nextGpuInfo) {
        deps.gpuProfileInfoEl.textContent = nextGpuInfo;
      }
    }
  }

  function updateDetailInfo() {
    if (!deps.detailInfoEl || typeof deps.getDetailDebugInfo !== "function") return;
    const info = deps.getDetailDebugInfo();
    let nextDetailInfo = "Zoom: -- | Detail px/m: -- | Fade: --";
    if (info) {
      const safeZoom = Number(info.zoom);
      const safePxPerMeter = Number(info.pxPerMeter);
      const safeFade = Number(info.fade);
      const safeStartPxPerMeter = Number(info.startPxPerMeter);
      const safeFullPxPerMeter = Number(info.fullPxPerMeter);
      const loadedSourceCount = Number.isFinite(Number(info.loadedSourceCount)) ? Number(info.loadedSourceCount) : 0;
      nextDetailInfo = `Zoom: ${Number.isFinite(safeZoom) ? safeZoom.toFixed(2) : "--"} | Detail px/m: ${Number.isFinite(safePxPerMeter) ? safePxPerMeter.toFixed(2) : "--"} | Fade: ${Number.isFinite(safeFade) ? safeFade.toFixed(2) : "--"} (${Number.isFinite(safeStartPxPerMeter) ? safeStartPxPerMeter.toFixed(1) : "--"}-${Number.isFinite(safeFullPxPerMeter) ? safeFullPxPerMeter.toFixed(1) : "--"}) | Detail: ${info.atlasAvailable ? "on" : "off"} ${loadedSourceCount}/4 | Splat: ${info.materialSplatAvailable ? "yes" : "fallback"}`;
    }
    if (deps.detailInfoEl.textContent !== nextDetailInfo) {
      deps.detailInfoEl.textContent = nextDetailInfo;
    }
  }

  return function updateInfoPanel() {
    const movementSnapshot = typeof deps.getMovementSnapshot === "function"
      ? deps.getMovementSnapshot()
      : null;
    const activitySnapshot = typeof deps.getActivitySnapshot === "function"
      ? deps.getActivitySnapshot()
      : null;
    updateMovementPanel(movementSnapshot, activitySnapshot);
    updateFrameInfo();
    updateDetailInfo();

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
    if (activitySnapshot && activitySnapshot.active) {
      const nextPathInfo = activitySnapshot.type === "gathering" || activitySnapshot.resourceId
        ? `${activitySnapshot.label || "Gathering"}: steps ${activitySnapshot.stepsTaken} | visited ${activitySnapshot.visitedCount} | found ${activitySnapshot.foundCount}`
        : (activitySnapshot.type === "inspect"
          ? `Inspect: (${activitySnapshot.inspectX ?? "--"}, ${activitySnapshot.inspectY ?? "--"})`
          : (activitySnapshot.type === "rest"
            ? `Rest: ticks ${activitySnapshot.stepsTaken}`
            : (activitySnapshot.type === "travel"
              ? `Travel: steps ${activitySnapshot.stepsTaken}`
              : `Activity: ${activitySnapshot.type}`)));
      if (deps.pathInfoEl.textContent !== nextPathInfo) {
        deps.pathInfoEl.textContent = nextPathInfo;
      }
      return;
    }
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
