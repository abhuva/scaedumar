function clearElement(element) {
  while (element && element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function getWikiArticleLinkAriaLabel(label, articleId) {
  return `Open wiki article ${String(label || articleId || "article")}`;
}

export function getWikiChoiceAriaLabel(choice) {
  return `Choose ${String(choice?.label || choice?.id || "dialog option")}`;
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
    link.setAttribute("aria-label", getWikiArticleLinkAriaLabel(match[1], match[2]));
    link.addEventListener("click", () => openArticle(match[2], { reason: "link" }));
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

function getChoiceConsequenceText(choice) {
  if (!choice) return "";
  if (choice.consequenceVisibility === "exact") return choice.consequenceText || choice.hintText || "";
  if (choice.consequenceVisibility === "hinted" || choice.consequenceVisibility === "knowledgeBased") {
    return choice.hintText || "";
  }
  return "";
}

function isEditableKeyTarget(target) {
  if (!target) return false;
  const tagName = String(target.tagName || "").toLowerCase();
  return tagName === "input"
    || tagName === "textarea"
    || tagName === "select"
    || Boolean(target.isContentEditable);
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

function containsElement(rootEl, element) {
  if (!rootEl || !element) return false;
  if (typeof rootEl.contains === "function") return rootEl.contains(element);
  return false;
}

function closeWikiPanel(deps) {
  if (deps.eventRuntime?.getSnapshot?.().active) {
    deps.eventRuntime.closeActive();
  } else {
    deps.wikiRuntime.close();
  }
}

export function handleWikiPanelKeydown(event, deps) {
  const wiki = deps.wikiRuntime.getSnapshot();
  if (!wiki.article) return false;
  const activeEvent = deps.eventRuntime?.getSnapshot?.().active || null;
  if (event.key === "Escape") {
    event.preventDefault?.();
    event.stopPropagation?.();
    closeWikiPanel(deps);
    return true;
  }
  if (event.key === "Backspace" && !isEditableKeyTarget(event.target)) {
    if (!wiki.canGoBack) return false;
    event.preventDefault?.();
    event.stopPropagation?.();
    deps.wikiRuntime.goBack();
    return true;
  }
  if (event.key === "Tab" && activeEvent) {
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

export function handleWikiHelpClick(event, deps) {
  if (!deps.wikiRuntime.getSnapshot().helpMode) return false;
  if (event.target?.closest?.("[data-wiki-help-ignore]")) return false;
  const target = event.target?.closest?.("[data-wiki-id]") || null;
  if (target === deps.helpBtn) return false;
  event.preventDefault?.();
  event.stopPropagation?.();
  if (target) {
    deps.wikiRuntime.openArticle(target.dataset.wikiId, { reason: "help-target" });
  } else {
    deps.wikiRuntime.openArticle("wiki.index", { reason: "help-fallback" });
  }
  return true;
}

export function updateWikiPanelFocusState(focusState, deps, wiki, eventSnapshot) {
  const isOpen = Boolean(wiki.article);
  const isEventActive = Boolean(eventSnapshot.active);
  if (isOpen && !focusState.open) {
    const activeElement = deps.document?.activeElement || null;
    focusState.restoreTarget = activeElement && !containsElement(deps.rootEl, activeElement)
      ? activeElement
      : null;
  }
  if (isOpen && isEventActive && !focusState.eventActive) {
    const focusable = getFocusableElements(deps.rootEl);
    focusable[0]?.focus?.({ preventScroll: true });
  }
  if (!isOpen && focusState.open) {
    const restoreTarget = focusState.restoreTarget;
    focusState.restoreTarget = null;
    restoreTarget?.focus?.({ preventScroll: true });
  }
  focusState.open = isOpen;
  focusState.eventActive = isEventActive;
}

export function createWikiPanelRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const focusState = {
    open: false,
    eventActive: false,
    restoreTarget: null,
  };

  function renderChoices(activeEvent) {
    if (!deps.choicesEl) return;
    clearElement(deps.choicesEl);
    const choices = activeEvent && Array.isArray(activeEvent.choices) ? activeEvent.choices : [];
    deps.choicesEl.classList.toggle("hidden", choices.length === 0);
    if (activeEvent?.error?.message) {
      const error = ownerDocument.createElement("div");
      error.className = "wiki-choice-error";
      error.textContent = activeEvent.error.message;
      deps.choicesEl.appendChild(error);
    }
    for (const choice of choices) {
      const button = ownerDocument.createElement("button");
      button.type = "button";
      button.className = "wiki-choice-btn";
      button.setAttribute("aria-label", getWikiChoiceAriaLabel(choice));
      const label = ownerDocument.createElement("span");
      label.className = "wiki-choice-label";
      label.textContent = choice.label || choice.id;
      button.appendChild(label);
      const consequenceText = getChoiceConsequenceText(choice);
      if (consequenceText) {
        const consequence = ownerDocument.createElement("span");
        consequence.className = "wiki-choice-consequence";
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
    const wiki = deps.wikiRuntime.getSnapshot();
    const eventSnapshot = deps.eventRuntime?.getSnapshot?.() || {};
    deps.rootEl.classList.toggle("hidden", !wiki.article);
    deps.rootEl.setAttribute("aria-hidden", wiki.article ? "false" : "true");
    deps.rootEl.setAttribute("role", eventSnapshot.active ? "dialog" : "region");
    if (eventSnapshot.active) {
      deps.rootEl.setAttribute("aria-modal", "true");
    } else {
      deps.rootEl.removeAttribute?.("aria-modal");
    }
    deps.helpBtn?.classList.toggle("active", wiki.helpMode);
    deps.helpBtn?.setAttribute("aria-pressed", wiki.helpMode ? "true" : "false");
    ownerDocument.body.classList.toggle("wiki-help-mode", wiki.helpMode);
    updateWikiPanelFocusState(focusState, deps, wiki, eventSnapshot);
    if (!wiki.article) {
      clearElement(deps.choicesEl);
      deps.choicesEl?.classList?.add("hidden");
      return;
    }
    deps.titleEl.textContent = wiki.article.title;
    deps.summaryEl.textContent = wiki.article.summary || "";
    deps.backBtn.disabled = !wiki.canGoBack;
    renderMarkdown(wiki.article.body, deps.bodyEl, ownerDocument, deps.wikiRuntime.openArticle);
    renderChoices(eventSnapshot.active);
  }

  function bind() {
    deps.closeBtn.addEventListener("click", () => {
      closeWikiPanel(deps);
    });
    deps.backBtn.addEventListener("click", () => deps.wikiRuntime.goBack());
    deps.resetStateBtn?.addEventListener("click", () => {
      deps.resetEventDialogState?.();
    });
    ownerDocument.addEventListener("keydown", (event) => {
      handleWikiPanelKeydown(event, deps);
    }, true);
    deps.helpBtn?.addEventListener("click", () => {
      const { helpMode } = deps.wikiRuntime.getSnapshot();
      deps.wikiRuntime.setHelpMode(!helpMode);
    });
    ownerDocument.addEventListener("click", (event) => {
      handleWikiHelpClick(event, deps);
    }, true);
    sync();
  }

  return {
    bind,
    sync,
  };
}
