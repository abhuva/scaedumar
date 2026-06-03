import test from "node:test";
import assert from "node:assert/strict";

import { createStructurePass } from "../src/render/passes/structurePass.js";

test("structure pass skips renderer when visibility is disabled", () => {
  let renderCalls = 0;
  const pass = createStructurePass({
    isVisible: () => false,
    getStructureRenderSnapshot: () => ({ structures: [{ id: "tent" }] }),
    structureRenderer: {
      render: () => {
        renderCalls += 1;
      },
    },
  });

  pass.execute({});

  assert.equal(renderCalls, 0);
});

test("structure pass renders current snapshot when visible", () => {
  let renderedSnapshot = null;
  const snapshot = { structures: [{ id: "tent" }] };
  const pass = createStructurePass({
    isVisible: () => true,
    getStructureRenderSnapshot: () => snapshot,
    structureRenderer: {
      render: (frame, nextSnapshot) => {
        renderedSnapshot = nextSnapshot;
      },
    },
  });

  pass.execute({});

  assert.equal(renderedSnapshot, snapshot);
});
