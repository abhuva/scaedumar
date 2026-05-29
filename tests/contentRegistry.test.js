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
import { SEMANTIC_UI_HIGHLIGHT_TARGET_IDS } from "../src/ui/uiHighlightRuntime.js";

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

test("normalizeArticle reads CRLF frontmatter", () => {
  const article = normalizeArticle("docs/wiki/gameplay/travel.md", "---\r\nid: gameplay.travel\r\ntitle: Travel\r\n---\r\n\r\nBody.");

  assert.equal(article.id, "gameplay.travel");
  assert.equal(article.title, "Travel");
  assert.equal(article.body, "Body.");
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

test("content registry default fetch bypasses cache for authored articles", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async (path, options) => {
    calls.push({ path, options });
    return {
      ok: true,
      text: async () => `---
id: cache.test
title: Cache Test
---

Body.`,
    };
  };

  const registry = createContentRegistry();
  await registry.loadArticles(["docs/wiki/cache-test.md"]);

  assert.deepEqual(calls, [{
    path: "docs/wiki/cache-test.md",
    options: { cache: "no-store" },
  }]);
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

test("content registry validates authored ui highlight targets", () => {
  const registry = createContentRegistry();
  registry.registerArticle(normalizeArticle("docs/wiki/index.md", `---
id: wiki.index
title: Index
---

Index.`));
  registry.resolveAllArticleLinks();

  assert.deepEqual(validateContentReferences(registry, {
    eventDefinitions: [{
      id: "tutorial.highlight",
      contentId: "wiki.index",
      presentation: {
        uiHighlights: [
          { target: "hud.inspect" },
          { target: "hud.missing" },
        ],
      },
    }],
    uiHighlightTargetIds: ["hud.inspect"],
  }), {
    ok: false,
    missing: [
      { source: "event:tutorial.highlight:uiHighlight", contentId: "hud.missing" },
    ],
  });
});

test("content registry exposes resolved file links without mutating source body", () => {
  const registry = createContentRegistry();
  registry.registerArticle(normalizeArticle("docs/wiki/index.md", `---
id: wiki.index
title: Index
---

[Travel](gameplay/travel.md#trail)`));
  registry.registerArticle(normalizeArticle("docs/wiki/gameplay/travel.md", `---
id: gameplay.travel
title: Travel
---

Travel article.`));
  registry.resolveAllArticleLinks();

  const article = registry.getArticle("wiki.index");
  assert.equal(article.body.includes("[Travel](gameplay/travel.md#trail)"), true);
  assert.equal(article.bodyResolved.includes("[Travel](gameplay.travel#trail)"), true);
  assert.deepEqual(article.links, ["gameplay.travel"]);
  registry.resolveAllArticleLinks();
  assert.equal(registry.getArticle("wiki.index").body, article.body);
  assert.equal(registry.getArticle("wiki.index").bodyResolved, article.bodyResolved);
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

  assert.deepEqual(validateContentReferences(registry, {
    eventDefinitions,
    uiHighlightTargetIds: SEMANTIC_UI_HIGHLIGHT_TARGET_IDS,
  }), {
    ok: true,
    missing: [],
  });
  assert.equal(registry.hasArticle("gameplay.gathering"), true);
  assert.equal(registry.hasArticle("survival.hydration"), true);
  assert.equal(registry.hasArticle("world.knowledge"), true);
});

test("shipped map3 event sidecar loads and validates with global definitions", async () => {
  const registry = createContentRegistry({
    fetchText: (path) => readFile(path, "utf8"),
  });
  await registry.loadArticles(WIKI_ARTICLE_PATHS);
  const eventDefinitions = await loadEventDefinitionFiles([
    ...GLOBAL_EVENT_DEFINITION_PATHS,
    "assets/map3/events.json",
  ], {
    fetchJson: async (path) => JSON.parse(await readFile(path, "utf8")),
  });

  assert.equal(eventDefinitions.some((definition) => definition.id === "map3.gathering_test"), true);
  assert.deepEqual(validateContentReferences(registry, {
    eventDefinitions,
    uiHighlightTargetIds: SEMANTIC_UI_HIGHLIGHT_TARGET_IDS,
  }), {
    ok: true,
    missing: [],
  });
});
