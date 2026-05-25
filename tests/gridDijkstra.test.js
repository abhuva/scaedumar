import test from "node:test";
import assert from "node:assert/strict";

import { buildGridDijkstraField } from "../src/core/gridDijkstra.js";

test("buildGridDijkstraField rejects non-finite source coordinates", () => {
  assert.equal(buildGridDijkstraField({ width: 3, height: 3, sourceX: NaN, sourceY: 0 }), null);
  assert.equal(buildGridDijkstraField({ width: 3, height: 3, sourceX: 0, sourceY: Infinity }), null);
});

test("buildGridDijkstraField skips negative step costs", () => {
  const field = buildGridDijkstraField({
    width: 2,
    height: 1,
    sourceX: 0,
    sourceY: 0,
    getStepCost: () => -1,
  });

  assert.ok(field);
  assert.equal(field.dist[0], 0);
  assert.equal(field.dist[1], Number.POSITIVE_INFINITY);
});
