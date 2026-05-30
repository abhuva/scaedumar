import test from "node:test";
import assert from "node:assert/strict";

import { createScoutCameraSmoothingRuntime } from "../src/gameplay/scoutCameraSmoothingRuntime.js";

test("scout camera smoothing snaps to first target", () => {
  const runtime = createScoutCameraSmoothingRuntime();

  const result = runtime.updateTarget({
    agentId: 10,
    x: 100,
    y: 200,
    nowMs: 0,
    settings: { positionSmoothing: 0.25 },
  });

  assert.deepEqual(result, { x: 100, y: 200, snapped: true });
});

test("scout camera smoothing interpolates repeated target updates", () => {
  const runtime = createScoutCameraSmoothingRuntime();

  runtime.updateTarget({
    agentId: 10,
    x: 0,
    y: 0,
    nowMs: 0,
    settings: { positionSmoothing: 0.5 },
  });
  const result = runtime.updateTarget({
    agentId: 10,
    x: 100,
    y: 50,
    nowMs: 1000 / 60,
    settings: { positionSmoothing: 0.5 },
  });

  assert.equal(result.snapped, false);
  assert.equal(result.x, 50);
  assert.equal(result.y, 25);
});

test("scout camera smoothing snaps when followed agent changes", () => {
  const runtime = createScoutCameraSmoothingRuntime();

  runtime.updateTarget({ agentId: 10, x: 0, y: 0, nowMs: 0 });
  const result = runtime.updateTarget({
    agentId: 11,
    x: 100,
    y: 50,
    nowMs: 1000 / 60,
    settings: { positionSmoothing: 0.1 },
  });

  assert.deepEqual(result, { x: 100, y: 50, snapped: true });
});

test("scout camera smoothing reset forces next target to snap", () => {
  const runtime = createScoutCameraSmoothingRuntime();

  runtime.updateTarget({ agentId: 10, x: 0, y: 0, nowMs: 0 });
  runtime.updateTarget({
    agentId: 10,
    x: 100,
    y: 0,
    nowMs: 1000 / 60,
    settings: { positionSmoothing: 0.5 },
  });
  runtime.reset();

  const result = runtime.updateTarget({
    agentId: 10,
    x: 200,
    y: 10,
    nowMs: 2000 / 60,
    settings: { positionSmoothing: 0.5 },
  });

  assert.deepEqual(result, { x: 200, y: 10, snapped: true });
});
