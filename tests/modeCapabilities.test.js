import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeRuntimeMode,
  getModeCapabilities,
  canUseTopic,
  canUseInteractionMode,
  canUseOverlay,
} from "../src/core/modeCapabilities.js";

test("normalizeRuntimeMode keeps only title and gameplay shell modes", () => {
  assert.equal(normalizeRuntimeMode("gameplay"), "gameplay");
  assert.equal(normalizeRuntimeMode("title"), "title");
  assert.equal(normalizeRuntimeMode("hybrid"), "gameplay");
  assert.equal(normalizeRuntimeMode("unknown"), "gameplay");
});

test("gameplay mode exposes RD topic and gameplay interaction modes", () => {
  assert.equal(canUseTopic("gameplay", "lighting"), false);
  assert.equal(canUseTopic("gameplay", "map"), false);
  assert.equal(canUseTopic("gameplay", "resource-debug"), true);
  assert.equal(canUseInteractionMode("gameplay", "lighting"), true);
  assert.equal(canUseInteractionMode("gameplay", "pathfinding"), true);
  assert.equal(canUseOverlay("gameplay", "pointLights"), true);
  assert.equal(canUseOverlay("gameplay", "cursorLight"), true);
});

test("title mode blocks topics and interactions", () => {
  const caps = getModeCapabilities("title");
  assert.deepEqual(caps.topics, []);
  assert.equal(canUseTopic("title", "resource-debug"), false);
  assert.equal(canUseInteractionMode("title", "lighting"), false);
  assert.equal(canUseOverlay("title", "cursorLight"), false);
});
