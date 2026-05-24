function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, finite(value, 0)));
}

function channelOffset(channel) {
  if (channel === "g") return 1;
  if (channel === "b") return 2;
  if (channel === "a") return 3;
  return 0;
}

export function sampleResourceMapValue(imageData, x, y, channel = "r") {
  if (!imageData || !imageData.data || !imageData.width || !imageData.height) return 0;
  const px = Math.max(0, Math.min(imageData.width - 1, Math.round(finite(x, 0))));
  const py = Math.max(0, Math.min(imageData.height - 1, Math.round(finite(y, 0))));
  const idx = (py * imageData.width + px) * 4 + channelOffset(channel);
  return clamp01((imageData.data[idx] || 0) / 255);
}

export function computeResourceSearchChance(search, value) {
  if (!search) return 0;
  const wetness = clamp01(value);
  const threshold = clamp01(search.threshold);
  const denominator = Math.max(0.0001, 1 - threshold);
  const normalized = clamp01((wetness - threshold) / denominator);
  const shaped = Math.pow(normalized, Math.max(0.001, finite(search.curve, 1)));
  const rawChance = finite(search.baseChance, 0) + shaped * finite(search.chanceScale, 0);
  return Math.max(0, Math.min(finite(search.maxChance, 1), rawChance));
}

export function computeResourceMovementBias(search, value) {
  if (!search) return 1;
  return 1 + clamp01(value) * finite(search.movementBias, 0);
}

export function chooseWeightedLootEntry(entries, random = Math.random) {
  const candidates = Array.isArray(entries) ? entries : [];
  let total = 0;
  for (const entry of candidates) {
    total += Math.max(0, finite(entry && entry.weight, 0));
  }
  if (total <= 0) return null;
  let pick = (typeof random === "function" ? random() : Math.random()) * total;
  for (const entry of candidates) {
    pick -= Math.max(0, finite(entry && entry.weight, 0));
    if (pick <= 0) return { ...entry };
  }
  return candidates.length ? { ...candidates[candidates.length - 1] } : null;
}

export function createResourceSearchRuntime(deps = {}) {
  const searches = deps.resourceSearches || {};

  function getSearch(resourceId) {
    return searches && searches[resourceId] ? searches[resourceId] : null;
  }

  function sample(resourceId, x, y) {
    const search = getSearch(resourceId);
    if (!search) return 0;
    const imageData = typeof deps.getResourceMapImageData === "function"
      ? deps.getResourceMapImageData(search.map)
      : null;
    return sampleResourceMapValue(imageData, x, y, search.channel);
  }

  function hasMap(resourceId) {
    const search = getSearch(resourceId);
    if (!search) return false;
    const imageData = typeof deps.getResourceMapImageData === "function"
      ? deps.getResourceMapImageData(search.map)
      : null;
    return Boolean(imageData && imageData.data && imageData.width && imageData.height);
  }

  function chance(resourceId, x, y) {
    const search = getSearch(resourceId);
    if (!search) return 0;
    if (!hasMap(resourceId)) return 0;
    const stockFactor = typeof deps.getResourceStockFactor === "function"
      ? clamp01(deps.getResourceStockFactor(resourceId, x, y))
      : 1;
    return computeResourceSearchChance(search, sample(resourceId, x, y)) * stockFactor;
  }

  function movementBias(resourceId, x, y) {
    const search = getSearch(resourceId);
    if (!search) return 1;
    const stockFactor = typeof deps.getResourceStockFactor === "function"
      ? clamp01(deps.getResourceStockFactor(resourceId, x, y))
      : 1;
    return computeResourceMovementBias(search, sample(resourceId, x, y) * stockFactor);
  }

  function getReward(resourceId) {
    const search = getSearch(resourceId);
    return search && search.reward ? { ...search.reward } : null;
  }

  function getRewardBand(reward, x, y) {
    if (!reward || reward.type !== "lootTable") return 0;
    if (!reward.bandMap) return Math.max(0, Math.min(255, Math.round(finite(reward.defaultBand, 0))));
    const imageData = typeof deps.getResourceMapImageData === "function"
      ? deps.getResourceMapImageData(reward.bandMap)
      : null;
    if (!imageData) return Math.max(0, Math.min(255, Math.round(finite(reward.defaultBand, 0))));
    return Math.max(0, Math.min(255, Math.round(sampleResourceMapValue(imageData, x, y, reward.bandChannel) * 255)));
  }

  function resolveReward(resourceId, x, y, options = {}) {
    const search = getSearch(resourceId);
    const reward = search && search.reward ? search.reward : null;
    if (!reward) return null;
    if (reward.type === "item") {
      return { ...reward };
    }
    if (reward.type === "fillContainer") {
      const sampleValue = reward.scaleBy === "chance" ? chance(resourceId, x, y) : sample(resourceId, x, y);
      const t = clamp01(sampleValue);
      const minQuantity = Math.max(1, Math.round(finite(reward.minQuantity, 1)));
      const maxQuantity = Math.max(minQuantity, Math.round(finite(reward.maxQuantity, minQuantity)));
      const quantity = Math.max(minQuantity, Math.min(maxQuantity, Math.round(minQuantity + (maxQuantity - minQuantity) * t)));
      return {
        type: "fillContainer",
        tag: reward.tag,
        quantity,
      };
    }
    if (reward.type === "lootTable") {
      const band = getRewardBand(reward, x, y);
      const bands = reward.bands || {};
      const entries = bands[String(band)] || bands[String(reward.defaultBand)] || [];
      const entry = chooseWeightedLootEntry(entries, options.random || deps.random || Math.random);
      if (!entry) return null;
      return {
        type: "item",
        itemId: entry.itemId,
        quantity: entry.quantity,
        band,
      };
    }
    return null;
  }

  function getRequiredMapNames() {
    const names = [];
    for (const search of Object.values(searches)) {
      if (search && search.map) names.push(search.map);
      if (search && search.reward && search.reward.type === "lootTable" && search.reward.bandMap) {
        names.push(search.reward.bandMap);
      }
    }
    return [...new Set(names.filter(Boolean))];
  }

  return {
    getSearch,
    sample,
    hasMap,
    chance,
    movementBias,
    getReward,
    resolveReward,
    getRequiredMapNames,
  };
}
