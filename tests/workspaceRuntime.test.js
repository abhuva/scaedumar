import assert from "node:assert/strict";
import test from "node:test";

import { createWorkspaceRuntime } from "../src/ui/workspaceRuntime.js";

function createClassList() {
  const values = new Set();
  return {
    contains(name) {
      return values.has(name);
    },
    toggle(name, enabled) {
      if (enabled) values.add(name);
      else values.delete(name);
    },
  };
}

function createElement(dataset) {
  const attributes = new Map();
  return {
    dataset,
    classList: createClassList(),
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    getAttribute(name) {
      return attributes.get(name);
    },
  };
}

test("workspace runtime does not activate unregistered legacy panels", () => {
  const mapPanel = createElement({ workspacePanel: "map" });
  const slimePanel = createElement({ workspacePanel: "slime" });
  const mapButton = createElement({ workspace: "map" });
  const slimeButton = createElement({ workspace: "slime" });
  const interactionModes = [];

  const runtime = createWorkspaceRuntime({
    workspacePanels: [mapPanel, slimePanel],
    workspaceButtons: [mapButton, slimeButton],
    setInteractionMode(mode) {
      interactionModes.push(mode);
    },
  });

  runtime.syncWorkspaceUi("slime");

  assert.equal(mapPanel.classList.contains("active"), true);
  assert.equal(slimePanel.classList.contains("active"), false);
  assert.equal(mapButton.classList.contains("active"), true);
  assert.equal(slimeButton.classList.contains("active"), false);
  assert.equal(mapButton.getAttribute("aria-pressed"), "true");
  assert.equal(slimeButton.getAttribute("aria-pressed"), "false");
  assert.deepEqual(interactionModes, []);
});
