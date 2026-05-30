import test from "node:test";
import assert from "node:assert/strict";

import { createSwarmFollowCameraUpdater } from "../src/gameplay/swarmFollowCamera.js";

function createHarness(overrides = {}) {
  const commands = [];
  const swarmState = {
    count: 1,
    x: new Float32Array([0]),
    y: new Float32Array([0]),
    z: new Float32Array([0]),
    vx: new Float32Array([0]),
    vy: new Float32Array([0]),
    agentId: new Uint32Array([11]),
    hawks: [],
  };
  let zoom = 2;
  const settings = {
    useHawk: false,
    followZoomIn: 4,
    followZoomOut: 1,
    followAgentZoomSmoothing: 0.5,
    followCameraPositionSmoothing: 0.5,
    maxSpeed: 100,
    hawkSpeed: 100,
    ...overrides.settings,
  };
  const updater = createSwarmFollowCameraUpdater({
    swarmState,
    isSwarmEnabled: () => true,
    stopSwarmFollow: () => commands.push({ type: "stop" }),
    getSwarmSettings: () => settings,
    chooseRandomFollowHawkIndex: () => -1,
    chooseRandomFollowAgentIndex: () => 0,
    writeInterpolatedSwarmHawkPos: () => ({ x: 0, y: 0, z: 0 }),
    writeInterpolatedSwarmAgentPos: (index, out) => {
      out.x = swarmState.x[index];
      out.y = swarmState.y[index];
      out.z = swarmState.z[index];
      return out;
    },
    swarmFollowHawkScratch: {},
    swarmFollowAgentScratch: {},
    mapCoordToWorld: (x, y) => ({ x, y }),
    clamp: (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0)),
    getZoomMin: () => 0.5,
    getZoomMax: () => 8,
    getZoom: () => zoom,
    dispatchCoreCommand: (command) => {
      commands.push(command);
      if (Number.isFinite(Number(command.zoom))) zoom = Number(command.zoom);
    },
    getSwarmFollowSnapshot: () => ({
      enabled: true,
      targetType: "agent",
      agentIndex: 0,
      hawkIndex: -1,
    }),
    setSwarmFollowAgentIndex: () => {},
    setSwarmFollowHawkIndex: () => {},
  });
  return { updater, commands, swarmState, settings };
}

test("swarm follow camera snaps to the first target position", () => {
  const { updater, commands, swarmState } = createHarness();

  swarmState.x[0] = 100;
  swarmState.y[0] = 50;
  updater(0);

  assert.equal(commands.at(-1).panX, 100);
  assert.equal(commands.at(-1).panY, 50);
});

test("swarm follow camera rubberbands position by gain", () => {
  const { updater, commands, swarmState } = createHarness();

  updater(0);
  swarmState.x[0] = 100;
  swarmState.y[0] = 40;
  updater(1000 / 60);

  assert.equal(commands.at(-1).panX, 50);
  assert.equal(commands.at(-1).panY, 20);
});

test("swarm follow camera maps speed to zoom with zoom gain", () => {
  const { updater, commands, swarmState, settings } = createHarness();

  swarmState.vx[0] = settings.maxSpeed;
  updater(0);

  assert.equal(commands.at(-1).zoom, 1.5);
});
