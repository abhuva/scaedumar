const DEFAULT_HIGHLIGHT_COLOR = "#f4d35e";
const DEFAULT_HIGHLIGHT_THICKNESS = 3;

export const SEMANTIC_UI_HIGHLIGHT_TARGET_IDS = Object.freeze([
  "hud.inspect",
  "hud.activity.pathfinding",
  "hud.activity.gathering",
  "hud.activity.water",
]);

function normalizeHighlight(input) {
  if (!input || typeof input !== "object") return null;
  const target = String(input.target || "").trim();
  if (!target) return null;
  const thickness = Number(input.thickness);
  return {
    target,
    color: String(input.color || DEFAULT_HIGHLIGHT_COLOR),
    thickness: Number.isFinite(thickness) && thickness > 0 ? thickness : DEFAULT_HIGHLIGHT_THICKNESS,
    pulse: Boolean(input.pulse),
  };
}

function normalizeHighlights(highlights) {
  return Array.isArray(highlights)
    ? highlights.map(normalizeHighlight).filter(Boolean)
    : [];
}

function applyElementHighlight(element, highlight) {
  if (!element || !highlight) return;
  element.dataset.uiHighlightActive = "true";
  element.style.setProperty("--ui-highlight-color", highlight.color);
  element.style.setProperty("--ui-highlight-thickness", `${highlight.thickness}px`);
  element.classList.toggle("ui-highlight-pulse", highlight.pulse);
}

function clearElementHighlight(element) {
  if (!element) return;
  delete element.dataset.uiHighlightActive;
  element.style.removeProperty("--ui-highlight-color");
  element.style.removeProperty("--ui-highlight-thickness");
  element.classList.remove("ui-highlight-pulse");
}

export function createUiHighlightRuntime() {
  const targets = new Map();
  const activeSources = new Map();

  function registerTarget(id, element) {
    const targetId = String(id || "").trim();
    if (!targetId || !element) return false;
    const previous = targets.get(targetId);
    if (previous && previous !== element) {
      clearElementHighlight(previous);
    }
    targets.set(targetId, element);
    for (const highlights of activeSources.values()) {
      const highlight = highlights.find((item) => item.target === targetId);
      if (highlight) {
        applyElementHighlight(element, highlight);
        break;
      }
    }
    return true;
  }

  function refreshAppliedHighlights() {
    for (const element of targets.values()) clearElementHighlight(element);
    for (const highlights of activeSources.values()) {
      for (const highlight of highlights) {
        const element = targets.get(highlight.target);
        if (element) applyElementHighlight(element, highlight);
      }
    }
  }

  function setHighlights(source, highlights) {
    const sourceId = String(source || "").trim();
    if (!sourceId) return false;
    const normalized = normalizeHighlights(highlights);
    if (normalized.length) activeSources.set(sourceId, normalized);
    else activeSources.delete(sourceId);
    refreshAppliedHighlights();
    return true;
  }

  function clearSource(source) {
    const sourceId = String(source || "").trim();
    if (!sourceId) return false;
    const removed = activeSources.delete(sourceId);
    if (removed) refreshAppliedHighlights();
    return removed;
  }

  function clearAll() {
    activeSources.clear();
    refreshAppliedHighlights();
  }

  function getSnapshot() {
    return {
      targetIds: Array.from(targets.keys()),
      sources: Object.fromEntries(
        Array.from(activeSources.entries()).map(([source, highlights]) => [
          source,
          highlights.map((highlight) => ({ ...highlight })),
        ]),
      ),
    };
  }

  return {
    registerTarget,
    setHighlights,
    clearSource,
    clearAll,
    getSnapshot,
  };
}
