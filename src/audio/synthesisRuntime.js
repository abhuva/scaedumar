const OSCILLATOR_TYPES = new Set(["sine", "square", "sawtooth", "triangle"]);
const NOISE_TYPES = new Set(["wind", "rumble", "air"]);
const TAU = Math.PI * 2;

function finiteOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createOscillatorId() {
  return `osc-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000).toString(36)}`;
}

export function createDefaultSynthesisOscillator(index = 0) {
  return {
    id: createOscillatorId(),
    enabled: true,
    type: "sine",
    frequency: index === 0 ? 220 : 220 * (1 + index * 0.01),
    amplitude: 0.25,
    phase: 0,
  };
}

export function normalizeSynthesisSettings(input = {}, fallback = {}) {
  const source = input && typeof input === "object" ? input : {};
  const base = fallback && typeof fallback === "object" ? fallback : {};
  const sourceOscillators = Array.isArray(source.oscillators)
    ? source.oscillators
    : (Array.isArray(base.oscillators) ? base.oscillators : []);
  const oscillators = sourceOscillators.slice(0, 16).map((oscillator, index) => {
    const osc = oscillator && typeof oscillator === "object" ? oscillator : {};
    let id = typeof osc.id === "string" && osc.id ? osc.id : "";
    if (!id) {
      id = createOscillatorId();
      if (oscillator && typeof oscillator === "object") {
        try {
          oscillator.id = id;
        } catch {
          // Immutable imported objects still receive the generated id in the normalized copy.
        }
      }
    }
    return {
      id,
      enabled: Boolean(osc.enabled ?? true),
      source: osc.source === "noise" ? "noise" : "tone",
      noiseType: NOISE_TYPES.has(osc.noiseType) ? osc.noiseType : "wind",
      type: OSCILLATOR_TYPES.has(osc.type) ? osc.type : "sine",
      frequency: clamp(finiteOr(osc.frequency, 220), 1, 20000),
      filterFrequency: clamp(finiteOr(osc.filterFrequency, 850), 40, 8000),
      amplitude: clamp(finiteOr(osc.amplitude, 0.25), 0, 1),
      phase: clamp(finiteOr(osc.phase, 0), -360, 360),
      attackSec: clamp(finiteOr(osc.attackSec, 0), 0, 20),
      releaseSec: clamp(finiteOr(osc.releaseSec, 0), 0, 20),
    };
  });
  if (oscillators.length === 0) {
    oscillators.push(createDefaultSynthesisOscillator(0));
  }
  return {
    durationSec: clamp(finiteOr(source.durationSec, finiteOr(base.durationSec, 4)), 0.25, 60),
    loop: Boolean(source.loop ?? base.loop ?? true),
    masterGain: clamp(finiteOr(source.masterGain, finiteOr(base.masterGain, 0.45)), 0, 1),
    oscillators,
  };
}

export function createSynthesisRuntime(deps = {}) {
  const sampleRateFallback = 44100;

  function sampleOscillator(oscillator, timeSec) {
    if (!oscillator.enabled) return 0;
    if (oscillator.source === "noise") {
      const seed = Math.sin((timeSec * oscillator.filterFrequency + oscillator.id.length) * 12.9898) * 43758.5453;
      return ((seed - Math.floor(seed)) * 2 - 1) * oscillator.amplitude;
    }
    const phaseRad = oscillator.phase * Math.PI / 180;
    const cycle = ((oscillator.frequency * timeSec + phaseRad / TAU) % 1 + 1) % 1;
    let value = 0;
    if (oscillator.type === "square") {
      value = cycle < 0.5 ? 1 : -1;
    } else if (oscillator.type === "sawtooth") {
      value = cycle * 2 - 1;
    } else if (oscillator.type === "triangle") {
      value = 1 - Math.abs(cycle * 4 - 2);
    } else {
      value = Math.sin(TAU * oscillator.frequency * timeSec + phaseRad);
    }
    return value * oscillator.amplitude;
  }

  function sample(settings, timeSec) {
    let sum = 0;
    for (const oscillator of settings.oscillators) {
      sum += sampleOscillator(oscillator, timeSec);
    }
    return clamp(sum * settings.masterGain, -1, 1);
  }

  function createAudioBuffer(audioContext, rawSettings) {
    const settings = normalizeSynthesisSettings(rawSettings);
    const sampleRate = audioContext.sampleRate || sampleRateFallback;
    const frameCount = Math.max(1, Math.floor(settings.durationSec * sampleRate));
    const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      channel[i] = sample(settings, i / sampleRate);
    }
    return buffer;
  }

  function getTimer(runtime, options = {}) {
    return options.deps?.setTimeout
      || runtime?.deps?.setTimeout
      || deps.setTimeout
      || globalThis.setTimeout
      || (typeof setTimeout === "function" ? setTimeout : (() => {}));
  }

  function disconnectNode(node) {
    node.source.disconnect();
    node.gain.disconnect();
    if (node.filter) node.filter.disconnect();
  }

  function stopNode(runtime, node, audioContext = null, releaseSec = 0, timer = getTimer(runtime)) {
    const nodeRelease = Math.max(0, Number(node.releaseSec) || releaseSec);
    if (audioContext && nodeRelease > 0) {
      const now = audioContext.currentTime;
      const stopAt = now + nodeRelease;
      node.gain.gain.cancelScheduledValues(now);
      node.gain.gain.setValueAtTime(node.gain.gain.value, now);
      node.gain.gain.setTargetAtTime(0, now, Math.max(0.01, nodeRelease * 0.35));
      try {
        node.source.stop(stopAt + 0.02);
      } catch {
        // Already-stopped sources throw in some browsers.
      }
      timer(() => disconnectNode(node), Math.ceil((nodeRelease + 0.05) * 1000));
    } else {
      try {
        node.source.stop();
      } catch {
        // Already-stopped sources throw in some browsers.
      }
      disconnectNode(node);
    }
  }

  function stopLive(runtime, options = {}) {
    const nodes = Array.isArray(runtime.synthesisNodes) ? runtime.synthesisNodes : [];
    const context = options.audioContext || null;
    const timer = getTimer(runtime, options);
    const releaseSec = Math.max(0, Number(options.releaseSec) || 0);
    for (const node of nodes) {
      stopNode(runtime, node, context, releaseSec, timer);
    }
    runtime.synthesisNodes = [];
  }

  function createNoiseBuffer(audioContext, noiseType) {
    const durationSec = noiseType === "rumble" ? 4 : 2;
    const length = Math.max(1, Math.floor(audioContext.sampleRate * durationSec));
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      if (noiseType === "rumble") {
        last = last * 0.985 + white * 0.015;
        channel[i] = last;
      } else {
        channel[i] = white;
      }
    }
    return buffer;
  }

  function configureNoiseFilter(filter, oscillator) {
    filter.type = oscillator.noiseType === "air" ? "highpass" : "lowpass";
    filter.frequency.value = oscillator.filterFrequency;
    filter.Q.value = oscillator.noiseType === "air" ? 0.4 : 0.7;
  }

  function createLiveNode(audioContext, destinationNode, oscillator, masterGain) {
    const gainNode = audioContext.createGain();
    const targetGain = oscillator.amplitude * masterGain;
    const attackSec = Math.max(0, Number(oscillator.attackSec) || 0);
    let sourceNode = null;
    let filterNode = null;
    if (oscillator.source === "noise") {
      sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = createNoiseBuffer(audioContext, oscillator.noiseType);
      sourceNode.loop = true;
      filterNode = audioContext.createBiquadFilter();
      configureNoiseFilter(filterNode, oscillator);
      sourceNode.connect(filterNode);
      filterNode.connect(gainNode);
    } else {
      sourceNode = audioContext.createOscillator();
      sourceNode.type = oscillator.type;
      sourceNode.frequency.value = oscillator.frequency;
      sourceNode.connect(gainNode);
    }
    if (attackSec > 0) {
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(targetGain, now + attackSec);
    } else {
      gainNode.gain.value = targetGain;
    }
    gainNode.connect(destinationNode);
    sourceNode.start();
    return {
      id: oscillator.id,
      sourceType: oscillator.source,
      noiseType: oscillator.noiseType,
      source: sourceNode,
      oscillator: oscillator.source === "noise" ? null : sourceNode,
      filter: filterNode,
      gain: gainNode,
      releaseSec: Math.max(0, Number(oscillator.releaseSec) || 0),
    };
  }

  function startLive(audioContext, destinationNode, runtime, rawSettings) {
    if (!audioContext || !destinationNode || !runtime) {
      throw new Error("Audio context, destination, and runtime are required for synthesis.");
    }
    const settings = normalizeSynthesisSettings(rawSettings);
    stopLive(runtime);
    runtime.synthesisDestinationNode = destinationNode;
    runtime.synthesisNodes = settings.oscillators
      .filter((oscillator) => oscillator.enabled)
      .map((oscillator) => createLiveNode(audioContext, destinationNode, oscillator, settings.masterGain));
    return settings;
  }

  function updateLive(audioContext, runtime, rawSettings) {
    if (!audioContext || !runtime) return;
    const settings = normalizeSynthesisSettings(rawSettings);
    const destinationNode = runtime.synthesisDestinationNode;
    const currentNodes = Array.isArray(runtime.synthesisNodes) ? runtime.synthesisNodes : [];
    const nodeById = new Map(currentNodes.map((node) => [node.id, node]));
    const nextIds = new Set(settings.oscillators.map((oscillator) => oscillator.id));
    const now = audioContext.currentTime;
    for (const oscillator of settings.oscillators) {
      const node = nodeById.get(oscillator.id);
      if (!oscillator.enabled) {
        if (node) {
          stopNode(runtime, node, audioContext, Math.max(0, Number(node.releaseSec) || 0.05));
          nodeById.delete(oscillator.id);
        }
        continue;
      }
      if (!node) {
        if (destinationNode) {
          nodeById.set(oscillator.id, createLiveNode(audioContext, destinationNode, oscillator, settings.masterGain));
        }
        continue;
      }
      if (node.sourceType !== oscillator.source) {
        stopNode(runtime, node, audioContext, Math.max(0, Number(node.releaseSec) || 0.05));
        if (destinationNode) {
          nodeById.set(oscillator.id, createLiveNode(audioContext, destinationNode, oscillator, settings.masterGain));
        } else {
          nodeById.delete(oscillator.id);
        }
        continue;
      }
      const targetGain = oscillator.amplitude * settings.masterGain;
      if (node.oscillator) {
        node.oscillator.type = oscillator.type;
        node.oscillator.frequency.setTargetAtTime(oscillator.frequency, now, 0.08);
      }
      if (node.filter) {
        if (node.noiseType !== oscillator.noiseType) {
          configureNoiseFilter(node.filter, oscillator);
          node.noiseType = oscillator.noiseType;
        }
        node.filter.frequency.setTargetAtTime(oscillator.filterFrequency, now, 0.2);
      }
      node.gain.gain.setTargetAtTime(targetGain, now, 0.12);
      node.releaseSec = Math.max(0, Number(oscillator.releaseSec) || 0);
    }
    for (const node of currentNodes) {
      if (!nextIds.has(node.id)) {
        stopNode(runtime, node, audioContext, Math.max(0, Number(node.releaseSec) || 0.05));
        nodeById.delete(node.id);
      }
    }
    runtime.synthesisNodes = Array.from(nodeById.values());
  }

  function drawWaveform(canvas, rawSettings) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const settings = normalizeSynthesisSettings(rawSettings);
    const width = Math.max(1, canvas.width);
    const height = Math.max(1, canvas.height);
    const centerY = height * 0.5;
    const viewSeconds = Math.min(0.08, settings.durationSec);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#071017";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let y = 0; y <= 4; y += 1) {
      const py = (y / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
    for (const oscillator of settings.oscillators) {
      if (!oscillator.enabled) continue;
      ctx.strokeStyle = "rgba(100, 196, 190, 0.22)";
      ctx.beginPath();
      for (let x = 0; x < width; x += 1) {
        const t = (x / Math.max(1, width - 1)) * viewSeconds;
        const y = centerY - sampleOscillator(oscillator, t) * settings.masterGain * centerY * 0.82;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = "#f0d37a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < width; x += 1) {
      const t = (x / Math.max(1, width - 1)) * viewSeconds;
      const y = centerY - sample(settings, t) * centerY * 0.82;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(215,226,237,0.72)";
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.fillText(`${settings.oscillators.length} oscillator(s), ${viewSeconds.toFixed(3)}s view`, 14, 22);
  }

  return {
    createDefaultSynthesisOscillator,
    normalizeSynthesisSettings,
    createAudioBuffer,
    startLive,
    stopLive,
    updateLive,
    drawWaveform,
    getSampleRate: () => deps.sampleRate || sampleRateFallback,
  };
}
