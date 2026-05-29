import assert from "node:assert/strict";
import test from "node:test";

import { createConditionEventTriggerRuntime } from "../src/gameplay/conditionEventTriggerRuntime.js";

test("condition event trigger fires hydration warning when crossing down through threshold", () => {
  const triggered = [];
  let condition = { hydration: 70, fatigue: 5 };
  const runtime = createConditionEventTriggerRuntime({
    getConditionSnapshot: () => condition,
    triggerEvent: (type, payload) => triggered.push({ type, payload }),
    hydrationThreshold: 50,
    fatigueThreshold: 50,
  });

  assert.deepEqual(runtime.sync("initial"), []);
  condition = { hydration: 51, fatigue: 5 };
  assert.deepEqual(runtime.sync("safe"), []);
  condition = { hydration: 50, fatigue: 5 };
  assert.deepEqual(runtime.sync("drop"), ["condition_hydration_low"]);

  assert.equal(triggered.length, 1);
  assert.equal(triggered[0].type, "condition_hydration_low");
  assert.equal(triggered[0].payload.strength, 50);
  assert.equal(triggered[0].payload.previous, 51);
});

test("condition event trigger fires fatigue warning when crossing up through threshold", () => {
  const triggered = [];
  let condition = { hydration: 70, fatigue: 5 };
  const runtime = createConditionEventTriggerRuntime({
    getConditionSnapshot: () => condition,
    triggerEvent: (type, payload) => triggered.push({ type, payload }),
  });

  runtime.sync("initial");
  condition = { hydration: 70, fatigue: 49 };
  assert.deepEqual(runtime.sync("safe"), []);
  condition = { hydration: 70, fatigue: 50 };
  assert.deepEqual(runtime.sync("rise"), ["condition_fatigue_high"]);

  assert.equal(triggered.length, 1);
  assert.equal(triggered[0].type, "condition_fatigue_high");
  assert.equal(triggered[0].payload.strength, 50);
  assert.equal(triggered[0].payload.previous, 49);
});

test("condition event trigger does not fire repeatedly while condition remains beyond threshold", () => {
  const triggered = [];
  let condition = { hydration: 51, fatigue: 49 };
  const runtime = createConditionEventTriggerRuntime({
    getConditionSnapshot: () => condition,
    triggerEvent: (type) => triggered.push(type),
  });

  runtime.sync("initial");
  condition = { hydration: 50, fatigue: 50 };
  assert.deepEqual(runtime.sync("cross"), ["condition_hydration_low", "condition_fatigue_high"]);
  condition = { hydration: 40, fatigue: 80 };
  assert.deepEqual(runtime.sync("worse"), []);
  assert.deepEqual(triggered, ["condition_hydration_low", "condition_fatigue_high"]);
});
