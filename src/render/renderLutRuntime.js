import {
  buildRenderLutPreviewImageData,
  buildRenderLutRegistry,
  expandRenderLutRefs,
  getRenderLutDebugSnapshot,
  getRenderLutRowRgba,
  normalizeGrayscaleRampStops,
} from "./renderLutRegistry.js";

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function cloneJson(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function createRenderLutRuntime(options = {}) {
  const initialSourceDefinition = cloneJson(options.sourceDefinition || { version: 1 });
  let sourceDefinition = cloneJson(initialSourceDefinition);
  let registry = options.registry || buildRenderLutRegistry(sourceDefinition);
  let selectedRow = Math.max(0, Math.round(finiteOr(options.selectedRow, 0)));

  function clampSelectedRow(row) {
    const debug = getRenderLutDebugSnapshot(registry);
    if (debug.rowCount <= 0) return -1;
    return Math.max(0, Math.min(debug.rowCount - 1, Math.round(finiteOr(row, 0))));
  }

  selectedRow = clampSelectedRow(selectedRow);

  function rebuild(nextSourceDefinition = sourceDefinition) {
    sourceDefinition = cloneJson(nextSourceDefinition || { version: 1 });
    registry = buildRenderLutRegistry(sourceDefinition);
    selectedRow = clampSelectedRow(selectedRow);
    return registry;
  }

  function getRegistry() {
    return registry;
  }

  function getSourceDefinitionSnapshot() {
    return cloneJson(sourceDefinition);
  }

  function serializeSourceDefinition() {
    return getSourceDefinitionSnapshot();
  }

  function getEditableLutSummaries() {
    const luts = sourceDefinition.luts && typeof sourceDefinition.luts === "object" ? sourceDefinition.luts : {};
    return Object.keys(luts).map((id) => ({
      id,
      type: luts[id]?.type === "grayscale-ramp" ? "grayscale-ramp" : "grayscale-ramp",
      row: Number.isFinite(Number(registry.rowsById && registry.rowsById[id])) ? registry.rowsById[id] : -1,
    }));
  }

  function getDebugSnapshot() {
    return {
      ...getRenderLutDebugSnapshot(registry),
      selectedRow,
    };
  }

  function getSelectedRow() {
    return selectedRow;
  }

  function setSelectedRow(row) {
    selectedRow = clampSelectedRow(row);
    return selectedRow;
  }

  function setSelectedRowById(id) {
    const row = registry.rowsById && registry.rowsById[id];
    if (!Number.isFinite(Number(row))) return selectedRow;
    selectedRow = clampSelectedRow(row);
    return selectedRow;
  }

  function resolveRows(lutRefs) {
    return expandRenderLutRefs(lutRefs, registry);
  }

  function getPreviewImageData(row = selectedRow, previewOptions = {}) {
    return buildRenderLutPreviewImageData(registry, clampSelectedRow(row), previewOptions);
  }

  function getVariantFamilySummariesForBaseLut(baseLutId) {
    const lutId = typeof baseLutId === "string" ? baseLutId.trim() : "";
    const families = Array.isArray(registry.variantFamilies) ? registry.variantFamilies : [];
    return families
      .filter((family) => family.baseLutId === lutId)
      .map((family) => ({
        family: family.family,
        baseLutId: family.baseLutId,
        type: family.type,
        count: family.count,
        seed: family.seed,
        positionJitter: family.positionJitter,
        brightnessJitter: family.brightnessJitter,
        colorJitter: family.colorJitter,
        rowIds: [...family.rowIds],
        rows: [...family.rows],
      }));
  }

  function getVariantPreviewImageDataForBaseLut(baseLutId) {
    const families = getVariantFamilySummariesForBaseLut(baseLutId);
    const rows = families.flatMap((family) => family.rows);
    const width = registry.width || 0;
    if (width <= 0 || rows.length === 0) {
      return {
        width: 0,
        height: 0,
        data: new Uint8ClampedArray(0),
      };
    }
    const data = new Uint8ClampedArray(width * rows.length * 4);
    rows.forEach((row, index) => {
      data.set(getRenderLutRowRgba(registry, row), index * width * 4);
    });
    return {
      width,
      height: rows.length,
      data,
    };
  }

  function getSelectedSourceSnapshot(row = selectedRow) {
    const debug = getRenderLutDebugSnapshot(registry);
    const safeRow = clampSelectedRow(row);
    const id = safeRow >= 0 ? debug.rowIds[safeRow] || "" : "";
    const explicit = id && sourceDefinition.luts && sourceDefinition.luts[id];
    if (explicit && typeof explicit === "object") {
      return {
        id,
        row: safeRow,
        type: explicit.type === "grayscale-ramp" ? "grayscale-ramp" : "grayscale-ramp",
        editable: true,
        generated: false,
        stops: normalizeGrayscaleRampStops(explicit.stops),
      };
    }
    const variantMatch = id.match(/^(.*)\.variant\.(\d{2})$/);
    if (variantMatch) {
      return {
        id,
        row: safeRow,
        type: "grayscale-ramp",
        editable: false,
        generated: true,
        family: variantMatch[1],
        variantIndex: Number(variantMatch[2]),
        stops: [],
      };
    }
    return {
      id,
      row: safeRow,
      type: "unknown",
      editable: false,
      generated: false,
      stops: [],
    };
  }

  function patchExplicitLutStops(id, stops) {
    const lutId = typeof id === "string" ? id.trim() : "";
    if (!lutId || !sourceDefinition.luts || !sourceDefinition.luts[lutId]) {
      return { ok: false, error: "Unknown explicit LUT id." };
    }
    const nextSource = cloneJson(sourceDefinition);
    nextSource.luts[lutId] = {
      ...nextSource.luts[lutId],
      type: "grayscale-ramp",
      stops: normalizeGrayscaleRampStops(stops),
    };
    rebuild(nextSource);
    setSelectedRowById(lutId);
    return { ok: true, id: lutId, row: selectedRow };
  }

  function patchVariantFamilyForBaseLut(baseLutId, patch = {}) {
    const lutId = typeof baseLutId === "string" ? baseLutId.trim() : "";
    const luts = sourceDefinition.luts && typeof sourceDefinition.luts === "object" ? sourceDefinition.luts : {};
    if (!lutId || !luts[lutId]) {
      return { ok: false, error: "Unknown explicit LUT id." };
    }
    const variants = Array.isArray(sourceDefinition.variants) ? sourceDefinition.variants : [];
    const index = variants.findIndex((variant) => {
      const source = variant && typeof variant === "object" ? variant : {};
      return typeof source.baseLutId === "string" && source.baseLutId.trim() === lutId;
    });
    const nextSource = cloneJson(sourceDefinition);
    if (!Array.isArray(nextSource.variants)) nextSource.variants = [];
    const nextVariant = index >= 0 && nextSource.variants[index] && typeof nextSource.variants[index] === "object"
      ? nextSource.variants[index]
      : {};
    const family = typeof patch.family === "string" && patch.family.trim()
      ? patch.family.trim()
      : (typeof nextVariant.family === "string" && nextVariant.family.trim() ? nextVariant.family.trim() : lutId);
    const nextEntry = {
      ...nextVariant,
      family,
      baseLutId: lutId,
      type: "grayscale-ramp",
      count: Math.max(0, Math.min(100, Math.round(finiteOr(patch.count, finiteOr(nextVariant.count, 0))))),
      seed: Math.round(finiteOr(patch.seed, finiteOr(nextVariant.seed, 0))),
      positionJitter: Math.max(0, Math.round(finiteOr(patch.positionJitter, finiteOr(nextVariant.positionJitter, 0)))),
      brightnessJitter: Math.max(0, finiteOr(patch.brightnessJitter, finiteOr(nextVariant.brightnessJitter, 0))),
      colorJitter: Math.max(0, finiteOr(patch.colorJitter, finiteOr(nextVariant.colorJitter, 0))),
    };
    if (index >= 0) {
      nextSource.variants[index] = nextEntry;
    } else {
      nextSource.variants.push(nextEntry);
    }
    rebuild(nextSource);
    setSelectedRowById(lutId);
    return { ok: true, baseLutId: lutId, family, row: selectedRow };
  }

  function resetRuntimeEdits() {
    rebuild(initialSourceDefinition);
    return registry;
  }

  return {
    rebuild,
    getRegistry,
    getSourceDefinitionSnapshot,
    serializeSourceDefinition,
    getEditableLutSummaries,
    getDebugSnapshot,
    getSelectedRow,
    setSelectedRow,
    setSelectedRowById,
    resolveRows,
    getPreviewImageData,
    getVariantFamilySummariesForBaseLut,
    getVariantPreviewImageDataForBaseLut,
    getSelectedSourceSnapshot,
    patchExplicitLutStops,
    patchVariantFamilyForBaseLut,
    resetRuntimeEdits,
  };
}
