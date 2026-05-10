import test from "node:test";
import assert from "node:assert/strict";
import {
  applySoundscapeRolePreset,
  createSoundscapeLayerForRole,
  createSoundscapeLayerRuntimeState,
  normalizeSoundscapeSettings,
  randomizeSoundscapeSettings,
  soundscapeLayerToFrequency,
  soundscapeToLiveSynthesisSettings,
  updateSoundscapeLayerRuntimeStates,
} from "../src/audio/soundscapeRuntime.js";

test("soundscapeLayerToFrequency resolves modal degrees from root and scale", () => {
  const settings = {
    rootNote: "D",
    scale: "minorPentatonic",
    layers: [],
  };
  const root = soundscapeLayerToFrequency(settings, {
    degree: 0,
    octave: 0,
    detuneCents: 0,
  });
  const fifth = soundscapeLayerToFrequency(settings, {
    degree: 3,
    octave: 0,
    detuneCents: 0,
  });
  assert.ok(root > 145 && root < 148);
  assert.ok(fifth > root);
});

test("noise role presets normalize into noise live synthesis sources", () => {
  const settings = normalizeSoundscapeSettings({
    rootNote: "D",
    scale: "dorian",
    layers: [createSoundscapeLayerForRole("wind")],
  });
  const live = soundscapeToLiveSynthesisSettings(settings, {}, {}, 0);
  assert.equal(live.oscillators[0].source, "noise");
  assert.equal(live.oscillators[0].noiseType, "wind");
  assert.ok(live.oscillators[0].filterFrequency >= 40);
});

test("role preset application keeps layer identity while changing behavior", () => {
  const layer = createSoundscapeLayerForRole("drone");
  const next = applySoundscapeRolePreset(layer, "shimmer");
  assert.equal(next.id, layer.id);
  assert.equal(next.role, "shimmer");
  assert.equal(next.motionMode, "wander");
});

test("randomized soundscape stays constrained", () => {
  const randomized = randomizeSoundscapeSettings({
    rootNote: "D",
    scale: "minorPentatonic",
    randomSeed: 42,
    layers: [],
  });
  const repeated = randomizeSoundscapeSettings({
    rootNote: "D",
    scale: "minorPentatonic",
    randomSeed: 42,
    layers: [],
  });
  assert.ok(randomized.layers.length >= 4);
  assert.ok(randomized.layers.some((layer) => layer.source === "noise"));
  assert.deepEqual(
    randomized.layers.map((layer) => [layer.role, layer.degree, layer.octave, layer.detuneCents]),
    repeated.layers.map((layer) => [layer.role, layer.degree, layer.octave, layer.detuneCents]),
  );
  for (const layer of randomized.layers) {
    assert.ok(layer.amplitude >= 0 && layer.amplitude <= 1);
    assert.ok(layer.degree >= 0 && layer.degree <= 6);
  }
});

test("runtime layer evolution is deterministic for identical seed and settings", () => {
  const settings = normalizeSoundscapeSettings({
    rootNote: "D",
    scale: "minorPentatonic",
    randomSeed: 77,
    layers: [{
      id: "wander-a",
      role: "call",
      enabled: true,
      degree: 1,
      octave: 0,
      detuneCents: 0,
      amplitude: 0.2,
      attackSec: 0,
      releaseSec: 0,
      ampDrift: 0.1,
      pitchDriftCents: 4,
      driftCycleSec: 8,
      motionMode: "wander",
      changeIntervalSec: 2,
      changeChance: 1,
      glideSec: 1,
    }],
  });
  const first = createSoundscapeLayerRuntimeState(settings, 0);
  const second = createSoundscapeLayerRuntimeState(settings, 0);
  for (const timeSec of [2, 2.5, 3, 4, 5]) {
    updateSoundscapeLayerRuntimeStates(settings, first, timeSec);
    updateSoundscapeLayerRuntimeStates(settings, second, timeSec);
  }
  assert.deepEqual(
    ["currentDegree", "targetDegree", "startDegree", "driftPhase", "motionPhase"].map((key) => first["wander-a"][key]),
    ["currentDegree", "targetDegree", "startDegree", "driftPhase", "motionPhase"].map((key) => second["wander-a"][key]),
  );
});

test("degree normalization clamps to selected scale interval count", () => {
  const pentatonic = normalizeSoundscapeSettings({
    scale: "minorPentatonic",
    layers: [{ id: "pent", degree: 6 }],
  });
  const dorian = normalizeSoundscapeSettings({
    scale: "dorian",
    layers: [{ id: "dor", degree: 6 }],
  });
  assert.equal(pentatonic.layers[0].degree, 4);
  assert.equal(dorian.layers[0].degree, 6);
});
