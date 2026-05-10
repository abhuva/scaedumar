export function createAudioPanelRuntime(deps) {
  function syncAudioModeUi(settings) {
    const activeMode = ["spectrogram", "synthesis", "soundscape"].includes(settings.activeMode)
      ? settings.activeMode
      : "spectrogram";
    for (const button of deps.audioModeButtons || []) {
      const isActive = button.dataset.audioMode === activeMode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    }
    for (const panel of deps.audioModeSurfaces || []) {
      panel.classList.toggle("active", panel.dataset.audioModePanel === activeMode);
    }
    for (const panel of deps.audioControlPanels || []) {
      panel.classList.toggle("active", panel.dataset.audioControlPanel === activeMode);
    }
  }

  function createOscillatorRow(oscillator, index) {
    const article = document.createElement("article");
    article.className = "oscillator-card";
    article.dataset.oscillatorId = oscillator.id;
    article.innerHTML = `
      <header>
        <span>Oscillator ${index + 1}</span>
        <button type="button" data-action="remove">Remove</button>
      </header>
      <div class="row">
        <label>Wave</label>
        <select data-field="type">
          <option value="sine" ${oscillator.type === "sine" ? "selected" : ""}>Sine</option>
          <option value="square" ${oscillator.type === "square" ? "selected" : ""}>Square</option>
          <option value="sawtooth" ${oscillator.type === "sawtooth" ? "selected" : ""}>Saw</option>
          <option value="triangle" ${oscillator.type === "triangle" ? "selected" : ""}>Triangle</option>
        </select>
      </div>
      <div class="row">
        <label>Enabled</label>
        <input type="checkbox" data-field="enabled" ${oscillator.enabled ? "checked" : ""} />
      </div>
      <div class="row">
        <label>Frequency</label>
        <div class="inline-control">
          <input type="range" min="10" max="800" step="1" data-field="frequency" value="${Number(oscillator.frequency).toFixed(0)}" />
          <span data-value-for="frequency">${Number(oscillator.frequency).toFixed(0)} Hz</span>
        </div>
      </div>
      <div class="row">
        <label>Amplitude</label>
        <input type="range" min="0" max="1" step="0.01" data-field="amplitude" value="${Number(oscillator.amplitude).toFixed(2)}" />
      </div>
      <div class="row">
        <label>Phase</label>
        <input type="range" min="-360" max="360" step="1" data-field="phase" value="${Number(oscillator.phase).toFixed(0)}" />
      </div>
    `;
    return article;
  }

  function createSoundscapeLayerRow(settings, layer, index) {
    const article = document.createElement("article");
    const degreeCount = deps.getSoundscapeScaleDegreeCount
      ? deps.getSoundscapeScaleDegreeCount(settings.scale)
      : 5;
    const frequency = deps.getSoundscapeLayerFrequency
      ? deps.getSoundscapeLayerFrequency(settings, layer)
      : 0;
    const headerMetric = layer.source === "noise"
      ? `${layer.noiseType || layer.role} noise`
      : `${frequency.toFixed(1)} Hz`;
    const degreeOptions = Array.from({ length: degreeCount }, (_, degree) => (
      `<option value="${degree}" ${layer.degree === degree ? "selected" : ""}>${degree + 1}</option>`
    )).join("");
    article.className = "oscillator-card";
    article.dataset.layerId = layer.id;
    article.innerHTML = `
      <header>
        <span>Layer ${index + 1} - ${headerMetric}</span>
        <button type="button" data-action="remove">Remove</button>
      </header>
      <div class="row">
        <label>Role</label>
        <select data-field="role">
          <option value="drone" ${layer.role === "drone" ? "selected" : ""}>Drone</option>
          <option value="resonance" ${layer.role === "resonance" ? "selected" : ""}>Resonance</option>
          <option value="shimmer" ${layer.role === "shimmer" ? "selected" : ""}>Shimmer</option>
          <option value="pulse" ${layer.role === "pulse" ? "selected" : ""}>Pulse</option>
          <option value="call" ${layer.role === "call" ? "selected" : ""}>Call</option>
          <option value="wind" ${layer.role === "wind" ? "selected" : ""}>Wind</option>
          <option value="rumble" ${layer.role === "rumble" ? "selected" : ""}>Rumble</option>
          <option value="air" ${layer.role === "air" ? "selected" : ""}>Air</option>
        </select>
      </div>
      <div class="row">
        <label>Source</label>
        <span>${layer.source === "noise" ? "Filtered Noise" : "Modal Tone"}</span>
      </div>
      <div class="row">
        <label>Wave</label>
        <select data-field="type">
          <option value="sine" ${layer.type === "sine" ? "selected" : ""}>Sine</option>
          <option value="square" ${layer.type === "square" ? "selected" : ""}>Square</option>
          <option value="sawtooth" ${layer.type === "sawtooth" ? "selected" : ""}>Saw</option>
          <option value="triangle" ${layer.type === "triangle" ? "selected" : ""}>Triangle</option>
        </select>
      </div>
      <div class="row">
        <label>Enabled</label>
        <input type="checkbox" data-field="enabled" ${layer.enabled ? "checked" : ""} />
      </div>
      <div class="row">
        <label>Degree</label>
        <select data-field="degree">${degreeOptions}</select>
      </div>
      <div class="row">
        <label>Octave</label>
        <div class="inline-control">
          <input type="range" min="-3" max="3" step="1" data-field="octave" value="${Number(layer.octave).toFixed(0)}" />
          <span data-value-for="octave">${Number(layer.octave).toFixed(0)}</span>
        </div>
      </div>
      <div class="row">
        <label>Detune</label>
        <div class="inline-control">
          <input type="range" min="-100" max="100" step="1" data-field="detuneCents" value="${Number(layer.detuneCents).toFixed(0)}" />
          <span data-value-for="detuneCents">${Number(layer.detuneCents).toFixed(0)} c</span>
        </div>
      </div>
      <div class="row">
        <label>Amplitude</label>
        <input type="range" min="0" max="1" step="0.01" data-field="amplitude" value="${Number(layer.amplitude).toFixed(2)}" />
      </div>
      <div class="row">
        <label>Noise Filter</label>
        <div class="inline-control">
          <input type="range" min="40" max="8000" step="10" data-field="filterFrequency" value="${Number(layer.filterFrequency).toFixed(0)}" ${layer.source === "noise" ? "" : "disabled"} />
          <span data-value-for="filterFrequency">${Number(layer.filterFrequency).toFixed(0)} Hz</span>
        </div>
      </div>
      <div class="row">
        <label>Attack</label>
        <div class="inline-control">
          <input type="range" min="0" max="20" step="0.25" data-field="attackSec" value="${Number(layer.attackSec).toFixed(2)}" />
          <span data-value-for="attackSec">${Number(layer.attackSec).toFixed(2)}s</span>
        </div>
      </div>
      <div class="row">
        <label>Release</label>
        <div class="inline-control">
          <input type="range" min="0" max="20" step="0.25" data-field="releaseSec" value="${Number(layer.releaseSec).toFixed(2)}" />
          <span data-value-for="releaseSec">${Number(layer.releaseSec).toFixed(2)}s</span>
        </div>
      </div>
      <div class="row">
        <label>Amp Drift</label>
        <div class="inline-control">
          <input type="range" min="0" max="1" step="0.01" data-field="ampDrift" value="${Number(layer.ampDrift).toFixed(2)}" />
          <span data-value-for="ampDrift">${Number(layer.ampDrift).toFixed(2)}</span>
        </div>
      </div>
      <div class="row">
        <label>Pitch Drift</label>
        <div class="inline-control">
          <input type="range" min="0" max="50" step="1" data-field="pitchDriftCents" value="${Number(layer.pitchDriftCents).toFixed(0)}" />
          <span data-value-for="pitchDriftCents">${Number(layer.pitchDriftCents).toFixed(0)} c</span>
        </div>
      </div>
      <div class="row">
        <label>Drift Cycle</label>
        <div class="inline-control">
          <input type="range" min="2" max="120" step="1" data-field="driftCycleSec" value="${Number(layer.driftCycleSec).toFixed(0)}" />
          <span data-value-for="driftCycleSec">${Number(layer.driftCycleSec).toFixed(0)}s</span>
        </div>
      </div>
      <div class="row">
        <label>Motion</label>
        <select data-field="motionMode">
          <option value="static" ${layer.motionMode === "static" ? "selected" : ""}>Static</option>
          <option value="wander" ${layer.motionMode === "wander" ? "selected" : ""}>Wander</option>
          <option value="call" ${layer.motionMode === "call" ? "selected" : ""}>Call</option>
        </select>
      </div>
      <div class="row">
        <label>Change Every</label>
        <div class="inline-control">
          <input type="range" min="2" max="120" step="1" data-field="changeIntervalSec" value="${Number(layer.changeIntervalSec).toFixed(0)}" />
          <span data-value-for="changeIntervalSec">${Number(layer.changeIntervalSec).toFixed(0)}s</span>
        </div>
      </div>
      <div class="row">
        <label>Change Chance</label>
        <div class="inline-control">
          <input type="range" min="0" max="1" step="0.01" data-field="changeChance" value="${Number(layer.changeChance).toFixed(2)}" />
          <span data-value-for="changeChance">${Number(layer.changeChance).toFixed(2)}</span>
        </div>
      </div>
      <div class="row">
        <label>Glide</label>
        <div class="inline-control">
          <input type="range" min="0" max="20" step="0.25" data-field="glideSec" value="${Number(layer.glideSec).toFixed(2)}" />
          <span data-value-for="glideSec">${Number(layer.glideSec).toFixed(2)}s</span>
        </div>
      </div>
    `;
    return article;
  }

  function syncSynthesisUi(settings) {
    const synthesis = settings.synthesis || {};
    if (deps.audioSynthesisDurationInput) {
      deps.audioSynthesisDurationInput.value = String(synthesis.durationSec);
      deps.audioSynthesisDurationValue.textContent = `${Number(synthesis.durationSec).toFixed(2)}s`;
    }
    if (deps.audioSynthesisMasterGainInput) {
      deps.audioSynthesisMasterGainInput.value = String(synthesis.masterGain);
      deps.audioSynthesisMasterGainValue.textContent = Number(synthesis.masterGain).toFixed(2);
    }
    if (deps.audioSynthesisLoopToggle) {
      deps.audioSynthesisLoopToggle.checked = Boolean(synthesis.loop);
    }
    if (deps.audioSynthesisOscillatorList) {
      const activeElement = document.activeElement;
      const isEditingOscillator = activeElement && deps.audioSynthesisOscillatorList.contains(activeElement);
      const currentIds = Array.from(deps.audioSynthesisOscillatorList.querySelectorAll(".oscillator-card"))
        .map((card) => card.dataset.oscillatorId)
        .join("|");
      const nextIds = (synthesis.oscillators || []).map((oscillator) => oscillator.id).join("|");
      if (isEditingOscillator && currentIds === nextIds) {
        if (deps.drawSynthesisWaveform) {
          deps.drawSynthesisWaveform();
        }
        return;
      }
      deps.audioSynthesisOscillatorList.replaceChildren(
        ...(synthesis.oscillators || []).map((oscillator, index) => createOscillatorRow(oscillator, index)),
      );
    }
    if (deps.drawSynthesisWaveform) {
      deps.drawSynthesisWaveform();
    }
  }

  function syncSoundscapeUi(settings) {
    const soundscape = settings.soundscape || {};
    if (deps.audioSoundscapeRootInput) {
      deps.audioSoundscapeRootInput.value = soundscape.rootNote;
    }
    if (deps.audioSoundscapeScaleInput) {
      deps.audioSoundscapeScaleInput.value = soundscape.scale;
    }
    if (deps.audioSoundscapeDurationInput) {
      deps.audioSoundscapeDurationInput.value = String(soundscape.durationSec);
      deps.audioSoundscapeDurationValue.textContent = `${Number(soundscape.durationSec).toFixed(2)}s`;
    }
    if (deps.audioSoundscapeMasterGainInput) {
      deps.audioSoundscapeMasterGainInput.value = String(soundscape.masterGain);
      deps.audioSoundscapeMasterGainValue.textContent = Number(soundscape.masterGain).toFixed(2);
    }
    if (deps.audioSoundscapeLoopToggle) {
      deps.audioSoundscapeLoopToggle.checked = Boolean(soundscape.loop);
    }
    if (deps.audioSoundscapeSeedInput) {
      deps.audioSoundscapeSeedInput.value = String(soundscape.randomSeed);
    }
    if (deps.audioSoundscapeLayerList) {
      const activeElement = document.activeElement;
      const isEditingLayer = activeElement && deps.audioSoundscapeLayerList.contains(activeElement);
      const currentIds = Array.from(deps.audioSoundscapeLayerList.querySelectorAll(".oscillator-card"))
        .map((card) => card.dataset.layerId)
        .join("|");
      const nextIds = (soundscape.layers || []).map((layer) => layer.id).join("|");
      if (isEditingLayer && currentIds === nextIds) {
        if (deps.drawSoundscapeWaveform) {
          deps.drawSoundscapeWaveform();
        }
        return;
      }
      deps.audioSoundscapeLayerList.replaceChildren(
        ...(soundscape.layers || []).map((layer, index) => createSoundscapeLayerRow(soundscape, layer, index)),
      );
    }
    if (deps.drawSoundscapeWaveform) {
      deps.drawSoundscapeWaveform();
    }
  }

  function syncAudioUi() {
    const settings = deps.getAudioSettings();
    const simulation = deps.getAudioSimulationState();
    syncAudioModeUi(settings);
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
      const durationSec = Number(simulation.durationSec);
      const durationText = Number.isFinite(durationSec) ? `${durationSec.toFixed(2)}s` : "unknown duration";
      deps.audioFileStatusValue.textContent = simulation.hasInputSignal
        ? `${simulation.fileName || "Loaded"} (${durationText})`
        : "No file loaded";
    }
    syncSynthesisUi(settings);
    syncSoundscapeUi(settings);
  }

  return {
    syncAudioUi,
  };
}
