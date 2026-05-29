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

export function handleWikiPanelKeydown(event, deps) {
  const wiki = deps.wikiRuntime.getSnapshot();
  if (!wiki.article) return false;
  if (event.key === "Escape") {
    event.preventDefault?.();
    event.stopPropagation?.();
    deps.wikiRuntime.close();
    return true;
  }
  if (event.key === "Backspace" && !isEditableKeyTarget(event.target)) {
    if (!wiki.canGoBack) return false;
    event.preventDefault?.();
    event.stopPropagation?.();
    deps.wikiRuntime.goBack();
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
  if (isOpen && !focusState.open) {
    const activeElement = deps.document?.activeElement || null;
    focusState.restoreTarget = activeElement && !containsElement(deps.rootEl, activeElement)
      ? activeElement
      : null;
  }
  if (!isOpen && focusState.open) {
    const restoreTarget = focusState.restoreTarget;
    focusState.restoreTarget = null;
    restoreTarget?.focus?.({ preventScroll: true });
  }
  focusState.open = isOpen;
  focusState.eventActive = false;
}

export function createWikiPanelRuntime(deps) {
  const ownerDocument = deps.document || globalThis.document;
  const focusState = {
    open: false,
    eventActive: false,
    restoreTarget: null,
  };

  function sync() {
    const wiki = deps.wikiRuntime.getSnapshot();
    deps.rootEl.classList.toggle("hidden", !wiki.article);
    deps.rootEl.setAttribute("aria-hidden", wiki.article ? "false" : "true");
    deps.rootEl.setAttribute("role", "region");
    deps.rootEl.removeAttribute?.("aria-modal");
    deps.helpBtn?.classList.toggle("active", wiki.helpMode);
    deps.helpBtn?.setAttribute("aria-pressed", wiki.helpMode ? "true" : "false");
    ownerDocument.body.classList.toggle("wiki-help-mode", wiki.helpMode);
    updateWikiPanelFocusState(focusState, deps, wiki, {});
    if (!wiki.article) {
      clearElement(deps.choicesEl);
      deps.choicesEl?.classList?.add("hidden");
      return;
    }
    deps.titleEl.textContent = wiki.article.title;
    deps.summaryEl.textContent = wiki.article.summary || "";
    deps.backBtn.disabled = !wiki.canGoBack;
    renderMarkdown(wiki.article.body, deps.bodyEl, ownerDocument, deps.wikiRuntime.openArticle);
  }

  function bind() {
    deps.closeBtn.addEventListener("click", () => {
      deps.wikiRuntime.close();
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
