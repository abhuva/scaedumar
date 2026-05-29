import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createContentRegistry,
  normalizeArticle,
  validateContentReferences,
  WIKI_ARTICLE_PATHS,
} from "../src/content/contentRegistry.js";
import {
  GLOBAL_EVENT_DEFINITION_PATHS,
  loadEventDefinitionFiles,
} from "../src/content/eventDefinitionLoader.js";

test("normalizeArticle reads frontmatter IDs and metadata", () => {
  const article = normalizeArticle("docs/wiki/gameplay/travel.md", `---
id: gameplay.travel
title: Travel
summary: Move carefully.
tags: [travel, pathfinding]
---

# Travel

Plan before moving.`);

  assert.equal(article.id, "gameplay.travel");
  assert.equal(article.title, "Travel");
  assert.equal(article.summary, "Move carefully.");
  assert.deepEqual(article.tags, ["travel", "pathfinding"]);
  assert.equal(article.body.includes("Plan before moving."), true);
});

test("normalizeArticle records CommonMark file links", () => {
  const article = normalizeArticle("docs/wiki/index.md", `---
id: wiki.index
title: Index
---

[Travel](gameplay/travel.md)
[External](https://example.test)
[File](./local.md)`);

  assert.deepEqual(article.links, ["gameplay/travel.md", "./local.md"]);
});

test("content registry rejects duplicate article IDs", () => {
  const registry = createContentRegistry();
  registry.registerArticle({ id: "a", title: "A", tags: [], related: [] });
  assert.throws(
    () => registry.registerArticle({ id: "a", title: "Duplicate", tags: [], related: [] }),
    /Duplicate wiki article ID: a/,
  );
});

test("content registry validates article and event content references", () => {
  const registry = createContentRegistry();
  registry.registerArticle(normalizeArticle("docs/wiki/index.md", `---
id: wiki.index
title: Index
related: [missing.related]
---

[Missing Link](missing-link.md)
[Legacy Link](missing.legacy)
[Travel](gameplay/travel.md)`));
  registry.registerArticle(normalizeArticle("docs/wiki/gameplay/travel.md", `---
id: gameplay.travel
title: Travel
---

Travel article.`));
  registry.resolveAllArticleLinks();

  assert.deepEqual(validateContentReferences(registry, {
    eventDefinitions: [{
      id: "tutorial.missing",
      contentId: "missing.event",
      choices: [{
        outcomes: [{
          type: "journal/add",
          contentId: "missing.journal",
        }],
      }],
    }],
  }), {
    ok: false,
    missing: [
      { source: "article:wiki.index:related", contentId: "missing.related" },
      { source: "article:wiki.index:legacy-link", contentId: "missing.legacy" },
      { source: "article:wiki.index:file-link", contentId: "missing-link.md" },
      { source: "event:tutorial.missing", contentId: "missing.event" },
      { source: "event:tutorial.missing", contentId: "missing.journal" },
    ],
  });
});

test("content registry rewrites resolved file links to runtime article IDs", () => {
  const registry = createContentRegistry();
  registry.registerArticle(normalizeArticle("docs/wiki/index.md", `---
id: wiki.index
title: Index
---

[Travel](gameplay/travel.md)`));
  registry.registerArticle(normalizeArticle("docs/wiki/gameplay/travel.md", `---
id: gameplay.travel
title: Travel
---

Travel article.`));
  registry.resolveAllArticleLinks();

  const article = registry.getArticle("wiki.index");
  assert.equal(article.body.includes("[Travel](gameplay.travel)"), true);
  assert.deepEqual(article.links, ["gameplay.travel"]);
  assert.deepEqual(validateContentReferences(registry), {
    ok: true,
    missing: [],
  });
});

test("shipped wiki articles load and pass content reference validation", async () => {
  const registry = createContentRegistry({
    fetchText: (path) => readFile(path, "utf8"),
  });
  await registry.loadArticles(WIKI_ARTICLE_PATHS);
  const eventDefinitions = await loadEventDefinitionFiles(GLOBAL_EVENT_DEFINITION_PATHS, {
    fetchJson: async (path) => JSON.parse(await readFile(path, "utf8")),
  });

  assert.deepEqual(validateContentReferences(registry, { eventDefinitions }), {
    ok: true,
    missing: [],
  });
  assert.equal(registry.hasArticle("gameplay.gathering"), true);
  assert.equal(registry.hasArticle("survival.hydration"), true);
  assert.equal(registry.hasArticle("world.knowledge"), true);
});
