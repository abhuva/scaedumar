import assert from "node:assert/strict";
import test from "node:test";

import { createEventDebugSnapshotView } from "../src/ui/eventDebugPanelRuntime.js";

test("event debug snapshot view formats empty state", () => {
  assert.deepEqual(createEventDebugSnapshotView({}, {}), {
    lastTrigger: "none",
    active: "none",
    queue: "none",
    definitions: "none",
    seen: "none",
    flags: "none",
    journal: "none",
  });
});

test("event debug snapshot view formats runtime state", () => {
  const view = createEventDebugSnapshotView({
    lastTriggerResult: {
      type: "debug_sample_notice",
      queued: 0,
      processed: 1,
      matchedIds: ["debug.sample_notice"],
      skipped: [],
      payload: { source: "event-debug-panel" },
    },
    active: { id: "debug.sample_dialog", nodeId: "intro" },
    queuedIds: ["event.next"],
    definitionIds: ["debug.sample_dialog", "debug.sample_notice"],
    seenIds: ["tutorial.first_steps"],
    flags: { "debug.sample_dialog.recorded": true },
  }, {
    entries: [{
      id: "journal_001",
      category: "Debug",
      contentId: "tutorial.event_debug",
    }],
  });

  assert.equal(view.lastTrigger.includes("debug_sample_notice"), true);
  assert.equal(view.active.includes("debug.sample_dialog"), true);
  assert.equal(view.queue, "event.next");
  assert.equal(view.definitions, "debug.sample_dialog\ndebug.sample_notice");
  assert.equal(view.seen, "tutorial.first_steps");
  assert.equal(view.flags.includes("debug.sample_dialog.recorded"), true);
  assert.equal(view.journal, "journal_001: Debug -> tutorial.event_debug");
});
