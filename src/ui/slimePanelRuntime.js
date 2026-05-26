export function createSlimePanelRuntime(deps) {
  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function syncSlimeUi() {
    const settings = deps.getSlimeSettings();
    const state = deps.getSlimeSimulationState();

    deps.slimeAgentCountInput.value = String(settings.agentCount);
    setText(deps.slimeAgentCountValue, String(settings.agentCount));
    deps.slimeSimSizeInput.value = String(settings.simSize);
    deps.slimeStepsPerFrameInput.value = String(settings.stepsPerFrame);
    setText(deps.slimeStepsPerFrameValue, String(settings.stepsPerFrame));
    deps.slimeTimeModeInput.value = settings.timeMode || "gameTick";
    deps.slimeStepsPerGameTickInput.value = String(settings.stepsPerGameTick);
    setText(deps.slimeStepsPerGameTickValue, String(Math.round(settings.stepsPerGameTick)));
    deps.slimeAvailabilityGridSizeInput.value = String(settings.availabilityGridSize);
    setText(deps.slimeAvailabilityGridSizeValue, String(settings.availabilityGridSize));
    deps.slimeAvailabilityEffectiveMaxInput.value = String(settings.availabilityEffectiveMax);
    setText(deps.slimeAvailabilityEffectiveMaxValue, Number(settings.availabilityEffectiveMax).toFixed(2));
    deps.slimeAvailabilityUpdateTickIntervalInput.value = String(settings.availabilityUpdateTickInterval);
    setText(deps.slimeAvailabilityUpdateTickIntervalValue, String(settings.availabilityUpdateTickInterval));
    deps.slimeSensorDistanceInput.value = String(settings.sensorDistance);
    setText(deps.slimeSensorDistanceValue, Number(settings.sensorDistance).toFixed(1));
    deps.slimeSensorAngleInput.value = String(settings.sensorAngleDeg);
    setText(deps.slimeSensorAngleValue, `${Math.round(settings.sensorAngleDeg)} deg`);
    deps.slimeSensorSizeInput.value = String(settings.sensorSize);
    setText(deps.slimeSensorSizeValue, String(settings.sensorSize));
    deps.slimeSensorNoiseInput.value = String(settings.sensorNoise);
    setText(deps.slimeSensorNoiseValue, Number(settings.sensorNoise).toFixed(3));
    deps.slimeStepSizeInput.value = String(settings.stepSize);
    setText(deps.slimeStepSizeValue, Number(settings.stepSize).toFixed(1));
    deps.slimeTurnAngleInput.value = String(settings.turnAngleDeg);
    setText(deps.slimeTurnAngleValue, `${Math.round(settings.turnAngleDeg)} deg`);
    deps.slimeWanderChanceInput.value = String(settings.wanderChance);
    setText(deps.slimeWanderChanceValue, `${(settings.wanderChance * 100).toFixed(1)}%`);
    deps.slimeWanderStrengthInput.value = String(settings.wanderStrengthDeg);
    setText(deps.slimeWanderStrengthValue, `${Math.round(settings.wanderStrengthDeg)} deg`);
    deps.slimeDepositAmountInput.value = String(settings.depositAmount);
    setText(deps.slimeDepositAmountValue, Number(settings.depositAmount).toFixed(2));
    deps.slimeDepositSizeInput.value = String(settings.depositSize);
    setText(deps.slimeDepositSizeValue, Number(settings.depositSize).toFixed(1));
    deps.slimeDiffusionInput.value = String(settings.diffusion);
    setText(deps.slimeDiffusionValue, Number(settings.diffusion).toFixed(2));
    deps.slimeDecayInput.value = String(settings.decay);
    setText(deps.slimeDecayValue, Number(settings.decay).toFixed(3));
    deps.slimeTrailGainInput.value = String(settings.trailGain);
    setText(deps.slimeTrailGainValue, Number(settings.trailGain).toFixed(1));
    deps.slimeTrailGammaInput.value = String(settings.trailGamma);
    setText(deps.slimeTrailGammaValue, Number(settings.trailGamma).toFixed(2));
    deps.slimePaletteInput.value = settings.palette;
    deps.slimeWrapEdgesToggle.checked = Boolean(settings.wrapEdges);
    deps.slimeSpawnModeInput.value = settings.spawnMode;
    deps.slimeUseTerrainToggle.checked = Boolean(settings.useTerrain);
    deps.slimeShowTerrainUnderlayToggle.checked = Boolean(settings.showTerrainUnderlay);
    deps.slimeTerrainMixInput.value = String(settings.terrainMix);
    setText(deps.slimeTerrainMixValue, Number(settings.terrainMix).toFixed(1));
    deps.slimeSlopeBiasInput.value = String(settings.slopeBias);
    setText(deps.slimeSlopeBiasValue, Number(settings.slopeBias).toFixed(1));
    deps.slimeSlopeCutoffInput.value = String(settings.slopeCutoff);
    setText(deps.slimeSlopeCutoffValue, Number(settings.slopeCutoff).toFixed(2));
    deps.slimeHeightBiasInput.value = String(settings.heightBias);
    setText(deps.slimeHeightBiasValue, Number(settings.heightBias).toFixed(1));
    deps.slimeHeightMinInput.value = String(settings.heightMin);
    setText(deps.slimeHeightMinValue, Number(settings.heightMin).toFixed(2));
    deps.slimeHeightMaxInput.value = String(settings.heightMax);
    setText(deps.slimeHeightMaxValue, Number(settings.heightMax).toFixed(2));
    deps.slimeHeightBandWeightInput.value = String(settings.heightBandWeight);
    setText(deps.slimeHeightBandWeightValue, Number(settings.heightBandWeight).toFixed(1));
    deps.slimeWaterBiasInput.value = String(settings.waterBias);
    setText(deps.slimeWaterBiasValue, Number(settings.waterBias).toFixed(1));
    deps.slimePlantBiasInput.value = String(settings.plantBias);
    setText(deps.slimePlantBiasValue, Number(settings.plantBias).toFixed(1));
    deps.slimePlantFloorInput.value = String(settings.plantFloor);
    setText(deps.slimePlantFloorValue, Number(settings.plantFloor).toFixed(2));
    deps.slimePlantEatAmountInput.value = String(settings.plantEatAmount);
    setText(deps.slimePlantEatAmountValue, String(Math.round(settings.plantEatAmount)));
    deps.slimePlantEatTickIntervalInput.value = String(settings.plantEatTickInterval);
    setText(deps.slimePlantEatTickIntervalValue, String(Math.round(settings.plantEatTickInterval)));
    deps.slimePlantRegenAmountInput.value = String(settings.plantRegenAmount);
    setText(deps.slimePlantRegenAmountValue, String(Math.round(settings.plantRegenAmount)));
    deps.slimePlantRegenTickIntervalInput.value = String(settings.plantRegenTickInterval);
    setText(deps.slimePlantRegenTickIntervalValue, String(Math.round(settings.plantRegenTickInterval)));
    deps.slimeBrushRadiusInput.value = String(settings.brushRadius);
    setText(deps.slimeBrushRadiusValue, `${Math.round(settings.brushRadius)} px`);
    deps.slimeBrushTrailClearInput.value = String(settings.brushTrailClear);
    setText(deps.slimeBrushTrailClearValue, Number(settings.brushTrailClear).toFixed(2));
    deps.slimeSeedInput.value = String(settings.seed);
    deps.slimeStartBtn.textContent = state.running ? "Running" : "Start";
    deps.slimeStartBtn.disabled = Boolean(state.running);
    deps.slimeStopBtn.disabled = !state.running;
    setText(deps.slimeStatusValue, state.error || (state.running ? "Running" : "Stopped"));
    setText(
      deps.slimeStatsValue,
      `${state.backend || "webgl2"} | fps ${Number(state.fps || 0).toFixed(1)} | frame ${state.frame || 0} | ${state.capabilities || "Not initialized"}`,
    );
  }

  return {
    syncSlimeUi,
  };
}
