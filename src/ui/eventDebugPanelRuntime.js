function formatList(values) {
  return Array.isArray(values) && values.length ? values.join("\n") : "none";
}

function formatObject(value) {
  if (!value || typeof value !== "object" || Object.keys(value).length === 0) return "none";
  return JSON.stringify(value, null, 2);
}

function formatSkippedTrigger(entry = {}) {
  const id = entry.id || "none";
  const reason = entry.reason || "unknown";
  if (reason === "already-seen") return `${id}: already seen`;
  if (reason === "repeat-policy") return `${id}: repeat policy blocked`;
  if (reason === "already-queued") return `${id}: already queued`;
  if (reason === "already-active") return `${id}: already active`;
  if (reason === "no-matching-definition") return "no matching definition";
  if (reason === "unsupported-presentation") return `${id}: unsupported presentation`;
  if (reason === "trigger-consumed") return `${id}: trigger consumed by exclusive encounter`;
  return `${id}: ${reason}`;
}

export function formatLastTriggerResult(result = null) {
  if (!result || typeof result !== "object") return "none";
  const lines = [
    `Type: ${result.type || "unknown"}`,
    `Queued: ${Number(result.queued) || 0}`,
    `Processed: ${Number(result.processed) || 0}`,
    `Matched: ${Array.isArray(result.matchedIds) && result.matchedIds.length ? result.matchedIds.join(", ") : "none"}`,
  ];
  const skipped = Array.isArray(result.skipped) ? result.skipped : [];
  lines.push(`Skipped: ${skipped.length ? skipped.map(formatSkippedTrigger).join("; ") : "none"}`);
  const payload = result.payload && typeof result.payload === "object" && Object.keys(result.payload).length
    ? JSON.stringify(result.payload)
    : "none";
  lines.push(`Payload: ${payload}`);
  return lines.join("\n");
}

function normalizeSurface(definition = {}) {
  const presentation = definition.presentation && typeof definition.presentation === "object"
    ? definition.presentation
    : {};
  if (presentation.surface === "encounter" || presentation.surface === "journal" || presentation.surface === "silent") {
    return presentation.surface;
  }
  if (presentation.level === "silent") return "silent";
  if (presentation.level === "notice") return "journal";
  return "encounter";
}

function formatTrigger(trigger = {}) {
  if (!trigger || typeof trigger !== "object") return "none";
  const details = [`type=${trigger.type || "unknown"}`];
  if (trigger.once != null) details.push(`once=${Boolean(trigger.once)}`);
  if (trigger.minStrength != null) details.push(`min=${trigger.minStrength}`);
  if (trigger.maxStrength != null) details.push(`max=${trigger.maxStrength}`);
  return details.join(", ");
}

function formatHighlights(definition = {}) {
  const highlights = definition.presentation?.uiHighlights;
  if (!Array.isArray(highlights) || highlights.length === 0) return "none";
  return highlights
    .map((highlight) => {
      const parts = [
        String(highlight?.target || "unknown"),
        highlight?.color ? `color=${highlight.color}` : "",
        highlight?.thickness != null ? `thickness=${highlight.thickness}` : "",
        highlight?.pulse ? "pulse=true" : "",
      ].filter(Boolean);
      return parts.join(", ");
    })
    .join("\n");
}

export function createEventPreviewView(definition = {}, article = null) {
  if (!definition || typeof definition !== "object" || !definition.id) return "none";
  const surface = normalizeSurface(definition);
  const journal = definition.journal && typeof definition.journal === "object" ? definition.journal : {};
  const tags = Array.isArray(journal.tags) && journal.tags.length ? journal.tags.join(", ") : "none";
  const lines = [
    `ID: ${definition.id}`,
    `Content: ${definition.contentId || "none"}`,
    `Title: ${article?.title || "missing article"}`,
    `Summary: ${article?.summary || "none"}`,
    `Surface: ${surface}`,
    `Level: ${definition.presentation?.level || "blocking"}`,
    `Trigger: ${formatTrigger(definition.trigger)}`,
    `Journal: ${journal.category || "none"} | tags: ${tags}`,
    "UI highlights:",
    formatHighlights(definition),
  ];
  if (!article) lines.push("Article status: missing");
  return lines.join("\n");
}

export function createContentHealthView(snapshot = {}) {
  const validation = snapshot.validation || {};
  const lines = [
    `Status: ${validation.ok === false ? "ERROR" : "OK"}`,
    `Last checked: ${snapshot.checkedAt || "never"}`,
    `Articles: ${Number(snapshot.articleCount) || 0}`,
    `Global encounters: ${Number(snapshot.globalEncounterCount) || 0}`,
    `Map-local encounters: ${Number(snapshot.mapEncounterCount) || 0}`,
    `Active encounters: ${Number(snapshot.activeEncounterCount) || 0}`,
  ];
  const details = Array.isArray(validation.missing) && validation.missing.length
    ? validation.missing.map((entry) => `${entry.source} -> ${entry.contentId}`).join("\n")
    : String(snapshot.lastError || "").trim();
  if (details) {
    lines.push("Details:", details);
  }
  return lines.join("\n");
}

export function createEventDebugSnapshotView(eventSnapshot = {}, journalSnapshot = {}, contentHealthSnapshot = {}) {
  const active = eventSnapshot.active
    ? JSON.stringify(eventSnapshot.active, null, 2)
    : "none";
  const journalEntries = Array.isArray(journalSnapshot.entries) ? journalSnapshot.entries : [];
  const lastTrigger = formatLastTriggerResult(eventSnapshot.lastTriggerResult);
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
    contentHealth: createContentHealthView(contentHealthSnapshot),
  };
}

function setText(element, value) {
  if (element) element.textContent = value;
}

export function createEventDebugPanelRuntime(deps = {}) {
  let lastCheckedAt = "";
  let selectedPreviewId = "";

  function markChecked() {
    const date = deps.now instanceof Date ? deps.now : new Date();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    lastCheckedAt = `${hours}:${minutes}:${seconds}`;
  }

  function sync() {
    if (!lastCheckedAt) markChecked();
    const contentHealthSnapshot = {
      ...(deps.getContentHealthSnapshot?.() || {}),
      checkedAt: lastCheckedAt,
    };
    const view = createEventDebugSnapshotView(
      deps.eventRuntime?.getSnapshot?.() || {},
      deps.journalRuntime?.getSnapshot?.() || {},
      contentHealthSnapshot,
    );
    setText(deps.contentHealthEl, view.contentHealth);
    setText(deps.lastTriggerEl, view.lastTrigger);
    setText(deps.activeEl, view.active);
    setText(deps.queueEl, view.queue);
    setText(deps.definitionsEl, view.definitions);
    setText(deps.seenEl, view.seen);
    setText(deps.flagsEl, view.flags);
    setText(deps.journalEl, view.journal);
    syncPreview();
  }

  function getDefinitions() {
    return typeof deps.getEventDefinitions === "function" ? deps.getEventDefinitions() : [];
  }

  function getSelectedDefinition() {
    const definitions = getDefinitions();
    if (!selectedPreviewId && definitions[0]?.id) selectedPreviewId = definitions[0].id;
    return definitions.find((definition) => definition?.id === selectedPreviewId) || definitions[0] || null;
  }

  function syncPreviewSelect() {
    if (!deps.previewSelectEl) return;
    const definitions = getDefinitions();
    const currentValue = deps.previewSelectEl.value || selectedPreviewId;
    deps.previewSelectEl.textContent = "";
    for (const definition of definitions) {
      if (!definition?.id) continue;
      const option = deps.previewSelectEl.ownerDocument?.createElement
        ? deps.previewSelectEl.ownerDocument.createElement("option")
        : null;
      if (!option) continue;
      option.value = definition.id;
      option.textContent = definition.id;
      deps.previewSelectEl.appendChild(option);
    }
    if (definitions.some((definition) => definition?.id === currentValue)) {
      selectedPreviewId = currentValue;
    } else if (definitions[0]?.id) {
      selectedPreviewId = definitions[0].id;
    } else {
      selectedPreviewId = "";
    }
    deps.previewSelectEl.value = selectedPreviewId;
  }

  function syncPreview() {
    syncPreviewSelect();
    const definition = getSelectedDefinition();
    const article = definition ? deps.getArticle?.(definition.contentId) : null;
    setText(deps.previewValueEl, createEventPreviewView(definition, article));
  }

  function previewSelected() {
    const definition = getSelectedDefinition();
    if (!definition) {
      setText(deps.previewValueEl, "No encounter definition selected.");
      return;
    }
    const surface = normalizeSurface(definition);
    let result = { ok: false, reason: "unsupported-preview-surface", surface };
    if (surface === "encounter") {
      result = deps.eventRuntime?.previewDefinition?.(definition.id) || result;
    } else if (surface === "journal" || surface === "silent") {
      result = deps.openArticle?.(definition.contentId, { reason: "event-debug-preview", pushHistory: false })
        || result;
    }
    if (result?.ok === false) {
      setText(deps.previewValueEl, `${createEventPreviewView(definition, deps.getArticle?.(definition.contentId))}\nPreview: ${result.reason || "failed"}`);
    }
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
    deps.previewSelectEl?.addEventListener("change", () => {
      selectedPreviewId = deps.previewSelectEl.value || "";
      syncPreview();
    });
    deps.previewBtn?.addEventListener("click", () => {
      previewSelected();
      sync();
    });
    deps.validateContentBtn?.addEventListener("click", () => {
      deps.validateContent?.();
      markChecked();
      sync();
    });
    sync();
  }

  return {
    bind,
    sync,
  };
}
