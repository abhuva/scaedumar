import test from "node:test";
import assert from "node:assert/strict";

import { loadItemDefinitions, normalizeItemDefinitions } from "../src/gameplay/itemRegistry.js";

test("normalizeItemDefinitions converts asset JSON into registry entries", () => {
  const registry = normalizeItemDefinitions({
    berries: {
      name: "Berries",
      maxStack: 20,
      weight: 0.08,
      bulk: 0.12,
      tags: ["food"],
    },
  });

  assert.equal(registry.berries.id, "berries");
  assert.equal(registry.berries.name, "Berries");
  assert.equal(registry.berries.stackable, true);
});

test("loadItemDefinitions fetches and normalizes item data", async () => {
  const registry = await loadItemDefinitions({
    url: "items.json",
    fetchFn: async (url) => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        dry_wood: {
          id: "dry_wood",
          name: "Dry Wood",
          maxStack: 20,
          weight: 0.4,
          bulk: 1,
        },
      }),
      url,
    }),
  });

  assert.equal(registry.dry_wood.name, "Dry Wood");
  assert.equal(registry.dry_wood.maxStack, 20);
});
