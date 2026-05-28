export function createStatusRuntime(deps) {
  function setTitleProgress(progress) {
    if (!deps || !deps.titleProgressFillEl) return;
    const value = Number(progress);
    if (!Number.isFinite(value)) return;
    const percent = Math.max(0, Math.min(100, value * 100));
    deps.titleProgressFillEl.style.width = `${percent.toFixed(1)}%`;
  }

  function setStatus(text, options = {}) {
    if (deps && deps.statusEl) {
      deps.statusEl.textContent = text;
    }
    if (deps && deps.titleStatusEl) {
      deps.titleStatusEl.textContent = text;
    }
    if (options && Object.prototype.hasOwnProperty.call(options, "progress")) {
      setTitleProgress(options.progress);
    }
  }

  return {
    setStatus,
    setTitleProgress,
  };
}
