function clamp(value, min, max) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : min;
  return Math.min(max, Math.max(min, safe));
}

function roundConditionValue(value) {
  return Math.round(clamp(value, 0, 100) * 1000) / 1000;
}

export const DEFAULT_PLAYER_CONDITION = {
  nutrition: 65,
  hydration: 70,
  fatigue: 5,
  loadWeight: 0,
  loadBulk: 0,
  load: 0,
};

export function applyConditionEffects(condition, effects = {}) {
  return {
    ...condition,
    nutrition: roundConditionValue(Number(condition.nutrition) + Number(effects.nutrition || 0)),
    hydration: roundConditionValue(Number(condition.hydration) + Number(effects.hydration || 0)),
    fatigue: roundConditionValue(Number(condition.fatigue) + Number(effects.fatigue || 0)),
  };
}

export function computeLoadFromCapacity(capacity) {
  if (!capacity) {
    return {
      loadWeight: 0,
      loadBulk: 0,
      load: 0,
    };
  }
  const maxWeight = Math.max(0, Number(capacity.maxWeight) || 0);
  const maxBulk = Math.max(0, Number(capacity.maxBulk) || 0);
  const loadWeight = maxWeight > 0 ? clamp((Number(capacity.weight) || 0) / maxWeight, 0, 1) : 0;
  const loadBulk = maxBulk > 0 ? clamp((Number(capacity.bulk) || 0) / maxBulk, 0, 1) : 0;
  return {
    loadWeight: Math.round(loadWeight * 1000) / 1000,
    loadBulk: Math.round(loadBulk * 1000) / 1000,
    load: Math.round(Math.max(loadWeight, loadBulk) * 1000) / 1000,
  };
}

export function createConditionRuntime(deps = {}) {
  let condition = { ...DEFAULT_PLAYER_CONDITION };

  function getSnapshot() {
    return { ...condition };
  }

  function sync() {
    const snapshot = getSnapshot();
    if (typeof deps.setConditionSnapshot === "function") {
      deps.setConditionSnapshot(snapshot);
    }
    if (typeof deps.onConditionSnapshot === "function") {
      deps.onConditionSnapshot(snapshot);
    }
    return snapshot;
  }

  function applyEffects(effects) {
    condition = applyConditionEffects(condition, effects);
    return sync();
  }

  function updateLoadFromCapacity(capacity) {
    condition = {
      ...condition,
      ...computeLoadFromCapacity(capacity),
    };
    return sync();
  }

  sync();

  return {
    getSnapshot,
    applyEffects,
    updateLoadFromCapacity,
    sync,
  };
}
