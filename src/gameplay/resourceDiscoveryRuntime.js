function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getSearchConfig(searches, resourceId) {
  return searches && searches[resourceId] ? searches[resourceId] : null;
}

function createMask(searches, resourceId, mapWidth, mapHeight, discoveryOverride = null) {
  const search = getSearchConfig(searches, resourceId);
  const discovery = discoveryOverride || (search && search.discovery) || {};
  const configuredSize = Math.max(8, Math.round(finite(discovery.gridSize, 256)));
  const safeMapWidth = Math.max(1, Math.round(finite(mapWidth, 1)));
  const safeMapHeight = Math.max(1, Math.round(finite(mapHeight, 1)));
  const aspect = safeMapHeight / safeMapWidth;
  const width = configuredSize;
  const height = Math.max(1, Math.round(configuredSize * aspect));
  return {
    resourceId,
    width,
    height,
    gridSize: configuredSize,
    mapWidth: safeMapWidth,
    mapHeight: safeMapHeight,
    cells: new Uint8Array(width * height),
  };
}

export function createResourceDiscoveryRuntime(deps = {}) {
  const searches = deps.resourceSearches || {};
  const masks = new Map();
  const versions = new Map();

  function bumpVersion(resourceId = "") {
    const id = String(resourceId || "*");
    versions.set(id, (versions.get(id) || 0) + 1);
  }

  function getMapWidth() {
    return Math.max(1, Math.round(finite(typeof deps.getMapWidth === "function" ? deps.getMapWidth() : 1, 1)));
  }

  function getMapHeight() {
    return Math.max(1, Math.round(finite(typeof deps.getMapHeight === "function" ? deps.getMapHeight() : 1, 1)));
  }

  function getMask(resourceId) {
    const id = String(resourceId || "");
    if (!id) return null;
    const mapWidth = getMapWidth();
    const mapHeight = getMapHeight();
    const discoveryOverride = typeof deps.getDiscoveryConfig === "function" ? deps.getDiscoveryConfig(id) : null;
    const search = getSearchConfig(searches, id);
    const desiredGridSizeValue = discoveryOverride && discoveryOverride.gridSize != null
      ? discoveryOverride.gridSize
      : (search && search.discovery && search.discovery.gridSize != null ? search.discovery.gridSize : 256);
    const desiredGridSize = Math.max(8, Math.round(finite(desiredGridSizeValue, 256)));
    const current = masks.get(id);
    if (current && current.mapWidth === mapWidth && current.mapHeight === mapHeight && current.gridSize === desiredGridSize) {
      return current;
    }
    const next = createMask(searches, id, mapWidth, mapHeight, discoveryOverride);
    masks.set(id, next);
    bumpVersion(id);
    return next;
  }

  function reset(resourceId = null) {
    if (resourceId) {
      masks.delete(String(resourceId));
      bumpVersion(resourceId);
    } else {
      masks.clear();
      bumpVersion("*");
    }
    if (typeof deps.onChange === "function") {
      deps.onChange();
    }
  }

  function revealCircle(resourceId, centerX, centerY, radius, strength = 1) {
    const mask = getMask(resourceId);
    if (!mask) return false;
    const safeRadius = Math.max(0, finite(radius, 0));
    if (safeRadius <= 0) return false;
    const safeStrength = Math.max(0, Math.min(1, finite(strength, 1)));
    if (safeStrength <= 0) return false;
    const mapX = clamp(finite(centerX, 0), 0, mask.mapWidth - 1);
    const mapY = clamp(finite(centerY, 0), 0, mask.mapHeight - 1);
    const minGridX = Math.round(clamp(Math.floor(((mapX - safeRadius) / mask.mapWidth) * mask.width), 0, mask.width - 1));
    const maxGridX = Math.round(clamp(Math.ceil(((mapX + safeRadius) / mask.mapWidth) * mask.width), 0, mask.width - 1));
    const minGridY = Math.round(clamp(Math.floor(((mapY - safeRadius) / mask.mapHeight) * mask.height), 0, mask.height - 1));
    const maxGridY = Math.round(clamp(Math.ceil(((mapY + safeRadius) / mask.mapHeight) * mask.height), 0, mask.height - 1));
    const radiusSq = safeRadius * safeRadius;
    const value = Math.round(safeStrength * 255);
    let changed = false;

    for (let gy = minGridY; gy <= maxGridY; gy++) {
      const sampleY = ((gy + 0.5) / mask.height) * mask.mapHeight;
      for (let gx = minGridX; gx <= maxGridX; gx++) {
        const sampleX = ((gx + 0.5) / mask.width) * mask.mapWidth;
        const dx = sampleX - mapX;
        const dy = sampleY - mapY;
        if (dx * dx + dy * dy > radiusSq) continue;
        const index = gy * mask.width + gx;
        if (index < 0 || index >= mask.cells.length) continue;
        if (mask.cells[index] >= value) continue;
        mask.cells[index] = value;
        changed = true;
      }
    }

    if (changed && typeof deps.onChange === "function") {
      bumpVersion(resourceId);
      deps.onChange();
    }
    return changed;
  }

  function sampleKnowledge(resourceId, x, y) {
    const mask = getMask(resourceId);
    if (!mask) return 0;
    const gx = clamp(Math.floor((clamp(finite(x, 0), 0, mask.mapWidth - 1) / mask.mapWidth) * mask.width), 0, mask.width - 1);
    const gy = clamp(Math.floor((clamp(finite(y, 0), 0, mask.mapHeight - 1) / mask.mapHeight) * mask.height), 0, mask.height - 1);
    return (mask.cells[gy * mask.width + gx] || 0) / 255;
  }

  function getSnapshot(resourceId) {
    const mask = getMask(resourceId);
    if (!mask) return null;
    return {
      resourceId: mask.resourceId,
      width: mask.width,
      height: mask.height,
      mapWidth: mask.mapWidth,
      mapHeight: mask.mapHeight,
      cells: mask.cells,
    };
  }

  function revealMovement(resourceId, x, y) {
    const search = getSearchConfig(searches, resourceId);
    const configured = typeof deps.getDiscoveryConfig === "function" ? deps.getDiscoveryConfig(resourceId) : null;
    const discovery = configured || (search && search.discovery) || {};
    const radius = discovery.movementRevealRadius ?? 30;
    return revealCircle(resourceId, x, y, radius, 1);
  }

  function fill(resourceId, value) {
    const mask = getMask(resourceId);
    if (!mask) return false;
    mask.cells.fill(Math.round(Math.max(0, Math.min(1, finite(value, 0))) * 255));
    bumpVersion(resourceId);
    if (typeof deps.onChange === "function") {
      deps.onChange();
    }
    return true;
  }

  return {
    reset,
    revealCircle,
    revealMovement,
    fill,
    sampleKnowledge,
    getSnapshot,
    getVersion: (resourceId) => (versions.get(String(resourceId || "*")) || 0) + (versions.get("*") || 0),
  };
}
