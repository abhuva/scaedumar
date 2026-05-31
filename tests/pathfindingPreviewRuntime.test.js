import assert from "node:assert/strict";
import test from "node:test";
import { createPathfindingPreviewRuntime } from "../src/gameplay/pathfindingPreviewRuntime.js";

function createTravelPlanningRuntime() {
  let hoverPixel = null;
  let pathPixels = [];
  return {
    getHoverPixel: () => hoverPixel,
    getPathPixels: () => pathPixels,
    hasHoverPath: () => pathPixels.length > 0,
    isHoverPixel: (pixel) => Boolean(hoverPixel && pixel && hoverPixel.x === pixel.x && hoverPixel.y === pixel.y),
    setHoverPath: (pixel, pixels) => {
      hoverPixel = pixel;
      pathPixels = Array.isArray(pixels) ? pixels : [];
    },
  };
}

test("pathfinding preview requires travelPlanningRuntime", () => {
  const runtime = createPathfindingPreviewRuntime({
    movementWindowBounds: () => ({ minX: 0, minY: 0, maxX: 0, maxY: 0 }),
    getPathfindingRangeRadius: () => 10,
    computeMoveStepCost: () => 1,
    playerState: { pixelX: 0, pixelY: 0 },
    getMovementField: () => null,
    setMovementField: () => {},
    getInteractionModeSnapshot: () => "none",
    requestOverlayDraw: () => {},
    clientToNdc: () => ({ x: 0, y: 0 }),
    worldFromNdc: () => ({ x: 0, y: 0 }),
    worldToUv: () => ({ x: 0, y: 0 }),
    uvToMapPixelIndex: () => ({ x: 0, y: 0 }),
  });

  assert.throws(() => runtime.refreshPathPreview(), /travelPlanningRuntime/);
});

test("pathfinding preview writes structure obstacles into Dijkstra field", () => {
  let movementField = null;
  const runtime = createPathfindingPreviewRuntime({
    movementWindowBounds: () => ({ minX: 0, minY: 0, maxX: 4, maxY: 4 }),
    getPathfindingRangeRadius: () => 10,
    getMoveCostContext: () => null,
    computeMoveStepCost: () => 1,
    getMovementBlockedCellsInBounds: () => [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
    ],
    playerState: { pixelX: 0, pixelY: 2 },
    getMovementField: () => movementField,
    setMovementField: (field) => {
      movementField = field;
    },
    travelPlanningRuntime: createTravelPlanningRuntime(),
    getInteractionModeSnapshot: () => "pathfinding",
    requestOverlayDraw: () => {},
    clientToNdc: () => ({ x: 0, y: 0 }),
    worldFromNdc: () => ({ x: 0, y: 0 }),
    worldToUv: () => ({ x: 0, y: 0 }),
    uvToMapPixelIndex: () => ({ x: 0, y: 0 }),
  });

  runtime.rebuildMovementField();

  assert.equal(movementField.dist[2 * movementField.width + 1], Number.POSITIVE_INFINITY);
  assert.equal(movementField.dist[2 * movementField.width + 2], Number.POSITIVE_INFINITY);
});

test("pathfinding preview can block diagonal corner cutting only for structures", () => {
  let movementField = null;
  const runtime = createPathfindingPreviewRuntime({
    movementWindowBounds: () => ({ minX: 0, minY: 0, maxX: 2, maxY: 2 }),
    getPathfindingRangeRadius: () => 10,
    getPathfindingStateSnapshot: () => ({
      allowTerrainDiagonalCornerCutting: true,
      allowStructureDiagonalCornerCutting: false,
    }),
    getMoveCostContext: () => null,
    computeMoveStepCost: (fromX, fromY, toX, toY) => (fromX !== toX && fromY !== toY ? Math.SQRT2 : 1),
    computeTerrainStepCost: (fromX, fromY, toX, toY) => (fromX !== toX && fromY !== toY ? Math.SQRT2 : 1),
    getMovementBlockedCellsInBounds: () => [{ x: 1, y: 0 }, { x: 0, y: 1 }],
    playerState: { pixelX: 0, pixelY: 0 },
    getMovementField: () => movementField,
    setMovementField: (field) => {
      movementField = field;
    },
    travelPlanningRuntime: createTravelPlanningRuntime(),
    getInteractionModeSnapshot: () => "pathfinding",
    requestOverlayDraw: () => {},
    clientToNdc: () => ({ x: 0, y: 0 }),
    worldFromNdc: () => ({ x: 0, y: 0 }),
    worldToUv: () => ({ x: 0, y: 0 }),
    uvToMapPixelIndex: () => ({ x: 0, y: 0 }),
  });

  runtime.rebuildMovementField();

  assert.equal(movementField.dist[1 * movementField.width + 1], Number.POSITIVE_INFINITY);
});

test("pathfinding preview can allow diagonal corner cutting for structures", () => {
  let movementField = null;
  const runtime = createPathfindingPreviewRuntime({
    movementWindowBounds: () => ({ minX: 0, minY: 0, maxX: 2, maxY: 2 }),
    getPathfindingRangeRadius: () => 10,
    getPathfindingStateSnapshot: () => ({
      allowTerrainDiagonalCornerCutting: true,
      allowStructureDiagonalCornerCutting: true,
    }),
    getMoveCostContext: () => null,
    computeMoveStepCost: (fromX, fromY, toX, toY) => (fromX !== toX && fromY !== toY ? Math.SQRT2 : 1),
    computeTerrainStepCost: (fromX, fromY, toX, toY) => (fromX !== toX && fromY !== toY ? Math.SQRT2 : 1),
    getMovementBlockedCellsInBounds: () => [{ x: 1, y: 0 }, { x: 0, y: 1 }],
    playerState: { pixelX: 0, pixelY: 0 },
    getMovementField: () => movementField,
    setMovementField: (field) => {
      movementField = field;
    },
    travelPlanningRuntime: createTravelPlanningRuntime(),
    getInteractionModeSnapshot: () => "pathfinding",
    requestOverlayDraw: () => {},
    clientToNdc: () => ({ x: 0, y: 0 }),
    worldFromNdc: () => ({ x: 0, y: 0 }),
    worldToUv: () => ({ x: 0, y: 0 }),
    uvToMapPixelIndex: () => ({ x: 0, y: 0 }),
  });

  runtime.rebuildMovementField();

  assert.equal(movementField.dist[1 * movementField.width + 1], Math.SQRT2);
});

test("pathfinding preview can block diagonal corner cutting only for terrain", () => {
  let movementField = null;
  const runtime = createPathfindingPreviewRuntime({
    movementWindowBounds: () => ({ minX: 0, minY: 0, maxX: 2, maxY: 2 }),
    getPathfindingRangeRadius: () => 10,
    getPathfindingStateSnapshot: () => ({
      allowTerrainDiagonalCornerCutting: false,
      allowStructureDiagonalCornerCutting: true,
    }),
    getMoveCostContext: () => null,
    computeMoveStepCost: (fromX, fromY, toX, toY) => (
      (toX === 1 && toY === 0) || (toX === 0 && toY === 1)
        ? Number.POSITIVE_INFINITY
        : (fromX !== toX && fromY !== toY ? Math.SQRT2 : 1)
    ),
    computeTerrainStepCost: (fromX, fromY, toX, toY) => (
      (toX === 1 && toY === 0) || (toX === 0 && toY === 1)
        ? Number.POSITIVE_INFINITY
        : (fromX !== toX && fromY !== toY ? Math.SQRT2 : 1)
    ),
    getMovementBlockedCellsInBounds: () => [],
    playerState: { pixelX: 0, pixelY: 0 },
    getMovementField: () => movementField,
    setMovementField: (field) => {
      movementField = field;
    },
    travelPlanningRuntime: createTravelPlanningRuntime(),
    getInteractionModeSnapshot: () => "pathfinding",
    requestOverlayDraw: () => {},
    clientToNdc: () => ({ x: 0, y: 0 }),
    worldFromNdc: () => ({ x: 0, y: 0 }),
    worldToUv: () => ({ x: 0, y: 0 }),
    uvToMapPixelIndex: () => ({ x: 0, y: 0 }),
  });

  runtime.rebuildMovementField();

  assert.equal(movementField.dist[1 * movementField.width + 1], Number.POSITIVE_INFINITY);
});
