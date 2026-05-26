export function createInfoPanelRuntime(deps) {
  const frameStats = {
    initialized: false,
    fps: 0,
    frameMs: 0,
    profile: null,
    lastUpdateMs: 0,
  };
  const perfOverlayState = {
    lastUpdateMs: 0,
    lastText: "",
  };

  function formatGameDuration(hoursValue) {
    const safeHours = Number(hoursValue);
    if (!Number.isFinite(safeHours)) return "--";
    const totalMinutes = Math.max(0, Math.round(safeHours * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }

  function formatRouteHours(ticks) {
    const rawTicks = Number(ticks);
    const simTickHours = typeof deps.getConfiguredSimTickHours === "function"
      ? Number(deps.getConfiguredSimTickHours())
      : 0;
    if (!Number.isFinite(rawTicks) || rawTicks <= 0 || !Number.isFinite(simTickHours) || simTickHours <= 0) return "--";
    return `${formatGameDuration(rawTicks * simTickHours)}h`;
  }

  function setMovementPanelVisible(visible) {
    if (!deps.movementStatusPanelEl) return;
    deps.movementStatusPanelEl.classList.toggle("hidden", !visible);
  }

  function setScoutActionLayout(active) {
    if (!deps.movementStatusPanelEl) return;
    deps.movementStatusPanelEl.classList.toggle("scout-action-panel", active);
  }

  function setRoutePanelLayout(active) {
    if (deps.movementStatusPanelEl) {
      deps.movementStatusPanelEl.classList.toggle("route-planning-panel", active);
    }
    if (deps.routePlanningControlsEl) {
      deps.routePlanningControlsEl.classList.toggle("hidden", !active);
    }
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

  function formatPct(value) {
    const safe = Number(value);
    return Number.isFinite(safe) ? `${Math.round(safe * 100)}%` : "--";
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

  function updateRoutePreviewPanel() {
    const snapshot = typeof deps.getRoutePlanningSnapshot === "function"
      ? deps.getRoutePlanningSnapshot()
      : null;
    const totals = snapshot && snapshot.totals ? snapshot.totals : {};
    const segmentCount = Math.max(0, Math.round(Number(totals.segmentCount) || 0));
    const sectionTicks = snapshot && snapshot.waypointPlacementActive !== false && Number.isFinite(Number(snapshot.hoverTicks))
      ? Number(snapshot.hoverTicks)
      : null;
    setMovementPanelVisible(true);
    setRoutePanelLayout(true);
    if (deps.routeSectionTimeValue) deps.routeSectionTimeValue.textContent = formatRouteHours(sectionTicks);
    if (deps.routeTotalTimeValue) deps.routeTotalTimeValue.textContent = formatRouteHours(totals.ticks);
    if (deps.routeDeleteAllBtn) deps.routeDeleteAllBtn.disabled = segmentCount <= 0;
    if (deps.movementStatusTitleEl) {
      deps.movementStatusTitleEl.textContent = "Plan Route";
    }
    if (deps.movementStatusEtaEl) {
      deps.movementStatusEtaEl.textContent = "";
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
    if (layer === "tracks") return "Tracks";
    if (layer === "plants") return "Plants";
    if (layer === "height") return "Height";
    if (layer === "slope") return "Slope";
    return "Water";
  }

  function getInspectLayerValue(inspectSnapshot) {
    const layer = inspectSnapshot && inspectSnapshot.layer;
    if (layer === "height") return clamp01(inspectSnapshot.inspectHeight);
    if (layer === "slope") return clamp01(inspectSnapshot.inspectSlope);
    if (layer === "tracks") return clamp01(inspectSnapshot.inspectTracks);
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
    const route = typeof deps.getRoutePlanningSnapshot === "function" ? deps.getRoutePlanningSnapshot() : null;
    if (deps.inspectRouteLayerBtn) {
      const routeVisible = !route || route.showCommittedOverlay !== false;
      deps.inspectRouteLayerBtn.classList.toggle("active", routeVisible);
      deps.inspectRouteLayerBtn.setAttribute("aria-pressed", routeVisible ? "true" : "false");
    }
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
    setRoutePanelLayout(false);
    updateHuntingAvailabilityPanel(activitySnapshot);
    if (deps.movementActionBtn) {
      deps.movementActionBtn.classList.add("hidden");
      deps.movementActionBtn.disabled = true;
    }
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
        return;
      }
      if (activitySnapshot.type === "scout") {
        const phase = activitySnapshot.scoutPhase === "possessed" ? "possessed" : "scanning";
        const rawCandidateIndex = Number(activitySnapshot.scoutCandidateIndex);
        const candidateIndex = Number.isFinite(rawCandidateIndex) ? Math.round(rawCandidateIndex) : -1;
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
      if (typeof deps.getInteractionMode === "function" && deps.getInteractionMode() === "routePlanning") {
        updateRoutePreviewPanel();
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

  function updateHuntingAvailabilityPanel(activitySnapshot) {
    const active = activitySnapshot && activitySnapshot.active && activitySnapshot.type === "hunting";
    if (deps.huntingAvailabilityRowEl) {
      deps.huntingAvailabilityRowEl.classList.toggle("hidden", !active);
    }
    if (!active) {
      if (deps.huntingAvailabilityBarFillEl) deps.huntingAvailabilityBarFillEl.style.width = "0%";
      return;
    }
    const availability = clamp01(activitySnapshot.huntingAvailability);
    const chance = clamp01(activitySnapshot.lastSearchChance);
    if (deps.huntingAvailabilityLabelEl) {
      deps.huntingAvailabilityLabelEl.innerHTML = `Tracks <span class="activity-meter-label-value">${Math.round(availability * 100)}%</span>`;
    }
    if (deps.huntingAvailabilityBarFillEl) {
      deps.huntingAvailabilityBarFillEl.style.width = `${Math.round(availability * 100)}%`;
    }
    if (deps.huntingAvailabilityRowEl) {
      deps.huntingAvailabilityRowEl.title = `Hunting chance ${Math.round(chance * 100)}%`;
    }
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

  function updatePerformanceOverlay() {
    if (!deps.performanceOverlayTextEl || typeof deps.isPerformanceOverlayEnabled !== "function") return;
    if (!deps.isPerformanceOverlayEnabled()) return;
    if (typeof deps.getFrameDebugInfo !== "function") return;
    const info = deps.getFrameDebugInfo();
    if (!info) return;
    const nowMs = Number(info.nowMs);
    if (Number.isFinite(nowMs) && nowMs - perfOverlayState.lastUpdateMs < 250) return;
    if (Number.isFinite(nowMs)) perfOverlayState.lastUpdateMs = nowMs;

    const fps = Number(frameStats.fps) || 0;
    const frameMs = Number(frameStats.frameMs) || 0;
    const p = frameStats.profile || {};
    const cpu = Number(p.totalCpuMs) || 0;
    const update = (Number(p.systemsMs) || 0) + (Number(p.gameplayMs) || 0);
    const ui = Number(p.uiMs) || 0;
    const render = Number(p.renderMs) || 0;
    const overlay = Number(p.overlayMs) || 0;
    const terrain = Number(p.terrainRenderMs) || 0;
    const swarmRender = Number(p.swarmLitRenderMs) || 0;
    const waterTrail = Number(p.waterTrailMs) || 0;
    const gpu = info.gpuProfile;
    const gpuPasses = gpu && gpu.supported ? (gpu.passes || {}) : null;
    const gpuShadow = gpuPasses ? (Number(gpuPasses.shadow) || 0) : 0;
    const gpuBlur = gpuPasses ? (Number(gpuPasses.shadowBlur) || 0) : 0;
    const gpuTerrain = gpuPasses ? (Number(gpuPasses.mainTerrain) || 0) : 0;
    const gpuBg = gpuPasses ? (Number(gpuPasses.backgroundClear) || 0) : 0;
    const gpuTotal = gpuPasses ? (gpuShadow + gpuBlur + gpuTerrain + gpuBg) : 0;

    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    const route = typeof deps.getRoutePlanningSnapshot === "function" ? deps.getRoutePlanningSnapshot() : null;
    const inspect = typeof deps.getInspectSnapshot === "function" ? deps.getInspectSnapshot() : null;
    const interactionMode = typeof deps.getInteractionMode === "function" ? deps.getInteractionMode() : "none";

    const lines = [
      `FPS ${fps.toFixed(1)} | Frame ${frameMs.toFixed(2)} ms | CPU ${cpu.toFixed(2)} ms`,
      `CPU parts: update ${update.toFixed(2)} | ui ${ui.toFixed(2)} | render ${render.toFixed(2)} | overlay ${overlay.toFixed(2)}`,
      `Render parts: terrain ${terrain.toFixed(2)} | swarm ${swarmRender.toFixed(2)} | trails ${waterTrail.toFixed(2)}`,
      gpuPasses
        ? `GPU ${gpuTotal.toFixed(2)} ms | terrain ${gpuTerrain.toFixed(2)} | shadow ${gpuShadow.toFixed(2)} | blur ${gpuBlur.toFixed(2)}`
        : "GPU unavailable (timer query unsupported or warming up)",
      `Mode ${interactionMode} | Inspect ${inspect && inspect.enabled ? `${inspect.layer}` : "off"} | Move ${movement && movement.active ? "active" : "idle"}`,
      `Route seg ${route && route.totals ? Number(route.totals.segmentCount || 0) : 0} | hover ${route ? route.hoverStatus : "none"} | NAV ${route && route.active ? "on" : "off"}`,
      `Player (${deps.playerState.pixelX}, ${deps.playerState.pixelY}) | Swarm ${Number(deps.swarmState && deps.swarmState.count) || 0}`,
    ];
    const text = lines.join("\n");
    if (text !== perfOverlayState.lastText) {
      deps.performanceOverlayTextEl.textContent = text;
      perfOverlayState.lastText = text;
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
    updatePerformanceOverlay();
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
      if (typeof deps.getInteractionMode === "function" && deps.getInteractionMode() === "routePlanning") {
        const route = typeof deps.getRoutePlanningSnapshot === "function" ? deps.getRoutePlanningSnapshot() : null;
        const hoverCount = Array.isArray(route && route.hoverPathPixels) ? route.hoverPathPixels.length : 0;
        const committedCount = route && route.committed && Array.isArray(route.committed.polyline)
          ? route.committed.polyline.length
          : 0;
        const hoverStatus = route && route.hoverStatus;
        const nextPathInfo = hoverCount > 0
          ? `Route: preview ${hoverCount} nodes`
          : (hoverStatus === "outside"
            ? "Route: outside terrain"
            : (hoverStatus === "unreachable" ? "Route: no reachable path" : (committedCount > 0 ? `Route: committed ${committedCount} nodes` : "Route: --")));
        if (deps.pathInfoEl.textContent !== nextPathInfo) {
          deps.pathInfoEl.textContent = nextPathInfo;
        }
        return;
      }
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
