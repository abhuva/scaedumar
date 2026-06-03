import { buildGridDijkstraField } from "../core/gridDijkstra.js";
import { extractGridPath } from "../core/gridPathExtraction.js";

export function createPathfindingPreviewRuntime(deps) {
  function getTravelPlanningRuntime() {
    if (!deps.travelPlanningRuntime) {
      throw new Error("pathfindingPreviewRuntime requires travelPlanningRuntime");
    }
    return deps.travelPlanningRuntime;
  }

  function getHoverPixel() {
    return getTravelPlanningRuntime().getHoverPixel();
  }

  function getPathPixels() {
    return getTravelPlanningRuntime().getPathPixels();
  }

  function hasHoverPath() {
    return getTravelPlanningRuntime().hasHoverPath();
  }

  function isHoverPixel(pixel) {
    return getTravelPlanningRuntime().isHoverPixel(pixel);
  }

  function clearPreview(reason = "path-preview-cleared") {
    getTravelPlanningRuntime().setHoverPath(null, [], reason);
  }

  function setHoverPath(pixel, pathPixels, reason = "path-preview") {
    getTravelPlanningRuntime().setHoverPath(pixel, pathPixels, reason);
  }

  function isInsidePathfindingRange(pixelX, pixelY) {
    let radius = Number.POSITIVE_INFINITY;
    if (typeof deps.getPathfindingRangeRadius === "function") {
      const parsed = Number(deps.getPathfindingRangeRadius());
      radius = Number.isFinite(parsed) ? Math.max(0, parsed) : Number.POSITIVE_INFINITY;
    }
    if (!Number.isFinite(radius)) return true;
    const dx = Number(pixelX) - Number(deps.playerState.pixelX);
    const dy = Number(pixelY) - Number(deps.playerState.pixelY);
    return (dx * dx + dy * dy) <= radius * radius;
  }

  function buildBlockedMask(bounds, width, height) {
    if (typeof deps.getMovementBlockedCellsInBounds !== "function") return null;
    const cells = deps.getMovementBlockedCellsInBounds(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    if (!Array.isArray(cells) || cells.length === 0) return null;
    const mask = new Uint8Array(width * height);
    for (const cell of cells) {
      const x = Math.floor(Number(cell && cell.x)) - bounds.minX;
      const y = Math.floor(Number(cell && cell.y)) - bounds.minY;
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= width || y >= height) continue;
      mask[y * width + x] = 1;
    }
    return mask;
  }

  function isBlockedLocal(blockedMask, width, height, x, y) {
    if (!blockedMask) return false;
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    return blockedMask[y * width + x] !== 0;
  }

  function canEnterCell(x, y, fromX, fromY, bounds, width, height, blockedMask, moveCostContext) {
    if (!isInsidePathfindingRange(bounds.minX + x, bounds.minY + y)) return false;
    if (isBlockedLocal(blockedMask, width, height, x, y)) return false;

    const dx = x - fromX;
    const dy = y - fromY;
    if (dx === 0 || dy === 0) return true;

    const pathfinding = typeof deps.getPathfindingStateSnapshot === "function"
      ? deps.getPathfindingStateSnapshot()
      : {};
    if (pathfinding.allowStructureDiagonalCornerCutting !== true) {
      if (
        isBlockedLocal(blockedMask, width, height, fromX + dx, fromY)
        || isBlockedLocal(blockedMask, width, height, fromX, fromY + dy)
      ) {
        return false;
      }
    }

    if (pathfinding.allowTerrainDiagonalCornerCutting === false && typeof deps.computeTerrainStepCost === "function") {
      const worldFromX = bounds.minX + fromX;
      const worldFromY = bounds.minY + fromY;
      const sideACost = deps.computeTerrainStepCost(
        worldFromX,
        worldFromY,
        bounds.minX + fromX + dx,
        worldFromY,
        moveCostContext,
      );
      const sideBCost = deps.computeTerrainStepCost(
        worldFromX,
        worldFromY,
        worldFromX,
        bounds.minY + fromY + dy,
        moveCostContext,
      );
      if (!Number.isFinite(sideACost) || !Number.isFinite(sideBCost)) return false;
    }

    return true;
  }

  function extractPathTo(pixelX, pixelY) {
    const movementField = deps.getMovementField();
    if (!movementField) return [];
    if (pixelX < movementField.minX || pixelX > movementField.maxX || pixelY < movementField.minY || pixelY > movementField.maxY) return [];
    if (!isInsidePathfindingRange(pixelX, pixelY)) return [];
    const cells = extractGridPath({
      field: movementField,
      sourceX: deps.playerState.pixelX - movementField.minX,
      sourceY: deps.playerState.pixelY - movementField.minY,
      targetX: pixelX - movementField.minX,
      targetY: pixelY - movementField.minY,
    });
    return cells.map((cell) => ({
      x: movementField.minX + cell.x,
      y: movementField.minY + cell.y,
    }));
  }

  function refreshPathPreview() {
    const hover = getHoverPixel();
    if (deps.getInteractionModeSnapshot() !== "pathfinding" || !hover) {
      setHoverPath(null, [], "path-preview-empty");
      return;
    }
    setHoverPath(
      hover,
      extractPathTo(hover.x, hover.y),
      "path-preview-refreshed",
    );
  }

  function rebuildMovementField() {
    const bounds = deps.movementWindowBounds();
    const width = bounds.maxX - bounds.minX + 1;
    const height = bounds.maxY - bounds.minY + 1;
    if (width <= 0 || height <= 0) {
      deps.setMovementField(null);
      setHoverPath(null, [], "movement-field-empty");
      return;
    }

    const moveCostContext = typeof deps.getMoveCostContext === "function" ? deps.getMoveCostContext() : null;
    const blockedMask = buildBlockedMask(bounds, width, height);
    const sourceLocalX = deps.playerState.pixelX - bounds.minX;
    const sourceLocalY = deps.playerState.pixelY - bounds.minY;
    const sourceIndex = sourceLocalY * width + sourceLocalX;
    if (blockedMask && sourceIndex >= 0 && sourceIndex < blockedMask.length) {
      blockedMask[sourceIndex] = 0;
    }
    const field = buildGridDijkstraField({
      width,
      height,
      sourceX: sourceLocalX,
      sourceY: sourceLocalY,
      isAllowedCell: (x, y, fromX, fromY) =>
        canEnterCell(x, y, fromX, fromY, bounds, width, height, blockedMask, moveCostContext),
      getStepCost: (fromX, fromY, toX, toY) =>
        deps.computeMoveStepCost(
          bounds.minX + fromX,
          bounds.minY + fromY,
          bounds.minX + toX,
          bounds.minY + toY,
          moveCostContext,
        ),
    });
    if (!field) {
      deps.setMovementField(null);
      setHoverPath(null, [], "movement-field-empty");
      return;
    }

    deps.setMovementField({
      ...bounds,
      width,
      height,
      dist: field.dist,
      parent: field.parent,
    });
    refreshPathPreview();
  }

  function updatePathPreviewFromPointer(clientX, clientY) {
    if (deps.getInteractionModeSnapshot() !== "pathfinding") {
      clearPreview("pointer-not-pathfinding");
      return;
    }
    const ndc = deps.clientToNdc(clientX, clientY);
    const world = deps.worldFromNdc(ndc);
    const uv = deps.worldToUv(world);
    if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
      clearPreview("pointer-outside-map");
      return;
    }
    const pixel = deps.uvToMapPixelIndex(uv);
    if (isHoverPixel(pixel)) {
      return;
    }
    getTravelPlanningRuntime().setHoverPath(pixel, getPathPixels(), "path-hover", { emit: false });
    refreshPathPreview();
  }

  function getCurrentPathMetrics() {
    const movementField = deps.getMovementField();
    if (!movementField || !hasHoverPath()) return null;
    const hover = getHoverPixel();
    const pathPixels = getPathPixels();
    if (!hover || pathPixels.length === 0) return null;
    const targetX = hover.x;
    const targetY = hover.y;
    if (targetX < movementField.minX || targetX > movementField.maxX || targetY < movementField.minY || targetY > movementField.maxY) return null;
    const nodeCount = pathPixels.length;
    if (nodeCount <= 0) return null;
    const moveCostContext = typeof deps.getMoveCostContext === "function" ? deps.getMoveCostContext() : null;
    let totalCost = 0;
    for (let i = 1; i < pathPixels.length; i += 1) {
      const from = pathPixels[i - 1];
      const to = pathPixels[i];
      const stepCost = deps.computeMoveStepCost(from.x, from.y, to.x, to.y, moveCostContext);
      if (!Number.isFinite(stepCost) || stepCost <= 0) return null;
      totalCost += stepCost;
    }
    const steps = Math.max(0, nodeCount - 1);
    return {
      steps,
      totalCost,
      avgPerStep: steps > 0 ? totalCost / steps : 0,
    };
  }

  return {
    rebuildMovementField,
    extractPathTo,
    refreshPathPreview,
    updatePathPreviewFromPointer,
    getCurrentPathMetrics,
  };
}
