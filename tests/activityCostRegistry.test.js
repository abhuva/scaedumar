import test from "node:test";
import assert from "node:assert/strict";

import { loadActivityCosts, normalizeActivityCosts } from "../src/gameplay/activityCostRegistry.js";

test("normalizeActivityCosts converts cost JSON into numeric definitions", () => {
  const costs = normalizeActivityCosts({
    "movement.step": {
      effects: {
        nutrition: "-0.01",
        hydration: -0.02,
        fatigue: 0.03,
      },
      scales: {
        load: {
          weight: "0.5",
          baseline: 0,
        },
      },
    },
  });

  assert.equal(costs["movement.step"].effects.nutrition, -0.01);
  assert.equal(costs["movement.step"].scales.load.weight, 0.5);
  assert.deepEqual(costs["movement.step"].multiplier, { min: 0.25, max: 4 });
});

test("loadActivityCosts fetches and normalizes cost data", async () => {
  const costs = await loadActivityCosts({
    url: "activity_costs.json",
    fetchFn: async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        "gathering.search": {
          effects: {
            fatigue: 0.012,
          },
        },
      }),
    }),
  });

  assert.equal(costs["gathering.search"].effects.fatigue, 0.012);
});

test("normalizeActivityCosts supports idle upkeep costs", () => {
  const costs = normalizeActivityCosts({
    "idle.tick": {
      effects: {
        nutrition: -0.004,
        hydration: -0.006,
      },
    },
  });

  assert.equal(costs["idle.tick"].effects.nutrition, -0.004);
  assert.equal(costs["idle.tick"].effects.hydration, -0.006);
});
