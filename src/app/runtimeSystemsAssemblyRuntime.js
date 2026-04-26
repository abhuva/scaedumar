export function createRuntimeSystemsAssemblyRuntime(deps) {
  return {
    scheduler: deps.scheduler,
    movementSystem: deps.movementSystem,
    getState: deps.getState,
    clamp: deps.clamp,
    wrapHour: deps.wrapHour,
    cycleState: deps.cycleState,
    isCycleHourScrubbing: deps.isCycleHourScrubbing,
    setCycleHourSliderFromState: deps.setCycleHourSliderFromState,
    computeLightingParams: deps.computeLightingParams,
    hexToRgb01: deps.hexToRgb01,
    updateStoreTime: deps.updateStoreTime,
    updateStoreLighting: deps.updateStoreLighting,
    updateStoreFog: deps.updateStoreFog,
    updateStoreClouds: deps.updateStoreClouds,
    updateStoreWaterFx: deps.updateStoreWaterFx,
    updateStoreWeather: deps.updateStoreWeather,
    syncMapStateToStore: deps.syncMapStateToStore,
    syncPlayerStateToStore: deps.syncPlayerStateToStore,
    syncSwarmStateToStore: deps.syncSwarmStateToStore,
    syncPointLightsStateToStore: deps.syncPointLightsStateToStore,
  };
}
