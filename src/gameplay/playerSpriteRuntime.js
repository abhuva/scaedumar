import { buildAgentSpriteRenderItem, normalizeAgentSpriteDefinition, resolveDirectionIndex } from "./agentSpriteModel.js";

export const DEFAULT_PLAYER_SPRITE_DEFINITION = Object.freeze({
  id: "player",
  layer: "ground",
});

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function createPlayerSpriteRuntime(deps = {}) {
  const definition = normalizeAgentSpriteDefinition({
    ...DEFAULT_PLAYER_SPRITE_DEFINITION,
    ...(deps.definition || {}),
  });
  let directionIndex = 0;
  let version = 0;

  function touch() {
    version += 1;
  }

  function recordMovementStep(step = {}) {
    const fromX = finiteOr(step.fromX, NaN);
    const fromY = finiteOr(step.fromY, NaN);
    const toX = finiteOr(step.toX, NaN);
    const toY = finiteOr(step.toY, NaN);
    if (!Number.isFinite(fromX) || !Number.isFinite(fromY) || !Number.isFinite(toX) || !Number.isFinite(toY)) {
      return false;
    }
    directionIndex = resolveDirectionIndex({
      vx: toX - fromX,
      vy: toY - fromY,
      directionCount: definition.directionCount,
      fallbackIndex: directionIndex,
    });
    touch();
    return true;
  }

  function setDirectionIndex(nextDirectionIndex) {
    const next = Math.max(0, Math.min(definition.directionCount - 1, Math.round(finiteOr(nextDirectionIndex, directionIndex))));
    if (next === directionIndex) return false;
    directionIndex = next;
    touch();
    return true;
  }

  function getPlayerSpriteRenderSnapshot() {
    const player = deps.playerState || {};
    const item = buildAgentSpriteRenderItem({
      id: "player",
      owner: "player",
      x: finiteOr(player.pixelX, 0) + 0.5,
      y: finiteOr(player.pixelY, 0) + 0.5,
      z: 0,
      directionIndex,
      tint: "",
    }, definition);
    return {
      version,
      atlas: {
        filter: "nearest",
        slotWidth: definition.slotWidth,
        slotHeight: definition.slotHeight,
        gridColumns: Math.max(1, definition.directionCount),
        gridRows: 1,
      },
      agents: [item],
    };
  }

  return {
    getDirectionIndex: () => directionIndex,
    setDirectionIndex,
    recordMovementStep,
    getPlayerSpriteRenderSnapshot,
  };
}
