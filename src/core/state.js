export function createInitialState() {
  return {
    mode: "dev",
    clock: {
      nowSec: 0,
      timeScale: 1,
    },
    camera: {
      panX: 0,
      panY: 0,
      zoom: 1,
    },
    map: {
      folderPath: "",
      width: 0,
      height: 0,
      loaded: false,
    },
    systems: {
      time: {
        cycleSpeedHoursPerSec: 0,
      },
      lighting: {
        hasFrameLighting: false,
        lightingParams: null,
      },
      fog: {
        useFog: false,
      },
      clouds: {
        useClouds: false,
      },
      waterFx: {
        useWaterFx: false,
      },
      weather: {
        type: "clear",
        intensity: 0,
        windDirDeg: 0,
        windSpeed: 0,
        localModulation: 0,
      },
    },
    simulation: {
      knobs: {
        lighting: {},
        parallax: {},
        fog: {},
        clouds: {},
        waterFx: {},
      },
      weather: {
        type: "clear",
        intensity: 0,
        windDirDeg: 0,
        windSpeed: 0.2,
        localModulation: 0.15,
      },
    },
    gameplay: {
      player: {
        pixelX: 0,
        pixelY: 0,
      },
      interactionMode: "none",
      cursorLight: {
        enabled: false,
        useTerrainHeight: true,
        strength: 30,
        heightOffset: 8,
      },
      pathfinding: {
        range: 30,
        weightSlope: 1.8,
        weightHeight: 3,
        weightWater: 0,
        slopeCutoff: 90,
        baseCost: 1,
      },
      swarm: {
        enabled: false,
        count: 0,
        followEnabled: false,
        followTargetType: "agent",
      },
    },
    ui: {},
  };
}

export function createStore(initialState = createInitialState()) {
  let state = initialState;
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(nextState) {
    state = nextState;
    for (const listener of listeners) {
      listener(state);
    }
  }

  function update(updater) {
    setState(updater(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState,
    setState,
    update,
    subscribe,
  };
}
