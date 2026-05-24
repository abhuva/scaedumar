import assert from "node:assert/strict";
import test from "node:test";
import {
  createPlayerActivityState,
  getPlayerActivitySnapshot,
  resetPlayerActivityState,
  startBaseActivityState,
} from "../src/gameplay/playerActivityStateRuntime.js";

test("player activity state creates idle defaults", () => {
  const state = createPlayerActivityState("idle");

  assert.equal(state.active, false);
  assert.equal(state.type, "idle");
  assert.equal(state.scoutPhase, "idle");
  assert.deepEqual(state.recentCells, []);
  assert.equal(state.visitedCells.size, 0);
});

test("player activity state snapshots clone mutable readings", () => {
  const state = createPlayerActivityState("idle");
  state.type = "inspect";
  state.inspectResources = [{ resourceId: "water", value: 0.5 }];
  state.visitedCells.add("1,2");

  const snapshot = getPlayerActivitySnapshot(state, {
    inspect: { label: "Inspect Terrain" },
  });
  snapshot.inspectResources[0].value = 1;

  assert.equal(snapshot.label, "Inspect Terrain");
  assert.equal(snapshot.visitedCount, 1);
  assert.equal(state.inspectResources[0].value, 0.5);
});

test("player activity state starts and resets base activity fields", () => {
  const state = createPlayerActivityState("idle");
  startBaseActivityState(state, "travel", "Traveling.", { pixelX: 4.4, pixelY: 5.6 });

  assert.equal(state.active, true);
  assert.equal(state.type, "travel");
  assert.equal(state.originX, 4);
  assert.equal(state.originY, 6);
  assert.equal(state.lastMessage, "Traveling.");

  resetPlayerActivityState(state, "idle", "Stopped.");
  assert.equal(state.active, false);
  assert.equal(state.type, "idle");
  assert.equal(state.lastMessage, "Stopped.");
  assert.equal(state.originX, 0);
});
