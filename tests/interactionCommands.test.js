import test from "node:test";
import assert from "node:assert/strict";

import { registerInteractionCommands } from "../src/gameplay/interactionCommands.js";
import { createTravelPlanningRuntime } from "../src/gameplay/travelPlanningRuntime.js";

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
    triggeredEvents: [],
    status: "",
  };
  const travelPlanningRuntime = createTravelPlanningRuntime({
    onChange: () => {
      calls.requestOverlayDraw += 1;
    },
  });
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
    travelPlanningRuntime,
    extractPathTo: () => [],
    replaceMovementQueue: () => false,
    setInteractionMode: () => {},
    triggerEvent: (triggerType, payload) => {
      calls.triggeredEvents.push({ triggerType, payload });
    },
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
  });
  deps.travelPlanningRuntime.setHoverPath({ x: 8, y: 9 }, [{ x: 2, y: 3 }, { x: 8, y: 9 }], "seed", { emit: false });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/movement/cancel" });

  assert.equal(deps.calls.cancelMovementQueue, 1);
  assert.equal(deps.travelPlanningRuntime.getSnapshot().hoverPixel, null);
  assert.deepEqual(deps.travelPlanningRuntime.getSnapshot().pathPixels, []);
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
  });
  deps.travelPlanningRuntime.setHoverPath({ x: 8, y: 9 }, [{ x: 2, y: 3 }, { x: 8, y: 9 }], "seed", { emit: false });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/movement/cancel" });

  assert.equal(mode, "none");
  assert.equal(deps.travelPlanningRuntime.getSnapshot().hoverPixel, null);
  assert.deepEqual(deps.travelPlanningRuntime.getSnapshot().pathPixels, []);
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
  assert.deepEqual(deps.calls.triggeredEvents, [{
    triggerType: "travel_committed",
    payload: { source: "pathfinding-click" },
  }]);
});

test("failed travel start does not trigger travel tutorial event", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    getInteractionMode: () => "pathfinding",
    extractPathTo: () => [{ x: 2, y: 3 }, { x: 8, y: 9 }],
    replaceMovementQueue: () => true,
    startTravelActivity: () => ({ ok: false, reason: "blocked" }),
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.deepEqual(deps.calls.triggeredEvents, []);
  assert.equal(deps.calls.status, "blocked");
});

test("route planning hover updates route runtime without starting movement", () => {
  const commandBus = createCommandBus();
  const calls = {
    hover: null,
    replaceMovementQueue: 0,
  };
  const deps = createDeps({
    getInteractionMode: () => "routePlanning",
    routePlanningRuntime: {
      updateHoverAtPixel: (pixel) => {
        calls.hover = pixel;
        return true;
      },
    },
    replaceMovementQueue: () => {
      calls.replaceMovementQueue += 1;
      return false;
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/hoverMapPixel", x: 11, y: 12 });

  assert.deepEqual(calls.hover, { x: 11, y: 12 });
  assert.equal(calls.replaceMovementQueue, 0);
});

test("route planning mode activation starts route runtime from command intent", () => {
  const commandBus = createCommandBus();
  let activeValue = null;
  const deps = createDeps({
    routePlanningRuntime: {
      setActive: (active) => {
        activeValue = active;
      },
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/setMode", mode: "routePlanning" });

  assert.equal(activeValue, true);
});

test("pathfinding mode activation triggers first-use tutorial event", () => {
  const commandBus = createCommandBus();
  const deps = createDeps();
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/setMode", mode: "pathfinding" });

  assert.deepEqual(deps.calls.triggeredEvents, [{
    triggerType: "pathfinding_started",
    payload: { mode: "pathfinding" },
  }]);
});

test("route planning mode activation fails when route runtime is missing", () => {
  const commandBus = createCommandBus();
  let mode = "none";
  const deps = createDeps({
    routePlanningRuntime: null,
    setInteractionMode: (nextMode) => {
      mode = nextMode;
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/setMode", mode: "routePlanning" });

  assert.equal(mode, "none");
  assert.equal(deps.calls.status, "Route mode unavailable: route runtime missing.");
});

test("route planning outside hover updates route runtime outside state", () => {
  const commandBus = createCommandBus();
  let outside = false;
  const deps = createDeps({
    getInteractionMode: () => "routePlanning",
    routePlanningRuntime: {
      setHoverOutside: () => {
        outside = true;
      },
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/hoverMapOutside" });

  assert.equal(outside, true);
});

test("route planning click selects segment before committing hover", () => {
  const commandBus = createCommandBus();
  const calls = {
    selected: null,
    committed: 0,
  };
  const deps = createDeps({
    getInteractionMode: () => "routePlanning",
    routePlanningRuntime: {
      hitTestAtPixel: () => ({ type: "segment", segmentId: 7 }),
      selectSegment: (segmentId) => {
        calls.selected = segmentId;
        return true;
      },
      updateHoverAtPixel: () => true,
      commitHover: () => {
        calls.committed += 1;
        return true;
      },
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 11, y: 12 });

  assert.equal(calls.selected, 7);
  assert.equal(calls.committed, 0);
});

test("route planning click on endpoint selects waypoint before committing hover", () => {
  const commandBus = createCommandBus();
  const calls = {
    selected: null,
    committed: 0,
  };
  const deps = createDeps({
    getInteractionMode: () => "routePlanning",
    routePlanningRuntime: {
      hitTestAtPixel: () => ({ type: "endpoint", segmentId: 3, endpoint: "source" }),
      selectWaypointFromEndpoint: (segmentId, endpoint) => {
        calls.selected = { segmentId, endpoint };
        return true;
      },
      updateHoverAtPixel: () => true,
      commitHover: () => {
        calls.committed += 1;
        return true;
      },
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 11, y: 12 });

  assert.deepEqual(calls.selected, { segmentId: 3, endpoint: "source" });
  assert.equal(calls.committed, 0);
});

test("route planning canceled waypoint placement clears selection on terrain click", () => {
  const commandBus = createCommandBus();
  const calls = {
    cleared: 0,
    hover: 0,
    committed: 0,
  };
  const deps = createDeps({
    getInteractionMode: () => "routePlanning",
    routePlanningRuntime: {
      hitTestAtPixel: () => null,
      getSnapshot: () => ({ waypointPlacementActive: false }),
      clearSelection: () => {
        calls.cleared += 1;
        return true;
      },
      updateHoverAtPixel: () => {
        calls.hover += 1;
        return true;
      },
      commitHover: () => {
        calls.committed += 1;
        return true;
      },
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 11, y: 12 });

  assert.equal(calls.cleared, 1);
  assert.equal(calls.hover, 0);
  assert.equal(calls.committed, 0);
  assert.equal(deps.calls.status, "Route selection cleared.");
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
  });
  deps.travelPlanningRuntime.setHoverPath({ x: 8, y: 9 }, [{ x: 2, y: 3 }, { x: 8, y: 9 }], "seed", { emit: false });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/activity/startGatherWater" });

  assert.equal(waterStarts, 1);
  assert.equal(mode, "none");
  assert.equal(deps.travelPlanningRuntime.getSnapshot().hoverPixel, null);
  assert.deepEqual(deps.travelPlanningRuntime.getSnapshot().pathPixels, []);
  assert.equal(deps.calls.requestOverlayDraw, 1);
  assert.deepEqual(deps.calls.triggeredEvents, [{
    triggerType: "water_started",
    payload: { source: "activity-command" },
  }]);
});

test("primary activity starts trigger first-use tutorial events", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    startGatheringActivity: () => ({ ok: true }),
    startHuntingActivity: () => ({ ok: true }),
    startRestActivity: () => ({ ok: true }),
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/activity/startGathering" });
  commandBus.dispatch({ type: "core/activity/startHunting" });
  commandBus.dispatch({ type: "core/activity/startRest" });

  assert.deepEqual(deps.calls.triggeredEvents, [
    { triggerType: "gathering_started", payload: { source: "activity-command" } },
    { triggerType: "hunting_started", payload: { source: "activity-command" } },
    { triggerType: "rest_started", payload: { source: "activity-command" } },
  ]);
});

test("failed primary activity start does not trigger tutorial event", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    startGatheringActivity: () => ({ ok: false, reason: "no plants" }),
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/activity/startGathering" });

  assert.deepEqual(deps.calls.triggeredEvents, []);
  assert.equal(deps.calls.status, "no plants");
});

test("legacy mode names do not re-enable no-mode teleport", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    getRuntimeMode: () => "dev",
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.equal(deps.calls.setPlayerPosition, 0);
  assert.equal(deps.calls.cancelMovementQueue, 0);
  assert.equal(deps.calls.requestOverlayDraw, 1);
  assert.equal(deps.calls.status, "Use PF to choose a destination.");
});

test("inspect activity start triggers first-use tutorial event", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    startInspectActivity: () => ({ ok: true }),
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/activity/startInspect" });

  assert.deepEqual(deps.calls.triggeredEvents, [{
    triggerType: "inspect_started",
    payload: { source: "activity-command" },
  }]);
});

test("missing runtime mode does not enable no-mode teleport", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    getRuntimeMode: undefined,
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/interaction/clickMapPixel", x: 8, y: 9 });

  assert.equal(deps.calls.setPlayerPosition, 0);
  assert.equal(deps.calls.cancelMovementQueue, 0);
  assert.equal(deps.calls.requestOverlayDraw, 1);
  assert.equal(deps.calls.status, "Use PF to choose a destination.");
});

test("pathfinding setting commands ignore non-finite values", () => {
  const commandBus = createCommandBus();
  let patch = null;
  const deps = createDeps({
    patchPathfindingStateToStore: (nextPatch) => {
      patch = nextPatch;
    },
  });
  registerInteractionCommands(commandBus, deps);

  commandBus.dispatch({ type: "core/pathfinding/setWeightSlope", value: "not-a-number" });

  assert.equal(patch, null);
});
