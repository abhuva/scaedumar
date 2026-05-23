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
    return computeResourceSearchChance(search, sample(resourceId, x, y));
  }

  function movementBias(resourceId, x, y) {
    const search = getSearch(resourceId);
    if (!search) return 1;
    return computeResourceMovementBias(search, sample(resourceId, x, y));
  }

  function getReward(resourceId) {
    const search = getSearch(resourceId);
    return search && search.reward ? { ...search.reward } : null;
  }

  function getRequiredMapNames() {
    return [...new Set(Object.values(searches).map((search) => search.map).filter(Boolean))];
  }

  return {
    getSearch,
    sample,
    hasMap,
    chance,
    movementBias,
    getReward,
    getRequiredMapNames,
  };
}
