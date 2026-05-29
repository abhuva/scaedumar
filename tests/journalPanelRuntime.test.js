import assert from "node:assert/strict";
import test from "node:test";

import {
  createJournalEntryViewModel,
  filterJournalEntriesByCategory,
  getJournalCategories,
  getJournalEntryLinkAriaLabel,
  handleJournalFeedWheel,
} from "../src/ui/journalPanelRuntime.js";

test("journal entry view model resolves article title for link display", () => {
  const view = createJournalEntryViewModel({
    id: "journal_001",
    category: "Tutorial",
    contentId: "gameplay.travel",
  }, (id) => id === "gameplay.travel" ? { title: "Travel" } : null);

  assert.deepEqual(view, {
    id: "journal_001",
    contentId: "gameplay.travel",
    category: "Tutorial",
    title: "Travel",
    ariaLabel: "Open journal entry Tutorial: Travel",
  });
});

test("journal entry view model falls back to content id", () => {
  const view = createJournalEntryViewModel({
    category: "Debug",
    contentId: "tutorial.event_debug",
  }, () => null);

  assert.equal(view.title, "tutorial.event_debug");
  assert.equal(view.ariaLabel, "Open journal entry Debug: tutorial.event_debug");
});

test("journal entry link aria label handles missing values", () => {
  assert.equal(
    getJournalEntryLinkAriaLabel({}, ""),
    "Open journal entry Journal: article",
  );
});

test("journal categories are unique and sorted", () => {
  assert.deepEqual(getJournalCategories([
    { category: "Warning" },
    { category: "Tutorial" },
    { category: "Warning" },
    {},
  ]), ["Journal", "Tutorial", "Warning"]);
});

test("journal category filter preserves order and falls back to all", () => {
  const entries = [
    { id: "journal_003", category: "Warning" },
    { id: "journal_002", category: " Tutorial " },
    { id: "journal_001", category: "Warning" },
  ];

  assert.deepEqual(filterJournalEntriesByCategory(entries, "Warning").map((entry) => entry.id), [
    "journal_003",
    "journal_001",
  ]);
  assert.deepEqual(filterJournalEntriesByCategory(entries, "Tutorial").map((entry) => entry.id), [
    "journal_002",
  ]);
  assert.deepEqual(filterJournalEntriesByCategory(entries, "").map((entry) => entry.id), [
    "journal_003",
    "journal_002",
    "journal_001",
  ]);
});

test("journal feed wheel scrolls text area while expanded", () => {
  let prevented = false;
  let stopped = false;
  const entriesEl = { scrollTop: 4, clientHeight: 20, scrollHeight: 100 };
  const handled = handleJournalFeedWheel(entriesEl, true, {
    deltaY: 12,
    preventDefault: () => {
      prevented = true;
    },
    stopPropagation: () => {
      stopped = true;
    },
  });

  assert.equal(handled, true);
  assert.equal(entriesEl.scrollTop, 16);
  assert.equal(prevented, true);
  assert.equal(stopped, true);
});

test("journal feed wheel lets parent handle scroll at limits", () => {
  let prevented = false;
  const entriesEl = { scrollTop: 80, clientHeight: 20, scrollHeight: 100 };
  const handled = handleJournalFeedWheel(entriesEl, true, {
    deltaY: 12,
    preventDefault: () => {
      prevented = true;
    },
  });

  assert.equal(handled, false);
  assert.equal(entriesEl.scrollTop, 80);
  assert.equal(prevented, false);
});

test("journal feed wheel does not hijack scrolling while collapsed", () => {
  const entriesEl = { scrollTop: 4 };
  const handled = handleJournalFeedWheel(entriesEl, false, { deltaY: 12 });

  assert.equal(handled, false);
  assert.equal(entriesEl.scrollTop, 4);
});
