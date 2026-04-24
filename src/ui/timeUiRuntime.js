export function createTimeUiRuntime(deps) {
  function setCycleHourSliderFromState() {
    deps.cycleHourInput.value = String(deps.clamp(deps.cycleState.hour, 0, 24));
  }

  function updateCycleHourLabel() {
    deps.cycleHourValue.textContent = deps.formatHour(deps.cycleState.hour);
  }

  return {
    setCycleHourSliderFromState,
    updateCycleHourLabel,
  };
}
