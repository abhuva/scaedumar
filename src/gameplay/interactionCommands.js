export function registerInteractionCommands(commandBus, deps) {
  function isMovementActive() {
    if (typeof deps.getMovementStateSnapshot !== "function") return false;
    const snapshot = deps.getMovementStateSnapshot();
    return Boolean(snapshot && snapshot.active);
  }

  function syncPlayerToStore(ctx) {
    if (typeof deps.syncPlayerStateToStore === "function") {
      deps.syncPlayerStateToStore();
      return;
    }
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        player: {
          ...prev.gameplay.player,
          pixelX: deps.playerState.pixelX,
          pixelY: deps.playerState.pixelY,
        },
      },
    }));
  }

  commandBus.register("core/interaction/setMode", (command, ctx) => {
    deps.setInteractionMode(command.mode);
  });

  commandBus.register("core/interaction/clickMapPixel", (command, ctx) => {
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
      syncPlayerToStore(ctx);
      deps.requestOverlayDraw();
      return;
    }

    if (isMovementActive() && typeof deps.cancelMovementQueue === "function") {
      deps.cancelMovementQueue();
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      deps.setStatus(`Movement canceled at (${deps.playerState.pixelX}, ${deps.playerState.pixelY}).`);
      syncPlayerToStore(ctx);
      deps.requestOverlayDraw();
      return;
    }

    deps.setPlayerPosition(pixel.x, pixel.y);
    if (typeof deps.cancelMovementQueue === "function") {
      deps.cancelMovementQueue();
    }
    deps.rebuildMovementField();
    deps.movePreviewState.hoverPixel = null;
    deps.movePreviewState.pathPixels = [];
    deps.setStatus(`Player moved to (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`);
    syncPlayerToStore(ctx);
    deps.requestOverlayDraw();
  });

  function syncPathfindingStateToStore(ctx) {
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        pathfinding: {
          ...prev.gameplay.pathfinding,
          ...(typeof deps.getPathfindingStateSnapshot === "function" ? deps.getPathfindingStateSnapshot() : {}),
        },
      },
    }));
  }

  commandBus.register("core/pathfinding/setRange", (command, ctx) => {
    if (deps.pathfindingRangeInput && Number.isFinite(Number(command.value))) {
      deps.pathfindingRangeInput.value = String(Math.round(deps.clamp(Number(command.value), 30, 300)));
    }
    deps.updatePathfindingRangeLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setWeightSlope", (command, ctx) => {
    if (deps.pathWeightSlopeInput && Number.isFinite(Number(command.value))) {
      deps.pathWeightSlopeInput.value = String(deps.clamp(Number(command.value), 0, 10));
    }
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setWeightHeight", (command, ctx) => {
    if (deps.pathWeightHeightInput && Number.isFinite(Number(command.value))) {
      deps.pathWeightHeightInput.value = String(deps.clamp(Number(command.value), 0, 10));
    }
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setWeightWater", (command, ctx) => {
    if (deps.pathWeightWaterInput && Number.isFinite(Number(command.value))) {
      deps.pathWeightWaterInput.value = String(deps.clamp(Number(command.value), 0, 100));
    }
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setSlopeCutoff", (command, ctx) => {
    if (deps.pathSlopeCutoffInput && Number.isFinite(Number(command.value))) {
      deps.pathSlopeCutoffInput.value = String(Math.round(deps.clamp(Number(command.value), 0, 90)));
    }
    deps.updatePathSlopeCutoffLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setBaseCost", (command, ctx) => {
    if (deps.pathBaseCostInput && Number.isFinite(Number(command.value))) {
      deps.pathBaseCostInput.value = String(deps.clamp(Number(command.value), 0, 2));
    }
    deps.updatePathBaseCostLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });
}
