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
    if (typeof deps.requestOverlayDraw === "function") {
      deps.requestOverlayDraw();
    }
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
      if (typeof deps.requestOverlayDraw === "function") {
        deps.requestOverlayDraw();
      }
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

  const stopScrubbing = () => {
    deps.dispatchCoreCommand({ type: "core/time/setHourScrubbing", scrubbing: false });
  };
  deps.windowEl.addEventListener("pointerup", stopScrubbing);
  deps.windowEl.addEventListener("pointercancel", stopScrubbing);
  deps.windowEl.addEventListener("blur", stopScrubbing);

  deps.cycleHourInput.addEventListener("change", () => {
    deps.dispatchCoreCommand({ type: "core/time/setHourScrubbing", scrubbing: false });
    deps.dispatchCoreCommand({
      type: "core/time/setHour",
      hour: Number(deps.cycleHourInput.value),
    });
  });

  deps.cycleHourInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({
      type: "core/time/setHour",
      hour: Number(deps.cycleHourInput.value),
    });
  });

  if (deps.simTickHoursInput) {
    const dispatchTickChange = () => {
      const simTickHours = Number(deps.simTickHoursInput.value);
      if (Number.isNaN(simTickHours)) return;
      deps.dispatchCoreCommand({
        type: "core/time/setSimTickHours",
        simTickHours,
      });
    };
    deps.simTickHoursInput.addEventListener("input", dispatchTickChange);
    deps.simTickHoursInput.addEventListener("change", dispatchTickChange);
  }

  if (deps.cycleSpeedInput) {
    const dispatchCycleSpeedChange = () => {
      const cycleSpeed = Number(deps.cycleSpeedInput.value);
      if (Number.isNaN(cycleSpeed)) return;
      deps.dispatchCoreCommand({
        type: "core/time/setCycleSpeed",
        cycleSpeed,
      });
    };
    deps.cycleSpeedInput.addEventListener("input", dispatchCycleSpeedChange);
    deps.cycleSpeedInput.addEventListener("change", dispatchCycleSpeedChange);
  }
}
