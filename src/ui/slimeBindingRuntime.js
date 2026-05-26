export function bindSlimeControls(deps) {
  function dispatchSettings(patch) {
    deps.commandBus.dispatch({ type: "core/slime/settingsChanged", patch });
  }

  deps.slimeStartBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "slime/start" }));
  deps.slimeStopBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "slime/stop" }));
  deps.slimeResetBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "slime/reset" }));
  deps.slimeRandomizeBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "slime/randomizeSeed" }));
  deps.slimeAgentCountInput.addEventListener("change", () => dispatchSettings({ agentCount: Number(deps.slimeAgentCountInput.value) }));
  deps.slimeSimSizeInput.addEventListener("change", () => dispatchSettings({ simSize: Number(deps.slimeSimSizeInput.value) }));
  deps.slimeStepsPerFrameInput.addEventListener("input", () => dispatchSettings({ stepsPerFrame: Number(deps.slimeStepsPerFrameInput.value) }));
  deps.slimeTimeModeInput.addEventListener("change", () => dispatchSettings({ timeMode: deps.slimeTimeModeInput.value }));
  deps.slimeStepsPerGameTickInput.addEventListener("input", () => dispatchSettings({ stepsPerGameTick: Number(deps.slimeStepsPerGameTickInput.value) }));
  for (const button of deps.slimeGameSpeedBtns || []) {
    button.addEventListener("click", () => {
      deps.commandBus.dispatch({
        type: "core/time/setCycleSpeed",
        cycleSpeed: Number(button.dataset.cycleSpeed),
      });
    });
  }
  deps.slimeAvailabilityGridSizeInput.addEventListener("input", () => dispatchSettings({ availabilityGridSize: Number(deps.slimeAvailabilityGridSizeInput.value) }));
  deps.slimeAvailabilityEffectiveMaxInput.addEventListener("input", () => dispatchSettings({ availabilityEffectiveMax: Number(deps.slimeAvailabilityEffectiveMaxInput.value) }));
  deps.slimeAvailabilityUpdateTickIntervalInput.addEventListener("input", () => dispatchSettings({ availabilityUpdateTickInterval: Number(deps.slimeAvailabilityUpdateTickIntervalInput.value) }));
  deps.slimeSensorDistanceInput.addEventListener("input", () => dispatchSettings({ sensorDistance: Number(deps.slimeSensorDistanceInput.value) }));
  deps.slimeSensorAngleInput.addEventListener("input", () => dispatchSettings({ sensorAngleDeg: Number(deps.slimeSensorAngleInput.value) }));
  deps.slimeSensorSizeInput.addEventListener("input", () => dispatchSettings({ sensorSize: Number(deps.slimeSensorSizeInput.value) }));
  deps.slimeSensorNoiseInput.addEventListener("input", () => dispatchSettings({ sensorNoise: Number(deps.slimeSensorNoiseInput.value) }));
  deps.slimeStepSizeInput.addEventListener("input", () => dispatchSettings({ stepSize: Number(deps.slimeStepSizeInput.value) }));
  deps.slimeTurnAngleInput.addEventListener("input", () => dispatchSettings({ turnAngleDeg: Number(deps.slimeTurnAngleInput.value) }));
  deps.slimeWanderChanceInput.addEventListener("input", () => dispatchSettings({ wanderChance: Number(deps.slimeWanderChanceInput.value) }));
  deps.slimeWanderStrengthInput.addEventListener("input", () => dispatchSettings({ wanderStrengthDeg: Number(deps.slimeWanderStrengthInput.value) }));
  deps.slimeDepositAmountInput.addEventListener("input", () => dispatchSettings({ depositAmount: Number(deps.slimeDepositAmountInput.value) }));
  deps.slimeDepositSizeInput.addEventListener("input", () => dispatchSettings({ depositSize: Number(deps.slimeDepositSizeInput.value) }));
  deps.slimeDiffusionInput.addEventListener("input", () => dispatchSettings({ diffusion: Number(deps.slimeDiffusionInput.value) }));
  deps.slimeDecayInput.addEventListener("input", () => dispatchSettings({ decay: Number(deps.slimeDecayInput.value) }));
  deps.slimeTrailGainInput.addEventListener("input", () => dispatchSettings({ trailGain: Number(deps.slimeTrailGainInput.value) }));
  deps.slimeTrailGammaInput.addEventListener("input", () => dispatchSettings({ trailGamma: Number(deps.slimeTrailGammaInput.value) }));
  deps.slimePaletteInput.addEventListener("change", () => dispatchSettings({ palette: deps.slimePaletteInput.value }));
  deps.slimeWrapEdgesToggle.addEventListener("change", () => dispatchSettings({ wrapEdges: deps.slimeWrapEdgesToggle.checked }));
  deps.slimeSpawnModeInput.addEventListener("change", () => dispatchSettings({ spawnMode: deps.slimeSpawnModeInput.value }));
  deps.slimeUseTerrainToggle.addEventListener("change", () => dispatchSettings({ useTerrain: deps.slimeUseTerrainToggle.checked }));
  deps.slimeShowTerrainUnderlayToggle.addEventListener("change", () => dispatchSettings({ showTerrainUnderlay: deps.slimeShowTerrainUnderlayToggle.checked }));
  deps.slimeTerrainMixInput.addEventListener("input", () => dispatchSettings({ terrainMix: Number(deps.slimeTerrainMixInput.value) }));
  deps.slimeSlopeBiasInput.addEventListener("input", () => dispatchSettings({ slopeBias: Number(deps.slimeSlopeBiasInput.value) }));
  deps.slimeSlopeCutoffInput.addEventListener("input", () => dispatchSettings({ slopeCutoff: Number(deps.slimeSlopeCutoffInput.value) }));
  deps.slimeHeightBiasInput.addEventListener("input", () => dispatchSettings({ heightBias: Number(deps.slimeHeightBiasInput.value) }));
  deps.slimeHeightMinInput.addEventListener("input", () => dispatchSettings({
    heightMin: Math.min(Number(deps.slimeHeightMinInput.value), Number(deps.slimeHeightMaxInput.value)),
  }));
  deps.slimeHeightMaxInput.addEventListener("input", () => dispatchSettings({
    heightMax: Math.max(Number(deps.slimeHeightMaxInput.value), Number(deps.slimeHeightMinInput.value)),
  }));
  deps.slimeHeightBandWeightInput.addEventListener("input", () => dispatchSettings({ heightBandWeight: Number(deps.slimeHeightBandWeightInput.value) }));
  deps.slimeWaterBiasInput.addEventListener("input", () => dispatchSettings({ waterBias: Number(deps.slimeWaterBiasInput.value) }));
  deps.slimePlantBiasInput.addEventListener("input", () => dispatchSettings({ plantBias: Number(deps.slimePlantBiasInput.value) }));
  deps.slimePlantFloorInput.addEventListener("input", () => dispatchSettings({ plantFloor: Number(deps.slimePlantFloorInput.value) }));
  deps.slimePlantEatAmountInput.addEventListener("input", () => dispatchSettings({ plantEatAmount: Number(deps.slimePlantEatAmountInput.value) }));
  deps.slimePlantEatTickIntervalInput.addEventListener("input", () => dispatchSettings({ plantEatTickInterval: Number(deps.slimePlantEatTickIntervalInput.value) }));
  deps.slimePlantRegenAmountInput.addEventListener("input", () => dispatchSettings({ plantRegenAmount: Number(deps.slimePlantRegenAmountInput.value) }));
  deps.slimePlantRegenTickIntervalInput.addEventListener("input", () => dispatchSettings({ plantRegenTickInterval: Number(deps.slimePlantRegenTickIntervalInput.value) }));
  deps.slimeBrushRadiusInput.addEventListener("input", () => dispatchSettings({ brushRadius: Number(deps.slimeBrushRadiusInput.value) }));
  deps.slimeBrushTrailClearInput.addEventListener("input", () => dispatchSettings({ brushTrailClear: Number(deps.slimeBrushTrailClearInput.value) }));
  deps.slimeSeedInput.addEventListener("change", () => dispatchSettings({ seed: Number(deps.slimeSeedInput.value) }));
  deps.slimeCanvas.addEventListener("click", (event) => {
    deps.commandBus.dispatch({
      type: "slime/brush/resetAt",
      clientX: event.clientX,
      clientY: event.clientY,
    });
  });
}
