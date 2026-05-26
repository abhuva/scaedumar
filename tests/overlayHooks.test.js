import assert from "node:assert/strict";
import test from "node:test";
import { createOverlayHooks } from "../src/ui/overlays/overlayHooks.js";

function createHooks({ dirty = false, animate = true } = {}) {
  const calls = [];
  let overlayDirty = dirty;
  const hooks = createOverlayHooks({
    updateSwarm: () => calls.push("update-swarm"),
    updateSwarmFollowCamera: () => calls.push("update-follow"),
    drawOverlay: () => calls.push("draw"),
    shouldAnimateOverlay: () => animate,
    isOverlayDirty: () => overlayDirty,
    clearOverlayDirty: () => {
      overlayDirty = false;
      calls.push("clear");
    },
  });
  return {
    calls,
    hooks,
    setDirty: (nextDirty) => {
      overlayDirty = nextDirty;
    },
  };
}

function frameAt(nowMs) {
  return { time: { nowMs }, swarm: { enabled: true } };
}

test("animated overlay redraws are throttled while clean", () => {
  const { calls, hooks } = createHooks({ dirty: false, animate: true });

  hooks.renderOverlayIfNeeded(frameAt(1000));
  hooks.renderOverlayIfNeeded(frameAt(1008));
  hooks.renderOverlayIfNeeded(frameAt(1017));

  assert.deepEqual(calls, ["draw", "clear", "draw", "clear"]);
});

test("dirty overlay redraws immediately even inside animation throttle window", () => {
  const { calls, hooks, setDirty } = createHooks({ dirty: false, animate: true });

  hooks.renderOverlayIfNeeded(frameAt(1000));
  setDirty(true);
  hooks.renderOverlayIfNeeded(frameAt(1008));

  assert.deepEqual(calls, ["draw", "clear", "draw", "clear"]);
});
