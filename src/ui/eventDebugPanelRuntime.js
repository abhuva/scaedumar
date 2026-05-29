function formatList(values) {
  return Array.isArray(values) && values.length ? values.join("\n") : "none";
}

function formatObject(value) {
  if (!value || typeof value !== "object" || Object.keys(value).length === 0) return "none";
  return JSON.stringify(value, null, 2);
}

export function createEventDebugSnapshotView(eventSnapshot = {}, journalSnapshot = {}) {
  const active = eventSnapshot.active
    ? JSON.stringify(eventSnapshot.active, null, 2)
    : "none";
  const journalEntries = Array.isArray(journalSnapshot.entries) ? journalSnapshot.entries : [];
  const lastTrigger = eventSnapshot.lastTriggerResult
    ? JSON.stringify(eventSnapshot.lastTriggerResult, null, 2)
    : "none";
  return {
    lastTrigger,
    active,
    queue: formatList(eventSnapshot.queuedIds || []),
    definitions: formatList(eventSnapshot.definitionIds || []),
    seen: formatList(eventSnapshot.seenIds || []),
    flags: formatObject(eventSnapshot.flags || {}),
    journal: journalEntries.length
      ? journalEntries.map((entry) => `${entry.id}: ${entry.category || "Journal"} -> ${entry.contentId}`).join("\n")
      : "none",
  };
}

function setText(element, value) {
  if (element) element.textContent = value;
}

export function createEventDebugPanelRuntime(deps = {}) {
  function sync() {
    const view = createEventDebugSnapshotView(
      deps.eventRuntime?.getSnapshot?.() || {},
      deps.journalRuntime?.getSnapshot?.() || {},
    );
    setText(deps.lastTriggerEl, view.lastTrigger);
    setText(deps.activeEl, view.active);
    setText(deps.queueEl, view.queue);
    setText(deps.definitionsEl, view.definitions);
    setText(deps.seenEl, view.seen);
    setText(deps.flagsEl, view.flags);
    setText(deps.journalEl, view.journal);
  }

  function trigger(triggerType, payload = {}) {
    deps.eventRuntime?.trigger?.(triggerType, { source: "event-debug-panel", ...payload });
    sync();
  }

  function bind() {
    deps.triggerDialogBtn?.addEventListener("click", () => trigger("debug_sample_dialog"));
    deps.triggerNoticeBtn?.addEventListener("click", () => trigger("debug_sample_notice"));
    deps.triggerGameplayStartedBtn?.addEventListener("click", () => trigger("gameplay_started"));
    deps.triggerHydrationLowBtn?.addEventListener("click", () => trigger("condition_hydration_low", {
      stat: "hydration",
      strength: 50,
      threshold: 50,
    }));
    deps.triggerFatigueHighBtn?.addEventListener("click", () => trigger("condition_fatigue_high", {
      stat: "fatigue",
      strength: 50,
      threshold: 50,
    }));
    deps.resetBtn?.addEventListener("click", () => {
      deps.resetEventDialogState?.();
      sync();
    });
    deps.refreshBtn?.addEventListener("click", () => sync());
    sync();
  }

  return {
    bind,
    sync,
  };
}
