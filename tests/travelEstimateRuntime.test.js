import test from "node:test";
import assert from "node:assert/strict";

import { estimateTravelPath } from "../src/gameplay/travelEstimateRuntime.js";

test("estimateTravelPath combines movement step cost and upkeep cost", () => {
  const estimate = estimateTravelPath({
    hoverPixel: { x: 2, y: 0 },
    pathPixels: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    computeMoveStepCost: () => 2,
    resolveActivityEffects: (key, context) => {
      if (key === "movement.step") {
        return {
          nutrition: -1 * context.movementCost,
          hydration: -2 * context.movementCost,
          fatigue: 0.5 * context.movementCost,
        };
      }
      if (key === "idle.tick") {
        return {
          nutrition: -0.1,
          hydration: -0.2,
          fatigue: 0,
        };
      }
      return {};
    },
    conditionModifiers: {
      movementCostMultiplier: 1.5,
    },
    condition: {
      nutrition: 10,
      hydration: 20,
      fatigue: 1,
    },
    getProjectedConditionWarnings: (projectedCondition) => [{
      label: `Projected hydration ${projectedCondition.hydration}`,
      severity: "warning",
    }],
    simTickHours: 0.25,
  });

  assert.equal(estimate.state, "ready");
  assert.equal(estimate.steps, 2);
  assert.equal(estimate.ticks, 4);
  assert.equal(estimate.durationHours, 1);
  assert.equal(estimate.projectedCondition.nutrition.toFixed(1), "3.6");
  assert.equal(estimate.projectedCondition.hydration.toFixed(1), "7.2");
  assert.equal(estimate.projectedCondition.fatigue, 4);
  assert.deepEqual(estimate.projectedWarnings.map((warning) => warning.label), ["Projected hydration 7.199999999999999"]);
  assert.deepEqual(estimate.effects, {
    nutrition: -6.4,
    hydration: -12.8,
    fatigue: 3,
  });
});

test("estimateTravelPath reports empty and unreachable planning states", () => {
  assert.equal(estimateTravelPath({}).state, "empty");
  assert.deepEqual(estimateTravelPath({
    hoverPixel: { x: 4, y: 5 },
    pathPixels: [],
  }), {
    state: "unreachable",
    reachable: false,
    destination: { x: 4, y: 5 },
    message: "No reachable path.",
  });
});
