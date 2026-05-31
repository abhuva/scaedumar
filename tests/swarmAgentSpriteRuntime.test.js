import test from "node:test";
import assert from "node:assert/strict";

import { createSwarmAgentSpriteRuntime } from "../src/gameplay/swarmAgentSpriteRuntime.js";

const BIRD_DEFINITION = Object.freeze({
  id: "bird",
  spriteSlot: 4,
  spriteSrc: "assets/sprites/agents/default/bird.png",
  slotWidth: 32,
  slotHeight: 32,
  visualWidthPx: 1,
  visualHeightPx: 1,
  pivotX: 0.5,
  pivotY: 0.5,
  directionCount: 1,
  rotateToVelocity: true,
  sourceForwardRadians: -Math.PI / 2,
  frameCount: 6,
  animationFps: 10,
  animationMode: "renderTime",
  animationPhase: "stableId",
  transparentColor: "#ffffff",
  transparentColorTolerance: 0,
  minHeight: 0,
  maxHeight: 100,
  baseScale: 1,
  maxHeightScale: 1.5,
  layer: "flying",
});

const HAWK_DEFINITION = Object.freeze({
  id: "hawk",
  spriteSlot: 12,
  spriteSrc: "assets/sprites/agents/default/hawk.png",
  slotWidth: 32,
  slotHeight: 32,
  visualWidthPx: 1.25,
  visualHeightPx: 1.25,
  pivotX: 0.5,
  pivotY: 0.5,
  directionCount: 1,
  rotateToVelocity: true,
  sourceForwardRadians: -Math.PI / 2,
  frameCount: 1,
  animationFps: 0,
  animationMode: "none",
  animationPhase: "none",
  minHeight: 0,
  maxHeight: 100,
  baseScale: 1,
  maxHeightScale: 1.6,
  layer: "flying",
});

function withSpriteDefinitions(deps = {}) {
  return {
    birdDefinition: BIRD_DEFINITION,
    hawkDefinition: HAWK_DEFINITION,
    ...deps,
    birdDefinition: {
      ...BIRD_DEFINITION,
      ...(deps.birdDefinition || {}),
    },
    hawkDefinition: {
      ...HAWK_DEFINITION,
      ...(deps.hawkDefinition || {}),
    },
  };
}

function createSwarmState() {
  return {
    count: 2,
    stepCount: 12,
    agentId: new Int32Array([101, 202]),
    x: new Float32Array([10, 20]),
    y: new Float32Array([30, 40]),
    z: new Float32Array([0, 100]),
    vx: new Float32Array([1, 0]),
    vy: new Float32Array([0, 1]),
    hawks: [
      { x: 50, y: 60, z: 100, vx: -1, vy: 0 },
    ],
  };
}

test("swarm agent sprite snapshot uses interpolated bird positions", () => {
  const swarmState = createSwarmState();
  const runtime = createSwarmAgentSpriteRuntime(withSpriteDefinitions({
    swarmState,
    birdDefinition: {
      animationPhase: "none",
    },
    writeInterpolatedSwarmAgentPos: (index, out) => {
      out.x = 100 + index;
      out.y = 200 + index;
      out.z = index === 0 ? 0 : 100;
      return out;
    },
  }));

  const snapshot = runtime.getSwarmAgentSpriteRenderSnapshot({ includeHawks: false, renderTimeSec: 0 });

  assert.equal(snapshot.version, 12);
  assert.equal(snapshot.agents.length, 2);
  assert.equal(snapshot.agents[0].id, "bird_101");
  assert.equal(snapshot.agents[0].pixelX, 99.5);
  assert.equal(snapshot.agents[0].pixelY, 199.5);
  assert.equal(snapshot.atlas.slotWidth, 32);
  assert.equal(snapshot.atlas.slotHeight, 32);
  assert.equal(snapshot.agents[0].spriteSlot, 4);
  assert.equal(snapshot.agents[0].sourceSlotWidth, 32);
  assert.equal(snapshot.agents[0].sourceSlotHeight, 32);
  assert.equal(snapshot.agents[0].sourceFrameCount, 6);
  assert.equal(snapshot.agents[0].sourceFrameIndex, 0);
  assert.equal(snapshot.agents[0].transparentColor, "#ffffff");
  assert.equal(snapshot.agents[0].transparentColorTolerance, 0);
  assert.equal(snapshot.agents[0].rotationRadians, Math.PI / 2);
  assert.equal(snapshot.agents[0].heightScale, 1);
  assert.equal(snapshot.agents[1].id, "bird_202");
  assert.equal(snapshot.agents[1].rotationRadians, Math.PI);
  assert.equal(snapshot.agents[1].heightScale, 1.5);
});

test("swarm agent sprite snapshot uses interpolated hawk positions", () => {
  const swarmState = createSwarmState();
  const runtime = createSwarmAgentSpriteRuntime(withSpriteDefinitions({
    swarmState,
    writeInterpolatedSwarmHawkPos: (_index, out) => {
      out.x = 70;
      out.y = 80;
      out.z = 100;
      return out;
    },
  }));

  const snapshot = runtime.getSwarmAgentSpriteRenderSnapshot({ includeBirds: false });

  assert.equal(snapshot.agents.length, 1);
  assert.equal(snapshot.agents[0].id, "hawk_1");
  assert.equal(snapshot.agents[0].spriteId, "hawk");
  assert.equal(snapshot.agents[0].layer, "flying");
  assert.equal(snapshot.agents[0].directionIndex, 0);
  assert.equal(snapshot.agents[0].rotationRadians, (Math.PI * 3) / 2);
  assert.equal(snapshot.agents[0].heightScale, 1.6);
});

test("swarm bird animation frame count is data-driven", () => {
  const swarmState = createSwarmState();
  const runtime = createSwarmAgentSpriteRuntime(withSpriteDefinitions({
    swarmState,
    birdDefinition: {
      frameCount: 3,
      animationFps: 2,
      animationPhase: "none",
    },
  }));

  const snapshot = runtime.getSwarmAgentSpriteRenderSnapshot({ includeHawks: false, renderTimeSec: 1.4 });

  assert.equal(snapshot.agents[0].spriteSlot, 6);
  assert.equal(snapshot.agents[0].sourceFrameCount, 3);
  assert.equal(snapshot.agents[0].sourceFrameIndex, 2);
  assert.equal(snapshot.agents[0].animationFrameIndex, 2);
});

test("swarm bird animation expands atlas rows for large frame counts", () => {
  const swarmState = createSwarmState();
  const runtime = createSwarmAgentSpriteRuntime(withSpriteDefinitions({
    swarmState,
    birdDefinition: {
      frameCount: 40,
      animationFps: 10,
      animationPhase: "none",
    },
  }));

  const snapshot = runtime.getSwarmAgentSpriteRenderSnapshot({ includeHawks: false, renderTimeSec: 4.2 });

  assert.equal(snapshot.agents[0].spriteSlot, 6);
  assert.equal(snapshot.agents[0].sourceFrameCount, 40);
  assert.equal(snapshot.atlas.gridColumns, 16);
  assert.equal(snapshot.atlas.gridRows, 3);
});

test("swarm bird animation can use stable per-agent phase", () => {
  const swarmState = createSwarmState();
  const runtime = createSwarmAgentSpriteRuntime(withSpriteDefinitions({
    swarmState,
    birdDefinition: {
      frameCount: 6,
      animationFps: 10,
      animationPhase: "stableId",
    },
  }));

  const snapshot = runtime.getSwarmAgentSpriteRenderSnapshot({ includeHawks: false, renderTimeSec: 0 });

  assert.notEqual(snapshot.agents[0].animationFrameIndex, snapshot.agents[1].animationFrameIndex);
});

test("swarm agent sprite snapshot does not mutate swarm simulation state", () => {
  const swarmState = createSwarmState();
  const beforeX = Array.from(swarmState.x);
  const beforeHawk = { ...swarmState.hawks[0] };
  const runtime = createSwarmAgentSpriteRuntime(withSpriteDefinitions({ swarmState }));

  runtime.getSwarmAgentSpriteRenderSnapshot();

  assert.deepEqual(Array.from(swarmState.x), beforeX);
  assert.deepEqual(swarmState.hawks[0], beforeHawk);
});

test("swarm agent sprite snapshot can filter birds and hawks independently", () => {
  const swarmState = createSwarmState();
  const runtime = createSwarmAgentSpriteRuntime(withSpriteDefinitions({ swarmState }));

  assert.equal(runtime.getSwarmAgentSpriteRenderSnapshot({ includeBirds: false }).agents.length, 1);
  assert.equal(runtime.getSwarmAgentSpriteRenderSnapshot({ includeHawks: false }).agents.length, 2);
});
