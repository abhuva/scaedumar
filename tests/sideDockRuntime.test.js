import assert from "node:assert/strict";
import test from "node:test";

import {
  createSideDockRuntime,
  resolveSideDockOpen,
} from "../src/ui/sideDockRuntime.js";

function panel(id, priority, side, open = false) {
  return {
    id,
    priority,
    preferredSide: side,
    side,
    isOpen: () => open,
  };
}

test("side dock opens higher priority panel by displacing lower priority occupant", () => {
  const panels = new Map([
    ["journal", panel("journal", 1, "left", true)],
    ["inventory", panel("inventory", 2, "left", false)],
  ]);

  assert.deepEqual(resolveSideDockOpen(panels, "inventory"), {
    ok: true,
    side: "left",
    displaced: ["journal"],
  });
});

test("side dock moves lower priority panel to the other side when preferred side is blocked", () => {
  const panels = new Map([
    ["rd", panel("rd", 4, "left", true)],
    ["inventory", panel("inventory", 2, "left", false)],
  ]);

  assert.deepEqual(resolveSideDockOpen(panels, "inventory"), {
    ok: true,
    side: "right",
    displaced: [],
  });
});

test("side dock blocks panel when both sides have higher priority occupants", () => {
  const panels = new Map([
    ["rd", panel("rd", 4, "left", true)],
    ["wiki", panel("wiki", 3, "right", true)],
    ["inventory", panel("inventory", 2, "left", false)],
  ]);

  assert.deepEqual(resolveSideDockOpen(panels, "inventory"), {
    ok: false,
    reason: "blocked-by-priority",
  });
});

test("side dock runtime closes displaced lower priority panel", () => {
  const closed = [];
  const opened = [];
  const dock = createSideDockRuntime();
  let journalOpen = true;
  let inventoryOpen = false;

  dock.registerPanel({
    id: "journal",
    priority: 1,
    preferredSide: "left",
    isOpen: () => journalOpen,
    close: () => {
      journalOpen = false;
      closed.push("journal");
    },
  });
  dock.registerPanel({
    id: "inventory",
    priority: 2,
    preferredSide: "left",
    isOpen: () => inventoryOpen,
    open: () => {
      inventoryOpen = true;
      opened.push("inventory");
    },
  });

  assert.equal(dock.openPanel("inventory").ok, true);
  assert.deepEqual(closed, ["journal"]);
  assert.deepEqual(opened, ["inventory"]);
});
