import test from "node:test";
import assert from "node:assert/strict";

import { extractGridPath } from "../src/core/gridPathExtraction.js";

function createField() {
  return {
    width: 3,
    height: 3,
    dist: new Float64Array([
      0, 1, 2,
      1, 2, 3,
      2, 3, 4,
    ]),
    parent: new Int32Array([
      -1, 0, 1,
      0, 0, 4,
      3, 4, 4,
    ]),
  };
}

test("extractGridPath follows parent chain", () => {
  const path = extractGridPath({
    field: createField(),
    sourceX: 0,
    sourceY: 0,
    targetX: 2,
    targetY: 2,
  });

  assert.deepEqual(path, [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]);
});
