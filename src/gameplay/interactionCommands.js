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

  function cancelMovementFromCommand() {
    if (!isMovementActive()) return;
    if (typeof deps.cancelMovementQueue !== "function") return;
    deps.cancelMovementQueue();
    deps.movePreviewState.hoverPixel = null;
    deps.movePreviewState.pathPixels = [];
    deps.setStatus(`Movement canceled at (${deps.playerState.pixelX}, ${deps.playerState.pixelY}).`);
    syncPlayerToStore();
    deps.requestOverlayDraw();
  }

  commandBus.register("core/interaction/setMode", (command) => {
    if (isActivityActive()) {
      deps.setStatus("Stop the current activity before changing interaction mode.");
      return;
    }
    deps.setInteractionMode(command.mode);
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
    const result = deps.startGatheringActivity();
    if (!result || result.ok) {
      deps.setInteractionMode("none");
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      deps.requestOverlayDraw();
      return;
    }
    deps.setStatus(result.reason || "Unable to start gathering.");
  });

  commandBus.register("core/activity/startInspect", () => {
    if (typeof deps.startInspectActivity !== "function") return;
    const result = deps.startInspectActivity();
    if (!result || result.ok) {
      deps.setInteractionMode("none");
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      deps.requestOverlayDraw();
      return;
    }
    deps.setStatus(result.reason || "Unable to start inspect.");
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
      deps.movePreviewState.hoverPixel = { x: pixel.x, y: pixel.y };
      deps.movePreviewState.pathPixels = deps.extractPathTo(pixel.x, pixel.y);
      if (!deps.movePreviewState.pathPixels.length) {
        deps.setStatus("No reachable preview path at clicked cell.");
        deps.requestOverlayDraw();
        return;
      }
      if (typeof deps.replaceMovementQueue === "function") {
        const replaced = deps.replaceMovementQueue(deps.movePreviewState.pathPixels);
        if (!replaced) {
          deps.setStatus("Unable to queue movement for selected path.");
          deps.requestOverlayDraw();
          return;
        }
      }
      deps.setInteractionMode("none");
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      syncPlayerToStore();
      deps.requestOverlayDraw();
      return;
    }

    const runtimeMode = typeof deps.getRuntimeMode === "function" ? deps.getRuntimeMode() : RUNTIME_MODE_DEV;
    if (runtimeMode === RUNTIME_MODE_GAMEPLAY) {
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      deps.setStatus("Use PF to choose a destination.");
      deps.requestOverlayDraw();
      return;
    }

    deps.setPlayerPosition(pixel.x, pixel.y);
    if (typeof deps.cancelMovementQueue === "function") {
      deps.cancelMovementQueue();
    }
    syncPlayerToStore();
    deps.rebuildMovementField();
    deps.movePreviewState.hoverPixel = null;
    deps.movePreviewState.pathPixels = [];
    deps.setStatus(`Player moved to (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`);
    deps.requestOverlayDraw();
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
      const rawValue = deps.clamp(Number(command.value), min, max);
      const value = round ? Math.round(rawValue) : rawValue;
      updatePathfindingStoreField({ [field]: value });
      deps.syncPathfindingSettingsUi();
      if (deps.getInteractionMode() === "pathfinding") {
        deps.rebuildMovementField();
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
