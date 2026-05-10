export function bindAudioControls(deps) {
  for (const button of deps.audioModeButtons || []) {
    button.addEventListener("click", () => {
      deps.commandBus.dispatch({ type: "audio/mode/set", mode: button.dataset.audioMode });
    });
  }
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
  if (deps.audioSynthesisPlayBtn) {
    deps.audioSynthesisPlayBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/synthesis/play" }));
  }
  if (deps.audioSynthesisStopBtn) {
    deps.audioSynthesisStopBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/stop" }));
  }
  if (deps.audioSynthesisAddOscillatorBtn) {
    deps.audioSynthesisAddOscillatorBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/synthesis/addOscillator" }));
  }
  if (deps.audioSynthesisDurationInput) {
    deps.audioSynthesisDurationInput.addEventListener("input", () => {
      deps.commandBus.dispatch({
        type: "audio/synthesis/update",
        patch: { durationSec: Number(deps.audioSynthesisDurationInput.value) },
      });
    });
  }
  if (deps.audioSynthesisMasterGainInput) {
    deps.audioSynthesisMasterGainInput.addEventListener("input", () => {
      deps.commandBus.dispatch({
        type: "audio/synthesis/update",
        patch: { masterGain: Number(deps.audioSynthesisMasterGainInput.value) },
      });
    });
  }
  if (deps.audioSynthesisLoopToggle) {
    deps.audioSynthesisLoopToggle.addEventListener("change", () => {
      deps.commandBus.dispatch({
        type: "audio/synthesis/update",
        patch: { loop: deps.audioSynthesisLoopToggle.checked },
      });
    });
  }
  if (deps.audioSynthesisOscillatorList) {
    deps.audioSynthesisOscillatorList.addEventListener("input", (event) => {
      const target = event.target;
      const card = target && target.closest ? target.closest(".oscillator-card") : null;
      const field = target && target.dataset ? target.dataset.field : "";
      if (!card || !field) return;
      const value = field === "enabled" ? target.checked : (field === "type" ? target.value : Number(target.value));
      const valueEl = card.querySelector(`[data-value-for="${field}"]`);
      if (valueEl && field === "frequency") {
        valueEl.textContent = `${Math.round(value)} Hz`;
      }
      deps.commandBus.dispatch({
        type: "audio/synthesis/updateOscillator",
        id: card.dataset.oscillatorId,
        patch: { [field]: value },
      });
    });
    deps.audioSynthesisOscillatorList.addEventListener("change", (event) => {
      const target = event.target;
      const card = target && target.closest ? target.closest(".oscillator-card") : null;
      const field = target && target.dataset ? target.dataset.field : "";
      if (!card || field !== "type") return;
      deps.commandBus.dispatch({
        type: "audio/synthesis/updateOscillator",
        id: card.dataset.oscillatorId,
        patch: { type: target.value },
      });
    });
    deps.audioSynthesisOscillatorList.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || !target.dataset || target.dataset.action !== "remove") return;
      const card = target.closest(".oscillator-card");
      if (!card) return;
      deps.commandBus.dispatch({ type: "audio/synthesis/removeOscillator", id: card.dataset.oscillatorId });
    });
  }
  if (deps.audioSoundscapePlayBtn) {
    deps.audioSoundscapePlayBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/soundscape/play" }));
  }
  if (deps.audioSoundscapeStopBtn) {
    deps.audioSoundscapeStopBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/stop" }));
  }
  if (deps.audioSoundscapeRandomizeBtn) {
    deps.audioSoundscapeRandomizeBtn.addEventListener("click", () => deps.commandBus.dispatch({ type: "audio/soundscape/randomize" }));
  }
  const roleButtons = [
    [deps.audioSoundscapeAddDroneBtn, "drone"],
    [deps.audioSoundscapeAddResonanceBtn, "resonance"],
    [deps.audioSoundscapeAddShimmerBtn, "shimmer"],
    [deps.audioSoundscapeAddCallBtn, "call"],
    [deps.audioSoundscapeAddWindBtn, "wind"],
    [deps.audioSoundscapeAddRumbleBtn, "rumble"],
    [deps.audioSoundscapeAddAirBtn, "air"],
  ];
  for (const [button, role] of roleButtons) {
    if (button) {
      button.addEventListener("click", () => deps.commandBus.dispatch({
        type: "audio/soundscape/addRoleLayer",
        role,
      }));
    }
  }
  if (deps.audioSoundscapeRootInput) {
    deps.audioSoundscapeRootInput.addEventListener("change", () => {
      deps.commandBus.dispatch({
        type: "audio/soundscape/update",
        patch: { rootNote: deps.audioSoundscapeRootInput.value },
      });
    });
  }
  if (deps.audioSoundscapeScaleInput) {
    deps.audioSoundscapeScaleInput.addEventListener("change", () => {
      deps.commandBus.dispatch({
        type: "audio/soundscape/update",
        patch: { scale: deps.audioSoundscapeScaleInput.value },
      });
    });
  }
  if (deps.audioSoundscapeDurationInput) {
    deps.audioSoundscapeDurationInput.addEventListener("input", () => {
      deps.commandBus.dispatch({
        type: "audio/soundscape/update",
        patch: { durationSec: Number(deps.audioSoundscapeDurationInput.value) },
      });
    });
  }
  if (deps.audioSoundscapeMasterGainInput) {
    deps.audioSoundscapeMasterGainInput.addEventListener("input", () => {
      deps.commandBus.dispatch({
        type: "audio/soundscape/update",
        patch: { masterGain: Number(deps.audioSoundscapeMasterGainInput.value) },
      });
    });
  }
  if (deps.audioSoundscapeLoopToggle) {
    deps.audioSoundscapeLoopToggle.addEventListener("change", () => {
      deps.commandBus.dispatch({
        type: "audio/soundscape/update",
        patch: { loop: deps.audioSoundscapeLoopToggle.checked },
      });
    });
  }
  if (deps.audioSoundscapeSeedInput) {
    deps.audioSoundscapeSeedInput.addEventListener("change", () => {
      deps.commandBus.dispatch({
        type: "audio/soundscape/update",
        patch: { randomSeed: Number(deps.audioSoundscapeSeedInput.value) },
      });
    });
  }
  if (deps.audioSoundscapeLayerList) {
    function dispatchLayerUpdate(target, card, field) {
      const stringFields = new Set(["role", "type", "motionMode"]);
      const value = field === "enabled" ? target.checked : (stringFields.has(field) ? target.value : Number(target.value));
      const valueEl = card.querySelector(`[data-value-for="${field}"]`);
      if (valueEl && field === "octave") {
        valueEl.textContent = String(Math.round(value));
      }
      if (valueEl && field === "detuneCents") {
        valueEl.textContent = `${Math.round(value)} c`;
      }
      if (valueEl && field === "pitchDriftCents") {
        valueEl.textContent = `${Math.round(value)} c`;
      }
      if (valueEl && field === "filterFrequency") {
        valueEl.textContent = `${Math.round(value)} Hz`;
      }
      if (valueEl && ["attackSec", "releaseSec", "glideSec"].includes(field)) {
        valueEl.textContent = `${Number(value).toFixed(2)}s`;
      }
      if (valueEl && ["driftCycleSec", "changeIntervalSec"].includes(field)) {
        valueEl.textContent = `${Math.round(value)}s`;
      }
      if (valueEl && ["ampDrift", "changeChance"].includes(field)) {
        valueEl.textContent = Number(value).toFixed(2);
      }
      deps.commandBus.dispatch({
        type: "audio/soundscape/updateLayer",
        id: card.dataset.layerId,
        patch: { [field]: value },
      });
    }

    deps.audioSoundscapeLayerList.addEventListener("input", (event) => {
      const target = event.target;
      const card = target && target.closest ? target.closest(".oscillator-card") : null;
      const field = target && target.dataset ? target.dataset.field : "";
      if (!card || !field || target.tagName === "SELECT") return;
      dispatchLayerUpdate(target, card, field);
    });
    deps.audioSoundscapeLayerList.addEventListener("change", (event) => {
      const target = event.target;
      const card = target && target.closest ? target.closest(".oscillator-card") : null;
      const field = target && target.dataset ? target.dataset.field : "";
      if (!card || !field) return;
      dispatchLayerUpdate(target, card, field);
    });
    deps.audioSoundscapeLayerList.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || !target.dataset || target.dataset.action !== "remove") return;
      const card = target.closest(".oscillator-card");
      if (!card) return;
      deps.commandBus.dispatch({ type: "audio/soundscape/removeLayer", id: card.dataset.layerId });
    });
  }
}
