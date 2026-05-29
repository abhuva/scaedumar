function clearElement(element) {
  while (element && element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function getArticleTitle(contentId, getArticle) {
  const article = typeof getArticle === "function" ? getArticle(contentId) : null;
  return article?.title || contentId || "Unknown entry";
}

export function getJournalEntryLinkAriaLabel(entry, title) {
  return `Open journal entry ${String(entry?.category || "Journal")}: ${String(title || entry?.contentId || "article")}`;
}

export function createJournalEntryViewModel(entry, getArticle) {
  const contentId = String(entry?.contentId || "");
  const title = getArticleTitle(contentId, getArticle);
  return {
    id: String(entry?.id || contentId || "journal-entry"),
    contentId,
    category: String(entry?.category || "Journal"),
    title,
    ariaLabel: getJournalEntryLinkAriaLabel(entry, title),
  };
}

export function getJournalCategories(entries) {
  const categories = new Set();
  for (const entry of entries || []) {
    const category = String(entry?.category || "Journal").trim() || "Journal";
    categories.add(category);
  }
  return [...categories].sort((a, b) => a.localeCompare(b));
}

export function filterJournalEntriesByCategory(entries, category) {
  const normalizedCategory = String(category || "").trim();
  if (!normalizedCategory) return [...(entries || [])];
  return (entries || []).filter((entry) => String(entry?.category || "Journal") === normalizedCategory);
}

export function handleJournalFeedWheel(entriesEl, expanded, event) {
  if (!expanded || !entriesEl) return false;
  const deltaY = Number(event?.deltaY || 0);
  if (!deltaY) return false;
  entriesEl.scrollTop += deltaY;
  event.preventDefault?.();
  event.stopPropagation?.();
  return true;
}

function renderEntryList(rootEl, entries, deps) {
  clearElement(rootEl);
  if (!entries.length) {
    const empty = deps.document.createElement("p");
    empty.className = "journal-empty";
    empty.textContent = "No journal entries yet.";
    rootEl.appendChild(empty);
    return;
  }

  const list = deps.document.createElement("div");
  list.className = "journal-entry-list";
  for (const entry of entries) {
    const view = createJournalEntryViewModel(entry, deps.getArticle);
    const row = deps.document.createElement("div");
    row.className = "journal-entry-row";

    const category = deps.document.createElement("span");
    category.className = "journal-entry-category";
    category.textContent = view.category;
    row.appendChild(category);

    const link = deps.document.createElement("button");
    link.type = "button";
    link.className = "journal-entry-link";
    link.textContent = view.title;
    link.setAttribute("aria-label", view.ariaLabel);
    link.addEventListener("click", () => {
      deps.wikiRuntime?.openArticle?.(view.contentId, { reason: "journal" });
    });
    row.appendChild(link);
    list.appendChild(row);
  }
  rootEl.appendChild(list);
}

export function createJournalPanelRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const runtimeDeps = { ...deps, document: ownerDocument };
  let activeCategory = "";

  function getEntriesNewestFirst() {
    const entries = deps.journalRuntime?.getSnapshot?.().entries || [];
    return [...entries].reverse();
  }

  function syncFilterControl(entries) {
    if (!deps.filterEl) return;
    const categories = getJournalCategories(entries);
    if (activeCategory && !categories.includes(activeCategory)) {
      activeCategory = "";
    }
    clearElement(deps.filterEl);
    const allOption = ownerDocument.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    deps.filterEl.appendChild(allOption);
    for (const category of categories) {
      const option = ownerDocument.createElement("option");
      option.value = category;
      option.textContent = category;
      deps.filterEl.appendChild(option);
    }
    deps.filterEl.value = activeCategory;
  }

  function syncOpenState() {
    const open = isOpen();
    deps.openBtn?.classList?.toggle("active", open);
    deps.openBtn?.setAttribute?.("aria-pressed", open ? "true" : "false");
  }

  function syncEntryIndicators(entryCount) {
    deps.openBtn?.classList?.toggle("has-journal-entries", entryCount > 0);
    deps.openBtn?.setAttribute?.(
      "aria-label",
      entryCount > 0 ? `Open Journal, ${entryCount} entries` : "Open Journal",
    );
  }

  function open(reason = "journal-open") {
    if (reason !== "side-dock-open" && deps.requestOpen && deps.requestOpen() === false) return;
    deps.rootEl.classList.remove("hidden");
    deps.rootEl.setAttribute("aria-hidden", "false");
    sync();
  }

  function close() {
    deps.rootEl.classList.add("hidden");
    deps.rootEl.setAttribute("aria-hidden", "true");
    syncOpenState();
  }

  function isOpen() {
    return !deps.rootEl.classList.contains("hidden");
  }

  function toggle() {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  }

  function sync() {
    const entries = getEntriesNewestFirst();
    syncFilterControl(entries);
    syncEntryIndicators(entries.length);
    syncOpenState();
    const visibleEntries = filterJournalEntriesByCategory(entries, activeCategory);
    renderEntryList(deps.listEl, visibleEntries, runtimeDeps);
  }

  function bind() {
    deps.openBtn?.addEventListener("click", toggle);
    deps.closeBtn?.addEventListener("click", close);
    deps.filterEl?.addEventListener("change", () => {
      activeCategory = String(deps.filterEl.value || "");
      sync();
    });
    ownerDocument.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || deps.rootEl.classList.contains("hidden")) return;
      event.preventDefault?.();
      event.stopPropagation?.();
      close();
    }, true);
    sync();
  }

  return {
    bind,
    open,
    close,
    toggle,
    isOpen,
    sync,
  };
}

export function createJournalFeedRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const runtimeDeps = { ...deps, document: ownerDocument };
  let expanded = false;

  function getEntriesNewestFirst() {
    const entries = deps.journalRuntime?.getSnapshot?.().entries || [];
    return [...entries].reverse();
  }

  function sync() {
    const entries = getEntriesNewestFirst();
    deps.rootEl.classList.toggle("expanded", expanded);
    deps.rootEl.classList.toggle("has-journal-entries", entries.length > 0);
    deps.toggleBtn.textContent = expanded ? "-" : "+";
    deps.toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    deps.toggleBtn.setAttribute(
      "aria-label",
      expanded ? `Collapse journal feed, ${entries.length} entries` : `Expand journal feed, ${entries.length} entries`,
    );
    renderEntryList(deps.entriesEl, entries, runtimeDeps);
    if (deps.entriesEl) deps.entriesEl.scrollLeft = 0;
  }

  function bind() {
    deps.toggleBtn.addEventListener("click", () => {
      expanded = !expanded;
      sync();
    });
    deps.rootEl.addEventListener("wheel", (event) => {
      handleJournalFeedWheel(deps.entriesEl, expanded, event);
    }, { passive: false });
    sync();
  }

  return {
    bind,
    sync,
  };
}
