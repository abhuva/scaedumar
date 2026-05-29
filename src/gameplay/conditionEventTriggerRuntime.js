function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function crossesDown(previousValue, nextValue, threshold) {
  return previousValue > threshold && nextValue <= threshold;
}

function crossesUp(previousValue, nextValue, threshold) {
  return previousValue < threshold && nextValue >= threshold;
}

export function createConditionEventTriggerRuntime(deps = {}) {
  const triggerEvent = typeof deps.triggerEvent === "function" ? deps.triggerEvent : () => null;
  const getConditionSnapshot = typeof deps.getConditionSnapshot === "function"
    ? deps.getConditionSnapshot
    : () => ({});
  const hydrationThreshold = finite(deps.hydrationThreshold, 50);
  const fatigueThreshold = finite(deps.fatigueThreshold, 50);
  let previous = null;

  function sync(reason = "condition-change") {
    const next = getConditionSnapshot() || {};
    const current = {
      hydration: finite(next.hydration, 0),
      fatigue: finite(next.fatigue, 0),
    };
    const prior = previous;
    previous = current;
    if (!prior) return [];

    const triggered = [];
    if (crossesDown(prior.hydration, current.hydration, hydrationThreshold)) {
      triggerEvent("condition_hydration_low", {
        source: "condition-event-trigger",
        stat: "hydration",
        strength: current.hydration,
        previous: prior.hydration,
        threshold: hydrationThreshold,
        reason,
      });
      triggered.push("condition_hydration_low");
    }
    if (crossesUp(prior.fatigue, current.fatigue, fatigueThreshold)) {
      triggerEvent("condition_fatigue_high", {
        source: "condition-event-trigger",
        stat: "fatigue",
        strength: current.fatigue,
        previous: prior.fatigue,
        threshold: fatigueThreshold,
        reason,
      });
      triggered.push("condition_fatigue_high");
    }
    return triggered;
  }

  function resetBaseline() {
    previous = null;
    sync("baseline-reset");
  }

  return {
    sync,
    resetBaseline,
  };
}
