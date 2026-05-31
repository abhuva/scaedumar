import { EMPTY_STRUCTURE_DATA, normalizeStructureData, serializeStructureData } from "./structureDataSerializer.js";

function cloneFootprint(footprint) {
  return {
    width: footprint.width,
    height: footprint.height,
    mask: footprint.mask.slice(),
  };
}

function cloneType(type) {
  return {
    ...type,
    footprint: cloneFootprint(type.footprint),
    capabilities: type.capabilities.slice(),
    stateDefaults: { ...type.stateDefaults },
  };
}

function cloneStructure(structure) {
  return {
    ...structure,
    state: { ...structure.state },
  };
}

function toMapIndex(width, x, y) {
  return y * width + x;
}

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function getStructureFootprintBounds(type, structure) {
  const footprint = type && type.footprint ? type.footprint : null;
  return {
    x: Math.floor(Number(structure && structure.pixelX) || 0),
    y: Math.floor(Number(structure && structure.pixelY) || 0),
    width: Math.max(0, Math.floor(Number(footprint && footprint.width) || 0)),
    height: Math.max(0, Math.floor(Number(footprint && footprint.height) || 0)),
  };
}

export function getStructureVisualBounds(type, structure) {
  return {
    x: Number(structure && structure.pixelX) || 0,
    y: Number(structure && structure.pixelY) || 0,
    width: Math.max(1, Number(type && type.visualWidthPx) || 1),
    height: Math.max(1, Number(type && type.visualHeightPx) || 1),
  };
}

export function getStructureFootprintCells(type, structure) {
  const footprint = type && type.footprint ? type.footprint : null;
  if (!footprint || !Array.isArray(footprint.mask)) return [];
  const bounds = getStructureFootprintBounds(type, structure);
  const cells = [];
  for (let fy = 0; fy < bounds.height; fy += 1) {
    for (let fx = 0; fx < bounds.width; fx += 1) {
      if (!footprint.mask[fy * bounds.width + fx]) continue;
      cells.push({ x: bounds.x + fx, y: bounds.y + fy });
    }
  }
  return cells;
}

export function createStructureRuntime(deps = {}) {
  const getMapSize = typeof deps.getMapSize === "function"
    ? deps.getMapSize
    : () => ({ width: 0, height: 0 });

  let data = normalizeStructureData(EMPTY_STRUCTURE_DATA);
  let typeMap = new Map();
  let structureMap = new Map();
  let occupancy = new Uint32Array(0);
  let occupancyWidth = 0;
  let occupancyHeight = 0;
  let nextGeneratedId = 1;
  let version = 0;

  function getSafeMapSize() {
    const size = getMapSize() || {};
    return {
      width: Math.max(0, Math.floor(finiteOr(size.width, 0))),
      height: Math.max(0, Math.floor(finiteOr(size.height, 0))),
    };
  }

  function rebuildMaps() {
    typeMap = new Map(data.types.map((type) => [type.id, type]));
    structureMap = new Map(data.structures.map((structure) => [structure.id, structure]));
  }

  function ensureOccupancySize() {
    const size = getSafeMapSize();
    if (size.width === occupancyWidth && size.height === occupancyHeight && occupancy.length === size.width * size.height) {
      return;
    }
    occupancyWidth = size.width;
    occupancyHeight = size.height;
    occupancy = new Uint32Array(Math.max(0, occupancyWidth * occupancyHeight));
  }

  function getType(typeId) {
    return typeMap.get(typeId) || null;
  }

  function forEachFootprintCell(structure, visitor) {
    const type = getType(structure.type);
    if (!type) return;
    for (const cell of getStructureFootprintCells(type, structure)) {
      visitor(cell.x, cell.y);
    }
  }

  function rebuildOccupancy() {
    ensureOccupancySize();
    occupancy.fill(0);
    for (let i = 0; i < data.structures.length; i += 1) {
      const structure = data.structures[i];
      const handle = i + 1;
      forEachFootprintCell(structure, (x, y) => {
        if (x < 0 || y < 0 || x >= occupancyWidth || y >= occupancyHeight) {
          throw new Error(`Structure '${structure.id}' footprint is outside map bounds.`);
        }
        const index = toMapIndex(occupancyWidth, x, y);
        if (occupancy[index] !== 0) {
          const other = data.structures[occupancy[index] - 1];
          throw new Error(`Structure '${structure.id}' overlaps '${other ? other.id : "unknown"}'.`);
        }
        occupancy[index] = handle;
      });
    }
  }

  function touch() {
    version += 1;
    if (typeof deps.onChanged === "function") {
      deps.onChanged({ version });
    }
  }

  function applyStructureData(rawData) {
    data = normalizeStructureData(rawData || EMPTY_STRUCTURE_DATA);
    rebuildMaps();
    rebuildOccupancy();
    touch();
    return getStructureSnapshot();
  }

  function serialize() {
    return serializeStructureData(data);
  }

  function getStructureSnapshot() {
    return {
      version,
      atlas: { ...data.atlas },
      types: data.types.map(cloneType),
      structures: data.structures.map(cloneStructure),
      mapSize: { width: occupancyWidth, height: occupancyHeight },
    };
  }

  function getStructureRenderSnapshot() {
    return {
      version,
      atlas: { ...data.atlas },
      structures: data.structures.map((structure) => {
        const type = getType(structure.type);
        return {
          id: structure.id,
          type: structure.type,
          spriteId: type ? type.spriteId : "",
          spriteSlot: type ? type.spriteSlot : 0,
          spriteSrc: type ? type.spriteSrc : "",
          pixelX: structure.pixelX,
          pixelY: structure.pixelY,
          visualWidthPx: type ? type.visualWidthPx : 1,
          visualHeightPx: type ? type.visualHeightPx : 1,
          blocksMovement: Boolean(type && type.blocksMovement),
        };
      }),
    };
  }

  function isStructureOccupied(pixelX, pixelY) {
    ensureOccupancySize();
    const x = Math.floor(Number(pixelX));
    const y = Math.floor(Number(pixelY));
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= occupancyWidth || y >= occupancyHeight) {
      return false;
    }
    return occupancy[toMapIndex(occupancyWidth, x, y)] !== 0;
  }

  function isMovementBlocked(pixelX, pixelY) {
    ensureOccupancySize();
    const x = Math.floor(Number(pixelX));
    const y = Math.floor(Number(pixelY));
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= occupancyWidth || y >= occupancyHeight) {
      return false;
    }
    const handle = occupancy[toMapIndex(occupancyWidth, x, y)];
    if (handle <= 0) return false;
    const structure = data.structures[handle - 1];
    const type = structure ? getType(structure.type) : null;
    return Boolean(type && type.blocksMovement);
  }

  function getStructureIdAt(pixelX, pixelY) {
    ensureOccupancySize();
    const x = Math.floor(Number(pixelX));
    const y = Math.floor(Number(pixelY));
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= occupancyWidth || y >= occupancyHeight) {
      return null;
    }
    const handle = occupancy[toMapIndex(occupancyWidth, x, y)];
    return handle > 0 && data.structures[handle - 1] ? data.structures[handle - 1].id : null;
  }

  function getStructureAtPixel(pixelX, pixelY) {
    const id = getStructureIdAt(pixelX, pixelY);
    return id ? cloneStructure(structureMap.get(id)) : null;
  }

  function getOccupiedCells(instanceId) {
    const id = typeof instanceId === "string" ? instanceId : "";
    const structure = structureMap.get(id);
    if (!structure) return [];
    const type = getType(structure.type);
    return getStructureFootprintCells(type, structure);
  }

  function getMovementBlockedCellsInBounds(minX, minY, maxX, maxY) {
    const left = Math.floor(finiteOr(minX, 0));
    const top = Math.floor(finiteOr(minY, 0));
    const right = Math.floor(finiteOr(maxX, -1));
    const bottom = Math.floor(finiteOr(maxY, -1));
    if (right < left || bottom < top) return [];
    const cells = [];
    for (const structure of data.structures) {
      const type = getType(structure.type);
      if (!type || !type.blocksMovement) continue;
      for (const cell of getStructureFootprintCells(type, structure)) {
        if (cell.x < left || cell.x > right || cell.y < top || cell.y > bottom) continue;
        cells.push(cell);
      }
    }
    return cells;
  }

  function buildCandidate(typeId, pixelX, pixelY, state = {}, id = "__candidate__") {
    const type = getType(typeId);
    if (!type) {
      throw new Error(`Unknown structure type '${typeId}'.`);
    }
    const x = finiteOr(pixelX, NaN);
    const y = finiteOr(pixelY, NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error("Structure placement requires finite pixelX and pixelY.");
    }
    return {
      id,
      type: typeId,
      pixelX: x,
      pixelY: y,
      state: { ...type.stateDefaults, ...(state || {}) },
    };
  }

  function canPlaceStructure(typeId, pixelX, pixelY, options = {}) {
    ensureOccupancySize();
    let candidate;
    try {
      candidate = buildCandidate(typeId, pixelX, pixelY);
    } catch (error) {
      return { ok: false, reason: error.message };
    }
    const ignoreId = typeof options.ignoreId === "string" ? options.ignoreId : null;
    let failure = null;
    forEachFootprintCell(candidate, (x, y) => {
      if (failure) return;
      if (x < 0 || y < 0 || x >= occupancyWidth || y >= occupancyHeight) {
        failure = `Structure '${typeId}' footprint is outside map bounds.`;
        return;
      }
      const handle = occupancy[toMapIndex(occupancyWidth, x, y)];
      if (handle !== 0) {
        const other = data.structures[handle - 1];
        if (!ignoreId || !other || other.id !== ignoreId) {
          failure = `Structure '${typeId}' overlaps '${other ? other.id : "unknown"}'.`;
        }
      }
    });
    return failure ? { ok: false, reason: failure } : { ok: true, reason: "" };
  }

  function createGeneratedId(typeId) {
    let id = "";
    do {
      id = `${typeId}_${nextGeneratedId}`;
      nextGeneratedId += 1;
    } while (structureMap.has(id));
    return id;
  }

  function placeStructure(typeId, pixelX, pixelY, state = {}, options = {}) {
    const id = typeof options.id === "string" && options.id.trim() ? options.id.trim() : createGeneratedId(typeId);
    if (structureMap.has(id)) {
      return { ok: false, reason: `Structure '${id}' already exists.` };
    }
    const placement = canPlaceStructure(typeId, pixelX, pixelY);
    if (!placement.ok) return placement;
    const structure = buildCandidate(typeId, pixelX, pixelY, state, id);
    data = {
      ...data,
      structures: [...data.structures, structure],
    };
    rebuildMaps();
    rebuildOccupancy();
    touch();
    return { ok: true, structure: cloneStructure(structure) };
  }

  function removeStructure(instanceId) {
    const id = typeof instanceId === "string" ? instanceId : "";
    if (!structureMap.has(id)) {
      return { ok: false, reason: `Structure '${id}' does not exist.` };
    }
    data = {
      ...data,
      structures: data.structures.filter((structure) => structure.id !== id),
    };
    rebuildMaps();
    rebuildOccupancy();
    touch();
    return { ok: true };
  }

  function updateStructureState(instanceId, patch) {
    const id = typeof instanceId === "string" ? instanceId : "";
    const current = structureMap.get(id);
    if (!current) {
      return { ok: false, reason: `Structure '${id}' does not exist.` };
    }
    const nextPatch = patch && typeof patch === "object" && !Array.isArray(patch) ? patch : {};
    data = {
      ...data,
      structures: data.structures.map((structure) => (
        structure.id === id
          ? { ...structure, state: { ...structure.state, ...nextPatch } }
          : structure
      )),
    };
    rebuildMaps();
    touch();
    return { ok: true, structure: cloneStructure(structureMap.get(id)) };
  }

  function getStructuresNear(pixelX, pixelY, radiusPx) {
    const x = Number(pixelX);
    const y = Number(pixelY);
    const radius = Math.max(0, Number(radiusPx) || 0);
    const radiusSq = radius * radius;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
    return data.structures
      .filter((structure) => {
        const dx = structure.pixelX - x;
        const dy = structure.pixelY - y;
        return dx * dx + dy * dy <= radiusSq;
      })
      .map(cloneStructure);
  }

  function getStructuresByCapability(capability) {
    const key = typeof capability === "string" ? capability : "";
    if (!key) return [];
    return data.structures
      .filter((structure) => {
        const type = getType(structure.type);
        return type && type.capabilities.includes(key);
      })
      .map(cloneStructure);
  }

  function getNearestStructureByType(typeId, pixelX, pixelY) {
    const id = typeof typeId === "string" ? typeId : "";
    const x = Number(pixelX);
    const y = Number(pixelY);
    if (!id || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    let best = null;
    for (const structure of data.structures) {
      if (structure.type !== id) continue;
      const type = getType(structure.type);
      const bounds = getStructureFootprintBounds(type, structure);
      const centerX = bounds.x + bounds.width * 0.5;
      const centerY = bounds.y + bounds.height * 0.5;
      const dx = centerX - x;
      const dy = centerY - y;
      const distanceSq = dx * dx + dy * dy;
      if (!best || distanceSq < best.distanceSq) {
        best = { structure, distanceSq };
      }
    }
    return best ? cloneStructure(best.structure) : null;
  }

  applyStructureData(EMPTY_STRUCTURE_DATA);

  return {
    applyStructureData,
    serializeStructureData: serialize,
    getStructureSnapshot,
    getStructureRenderSnapshot,
    isStructureOccupied,
    isMovementBlocked,
    getStructureIdAt,
    getStructureAtPixel,
    getOccupiedCells,
    getMovementBlockedCellsInBounds,
    canPlaceStructure,
    placeStructure,
    removeStructure,
    updateStructureState,
    getStructuresNear,
    getStructuresByCapability,
    getNearestStructureByType,
  };
}
