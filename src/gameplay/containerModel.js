function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeQuantity(value) {
  return Math.max(0, Math.floor(finite(value, 0)));
}

export function createContainer(input = {}) {
  return {
    id: String(input.id || "container"),
    owner: String(input.owner || "world"),
    type: String(input.type || "generic"),
    slots: Array.isArray(input.slots)
      ? input.slots.map((slot) => ({
        ...(slot && typeof slot === "object" ? clone(slot) : {}),
        itemId: slot && typeof slot.itemId === "string" ? slot.itemId : "",
        quantity: normalizeQuantity(slot && slot.quantity),
      }))
      : [],
    maxWeight: Math.max(0, finite(input.maxWeight, 0)),
    maxBulk: Math.max(0, finite(input.maxBulk, 0)),
  };
}

export function getStackKey(stack) {
  return stack && typeof stack.itemId === "string" ? stack.itemId : "";
}

export function getContainerTotals(container, itemRegistry) {
  const totals = {
    weight: 0,
    bulk: 0,
  };
  const slots = Array.isArray(container && container.slots) ? container.slots : [];
  for (const slot of slots) {
    const item = itemRegistry && itemRegistry[slot.itemId];
    if (!item) continue;
    const quantity = normalizeQuantity(slot.quantity);
    totals.weight += finite(item.weight, 0) * quantity;
    totals.bulk += finite(item.bulk, 0) * quantity;
  }
  return totals;
}

export function getContainerCapacity(container, itemRegistry) {
  const totals = getContainerTotals(container, itemRegistry);
  return {
    weight: totals.weight,
    bulk: totals.bulk,
    maxWeight: Math.max(0, finite(container && container.maxWeight, 0)),
    maxBulk: Math.max(0, finite(container && container.maxBulk, 0)),
  };
}

export function canContainerAccept(container, itemId, quantity, itemRegistry) {
  const item = itemRegistry && itemRegistry[itemId];
  const safeQuantity = normalizeQuantity(quantity);
  if (!item || safeQuantity <= 0) {
    return { ok: false, reason: "Invalid item." };
  }
  const totals = getContainerTotals(container, itemRegistry);
  const nextWeight = totals.weight + finite(item.weight, 0) * safeQuantity;
  const nextBulk = totals.bulk + finite(item.bulk, 0) * safeQuantity;
  const maxWeight = Math.max(0, finite(container && container.maxWeight, 0));
  const maxBulk = Math.max(0, finite(container && container.maxBulk, 0));
  if (maxWeight > 0 && nextWeight > maxWeight + 1e-9) {
    return { ok: false, reason: "Too heavy." };
  }
  if (maxBulk > 0 && nextBulk > maxBulk + 1e-9) {
    return { ok: false, reason: "Too bulky." };
  }
  return { ok: true };
}

export function addItemStack(container, itemId, quantity, itemRegistry) {
  const safeQuantity = normalizeQuantity(quantity);
  const item = itemRegistry && itemRegistry[itemId];
  if (!item || safeQuantity <= 0) {
    return { ok: false, reason: "Invalid item.", container: createContainer(container) };
  }
  const capacity = canContainerAccept(container, itemId, safeQuantity, itemRegistry);
  if (!capacity.ok) {
    return { ...capacity, container: createContainer(container) };
  }
  const next = createContainer(container);
  let remaining = safeQuantity;
  const maxStack = Math.max(1, normalizeQuantity(item.maxStack || safeQuantity));
  if (item.stackable !== false) {
    for (const slot of next.slots) {
      if (slot.itemId !== itemId) continue;
      const current = normalizeQuantity(slot.quantity);
      const room = Math.max(0, maxStack - current);
      if (room <= 0) continue;
      const moved = Math.min(room, remaining);
      slot.quantity = current + moved;
      remaining -= moved;
      if (remaining <= 0) break;
    }
  }
  while (remaining > 0) {
    const moved = item.stackable === false ? 1 : Math.min(maxStack, remaining);
    next.slots.push({ itemId, quantity: moved });
    remaining -= moved;
  }
  return { ok: true, container: next };
}

export function removeItemStack(container, slotIndex, quantity, options = {}) {
  const next = createContainer(container);
  const index = Math.floor(finite(slotIndex, -1));
  if (index < 0 || index >= next.slots.length) {
    return { ok: false, reason: "Invalid slot.", container: next, removed: null };
  }
  const slot = next.slots[index];
  const safeQuantity = Math.min(normalizeQuantity(quantity), normalizeQuantity(slot.quantity));
  if (safeQuantity <= 0) {
    return { ok: false, reason: "Invalid quantity.", container: next, removed: null };
  }
  const removed = {
    itemId: slot.itemId,
    quantity: safeQuantity,
  };
  slot.quantity = normalizeQuantity(slot.quantity) - safeQuantity;
  if (slot.quantity <= 0) {
    if (options.keepEmpty) {
      slot.quantity = 0;
    } else {
      next.slots.splice(index, 1);
    }
  }
  return { ok: true, container: next, removed };
}

export function moveItemStack(source, target, slotIndex, quantity, itemRegistry) {
  const removedResult = removeItemStack(source, slotIndex, quantity);
  if (!removedResult.ok) {
    return {
      ok: false,
      reason: removedResult.reason,
      source: createContainer(source),
      target: createContainer(target),
    };
  }
  const addResult = addItemStack(
    target,
    removedResult.removed.itemId,
    removedResult.removed.quantity,
    itemRegistry,
  );
  if (!addResult.ok) {
    return {
      ok: false,
      reason: addResult.reason,
      source: createContainer(source),
      target: createContainer(target),
    };
  }
  return {
    ok: true,
    source: removedResult.container,
    target: addResult.container,
    moved: removedResult.removed,
  };
}
