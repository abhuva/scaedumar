function normalizeEventDefinition(input) {
  if (!input || typeof input !== "object") return null;
  const id = String(input.id || "");
  if (!id) return null;
  const presentation = input.presentation && typeof input.presentation === "object"
    ? input.presentation
    : {};
  const nodes = normalizeEventNodes(input);
  return {
    id,
    contentId: String(input.contentId || ""),
    priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : 0,
    trigger: input.trigger && typeof input.trigger === "object"
      ? { ...input.trigger, exclusive: Boolean(input.trigger.exclusive) }
      : {},
    presentation: {
      level: presentation.level || "blocking",
      surface: normalizePresentationSurface(presentation),
      mode: presentation.mode || "article",
      time: presentation.time && typeof presentation.time === "object"
        ? { ...presentation.time }
        : { mode: "pause" },
      uiHighlights: normalizeUiHighlights(presentation.uiHighlights),
    },
    startNode: nodes.startNode,
    nodes: nodes.nodes,
    journal: input.journal && typeof input.journal === "object" ? { ...input.journal } : {},
  };
}

function normalizeUiHighlights(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((highlight) => highlight && typeof highlight === "object" && !Array.isArray(highlight))
    .map((highlight) => ({
      target: String(highlight.target || ""),
      color: String(highlight.color || ""),
      thickness: Number.isFinite(Number(highlight.thickness)) ? Number(highlight.thickness) : undefined,
      pulse: Boolean(highlight.pulse),
    }))
    .filter((highlight) => highlight.target);
}

function normalizePresentationSurface(presentation) {
  const surface = String(presentation.surface || "");
  if (surface === "encounter" || surface === "journal" || surface === "silent") return surface;
  const level = presentation.level || "blocking";
  if (level === "blocking") return "encounter";
  if (level === "silent") return "silent";
  return "journal";
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeChoices(input) {
  if (!Array.isArray(input)) return [];
  return input.map((choice, index) => {
    const id = String(choice && choice.id ? choice.id : `choice_${index + 1}`);
    const consequenceVisibility = normalizeConsequenceVisibility(choice && choice.consequenceVisibility);
    return {
      id,
      label: String(choice && choice.label ? choice.label : id),
      next: choice && choice.next != null ? String(choice.next) : "",
      close: Boolean(choice && choice.close),
      consequenceVisibility,
      consequenceText: String(choice && choice.consequenceText ? choice.consequenceText : ""),
      hintText: String(choice && choice.hintText ? choice.hintText : ""),
      command: normalizeChoiceCommand(choice && choice.command),
      outcomes: normalizeChoiceOutcomes(choice && choice.outcomes),
    };
  });
}

function normalizeChoiceOutcomes(outcomes) {
  if (!Array.isArray(outcomes)) return [];
  return outcomes
    .filter((outcome) => outcome && typeof outcome === "object" && !Array.isArray(outcome))
    .map((outcome) => ({ ...outcome, type: String(outcome.type || "") }))
    .filter((outcome) => outcome.type);
}

function normalizeChoiceCommand(command) {
  if (!command || typeof command !== "object" || Array.isArray(command)) return null;
  if (typeof command.type !== "string" || !command.type) return null;
  return { ...command };
}

function normalizeConsequenceVisibility(value) {
  if (value === "exact" || value === "hinted" || value === "hidden" || value === "knowledgeBased") {
    return value;
  }
  return "hidden";
}

function normalizeEventNodes(input) {
  if (input.nodes && typeof input.nodes === "object" && !Array.isArray(input.nodes)) {
    const nodes = {};
    for (const [nodeId, node] of Object.entries(input.nodes)) {
      if (!node || typeof node !== "object") continue;
      nodes[nodeId] = {
        id: nodeId,
        contentId: String(node.contentId || input.contentId || ""),
        choices: normalizeChoices(node.choices),
      };
    }
    const nodeIds = Object.keys(nodes);
    const requestedStart = String(input.startNode || "");
    return {
      startNode: nodes[requestedStart] ? requestedStart : (nodeIds[0] || "main"),
      nodes: nodeIds.length ? nodes : {
        main: {
          id: "main",
          contentId: String(input.contentId || ""),
          choices: normalizeChoices(input.choices),
        },
      },
    };
  }
  return {
    startNode: "main",
    nodes: {
      main: {
        id: "main",
        contentId: String(input.contentId || ""),
        choices: normalizeChoices(input.choices),
      },
    },
  };
}

function cloneChoiceForSnapshot(choice) {
  return {
    id: choice.id,
    label: choice.label,
    next: choice.next,
    close: choice.close,
    consequenceVisibility: choice.consequenceVisibility,
    consequenceText: choice.consequenceText,
    hintText: choice.hintText,
    command: choice.command ? { ...choice.command } : null,
  };
}

function cloneActiveEvent(active) {
  if (!active) return null;
  const snapshot = {
    ...active,
    choices: Array.isArray(active.choices) ? active.choices.map((choice) => ({ ...choice })) : [],
  };
  if (active.error) snapshot.error = { ...active.error };
  else delete snapshot.error;
  if (Array.isArray(active.uiHighlights) && active.uiHighlights.length) {
    snapshot.uiHighlights = active.uiHighlights.map((highlight) => ({ ...highlight }));
  }
  return snapshot;
}

function createActiveEventFromDefinition(definition, node, options = {}) {
  const active = {
    id: definition.id,
    nodeId: node.id || definition.startNode,
    contentId: node.contentId || definition.contentId,
    mode: definition.presentation.mode,
    surface: definition.presentation.surface,
    choices: Array.isArray(node.choices) ? node.choices.map(cloneChoiceForSnapshot) : [],
    error: null,
  };
  if (options.preview) active.preview = true;
  if (definition.presentation.uiHighlights.length) {
    active.uiHighlights = definition.presentation.uiHighlights.map((highlight) => ({ ...highlight }));
  }
  return active;
}

function getChoiceErrorMessage(reason) {
  if (reason === "missing-choice") return "That choice is no longer available.";
  if (reason === "missing-next-node") return "This choice is not fully configured yet.";
  if (reason === "choice-has-no-action") return "This choice has no configured action.";
  if (reason === "command-dispatch-unavailable") return "This action is unavailable right now.";
  if (reason === "command-threw" || reason === "command-failed") return "This action could not be completed.";
  if (reason === "journal-outcome-missing-content-id") return "This journal outcome is missing a content reference.";
  if (reason === "journal-outcome-failed") return "This journal update could not be completed.";
  if (reason === "event-flag-missing-name") return "This event flag outcome is missing a flag name.";
  if (reason === "unknown-outcome") return "This choice uses an unsupported outcome.";
  return "This choice could not be completed.";
}

export function createEventRuntime(deps = {}) {
  const journalRuntime = deps.journalRuntime;
  const setTimeSpeed = typeof deps.setTimeSpeed === "function" ? deps.setTimeSpeed : () => {};
  const getTimeSpeed = typeof deps.getTimeSpeed === "function" ? deps.getTimeSpeed : () => 0;
  const getTimeTick = typeof deps.getTimeTick === "function" ? deps.getTimeTick : () => 0;
  const onChanged = typeof deps.onChanged === "function" ? deps.onChanged : () => {};
  const onNotice = typeof deps.onNotice === "function" ? deps.onNotice : () => {};
  const dispatchCommand = typeof deps.dispatchCommand === "function" ? deps.dispatchCommand : null;
  const definitions = new Map();
  const state = {
    seen: new Set(),
    queue: [],
    active: null,
    restoreSpeed: null,
    triggerCounts: new Map(),
    lastTriggeredTicks: new Map(),
    flags: new Map(),
    lastTriggerResult: null,
  };

  function emit(reason) {
    onChanged(getSnapshot(), reason);
  }

  function clearChoiceError() {
    if (state.active) state.active.error = null;
  }

  function failChoice(result) {
    if (state.active) {
      state.active.error = {
        reason: result.reason || "choice-failed",
        message: getChoiceErrorMessage(result.reason),
      };
      emit("choice-error");
    }
    return result;
  }

  function loadDefinitions(list = []) {
    for (const input of list) {
      const definition = normalizeEventDefinition(input);
      if (!definition) continue;
      if (definitions.has(definition.id)) {
        throw new Error(`Duplicate event ID: ${definition.id}`);
      }
      definitions.set(definition.id, {
        ...definition,
        order: definitions.size,
      });
    }
    emit("definitions-loaded");
  }

  function replaceDefinitions(list = []) {
    definitions.clear();
    loadDefinitions(list);
    state.queue = state.queue.map((definition) => definitions.get(definition.id)).filter(Boolean);
    if (state.active && !definitions.has(state.active.id)) {
      state.active = null;
      restoreTimeBehavior();
    }
    emit("definitions-replaced");
  }

  function matchesTrigger(definition, triggerType, payload = {}) {
    const trigger = definition.trigger || {};
    if (trigger.type !== triggerType) return false;
    const strength = finiteNumber(payload.strength, Number.NaN);
    if (trigger.minStrength != null && !(Number.isFinite(strength) && strength >= finiteNumber(trigger.minStrength))) {
      return false;
    }
    if (trigger.maxStrength != null && !(Number.isFinite(strength) && strength <= finiteNumber(trigger.maxStrength))) {
      return false;
    }
    return true;
  }

  function canRepeat(definition) {
    const trigger = definition.trigger || {};
    const currentCount = state.triggerCounts.get(definition.id) || 0;
    if (trigger.maxCount != null && currentCount >= Math.max(0, Math.floor(finiteNumber(trigger.maxCount)))) {
      return false;
    }
    if (trigger.cooldownTicks != null) {
      const cooldownTicks = Math.max(0, Math.floor(finiteNumber(trigger.cooldownTicks)));
      const lastTick = state.lastTriggeredTicks.get(definition.id);
      const nowTick = Math.max(0, Math.floor(finiteNumber(getTimeTick())));
      if (Number.isFinite(lastTick) && nowTick - lastTick < cooldownTicks) {
        return false;
      }
    }
    return true;
  }

  function recordTriggered(definition) {
    state.triggerCounts.set(definition.id, (state.triggerCounts.get(definition.id) || 0) + 1);
    state.lastTriggeredTicks.set(definition.id, Math.max(0, Math.floor(finiteNumber(getTimeTick()))));
  }

  function applyTimeBehavior(definition) {
    const time = definition.presentation.time || {};
    const mode = time.mode || (definition.presentation.level === "blocking" ? "pause" : "keep");
    if (mode === "keep") return;
    state.restoreSpeed = getTimeSpeed();
    if (mode === "pause") {
      setTimeSpeed(0);
      return;
    }
    if (mode === "setSpeed") {
      setTimeSpeed(Number(time.speed));
    }
  }

  function restoreTimeBehavior() {
    if (state.restoreSpeed == null) return;
    setTimeSpeed(state.restoreSpeed);
    state.restoreSpeed = null;
  }

  function addJournalEntry(definition) {
    if (!definition?.contentId) return;
    journalRuntime?.addEntry({
      sourceEventId: definition.id,
      contentId: definition.contentId,
      category: definition.journal.category || "Journal",
      tags: definition.journal.tags || [],
    });
  }

  function addJournalOutcome(definition, choice, outcome, outcomeIndex) {
    const contentId = String(outcome.contentId || "");
    if (!contentId) {
      return { ok: false, reason: "journal-outcome-missing-content-id", outcome };
    }
    const sourceEventId = String(
      outcome.sourceEventId || `${definition.id}:${choice.id}:outcome_${outcomeIndex + 1}`,
    );
    const result = journalRuntime?.addEntry({
      sourceEventId,
      contentId,
      category: outcome.category || "Journal",
      tags: Array.isArray(outcome.tags) ? outcome.tags : [],
    });
    if (result && typeof result === "object" && result.ok === false && result.reason !== "duplicate-source-event") {
      return { ok: false, reason: "journal-outcome-failed", result };
    }
    return { ok: true };
  }

  function setEventFlag(outcome) {
    const flag = String(outcome.flag || "");
    if (!flag) return { ok: false, reason: "event-flag-missing-name", outcome };
    state.flags.set(flag, outcome.value === undefined ? true : outcome.value);
    return { ok: true };
  }

  function clearEventFlag(outcome) {
    const flag = String(outcome.flag || "");
    if (!flag) return { ok: false, reason: "event-flag-missing-name", outcome };
    state.flags.delete(flag);
    return { ok: true };
  }

  function applyChoiceOutcomes(definition, choice) {
    for (const [index, outcome] of choice.outcomes.entries()) {
      let result = null;
      if (outcome.type === "journal/add") {
        result = addJournalOutcome(definition, choice, outcome, index);
      } else if (outcome.type === "event/setFlag") {
        result = setEventFlag(outcome);
      } else if (outcome.type === "event/clearFlag") {
        result = clearEventFlag(outcome);
      } else {
        result = { ok: false, reason: "unknown-outcome", outcomeType: outcome.type };
      }
      if (!result.ok) return result;
    }
    return { ok: true };
  }

  function validateChoiceOutcomes(choice) {
    for (const outcome of choice.outcomes) {
      if (outcome.type === "journal/add" && !String(outcome.contentId || "")) {
        return { ok: false, reason: "journal-outcome-missing-content-id", outcome };
      }
      if ((outcome.type === "event/setFlag" || outcome.type === "event/clearFlag") && !String(outcome.flag || "")) {
        return { ok: false, reason: "event-flag-missing-name", outcome };
      }
      if (outcome.type !== "journal/add" && outcome.type !== "event/setFlag" && outcome.type !== "event/clearFlag") {
        return { ok: false, reason: "unknown-outcome", outcomeType: outcome.type };
      }
    }
    return { ok: true };
  }

  function processNonBlocking(definition) {
    const level = definition.presentation.level;
    if (definition.journal.addOnTrigger !== false) {
      addJournalEntry(definition);
    }
    state.seen.add(definition.id);
    if (level === "notice") {
      onNotice({
        id: definition.id,
        contentId: definition.contentId,
        level,
      });
    }
  }

  function openNext() {
    if (state.active || state.queue.length === 0) return false;
    state.queue.sort((a, b) => {
      const priorityDelta = b.priority - a.priority;
      return priorityDelta !== 0 ? priorityDelta : a.order - b.order;
    });
    const definition = state.queue.shift();
    const node = definition.nodes[definition.startNode] || definition.nodes.main || {};
    state.active = createActiveEventFromDefinition(definition, node);
    applyTimeBehavior(definition);
    emit("open");
    return true;
  }

  function previewDefinition(id) {
    const definition = definitions.get(String(id || ""));
    if (!definition) return { ok: false, reason: "missing-definition" };
    if (definition.presentation.surface !== "encounter") {
      return { ok: false, reason: "unsupported-preview-surface", surface: definition.presentation.surface };
    }
    if (state.active && !state.active.preview) return { ok: false, reason: "active-event-open" };
    if (state.active?.preview) {
      state.active = null;
      restoreTimeBehavior();
    }
    const node = definition.nodes[definition.startNode] || definition.nodes.main || {};
    state.active = createActiveEventFromDefinition(definition, node, { preview: true });
    applyTimeBehavior(definition);
    emit("preview");
    return { ok: true, id: definition.id };
  }

  function trigger(triggerType, payload = {}) {
    let queued = 0;
    let processed = 0;
    const skipped = [];
    const matchedIds = [];
    const eligible = [];
    for (const definition of definitions.values()) {
      if (!matchesTrigger(definition, triggerType, payload)) continue;
      matchedIds.push(definition.id);
      if (definition.trigger.once && state.seen.has(definition.id)) {
        skipped.push({ id: definition.id, reason: "already-seen" });
        continue;
      }
      if (!canRepeat(definition)) {
        skipped.push({ id: definition.id, reason: "repeat-policy" });
        continue;
      }
      if (state.queue.some((queuedDefinition) => queuedDefinition.id === definition.id)) {
        skipped.push({ id: definition.id, reason: "already-queued" });
        continue;
      }
      if (state.active?.id === definition.id) {
        skipped.push({ id: definition.id, reason: "already-active" });
        continue;
      }
      eligible.push(definition);
    }
    const exclusiveDefinitions = eligible.filter((definition) => definition.trigger.exclusive);
    const exclusiveWinner = exclusiveDefinitions.length
      ? [...exclusiveDefinitions].sort((a, b) => {
          const priorityDelta = b.priority - a.priority;
          return priorityDelta !== 0 ? priorityDelta : a.order - b.order;
        })[0]
      : null;
    const eligibleDefinitions = exclusiveWinner ? [exclusiveWinner] : eligible;
    if (exclusiveDefinitions.length) {
      const allowedIds = new Set(eligibleDefinitions.map((definition) => definition.id));
      for (const definition of eligible) {
        if (!allowedIds.has(definition.id)) {
          skipped.push({ id: definition.id, reason: "trigger-consumed" });
        }
      }
    }
    for (const definition of eligibleDefinitions) {
      if (definition.presentation.level === "blocking") {
        state.queue.push(definition);
        recordTriggered(definition);
        queued += 1;
      } else if (definition.presentation.level === "notice" || definition.presentation.level === "silent") {
        recordTriggered(definition);
        processNonBlocking(definition);
        processed += 1;
      } else {
        skipped.push({ id: definition.id, reason: "unsupported-presentation" });
      }
    }
    if (matchedIds.length === 0) {
      skipped.push({ id: "", reason: "no-matching-definition" });
    }
    state.lastTriggerResult = {
      type: String(triggerType || ""),
      payload: { ...payload },
      queued,
      processed,
      matchedIds,
      skipped,
    };
    if (queued > 0 || processed > 0) {
      openNext();
      emit("trigger");
    }
    return { ok: true, queued, processed, payload };
  }

  function chooseActiveChoice(choiceId) {
    if (!state.active) return { ok: false, reason: "no-active-event" };
    clearChoiceError();
    const definition = definitions.get(state.active.id);
    if (!definition) return failChoice({ ok: false, reason: "missing-definition" });
    const node = definition.nodes[state.active.nodeId];
    const choices = Array.isArray(node?.choices) ? node.choices : [];
    const choice = choices.find((candidate) => candidate.id === choiceId);
    if (!choice) return failChoice({ ok: false, reason: "missing-choice" });
    if (choice.next && !definition.nodes[choice.next]) return failChoice({ ok: false, reason: "missing-next-node" });
    if (!choice.next && !choice.close) return failChoice({ ok: false, reason: "choice-has-no-action" });
    const validationResult = validateChoiceOutcomes(choice);
    if (!validationResult.ok) return failChoice(validationResult);
    const preview = state.active.preview === true;
    if (!preview && choice.command) {
      if (!dispatchCommand) return failChoice({ ok: false, reason: "command-dispatch-unavailable" });
      let result = null;
      try {
        result = dispatchCommand({ ...choice.command });
      } catch (error) {
        return failChoice({ ok: false, reason: "command-threw", error });
      }
      if (result && typeof result === "object" && result.ok === false) {
        return failChoice({ ok: false, reason: "command-failed", result });
      }
    }
    if (!preview) {
      const outcomeResult = applyChoiceOutcomes(definition, choice);
      if (!outcomeResult.ok) return failChoice(outcomeResult);
    }
    if (choice.next) {
      const nextNode = definition.nodes[choice.next];
      state.active = createActiveEventFromDefinition(definition, nextNode, { preview });
      emit("choice");
      return { ok: true, action: "next", nodeId: nextNode.id };
    }
    if (choice.close) {
      closeActive();
      return { ok: true, action: "close" };
    }
    return failChoice({ ok: false, reason: "choice-has-no-action" });
  }

  function closeActive(options = {}) {
    if (!state.active) return false;
    const active = state.active;
    const definition = definitions.get(active.id);
    state.active = null;
    if (!active.preview) {
      state.seen.add(active.id);
    }
    if (!active.preview && definition?.journal?.addOnClose) {
      addJournalEntry(definition);
    }
    restoreTimeBehavior();
    openNext();
    emit("close");
    return true;
  }

  function getSnapshot() {
    return {
      active: cloneActiveEvent(state.active),
      queuedIds: state.queue.map((definition) => definition.id),
      seenIds: Array.from(state.seen),
      definitionIds: Array.from(definitions.keys()),
      triggerCounts: Object.fromEntries(state.triggerCounts.entries()),
      lastTriggeredTicks: Object.fromEntries(state.lastTriggeredTicks.entries()),
      flags: Object.fromEntries(state.flags.entries()),
      lastTriggerResult: state.lastTriggerResult
        ? {
            ...state.lastTriggerResult,
            matchedIds: [...state.lastTriggerResult.matchedIds],
            skipped: state.lastTriggerResult.skipped.map((item) => ({ ...item })),
            payload: { ...state.lastTriggerResult.payload },
          }
        : null,
    };
  }

  function applyPersistenceSnapshot(snapshot = {}) {
    state.seen = new Set(
      Array.isArray(snapshot.seenIds)
        ? snapshot.seenIds.map((id) => String(id || "")).filter(Boolean)
        : [],
    );
    state.queue = [];
    state.active = null;
    state.restoreSpeed = null;
    state.triggerCounts = new Map(Object.entries(snapshot.triggerCounts || {})
      .map(([id, count]) => [id, Math.max(0, Math.floor(finiteNumber(count)))])
      .filter(([id]) => id));
    state.lastTriggeredTicks = new Map(Object.entries(snapshot.lastTriggeredTicks || {})
      .map(([id, tick]) => [id, Math.max(0, Math.floor(finiteNumber(tick)))])
      .filter(([id]) => id));
    state.flags = new Map(Object.entries(snapshot.flags || {})
      .filter(([flag]) => flag));
    emit("restore");
  }

  function resetPersistenceState(options = {}) {
    state.seen = new Set();
    state.queue = [];
    state.active = null;
    state.triggerCounts = new Map();
    state.lastTriggeredTicks = new Map();
    state.flags = new Map();
    state.lastTriggerResult = null;
    restoreTimeBehavior();
    emit("reset");
    return true;
  }

  function getPersistenceSnapshot() {
    return {
      seenIds: Array.from(state.seen),
      triggerCounts: Object.fromEntries(state.triggerCounts.entries()),
      lastTriggeredTicks: Object.fromEntries(state.lastTriggeredTicks.entries()),
      flags: Object.fromEntries(state.flags.entries()),
    };
  }

  return {
    loadDefinitions,
    replaceDefinitions,
    previewDefinition,
    trigger,
    closeActive,
    chooseActiveChoice,
    getSnapshot,
    applyPersistenceSnapshot,
    getPersistenceSnapshot,
    resetPersistenceState,
  };
}
