import test from "node:test";
import assert from "node:assert/strict";

import { loadActivityDefinitions, normalizeActivityDefinitions } from "../src/gameplay/activityRegistry.js";

test("normalizeActivityDefinitions converts activity JSON into UI and cost metadata", () => {
  const definitions = normalizeActivityDefinitions({
    gathering: {
      label: "Gathering",
      buttonLabel: "G",
      panel: true,
      command: "core/activity/startGathering",
      cancelLabel: "Gathering canceled.",
      costKeys: {
        work: "gathering.search",
        upkeep: "idle.tick",
      },
    },
  });

  assert.equal(definitions.gathering.id, "gathering");
  assert.equal(definitions.gathering.buttonLabel, "G");
  assert.equal(definitions.gathering.panel, true);
  assert.equal(definitions.gathering.costKeys.work, "gathering.search");
});

test("loadActivityDefinitions fetches and normalizes activity data", async () => {
  const definitions = await loadActivityDefinitions({
    url: "activities.json",
    fetchFn: async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        rest: {
          label: "Resting",
          buttonLabel: "R",
          costKeys: {
            recovery: "rest.tick",
          },
        },
      }),
    }),
  });

  assert.equal(definitions.rest.label, "Resting");
  assert.equal(definitions.rest.costKeys.recovery, "rest.tick");
});
