import assert from "node:assert/strict";
import test from "node:test";
import { createTravelPlanningRuntime } from "../src/gameplay/travelPlanningRuntime.js";

function createState() {
  return {
    hoverPixel: null,
    pathPixels: [],
    rangeOriginPixel: null,
    rangeRadius: 0,
    committedTargetPixel: null,
    committedPathPixels: [],
    committedRangeOriginPixel: null,
    committedRangeRadius: 0,
  };
}

test("travel planning runtime owns preview range and hover path state", () => {
  const events = [];
  const state = createState();
  const runtime = createTravelPlanningRuntime({
    state,
    onChange: (payload) => events.push(payload.reason),
  });

  runtime.startPathfinding({ x: 10, y: 12 }, { range: 80 }, "start");
  assert.deepEqual(state.rangeOriginPixel, { x: 10, y: 12 });
  assert.equal(state.rangeRadius, 40);

  runtime.setHoverPath({ x: 15, y: 16 }, [{ x: 10, y: 12 }, { x: 15, y: 16 }], "hover");
  assert.deepEqual(state.hoverPixel, { x: 15, y: 16 });
  assert.equal(state.pathPixels.length, 2);
  assert.deepEqual(events, ["start", "hover"]);
});

test("travel planning runtime commits current path without sharing mutable path arrays", () => {
  const state = createState();
  const runtime = createTravelPlanningRuntime({ state });
  const path = [{ x: 1, y: 1 }, { x: 2, y: 2 }];

  runtime.setRange({ x: 1, y: 1 }, 25, "range", { emit: false });
  runtime.setHoverPath({ x: 2, y: 2 }, path, "hover", { emit: false });
  runtime.commitCurrentPath({ x: 2, y: 2 }, { x: 9, y: 9 }, "commit", { emit: false });
  path[1].x = 99;

  assert.deepEqual(state.committedTargetPixel, { x: 2, y: 2 });
  assert.deepEqual(state.committedPathPixels, [{ x: 1, y: 1 }, { x: 2, y: 2 }]);
  assert.deepEqual(state.committedRangeOriginPixel, { x: 1, y: 1 });
  assert.equal(state.committedRangeRadius, 25);
});

test("travel planning runtime clears preview and committed state separately", () => {
  const state = createState();
  const runtime = createTravelPlanningRuntime({ state });
  runtime.startPathfinding({ x: 1, y: 1 }, { range: 20 }, "start", { emit: false });
  runtime.setHoverPath({ x: 2, y: 2 }, [{ x: 1, y: 1 }, { x: 2, y: 2 }], "hover", { emit: false });
  runtime.commitCurrentPath({ x: 2, y: 2 }, { x: 1, y: 1 }, "commit", { emit: false });

  runtime.clearPreview("preview", { emit: false });
  assert.equal(state.hoverPixel, null);
  assert.deepEqual(state.pathPixels, []);
  assert.equal(state.committedTargetPixel.x, 2);

  runtime.clearCommitted("committed", { emit: false });
  assert.equal(state.committedTargetPixel, null);
  assert.deepEqual(state.committedPathPixels, []);
});

test("travel planning runtime advances committed path along original route", () => {
  const state = createState();
  const runtime = createTravelPlanningRuntime({ state });
  runtime.setRange({ x: 1, y: 1 }, 25, "range", { emit: false });
  runtime.setHoverPath({ x: 4, y: 4 }, [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 2 },
    { x: 4, y: 4 },
  ], "hover", { emit: false });
  runtime.commitCurrentPath({ x: 4, y: 4 }, { x: 1, y: 1 }, "commit", { emit: false });

  assert.equal(runtime.advanceCommittedPathToPixel({ x: 3, y: 2 }, "progress", { emit: false }), true);
  assert.deepEqual(state.committedPathPixels, [
    { x: 3, y: 2 },
    { x: 4, y: 4 },
  ]);

  assert.equal(runtime.advanceCommittedPathToPixel({ x: 9, y: 9 }, "progress", { emit: false }), false);
  assert.deepEqual(state.committedPathPixels, [
    { x: 3, y: 2 },
    { x: 4, y: 4 },
  ]);
});

test("travel planning runtime snapshots are isolated from runtime state", () => {
  const state = createState();
  const runtime = createTravelPlanningRuntime({ state });
  runtime.setRange({ x: 4, y: 5 }, 12, "range", { emit: false });
  runtime.setHoverPath({ x: 6, y: 7 }, [{ x: 4, y: 5 }, { x: 6, y: 7 }], "hover", { emit: false });

  const snapshot = runtime.getSnapshot();
  snapshot.hoverPixel.x = 99;
  snapshot.pathPixels[0].x = 88;
  snapshot.rangeOriginPixel.x = 77;

  assert.deepEqual(state.hoverPixel, { x: 6, y: 7 });
  assert.deepEqual(state.pathPixels[0], { x: 4, y: 5 });
  assert.deepEqual(state.rangeOriginPixel, { x: 4, y: 5 });
});

test("travel planning runtime exposes hover/path queries for pathfinding preview", () => {
  const runtime = createTravelPlanningRuntime({ state: createState() });

  assert.equal(runtime.hasHoverPath(), false);
  assert.equal(runtime.isHoverPixel({ x: 1, y: 1 }), false);
  assert.equal(runtime.getHoverPixel(), null);
  assert.deepEqual(runtime.getPathPixels(), []);

  runtime.setHoverPath({ x: 3, y: 4 }, [{ x: 1, y: 1 }, { x: 3, y: 4 }], "hover", { emit: false });

  assert.equal(runtime.hasHoverPath(), true);
  assert.equal(runtime.isHoverPixel({ x: 3, y: 4 }), true);
  assert.deepEqual(runtime.getHoverPixel(), { x: 3, y: 4 });
  assert.deepEqual(runtime.getPathPixels(), [{ x: 1, y: 1 }, { x: 3, y: 4 }]);
});
