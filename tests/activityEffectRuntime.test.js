import test from "node:test";
import assert from "node:assert/strict";

import { createActivityEffectRuntime, resolveActivityEffects } from "../src/gameplay/activityEffectRuntime.js";

const COSTS = {
  "movement.step": {
    effects: {
      nutrition: -1,
      hydration: -2,
      fatigue: 3,
    },
    scales: {
      movementCost: {
        weight: 1,
        baseline: 1,
      },
      load: {
        weight: 0.5,
        baseline: 0,
      },
    },
    multiplier: {
      min: 0.25,
      max: 4,
    },
  },
};

test("resolveActivityEffects scales movement cost and load", () => {
  const effects = resolveActivityEffects(COSTS, "movement.step", {
    movementCost: 2,
    load: 0.5,
  });

  assert.deepEqual(effects, {
    nutrition: -2.25,
    hydration: -4.5,
    fatigue: 6.75,
  });
});

test("activity effect runtime applies resolved effects through dependency", () => {
  const applied = [];
  const runtime = createActivityEffectRuntime({
    activityCosts: COSTS,
    applyConditionEffects: (effects) => applied.push(effects),
  });

  const effects = runtime.apply("movement.step", {
    movementCost: 1,
    load: 0,
  });

  assert.deepEqual(effects, {
    nutrition: -1,
    hydration: -2,
    fatigue: 3,
  });
  assert.deepEqual(applied, [effects]);
});

test("activity effect runtime can batch repeated effects with effectScale", () => {
  const runtime = createActivityEffectRuntime({
    activityCosts: COSTS,
  });

  assert.deepEqual(runtime.resolve("movement.step", {
    movementCost: 1,
    load: 0,
    effectScale: 3,
  }), {
    nutrition: -3,
    hydration: -6,
    fatigue: 9,
  });
});
