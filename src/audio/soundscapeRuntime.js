const NOTE_OFFSETS = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

const SCALES = {
  minorPentatonic: {
    label: "Minor Pentatonic",
    intervals: [0, 3, 5, 7, 10],
  },
  majorPentatonic: {
    label: "Major Pentatonic",
    intervals: [0, 2, 4, 7, 9],
  },
  dorian: {
    label: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  aeolian: {
    label: "Aeolian",
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  phrygian: {
    label: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10],
  },
  suspendedPentatonic: {
    label: "Suspended Pentatonic",
    intervals: [0, 2, 5, 7, 10],
  },
};

const LAYER_ROLES = new Set(["drone", "resonance", "shimmer", "pulse", "call", "wind", "rumble", "air"]);
const WAVE_TYPES = new Set(["sine", "triangle", "sawtooth", "square"]);
const MOTION_MODES = new Set(["static", "wander", "call"]);
const NOISE_ROLES = new Set(["wind", "rumble", "air"]);

function finiteOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createSeededRandom(seedInput) {
  let seed = Math.max(1, Math.floor(finiteOr(seedInput, 1))) >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function createLayerId() {
  return `layer-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000).toString(36)}`;
}

export function getSoundscapeScaleEntries() {
  return Object.entries(SCALES).map(([key, scale]) => ({ key, label: scale.label }));
}

export function getSoundscapeRootNotes() {
  return Object.keys(NOTE_OFFSETS);
}

export const SOUNDSCAPE_ROLE_PRESETS = {
  drone: {
    role: "drone",
    source: "tone",
    degree: 0,
    octave: -1,
    amplitude: 0.35,
    type: "triangle",
    attackSec: 3,
    releaseSec: 4,
    ampDrift: 0.18,
    pitchDriftCents: 3,
    driftCycleSec: 18,
    motionMode: "static",
    changeIntervalSec: 16,
    changeChance: 0,
    glideSec: 2,
    filterFrequency: 900,
  },
  resonance: {
    role: "resonance",
    source: "tone",
    degree: 3,
    octave: 0,
    amplitude: 0.18,
    type: "sine",
    attackSec: 5,
    releaseSec: 5,
    ampDrift: 0.28,
    pitchDriftCents: 5,
    driftCycleSec: 24,
    motionMode: "static",
    changeIntervalSec: 18,
    changeChance: 0,
    glideSec: 3,
    filterFrequency: 1200,
  },
  shimmer: {
    role: "shimmer",
    source: "tone",
    degree: 4,
    octave: 1,
    amplitude: 0.1,
    type: "sine",
    attackSec: 4,
    releaseSec: 6,
    ampDrift: 0.5,
    pitchDriftCents: 9,
    driftCycleSec: 13,
    motionMode: "wander",
    changeIntervalSec: 10,
    changeChance: 0.45,
    glideSec: 2.5,
    filterFrequency: 2200,
  },
  pulse: {
    role: "pulse",
    source: "tone",
    degree: 0,
    octave: 0,
    amplitude: 0.16,
    type: "triangle",
    attackSec: 2,
    releaseSec: 5,
    ampDrift: 0.65,
    pitchDriftCents: 4,
    driftCycleSec: 9,
    motionMode: "static",
    changeIntervalSec: 20,
    changeChance: 0,
    glideSec: 3,
    filterFrequency: 1000,
  },
  call: {
    role: "call",
    source: "tone",
    degree: 4,
    octave: 1,
    amplitude: 0.12,
    type: "sine",
    attackSec: 2.5,
    releaseSec: 8,
    ampDrift: 0.35,
    pitchDriftCents: 7,
    driftCycleSec: 22,
    motionMode: "call",
    changeIntervalSec: 24,
    changeChance: 0.35,
    glideSec: 5,
    filterFrequency: 1800,
  },
  wind: {
    role: "wind",
    source: "noise",
    degree: 0,
    octave: 0,
    amplitude: 0.08,
    type: "sine",
    attackSec: 6,
    releaseSec: 8,
    ampDrift: 0.55,
    pitchDriftCents: 0,
    driftCycleSec: 17,
    motionMode: "static",
    changeIntervalSec: 30,
    changeChance: 0,
    glideSec: 4,
    filterFrequency: 850,
    noiseType: "wind",
  },
  rumble: {
    role: "rumble",
    source: "noise",
    degree: 0,
    octave: -2,
    amplitude: 0.06,
    type: "sine",
    attackSec: 8,
    releaseSec: 10,
    ampDrift: 0.35,
    pitchDriftCents: 0,
    driftCycleSec: 28,
    motionMode: "static",
    changeIntervalSec: 30,
    changeChance: 0,
    glideSec: 4,
    filterFrequency: 120,
    noiseType: "rumble",
  },
  air: {
    role: "air",
    source: "noise",
    degree: 0,
    octave: 1,
    amplitude: 0.04,
    type: "sine",
    attackSec: 4,
    releaseSec: 7,
    ampDrift: 0.5,
    pitchDriftCents: 0,
    driftCycleSec: 11,
    motionMode: "static",
    changeIntervalSec: 30,
    changeChance: 0,
    glideSec: 4,
    filterFrequency: 4200,
    noiseType: "air",
  },
};

export function createSoundscapeLayerForRole(role = "drone") {
  const preset = SOUNDSCAPE_ROLE_PRESETS[role] || SOUNDSCAPE_ROLE_PRESETS.drone;
  return {
    id: createLayerId(),
    enabled: true,
    ...preset,
  };
}

export function createDefaultSoundscapeLayer(index = 0) {
  const roles = ["drone", "resonance", "shimmer"];
  return createSoundscapeLayerForRole(roles[index % roles.length]);
}

export function applySoundscapeRolePreset(layer, role) {
  const preset = SOUNDSCAPE_ROLE_PRESETS[role] || SOUNDSCAPE_ROLE_PRESETS.drone;
  return {
    ...layer,
    ...preset,
    role: preset.role,
    id: layer.id,
    enabled: layer.enabled,
    detuneCents: layer.detuneCents || 0,
  };
}

export function normalizeSoundscapeSettings(input = {}, fallback = {}) {
  const source = input && typeof input === "object" ? input : {};
  const base = fallback && typeof fallback === "object" ? fallback : {};
  const rootNote = Object.prototype.hasOwnProperty.call(NOTE_OFFSETS, source.rootNote)
    ? source.rootNote
    : (Object.prototype.hasOwnProperty.call(NOTE_OFFSETS, base.rootNote) ? base.rootNote : "D");
  const scaleKey = Object.prototype.hasOwnProperty.call(SCALES, source.scale)
    ? source.scale
    : (Object.prototype.hasOwnProperty.call(SCALES, base.scale) ? base.scale : "minorPentatonic");
  const sourceLayers = Array.isArray(source.layers)
    ? source.layers
    : (Array.isArray(base.layers) ? base.layers : []);
  const layers = sourceLayers.slice(0, 16).map((layer, index) => {
    const item = layer && typeof layer === "object" ? layer : {};
    return {
      id: typeof item.id === "string" && item.id ? item.id : `layer-${index + 1}`,
      enabled: Boolean(item.enabled ?? true),
      role: LAYER_ROLES.has(item.role) ? item.role : "drone",
      source: item.source === "noise" || NOISE_ROLES.has(item.role) ? "noise" : "tone",
      type: WAVE_TYPES.has(item.type) ? item.type : "sine",
      noiseType: ["wind", "rumble", "air"].includes(item.noiseType) ? item.noiseType : (NOISE_ROLES.has(item.role) ? item.role : "wind"),
      degree: Math.round(clamp(finiteOr(item.degree, 0), 0, 6)),
      octave: Math.round(clamp(finiteOr(item.octave, 0), -3, 3)),
      detuneCents: Math.round(clamp(finiteOr(item.detuneCents, 0), -100, 100)),
      amplitude: clamp(finiteOr(item.amplitude, 0.2), 0, 1),
      attackSec: clamp(finiteOr(item.attackSec, 2), 0, 20),
      releaseSec: clamp(finiteOr(item.releaseSec, 3), 0, 20),
      ampDrift: clamp(finiteOr(item.ampDrift, 0), 0, 1),
      pitchDriftCents: clamp(finiteOr(item.pitchDriftCents, 0), 0, 50),
      driftCycleSec: clamp(finiteOr(item.driftCycleSec, 20), 2, 120),
      motionMode: MOTION_MODES.has(item.motionMode) ? item.motionMode : "static",
      changeIntervalSec: clamp(finiteOr(item.changeIntervalSec, 12), 2, 120),
      changeChance: clamp(finiteOr(item.changeChance, 0.35), 0, 1),
      glideSec: clamp(finiteOr(item.glideSec, 2), 0, 20),
      filterFrequency: clamp(finiteOr(item.filterFrequency, SOUNDSCAPE_ROLE_PRESETS[item.role]?.filterFrequency ?? 850), 40, 8000),
    };
  });
  if (layers.length === 0) {
    layers.push(createDefaultSoundscapeLayer(0));
    layers.push(createDefaultSoundscapeLayer(1));
  }
  return {
    rootNote,
    scale: scaleKey,
    durationSec: clamp(finiteOr(source.durationSec, finiteOr(base.durationSec, 8)), 0.25, 60),
    loop: Boolean(source.loop ?? base.loop ?? true),
    masterGain: clamp(finiteOr(source.masterGain, finiteOr(base.masterGain, 0.45)), 0, 1),
    randomSeed: Math.max(1, Math.round(clamp(finiteOr(source.randomSeed, finiteOr(base.randomSeed, 1)), 1, 999999))),
    layers,
  };
}

export function soundscapeLayerToFrequency(settings, layer, degreeOverride = null) {
  const normalized = normalizeSoundscapeSettings(settings);
  const scale = SCALES[normalized.scale] || SCALES.minorPentatonic;
  const degreeSource = degreeOverride === null || degreeOverride === undefined
    ? layer.degree
    : degreeOverride;
  const degree = Math.max(0, Math.min(scale.intervals.length - 1, Math.round(degreeSource)));
  const midi = 48
    + NOTE_OFFSETS[normalized.rootNote]
    + scale.intervals[degree]
    + layer.octave * 12;
  const baseHz = 440 * (2 ** ((midi - 69) / 12));
  return baseHz * (2 ** (layer.detuneCents / 1200));
}

export function soundscapeToSynthesisSettings(input = {}, fallback = {}) {
  const settings = normalizeSoundscapeSettings(input, fallback);
  return {
    durationSec: settings.durationSec,
    loop: settings.loop,
    masterGain: settings.masterGain,
    oscillators: settings.layers.map((layer) => ({
      id: layer.id,
      enabled: layer.enabled,
      source: layer.source,
      noiseType: layer.noiseType,
      type: layer.type,
      frequency: soundscapeLayerToFrequency(settings, layer),
      filterFrequency: layer.filterFrequency,
      amplitude: layer.amplitude,
      attackSec: layer.attackSec,
      releaseSec: layer.releaseSec,
      phase: 0,
    })),
  };
}

export function getSoundscapeScaleDegreeCount(scaleKey) {
  const scale = SCALES[scaleKey] || SCALES.minorPentatonic;
  return scale.intervals.length;
}

export function createSoundscapeLayerRuntimeState(settings, nowSec = 0) {
  const normalized = normalizeSoundscapeSettings(settings);
  const states = {};
  for (const layer of normalized.layers) {
    states[layer.id] = {
      currentDegree: layer.degree,
      targetDegree: layer.degree,
      lastChangeSec: nowSec,
      driftPhase: Math.random() * Math.PI * 2,
      motionPhase: Math.random() * Math.PI * 2,
    };
  }
  return states;
}

export function updateSoundscapeLayerRuntimeStates(settings, states, nowSec) {
  const normalized = normalizeSoundscapeSettings(settings);
  const scaleDegreeCount = getSoundscapeScaleDegreeCount(normalized.scale);
  const nextStates = states && typeof states === "object" ? states : {};
  for (const layer of normalized.layers) {
    if (!nextStates[layer.id]) {
      nextStates[layer.id] = {
        currentDegree: layer.degree,
        targetDegree: layer.degree,
        lastChangeSec: nowSec,
        driftPhase: Math.random() * Math.PI * 2,
        motionPhase: Math.random() * Math.PI * 2,
      };
    }
    const state = nextStates[layer.id];
    if (layer.motionMode === "static") {
      state.targetDegree = layer.degree;
    } else if (nowSec - state.lastChangeSec >= layer.changeIntervalSec) {
      state.lastChangeSec = nowSec;
      if (Math.random() <= layer.changeChance) {
        const offset = layer.motionMode === "call"
          ? Math.ceil(scaleDegreeCount * 0.5)
          : 1 + Math.floor(Math.random() * Math.max(1, scaleDegreeCount - 1));
        state.targetDegree = (Math.round(state.targetDegree) + offset) % scaleDegreeCount;
      }
    }
    const glide = Math.max(0.01, layer.glideSec);
    const alpha = layer.glideSec <= 0 ? 1 : clamp((nowSec - state.lastChangeSec) / glide, 0, 1);
    state.currentDegree += (state.targetDegree - state.currentDegree) * alpha;
  }
  for (const id of Object.keys(nextStates)) {
    if (!normalized.layers.some((layer) => layer.id === id)) {
      delete nextStates[id];
    }
  }
  return nextStates;
}

export function soundscapeToLiveSynthesisSettings(input = {}, fallback = {}, states = {}, nowSec = 0) {
  const settings = normalizeSoundscapeSettings(input, fallback);
  return {
    durationSec: settings.durationSec,
    loop: settings.loop,
    masterGain: settings.masterGain,
    oscillators: settings.layers.map((layer) => {
      const state = states[layer.id] || {};
      const driftCycle = Math.max(0.001, layer.driftCycleSec);
      const drift = Math.sin((nowSec / driftCycle) * Math.PI * 2 + (state.driftPhase || 0));
      const motionDegree = Number.isFinite(state.currentDegree) ? state.currentDegree : layer.degree;
      const baseFrequency = soundscapeLayerToFrequency(settings, layer, motionDegree);
      const pitchRatio = 2 ** ((drift * layer.pitchDriftCents) / 1200);
      const ampMod = 1 + drift * layer.ampDrift;
      return {
        id: layer.id,
        enabled: layer.enabled,
        source: layer.source,
        noiseType: layer.noiseType,
        type: layer.type,
        frequency: baseFrequency * pitchRatio,
        filterFrequency: layer.filterFrequency,
        amplitude: clamp(layer.amplitude * ampMod, 0, 1),
        attackSec: layer.attackSec,
        releaseSec: layer.releaseSec,
        phase: 0,
      };
    }),
  };
}

export function randomizeSoundscapeSettings(input = {}, fallback = {}) {
  const settings = normalizeSoundscapeSettings(input, fallback);
  const random = createSeededRandom(settings.randomSeed);
  const tonalRoles = ["drone", "resonance", "shimmer", "pulse", "call"];
  const noiseRoles = ["wind", "rumble", "air"];
  const roles = [...tonalRoles.slice(0, 3), noiseRoles[Math.floor(random() * noiseRoles.length)]];
  const layers = roles.map((role, index) => {
    const layer = createSoundscapeLayerForRole(role);
    const degreeCount = getSoundscapeScaleDegreeCount(settings.scale);
    return {
      ...layer,
      id: index < settings.layers.length ? settings.layers[index].id : layer.id,
      degree: role === "drone" ? 0 : Math.floor(random() * degreeCount),
      octave: role === "drone"
        ? -1
        : (role === "shimmer" || role === "call" ? 1 : Math.floor(random() * 2)),
      detuneCents: Math.round((random() * 24) - 12),
      amplitude: clamp(layer.amplitude * (0.75 + random() * 0.5), 0, 1),
      driftCycleSec: Math.round(layer.driftCycleSec * (0.75 + random() * 0.75)),
      changeChance: role === "shimmer" || role === "call"
        ? clamp(0.2 + random() * 0.45, 0, 1)
        : layer.changeChance,
    };
  });
  const roots = getSoundscapeRootNotes();
  const scales = ["minorPentatonic", "dorian", "aeolian", "suspendedPentatonic"];
  return {
    ...settings,
    rootNote: roots[Math.floor(random() * roots.length)],
    scale: scales[Math.floor(random() * scales.length)],
    masterGain: 0.42,
    layers,
  };
}
