function cloneEntry(entry) {
  return {
    id: entry.id,
    sourceEventId: entry.sourceEventId || "",
    contentId: entry.contentId || "",
    timeTick: Number.isFinite(Number(entry.timeTick)) ? Number(entry.timeTick) : 0,
    category: entry.category || "Journal",
    tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
  };
}

export function createJournalRuntime(deps = {}) {
  const onChanged = typeof deps.onChanged === "function" ? deps.onChanged : () => {};
  const getTimeTick = typeof deps.getTimeTick === "function" ? deps.getTimeTick : () => 0;
  const entries = [];
  let nextId = 1;

  function addEntry(input = {}) {
    const sourceEventId = String(input.sourceEventId || "");
    if (sourceEventId && entries.some((entry) => entry.sourceEventId === sourceEventId)) {
      return { ok: false, reason: "duplicate-source-event" };
    }
    const entry = cloneEntry({
      id: input.id || `journal_${String(nextId).padStart(3, "0")}`,
      sourceEventId,
      contentId: input.contentId,
      timeTick: input.timeTick ?? getTimeTick(),
      category: input.category,
      tags: input.tags,
    });
    nextId += 1;
    entries.push(entry);
    onChanged(getSnapshot(), "add");
    return { ok: true, entry: cloneEntry(entry) };
  }

  function getSnapshot() {
    return {
      entries: entries.map(cloneEntry),
    };
  }

  function applyPersistenceSnapshot(snapshot = {}) {
    entries.length = 0;
    if (Array.isArray(snapshot.entries)) {
      for (const input of snapshot.entries) {
        const entry = cloneEntry(input || {});
        if (!entry.id || !entry.contentId) continue;
        entries.push(entry);
      }
    }
    let maxNumericId = 0;
    for (const entry of entries) {
      const match = /^journal_(\d+)$/.exec(entry.id);
      if (match) maxNumericId = Math.max(maxNumericId, Number(match[1]) || 0);
    }
    nextId = maxNumericId + 1;
    onChanged(getSnapshot(), "restore");
  }

  function resetPersistenceState() {
    entries.length = 0;
    nextId = 1;
    onChanged(getSnapshot(), "reset");
    return true;
  }

  function getPersistenceSnapshot() {
    return getSnapshot();
  }

  return {
    addEntry,
    getSnapshot,
    applyPersistenceSnapshot,
    getPersistenceSnapshot,
    resetPersistenceState,
  };
}
