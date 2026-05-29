import test from "node:test";
import assert from "node:assert/strict";

import {
  createLocalActivityMenuRuntime,
  getLocalActivityMenuSlotPosition,
  getVisibleLocalActivityActions,
  LOCAL_ACTIVITY_MENU_SLOT_COUNT,
} from "../src/ui/localActivityMenuRuntime.js";

function createClassList() {
  const values = new Set();
  return {
    add: (value) => values.add(value),
    remove: (value) => values.delete(value),
    contains: (value) => values.has(value),
    toggle: (value, active) => (active ? values.add(value) : values.delete(value)),
  };
}

function createElementStub() {
  const listeners = new Map();
  const element = {
    classList: createClassList(),
    dataset: {},
    listeners,
    style: {},
    textContent: "",
    setAttribute() {},
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    click() {
      listeners.get("click")?.({
        preventDefault() {},
        stopPropagation() {},
      });
    },
  };
  return element;
}

function createRootStub() {
  const root = createElementStub();
  root.children = [];
  Object.defineProperty(root, "firstChild", {
    get() {
      return root.children[0] || null;
    },
  });
  root.appendChild = (child) => {
    root.children.push(child);
  };
  root.removeChild = (child) => {
    root.children = root.children.filter((item) => item !== child);
  };
  return root;
}

test("local activity menu places fixed slots from left clockwise", () => {
  const radius = 60;
  const left = getLocalActivityMenuSlotPosition(0, radius);
  const upperLeft = getLocalActivityMenuSlotPosition(1, radius);
  const top = getLocalActivityMenuSlotPosition(3, radius);

  assert.equal(Math.round(left.x), -60);
  assert.equal(Math.abs(Math.round(left.y)), 0);
  assert.ok(upperLeft.x < 0);
  assert.ok(upperLeft.y < 0);
  assert.equal(Math.abs(Math.round(top.x)), 0);
  assert.equal(Math.round(top.y), -60);
});

test("local activity menu collapses unlocked actions without empty slots", () => {
  const actions = Array.from({ length: LOCAL_ACTIVITY_MENU_SLOT_COUNT + 3 }, (_, index) => ({
    activityId: `activity-${index}`,
  }));
  const visible = getVisibleLocalActivityActions(actions, {
    unlocked: {
      "activity-1": false,
      "activity-3": false,
    },
  });

  assert.equal(visible.length, LOCAL_ACTIVITY_MENU_SLOT_COUNT);
  assert.deepEqual(
    visible.slice(0, 4).map((action) => action.activityId),
    ["activity-0", "activity-2", "activity-4", "activity-5"],
  );
});

test("local activity menu toggles visible state and does not redraw on sync", () => {
  const rootEl = createRootStub();
  let createCount = 0;
  const runtime = createLocalActivityMenuRuntime({
    document: {
      createElement: () => {
        createCount += 1;
        return createElementStub();
      },
      addEventListener() {},
      defaultView: {
        innerWidth: 800,
        innerHeight: 600,
        addEventListener() {},
      },
    },
    rootEl,
    activityDefinitions: {},
    dispatchCoreCommand: () => {},
    getInteractionMode: () => "none",
    getActivitySnapshot: () => null,
    setStatus: () => {},
  });

  assert.equal(runtime.openAt({ clientX: 100, clientY: 100, pixel: { x: 1, y: 2 } }), true);
  assert.equal(runtime.isOpen(), true);
  assert.equal(createCount, 6);

  runtime.sync();
  assert.equal(createCount, 6);

  assert.equal(runtime.openAt({ clientX: 100, clientY: 100, pixel: { x: 1, y: 2 } }), true);
  assert.equal(runtime.isOpen(), false);
});

test("local activity menu clamps root by current radius plus button padding", () => {
  const rootEl = createRootStub();
  const runtime = createLocalActivityMenuRuntime({
    document: {
      createElement: () => createElementStub(),
      addEventListener() {},
      defaultView: {
        innerWidth: 500,
        innerHeight: 400,
        addEventListener() {},
      },
    },
    rootEl,
    activityDefinitions: {},
    dispatchCoreCommand: () => {},
    getInteractionMode: () => "none",
    getActivitySnapshot: () => null,
    radius: 120,
    setStatus: () => {},
  });

  assert.equal(runtime.openAt({ clientX: 490, clientY: 390, pixel: { x: 1, y: 2 } }), true);

  assert.equal(rootEl.style.left, "360px");
  assert.equal(rootEl.style.top, "260px");
});

test("local activity menu reports rendered activity buttons for semantic highlights", () => {
  const rootEl = createRootStub();
  let pathfindingButton = null;
  let gatheringButton = null;
  const runtime = createLocalActivityMenuRuntime({
    document: {
      createElement: () => createElementStub(),
      addEventListener() {},
      defaultView: {
        innerWidth: 800,
        innerHeight: 600,
        addEventListener() {},
      },
    },
    rootEl,
    activityDefinitions: {},
    dispatchCoreCommand: () => {},
    getInteractionMode: () => "none",
    getActivitySnapshot: () => null,
    onButtonsRendered: ({ getButton }) => {
      pathfindingButton = getButton("travel");
      gatheringButton = getButton("gathering");
    },
    setStatus: () => {},
  });

  assert.equal(runtime.openAt({ clientX: 100, clientY: 100, pixel: { x: 1, y: 2 } }), true);

  assert.equal(pathfindingButton?.dataset.activityId, "travel");
  assert.equal(gatheringButton?.dataset.activityId, "gathering");
});

test("local activity menu shows center cancel button while activity is active", () => {
  const rootEl = createRootStub();
  const commands = [];
  const runtime = createLocalActivityMenuRuntime({
    document: {
      createElement: () => createElementStub(),
      addEventListener() {},
      defaultView: {
        innerWidth: 800,
        innerHeight: 600,
        addEventListener() {},
      },
    },
    rootEl,
    activityDefinitions: {},
    dispatchCoreCommand: (command) => commands.push(command),
    getInteractionMode: () => "none",
    getActivitySnapshot: () => ({ active: true, type: "gathering" }),
    getMovementSnapshot: () => ({ active: false }),
    setStatus: () => {},
  });

  assert.equal(runtime.openAt({ clientX: 100, clientY: 100, pixel: { x: 1, y: 2 } }), true);
  assert.equal(rootEl.children.length, 7);
  assert.equal(rootEl.children[0].className, "local-activity-menu-cancel-btn");

  rootEl.children[0].click();

  assert.deepEqual(commands, [{ type: "core/activity/cancel" }]);
  assert.equal(runtime.isOpen(), false);
});
