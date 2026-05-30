import test from "node:test";
import assert from "node:assert/strict";

import { createSwarmInterpolation } from "../src/gameplay/swarmInterpolation.js";

function createHarness() {
  const swarmState = {
    count: 1,
    x: new Float32Array([0]),
    y: new Float32Array([0]),
    z: new Float32Array([0]),
    agentId: new Int32Array([101]),
    hawks: [],
  };
  const swarmRenderState = {
    prevX: new Float32Array(0),
    prevY: new Float32Array(0),
    prevZ: new Float32Array(0),
    prevAgentId: new Int32Array(0),
    prevHawkX: new Float32Array(0),
    prevHawkY: new Float32Array(0),
    prevHawkZ: new Float32Array(0),
    alpha: 0,
    hasPrev: false,
  };
  const interpolation = createSwarmInterpolation({
    swarmState,
    swarmRenderState,
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
  });
  return { interpolation, swarmState, swarmRenderState };
}

test("swarm interpolation returns authoritative position before a previous segment exists", () => {
  const { interpolation, swarmState } = createHarness();
  const out = {};

  swarmState.x[0] = 10;
  swarmState.y[0] = 20;
  swarmState.z[0] = 5;

  assert.deepEqual(interpolation.writeInterpolatedAgentPos(0, out), { x: 10, y: 20, z: 5 });
});

test("swarm interpolation renders one completed segment behind by alpha", () => {
  const { interpolation, swarmState, swarmRenderState } = createHarness();
  const out = {};

  interpolation.capturePreviousState();
  swarmState.x[0] = 40;
  swarmRenderState.alpha = 0.5;

  interpolation.writeInterpolatedAgentPos(0, out);
  assert.deepEqual(out, { x: 20, y: 0, z: 0 });
});

test("swarm interpolation reaches the segment target at alpha one", () => {
  const { interpolation, swarmState, swarmRenderState } = createHarness();
  const out = {};

  interpolation.capturePreviousState();
  swarmState.x[0] = 40;
  swarmRenderState.alpha = 1;

  interpolation.writeInterpolatedAgentPos(0, out);
  assert.deepEqual(out, { x: 40, y: 0, z: 0 });
});

test("swarm interpolation clamps alpha", () => {
  const { interpolation, swarmState, swarmRenderState } = createHarness();
  const out = {};

  interpolation.capturePreviousState();
  swarmState.x[0] = 40;
  swarmRenderState.alpha = 2;

  interpolation.writeInterpolatedAgentPos(0, out);
  assert.equal(out.x, 40);
});

test("swarm interpolation does not advance on repeated reads", () => {
  const { interpolation, swarmState, swarmRenderState } = createHarness();
  const out = {};

  interpolation.capturePreviousState();
  swarmState.x[0] = 40;
  swarmRenderState.alpha = 0.25;

  interpolation.writeInterpolatedAgentPos(0, out);
  const firstRead = out.x;
  interpolation.writeInterpolatedAgentPos(0, out);

  assert.equal(firstRead, 10);
  assert.equal(out.x, firstRead);
});

test("swarm interpolation snaps when agent id changes", () => {
  const { interpolation, swarmState, swarmRenderState } = createHarness();
  const out = {};

  interpolation.capturePreviousState();
  swarmState.x[0] = 40;
  swarmState.y[0] = 10;
  swarmState.z[0] = 3;
  swarmState.agentId[0] = 202;
  swarmRenderState.alpha = 0.5;

  assert.deepEqual(interpolation.writeInterpolatedAgentPos(0, out), { x: 40, y: 10, z: 3 });
});

test("swarm interpolation renders hawk segment by alpha", () => {
  const { interpolation, swarmState, swarmRenderState } = createHarness();
  const out = {};

  swarmState.hawks.push({ x: 0, y: 0, z: 0 });
  interpolation.capturePreviousState();
  swarmState.hawks[0].x = 40;
  swarmRenderState.alpha = 0.5;

  interpolation.writeInterpolatedHawkPos(0, out);
  assert.deepEqual(out, { x: 20, y: 0, z: 0 });
});

test("swarm interpolation captures latest segment when called repeatedly", () => {
  const { interpolation, swarmState, swarmRenderState } = createHarness();
  const out = {};

  interpolation.capturePreviousState();
  swarmState.x[0] = 40;
  interpolation.capturePreviousState();
  swarmState.x[0] = 60;
  swarmRenderState.alpha = 0.5;

  interpolation.writeInterpolatedAgentPos(0, out);
  assert.deepEqual(out, { x: 50, y: 0, z: 0 });
});
