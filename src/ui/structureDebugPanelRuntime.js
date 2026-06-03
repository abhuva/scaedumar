import { buildStructureOccupancyOverlayCells, buildStructurePlacementPreviewCells } from "./overlays/structureOccupancyOverlay.js";

function finiteOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatPixel(value) {
  return String(Math.floor(finiteOr(value, 0)));
}

function getSnapshot(deps) {
  return typeof deps.getStructureSnapshot === "function"
    ? deps.getStructureSnapshot()
    : { types: [], structures: [] };
}

function findStructure(snapshot, id) {
  const structures = Array.isArray(snapshot.structures) ? snapshot.structures : [];
  return structures.find((structure) => structure.id === id) || null;
}

function findType(snapshot, id) {
  const types = Array.isArray(snapshot.types) ? snapshot.types : [];
  return types.find((type) => type.id === id) || null;
}

function nearestByType(snapshot, typeId, point) {
  const structures = Array.isArray(snapshot.structures) ? snapshot.structures : [];
  let best = null;
  for (const structure of structures) {
    if (typeId && structure.type !== typeId) continue;
    const type = findType(snapshot, structure.type);
    const footprint = type && type.footprint ? type.footprint : { width: 1, height: 1 };
    const centerX = finiteOr(structure.pixelX, 0) + Math.max(1, finiteOr(footprint.width, 1)) * 0.5;
    const centerY = finiteOr(structure.pixelY, 0) + Math.max(1, finiteOr(footprint.height, 1)) * 0.5;
    const dx = centerX - point.x;
    const dy = centerY - point.y;
    const distanceSq = dx * dx + dy * dy;
    if (!best || distanceSq < best.distanceSq) {
      best = { structure, distanceSq };
    }
  }
  return best ? best.structure : null;
}

export function createStructureDebugPanelRuntime(deps) {
  let selectedId = "";
  let hoverPixel = null;

  function isPanelActive() {
    if (!deps.panelEl || typeof deps.panelEl.getAttribute !== "function") return true;
    return deps.panelEl.getAttribute("aria-hidden") !== "true";
  }

  function getSelectedTypeId(snapshot = getSnapshot(deps)) {
    const selectedValue = deps.typeSelect ? deps.typeSelect.value : "";
    if (selectedValue && findType(snapshot, selectedValue)) return selectedValue;
    const firstType = Array.isArray(snapshot.types) ? snapshot.types[0] : null;
    return firstType ? firstType.id : "";
  }

  function getPlayerPixel() {
    if (typeof deps.getPlayerPixel === "function") {
      const pixel = deps.getPlayerPixel() || {};
      return {
        x: Math.floor(finiteOr(pixel.x, 0)),
        y: Math.floor(finiteOr(pixel.y, 0)),
      };
    }
    return { x: 0, y: 0 };
  }

  function syncTypeOptions(snapshot) {
    if (!deps.typeSelect) return;
    const documentRef = deps.document || deps.typeSelect.ownerDocument;
    const previous = deps.typeSelect.value;
    const types = Array.isArray(snapshot.types) ? snapshot.types : [];
    deps.typeSelect.textContent = "";
    for (const type of types) {
      const option = documentRef.createElement("option");
      option.value = type.id;
      option.textContent = type.name && type.name !== type.id ? `${type.name} (${type.id})` : type.id;
      deps.typeSelect.appendChild(option);
    }
    if (types.some((type) => type.id === previous)) {
      deps.typeSelect.value = previous;
    } else if (types[0]) {
      deps.typeSelect.value = types[0].id;
    }
  }

  function sync() {
    const snapshot = getSnapshot(deps);
    syncTypeOptions(snapshot);
    if (selectedId && !findStructure(snapshot, selectedId)) {
      selectedId = "";
    }
    const selected = selectedId ? findStructure(snapshot, selectedId) : null;
    const selectedType = selected ? findType(snapshot, selected.type) : null;
    const structures = Array.isArray(snapshot.structures) ? snapshot.structures : [];
    const types = Array.isArray(snapshot.types) ? snapshot.types : [];
    if (deps.selectedValue) {
      deps.selectedValue.textContent = selected
        ? `${selected.id} | ${selected.type} @ ${formatPixel(selected.pixelX)}, ${formatPixel(selected.pixelY)}`
        : "None";
    }
    if (deps.readout) {
      const occupiedCells = selected && typeof deps.getOccupiedCells === "function"
        ? deps.getOccupiedCells(selected.id).length
        : 0;
      const footprint = selectedType && selectedType.footprint
        ? `${selectedType.footprint.width}x${selectedType.footprint.height}`
        : "--";
      deps.readout.textContent = selected
        ? `Structures: ${structures.length} | Types: ${types.length} | Footprint: ${footprint} | Cells: ${occupiedCells}`
        : `Structures: ${structures.length} | Types: ${types.length}`;
    }
  }

  function select(id) {
    selectedId = typeof id === "string" ? id : "";
    deps.requestOverlayDraw?.();
    sync();
  }

  function trySelectAtPixel(pixelX, pixelY) {
    if (!isPanelActive()) return false;
    const id = typeof deps.getStructureIdAt === "function"
      ? deps.getStructureIdAt(pixelX, pixelY)
      : "";
    if (!id) return false;
    selectedId = id || "";
    deps.setStatus?.(`Selected structure ${id}.`);
    deps.requestOverlayDraw?.();
    sync();
    return true;
  }

  function updatePlacementHover(pixel) {
    if (!isPlaceModeActive()) return false;
    if (!pixel || !Number.isFinite(Number(pixel.x)) || !Number.isFinite(Number(pixel.y))) {
      hoverPixel = null;
      deps.requestOverlayDraw?.();
      return true;
    }
    const next = {
      x: Math.floor(finiteOr(pixel.x, 0)),
      y: Math.floor(finiteOr(pixel.y, 0)),
    };
    if (hoverPixel && hoverPixel.x === next.x && hoverPixel.y === next.y) return true;
    hoverPixel = next;
    deps.requestOverlayDraw?.();
    return true;
  }

  function clearPlacementHover() {
    if (!hoverPixel) return;
    hoverPixel = null;
    deps.requestOverlayDraw?.();
  }

  function placeAtPlayer() {
    const snapshot = getSnapshot(deps);
    const typeId = getSelectedTypeId(snapshot);
    if (!typeId) {
      deps.setStatus?.("No structure type available.");
      sync();
      return { ok: false, reason: "No structure type available." };
    }
    const pixel = getPlayerPixel();
    const result = deps.dispatchCommand?.({
      type: "structure/place",
      structureType: typeId,
      pixelX: pixel.x,
      pixelY: pixel.y,
    }) || { ok: false, reason: "Command dispatcher is unavailable." };
    if (result.ok && result.structure && result.structure.id) {
      selectedId = result.structure.id;
    }
    deps.requestOverlayDraw?.();
    sync();
    return result;
  }

  function selectNearest() {
    const snapshot = getSnapshot(deps);
    const typeId = getSelectedTypeId(snapshot);
    const pixel = getPlayerPixel();
    const nearest = typeof deps.getNearestStructureByType === "function"
      ? deps.getNearestStructureByType(typeId, pixel.x, pixel.y)
      : nearestByType(snapshot, typeId, pixel);
    selectedId = nearest ? nearest.id : "";
    if (!nearest) {
      deps.setStatus?.("No nearby structure found for selected type.");
    }
    deps.requestOverlayDraw?.();
    sync();
    return nearest;
  }

  function removeSelected() {
    if (!selectedId) {
      deps.setStatus?.("No structure selected.");
      sync();
      return { ok: false, reason: "No structure selected." };
    }
    const result = deps.dispatchCommand?.({
      type: "structure/remove",
      id: selectedId,
    }) || { ok: false, reason: "Command dispatcher is unavailable." };
    if (result.ok) selectedId = "";
    deps.requestOverlayDraw?.();
    sync();
    return result;
  }

  function getOccupancyOverlaySnapshot() {
    const enabled = deps.showOccupancyToggle && deps.showOccupancyToggle.checked === true;
    if (!enabled) return null;
    const snapshot = getSnapshot(deps);
    return {
      enabled: true,
      selectedId,
      cells: buildStructureOccupancyOverlayCells(snapshot, selectedId),
    };
  }

  function isPlaceModeActive() {
    return isPanelActive() && deps.placeModeToggle && deps.placeModeToggle.checked === true;
  }

  function getPlacementPreviewOverlaySnapshot() {
    if (!isPlaceModeActive() || !hoverPixel) return null;
    const snapshot = getSnapshot(deps);
    const typeId = getSelectedTypeId(snapshot);
    if (!typeId) return null;
    const placement = typeof deps.canPlaceStructure === "function"
      ? deps.canPlaceStructure(typeId, hoverPixel.x, hoverPixel.y)
      : { ok: false, reason: "Placement validation unavailable." };
    return {
      enabled: true,
      typeId,
      pixel: { ...hoverPixel },
      ok: placement.ok === true,
      reason: placement.reason || "",
      cells: buildStructurePlacementPreviewCells({
        snapshot,
        typeId,
        pixelX: hoverPixel.x,
        pixelY: hoverPixel.y,
        placement,
      }),
    };
  }

  function tryPlaceAtPixel(pixelX, pixelY) {
    if (!isPlaceModeActive()) return false;
    const snapshot = getSnapshot(deps);
    const typeId = getSelectedTypeId(snapshot);
    if (!typeId) {
      deps.setStatus?.("No structure type available.");
      sync();
      return true;
    }
    const x = Math.floor(finiteOr(pixelX, 0));
    const y = Math.floor(finiteOr(pixelY, 0));
    hoverPixel = { x, y };
    const placement = typeof deps.canPlaceStructure === "function"
      ? deps.canPlaceStructure(typeId, x, y)
      : { ok: false, reason: "Placement validation unavailable." };
    if (!placement.ok) {
      deps.setStatus?.(placement.reason || "Structure placement blocked.");
      deps.requestOverlayDraw?.();
      sync();
      return true;
    }
    const result = deps.dispatchCommand?.({
      type: "structure/place",
      structureType: typeId,
      pixelX: x,
      pixelY: y,
    }) || { ok: false, reason: "Command dispatcher is unavailable." };
    if (result.ok && result.structure && result.structure.id) {
      selectedId = result.structure.id;
    }
    deps.requestOverlayDraw?.();
    sync();
    return true;
  }

  function isRenderVisible() {
    return !deps.renderVisibleToggle || deps.renderVisibleToggle.checked !== false;
  }

  deps.typeSelect?.addEventListener("change", sync);
  deps.showOccupancyToggle?.addEventListener("change", () => {
    deps.requestOverlayDraw?.();
    sync();
  });
  deps.renderVisibleToggle?.addEventListener("change", () => {
    deps.setStatus?.(isRenderVisible() ? "Structure rendering visible." : "Structure rendering hidden.");
    deps.requestOverlayDraw?.();
    sync();
  });
  deps.placeModeToggle?.addEventListener("change", () => {
    if (!isPlaceModeActive()) hoverPixel = null;
    deps.setStatus?.(isPlaceModeActive() ? "Structure place mode enabled." : "Structure place mode disabled.");
    deps.requestOverlayDraw?.();
    sync();
  });
  deps.placeAtPlayerBtn?.addEventListener("click", placeAtPlayer);
  deps.selectNearestBtn?.addEventListener("click", selectNearest);
  deps.removeSelectedBtn?.addEventListener("click", removeSelected);
  deps.refreshBtn?.addEventListener("click", sync);

  sync();

  return {
    sync,
    select,
    getSelectedId: () => selectedId,
    trySelectAtPixel,
    tryPlaceAtPixel,
    updatePlacementHover,
    clearPlacementHover,
    isRenderVisible,
    isPlaceModeActive,
    placeAtPlayer,
    selectNearest,
    removeSelected,
    getOccupancyOverlaySnapshot,
    getPlacementPreviewOverlaySnapshot,
  };
}
