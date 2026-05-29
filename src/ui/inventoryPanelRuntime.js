import { PLAYER_CONTAINER_ID } from "../gameplay/inventoryRuntime.js";

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1) : "0.0";
}

function getItemName(itemId, itemRegistry) {
  return (itemRegistry[itemId] && itemRegistry[itemId].name) || itemId;
}

function createStackButton(document, stack, containerId, slotIndex, snapshot, itemRegistry) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "inventory-stack-btn";
  const selected = snapshot.selected
    && snapshot.selected.containerId === containerId
    && snapshot.selected.slotIndex === slotIndex;
  button.classList.toggle("selected", Boolean(selected));
  button.dataset.containerId = containerId;
  button.dataset.slotIndex = String(slotIndex);

  const icon = document.createElement("span");
  icon.className = "inventory-stack-icon";
  icon.textContent = getItemName(stack.itemId, itemRegistry).slice(0, 2).toUpperCase();
  const label = document.createElement("span");
  label.className = "inventory-stack-label";
  label.textContent = getItemName(stack.itemId, itemRegistry);
  const qty = document.createElement("span");
  qty.className = "inventory-stack-qty";
  qty.textContent = `x${Math.max(0, Math.round(Number(stack.quantity) || 0))}`;

  button.append(icon, label, qty);
  return button;
}

function renderContainer(document, listEl, container, snapshot, itemRegistry) {
  listEl.replaceChildren();
  if (!container || !Array.isArray(container.slots) || container.slots.length === 0) {
    const empty = document.createElement("p");
    empty.className = "inventory-empty";
    empty.textContent = "Empty";
    listEl.append(empty);
    return;
  }
  container.slots.forEach((stack, index) => {
    listEl.append(createStackButton(document, stack, container.id, index, snapshot, itemRegistry));
  });
}

function renderCapacity(el, capacity) {
  if (!el) return;
  if (!capacity) {
    el.textContent = "--";
    return;
  }
  el.textContent = `${formatNumber(capacity.weight)}/${formatNumber(capacity.maxWeight)} wt | ${formatNumber(capacity.bulk)}/${formatNumber(capacity.maxBulk)} bulk`;
}

function renderSelectedDetails(deps, snapshot) {
  const details = snapshot && snapshot.selectedDetails;
  const item = details && details.item;
  const stack = details && details.stack;
  if (!item || !stack) {
    deps.selectedNameEl.textContent = "No item selected";
    deps.selectedDescriptionEl.textContent = "Select an item stack to inspect it.";
    deps.selectedStatsEl.textContent = "Weight: -- | Bulk: -- | Tags: --";
    return;
  }
  const tags = Array.isArray(item.tags) && item.tags.length ? item.tags.join(", ") : "--";
  deps.selectedNameEl.textContent = `${item.name || stack.itemId} x${Math.max(0, Math.round(Number(stack.quantity) || 0))}`;
  deps.selectedDescriptionEl.textContent = item.description || "No description.";
  deps.selectedStatsEl.textContent = `Weight: ${formatNumber(item.weight)} | Bulk: ${formatNumber(item.bulk)} | Tags: ${tags}`;
}

export function createInventoryPanelRuntime(deps) {
  const itemRegistry = deps.itemRegistry || {};
  let visible = false;
  let lastSnapshot = null;

  function updateActionState(snapshot) {
    const selected = snapshot && snapshot.selected;
    const selectedPlayer = selected && selected.containerId === PLAYER_CONTAINER_ID;
    const selectedOpen = selected && snapshot.openContainerId && selected.containerId === snapshot.openContainerId;
    const canUse = Boolean(snapshot && snapshot.selectedDetails && snapshot.selectedDetails.canUse);
    deps.useBtn.disabled = !canUse;
    if (canUse && snapshot.selectedDetails.item && snapshot.selectedDetails.item.use) {
      deps.useBtn.textContent = snapshot.selectedDetails.item.use.label || "Use Selected";
    } else {
      deps.useBtn.textContent = "Use Selected";
    }
    deps.dropBundleBtn.disabled = !selectedPlayer;
    deps.moveToBundleBtn.disabled = !selectedPlayer || !snapshot.openContainerId;
    deps.moveToPlayerBtn.disabled = !selectedOpen;
  }

  function sync(snapshot = null) {
    lastSnapshot = snapshot || (typeof deps.getInventorySnapshot === "function" ? deps.getInventorySnapshot() : null);
    const safeSnapshot = lastSnapshot || {};
    deps.panelEl.classList.toggle("hidden", !visible);
    renderContainer(deps.document, deps.playerListEl, safeSnapshot.playerContainer, safeSnapshot, itemRegistry);
    renderContainer(deps.document, deps.openListEl, safeSnapshot.openContainer, safeSnapshot, itemRegistry);
    renderCapacity(deps.playerCapacityEl, safeSnapshot.playerCapacity);
    renderCapacity(deps.openCapacityEl, safeSnapshot.openCapacity);
    renderSelectedDetails(deps, safeSnapshot);
    deps.openTitleEl.textContent = safeSnapshot.openContainer ? "Nearby Bundle" : "Nearby Bundle";
    deps.openHintEl.textContent = safeSnapshot.openContainer ? "Select a stack to move it." : "No nearby bundle.";
    updateActionState(safeSnapshot);
  }

  function toggle() {
    setVisible(!visible);
  }

  function bindList(listEl) {
    listEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      const button = target.closest(".inventory-stack-btn");
      if (!button) return;
      deps.selectInventoryStack(button.dataset.containerId, Number(button.dataset.slotIndex));
    });
  }

  if (deps.toggleBtn) {
    deps.toggleBtn.addEventListener("click", toggle);
  }
  deps.closeBtn.addEventListener("click", () => {
    visible = false;
    sync();
  });
  deps.dropBundleBtn.addEventListener("click", () => {
    const result = deps.dropSelectedBundle();
    deps.setStatus(result.ok ? "Dropped selected stack into a bundle." : result.reason);
  });
  deps.useBtn.addEventListener("click", () => {
    const result = deps.useSelectedItem();
    deps.setStatus(result.ok ? `${result.actionLabel || "Used"} ${result.itemName}.` : result.reason);
  });
  deps.moveToBundleBtn.addEventListener("click", () => {
    const result = deps.moveSelectedToOpenContainer();
    deps.setStatus(result.ok ? "Moved selected stack to nearby bundle." : result.reason);
  });
  deps.moveToPlayerBtn.addEventListener("click", () => {
    const result = deps.moveSelectedToPlayer();
    deps.setStatus(result.ok ? "Moved selected stack to player pack." : result.reason);
  });
  bindList(deps.playerListEl);
  bindList(deps.openListEl);
  sync();

  return {
    sync,
    isVisible: () => visible,
    setVisible: (nextVisible, reason = "inventory-visibility") => {
      const shouldShow = Boolean(nextVisible);
      if (shouldShow && reason !== "side-dock-open" && deps.requestOpen && deps.requestOpen() === false) return false;
      visible = shouldShow;
      sync(lastSnapshot);
      return true;
    },
  };
}
