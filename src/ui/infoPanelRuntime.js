export function createInfoPanelRuntime(deps) {
  const frameStats = {
    initialized: false,
    fps: 0,
    frameMs: 0,
    profile: null,
    lastUpdateMs: 0,
  };

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
    updateMovementPanel(movementSnapshot);
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
