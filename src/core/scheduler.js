export function createScheduler() {
  const systems = [];

  function addSystem(system) {
    if (!system || typeof system.update !== "function") {
      throw new Error("System must provide an update(ctx, state) function.");
    }
    systems.push(system);
  }

  function initAll(ctx, state) {
    for (const system of systems) {
      if (typeof system.init === "function") {
        system.init(ctx, state);
      }
    }
  }

  function updateAll(ctx, state) {
    for (const system of systems) {
      system.update(ctx, state);
    }
  }

  function listSystems() {
    return systems.slice();
  }

  return {
    addSystem,
    initAll,
    updateAll,
    listSystems,
  };
}
