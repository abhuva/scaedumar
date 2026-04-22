import { normalizeRuntimeMode } from "./modeCapabilities.js";
import { registerInteractionCommands } from "../gameplay/interactionCommands.js";

export function registerMainCommands(commandBus, deps) {
  function syncCameraToStore(ctx) {
    ctx.store.update((prev) => ({
      ...prev,
      camera: {
        ...prev.camera,
        panX: deps.panWorld.x,
        panY: deps.panWorld.y,
        zoom: deps.getZoom(),
      },
    }));
  }

  function syncCursorLightToStore(ctx) {
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        cursorLight: {
          ...prev.gameplay.cursorLight,
          enabled: deps.cursorLightState.active,
          useTerrainHeight: Boolean(deps.cursorLightState.useTerrainHeight),
          strength: Math.round(deps.clamp(Number(deps.cursorLightState.strength), 1, 200)),
          heightOffset: Math.round(deps.clamp(Number(deps.cursorLightState.heightOffset), 0, 120)),
        },
      },
    }));
  }

  commandBus.register("core/setMode", (command, ctx) => {
    const nextMode = normalizeRuntimeMode(command.mode);
    ctx.store.update((prev) => ({ ...prev, mode: nextMode }));
    deps.setInteractionMode(deps.getInteractionMode());
    const interactionMode = deps.getInteractionMode();
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        interactionMode,
      },
    }));
  });

  registerInteractionCommands(commandBus, deps);

  commandBus.register("core/renderFx/changed", (command, ctx) => {
    const section = String(command.section || "");
    if (typeof deps.markSimulationKnobsDirty === "function") {
      deps.markSimulationKnobsDirty(section);
    }
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
            parallax: deps.serializeParallaxSettings(),
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
            lighting: deps.serializeLightingSettings(),
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
            fog: deps.serializeFogSettings(),
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
            clouds: deps.serializeCloudSettings(),
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
            waterFx: deps.serializeWaterSettings(),
          },
        },
      }));
    }
  });

  commandBus.register("core/swarm/settingsChanged", (command, ctx) => {
    function syncSwarmToStore() {
      const settings = deps.getSwarmSettings();
      ctx.store.update((prev) => ({
        ...prev,
        gameplay: {
          ...prev.gameplay,
          swarm: {
            ...prev.gameplay.swarm,
            ...settings,
            enabled: deps.isSwarmEnabled(),
            count: Math.max(0, Math.round(Number(deps.swarmState.count) || 0)),
            followEnabled: deps.swarmFollowState.enabled,
            followTargetType: deps.swarmFollowState.targetType === "hawk" ? "hawk" : "agent",
          },
        },
      }));
    }

    const action = String(command.action || "");
    switch (action) {
      case "showTerrainChanged":
      case "litModeChanged":
      case "backgroundColorChanged":
      case "hawkColorChanged":
      case "cursorModeChanged":
        if (action === "cursorModeChanged") {
          deps.updateSwarmUi();
        }
        deps.requestOverlayDraw();
        break;
      case "followZoomToggleChanged":
        deps.updateSwarmUi();
        deps.updateSwarmLabels();
        break;
      case "followZoomInChanged":
        deps.normalizeSwarmFollowZoomInputs("in");
        deps.updateSwarmLabels();
        break;
      case "followZoomOutChanged":
        deps.normalizeSwarmFollowZoomInputs("out");
        deps.updateSwarmLabels();
        break;
      case "followHawkRangeGizmoChanged":
        deps.updateSwarmUi();
        deps.requestOverlayDraw();
        break;
      case "followSmoothingChanged":
      case "labelOnlyChanged":
        deps.updateSwarmLabels();
        break;
      case "statsPanelChanged":
        deps.updateSwarmUi();
        deps.updateSwarmStatsPanel();
        break;
      case "agentCountChanged":
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(Math.round(deps.clamp(Number(deps.swarmAgentCountInput.value), 100, 1000)));
        break;
      case "maxSpeedChanged":
      case "maxSteeringChanged":
      case "variationChanged":
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
        break;
      case "minHeightChanged":
        deps.normalizeSwarmHeightRangeInputs("min");
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count);
        break;
      case "maxHeightChanged":
        deps.normalizeSwarmHeightRangeInputs("max");
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count);
        break;
      case "hawkEnabledChanged":
      case "hawkCountChanged":
        deps.updateSwarmUi();
        deps.updateSwarmLabels();
        deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
        break;
      case "enabledToggleChanged":
        deps.updateSwarmUi();
        deps.swarmState.lastUpdateMs = null;
        deps.swarmCursorState.active = false;
        if (deps.swarmEnabledToggle.checked) {
          deps.reseedSwarmAgents(deps.swarmState.count || deps.getSwarmSettings().agentCount);
          deps.setStatus("Agent swarm enabled.");
        } else {
          deps.swarmFollowState.enabled = false;
          deps.swarmFollowState.agentIndex = -1;
          deps.swarmFollowState.hawkIndex = -1;
          deps.resetSwarmFollowSpeedSmoothing();
          deps.updateSwarmFollowButtonUi();
          deps.requestOverlayDraw();
          deps.setStatus("Agent swarm disabled.");
        }
        break;
      default:
        break;
    }

    syncSwarmToStore();
  });

  commandBus.register("core/camera/reset", (command, ctx) => {
    deps.setZoom(1);
    deps.panWorld.x = 0;
    deps.panWorld.y = 0;
    syncCameraToStore(ctx);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/camera/zoomAtClient", (command, ctx) => {
    const ndc = deps.clientToNdc(command.clientX, command.clientY);
    const worldBefore = deps.worldFromNdc(ndc, deps.getZoom(), deps.panWorld);
    const nextZoom = Math.min(deps.zoomMax, Math.max(deps.zoomMin, deps.getZoom() * Math.exp(-command.deltaY * 0.0015)));
    const worldAfter = deps.worldFromNdc(ndc, nextZoom, deps.panWorld);
    deps.panWorld.x += worldBefore.x - worldAfter.x;
    deps.panWorld.y += worldBefore.y - worldAfter.y;
    deps.setZoom(nextZoom);
    syncCameraToStore(ctx);
    deps.requestOverlayDraw();
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
    const prevNdc = deps.clientToNdc(deps.lastDragClient.x, deps.lastDragClient.y);
    const currNdc = deps.clientToNdc(command.clientX, command.clientY);
    const worldPrev = deps.worldFromNdc(prevNdc, deps.getZoom(), deps.panWorld);
    const worldCurr = deps.worldFromNdc(currNdc, deps.getZoom(), deps.panWorld);
    deps.panWorld.x += worldPrev.x - worldCurr.x;
    deps.panWorld.y += worldPrev.y - worldCurr.y;
    deps.lastDragClient.x = command.clientX;
    deps.lastDragClient.y = command.clientY;
    syncCameraToStore(ctx);
    deps.requestOverlayDraw();
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

  commandBus.register("core/cursorLight/setEnabled", (command, ctx) => {
    deps.cursorLightState.active = Boolean(command.enabled);
    syncCursorLightToStore(ctx);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/canvas/leave", (command) => {
    deps.swarmCursorState.active = false;
    if (deps.cursorLightModeToggle.checked) {
      deps.cursorLightState.active = false;
    }
    if (deps.getInteractionMode() === "pathfinding") {
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
    }
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setTerrainFollow", (command, ctx) => {
    deps.cursorLightState.useTerrainHeight = Boolean(command.useTerrainHeight);
    syncCursorLightToStore(ctx);
    deps.updateCursorLightModeUi();
  });

  commandBus.register("core/cursorLight/setColor", (command, ctx) => {
    deps.cursorLightState.color = deps.hexToRgb01(command.colorHex);
    syncCursorLightToStore(ctx);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setStrength", (command, ctx) => {
    deps.cursorLightState.strength = Math.round(deps.clamp(Number(command.strength), 1, 200));
    syncCursorLightToStore(ctx);
    deps.updateCursorLightStrengthLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setHeightOffset", (command, ctx) => {
    deps.cursorLightState.heightOffset = Math.round(deps.clamp(Number(command.heightOffset), 0, 120));
    syncCursorLightToStore(ctx);
    deps.updateCursorLightHeightOffsetLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setGizmo", (command, ctx) => {
    deps.cursorLightState.showGizmo = Boolean(command.showGizmo);
    syncCursorLightToStore(ctx);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/swarm/toggleFollow", (command, ctx) => {
    function syncSwarmFollowToStore() {
      ctx.store.update((prev) => ({
        ...prev,
        gameplay: {
          ...prev.gameplay,
          swarm: {
            ...prev.gameplay.swarm,
            followEnabled: deps.swarmFollowState.enabled,
            followTargetType: deps.swarmFollowState.targetType,
          },
        },
      }));
    }

    if (!deps.isSwarmEnabled()) {
      deps.setStatus("Enable Agent Swarm first.");
      return;
    }
    if (deps.swarmFollowState.enabled) {
      deps.swarmFollowState.enabled = false;
      deps.swarmFollowState.agentIndex = -1;
      deps.swarmFollowState.hawkIndex = -1;
      deps.resetSwarmFollowSpeedSmoothing();
      deps.updateSwarmFollowButtonUi();
      syncSwarmFollowToStore();
      deps.setStatus("Swarm follow stopped.");
      return;
    }
    const targetType = deps.swarmFollowTargetInput.value === "hawk" ? "hawk" : "agent";
    deps.swarmFollowState.targetType = targetType;
    if (targetType === "hawk") {
      if (!deps.getSwarmSettings().useHawk || deps.swarmState.hawks.length <= 0) {
        deps.setStatus("No hawks available to follow.");
        return;
      }
      deps.swarmFollowState.hawkIndex = deps.chooseRandomFollowHawkIndex();
      deps.swarmFollowState.agentIndex = -1;
    } else {
      if (deps.swarmState.count <= 0) {
        deps.setStatus("No swarm agents available to follow.");
        return;
      }
      deps.swarmFollowState.agentIndex = deps.chooseRandomFollowAgentIndex();
      deps.swarmFollowState.hawkIndex = -1;
    }
    deps.swarmFollowState.enabled = true;
    deps.resetSwarmFollowSpeedSmoothing();
    deps.updateSwarmFollowButtonUi();
    syncSwarmFollowToStore();
    deps.setStatus(`Swarm follow enabled (${targetType}).`);
  });

  commandBus.register("core/swarm/setFollowTarget", (command, ctx) => {
    deps.swarmFollowState.targetType = command.targetType === "hawk" ? "hawk" : "agent";
    deps.updateSwarmFollowButtonUi();
    if (deps.swarmFollowState.enabled) {
      deps.swarmFollowState.enabled = false;
      deps.swarmFollowState.agentIndex = -1;
      deps.swarmFollowState.hawkIndex = -1;
      deps.resetSwarmFollowSpeedSmoothing();
      deps.setStatus("Swarm follow stopped. Start follow again to apply new target type.");
    }
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        swarm: {
          ...prev.gameplay.swarm,
          followEnabled: deps.swarmFollowState.enabled,
          followTargetType: deps.swarmFollowState.targetType,
        },
      },
    }));
  });
}
