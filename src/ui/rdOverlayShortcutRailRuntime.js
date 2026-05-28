const TERRAIN_DEBUG_SHORTCUTS = {
  "terrain-height": "height",
  "terrain-slope": "slope",
  "terrain-wetness": "wetness",
  "terrain-water": "water",
};

const DETAIL_DEBUG_SHORTCUTS = {
  "detail-rgba": "rgba",
  "detail-red": "red",
  "detail-green": "green",
  "detail-blue": "blue",
  "detail-alpha": "alpha",
};

const ADDITIVE_SHORTCUTS = new Set(["slime-trails"]);

const GROUP_END_SHORTCUTS = new Set([
  "terrain-water",
  "water-trails",
  "detail-alpha",
  "slime-trails",
]);

function dispatchChange(element) {
  if (!element?.dispatchEvent) return;
  const EventCtor = globalThis.Event;
  if (typeof EventCtor === "function") {
    element.dispatchEvent(new EventCtor("change", { bubbles: true }));
    return;
  }
  const CustomEventCtor = globalThis.CustomEvent;
  if (typeof CustomEventCtor === "function") {
    element.dispatchEvent(new CustomEventCtor("change", { bubbles: true }));
    return;
  }
  const doc = element.ownerDocument || globalThis.document;
  if (doc && typeof doc.createEvent === "function") {
    const event = doc.createEvent("Event");
    event.initEvent("change", true, false);
    element.dispatchEvent(event);
  }
}

function setCheckbox(input, checked) {
  if (!input) return;
  if (input.checked === checked) return;
  input.checked = checked;
  dispatchChange(input);
}

function toggleCheckbox(input) {
  if (!input) return;
  setCheckbox(input, !input.checked);
}

function setSelect(select, value) {
  if (!select) return;
  if (select.value === value) return;
  select.value = value;
  dispatchChange(select);
}

function toggleSelectValue(select, value, offValue = "none") {
  if (!select) return;
  setSelect(select, select.value === value ? offValue : value);
}

export function createRdOverlayShortcutRailRuntime(deps) {
  const buttons = Array.from(deps.railEl?.querySelectorAll("[data-rd-overlay-shortcut]") || []);
  const buttonByShortcut = new Map(buttons.map((button) => [button.dataset.rdOverlayShortcut, button]));
  let isApplyingExclusiveState = false;

  function setButtonActive(shortcut, active) {
    const button = buttonByShortcut.get(shortcut);
    if (!button) return;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function sync() {
    const terrainDebug = deps.terrainDebugViewModeInput?.value || "none";
    for (const [shortcut, value] of Object.entries(TERRAIN_DEBUG_SHORTCUTS)) {
      setButtonActive(shortcut, terrainDebug === value);
    }

    setButtonActive("water-flow", deps.waterFlowDebugToggle?.checked === true);
    setButtonActive("water-trails", deps.waterTrailDebugToggle?.checked === true);

    const detailDebug = deps.detailDebugChannelInput?.value || "none";
    for (const [shortcut, value] of Object.entries(DETAIL_DEBUG_SHORTCUTS)) {
      setButtonActive(shortcut, detailDebug === value);
    }

    setButtonActive("slime-terrain", deps.slimeShowTerrainUnderlayToggle?.checked === true);
    setButtonActive("slime-trails", deps.slimeAvailabilityOverlayEnabledInput?.checked === true);
    setButtonActive("knowledge-map", deps.resourceDebugShowMaskOverlayInput?.checked === true);
    setButtonActive("route-cost", deps.routeDebugOverlayModeInput?.value === "dijkstra");
    setButtonActive("route-knowledge", deps.routeDebugOverlayModeInput?.value === "knowledge");
  }

  function clearExclusiveShortcuts(keep = "") {
    isApplyingExclusiveState = true;
    try {
      if (keep !== "terrain") setSelect(deps.terrainDebugViewModeInput, "none");
      if (keep !== "water-flow") setCheckbox(deps.waterFlowDebugToggle, false);
      if (keep !== "water-trails") setCheckbox(deps.waterTrailDebugToggle, false);
      if (keep !== "detail") setSelect(deps.detailDebugChannelInput, "none");
      if (keep !== "slime-terrain") setCheckbox(deps.slimeShowTerrainUnderlayToggle, false);
      if (keep !== "knowledge-map") setCheckbox(deps.resourceDebugShowMaskOverlayInput, false);
      if (keep !== "route") setSelect(deps.routeDebugOverlayModeInput, "none");
    } finally {
      isApplyingExclusiveState = false;
    }
  }

  function handleShortcut(shortcut) {
    if (ADDITIVE_SHORTCUTS.has(shortcut)) {
      toggleCheckbox(deps.slimeAvailabilityOverlayEnabledInput);
      sync();
      return;
    }
    if (TERRAIN_DEBUG_SHORTCUTS[shortcut]) {
      const value = TERRAIN_DEBUG_SHORTCUTS[shortcut];
      const isActive = deps.terrainDebugViewModeInput?.value === value;
      clearExclusiveShortcuts();
      if (!isActive) setSelect(deps.terrainDebugViewModeInput, value);
      sync();
      return;
    }
    if (DETAIL_DEBUG_SHORTCUTS[shortcut]) {
      const value = DETAIL_DEBUG_SHORTCUTS[shortcut];
      const isActive = deps.detailDebugChannelInput?.value === value;
      clearExclusiveShortcuts();
      if (!isActive) setSelect(deps.detailDebugChannelInput, value);
      sync();
      return;
    }
    if (shortcut === "water-flow") {
      const isActive = deps.waterFlowDebugToggle?.checked === true;
      clearExclusiveShortcuts();
      if (!isActive) setCheckbox(deps.waterFlowDebugToggle, true);
    } else if (shortcut === "water-trails") {
      const isActive = deps.waterTrailDebugToggle?.checked === true;
      clearExclusiveShortcuts();
      if (!isActive) setCheckbox(deps.waterTrailDebugToggle, true);
    } else if (shortcut === "slime-terrain") {
      const isActive = deps.slimeShowTerrainUnderlayToggle?.checked === true;
      clearExclusiveShortcuts();
      if (!isActive) setCheckbox(deps.slimeShowTerrainUnderlayToggle, true);
    } else if (shortcut === "knowledge-map") {
      const isActive = deps.resourceDebugShowMaskOverlayInput?.checked === true;
      clearExclusiveShortcuts();
      if (!isActive) setCheckbox(deps.resourceDebugShowMaskOverlayInput, true);
    } else if (shortcut === "route-cost") {
      const isActive = deps.routeDebugOverlayModeInput?.value === "dijkstra";
      clearExclusiveShortcuts();
      if (!isActive) setSelect(deps.routeDebugOverlayModeInput, "dijkstra");
    } else if (shortcut === "route-knowledge") {
      const isActive = deps.routeDebugOverlayModeInput?.value === "knowledge";
      clearExclusiveShortcuts();
      if (!isActive) setSelect(deps.routeDebugOverlayModeInput, "knowledge");
    }
    sync();
  }

  function enforceExclusiveControlState(controlKey, isActive) {
    if (isApplyingExclusiveState || !isActive) {
      sync();
      return;
    }
    clearExclusiveShortcuts(controlKey);
    sync();
  }

  for (const button of buttons) {
    button.setAttribute("aria-pressed", "false");
    button.classList.toggle("rd-overlay-rail-group-end", GROUP_END_SHORTCUTS.has(button.dataset.rdOverlayShortcut || ""));
    button.addEventListener("click", () => handleShortcut(button.dataset.rdOverlayShortcut || ""));
  }

  deps.terrainDebugViewModeInput?.addEventListener?.("change", () => {
    enforceExclusiveControlState("terrain", (deps.terrainDebugViewModeInput?.value || "none") !== "none");
  });
  deps.waterFlowDebugToggle?.addEventListener?.("change", () => {
    enforceExclusiveControlState("water-flow", deps.waterFlowDebugToggle?.checked === true);
  });
  deps.waterTrailDebugToggle?.addEventListener?.("change", () => {
    enforceExclusiveControlState("water-trails", deps.waterTrailDebugToggle?.checked === true);
  });
  deps.detailDebugChannelInput?.addEventListener?.("change", () => {
    enforceExclusiveControlState("detail", (deps.detailDebugChannelInput?.value || "none") !== "none");
  });
  deps.slimeShowTerrainUnderlayToggle?.addEventListener?.("change", () => {
    enforceExclusiveControlState("slime-terrain", deps.slimeShowTerrainUnderlayToggle?.checked === true);
  });
  deps.slimeAvailabilityOverlayEnabledInput?.addEventListener?.("change", sync);
  deps.resourceDebugShowMaskOverlayInput?.addEventListener?.("change", () => {
    enforceExclusiveControlState("knowledge-map", deps.resourceDebugShowMaskOverlayInput?.checked === true);
  });
  deps.routeDebugOverlayModeInput?.addEventListener?.("change", () => {
    enforceExclusiveControlState("route", (deps.routeDebugOverlayModeInput?.value || "none") !== "none");
  });

  sync();

  return {
    sync,
  };
}
