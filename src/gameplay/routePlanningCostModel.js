function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampWithFallback(value, min, max, fallback) {
  return Math.max(min, Math.min(max, finite(value, fallback)));
}

function sampleGrayMapped(imageData, x, y, mapWidth, mapHeight) {
  if (!imageData || !imageData.data || !imageData.width || !imageData.height) return 0;
  const nx = (Number(x) + 0.5) / Math.max(1, mapWidth);
  const ny = (Number(y) + 0.5) / Math.max(1, mapHeight);
  const sx = Math.max(0, Math.min(imageData.width - 1, Math.round(nx * imageData.width - 0.5)));
  const sy = Math.max(0, Math.min(imageData.height - 1, Math.round(ny * imageData.height - 0.5)));
  return imageData.data[(sy * imageData.width + sx) * 4] / 255;
}

export const DEFAULT_ROUTE_PLANNING_SETTINGS = {
  gridSize: 256,
  baseCost: 1,
  weightSlope: 1.8,
  weightHeight: 3,
  weightWater: 0,
  slopeCutoff: 1,
  arrowSpacing: 12,
  arrowColor: "#ffffff",
  arrowOpacity: 0.78,
  arrowSize: 8,
  endpointSkipRatio: 0.5,
  previewPointRadius: 2,
  previewOpacity: 0.82,
  planningBaseAdd: 0,
  planningBaseMul: 1,
  planningSlopeAdd: 0,
  planningSlopeMul: 1,
  planningHeightAdd: 0,
  planningHeightMul: 1,
  planningWaterAdd: 0,
  planningWaterMul: 1,
  planningSlopeCutoffAdd: 0,
  discoveryCutoff: 0,
  debugOverlayMode: "none",
};

export function normalizeRoutePlanningSettings(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const color = typeof source.arrowColor === "string" && /^#[0-9a-fA-F]{6}$/.test(source.arrowColor)
    ? source.arrowColor
    : DEFAULT_ROUTE_PLANNING_SETTINGS.arrowColor;
  const debugOverlayMode = ["none", "dijkstra", "knowledge"].includes(source.debugOverlayMode)
    ? source.debugOverlayMode
    : DEFAULT_ROUTE_PLANNING_SETTINGS.debugOverlayMode;
  return {
    gridSize: Math.round(clampWithFallback(source.gridSize, 2, 512, DEFAULT_ROUTE_PLANNING_SETTINGS.gridSize)),
    baseCost: clampWithFallback(source.baseCost, 0.01, 10, DEFAULT_ROUTE_PLANNING_SETTINGS.baseCost),
    weightSlope: clampWithFallback(source.weightSlope, 0, 30, DEFAULT_ROUTE_PLANNING_SETTINGS.weightSlope),
    weightHeight: clampWithFallback(source.weightHeight, 0, 30, DEFAULT_ROUTE_PLANNING_SETTINGS.weightHeight),
    weightWater: clampWithFallback(source.weightWater, 0, 100, DEFAULT_ROUTE_PLANNING_SETTINGS.weightWater),
    slopeCutoff: clampWithFallback(source.slopeCutoff, 0, 1, DEFAULT_ROUTE_PLANNING_SETTINGS.slopeCutoff),
    arrowSpacing: Math.round(clampWithFallback(source.arrowSpacing, 1, 128, DEFAULT_ROUTE_PLANNING_SETTINGS.arrowSpacing)),
    arrowColor: color,
    arrowOpacity: clampWithFallback(source.arrowOpacity, 0, 1, DEFAULT_ROUTE_PLANNING_SETTINGS.arrowOpacity),
    arrowSize: clampWithFallback(source.arrowSize, 1, 48, DEFAULT_ROUTE_PLANNING_SETTINGS.arrowSize),
    endpointSkipRatio: clampWithFallback(source.endpointSkipRatio, 0, 2, DEFAULT_ROUTE_PLANNING_SETTINGS.endpointSkipRatio),
    previewPointRadius: clampWithFallback(source.previewPointRadius, 0.1, 12, DEFAULT_ROUTE_PLANNING_SETTINGS.previewPointRadius),
    previewOpacity: clampWithFallback(source.previewOpacity, 0, 1, DEFAULT_ROUTE_PLANNING_SETTINGS.previewOpacity),
    planningBaseAdd: clampWithFallback(source.planningBaseAdd, -5, 5, DEFAULT_ROUTE_PLANNING_SETTINGS.planningBaseAdd),
    planningBaseMul: clampWithFallback(source.planningBaseMul, 0, 3, DEFAULT_ROUTE_PLANNING_SETTINGS.planningBaseMul),
    planningSlopeAdd: clampWithFallback(source.planningSlopeAdd, -30, 30, DEFAULT_ROUTE_PLANNING_SETTINGS.planningSlopeAdd),
    planningSlopeMul: clampWithFallback(source.planningSlopeMul, 0, 3, DEFAULT_ROUTE_PLANNING_SETTINGS.planningSlopeMul),
    planningHeightAdd: clampWithFallback(source.planningHeightAdd, -30, 30, DEFAULT_ROUTE_PLANNING_SETTINGS.planningHeightAdd),
    planningHeightMul: clampWithFallback(source.planningHeightMul, 0, 3, DEFAULT_ROUTE_PLANNING_SETTINGS.planningHeightMul),
    planningWaterAdd: clampWithFallback(source.planningWaterAdd, -100, 100, DEFAULT_ROUTE_PLANNING_SETTINGS.planningWaterAdd),
    planningWaterMul: clampWithFallback(source.planningWaterMul, 0, 3, DEFAULT_ROUTE_PLANNING_SETTINGS.planningWaterMul),
    planningSlopeCutoffAdd: clampWithFallback(source.planningSlopeCutoffAdd, -1, 1, DEFAULT_ROUTE_PLANNING_SETTINGS.planningSlopeCutoffAdd),
    discoveryCutoff: clampWithFallback(source.discoveryCutoff, 0, 1, DEFAULT_ROUTE_PLANNING_SETTINGS.discoveryCutoff),
    debugOverlayMode,
  };
}

export function createRoutePlanningCostModel(deps) {
  let terrainCache = null;

  function getMapSize() {
    const size = typeof deps.getMapSize === "function" ? deps.getMapSize() : {};
    return {
      width: Math.max(1, Math.round(Number(size.width) || 1)),
      height: Math.max(1, Math.round(Number(size.height) || 1)),
    };
  }

  function gridSizeFromSettings(settings) {
    const map = getMapSize();
    const requested = Math.max(1, Math.round(Number(settings.gridSize) || DEFAULT_ROUTE_PLANNING_SETTINGS.gridSize));
    return {
      width: Math.max(1, Math.min(requested, map.width)),
      height: Math.max(1, Math.min(requested, map.height)),
    };
  }

  function cellToPixel(cell, gridSize = null) {
    const map = getMapSize();
    const grid = gridSize || gridSizeFromSettings(normalizeRoutePlanningSettings());
    return {
      x: Math.max(0, Math.min(map.width - 1, Math.round(((cell.x + 0.5) / grid.width) * map.width - 0.5))),
      y: Math.max(0, Math.min(map.height - 1, Math.round(((cell.y + 0.5) / grid.height) * map.height - 0.5))),
    };
  }

  function pixelToCell(pixel, gridSize = null) {
    const map = getMapSize();
    const grid = gridSize || gridSizeFromSettings(normalizeRoutePlanningSettings());
    return {
      x: Math.max(0, Math.min(grid.width - 1, Math.floor((Number(pixel.x) / map.width) * grid.width))),
      y: Math.max(0, Math.min(grid.height - 1, Math.floor((Number(pixel.y) / map.height) * grid.height))),
    };
  }

  function buildCostGrid(rawSettings = {}) {
    const settings = normalizeRoutePlanningSettings(rawSettings);
    const terrain = getTerrainGrid(settings);
    return {
      width: terrain.width,
      height: terrain.height,
      costs: terrain.slopeMap,
      settings,
      terrain,
    };
  }

  function cacheMatches(cache, gridSize, map, images) {
    return Boolean(cache)
      && cache.gridWidth === gridSize.width
      && cache.gridHeight === gridSize.height
      && cache.mapWidth === map.width
      && cache.mapHeight === map.height
      && cache.slopeImageData === images.slope
      && cache.heightImageData === images.height
      && cache.waterImageData === images.water;
  }

  function averageImageBlock(imageData, x0, x1, y0, y1, map) {
    let sum = 0;
    let count = 0;
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        sum += sampleGrayMapped(imageData, x, y, map.width, map.height);
        count += 1;
      }
    }
    return count > 0 ? sum / count : 0;
  }

  function getTerrainGrid(rawSettings = {}) {
    const settings = normalizeRoutePlanningSettings(rawSettings);
    const gridSize = gridSizeFromSettings(settings);
    const map = getMapSize();
    const slopeImageData = deps.getSlopeImageData?.();
    const heightImageData = deps.getHeightImageData?.();
    const waterImageData = deps.getWaterImageData?.();
    const images = {
      slope: slopeImageData,
      height: heightImageData,
      water: waterImageData,
    };
    if (cacheMatches(terrainCache, gridSize, map, images)) return terrainCache.grid;
    const len = gridSize.width * gridSize.height;
    const slopeMap = new Float32Array(len);
    const heightMap = new Float32Array(len);
    const waterMap = new Float32Array(len);
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const idx = y * gridSize.width + x;
        const x0 = Math.floor((x / gridSize.width) * map.width);
        const x1 = Math.max(x0 + 1, Math.floor(((x + 1) / gridSize.width) * map.width));
        const y0 = Math.floor((y / gridSize.height) * map.height);
        const y1 = Math.max(y0 + 1, Math.floor(((y + 1) / gridSize.height) * map.height));
        slopeMap[idx] = averageImageBlock(slopeImageData, x0, Math.min(map.width, x1), y0, Math.min(map.height, y1), map);
        heightMap[idx] = averageImageBlock(heightImageData, x0, Math.min(map.width, x1), y0, Math.min(map.height, y1), map);
        waterMap[idx] = averageImageBlock(waterImageData, x0, Math.min(map.width, x1), y0, Math.min(map.height, y1), map);
      }
    }
    const grid = {
      width: gridSize.width,
      height: gridSize.height,
      mapWidth: map.width,
      mapHeight: map.height,
      cellWidth: map.width / gridSize.width,
      cellHeight: map.height / gridSize.height,
      slopeMap,
      heightMap,
      waterMap,
      settings,
    };
    terrainCache = {
      gridWidth: gridSize.width,
      gridHeight: gridSize.height,
      mapWidth: map.width,
      mapHeight: map.height,
      slopeImageData,
      heightImageData,
      waterImageData,
      grid,
    };
    return grid;
  }

  function indexOf(grid, x, y) {
    return y * grid.width + x;
  }

  function computeRouteStepCost(fromX, fromY, toX, toY, terrain, rawSettings = {}) {
    const settings = normalizeRoutePlanningSettings(rawSettings);
    if (!terrain
      || fromX < 0 || fromX >= terrain.width || fromY < 0 || fromY >= terrain.height
      || toX < 0 || toX >= terrain.width || toY < 0 || toY >= terrain.height) {
      return Number.POSITIVE_INFINITY;
    }
    const fromIdx = indexOf(terrain, fromX, fromY);
    const toIdx = indexOf(terrain, toX, toY);
    const slope = terrain.slopeMap[toIdx] || 0;
    if (settings.slopeCutoff < 1 && slope > settings.slopeCutoff) return Number.POSITIVE_INFINITY;
    const dx = (toX - fromX) * terrain.cellWidth;
    const dy = (toY - fromY) * terrain.cellHeight;
    const dist = Math.hypot(dx, dy) || 1;
    const uphill = Math.max((terrain.heightMap[toIdx] || 0) - (terrain.heightMap[fromIdx] || 0), 0);
    const water = terrain.waterMap[toIdx] || 0;
    const weightedCost = settings.weightSlope * slope + settings.weightHeight * uphill + settings.weightWater * water;
    return dist * (settings.baseCost + weightedCost);
  }

  return {
    buildCostGrid,
    getTerrainGrid,
    computeRouteStepCost,
    pixelToCell,
    cellToPixel,
  };
}
