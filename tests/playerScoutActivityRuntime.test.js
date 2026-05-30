import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerActivityState } from "../src/gameplay/playerActivityStateRuntime.js";
import { createScoutActivityController } from "../src/gameplay/playerScoutActivityRuntime.js";

function createScoutHarness(overrides = {}) {
  const runtime = createPlayerActivityState("idle");
  const playerState = {
    pixelX: 10,
    pixelY: 10,
    stats: {},
  };
  const syncCalls = [];
  let cycleSpeed = 0.2;
  const controller = createScoutActivityController({
    runtime,
    playerState,
    activityType: "scout",
    getMovementSnapshot: () => ({ active: false }),
    getScoutSettings: () => ({ scanRadius: 30, revealRadius: 40 }),
    setActivitySpeed1x: () => {
      cycleSpeed = 0.01;
    },
    syncStore: () => {
      syncCalls.push({ ...runtime });
    },
    setStatus: () => {},
    ...overrides,
  });

  return {
    controller,
    cycleSpeed: () => cycleSpeed,
    runtime,
    syncCalls,
  };
}

test("scout controller scans, possesses a bird, and updates possessed sight", () => {
  const updates = [];
  const { controller, runtime } = createScoutHarness({
    resolveDiscoveryRevealRadius: (id, radius) => radius,
    findScoutBirdCandidate: (x, y, radius) => ({
      index: 2,
      agentId: 102,
      x: x + radius * 0.5,
      y,
      distance: radius * 0.5,
    }),
    updatePossessedScoutBird: (target) => {
      updates.push(target);
      return { valid: true, index: 2, agentId: 102, x: 42, y: 24 };
    },
  });

  assert.equal(controller.startScout().ok, true);
  controller.updateScout(100);
  assert.equal(runtime.type, "scout");
  assert.equal(runtime.scoutCandidateIndex, 2);
  assert.equal(runtime.scoutCandidateDistance, 15);

  assert.equal(controller.possessScoutCandidate().ok, true);
  controller.updateScout(200);
  assert.equal(runtime.scoutPhase, "possessed");
  assert.equal(runtime.scoutPossessedIndex, 2);
  assert.equal(runtime.scoutPossessedId, 102);
  assert.equal(runtime.scoutBirdX, 42);
  assert.equal(runtime.scoutBirdY, 24);
  assert.equal(runtime.scoutEffectiveRevealRadius, 40);
  assert.deepEqual(updates, [{ index: 2, agentId: 102, revealRadius: 40, nowMs: 200 }]);
});

test("scout controller reports when the possessed bird is killed", () => {
  let alive = true;
  const { controller, runtime } = createScoutHarness({
    findScoutBirdCandidate: () => ({ index: 1, agentId: 101, x: 12, y: 10, distance: 2 }),
    updatePossessedScoutBird: () => (alive ? { valid: true, index: 1, agentId: 101, x: 12, y: 10 } : { valid: false }),
  });

  assert.equal(controller.startScout().ok, true);
  controller.updateScout(100);
  assert.equal(controller.possessScoutCandidate().ok, true);
  alive = false;
  controller.updateScout(200);

  assert.equal(runtime.scoutPhase, "scanning");
  assert.equal(runtime.scoutDisconnectReason, "The possessed bird was killed.");
  assert.equal(runtime.lastMessage, "The possessed bird was killed.");
});

test("scout controller slows time to 1x when a bird is first spotted", () => {
  let candidateVisible = false;
  const { controller, cycleSpeed } = createScoutHarness({
    findScoutBirdCandidate: () => (candidateVisible ? { index: 1, agentId: 101, x: 12, y: 10, distance: 2 } : null),
  });

  assert.equal(controller.startScout().ok, true);
  controller.updateScout(100);
  assert.equal(cycleSpeed(), 0.2);
  candidateVisible = true;
  controller.updateScout(200);
  assert.equal(cycleSpeed(), 0.01);
});

test("scout possession survives unrelated bird kills", () => {
  const { controller, runtime } = createScoutHarness({
    findScoutBirdCandidate: () => ({ index: 2, agentId: 202, x: 12, y: 10, distance: 2 }),
    updatePossessedScoutBird: () => ({ valid: true, index: 1, agentId: 202, x: 14, y: 11 }),
  });

  assert.equal(controller.startScout().ok, true);
  controller.updateScout(100);
  assert.equal(controller.possessScoutCandidate().ok, true);
  controller.updateScout(200);

  assert.equal(runtime.scoutPhase, "possessed");
  assert.equal(runtime.scoutPossessedIndex, 1);
  assert.equal(runtime.scoutPossessedId, 202);
  assert.equal(runtime.scoutDisconnectReason, "");
});
