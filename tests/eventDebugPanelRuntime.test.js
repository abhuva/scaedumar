import assert from "node:assert/strict";
import test from "node:test";

import {
  createContentHealthView,
  createEventDebugPanelRuntime,
  createEventPreviewView,
  createEventDebugSnapshotView,
  formatLastTriggerResult,
} from "../src/ui/eventDebugPanelRuntime.js";

test("event debug snapshot view formats empty state", () => {
  assert.deepEqual(createEventDebugSnapshotView({}, {}), {
    lastTrigger: "none",
    active: "none",
    queue: "none",
    definitions: "none",
    seen: "none",
    flags: "none",
    journal: "none",
    contentHealth: [
      "Status: OK",
      "Last checked: never",
      "Articles: 0",
      "Global encounters: 0",
      "Map-local encounters: 0",
      "Active encounters: 0",
    ].join("\n"),
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
  assert.equal(view.lastTrigger.includes("Queued: 0"), true);
  assert.equal(view.lastTrigger.includes("Processed: 1"), true);
  assert.equal(view.lastTrigger.includes("Matched: debug.sample_notice"), true);
  assert.equal(view.active.includes("debug.sample_dialog"), true);
  assert.equal(view.queue, "event.next");
  assert.equal(view.definitions, "debug.sample_dialog\ndebug.sample_notice");
  assert.equal(view.seen, "tutorial.first_steps");
  assert.equal(view.flags.includes("debug.sample_dialog.recorded"), true);
  assert.equal(view.journal, "journal_001: Debug -> tutorial.event_debug");
});

test("last trigger view explains skipped and unmatched triggers", () => {
  assert.equal(formatLastTriggerResult({
    type: "gathering_started",
    queued: 0,
    processed: 0,
    matchedIds: ["tutorial.gathering_started"],
    skipped: [{ id: "tutorial.gathering_started", reason: "already-seen" }],
    payload: { source: "activity-command" },
  }), [
    "Type: gathering_started",
    "Queued: 0",
    "Processed: 0",
    "Matched: tutorial.gathering_started",
    "Skipped: tutorial.gathering_started: already seen",
    'Payload: {"source":"activity-command"}',
  ].join("\n"));

  assert.equal(formatLastTriggerResult({
    type: "unknown_trigger",
    queued: 0,
    processed: 0,
    matchedIds: [],
    skipped: [{ id: "", reason: "no-matching-definition" }],
    payload: {},
  }).includes("Skipped: no matching definition"), true);
  assert.equal(formatLastTriggerResult({
    type: "gathering_started",
    queued: 1,
    processed: 0,
    matchedIds: ["tutorial.gathering_started", "map3.gathering_test"],
    skipped: [{ id: "tutorial.gathering_started", reason: "trigger-consumed" }],
    payload: {},
  }).includes("tutorial.gathering_started: trigger consumed by exclusive encounter"), true);
});

test("content health view formats count summary and validation errors", () => {
  assert.equal(createContentHealthView({
    articleCount: 16,
    globalEncounterCount: 12,
    mapEncounterCount: 2,
    activeEncounterCount: 14,
    validation: {
      ok: false,
      missing: [
        { source: "article:wiki.index:file-link", contentId: "missing.md" },
        { source: "event:debug.sample_dialog", contentId: "missing.article" },
      ],
    },
  }), [
    "Status: ERROR",
    "Last checked: never",
    "Articles: 16",
    "Global encounters: 12",
    "Map-local encounters: 2",
    "Active encounters: 14",
    "Details:",
    "article:wiki.index:file-link -> missing.md",
    "event:debug.sample_dialog -> missing.article",
  ].join("\n"));
});

test("content health view includes last validation error when available", () => {
  assert.equal(createContentHealthView({
    articleCount: 1,
    globalEncounterCount: 1,
    activeEncounterCount: 1,
    validation: { ok: true, missing: [] },
    lastError: "Previous validation failed.",
  }), [
    "Status: OK",
    "Last checked: never",
    "Articles: 1",
    "Global encounters: 1",
    "Map-local encounters: 0",
    "Active encounters: 1",
    "Details:",
    "Previous validation failed.",
  ].join("\n"));
});

test("event preview view formats selected definition metadata", () => {
  const view = createEventPreviewView({
    id: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: true },
    presentation: {
      level: "blocking",
      surface: "encounter",
      uiHighlights: [{ target: "hud.inspect", color: "#f4d35e", thickness: 3, pulse: true }],
    },
    journal: { category: "Tutorial", tags: ["tutorial", "inspect"] },
  }, {
    title: "Read the Land",
    summary: "Begin by reading the ground.",
  });

  assert.equal(view.includes("ID: tutorial.first_steps"), true);
  assert.equal(view.includes("Title: Read the Land"), true);
  assert.equal(view.includes("Surface: encounter"), true);
  assert.equal(view.includes("Trigger: type=gameplay_started, once=true"), true);
  assert.equal(view.includes("hud.inspect"), true);
});

test("event debug runtime updates content health checked time on validate", () => {
  const listeners = new Map();
  const contentHealthEl = { textContent: "" };
  const validateContentBtn = {
    addEventListener: (type, listener) => listeners.set(type, listener),
  };
  let validateCalls = 0;
  const runtime = createEventDebugPanelRuntime({
    eventRuntime: { getSnapshot: () => ({}) },
    journalRuntime: { getSnapshot: () => ({}) },
    getContentHealthSnapshot: () => ({
      articleCount: 2,
      globalEncounterCount: 1,
      activeEncounterCount: 1,
      validation: { ok: true, missing: [] },
    }),
    validateContent: () => {
      validateCalls += 1;
    },
    validateContentBtn,
    contentHealthEl,
    now: new Date("2026-05-29T07:08:09"),
  });

  runtime.bind();

  assert.equal(contentHealthEl.textContent.includes("Last checked: 07:08:09"), true);
  listeners.get("click")();
  assert.equal(validateCalls, 1);
  assert.equal(contentHealthEl.textContent.includes("Last checked: 07:08:09"), true);
});

test("event debug runtime previews encounter without triggering seen state", () => {
  const listeners = new Map();
  const previewBtn = {
    addEventListener: (type, listener) => listeners.set(`preview:${type}`, listener),
  };
  const previewSelectEl = {
    value: "",
    textContent: "",
    children: [],
    ownerDocument: {
      createElement: () => ({ value: "", textContent: "" }),
    },
    appendChild(child) {
      this.children.push(child);
    },
    addEventListener: (type, listener) => listeners.set(`select:${type}`, listener),
  };
  let previewedId = "";
  const runtime = createEventDebugPanelRuntime({
    eventRuntime: {
      getSnapshot: () => ({}),
      previewDefinition: (id) => {
        previewedId = id;
        return { ok: true };
      },
    },
    journalRuntime: { getSnapshot: () => ({}) },
    getEventDefinitions: () => [{
      id: "debug.sample_dialog",
      contentId: "tutorial.event_debug",
      trigger: { type: "debug_sample_dialog" },
      presentation: { level: "blocking", surface: "encounter" },
      journal: { category: "Debug", tags: ["debug"] },
    }],
    getArticle: () => ({ title: "Encounter Debug", summary: "Test encounter." }),
    previewBtn,
    previewSelectEl,
    previewValueEl: { textContent: "" },
  });

  runtime.bind();
  listeners.get("preview:click")();

  assert.equal(previewedId, "debug.sample_dialog");
  assert.equal(previewSelectEl.children[0].value, "debug.sample_dialog");
});
