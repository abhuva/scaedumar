export const RUNTIME_MODE_DEV = "dev";
export const RUNTIME_MODE_GAMEPLAY = "gameplay";

export function registerInteractionCommands(commandBus, deps) {
  function isMovementActive() {
    if (typeof deps.getMovementStateSnapshot !== "function") return false;
    const snapshot = deps.getMovementStateSnapshot();
    return Boolean(snapshot && snapshot.active);
  }

  function isActivityActive() {
    if (typeof deps.isActivityActive !== "function") return false;
    return deps.isActivityActive();
  }

  function syncPlayerToStore() {
    deps.syncPlayerStateToStore();
  }

  function notifyTravelPlanningChanged(reason) {
    if (typeof deps.emitTravelPlanningChanged === "function") {
      deps.emitTravelPlanningChanged({ reason });
      return;
    }
    deps.requestOverlayDraw();
  }

  function getTravelPlanningRuntime() {
    if (!deps.travelPlanningRuntime) {
      throw new Error("interactionCommands requires travelPlanningRuntime");
    }
    return deps.travelPlanningRuntime;
  }

  function clearTravelPlanning(reason) {
    getTravelPlanningRuntime().clearAll(reason);
  }

  function clearTravelPreview(reason) {
    getTravelPlanningRuntime().clearPreview(reason);
  }

  function startTravelPlanningRange(reason) {
    const pathfinding = typeof deps.getPathfindingStateSnapshot === "function"
      ? deps.getPathfindingStateSnapshot()
      : null;
    const origin = {
      x: deps.playerState.pixelX,
      y: deps.playerState.pixelY,
    };
    getTravelPlanningRuntime().startPathfinding(origin, pathfinding, reason);
  }

  function clearTravelPlanningRange(reason) {
    getTravelPlanningRuntime().clearRange(reason);
  }

  function setTravelHoverPath(pixel, pathPixels, reason) {
    return getTravelPlanningRuntime().setHoverPath(pixel, pathPixels, reason, { emit: false });
  }

  function commitTravelHoverPath(pixel, reason) {
    getTravelPlanningRuntime().commitCurrentPath(pixel, deps.playerState, reason, { emit: false });
  }

  function updateTravelRangeRadius(radius, reason) {
    getTravelPlanningRuntime().updateRangeRadius(radius, reason, { emit: false });
  }

  function stopPrimaryForSwitch() {
    if (isActivityActive() && typeof deps.cancelActivity === "function") {
      deps.cancelActivity();
    }
  }

  function clearPlanningPreview() {
    deps.setInteractionMode("none");
    clearTravelPlanning("planning-cleared");
    deps.routePlanningRuntime?.setActive?.(false, "planning-cleared");
  }

  function startPrimaryActivity(startFn, fallbackReason) {
    stopPrimaryForSwitch();
    const result = startFn();
    if (!result || result.ok) {
      clearPlanningPreview();
      return;
    }
    deps.setStatus(result.reason || fallbackReason);
  }

  function cancelMovementFromCommand() {
    if (!isMovementActive()) {
      if (deps.getInteractionMode() === "pathfinding") {
        deps.setInteractionMode("none");
        clearTravelPlanning("planning-canceled");
        deps.setStatus("Travel planning canceled.");
      }
      return;
    }
    if (typeof deps.cancelMovementQueue !== "function") return;
    deps.cancelMovementQueue();
    clearTravelPlanning("movement-canceled");
    deps.setStatus(`Movement canceled at (${deps.playerState.pixelX}, ${deps.playerState.pixelY}).`);
    syncPlayerToStore();
  }

  commandBus.register("core/interaction/setMode", (command) => {
    const requestedMode = command.mode === "pathfinding" || command.mode === "routePlanning" || command.mode === "lighting"
      ? command.mode
      : "none";
    const routeRuntime = deps.routePlanningRuntime;
    if (requestedMode === "routePlanning" && (!routeRuntime || typeof routeRuntime.setActive !== "function")) {
      deps.setStatus("Route mode unavailable: route runtime missing.");
      return;
    }
    if (requestedMode === "pathfinding" || requestedMode === "routePlanning") {
      stopPrimaryForSwitch();
    }
    deps.setInteractionMode(requestedMode);
    if (requestedMode === "pathfinding") {
      startTravelPlanningRange("mode-changed");
    } else {
      clearTravelPlanningRange("mode-changed");
    }
    if (requestedMode === "routePlanning") {
      const result = routeRuntime.setActive(true, "mode-changed");
      if (result && typeof result.then === "function") {
        result.then((value) => {
          if (value !== false) deps.setStatus("Route mode enabled: hover for route preview, click to add waypoint.");
        }).catch(() => {
          deps.setInteractionMode("none");
          deps.setStatus("Route mode unavailable: route runtime failed to start.");
        });
      } else if (result !== false) {
        deps.setStatus("Route mode enabled: hover for route preview, click to add waypoint.");
      }
    } else {
      routeRuntime?.setActive?.(false, "mode-changed");
    }
  });

  commandBus.register("core/movement/cancel", () => {
    if (isActivityActive() && typeof deps.cancelActivity === "function") {
      deps.cancelActivity();
      return;
    }
    cancelMovementFromCommand();
  });

  commandBus.register("core/activity/startGathering", () => {
    if (typeof deps.startGatheringActivity !== "function") return;
    startPrimaryActivity(deps.startGatheringActivity, "Unable to start gathering.");
  });

  commandBus.register("core/activity/startGatherWater", () => {
    if (typeof deps.startGatherWaterActivity !== "function") return;
    startPrimaryActivity(deps.startGatherWaterActivity, "Unable to start water gathering.");
  });

  commandBus.register("core/activity/startInspect", () => {
    if (typeof deps.startInspectActivity !== "function") return;
    const result = deps.startInspectActivity();
    if (!result || result.ok) {
      deps.requestOverlayDraw();
      return;
    }
    deps.setStatus(result.reason || "Unable to start inspect.");
  });

  commandBus.register("core/activity/startScout", () => {
    if (typeof deps.startScoutActivity !== "function") return;
    startPrimaryActivity(deps.startScoutActivity, "Unable to start scout.");
  });

  commandBus.register("core/activity/possessScoutBird", () => {
    if (typeof deps.possessScoutBird !== "function") return;
    const result = deps.possessScoutBird();
    if (!result || result.ok) {
      deps.requestOverlayDraw();
      return;
    }
    deps.setStatus(result.reason || "Unable to possess bird.");
  });

  commandBus.register("core/activity/startRest", () => {
    if (typeof deps.startRestActivity !== "function") return;
    startPrimaryActivity(deps.startRestActivity, "Unable to start rest.");
  });

  commandBus.register("core/activity/updateInspectAt", (command) => {
    if (typeof deps.updateInspectActivityAt !== "function") return;
    deps.updateInspectActivityAt(command.x, command.y);
  });

  commandBus.register("core/activity/cancel", () => {
    if (typeof deps.cancelActivity === "function") {
      deps.cancelActivity();
    }
  });

  commandBus.register("core/interaction/clickMapPixel", (command) => {
    const pixel = {
      x: Number(command.x),
      y: Number(command.y),
    };

    if (isActivityActive()) {
      deps.setStatus("Stop the current activity before starting another action.");
      deps.requestOverlayDraw();
      return;
    }

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
      const pathPixels = setTravelHoverPath(pixel, deps.extractPathTo(pixel.x, pixel.y), "path-hover");
      if (!pathPixels.length) {
        deps.setStatus("No reachable preview path at clicked cell.");
        notifyTravelPlanningChanged("unreachable-click");
        return;
      }
      if (typeof deps.replaceMovementQueue === "function") {
        const replaced = deps.replaceMovementQueue(pathPixels);
        if (!replaced) {
          deps.setStatus("Unable to queue movement for selected path.");
          notifyTravelPlanningChanged("queue-failed");
          return;
        }
        commitTravelHoverPath(pixel, "travel-committed");
      }
      if (typeof deps.startTravelActivity === "function") {
        const result = deps.startTravelActivity();
        if (result && !result.ok) {
          deps.setStatus(result.reason || "Unable to start travel.");
        }
      }
      deps.setInteractionMode("none");
      clearTravelPreview("travel-committed");
      syncPlayerToStore();
      return;
    }

    if (deps.getInteractionMode() === "routePlanning") {
      const routeRuntime = deps.routePlanningRuntime;
      const routeHit = routeRuntime?.hitTestAtPixel?.(pixel);
      if (routeHit && routeHit.type === "endpoint") {
        routeRuntime?.selectWaypointFromEndpoint?.(routeHit.segmentId, routeHit.endpoint, "route-endpoint-clicked");
        deps.setStatus("Route waypoint selected.");
        deps.requestOverlayDraw();
        return;
      }
      if (routeHit && routeHit.type === "segment") {
        routeRuntime?.selectSegment?.(routeHit.segmentId, "route-segment-clicked");
        deps.setStatus(`Route segment ${routeHit.segmentId} selected.`);
        deps.requestOverlayDraw();
        return;
      }
      const routeSnapshot = routeRuntime?.getSnapshot?.();
      if (routeSnapshot && routeSnapshot.waypointPlacementActive === false) {
        routeRuntime?.clearSelection?.("route-terrain-click-clears-selection");
        deps.setStatus("Route selection cleared.");
        deps.requestOverlayDraw();
        return;
      }
      const hasRoute = routeRuntime?.updateHoverAtPixel?.(pixel, "route-click") || false;
      if (!hasRoute || !routeRuntime?.commitHover?.("route-committed")) {
        deps.setStatus("No reachable route at clicked cell.");
        deps.requestOverlayDraw();
        return;
      }
      deps.setStatus(`Route waypoint committed at (${pixel.x}, ${pixel.y}).`);
      deps.requestOverlayDraw();
      return;
    }

    const runtimeMode = typeof deps.getRuntimeMode === "function" ? deps.getRuntimeMode() : RUNTIME_MODE_DEV;
    if (runtimeMode === RUNTIME_MODE_GAMEPLAY) {
      clearTravelPreview("gameplay-no-mode-click");
      deps.setStatus("Use PF to choose a destination.");
      return;
    }

    deps.setPlayerPosition(pixel.x, pixel.y);
    if (typeof deps.cancelMovementQueue === "function") {
      deps.cancelMovementQueue();
    }
    syncPlayerToStore();
    deps.rebuildMovementField();
    clearTravelPlanning("dev-player-moved");
    deps.setStatus(`Player moved to (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`);
  });

  commandBus.register("core/interaction/hoverMapPixel", (command) => {
    if (deps.getInteractionMode() !== "routePlanning") return;
    deps.routePlanningRuntime?.updateHoverAtPixel?.({
      x: Number(command.x),
      y: Number(command.y),
    }, "route-hover");
  });

  commandBus.register("core/interaction/hoverMapOutside", () => {
    if (deps.getInteractionMode() !== "routePlanning") return;
    deps.routePlanningRuntime?.setHoverOutside?.("route-hover-outside");
  });

  function syncPathfindingStateToStore() {
    deps.syncPathfindingStateToStore(
      typeof deps.getPathfindingStateSnapshot === "function" ? deps.getPathfindingStateSnapshot() : {},
    );
  }

  function updatePathfindingStoreField(patch) {
    deps.patchPathfindingStateToStore(patch);
  }

  function registerPathfindingSetter(commandType, field, min, max, round = false) {
    commandBus.register(commandType, (command) => {
      const parsedValue = Number(command.value);
      if (!Number.isFinite(parsedValue)) return;
      const rawValue = deps.clamp(parsedValue, min, max);
      const value = round ? Math.round(rawValue) : rawValue;
      updatePathfindingStoreField({ [field]: value });
      deps.syncPathfindingSettingsUi();
      if (deps.getInteractionMode() === "pathfinding") {
        if (field === "range") {
          updateTravelRangeRadius(Math.max(0, value) / 2, "pathfinding-setting");
        }
        deps.rebuildMovementField();
        notifyTravelPlanningChanged("pathfinding-setting");
      }
      syncPathfindingStateToStore();
    });
  }

  registerPathfindingSetter("core/pathfinding/setRange", "range", 30, 300, true);
  registerPathfindingSetter("core/pathfinding/setWeightSlope", "weightSlope", 0, 10);
  registerPathfindingSetter("core/pathfinding/setWeightHeight", "weightHeight", 0, 10);
  registerPathfindingSetter("core/pathfinding/setWeightWater", "weightWater", 0, 100);
  registerPathfindingSetter("core/pathfinding/setSlopeCutoff", "slopeCutoff", 0, 90, true);
  registerPathfindingSetter("core/pathfinding/setBaseCost", "baseCost", 0, 2);
}
