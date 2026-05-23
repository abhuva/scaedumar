import test from "node:test";
import assert from "node:assert/strict";

import { registerInteractionCommands } from "../src/gameplay/interactionCommands.js";

function createCommandBus() {
  const handlers = new Map();
  return {
    register: (type, handler) => {
      handlers.set(type, handler);
    },
    dispatch: (command) => handlers.get(command.type)(command),
  };
}

function createDeps(overrides = {}) {
  const calls = {
    setPlayerPosition: 0,
    cancelMovementQueue: 0,
    requestOverlayDraw: 0,
    status: "",
  };
  return {
    calls,
    getInteractionMode: () => "none",
    getRuntimeMode: () => "gameplay",
    getMovementStateSnapshot: () => ({ active: false }),
    findPointLightAtPixel: () => null,
    beginLightEdit: () => {},
    createPointLight: () => {},
    requestOverlayDraw: () => {
      calls.requestOverlayDraw += 1;
    },
    movePreviewState: {
      hoverPixel: null,
      pathPixels: [],
    },
    extractPathTo: () => [],
    replaceMovementQueue: () => false,
    setInteractionMode: () => {},
    syncPlayerStateToStore: () => {},
    cancelMovementQueue: () => {
      calls.cancelMovementQueue += 1;
    },
    playerState: {
      pixelX: 2,
      pixelY: 3,
    },
    setPlayerPosition: () => {
      calls.setPlayerPosition += 1;
    },
    rebuildMovementField: () => {},
    setStatus: (message) => {
      calls.status = message;
    },
    syncPathfindingStateToStore: () => {},
    getPathfindingStateSnapshot: () => ({}),
    patchPathfindingStateToStore: () => {},
    syncPathfindingSettingsUi: () => {},
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    ...overrides,
  };
}

test("gameplay no-mode map clicks do not teleport the player", () => {
  const commandBus = createCommandBus();
  const deps = createDeps();
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.equal(deps.calls.setPlayerPosition, 0);
  assert.equal(deps.calls.cancelMovementQueue, 0);
  assert.equal(deps.calls.requestOverlayDraw, 1);
  assert.equal(deps.calls.status, "Use PF to choose a destination.");
});

test("gameplay no-mode map clicks do not cancel active movement", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    getMovementStateSnapshot: () => ({ active: true }),
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.equal(deps.calls.setPlayerPosition, 0);
  assert.equal(deps.calls.cancelMovementQueue, 0);
  assert.equal(deps.calls.requestOverlayDraw, 1);
  assert.equal(deps.calls.status, "Use PF to choose a destination.");
});

test("movement cancel command cancels active travel explicitly", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    getMovementStateSnapshot: () => ({ active: true }),
    movePreviewState: {
      hoverPixel: { x: 8, y: 9 },
      pathPixels: [{ x: 2, y: 3 }, { x: 8, y: 9 }],
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/movement/cancel" });

  assert.equal(deps.calls.cancelMovementQueue, 1);
  assert.equal(deps.movePreviewState.hoverPixel, null);
  assert.deepEqual(deps.movePreviewState.pathPixels, []);
  assert.equal(deps.calls.requestOverlayDraw, 1);
  assert.equal(deps.calls.status, "Movement canceled at (2, 3).");
});

test("movement cancel command is a no-op when travel is inactive", () => {
  const commandBus = createCommandBus();
  const deps = createDeps();
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/movement/cancel" });

  assert.equal(deps.calls.cancelMovementQueue, 0);
  assert.equal(deps.calls.requestOverlayDraw, 0);
  assert.equal(deps.calls.status, "");
});

test("movement cancel command cancels pathfinding planning when no travel is active", () => {
  const commandBus = createCommandBus();
  let mode = "pathfinding";
  const deps = createDeps({
    getInteractionMode: () => mode,
    setInteractionMode: (nextMode) => {
      mode = nextMode;
    },
    movePreviewState: {
      hoverPixel: { x: 8, y: 9 },
      pathPixels: [{ x: 2, y: 3 }, { x: 8, y: 9 }],
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/movement/cancel" });

  assert.equal(mode, "none");
  assert.equal(deps.movePreviewState.hoverPixel, null);
  assert.deepEqual(deps.movePreviewState.pathPixels, []);
  assert.equal(deps.calls.requestOverlayDraw, 1);
  assert.equal(deps.calls.status, "Travel planning canceled.");
});

test("pathfinding click starts explicit travel after queuing movement", () => {
  const commandBus = createCommandBus();
  let travelStarted = 0;
  const deps = createDeps({
    getInteractionMode: () => "pathfinding",
    extractPathTo: () => [{ x: 2, y: 3 }, { x: 8, y: 9 }],
    replaceMovementQueue: () => true,
    startTravelActivity: () => {
      travelStarted += 1;
      return { ok: true };
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.equal(travelStarted, 1);
  assert.equal(deps.calls.requestOverlayDraw, 1);
});

test("start gather water command clears map preview on success", () => {
  const commandBus = createCommandBus();
  let mode = "pathfinding";
  let waterStarts = 0;
  const deps = createDeps({
    setInteractionMode: (nextMode) => {
      mode = nextMode;
    },
    startGatherWaterActivity: () => {
      waterStarts += 1;
      return { ok: true };
    },
    movePreviewState: {
      hoverPixel: { x: 8, y: 9 },
      pathPixels: [{ x: 2, y: 3 }, { x: 8, y: 9 }],
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/activity/startGatherWater" });

  assert.equal(waterStarts, 1);
  assert.equal(mode, "none");
  assert.equal(deps.movePreviewState.hoverPixel, null);
  assert.deepEqual(deps.movePreviewState.pathPixels, []);
  assert.equal(deps.calls.requestOverlayDraw, 1);
});

test("dev no-mode map clicks keep the existing teleport test behavior", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    getRuntimeMode: () => "dev",
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.equal(deps.calls.setPlayerPosition, 1);
  assert.equal(deps.calls.cancelMovementQueue, 1);
});

test("missing runtime mode falls back to dev no-mode click behavior", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    getRuntimeMode: undefined,
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.equal(deps.calls.setPlayerPosition, 1);
  assert.equal(deps.calls.cancelMovementQueue, 1);
});
