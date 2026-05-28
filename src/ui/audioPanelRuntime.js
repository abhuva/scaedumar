export function createAudioPanelRuntime(deps) {
  const collapsedCardIds = new Set();

  function syncAudioModeUi(settings) {
    const activeMode = ["spectrogram", "synthesis", "soundscape"].includes(settings.activeMode)
      ? settings.activeMode
      : "spectrogram";
    for (const button of deps.audioModeButtons || []) {
      const isActive = button.dataset.audioMode === activeMode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      if (button.classList.contains("rd-tab")) {
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        button.tabIndex = isActive ? 0 : -1;
      }
    }
    for (const panel of deps.audioModeSurfaces || []) {
      panel.classList.toggle("active", panel.dataset.audioModePanel === activeMode);
    }
    for (const panel of deps.audioControlPanels || []) {
      const isActive = panel.dataset.audioControlPanel === activeMode;
      panel.classList.toggle("active", isActive);
      if (panel.classList.contains("rd-tab-panel")) {
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
      }
    }
  }

  function createOscillatorRow(oscillator, index) {
    const article = document.createElement("article");
    article.className = "oscillator-card";
    article.dataset.oscillatorId = oscillator.id;
    const collapseId = `synthesis:${oscillator.id}`;
    article.classList.toggle("collapsed", collapsedCardIds.has(collapseId));
    appendHeader(article, `Oscillator ${index + 1}`, collapseId);
    appendSelectRow(article, "Wave", "type", [
      ["sine", "Sine"],
      ["square", "Square"],
      ["sawtooth", "Saw"],
      ["triangle", "Triangle"],
    ], oscillator.type);
    appendCheckboxRow(article, "Enabled", "enabled", oscillator.enabled);
    appendRangeRow(article, "Frequency", "frequency", {
      min: 10,
      max: 800,
      step: 1,
      value: Number(oscillator.frequency).toFixed(0),
      valueText: `${Number(oscillator.frequency).toFixed(0)} Hz`,
    });
    appendRangeRow(article, "Amplitude", "amplitude", {
      min: 0,
      max: 1,
      step: 0.01,
      value: Number(oscillator.amplitude).toFixed(2),
    });
    appendRangeRow(article, "Phase", "phase", {
      min: -360,
      max: 360,
      step: 1,
      value: Number(oscillator.phase).toFixed(0),
    });
    return article;
  }

  function appendHeader(article, title, collapseId) {
    const header = document.createElement("header");
    const label = document.createElement("span");
    label.className = "oscillator-card-title";
    label.dataset.action = "toggle-collapse";
    label.setAttribute("role", "button");
    label.setAttribute("tabindex", "0");
    label.setAttribute("aria-expanded", article.classList.contains("collapsed") ? "false" : "true");
    label.textContent = title;
    const toggleCollapse = () => {
      const collapsed = !article.classList.contains("collapsed");
      article.classList.toggle("collapsed", collapsed);
      label.setAttribute("aria-expanded", collapsed ? "false" : "true");
      if (collapseId) {
        if (collapsed) collapsedCardIds.add(collapseId);
        else collapsedCardIds.delete(collapseId);
      }
    };
    label.addEventListener("click", toggleCollapse);
    label.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleCollapse();
    });
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "remove";
    button.textContent = "Remove";
    header.append(label, button);
    article.append(header);
  }

  function appendRow(article, labelText, control) {
    const row = document.createElement("div");
    row.className = "row";
    const label = document.createElement("label");
    label.textContent = labelText;
    row.append(label, control);
    article.append(row);
    return row;
  }

  function appendSelectRow(article, labelText, field, options, value) {
    const select = document.createElement("select");
    select.dataset.field = field;
    for (const [optionValue, text] of options) {
      const option = document.createElement("option");
      option.value = String(optionValue);
      option.textContent = text;
      select.append(option);
    }
    select.value = String(value);
    appendRow(article, labelText, select);
    return select;
  }

  function appendCheckboxRow(article, labelText, field, checked) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.field = field;
    input.checked = Boolean(checked);
    appendRow(article, labelText, input);
    return input;
  }

  function appendTextRow(article, labelText, text) {
    const span = document.createElement("span");
    span.textContent = text;
    appendRow(article, labelText, span);
    return span;
  }

  function appendRangeRow(article, labelText, field, config) {
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(config.min);
    input.max = String(config.max);
    input.step = String(config.step);
    input.dataset.field = field;
    input.value = String(config.value);
    if (config.disabled) {
      input.disabled = true;
    }
    if (!Object.prototype.hasOwnProperty.call(config, "valueText")) {
      appendRow(article, labelText, input);
      return input;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "inline-control";
    const value = document.createElement("span");
    value.dataset.valueFor = field;
    value.textContent = config.valueText;
    wrapper.append(input, value);
    appendRow(article, labelText, wrapper);
    return input;
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
    article.className = "oscillator-card";
    article.dataset.layerId = layer.id;
    article.dataset.layerRole = layer.role;
    article.dataset.layerType = layer.type;
    article.dataset.layerSource = layer.source;
    article.dataset.layerFilter = String(layer.filterFrequency);
    article.dataset.layerMotion = layer.motionMode;
    const collapseId = `soundscape:${layer.id}`;
    article.classList.toggle("collapsed", collapsedCardIds.has(collapseId));
    appendHeader(article, `Layer ${index + 1} - ${headerMetric}`, collapseId);
    appendSelectRow(article, "Role", "role", [
      ["drone", "Drone"],
      ["resonance", "Resonance"],
      ["shimmer", "Shimmer"],
      ["pulse", "Pulse"],
      ["call", "Call"],
      ["wind", "Wind"],
      ["rumble", "Rumble"],
      ["air", "Air"],
    ], layer.role);
    appendTextRow(article, "Source", layer.source === "noise" ? "Filtered Noise" : "Modal Tone");
    appendSelectRow(article, "Wave", "type", [
      ["sine", "Sine"],
      ["square", "Square"],
      ["sawtooth", "Saw"],
      ["triangle", "Triangle"],
    ], layer.type);
    appendCheckboxRow(article, "Enabled", "enabled", layer.enabled);
    appendSelectRow(
      article,
      "Degree",
      "degree",
      Array.from({ length: degreeCount }, (_, degree) => [degree, String(degree + 1)]),
      layer.degree,
    );
    appendRangeRow(article, "Octave", "octave", {
      min: -3,
      max: 3,
      step: 1,
      value: Number(layer.octave).toFixed(0),
      valueText: Number(layer.octave).toFixed(0),
    });
    appendRangeRow(article, "Detune", "detuneCents", {
      min: -100,
      max: 100,
      step: 1,
      value: Number(layer.detuneCents).toFixed(0),
      valueText: `${Number(layer.detuneCents).toFixed(0)} c`,
    });
    appendRangeRow(article, "Amplitude", "amplitude", {
      min: 0,
      max: 1,
      step: 0.01,
      value: Number(layer.amplitude).toFixed(2),
    });
    appendRangeRow(article, "Noise Filter", "filterFrequency", {
      min: 40,
      max: 8000,
      step: 10,
      value: Number(layer.filterFrequency).toFixed(0),
      valueText: `${Number(layer.filterFrequency).toFixed(0)} Hz`,
      disabled: layer.source !== "noise",
    });
    appendRangeRow(article, "Attack", "attackSec", {
      min: 0,
      max: 20,
      step: 0.25,
      value: Number(layer.attackSec).toFixed(2),
      valueText: `${Number(layer.attackSec).toFixed(2)}s`,
    });
    appendRangeRow(article, "Release", "releaseSec", {
      min: 0,
      max: 20,
      step: 0.25,
      value: Number(layer.releaseSec).toFixed(2),
      valueText: `${Number(layer.releaseSec).toFixed(2)}s`,
    });
    appendRangeRow(article, "Amp Drift", "ampDrift", {
      min: 0,
      max: 1,
      step: 0.01,
      value: Number(layer.ampDrift).toFixed(2),
      valueText: Number(layer.ampDrift).toFixed(2),
    });
    appendRangeRow(article, "Pitch Drift", "pitchDriftCents", {
      min: 0,
      max: 50,
      step: 1,
      value: Number(layer.pitchDriftCents).toFixed(0),
      valueText: `${Number(layer.pitchDriftCents).toFixed(0)} c`,
    });
    appendRangeRow(article, "Drift Cycle", "driftCycleSec", {
      min: 2,
      max: 120,
      step: 1,
      value: Number(layer.driftCycleSec).toFixed(0),
      valueText: `${Number(layer.driftCycleSec).toFixed(0)}s`,
    });
    appendSelectRow(article, "Motion", "motionMode", [
      ["static", "Static"],
      ["wander", "Wander"],
      ["call", "Call"],
    ], layer.motionMode);
    appendRangeRow(article, "Change Every", "changeIntervalSec", {
      min: 2,
      max: 120,
      step: 1,
      value: Number(layer.changeIntervalSec).toFixed(0),
      valueText: `${Number(layer.changeIntervalSec).toFixed(0)}s`,
    });
    appendRangeRow(article, "Change Chance", "changeChance", {
      min: 0,
      max: 1,
      step: 0.01,
      value: Number(layer.changeChance).toFixed(2),
      valueText: Number(layer.changeChance).toFixed(2),
    });
    appendRangeRow(article, "Glide", "glideSec", {
      min: 0,
      max: 20,
      step: 0.25,
      value: Number(layer.glideSec).toFixed(2),
      valueText: `${Number(layer.glideSec).toFixed(2)}s`,
    });
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
      const currentCards = Array.from(deps.audioSoundscapeLayerList.querySelectorAll(".oscillator-card"));
      const currentSignature = currentCards
        .map((card) => [
          card.dataset.layerId,
          card.dataset.layerRole,
          card.dataset.layerType,
          card.dataset.layerSource,
          card.dataset.layerFilter,
          card.dataset.layerMotion,
        ].join(":"))
        .join("|");
      const nextSignature = (soundscape.layers || [])
        .map((layer) => [
          layer.id,
          layer.role,
          layer.type,
          layer.source,
          String(layer.filterFrequency),
          layer.motionMode,
        ].join(":"))
        .join("|");
      if (isEditingLayer && currentSignature === nextSignature) {
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
