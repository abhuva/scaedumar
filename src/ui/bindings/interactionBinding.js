export function bindInteractionAndCycleControls(deps) {
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

  if (deps.movementActionBtn) {
    deps.movementActionBtn.addEventListener("click", () => {
      deps.dispatchCoreCommand({ type: "core/activity/possessScoutBird" });
    });
  }
}
