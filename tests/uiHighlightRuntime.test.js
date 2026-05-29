import assert from "node:assert/strict";
import test from "node:test";

import { createUiHighlightRuntime } from "../src/ui/uiHighlightRuntime.js";

function createElement() {
  const classes = new Set();
  const styles = new Map();
  return {
    dataset: {},
    classList: {
      add: (className) => classes.add(className),
      remove: (className) => classes.delete(className),
      toggle: (className, enabled) => {
        if (enabled) classes.add(className);
        else classes.delete(className);
      },
      contains: (className) => classes.has(className),
    },
    style: {
      setProperty: (name, value) => styles.set(name, value),
      removeProperty: (name) => styles.delete(name),
      getPropertyValue: (name) => styles.get(name) || "",
    },
  };
}

test("ui highlight runtime applies semantic target highlights", () => {
  const runtime = createUiHighlightRuntime();
  const element = createElement();

  assert.equal(runtime.registerTarget("hud.inspect", element), true);
  runtime.setHighlights("encounter:tutorial.first_steps", [{
    target: "hud.inspect",
    color: "#ffff00",
    thickness: 4,
    pulse: true,
  }]);

  assert.equal(element.dataset.uiHighlightActive, "true");
  assert.equal(element.style.getPropertyValue("--ui-highlight-color"), "#ffff00");
  assert.equal(element.style.getPropertyValue("--ui-highlight-thickness"), "4px");
  assert.equal(element.classList.contains("ui-highlight-pulse"), true);
});

test("ui highlight runtime ignores unknown targets and clears by source", () => {
  const runtime = createUiHighlightRuntime();
  const element = createElement();
  runtime.registerTarget("hud.inspect", element);

  runtime.setHighlights("encounter:a", [{ target: "missing.target" }]);
  assert.equal(element.dataset.uiHighlightActive, undefined);

  runtime.setHighlights("encounter:a", [{ target: "hud.inspect" }]);
  assert.equal(element.dataset.uiHighlightActive, "true");
  assert.equal(runtime.clearSource("encounter:a"), true);
  assert.equal(element.dataset.uiHighlightActive, undefined);
});

test("ui highlight runtime clears all active highlights", () => {
  const runtime = createUiHighlightRuntime();
  const element = createElement();
  runtime.registerTarget("hud.inspect", element);
  runtime.setHighlights("encounter:a", [{ target: "hud.inspect" }]);

  runtime.clearAll();

  assert.equal(element.dataset.uiHighlightActive, undefined);
});

test("ui highlight runtime reapplies active highlight when target element changes", () => {
  const runtime = createUiHighlightRuntime();
  const oldElement = createElement();
  const newElement = createElement();
  runtime.registerTarget("hud.inspect", oldElement);
  runtime.setHighlights("encounter:a", [{ target: "hud.inspect", pulse: true }]);

  assert.equal(oldElement.dataset.uiHighlightActive, "true");
  assert.equal(runtime.registerTarget("hud.inspect", newElement), true);

  assert.equal(oldElement.dataset.uiHighlightActive, undefined);
  assert.equal(newElement.dataset.uiHighlightActive, "true");
  assert.equal(newElement.classList.contains("ui-highlight-pulse"), true);
});
