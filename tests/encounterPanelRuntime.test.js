import assert from "node:assert/strict";
import test from "node:test";

import {
  createEncounterArticleView,
  createEncounterPanelRuntime,
  getEncounterChoiceAriaLabel,
  handleEncounterPanelKeydown,
  updateEncounterPanelFocusState,
} from "../src/ui/encounterPanelRuntime.js";

function createEvent(key, options = {}) {
  let prevented = false;
  let stopped = false;
  return {
    key,
    shiftKey: Boolean(options.shiftKey),
    preventDefault: () => {
      prevented = true;
    },
    stopPropagation: () => {
      stopped = true;
    },
    get prevented() {
      return prevented;
    },
    get stopped() {
      return stopped;
    },
  };
}

function createElementStub() {
  return {
    firstChild: null,
    textContent: "",
    hidden: false,
    classList: { toggle: () => {} },
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    addEventListener: () => {},
    querySelectorAll: () => [],
  };
}

test("encounter article view resolves active content", () => {
  assert.deepEqual(createEncounterArticleView({
    contentId: "tutorial.first_steps",
  }, (id) => ({
    id,
    title: "Read the Land",
    summary: "First steps.",
    body: "# Read",
  })), {
    id: "tutorial.first_steps",
    title: "Read the Land",
    summary: "First steps.",
    body: "# Read",
    missing: false,
  });
});

test("encounter article view exposes missing content visibly", () => {
  assert.equal(createEncounterArticleView({ contentId: "missing.article" }, () => null).title, "Missing Encounter Content");
});

test("encounter choice aria label is descriptive", () => {
  assert.equal(
    getEncounterChoiceAriaLabel({ id: "accept", label: "Accept the risk" }),
    "Choose Accept the risk",
  );
});

test("encounter Escape closes active encounter", () => {
  const calls = [];
  const event = createEvent("Escape");

  assert.equal(handleEncounterPanelKeydown(event, {
    eventRuntime: {
      getSnapshot: () => ({ active: { id: "event.intro" } }),
      closeActive: () => calls.push("close"),
    },
  }), true);
  assert.equal(event.prevented, true);
  assert.equal(event.stopped, true);
  assert.deepEqual(calls, ["close"]);
});

test("encounter traps Tab inside active panel", () => {
  const focused = [];
  const first = {
    hidden: false,
    getAttribute: () => null,
    focus: () => focused.push("first"),
  };
  const second = {
    hidden: false,
    getAttribute: () => null,
    focus: () => focused.push("second"),
  };
  const event = createEvent("Tab");

  assert.equal(handleEncounterPanelKeydown(event, {
    rootEl: { querySelectorAll: () => [first, second] },
    document: { activeElement: first },
    eventRuntime: {
      getSnapshot: () => ({ active: { id: "event.intro" } }),
    },
  }), true);
  assert.equal(event.prevented, true);
  assert.deepEqual(focused, ["second"]);
});

test("encounter panel focus state focuses and restores", () => {
  const focused = [];
  const launcher = {
    focus: (options) => focused.push(["launcher", options]),
  };
  const panelButton = {
    hidden: false,
    getAttribute: () => null,
    focus: (options) => focused.push(["panel", options]),
  };
  const focusState = {
    open: false,
    restoreTarget: null,
  };
  const deps = {
    document: { activeElement: launcher },
    rootEl: { querySelectorAll: () => [panelButton] },
  };

  updateEncounterPanelFocusState(focusState, deps, { id: "event.intro" });
  updateEncounterPanelFocusState(focusState, deps, null);

  assert.deepEqual(focused, [
    ["panel", { preventScroll: true }],
    ["launcher", { preventScroll: true }],
  ]);
});

test("encounter runtime applies and clears active ui highlights", () => {
  const calls = [];
  let active = {
    id: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    uiHighlights: [{ target: "hud.inspect", pulse: true }],
    choices: [],
  };
  const runtime = createEncounterPanelRuntime({
    backdropEl: createElementStub(),
    rootEl: createElementStub(),
    titleEl: createElementStub(),
    summaryEl: createElementStub(),
    bodyEl: createElementStub(),
    choicesEl: createElementStub(),
    closeBtn: createElementStub(),
    document: {
      activeElement: null,
      addEventListener: () => {},
      createElement: () => createElementStub(),
      createTextNode: (text) => ({ text }),
    },
    eventRuntime: {
      getSnapshot: () => ({ active }),
    },
    wikiRuntime: { openArticle: () => {} },
    getArticle: () => ({
      id: "tutorial.first_steps",
      title: "Read the Land",
      summary: "",
      body: "Body.",
    }),
    uiHighlightRuntime: {
      setHighlights: (source, highlights) => calls.push(["set", source, highlights]),
      clearSource: (source) => calls.push(["clear", source]),
    },
  });

  runtime.sync();
  active = null;
  runtime.sync();

  assert.deepEqual(calls, [
    ["set", "encounter:tutorial.first_steps", [{ target: "hud.inspect", pulse: true }]],
    ["clear", "encounter:tutorial.first_steps"],
  ]);
});
