export function createSystemStoreSyncRuntime(deps) {
  return {
    updateStoreTime: (value) => {
      const cycleSpeed = Number(value.cycleSpeedHoursPerSec);
      deps.store.update((prev) => ({
        ...prev,
        clock: {
          ...prev.clock,
          nowSec: Math.max(0, Number(value.nowSec) || 0),
          timeScale: deps.clamp(Number.isFinite(cycleSpeed) ? cycleSpeed : 0, 0, 1),
        },
        systems: {
          ...prev.systems,
          time: {
            ...prev.systems.time,
            ...value,
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
