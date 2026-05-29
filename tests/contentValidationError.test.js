import assert from "node:assert/strict";
import test from "node:test";

import {
  createContentValidationError,
  formatContentValidationError,
  formatMissingContentReferences,
  isContentValidationError,
} from "../src/content/contentValidationError.js";

test("content validation formatter renders each missing reference on its own line", () => {
  const validation = {
    ok: false,
    missing: [
      { source: "article:wiki.index:file-link", contentId: "missing.md" },
      { source: "event:tutorial.first_steps", contentId: "missing.article" },
    ],
  };

  assert.equal(
    formatMissingContentReferences(validation),
    "article:wiki.index:file-link -> missing.md\nevent:tutorial.first_steps -> missing.article",
  );
});

test("content validation errors preserve phase and readable title-screen details", () => {
  const validation = {
    ok: false,
    missing: [
      { source: "duplicate event ID already defined globally", contentId: "tutorial.first_steps" },
    ],
  };
  const error = createContentValidationError("Map encounter definitions (assets/map3/events.json)", validation);

  assert.equal(isContentValidationError(error), true);
  assert.equal(error.code, "CONTENT_VALIDATION_FAILED");
  assert.equal(
    formatContentValidationError(error),
    "Content validation failed.\nMap encounter definitions (assets/map3/events.json): duplicate event ID already defined globally -> tutorial.first_steps",
  );
});

test("content validation formatter falls back for ordinary errors", () => {
  assert.equal(formatContentValidationError(new Error("Plain failure")), "Plain failure");
});
