function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashNoise(x, y, seed) {
  let value = Math.imul(x + 374761393, 668265263) ^ Math.imul(y + 1442695041, 2246822519) ^ Math.imul(seed + 3266489917, 3266489917);
  value ^= value >>> 13;
  value = Math.imul(value, 1274126177);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967295;
}

function smoothNoise(x, y, seed, scale) {
  const safeScale = Math.max(1, finite(scale, 1));
  const gx = Math.floor(x / safeScale);
  const gy = Math.floor(y / safeScale);
  const tx = (x / safeScale) - gx;
  const ty = (y / safeScale) - gy;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = hashNoise(gx, gy, seed);
  const b = hashNoise(gx + 1, gy, seed);
  const c = hashNoise(gx, gy + 1, seed);
  const d = hashNoise(gx + 1, gy + 1, seed);
  const top = a + (b - a) * sx;
  const bottom = c + (d - c) * sx;
  return top + (bottom - top) * sy;
}

function getSearchConfig(searches, resourceId) {
  return searches && searches[resourceId] ? searches[resourceId] : null;
}

function getRevealRadiusMultiplier(deps, resourceId) {
  const multiplier = typeof deps.getRevealRadiusMultiplier === "function"
    ? deps.getRevealRadiusMultiplier(resourceId)
    : 1;
  return Math.max(0, finite(multiplier, 1));
}

function getRevealFalloff(deps, resourceId) {
  const configured = typeof deps.getDiscoveryConfig === "function" ? deps.getDiscoveryConfig(resourceId) : null;
  return Math.max(0, Math.min(8, finite(configured && configured.revealFalloff, 0.15)));
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

  function normalizeKnowledgeMapId(resourceId) {
    const rawId = String(resourceId || "");
    if (!rawId) return "";
    if (typeof deps.getKnowledgeMapId !== "function") return rawId;
    const mapped = deps.getKnowledgeMapId(rawId);
    return String(mapped || rawId);
  }
  const masks = new Map();
  const versions = new Map();
  const decayTickRemainders = new Map();
  const revealBrushCache = new Map();
  let batchDepth = 0;
  let batchChanged = false;

  function notifyChange() {
    if (batchDepth > 0) {
      batchChanged = true;
      return;
    }
    if (typeof deps.onChange === "function") {
      deps.onChange();
    }
  }

  function withMutationBatch(callback) {
    if (typeof callback !== "function") return false;
    batchDepth += 1;
    let changed = false;
    try {
      changed = callback() === true;
    } finally {
      batchDepth = Math.max(0, batchDepth - 1);
      if (batchDepth === 0 && batchChanged) {
        batchChanged = false;
        if (typeof deps.onChange === "function") {
          deps.onChange();
        }
      }
    }
    return changed;
  }

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
    const requestedId = String(resourceId || "");
    const id = normalizeKnowledgeMapId(requestedId);
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
      const id = normalizeKnowledgeMapId(resourceId);
      masks.delete(id);
      decayTickRemainders.delete(id);
      bumpVersion(id);
    } else {
      masks.clear();
      decayTickRemainders.clear();
      bumpVersion("*");
    }
    notifyChange();
  }

  function getRevealBrush(mask, safeRadius, falloff, safeStrength) {
    const cellWidth = mask.mapWidth / mask.width;
    const cellHeight = mask.mapHeight / mask.height;
    const key = [
      mask.width,
      mask.height,
      mask.mapWidth,
      mask.mapHeight,
      safeRadius.toFixed(6),
      falloff.toFixed(6),
      safeStrength.toFixed(6),
    ].join("|");
    const cached = revealBrushCache.get(key);
    if (cached) return cached;

    const maxDx = Math.ceil(safeRadius / Math.max(cellWidth, 0.000001));
    const maxDy = Math.ceil(safeRadius / Math.max(cellHeight, 0.000001));
    const hardValue = Math.round(safeStrength * 255);
    const entries = [];
    for (let dy = -maxDy; dy <= maxDy; dy++) {
      for (let dx = -maxDx; dx <= maxDx; dx++) {
        let value = hardValue;
        if (dx !== 0 || dy !== 0) {
          const dist = Math.sqrt((dx * cellWidth) ** 2 + (dy * cellHeight) ** 2);
          if (dist > safeRadius) continue;
          value = falloff <= 0
            ? hardValue
            : Math.round(safeStrength * Math.pow(Math.max(0, 1 - dist / safeRadius), falloff) * 255);
        }
        if (value <= 0) continue;
        entries.push({ dx, dy, value });
      }
    }
    revealBrushCache.set(key, entries);
    return entries;
  }

  function revealCircle(resourceId, centerX, centerY, radius, strength = 1) {
    const mask = getMask(resourceId);
    if (!mask) return false;
    const safeRadius = Math.max(0, finite(radius, 0) * getRevealRadiusMultiplier(deps, resourceId));
    if (safeRadius <= 0) return false;
    const safeStrength = Math.max(0, Math.min(1, finite(strength, 1)));
    if (safeStrength <= 0) return false;
    const falloff = getRevealFalloff(deps, resourceId);
    const mapX = clamp(finite(centerX, 0), 0, mask.mapWidth - 1);
    const mapY = clamp(finite(centerY, 0), 0, mask.mapHeight - 1);
    const centerGridX = clamp(Math.floor((mapX / mask.mapWidth) * mask.width), 0, mask.width - 1);
    const centerGridY = clamp(Math.floor((mapY / mask.mapHeight) * mask.height), 0, mask.height - 1);
    const brush = getRevealBrush(mask, safeRadius, falloff, safeStrength);
    let changed = false;

    for (const entry of brush) {
      const gx = centerGridX + entry.dx;
      const gy = centerGridY + entry.dy;
      if (gx < 0 || gx >= mask.width || gy < 0 || gy >= mask.height) continue;
      const value = entry.value;
      const index = gy * mask.width + gx;
      if (mask.cells[index] >= value) continue;
      mask.cells[index] = value;
      changed = true;
    }

    if (changed) {
      bumpVersion(normalizeKnowledgeMapId(resourceId));
      notifyChange();
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

  function getGridCell(resourceId, x, y) {
    const mask = getMask(resourceId);
    if (!mask) return null;
    return {
      resourceId: mask.resourceId,
      x: clamp(Math.floor((clamp(finite(x, 0), 0, mask.mapWidth - 1) / mask.mapWidth) * mask.width), 0, mask.width - 1),
      y: clamp(Math.floor((clamp(finite(y, 0), 0, mask.mapHeight - 1) / mask.mapHeight) * mask.height), 0, mask.height - 1),
      width: mask.width,
      height: mask.height,
      mapWidth: mask.mapWidth,
      mapHeight: mask.mapHeight,
      gridSize: mask.gridSize,
    };
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
      version: getVersion(resourceId),
    };
  }

  function getVersion(resourceId) {
    const key = resourceId == null ? "*" : normalizeKnowledgeMapId(resourceId);
    const ownVersion = versions.get(key) || 0;
    return key === "*" ? ownVersion : ownVersion + (versions.get("*") || 0);
  }

  function revealMovement(resourceId, x, y) {
    const search = getSearchConfig(searches, resourceId);
    const configured = typeof deps.getDiscoveryConfig === "function" ? deps.getDiscoveryConfig(resourceId) : null;
    const discovery = configured || (search && search.discovery) || {};
    const radius = discovery.movementRevealRadius ?? 80;
    return revealCircle(resourceId, x, y, radius, 1);
  }

  function fill(resourceId, value) {
    const mask = getMask(resourceId);
    if (!mask) return false;
    mask.cells.fill(Math.round(Math.max(0, Math.min(1, finite(value, 0))) * 255));
    bumpVersion(normalizeKnowledgeMapId(resourceId));
    notifyChange();
    return true;
  }

  function fillNoise(resourceId, options = {}) {
    const mask = getMask(resourceId);
    if (!mask) return false;
    const seed = Math.round(finite(options.seed, 1));
    const scale = Math.max(1, finite(options.scale, 24));
    const minValue = clamp(finite(options.min, 0), 0, 1);
    const maxValue = clamp(finite(options.max, 1), 0, 1);
    const low = Math.min(minValue, maxValue);
    const high = Math.max(minValue, maxValue);
    for (let y = 0; y < mask.height; y++) {
      for (let x = 0; x < mask.width; x++) {
        const value = low + smoothNoise(x, y, seed, scale) * (high - low);
        mask.cells[y * mask.width + x] = Math.round(clamp(value, 0, 1) * 255);
      }
    }
    bumpVersion(normalizeKnowledgeMapId(resourceId));
    notifyChange();
    return true;
  }

  function decay(resourceId, amount) {
    const id = normalizeKnowledgeMapId(resourceId);
    const mask = masks.get(id);
    if (!mask) return false;
    const byteAmount = Math.max(0, Math.min(255, Math.round(finite(amount, 0))));
    if (byteAmount <= 0) return false;
    let changed = false;
    for (let i = 0; i < mask.cells.length; i++) {
      const current = mask.cells[i];
      if (current <= 0) continue;
      mask.cells[i] = Math.max(0, current - byteAmount);
      changed = true;
    }
    if (changed) {
      bumpVersion(id);
      notifyChange();
    }
    return changed;
  }

  function getDecayConfig(resourceId) {
    const config = typeof deps.getDecayConfig === "function" ? deps.getDecayConfig(resourceId) : null;
    const decayConfig = config && typeof config === "object" ? config : {};
    return {
      enabled: decayConfig.enabled === true,
      intervalTicks: Math.max(1, Math.round(finite(decayConfig.intervalTicks, 500))),
      amount: Math.max(0, Math.min(255, finite(decayConfig.amount, 1))),
    };
  }

  function update(ctx = {}) {
    const ticks = Math.max(0, Math.round(finite(ctx.time && ctx.time.ticksProcessed, 0)));
    if (ticks <= 0) return;
    const resourceIds = new Set([
      ...Object.keys(searches).map(normalizeKnowledgeMapId),
      ...Array.from(masks.keys()).map(normalizeKnowledgeMapId),
    ]);
    for (const resourceId of resourceIds) {
      const config = getDecayConfig(resourceId);
      if (!config.enabled || config.amount <= 0) continue;
      const previous = decayTickRemainders.get(resourceId) || 0;
      const total = previous + ticks;
      const decaySteps = Math.floor(total / config.intervalTicks);
      decayTickRemainders.set(resourceId, total - decaySteps * config.intervalTicks);
      if (decaySteps <= 0) continue;
      decay(resourceId, config.amount * decaySteps);
    }
  }

  return {
    name: "resource-discovery-runtime",
    reset,
    resolveKnowledgeMapId: normalizeKnowledgeMapId,
    revealCircle,
    revealMovement,
    withMutationBatch,
    resolveRevealRadius: (resourceId, radius) => Math.max(0, finite(radius, 0) * getRevealRadiusMultiplier(deps, resourceId)),
    fill,
    fillNoise,
    decay,
    sampleKnowledge,
    getGridCell,
    getSnapshot,
    getVersion,
    update,
  };
}
