import assert from "node:assert/strict";
import test from "node:test";
import { createPathfindingPreviewRuntime } from "../src/gameplay/pathfindingPreviewRuntime.js";

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
