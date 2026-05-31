import test from "node:test";
import assert from "node:assert/strict";

import { createCommandBus } from "../src/core/commands.js";
import { registerMainCommands } from "../src/core/registerMainCommands.js";

function createDeps(overrides = {}) {
  const calls = {
    overlay: 0,
    status: [],
    placed: [],
    removed: [],
    updated: [],
  };
  return {
    calls,
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    zoomMin: 0.1,
    zoomMax: 8,
    getInteractionMode: () => "none",
    setInteractionMode: () => {},
    requestOverlayDraw: () => {
      calls.overlay += 1;
    },
    setStatus: (message) => {
      calls.status.push(message);
    },
    placeStructure: (typeId, pixelX, pixelY, state, options) => {
      calls.placed.push({ typeId, pixelX, pixelY, state, options });
      return { ok: true, structure: { id: options.id || "generated_1" } };
    },
    removeStructure: (id) => {
      calls.removed.push(id);
      return { ok: true };
    },
    updateStructureState: (id, patch) => {
      calls.updated.push({ id, patch });
      return { ok: true, structure: { id, state: patch } };
    },
    ...overrides,
  };
}

test("structure place command forwards placement and reports success", () => {
  const commandBus = createCommandBus();
  const deps = createDeps();
  registerMainCommands(commandBus, deps);

  const result = commandBus.dispatch({
    type: "structure/place",
    structureType: "nomadic_tent",
    id: "tent_001",
    pixelX: 12,
    pixelY: 14,
    state: { hidden: false },
  });

  assert.equal(result.ok, true);
  assert.deepEqual(deps.calls.placed, [{
    typeId: "nomadic_tent",
    pixelX: 12,
    pixelY: 14,
    state: { hidden: false },
    options: { id: "tent_001" },
  }]);
  assert.equal(deps.calls.overlay, 1);
  assert.deepEqual(deps.calls.status, ["Placed structure tent_001."]);
});

test("structure place command reports validation failure without redraw", () => {
  const commandBus = createCommandBus();
  const deps = createDeps({
    placeStructure: () => ({ ok: false, reason: "Structure overlaps existing footprint." }),
  });
  registerMainCommands(commandBus, deps);

  const result = commandBus.dispatch({
    type: "structure/place",
    typeId: "nomadic_tent",
    pixelX: 12,
    pixelY: 14,
  });

  assert.equal(result.ok, false);
  assert.equal(deps.calls.overlay, 0);
  assert.deepEqual(deps.calls.status, ["Structure overlaps existing footprint."]);
});

test("structure remove and update commands route through structure runtime", () => {
  const commandBus = createCommandBus();
  const deps = createDeps();
  registerMainCommands(commandBus, deps);

  assert.equal(commandBus.dispatch({ type: "structure/remove", structureId: "tent_001" }).ok, true);
  assert.equal(commandBus.dispatch({
    type: "structure/updateState",
    id: "tent_001",
    patch: { lit: true },
  }).ok, true);

  assert.deepEqual(deps.calls.removed, ["tent_001"]);
  assert.deepEqual(deps.calls.updated, [{ id: "tent_001", patch: { lit: true } }]);
  assert.equal(deps.calls.overlay, 2);
  assert.deepEqual(deps.calls.status, ["Structure removed.", "Structure updated."]);
});
