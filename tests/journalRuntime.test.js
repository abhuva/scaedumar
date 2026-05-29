import assert from "node:assert/strict";
import test from "node:test";

import { createJournalRuntime } from "../src/gameplay/journalRuntime.js";

test("journal adds content-linked entries and blocks duplicate source events", () => {
  let changes = 0;
  const journal = createJournalRuntime({
    getTimeTick: () => 42,
    onChanged: () => {
      changes += 1;
    },
  });

  const added = journal.addEntry({
    sourceEventId: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    category: "Tutorial",
    tags: ["tutorial"],
  });
  const duplicate = journal.addEntry({
    sourceEventId: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
  });

  assert.equal(added.ok, true);
  assert.equal(duplicate.ok, false);
  assert.equal(changes, 1);
  assert.deepEqual(journal.getSnapshot().entries, [{
    id: "journal_001",
    sourceEventId: "tutorial.first_steps",
    contentId: "tutorial.first_steps",
    timeTick: 42,
    category: "Tutorial",
    tags: ["tutorial"],
  }]);
});

test("journal restores persisted entries and advances generated IDs", () => {
  const journal = createJournalRuntime();

  journal.applyPersistenceSnapshot({
    entries: [{
      id: "journal_004",
      sourceEventId: "tutorial.first_steps",
      contentId: "tutorial.first_steps",
      timeTick: 12,
      category: "Tutorial",
      tags: ["tutorial"],
    }],
  });
  const added = journal.addEntry({
    sourceEventId: "event.next",
    contentId: "wiki.index",
  });

  assert.equal(added.ok, true);
  assert.equal(added.entry.id, "journal_005");
  assert.deepEqual(journal.getPersistenceSnapshot().entries.map((entry) => entry.id), [
    "journal_004",
    "journal_005",
  ]);
});

test("journal reset clears entries and resets generated ids", () => {
  const journal = createJournalRuntime();
  journal.addEntry({ contentId: "tutorial.first_steps" });

  assert.equal(journal.resetPersistenceState(), true);
  assert.deepEqual(journal.getSnapshot(), { entries: [] });
  assert.equal(journal.addEntry({ contentId: "gameplay.travel" }).entry.id, "journal_001");
});
