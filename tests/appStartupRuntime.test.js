import assert from "node:assert/strict";
import test from "node:test";

import { tryAutoLoadDefaultMapRuntime } from "../src/core/appStartupRuntime.js";
import { createContentValidationError } from "../src/content/contentValidationError.js";

test("startup auto-load surfaces content validation details and rejects", async () => {
  const statuses = [];
  const validationError = createContentValidationError("Global wiki/encounter definitions", {
    ok: false,
    missing: [{ source: "event:tutorial.first_steps", contentId: "missing.article" }],
  });

  await assert.rejects(
    () => tryAutoLoadDefaultMapRuntime({
      tryAutoLoadDefaultMap: async () => {
        throw validationError;
      },
      setStatus: (text, options) => statuses.push({ text, options }),
    }),
    /Content validation failed/,
  );

  assert.deepEqual(statuses, [{
    text: "Content validation failed.\nGlobal wiki/encounter definitions: event:tutorial.first_steps -> missing.article",
    options: { kind: "error", progress: 1 },
  }]);
});

test("startup auto-load keeps non-content failures non-fatal", async () => {
  const statuses = [];

  await tryAutoLoadDefaultMapRuntime({
    tryAutoLoadDefaultMap: async () => {
      throw new Error("Texture missing");
    },
    setStatus: (text, options) => statuses.push({ text, options }),
  });

  assert.deepEqual(statuses, [{
    text: "Default map auto-load failed: Texture missing",
    options: undefined,
  }]);
});
