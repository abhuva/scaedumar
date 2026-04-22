const DEFAULT_WEATHER_STATE = {
  type: "clear",
  intensity: 0,
  windDirDeg: 0,
  windSpeed: 0.2,
  localModulation: 0.15,
};

export const DEFAULT_GAMEPLAY_PLAYER = {
  pixelX: 0,
  pixelY: 0,
};

export const DEFAULT_GAMEPLAY_CURSOR_LIGHT = {
  enabled: false,
  useTerrainHeight: true,
  strength: 30,
  heightOffset: 8,
};

export const DEFAULT_GAMEPLAY_PATHFINDING = {
  range: 30,
  weightSlope: 1.8,
  weightHeight: 3,
  weightWater: 0,
  slopeCutoff: 90,
  baseCost: 1,
};

export const DEFAULT_GAMEPLAY_SWARM = {
  enabled: false,
  count: 0,
  followEnabled: false,
  followTargetType: "agent",
};

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
    },
    simulation: {
      knobs: {
        lighting: {},
        parallax: {},
        fog: {},
        clouds: {},
        waterFx: {},
      },
      weather: { ...DEFAULT_WEATHER_STATE },
    },
    gameplay: {
      player: { ...DEFAULT_GAMEPLAY_PLAYER },
      interactionMode: "none",
      cursorLight: { ...DEFAULT_GAMEPLAY_CURSOR_LIGHT },
      pathfinding: { ...DEFAULT_GAMEPLAY_PATHFINDING },
      swarm: { ...DEFAULT_GAMEPLAY_SWARM },
    },
    ui: {},
  };
}

export function createStore(initialState = createInitialState()) {
  let state = initialState;
  const listeners = new Set();

  function getState() {
    return { ...state };
  }

  function setState(nextState) {
    state = nextState;
    for (const listener of listeners) {
      try {
        listener(state);
      } catch (error) {
        console.error("Store listener failed during state update:", error, state);
      }
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
