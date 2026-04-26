export function createStatusRuntime(deps) {
  function setStatus(text) {
    if (deps && deps.statusEl) {
      deps.statusEl.textContent = text;
    }
  }

  return {
    setStatus,
  };
}
