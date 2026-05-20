import test from "node:test";
import assert from "node:assert/strict";

import { createSettingsRegistry } from "../src/core/settingsRegistry.js";
import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_DETAIL_SETTINGS,
  DEFAULT_CAMERA_SETTINGS,
  DEFAULT_SLIME_SETTINGS,
  registerMainSettingsContracts,
} from "../src/core/mainSettingsContracts.js";
import { normalizeDetailSettings } from "../src/gameplay/detailDataSerializer.js";

function createRegistryWithMainDeps(calls = []) {
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
    serializeDetail: () => ({ key: "detail" }),
    applyDetail: (input) => calls.push(["detail", input]),
    serializeCamera: () => ({ key: "camera" }),
    applyCamera: (input) => calls.push(["camera", input]),
    serializeInteraction: () => ({ key: "interaction" }),
    applyInteraction: (input) => calls.push(["interaction", input]),
    serializeAudio: () => ({ key: "audio" }),
    applyAudio: (input) => calls.push(["audio", input]),
    serializeSlime: () => ({ key: "slime" }),
    applySlime: (input) => calls.push(["slime", input]),
    serializeSwarm: () => ({ key: "swarm" }),
    applySwarm: (input) => calls.push(["swarm", input]),
  });
  return registry;
}

test("main settings contracts register and route serialize/apply", () => {
  const calls = [];
  const registry = createRegistryWithMainDeps(calls);

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
  const registry = createRegistryWithMainDeps();
  assert.deepEqual(registry.serialize("audio", null), { key: "audio" });
});

test("audio settings contract applies through applyAudio", () => {
  const calls = [];
  const registry = createRegistryWithMainDeps(calls);
  const input = { minHz: 80, maxHz: 8000 };
  registry.apply("audio", input, null);
  assert.deepEqual(calls, [["audio", input]]);
});

test("audio settings contract validates object-like input", () => {
  const registry = createRegistryWithMainDeps();
  assert.equal(registry.validate("audio", { ok: true }), true);
  assert.equal(registry.validate("audio", null), true);
  assert.equal(registry.validate("audio", undefined), true);
  assert.equal(registry.validate("audio", 42), false);
  assert.equal(registry.validate("audio", []), false);
});

test("audio settings contract returns isolated default settings", () => {
  const registry = createRegistryWithMainDeps();
  const defaultsA = registry.getDefaults("audio");
  const defaultsB = registry.getDefaults("audio");
  assert.deepEqual(defaultsA, DEFAULT_AUDIO_SETTINGS);
  defaultsA.minHz = 999;
  assert.notEqual(defaultsA.minHz, defaultsB.minHz);
});

test("slime settings contract routes and returns isolated defaults", () => {
  const calls = [];
  const registry = createRegistryWithMainDeps(calls);
  assert.deepEqual(registry.serialize("slime", null), { key: "slime" });
  registry.apply("slime", { agentCount: 1000 }, null);
  assert.deepEqual(calls, [["slime", { agentCount: 1000 }]]);
  const defaultsA = registry.getDefaults("slime");
  const defaultsB = registry.getDefaults("slime");
  assert.deepEqual(defaultsA, DEFAULT_SLIME_SETTINGS);
  defaultsA.agentCount = 999;
  assert.notEqual(defaultsA.agentCount, defaultsB.agentCount);
});

test("detail settings contract routes and returns enabled defaults", () => {
  const calls = [];
  const registry = createRegistryWithMainDeps(calls);
  assert.deepEqual(registry.serialize("detail", null), { key: "detail" });
  registry.apply("detail", { enabled: false }, null);
  assert.deepEqual(calls, [["detail", { enabled: false }]]);
  const defaults = registry.getDefaults("detail");
  assert.deepEqual(defaults, DEFAULT_DETAIL_SETTINGS);
  assert.equal(defaults.enabled, true);
  assert.equal(defaults.version, 3);
  assert.equal(defaults.splat.src, "assets/detail/default/materials.png");
  assert.equal(defaults.materials[1].id, "rock");
  assert.equal(defaults.materials[1].slot, 1);
  assert.equal(defaults.materials[0].micro.colorStrength, 1);
  const normalized = normalizeDetailSettings({
    materials: [
      {
        micro: {
          colorStrength: 0.75,
        },
      },
    ],
  });
  assert.equal(normalized.materials[0].micro.colorStrength, 0.75);
});

test("camera settings contract routes and returns deep zoom defaults", () => {
  const calls = [];
  const registry = createRegistryWithMainDeps(calls);
  assert.deepEqual(registry.serialize("camera", null), { key: "camera" });
  registry.apply("camera", { zoomMax: 256 }, null);
  assert.deepEqual(calls, [["camera", { zoomMax: 256 }]]);
  const defaults = registry.getDefaults("camera");
  assert.deepEqual(defaults, DEFAULT_CAMERA_SETTINGS);
  assert.equal(defaults.zoomMax, 128);
});
