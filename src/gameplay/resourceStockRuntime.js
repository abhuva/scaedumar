import { normalizeResourceStockSettings } from "./resourceStockRegistry.js";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampByte(value) {
  return Math.round(clamp(finite(value, 0), 0, 255));
}

function byteArrayFromArray(values, expectedLength) {
  if (!Array.isArray(values) || values.length !== expectedLength) return null;
  const output = new Uint8Array(expectedLength);
  for (let i = 0; i < expectedLength; i++) {
    output[i] = clampByte(values[i]);
  }
  return output;
}

function createField(resourceId, settings, mapWidth, mapHeight) {
  const safeMapWidth = Math.max(1, Math.round(finite(mapWidth, 1)));
  const safeMapHeight = Math.max(1, Math.round(finite(mapHeight, 1)));
  const gridSize = Math.max(8, Math.round(finite(settings && settings.gridSize, 128)));
  const aspect = safeMapHeight / safeMapWidth;
  const width = gridSize;
  const height = Math.max(1, Math.round(gridSize * aspect));
  const stock = new Uint8Array(width * height);
  const knownStock = new Uint8Array(width * height);
  stock.fill(clampByte(settings && settings.initialStock != null ? settings.initialStock : 255));
  knownStock.fill(clampByte(settings && settings.initialKnownStock != null ? settings.initialKnownStock : 0));
  return {
    resourceId,
    width,
    height,
    gridSize,
    mapWidth: safeMapWidth,
    mapHeight: safeMapHeight,
    stock,
    knownStock,
  };
}

export function createResourceStockRuntime(deps = {}) {
  const stockSettings = {
    ...(deps.resourceStockSettings || {}),
    resources: {
      ...((deps.resourceStockSettings && deps.resourceStockSettings.resources) || {}),
    },
  };
  const configuredResources = stockSettings.resources;
  const resourceIds = new Set([
    ...Object.keys(deps.resourceSearches || {}),
    ...Object.keys(configuredResources),
  ]);
  const fields = new Map();
  const versions = new Map();
  const replenishTickRemainders = new Map();

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

  function getSettings(resourceId) {
    const id = String(resourceId || "");
    return configuredResources[id] || stockSettings.defaults || {};
  }

  function getResourceSettings(resourceId) {
    return {
      ...(stockSettings.defaults || {}),
      ...getSettings(resourceId),
    };
  }

  function serializeSettings() {
    const settings = normalizeResourceStockSettings(stockSettings, [...resourceIds]);
    const fieldsOutput = {};
    for (const id of resourceIds) {
      const field = getField(id);
      if (!field) continue;
      fieldsOutput[id] = {
        width: field.width,
        height: field.height,
        mapWidth: field.mapWidth,
        mapHeight: field.mapHeight,
        gridSize: field.gridSize,
        stock: Array.from(field.stock),
        knownStock: Array.from(field.knownStock),
      };
    }
    return {
      ...settings,
      fields: fieldsOutput,
    };
  }

  function applySettings(rawSettings) {
    const normalized = normalizeResourceStockSettings(rawSettings, [...resourceIds]);
    stockSettings.version = normalized.version;
    stockSettings.defaults = normalized.defaults;
    for (const key of Object.keys(configuredResources)) {
      delete configuredResources[key];
    }
    for (const [id, settings] of Object.entries(normalized.resources || {})) {
      configuredResources[id] = settings;
      resourceIds.add(id);
    }
    reset();
    const rawFields = rawSettings && rawSettings.fields && typeof rawSettings.fields === "object"
      ? rawSettings.fields
      : {};
    for (const [id, rawField] of Object.entries(rawFields)) {
      if (!id || !rawField || typeof rawField !== "object") continue;
      resourceIds.add(id);
      const field = getField(id);
      if (!field) continue;
      const stock = byteArrayFromArray(rawField.stock, field.stock.length);
      const knownStock = byteArrayFromArray(rawField.knownStock, field.knownStock.length);
      const sizeMatches = Math.round(finite(rawField.width, -1)) === field.width
        && Math.round(finite(rawField.height, -1)) === field.height
        && Math.round(finite(rawField.mapWidth, -1)) === field.mapWidth
        && Math.round(finite(rawField.mapHeight, -1)) === field.mapHeight
        && Math.round(finite(rawField.gridSize, -1)) === field.gridSize;
      if (!sizeMatches || !stock || !knownStock) continue;
      field.stock.set(stock);
      field.knownStock.set(knownStock);
      bumpVersion(id);
    }
    return true;
  }

  function updateResourceSettings(resourceId, patch = {}) {
    const id = String(resourceId || "");
    if (!id) return false;
    const previous = getResourceSettings(id);
    const next = {
      ...previous,
      ...patch,
    };
    configuredResources[id] = next;
    resourceIds.add(id);
    if (Math.round(finite(previous.gridSize, 128)) !== Math.round(finite(next.gridSize, 128))) {
      reset(id);
      return true;
    }
    bumpVersion(id);
    if (typeof deps.onChange === "function") deps.onChange(id);
    return true;
  }

  function getField(resourceId) {
    const id = String(resourceId || "");
    if (!id) return null;
    resourceIds.add(id);
    const mapWidth = getMapWidth();
    const mapHeight = getMapHeight();
    const settings = getSettings(id);
    const desiredGridSize = Math.max(8, Math.round(finite(settings.gridSize, 128)));
    const current = fields.get(id);
    if (
      current
      && current.mapWidth === mapWidth
      && current.mapHeight === mapHeight
      && current.gridSize === desiredGridSize
    ) {
      return current;
    }
    const next = createField(id, settings, mapWidth, mapHeight);
    fields.set(id, next);
    bumpVersion(id);
    return next;
  }

  function mapToGrid(field, x, y) {
    const px = clamp(finite(x, 0), 0, field.mapWidth - 1);
    const py = clamp(finite(y, 0), 0, field.mapHeight - 1);
    return {
      gx: clamp(Math.floor((px / field.mapWidth) * field.width), 0, field.width - 1),
      gy: clamp(Math.floor((py / field.mapHeight) * field.height), 0, field.height - 1),
    };
  }

  function sampleCell(field, cells, x, y) {
    if (!field || !cells) return 255;
    const { gx, gy } = mapToGrid(field, x, y);
    return cells[gy * field.width + gx] || 0;
  }

  function sampleFactor(resourceId, x, y) {
    const field = getField(resourceId);
    return sampleCell(field, field && field.stock, x, y) / 255;
  }

  function sampleKnownFactor(resourceId, x, y) {
    const field = getField(resourceId);
    return sampleCell(field, field && field.knownStock, x, y) / 255;
  }

  function forEachDepleteCell(field, centerX, centerY, settings, callback) {
    const radius = Math.max(0, Math.round(finite(settings.depleteRadius, 1)));
    const centerAmount = Math.max(0, Math.round(finite(settings.depleteAmount, 50)));
    const neighborAmount = Math.max(0, Math.round(finite(settings.neighborDepleteAmount, 25)));
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const gx = centerX + dx;
        const gy = centerY + dy;
        if (gx < 0 || gx >= field.width || gy < 0 || gy >= field.height) continue;
        const amount = dx === 0 && dy === 0 ? centerAmount : neighborAmount;
        if (amount <= 0) continue;
        const index = gy * field.width + gx;
        callback(index, amount);
      }
    }
  }

  function deplete(resourceId, x, y) {
    const field = getField(resourceId);
    if (!field) return false;
    const settings = getSettings(resourceId);
    const { gx, gy } = mapToGrid(field, x, y);
    let changed = false;
    forEachDepleteCell(field, gx, gy, settings, (index, amount) => {
      const beforeStock = field.stock[index];
      const nextStock = Math.max(0, beforeStock - amount);
      if (nextStock !== beforeStock) {
        field.stock[index] = nextStock;
        changed = true;
      }
      if (field.knownStock[index] !== field.stock[index]) {
        field.knownStock[index] = field.stock[index];
        changed = true;
      }
    });
    if (changed) {
      bumpVersion(resourceId);
      if (typeof deps.onChange === "function") deps.onChange(resourceId);
    }
    return changed;
  }

  function revealKnown(resourceId, centerX, centerY, radius) {
    const field = getField(resourceId);
    if (!field) return false;
    const safeRadius = Math.max(0, finite(radius, 0));
    if (safeRadius <= 0) return false;
    const mapX = clamp(finite(centerX, 0), 0, field.mapWidth - 1);
    const mapY = clamp(finite(centerY, 0), 0, field.mapHeight - 1);
    const minGridX = Math.round(clamp(Math.floor(((mapX - safeRadius) / field.mapWidth) * field.width), 0, field.width - 1));
    const maxGridX = Math.round(clamp(Math.ceil(((mapX + safeRadius) / field.mapWidth) * field.width), 0, field.width - 1));
    const minGridY = Math.round(clamp(Math.floor(((mapY - safeRadius) / field.mapHeight) * field.height), 0, field.height - 1));
    const maxGridY = Math.round(clamp(Math.ceil(((mapY + safeRadius) / field.mapHeight) * field.height), 0, field.height - 1));
    const radiusSq = safeRadius * safeRadius;
    let changed = false;
    for (let gy = minGridY; gy <= maxGridY; gy++) {
      const sampleY = ((gy + 0.5) / field.height) * field.mapHeight;
      for (let gx = minGridX; gx <= maxGridX; gx++) {
        const sampleX = ((gx + 0.5) / field.width) * field.mapWidth;
        const dx = sampleX - mapX;
        const dy = sampleY - mapY;
        if (dx * dx + dy * dy > radiusSq) continue;
        const index = gy * field.width + gx;
        const value = field.stock[index];
        if (field.knownStock[index] === value) continue;
        field.knownStock[index] = value;
        changed = true;
      }
    }
    if (changed) {
      bumpVersion(resourceId);
      if (typeof deps.onChange === "function") deps.onChange(resourceId);
    }
    return changed;
  }

  function replenish(resourceId, amount) {
    const field = getField(resourceId);
    if (!field) return false;
    const byteAmount = Math.max(0, Math.min(255, Math.round(finite(amount, 0))));
    if (byteAmount <= 0) return false;
    let changed = false;
    for (let i = 0; i < field.stock.length; i++) {
      const before = field.stock[i];
      const after = Math.min(255, before + byteAmount);
      if (after === before) continue;
      field.stock[i] = after;
      changed = true;
    }
    if (changed) {
      bumpVersion(resourceId);
      if (typeof deps.onChange === "function") deps.onChange(resourceId);
    }
    return changed;
  }

  function update(ctx = {}) {
    const ticks = Math.max(0, Math.round(finite(ctx.time && ctx.time.ticksProcessed, 0)));
    if (ticks <= 0) return false;
    let changed = false;
    for (const resourceId of resourceIds) {
      const settings = getSettings(resourceId);
      const amount = Math.max(0, Math.round(finite(settings.replenishAmount, 0)));
      if (amount <= 0) continue;
      const interval = Math.max(1, Math.round(finite(settings.replenishIntervalTicks, 500)));
      const previous = replenishTickRemainders.get(resourceId) || 0;
      const total = previous + ticks;
      const steps = Math.floor(total / interval);
      replenishTickRemainders.set(resourceId, total - steps * interval);
      if (steps <= 0) continue;
      if (replenish(resourceId, amount * steps)) {
        changed = true;
      }
    }
    return changed;
  }

  function getSnapshot(resourceId) {
    const field = getField(resourceId);
    if (!field) return null;
    return {
      resourceId: field.resourceId,
      width: field.width,
      height: field.height,
      mapWidth: field.mapWidth,
      mapHeight: field.mapHeight,
      stock: field.stock,
      knownStock: field.knownStock,
      version: getVersion(resourceId),
    };
  }

  function getVersion(resourceId) {
    return (versions.get(String(resourceId || "*")) || 0) + (versions.get("*") || 0);
  }

  function reset(resourceId = null) {
    if (resourceId) {
      fields.delete(String(resourceId));
      replenishTickRemainders.delete(String(resourceId));
      bumpVersion(resourceId);
    } else {
      fields.clear();
      replenishTickRemainders.clear();
      bumpVersion("*");
    }
    if (typeof deps.onChange === "function") deps.onChange(resourceId || "*");
  }

  function fill(resourceId, value, target = "stock") {
    const field = getField(resourceId);
    if (!field) return false;
    const byte = clampByte(value);
    const fillKnown = target === "known" || target === "both";
    const fillLive = target === "stock" || target === "both";
    if (fillLive) field.stock.fill(byte);
    if (fillKnown) field.knownStock.fill(byte);
    bumpVersion(resourceId);
    if (typeof deps.onChange === "function") deps.onChange(resourceId);
    return true;
  }

  return {
    name: "resource-stock-runtime",
    reset,
    serializeSettings,
    applySettings,
    getResourceSettings,
    updateResourceSettings,
    fill,
    sampleFactor,
    sampleKnownFactor,
    deplete,
    revealKnown,
    replenish,
    getSnapshot,
    getVersion,
    update,
  };
}
