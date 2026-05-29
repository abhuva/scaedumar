import assert from "node:assert/strict";
import test from "node:test";

import {
  getWikiArticleLinkAriaLabel,
  handleWikiHelpClick,
  handleWikiPanelKeydown,
  updateWikiPanelFocusState,
} from "../src/ui/wikiPanelRuntime.js";

function createEvent(key, options = {}) {
  let prevented = false;
  let stopped = false;
  return {
    key,
    shiftKey: Boolean(options.shiftKey),
    target: options.target || null,
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

function createClickEvent(options = {}) {
  let prevented = false;
  let stopped = false;
  return {
    target: options.target || null,
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

function createDeps(overrides = {}) {
  const calls = [];
  const wikiSnapshot = overrides.wikiSnapshot || {
    article: { id: "wiki.index" },
    canGoBack: true,
  };
  const eventSnapshot = overrides.eventSnapshot || {};
  return {
    calls,
    deps: {
      rootEl: overrides.rootEl || { querySelectorAll: () => [] },
      document: overrides.document || { activeElement: null },
      wikiRuntime: {
        getSnapshot: () => wikiSnapshot,
        close: () => calls.push("wiki.close"),
        goBack: () => calls.push("wiki.back"),
      },
      eventRuntime: {
        getSnapshot: () => eventSnapshot,
        closeActive: () => calls.push("event.close"),
      },
    },
  };
}

test("wiki panel Escape closes normal wiki article through wiki runtime", () => {
  const { deps, calls } = createDeps();
  const event = createEvent("Escape");

  assert.equal(handleWikiPanelKeydown(event, deps), true);
  assert.deepEqual(calls, ["wiki.close"]);
});

test("wiki panel Backspace navigates history outside editable targets", () => {
  const { deps, calls } = createDeps();
  const event = createEvent("Backspace");

  assert.equal(handleWikiPanelKeydown(event, deps), true);
  assert.equal(event.prevented, true);
  assert.deepEqual(calls, ["wiki.back"]);
});

test("wiki panel Backspace ignores editable targets", () => {
  const { deps, calls } = createDeps();
  const event = createEvent("Backspace", {
    target: { tagName: "INPUT" },
  });

  assert.equal(handleWikiPanelKeydown(event, deps), false);
  assert.equal(event.prevented, false);
  assert.deepEqual(calls, []);
});

test("wiki generated controls expose descriptive aria labels", () => {
  assert.equal(
    getWikiArticleLinkAriaLabel("Travel", "gameplay.travel"),
    "Open wiki article Travel",
  );
});

test("wiki panel stores and restores focus around panel open state", () => {
  const focused = [];
  const launcher = {
    focus: (options) => focused.push(["launcher", options]),
  };
  const panelButton = {
    focus: (options) => focused.push(["panel", options]),
    hidden: false,
    getAttribute: () => null,
  };
  const focusState = {
    open: false,
    eventActive: false,
    restoreTarget: null,
  };
  const deps = {
    document: { activeElement: launcher },
    rootEl: {
      contains: (element) => element === panelButton,
      querySelectorAll: () => [panelButton],
    },
  };

  updateWikiPanelFocusState(focusState, deps, { article: { id: "tutorial.first_steps" } }, {});
  assert.deepEqual(focused, []);
  assert.equal(focusState.restoreTarget, launcher);

  updateWikiPanelFocusState(focusState, deps, { article: null }, {});
  assert.deepEqual(focused, [["launcher", { preventScroll: true }]]);
});

test("wiki help click opens target article and consumes normal click", () => {
  const opened = [];
  const wikiTarget = {
    dataset: { wikiId: "gameplay.travel" },
  };
  const event = createClickEvent({
    target: {
      closest: (selector) => selector === "[data-wiki-id]" ? wikiTarget : null,
    },
  });
  const handled = handleWikiHelpClick(event, {
    helpBtn: {},
    wikiRuntime: {
      getSnapshot: () => ({ helpMode: true }),
      openArticle: (id, options) => opened.push({ id, options }),
    },
  });

  assert.equal(handled, true);
  assert.equal(event.prevented, true);
  assert.equal(event.stopped, true);
  assert.deepEqual(opened, [{
    id: "gameplay.travel",
    options: { reason: "help-target" },
  }]);
});

test("wiki help click opens index fallback when target has no article ID", () => {
  const opened = [];
  const event = createClickEvent({
    target: {
      closest: () => null,
    },
  });
  const handled = handleWikiHelpClick(event, {
    helpBtn: {},
    wikiRuntime: {
      getSnapshot: () => ({ helpMode: true }),
      openArticle: (id, options) => opened.push({ id, options }),
    },
  });

  assert.equal(handled, true);
  assert.equal(event.prevented, true);
  assert.equal(event.stopped, true);
  assert.deepEqual(opened, [{
    id: "wiki.index",
    options: { reason: "help-fallback" },
  }]);
});

test("wiki help click lets the help button toggle normally", () => {
  const helpBtn = {};
  const event = createClickEvent({
    target: {
      closest: () => helpBtn,
    },
  });
  const handled = handleWikiHelpClick(event, {
    helpBtn,
    wikiRuntime: {
      getSnapshot: () => ({ helpMode: true }),
      openArticle: () => assert.fail("help button should not open an article"),
    },
  });

  assert.equal(handled, false);
  assert.equal(event.prevented, false);
  assert.equal(event.stopped, false);
});

test("wiki help click ignores explicit HUD knowledge controls", () => {
  const ignoredTarget = {};
  const event = createClickEvent({
    target: {
      closest: (selector) => selector === "[data-wiki-help-ignore]" ? ignoredTarget : null,
    },
  });
  const handled = handleWikiHelpClick(event, {
    helpBtn: {},
    wikiRuntime: {
      getSnapshot: () => ({ helpMode: true }),
      openArticle: () => assert.fail("ignored target should use its normal click behavior"),
    },
  });

  assert.equal(handled, false);
  assert.equal(event.prevented, false);
  assert.equal(event.stopped, false);
});
