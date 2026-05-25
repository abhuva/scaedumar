import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState, DEFAULT_GAMEPLAY_PLAYER } from "../src/core/state.js";

test("createInitialState deep clones default player state", () => {
  const first = createInitialState();
  const second = createInitialState();

  first.gameplay.player.stats.gatherRadius = 999;

  assert.equal(second.gameplay.player.stats.gatherRadius, DEFAULT_GAMEPLAY_PLAYER.stats.gatherRadius);
  assert.notEqual(first.gameplay.player.stats, second.gameplay.player.stats);
});
