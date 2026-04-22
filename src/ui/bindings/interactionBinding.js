export function bindInteractionAndCycleControls(deps) {
  deps.dockLightingModeToggle.addEventListener("click", () => {
    if (typeof deps.canUseInteractionMode === "function" && !deps.canUseInteractionMode("lighting")) {
      deps.setStatus("Lighting mode is unavailable in current runtime mode.");
      return;
    }
    if (deps.getInteractionMode() === "lighting") {
      deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "none" });
      deps.setStatus("Lighting mode disabled.");
      return;
    }
    deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "lighting" });
    deps.movePreviewState.hoverPixel = null;
    deps.movePreviewState.pathPixels = [];
    deps.setStatus("Lighting mode enabled: click terrain to add/select point lights.");
  });

  deps.dockPathfindingModeToggle.addEventListener("click", () => {
    if (typeof deps.canUseInteractionMode === "function" && !deps.canUseInteractionMode("pathfinding")) {
      deps.setStatus("Pathfinding mode is unavailable in current runtime mode.");
      return;
    }
    if (deps.getInteractionMode() === "pathfinding") {
      deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "none" });
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      deps.setStatus("Pathfinding mode disabled.");
      return;
    }
    deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "pathfinding" });
    deps.rebuildMovementField();
    deps.setStatus("Pathfinding mode enabled: hover for path preview, click to move player.");
  });

  deps.cycleHourInput.addEventListener("pointerdown", () => {
    deps.dispatchCoreCommand({ type: "core/time/setHourScrubbing", scrubbing: true });
  });

  deps.windowEl.addEventListener("pointerup", () => {
    deps.dispatchCoreCommand({ type: "core/time/setHourScrubbing", scrubbing: false });
  });

  deps.cycleHourInput.addEventListener("change", () => {
    deps.dispatchCoreCommand({ type: "core/time/setHourScrubbing", scrubbing: false });
  });

  deps.cycleHourInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({
      type: "core/time/setHour",
      hour: Number(deps.cycleHourInput.value),
    });
  });
}
