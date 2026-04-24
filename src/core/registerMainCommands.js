import { normalizeRuntimeMode } from "./modeCapabilities.js";
import { registerInteractionCommands } from "../gameplay/interactionCommands.js";

export function registerMainCommands(commandBus, deps) {
  function getFallbackCameraPose() {
    return {
      panX: 0,
      panY: 0,
      zoom: 1,
    };
  }

  function getCameraPose(ctx) {
    const camera = ctx.store.getState().camera || {};
    const fallback = getFallbackCameraPose();
    return {
      panX: Number.isFinite(Number(camera.panX)) ? Number(camera.panX) : fallback.panX,
      panY: Number.isFinite(Number(camera.panY)) ? Number(camera.panY) : fallback.panY,
      zoom: Number.isFinite(Number(camera.zoom))
        ? deps.clamp(Number(camera.zoom), deps.zoomMin, deps.zoomMax)
        : fallback.zoom,
    };
  }

  function applyCameraPose(ctx, pose, options = {}) {
    const nextPanX = Number.isFinite(Number(pose && pose.panX)) ? Number(pose.panX) : getCameraPose(ctx).panX;
    const nextPanY = Number.isFinite(Number(pose && pose.panY)) ? Number(pose.panY) : getCameraPose(ctx).panY;
    const nextZoom = Number.isFinite(Number(pose && pose.zoom))
      ? deps.clamp(Number(pose.zoom), deps.zoomMin, deps.zoomMax)
      : getCameraPose(ctx).zoom;
    ctx.store.update((prev) => ({
      ...prev,
      camera: {
        ...prev.camera,
        panX: nextPanX,
        panY: nextPanY,
        zoom: nextZoom,
      },
    }));
    if (typeof deps.applyCameraPose === "function") {
      deps.applyCameraPose({
        panX: nextPanX,
        panY: nextPanY,
        zoom: nextZoom,
      });
    }
    if (options.requestOverlay !== false) {
      deps.requestOverlayDraw();
    }
  }

  function syncCursorLightToStore(ctx) {
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        cursorLight: {
          ...prev.gameplay.cursorLight,
          enabled: Boolean(deps.cursorLightState.enabled),
          useTerrainHeight: Boolean(deps.cursorLightState.useTerrainHeight),
          strength: Math.round(deps.clamp(Number(deps.cursorLightState.strength), 1, 200)),
          heightOffset: Math.round(deps.clamp(Number(deps.cursorLightState.heightOffset), 0, 120)),
          color: typeof deps.cursorLightState.colorHex === "string" ? deps.cursorLightState.colorHex : "#ff9b2f",
          showGizmo: Boolean(deps.cursorLightState.showGizmo),
        },
      },
    }));
  }

  commandBus.register("core/setMode", (command, ctx) => {
    const nextMode = normalizeRuntimeMode(command.mode);
    ctx.store.update((prev) => ({ ...prev, mode: nextMode }));
    deps.setInteractionMode(deps.getInteractionMode());
  });

  registerInteractionCommands(commandBus, deps);

  commandBus.register("core/renderFx/changed", (command, ctx) => {
    const section = String(command.section || "");
    const patch = command.patch && typeof command.patch === "object" ? command.patch : null;
    if (section === "parallax") {
      deps.updateParallaxStrengthLabel();
      deps.updateParallaxBandsLabel();
      deps.updateParallaxUi();
      ctx.store.update((prev) => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            parallax: {
              ...(prev.simulation.knobs && prev.simulation.knobs.parallax ? prev.simulation.knobs.parallax : {}),
              ...(patch || {}),
            },
          },
        },
      }));
      return;
    }

    if (section === "lighting") {
      deps.updateShadowBlurLabel();
      deps.updateVolumetricLabels();
      deps.updateVolumetricUi();
      deps.updatePointFlickerLabels();
      deps.updatePointFlickerUi();
      ctx.store.update((prev) => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            lighting: {
              ...(prev.simulation.knobs && prev.simulation.knobs.lighting ? prev.simulation.knobs.lighting : {}),
              ...(patch || {}),
            },
          },
        },
      }));
      return;
    }

    if (section === "fog") {
      if (command.markFogColorManual) {
        deps.markFogColorManual();
      }
      deps.updateFogAlphaLabels();
      deps.updateFogFalloffLabel();
      deps.updateFogStartOffsetLabel();
      deps.updateFogUi();
      ctx.store.update((prev) => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            fog: {
              ...(prev.simulation.knobs && prev.simulation.knobs.fog ? prev.simulation.knobs.fog : {}),
              ...(patch || {}),
            },
          },
        },
      }));
      return;
    }

    if (section === "clouds") {
      deps.updateCloudLabels();
      deps.updateCloudUi();
      ctx.store.update((prev) => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            clouds: {
              ...(prev.simulation.knobs && prev.simulation.knobs.clouds ? prev.simulation.knobs.clouds : {}),
              ...(patch || {}),
            },
          },
        },
      }));
      return;
    }

    if (section === "waterfx") {
      deps.updateWaterLabels();
      deps.updateWaterUi();
      if (command.rebuildFlowMap) {
        deps.rebuildFlowMapTexture();
      }
      ctx.store.update((prev) => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            waterFx: {
              ...(prev.simulation.knobs && prev.simulation.knobs.waterFx ? prev.simulation.knobs.waterFx : {}),
              ...(patch || {}),
            },
          },
        },
      }));
    }
  });

  commandBus.register("core/swarm/settingsChanged", (command, ctx) => {
    function updateSwarmSettings(patch) {
      ctx.store.update((prev) => ({
        ...prev,
        gameplay: {
          ...prev.gameplay,
          swarm: {
            ...prev.gameplay.swarm,
            ...patch,
          },
        },
      }));
    }

    function normalizeHexColor(value, fallback) {
      if (typeof value === "string" && /^#?[0-9a-fA-F]{6}$/.test(value)) {
        return value.startsWith("#") ? value : `#${value}`;
      }
      return fallback;
    }

    const action = String(command.action || "");
    switch (action) {
      case "showTerrainChanged":
        updateSwarmSettings({ showTerrainInSwarm: Boolean(command.value) });
        deps.requestOverlayDraw();
        break;
      case "litModeChanged":
        updateSwarmSettings({ useLitSwarm: Boolean(command.value) });
        deps.requestOverlayDraw();
        break;
      case "backgroundColorChanged": {
        const backgroundColor = normalizeHexColor(command.value, deps.getSwarmSettings().backgroundColor);
        updateSwarmSettings({ backgroundColor });
        deps.requestOverlayDraw();
        break;
      }
      case "hawkColorChanged": {
        const hawkColor = normalizeHexColor(command.value, deps.getSwarmSettings().hawkColor);
        updateSwarmSettings({ hawkColor });
        deps.requestOverlayDraw();
        break;
      }
      case "cursorModeChanged":
        updateSwarmSettings({
          cursorMode: command.value === "attract" || command.value === "repel" ? command.value : "none",
        });
        deps.updateSwarmUi();
        deps.requestOverlayDraw();
        break;
      case "followZoomToggleChanged":
        updateSwarmSettings({ followZoomBySpeed: Boolean(command.value) });
        deps.updateSwarmUi();
        deps.updateSwarmLabels();
        break;
      case "followZoomInChanged": {
        const zoomOut = deps.clamp(Number(command.zoomOut), deps.zoomMin, deps.zoomMax);
        const zoomIn = Math.max(zoomOut, deps.clamp(Number(command.zoomIn), deps.zoomMin, deps.zoomMax));
        deps.swarmFollowZoomOutInput.value = zoomOut.toFixed(1);
        deps.swarmFollowZoomInInput.value = zoomIn.toFixed(1);
        updateSwarmSettings({ followZoomOut: zoomOut, followZoomIn: zoomIn });
        deps.updateSwarmLabels();
        break;
      }
      case "followZoomOutChanged": {
        const zoomIn = deps.clamp(Number(command.zoomIn), deps.zoomMin, deps.zoomMax);
        const zoomOut = Math.min(zoomIn, deps.clamp(Number(command.zoomOut), deps.zoomMin, deps.zoomMax));
        deps.swarmFollowZoomOutInput.value = zoomOut.toFixed(1);
        deps.swarmFollowZoomInInput.value = zoomIn.toFixed(1);
        updateSwarmSettings({ followZoomOut: zoomOut, followZoomIn: zoomIn });
        deps.updateSwarmLabels();
        break;
      }
      case "followHawkRangeGizmoChanged":
        updateSwarmSettings({ followHawkRangeGizmo: Boolean(command.value) });
        deps.updateSwarmUi();
        deps.requestOverlayDraw();
        break;
      case "followAgentSpeedSmoothingChanged": {
        const value = deps.clamp(Number(command.value), 0.01, 0.25);
        deps.swarmFollowAgentSpeedSmoothingInput.value = value.toFixed(2);
        updateSwarmSettings({ followAgentSpeedSmoothing: value });
        deps.updateSwarmLabels();
        break;
      }
      case "followAgentZoomSmoothingChanged": {
        const value = deps.clamp(Number(command.value), 0.01, 0.25);
        deps.swarmFollowAgentZoomSmoothingInput.value = value.toFixed(2);
        updateSwarmSettings({ followAgentZoomSmoothing: value });
        deps.updateSwarmLabels();
        break;
      }
      case "simulationSpeedChanged": {
        const value = deps.clamp(Number(command.value), 0.1, 20);
        deps.swarmUpdateIntervalInput.value = String(value);
        updateSwarmSettings({ simulationSpeed: value });
        deps.updateSwarmLabels();
        break;
      }
      case "neighborRadiusChanged": {
        const value = deps.clamp(Number(command.value), 10, 200);
        deps.swarmNeighborRadiusInput.value = String(value);
        updateSwarmSettings({ neighborRadius: value });
        deps.updateSwarmLabels();
        break;
      }
      case "separationRadiusChanged": {
        const value = deps.clamp(Number(command.value), 6, 120);
        deps.swarmSeparationRadiusInput.value = String(value);
        updateSwarmSettings({ separationRadius: value });
        deps.updateSwarmLabels();
        break;
      }
      case "alignmentWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 4);
        deps.swarmAlignmentWeightInput.value = String(value);
        updateSwarmSettings({ alignmentWeight: value });
        deps.updateSwarmLabels();
        break;
      }
      case "cohesionWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 4);
        deps.swarmCohesionWeightInput.value = String(value);
        updateSwarmSettings({ cohesionWeight: value });
        deps.updateSwarmLabels();
        break;
      }
      case "separationWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 6);
        deps.swarmSeparationWeightInput.value = String(value);
        updateSwarmSettings({ separationWeight: value });
        deps.updateSwarmLabels();
        break;
      }
      case "wanderWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 2);
        deps.swarmWanderWeightInput.value = String(value);
        updateSwarmSettings({ wanderWeight: value });
        deps.updateSwarmLabels();
        break;
      }
      case "restChanceChanged": {
        const value = deps.clamp(Number(command.value), 0, 0.002);
        deps.swarmRestChanceInput.value = String(value);
        updateSwarmSettings({ restChancePct: value });
        deps.updateSwarmLabels();
        break;
      }
      case "restTicksChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 100, 10000));
        deps.swarmRestTicksInput.value = String(value);
        updateSwarmSettings({ restTicks: value });
        deps.updateSwarmLabels();
        break;
      }
      case "breedingThresholdChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 0, 1000));
        deps.swarmBreedingThresholdInput.value = String(value);
        updateSwarmSettings({ breedingThreshold: value });
        deps.updateSwarmLabels();
        break;
      }
      case "breedingSpawnChanceChanged": {
        const value = deps.clamp(Number(command.value), 0, 1);
        deps.swarmBreedingSpawnChanceInput.value = String(value);
        updateSwarmSettings({ breedingSpawnChance: value });
        deps.updateSwarmLabels();
        break;
      }
      case "cursorStrengthChanged": {
        const value = deps.clamp(Number(command.value), 0, 8);
        deps.swarmCursorStrengthInput.value = String(value);
        updateSwarmSettings({ cursorStrength: value });
        deps.updateSwarmLabels();
        break;
      }
      case "cursorRadiusChanged": {
        const value = deps.clamp(Number(command.value), 20, 260);
        deps.swarmCursorRadiusInput.value = String(value);
        updateSwarmSettings({ cursorRadius: value });
        deps.updateSwarmLabels();
        break;
      }
      case "hawkSpeedChanged": {
        const value = deps.clamp(Number(command.value), 30, 420);
        deps.swarmHawkSpeedInput.value = String(value);
        updateSwarmSettings({ hawkSpeed: value });
        deps.updateSwarmLabels();
        break;
      }
      case "hawkSteeringChanged": {
        const value = deps.clamp(Number(command.value), 20, 700);
        deps.swarmHawkSteeringInput.value = String(value);
        updateSwarmSettings({ hawkSteering: value });
        deps.updateSwarmLabels();
        break;
      }
      case "hawkTargetRangeChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 20, 500));
        deps.swarmHawkTargetRangeInput.value = String(value);
        updateSwarmSettings({ hawkTargetRange: value });
        deps.updateSwarmLabels();
        break;
      }
      case "statsPanelChanged":
        updateSwarmSettings({ showStatsPanel: Boolean(command.value) });
        deps.updateSwarmUi();
        deps.updateSwarmStatsPanel();
        break;
      case "agentCountChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 100, 1000));
        deps.swarmAgentCountInput.value = String(value);
        updateSwarmSettings({ agentCount: value });
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.getSwarmSettings().agentCount);
        break;
      }
      case "maxSpeedChanged": {
        const value = deps.clamp(Number(command.value), 30, 300);
        deps.swarmMaxSpeedInput.value = String(value);
        updateSwarmSettings({ maxSpeed: value });
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
        break;
      }
      case "maxSteeringChanged": {
        const value = deps.clamp(Number(command.value), 10, 500);
        deps.swarmSteeringMaxInput.value = String(value);
        updateSwarmSettings({ maxSteering: value });
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
        break;
      }
      case "variationChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 0, 50));
        deps.swarmVariationStrengthInput.value = String(value);
        updateSwarmSettings({ variationStrengthPct: value });
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
        break;
      }
      case "minHeightChanged": {
        let minHeight = Math.round(deps.clamp(Number(command.minHeight), 0, 256));
        let maxHeight = Math.round(deps.clamp(Number(command.maxHeight), 0, 256));
        if (minHeight > maxHeight) {
          maxHeight = minHeight;
        }
        deps.swarmMinHeightInput.value = String(minHeight);
        deps.swarmMaxHeightInput.value = String(maxHeight);
        updateSwarmSettings({ minHeight, maxHeight });
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count);
        break;
      }
      case "maxHeightChanged": {
        let minHeight = Math.round(deps.clamp(Number(command.minHeight), 0, 256));
        let maxHeight = Math.round(deps.clamp(Number(command.maxHeight), 0, 256));
        if (minHeight > maxHeight) {
          minHeight = maxHeight;
        }
        deps.swarmMinHeightInput.value = String(minHeight);
        deps.swarmMaxHeightInput.value = String(maxHeight);
        updateSwarmSettings({ minHeight, maxHeight });
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count);
        break;
      }
      case "hawkEnabledChanged": {
        updateSwarmSettings({ useHawk: Boolean(command.value) });
        deps.updateSwarmUi();
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
        break;
      }
      case "hawkCountChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 0, 20));
        deps.swarmHawkCountInput.value = String(value);
        updateSwarmSettings({ hawkCount: value });
        deps.updateSwarmUi();
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
        break;
      }
      case "enabledToggleChanged":
        updateSwarmSettings({ useAgentSwarm: Boolean(command.value) });
        deps.updateSwarmUi();
        deps.swarmState.lastUpdateMs = null;
        deps.swarmCursorState.active = false;
        if (deps.getSwarmSettings().useAgentSwarm) {
          deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
          deps.setStatus("Agent swarm enabled.");
        } else {
          deps.stopSwarmFollow({ syncStore: false });
          deps.requestOverlayDraw();
          deps.setStatus("Agent swarm disabled.");
        }
        break;
      default:
        break;
    }

    deps.syncSwarmStateToStore();
  });

  commandBus.register("core/camera/reset", (command, ctx) => {
    applyCameraPose(ctx, { zoom: 1, panX: 0, panY: 0 });
  });

  commandBus.register("core/camera/zoomAtClient", (command, ctx) => {
    const camera = getCameraPose(ctx);
    const ndc = deps.clientToNdc(command.clientX, command.clientY);
    const pan = { x: camera.panX, y: camera.panY };
    const worldBefore = deps.worldFromNdc(ndc, camera.zoom, pan);
    const nextZoom = Math.min(deps.zoomMax, Math.max(deps.zoomMin, camera.zoom * Math.exp(-command.deltaY * 0.0015)));
    const worldAfter = deps.worldFromNdc(ndc, nextZoom, pan);
    applyCameraPose(ctx, {
      panX: camera.panX + (worldBefore.x - worldAfter.x),
      panY: camera.panY + (worldBefore.y - worldAfter.y),
      zoom: nextZoom,
    });
  });

  commandBus.register("core/camera/beginMiddleDrag", (command) => {
    deps.setMiddleDragging(true);
    deps.lastDragClient.x = command.clientX;
    deps.lastDragClient.y = command.clientY;
  });

  commandBus.register("core/camera/endMiddleDrag", () => {
    deps.setMiddleDragging(false);
  });

  commandBus.register("core/camera/dragToClient", (command, ctx) => {
    const camera = getCameraPose(ctx);
    const prevNdc = deps.clientToNdc(deps.lastDragClient.x, deps.lastDragClient.y);
    const currNdc = deps.clientToNdc(command.clientX, command.clientY);
    const pan = { x: camera.panX, y: camera.panY };
    const worldPrev = deps.worldFromNdc(prevNdc, camera.zoom, pan);
    const worldCurr = deps.worldFromNdc(currNdc, camera.zoom, pan);
    deps.lastDragClient.x = command.clientX;
    deps.lastDragClient.y = command.clientY;
    applyCameraPose(ctx, {
      panX: camera.panX + (worldPrev.x - worldCurr.x),
      panY: camera.panY + (worldPrev.y - worldCurr.y),
      zoom: camera.zoom,
    });
  });

  commandBus.register("core/camera/setPose", (command, ctx) => {
    const current = getCameraPose(ctx);
    applyCameraPose(
      ctx,
      {
        panX: Number.isFinite(Number(command.panX)) ? Number(command.panX) : current.panX,
        panY: Number.isFinite(Number(command.panY)) ? Number(command.panY) : current.panY,
        zoom: Number.isFinite(Number(command.zoom)) ? Number(command.zoom) : current.zoom,
      },
      { requestOverlay: command.requestOverlay },
    );
  });

  commandBus.register("core/time/setHourScrubbing", (command) => {
    deps.setCycleHourScrubbing(Boolean(command.scrubbing));
  });

  commandBus.register("core/time/setHour", (command, ctx) => {
    deps.cycleState.hour = deps.clamp(Number(command.hour), 0, 24);
    ctx.store.update((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        cycleHour: deps.cycleState.hour,
      },
    }));
    deps.updateCycleHourLabel();
  });

  commandBus.register("core/time/setCycleSpeed", (command, ctx) => {
    const nextSpeed = deps.clamp(Number(command.cycleSpeed), 0, 1);
    if (deps.cycleSpeedInput) {
      deps.cycleSpeedInput.value = String(nextSpeed);
    }
    ctx.store.update((prev) => ({
      ...prev,
      clock: {
        ...prev.clock,
        timeScale: nextSpeed,
      },
      systems: {
        ...prev.systems,
        time: {
          ...prev.systems.time,
          cycleSpeedHoursPerSec: nextSpeed,
        },
      },
    }));
  });

  commandBus.register("core/time/setSimTickHours", (command, ctx) => {
    const nextTick = deps.clamp(Number(command.simTickHours), 0.001, 0.1);
    if (deps.simTickHoursInput) {
      deps.simTickHoursInput.value = String(nextTick);
    }
    ctx.store.update((prev) => ({
      ...prev,
      systems: {
        ...prev.systems,
        time: {
          ...prev.systems.time,
          simTickHours: nextTick,
        },
      },
    }));
    if (typeof deps.updateSimTickLabel === "function") {
      deps.updateSimTickLabel();
    }
  });

  commandBus.register("core/time/setRouting", (command, ctx) => {
    const target = String(command.target || "");
    const mode = command.mode === "detached" ? "detached" : "global";
    const allowedTargets = new Set(["movement", "swarm", "clouds", "water", "weather"]);
    if (!allowedTargets.has(target)) return;
    if (target === "swarm" && deps.swarmTimeRoutingInput) {
      deps.swarmTimeRoutingInput.value = mode;
    }
    if (target === "clouds" && deps.cloudTimeRoutingInput) {
      deps.cloudTimeRoutingInput.value = mode;
    }
    if (target === "water" && deps.waterTimeRoutingInput) {
      deps.waterTimeRoutingInput.value = mode;
    }
    ctx.store.update((prev) => ({
      ...prev,
      systems: {
        ...prev.systems,
        time: {
          ...prev.systems.time,
          routing: {
            ...(prev.systems.time && prev.systems.time.routing ? prev.systems.time.routing : {}),
            [target]: mode,
          },
        },
      },
    }));
  });

  commandBus.register("core/pointLights/setLiveUpdate", (command, ctx) => {
    const liveUpdate = Boolean(command.liveUpdate);
    if (deps.pointLightLiveUpdateToggle) {
      deps.pointLightLiveUpdateToggle.checked = liveUpdate;
    }
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        pointLights: {
          ...(prev.gameplay && prev.gameplay.pointLights ? prev.gameplay.pointLights : {}),
          liveUpdate,
        },
      },
    }));
  });

  commandBus.register("core/cursorLight/setEnabled", (command, ctx) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      enabled: Boolean(command.enabled),
    });
    syncCursorLightToStore(ctx);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/canvas/leave", (command) => {
    deps.swarmCursorState.active = false;
    if (deps.getCursorLightSnapshot().enabled) {
      deps.clearCursorLightPointerState();
    }
    if (deps.getInteractionMode() === "pathfinding") {
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
    }
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setTerrainFollow", (command, ctx) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      useTerrainHeight: Boolean(command.useTerrainHeight),
    });
    syncCursorLightToStore(ctx);
    deps.updateCursorLightModeUi();
  });

  commandBus.register("core/cursorLight/setColor", (command, ctx) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      colorHex: typeof command.colorHex === "string" ? command.colorHex : "#ff9b2f",
    });
    syncCursorLightToStore(ctx);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setStrength", (command, ctx) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      strength: Math.round(deps.clamp(Number(command.strength), 1, 200)),
    });
    syncCursorLightToStore(ctx);
    deps.updateCursorLightStrengthLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setHeightOffset", (command, ctx) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      heightOffset: Math.round(deps.clamp(Number(command.heightOffset), 0, 120)),
    });
    syncCursorLightToStore(ctx);
    deps.updateCursorLightHeightOffsetLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setGizmo", (command, ctx) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      showGizmo: Boolean(command.showGizmo),
    });
    syncCursorLightToStore(ctx);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/swarm/toggleFollow", (command, ctx) => {
    const follow = deps.getSwarmFollowSnapshot();
    if (!deps.isSwarmEnabled()) {
      deps.setStatus("Enable Agent Swarm first.");
      return;
    }
    if (follow.enabled) {
      deps.stopSwarmFollow({ syncStore: true });
      deps.setStatus("Swarm follow stopped.");
      return;
    }
    const targetType = deps.getSwarmSettings().followTargetType === "hawk" ? "hawk" : "agent";
    if (targetType === "hawk") {
      if (!deps.getSwarmSettings().useHawk || deps.swarmState.hawks.length <= 0) {
        deps.setStatus("No hawks available to follow.");
        return;
      }
      deps.applySwarmFollowState({
        enabled: true,
        targetType,
        agentIndex: -1,
        hawkIndex: deps.chooseRandomFollowHawkIndex(),
      }, { syncStore: true });
    } else {
      if (deps.swarmState.count <= 0) {
        deps.setStatus("No swarm agents available to follow.");
        return;
      }
      deps.applySwarmFollowState({
        enabled: true,
        targetType,
        agentIndex: deps.chooseRandomFollowAgentIndex(),
        hawkIndex: -1,
      }, { syncStore: true });
    }
    deps.setStatus(`Swarm follow enabled (${targetType}).`);
  });

  commandBus.register("core/swarm/setFollowTarget", (command, ctx) => {
    const follow = deps.getSwarmFollowSnapshot();
    deps.applySwarmFollowState({
      enabled: follow.enabled,
      targetType: command.targetType === "hawk" ? "hawk" : "agent",
      agentIndex: follow.agentIndex,
      hawkIndex: follow.hawkIndex,
    }, { resetSpeed: false });
    if (follow.enabled) {
      deps.stopSwarmFollow({ targetType: follow.targetType });
      deps.setStatus("Swarm follow stopped. Start follow again to apply new target type.");
    }
    deps.syncSwarmFollowToStore();
  });
}
