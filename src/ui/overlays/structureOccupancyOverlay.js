import { getStructureFootprintCells as getRuntimeStructureFootprintCells } from "../../gameplay/structureRuntime.js";

function getType(snapshot, typeId) {
  const types = Array.isArray(snapshot && snapshot.types) ? snapshot.types : [];
  return types.find((type) => type.id === typeId) || null;
}

export function buildStructureOccupancyOverlayCells(snapshot, selectedId = "") {
  const structures = Array.isArray(snapshot && snapshot.structures) ? snapshot.structures : [];
  const cells = [];
  for (const structure of structures) {
    const type = getType(snapshot, structure.type);
    const footprint = type && type.footprint ? type.footprint : null;
    if (!footprint || !Array.isArray(footprint.mask)) continue;
    cells.push(...getRuntimeStructureFootprintCells(type, structure).map((cell) => ({
      x: cell.x,
      y: cell.y,
      structureId: structure.id,
      selected: Boolean(selectedId && structure.id === selectedId),
    })));
  }
  return cells;
}

export function buildStructurePlacementPreviewCells(input = {}) {
  const snapshot = input.snapshot || null;
  const type = getType(snapshot, input.typeId);
  if (!type) return [];
  const placement = input.placement || { ok: false };
  return getRuntimeStructureFootprintCells(type, { pixelX: input.pixelX, pixelY: input.pixelY }).map((cell) => ({
    ...cell,
    valid: placement.ok === true,
  }));
}

function screenCellQuad(cell, deps) {
  return [
    deps.worldToScreen(deps.mapPixelToWorld(cell.x, cell.y)),
    deps.worldToScreen(deps.mapPixelToWorld(cell.x + 1, cell.y)),
    deps.worldToScreen(deps.mapPixelToWorld(cell.x + 1, cell.y + 1)),
    deps.worldToScreen(deps.mapPixelToWorld(cell.x, cell.y + 1)),
  ];
}

function drawQuad(ctx, points, fillStyle, strokeStyle, lineWidth) {
  if (!points.every((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y))) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function drawStructureOccupancyOverlay(deps) {
  const snapshot = deps && deps.snapshot ? deps.snapshot : null;
  if (!snapshot || snapshot.enabled !== true) return;
  const cells = Array.isArray(snapshot.cells) ? snapshot.cells : [];
  if (cells.length === 0) return;
  const ctx = deps.ctx;
  ctx.save();
  for (const cell of cells) {
    const selected = cell.selected === true;
    drawQuad(
      ctx,
      screenCellQuad(cell, deps),
      selected ? "rgba(255, 218, 99, 0.34)" : "rgba(74, 210, 255, 0.18)",
      selected ? "rgba(255, 245, 172, 0.95)" : "rgba(97, 220, 255, 0.72)",
      selected ? 2 : 1,
    );
  }
  ctx.restore();
}

export function drawStructurePlacementPreviewOverlay(deps) {
  const snapshot = deps && deps.snapshot ? deps.snapshot : null;
  if (!snapshot || snapshot.enabled !== true) return;
  const cells = Array.isArray(snapshot.cells) ? snapshot.cells : [];
  if (cells.length === 0) return;
  const ctx = deps.ctx;
  ctx.save();
  for (const cell of cells) {
    const valid = cell.valid === true;
    drawQuad(
      ctx,
      screenCellQuad(cell, deps),
      valid ? "rgba(80, 220, 108, 0.24)" : "rgba(235, 55, 55, 0.28)",
      valid ? "rgba(141, 255, 161, 0.88)" : "rgba(255, 110, 110, 0.92)",
      1.5,
    );
  }
  ctx.restore();
}
