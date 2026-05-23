import test from "node:test";
import assert from "node:assert/strict";

import {
  applyConditionEffectModifiers,
  compareConditionEffectSnapshots,
  createConditionEffectRuntime,
  resolveConditionEffects,
} from "../src/gameplay/conditionEffectRuntime.js";

const conditionEffects = {
  thirsty: {
    id: "thirsty",
    category: "hydration",
    stat: "hydration",
    mode: "low",
    threshold: 30,
    priority: 10,
    label: "Thirsty",
    description: "Hydration is low.",
    modifiers: {
      fatigueGainMultiplier: 1.1,
    },
  },
  dehydrated: {
    id: "dehydrated",
    category: "hydration",
    stat: "hydration",
    mode: "low",
    threshold: 10,
    priority: 20,
    label: "Dehydrated",
    description: "Hydration is critically low.",
    modifiers: {
      fatigueGainMultiplier: 1.25,
    },
  },
  tired: {
    id: "tired",
    category: "fatigue",
    stat: "fatigue",
    mode: "high",
    threshold: 70,
    priority: 10,
    label: "Tired",
    modifiers: {
      movementCostMultiplier: 1.1,
    },
  },
};

test("resolveConditionEffects keeps only strongest active effect per category", () => {
  const snapshot = resolveConditionEffects(conditionEffects, {
    hydration: 5,
    fatigue: 80,
  });

  assert.deepEqual(snapshot.activeEffects.map((effect) => effect.id), ["dehydrated", "tired"]);
  assert.equal(snapshot.modifiers.fatigueGainMultiplier, 1.25);
  assert.equal(snapshot.modifiers.movementCostMultiplier, 1.1);
});

test("applyConditionEffectModifiers applies fatigue gain and recovery multipliers by sign", () => {
  assert.deepEqual(applyConditionEffectModifiers({
    nutrition: 0,
    hydration: 0,
    fatigue: 2,
  }, {
    fatigueGainMultiplier: 1.25,
    recoveryMultiplier: 0.7,
  }), {
    nutrition: 0,
    hydration: 0,
    fatigue: 2.5,
  });

  assert.deepEqual(applyConditionEffectModifiers({
    nutrition: 0,
    hydration: 0,
    fatigue: -2,
  }, {
    fatigueGainMultiplier: 1.25,
    recoveryMultiplier: 0.7,
  }), {
    nutrition: 0,
    hydration: 0,
    fatigue: -1.4,
  });
});

test("condition effect runtime emits transition status after initialization", () => {
  let condition = {
    hydration: 40,
    fatigue: 0,
  };
  const statuses = [];
  const runtime = createConditionEffectRuntime({
    conditionEffects,
    getConditionSnapshot: () => condition,
    setStatus: (message) => statuses.push(message),
  });

  condition = {
    hydration: 20,
    fatigue: 0,
  };
  runtime.sync();

  assert.equal(statuses.length, 1);
  assert.equal(statuses[0], "Thirsty: Hydration is low.");
});

test("compareConditionEffectSnapshots reports new and worsened projected effects", () => {
  const current = resolveConditionEffects(conditionEffects, {
    hydration: 20,
    fatigue: 0,
  });
  const projected = resolveConditionEffects(conditionEffects, {
    hydration: 5,
    fatigue: 80,
  });

  assert.deepEqual(compareConditionEffectSnapshots(current.activeEffects, projected.activeEffects).map((warning) => warning.label), [
    "Thirsty will worsen to Dehydrated",
    "Will become Tired",
  ]);
});
