export function createTimeSystem(deps) {
  return {
    update(ctx) {
      const rawCycleSpeed = deps.clamp(Number(deps.cycleSpeedInput.value), 0, 1);
      const cycleSpeedHoursPerSec = Number.isFinite(rawCycleSpeed) ? rawCycleSpeed : 0;
      deps.setTimeState({
        cycleSpeedHoursPerSec,
      });
      if (typeof deps.updateStoreTime === "function") {
        deps.updateStoreTime({
          cycleSpeedHoursPerSec,
        });
      }

      if (cycleSpeedHoursPerSec > 0 && !deps.isCycleHourScrubbing()) {
        deps.cycleState.hour = deps.wrapHour(deps.cycleState.hour + cycleSpeedHoursPerSec * ctx.dtSec);
      }
      if (!deps.isCycleHourScrubbing()) {
        deps.setCycleHourSliderFromState();
      }
    },
  };
}
