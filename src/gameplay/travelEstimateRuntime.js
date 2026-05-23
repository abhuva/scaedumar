function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function addEffects(total, effects) {
  return {
    nutrition: total.nutrition + finite(effects && effects.nutrition, 0),
    hydration: total.hydration + finite(effects && effects.hydration, 0),
    fatigue: total.fatigue + finite(effects && effects.fatigue, 0),
  };
}

function formatModifierLabel(effect) {
  const lines = Array.isArray(effect && effect.effectsText) ? effect.effectsText : [];
  return {
    id: effect.id,
    label: effect.label || effect.id,
    severity: effect.severity || "warning",
    text: lines[0] || effect.description || "",
  };
}

function applyEffectsToCondition(condition, effects) {
  return {
    ...condition,
    nutrition: Math.max(0, Math.min(100, finite(condition && condition.nutrition, 0) + finite(effects && effects.nutrition, 0))),
    hydration: Math.max(0, Math.min(100, finite(condition && condition.hydration, 0) + finite(effects && effects.hydration, 0))),
    fatigue: Math.max(0, Math.min(100, finite(condition && condition.fatigue, 0) + finite(effects && effects.fatigue, 0))),
  };
}

function computeDurationHours(totalTicks, options = {}) {
  const simTickHours = Math.max(0.001, finite(options.simTickHours, 0.01));
  return Math.max(0, totalTicks) * simTickHours;
}

export function estimateTravelPath(input = {}) {
  const pathPixels = Array.isArray(input.pathPixels) ? input.pathPixels : [];
  const hoverPixel = input.hoverPixel || null;
  if (!hoverPixel) {
    return {
      state: "empty",
      reachable: false,
      message: "Hover a reachable destination.",
    };
  }
  if (pathPixels.length < 2) {
    return {
      state: "unreachable",
      reachable: false,
      destination: {
        x: Math.round(finite(hoverPixel.x, 0)),
        y: Math.round(finite(hoverPixel.y, 0)),
      },
      message: "No reachable path.",
    };
  }

  const computeMoveStepCost = typeof input.computeMoveStepCost === "function"
    ? input.computeMoveStepCost
    : () => Number.POSITIVE_INFINITY;
  const resolveActivityEffects = typeof input.resolveActivityEffects === "function"
    ? input.resolveActivityEffects
    : () => ({ nutrition: 0, hydration: 0, fatigue: 0 });
  const movementCostKey = input.movementCostKey || "movement.step";
  const upkeepCostKey = input.upkeepCostKey || "idle.tick";
  const conditionModifiers = input.conditionModifiers || {};
  const currentCondition = input.condition || {};
  const movementCostMultiplier = finite(conditionModifiers.movementCostMultiplier, 1);
  const load = finite(input.load, 0);
  const moveCostContext = input.moveCostContext || null;
  let totalMoveCost = 0;
  let totalTicks = 0;
  let effects = {
    nutrition: 0,
    hydration: 0,
    fatigue: 0,
  };

  for (let i = 1; i < pathPixels.length; i++) {
    const from = pathPixels[i - 1];
    const to = pathPixels[i];
    const rawStepCost = finite(
      computeMoveStepCost(from.x, from.y, to.x, to.y, moveCostContext),
      Number.POSITIVE_INFINITY,
    );
    if (!Number.isFinite(rawStepCost) || rawStepCost <= 0) {
      return {
        state: "unreachable",
        reachable: false,
        destination: {
          x: Math.round(finite(hoverPixel.x, 0)),
          y: Math.round(finite(hoverPixel.y, 0)),
        },
        message: "No reachable path.",
      };
    }
    totalMoveCost += rawStepCost;
    totalTicks += Math.max(1, Math.ceil(rawStepCost));
    effects = addEffects(effects, resolveActivityEffects(movementCostKey, {
      movementCost: rawStepCost * movementCostMultiplier,
      load,
      conditionModifiers,
    }));
  }

  const upkeepEffects = resolveActivityEffects(upkeepCostKey, {
    activityIntensity: 1,
    conditionModifiers,
  });
  effects = addEffects(effects, {
    nutrition: finite(upkeepEffects.nutrition, 0) * totalTicks,
    hydration: finite(upkeepEffects.hydration, 0) * totalTicks,
    fatigue: finite(upkeepEffects.fatigue, 0) * totalTicks,
  });

  const steps = Math.max(0, pathPixels.length - 1);
  const projectedCondition = applyEffectsToCondition(currentCondition, effects);
  const projectedWarnings = typeof input.getProjectedConditionWarnings === "function"
    ? input.getProjectedConditionWarnings(projectedCondition)
    : [];
  return {
    state: "ready",
    reachable: true,
    destination: {
      x: Math.round(finite(hoverPixel.x, 0)),
      y: Math.round(finite(hoverPixel.y, 0)),
    },
    steps,
    totalMoveCost,
    avgPerStep: steps > 0 ? totalMoveCost / steps : 0,
    ticks: totalTicks,
    durationHours: computeDurationHours(totalTicks, input),
    effects,
    projectedCondition,
    projectedWarnings,
    modifiers: Array.isArray(input.activeConditionEffects)
      ? input.activeConditionEffects.map(formatModifierLabel)
      : [],
  };
}

export function createTravelEstimateRuntime(deps = {}) {
  function getEstimate() {
    const condition = typeof deps.getConditionSnapshot === "function" ? deps.getConditionSnapshot() : {};
    const conditionEffects = typeof deps.getConditionEffectsSnapshot === "function"
      ? deps.getConditionEffectsSnapshot()
      : {};
    const timeState = typeof deps.getTimeState === "function" ? deps.getTimeState() : {};
    return estimateTravelPath({
      pathPixels: deps.movePreviewState && deps.movePreviewState.pathPixels,
      hoverPixel: deps.movePreviewState && deps.movePreviewState.hoverPixel,
      computeMoveStepCost: deps.computeMoveStepCost,
      resolveActivityEffects: deps.resolveActivityEffects,
      movementCostKey: typeof deps.getMovementCostKey === "function" ? deps.getMovementCostKey() : "movement.step",
      upkeepCostKey: typeof deps.getUpkeepCostKey === "function" ? deps.getUpkeepCostKey() : "idle.tick",
      conditionModifiers: conditionEffects.modifiers || {},
      activeConditionEffects: conditionEffects.activeEffects || [],
      condition,
      load: finite(condition.load, 0),
      moveCostContext: typeof deps.getMoveCostContext === "function" ? deps.getMoveCostContext() : null,
      getProjectedConditionWarnings: deps.getProjectedConditionWarnings,
      simTickHours: timeState.simTickHours,
    });
  }

  return {
    getEstimate,
  };
}
