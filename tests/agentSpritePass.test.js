import test from "node:test";
import assert from "node:assert/strict";

import { createAgentSpritePass } from "../src/render/passes/agentSpritePass.js";

test("agent sprite pass skips renderer when visibility is disabled", () => {
  let renders = 0;
  const pass = createAgentSpritePass({
    isVisible: () => false,
    getAgentSpriteRenderSnapshot: () => {
      throw new Error("snapshot should not be requested while hidden");
    },
    agentSpriteRenderer: {
      render: () => {
        renders += 1;
      },
    },
  });

  pass.execute({});

  assert.equal(renders, 0);
});

test("agent sprite pass renders current snapshot when visible", () => {
  const calls = [];
  const snapshotCalls = [];
  const snapshot = { agents: [{ id: "player" }] };
  const frame = { showTerrain: true };
  const pass = createAgentSpritePass({
    isVisible: () => true,
    getAgentSpriteRenderSnapshot: (...args) => {
      snapshotCalls.push(args);
      return snapshot;
    },
    agentSpriteRenderer: {
      render: (...args) => calls.push(args),
    },
  });

  pass.execute(frame);

  assert.equal(calls.length, 1);
  assert.equal(snapshotCalls.length, 1);
  assert.equal(snapshotCalls[0][0], frame);
  assert.equal(calls[0][0], frame);
  assert.equal(calls[0][1], snapshot);
});
