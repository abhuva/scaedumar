export function registerMainCommands(commandBus, deps) {
  commandBus.register("core/setMode", (command, ctx) => {
    const nextMode = command.mode === "gameplay" || command.mode === "hybrid" ? command.mode : "dev";
    ctx.store.update((prev) => ({ ...prev, mode: nextMode }));
  });

  commandBus.register("core/interaction/setMode", (command) => {
    deps.setInteractionMode(command.mode);
  });

  commandBus.register("core/camera/reset", () => {
    deps.setZoom(1);
    deps.panWorld.x = 0;
    deps.panWorld.y = 0;
    deps.requestOverlayDraw();
  });

  commandBus.register("core/camera/zoomAtClient", (command) => {
    const ndc = deps.clientToNdc(command.clientX, command.clientY);
    const worldBefore = deps.worldFromNdc(ndc, deps.getZoom(), deps.panWorld);
    const nextZoom = Math.min(deps.zoomMax, Math.max(deps.zoomMin, deps.getZoom() * Math.exp(-command.deltaY * 0.0015)));
    const worldAfter = deps.worldFromNdc(ndc, nextZoom, deps.panWorld);
    deps.panWorld.x += worldBefore.x - worldAfter.x;
    deps.panWorld.y += worldBefore.y - worldAfter.y;
    deps.setZoom(nextZoom);
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

  commandBus.register("core/camera/dragToClient", (command) => {
    const prevNdc = deps.clientToNdc(deps.lastDragClient.x, deps.lastDragClient.y);
    const currNdc = deps.clientToNdc(command.clientX, command.clientY);
    const worldPrev = deps.worldFromNdc(prevNdc, deps.getZoom(), deps.panWorld);
    const worldCurr = deps.worldFromNdc(currNdc, deps.getZoom(), deps.panWorld);
    deps.panWorld.x += worldPrev.x - worldCurr.x;
    deps.panWorld.y += worldPrev.y - worldCurr.y;
    deps.lastDragClient.x = command.clientX;
    deps.lastDragClient.y = command.clientY;
    deps.requestOverlayDraw();
  });

  commandBus.register("core/time/setHourScrubbing", (command) => {
    deps.setCycleHourScrubbing(Boolean(command.scrubbing));
  });

  commandBus.register("core/time/setHour", (command) => {
    deps.cycleState.hour = deps.clamp(Number(command.hour), 0, 24);
    deps.updateCycleHourLabel();
  });

  commandBus.register("core/cursorLight/setEnabled", (command) => {
    if (command.enabled) return;
    deps.cursorLightState.active = false;
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setTerrainFollow", (command) => {
    deps.cursorLightState.useTerrainHeight = Boolean(command.useTerrainHeight);
    deps.updateCursorLightModeUi();
  });

  commandBus.register("core/cursorLight/setColor", (command) => {
    deps.cursorLightState.color = deps.hexToRgb01(command.colorHex);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setStrength", (command) => {
    deps.cursorLightState.strength = Math.round(deps.clamp(Number(command.strength), 1, 200));
    deps.updateCursorLightStrengthLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setHeightOffset", (command) => {
    deps.cursorLightState.heightOffset = Math.round(deps.clamp(Number(command.heightOffset), 0, 120));
    deps.updateCursorLightHeightOffsetLabel();
    deps.requestOverlayDraw();
  });

  commandBus.register("core/cursorLight/setGizmo", (command) => {
    deps.cursorLightState.showGizmo = Boolean(command.showGizmo);
    deps.requestOverlayDraw();
  });

  commandBus.register("core/interaction/clickMapPixel", (command) => {
    const pixel = {
      x: Number(command.x),
      y: Number(command.y),
    };

    if (deps.getInteractionMode() === "lighting") {
      const existing = deps.findPointLightAtPixel(pixel.x, pixel.y);
      if (existing) {
        deps.beginLightEdit(existing);
        deps.setStatus(`Selected point light at (${existing.pixelX}, ${existing.pixelY})`);
      } else {
        deps.createPointLight(pixel.x, pixel.y);
      }
      deps.requestOverlayDraw();
      return;
    }

    if (deps.getInteractionMode() === "pathfinding") {
      deps.movePreviewState.hoverPixel = { x: pixel.x, y: pixel.y };
      deps.movePreviewState.pathPixels = deps.extractPathTo(pixel.x, pixel.y);
      if (!deps.movePreviewState.pathPixels.length) {
        deps.setStatus("No reachable preview path at clicked cell.");
        return;
      }
      deps.setPlayerPosition(pixel.x, pixel.y);
      deps.rebuildMovementField();
      deps.setStatus(`Player moved to (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`);
      return;
    }

    deps.setPlayerPosition(pixel.x, pixel.y);
    deps.rebuildMovementField();
    deps.setStatus(`Player moved to (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`);
  });

  commandBus.register("core/pathfinding/setRange", () => {
    deps.updatePathfindingRangeLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
  });

  commandBus.register("core/pathfinding/setWeightSlope", () => {
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
  });

  commandBus.register("core/pathfinding/setWeightHeight", () => {
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
  });

  commandBus.register("core/pathfinding/setWeightWater", () => {
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
  });

  commandBus.register("core/pathfinding/setSlopeCutoff", () => {
    deps.updatePathSlopeCutoffLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
  });

  commandBus.register("core/pathfinding/setBaseCost", () => {
    deps.updatePathBaseCostLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
  });

  commandBus.register("core/swarm/toggleFollow", () => {
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
    deps.setStatus(`Swarm follow enabled (${targetType}).`);
  });

  commandBus.register("core/swarm/setFollowTarget", (command) => {
    deps.swarmFollowState.targetType = command.targetType === "hawk" ? "hawk" : "agent";
    deps.updateSwarmFollowButtonUi();
    if (deps.swarmFollowState.enabled) {
      deps.swarmFollowState.enabled = false;
      deps.swarmFollowState.agentIndex = -1;
      deps.swarmFollowState.hawkIndex = -1;
      deps.resetSwarmFollowSpeedSmoothing();
      deps.setStatus("Swarm follow stopped. Start follow again to apply new target type.");
    }
  });
}
