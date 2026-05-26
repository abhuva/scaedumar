export const DEFAULT_RESOURCE_SEARCH_URL = "./assets/data/resource_search.json";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeLootEntry(rawEntry) {
  if (!rawEntry || typeof rawEntry !== "object") return null;
  const itemId = typeof rawEntry.itemId === "string" ? rawEntry.itemId : "";
  if (!itemId) return null;
  return {
    itemId,
    quantity: Math.max(1, Math.round(finite(rawEntry.quantity, 1))),
    weight: Math.max(0, finite(rawEntry.weight, 1)),
  };
}

function normalizeLootBands(rawBands) {
  const output = {};
  if (!rawBands || typeof rawBands !== "object") return output;
  for (const [band, entries] of Object.entries(rawBands)) {
    if (!Array.isArray(entries)) continue;
    const normalizedEntries = entries.map(normalizeLootEntry).filter((entry) => entry && entry.weight > 0);
    if (!normalizedEntries.length) continue;
    output[String(Math.max(0, Math.min(255, Math.round(finite(band, 0)))))] = normalizedEntries;
  }
  return output;
}

function normalizeReward(rawReward) {
  if (!rawReward || typeof rawReward !== "object") return null;
  if (rawReward.type === "item") {
    const itemId = typeof rawReward.itemId === "string" ? rawReward.itemId : "";
    if (!itemId) return null;
    return {
      type: "item",
      itemId,
      quantity: Math.max(1, Math.round(finite(rawReward.quantity, 1))),
    };
  }
  if (rawReward.type === "fillContainer") {
    const minQuantity = Math.max(1, Math.round(finite(rawReward.minQuantity, 1)));
    const maxQuantity = Math.max(minQuantity, Math.round(finite(rawReward.maxQuantity, minQuantity)));
    return {
      type: "fillContainer",
      tag: typeof rawReward.tag === "string" && rawReward.tag ? rawReward.tag : "water_container",
      minQuantity,
      maxQuantity,
      scaleBy: rawReward.scaleBy === "chance" ? "chance" : "value",
    };
  }
  if (rawReward.type === "lootTable") {
    return {
      type: "lootTable",
      defaultBand: Math.max(0, Math.min(255, Math.round(finite(rawReward.defaultBand, 0)))),
      bandMap: typeof rawReward.bandMap === "string" ? rawReward.bandMap : "",
      bandChannel: ["r", "g", "b", "a"].includes(rawReward.bandChannel) ? rawReward.bandChannel : "r",
      bands: normalizeLootBands(rawReward.bands),
    };
  }
  return null;
}

function normalizeDiscovery(rawDiscovery) {
  const source = rawDiscovery && typeof rawDiscovery === "object" ? rawDiscovery : {};
  return {
    gridSize: Math.max(8, Math.min(2048, Math.round(finite(source.gridSize, 256)))),
    movementRevealRadius: Math.max(0, finite(source.movementRevealRadius, 80)),
    revealFalloff: Math.max(0, Math.min(8, finite(source.revealFalloff, 0.15))),
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
    enabledInInspect: source.enabledInInspect !== false,
    sampleStep: Math.max(1, Math.min(128, Math.round(finite(source.sampleStep, 8)))),
    knowledgeThreshold: Math.max(0, Math.min(1, finite(source.knowledgeThreshold, 0.25))),
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
  const response = await fetchFn(url, { cache: "no-store" });
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load resource searches from ${url}: ${status}`);
  }
  return normalizeResourceSearches(await response.json());
}
