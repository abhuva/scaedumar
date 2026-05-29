function clearElement(element) {
  while (element && element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function getChoiceConsequenceText(choice) {
  if (!choice) return "";
  if (choice.consequenceVisibility === "exact") return choice.consequenceText || choice.hintText || "";
  if (choice.consequenceVisibility === "hinted" || choice.consequenceVisibility === "knowledgeBased") {
    return choice.hintText || "";
  }
  return "";
}

function getFocusableElements(rootEl) {
  if (!rootEl || typeof rootEl.querySelectorAll !== "function") return [];
  return Array.from(rootEl.querySelectorAll([
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(","))).filter((element) => !element.hidden && element.getAttribute?.("aria-hidden") !== "true");
}

function appendInlineMarkdown(parent, text, ownerDocument, openArticle) {
  const source = String(text || "");
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  for (const match of source.matchAll(linkPattern)) {
    if (match.index > cursor) {
      parent.appendChild(ownerDocument.createTextNode(source.slice(cursor, match.index)));
    }
    const link = ownerDocument.createElement("button");
    link.type = "button";
    link.className = "wiki-link-btn";
    link.textContent = match[1];
    link.setAttribute("aria-label", `Open wiki article ${String(match[1] || match[2] || "article")}`);
    link.addEventListener("click", () => openArticle(match[2], { reason: "encounter-link" }));
    parent.appendChild(link);
    cursor = match.index + match[0].length;
  }
  if (cursor < source.length) {
    parent.appendChild(ownerDocument.createTextNode(source.slice(cursor)));
  }
}

function renderMarkdown(markdown, rootEl, ownerDocument, openArticle) {
  clearElement(rootEl);
  const lines = String(markdown || "").split(/\r?\n/);
  let listEl = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      listEl = null;
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      listEl = null;
      const level = String(Math.min(3, heading[1].length + 1));
      const el = ownerDocument.createElement(`h${level}`);
      el.textContent = heading[2];
      rootEl.appendChild(el);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(trimmed);
    if (bullet) {
      if (!listEl) {
        listEl = ownerDocument.createElement("ul");
        rootEl.appendChild(listEl);
      }
      const item = ownerDocument.createElement("li");
      appendInlineMarkdown(item, bullet[1], ownerDocument, openArticle);
      listEl.appendChild(item);
      continue;
    }
    listEl = null;
    const paragraph = ownerDocument.createElement("p");
    appendInlineMarkdown(paragraph, trimmed, ownerDocument, openArticle);
    rootEl.appendChild(paragraph);
  }
}

export function createEncounterArticleView(activeEvent, getArticle) {
  if (!activeEvent) return null;
  const contentId = String(activeEvent.contentId || "");
  const article = typeof getArticle === "function" ? getArticle(contentId) : null;
  return article
    ? {
        id: article.id,
        title: article.title,
        summary: article.summary || "",
        body: article.bodyResolved || article.body || "",
        missing: false,
      }
    : {
        id: contentId,
        title: "Missing Encounter Content",
        summary: `No article is registered for '${contentId}'.`,
        body: `The encounter content '${contentId}' is not available.`,
        missing: true,
      };
}

export function getEncounterChoiceAriaLabel(choice) {
  return `Choose ${String(choice?.label || choice?.id || "encounter option")}`;
}

export function handleEncounterPanelKeydown(event, deps) {
  const activeEvent = deps.eventRuntime?.getSnapshot?.().active || null;
  if (!activeEvent) return false;
  if (event.key === "Escape") {
    event.preventDefault?.();
    event.stopPropagation?.();
    deps.eventRuntime?.closeActive?.();
    return true;
  }
  if (event.key === "Tab") {
    const focusable = getFocusableElements(deps.rootEl);
    if (focusable.length === 0) {
      event.preventDefault?.();
      event.stopPropagation?.();
      return true;
    }
    const currentIndex = focusable.indexOf(deps.document?.activeElement);
    const nextIndex = event.shiftKey
      ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
      : (currentIndex < 0 || currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1);
    event.preventDefault?.();
    event.stopPropagation?.();
    focusable[nextIndex]?.focus?.();
    return true;
  }
  return false;
}

export function updateEncounterPanelFocusState(focusState, deps, activeEvent) {
  const isOpen = Boolean(activeEvent);
  if (isOpen && !focusState.open) {
    focusState.restoreTarget = deps.document?.activeElement || null;
    const focusable = getFocusableElements(deps.rootEl);
    focusable[0]?.focus?.({ preventScroll: true });
  }
  if (!isOpen && focusState.open) {
    const restoreTarget = focusState.restoreTarget;
    focusState.restoreTarget = null;
    restoreTarget?.focus?.({ preventScroll: true });
  }
  focusState.open = isOpen;
}

export function createEncounterPanelRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const focusState = {
    open: false,
    restoreTarget: null,
  };
  let activeHighlightSource = "";

  function syncUiHighlights(activeEvent) {
    const nextSource = activeEvent ? `encounter:${activeEvent.id}` : "";
    if (activeHighlightSource && activeHighlightSource !== nextSource) {
      deps.uiHighlightRuntime?.clearSource?.(activeHighlightSource);
      activeHighlightSource = "";
    }
    if (!activeEvent) return;
    activeHighlightSource = nextSource;
    deps.uiHighlightRuntime?.setHighlights?.(nextSource, activeEvent.uiHighlights || []);
  }

  function renderChoices(activeEvent) {
    clearElement(deps.choicesEl);
    const choices = activeEvent && Array.isArray(activeEvent.choices) ? activeEvent.choices : [];
    const hasError = Boolean(activeEvent?.error?.message);
    deps.choicesEl.classList.toggle("hidden", choices.length === 0 && !hasError);
    if (activeEvent?.error?.message) {
      const error = ownerDocument.createElement("div");
      error.className = "encounter-choice-error";
      error.textContent = activeEvent.error.message;
      deps.choicesEl.appendChild(error);
    }
    for (const choice of choices) {
      const button = ownerDocument.createElement("button");
      button.type = "button";
      button.className = "encounter-choice-btn";
      button.setAttribute("aria-label", getEncounterChoiceAriaLabel(choice));
      const label = ownerDocument.createElement("span");
      label.className = "encounter-choice-label";
      label.textContent = choice.label || choice.id;
      button.appendChild(label);
      const consequenceText = getChoiceConsequenceText(choice);
      if (consequenceText) {
        const consequence = ownerDocument.createElement("span");
        consequence.className = "encounter-choice-consequence";
        consequence.textContent = consequenceText;
        button.appendChild(consequence);
      }
      button.addEventListener("click", () => {
        deps.eventRuntime?.chooseActiveChoice?.(choice.id);
      });
      deps.choicesEl.appendChild(button);
    }
  }

  function sync() {
    const activeEvent = deps.eventRuntime?.getSnapshot?.().active || null;
    const visible = Boolean(activeEvent);
    syncUiHighlights(activeEvent);
    deps.backdropEl?.classList.toggle("hidden", !visible);
    deps.rootEl.classList.toggle("hidden", !visible);
    deps.rootEl.setAttribute("aria-hidden", visible ? "false" : "true");
    updateEncounterPanelFocusState(focusState, deps, activeEvent);
    if (!activeEvent) {
      clearElement(deps.bodyEl);
      clearElement(deps.choicesEl);
      return;
    }
    const article = createEncounterArticleView(activeEvent, deps.getArticle);
    deps.titleEl.textContent = article.title;
    deps.summaryEl.textContent = article.summary || "";
    renderMarkdown(article.body, deps.bodyEl, ownerDocument, deps.wikiRuntime?.openArticle || (() => {}));
    renderChoices(activeEvent);
  }

  function bind() {
    deps.closeBtn.addEventListener("click", () => deps.eventRuntime?.closeActive?.());
    ownerDocument.addEventListener("keydown", (event) => {
      handleEncounterPanelKeydown(event, {
        ...deps,
        document: ownerDocument,
      });
    }, true);
    sync();
  }

  return {
    bind,
    sync,
  };
}
