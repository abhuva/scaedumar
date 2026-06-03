import { createPathfindingCostModel } from "./pathfindingCostModel.js";
import { createPathfindingPreviewRuntime } from "./pathfindingPreviewRuntime.js";

export function createPathfindingRuntimeBinding(deps) {
  let movementField = null;

  const pathfindingCostModel = createPathfindingCostModel({
    clamp: deps.clamp,
    playerState: deps.playerState,
    getMapSize: deps.getMapSize,
    getPathfindingStateSnapshot: deps.getPathfindingStateSnapshot,
    getSlopeImageData: deps.getSlopeImageData,
    getHeightImageData: deps.getHeightImageData,
    getWaterImageData: deps.getWaterImageData,
    isStructureMovementBlocked: deps.isStructureMovementBlocked,
  });

  const pathfindingPreviewRuntime = createPathfindingPreviewRuntime({
    movementWindowBounds: () => pathfindingCostModel.movementWindowBounds(),
    getPathfindingRangeRadius: () => pathfindingCostModel.pathfindingRangeRadius(),
    computeTerrainStepCost: (fromX, fromY, toX, toY, moveCostContext = null) =>
      pathfindingCostModel.computeTerrainStepCost(fromX, fromY, toX, toY, moveCostContext),
    computeMoveStepCost: (fromX, fromY, toX, toY, moveCostContext = null) =>
      pathfindingCostModel.computeMoveStepCost(fromX, fromY, toX, toY, moveCostContext),
    playerState: deps.playerState,
    getMovementField: () => movementField,
    setMovementField: (value) => {
      movementField = value;
    },
    getMovementBlockedCellsInBounds: deps.getMovementBlockedCellsInBounds,
    travelPlanningRuntime: deps.travelPlanningRuntime,
    getPathfindingStateSnapshot: deps.getPathfindingStateSnapshot,
    getInteractionModeSnapshot: deps.getInteractionModeSnapshot,
    requestOverlayDraw: deps.requestOverlayDraw,
    clientToNdc: deps.clientToNdc,
    worldFromNdc: deps.worldFromNdc,
    worldToUv: deps.worldToUv,
    uvToMapPixelIndex: deps.uvToMapPixelIndex,
  });

  return {
    getGrayAt: (imageData, x, y, sourceWidth, sourceHeight) =>
      pathfindingCostModel.getGrayAt(imageData, x, y, sourceWidth, sourceHeight),
    movementWindowBounds: () => pathfindingCostModel.movementWindowBounds(),
    pathfindingRangeRadius: () => pathfindingCostModel.pathfindingRangeRadius(),
    createMoveCostContext: () => pathfindingCostModel.createMoveCostContext(),
    computeTerrainStepCost: (fromX, fromY, toX, toY, moveCostContext = null) =>
      pathfindingCostModel.computeTerrainStepCost(fromX, fromY, toX, toY, moveCostContext),
    computeMoveStepCost: (fromX, fromY, toX, toY, moveCostContext = null) =>
      pathfindingCostModel.computeMoveStepCost(fromX, fromY, toX, toY, moveCostContext),
    rebuildMovementField: () => pathfindingPreviewRuntime.rebuildMovementField(),
    extractPathTo: (pixelX, pixelY) => pathfindingPreviewRuntime.extractPathTo(pixelX, pixelY),
    refreshPathPreview: () => pathfindingPreviewRuntime.refreshPathPreview(),
    updatePathPreviewFromPointer: (clientX, clientY) =>
      pathfindingPreviewRuntime.updatePathPreviewFromPointer(clientX, clientY),
    getCurrentPathMetrics: () => pathfindingPreviewRuntime.getCurrentPathMetrics(),
  };
}
