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
