import test from "node:test";
import assert from "node:assert/strict";

import { createSettingsRegistry } from "../src/core/settingsRegistry.js";
import { registerMainSettingsContracts } from "../src/core/mainSettingsContracts.js";

test("main settings contracts register and route serialize/apply", () => {
  const calls = [];
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
    serializeSwarm: () => ({ key: "swarm" }),
    applySwarm: (input) => calls.push(["swarm", input]),
  });

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
