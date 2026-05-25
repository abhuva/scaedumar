function indexOf(field, x, y) {
  return y * field.width + x;
}

function indexToCell(field, idx) {
  return {
    x: idx % field.width,
    y: Math.floor(idx / field.width),
  };
}

export function extractGridPath(input = {}) {
  const field = input.field || {};
  const width = Math.max(0, Math.round(Number(field.width) || 0));
  const height = Math.max(0, Math.round(Number(field.height) || 0));
  if (width <= 0 || height <= 0 || !field.dist || !field.parent) return [];
  const targetX = Math.round(Number(input.targetX));
  const targetY = Math.round(Number(input.targetY));
  const sourceX = Math.round(Number(input.sourceX));
  const sourceY = Math.round(Number(input.sourceY));
  if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) return [];
  if (sourceX < 0 || sourceX >= width || sourceY < 0 || sourceY >= height) return [];
  const normalizedField = {
    width,
    height,
    dist: field.dist,
    parent: field.parent,
  };
  const targetIdx = indexOf(normalizedField, targetX, targetY);
  const sourceIdx = indexOf(normalizedField, sourceX, sourceY);
  if (!Number.isFinite(normalizedField.dist[targetIdx])) return [];
  const path = [];
  let cursor = targetIdx;
  const maxSteps = width * height;
  for (let i = 0; i < maxSteps && cursor >= 0; i += 1) {
    path.push(indexToCell(normalizedField, cursor));
    if (cursor === sourceIdx) break;
    cursor = normalizedField.parent[cursor];
  }
  if (path[path.length - 1]?.x !== sourceX || path[path.length - 1]?.y !== sourceY) return [];
  path.reverse();
  return path;
}
