import test from "node:test";
import assert from "node:assert/strict";

import {
  getConditionWarningLevel,
  loadConditionThresholds,
  normalizeConditionThresholds,
} from "../src/gameplay/conditionThresholdRegistry.js";

test("normalizeConditionThresholds preserves lowBad and highBad semantics", () => {
  const thresholds = normalizeConditionThresholds({
    hydration: { direction: "lowBad", warning: 35, critical: 18 },
    fatigue: { direction: "highBad", warning: 65, critical: 82 },
  });

  assert.equal(getConditionWarningLevel(thresholds, "hydration", 20), "warning");
  assert.equal(getConditionWarningLevel(thresholds, "hydration", 10), "critical");
  assert.equal(getConditionWarningLevel(thresholds, "fatigue", 70), "warning");
  assert.equal(getConditionWarningLevel(thresholds, "fatigue", 90), "critical");
});

test("loadConditionThresholds fetches and normalizes threshold data", async () => {
  const thresholds = await loadConditionThresholds({
    url: "condition_thresholds.json",
    fetchFn: async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        load: {
          direction: "highBad",
          warning: 0.65,
          critical: 0.85,
          scale: 1,
        },
      }),
    }),
  });

  assert.equal(getConditionWarningLevel(thresholds, "load", 0.9), "critical");
});
