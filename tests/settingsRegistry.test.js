import test from "node:test";
import assert from "node:assert/strict";

import { createSettingsRegistry } from "../src/core/settingsRegistry.js";
import {
  DEFAULT_AUDIO_SETTINGS,
  registerMainSettingsContracts,
} from "../src/core/mainSettingsContracts.js";

function createRegistryWithAudioDeps(calls = []) {
  const registry = createSettingsRegistry();
  registerMainSettingsContracts(registry, {
    serializeLighting: () => ({ key: "lighting" }),
    applyLighting: (input) => calls.push(["lighting", input]),
    serializeFog: () => ({ key: "fog" }),
    applyFog: (input) => calls.push(["fog", input]),
    serializeParallax: () => ({ key: "parallax" }),
    applyParallax: (input) => calls.push(["parallax", input]),
    serializeClouds: () => ({ key: "clouds" }),
    applyClouds: (input) => calls.push(["clouds", input]),
    serializeWater: () => ({ key: "waterfx" }),
    applyWater: (input) => calls.push(["waterfx", input]),
    serializeInteraction: () => ({ key: "interaction" }),
    applyInteraction: (input) => calls.push(["interaction", input]),
    serializeAudio: () => ({ key: "audio" }),
    applyAudio: (input) => calls.push(["audio", input]),
    serializeSwarm: () => ({ key: "swarm" }),
    applySwarm: (input) => calls.push(["swarm", input]),
  });
  return registry;
}

test("main settings contracts register and route serialize/apply", () => {
  const calls = [];
  const registry = createRegistryWithAudioDeps(calls);

  assert.deepEqual(registry.serialize("lighting", null), { key: "lighting" });
  registry.apply("waterfx", { test: true }, null);
  assert.deepEqual(calls, [["waterfx", { test: true }]]);

  assert.equal(registry.validate("fog", { ok: true }), true);
  assert.equal(registry.validate("fog", 42), false);

  const defaultsA = registry.getDefaults("interaction");
  const defaultsB = registry.getDefaults("interaction");
  defaultsA.pathfindingRange = 999;
  assert.notEqual(defaultsA.pathfindingRange, defaultsB.pathfindingRange);
});

test("audio settings contract serializes through serializeAudio", () => {
  const registry = createRegistryWithAudioDeps();
  assert.deepEqual(registry.serialize("audio", null), { key: "audio" });
});

test("audio settings contract applies through applyAudio", () => {
  const calls = [];
  const registry = createRegistryWithAudioDeps(calls);
  const input = { minHz: 80, maxHz: 8000 };
  registry.apply("audio", input, null);
  assert.deepEqual(calls, [["audio", input]]);
});

test("audio settings contract validates object-like input", () => {
  const registry = createRegistryWithAudioDeps();
  assert.equal(registry.validate("audio", { ok: true }), true);
  assert.equal(registry.validate("audio", null), true);
  assert.equal(registry.validate("audio", undefined), true);
  assert.equal(registry.validate("audio", 42), false);
  assert.equal(registry.validate("audio", []), false);
});

test("audio settings contract returns isolated default settings", () => {
  const registry = createRegistryWithAudioDeps();
  const defaultsA = registry.getDefaults("audio");
  const defaultsB = registry.getDefaults("audio");
  assert.deepEqual(defaultsA, DEFAULT_AUDIO_SETTINGS);
  defaultsA.minHz = 999;
  assert.notEqual(defaultsA.minHz, defaultsB.minHz);
});
