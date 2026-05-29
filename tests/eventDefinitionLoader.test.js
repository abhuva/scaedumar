import assert from "node:assert/strict";
import test from "node:test";

import {
  GLOBAL_EVENT_DEFINITION_PATHS,
  loadEventDefinitionFiles,
} from "../src/content/eventDefinitionLoader.js";

test("loadEventDefinitionFiles merges event definition files in path order", async () => {
  const loadedPaths = [];
  const definitions = await loadEventDefinitionFiles(["a.json", "b.json"], {
    fetchJson: async (path) => {
      loadedPaths.push(path);
      if (path === "a.json") return [{ id: "event.a", contentId: "wiki.index" }];
      return [{ id: "event.b", contentId: "gameplay.travel" }];
    },
  });

  assert.deepEqual(loadedPaths, ["a.json", "b.json"]);
  assert.deepEqual(definitions.map((definition) => definition.id), ["event.a", "event.b"]);
});

test("loadEventDefinitionFiles default fetch bypasses cache", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (path, options) => {
    calls.push({ path, options });
    return {
      ok: true,
      json: async () => [{ id: "event.cache" }],
    };
  };

  const definitions = await loadEventDefinitionFiles(["events.json"]);

  assert.deepEqual(definitions.map((definition) => definition.id), ["event.cache"]);
  assert.deepEqual(calls, [{
    path: "events.json",
    options: { cache: "no-store" },
  }]);
});

test("loadEventDefinitionFiles rejects duplicate event IDs across files", async () => {
  await assert.rejects(
    () => loadEventDefinitionFiles(["a.json", "b.json"], {
      fetchJson: async (path) => [{ id: "event.same", source: path }],
    }),
    /Duplicate event ID: event\.same in b\.json; already defined in a\.json\./,
  );
});

test("loadEventDefinitionFiles rejects duplicate event IDs across global and map-local files", async () => {
  await assert.rejects(
    () => loadEventDefinitionFiles(["global.json", "map/events.json"], {
      fetchJson: async (path) => [{ id: "event.same", source: path }],
    }),
    /Duplicate event ID: event\.same in map\/events\.json; already defined in global\.json\./,
  );
});

test("loadEventDefinitionFiles ignores missing optional files", async () => {
  const definitions = await loadEventDefinitionFiles(["global.json", { path: "map/events.json", optional: true }], {
    fetchJson: async (path) => {
      if (path === "map/events.json") {
        const error = new Error("Missing optional JSON");
        error.code = "MISSING_OPTIONAL_JSON";
        throw error;
      }
      return [{ id: "event.global", contentId: "wiki.index" }];
    },
  });

  assert.deepEqual(definitions.map((definition) => definition.id), ["event.global"]);
});

test("loadEventDefinitionFiles still reports non-missing optional file errors", async () => {
  await assert.rejects(
    () => loadEventDefinitionFiles([{ path: "map/events.json", optional: true }], {
      fetchJson: async () => {
        throw new Error("bad json");
      },
    }),
    /bad json/,
  );
});

test("loadEventDefinitionFiles rejects event definitions without IDs", async () => {
  await assert.rejects(
    () => loadEventDefinitionFiles(["a.json"], {
      fetchJson: async () => [{ contentId: "wiki.index" }],
    }),
    /Event definition in a\.json is missing an id\./,
  );
});

test("global event definition path list includes current global event files", () => {
  assert.deepEqual(GLOBAL_EVENT_DEFINITION_PATHS, [
    "assets/data/events/tutorials.json",
    "assets/data/events/survival.json",
  ]);
});
