import test from "node:test";
import assert from "node:assert/strict";

import { createRenderer } from "../src/render/renderer.js";

function createTestRenderer() {
  return createRenderer({
    gl: { getExtension: () => null },
    resources: {
      hasDrawableSurface: () => true,
      setViewport: () => {},
    },
  });
}

test("terrain frame executes structures before agent sprites", () => {
  const renderer = createTestRenderer();
  const order = [];
  for (const id of ["shadow", "shadowBlur", "mainTerrain", "structures", "agentSprites", "backgroundClear"]) {
    renderer.registerPass(id, {
      execute: () => order.push(id),
    });
  }

  renderer.renderTerrainFrame({ showTerrain: true });

  assert.deepEqual(order, ["shadow", "shadowBlur", "mainTerrain", "structures", "agentSprites"]);
});

test("terrain frame can render without optional sprite passes", () => {
  const renderer = createTestRenderer();
  const order = [];
  for (const id of ["shadow", "shadowBlur", "mainTerrain", "backgroundClear"]) {
    renderer.registerPass(id, {
      execute: () => order.push(id),
    });
  }

  renderer.renderTerrainFrame({ showTerrain: true });

  assert.deepEqual(order, ["shadow", "shadowBlur", "mainTerrain"]);
});
