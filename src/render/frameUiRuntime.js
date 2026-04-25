export function createFrameUiRuntime(deps) {
  function syncFogAutoColorInput(lightingParams) {
    if (
      !lightingParams.fogColorManual
      && typeof lightingParams.autoFogHex === "string"
      && deps.fogColorInput.value !== lightingParams.autoFogHex
    ) {
      deps.fogColorInput.value = lightingParams.autoFogHex;
    }
  }

  function syncCycleInfoText(systemState) {
    const cycleSpeed = Number(systemState.time && systemState.time.cycleSpeedHoursPerSec) || 0;
    const simTick = deps.normalizeSimTickHours(
      systemState.time && systemState.time.simTickHours != null
        ? systemState.time.simTickHours
        : deps.getConfiguredSimTickHours(),
    );
    const nextCycleInfo = `Time: ${deps.formatHour(deps.cycleState.hour)} | Speed: ${cycleSpeed.toFixed(2)} h/s | Tick: ${simTick.toFixed(3)}h`;
    if (deps.cycleInfoEl.textContent !== nextCycleInfo) {
      deps.cycleInfoEl.textContent = nextCycleInfo;
    }
    return { cycleSpeed, simTick };
  }

  return {
    syncFogAutoColorInput,
    syncCycleInfoText,
  };
}
