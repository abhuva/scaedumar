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

export function resolveConditionEffects(conditionEffects, condition) {
  const allEffects = conditionEffects && typeof conditionEffects === "object"
    ? Object.values(conditionEffects)
    : [];
  const activeEffects = chooseStrongestByCategory(allEffects.filter((effect) => isEffectActive(effect, condition)));
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

  function sync() {
    snapshot = resolveConditionEffects(deps.conditionEffects || {}, getConditionSnapshot());
    emitTransitions(snapshot.activeEffects);
    if (typeof deps.onConditionEffectsSnapshot === "function") {
      deps.onConditionEffectsSnapshot(getSnapshot());
    }
    return getSnapshot();
  }

  function getSnapshot() {
    return {
      activeEffects: snapshot.activeEffects.map((effect) => ({ ...effect, modifiers: { ...(effect.modifiers || {}) } })),
      modifiers: { ...snapshot.modifiers },
    };
  }

  sync();

  return {
    sync,
    getSnapshot,
    getModifiers: () => ({ ...snapshot.modifiers }),
    getActiveEffects: () => snapshot.activeEffects.map((effect) => ({ ...effect, modifiers: { ...(effect.modifiers || {}) } })),
  };
}
