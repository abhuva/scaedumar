import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, normalize } from "node:path";
import test from "node:test";

const RD_PANEL_NAMES = ["terrain", "agents", "trail", "gameplay", "events", "audio", "pathing", "io"];

function readUtf8(path) {
  return readFileSync(path, "utf8");
}

function collectPanelMarkupPaths(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = `${root}/${entry.name}`;
    if (entry.isDirectory()) return collectPanelMarkupPaths(path);
    return entry.name.endsWith("PanelHtml.js") ? [path] : [];
  });
}

function collectJsPaths(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = `${root}/${entry.name}`;
    if (entry.isDirectory()) return collectJsPaths(path);
    return entry.name.endsWith(".js") ? [path] : [];
  });
}

function collectRdMarkup() {
  const panelMarkup = collectPanelMarkupPaths("src/ui/rd/panels").map(readUtf8);
  return [readUtf8("index.html"), readUtf8("src/ui/rd/overlayRailHtml.js"), ...panelMarkup].join("\n");
}

function countLiteral(haystack, needle) {
  return haystack.split(needle).length - 1;
}

test("RD extracted markup still provides every required main DOM id", () => {
  const mainSource = readUtf8("src/main.js");
  const markup = collectRdMarkup();
  const requiredIds = [...mainSource.matchAll(/getRequiredElementById\("([^"]+)"\)/g)]
    .map((match) => match[1]);
  const markupIds = new Set([...markup.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));

  const missingIds = requiredIds.filter((id) => !markupIds.has(id));

  assert.deepEqual(missingIds, []);
});

test("RD shell hosts and extracted top-level panels stay one-to-one", () => {
  const indexMarkup = readUtf8("index.html");
  const markup = collectRdMarkup();
  const injectorSource = readUtf8("src/ui/rd/resourceDebugMarkupRuntime.js");

  for (const name of RD_PANEL_NAMES) {
    const pascalName = `${name[0].toUpperCase()}${name.slice(1)}`;
    const panelId = `rdDev${pascalName}Panel`;
    const hostId = `rdDev${pascalName}PanelHost`;

    assert.equal(countLiteral(indexMarkup, `id="${hostId}"`), 1, `${hostId} host count`);
    assert.equal(countLiteral(markup, `id="${panelId}"`), 1, `${panelId} panel count`);
    assert.equal(countLiteral(injectorSource, `"${hostId}"`), 1, `${hostId} injector count`);
  }
});

test("RD overlay shortcut rail stays injected through the shell host", () => {
  const indexMarkup = readUtf8("index.html");
  const markup = collectRdMarkup();
  const injectorSource = readUtf8("src/ui/rd/resourceDebugMarkupRuntime.js");
  const expectedShortcuts = [
    "terrain-height",
    "terrain-slope",
    "terrain-wetness",
    "terrain-water",
    "water-flow",
    "water-trails",
    "detail-rgba",
    "detail-red",
    "detail-green",
    "detail-blue",
    "detail-alpha",
    "slime-terrain",
    "slime-trails",
    "knowledge-map",
    "route-cost",
    "route-knowledge",
  ];

  assert.equal(countLiteral(indexMarkup, 'id="rdOverlayRailHost"'), 1);
  assert.equal(countLiteral(markup, 'id="rdOverlayRail"'), 1);
  assert.equal(countLiteral(injectorSource, '"rdOverlayRailHost"'), 1);

  for (const shortcut of expectedShortcuts) {
    assert.equal(countLiteral(markup, `data-rd-overlay-shortcut="${shortcut}"`), 1, `${shortcut} shortcut count`);
  }
});

test("RD markup module relative imports resolve to existing files", () => {
  const jsPaths = collectJsPaths("src/ui/rd");

  for (const jsPath of jsPaths) {
    const source = readUtf8(jsPath);
    const imports = [...source.matchAll(/import\s+\{[^}]+\}\s+from\s+"(\.[^"]+)";/g)]
      .map((match) => match[1]);

    for (const importPath of imports) {
      const resolvedPath = normalize(`${dirname(jsPath)}/${importPath}`);
      assert.equal(existsSync(resolvedPath), true, `${jsPath} imports missing ${resolvedPath}`);
    }
  }
});

test("RD tab aria-controls targets resolve to exactly one panel id", () => {
  const markup = collectRdMarkup();
  const tabTargets = [...markup.matchAll(/class="[^"]*\brd-tab\b[^"]*"[^>]*aria-controls="([^"]+)"/g)]
    .map((match) => match[1]);

  assert.ok(tabTargets.length > 0);

  for (const targetId of tabTargets) {
    assert.equal(countLiteral(markup, `id="${targetId}"`), 1, `${targetId} aria-controls target count`);
  }
});
