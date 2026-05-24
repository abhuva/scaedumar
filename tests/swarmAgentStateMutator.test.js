import test from "node:test";
import assert from "node:assert/strict";

import { createSwarmAgentStateMutator } from "../src/gameplay/swarmAgentStateMutator.js";

function createRuntime() {
  const swarmState = {
    x: new Float32Array(0),
    y: new Float32Array(0),
    z: new Float32Array(0),
    vx: new Float32Array(0),
    vy: new Float32Array(0),
    vz: new Float32Array(0),
    agentId: new Uint32Array(0),
    nextAgentId: 1,
    speedScale: new Float32Array(0),
    steerScale: new Float32Array(0),
    isResting: new Uint8Array(0),
    restTicksLeft: new Uint16Array(0),
    ax: new Float32Array(0),
    ay: new Float32Array(0),
    az: new Float32Array(0),
    count: 0,
    hawks: [],
  };
  const follow = { targetType: "agent", agentIndex: -1 };
  const mutator = createSwarmAgentStateMutator({
    swarmState,
    invalidateSwarmInterpolation: () => {},
    getSwarmFollowSnapshot: () => follow,
    stopSwarmFollow: () => {
      follow.agentIndex = -1;
    },
    setSwarmFollowAgentIndex: (index) => {
      follow.agentIndex = index;
    },
    chooseRandomFollowAgentIndex: () => 0,
    getSwarmSettings: () => ({ hawkTargetRange: 100 }),
    chooseRandomSwarmTargetIndexNear: () => 0,
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    splatSize: { width: 100, height: 100 },
    isSwarmCoordFlyable: () => true,
    isWaterAtSwarmCoord: () => false,
    terrainFloorAtSwarmCoord: () => 0,
  });
  return { swarmState, mutator };
}

test("swarm agent ids are stable across remove-swap operations", () => {
  const { swarmState, mutator } = createRuntime();
  mutator.appendSwarmAgentState({ x: 1, y: 1, z: 1 });
  mutator.appendSwarmAgentState({ x: 2, y: 2, z: 2 });
  mutator.appendSwarmAgentState({ x: 3, y: 3, z: 3 });

  assert.deepEqual(Array.from(swarmState.agentId.subarray(0, swarmState.count)), [1, 2, 3]);
  assert.equal(mutator.removeSwarmAgentAtIndex(0), true);

  assert.equal(swarmState.count, 2);
  assert.deepEqual(Array.from(swarmState.agentId.subarray(0, swarmState.count)), [3, 2]);
  assert.equal(swarmState.x[0], 3);
});
