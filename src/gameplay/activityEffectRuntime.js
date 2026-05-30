function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function resolveActivityEffects(activityCosts, activityType, context = {}) {
  const definition = activityCosts && activityCosts[activityType];
  if (!definition) {
    return {
      nutrition: 0,
      hydration: 0,
      fatigue: 0,
    };
  }
  let multiplier = 1;
  const scales = definition.scales || {};
  for (const [key, scale] of Object.entries(scales)) {
    const value = finite(context[key], finite(scale.baseline, 0));
    multiplier += finite(scale.weight, 0) * (value - finite(scale.baseline, 0));
  }
  const bounds = definition.multiplier || {};
  multiplier = clamp(multiplier, finite(bounds.min, 0.25), finite(bounds.max, 4));
  const effects = definition.effects || {};
  return {
    nutrition: finite(effects.nutrition, 0) * multiplier,
    hydration: finite(effects.hydration, 0) * multiplier,
    fatigue: finite(effects.fatigue, 0) * multiplier,
  };
}

export function createActivityEffectRuntime(deps = {}) {
  const activityCosts = deps.activityCosts || {};

  function resolve(activityType, context) {
    const effects = resolveActivityEffects(activityCosts, activityType, context);
    if (typeof deps.applyConditionEffectModifiers === "function") {
      return scaleEffects(
        deps.applyConditionEffectModifiers(effects, context && context.conditionModifiers),
        context && context.effectScale,
      );
    }
    return scaleEffects(effects, context && context.effectScale);
  }

  function apply(activityType, context) {
    const effects = resolve(activityType, context);
    if (typeof deps.applyConditionEffects === "function") {
      deps.applyConditionEffects(effects);
    }
    return effects;
  }

  return {
    resolve,
    apply,
  };
}

function scaleEffects(effects, scale) {
  const multiplier = finite(scale, 1);
  if (multiplier === 1) return effects;
  return {
    nutrition: finite(effects && effects.nutrition, 0) * multiplier,
    hydration: finite(effects && effects.hydration, 0) * multiplier,
    fatigue: finite(effects && effects.fatigue, 0) * multiplier,
  };
}
