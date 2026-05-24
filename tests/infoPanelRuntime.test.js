import test from "node:test";
import assert from "node:assert/strict";

import { createInfoPanelRuntime } from "../src/ui/infoPanelRuntime.js";

function makeElement() {
  const classes = new Set();
  return {
    textContent: "",
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      toggle: (name, force) => {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      contains: (name) => classes.has(name),
    },
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };
}

function makeDeps(overrides = {}) {
  return {
    movementStatusPanelEl: makeElement(),
    movementStatusTitleEl: makeElement(),
    movementStatusEtaEl: makeElement(),
    movementStatusDetailEl: makeElement(),
    movementActionBtn: makeElement(),
    playerInfoEl: makeElement(),
    pathInfoEl: makeElement(),
    playerState: { pixelX: 1, pixelY: 2 },
    swarmState: { count: 0 },
    swarmCursorState: { active: false },
    getMovementSnapshot: () => null,
    getActivitySnapshot: () => null,
    getInteractionMode: () => "pathfinding",
    getCurrentPathMetrics: () => null,
    isSwarmEnabled: () => false,
    getSwarmCursorMode: () => "none",
    ...overrides,
  };
}

test("travel preview panel puts estimate in title and only shows predicted warnings", () => {
  const deps = makeDeps({
    getTravelPreviewEstimate: () => ({
      reachable: true,
      durationHours: 1.05,
      modifiers: [{ label: "Tired" }],
      projectedWarnings: [{ label: "Thirsty" }],
    }),
  });
  const update = createInfoPanelRuntime(deps);

  update();

  assert.equal(deps.movementStatusTitleEl.textContent, "Plan Travel: est. 1:03 hours");
  assert.equal(deps.movementStatusEtaEl.textContent, "Predicted: Thirsty");
  assert.equal(deps.movementStatusDetailEl.textContent, "");
});

test("travel preview panel keeps unreachable message compact", () => {
  const deps = makeDeps({
    getTravelPreviewEstimate: () => ({
      reachable: false,
      state: "unreachable",
    }),
  });
  const update = createInfoPanelRuntime(deps);

  update();

  assert.equal(deps.movementStatusTitleEl.textContent, "Plan Travel");
  assert.equal(deps.movementStatusEtaEl.textContent, "No reachable path");
  assert.equal(deps.movementStatusDetailEl.textContent, "");
});

test("scout panel moves possess action into compact right-side button state", () => {
  const deps = makeDeps({
    getInteractionMode: () => "none",
    getActivitySnapshot: () => ({
      active: true,
      type: "scout",
      scoutPhase: "scanning",
      scoutCandidateIndex: 3,
      scoutDisconnectReason: "",
    }),
  });
  const update = createInfoPanelRuntime(deps);

  update();

  assert.equal(deps.movementStatusPanelEl.classList.contains("scout-action-panel"), true);
  assert.equal(deps.movementActionBtn.textContent, "POS");
  assert.equal(deps.movementActionBtn.title, "Possess Bird");
  assert.equal(deps.movementActionBtn.attributes["aria-label"], "Possess bird");
  assert.equal(deps.movementActionBtn.disabled, false);
});
