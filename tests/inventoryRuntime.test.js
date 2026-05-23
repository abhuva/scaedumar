import test from "node:test";
import assert from "node:assert/strict";

import { createInventoryRuntime, PLAYER_CONTAINER_ID } from "../src/gameplay/inventoryRuntime.js";
import { TEST_ITEM_DEFINITIONS } from "./testItemDefinitions.js";

test("inventory runtime drops selected carried stack into a map bundle", () => {
  const upserted = [];
  const runtime = createInventoryRuntime({
    playerState: { pixelX: 10, pixelY: 12 },
    itemRegistry: TEST_ITEM_DEFINITIONS,
    entityStore: {
      upsert: (entity) => upserted.push(entity),
    },
    requestOverlayDraw: () => {},
  });

  assert.equal(runtime.addToPlayer("berries", 4).ok, true);
  assert.equal(runtime.selectStack(PLAYER_CONTAINER_ID, 0).ok, true);
  const drop = runtime.dropSelectedBundle();

  assert.equal(drop.ok, true);
  assert.equal(drop.bundle.pixelX, 10);
  assert.equal(drop.bundle.pixelY, 12);
  assert.equal(upserted.length, 1);
  const snapshot = runtime.getSnapshot();
  assert.deepEqual(snapshot.playerContainer.slots, []);
  assert.deepEqual(snapshot.openContainer.slots, [{ itemId: "berries", quantity: 4 }]);
});

test("inventory runtime moves selected stack back from nearby bundle to player", () => {
  const removed = [];
  const runtime = createInventoryRuntime({
    playerState: { pixelX: 10, pixelY: 12 },
    itemRegistry: TEST_ITEM_DEFINITIONS,
    entityStore: {
      upsert: () => {},
      remove: (id) => removed.push(id),
    },
    requestOverlayDraw: () => {},
  });

  runtime.addToPlayer("plant_fiber", 5);
  runtime.selectStack(PLAYER_CONTAINER_ID, 0);
  const drop = runtime.dropSelectedBundle();
  assert.equal(drop.ok, true);

  const snapshot = runtime.getSnapshot();
  assert.equal(runtime.selectStack(snapshot.openContainerId, 0).ok, true);
  const moved = runtime.moveSelectedToPlayer();

  assert.equal(moved.ok, true);
  assert.deepEqual(runtime.getSnapshot().playerContainer.slots, [
    { itemId: "plant_fiber", quantity: 5 },
  ]);
  assert.deepEqual(runtime.listBundles(), []);
  assert.deepEqual(removed, [drop.bundle.id]);
});

test("inventory runtime uses carried berries and delegates condition effects", () => {
  const effects = [];
  const runtime = createInventoryRuntime({
    playerState: { pixelX: 0, pixelY: 0 },
    itemRegistry: TEST_ITEM_DEFINITIONS,
    applyItemUse: (payload) => {
      effects.push(payload.effects);
      return { ok: true };
    },
    requestOverlayDraw: () => {},
  });

  runtime.addToPlayer("berries", 2);
  runtime.selectStack(PLAYER_CONTAINER_ID, 0);
  const used = runtime.useSelectedItem();

  assert.equal(used.ok, true);
  assert.equal(used.itemName, "Berries");
  assert.deepEqual(effects, [{ nutrition: 6, hydration: 3 }]);
  assert.deepEqual(runtime.getSnapshot().playerContainer.slots, [
    { itemId: "berries", quantity: 1 },
  ]);
});

test("inventory runtime does not consume item when use effect is rejected", () => {
  const runtime = createInventoryRuntime({
    playerState: { pixelX: 0, pixelY: 0 },
    itemRegistry: TEST_ITEM_DEFINITIONS,
    applyItemUse: () => ({ ok: false, reason: "Cannot eat now." }),
    requestOverlayDraw: () => {},
  });

  runtime.addToPlayer("berries", 1);
  runtime.selectStack(PLAYER_CONTAINER_ID, 0);
  const used = runtime.useSelectedItem();

  assert.equal(used.ok, false);
  assert.deepEqual(runtime.getSnapshot().playerContainer.slots, [
    { itemId: "berries", quantity: 1 },
  ]);
});
