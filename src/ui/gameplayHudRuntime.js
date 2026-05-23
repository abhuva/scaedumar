import { getConditionWarningLevel } from "../gameplay/conditionThresholdRegistry.js";

function formatConditionValue(key, value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  if (key === "load") return `${Math.round(number * 100)}%`;
  return number.toFixed(1);
}

function barFillPercent(key, value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  if (key === "load") return Math.max(0, Math.min(100, number * 100));
  return Math.max(0, Math.min(100, number));
}

function clearElement(element) {
  while (element && element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function createGameplayHudRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const activityDefinitions = deps.activityDefinitions && typeof deps.activityDefinitions === "object"
    ? deps.activityDefinitions
    : {};
  const statConfigs = [
    { key: "nutrition", label: "Nutrition" },
    { key: "hydration", label: "Hydration" },
    { key: "fatigue", label: "Fatigue" },
    { key: "load", label: "Load" },
  ];

  function renderStat(config) {
    const root = deps.statEls[config.key];
    if (!root) return;
    const condition = deps.getConditionSnapshot();
    const value = Number(condition && condition[config.key]) || 0;
    const level = getConditionWarningLevel(deps.conditionThresholds, config.key, value);
    root.classList.toggle("condition-warning", level === "warning");
    root.classList.toggle("condition-critical", level === "critical");
    const valueEl = root.querySelector("[data-condition-value]");
    const fillEl = root.querySelector("[data-condition-fill]");
    if (valueEl) valueEl.textContent = formatConditionValue(config.key, value);
    if (fillEl) fillEl.style.width = `${barFillPercent(config.key, value)}%`;
  }

  function sync() {
    for (const config of statConfigs) {
      renderStat(config);
    }
    renderConditionEffects();
    syncActivityButtons();
  }

  function renderTooltip(effect) {
    if (!deps.conditionEffectTooltipEl) return;
    clearElement(deps.conditionEffectTooltipEl);
    if (!effect) {
      deps.conditionEffectTooltipEl.classList.add("hidden");
      return;
    }
    if (!ownerDocument) return;
    const title = ownerDocument.createElement("h3");
    title.textContent = effect.label;
    deps.conditionEffectTooltipEl.appendChild(title);
    if (effect.description) {
      const description = ownerDocument.createElement("p");
      description.textContent = effect.description;
      deps.conditionEffectTooltipEl.appendChild(description);
    }
    const lines = [
      ...(Array.isArray(effect.effectsText) ? effect.effectsText : []),
      ...(Array.isArray(effect.remedyText) ? effect.remedyText : []),
    ];
    if (lines.length) {
      const list = ownerDocument.createElement("ul");
      for (const line of lines) {
        const item = ownerDocument.createElement("li");
        item.textContent = line;
        list.appendChild(item);
      }
      deps.conditionEffectTooltipEl.appendChild(list);
    }
    deps.conditionEffectTooltipEl.classList.remove("hidden");
  }

  function renderConditionEffects() {
    if (!deps.conditionEffectStripEl) return;
    const snapshot = typeof deps.getConditionEffectsSnapshot === "function"
      ? deps.getConditionEffectsSnapshot()
      : null;
    const effects = snapshot && Array.isArray(snapshot.activeEffects) ? snapshot.activeEffects : [];
    clearElement(deps.conditionEffectStripEl);
    deps.conditionEffectStripEl.classList.toggle("hidden", effects.length === 0);
    if (!effects.length) {
      renderTooltip(null);
      return;
    }
    for (const effect of effects) {
      if (!ownerDocument) return;
      const button = ownerDocument.createElement("button");
      button.type = "button";
      button.className = `condition-effect-badge condition-${effect.severity === "critical" ? "critical" : "warning"}`;
      button.textContent = effect.icon || effect.label.slice(0, 1).toUpperCase();
      button.title = effect.label;
      button.setAttribute("aria-label", effect.label);
      button.addEventListener("mouseenter", () => renderTooltip(effect));
      button.addEventListener("focus", () => renderTooltip(effect));
      button.addEventListener("mouseleave", () => renderTooltip(null));
      button.addEventListener("blur", () => renderTooltip(null));
      deps.conditionEffectStripEl.appendChild(button);
    }
  }

  function applyActivityButton(button, activityId, fallbackLabel, fallbackTitle) {
    if (!button) return;
    const definition = activityDefinitions[activityId] || {};
    const label = typeof definition.buttonLabel === "string" && definition.buttonLabel
      ? definition.buttonLabel
      : fallbackLabel;
    const title = typeof definition.title === "string" && definition.title
      ? definition.title
      : fallbackTitle;
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-label", title);
  }

  function syncActivityButtons() {
    applyActivityButton(deps.pathfindingBtn, "travel", "PF", "Pathfinding / Travel");
    applyActivityButton(deps.gatheringBtn, "gathering", "G", "Gather");
    applyActivityButton(deps.gatherWaterBtn, "gather_water", "W", "Gather Water");
    applyActivityButton(deps.inspectBtn, "inspect", "I", "Inspect");
    applyActivityButton(deps.restBtn, "rest", "R", "Rest");

    const activity = typeof deps.getActivitySnapshot === "function" ? deps.getActivitySnapshot() : null;
    const activeType = activity && activity.active ? activity.type : "";
    if (deps.pathfindingBtn) {
      deps.pathfindingBtn.classList.toggle("active", deps.getInteractionMode() === "pathfinding" || activeType === "travel");
      deps.pathfindingBtn.setAttribute("aria-pressed", deps.getInteractionMode() === "pathfinding" || activeType === "travel" ? "true" : "false");
    }
    const activityButtons = [
      [deps.gatheringBtn, "gathering"],
      [deps.gatherWaterBtn, "gather_water"],
      [deps.inspectBtn, "inspect"],
      [deps.restBtn, "rest"],
    ];
    for (const [button, activityId] of activityButtons) {
      if (!button) continue;
      const active = activeType === activityId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  deps.pathfindingBtn.addEventListener("click", () => {
    if (deps.getInteractionMode() === "pathfinding") {
      deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "none" });
      deps.setStatus("Pathfinding mode disabled.");
      sync();
      return;
    }
    deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "pathfinding" });
    deps.rebuildMovementField();
    deps.setStatus("Pathfinding mode enabled: hover for path preview, click to move player.");
    sync();
  });
  deps.gatheringBtn.addEventListener("click", () => {
    deps.dispatchCoreCommand({
      type: deps.isActivityActive() ? "core/activity/cancel" : "core/activity/startGathering",
    });
  });
  deps.gatherWaterBtn.addEventListener("click", () => {
    deps.dispatchCoreCommand({
      type: deps.isActivityActive() ? "core/activity/cancel" : "core/activity/startGatherWater",
    });
  });
  deps.inspectBtn.addEventListener("click", () => {
    deps.dispatchCoreCommand({
      type: deps.isActivityActive() ? "core/activity/cancel" : "core/activity/startInspect",
    });
  });
  deps.restBtn.addEventListener("click", () => {
    deps.dispatchCoreCommand({
      type: deps.isActivityActive() ? "core/activity/cancel" : "core/activity/startRest",
    });
  });
  deps.inventoryBtn.addEventListener("click", () => {
    deps.toggleInventory();
  });
  deps.showPlayerBtn.addEventListener("click", () => {
    deps.dispatchCoreCommand({ type: "core/player/show" });
  });

  sync();

  return {
    sync,
  };
}
