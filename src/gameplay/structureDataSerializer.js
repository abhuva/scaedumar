export const STRUCTURES_FILE_NAME = "structures.json";

export const EMPTY_STRUCTURE_DATA = Object.freeze({
  version: 1,
  atlas: {
    src: "",
    filter: "nearest",
    slotWidth: 32,
    slotHeight: 32,
    gridColumns: 8,
    gridRows: 8,
  },
  types: [],
  structures: [],
});

export const STRUCTURE_DATA_LIMITS = Object.freeze({
  maxTypes: 256,
  maxInstances: 4096,
  maxFootprintWidth: 64,
  maxFootprintHeight: 64,
  maxVisualWidthPx: 128,
  maxVisualHeightPx: 128,
  maxAtlasSlots: 4096,
});

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeId(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Structure ${label} must be a non-empty string.`);
  }
  return value.trim();
}

function normalizePositiveInt(value, fallback, label, max = 1024) {
  const next = Math.round(finiteOr(value, fallback));
  if (!Number.isFinite(next) || next <= 0 || next > max) {
    throw new Error(`Structure ${label} must be between 1 and ${max}.`);
  }
  return next;
}

function normalizeNonNegative(value, fallback, label, max = 65535) {
  const next = finiteOr(value, fallback);
  if (!Number.isFinite(next) || next < 0 || next > max) {
    throw new Error(`Structure ${label} must be between 0 and ${max}.`);
  }
  return next;
}

function normalizeAtlas(rawAtlas) {
  const source = rawAtlas && typeof rawAtlas === "object" ? rawAtlas : {};
  return {
    src: typeof source.src === "string" ? source.src : "",
    filter: source.filter === "linear" ? "linear" : "nearest",
    slotWidth: normalizePositiveInt(source.slotWidth, 32, "atlas.slotWidth", 512),
    slotHeight: normalizePositiveInt(source.slotHeight, 32, "atlas.slotHeight", 512),
    gridColumns: normalizePositiveInt(source.gridColumns, 8, "atlas.gridColumns", 64),
    gridRows: normalizePositiveInt(source.gridRows, 8, "atlas.gridRows", 64),
  };
}

function normalizeFootprint(rawFootprint, fallbackWidth = 1, fallbackHeight = 1) {
  const source = rawFootprint && typeof rawFootprint === "object" ? rawFootprint : {};
  const width = normalizePositiveInt(source.width, fallbackWidth, "footprint.width", STRUCTURE_DATA_LIMITS.maxFootprintWidth);
  const height = normalizePositiveInt(source.height, fallbackHeight, "footprint.height", STRUCTURE_DATA_LIMITS.maxFootprintHeight);
  const rawMask = Array.isArray(source.mask) ? source.mask : null;
  const cellCount = width * height;
  const mask = new Array(cellCount);
  if (rawMask) {
    if (rawMask.length !== cellCount) {
      throw new Error(`Structure footprint mask length must be ${cellCount}.`);
    }
    for (let i = 0; i < cellCount; i += 1) {
      mask[i] = rawMask[i] ? 1 : 0;
    }
  } else {
    mask.fill(1);
  }
  return { width, height, mask };
}

function normalizeType(rawType) {
  const source = rawType && typeof rawType === "object" ? rawType : {};
  const id = normalizeId(source.id, "type id");
  const spriteId = typeof source.spriteId === "string" && source.spriteId.trim()
    ? source.spriteId.trim()
    : id;
  const visualWidthPx = normalizePositiveInt(source.visualWidthPx, 1, `${id}.visualWidthPx`, STRUCTURE_DATA_LIMITS.maxVisualWidthPx);
  const visualHeightPx = normalizePositiveInt(source.visualHeightPx, 1, `${id}.visualHeightPx`, STRUCTURE_DATA_LIMITS.maxVisualHeightPx);
  const footprint = normalizeFootprint(source.footprint);
  const capabilities = Array.isArray(source.capabilities)
    ? source.capabilities.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
  return {
    id,
    name: typeof source.name === "string" && source.name.trim() ? source.name.trim() : id,
    spriteId,
    spriteSlot: Math.round(clamp(finiteOr(source.spriteSlot, 0), 0, STRUCTURE_DATA_LIMITS.maxAtlasSlots - 1)),
    spriteSrc: typeof source.spriteSrc === "string" && source.spriteSrc.trim() ? source.spriteSrc.trim() : "",
    visualWidthPx,
    visualHeightPx,
    footprint,
    interactionRadiusPx: normalizeNonNegative(source.interactionRadiusPx, 0, `${id}.interactionRadiusPx`, 512),
    blocksMovement: Boolean(source.blocksMovement),
    capabilities,
    stateDefaults: source.stateDefaults && typeof source.stateDefaults === "object" && !Array.isArray(source.stateDefaults)
      ? { ...source.stateDefaults }
      : {},
  };
}

function normalizeStructure(rawStructure, typeMap) {
  const source = rawStructure && typeof rawStructure === "object" ? rawStructure : {};
  const id = normalizeId(source.id, "instance id");
  const typeId = normalizeId(source.type, `${id}.type`);
  const type = typeMap.get(typeId);
  if (!type) {
    throw new Error(`Structure '${id}' references unknown type '${typeId}'.`);
  }
  const pixelX = finiteOr(source.pixelX, NaN);
  const pixelY = finiteOr(source.pixelY, NaN);
  if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) {
    throw new Error(`Structure '${id}' requires finite pixelX and pixelY.`);
  }
  return {
    id,
    type: typeId,
    pixelX,
    pixelY,
    state: source.state && typeof source.state === "object" && !Array.isArray(source.state)
      ? { ...source.state }
      : {},
  };
}

function assertUnique(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Duplicate structure ${label} id '${item.id}'.`);
    }
    seen.add(item.id);
  }
}

export function normalizeStructureData(rawData) {
  const source = rawData && typeof rawData === "object" ? rawData : {};
  const version = Math.round(finiteOr(source.version, 1));
  if (version !== 1) {
    throw new Error(`Unsupported structures.json version '${source.version}'.`);
  }

  const atlas = normalizeAtlas(source.atlas);
  const rawTypes = Array.isArray(source.types) ? source.types : [];
  if (rawTypes.length > STRUCTURE_DATA_LIMITS.maxTypes) {
    throw new Error(`structures.json exceeds maximum type count ${STRUCTURE_DATA_LIMITS.maxTypes}.`);
  }
  const types = rawTypes.map(normalizeType);
  assertUnique(types, "type");
  const typeMap = new Map(types.map((type) => [type.id, type]));
  const rawStructures = Array.isArray(source.structures) ? source.structures : [];
  if (rawStructures.length > STRUCTURE_DATA_LIMITS.maxInstances) {
    throw new Error(`structures.json exceeds maximum instance count ${STRUCTURE_DATA_LIMITS.maxInstances}.`);
  }
  const structures = rawStructures.map((item) => normalizeStructure(item, typeMap));
  assertUnique(structures, "instance");

  return {
    version: 1,
    atlas,
    types,
    structures,
  };
}

export function serializeStructureData(data) {
  return normalizeStructureData(data || EMPTY_STRUCTURE_DATA);
}
