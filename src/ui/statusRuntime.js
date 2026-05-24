export function createStatusRuntime(deps) {
  function setStatus(text) {
    if (deps && deps.statusEl) {
      deps.statusEl.textContent = text;
    }
    if (deps && deps.titleStatusEl) {
      deps.titleStatusEl.textContent = text;
    }
  }

  return {
    setStatus,
  };
}
