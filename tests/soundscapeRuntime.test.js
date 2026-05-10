import test from "node:test";
import assert from "node:assert/strict";
import {
  applySoundscapeRolePreset,
  createSoundscapeLayerForRole,
  normalizeSoundscapeSettings,
  randomizeSoundscapeSettings,
  soundscapeLayerToFrequency,
  soundscapeToLiveSynthesisSettings,
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
