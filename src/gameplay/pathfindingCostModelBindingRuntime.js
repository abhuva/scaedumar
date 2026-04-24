import { createPathfindingCostModel } from "./pathfindingCostModel.js";

export function createPathfindingCostModelBindingRuntime(deps) {
  const pathfindingCostModel = createPathfindingCostModel({
    clamp: deps.clamp,
    playerState: deps.playerState,
    getMapSize: deps.getMapSize,
    getPathfindingStateSnapshot: deps.getPathfindingStateSnapshot,
    getSlopeImageData: deps.getSlopeImageData,
    getHeightImageData: deps.getHeightImageData,
    getWaterImageData: deps.getWaterImageData,
  });
  return {
    getGrayAt: (imageData, x, y, sourceWidth, sourceHeight) =>
      pathfindingCostModel.getGrayAt(imageData, x, y, sourceWidth, sourceHeight),
    movementWindowBounds: () => pathfindingCostModel.movementWindowBounds(),
    computeMoveStepCost: (fromX, fromY, toX, toY) =>
      pathfindingCostModel.computeMoveStepCost(fromX, fromY, toX, toY),
  };
}
