export function registerInteractionCommands(commandBus, deps) {
  commandBus.register("core/interaction/setMode", (command, ctx) => {
    deps.setInteractionMode(command.mode);
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        interactionMode: deps.getInteractionMode(),
      },
    }));
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
      deps.setPlayerPosition(pixel.x, pixel.y);
      deps.rebuildMovementField();
      deps.movePreviewState.hoverPixel = { x: deps.playerState.pixelX, y: deps.playerState.pixelY };
      deps.movePreviewState.pathPixels = deps.extractPathTo(deps.playerState.pixelX, deps.playerState.pixelY);
      deps.setStatus(`Player moved to (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`);
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
      deps.requestOverlayDraw();
      return;
    }

    deps.setPlayerPosition(pixel.x, pixel.y);
    deps.rebuildMovementField();
    deps.movePreviewState.hoverPixel = null;
    deps.movePreviewState.pathPixels = [];
    deps.setStatus(`Player moved to (${deps.playerState.pixelX}, ${deps.playerState.pixelY})`);
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
    deps.requestOverlayDraw();
  });

  function syncPathfindingStateToStore(ctx) {
    if (typeof deps.getPathfindingStateSnapshot !== "function") return;
    const next = deps.getPathfindingStateSnapshot();
    ctx.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        pathfinding: {
          ...prev.gameplay.pathfinding,
          ...next,
        },
      },
    }));
  }

  commandBus.register("core/pathfinding/setRange", (command, ctx) => {
    deps.updatePathfindingRangeLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setWeightSlope", (command, ctx) => {
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setWeightHeight", (command, ctx) => {
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setWeightWater", (command, ctx) => {
    deps.updatePathWeightLabels();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setSlopeCutoff", (command, ctx) => {
    deps.updatePathSlopeCutoffLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });

  commandBus.register("core/pathfinding/setBaseCost", (command, ctx) => {
    deps.updatePathBaseCostLabel();
    if (deps.getInteractionMode() === "pathfinding") {
      deps.rebuildMovementField();
    }
    syncPathfindingStateToStore(ctx);
  });
}
