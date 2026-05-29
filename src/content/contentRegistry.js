function parseFrontmatter(markdown) {
  const source = typeof markdown === "string" ? markdown : "";
  if (!source.startsWith("---\n")) {
    return { metadata: {}, body: source };
  }
  const end = source.indexOf("\n---", 4);
  if (end < 0) {
    return { metadata: {}, body: source };
  }
  const raw = source.slice(4, end).trim();
  const bodyStart = source.indexOf("\n", end + 4);
  const body = bodyStart >= 0 ? source.slice(bodyStart + 1).replace(/^\n/, "") : "";
  const metadata = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
    }
    metadata[key] = value;
  }
  return { metadata, body };
}

function deriveArticleId(path) {
  return String(path || "")
    .replace(/^\.?\//, "")
    .replace(/^docs\/wiki\//, "")
    .replace(/\.md$/i, "")
    .replace(/[\\/]/g, ".");
}

function normalizeArticlePath(path) {
  const parts = [];
  for (const part of String(path || "").replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

function getDirectoryPath(path) {
  const normalized = normalizeArticlePath(path);
  const index = normalized.lastIndexOf("/");
  return index >= 0 ? normalized.slice(0, index) : "";
}

function splitLinkTarget(target) {
  const value = String(target || "").trim();
  const match = /^([^#?]*)(.*)$/.exec(value);
  return {
    path: match ? match[1] : value,
    suffix: match ? match[2] : "",
  };
}

function isExternalOrAnchorLink(target) {
  const value = String(target || "").trim();
  return !value || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("#");
}

function isMarkdownFileLink(target) {
  if (isExternalOrAnchorLink(target)) return false;
  const { path } = splitLinkTarget(target);
  return /\.md$/i.test(path);
}

function resolveMarkdownFileLink(sourcePath, target) {
  const { path, suffix } = splitLinkTarget(target);
  const baseDirectory = getDirectoryPath(sourcePath);
  const resolvedPath = path.startsWith("/")
    ? normalizeArticlePath(path.slice(1))
    : normalizeArticlePath(`${baseDirectory}/${path}`);
  return {
    path: resolvedPath,
    suffix,
  };
}

function extractMarkdownLinks(markdown) {
  const links = [];
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of String(markdown || "").matchAll(pattern)) {
    const target = String(match[1] || "").trim();
    if (!isExternalOrAnchorLink(target)) links.push(target);
  }
  return links;
}

export function normalizeArticle(path, markdown) {
  const { metadata, body } = parseFrontmatter(markdown);
  const id = typeof metadata.id === "string" && metadata.id ? metadata.id : deriveArticleId(path);
  const title = typeof metadata.title === "string" && metadata.title
    ? metadata.title
    : id;
  return {
    id,
    path,
    title,
    summary: metadata.summary || "",
    category: metadata.category || "",
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    related: Array.isArray(metadata.related) ? metadata.related : [],
    body,
    markdown,
    links: extractMarkdownLinks(body),
    derivedId: !metadata.id,
  };
}

function buildArticlePathIndex(articles) {
  const pathToId = new Map();
  for (const article of articles) {
    pathToId.set(normalizeArticlePath(article.path), article.id);
  }
  return pathToId;
}

function resolveArticleLinks(article, pathToId) {
  const resolvedLinks = [];
  const unresolvedLinks = [];
  const legacyRuntimeIdLinks = [];
  const rewrittenBody = String(article.body || "").replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (source, label, target) => {
      const linkTarget = String(target || "").trim();
      if (isExternalOrAnchorLink(linkTarget)) return source;
      if (!isMarkdownFileLink(linkTarget)) {
        legacyRuntimeIdLinks.push(linkTarget);
        return source;
      }
      const resolved = resolveMarkdownFileLink(article.path, linkTarget);
      const articleId = pathToId.get(resolved.path);
      if (!articleId) {
        unresolvedLinks.push(linkTarget);
        return source;
      }
      resolvedLinks.push(articleId);
      return `[${label}](${articleId})`;
    },
  );
  return {
    ...article,
    body: rewrittenBody,
    links: resolvedLinks,
    unresolvedLinks,
    legacyRuntimeIdLinks,
  };
}

function collectEventContentReferences(value, refs = [], source = "event") {
  if (!value || typeof value !== "object") return refs;
  if (Array.isArray(value)) {
    for (const item of value) collectEventContentReferences(item, refs, source);
    return refs;
  }
  const nextSource = typeof value.id === "string" && value.id ? `event:${value.id}` : source;
  if (typeof value.contentId === "string" && value.contentId) {
    refs.push({
      source: nextSource,
      contentId: value.contentId,
    });
  }
  for (const item of Object.values(value)) {
    if (item && typeof item === "object") collectEventContentReferences(item, refs, nextSource);
  }
  return refs;
}

function collectEventUiHighlightReferences(value, refs = [], source = "event") {
  if (!value || typeof value !== "object") return refs;
  if (Array.isArray(value)) {
    for (const item of value) collectEventUiHighlightReferences(item, refs, source);
    return refs;
  }
  const nextSource = typeof value.id === "string" && value.id ? `event:${value.id}` : source;
  const highlights = value.presentation?.uiHighlights;
  if (Array.isArray(highlights)) {
    for (const highlight of highlights) {
      const target = String(highlight?.target || "").trim();
      if (target) {
        refs.push({
          source: `${nextSource}:uiHighlight`,
          targetId: target,
        });
      }
    }
  }
  for (const item of Object.values(value)) {
    if (item && typeof item === "object") collectEventUiHighlightReferences(item, refs, nextSource);
  }
  return refs;
}

export function validateContentReferences(contentRegistry, options = {}) {
  const articles = contentRegistry?.getSnapshot?.().articles || [];
  const uiHighlightTargetIds = Array.isArray(options.uiHighlightTargetIds)
    ? new Set(options.uiHighlightTargetIds.map((id) => String(id || "").trim()).filter(Boolean))
    : null;
  const missing = [];
  for (const article of articles) {
    for (const contentId of article.related || []) {
      if (!contentRegistry.hasArticle(contentId)) {
        missing.push({ source: `article:${article.id}:related`, contentId });
      }
    }
    const fullArticle = contentRegistry.getArticle(article.id);
    for (const contentId of fullArticle?.legacyRuntimeIdLinks || []) {
      missing.push({ source: `article:${article.id}:legacy-link`, contentId });
    }
    for (const contentId of fullArticle?.unresolvedLinks || []) {
      missing.push({ source: `article:${article.id}:file-link`, contentId });
    }
    for (const contentId of fullArticle?.links || []) {
      if (!contentRegistry.hasArticle(contentId)) {
        missing.push({ source: `article:${article.id}:link`, contentId });
      }
    }
  }
  for (const ref of collectEventContentReferences(options.eventDefinitions || [])) {
    if (!contentRegistry.hasArticle(ref.contentId)) {
      missing.push(ref);
    }
  }
  if (uiHighlightTargetIds) {
    for (const ref of collectEventUiHighlightReferences(options.eventDefinitions || [])) {
      if (!uiHighlightTargetIds.has(ref.targetId)) {
        missing.push({ source: ref.source, contentId: ref.targetId });
      }
    }
  }
  return {
    ok: missing.length === 0,
    missing,
  };
}

export function createContentRegistry(deps = {}) {
  const fetchText = typeof deps.fetchText === "function"
    ? deps.fetchText
    : async (path) => {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load article ${path}: ${response.status}`);
        return response.text();
      };
  const articles = new Map();

  function registerArticle(article) {
    if (!article || !article.id) return;
    if (articles.has(article.id)) {
      throw new Error(`Duplicate wiki article ID: ${article.id}`);
    }
    articles.set(article.id, article);
  }

  function resolveAllArticleLinks() {
    const pathToId = buildArticlePathIndex(articles.values());
    for (const [id, article] of articles.entries()) {
      articles.set(id, resolveArticleLinks(article, pathToId));
    }
  }

  async function loadArticles(paths = []) {
    for (const path of paths) {
      const markdown = await fetchText(path);
      registerArticle(normalizeArticle(path, markdown));
    }
    resolveAllArticleLinks();
    return getSnapshot();
  }

  function getArticle(id) {
    return articles.get(String(id || "")) || null;
  }

  function hasArticle(id) {
    return articles.has(String(id || ""));
  }

  function getSnapshot() {
    return {
      articles: Array.from(articles.values()).map((article) => ({
        id: article.id,
        path: article.path,
        title: article.title,
        summary: article.summary,
        category: article.category,
        tags: [...article.tags],
        related: [...article.related],
        links: Array.isArray(article.links) ? [...article.links] : [],
        unresolvedLinks: Array.isArray(article.unresolvedLinks) ? [...article.unresolvedLinks] : [],
        legacyRuntimeIdLinks: Array.isArray(article.legacyRuntimeIdLinks) ? [...article.legacyRuntimeIdLinks] : [],
        derivedId: article.derivedId,
      })),
    };
  }

  return {
    loadArticles,
    registerArticle,
    resolveAllArticleLinks,
    getArticle,
    hasArticle,
    getSnapshot,
  };
}

export const WIKI_ARTICLE_PATHS = [
  "docs/wiki/index.md",
  "docs/wiki/tutorial/first-steps.md",
  "docs/wiki/tutorial/pathfinding-started.md",
  "docs/wiki/tutorial/travel-committed.md",
  "docs/wiki/tutorial/inspect-started.md",
  "docs/wiki/tutorial/gathering-started.md",
  "docs/wiki/tutorial/water-started.md",
  "docs/wiki/tutorial/rest-started.md",
  "docs/wiki/tutorial/hunting-started.md",
  "docs/wiki/tutorial/event-debug.md",
  "docs/wiki/maps/map3-gathering-test.md",
  "docs/wiki/gameplay/travel.md",
  "docs/wiki/gameplay/inspect.md",
  "docs/wiki/gameplay/time.md",
  "docs/wiki/gameplay/gathering.md",
  "docs/wiki/gameplay/water.md",
  "docs/wiki/gameplay/rest.md",
  "docs/wiki/gameplay/hunting.md",
  "docs/wiki/survival/fatigue.md",
  "docs/wiki/survival/hydration.md",
  "docs/wiki/survival/nutrition.md",
  "docs/wiki/world/terrain.md",
  "docs/wiki/world/tracks.md",
  "docs/wiki/world/knowledge.md",
];
