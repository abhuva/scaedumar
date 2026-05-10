export function bindAudioControls(deps) {
  deps.audioMinHzInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { minHz: Number(deps.audioMinHzInput.value) } });
  });
  deps.audioMaxHzInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { maxHz: Number(deps.audioMaxHzInput.value) } });
  });
  deps.audioBrushSizeInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { brushSize: Number(deps.audioBrushSizeInput.value) } });
  });
  deps.audioBrushStrengthInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { brushStrength: Number(deps.audioBrushStrengthInput.value) } });
  });
  deps.audioEraseModeToggle.addEventListener("change", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { eraseMode: deps.audioEraseModeToggle.checked } });
  });
  deps.audioAutoThresholdInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { autoThreshold: Number(deps.audioAutoThresholdInput.value) } });
  });
  deps.audioAutoContrastInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { autoContrast: Number(deps.audioAutoContrastInput.value) } });
  });
  deps.audioAutoGainInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { autoGain: Number(deps.audioAutoGainInput.value) } });
  });
  deps.audioAutoClearToggle.addEventListener("change", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { autoClearBeforePaint: deps.audioAutoClearToggle.checked } });
  });
  deps.audioApproxMaxStrokesInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { approximationMaxStrokes: Number(deps.audioApproxMaxStrokesInput.value) } });
  });
  deps.audioApproxMinStrengthInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { approximationMinStrength: Number(deps.audioApproxMinStrengthInput.value) } });
  });
  deps.audioMasterGainInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { masterGain: Number(deps.audioMasterGainInput.value) } });
  });
  deps.audioPlaybackRateInput.addEventListener("input", () => {
    deps.commandBus.dispatch({ type: "core/audio/settingsChanged", patch: { playbackRate: Number(deps.audioPlaybackRateInput.value) } });
  });
  if (deps.audioFileInput) {
    deps.audioFileInput.addEventListener("change", () => {
      const file = deps.audioFileInput.files && deps.audioFileInput.files[0] ? deps.audioFileInput.files[0] : null;
      deps.commandBus.dispatch({ type: "audio/loadFile", file });
    });
  }
  deps.audioPlayBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/togglePlay" }));
  if (deps.audioPlayOriginalBtn) {
    deps.audioPlayOriginalBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/playOriginal" }));
  }
  if (deps.audioPlayScribbleBtn) {
    deps.audioPlayScribbleBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/playScribble" }));
  }
  if (deps.audioAutoPaintBtn) {
    deps.audioAutoPaintBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/autoPaintStrong" }));
  }
  if (deps.audioApproximateBtn) {
    deps.audioApproximateBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/approximateScribble" }));
  }
  deps.audioStopBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/stop" }));
  deps.audioClearBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/clearScribble" }));
}
