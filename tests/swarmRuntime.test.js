import test from "node:test";
import assert from "node:assert/strict";

import { createSwarmRuntime } from "../src/gameplay/swarmRuntime.js";

test("swarmRuntime exposes direct sync ownership after wrapper removal", () => {
  const calls = [];
  const store = {
    state: {
      gameplay: {
        swarm: {
          settings: { enabled: true },
          runtime: {},
          follow: {},
        },
      },
    },
    update(fn) {
      this.state = fn(this.state);
      calls.push("update");
    },
    getState() {
      return this.state;
    },
  };

  const swarmState = { agents: [{ id: 1 }], hawks: [] };
  const swarmFollowState = {
    enabled: false,
    targetType: "agent",
    agentIndex: -1,
    hawkIndex: -1,
  };

  const runtime = createSwarmRuntime({
    store,
    isSwarmEnabled: () => true,
    getSwarmSettings: () => ({ enabled: true }),
    swarmState,
    swarmFollowState,
    getSwarmFollowSnapshot: () => ({
      enabled: swarmFollowState.enabled,
      targetType: swarmFollowState.targetType,
      agentIndex: swarmFollowState.agentIndex,
      hawkIndex: swarmFollowState.hawkIndex,
    }),
    setSwarmFollowEnabled: (value) => {
      swarmFollowState.enabled = value;
    },
    setSwarmFollowTargetType: (value) => {
      swarmFollowState.targetType = value;
    },
    setSwarmFollowAgentIndex: (value) => {
      swarmFollowState.agentIndex = value;
    },
    setSwarmFollowHawkIndex: (value) => {
      swarmFollowState.hawkIndex = value;
    },
    swarmFollowTargetInput: { value: "agent" },
    resetSwarmFollowSpeedSmoothing: () => {
      calls.push("reset");
    },
    updateSwarmFollowButtonUi: () => {
      calls.push("button");
    },
  });

  runtime.syncSwarmFollowToStore();
  runtime.syncSwarmRuntimeStateToStore();
  runtime.syncSwarmStateToStore();
  runtime.applySwarmFollowState({ enabled: true, targetType: "hawk", hawkIndex: 2 });
  runtime.stopSwarmFollow();

  assert.equal(swarmFollowState.enabled, false);
  assert.equal(swarmFollowState.targetType, "hawk");
  assert.equal(swarmFollowState.hawkIndex, -1);
  assert.ok(calls.includes("update"));
  assert.ok(calls.includes("reset"));
  assert.ok(calls.includes("button"));
});
