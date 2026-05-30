function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cellKey(cell, extra = "") {
  if (!cell) return "";
  return [
    cell.resourceId || "",
    Math.round(finite(cell.width, 0)),
    Math.round(finite(cell.height, 0)),
    Math.round(finite(cell.x, 0)),
    Math.round(finite(cell.y, 0)),
    extra,
  ].join("|");
}

function uniqueStrings(values) {
  const result = [];
  const seen = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const id = String(value || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

export function createPlayerLocalKnowledgeRevealRuntime(deps = {}) {
  const lastRevealCells = new Map();
  const worldKnowledgeMapId = String(deps.worldKnowledgeMapId || "world");
  const tracksKnowledgeMapId = String(deps.tracksKnowledgeMapId || "tracks");
  const revealTracksByDefault = deps.revealTracks !== false;

  function getDiscoveryRuntime() {
    return typeof deps.getResourceDiscoveryRuntime === "function"
      ? deps.getResourceDiscoveryRuntime()
      : deps.resourceDiscoveryRuntime;
  }

  function getStockRuntime() {
    return typeof deps.getResourceStockRuntime === "function"
      ? deps.getResourceStockRuntime()
      : deps.resourceStockRuntime;
  }

  function getCanonicalId(resourceId) {
    const runtime = getDiscoveryRuntime();
    if (runtime && typeof runtime.resolveKnowledgeMapId === "function") {
      return runtime.resolveKnowledgeMapId(resourceId);
    }
    return String(resourceId || "");
  }

  function getCurrentCell(resourceId, x, y) {
    const runtime = getDiscoveryRuntime();
    if (runtime && typeof runtime.getGridCell === "function") {
      return runtime.getGridCell(resourceId, x, y);
    }
    return {
      resourceId: getCanonicalId(resourceId),
      width: 0,
      height: 0,
      x: Math.round(finite(x, 0)),
      y: Math.round(finite(y, 0)),
    };
  }

  function makeRevealKeyExtra(options = {}) {
    if (!Number.isFinite(Number(options.radius))) return "";
    return `r:${Math.max(0, finite(options.radius, 0)).toFixed(3)}`;
  }

  function shouldRevealCell(resourceId, x, y, options = {}) {
    const canonicalId = getCanonicalId(resourceId);
    const key = cellKey(getCurrentCell(resourceId, x, y), makeRevealKeyExtra(options));
    if (!key) return { canonicalId, shouldReveal: false };
    if (lastRevealCells.get(canonicalId) === key) {
      return { canonicalId, shouldReveal: false };
    }
    return { canonicalId, key, shouldReveal: true };
  }

  function markCellRevealed(canonicalId, key) {
    if (canonicalId && key) {
      lastRevealCells.set(canonicalId, key);
    }
  }

  function revealDiscoveryCell(resourceId, x, y, options = {}) {
    const runtime = getDiscoveryRuntime();
    const gate = shouldRevealCell(resourceId, x, y, options);
    if (!gate.shouldReveal || !runtime) {
      return { changed: false, skipped: !gate.shouldReveal };
    }
    const radius = Number(options.radius);
    const changed = Number.isFinite(radius) && radius > 0 && typeof runtime.revealCircle === "function"
      ? runtime.revealCircle(resourceId, x, y, radius, 1) === true
      : typeof runtime.revealMovement === "function" && runtime.revealMovement(resourceId, x, y) === true;
    markCellRevealed(gate.canonicalId, gate.key);
    return { changed, skipped: false };
  }

  function getObservedStockResourceIds() {
    return uniqueStrings(
      typeof deps.getObservedStockResourceIds === "function"
        ? deps.getObservedStockResourceIds()
        : [],
    );
  }

  function revealKnownStock(resourceIds, x, y, options = {}) {
    const runtime = getStockRuntime();
    if (!runtime || typeof runtime.revealKnown !== "function") return false;
    let changed = false;
    const reveal = () => {
      let batchChanged = false;
      for (const resourceId of uniqueStrings(resourceIds)) {
        const radius = typeof deps.resolveStockRevealRadius === "function"
          ? deps.resolveStockRevealRadius(resourceId, options.stockRevealRadius)
          : 0;
        batchChanged = (runtime.revealKnown(resourceId, x, y, radius) === true) || batchChanged;
      }
      return batchChanged;
    };
    if (typeof runtime.withMutationBatch === "function") {
      changed = runtime.withMutationBatch(reveal) || changed;
    } else {
      changed = reveal() || changed;
    }
    return changed;
  }

  function revealAt(x, y, options = {}) {
    let changed = false;
    let worldChanged = false;
    let worldObserved = false;
    const discovery = getDiscoveryRuntime();
    const revealTracks = options.revealTracks ?? revealTracksByDefault;
    const revealWorld = options.revealWorld !== false;
    const revealDiscovery = () => {
      const tracksResult = revealTracks
        ? revealDiscoveryCell(tracksKnowledgeMapId, x, y)
        : { changed: false };
      const worldResult = revealWorld
        ? revealDiscoveryCell(worldKnowledgeMapId, x, y, { radius: options.worldRevealRadius })
        : { changed: false, skipped: true };
      worldChanged = worldResult.changed;
      worldObserved = !worldResult.skipped;
      return tracksResult.changed || worldResult.changed;
    };
    if (discovery && typeof discovery.withMutationBatch === "function") {
      changed = discovery.withMutationBatch(revealDiscovery) || changed;
    } else {
      changed = revealDiscovery() || changed;
    }
    if (worldObserved) {
      changed = revealKnownStock(getObservedStockResourceIds(), x, y, {
        stockRevealRadius: options.stockRevealRadius,
      }) || changed;
    }
    return {
      changed,
      worldChanged,
      worldObserved,
    };
  }

  function revealObservedStockAt(resourceId, x, y) {
    return revealKnownStock([resourceId], x, y);
  }

  function reset() {
    lastRevealCells.clear();
  }

  return {
    getCanonicalId,
    revealAt,
    revealObservedStockAt,
    reset,
  };
}
