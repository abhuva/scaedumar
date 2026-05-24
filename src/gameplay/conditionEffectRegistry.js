export const DEFAULT_CONDITION_EFFECTS_URL = "./assets/data/condition_effects.json";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item) : [];
}

function normalizeModifiers(rawModifiers) {
  const modifiers = {};
  if (!rawModifiers || typeof rawModifiers !== "object") return modifiers;
  for (const key of ["movementCostMultiplier", "fatigueGainMultiplier", "recoveryMultiplier", "activityCostMultiplier"]) {
    if (Object.prototype.hasOwnProperty.call(rawModifiers, key)) {
      modifiers[key] = finite(rawModifiers[key], 1);
    }
  }
  return modifiers;
}

function normalizeConditionEffect(raw, fallbackId) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : fallbackId;
  if (!id) return null;
  const mode = raw.mode === "high" ? "high" : "low";
  return {
    id,
    category: typeof raw.category === "string" && raw.category ? raw.category : id,
    stat: typeof raw.stat === "string" && raw.stat ? raw.stat : "",
    mode,
    threshold: finite(raw.threshold, mode === "high" ? 100 : 0),
    priority: finite(raw.priority, 0),
    label: typeof raw.label === "string" && raw.label ? raw.label : id,
    icon: typeof raw.icon === "string" && raw.icon ? raw.icon : id.slice(0, 1).toUpperCase(),
    severity: raw.severity === "critical" ? "critical" : "warning",
    description: typeof raw.description === "string" ? raw.description : "",
    effectsText: normalizeStringArray(raw.effectsText),
    remedyText: normalizeStringArray(raw.remedyText),
    modifiers: normalizeModifiers(raw.modifiers),
  };
}

export function normalizeConditionEffects(rawEffects) {
  const output = {};
  if (!rawEffects || typeof rawEffects !== "object") return output;
  for (const [key, value] of Object.entries(rawEffects)) {
    const normalized = normalizeConditionEffect(value, key);
    if (!normalized) continue;
    output[normalized.id] = normalized;
  }
  return output;
}

export async function loadConditionEffects(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load condition effects: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_CONDITION_EFFECTS_URL;
  const response = await fetchFn(url);
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load condition effects from ${url}: ${status}`);
  }
  return normalizeConditionEffects(await response.json());
}
