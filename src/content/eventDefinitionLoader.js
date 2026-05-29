function normalizeEventDefinitionList(payload) {
  return Array.isArray(payload) ? payload.filter((definition) => definition && typeof definition === "object") : [];
}

function getEventDefinitionId(definition, source) {
  const id = String(definition?.id || "");
  if (!id) {
    throw new Error(`Event definition in ${source} is missing an id.`);
  }
  return id;
}

function normalizeEventDefinitionSource(source) {
  if (typeof source === "string") return { path: source, optional: false };
  if (source && typeof source === "object") {
    return {
      path: String(source.path || ""),
      optional: Boolean(source.optional),
    };
  }
  return { path: "", optional: false };
}

function isMissingOptionalEventDefinitionError(error) {
  if (error && error.code === "MISSING_OPTIONAL_JSON") return true;
  if (error && Number(error.status) === 404) return true;
  const message = String(error && error.message ? error.message : error || "").toLowerCase();
  return message.includes("404") || message.includes("not found") || message.includes("missing optional json");
}

export async function loadEventDefinitionFiles(paths = [], deps = {}) {
  const fetchJson = typeof deps.fetchJson === "function"
    ? deps.fetchJson
    : async (path) => {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load event definitions ${path}: ${response.status}`);
        return response.json();
      };
  const definitions = [];
  const seenIds = new Map();
  for (const source of paths.map(normalizeEventDefinitionSource).filter((item) => item.path)) {
    let payload = null;
    try {
      payload = await fetchJson(source.path);
    } catch (error) {
      if (source.optional && isMissingOptionalEventDefinitionError(error)) continue;
      throw error;
    }
    const sourceDefinitions = normalizeEventDefinitionList(payload);
    for (const definition of sourceDefinitions) {
      const id = getEventDefinitionId(definition, source.path);
      const existingSource = seenIds.get(id);
      if (existingSource) {
        throw new Error(`Duplicate event ID: ${id} in ${source.path}; already defined in ${existingSource}.`);
      }
      seenIds.set(id, source.path);
      definitions.push({ ...definition });
    }
  }
  return definitions;
}

export const GLOBAL_EVENT_DEFINITION_PATHS = [
  "assets/data/events/tutorials.json",
  "assets/data/events/survival.json",
];
