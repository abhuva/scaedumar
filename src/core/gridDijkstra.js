import { MinHeap } from "./minHeap.js";

export function buildGridDijkstraField(input = {}) {
  const width = Math.max(0, Math.round(Number(input.width) || 0));
  const height = Math.max(0, Math.round(Number(input.height) || 0));
  const sourceX = Math.round(Number(input.sourceX));
  const sourceY = Math.round(Number(input.sourceY));
  const getStepCost = typeof input.getStepCost === "function" ? input.getStepCost : () => Number.POSITIVE_INFINITY;
  const isAllowedCell = typeof input.isAllowedCell === "function" ? input.isAllowedCell : () => true;
  if (width <= 0 || height <= 0) return null;
  if (sourceX < 0 || sourceX >= width || sourceY < 0 || sourceY >= height) return null;

  const len = width * height;
  const dist = new Float64Array(len);
  const parent = new Int32Array(len);
  dist.fill(Number.POSITIVE_INFINITY);
  parent.fill(-1);

  const indexOf = (x, y) => y * width + x;
  const startIdx = indexOf(sourceX, sourceY);
  dist[startIdx] = 0;

  const heap = new MinHeap();
  heap.push({ x: sourceX, y: sourceY, dist: 0 });
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
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (!isAllowedCell(nx, ny, current.x, current.y)) continue;
      const nIdx = indexOf(nx, ny);
      const stepCost = getStepCost(current.x, current.y, nx, ny);
      if (!Number.isFinite(stepCost)) continue;
      const nextDist = dist[idx] + stepCost;
      if (nextDist < dist[nIdx]) {
        dist[nIdx] = nextDist;
        parent[nIdx] = idx;
        heap.push({ x: nx, y: ny, dist: nextDist });
      }
    }
  }

  return {
    width,
    height,
    dist,
    parent,
    source: { x: sourceX, y: sourceY },
  };
}
