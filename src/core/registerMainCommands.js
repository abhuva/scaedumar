import { normalizeRuntimeMode } from "./modeCapabilities.js";
import { registerInteractionCommands } from "../gameplay/interactionCommands.js";
import { DEFAULT_CURSOR_LIGHT_COLOR_HEX } from "./state.js";

export function registerMainCommands(commandBus, deps) {
  function clampRound(value, min, max) {
    return Math.round(deps.clamp(Number(value), min, max));
  }

  function normalizeHexColor(value, fallback) {
    if (typeof value === "string" && /^#?[0-9a-fA-F]{6}$/.test(value)) {
      return value.startsWith("#") ? value : `#${value}`;
    }
    return fallback;
  }

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
    const current = getCameraPose(ctx);
    const nextPanX = Number.isFinite(Number(pose && pose.panX)) ? Number(pose.panX) : current.panX;
    const nextPanY = Number.isFinite(Number(pose && pose.panY)) ? Number(pose.panY) : current.panY;
    const nextZoom = Number.isFinite(Number(pose && pose.zoom))
      ? deps.clamp(Number(pose.zoom), deps.zoomMin, deps.zoomMax)
      : current.zoom;
    deps.setCameraPoseToStore(nextPanX, nextPanY, nextZoom);
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

  function syncCursorLightToStore() {
    deps.syncCursorLightStateToStore();
  }

  commandBus.register("core/setMode", (command) => {
    const nextMode = normalizeRuntimeMode(command.mode);
    deps.setModeToStore(nextMode);
    deps.setInteractionMode(deps.getInteractionMode());
  });

  registerInteractionCommands(commandBus, deps);

  commandBus.register("core/renderFx/changed", (command) => {
    const section = String(command.section || "");
    const patch = command.patch && typeof command.patch === "object" ? command.patch : null;

    function updateSimulationSection(key, nextSection) {
      deps.patchSimulationKnobSectionToStore(key, nextSection);
    }

    function getLightingSettings() {
      const current = deps.serializeLightingSettings();
      return {
        ...current,
        ...(patch || {}),
      };
    }

    function getParallaxSettings() {
      const current = deps.serializeParallaxSettings();
      return {
        ...current,
        ...(patch || {}),
      };
    }

    function getFogSettings() {
      const current = deps.serializeFogSettings();
      return {
        ...current,
        ...(patch || {}),
      };
    }

    function getCloudSettings() {
      const current = deps.serializeCloudSettings();
      return {
        ...current,
        ...(patch || {}),
      };
    }

    function getWaterSettings() {
      const current = deps.serializeWaterSettings();
      return {
        ...current,
        ...(patch || {}),
      };
    }

    if (section === "parallax") {
      const nextParallax = getParallaxSettings();
      updateSimulationSection("parallax", {
        useParallax: Boolean(nextParallax.useParallax),
        parallaxStrength: deps.clamp(Number(nextParallax.parallaxStrength), 0, 1),
        parallaxBands: clampRound(nextParallax.parallaxBands, 2, 256),
      });
      deps.syncRenderFxParallaxUi();
      return;
    }

    if (section === "lighting") {
      const nextLighting = getLightingSettings();
      updateSimulationSection("lighting", {
        ...nextLighting,
        useShadows: Boolean(nextLighting.useShadows),
        heightScale: clampRound(nextLighting.heightScale, 1, 300),
        shadowStrength: deps.clamp(Number(nextLighting.shadowStrength), 0, 1),
        shadowBlur: deps.clamp(Number(nextLighting.shadowBlur), 0, 3),
        ambient: deps.clamp(Number(nextLighting.ambient), 0, 1),
        diffuse: deps.clamp(Number(nextLighting.diffuse), 0, 2),
        useVolumetric: Boolean(nextLighting.useVolumetric),
        volumetricStrength: deps.clamp(Number(nextLighting.volumetricStrength), 0, 1),
        volumetricDensity: deps.clamp(Number(nextLighting.volumetricDensity), 0, 2),
        volumetricAnisotropy: deps.clamp(Number(nextLighting.volumetricAnisotropy), 0, 0.95),
        volumetricLength: clampRound(nextLighting.volumetricLength, 8, 160),
        volumetricSamples: clampRound(nextLighting.volumetricSamples, 4, 24),
        pointFlickerEnabled: Boolean(nextLighting.pointFlickerEnabled),
        pointFlickerStrength: deps.clamp(Number(nextLighting.pointFlickerStrength), 0, 1),
        pointFlickerSpeed: deps.clamp(Number(nextLighting.pointFlickerSpeed), 0.1, 12),
        pointFlickerSpatial: deps.clamp(Number(nextLighting.pointFlickerSpatial), 0, 4),
      });
      deps.syncRenderFxLightingUi();
      if (typeof deps.schedulePointLightBake === "function" && patch && Object.prototype.hasOwnProperty.call(patch, "heightScale")) {
        deps.schedulePointLightBake();
      }
      return;
    }

    if (section === "fog") {
      const currentFog = deps.serializeFogSettings();
      const nextFog = {
        ...currentFog,
        ...(patch || {}),
      };
      updateSimulationSection("fog", {
        useFog: Boolean(nextFog.useFog),
        fogColor: normalizeHexColor(nextFog.fogColor, currentFog.fogColor),
        fogColorManual: command.markFogColorManual ? true : Boolean(nextFog.fogColorManual),
        fogMinAlpha: deps.clamp(Number(nextFog.fogMinAlpha), 0, 1),
        fogMaxAlpha: deps.clamp(Number(nextFog.fogMaxAlpha), 0, 1),
        fogFalloff: deps.clamp(Number(nextFog.fogFalloff), 0.2, 4),
        fogStartOffset: deps.clamp(Number(nextFog.fogStartOffset), 0, 1),
      });
      if (command.markFogColorManual) {
        deps.markFogColorManual();
      }
      deps.syncRenderFxFogUi();
      return;
    }

    if (section === "clouds") {
      const nextClouds = getCloudSettings();
      updateSimulationSection("clouds", {
        ...nextClouds,
        useClouds: Boolean(nextClouds.useClouds),
        cloudCoverage: deps.clamp(Number(nextClouds.cloudCoverage), 0, 1),
        cloudSoftness: deps.clamp(Number(nextClouds.cloudSoftness), 0.01, 0.35),
        cloudOpacity: deps.clamp(Number(nextClouds.cloudOpacity), 0, 1),
        cloudScale: deps.clamp(Number(nextClouds.cloudScale), 0.5, 8),
        cloudSpeed1: deps.clamp(Number(nextClouds.cloudSpeed1), -0.3, 0.3),
        cloudSpeed2: deps.clamp(Number(nextClouds.cloudSpeed2), -0.3, 0.3),
        cloudSunParallax: deps.clamp(Number(nextClouds.cloudSunParallax), 0, 2),
        cloudUseSunProjection: Boolean(nextClouds.cloudUseSunProjection),
      });
      deps.syncRenderFxCloudUi();
      return;
    }

    if (section === "waterfx") {
      const currentWater = deps.serializeWaterSettings();
      const nextWater = {
        ...currentWater,
        ...(patch || {}),
      };
      updateSimulationSection("waterFx", {
        ...nextWater,
        useWaterFx: Boolean(nextWater.useWaterFx),
        waterFlowDownhill: Boolean(nextWater.waterFlowDownhill),
        waterFlowInvertDownhill: Boolean(nextWater.waterFlowInvertDownhill),
        waterFlowDebug: Boolean(nextWater.waterFlowDebug),
        waterFlowDirectionDeg: clampRound(nextWater.waterFlowDirectionDeg, 0, 360),
        waterLocalFlowMix: deps.clamp(Number(nextWater.waterLocalFlowMix), 0, 1),
        waterDownhillBoost: deps.clamp(Number(nextWater.waterDownhillBoost), 0, 4),
        waterFlowRadius1: clampRound(nextWater.waterFlowRadius1, 1, 12),
        waterFlowRadius2: clampRound(nextWater.waterFlowRadius2, 1, 24),
        waterFlowRadius3: clampRound(nextWater.waterFlowRadius3, 1, 40),
        waterFlowWeight1: deps.clamp(Number(nextWater.waterFlowWeight1), 0, 1),
        waterFlowWeight2: deps.clamp(Number(nextWater.waterFlowWeight2), 0, 1),
        waterFlowWeight3: deps.clamp(Number(nextWater.waterFlowWeight3), 0, 1),
        waterFlowStrength: deps.clamp(Number(nextWater.waterFlowStrength), 0, 0.15),
        waterFlowSpeed: deps.clamp(Number(nextWater.waterFlowSpeed), 0, 2.5),
        waterFlowScale: deps.clamp(Number(nextWater.waterFlowScale), 0.5, 14),
        waterShimmerStrength: deps.clamp(Number(nextWater.waterShimmerStrength), 0, 0.2),
        waterGlintStrength: deps.clamp(Number(nextWater.waterGlintStrength), 0, 1.5),
        waterGlintSharpness: deps.clamp(Number(nextWater.waterGlintSharpness), 0, 1),
        waterShoreFoamStrength: deps.clamp(Number(nextWater.waterShoreFoamStrength), 0, 0.5),
        waterShoreWidth: deps.clamp(Number(nextWater.waterShoreWidth), 0.4, 6),
        waterReflectivity: deps.clamp(Number(nextWater.waterReflectivity), 0, 1),
        waterTintColor: normalizeHexColor(nextWater.waterTintColor, currentWater.waterTintColor),
        waterTintStrength: deps.clamp(Number(nextWater.waterTintStrength), 0, 1),
      });
      deps.syncRenderFxWaterUi();
      if (command.rebuildFlowMap) {
        deps.rebuildFlowMapTexture();
      }
    }
  });

  commandBus.register("core/swarm/settingsChanged", (command) => {
    function updateSwarmSettings(patch) {
      deps.patchSwarmSettingsToStore(patch);
      settings = deps.getSwarmSettings();
    }

    function refreshSettings() {
      settings = deps.getSwarmSettings();
      return settings;
    }

    const action = String(command.action || "");
    let settings = deps.getSwarmSettings();
    let shouldSyncSwarmPanelUi = false;
    function handleHeightChange() {
      let minHeight = Math.round(deps.clamp(Number(command.minHeight), 0, 256));
      let maxHeight = Math.round(deps.clamp(Number(command.maxHeight), 0, 256));
      if (minHeight > maxHeight) {
        if (action === "minHeightChanged") {
          maxHeight = minHeight;
        } else {
          minHeight = maxHeight;
        }
      }
      deps.swarmMinHeightInput.value = String(minHeight);
      deps.swarmMaxHeightInput.value = String(maxHeight);
      updateSwarmSettings({ minHeight, maxHeight });
      deps.updateSwarmLabels();
      deps.reseedSwarmAgents(deps.swarmState.count);
    }
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
        const backgroundColor = normalizeHexColor(command.value, settings.backgroundColor);
        updateSwarmSettings({ backgroundColor });
        deps.requestOverlayDraw();
        break;
      }
      case "hawkColorChanged": {
        const hawkColor = normalizeHexColor(command.value, settings.hawkColor);
        updateSwarmSettings({ hawkColor });
        deps.requestOverlayDraw();
        break;
      }
      case "cursorModeChanged":
        updateSwarmSettings({
          cursorMode: command.value === "attract" || command.value === "repel" ? command.value : "none",
        });
        shouldSyncSwarmPanelUi = true;
        deps.requestOverlayDraw();
        break;
      case "followZoomToggleChanged":
        updateSwarmSettings({ followZoomBySpeed: Boolean(command.value) });
        shouldSyncSwarmPanelUi = true;
        break;
      case "followZoomInChanged": {
        const zoomOut = deps.clamp(
          Number(command.zoomOut ?? settings.followZoomOut),
          deps.zoomMin,
          deps.zoomMax,
        );
        const zoomIn = Math.max(zoomOut, deps.clamp(Number(command.zoomIn), deps.zoomMin, deps.zoomMax));
        updateSwarmSettings({ followZoomOut: zoomOut, followZoomIn: zoomIn });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "followZoomOutChanged": {
        const zoomIn = deps.clamp(
          Number(command.zoomIn ?? settings.followZoomIn),
          deps.zoomMin,
          deps.zoomMax,
        );
        const zoomOut = Math.min(zoomIn, deps.clamp(Number(command.zoomOut), deps.zoomMin, deps.zoomMax));
        updateSwarmSettings({ followZoomOut: zoomOut, followZoomIn: zoomIn });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "followHawkRangeGizmoChanged":
        updateSwarmSettings({ followHawkRangeGizmo: Boolean(command.value) });
        shouldSyncSwarmPanelUi = true;
        deps.requestOverlayDraw();
        break;
      case "followAgentSpeedSmoothingChanged": {
        const value = deps.clamp(Number(command.value), 0.01, 0.25);
        updateSwarmSettings({ followAgentSpeedSmoothing: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "followAgentZoomSmoothingChanged": {
        const value = deps.clamp(Number(command.value), 0.01, 0.25);
        updateSwarmSettings({ followAgentZoomSmoothing: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "simulationSpeedChanged": {
        const value = deps.clamp(Number(command.value), 0.1, 20);
        updateSwarmSettings({ simulationSpeed: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "neighborRadiusChanged": {
        const value = deps.clamp(Number(command.value), 10, 200);
        updateSwarmSettings({ neighborRadius: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "separationRadiusChanged": {
        const value = deps.clamp(Number(command.value), 6, 120);
        updateSwarmSettings({ separationRadius: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "alignmentWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 4);
        updateSwarmSettings({ alignmentWeight: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "cohesionWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 4);
        updateSwarmSettings({ cohesionWeight: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "separationWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 6);
        updateSwarmSettings({ separationWeight: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "wanderWeightChanged": {
        const value = deps.clamp(Number(command.value), 0, 2);
        updateSwarmSettings({ wanderWeight: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "restChanceChanged": {
        const value = deps.clamp(Number(command.value), 0, 0.002);
        updateSwarmSettings({ restChancePct: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "restTicksChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 100, 10000));
        updateSwarmSettings({ restTicks: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "breedingThresholdChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 0, 1000));
        updateSwarmSettings({ breedingThreshold: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "breedingSpawnChanceChanged": {
        const value = deps.clamp(Number(command.value), 0, 1);
        updateSwarmSettings({ breedingSpawnChance: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "cursorStrengthChanged": {
        const value = deps.clamp(Number(command.value), 0, 8);
        updateSwarmSettings({ cursorStrength: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "cursorRadiusChanged": {
        const value = deps.clamp(Number(command.value), 20, 260);
        updateSwarmSettings({ cursorRadius: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "hawkSpeedChanged": {
        const value = deps.clamp(Number(command.value), 30, 420);
        updateSwarmSettings({ hawkSpeed: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "hawkSteeringChanged": {
        const value = deps.clamp(Number(command.value), 20, 700);
        updateSwarmSettings({ hawkSteering: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "hawkTargetRangeChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 20, 500));
        updateSwarmSettings({ hawkTargetRange: value });
        shouldSyncSwarmPanelUi = true;
        break;
      }
      case "statsPanelChanged":
        updateSwarmSettings({ showStatsPanel: Boolean(command.value) });
        shouldSyncSwarmPanelUi = true;
        deps.updateSwarmStatsPanel();
        break;
      case "agentCountChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 100, 1000));
        updateSwarmSettings({ agentCount: value });
        shouldSyncSwarmPanelUi = true;
        deps.reseedSwarmAgents(settings.agentCount);
        break;
      }
      case "maxSpeedChanged": {
        const value = deps.clamp(Number(command.value), 30, 300);
        updateSwarmSettings({ maxSpeed: value });
        shouldSyncSwarmPanelUi = true;
        deps.reseedSwarmAgents(deps.swarmState.count || settings.agentCount);
        break;
      }
      case "maxSteeringChanged": {
        const value = deps.clamp(Number(command.value), 10, 500);
        updateSwarmSettings({ maxSteering: value });
        shouldSyncSwarmPanelUi = true;
        deps.reseedSwarmAgents(deps.swarmState.count || settings.agentCount);
        break;
      }
      case "variationChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 0, 50));
        updateSwarmSettings({ variationStrengthPct: value });
        shouldSyncSwarmPanelUi = true;
        deps.reseedSwarmAgents(deps.swarmState.count || settings.agentCount);
        break;
      }
      case "minHeightChanged":
      case "maxHeightChanged": {
        handleHeightChange();
        break;
      }
      case "hawkEnabledChanged": {
        updateSwarmSettings({ useHawk: Boolean(command.value) });
        shouldSyncSwarmPanelUi = true;
        deps.reseedSwarmAgents(deps.swarmState.count || settings.agentCount);
        break;
      }
      case "hawkCountChanged": {
        const value = Math.round(deps.clamp(Number(command.value), 0, 20));
        updateSwarmSettings({ hawkCount: value });
        shouldSyncSwarmPanelUi = true;
        deps.reseedSwarmAgents(deps.swarmState.count || settings.agentCount);
        break;
      }
      case "enabledToggleChanged":
        updateSwarmSettings({ useAgentSwarm: Boolean(command.value) });
        shouldSyncSwarmPanelUi = true;
        deps.swarmState.lastUpdateMs = null;
        deps.swarmCursorState.active = false;
        const nextSettings = refreshSettings();
        if (nextSettings.useAgentSwarm) {
          deps.reseedSwarmAgents(deps.swarmState.count || nextSettings.agentCount);
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

    if (shouldSyncSwarmPanelUi) {
      deps.syncSwarmPanelUi();
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

  commandBus.register("core/time/setHour", (command) => {
    deps.cycleState.hour = deps.clamp(Number(command.hour), 0, 24);
    deps.setCycleHourUiToStore(deps.cycleState.hour);
    deps.updateCycleHourLabel();
  });

  commandBus.register("core/time/setCycleSpeed", (command) => {
    const nextSpeed = deps.clamp(Number(command.cycleSpeed), 0, 1);
    deps.syncCycleSpeedInput(nextSpeed);
    deps.setCycleSpeedToStore(nextSpeed);
  });

  commandBus.register("core/time/setSimTickHours", (command) => {
    const nextTick = deps.clamp(Number(command.simTickHours), 0.001, 0.1);
    deps.syncSimTickHoursInput(nextTick);
    deps.setSimTickHoursToStore(nextTick);
    if (typeof deps.updateSimTickLabel === "function") {
      deps.updateSimTickLabel();
    }
  });

  commandBus.register("core/time/setRouting", (command) => {
    const target = String(command.target || "");
    const mode = command.mode === "detached" ? "detached" : "global";
    const allowedTargets = new Set(["swarm", "clouds", "water"]);
    if (!allowedTargets.has(target)) return;
    deps.syncRoutingInput(target, mode);
    deps.setTimeRoutingModeToStore(target, mode);
  });

  commandBus.register("core/pointLights/setLiveUpdate", (command) => {
    const liveUpdate = Boolean(command.liveUpdate);
    if (typeof deps.syncPointLightLiveUpdateToggle === "function") {
      deps.syncPointLightLiveUpdateToggle(liveUpdate);
    }
    deps.syncPointLightsStateToStore(liveUpdate);
  });

  commandBus.register("core/cursorLight/setEnabled", (command) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      enabled: Boolean(command.enabled),
    });
    syncCursorLightToStore();
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

  commandBus.register("core/cursorLight/setTerrainFollow", (command) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      useTerrainHeight: Boolean(command.useTerrainHeight),
    });
    syncCursorLightToStore();
    deps.updateCursorLightModeUi();
  });

  commandBus.register("core/cursorLight/setColor", (command) => {
    const colorHex = normalizeHexColor(command.colorHex, DEFAULT_CURSOR_LIGHT_COLOR_HEX);
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      colorHex,
    });
    syncCursorLightToStore();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setStrength", (command) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      strength: Math.round(deps.clamp(Number(command.strength), 1, 200)),
    });
    syncCursorLightToStore();
    deps.updateCursorLightStrengthLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setHeightOffset", (command) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      heightOffset: Math.round(deps.clamp(Number(command.heightOffset), 0, 120)),
    });
    syncCursorLightToStore();
    deps.updateCursorLightHeightOffsetLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setGizmo", (command) => {
    deps.applyCursorLightConfigSnapshot({
      ...deps.getCursorLightSnapshot(),
      showGizmo: Boolean(command.showGizmo),
    });
    syncCursorLightToStore();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/swarm/toggleFollow", (command) => {
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

  commandBus.register("core/swarm/setFollowTarget", (command) => {
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
