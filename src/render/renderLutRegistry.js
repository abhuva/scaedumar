export const DEFAULT_RENDER_LUTS_URL = "./assets/data/render_luts.json";

const LUT_WIDTH = 256;
const VARIANT_INDEX_MAX = 99;
const DEFAULT_RARE_LUT_WEIGHT = 0.1;

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampByte(value) {
  return Math.round(clamp(finiteOr(value, 0), 0, 255));
}

function normalizeId(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStop(stop) {
  const source = stop && typeof stop === "object" ? stop : {};
  const rgb = Array.isArray(source.rgb) ? source.rgb : [];
  return {
    pos: clampByte(source.pos),
    rgb: [
      clampByte(rgb[0]),
      clampByte(rgb[1]),
      clampByte(rgb[2]),
    ],
  };
}

export function normalizeGrayscaleRampStops(stops) {
  const normalized = Array.isArray(stops) ? stops.map(normalizeStop) : [];
  if (normalized.length === 0) {
    normalized.push(
      { pos: 0, rgb: [0, 0, 0] },
      { pos: 255, rgb: [255, 255, 255] },
    );
  }
  normalized.sort((a, b) => a.pos - b.pos);

  const deduped = [];
  for (const stop of normalized) {
    if (deduped.length > 0 && deduped[deduped.length - 1].pos === stop.pos) {
      deduped[deduped.length - 1] = stop;
    } else {
      deduped.push(stop);
    }
  }
  return deduped;
}

export function buildGrayscaleRampRow(stops) {
  const normalized = normalizeGrayscaleRampStops(stops);
  const row = new Uint8Array(LUT_WIDTH * 4);
  let nextIndex = 0;
  for (let x = 0; x < LUT_WIDTH; x += 1) {
    while (nextIndex < normalized.length - 1 && x > normalized[nextIndex + 1].pos) {
      nextIndex += 1;
    }
    const left = normalized[nextIndex];
    const right = normalized[Math.min(normalized.length - 1, nextIndex + 1)];
    const span = Math.max(1, right.pos - left.pos);
    const t = right.pos === left.pos ? 0 : clamp((x - left.pos) / span, 0, 1);
    const offset = x * 4;
    row[offset] = clampByte(left.rgb[0] + ((right.rgb[0] - left.rgb[0]) * t));
    row[offset + 1] = clampByte(left.rgb[1] + ((right.rgb[1] - left.rgb[1]) * t));
    row[offset + 2] = clampByte(left.rgb[2] + ((right.rgb[2] - left.rgb[2]) * t));
    row[offset + 3] = 255;
  }
  return row;
}

function hashUint(value) {
  const text = String(value ?? "");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomUnit(seed, salt) {
  let x = hashUint(`${seed}:${salt}`);
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967295;
}

function signedRandom(seed, salt) {
  return (randomUnit(seed, salt) * 2) - 1;
}

function normalizeVariantSource(source, explicitStopsById = {}) {
  const variant = source && typeof source === "object" ? source : {};
  const family = normalizeId(variant.family);
  const baseLutId = normalizeId(variant.baseLutId);
  const baseStops = baseLutId && explicitStopsById[baseLutId]
    ? explicitStopsById[baseLutId]
    : null;
  const count = Math.max(0, Math.min(
    VARIANT_INDEX_MAX + 1,
    Math.round(finiteOr(variant.count, 0)),
  ));
  return {
    family,
    baseLutId,
    type: variant.type === "grayscale-ramp" ? "grayscale-ramp" : "grayscale-ramp",
    stops: baseStops ? normalizeGrayscaleRampStops(baseStops) : normalizeGrayscaleRampStops(variant.stops),
    count,
    seed: Math.round(finiteOr(variant.seed, 0)),
    positionJitter: Math.max(0, Math.round(finiteOr(variant.positionJitter, 0))),
    brightnessJitter: Math.max(0, finiteOr(variant.brightnessJitter, 0)),
    colorJitter: Math.max(0, finiteOr(variant.colorJitter, 0)),
  };
}

function makeVariantId(family, index) {
  return `${family}.variant.${String(index).padStart(2, "0")}`;
}

function normalizeRange(range) {
  const source = range && typeof range === "object" ? range : {};
  const family = normalizeId(source.family);
  const start = Math.max(0, Math.min(VARIANT_INDEX_MAX, Math.round(finiteOr(source.start, 0))));
  const count = Math.max(0, Math.min(VARIANT_INDEX_MAX + 1 - start, Math.round(finiteOr(source.count, 0))));
  return { family, start, count };
}

function normalizeRefWeight(source) {
  const hasExplicitWeight = source && Object.prototype.hasOwnProperty.call(source, "weight");
  const fallback = source && source.rare === true ? DEFAULT_RARE_LUT_WEIGHT : 1;
  return Math.max(0, finiteOr(hasExplicitWeight ? source.weight : fallback, fallback));
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .map((entry) => normalizeId(entry))
    .filter(Boolean))];
}

function buildVariantStops(source, index) {
  const seed = `${source.seed}:${source.family}:${index}`;
  const stops = source.stops.map((stop, stopIndex) => {
    const endpoint = stopIndex === 0 || stopIndex === source.stops.length - 1;
    const pos = endpoint
      ? stop.pos
      : clampByte(stop.pos + (signedRandom(seed, `pos:${stopIndex}`) * source.positionJitter));
    const brightness = 1 + (signedRandom(seed, `brightness:${stopIndex}`) * source.brightnessJitter);
    return {
      pos,
      rgb: stop.rgb.map((channel, channelIndex) => clampByte(
        (channel * brightness) + (signedRandom(seed, `color:${stopIndex}:${channelIndex}`) * 255 * source.colorJitter),
      )),
    };
  });
  return normalizeGrayscaleRampStops(stops);
}

function collectLutDefinitions(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const definitions = [];
  const explicitStopsById = {};
  const luts = source.luts && typeof source.luts === "object" ? source.luts : {};
  for (const [key, value] of Object.entries(luts)) {
    const lut = value && typeof value === "object" ? value : {};
    const id = normalizeId(lut.id) || normalizeId(key);
    if (!id) continue;
    const stops = normalizeGrayscaleRampStops(lut.stops);
    explicitStopsById[id] = stops;
    definitions.push({
      id,
      type: lut.type === "grayscale-ramp" ? "grayscale-ramp" : "grayscale-ramp",
      stops,
    });
  }

  const variantFamilies = [];
  const variants = Array.isArray(source.variants)
    ? source.variants
    : Object.values(source.variants && typeof source.variants === "object" ? source.variants : {});
  for (const rawVariant of variants) {
    const variant = normalizeVariantSource(rawVariant, explicitStopsById);
    if (!variant.family || variant.count <= 0) continue;
    const rowIds = [];
    for (let i = 0; i < variant.count; i += 1) {
      const id = makeVariantId(variant.family, i);
      rowIds.push(id);
      definitions.push({
        id,
        type: "grayscale-ramp",
        stops: buildVariantStops(variant, i),
      });
    }
    variantFamilies.push({
      family: variant.family,
      baseLutId: variant.baseLutId,
      type: variant.type,
      count: variant.count,
      seed: variant.seed,
      positionJitter: variant.positionJitter,
      brightnessJitter: variant.brightnessJitter,
      colorJitter: variant.colorJitter,
      rowIds,
    });
  }

  return { definitions, variantFamilies };
}

export function buildRenderLutRegistry(raw) {
  const definitions = [];
  const collected = collectLutDefinitions(raw);
  const seenIds = new Set();
  const duplicateIds = [];
  for (const definition of collected.definitions) {
    if (seenIds.has(definition.id)) {
      duplicateIds.push(definition.id);
      continue;
    }
    seenIds.add(definition.id);
    definitions.push(definition);
  }
  const rowCount = Math.max(1, definitions.length);
  const data = new Uint8Array(LUT_WIDTH * rowCount * 4);
  const rowsById = {};
  const rowIds = definitions.length > 0 ? definitions.map((definition) => definition.id) : ["default.identity"];

  definitions.forEach((definition, rowIndex) => {
    if (rowsById[definition.id]) return;
    rowsById[definition.id] = rowIndex;
    data.set(buildGrayscaleRampRow(definition.stops), rowIndex * LUT_WIDTH * 4);
  });

  if (definitions.length === 0) {
    data.set(buildGrayscaleRampRow([]), 0);
  }

  return {
    version: Math.max(1, Math.round(finiteOr(raw && raw.version, 1))),
    width: LUT_WIDTH,
    height: rowCount,
    data,
    rowsById,
    rowIds,
    duplicateIds,
    variantFamilies: collected.variantFamilies.map((family) => ({
      ...family,
      rowIds: family.rowIds.filter((id) => Number.isFinite(Number(rowsById[id]))),
      rows: family.rowIds
        .map((id) => rowsById[id])
        .filter((row) => Number.isFinite(Number(row))),
    })),
  };
}

export function getRenderLutDebugSnapshot(registry) {
  const source = registry && typeof registry === "object" ? registry : {};
  const rowIds = Array.isArray(source.rowIds) ? source.rowIds : [];
  const duplicateIds = Array.isArray(source.duplicateIds) ? source.duplicateIds : [];
  return {
    width: Math.max(0, Math.round(finiteOr(source.width, 0))),
    height: Math.max(0, Math.round(finiteOr(source.height, 0))),
    rowCount: rowIds.length,
    rowIds: [...rowIds],
    duplicateIds: [...duplicateIds],
  };
}

export function getRenderLutRowRgba(registry, rowIndex) {
  const source = registry && typeof registry === "object" ? registry : {};
  const width = Math.max(0, Math.round(finiteOr(source.width, 0)));
  const height = Math.max(0, Math.round(finiteOr(source.height, 0)));
  const data = source.data instanceof Uint8Array ? source.data : null;
  const row = Math.max(0, Math.min(height - 1, Math.round(finiteOr(rowIndex, 0))));
  if (!data || width <= 0 || height <= 0 || data.length < width * height * 4) {
    return new Uint8Array(0);
  }
  const start = row * width * 4;
  return data.slice(start, start + (width * 4));
}

export function buildRenderLutPreviewImageData(registry, rowIndex, options = {}) {
  const source = registry && typeof registry === "object" ? registry : {};
  const width = Math.max(0, Math.round(finiteOr(source.width, 0)));
  const previewHeight = Math.max(1, Math.round(finiteOr(options.height, 1)));
  const row = getRenderLutRowRgba(registry, rowIndex);
  if (width <= 0 || row.length === 0) {
    return {
      width: 0,
      height: 0,
      data: new Uint8ClampedArray(0),
    };
  }
  const data = new Uint8ClampedArray(width * previewHeight * 4);
  for (let y = 0; y < previewHeight; y += 1) {
    data.set(row, y * width * 4);
  }
  return {
    width,
    height: previewHeight,
    data,
  };
}

export function expandRenderLutRefs(lutRefs, registry) {
  return expandRenderLutWeightedRefs(lutRefs, registry).map((entry) => entry.row);
}

export function expandRenderLutWeightedRefs(lutRefs, registry) {
  const refs = Array.isArray(lutRefs) ? lutRefs : [];
  const rows = [];
  const seenRows = new Set();
  const rowsById = registry && registry.rowsById ? registry.rowsById : {};
  let currentTags = [];
  function addRow(id, weight) {
    const row = rowsById[id];
    if (!Number.isFinite(Number(row)) || seenRows.has(row)) return;
    seenRows.add(row);
    rows.push({ id, row, weight: Math.max(0, finiteOr(weight, 1)), tags: currentTags });
  }
  for (const ref of refs) {
    const source = ref && typeof ref === "object" ? ref : {};
    const weight = normalizeRefWeight(source);
    currentTags = normalizeTags(source.tags);
    const id = normalizeId(source.id);
    if (id) addRow(id, weight);
    const range = source.range && typeof source.range === "object" ? source.range : null;
    if (range) {
      const { family, start, count } = normalizeRange(range);
      for (let i = start; i < start + count; i += 1) {
        addRow(makeVariantId(family, i), weight);
      }
    }
  }
  return rows;
}

export function expandRenderLutRefIds(lutRefs) {
  const refs = Array.isArray(lutRefs) ? lutRefs : [];
  const ids = [];
  for (const ref of refs) {
    const source = ref && typeof ref === "object" ? ref : {};
    const id = normalizeId(source.id);
    if (id) ids.push(id);
    const range = source.range && typeof source.range === "object" ? source.range : null;
    if (range) {
      const { family, start, count } = normalizeRange(range);
      if (!family) continue;
      for (let i = start; i < start + count; i += 1) {
        ids.push(makeVariantId(family, i));
      }
    }
  }
  return [...new Set(ids)];
}

export function validateRenderLutRefs(lutRefs, registry) {
  const rowsById = registry && registry.rowsById ? registry.rowsById : {};
  const ids = expandRenderLutRefIds(lutRefs);
  const missing = ids.filter((id) => !Number.isFinite(Number(rowsById[id])));
  return {
    ok: missing.length === 0,
    ids,
    missing,
  };
}

export function validateSpritePaletteLutRefs(spriteFiles, registry) {
  const files = Array.isArray(spriteFiles) ? spriteFiles : [];
  const missing = [];
  for (const file of files) {
    const label = normalizeId(file && file.label) || "sprites";
    const sprites = file && file.sprites && typeof file.sprites === "object" ? file.sprites : {};
    for (const [key, sprite] of Object.entries(sprites)) {
      if (!sprite || sprite.palette?.mode !== "grayscale-lut") continue;
      const result = validateRenderLutRefs(sprite.palette.lutRefs, registry);
      for (const lutId of result.missing) {
        missing.push({
          file: label,
          spriteId: normalizeId(sprite.id) || key,
          lutId,
        });
      }
    }
  }
  return {
    ok: missing.length === 0,
    missing,
  };
}

export function formatMissingSpritePaletteLutRefs(validation) {
  const missing = validation && Array.isArray(validation.missing) ? validation.missing : [];
  return missing
    .map((entry) => `${entry.file}:${entry.spriteId} -> ${entry.lutId}`)
    .join("\n");
}

export async function loadRenderLutRegistry(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load render LUT registry: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_RENDER_LUTS_URL;
  const response = await fetchFn(url, { cache: "no-store" });
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load render LUT registry from ${url}: ${status}`);
  }
  return buildRenderLutRegistry(await response.json());
}
