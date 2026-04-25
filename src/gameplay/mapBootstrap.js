export function createMapBootstrap(deps) {
  async function tryAutoLoadDefaultMap() {
    for (const candidate of deps.defaultMapFolderCandidates) {
      try {
        await deps.loadMapFromPath(candidate);
        return;
      } catch (err) {
        console.warn(`Failed to load default map folder ${candidate}`, err);
      }
    }

    deps.setStatus("Using fallback textures. Load a map folder to begin.");
  }

  return {
    tryAutoLoadDefaultMap,
  };
}
