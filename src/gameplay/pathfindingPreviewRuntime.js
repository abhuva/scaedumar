class MinHeap {
  constructor() {
    this.items = [];
  }

  push(node) {
    this.items.push(node);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.items[p].dist <= node.dist) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = node;
  }

  pop() {
    if (this.items.length === 0) return null;
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length === 0 || !last) return root;
    let i = 0;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      if (l >= this.items.length) break;
      let c = l;
      if (r < this.items.length && this.items[r].dist < this.items[l].dist) c = r;
      if (this.items[c].dist >= last.dist) break;
      this.items[i] = this.items[c];
      i = c;
    }
    this.items[i] = last;
    return root;
  }
}

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
    const radius = typeof deps.getPathfindingRangeRadius === "function"
      ? Math.max(0, Number(deps.getPathfindingRangeRadius()) || 0)
      : Number.POSITIVE_INFINITY;
    if (!Number.isFinite(radius)) return true;
    const dx = Number(pixelX) - Number(deps.playerState.pixelX);
    const dy = Number(pixelY) - Number(deps.playerState.pixelY);
    return (dx * dx + dy * dy) <= radius * radius;
  }

  function extractPathTo(pixelX, pixelY) {
    const movementField = deps.getMovementField();
    if (!movementField) return [];
    if (pixelX < movementField.minX || pixelX > movementField.maxX || pixelY < movementField.minY || pixelY > movementField.maxY) return [];
    if (!isInsidePathfindingRange(pixelX, pixelY)) return [];
    const indexOf = (x, y) => (y - movementField.minY) * movementField.width + (x - movementField.minX);
    const indexToPixel = (idx) => ({
      x: movementField.minX + (idx % movementField.width),
      y: movementField.minY + Math.floor(idx / movementField.width),
    });
    const targetIdx = indexOf(pixelX, pixelY);
    if (!Number.isFinite(movementField.dist[targetIdx])) return [];
    const path = [];
    let cursor = targetIdx;
    const maxSteps = movementField.width * movementField.height;
    for (let i = 0; i < maxSteps && cursor >= 0; i++) {
      const p = indexToPixel(cursor);
      path.push({ x: p.x, y: p.y });
      if (p.x === deps.playerState.pixelX && p.y === deps.playerState.pixelY) break;
      cursor = movementField.parent[cursor];
    }
    if (path.length === 0) return [];
    path.reverse();
    return path;
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

    const len = width * height;
    const dist = new Float64Array(len);
    const parent = new Int32Array(len);
    dist.fill(Number.POSITIVE_INFINITY);
    parent.fill(-1);

    const indexOf = (x, y) => (y - bounds.minY) * width + (x - bounds.minX);
    const startIdx = indexOf(deps.playerState.pixelX, deps.playerState.pixelY);
    dist[startIdx] = 0;

    const heap = new MinHeap();
    heap.push({ x: deps.playerState.pixelX, y: deps.playerState.pixelY, dist: 0 });
    const moveCostContext = typeof deps.getMoveCostContext === "function" ? deps.getMoveCostContext() : null;
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];

    while (true) {
      const current = heap.pop();
      if (!current) break;
      const idx = indexOf(current.x, current.y);
      if (current.dist > dist[idx]) continue;
      for (const dir of dirs) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        if (nx < bounds.minX || nx > bounds.maxX || ny < bounds.minY || ny > bounds.maxY) continue;
        if (!isInsidePathfindingRange(nx, ny)) continue;
        const nIdx = indexOf(nx, ny);
        const stepCost = deps.computeMoveStepCost(current.x, current.y, nx, ny, moveCostContext);
        if (!Number.isFinite(stepCost)) continue;
        const nextDist = dist[idx] + stepCost;
        if (nextDist < dist[nIdx]) {
          dist[nIdx] = nextDist;
          parent[nIdx] = idx;
          heap.push({ x: nx, y: ny, dist: nextDist });
        }
      }
    }

    deps.setMovementField({
      ...bounds,
      width,
      height,
      dist,
      parent,
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
    const idx = (targetY - movementField.minY) * movementField.width + (targetX - movementField.minX);
    const totalCost = movementField.dist[idx];
    if (!Number.isFinite(totalCost)) return null;
    const nodeCount = pathPixels.length;
    if (nodeCount <= 0) return null;
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
