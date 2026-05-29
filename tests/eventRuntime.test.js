import assert from "node:assert/strict";
import test from "node:test";

import { createEventRuntime } from "../src/gameplay/eventRuntime.js";

test("event runtime queues blocking encounter events, pauses time, journals on close, and restores speed", () => {
  const journalEntries = [];
  const speeds = [];
  let currentSpeed = 0.2;
  const runtime = createEventRuntime({
    journalRuntime: {
      addEntry: (entry) => journalEntries.push(entry),
    },
    getTimeSpeed: () => currentSpeed,
    setTimeSpeed: (speed) => {
      currentSpeed = speed;
      speeds.push(speed);
    },
  });

  runtime.loadDefinitions([{
    id: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: true },
    presentation: {
      level: "blocking",
      mode: "article",
      time: { mode: "pause" },
    },
    journal: {
      addOnClose: true,
      category: "Tutorial",
      tags: ["tutorial"],
    },
  }]);

  assert.deepEqual(runtime.trigger("gameplay_started"), { ok: true, queued: 1, processed: 0, payload: {} });
  assert.deepEqual(speeds, [0]);
  assert.equal(runtime.getSnapshot().active.id, "tutorial.first_steps");

  assert.equal(runtime.closeActive(), true);
  assert.deepEqual(speeds, [0, 0.2]);
  assert.deepEqual(journalEntries, [{
    sourceEventId: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    category: "Tutorial",
    tags: ["tutorial"],
  }]);
  assert.deepEqual(runtime.trigger("gameplay_started"), { ok: true, queued: 0, processed: 0, payload: {} });
});

test("event runtime restores seen IDs before triggers run", () => {
  const opened = [];
  const runtime = createEventRuntime({
    wikiRuntime: {
      openArticle: (id) => opened.push(id),
      close: () => {},
    },
  });
  runtime.loadDefinitions([{
    id: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: true },
    presentation: { level: "blocking", mode: "article" },
  }]);

  runtime.applyPersistenceSnapshot({ seenIds: ["tutorial.first_steps"] });

  assert.deepEqual(runtime.trigger("gameplay_started"), { ok: true, queued: 0, processed: 0, payload: {} });
  assert.deepEqual(opened, []);
  assert.deepEqual(runtime.getSnapshot().lastTriggerResult, {
    type: "gameplay_started",
    payload: {},
    queued: 0,
    processed: 0,
    matchedIds: ["tutorial.first_steps"],
    skipped: [{ id: "tutorial.first_steps", reason: "already-seen" }],
  });
  assert.deepEqual(runtime.getPersistenceSnapshot(), {
    seenIds: ["tutorial.first_steps"],
    triggerCounts: {},
    lastTriggeredTicks: {},
    flags: {},
  });
});

test("event runtime previews blocking encounter without seen or journal persistence", () => {
  const journalEntries = [];
  const speeds = [];
  let currentSpeed = 1;
  const runtime = createEventRuntime({
    journalRuntime: {
      addEntry: (entry) => journalEntries.push(entry),
    },
    getTimeSpeed: () => currentSpeed,
    setTimeSpeed: (speed) => {
      currentSpeed = speed;
      speeds.push(speed);
    },
  });
  runtime.loadDefinitions([{
    id: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: true },
    presentation: {
      level: "blocking",
      surface: "encounter",
      time: { mode: "pause" },
    },
    journal: { addOnClose: true, category: "Tutorial" },
  }]);

  assert.deepEqual(runtime.previewDefinition("tutorial.first_steps"), { ok: true, id: "tutorial.first_steps" });
  assert.equal(runtime.getSnapshot().active.preview, true);
  assert.deepEqual(speeds, [0]);
  assert.equal(runtime.closeActive(), true);
  assert.deepEqual(speeds, [0, 1]);
  assert.deepEqual(journalEntries, []);
  assert.deepEqual(runtime.getSnapshot().seenIds, []);
});

test("event runtime records why debug triggers did not fire", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([{
    id: "notice.once",
    contentId: "wiki.index",
    trigger: { type: "notice_once", once: true },
    presentation: { level: "notice", mode: "article" },
  }]);

  assert.equal(runtime.trigger("notice_once").processed, 1);
  assert.equal(runtime.trigger("notice_once").processed, 0);
  assert.deepEqual(runtime.getSnapshot().lastTriggerResult, {
    type: "notice_once",
    payload: {},
    queued: 0,
    processed: 0,
    matchedIds: ["notice.once"],
    skipped: [{ id: "notice.once", reason: "already-seen" }],
  });

  runtime.trigger("unknown_trigger");
  assert.deepEqual(runtime.getSnapshot().lastTriggerResult, {
    type: "unknown_trigger",
    payload: {},
    queued: 0,
    processed: 0,
    matchedIds: [],
    skipped: [{ id: "", reason: "no-matching-definition" }],
  });
});

test("event runtime defaults presentation surface from level", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([{
    id: "blocking.default_surface",
    contentId: "tutorial.first_steps",
    trigger: { type: "blocking_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
  }]);

  runtime.trigger("blocking_started");
  assert.equal(runtime.getSnapshot().active.surface, "encounter");
  runtime.closeActive();

  runtime.replaceDefinitions([{
    id: "silent.default_surface",
    contentId: "wiki.index",
    trigger: { type: "silent_started", once: false },
    presentation: { level: "silent", mode: "article" },
    journal: { addOnTrigger: false },
  }]);
  runtime.trigger("silent_started");
  assert.equal(runtime.getSnapshot().active, null);
});

test("event runtime exposes active encounter ui highlights", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([{
    id: "tutorial.highlight",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started" },
    presentation: {
      level: "blocking",
      surface: "encounter",
      uiHighlights: [{
        target: "hud.activity.pathfinding",
        color: "#f4d35e",
        thickness: 3,
        pulse: true,
      }],
    },
  }]);

  runtime.trigger("gameplay_started");

  assert.deepEqual(runtime.getSnapshot().active.uiHighlights, [{
    target: "hud.activity.pathfinding",
    color: "#f4d35e",
    thickness: 3,
    pulse: true,
  }]);
});

test("event runtime processes notice events without blocking the queue", () => {
  const journalEntries = [];
  const notices = [];
  const runtime = createEventRuntime({
    journalRuntime: {
      addEntry: (entry) => journalEntries.push(entry),
    },
    onNotice: (notice) => notices.push(notice),
  });
  runtime.loadDefinitions([{
    id: "notice.low_water",
    contentId: "survival.hydration",
    trigger: { type: "condition_warning", once: true },
    presentation: { level: "notice", mode: "article" },
    journal: {
      category: "Warning",
      tags: ["hydration"],
    },
  }]);

  assert.deepEqual(runtime.trigger("condition_warning"), { ok: true, queued: 0, processed: 1, payload: {} });
  assert.equal(runtime.getSnapshot().active, null);
  assert.deepEqual(journalEntries, [{
    sourceEventId: "notice.low_water",
    contentId: "survival.hydration",
    category: "Warning",
    tags: ["hydration"],
  }]);
  assert.deepEqual(notices, [{
    id: "notice.low_water",
    contentId: "survival.hydration",
    level: "notice",
  }]);
  assert.deepEqual(runtime.trigger("condition_warning"), { ok: true, queued: 0, processed: 0, payload: {} });
});

test("event runtime processes silent events without notice callbacks", () => {
  const journalEntries = [];
  const notices = [];
  const runtime = createEventRuntime({
    journalRuntime: {
      addEntry: (entry) => journalEntries.push(entry),
    },
    onNotice: (notice) => notices.push(notice),
  });
  runtime.loadDefinitions([{
    id: "silent.discovery_logged",
    contentId: "world.tracks",
    trigger: { type: "tracks_discovered", once: true },
    presentation: { level: "silent", mode: "article" },
    journal: {
      category: "Discovery",
      tags: ["tracks"],
    },
  }]);

  assert.deepEqual(runtime.trigger("tracks_discovered"), { ok: true, queued: 0, processed: 1, payload: {} });
  assert.deepEqual(notices, []);
  assert.deepEqual(journalEntries, [{
    sourceEventId: "silent.discovery_logged",
    contentId: "world.tracks",
    category: "Discovery",
    tags: ["tracks"],
  }]);
});

test("event runtime supports authoring fixture for surfaces, dialog nodes, and command choices", () => {
  const journalEntries = [];
  const notices = [];
  const commands = [];
  const runtime = createEventRuntime({
    journalRuntime: {
      addEntry: (entry) => journalEntries.push(entry),
    },
    onNotice: (notice) => notices.push(notice),
    dispatchCommand: (command) => {
      commands.push(command);
      return { ok: true };
    },
  });
  runtime.loadDefinitions([
    {
      id: "fixture.encounter",
      startNode: "intro",
      trigger: { type: "fixture_encounter", once: false },
      presentation: { level: "blocking", surface: "encounter", time: { mode: "keep" } },
      nodes: {
        intro: {
          contentId: "tutorial.first_steps",
          choices: [{
            id: "act",
            label: "Act",
            command: { type: "core/activity/startGathering" },
            next: "done",
          }],
        },
        done: {
          contentId: "gameplay.gathering",
          choices: [{ id: "close", label: "Close", close: true }],
        },
      },
    },
    {
      id: "fixture.journal",
      contentId: "gameplay.travel",
      trigger: { type: "fixture_journal", once: false },
      presentation: { level: "notice", surface: "journal" },
      journal: { category: "Fixture", tags: ["journal"] },
    },
    {
      id: "fixture.silent",
      contentId: "world.knowledge",
      trigger: { type: "fixture_silent", once: false },
      presentation: { level: "silent", surface: "silent" },
      journal: { addOnTrigger: false },
    },
  ]);

  assert.equal(runtime.trigger("fixture_encounter").queued, 1);
  assert.equal(runtime.getSnapshot().active.surface, "encounter");
  assert.equal(runtime.chooseActiveChoice("act").ok, true);
  assert.deepEqual(commands, [{ type: "core/activity/startGathering" }]);
  assert.equal(runtime.getSnapshot().active.nodeId, "done");
  assert.equal(runtime.chooseActiveChoice("close").ok, true);

  assert.equal(runtime.trigger("fixture_journal").processed, 1);
  assert.deepEqual(notices, [{
    id: "fixture.journal",
    contentId: "gameplay.travel",
    level: "notice",
  }]);
  assert.deepEqual(journalEntries, [{
    sourceEventId: "fixture.journal",
    contentId: "gameplay.travel",
    category: "Fixture",
    tags: ["journal"],
  }]);

  assert.equal(runtime.trigger("fixture_silent").processed, 1);
  assert.equal(runtime.getSnapshot().active, null);
  assert.equal(notices.length, 1);
});

test("event runtime gates triggers by payload strength", () => {
  const notices = [];
  const runtime = createEventRuntime({
    onNotice: (notice) => notices.push(notice),
  });
  runtime.loadDefinitions([{
    id: "tracks.fresh_sign",
    contentId: "world.tracks",
    trigger: {
      type: "trail_discovered",
      once: false,
      minStrength: 0.7,
      maxStrength: 0.95,
    },
    presentation: { level: "notice", mode: "article" },
    journal: { addOnTrigger: false },
  }]);

  assert.deepEqual(runtime.trigger("trail_discovered", { strength: 0.5 }), {
    ok: true,
    queued: 0,
    processed: 0,
    payload: { strength: 0.5 },
  });
  assert.deepEqual(runtime.trigger("trail_discovered", { strength: 0.99 }), {
    ok: true,
    queued: 0,
    processed: 0,
    payload: { strength: 0.99 },
  });
  assert.deepEqual(runtime.trigger("trail_discovered", { strength: 0.72 }), {
    ok: true,
    queued: 0,
    processed: 1,
    payload: { strength: 0.72 },
  });
  assert.deepEqual(notices, [{
    id: "tracks.fresh_sign",
    contentId: "world.tracks",
    level: "notice",
  }]);
});

test("event runtime opens queued blocking events by priority then definition order", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([
    {
      id: "tutorial.low",
      contentId: "tutorial.low",
      priority: 1,
      trigger: { type: "gameplay_started", once: false },
      presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    },
    {
      id: "tutorial.high_a",
      contentId: "tutorial.high_a",
      priority: 10,
      trigger: { type: "gameplay_started", once: false },
      presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    },
    {
      id: "tutorial.high_b",
      contentId: "tutorial.high_b",
      priority: 10,
      trigger: { type: "gameplay_started", once: false },
      presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    },
  ]);

  assert.deepEqual(runtime.trigger("gameplay_started"), {
    ok: true,
    queued: 3,
    processed: 0,
    payload: {},
  });
  assert.equal(runtime.getSnapshot().active.id, "tutorial.high_a");
  assert.deepEqual(runtime.getSnapshot().queuedIds, ["tutorial.high_b", "tutorial.low"]);
  runtime.closeActive();
  assert.equal(runtime.getSnapshot().active.id, "tutorial.high_b");
  runtime.closeActive();
  assert.equal(runtime.getSnapshot().active.id, "tutorial.low");
});

test("event runtime lets an eligible exclusive definition consume lower-priority matches", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([
    {
      id: "tutorial.default",
      contentId: "tutorial.gathering_started",
      priority: 0,
      trigger: { type: "gathering_started", once: false },
      presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    },
    {
      id: "map.gathering",
      contentId: "map.map3_gathering_test",
      priority: 100,
      trigger: { type: "gathering_started", once: false, exclusive: true },
      presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    },
  ]);

  assert.deepEqual(runtime.trigger("gathering_started"), {
    ok: true,
    queued: 1,
    processed: 0,
    payload: {},
  });
  assert.equal(runtime.getSnapshot().active.id, "map.gathering");
  assert.deepEqual(runtime.getSnapshot().queuedIds, []);
  assert.deepEqual(runtime.getSnapshot().lastTriggerResult.skipped, [{
    id: "tutorial.default",
    reason: "trigger-consumed",
  }]);
});

test("event runtime enforces maxCount for repeatable events", () => {
  const notices = [];
  const runtime = createEventRuntime({
    onNotice: (notice) => notices.push(notice),
  });
  runtime.loadDefinitions([{
    id: "warning.repeatable",
    contentId: "survival.hydration",
    trigger: {
      type: "condition_warning",
      maxCount: 2,
    },
    presentation: { level: "notice", mode: "article" },
    journal: { addOnTrigger: false },
  }]);

  assert.equal(runtime.trigger("condition_warning").processed, 1);
  assert.equal(runtime.trigger("condition_warning").processed, 1);
  assert.equal(runtime.trigger("condition_warning").processed, 0);
  assert.equal(notices.length, 2);
  assert.deepEqual(runtime.getPersistenceSnapshot().triggerCounts, {
    "warning.repeatable": 2,
  });
});

test("event runtime enforces cooldownTicks for repeatable events", () => {
  let tick = 10;
  const notices = [];
  const runtime = createEventRuntime({
    getTimeTick: () => tick,
    onNotice: (notice) => notices.push(notice),
  });
  runtime.loadDefinitions([{
    id: "warning.cooldown",
    contentId: "survival.fatigue",
    trigger: {
      type: "condition_warning",
      cooldownTicks: 5,
    },
    presentation: { level: "notice", mode: "article" },
    journal: { addOnTrigger: false },
  }]);

  assert.equal(runtime.trigger("condition_warning").processed, 1);
  tick = 14;
  assert.equal(runtime.trigger("condition_warning").processed, 0);
  tick = 15;
  assert.equal(runtime.trigger("condition_warning").processed, 1);
  assert.equal(notices.length, 2);
  assert.deepEqual(runtime.getPersistenceSnapshot().lastTriggeredTicks, {
    "warning.cooldown": 15,
  });
});

test("event runtime applies journal/add choice outcomes before closing", () => {
  const journalEntries = [];
  const runtime = createEventRuntime({
    wikiRuntime: {
      openArticle: () => {},
      close: () => {},
    },
    journalRuntime: {
      addEntry: (entry) => {
        journalEntries.push(entry);
        return { ok: true };
      },
    },
  });
  runtime.loadDefinitions([{
    id: "choice.journal",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    choices: [{
      id: "remember",
      label: "Remember this",
      close: true,
      outcomes: [{
        type: "journal/add",
        contentId: "gameplay.travel",
        category: "Tutorial",
        tags: ["travel"],
      }],
    }],
  }]);

  runtime.trigger("gameplay_started");
  assert.deepEqual(runtime.chooseActiveChoice("remember"), {
    ok: true,
    action: "close",
  });
  assert.deepEqual(journalEntries, [{
    sourceEventId: "choice.journal:remember:outcome_1",
    contentId: "gameplay.travel",
    category: "Tutorial",
    tags: ["travel"],
  }]);
});

test("event runtime persists event flags from choice outcomes", () => {
  const runtime = createEventRuntime({
    wikiRuntime: {
      openArticle: () => {},
      close: () => {},
    },
  });
  runtime.loadDefinitions([{
    id: "choice.flags",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    choices: [{
      id: "mark",
      label: "Mark",
      close: true,
      outcomes: [
        { type: "event/setFlag", flag: "saw_tracks", value: true },
        { type: "event/setFlag", flag: "route_hint_level", value: 2 },
      ],
    }],
  }]);

  runtime.trigger("gameplay_started");
  assert.equal(runtime.chooseActiveChoice("mark").ok, true);
  assert.deepEqual(runtime.getPersistenceSnapshot().flags, {
    saw_tracks: true,
    route_hint_level: 2,
  });

  const restored = createEventRuntime();
  restored.applyPersistenceSnapshot({
    flags: {
      saw_tracks: true,
      route_hint_level: 2,
    },
  });
  assert.deepEqual(restored.getSnapshot().flags, {
    saw_tracks: true,
    route_hint_level: 2,
  });
});

test("event runtime blocks choice advance for unknown outcomes", () => {
  const commands = [];
  const runtime = createEventRuntime({
    dispatchCommand: (command) => {
      commands.push(command);
      return { ok: true };
    },
  });
  runtime.loadDefinitions([{
    id: "choice.unknown_outcome",
    startNode: "intro",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    nodes: {
      intro: {
        contentId: "tutorial.first_steps",
        choices: [{
          id: "bad",
          label: "Bad",
          next: "done",
          command: { type: "core/activity/startGathering" },
          outcomes: [{ type: "inventory/grant", itemId: "water_skin" }],
        }],
      },
      done: {
        contentId: "wiki.index",
        choices: [],
      },
    },
  }]);

  runtime.trigger("gameplay_started");
  assert.deepEqual(runtime.chooseActiveChoice("bad"), {
    ok: false,
    reason: "unknown-outcome",
    outcomeType: "inventory/grant",
  });
  assert.equal(runtime.getSnapshot().active.nodeId, "intro");
  assert.deepEqual(runtime.getSnapshot().active.error, {
    reason: "unknown-outcome",
    message: "This choice uses an unsupported outcome.",
  });
  assert.deepEqual(commands, []);
});

test("event runtime restores repeat policy counters from persistence", () => {
  const notices = [];
  const runtime = createEventRuntime({
    onNotice: (notice) => notices.push(notice),
  });
  runtime.loadDefinitions([{
    id: "warning.repeatable",
    contentId: "survival.hydration",
    trigger: {
      type: "condition_warning",
      maxCount: 1,
    },
    presentation: { level: "notice", mode: "article" },
    journal: { addOnTrigger: false },
  }]);
  runtime.applyPersistenceSnapshot({
    triggerCounts: {
      "warning.repeatable": 1,
    },
  });

  assert.equal(runtime.trigger("condition_warning").processed, 0);
  assert.deepEqual(notices, []);
});

test("event runtime advances dialog nodes through choices", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([{
    id: "tutorial.basic_loop",
    startNode: "intro",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    nodes: {
      intro: {
        contentId: "tutorial.first_steps",
        choices: [{ id: "continue", label: "Continue", next: "travel" }],
      },
      travel: {
        contentId: "gameplay.travel",
        choices: [{ id: "finish", label: "Finish", close: true }],
      },
    },
  }]);

  runtime.trigger("gameplay_started");
  assert.deepEqual(runtime.getSnapshot().active, {
    id: "tutorial.basic_loop",
    nodeId: "intro",
    contentId: "tutorial.first_steps",
    mode: "article",
    surface: "encounter",
    choices: [{
      id: "continue",
      label: "Continue",
      next: "travel",
      close: false,
      consequenceVisibility: "hidden",
      consequenceText: "",
      hintText: "",
      command: null,
    }],
  });

  assert.deepEqual(runtime.chooseActiveChoice("continue"), {
    ok: true,
    action: "next",
    nodeId: "travel",
  });
  assert.equal(runtime.getSnapshot().active.nodeId, "travel");
  assert.deepEqual(runtime.chooseActiveChoice("finish"), {
    ok: true,
    action: "close",
  });
  assert.equal(runtime.getSnapshot().active, null);
});

test("event runtime normalizes choice consequence visibility metadata", () => {
  const runtime = createEventRuntime({
    wikiRuntime: {
      openArticle: () => {},
      close: () => {},
    },
  });
  runtime.loadDefinitions([{
    id: "choice.visibility",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    choices: [
      {
        id: "exact",
        label: "Exact",
        consequenceVisibility: "exact",
        consequenceText: "+5 water",
        hintText: "Gain water",
        close: true,
      },
      {
        id: "hinted",
        label: "Hinted",
        consequenceVisibility: "hinted",
        consequenceText: "+5 water",
        hintText: "Gain water",
        close: true,
      },
      {
        id: "hidden",
        label: "Hidden",
        consequenceVisibility: "hidden",
        consequenceText: "+5 water",
        hintText: "Gain water",
        close: true,
      },
      {
        id: "knowledge",
        label: "Knowledge",
        consequenceVisibility: "knowledgeBased",
        hintText: "You may learn something.",
        close: true,
      },
    ],
  }]);

  runtime.trigger("gameplay_started");
  assert.deepEqual(runtime.getSnapshot().active.choices, [
    {
      id: "exact",
      label: "Exact",
      next: "",
      close: true,
      consequenceVisibility: "exact",
      consequenceText: "+5 water",
      hintText: "Gain water",
      command: null,
    },
    {
      id: "hinted",
      label: "Hinted",
      next: "",
      close: true,
      consequenceVisibility: "hinted",
      consequenceText: "+5 water",
      hintText: "Gain water",
      command: null,
    },
    {
      id: "hidden",
      label: "Hidden",
      next: "",
      close: true,
      consequenceVisibility: "hidden",
      consequenceText: "+5 water",
      hintText: "Gain water",
      command: null,
    },
    {
      id: "knowledge",
      label: "Knowledge",
      next: "",
      close: true,
      consequenceVisibility: "knowledgeBased",
      consequenceText: "",
      hintText: "You may learn something.",
      command: null,
    },
  ]);
});

test("event runtime dispatches choice commands before advancing", () => {
  const commands = [];
  const runtime = createEventRuntime({
    dispatchCommand: (command) => {
      commands.push(command);
      return { ok: true };
    },
  });
  runtime.loadDefinitions([{
    id: "choice.command",
    startNode: "intro",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    nodes: {
      intro: {
        contentId: "tutorial.first_steps",
        choices: [{
          id: "start",
          label: "Start",
          command: { type: "core/activity/startGathering", source: "event" },
          next: "done",
        }],
      },
      done: {
        contentId: "wiki.index",
        choices: [],
      },
    },
  }]);

  runtime.trigger("gameplay_started");
  assert.deepEqual(runtime.chooseActiveChoice("start"), {
    ok: true,
    action: "next",
    nodeId: "done",
  });
  assert.deepEqual(commands, [{ type: "core/activity/startGathering", source: "event" }]);
});

test("event runtime does not advance when choice command fails", () => {
  const runtime = createEventRuntime({
    dispatchCommand: () => ({ ok: false, reason: "blocked" }),
  });
  runtime.loadDefinitions([{
    id: "choice.command",
    startNode: "intro",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    nodes: {
      intro: {
        contentId: "tutorial.first_steps",
        choices: [{
          id: "start",
          label: "Start",
          command: { type: "core/activity/startGathering" },
          next: "done",
        }],
      },
      done: {
        contentId: "wiki.index",
        choices: [],
      },
    },
  }]);

  runtime.trigger("gameplay_started");
  assert.deepEqual(runtime.chooseActiveChoice("start"), {
    ok: false,
    reason: "command-failed",
    result: { ok: false, reason: "blocked" },
  });
  assert.equal(runtime.getSnapshot().active.nodeId, "intro");
  assert.deepEqual(runtime.getSnapshot().active.error, {
    reason: "command-failed",
    message: "This action could not be completed.",
  });
});

test("event runtime reports invalid dialog choices without changing active node", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([{
    id: "tutorial.basic_loop",
    startNode: "intro",
    trigger: { type: "gameplay_started", once: false },
    presentation: { level: "blocking", mode: "article", time: { mode: "keep" } },
    nodes: {
      intro: {
        contentId: "tutorial.first_steps",
        choices: [{ id: "continue", label: "Continue", next: "missing" }],
      },
    },
  }]);

  runtime.trigger("gameplay_started");
  assert.deepEqual(runtime.chooseActiveChoice("missing-choice"), {
    ok: false,
    reason: "missing-choice",
  });
  assert.deepEqual(runtime.chooseActiveChoice("continue"), {
    ok: false,
    reason: "missing-next-node",
  });
  assert.equal(runtime.getSnapshot().active.nodeId, "intro");
});

test("event runtime reset clears persisted encounter state", () => {
  const speeds = [];
  const runtime = createEventRuntime({
    getTimeSpeed: () => 20,
    setTimeSpeed: (speed) => speeds.push(speed),
    getTimeTick: () => 7,
  });
  runtime.loadDefinitions([{
    id: "tutorial.reset",
    contentId: "tutorial.first_steps",
    trigger: { type: "gameplay_started", once: true },
    presentation: { level: "blocking", mode: "article", time: { mode: "pause" } },
  }]);

  runtime.trigger("gameplay_started");
  assert.equal(runtime.getSnapshot().active.id, "tutorial.reset");
  assert.deepEqual(speeds, [0]);

  assert.equal(runtime.resetPersistenceState(), true);
  assert.deepEqual(runtime.getPersistenceSnapshot(), {
    seenIds: [],
    triggerCounts: {},
    lastTriggeredTicks: {},
    flags: {},
  });
  assert.equal(runtime.getSnapshot().active, null);
  assert.deepEqual(speeds, [0, 20]);
});

test("event runtime can replace definitions for map-local event reloads", () => {
  const runtime = createEventRuntime();
  runtime.loadDefinitions([{
    id: "event.global",
    contentId: "wiki.index",
    trigger: { type: "global_started", once: false },
    presentation: { level: "notice", mode: "article" },
  }]);
  runtime.replaceDefinitions([{
    id: "event.global",
    contentId: "wiki.index",
    trigger: { type: "global_started", once: false },
    presentation: { level: "notice", mode: "article" },
  }, {
    id: "event.map",
    contentId: "gameplay.travel",
    trigger: { type: "map_started", once: false },
    presentation: { level: "notice", mode: "article" },
  }]);

  assert.deepEqual(runtime.getSnapshot().definitionIds, ["event.global", "event.map"]);
  assert.deepEqual(runtime.trigger("map_started"), {
    ok: true,
    queued: 0,
    processed: 1,
    payload: {},
  });
  assert.deepEqual(runtime.getSnapshot().seenIds, ["event.map"]);
});
