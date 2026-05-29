export function createWikiRuntime(deps = {}) {
  const contentRegistry = deps.contentRegistry;
  const onChanged = typeof deps.onChanged === "function" ? deps.onChanged : () => {};
  const state = {
    currentId: "",
    history: [],
    helpMode: false,
    missingArticleId: "",
  };

  function getCurrentArticle() {
    return state.currentId && contentRegistry
      ? contentRegistry.getArticle(state.currentId)
      : null;
  }

  function emit(reason) {
    onChanged(getSnapshot(), reason);
  }

  function openArticle(id, options = {}) {
    const articleId = String(id || "");
    if (!articleId || !contentRegistry?.hasArticle(articleId)) {
      if (state.currentId && options.pushHistory !== false && state.currentId !== articleId) {
        state.history.push(state.currentId);
      }
      state.currentId = articleId;
      state.missingArticleId = articleId;
      if (options.exitHelpMode !== false) state.helpMode = false;
      emit(options.reason || "missing-article");
      return { ok: false, reason: "missing-article", articleId };
    }
    if (state.currentId && options.pushHistory !== false && state.currentId !== articleId) {
      state.history.push(state.currentId);
    }
    state.currentId = articleId;
    state.missingArticleId = "";
    if (options.exitHelpMode !== false) state.helpMode = false;
    emit(options.reason || "open");
    return { ok: true, article: getCurrentArticle() };
  }

  function close(options = {}) {
    if (!state.currentId && !state.helpMode) return false;
    state.currentId = "";
    state.missingArticleId = "";
    if (options.exitHelpMode !== false) state.helpMode = false;
    emit(options.reason || "close");
    return true;
  }

  function goBack() {
    const previous = state.history.pop();
    if (!previous) return false;
    state.currentId = previous;
    state.missingArticleId = contentRegistry?.hasArticle(previous) ? "" : previous;
    emit("back");
    return true;
  }

  function setHelpMode(enabled) {
    const next = Boolean(enabled);
    if (state.helpMode === next) return false;
    state.helpMode = next;
    emit(next ? "help-on" : "help-off");
    return true;
  }

  function getSnapshot() {
    const article = getCurrentArticle();
    const missingArticleId = state.missingArticleId;
    return {
      currentId: state.currentId,
      helpMode: state.helpMode,
      canGoBack: state.history.length > 0,
      article: article
        ? {
            id: article.id,
            title: article.title,
            summary: article.summary,
            category: article.category,
            tags: [...article.tags],
            related: [...article.related],
            body: article.body,
          }
        : missingArticleId
          ? {
              id: missingArticleId,
              title: "Missing Article",
              summary: `No wiki article is registered for '${missingArticleId}'.`,
              category: "missing",
              tags: [],
              related: [],
              body: `The requested wiki article '${missingArticleId}' is not available.`,
              missing: true,
            }
          : null,
    };
  }

  return {
    openArticle,
    close,
    goBack,
    setHelpMode,
    getSnapshot,
  };
}
