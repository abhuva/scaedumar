export function createPathfindingCostModel(deps) {
  function getGrayAt(imageData, x, y, sourceWidth = deps.getMapSize().width, sourceHeight = deps.getMapSize().height) {
    if (!imageData || !imageData.data) return 0;
    const w = imageData.width || 1;
    const h = imageData.height || 1;
    const srcW = Math.max(1, Number(sourceWidth) || 1);
    const srcH = Math.max(1, Number(sourceHeight) || 1);
    const nx = (Number(x) + 0.5) / srcW;
    const ny = (Number(y) + 0.5) / srcH;
    const sx = deps.clamp(Math.round(nx * w - 0.5), 0, Math.max(0, w - 1));
    const sy = deps.clamp(Math.round(ny * h - 0.5), 0, Math.max(0, h - 1));
    const idx = (sy * w + sx) * 4;
    return imageData.data[idx] / 255;
  }

  function movementWindowBounds() {
    const mapSize = deps.getMapSize();
    const size = deps.getPathfindingStateSnapshot().range;
    const halfA = Math.floor((size - 1) / 2);
    const halfB = size - halfA - 1;
    return {
      minX: deps.clamp(deps.playerState.pixelX - halfA, 0, Math.max(0, mapSize.width - 1)),
      maxX: deps.clamp(deps.playerState.pixelX + halfB, 0, Math.max(0, mapSize.width - 1)),
      minY: deps.clamp(deps.playerState.pixelY - halfA, 0, Math.max(0, mapSize.height - 1)),
      maxY: deps.clamp(deps.playerState.pixelY + halfB, 0, Math.max(0, mapSize.height - 1)),
    };
  }

  function createMoveCostContext() {
    return {
      pathfindingSnapshot: deps.getPathfindingStateSnapshot(),
      slopeImage: deps.getSlopeImageData(),
      heightImage: deps.getHeightImageData(),
      waterImage: deps.getWaterImageData(),
    };
  }

  function computeMoveStepCost(fromX, fromY, toX, toY, moveCostContext = null) {
    const context = moveCostContext || createMoveCostContext();
    const pathfinding = context.pathfindingSnapshot;
    const isDiag = fromX !== toX && fromY !== toY;
    const dist = isDiag ? Math.SQRT2 : 1;
    const slope = getGrayAt(context.slopeImage, toX, toY);
    const sourceHeight = getGrayAt(context.heightImage, fromX, fromY);
    const destHeight = getGrayAt(context.heightImage, toX, toY);
    const heightDelta = destHeight - sourceHeight;
    const uphill = Math.max(heightDelta, 0);
    const water = getGrayAt(context.waterImage, toX, toY);
    const slopeDeg = slope * 90;
    const slopeCutoffDeg = pathfinding.slopeCutoff;
    if (slopeDeg > slopeCutoffDeg) {
      return Number.POSITIVE_INFINITY;
    }
    const slopeWeight = pathfinding.weightSlope;
    const heightWeight = pathfinding.weightHeight;
    const waterWeight = pathfinding.weightWater;
    const baseCost = pathfinding.baseCost;
    const weightedCost = slopeWeight * slope + heightWeight * uphill + waterWeight * water;
    return dist * (baseCost + weightedCost);
  }

  return {
    getGrayAt,
    movementWindowBounds,
    createMoveCostContext,
    computeMoveStepCost,
  };
}
