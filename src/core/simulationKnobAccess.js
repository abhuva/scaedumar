export function createSimulationKnobAccess(deps) {
  function getSimulationKnobSectionFromStore(key) {
    const simulation = deps.getCoreState().simulation || null;
    if (!simulation) return null;
    const knobs = simulation.knobs || {};
    return key in knobs ? knobs[key] : null;
  }

  return {
    getSimulationKnobSectionFromStore,
  };
}
