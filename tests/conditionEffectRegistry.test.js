import test from "node:test";
import assert from "node:assert/strict";

import { loadConditionEffects, normalizeConditionEffects } from "../src/gameplay/conditionEffectRegistry.js";

test("normalizeConditionEffects converts condition effect JSON into resolver definitions", () => {
  const effects = normalizeConditionEffects({
    thirsty: {
      stat: "hydration",
      mode: "low",
      threshold: "30",
      priority: "10",
      label: "Thirsty",
      icon: "H2O",
      effectsText: ["Fatigue gain +10%."],
      modifiers: {
        fatigueGainMultiplier: "1.1",
      },
    },
  });

  assert.equal(effects.thirsty.stat, "hydration");
  assert.equal(effects.thirsty.threshold, 30);
  assert.equal(effects.thirsty.modifiers.fatigueGainMultiplier, 1.1);
});

test("loadConditionEffects fetches and normalizes condition effect data", async () => {
  const effects = await loadConditionEffects({
    url: "condition_effects.json",
    fetchFn: async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        tired: {
          stat: "fatigue",
          mode: "high",
          threshold: 70,
          modifiers: {
            movementCostMultiplier: 1.1,
          },
        },
      }),
    }),
  });

  assert.equal(effects.tired.mode, "high");
  assert.equal(effects.tired.modifiers.movementCostMultiplier, 1.1);
});
