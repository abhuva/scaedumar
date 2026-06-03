import test from "node:test";
import assert from "node:assert/strict";

import { renderFrameSwarmLayers } from "../src/render/frameSwarmRenderRuntime.js";
import { buildFrameRenderState } from "../src/render/frameRenderState.js";

function createDeps(overrides = {}) {
  const calls = {
    terrain: 0,
    lit: 0,
  };
  return {
    calls,
    getSwarmSettings: () => ({
      useAgentSwarm: true,
      showTerrainInSwarm: true,
      useLitSwarm: true,
      backgroundColor: "#000000",
    }),
    buildFrameRenderState,
    coreState: {},
    nowMs: 1000,
    dtSec: 1 / 60,
    cycleState: { hour: 12 },
    cycleSpeed: 1,
    smoothCloudTimeSec: 1,
    currentMapFolderPath: "assets/map3",
    splatSize: { width: 1024, height: 1024 },
    lightingParams: {},
    uniformInput: {},
    hexToRgb01: () => [0, 0, 0],
    renderer: {
      renderTerrainFrame: () => {
        calls.terrain += 1;
      },
    },
    renderSwarmLit: () => {
      calls.lit += 1;
    },
    now: () => 1,
    ...overrides,
  };
}

test("swarm sprite mode suppresses legacy lit square render pass", () => {
  const deps = createDeps({
    isSwarmSpriteRenderMode: () => true,
  });

  const frameState = renderFrameSwarmLayers(deps);

  assert.equal(deps.calls.terrain, 1);
  assert.equal(deps.calls.lit, 0);
  assert.equal(frameState.swarm.litEnabled, false);
});

test("legacy lit swarm renders when sprite mode is disabled", () => {
  const deps = createDeps({
    isSwarmSpriteRenderMode: () => false,
  });

  const frameState = renderFrameSwarmLayers(deps);

  assert.equal(deps.calls.terrain, 1);
  assert.equal(deps.calls.lit, 1);
  assert.equal(frameState.swarm.litEnabled, true);
});
