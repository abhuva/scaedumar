import test from "node:test";
import assert from "node:assert/strict";

import { createSystemStoreSyncRuntime } from "../src/core/systemStoreSyncRuntime.js";

function createStore(initialState) {
  let state = initialState;
  return {
    getState: () => state,
    update: (updater) => {
      state = updater(state);
    },
  };
}

function createRuntime() {
  const store = createStore({
    clock: {
      nowSec: 0,
      timeScale: 0,
    },
    systems: {
      time: {
        cycleSpeedHoursPerSec: 0,
      },
      lighting: {},
      fog: {},
      clouds: {},
      waterFx: {},
    },
    simulation: {
      weather: {},
    },
    ui: {
      cycleHour: 0,
    },
  });
  const runtime = createSystemStoreSyncRuntime({
    store,
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    cycleState: { hour: 14.25 },
  });
  return { store, runtime };
}

test("systemStoreSyncRuntime updates time state", () => {
  const { store, runtime } = createRuntime();
  runtime.updateStoreTime({
    nowSec: 12,
    cycleSpeedHoursPerSec: 4,
    ticksProcessed: 3,
  });
  assert.deepEqual(store.getState().clock, {
    nowSec: 12,
    timeScale: 1,
  });
  assert.deepEqual(store.getState().systems.time, {
    cycleSpeedHoursPerSec: 1,
    nowSec: 12,
    ticksProcessed: 3,
    globalTimeHours: 0,
  });
  assert.equal(store.getState().ui.cycleHour, 14.25);
});

test("systemStoreSyncRuntime updates lighting state", () => {
  const { store, runtime } = createRuntime();
  runtime.updateStoreLighting({ ambient: 0.3 });
  assert.deepEqual(store.getState().systems.lighting, { ambient: 0.3 });
});

test("systemStoreSyncRuntime updates fog state", () => {
  const { store, runtime } = createRuntime();
  runtime.updateStoreFog({ enabled: true });
  assert.deepEqual(store.getState().systems.fog, { enabled: true });
});

test("systemStoreSyncRuntime updates cloud state", () => {
  const { store, runtime } = createRuntime();
  runtime.updateStoreClouds({ coverage: 0.5 });
  assert.deepEqual(store.getState().systems.clouds, { coverage: 0.5 });
});

test("systemStoreSyncRuntime updates water FX state", () => {
  const { store, runtime } = createRuntime();
  runtime.updateStoreWaterFx({ useWaterFx: true });
  assert.deepEqual(store.getState().systems.waterFx, { useWaterFx: true });
});

test("systemStoreSyncRuntime updates weather state", () => {
  const { store, runtime } = createRuntime();
  runtime.updateStoreWeather({ type: "rain", intensity: 0.4 });
  assert.deepEqual(store.getState().simulation.weather, {
    type: "rain",
    intensity: 0.4,
  });
});

test("systemStoreSyncRuntime normalizes invalid cycle speed when syncing time", () => {
  const { store, runtime } = createRuntime();
  runtime.updateStoreTime({
    nowSec: Number.NaN,
    cycleSpeedHoursPerSec: Number.NaN,
    ticksProcessed: Number.NaN,
  });
  assert.equal(store.getState().clock.timeScale, 0);
  assert.equal(store.getState().clock.nowSec, 0);
  assert.equal(store.getState().systems.time.cycleSpeedHoursPerSec, 0);
  assert.equal(store.getState().systems.time.nowSec, 0);
  assert.equal(store.getState().systems.time.ticksProcessed, 0);
});
