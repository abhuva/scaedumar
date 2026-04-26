export function createTimeRoutingSettingsSyncRuntime(deps) {
  return {
    syncRoutingInput: (target, mode) => {
      if (target === "swarm" && deps.swarmTimeRoutingInput) {
        deps.swarmTimeRoutingInput.value = mode;
      }
      if (target === "clouds" && deps.cloudTimeRoutingInput) {
        deps.cloudTimeRoutingInput.value = mode;
      }
      if (target === "water" && deps.waterTimeRoutingInput) {
        deps.waterTimeRoutingInput.value = mode;
      }
    },
    syncSimTickHoursInput: (value) => {
      if (deps.simTickHoursInput) {
        deps.simTickHoursInput.value = String(value);
      }
    },
    syncCycleSpeedInput: (value) => {
      if (deps.cycleSpeedInput) {
        deps.cycleSpeedInput.value = String(value);
      }
    },
  };
}
