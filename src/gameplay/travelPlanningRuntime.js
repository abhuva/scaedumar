function clonePixel(pixel) {
  if (!pixel) return null;
  return {
    x: Number(pixel.x),
    y: Number(pixel.y),
  };
}

function clonePath(pathPixels) {
  return Array.isArray(pathPixels)
    ? pathPixels.map(clonePixel).filter(Boolean)
    : [];
}

function snapshotFromState(state) {
  return {
    hoverPixel: clonePixel(state.hoverPixel),
    pathPixels: clonePath(state.pathPixels),
    rangeOriginPixel: clonePixel(state.rangeOriginPixel),
    rangeRadius: Math.max(0, Number(state.rangeRadius) || 0),
    committedTargetPixel: clonePixel(state.committedTargetPixel),
    committedPathPixels: clonePath(state.committedPathPixels),
    committedRangeOriginPixel: clonePixel(state.committedRangeOriginPixel),
    committedRangeRadius: Math.max(0, Number(state.committedRangeRadius) || 0),
  };
}

export function createTravelPlanningRuntime(deps = {}) {
  const state = deps.state || {
    hoverPixel: null,
    pathPixels: [],
    rangeOriginPixel: null,
    rangeRadius: 0,
    committedTargetPixel: null,
    committedPathPixels: [],
    committedRangeOriginPixel: null,
    committedRangeRadius: 0,
  };

  function notify(reason) {
    deps.onChange?.({ reason });
  }

  function clearPreview(reason = "preview-cleared", options = {}) {
    state.hoverPixel = null;
    state.pathPixels = [];
    state.rangeOriginPixel = null;
    state.rangeRadius = 0;
    if (options.emit !== false) notify(reason);
  }

  function clearCommitted(reason = "committed-cleared", options = {}) {
    state.committedTargetPixel = null;
    state.committedPathPixels = [];
    state.committedRangeOriginPixel = null;
    state.committedRangeRadius = 0;
    if (options.emit !== false) notify(reason);
  }

  function clearAll(reason = "planning-cleared", options = {}) {
    clearPreview(reason, { emit: false });
    clearCommitted(reason, { emit: false });
    if (options.emit !== false) notify(reason);
  }

  function setRange(originPixel, radius, reason = "range-set", options = {}) {
    state.rangeOriginPixel = clonePixel(originPixel);
    state.rangeRadius = Math.max(0, Number(radius) || 0);
    if (options.emit !== false) notify(reason);
  }

  function clearRange(reason = "range-cleared", options = {}) {
    state.rangeOriginPixel = null;
    state.rangeRadius = 0;
    if (options.emit !== false) notify(reason);
  }

  function startPathfinding(originPixel, pathfindingSnapshot = {}, reason = "mode-changed") {
    setRange(originPixel, Math.max(0, Number(pathfindingSnapshot.range) || 0) / 2, reason);
  }

  function setHoverPath(pixel, pathPixels, reason = "hover-path", options = {}) {
    state.hoverPixel = clonePixel(pixel);
    state.pathPixels = clonePath(pathPixels);
    if (options.emit !== false) notify(reason);
    return state.pathPixels;
  }

  function commitCurrentPath(targetPixel, fallbackOriginPixel, reason = "travel-committed", options = {}) {
    state.committedTargetPixel = clonePixel(targetPixel);
    state.committedPathPixels = clonePath(state.pathPixels);
    state.committedRangeOriginPixel = state.rangeOriginPixel
      ? clonePixel(state.rangeOriginPixel)
      : clonePixel(fallbackOriginPixel);
    state.committedRangeRadius = Math.max(0, Number(state.rangeRadius) || 0);
    if (options.emit !== false) notify(reason);
  }

  function replaceCommittedPath(pathPixels, reason = "committed-refreshed", options = {}) {
    state.committedPathPixels = clonePath(pathPixels);
    if (options.emit !== false) notify(reason);
  }

  function advanceCommittedPathToPixel(pixel, reason = "committed-progress", options = {}) {
    const target = clonePixel(pixel);
    if (!target || !Array.isArray(state.committedPathPixels) || state.committedPathPixels.length === 0) {
      return false;
    }
    const index = state.committedPathPixels.findIndex((node) => (
      node && node.x === target.x && node.y === target.y
    ));
    if (index < 0) {
      return false;
    }
    state.committedPathPixels = clonePath(state.committedPathPixels.slice(index));
    if (options.emit !== false) notify(reason);
    return true;
  }

  function updateRangeRadius(radius, reason = "pathfinding-setting", options = {}) {
    state.rangeRadius = Math.max(0, Number(radius) || 0);
    if (options.emit !== false) notify(reason);
  }

  function getHoverPixel() {
    return clonePixel(state.hoverPixel);
  }

  function getPathPixels() {
    return clonePath(state.pathPixels);
  }

  function hasHoverPath() {
    return Boolean(state.hoverPixel && Array.isArray(state.pathPixels) && state.pathPixels.length > 0);
  }

  function isHoverPixel(pixel) {
    if (!state.hoverPixel || !pixel) return false;
    return state.hoverPixel.x === Number(pixel.x) && state.hoverPixel.y === Number(pixel.y);
  }

  function getState() {
    return state;
  }

  function getSnapshot() {
    return snapshotFromState(state);
  }

  return {
    state,
    getState,
    getSnapshot,
    clearPreview,
    clearCommitted,
    clearAll,
    setRange,
    clearRange,
    startPathfinding,
    setHoverPath,
    commitCurrentPath,
    replaceCommittedPath,
    advanceCommittedPathToPixel,
    updateRangeRadius,
    getHoverPixel,
    getPathPixels,
    hasHoverPath,
    isHoverPixel,
  };
}
