import { buildAgentSpriteRenderItem, normalizeAgentSpriteDefinition } from "./agentSpriteModel.js";
import { expandRenderLutWeightedRefs } from "../render/renderLutRegistry.js";

export const DEFAULT_BIRD_SPRITE_DEFINITION = Object.freeze({
  id: "bird",
  layer: "flying",
});

export const DEFAULT_HAWK_SPRITE_DEFINITION = Object.freeze({
  id: "hawk",
  layer: "flying",
});

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getAgentId(swarmState, index) {
  return swarmState.agentId && Number.isFinite(Number(swarmState.agentId[index]))
    ? Math.round(Number(swarmState.agentId[index]))
    : index + 1;
}

function hashUint(value) {
  const text = String(value ?? "");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function resolvePaletteRows(definition, lutRegistry) {
  if (!definition || definition.palette?.mode !== "grayscale-lut") return [];
  return expandRenderLutWeightedRefs(definition.palette.lutRefs, lutRegistry);
}

function choosePaletteRow(rows, seed) {
  const candidates = Array.isArray(rows) ? rows : [];
  if (candidates.length === 0) return -1;
  const totalWeight = candidates.reduce((sum, row) => sum + Math.max(0, finiteOr(row && row.weight, 0)), 0);
  if (totalWeight <= 0) return candidates[hashUint(seed) % candidates.length].row;
  const target = (hashUint(seed) / 4294967296) * totalWeight;
  let cursor = 0;
  for (const row of candidates) {
    cursor += Math.max(0, finiteOr(row && row.weight, 0));
    if (target < cursor) return row.row;
  }
  return candidates[candidates.length - 1].row;
}

function filterPaletteRowsByTags(rows, tags) {
  const candidates = Array.isArray(rows) ? rows : [];
  const requestedTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (requestedTags.length === 0) return candidates;
  const requested = new Set(requestedTags);
  const taggedMatches = candidates.filter((row) => (
    Array.isArray(row.tags) && row.tags.some((tag) => requested.has(tag))
  ));
  return taggedMatches.length > 0 ? taggedMatches : candidates;
}

function getRequiredAtlasRows(agents, columns) {
  const safeColumns = Math.max(1, Math.floor(finiteOr(columns, 16)));
  let maxSlot = 0;
  for (const agent of agents) {
    const slot = Math.max(0, Math.floor(finiteOr(agent && agent.spriteSlot, 0)));
    const frameCount = Math.max(1, Math.floor(finiteOr(agent && agent.sourceFrameCount, 1)));
    const frameIndex = Math.max(0, Math.min(frameCount - 1, Math.floor(finiteOr(agent && agent.sourceFrameIndex, 0))));
    const baseSlot = Math.max(0, slot - frameIndex);
    maxSlot = Math.max(maxSlot, baseSlot + frameCount - 1);
  }
  return Math.max(1, Math.ceil((maxSlot + 1) / safeColumns));
}

export function createSwarmAgentSpriteRuntime(deps = {}) {
  const initialBirdDefinition = normalizeAgentSpriteDefinition({
    ...DEFAULT_BIRD_SPRITE_DEFINITION,
    ...(deps.birdDefinition || {}),
  });
  const initialHawkDefinition = normalizeAgentSpriteDefinition({
    ...DEFAULT_HAWK_SPRITE_DEFINITION,
    ...(deps.hawkDefinition || {}),
  });
  const agentScratch = { x: 0, y: 0, z: 0 };
  const hawkScratch = { x: 0, y: 0, z: 0 };
  function getLutRegistry() {
    return typeof deps.getLutRegistry === "function"
      ? deps.getLutRegistry()
      : deps.lutRegistry;
  }

  function getBirdDefinition() {
    const source = typeof deps.getBirdDefinition === "function"
      ? deps.getBirdDefinition()
      : initialBirdDefinition;
    return normalizeAgentSpriteDefinition({
      ...DEFAULT_BIRD_SPRITE_DEFINITION,
      ...(source || {}),
    });
  }

  function getHawkDefinition() {
    const source = typeof deps.getHawkDefinition === "function"
      ? deps.getHawkDefinition()
      : initialHawkDefinition;
    return normalizeAgentSpriteDefinition({
      ...DEFAULT_HAWK_SPRITE_DEFINITION,
      ...(source || {}),
    });
  }

  function writeAgentPos(index) {
    if (typeof deps.writeInterpolatedSwarmAgentPos === "function") {
      return deps.writeInterpolatedSwarmAgentPos(index, agentScratch);
    }
    const state = deps.swarmState || {};
    agentScratch.x = finiteOr(state.x && state.x[index], 0);
    agentScratch.y = finiteOr(state.y && state.y[index], 0);
    agentScratch.z = finiteOr(state.z && state.z[index], 0);
    return agentScratch;
  }

  function writeHawkPos(index) {
    if (typeof deps.writeInterpolatedSwarmHawkPos === "function") {
      return deps.writeInterpolatedSwarmHawkPos(index, hawkScratch);
    }
    const hawk = deps.swarmState && deps.swarmState.hawks ? deps.swarmState.hawks[index] : null;
    hawkScratch.x = finiteOr(hawk && hawk.x, 0);
    hawkScratch.y = finiteOr(hawk && hawk.y, 0);
    hawkScratch.z = finiteOr(hawk && hawk.z, 0);
    return hawkScratch;
  }

  function getSwarmAgentSpriteRenderSnapshot(options = {}) {
    const state = deps.swarmState || {};
    const count = Math.max(0, Math.floor(finiteOr(state.count, 0)));
    const includeBirds = options.includeBirds !== false;
    const includeHawks = options.includeHawks !== false;
    const agents = [];
    const lutRegistry = getLutRegistry();
    const birdDefinition = getBirdDefinition();
    const hawkDefinition = getHawkDefinition();
    const birdPaletteRows = resolvePaletteRows(birdDefinition, lutRegistry);
    const hawkPaletteRows = resolvePaletteRows(hawkDefinition, lutRegistry);

    if (includeBirds) {
      const birdSelectionRows = filterPaletteRowsByTags(birdPaletteRows, options.paletteTags);
      for (let i = 0; i < count; i += 1) {
        const agentId = getAgentId(state, i);
        const pos = writeAgentPos(i);
        agents.push(buildAgentSpriteRenderItem({
          id: `bird_${agentId}`,
          owner: "swarm",
          x: pos.x,
          y: pos.y,
          z: pos.z,
          vx: state.vx && state.vx[i],
          vy: state.vy && state.vy[i],
        }, birdDefinition, {
          renderTimeSec: options.renderTimeSec,
          paletteRow: choosePaletteRow(birdSelectionRows, `bird:${agentId}`),
        }));
      }
    }

    if (includeHawks && Array.isArray(state.hawks)) {
      const hawkSelectionRows = filterPaletteRowsByTags(hawkPaletteRows, options.paletteTags);
      for (let i = 0; i < state.hawks.length; i += 1) {
        const hawk = state.hawks[i];
        const pos = writeHawkPos(i);
        agents.push(buildAgentSpriteRenderItem({
          id: `hawk_${i + 1}`,
          owner: "swarm",
          x: pos.x,
          y: pos.y,
          z: pos.z,
          vx: hawk && hawk.vx,
          vy: hawk && hawk.vy,
        }, hawkDefinition, {
          renderTimeSec: options.renderTimeSec,
          paletteRow: choosePaletteRow(hawkSelectionRows, `hawk:${i + 1}`),
        }));
      }
    }

    const gridColumns = 16;
    return {
      version: Math.max(0, Math.round(finiteOr(state.stepCount, 0))),
      atlas: {
        filter: "nearest",
        slotWidth: Math.max(birdDefinition.slotWidth, hawkDefinition.slotWidth),
        slotHeight: Math.max(birdDefinition.slotHeight, hawkDefinition.slotHeight),
        gridColumns,
        gridRows: getRequiredAtlasRows(agents, gridColumns),
      },
      lutAtlas: lutRegistry
        ? {
          width: lutRegistry.width,
          height: lutRegistry.height,
          data: lutRegistry.data,
        }
        : null,
      agents,
    };
  }

  return {
    getSwarmAgentSpriteRenderSnapshot,
  };
}
