import { buildAgentSpriteRenderItem, normalizeAgentSpriteDefinition } from "./agentSpriteModel.js";

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
  const birdDefinition = normalizeAgentSpriteDefinition({
    ...DEFAULT_BIRD_SPRITE_DEFINITION,
    ...(deps.birdDefinition || {}),
  });
  const hawkDefinition = normalizeAgentSpriteDefinition({
    ...DEFAULT_HAWK_SPRITE_DEFINITION,
    ...(deps.hawkDefinition || {}),
  });
  const agentScratch = { x: 0, y: 0, z: 0 };
  const hawkScratch = { x: 0, y: 0, z: 0 };

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

    if (includeBirds) {
      for (let i = 0; i < count; i += 1) {
        const pos = writeAgentPos(i);
        agents.push(buildAgentSpriteRenderItem({
          id: `bird_${getAgentId(state, i)}`,
          owner: "swarm",
          x: pos.x,
          y: pos.y,
          z: pos.z,
          vx: state.vx && state.vx[i],
          vy: state.vy && state.vy[i],
        }, birdDefinition, {
          renderTimeSec: options.renderTimeSec,
        }));
      }
    }

    if (includeHawks && Array.isArray(state.hawks)) {
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
      agents,
    };
  }

  return {
    getSwarmAgentSpriteRenderSnapshot,
  };
}
