export const DEFAULT_ACTIVITY_DEFINITIONS_URL = "./assets/data/activities.json";

function normalizeCostKeys(rawCostKeys) {
  const costKeys = {};
  if (!rawCostKeys || typeof rawCostKeys !== "object") return costKeys;
  for (const [key, value] of Object.entries(rawCostKeys)) {
    if (!key || typeof value !== "string" || !value) continue;
    costKeys[key] = value;
  }
  return costKeys;
}

function normalizeActivityDefinition(raw, fallbackId) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : fallbackId;
  if (!id) return null;
  return {
    id,
    label: typeof raw.label === "string" && raw.label ? raw.label : id,
    buttonLabel: typeof raw.buttonLabel === "string" ? raw.buttonLabel : "",
    title: typeof raw.title === "string" && raw.title ? raw.title : "",
    panel: Boolean(raw.panel),
    exclusive: raw.exclusive !== false,
    command: typeof raw.command === "string" ? raw.command : "",
    cancelLabel: typeof raw.cancelLabel === "string" && raw.cancelLabel ? raw.cancelLabel : "Activity canceled.",
    completeLabel: typeof raw.completeLabel === "string" && raw.completeLabel ? raw.completeLabel : "",
    costKeys: normalizeCostKeys(raw.costKeys),
    resourceSearch: typeof raw.resourceSearch === "string" && raw.resourceSearch ? raw.resourceSearch : "",
  };
}

export function normalizeActivityDefinitions(rawDefinitions) {
  const output = {};
  if (!rawDefinitions || typeof rawDefinitions !== "object") return output;
  for (const [key, value] of Object.entries(rawDefinitions)) {
    const normalized = normalizeActivityDefinition(value, key);
    if (!normalized) continue;
    output[normalized.id] = normalized;
  }
  return output;
}

export async function loadActivityDefinitions(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load activity definitions: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_ACTIVITY_DEFINITIONS_URL;
  const response = await fetchFn(url, { cache: "no-store" });
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load activity definitions from ${url}: ${status}`);
  }
  return normalizeActivityDefinitions(await response.json());
}

export function getActivityDefinition(activityId, registry) {
  if (!registry || !activityId || typeof activityId !== "string") return null;
  return registry[activityId] || null;
}
