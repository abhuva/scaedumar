export const DEFAULT_ITEM_DEFINITIONS_URL = "./assets/data/items.json";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeItemDefinition(raw, fallbackId) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : fallbackId;
  if (!id) return null;
  const normalized = {
    id,
    name: typeof raw.name === "string" && raw.name ? raw.name : id,
    icon: typeof raw.icon === "string" ? raw.icon : "",
    description: typeof raw.description === "string" ? raw.description : "",
    stackable: raw.stackable !== false,
    maxStack: Math.max(1, Math.round(finite(raw.maxStack, 1))),
    keepWhenEmpty: raw.keepWhenEmpty === true,
    weight: Math.max(0, finite(raw.weight, 0)),
    bulk: Math.max(0, finite(raw.bulk, 0)),
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag) => typeof tag === "string") : [],
  };
  if (raw.use && typeof raw.use === "object") {
    normalized.use = {
      label: typeof raw.use.label === "string" && raw.use.label ? raw.use.label : "Use",
      effects: raw.use.effects && typeof raw.use.effects === "object" ? { ...raw.use.effects } : {},
    };
  }
  return normalized;
}

export function normalizeItemDefinitions(rawDefinitions) {
  const output = Object.create(null);
  if (!rawDefinitions || typeof rawDefinitions !== "object") return output;
  for (const key in rawDefinitions) {
    if (!Object.prototype.hasOwnProperty.call(rawDefinitions, key)) continue;
    const value = rawDefinitions[key];
    const normalized = normalizeItemDefinition(value, key);
    if (!normalized) continue;
    output[normalized.id] = normalized;
  }
  return output;
}

export async function loadItemDefinitions(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load item definitions: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_ITEM_DEFINITIONS_URL;
  const response = await fetchFn(url);
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load item definitions from ${url}: ${status}`);
  }
  return normalizeItemDefinitions(await response.json());
}

export function getItemDefinition(itemId, registry) {
  if (!registry || !itemId || typeof itemId !== "string") return null;
  return Object.prototype.hasOwnProperty.call(registry, itemId) ? registry[itemId] : null;
}

export function listItemDefinitions(registry) {
  if (!registry || typeof registry !== "object") return [];
  return Object.values(registry);
}
