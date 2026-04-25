import test from "node:test";
import assert from "node:assert/strict";

import { createMovementSystem } from "../src/gameplay/movementSystem.js";

test("movementSystem processes queued movement by ticks", () => {
  const playerState = { pixelX: 0, pixelY: 0 };
  const system = createMovementSystem({
    entityStore: null,
    playerState,
    getMapWidth: () => 10,
    getMapHeight: () => 10,
    computeMoveStepCost: (fromX, fromY, toX, toY) => {
      if (fromX === 0 && fromY === 0 && toX === 1 && toY === 0) return 2;
      if (fromX === 1 && fromY === 0 && toX === 1 && toY === 1) return 1;
      return Number.POSITIVE_INFINITY;
    },
    rebuildMovementField: () => {},
    requestOverlayDraw: () => {},
    setStatus: () => {},
    setPlayerSnapshot: () => {},
    setMovementSnapshot: () => {},
  });

  const queued = system.replaceQueue(
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
    0.01,
  );
  assert.equal(queued, true);
  assert.equal(system.getSnapshot().ticksRemaining, 2);

  system.update({ time: { systems: { movement: { ticksProcessed: 1 } } } }, {});
  assert.equal(playerState.pixelX, 0);
  assert.equal(playerState.pixelY, 0);
  assert.equal(system.getSnapshot().ticksRemaining, 1);

  system.update({ time: { systems: { movement: { ticksProcessed: 1 } } } }, {});
  assert.equal(playerState.pixelX, 1);
  assert.equal(playerState.pixelY, 0);
  assert.equal(system.getSnapshot().ticksRemaining, 1);

  system.update({ time: { systems: { movement: { ticksProcessed: 1 } } } }, {});
  assert.equal(playerState.pixelX, 1);
  assert.equal(playerState.pixelY, 1);
  assert.equal(system.getSnapshot().active, false);
});

test("movementSystem keeps existing queue when replacement path is invalid", () => {
  const playerState = { pixelX: 0, pixelY: 0 };
  const system = createMovementSystem({
    entityStore: null,
    playerState,
    getMapWidth: () => 10,
    getMapHeight: () => 10,
    computeMoveStepCost: () => 1,
    rebuildMovementField: () => {},
    requestOverlayDraw: () => {},
    setStatus: () => {},
    setPlayerSnapshot: () => {},
    setMovementSnapshot: () => {},
  });

  assert.equal(system.replaceQueue([{ x: 0, y: 0 }, { x: 1, y: 0 }], 0.01), true);
  const before = system.getSnapshot();
  assert.equal(system.replaceQueue([{ x: 0, y: 0 }], 0.01), false);
  const after = system.getSnapshot();
  assert.equal(after.queueLength, before.queueLength);
  assert.equal(after.active, true);
});

