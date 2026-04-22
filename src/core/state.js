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
    systems: {},
    gameplay: {},
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
