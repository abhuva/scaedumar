export function createSystemStoreSyncRuntime(deps) {
  return {
    updateStoreTime: (value) => {
      const cycleSpeed = Number(value && value.cycleSpeedHoursPerSec);
      const normalizedCycleSpeed = deps.clamp(Number.isFinite(cycleSpeed) ? cycleSpeed : 0, 0, 1);
      const rawNowSec = Number(value && value.nowSec);
      const nowSec = Math.max(0, Number.isFinite(rawNowSec) ? rawNowSec : 0);
      const rawTicksProcessed = Number(value && value.ticksProcessed);
      const ticksProcessed = Math.max(0, Number.isFinite(rawTicksProcessed) ? rawTicksProcessed : 0);
      const rawGlobalTimeHours = Number(value && value.globalTimeHours);
      const globalTimeHours = Number.isFinite(rawGlobalTimeHours) ? rawGlobalTimeHours : 0;
      deps.store.update((prev) => ({
        ...prev,
        clock: {
          ...prev.clock,
          nowSec,
          timeScale: normalizedCycleSpeed,
        },
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            ...(value && typeof value === "object" ? value : {}),
            cycleSpeedHoursPerSec: normalizedCycleSpeed,
            nowSec,
            ticksProcessed,
            globalTimeHours,
          },
        },
        ui: {
          ...prev.ui,
          cycleHour: deps.cycleState.hour,
        },
      }));
    },
    updateStoreLighting: (value) => {
      deps.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          lighting: {
            ...prev.systems.lighting,
            ...value,
          },
        },
      }));
    },
    updateStoreFog: (value) => {
      deps.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          fog: {
            ...prev.systems.fog,
            ...value,
          },
        },
      }));
    },
    updateStoreClouds: (value) => {
      deps.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          clouds: {
            ...prev.systems.clouds,
            ...value,
          },
        },
      }));
    },
    updateStoreWaterFx: (value) => {
      deps.store.update((prev) => ({
        ...prev,
        systems: {
          ...prev.systems,
          waterFx: {
            ...prev.systems.waterFx,
            ...value,
          },
        },
      }));
    },
    updateStoreWeather: (value) => {
      deps.store.update((prev) => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          weather: {
            ...prev.simulation.weather,
            ...value,
          },
        },
      }));
    },
  };
}
