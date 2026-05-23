import test from "node:test";
import assert from "node:assert/strict";

import { TEST_ITEM_DEFINITIONS } from "./testItemDefinitions.js";
import {
  addItemStack,
  createContainer,
  getContainerCapacity,
  moveItemStack,
} from "../src/gameplay/containerModel.js";

test("addItemStack stacks items and enforces max stack size", () => {
  let container = createContainer({
    id: "pack",
    maxWeight: 25,
    maxBulk: 40,
  });

  let result = addItemStack(container, "berries", 25, TEST_ITEM_DEFINITIONS);
  assert.equal(result.ok, true);
  container = result.container;

  assert.deepEqual(container.slots, [
    { itemId: "berries", quantity: 20 },
    { itemId: "berries", quantity: 5 },
  ]);
});

test("addItemStack enforces weight and bulk", () => {
  const container = createContainer({
    id: "small",
    maxWeight: 1,
    maxBulk: 2,
  });

  const tooHeavy = addItemStack(container, "dry_wood", 3, TEST_ITEM_DEFINITIONS);
  assert.equal(tooHeavy.ok, false);
  assert.equal(tooHeavy.reason, "Too heavy.");

  const tooBulky = addItemStack(container, "plant_fiber", 20, TEST_ITEM_DEFINITIONS);
  assert.equal(tooBulky.ok, false);
  assert.equal(tooBulky.reason, "Too bulky.");
});

test("moveItemStack moves a whole selected stack between containers", () => {
  const source = addItemStack(
    createContainer({ id: "source", maxWeight: 25, maxBulk: 40 }),
    "medicinal_herb",
    3,
    TEST_ITEM_DEFINITIONS,
  ).container;
  const target = createContainer({ id: "target", maxWeight: 25, maxBulk: 40 });

  const result = moveItemStack(source, target, 0, 3, TEST_ITEM_DEFINITIONS);

  assert.equal(result.ok, true);
  assert.deepEqual(result.source.slots, []);
  assert.deepEqual(result.target.slots, [{ itemId: "medicinal_herb", quantity: 3 }]);
  assert.deepEqual(getContainerCapacity(result.target, TEST_ITEM_DEFINITIONS), {
    weight: 0.09,
    bulk: 0.24,
    maxWeight: 25,
    maxBulk: 40,
  });
});
