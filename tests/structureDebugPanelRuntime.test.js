import test from "node:test";
import assert from "node:assert/strict";

import { createStructureDebugPanelRuntime } from "../src/ui/structureDebugPanelRuntime.js";

function createElement(tagName = "div") {
  const listeners = new Map();
  const children = [];
  let text = "";
  return {
    tagName,
    value: "",
    get textContent() {
      return text;
    },
    set textContent(value) {
      text = String(value);
      children.length = 0;
    },
    ownerDocument: null,
    appendChild(child) {
      children.push(child);
      if (this.tagName === "select" && !this.value) this.value = child.value;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    dispatch(type) {
      listeners.get(type)?.({ type });
    },
    get children() {
      return children;
    },
  };
}

function createDocument() {
  const documentRef = {
    createElement(tagName) {
      const element = createElement(tagName);
      element.ownerDocument = documentRef;
      return element;
    },
  };
  return documentRef;
}

function createDeps(overrides = {}) {
  const documentRef = createDocument();
  const typeSelect = documentRef.createElement("select");
  const calls = {
    commands: [],
    status: [],
    overlay: 0,
  };
  const snapshot = {
    types: [
      {
        id: "tent",
        name: "Tent",
        footprint: { width: 4, height: 4, mask: new Array(16).fill(1) },
      },
    ],
    structures: [
      { id: "tent_001", type: "tent", pixelX: 10, pixelY: 12, state: {} },
    ],
  };
  return {
    calls,
    document: documentRef,
    typeSelect,
    selectedValue: documentRef.createElement("p"),
    readout: documentRef.createElement("p"),
    renderVisibleToggle: documentRef.createElement("input"),
    placeModeToggle: documentRef.createElement("input"),
    placeAtPlayerBtn: documentRef.createElement("button"),
    selectNearestBtn: documentRef.createElement("button"),
    removeSelectedBtn: documentRef.createElement("button"),
    refreshBtn: documentRef.createElement("button"),
    getStructureSnapshot: () => snapshot,
    getStructureIdAt: () => "tent_001",
    getOccupiedCells: () => [{ x: 10, y: 12 }],
    getNearestStructureByType: () => snapshot.structures[0],
    canPlaceStructure: () => ({ ok: true, reason: "" }),
    getPlayerPixel: () => ({ x: 20, y: 22 }),
    setStatus: (message) => calls.status.push(message),
    requestOverlayDraw: () => {
      calls.overlay += 1;
    },
    dispatchCommand: (command) => {
      calls.commands.push(command);
      if (command.type === "structure/place") {
        snapshot.structures.push({ id: "tent_002", type: "tent", pixelX: command.pixelX, pixelY: command.pixelY, state: {} });
        return { ok: true, structure: { id: "tent_002" } };
      }
      if (command.type === "structure/remove") {
        snapshot.structures = snapshot.structures.filter((item) => item.id !== command.id);
        return { ok: true };
      }
      return { ok: false, reason: "unknown command" };
    },
    ...overrides,
  };
}

test("structure debug panel syncs type options and readout", () => {
  const deps = createDeps();
  const runtime = createStructureDebugPanelRuntime(deps);

  runtime.select("tent_001");

  assert.equal(deps.typeSelect.children.length, 1);
  assert.equal(deps.typeSelect.children[0].value, "tent");
  assert.match(deps.selectedValue.textContent, /tent_001/);
  assert.match(deps.readout.textContent, /Structures: 1/);
  assert.match(deps.readout.textContent, /Cells: 1/);
});

test("structure debug panel previews and places at hovered map pixel", () => {
  const deps = createDeps();
  deps.placeModeToggle.checked = true;
  const runtime = createStructureDebugPanelRuntime(deps);

  assert.equal(runtime.updatePlacementHover({ x: 30, y: 31 }), true);
  const preview = runtime.getPlacementPreviewOverlaySnapshot();
  assert.equal(preview.enabled, true);
  assert.equal(preview.ok, true);
  assert.equal(preview.cells.length, 16);
  assert.equal(preview.cells.every((cell) => cell.valid), true);

  assert.equal(runtime.tryPlaceAtPixel(30, 31), true);
  assert.equal(runtime.getSelectedId(), "tent_002");
  assert.equal(deps.placeModeToggle.checked, true);
  assert.equal(runtime.getPlacementPreviewOverlaySnapshot().enabled, true);
  assert.deepEqual(deps.calls.commands[0], {
    type: "structure/place",
    structureType: "tent",
    pixelX: 30,
    pixelY: 31,
  });
});

test("structure debug panel consumes invalid placement clicks without dispatching place", () => {
  const deps = createDeps({
    canPlaceStructure: () => ({ ok: false, reason: "blocked" }),
  });
  deps.placeModeToggle.checked = true;
  const runtime = createStructureDebugPanelRuntime(deps);

  assert.equal(runtime.tryPlaceAtPixel(30, 31), true);
  assert.deepEqual(deps.calls.commands, []);
  assert.equal(deps.calls.status.at(-1), "blocked");
  assert.equal(runtime.getPlacementPreviewOverlaySnapshot().ok, false);
});

test("structure debug panel selects by map pixel only while panel is active", () => {
  const deps = createDeps({
    panelEl: {
      getAttribute: () => "false",
    },
    getStructureIdAt: (x, y) => (x === 10 && y === 12 ? "tent_001" : null),
  });
  const runtime = createStructureDebugPanelRuntime(deps);

  assert.equal(runtime.trySelectAtPixel(10, 12), true);
  assert.equal(runtime.getSelectedId(), "tent_001");
  assert.equal(deps.calls.status.at(-1), "Selected structure tent_001.");

  assert.equal(runtime.trySelectAtPixel(1, 1), false);
  assert.equal(runtime.getSelectedId(), "tent_001");
  assert.equal(deps.calls.status.at(-1), "Selected structure tent_001.");
});

test("structure debug panel ignores map-pixel selection while panel is hidden", () => {
  const deps = createDeps({
    panelEl: {
      getAttribute: () => "true",
    },
  });
  const runtime = createStructureDebugPanelRuntime(deps);

  assert.equal(runtime.trySelectAtPixel(10, 12), false);
  assert.equal(runtime.getSelectedId(), "");
});

test("structure debug panel exposes render visibility toggle", () => {
  const deps = createDeps();
  deps.renderVisibleToggle.checked = false;
  const runtime = createStructureDebugPanelRuntime(deps);

  assert.equal(runtime.isRenderVisible(), false);

  deps.renderVisibleToggle.checked = true;
  deps.renderVisibleToggle.dispatch("change");
  assert.equal(runtime.isRenderVisible(), true);
  assert.equal(deps.calls.status.at(-1), "Structure rendering visible.");
});

test("structure debug panel places at player and selects created structure", () => {
  const deps = createDeps();
  const runtime = createStructureDebugPanelRuntime(deps);

  const result = runtime.placeAtPlayer();

  assert.equal(result.ok, true);
  assert.equal(runtime.getSelectedId(), "tent_002");
  assert.deepEqual(deps.calls.commands[0], {
    type: "structure/place",
    structureType: "tent",
    pixelX: 20,
    pixelY: 22,
  });
});

test("structure debug panel selects nearest and removes selected", () => {
  const deps = createDeps();
  const runtime = createStructureDebugPanelRuntime(deps);

  const selected = runtime.selectNearest();
  const result = runtime.removeSelected();

  assert.equal(selected.id, "tent_001");
  assert.equal(result.ok, true);
  assert.equal(runtime.getSelectedId(), "");
  assert.deepEqual(deps.calls.commands[0], {
    type: "structure/remove",
    id: "tent_001",
  });
});

test("structure debug panel exposes occupancy overlay snapshot when enabled", () => {
  const deps = createDeps();
  deps.showOccupancyToggle = createElement("input");
  deps.showOccupancyToggle.checked = true;
  const runtime = createStructureDebugPanelRuntime(deps);

  runtime.select("tent_001");
  const snapshot = runtime.getOccupancyOverlaySnapshot();

  assert.equal(snapshot.enabled, true);
  assert.equal(snapshot.selectedId, "tent_001");
  assert.equal(snapshot.cells.length, 16);
  assert.equal(snapshot.cells.every((cell) => cell.selected), true);
});
