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
      deps.closeJournalPanel?.();
    });
    row.appendChild(link);
    list.appendChild(row);
  }
  rootEl.appendChild(list);
}

export function createJournalPanelRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const runtimeDeps = { ...deps, document: ownerDocument };

  function getEntriesNewestFirst() {
    const entries = deps.journalRuntime?.getSnapshot?.().entries || [];
    return [...entries].reverse();
  }

  function open() {
    deps.rootEl.classList.remove("hidden");
    deps.rootEl.setAttribute("aria-hidden", "false");
    sync();
  }

  function close() {
    deps.rootEl.classList.add("hidden");
    deps.rootEl.setAttribute("aria-hidden", "true");
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
    renderEntryList(deps.listEl, getEntriesNewestFirst(), {
      ...runtimeDeps,
      closeJournalPanel: close,
    });
  }

  function bind() {
    deps.openBtn?.addEventListener("click", toggle);
    deps.closeBtn?.addEventListener("click", close);
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
    deps.rootEl.classList.toggle("expanded", expanded);
    deps.toggleBtn.textContent = expanded ? "-" : "+";
    deps.toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    deps.toggleBtn.setAttribute("aria-label", expanded ? "Collapse journal feed" : "Expand journal feed");
    renderEntryList(deps.entriesEl, getEntriesNewestFirst(), runtimeDeps);
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
