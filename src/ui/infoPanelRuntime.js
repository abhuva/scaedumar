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

  function setScoutActionLayout(active) {
    if (!deps.movementStatusPanelEl) return;
    deps.movementStatusPanelEl.classList.toggle("scout-action-panel", active);
  }

  function clamp01(value) {
    const safe = Number(value);
    return Number.isFinite(safe) ? Math.max(0, Math.min(1, safe)) : 0;
  }

  function formatSigned(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || Math.abs(number) < 0.0005) return "0.00";
    return `${number > 0 ? "+" : ""}${number.toFixed(2)}`;
  }

  function setCancelVisible(visible) {
    if (!deps.movementCancelBtn) return;
    deps.movementCancelBtn.classList.toggle("hidden", !visible);
  }

  function formatPct(value) {
    const safe = Number(value);
    return Number.isFinite(safe) ? `${Math.round(safe * 100)}%` : "--";
  }

  function updateTravelPreviewPanel() {
    const estimate = typeof deps.getTravelPreviewEstimate === "function"
      ? deps.getTravelPreviewEstimate()
      : null;
    setMovementPanelVisible(true);
    setCancelVisible(false);
    if (deps.movementStatusTitleEl) {
      deps.movementStatusTitleEl.textContent = "Plan Travel";
    }
    if (!estimate || estimate.state === "empty") {
      if (deps.movementStatusEtaEl) {
        deps.movementStatusEtaEl.textContent = "Hover a reachable destination.";
      }
      if (deps.movementStatusDetailEl) deps.movementStatusDetailEl.textContent = "";
      return;
    }
    if (!estimate.reachable) {
      if (deps.movementStatusTitleEl) {
        deps.movementStatusTitleEl.textContent = "Plan Travel";
      }
      if (deps.movementStatusEtaEl) {
        deps.movementStatusEtaEl.textContent = "No reachable path";
      }
      if (deps.movementStatusDetailEl) {
        deps.movementStatusDetailEl.textContent = "";
      }
      return;
    }

    const duration = formatGameDuration(estimate.durationHours);
    if (deps.movementStatusTitleEl) {
      deps.movementStatusTitleEl.textContent = `Plan Travel: est. ${duration} hours`;
    }
    const warningText = Array.isArray(estimate.projectedWarnings) && estimate.projectedWarnings.length
      ? `Predicted: ${estimate.projectedWarnings.map((warning) => warning.label).join(", ")}`
      : "";
    if (deps.movementStatusEtaEl) {
      deps.movementStatusEtaEl.textContent = warningText;
    }
    if (deps.movementStatusDetailEl) {
      deps.movementStatusDetailEl.textContent = "";
    }
  }

  function isInspectFocused(inspectSnapshot, activitySnapshot) {
    if (!inspectSnapshot || !inspectSnapshot.enabled) return false;
    if (!activitySnapshot || !activitySnapshot.active) return true;
    return activitySnapshot.type !== "rest" && activitySnapshot.type !== "scout";
  }

  function getInspectLayerLabel(layer) {
    if (layer === "plants") return "Plants";
    if (layer === "height") return "Height";
    if (layer === "slope") return "Slope";
    return "Water";
  }

  function getInspectLayerValue(inspectSnapshot) {
    const layer = inspectSnapshot && inspectSnapshot.layer;
    if (layer === "height") return clamp01(inspectSnapshot.inspectHeight);
    if (layer === "slope") return clamp01(inspectSnapshot.inspectSlope);
    const resourceId = layer === "plants" ? "plants" : "water";
    const readings = Array.isArray(inspectSnapshot && inspectSnapshot.inspectResources)
      ? inspectSnapshot.inspectResources
      : [];
    const reading = readings.find((item) => item && item.resourceId === resourceId);
    if (!reading) return 0;
    const stockMode = inspectSnapshot.stockOverlayMode || "known";
    const stock = stockMode === "live"
      ? Number(reading.stock)
      : (stockMode === "none" ? 1 : Number(reading.knownStock));
    return clamp01(Number(reading.value) * Number(reading.knowledge) * (Number.isFinite(stock) ? stock : 0));
  }

  function updateInspectPanel(activitySnapshot) {
    const inspect = typeof deps.getInspectSnapshot === "function" ? deps.getInspectSnapshot() : null;
    const focused = isInspectFocused(inspect, activitySnapshot);
    if (deps.inspectStatusPanelEl) {
      deps.inspectStatusPanelEl.classList.toggle("inspect-disabled", !focused);
    }
    if (deps.inspectLayerControlsEl) {
      deps.inspectLayerControlsEl.classList.remove("hidden");
      for (const button of deps.inspectLayerControlsEl.querySelectorAll("button")) {
        button.disabled = !focused;
      }
    }
    if (!inspect) return;
    if (deps.inspectStatusTitleEl) deps.inspectStatusTitleEl.textContent = "Inspect:";
    if (deps.inspectStatusEtaEl) deps.inspectStatusEtaEl.textContent = "";
    if (deps.inspectResourceRowEl) {
      deps.inspectResourceRowEl.classList.toggle("hidden", !focused);
    }
    if (focused) {
      if (deps.inspectResourceLabelEl) deps.inspectResourceLabelEl.textContent = getInspectLayerLabel(inspect.layer);
      if (deps.inspectResourceBarFillEl) deps.inspectResourceBarFillEl.style.width = `${Math.round(getInspectLayerValue(inspect) * 100)}%`;
    } else if (deps.inspectResourceBarFillEl) {
      deps.inspectResourceBarFillEl.style.width = "0%";
    }
    if (deps.inspectStatusDetailEl) {
      deps.inspectStatusDetailEl.textContent = focused
        ? `${getInspectLayerLabel(inspect.layer)} ${Math.round(getInspectLayerValue(inspect) * 100)}%`
        : "Inspect focus off.";
    }
  }

  function updateMovementPanel(movementSnapshot, activitySnapshot) {
    setScoutActionLayout(false);
    if (deps.movementActionBtn) {
      deps.movementActionBtn.classList.add("hidden");
      deps.movementActionBtn.disabled = true;
    }
    setCancelVisible(false);
    updateInspectPanel(activitySnapshot);
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
        const durationHours = typeof deps.getMovementDurationHours === "function"
          ? deps.getMovementDurationHours(movementSnapshot)
          : null;
        if (deps.movementStatusEtaEl) {
          deps.movementStatusEtaEl.textContent = `Travel time: ${durationHours == null ? "--" : `${formatGameDuration(durationHours)} hours`}`;
        }
        if (deps.movementStatusDetailEl) {
          deps.movementStatusDetailEl.textContent = "";
        }
        return;
      }
      if (activitySnapshot.type === "rest") {
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
      if (activitySnapshot.type === "scout") {
        const phase = activitySnapshot.scoutPhase === "possessed" ? "possessed" : "scanning";
        const candidateIndex = Math.round(Number(activitySnapshot.scoutCandidateIndex));
        const disconnectReason = typeof activitySnapshot.scoutDisconnectReason === "string"
          ? activitySnapshot.scoutDisconnectReason
          : "";
        if (deps.movementStatusTitleEl) {
          deps.movementStatusTitleEl.textContent = phase === "possessed" ? "Bird Scout" : "Scouting";
        }
        if (deps.movementStatusEtaEl) {
          deps.movementStatusEtaEl.textContent = phase === "possessed"
            ? "Bird possessed"
            : (candidateIndex >= 0 ? "Bird is within reach" : "Listening");
        }
        if (deps.movementStatusDetailEl) {
          deps.movementStatusDetailEl.textContent = phase === "possessed"
            ? ""
            : disconnectReason;
        }
        if (deps.movementActionBtn) {
          setScoutActionLayout(phase !== "possessed");
          deps.movementActionBtn.textContent = "POS";
          deps.movementActionBtn.title = "Possess Bird";
          deps.movementActionBtn.setAttribute("aria-label", "Possess bird");
          deps.movementActionBtn.disabled = phase === "possessed" || candidateIndex < 0;
          deps.movementActionBtn.classList.toggle("hidden", phase === "possessed");
        }
        return;
      }
      if (deps.movementStatusEtaEl) {
        if (activitySnapshot.resourceId) {
          deps.movementStatusEtaEl.textContent = "";
        } else {
          deps.movementStatusEtaEl.textContent = "";
        }
      }
      if (deps.movementStatusDetailEl) {
        const found = Math.max(0, Math.round(Number(activitySnapshot.foundCount) || 0));
        deps.movementStatusDetailEl.textContent = found > 0 ? `Found: ${found}` : "";
      }
      return;
    }
    if (!movementSnapshot || !movementSnapshot.active) {
      if (typeof deps.getInteractionMode === "function" && deps.getInteractionMode() === "pathfinding") {
        updateTravelPreviewPanel();
        return;
      }
      setMovementPanelVisible(false);
      return;
    }
    if (deps.movementStatusTitleEl) {
      deps.movementStatusTitleEl.textContent = "Player Moving";
    }
    const durationHours = typeof deps.getMovementDurationHours === "function"
      ? deps.getMovementDurationHours(movementSnapshot)
      : null;
    if (deps.movementStatusEtaEl) {
      const durationLabel = durationHours == null ? "--" : formatGameDuration(durationHours);
      deps.movementStatusEtaEl.textContent = `Travel time: ${durationLabel} hours`;
    }
    if (deps.movementStatusDetailEl) {
      deps.movementStatusDetailEl.textContent = "";
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
