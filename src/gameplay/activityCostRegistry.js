export const DEFAULT_ACTIVITY_COSTS_URL = "./assets/data/activity_costs.json";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEffects(rawEffects) {
  const effects = {};
  if (!rawEffects || typeof rawEffects !== "object") return effects;
  for (const key of ["nutrition", "hydration", "fatigue"]) {
    if (Object.prototype.hasOwnProperty.call(rawEffects, key)) {
      effects[key] = finite(rawEffects[key], 0);
    }
  }
  return effects;
}

function normalizeScales(rawScales) {
  const scales = {};
  if (!rawScales || typeof rawScales !== "object") return scales;
  for (const [key, value] of Object.entries(rawScales)) {
    if (!value || typeof value !== "object") continue;
    scales[key] = {
      weight: finite(value.weight, 0),
      baseline: finite(value.baseline, 0),
    };
  }
  return scales;
}

function normalizeMultiplier(rawMultiplier) {
  const min = Math.max(0, finite(rawMultiplier && rawMultiplier.min, 0.25));
  const max = Math.max(min, finite(rawMultiplier && rawMultiplier.max, 4));
  return { min, max };
}

export function normalizeActivityCosts(rawCosts) {
  const output = {};
  if (!rawCosts || typeof rawCosts !== "object") return output;
  for (const [key, value] of Object.entries(rawCosts)) {
    if (!key || !value || typeof value !== "object") continue;
    output[key] = {
      effects: normalizeEffects(value.effects),
      scales: normalizeScales(value.scales),
      multiplier: normalizeMultiplier(value.multiplier),
    };
  }
  return output;
}

export async function loadActivityCosts(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load activity costs: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_ACTIVITY_COSTS_URL;
  const response = await fetchFn(url);
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load activity costs from ${url}: ${status}`);
  }
  return normalizeActivityCosts(await response.json());
}
