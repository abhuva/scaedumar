import { buildGridDijkstraField } from "../core/gridDijkstra.js";
import { extractGridPath } from "../core/gridPathExtraction.js";
import {
  DEFAULT_ROUTE_PLANNING_SETTINGS,
  createRoutePlanningCostModel,
  normalizeRoutePlanningSettings,
} from "./routePlanningCostModel.js";

function clonePoint(point) {
  if (!point) return null;
  return {
    x: Math.round(Number(point.x)),
    y: Math.round(Number(point.y)),
  };
}

function clonePoints(points) {
  return Array.isArray(points) ? points.map(clonePoint).filter(Boolean) : [];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sampleDiscoverySnapshot(snapshot, mapX, mapY) {
  if (!snapshot || !snapshot.cells || !snapshot.width || !snapshot.height) return 0;
  const mapWidth = Math.max(1, Number(snapshot.mapWidth) || 1);
  const mapHeight = Math.max(1, Number(snapshot.mapHeight) || 1);
  const gx = clamp(Math.floor((clamp(mapX, 0, mapWidth - 1) / mapWidth) * snapshot.width), 0, snapshot.width - 1);
  const gy = clamp(Math.floor((clamp(mapY, 0, mapHeight - 1) / mapHeight) * snapshot.height), 0, snapshot.height - 1);
  return (snapshot.cells[gy * snapshot.width + gx] || 0) / 255;
}

function buildKnowledgeGrid(costGrid, snapshots) {
  const len = costGrid.width * costGrid.height;
  const knowledge = new Float32Array(len);
  const discoverySnapshots = Array.isArray(snapshots) ? snapshots.filter(Boolean) : [];
  for (let y = 0; y < costGrid.height; y += 1) {
    for (let x = 0; x < costGrid.width; x += 1) {
      const idx = y * costGrid.width + x;
      const mapX = ((x + 0.5) / costGrid.width) * costGrid.mapWidth - 0.5;
      const mapY = ((y + 0.5) / costGrid.height) * costGrid.mapHeight - 0.5;
      let value = 0;
      for (const snapshot of discoverySnapshots) {
        value = Math.max(value, sampleDiscoverySnapshot(snapshot, mapX, mapY));
      }
      knowledge[idx] = clamp(value, 0, 1);
    }
  }
  return knowledge;
}

function applyPlanningBias(settings) {
  return normalizeRoutePlanningSettings({
    ...settings,
    baseCost: (settings.baseCost * settings.planningBaseMul) + settings.planningBaseAdd,
    weightSlope: (settings.weightSlope * settings.planningSlopeMul) + settings.planningSlopeAdd,
    weightHeight: (settings.weightHeight * settings.planningHeightMul) + settings.planningHeightAdd,
    weightWater: (settings.weightWater * settings.planningWaterMul) + settings.planningWaterAdd,
    slopeCutoff: settings.slopeCutoff + settings.planningSlopeCutoffAdd,
  });
}

export function createRoutePlanningRuntime(deps) {
  const costModel = createRoutePlanningCostModel(deps);
  const state = {
    active: false,
    source: null,
    destination: null,
    anchor: null,
    field: null,
    hoverPixel: null,
    hoverCell: null,
    hoverStatus: "none",
    hoverCost: null,
    hoverTicks: null,
    hoverPathCells: [],
    hoverPathPixels: [],
    segments: [],
    selectedSegmentId: null,
    selectedWaypoint: null,
    showCommittedOverlay: false,
    waypointPlacementActive: true,
    settings: normalizeRoutePlanningSettings(DEFAULT_ROUTE_PLANNING_SETTINGS),
    nextSegmentId: 1,
    version: 0,
  };

  function notify(reason) {
    state.version += 1;
    deps.onChange?.({ reason, version: state.version });
  }

  function playerPixel() {
    return {
      x: deps.playerState.pixelX,
      y: deps.playerState.pixelY,
    };
  }

  function getCostSettings() {
    const pathfinding = typeof deps.getPathfindingStateSnapshot === "function"
      ? deps.getPathfindingStateSnapshot()
      : null;
    if (!pathfinding || typeof pathfinding !== "object") return applyPlanningBias(state.settings);
    const slopeCutoffDeg = Number(pathfinding.slopeCutoff);
    const merged = normalizeRoutePlanningSettings({
      ...state.settings,
      ...(Number.isFinite(Number(pathfinding.baseCost)) ? { baseCost: pathfinding.baseCost } : {}),
      ...(Number.isFinite(Number(pathfinding.weightSlope)) ? { weightSlope: pathfinding.weightSlope } : {}),
      ...(Number.isFinite(Number(pathfinding.weightHeight)) ? { weightHeight: pathfinding.weightHeight } : {}),
      ...(Number.isFinite(Number(pathfinding.weightWater)) ? { weightWater: pathfinding.weightWater } : {}),
      ...(Number.isFinite(slopeCutoffDeg) ? { slopeCutoff: slopeCutoffDeg / 90 } : {}),
    });
    return applyPlanningBias(merged);
  }

  function routeTotals() {
    let nodeCount = 0;
    let cost = 0;
    let ticks = 0;
    for (const segment of state.segments) {
      nodeCount += Array.isArray(segment.polyline) ? segment.polyline.length : 0;
      cost += Number(segment.cost) || 0;
      ticks += Number(segment.ticks) || 0;
    }
    return {
      segmentCount: state.segments.length,
      nodeCount,
      cost,
      ticks,
    };
  }

  function distanceSquared(a, b) {
    const dx = Number(a && a.x) - Number(b && b.x);
    const dy = Number(a && a.y) - Number(b && b.y);
    return dx * dx + dy * dy;
  }

  function pointToSegmentDistanceSquared(point, a, b) {
    const ax = Number(a && a.x);
    const ay = Number(a && a.y);
    const bx = Number(b && b.x);
    const by = Number(b && b.y);
    const px = Number(point && point.x);
    const py = Number(point && point.y);
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (!Number.isFinite(lenSq) || lenSq <= 0) return distanceSquared(point, a);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
    const nearest = {
      x: ax + dx * t,
      y: ay + dy * t,
    };
    return distanceSquared(point, nearest);
  }

  function getSegmentById(segmentId) {
    return state.segments.find((segment) => segment.id === segmentId) || null;
  }

  function pointKey(point) {
    const pixel = clonePoint(point);
    return pixel ? `${pixel.x},${pixel.y}` : "";
  }

  function pointsEqual(a, b) {
    return pointKey(a) === pointKey(b);
  }

  function getWaypointInfo(point) {
    const pixel = clonePoint(point);
    if (!pixel) return null;
    const incoming = state.segments.filter((segment) => pointsEqual(segment.destination, pixel));
    const outgoing = state.segments.filter((segment) => pointsEqual(segment.source, pixel));
    return {
      pixel,
      incoming,
      outgoing,
      isLeaf: incoming.length > 0 && outgoing.length === 0,
    };
  }

  function getSelectedWaypointInfo() {
    return getWaypointInfo(state.selectedWaypoint);
  }

  function rebuildField(reason = "route-field-rebuilt", anchorPixel = null) {
    const source = clonePoint(anchorPixel || state.anchor || playerPixel());
    const costSettings = getCostSettings();
    const costGrid = costModel.buildCostGrid(costSettings);
    const sourceCell = costModel.pixelToCell(source, costGrid);
    const knowledge = buildKnowledgeGrid(
      costGrid.terrain,
      typeof deps.getNavigationKnowledgeSnapshots === "function" ? deps.getNavigationKnowledgeSnapshots() : [],
    );
    const sourceIndex = sourceCell.y * costGrid.width + sourceCell.x;
    const discoveryCutoff = Math.max(0, Math.min(1, Number(costSettings.discoveryCutoff) || 0));
    const dijkstra = buildGridDijkstraField({
      width: costGrid.width,
      height: costGrid.height,
      sourceX: sourceCell.x,
      sourceY: sourceCell.y,
      getStepCost: (fromX, fromY, toX, toY) => {
        const toIndex = toY * costGrid.width + toX;
        if (discoveryCutoff > 0 && toIndex !== sourceIndex && (knowledge[toIndex] || 0) < discoveryCutoff) {
          return Number.POSITIVE_INFINITY;
        }
        return costModel.computeRouteStepCost(fromX, fromY, toX, toY, costGrid.terrain, costSettings);
      },
    });
    const dist = dijkstra ? dijkstra.dist : new Float64Array(costGrid.width * costGrid.height).fill(Number.POSITIVE_INFINITY);
    const parent = dijkstra ? dijkstra.parent : new Int32Array(costGrid.width * costGrid.height).fill(-1);

    state.source = clonePoint(source);
    state.anchor = clonePoint(source);
    state.field = {
      width: costGrid.width,
      height: costGrid.height,
      dist,
      parent,
      knowledge,
      sourceCell,
      settings: costGrid.settings,
      terrain: costGrid.terrain,
    };
    state.hoverPixel = null;
    state.hoverCell = null;
    state.hoverStatus = "none";
    state.hoverCost = null;
    state.hoverTicks = null;
    state.hoverPathCells = [];
    state.hoverPathPixels = [];
    notify(reason);
  }

  function setActive(active, reason = "route-mode") {
    state.active = Boolean(active);
    if (state.active) {
      state.waypointPlacementActive = state.segments.length === 0;
      if (state.segments.length === 0) {
        state.anchor = playerPixel();
      } else if (!state.anchor) {
        state.anchor = playerPixel();
      }
      rebuildField(reason, state.anchor);
      return;
    }
    state.hoverCell = null;
    state.hoverPixel = null;
    state.hoverStatus = "none";
    state.hoverCost = null;
    state.hoverTicks = null;
    state.hoverPathCells = [];
    state.hoverPathPixels = [];
    notify(reason);
  }

  function extractCellsTo(cell) {
    const field = state.field;
    if (!field || !cell) return [];
    if (cell.x < 0 || cell.x >= field.width || cell.y < 0 || cell.y >= field.height) return [];
    return extractGridPath({
      field,
      sourceX: field.sourceCell.x,
      sourceY: field.sourceCell.y,
      targetX: cell.x,
      targetY: cell.y,
    });
  }

  function projectCells(cells, destinationPixel = null) {
    const field = state.field;
    if (!Array.isArray(cells)) return [];
    return cells.map((cell, index) => {
      if (index === 0 && state.source) return clonePoint(state.source);
      if (index === cells.length - 1 && destinationPixel) return clonePoint(destinationPixel);
      return costModel.cellToPixel(cell, field);
    }).filter(Boolean);
  }

  function estimateMetricsForCells(cells) {
    const field = state.field;
    if (!field || !field.terrain || !Array.isArray(cells) || cells.length < 2) {
      return { cost: 0, ticks: 0 };
    }
    let cost = 0;
    let ticks = 0;
    const discoveryCutoff = Math.max(0, Math.min(1, Number(field.settings.discoveryCutoff) || 0));
    for (let i = 1; i < cells.length; i += 1) {
      const from = cells[i - 1];
      const to = cells[i];
      const toIndex = to.y * field.width + to.x;
      if (discoveryCutoff > 0 && field.knowledge && (field.knowledge[toIndex] || 0) < discoveryCutoff) {
        return { cost: Number.POSITIVE_INFINITY, ticks: Number.POSITIVE_INFINITY };
      }
      const stepCost = costModel.computeRouteStepCost(
        from.x,
        from.y,
        to.x,
        to.y,
        field.terrain,
        field.settings,
      );
      if (!Number.isFinite(stepCost) || stepCost <= 0) {
        return { cost: Number.POSITIVE_INFINITY, ticks: Number.POSITIVE_INFINITY };
      }
      cost += stepCost;
      ticks += Math.max(1, Math.ceil(stepCost));
    }
    return { cost, ticks };
  }

  function updateHoverAtPixel(pixel, reason = "route-hover") {
    if (!state.active || !state.waypointPlacementActive || !state.field) return false;
    const cell = costModel.pixelToCell(pixel, state.field);
    if (state.hoverCell && state.hoverCell.x === cell.x && state.hoverCell.y === cell.y) return state.hoverPathCells.length > 0;
    const cells = extractCellsTo(cell);
    state.hoverPixel = clonePoint(pixel);
    state.hoverCell = clonePoint(cell);
    state.hoverPathCells = clonePoints(cells);
    state.hoverPathPixels = projectCells(cells, pixel);
    state.hoverStatus = cells.length > 0 ? "reachable" : "unreachable";
    const metrics = state.hoverStatus === "reachable" ? estimateMetricsForCells(cells) : null;
    state.hoverCost = metrics && Number.isFinite(metrics.cost) ? metrics.cost : null;
    state.hoverTicks = metrics && Number.isFinite(metrics.ticks) ? metrics.ticks : null;
    notify(reason);
    return cells.length > 0;
  }

  function refreshHover(reason = "route-hover-refreshed") {
    const pixel = clonePoint(state.hoverPixel);
    if (!pixel) return false;
    state.hoverCell = null;
    return updateHoverAtPixel(pixel, reason);
  }

  function updateHoverFromPointer(clientX, clientY) {
    if (!state.active || !state.waypointPlacementActive) return false;
    const ndc = deps.clientToNdc(clientX, clientY);
    const world = deps.worldFromNdc(ndc);
    const uv = deps.worldToUv(world);
    if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
      setHoverOutside("route-pointer-outside");
      return false;
    }
    return updateHoverAtPixel(deps.uvToMapPixelIndex(uv), "route-hover");
  }

  function setHoverOutside(reason = "route-hover-outside") {
    state.hoverPixel = null;
    state.hoverCell = null;
    state.hoverStatus = "outside";
    state.hoverCost = null;
    state.hoverTicks = null;
    state.hoverPathCells = [];
    state.hoverPathPixels = [];
    notify(reason);
  }

  function clearHover(reason = "route-hover-cleared") {
    if (!state.hoverPixel && !state.hoverCell && state.hoverPathCells.length === 0 && state.hoverPathPixels.length === 0) return;
    state.hoverPixel = null;
    state.hoverCell = null;
    state.hoverStatus = "none";
    state.hoverCost = null;
    state.hoverTicks = null;
    state.hoverPathCells = [];
    state.hoverPathPixels = [];
    notify(reason);
  }

  function commitHover(reason = "route-committed") {
    if (!state.waypointPlacementActive || !state.hoverCell || state.hoverPathCells.length === 0) return false;
    const destination = state.hoverPathPixels[state.hoverPathPixels.length - 1] || null;
    state.destination = clonePoint(destination);
    const segment = {
      id: state.nextSegmentId++,
      source: clonePoint(state.source),
      destination: clonePoint(destination),
      cells: clonePoints(state.hoverPathCells),
      polyline: clonePoints(state.hoverPathPixels),
      cost: Number.isFinite(state.hoverCost) ? state.hoverCost : 0,
      ticks: Number.isFinite(state.hoverTicks) ? state.hoverTicks : estimateMetricsForCells(state.hoverPathCells).ticks,
      gridSize: state.field ? { width: state.field.width, height: state.field.height } : null,
      settingsVersion: state.version,
    };
    state.segments.push(segment);
    state.selectedSegmentId = segment.id;
    state.selectedWaypoint = clonePoint(destination);
    state.anchor = clonePoint(destination);
    state.waypointPlacementActive = false;
    rebuildField(reason, state.anchor);
    return true;
  }

  function clearCommitted(reason = "route-cleared") {
    state.destination = null;
    state.segments = [];
    state.selectedSegmentId = null;
    state.selectedWaypoint = null;
    state.anchor = playerPixel();
    if (state.active) {
      rebuildField(reason, state.anchor);
      return;
    }
    notify(reason);
  }

  function undoLastSegment(reason = "route-undo") {
    if (state.segments.length === 0) return false;
    state.segments.pop();
    if (state.selectedSegmentId && !getSegmentById(state.selectedSegmentId)) {
      state.selectedSegmentId = null;
    }
    if (state.selectedWaypoint && !getWaypointInfo(state.selectedWaypoint)?.incoming.length && !getWaypointInfo(state.selectedWaypoint)?.outgoing.length) {
      state.selectedWaypoint = null;
    }
    const previous = state.segments[state.segments.length - 1];
    state.destination = previous ? clonePoint(previous.destination) : null;
    state.anchor = previous ? clonePoint(previous.destination) : playerPixel();
    if (state.active) {
      rebuildField(reason, state.anchor);
    } else {
      notify(reason);
    }
    return true;
  }

  function updateSettings(patch, reason = "route-settings") {
    state.settings = normalizeRoutePlanningSettings({
      ...state.settings,
      ...(patch || {}),
    });
    const debugOverlayMode = state.settings.debugOverlayMode || "none";
    if (state.active || debugOverlayMode !== "none") {
      rebuildField(reason, state.anchor || playerPixel());
      return;
    }
    notify(reason);
  }

  function setShowCommittedOverlay(visible, reason = "route-overlay-visibility") {
    const nextVisible = visible !== false;
    if (state.showCommittedOverlay === nextVisible) return false;
    state.showCommittedOverlay = nextVisible;
    notify(reason);
    return true;
  }

  function setWaypointPlacementActive(active, reason = "route-waypoint-placement") {
    const nextActive = active !== false;
    if (state.waypointPlacementActive === nextActive) return false;
    state.waypointPlacementActive = nextActive;
    if (!nextActive) {
      state.hoverPixel = null;
      state.hoverCell = null;
      state.hoverStatus = "none";
      state.hoverCost = null;
      state.hoverTicks = null;
      state.hoverPathCells = [];
      state.hoverPathPixels = [];
    }
    notify(reason);
    return true;
  }

  function selectSegment(segmentId, reason = "route-segment-selected") {
    const id = Number(segmentId);
    const nextId = getSegmentById(id) ? id : null;
    if (state.selectedSegmentId === nextId) return Boolean(nextId);
    state.selectedSegmentId = nextId;
    if (nextId != null) state.selectedWaypoint = null;
    notify(reason);
    return Boolean(nextId);
  }

  function selectWaypointAtPixel(pixel, reason = "route-waypoint-selected") {
    const waypoint = clonePoint(pixel);
    if (!waypoint) return false;
    state.selectedWaypoint = waypoint;
    state.selectedSegmentId = null;
    state.waypointPlacementActive = false;
    state.hoverPixel = null;
    state.hoverCell = null;
    state.hoverStatus = "none";
    state.hoverCost = null;
    state.hoverTicks = null;
    state.hoverPathCells = [];
    state.hoverPathPixels = [];
    notify(reason);
    return true;
  }

  function selectWaypointFromEndpoint(segmentId, endpoint = "destination", reason = "route-endpoint-selected") {
    const segment = getSegmentById(Number(segmentId));
    if (!segment) return false;
    const point = endpoint === "source" ? segment.source : segment.destination;
    return selectWaypointAtPixel(point, reason);
  }

  function clearSelection(reason = "route-selection-cleared") {
    if (state.selectedSegmentId == null && state.selectedWaypoint == null) return false;
    state.selectedSegmentId = null;
    state.selectedWaypoint = null;
    notify(reason);
    return true;
  }

  function deleteSegment(segmentId, reason = "route-segment-deleted") {
    const id = Number(segmentId);
    const index = state.segments.findIndex((segment) => segment.id === id);
    if (index < 0) return false;
    state.segments.splice(index, 1);
    if (state.selectedSegmentId === id) state.selectedSegmentId = null;
    if (state.destination && state.segments.length > 0) {
      state.destination = clonePoint(state.segments[state.segments.length - 1].destination);
    } else if (state.segments.length === 0) {
      state.destination = null;
      state.anchor = playerPixel();
      state.waypointPlacementActive = true;
      state.selectedWaypoint = null;
      state.hoverPixel = null;
      state.hoverCell = null;
      state.hoverStatus = "none";
      state.hoverCost = null;
      state.hoverTicks = null;
      state.hoverPathCells = [];
      state.hoverPathPixels = [];
    }
    notify(reason);
    return true;
  }

  function deleteSelectedSegment(reason = "route-selected-segment-deleted") {
    if (state.selectedSegmentId == null) return false;
    return deleteSegment(state.selectedSegmentId, reason);
  }

  function deleteSelectedWaypoint(reason = "route-selected-waypoint-deleted") {
    const info = getSelectedWaypointInfo();
    if (!info || !info.isLeaf) return false;
    const incoming = info.incoming[info.incoming.length - 1];
    if (!incoming) return false;
    const previousAnchor = clonePoint(incoming.source) || playerPixel();
    const index = state.segments.findIndex((segment) => segment.id === incoming.id);
    if (index < 0) return false;
    state.segments.splice(index, 1);
    if (state.selectedSegmentId === incoming.id) state.selectedSegmentId = null;
    state.destination = state.segments.length > 0
      ? clonePoint(state.segments[state.segments.length - 1].destination)
      : null;
    state.selectedWaypoint = null;
    state.anchor = previousAnchor;
    state.waypointPlacementActive = false;
    if (state.active) {
      rebuildField(reason, state.anchor);
    } else {
      notify(reason);
    }
    return true;
  }

  function setAnchorAtPixel(pixel, reason = "route-anchor-selected") {
    const anchor = clonePoint(pixel);
    if (!anchor) return false;
    state.anchor = anchor;
    state.selectedWaypoint = clonePoint(anchor);
    state.waypointPlacementActive = true;
    if (state.active) {
      rebuildField(reason, state.anchor);
      return true;
    }
    notify(reason);
    return true;
  }

  function setAnchorFromEndpoint(segmentId, endpoint = "destination", reason = "route-endpoint-anchor") {
    const segment = getSegmentById(Number(segmentId));
    if (!segment) return false;
    const point = endpoint === "source" ? segment.source : segment.destination;
    return setAnchorAtPixel(point, reason);
  }

  function hitTestAtPixel(pixel, options = {}) {
    const endpointRadius = Math.max(1, Number(options.endpointRadius) || 10);
    const segmentRadius = Math.max(1, Number(options.segmentRadius) || 8);
    const endpointRadiusSq = endpointRadius * endpointRadius;
    const segmentRadiusSq = segmentRadius * segmentRadius;
    let bestEndpoint = null;
    let bestEndpointDistance = Number.POSITIVE_INFINITY;
    for (const segment of state.segments) {
      for (const endpoint of ["source", "destination"]) {
        const endpointPixel = segment[endpoint];
        const distanceSq = distanceSquared(pixel, endpointPixel);
        if (distanceSq <= endpointRadiusSq && distanceSq < bestEndpointDistance) {
          bestEndpointDistance = distanceSq;
          bestEndpoint = {
            type: "endpoint",
            segmentId: segment.id,
            endpoint,
            pixel: clonePoint(endpointPixel),
            distance: Math.sqrt(distanceSq),
          };
        }
      }
    }
    if (bestEndpoint) return bestEndpoint;

    let bestSegment = null;
    let bestSegmentDistance = Number.POSITIVE_INFINITY;
    for (const segment of state.segments) {
      const polyline = Array.isArray(segment.polyline) ? segment.polyline : [];
      for (let i = 1; i < polyline.length; i += 1) {
        const distanceSq = pointToSegmentDistanceSquared(pixel, polyline[i - 1], polyline[i]);
        if (distanceSq <= segmentRadiusSq && distanceSq < bestSegmentDistance) {
          bestSegmentDistance = distanceSq;
          bestSegment = {
            type: "segment",
            segmentId: segment.id,
            distance: Math.sqrt(distanceSq),
          };
        }
      }
    }
    return bestSegment;
  }

  function getSnapshot() {
    const debugOverlayMode = state.settings.debugOverlayMode || "none";
    const debugValues = state.field && debugOverlayMode !== "none"
      ? debugOverlayMode === "dijkstra"
        ? state.field.dist
        : debugOverlayMode === "knowledge"
          ? state.field.knowledge
          : null
      : null;
    return {
      active: state.active,
      source: clonePoint(state.source),
      destination: clonePoint(state.destination),
      anchor: clonePoint(state.anchor),
      field: state.field
        ? {
            width: state.field.width,
            height: state.field.height,
            sourceCell: clonePoint(state.field.sourceCell),
          }
        : null,
      hoverPixel: clonePoint(state.hoverPixel),
      hoverCell: clonePoint(state.hoverCell),
      hoverStatus: state.hoverStatus,
      hoverCost: Number.isFinite(state.hoverCost) ? state.hoverCost : null,
      hoverTicks: Number.isFinite(state.hoverTicks) ? state.hoverTicks : null,
      hoverPathPixels: clonePoints(state.hoverPathPixels),
      segments: state.segments.map((segment) => ({
        ...segment,
        source: clonePoint(segment.source),
        destination: clonePoint(segment.destination),
        cells: clonePoints(segment.cells),
        polyline: clonePoints(segment.polyline),
      })),
      committed: state.segments.length > 0
        ? {
            source: clonePoint(state.segments[0].source),
            destination: clonePoint(state.segments[state.segments.length - 1].destination),
            cells: state.segments.flatMap((segment) => clonePoints(segment.cells)),
            polyline: state.segments.flatMap((segment) => clonePoints(segment.polyline)),
            cost: routeTotals().cost,
            ticks: routeTotals().ticks,
            segmentCount: state.segments.length,
          }
        : null,
      totals: routeTotals(),
      selectedSegmentId: state.selectedSegmentId,
      selectedWaypoint: clonePoint(state.selectedWaypoint),
      canDeleteSelectedWaypoint: getSelectedWaypointInfo()?.isLeaf === true,
      showCommittedOverlay: state.showCommittedOverlay,
      waypointPlacementActive: state.waypointPlacementActive,
      settings: { ...state.settings },
      debugOverlay: debugValues && state.field
        ? {
            mode: debugOverlayMode,
            width: state.field.width,
            height: state.field.height,
            values: debugValues,
          }
        : null,
      version: state.version,
    };
  }

  return {
    state,
    getSnapshot,
    setActive,
    rebuildField,
    updateHoverAtPixel,
    refreshHover,
    updateHoverFromPointer,
    setHoverOutside,
    clearHover,
    commitHover,
    clearCommitted,
    undoLastSegment,
    updateSettings,
    setShowCommittedOverlay,
    setWaypointPlacementActive,
    selectSegment,
    selectWaypointAtPixel,
    selectWaypointFromEndpoint,
    clearSelection,
    deleteSegment,
    deleteSelectedSegment,
    deleteSelectedWaypoint,
    setAnchorAtPixel,
    setAnchorFromEndpoint,
    hitTestAtPixel,
  };
}
