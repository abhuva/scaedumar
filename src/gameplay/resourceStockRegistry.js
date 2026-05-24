export const DEFAULT_RESOURCE_STOCK_URL = "./assets/data/resource_stock.json";

const DEFAULT_STOCK_SETTINGS = {
  gridSize: 128,
  initialStock: 255,
  initialKnownStock: 0,
  depleteAmount: 50,
  neighborDepleteAmount: 25,
  depleteRadius: 1,
  depleteOn: "success",
  replenishIntervalTicks: 500,
  replenishAmount: 1,
};

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeStockSettings(raw, fallback = DEFAULT_STOCK_SETTINGS) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    gridSize: Math.max(8, Math.min(2048, Math.round(finite(source.gridSize, fallback.gridSize)))),
    initialStock: Math.round(clamp(finite(source.initialStock, fallback.initialStock), 0, 255)),
    initialKnownStock: Math.round(clamp(finite(source.initialKnownStock, fallback.initialKnownStock), 0, 255)),
    depleteAmount: Math.round(clamp(finite(source.depleteAmount, fallback.depleteAmount), 0, 255)),
    neighborDepleteAmount: Math.round(clamp(finite(source.neighborDepleteAmount, fallback.neighborDepleteAmount), 0, 255)),
    depleteRadius: Math.max(0, Math.min(16, Math.round(finite(source.depleteRadius, fallback.depleteRadius)))),
    depleteOn: source.depleteOn === "attempt" ? "attempt" : "success",
    replenishIntervalTicks: Math.max(1, Math.round(finite(source.replenishIntervalTicks, fallback.replenishIntervalTicks))),
    replenishAmount: Math.round(clamp(finite(source.replenishAmount, fallback.replenishAmount), 0, 255)),
  };
}

export function normalizeResourceStockSettings(rawSettings, resourceIds = []) {
  const source = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const defaults = normalizeStockSettings(source.defaults, DEFAULT_STOCK_SETTINGS);
  const output = {
    version: 1,
    defaults,
    resources: {},
  };
  const ids = new Set(resourceIds.map((id) => String(id || "")).filter(Boolean));
  const rawResources = source.resources && typeof source.resources === "object" ? source.resources : {};
  for (const id of Object.keys(rawResources)) {
    if (id) ids.add(id);
  }
  for (const id of ids) {
    output.resources[id] = normalizeStockSettings(rawResources[id], defaults);
  }
  return output;
}

export async function loadResourceStockSettings(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load resource stock settings: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_RESOURCE_STOCK_URL;
  const response = await fetchFn(url);
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load resource stock settings from ${url}: ${status}`);
  }
  return normalizeResourceStockSettings(await response.json(), options.resourceIds || []);
}
