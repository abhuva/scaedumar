export const DEFAULT_RESOURCE_SEARCH_URL = "./assets/data/resource_search.json";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeReward(rawReward) {
  if (!rawReward || typeof rawReward !== "object") return null;
  const type = rawReward.type === "item" ? "item" : "";
  if (!type) return null;
  return {
    type,
    itemId: typeof rawReward.itemId === "string" ? rawReward.itemId : "",
    quantity: Math.max(1, Math.round(finite(rawReward.quantity, 1))),
  };
}

function normalizeDiscovery(rawDiscovery) {
  const source = rawDiscovery && typeof rawDiscovery === "object" ? rawDiscovery : {};
  return {
    gridSize: Math.max(8, Math.min(2048, Math.round(finite(source.gridSize, 256)))),
    movementRevealRadius: Math.max(0, finite(source.movementRevealRadius, 30)),
  };
}

function normalizeOverlay(rawOverlay) {
  const source = rawOverlay && typeof rawOverlay === "object" ? rawOverlay : {};
  const thresholds = Array.isArray(source.thresholds)
    ? source.thresholds.map((value) => Math.max(0, Math.min(1, finite(value, 0)))).filter((value) => value > 0)
    : [0.35, 0.55, 0.75];
  const colors = Array.isArray(source.colors)
    ? source.colors.filter((value) => typeof value === "string" && value)
    : [];
  return {
    type: source.type === "contour" ? "contour" : "none",
    renderMode: source.renderMode === "raster" ? "raster" : "marching",
    enabledInInspect: source.enabledInInspect !== false,
    sampleStep: Math.max(1, Math.min(128, Math.round(finite(source.sampleStep, 8)))),
    knowledgeThreshold: Math.max(0, Math.min(1, finite(source.knowledgeThreshold, 0.25))),
    bandWidth: Math.max(0.0001, Math.min(1, finite(source.bandWidth, 0.018))),
    thresholds: thresholds.length ? thresholds : [0.2, 0.35, 0.5, 0.65, 0.8],
    colors,
    lineWidth: Math.max(0.25, Math.min(8, finite(source.lineWidth, 1.25))),
  };
}

function normalizeResourceSearch(raw, fallbackId) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : fallbackId;
  if (!id) return null;
  const threshold = Math.max(0, Math.min(1, finite(raw.threshold, 0)));
  const maxChance = Math.max(0, Math.min(1, finite(raw.maxChance, 1)));
  return {
    id,
    map: typeof raw.map === "string" && raw.map ? raw.map : id,
    channel: ["r", "g", "b", "a"].includes(raw.channel) ? raw.channel : "r",
    threshold,
    curve: Math.max(0.001, finite(raw.curve, 1)),
    baseChance: Math.max(0, Math.min(1, finite(raw.baseChance, 0))),
    chanceScale: Math.max(0, finite(raw.chanceScale, 0)),
    maxChance,
    movementBias: Math.max(0, finite(raw.movementBias, 0)),
    discovery: normalizeDiscovery(raw.discovery),
    overlay: normalizeOverlay(raw.overlay),
    reward: normalizeReward(raw.reward),
  };
}

export function normalizeResourceSearches(rawSearches) {
  const output = {};
  if (!rawSearches || typeof rawSearches !== "object") return output;
  for (const [key, value] of Object.entries(rawSearches)) {
    const normalized = normalizeResourceSearch(value, key);
    if (!normalized) continue;
    output[normalized.id] = normalized;
  }
  return output;
}

export async function loadResourceSearches(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load resource searches: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_RESOURCE_SEARCH_URL;
  const response = await fetchFn(url);
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load resource searches from ${url}: ${status}`);
  }
  return normalizeResourceSearches(await response.json());
}
