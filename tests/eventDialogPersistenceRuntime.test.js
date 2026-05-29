import assert from "node:assert/strict";
import test from "node:test";

import {
  createEventDialogPersistenceRuntime,
  migrateEventDialogPersistencePayload,
} from "../src/gameplay/eventDialogPersistenceRuntime.js";

function createStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
    dump: () => Object.fromEntries(data.entries()),
  };
}

test("event dialog persistence saves event and journal snapshots", () => {
  const storage = createStorage();
  const runtime = createEventDialogPersistenceRuntime({
    storage,
    key: "test",
    eventRuntime: {
      getPersistenceSnapshot: () => ({ seenIds: ["tutorial.first_steps"] }),
    },
    journalRuntime: {
      getPersistenceSnapshot: () => ({ entries: [{ id: "journal_001", contentId: "tutorial.first_steps" }] }),
    },
  });

  assert.equal(runtime.save(), true);
  assert.deepEqual(JSON.parse(storage.dump().test), {
    version: 1,
    events: { seenIds: ["tutorial.first_steps"] },
    journal: { entries: [{ id: "journal_001", contentId: "tutorial.first_steps" }] },
  });
});

test("event dialog persistence loads event and journal snapshots", () => {
  const storage = createStorage({
    test: JSON.stringify({
      version: 1,
      events: { seenIds: ["tutorial.first_steps"] },
      journal: { entries: [{ id: "journal_001", contentId: "tutorial.first_steps" }] },
    }),
  });
  const applied = [];
  const runtime = createEventDialogPersistenceRuntime({
    storage,
    key: "test",
    eventRuntime: {
      applyPersistenceSnapshot: (snapshot) => applied.push(["events", snapshot]),
    },
    journalRuntime: {
      applyPersistenceSnapshot: (snapshot) => applied.push(["journal", snapshot]),
    },
  });

  assert.equal(runtime.load(), true);
  assert.deepEqual(applied, [
    ["events", { seenIds: ["tutorial.first_steps"] }],
    ["journal", { entries: [{ id: "journal_001", contentId: "tutorial.first_steps" }] }],
  ]);
});

test("event dialog persistence migrates legacy payloads without explicit version", () => {
  assert.deepEqual(migrateEventDialogPersistencePayload({
    events: { seenIds: ["tutorial.first_steps"] },
    journal: { entries: [] },
  }), {
    version: 1,
    events: { seenIds: ["tutorial.first_steps"] },
    journal: { entries: [] },
  });
});

test("event dialog persistence rejects unsupported payload versions", () => {
  const storage = createStorage({
    test: JSON.stringify({
      version: 999,
      events: { seenIds: ["tutorial.first_steps"] },
      journal: { entries: [] },
    }),
  });
  const applied = [];
  const runtime = createEventDialogPersistenceRuntime({
    storage,
    key: "test",
    eventRuntime: {
      applyPersistenceSnapshot: (snapshot) => applied.push(["events", snapshot]),
    },
    journalRuntime: {
      applyPersistenceSnapshot: (snapshot) => applied.push(["journal", snapshot]),
    },
  });

  assert.equal(runtime.load(), false);
  assert.deepEqual(applied, []);
});

test("event dialog persistence clears stored payload", () => {
  const storage = createStorage({ test: "stored" });
  const runtime = createEventDialogPersistenceRuntime({
    storage,
    key: "test",
  });

  assert.equal(runtime.clear(), true);
  assert.deepEqual(storage.dump(), {});
});
