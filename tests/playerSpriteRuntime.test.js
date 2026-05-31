import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerSpriteRuntime } from "../src/gameplay/playerSpriteRuntime.js";

const CURRENT_PLAYER_DEFINITION = Object.freeze({
  id: "player",
  spriteSlot: 0,
  spriteSrc: "assets/sprites/agents/default/player.png",
  slotWidth: 64,
  slotHeight: 64,
  visualWidthPx: 1,
  visualHeightPx: 1,
  pivotX: 0.5,
  pivotY: 0.5,
  directionCount: 1,
  frameCount: 1,
  layer: "ground",
});

test("player sprite runtime creates a clone-safe render snapshot", () => {
  const playerState = { pixelX: 10, pixelY: 20, color: "#cc8844" };
  const runtime = createPlayerSpriteRuntime({
    playerState,
    definition: CURRENT_PLAYER_DEFINITION,
  });

  const snapshot = runtime.getPlayerSpriteRenderSnapshot();

  assert.equal(snapshot.version, 0);
  assert.equal(snapshot.agents.length, 1);
  assert.equal(snapshot.agents[0].id, "player");
  assert.equal(snapshot.agents[0].owner, "player");
  assert.equal(snapshot.agents[0].spriteId, "player");
  assert.equal(snapshot.agents[0].spriteSrc, "assets/sprites/agents/default/player.png");
  assert.equal(snapshot.atlas.slotWidth, 64);
  assert.equal(snapshot.atlas.slotHeight, 64);
  assert.equal(snapshot.agents[0].sourceSlotWidth, 64);
  assert.equal(snapshot.agents[0].sourceSlotHeight, 64);
  assert.equal(snapshot.agents[0].sourceFrameCount, 1);
  assert.equal(snapshot.agents[0].sourceFrameIndex, 0);
  assert.equal(snapshot.agents[0].tint, "");
  assert.equal(snapshot.agents[0].pixelX, 10);
  assert.equal(snapshot.agents[0].pixelY, 20);
  assert.equal(snapshot.agents[0].visualWidthPx, 1);
  assert.equal(snapshot.agents[0].visualHeightPx, 1);

  snapshot.agents[0].pixelX = 99;
  assert.equal(runtime.getPlayerSpriteRenderSnapshot().agents[0].pixelX, 10);
});

test("player sprite direction follows movement steps", () => {
  const runtime = createPlayerSpriteRuntime({
    playerState: { pixelX: 0, pixelY: 0 },
    definition: {
      ...CURRENT_PLAYER_DEFINITION,
      directionCount: 4,
    },
  });

  assert.equal(runtime.recordMovementStep({ fromX: 0, fromY: 0, toX: 0, toY: 1 }), true);
  assert.equal(runtime.getDirectionIndex(), 1);
  assert.equal(runtime.getPlayerSpriteRenderSnapshot().agents[0].spriteSlot, 1);
  assert.equal(runtime.getPlayerSpriteRenderSnapshot().agents[0].sourceFrameIndex, 1);

  assert.equal(runtime.recordMovementStep({ fromX: 0, fromY: 1, toX: -1, toY: 1 }), true);
  assert.equal(runtime.getDirectionIndex(), 2);
  assert.equal(runtime.getPlayerSpriteRenderSnapshot().agents[0].spriteSlot, 2);
  assert.equal(runtime.getPlayerSpriteRenderSnapshot().agents[0].sourceFrameIndex, 2);
});

test("player sprite runtime rejects invalid movement steps without mutating direction", () => {
  const runtime = createPlayerSpriteRuntime({
    playerState: { pixelX: 0, pixelY: 0 },
    definition: {
      ...CURRENT_PLAYER_DEFINITION,
      directionCount: 4,
    },
  });
  runtime.setDirectionIndex(3);

  assert.equal(runtime.recordMovementStep({ fromX: 0, fromY: 0, toX: NaN, toY: 1 }), false);
  assert.equal(runtime.getDirectionIndex(), 3);
});

test("player sprite snapshot does not mutate player gameplay state", () => {
  const playerState = { pixelX: 4, pixelY: 5, color: "#ffffff" };
  const runtime = createPlayerSpriteRuntime({
    playerState,
    definition: CURRENT_PLAYER_DEFINITION,
  });

  runtime.recordMovementStep({ fromX: 4, fromY: 5, toX: 5, toY: 5 });
  runtime.getPlayerSpriteRenderSnapshot();

  assert.deepEqual(playerState, { pixelX: 4, pixelY: 5, color: "#ffffff" });
});
