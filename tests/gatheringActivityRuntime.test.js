import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_GATHERING,
  ACTIVITY_GATHER_WATER,
  ACTIVITY_IDLE,
  ACTIVITY_INSPECT,
  ACTIVITY_NONE,
  ACTIVITY_REST,
  ACTIVITY_TIME_SPEED_1X,
  ACTIVITY_TRAVEL,
  buildGatheringMoveCandidates,
  chooseWeightedGatheringCandidate,
  createGatheringActivityRuntime,
  createPlayerActivityRuntime,
} from "../src/gameplay/gatheringActivityRuntime.js";

test("gathering activity runtime remains a compatibility re-export", () => {
  assert.equal(createGatheringActivityRuntime, createPlayerActivityRuntime);
  assert.equal(typeof buildGatheringMoveCandidates, "function");
  assert.equal(typeof chooseWeightedGatheringCandidate, "function");
  assert.equal(ACTIVITY_GATHERING, "gathering");
  assert.equal(ACTIVITY_GATHER_WATER, "gather_water");
  assert.equal(ACTIVITY_IDLE, "idle");
  assert.equal(ACTIVITY_NONE, ACTIVITY_IDLE);
  assert.equal(ACTIVITY_INSPECT, "inspect");
  assert.equal(ACTIVITY_REST, "rest");
  assert.equal(ACTIVITY_TIME_SPEED_1X, 0.01);
  assert.equal(ACTIVITY_TRAVEL, "travel");
});
