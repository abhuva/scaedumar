import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs");

function walkMarkdown(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function stripFencedCode(source) {
  return source.replace(/^```[\s\S]*?^```/gm, "");
}

function stripInlineCode(source) {
  return source.replace(/`[^`\n]*`/g, "");
}

function removeAnchor(target) {
  const hashIndex = target.indexOf("#");
  return hashIndex === -1 ? target : target.slice(0, hashIndex);
}

function normalizeTarget(target) {
  return decodeURIComponent(removeAnchor(target).trim());
}

function isExternalLink(target) {
  return /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("//");
}

function buildIndexes(files) {
  const byDocsRelativeNoExt = new Map();
  const byStem = new Map();
  const existingDocsRel = new Set();

  for (const file of files) {
    const docsRel = toPosix(path.relative(docsRoot, file));
    const noExt = docsRel.replace(/\.md$/i, "");
    const stem = path.basename(file, ".md");

    existingDocsRel.add(docsRel);
    byDocsRelativeNoExt.set(noExt, docsRel);

    const stemTargets = byStem.get(stem) || [];
    stemTargets.push(docsRel);
    byStem.set(stem, stemTargets);
  }

  return { byDocsRelativeNoExt, byStem, existingDocsRel };
}

function resolveWikiLink(rawTarget, indexes) {
  const target = normalizeTarget(rawTarget.split("|")[0]);
  if (!target) {
    return { ok: true };
  }

  if (target.includes("/")) {
    const noExt = target.replace(/\.md$/i, "");
    return indexes.byDocsRelativeNoExt.has(noExt)
      ? { ok: true }
      : { ok: false, reason: "missing", target };
  }

  if (indexes.byDocsRelativeNoExt.has(target)) {
    return { ok: true };
  }

  const matches = indexes.byStem.get(target) || [];
  if (matches.length === 1) {
    return { ok: true };
  }
  if (matches.length > 1) {
    return { ok: false, reason: `ambiguous: ${matches.join(", ")}`, target };
  }
  return { ok: false, reason: "missing", target };
}

function resolveMarkdownLink(rawTarget, sourceFile, indexes) {
  const target = normalizeTarget(rawTarget);
  if (!target || target.startsWith("#") || isExternalLink(target)) {
    return { ok: true };
  }

  if (!target.toLowerCase().includes(".md")) {
    return { ok: true };
  }

  const mdPath = target.replace(/\.md.*$/i, ".md");
  const absoluteTarget = path.resolve(path.dirname(sourceFile), mdPath);
  const docsRel = toPosix(path.relative(docsRoot, absoluteTarget));

  if (docsRel.startsWith("../")) {
    return { ok: false, reason: "outside docs", target };
  }

  return indexes.existingDocsRel.has(docsRel)
    ? { ok: true }
    : { ok: false, reason: "missing", target };
}

function checkFile(file, indexes) {
  const source = stripInlineCode(stripFencedCode(fs.readFileSync(file, "utf8")));
  const docsRel = toPosix(path.relative(docsRoot, file));
  const errors = [];

  for (const match of source.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const result = resolveWikiLink(match[1], indexes);
    if (!result.ok) {
      errors.push(`${docsRel}: wikilink [[${match[1]}]] -> ${result.reason}`);
    }
  }

  for (const match of source.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)) {
    const result = resolveMarkdownLink(match[1], file, indexes);
    if (!result.ok) {
      errors.push(`${docsRel}: markdown link (${match[1]}) -> ${result.reason}`);
    }
  }

  return errors;
}

const files = walkMarkdown(docsRoot);
const indexes = buildIndexes(files);
const errors = files.flatMap((file) => checkFile(file, indexes));

if (errors.length > 0) {
  console.error(`Found ${errors.length} broken documentation link(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length} Markdown files. No broken documentation links found.`);
}
