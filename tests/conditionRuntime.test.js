import test from "node:test";
import assert from "node:assert/strict";

import {
  applyConditionEffects,
  computeLoadFromCapacity,
  createConditionRuntime,
} from "../src/gameplay/conditionRuntime.js";

test("applyConditionEffects clamps player condition values", () => {
  const next = applyConditionEffects({
    nutrition: 98,
    hydration: 2,
    fatigue: 5,
  }, {
    nutrition: 8,
    hydration: -5,
    fatigue: 120,
  });

  assert.equal(next.nutrition, 100);
  assert.equal(next.hydration, 0);
  assert.equal(next.fatigue, 100);
});

test("applyConditionEffects accumulates small survival costs instead of rounding them away", () => {
  let condition = {
    nutrition: 65,
    hydration: 70,
    fatigue: 5,
  };

  for (let i = 0; i < 10; i++) {
    condition = applyConditionEffects(condition, {
      nutrition: -0.015,
      hydration: -0.025,
      fatigue: 0.035,
    });
  }

  assert.equal(condition.nutrition, 64.85);
  assert.equal(condition.hydration, 69.75);
  assert.equal(condition.fatigue, 5.35);
});

test("computeLoadFromCapacity derives weight and bulk load ratios", () => {
  assert.deepEqual(computeLoadFromCapacity({
    weight: 5,
    maxWeight: 25,
    bulk: 20,
    maxBulk: 40,
  }), {
    loadWeight: 0.2,
    loadBulk: 0.5,
    load: 0.5,
  });
});

test("condition runtime syncs effects and load snapshots", () => {
  const snapshots = [];
  const runtime = createConditionRuntime({
    setConditionSnapshot: (snapshot) => snapshots.push(snapshot),
  });

  runtime.applyEffects({ nutrition: 6, hydration: 3 });
  runtime.updateLoadFromCapacity({ weight: 12.5, maxWeight: 25, bulk: 4, maxBulk: 40 });

  assert.equal(snapshots.at(-1).nutrition, 71);
  assert.equal(snapshots.at(-1).hydration, 73);
  assert.equal(snapshots.at(-1).load, 0.5);
});
