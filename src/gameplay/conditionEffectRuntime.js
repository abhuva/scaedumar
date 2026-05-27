const DEFAULT_MODIFIERS = {
  movementCostMultiplier: 1,
  fatigueGainMultiplier: 1,
  recoveryMultiplier: 1,
  activityCostMultiplier: 1,
};

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isEffectActive(effect, condition) {
  if (!effect || !effect.stat) return false;
  const value = finite(condition && condition[effect.stat], 0);
  if (effect.mode === "high") {
    return value >= finite(effect.threshold, 100);
  }
  return value <= finite(effect.threshold, 0);
}

function cloneEffect(effect) {
  return {
    ...effect,
    modifiers: { ...(effect.modifiers || {}) },
    effectsText: Array.isArray(effect.effectsText) ? [...effect.effectsText] : effect.effectsText,
    remedyText: Array.isArray(effect.remedyText) ? [...effect.remedyText] : effect.remedyText,
  };
}

function formatRemainingTicks(ticks) {
  return ticks === 1 ? "1 step remaining." : `${ticks} steps remaining.`;
}

function chooseStrongestByCategory(effects) {
  const byCategory = new Map();
  for (const effect of effects) {
    const previous = byCategory.get(effect.category);
    if (!previous || finite(effect.priority, 0) > finite(previous.priority, 0)) {
      byCategory.set(effect.category, effect);
    }
  }
  return [...byCategory.values()].sort((a, b) => {
    const severityDelta = (b.severity === "critical" ? 1 : 0) - (a.severity === "critical" ? 1 : 0);
    if (severityDelta) return severityDelta;
    return finite(b.priority, 0) - finite(a.priority, 0);
  });
}

export function resolveConditionEffects(conditionEffects, condition, explicitEffects = []) {
  const allEffects = conditionEffects && typeof conditionEffects === "object"
    ? Object.values(conditionEffects)
    : [];
  const activeEffects = chooseStrongestByCategory([
    ...allEffects.filter((effect) => isEffectActive(effect, condition)),
    ...(Array.isArray(explicitEffects) ? explicitEffects : []),
  ]);
  const modifiers = { ...DEFAULT_MODIFIERS };
  for (const effect of activeEffects) {
    const effectModifiers = effect.modifiers || {};
    for (const key of Object.keys(DEFAULT_MODIFIERS)) {
      modifiers[key] *= finite(effectModifiers[key], 1);
    }
  }
  return {
    activeEffects,
    modifiers,
  };
}

export function compareConditionEffectSnapshots(currentEffects = [], projectedEffects = []) {
  const currentByCategory = new Map();
  for (const effect of Array.isArray(currentEffects) ? currentEffects : []) {
    currentByCategory.set(effect.category, effect);
  }
  const warnings = [];
  for (const projected of Array.isArray(projectedEffects) ? projectedEffects : []) {
    const current = currentByCategory.get(projected.category);
    if (!current) {
      warnings.push({
        type: "new",
        effect: projected,
        label: `Will become ${projected.label}`,
        severity: projected.severity || "warning",
      });
      continue;
    }
    if (finite(projected.priority, 0) > finite(current.priority, 0)) {
      warnings.push({
        type: "worsened",
        effect: projected,
        previousEffect: current,
        label: `${current.label} will worsen to ${projected.label}`,
        severity: projected.severity || "warning",
      });
    }
  }
  return warnings;
}

export function applyConditionEffectModifiers(effects, modifiers = {}) {
  const next = { ...effects };
  if (Number(next.fatigue) > 0) {
    next.fatigue *= finite(modifiers.fatigueGainMultiplier, 1);
  } else if (Number(next.fatigue) < 0) {
    next.fatigue *= finite(modifiers.recoveryMultiplier, 1);
  }
  return next;
}

export function createConditionEffectRuntime(deps = {}) {
  let snapshot = resolveConditionEffects(deps.conditionEffects || {}, {});
  let previousIds = new Set();
  let initialized = false;
  const temporaryEffects = new Map();

  function getConditionSnapshot() {
    return typeof deps.getConditionSnapshot === "function" ? deps.getConditionSnapshot() : {};
  }

  function emitTransitions(activeEffects) {
    if (typeof deps.setStatus !== "function") return;
    const nextIds = new Set(activeEffects.map((effect) => effect.id));
    if (!initialized) {
      previousIds = nextIds;
      initialized = true;
      return;
    }
    for (const effect of activeEffects) {
      if (!previousIds.has(effect.id)) {
        deps.setStatus(`${effect.label}: ${effect.description}`);
        previousIds = nextIds;
        return;
      }
    }
    previousIds = nextIds;
  }

  function getTemporaryEffectSnapshots() {
    return [...temporaryEffects.values()].map((entry) => ({
      ...cloneEffect(entry.effect),
      remainingTicks: entry.remainingTicks,
      effectsText: [
        ...(Array.isArray(entry.effect.effectsText) ? entry.effect.effectsText : []),
        formatRemainingTicks(entry.remainingTicks),
      ],
    }));
  }

  function sync() {
    snapshot = resolveConditionEffects(deps.conditionEffects || {}, getConditionSnapshot(), getTemporaryEffectSnapshots());
    emitTransitions(snapshot.activeEffects);
    if (typeof deps.onConditionEffectsSnapshot === "function") {
      deps.onConditionEffectsSnapshot(getSnapshot());
    }
    return getSnapshot();
  }

  function getSnapshot() {
    return {
      activeEffects: snapshot.activeEffects.map(cloneEffect),
      modifiers: { ...snapshot.modifiers },
    };
  }

  function addTemporaryEffect(effect, durationTicks = 0) {
    if (!effect || !effect.id) return false;
    const ticks = Math.max(0, Math.round(finite(durationTicks, 0)));
    if (ticks <= 0) return false;
    temporaryEffects.set(effect.id, {
      effect: {
        ...cloneEffect(effect),
        category: effect.category || effect.id,
        modifiers: { ...(effect.modifiers || {}) },
      },
      remainingTicks: ticks,
      pendingFirstTick: true,
    });
    sync();
    return true;
  }

  function clearTemporaryEffect(id) {
    if (!temporaryEffects.delete(id)) return false;
    sync();
    return true;
  }

  function tickTemporaryEffects(ticks = 1) {
    const delta = Math.max(0, Math.round(finite(ticks, 0)));
    if (delta <= 0 || temporaryEffects.size <= 0) return false;
    let changed = false;
    for (const [id, entry] of temporaryEffects.entries()) {
      if (entry.pendingFirstTick) {
        entry.pendingFirstTick = false;
        continue;
      }
      entry.remainingTicks -= delta;
      if (entry.remainingTicks <= 0) {
        temporaryEffects.delete(id);
      }
      changed = true;
    }
    if (changed) sync();
    return changed;
  }

  sync();

  return {
    sync,
    addTemporaryEffect,
    clearTemporaryEffect,
    tickTemporaryEffects,
    getSnapshot,
    getModifiers: () => ({ ...snapshot.modifiers }),
    getActiveEffects: () => snapshot.activeEffects.map(cloneEffect),
  };
}
