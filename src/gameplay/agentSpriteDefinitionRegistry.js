import { normalizeAgentSpriteDefinition } from "./agentSpriteModel.js";

export const DEFAULT_PLAYER_SPRITE_DEFINITIONS_URL = "./assets/data/agents/player_sprites.json";
export const DEFAULT_SWARM_SPRITE_DEFINITIONS_URL = "./assets/data/agents/swarm_sprites.json";

function normalizeSpriteMap(rawSprites) {
  const output = {};
  if (!rawSprites || typeof rawSprites !== "object") return output;
  for (const [key, value] of Object.entries(rawSprites)) {
    const source = value && typeof value === "object" ? value : {};
    const normalized = normalizeAgentSpriteDefinition({
      ...source,
      id: typeof source.id === "string" && source.id ? source.id : key,
    });
    if (!normalized.id) continue;
    output[normalized.id] = normalized;
  }
  return output;
}

export function normalizeAgentSpriteDefinitionFile(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    version: Math.max(1, Math.round(Number(source.version) || 1)),
    sprites: normalizeSpriteMap(source.sprites),
  };
}

export async function loadAgentSpriteDefinitionFile(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load agent sprite definitions: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_PLAYER_SPRITE_DEFINITIONS_URL;
  const response = await fetchFn(url, { cache: "no-store" });
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load agent sprite definitions from ${url}: ${status}`);
  }
  return normalizeAgentSpriteDefinitionFile(await response.json());
}

