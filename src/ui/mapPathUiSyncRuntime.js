export function createMapPathUiSyncRuntime(deps) {
  return {
    syncMapPathInput: (nextPath) => {
      if (deps.mapPathInput) {
        deps.mapPathInput.value = nextPath;
      }
    },
  };
}
