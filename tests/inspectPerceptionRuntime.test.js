import assert from "node:assert/strict";
import test from "node:test";
import {
  createInspectPerceptionRuntime,
  getInspectOverlayDebugLayer,
  getInspectOverlayDisplayLabel,
  getInspectOverlayResourceId,
  normalizeInspectOverlayLayer,
} from "../src/gameplay/inspectPerceptionRuntime.js";

test("inspect perception normalizes overlay layer helpers", () => {
  assert.equal(normalizeInspectOverlayLayer("plants"), "plants");
  assert.equal(normalizeInspectOverlayLayer("tracks"), "tracks");
  assert.equal(normalizeInspectOverlayLayer("height"), "height");
  assert.equal(normalizeInspectOverlayLayer("unknown"), "water");
  assert.equal(getInspectOverlayDebugLayer("plants"), "plants");
  assert.equal(getInspectOverlayDebugLayer("tracks"), null);
  assert.equal(getInspectOverlayDebugLayer("unknown"), "water");
  assert.equal(getInspectOverlayResourceId("plants"), "plants");
  assert.equal(getInspectOverlayResourceId("tracks"), null);
  assert.equal(getInspectOverlayResourceId("height"), null);
  assert.equal(getInspectOverlayDisplayLabel("tracks"), "Tracks");
  assert.equal(getInspectOverlayDisplayLabel("slope"), "Slope");
});

test("inspect perception non-resource layers only notify debug owners", () => {
  const calls = [];
  const runtime = createInspectPerceptionRuntime({
    onResourceLayerSelected: (resourceId) => calls.push(["resource", resourceId]),
    revealResourceKnowledge: (resourceId) => calls.push(["reveal", resourceId]),
    onDebugLayerSelected: (layer) => calls.push(["debug", layer]),
    syncDebugPanel: () => calls.push(["sync"]),
    onChanged: (payload) => calls.push(["changed", payload.layer, payload.reason]),
  });

  assert.equal(runtime.setLayer("height"), "height");
  assert.deepEqual(calls, [
    ["debug", "height"],
    ["sync"],
    ["changed", "height", "layer-changed"],
  ]);
});

test("inspect perception tracks layer samples tracks without resource or debug selection", () => {
  const calls = [];
  const runtime = createInspectPerceptionRuntime({
    getMapSize: () => ({ width: 10, height: 10 }),
    sampleTracks: (x, y) => (x + y) / 20,
    onResourceLayerSelected: (resourceId) => calls.push(["resource", resourceId]),
    revealResourceKnowledge: (resourceId) => calls.push(["reveal", resourceId]),
    onDebugLayerSelected: (layer) => calls.push(["debug", layer]),
    syncDebugPanel: () => calls.push(["sync"]),
    onChanged: (payload) => calls.push(["changed", payload.layer, payload.reason]),
  });

  assert.equal(runtime.setLayer("tracks"), "tracks");
  runtime.sampleAt(4, 6);
  assert.equal(runtime.getLayerBarValue("tracks"), 0.5);
  assert.deepEqual(calls, [
    ["sync"],
    ["changed", "tracks", "layer-changed"],
  ]);
});

test("inspect perception toggles, samples cursor, and emits changes", () => {
  const events = [];
  const runtime = createInspectPerceptionRuntime({
    getMapSize: () => ({ width: 10, height: 8 }),
    getFallbackPixel: () => ({ x: 2, y: 3 }),
    sampleHeight: (x, y) => (x + y) / 20,
    sampleSlope: (x, y) => y / 10,
    getResourceReadings: (x, y) => [{
      resourceId: "water",
      value: x / 10,
      knowledge: 1,
      knownStock: y / 10,
      stock: 1,
    }],
    onChanged: (payload) => events.push(payload),
  });

  assert.deepEqual(runtime.toggle(), { ok: true });
  assert.equal(runtime.isEnabled(), true);
  assert.equal(runtime.updateFromMapPixel(20, -5, "test-pointer"), true);

  const snapshot = runtime.getSnapshot({ stockOverlayMode: "known" });
  assert.equal(snapshot.inspectX, 9);
  assert.equal(snapshot.inspectY, 0);
  assert.equal(snapshot.inspectHeight, 0.45);
  assert.equal(snapshot.inspectSlope, 0);
  assert.equal(runtime.getLayerBarValue("water", "known"), 0);
  assert.equal(events.at(-1).reason, "test-pointer");
});

test("inspect perception layer changes notify resource/debug owners", () => {
  const calls = [];
  const runtime = createInspectPerceptionRuntime({
    onResourceLayerSelected: (resourceId) => calls.push(["resource", resourceId]),
    revealResourceKnowledge: (resourceId) => calls.push(["reveal", resourceId]),
    onDebugLayerSelected: (layer) => calls.push(["debug", layer]),
    syncDebugPanel: () => calls.push(["sync"]),
    onChanged: (payload) => calls.push(["changed", payload.layer, payload.reason]),
  });

  assert.equal(runtime.setLayer("plants"), "plants");
  assert.deepEqual(calls, [
    ["resource", "plants"],
    ["reveal", "plants"],
    ["debug", "plants"],
    ["sync"],
    ["changed", "plants", "layer-changed"],
  ]);
});

test("inspect perception can sync resource layer without revealing knowledge", () => {
  const calls = [];
  const runtime = createInspectPerceptionRuntime({
    onResourceLayerSelected: (resourceId) => calls.push(["resource", resourceId]),
    revealResourceKnowledge: (resourceId) => calls.push(["reveal", resourceId]),
    onDebugLayerSelected: (layer) => calls.push(["debug", layer]),
    syncDebugPanel: () => calls.push(["sync"]),
    onChanged: (payload) => calls.push(["changed", payload.layer, payload.reason]),
  });

  assert.equal(runtime.setLayer("water", { reason: "settings-sync", revealKnowledge: false }), "water");
  assert.deepEqual(calls, [
    ["resource", "water"],
    ["debug", "water"],
    ["sync"],
    ["changed", "water", "settings-sync"],
  ]);
});

test("inspect perception respects blocked enable state", () => {
  const runtime = createInspectPerceptionRuntime({
    canEnable: () => false,
    getBlockedReason: () => "blocked",
  });

  assert.deepEqual(runtime.toggle(), { ok: false, reason: "blocked" });
  assert.equal(runtime.isEnabled(), false);
});
