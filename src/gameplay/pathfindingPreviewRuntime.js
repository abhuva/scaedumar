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
  function extractPathTo(pixelX, pixelY) {
    const movementField = deps.getMovementField();
    if (!movementField) return [];
    if (pixelX < movementField.minX || pixelX > movementField.maxX || pixelY < movementField.minY || pixelY > movementField.maxY) return [];
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
    if (deps.getInteractionModeSnapshot() !== "pathfinding" || !deps.movePreviewState.hoverPixel) {
      deps.movePreviewState.pathPixels = [];
      deps.requestOverlayDraw();
      return;
    }
    deps.movePreviewState.pathPixels = extractPathTo(deps.movePreviewState.hoverPixel.x, deps.movePreviewState.hoverPixel.y);
    deps.requestOverlayDraw();
  }

  function rebuildMovementField() {
    const bounds = deps.movementWindowBounds();
    const width = bounds.maxX - bounds.minX + 1;
    const height = bounds.maxY - bounds.minY + 1;
    if (width <= 0 || height <= 0) {
      deps.setMovementField(null);
      deps.movePreviewState.pathPixels = [];
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
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      return;
    }
    const ndc = deps.clientToNdc(clientX, clientY);
    const world = deps.worldFromNdc(ndc);
    const uv = deps.worldToUv(world);
    if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
      deps.movePreviewState.hoverPixel = null;
      deps.movePreviewState.pathPixels = [];
      deps.requestOverlayDraw();
      return;
    }
    const pixel = deps.uvToMapPixelIndex(uv);
    if (
      deps.movePreviewState.hoverPixel
      && deps.movePreviewState.hoverPixel.x === pixel.x
      && deps.movePreviewState.hoverPixel.y === pixel.y
    ) {
      return;
    }
    deps.movePreviewState.hoverPixel = { x: pixel.x, y: pixel.y };
    refreshPathPreview();
  }

  function getCurrentPathMetrics() {
    const movementField = deps.getMovementField();
    if (!movementField || !deps.movePreviewState.hoverPixel || deps.movePreviewState.pathPixels.length === 0) return null;
    const targetX = deps.movePreviewState.hoverPixel.x;
    const targetY = deps.movePreviewState.hoverPixel.y;
    if (targetX < movementField.minX || targetX > movementField.maxX || targetY < movementField.minY || targetY > movementField.maxY) return null;
    const idx = (targetY - movementField.minY) * movementField.width + (targetX - movementField.minX);
    const totalCost = movementField.dist[idx];
    if (!Number.isFinite(totalCost)) return null;
    const nodeCount = deps.movePreviewState.pathPixels.length;
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
