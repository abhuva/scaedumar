import {
  formatContentValidationError,
  isContentValidationError,
} from "../content/contentValidationError.js";

export function createMapBootstrap(deps) {
  async function tryAutoLoadDefaultMap() {
    for (const candidate of deps.defaultMapFolderCandidates) {
      try {
        await deps.loadMapFromPath(candidate);
        return;
      } catch (err) {
        if (isContentValidationError(err)) {
          deps.setStatus(formatContentValidationError(err), { kind: "error", progress: 1 });
          throw err;
        }
        console.warn(`Failed to load default map folder ${candidate}`, err);
      }
    }

    deps.setStatus("Using fallback textures. Load a map folder to begin.");
  }

  return {
    tryAutoLoadDefaultMap,
  };
}
