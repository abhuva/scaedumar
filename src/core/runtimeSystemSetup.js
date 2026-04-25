import { createTimeSystem } from "../sim/timeSystem.js";
import { createLightingSystem } from "../sim/lightingSystem.js";
import { createFogSystem } from "../sim/fogSystem.js";
import { createCloudSystem } from "../sim/cloudSystem.js";
import { createWaterFxSystem } from "../sim/waterFxSystem.js";
import { createWeatherSystem } from "../sim/weatherSystem.js";

export function setupRuntimeSystems(deps) {
  const noop = () => {};
  const systems = [
    {
      factory: createTimeSystem,
      options: {
        wrapHour: deps.wrapHour,
        cycleState: deps.cycleState,
        isCycleHourScrubbing: deps.isCycleHourScrubbing,
        setCycleHourSliderFromState: deps.setCycleHourSliderFromState,
        setTimeState: noop,
        updateStoreTime: deps.updateStoreTime,
      },
    },
    {
      factory: createLightingSystem,
      options: {
        computeLightingParams: deps.computeLightingParams,
        setLightingState: noop,
        updateStoreLighting: deps.updateStoreLighting,
      },
    },
    {
      factory: createFogSystem,
      options: {
        setFogState: noop,
        updateStoreFog: deps.updateStoreFog,
      },
    },
    {
      factory: createCloudSystem,
      options: {
        setCloudState: noop,
        updateStoreClouds: deps.updateStoreClouds,
      },
    },
    {
      factory: createWaterFxSystem,
      options: {
        hexToRgb01: deps.hexToRgb01,
        setWaterFxState: noop,
        updateStoreWaterFx: deps.updateStoreWaterFx,
      },
    },
    {
      factory: createWeatherSystem,
      options: {
        updateStoreWeather: deps.updateStoreWeather,
      },
    },
  ];

  for (const { factory, options } of systems) {
    deps.scheduler.addSystem(factory({
      clamp: deps.clamp,
      ...options,
    }));
  }

  deps.scheduler.addSystem(deps.movementSystem);
  deps.scheduler.initAll({ nowMs: 0, dtSec: 0 }, deps.getState());
  deps.syncMapStateToStore();
  deps.syncPlayerStateToStore();
  deps.syncSwarmStateToStore();
  deps.syncPointLightsStateToStore();
}
