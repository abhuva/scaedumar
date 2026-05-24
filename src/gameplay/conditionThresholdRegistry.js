export const DEFAULT_CONDITION_THRESHOLDS_URL = "./assets/data/condition_thresholds.json";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeConditionThresholds(rawThresholds) {
  const output = {};
  if (!rawThresholds || typeof rawThresholds !== "object") return output;
  for (const [key, value] of Object.entries(rawThresholds)) {
    if (!value || typeof value !== "object") continue;
    const direction = value.direction === "highBad" ? "highBad" : "lowBad";
    output[key] = {
      direction,
      warning: finite(value.warning, direction === "highBad" ? 65 : 35),
      critical: finite(value.critical, direction === "highBad" ? 82 : 18),
      scale: Math.max(0.0001, finite(value.scale, key === "load" ? 1 : 100)),
    };
  }
  return output;
}

export async function loadConditionThresholds(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load condition thresholds: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_CONDITION_THRESHOLDS_URL;
  const response = await fetchFn(url);
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load condition thresholds from ${url}: ${status}`);
  }
  return normalizeConditionThresholds(await response.json());
}

export function getConditionWarningLevel(thresholds, key, rawValue) {
  const threshold = thresholds && thresholds[key];
  if (!threshold) return "normal";
  const value = finite(rawValue, 0);
  if (threshold.direction === "highBad") {
    if (value >= threshold.critical) return "critical";
    if (value >= threshold.warning) return "warning";
    return "normal";
  }
  if (value <= threshold.critical) return "critical";
  if (value <= threshold.warning) return "warning";
  return "normal";
}
