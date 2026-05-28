import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeRuntimeMode,
  getModeCapabilities,
  canUseTopic,
  canUseInteractionMode,
  canUseOverlay,
} from "../src/core/modeCapabilities.js";

test("normalizeRuntimeMode falls back to dev", () => {
  assert.equal(normalizeRuntimeMode("gameplay"), "gameplay");
  assert.equal(normalizeRuntimeMode("hybrid"), "hybrid");
  assert.equal(normalizeRuntimeMode("unknown"), "dev");
});

test("gameplay mode gates topics and interaction modes", () => {
  assert.equal(canUseTopic("gameplay", "lighting"), false);
  assert.equal(canUseTopic("gameplay", "map"), false);
  assert.equal(canUseInteractionMode("gameplay", "lighting"), true);
  assert.equal(canUseInteractionMode("gameplay", "pathfinding"), true);
  assert.equal(canUseOverlay("gameplay", "pointLights"), true);
});

test("dev mode keeps only RD topic while preserving internal overlays", () => {
  const caps = getModeCapabilities("dev");
  assert.deepEqual(caps.topics, ["resource-debug"]);
  assert.ok(caps.overlays.includes("pointLights"));
  assert.equal(canUseTopic("dev", "detail"), false);
  assert.equal(canUseTopic("dev", "resource-debug"), true);
  assert.equal(canUseOverlay("dev", "cursorLight"), true);
});
