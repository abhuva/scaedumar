export function createAudioPanelRuntime(deps) {
  function syncAudioUi() {
    const settings = deps.getAudioSettings();
    const simulation = deps.getAudioSimulationState();
    deps.audioMinHzInput.value = String(settings.minHz);
    deps.audioMaxHzInput.value = String(settings.maxHz);
    deps.audioBrushSizeInput.value = String(settings.brushSize);
    deps.audioBrushSizeValue.textContent = String(settings.brushSize);
    deps.audioBrushStrengthInput.value = String(settings.brushStrength);
    deps.audioBrushStrengthValue.textContent = Number(settings.brushStrength).toFixed(2);
    deps.audioEraseModeToggle.checked = Boolean(settings.eraseMode);
    deps.audioAutoThresholdInput.value = String(settings.autoThreshold);
    deps.audioAutoThresholdValue.textContent = Number(settings.autoThreshold).toFixed(2);
    deps.audioAutoContrastInput.value = String(settings.autoContrast);
    deps.audioAutoContrastValue.textContent = Number(settings.autoContrast).toFixed(2);
    deps.audioAutoGainInput.value = String(settings.autoGain);
    deps.audioAutoGainValue.textContent = Number(settings.autoGain).toFixed(2);
    deps.audioAutoClearToggle.checked = Boolean(settings.autoClearBeforePaint);
    deps.audioApproxMaxStrokesInput.value = String(settings.approximationMaxStrokes);
    deps.audioApproxMinStrengthInput.value = String(settings.approximationMinStrength);
    deps.audioApproxMinStrengthValue.textContent = Number(settings.approximationMinStrength).toFixed(2);
    deps.audioMasterGainInput.value = String(settings.masterGain);
    deps.audioMasterGainValue.textContent = Number(settings.masterGain).toFixed(2);
    deps.audioPlaybackRateInput.value = String(settings.playbackRate);
    deps.audioPlaybackRateValue.textContent = Number(settings.playbackRate).toFixed(2);
    deps.audioStatusValue.textContent = simulation.isPlaying
      ? `Playing ${simulation.playbackKind || "audio"}`
      : "Stopped";
    if (deps.audioFileStatusValue) {
      deps.audioFileStatusValue.textContent = simulation.hasInputSignal
        ? `${simulation.fileName || "Loaded"} (${simulation.durationSec.toFixed(2)}s)`
        : "No file loaded";
    }
  }

  return {
    syncAudioUi,
  };
}
