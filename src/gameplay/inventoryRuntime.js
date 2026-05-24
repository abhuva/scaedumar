import {
  addItemStack,
  canContainerAccept,
  createContainer,
  getContainerCapacity,
  moveItemStack,
  removeItemStack,
} from "./containerModel.js";

const PLAYER_CONTAINER_ID = "player_pack";
const NEARBY_DISTANCE_PX = 6;

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function distanceSq(ax, ay, bx, by) {
  const dx = finite(ax, 0) - finite(bx, 0);
  const dy = finite(ay, 0) - finite(by, 0);
  return dx * dx + dy * dy;
}

function createBundleId(index) {
  return `bundle_${String(index).padStart(3, "0")}`;
}

function createContainerId(bundleId) {
  return `container_${bundleId}`;
}

function normalizeSelection(selection) {
  if (!selection || typeof selection !== "object") return null;
  const containerId = typeof selection.containerId === "string" ? selection.containerId : "";
  const slotIndex = Math.floor(finite(selection.slotIndex, -1));
  if (!containerId || slotIndex < 0) return null;
  return { containerId, slotIndex };
}

export function createInventoryRuntime(deps = {}) {
  const itemRegistry = deps.itemRegistry || {};
  const runtime = {
    containers: new Map(),
    bundles: [],
    selected: null,
    openContainerId: null,
    nextBundleIndex: 1,
  };

  runtime.containers.set(PLAYER_CONTAINER_ID, createContainer({
    id: PLAYER_CONTAINER_ID,
    owner: "player",
    type: "personal",
    maxWeight: 25,
    maxBulk: 40,
  }));

  if (Array.isArray(deps.startingItems)) {
    const playerContainer = runtime.containers.get(PLAYER_CONTAINER_ID);
    for (const stack of deps.startingItems) {
      const itemId = stack && typeof stack.itemId === "string" ? stack.itemId : "";
      const quantity = Math.max(0, Math.floor(finite(stack && stack.quantity, 0)));
      if (!itemId || !itemRegistry[itemId]) continue;
      playerContainer.slots.push({ itemId, quantity });
    }
  }

  function getContainer(containerId) {
    const container = runtime.containers.get(containerId);
    return container ? clone(container) : null;
  }

  function setContainer(container) {
    runtime.containers.set(container.id, createContainer(container));
  }

  function listBundles() {
    return runtime.bundles.map((bundle) => clone(bundle));
  }

  function getNearbyBundle() {
    const player = deps.playerState || {};
    const maxDistSq = NEARBY_DISTANCE_PX * NEARBY_DISTANCE_PX;
    let best = null;
    let bestDistSq = Number.POSITIVE_INFINITY;
    for (const bundle of runtime.bundles) {
      const distSq = distanceSq(player.pixelX, player.pixelY, bundle.pixelX, bundle.pixelY);
      if (distSq <= maxDistSq && distSq < bestDistSq) {
        best = bundle;
        bestDistSq = distSq;
      }
    }
    return best ? clone(best) : null;
  }

  function removeBundleForContainer(containerId) {
    const index = runtime.bundles.findIndex((bundle) => bundle.containerId === containerId);
    if (index < 0) return false;
    const [bundle] = runtime.bundles.splice(index, 1);
    runtime.containers.delete(containerId);
    if (runtime.openContainerId === containerId) {
      runtime.openContainerId = null;
    }
    if (runtime.selected && runtime.selected.containerId === containerId) {
      runtime.selected = null;
    }
    if (deps.entityStore && typeof deps.entityStore.remove === "function") {
      deps.entityStore.remove(bundle.id);
    }
    return true;
  }

  function pruneEmptyBundle(containerId) {
    if (containerId === PLAYER_CONTAINER_ID) return false;
    const container = runtime.containers.get(containerId);
    if (!container || (Array.isArray(container.slots) && container.slots.length > 0)) {
      return false;
    }
    return removeBundleForContainer(containerId);
  }

  function getOpenContainerId() {
    const nearby = getNearbyBundle();
    if (nearby) {
      runtime.openContainerId = nearby.containerId;
      return nearby.containerId;
    }
    if (runtime.openContainerId !== null) {
      runtime.openContainerId = null;
    }
    return null;
  }

  function getSelectedStackDetails() {
    const selected = normalizeSelection(runtime.selected);
    if (!selected) return null;
    const container = runtime.containers.get(selected.containerId);
    const stack = container && container.slots[selected.slotIndex];
    if (!stack) return null;
    const item = itemRegistry[stack.itemId] || null;
    return {
      containerId: selected.containerId,
      slotIndex: selected.slotIndex,
      stack: clone(stack),
      item: item ? clone(item) : null,
      canUse: selected.containerId === PLAYER_CONTAINER_ID
        && Boolean(item && item.use)
        && Math.floor(finite(stack.quantity, 0)) > 0,
    };
  }

  function getSnapshot() {
    const playerContainer = getContainer(PLAYER_CONTAINER_ID);
    const openContainerId = getOpenContainerId();
    const openContainer = openContainerId ? getContainer(openContainerId) : null;
    return {
      playerContainerId: PLAYER_CONTAINER_ID,
      playerContainer,
      playerCapacity: getContainerCapacity(playerContainer, itemRegistry),
      openContainerId,
      openContainer,
      openCapacity: openContainer ? getContainerCapacity(openContainer, itemRegistry) : null,
      selected: runtime.selected ? { ...runtime.selected } : null,
      selectedDetails: getSelectedStackDetails(),
      bundles: listBundles(),
    };
  }

  function sync() {
    const snapshot = getSnapshot();
    if (typeof deps.setInventorySnapshot === "function") {
      deps.setInventorySnapshot(snapshot);
    }
    if (typeof deps.onInventorySnapshot === "function") {
      deps.onInventorySnapshot(snapshot);
    }
    if (typeof deps.requestOverlayDraw === "function") {
      deps.requestOverlayDraw();
    }
    return snapshot;
  }

  function addToPlayer(itemId, quantity) {
    const container = runtime.containers.get(PLAYER_CONTAINER_ID);
    const result = addItemStack(container, itemId, quantity, itemRegistry);
    if (!result.ok) return result;
    setContainer(result.container);
    sync();
    return result;
  }

  function fillTaggedPlayerContainer(tag, quantity) {
    const safeTag = typeof tag === "string" ? tag : "";
    const safeQuantity = Math.max(0, Math.floor(finite(quantity, 0)));
    if (!safeTag || safeQuantity <= 0) {
      return { ok: false, reason: "Invalid fill request.", filled: 0 };
    }
    const container = runtime.containers.get(PLAYER_CONTAINER_ID);
    const next = createContainer(container);
    let remaining = safeQuantity;
    let filled = 0;
    let targetName = "";
    for (const slot of next.slots) {
      const item = itemRegistry[slot.itemId];
      if (!item || !Array.isArray(item.tags) || !item.tags.includes(safeTag)) continue;
      const maxStack = Math.max(1, Math.floor(finite(item.maxStack, 1)));
      const current = Math.max(0, Math.floor(finite(slot.quantity, 0)));
      const room = Math.max(0, maxStack - current);
      if (room <= 0) continue;
      let moved = Math.min(room, remaining);
      while (moved > 0 && !canContainerAccept(next, slot.itemId, moved, itemRegistry).ok) {
        moved -= 1;
      }
      if (moved <= 0) continue;
      slot.quantity = current + moved;
      remaining -= moved;
      filled += moved;
      targetName = item.name || slot.itemId;
      if (remaining <= 0) break;
    }
    if (filled <= 0) {
      const hasContainer = next.slots.some((slot) => {
        const item = itemRegistry[slot.itemId];
        return item && Array.isArray(item.tags) && item.tags.includes(safeTag);
      });
      return {
        ok: false,
        reason: hasContainer ? "No container capacity." : "No matching container.",
        filled: 0,
      };
    }
    setContainer(next);
    sync();
    return {
      ok: true,
      filled,
      itemName: targetName || safeTag,
    };
  }

  function selectStack(containerId, slotIndex) {
    const container = runtime.containers.get(containerId);
    if (!container || slotIndex < 0 || slotIndex >= container.slots.length) {
      runtime.selected = null;
      sync();
      return { ok: false, reason: "Invalid selection." };
    }
    runtime.selected = { containerId, slotIndex };
    sync();
    return { ok: true };
  }

  function clearSelection() {
    runtime.selected = null;
    sync();
  }

  function dropSelectedBundle() {
    const selected = normalizeSelection(runtime.selected);
    if (!selected || selected.containerId !== PLAYER_CONTAINER_ID) {
      return { ok: false, reason: "Select a carried stack to drop." };
    }
    const source = runtime.containers.get(PLAYER_CONTAINER_ID);
    const slot = source && source.slots[selected.slotIndex];
    if (!slot) return { ok: false, reason: "Selected stack no longer exists." };
    const removed = removeItemStack(source, selected.slotIndex, slot.quantity);
    if (!removed.ok) return removed;

    const bundleId = createBundleId(runtime.nextBundleIndex);
    runtime.nextBundleIndex += 1;
    const containerId = createContainerId(bundleId);
    const target = createContainer({
      id: containerId,
      owner: bundleId,
      type: "bundle",
      maxWeight: 999,
      maxBulk: 999,
    });
    const added = addItemStack(target, removed.removed.itemId, removed.removed.quantity, itemRegistry);
    if (!added.ok) return added;

    setContainer(removed.container);
    setContainer(added.container);
    const player = deps.playerState || {};
    const bundle = {
      id: bundleId,
      type: "container",
      pixelX: Math.round(finite(player.pixelX, 0)),
      pixelY: Math.round(finite(player.pixelY, 0)),
      containerId,
      icon: "bundle",
    };
    runtime.bundles.push(bundle);
    if (deps.entityStore && typeof deps.entityStore.upsert === "function") {
      deps.entityStore.upsert(bundle);
    }
    runtime.selected = null;
    runtime.openContainerId = containerId;
    sync();
    return { ok: true, bundle: clone(bundle), moved: removed.removed };
  }

  function moveSelectedTo(containerId) {
    const selected = normalizeSelection(runtime.selected);
    if (!selected || !containerId || selected.containerId === containerId) {
      return { ok: false, reason: "Select a stack and a different target." };
    }
    const source = runtime.containers.get(selected.containerId);
    const target = runtime.containers.get(containerId);
    const slot = source && source.slots[selected.slotIndex];
    if (!source || !target || !slot) {
      return { ok: false, reason: "Selected stack no longer exists." };
    }
    const result = moveItemStack(source, target, selected.slotIndex, slot.quantity, itemRegistry);
    if (!result.ok) return result;
    setContainer(result.source);
    setContainer(result.target);
    runtime.selected = null;
    pruneEmptyBundle(selected.containerId);
    sync();
    return result;
  }

  function moveSelectedToPlayer() {
    return moveSelectedTo(PLAYER_CONTAINER_ID);
  }

  function moveSelectedToOpenContainer() {
    const openContainerId = getOpenContainerId();
    if (!openContainerId) return { ok: false, reason: "No nearby bundle." };
    return moveSelectedTo(openContainerId);
  }

  function useSelectedItem() {
    const selected = normalizeSelection(runtime.selected);
    if (!selected || selected.containerId !== PLAYER_CONTAINER_ID) {
      return { ok: false, reason: "Select a carried usable item." };
    }
    const source = runtime.containers.get(PLAYER_CONTAINER_ID);
    const slot = source && source.slots[selected.slotIndex];
    const item = slot && itemRegistry[slot.itemId];
    if (!slot || !item) {
      return { ok: false, reason: "Selected stack no longer exists." };
    }
    if (Math.floor(finite(slot.quantity, 0)) <= 0) {
      return { ok: false, reason: `${item.name || slot.itemId} is empty.` };
    }
    if (!item.use) {
      return { ok: false, reason: `${item.name || slot.itemId} cannot be used yet.` };
    }
    if (typeof deps.applyItemUse === "function") {
      const useResult = deps.applyItemUse({
        itemId: slot.itemId,
        item,
        effects: item.use.effects || {},
      });
      if (useResult && useResult.ok === false) {
        return useResult;
      }
    }
    const removed = removeItemStack(source, selected.slotIndex, 1, { keepEmpty: item.keepWhenEmpty });
    if (!removed.ok) return removed;
    setContainer(removed.container);
    const nextSource = runtime.containers.get(PLAYER_CONTAINER_ID);
    if (!nextSource || !nextSource.slots[selected.slotIndex]) {
      runtime.selected = null;
    }
    sync();
    return {
      ok: true,
      itemName: item.name || slot.itemId,
      actionLabel: item.use.label || "Use",
    };
  }

  sync();

  return {
    getSnapshot,
    getContainer,
    listBundles,
    getNearbyBundle,
    addToPlayer,
    fillTaggedPlayerContainer,
    selectStack,
    clearSelection,
    dropSelectedBundle,
    moveSelectedToPlayer,
    moveSelectedToOpenContainer,
    useSelectedItem,
    sync,
  };
}

export { PLAYER_CONTAINER_ID };
