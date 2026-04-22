export function createTimeSystem(deps) {
  return {
    update(ctx) {
      const cycleSpeedHoursPerSec = deps.clamp(Number(deps.cycleSpeedInput.value), 0, 1);
      deps.setTimeState({
        cycleSpeedHoursPerSec,
      });

      if (cycleSpeedHoursPerSec > 0 && !deps.isCycleHourScrubbing()) {
        deps.cycleState.hour = deps.wrapHour(deps.cycleState.hour + cycleSpeedHoursPerSec * ctx.dtSec);
      }
      if (!deps.isCycleHourScrubbing()) {
        deps.setCycleHourSliderFromState();
      }
    },
  };
}
