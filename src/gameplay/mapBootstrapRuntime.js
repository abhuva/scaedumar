import { createMapBootstrap } from "./mapBootstrap.js";

export function createMapBootstrapRuntime(deps) {
  const mapBootstrap = createMapBootstrap({
    defaultMapFolderCandidates: deps.defaultMapFolderCandidates,
    loadMapFromPath: deps.loadMapFromPath,
    setStatus: deps.setStatus,
  });

  async function tryAutoLoadDefaultMap() {
    await mapBootstrap.tryAutoLoadDefaultMap();
  }

  return {
    tryAutoLoadDefaultMap,
  };
}
