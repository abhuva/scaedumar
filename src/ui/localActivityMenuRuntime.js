export const LOCAL_ACTIVITY_MENU_SLOT_COUNT = 12;
const LOCAL_ACTIVITY_MENU_BUTTON_SIZE = 24;
const LOCAL_ACTIVITY_MENU_EDGE_PADDING = 8;

export const LOCAL_ACTIVITY_MENU_ACTIONS = [
  {
    activityId: "travel",
    fallbackLabel: "PF",
    fallbackTitle: "Pathfinding / Travel",
    wikiId: "gameplay.travel",
    command: { type: "core/interaction/setMode", mode: "pathfinding" },
  },
  {
    activityId: "gathering",
    fallbackLabel: "G",
    fallbackTitle: "Gather",
    wikiId: "gameplay.gathering",
    command: { type: "core/activity/startGathering" },
  },
  {
    activityId: "gather_water",
    fallbackLabel: "W",
    fallbackTitle: "Gather Water",
    wikiId: "gameplay.water",
    command: { type: "core/activity/startGatherWater" },
  },
  {
    activityId: "hunting",
    fallbackLabel: "HU",
    fallbackTitle: "Hunt",
    wikiId: "gameplay.hunting",
    command: { type: "core/activity/startHunting" },
  },
  {
    activityId: "scout",
    fallbackLabel: "SC",
    fallbackTitle: "Scout",
    command: { type: "core/activity/startScout" },
  },
  {
    activityId: "rest",
    fallbackLabel: "R",
    fallbackTitle: "Rest",
    wikiId: "gameplay.rest",
    command: { type: "core/activity/startRest" },
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getLocalActivityMenuSlotPosition(slotIndex, radius, slotCount = LOCAL_ACTIVITY_MENU_SLOT_COUNT) {
  const index = Math.max(0, Number(slotIndex) || 0);
  const count = Math.max(1, Number(slotCount) || LOCAL_ACTIVITY_MENU_SLOT_COUNT);
  const angle = Math.PI + ((Math.PI * 2 * index) / count);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

export function getVisibleLocalActivityActions(actions, availability = {}) {
  const unlocked = availability && typeof availability.unlocked === "object" ? availability.unlocked : null;
  return actions
    .filter((action) => action && typeof action.activityId === "string")
    .filter((action) => !unlocked || unlocked[action.activityId] !== false)
    .slice(0, LOCAL_ACTIVITY_MENU_SLOT_COUNT);
}

function getActivityLabel(definition, fallbackLabel) {
  return typeof definition?.buttonLabel === "string" && definition.buttonLabel
    ? definition.buttonLabel
    : fallbackLabel;
}

function getActivityTitle(definition, fallbackTitle) {
  return typeof definition?.title === "string" && definition.title
    ? definition.title
    : fallbackTitle;
}

function isPrimaryActivityActive(activity, activityId) {
  if (!activity || !activity.active) return false;
  if (activityId === "travel") return activity.type === "travel";
  return activity.type === activityId;
}

export function createLocalActivityMenuRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const ownerWindow = ownerDocument?.defaultView || globalThis.window;
  const actions = Array.isArray(deps.actions) ? deps.actions : LOCAL_ACTIVITY_MENU_ACTIONS;
  const buttonByActivityId = new Map();
  let radius = Number(deps.radius);
  if (!Number.isFinite(radius)) radius = 72;
  let open = false;
  let anchor = null;

  function getAvailabilitySnapshot() {
    return typeof deps.getActivityAvailabilitySnapshot === "function"
      ? deps.getActivityAvailabilitySnapshot()
      : null;
  }

  function getVisibleActions() {
    return getVisibleLocalActivityActions(actions, getAvailabilitySnapshot());
  }

  function getActivitySnapshot() {
    return typeof deps.getActivitySnapshot === "function" ? deps.getActivitySnapshot() : null;
  }

  function getInteractionMode() {
    return typeof deps.getInteractionMode === "function" ? deps.getInteractionMode() : "none";
  }

  function getMovementSnapshot() {
    return typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
  }

  function hasCancelableAction() {
    const activity = getActivitySnapshot();
    if (activity && activity.active) return true;
    const movement = getMovementSnapshot();
    if (movement && movement.active) return true;
    return getInteractionMode() !== "none";
  }

  function close() {
    open = false;
    anchor = null;
    deps.rootEl?.classList.add("hidden");
    deps.rootEl?.setAttribute("aria-hidden", "true");
  }

  function positionRoot(clientX, clientY) {
    if (!deps.rootEl) return;
    const margin = Math.max(76, radius + (LOCAL_ACTIVITY_MENU_BUTTON_SIZE / 2) + LOCAL_ACTIVITY_MENU_EDGE_PADDING);
    const viewportWidth = ownerWindow?.innerWidth || 0;
    const viewportHeight = ownerWindow?.innerHeight || 0;
    const maxX = viewportWidth - margin;
    const maxY = viewportHeight - margin;
    const x = viewportWidth > 0
      ? (maxX >= margin ? clamp(clientX, margin, maxX) : viewportWidth / 2)
      : clientX;
    const y = viewportHeight > 0
      ? (maxY >= margin ? clamp(clientY, margin, maxY) : viewportHeight / 2)
      : clientY;
    deps.rootEl.style.left = `${Math.round(x)}px`;
    deps.rootEl.style.top = `${Math.round(y)}px`;
  }

  function dispatchAction(action) {
    if (!action) return;
    const activity = getActivitySnapshot();
    if (isPrimaryActivityActive(activity, action.activityId)) {
      deps.dispatchCoreCommand({ type: "core/activity/cancel" });
      close();
      return;
    }
    deps.dispatchCoreCommand({ ...action.command });
    if (action.activityId === "travel" && typeof deps.rebuildMovementField === "function") {
      deps.rebuildMovementField();
    }
    close();
  }

  function dispatchCancel() {
    const activity = getActivitySnapshot();
    if (activity && activity.active) {
      deps.dispatchCoreCommand({ type: "core/activity/cancel" });
      close();
      return;
    }
    const movement = getMovementSnapshot();
    if (movement && movement.active) {
      deps.dispatchCoreCommand({ type: "core/movement/cancel" });
      close();
      return;
    }
    if (getInteractionMode() !== "none") {
      deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "none" });
      close();
    }
  }

  function render() {
    if (!deps.rootEl || !ownerDocument) return;
    buttonByActivityId.clear();
    while (deps.rootEl.firstChild) {
      deps.rootEl.removeChild(deps.rootEl.firstChild);
    }
    const visibleActions = getVisibleActions();
    const activityDefinitions = deps.activityDefinitions && typeof deps.activityDefinitions === "object"
      ? deps.activityDefinitions
      : {};
    const activity = getActivitySnapshot();
    const interactionMode = getInteractionMode();
    if (hasCancelableAction()) {
      const cancelButton = ownerDocument.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "local-activity-menu-cancel-btn";
      cancelButton.textContent = "X";
      cancelButton.title = "Cancel current action";
      cancelButton.setAttribute("aria-label", "Cancel current action");
      cancelButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        dispatchCancel();
      });
      deps.rootEl.appendChild(cancelButton);
    }
    for (let index = 0; index < visibleActions.length; index++) {
      const action = visibleActions[index];
      const definition = activityDefinitions[action.activityId] || {};
      const button = ownerDocument.createElement("button");
      const offset = getLocalActivityMenuSlotPosition(index, radius);
      const label = getActivityLabel(definition, action.fallbackLabel);
      const title = getActivityTitle(definition, action.fallbackTitle);
      const active = action.activityId === "travel"
        ? interactionMode === "pathfinding" || isPrimaryActivityActive(activity, action.activityId)
        : isPrimaryActivityActive(activity, action.activityId);
      button.type = "button";
      button.className = "local-activity-menu-btn";
      button.textContent = label;
      button.title = title;
      button.setAttribute("aria-label", title);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.classList.toggle("active", active);
      button.dataset.activityId = action.activityId;
      button.style.transform = `translate(calc(-50% + ${offset.x.toFixed(2)}px), calc(-50% + ${offset.y.toFixed(2)}px))`;
      if (action.wikiId) button.dataset.wikiId = action.wikiId;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        dispatchAction(action);
      });
      deps.rootEl.appendChild(button);
      buttonByActivityId.set(action.activityId, button);
    }
    deps.onButtonsRendered?.({
      getButton: (activityId) => buttonByActivityId.get(activityId) || null,
    });
  }

  function sync() {
    // Open menus are intentionally stable; gameplay ticks must not rebuild them.
  }

  function setRadius(value) {
    const nextRadius = clamp(Number(value), 24, 140);
    if (!Number.isFinite(nextRadius) || nextRadius === radius) return radius;
    radius = nextRadius;
    if (open) render();
    return radius;
  }

  function openAt(input) {
    if (open) {
      close();
      return true;
    }
    const clientX = Number(input?.clientX);
    const clientY = Number(input?.clientY);
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return false;
    anchor = {
      clientX,
      clientY,
      pixel: input?.pixel || null,
    };
    open = true;
    render();
    positionRoot(anchor.clientX, anchor.clientY);
    deps.rootEl?.classList.remove("hidden");
    deps.rootEl?.setAttribute("aria-hidden", "false");
    deps.setStatus?.("Choose a local activity.");
    return true;
  }

  ownerDocument?.addEventListener?.("keydown", (event) => {
    if (!open || event.key !== "Escape") return;
    event.preventDefault();
    close();
  }, true);

  ownerWindow?.addEventListener?.("wheel", close, true);
  ownerWindow?.addEventListener?.("resize", close, true);

  close();

  return {
    openAt,
    close,
    sync,
    setRadius,
    getRadius: () => radius,
    isOpen: () => open,
    getButton: (activityId) => buttonByActivityId.get(activityId) || null,
  };
}
