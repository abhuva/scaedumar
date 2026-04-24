export function createStatusRuntime(deps) {
  function setStatus(text) {
    deps.statusEl.textContent = text;
  }

  return {
    setStatus,
  };
}
