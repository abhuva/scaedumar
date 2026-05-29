import assert from "node:assert/strict";
import test from "node:test";

import { createWikiRuntime } from "../src/gameplay/wikiRuntime.js";

function createRegistry(articles) {
  const byId = new Map(articles.map((article) => [article.id, article]));
  return {
    hasArticle: (id) => byId.has(id),
    getArticle: (id) => byId.get(id) || null,
  };
}

test("wiki runtime exposes missing article state for unresolved IDs", () => {
  const changes = [];
  const runtime = createWikiRuntime({
    contentRegistry: createRegistry([]),
    onChanged: (snapshot, reason) => changes.push({ snapshot, reason }),
  });

  assert.deepEqual(runtime.openArticle("missing.article"), {
    ok: false,
    reason: "missing-article",
    articleId: "missing.article",
  });
  assert.equal(runtime.getSnapshot().article.missing, true);
  assert.equal(runtime.getSnapshot().article.id, "missing.article");
  assert.equal(changes.at(-1).reason, "missing-article");
});

test("wiki runtime can navigate back from a missing article", () => {
  const runtime = createWikiRuntime({
    contentRegistry: createRegistry([{
      id: "wiki.index",
      title: "Index",
      summary: "",
      category: "reference",
      tags: [],
      related: [],
      body: "Index body.",
    }]),
  });

  assert.equal(runtime.openArticle("wiki.index").ok, true);
  assert.equal(runtime.openArticle("missing.article").ok, false);
  assert.equal(runtime.getSnapshot().article.missing, true);
  assert.equal(runtime.goBack(), true);
  assert.equal(runtime.getSnapshot().article.id, "wiki.index");
  assert.equal(runtime.getSnapshot().article.missing, undefined);
});
