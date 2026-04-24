export function computeFrameTiming(deps) {
  const dtSec =
    deps.frame.lastNowMs === null
      ? 0
      : Math.min(0.25, Math.max(0, (deps.nowMs - deps.frame.lastNowMs) * 0.001));
  deps.frame.lastNowMs = deps.nowMs;
  const preUpdateState = deps.getCoreState();
  const prevTimeState = preUpdateState.systems && preUpdateState.systems.time
    ? preUpdateState.systems.time
    : null;
  const cycleSpeedHoursPerSec = deps.clamp(Number(preUpdateState.clock && preUpdateState.clock.timeScale), 0, 1);
  const frameTimeState = deps.buildFrameTimeState({
    prevTimeState,
    dtSec,
    cycleSpeedHoursPerSec,
    simTickHours: deps.getConfiguredSimTickHoursFromStoreOrDefaults(),
    routing: deps.getCurrentTimeRoutingFromStoreOrDefaults(),
  });
  const routedTime = {
    movement: deps.getRoutedSystemTime(frameTimeState, "movement", dtSec),
    swarm: deps.getRoutedSystemTime(frameTimeState, "swarm", dtSec),
    clouds: deps.getRoutedSystemTime(frameTimeState, "clouds", dtSec),
    water: deps.getRoutedSystemTime(frameTimeState, "water", dtSec),
    weather: deps.getRoutedSystemTime(frameTimeState, "weather", dtSec),
  };
  const smoothCloudTimeSec = deps.getInterpolatedRoutedTimeSec(routedTime.clouds);
  return {
    dtSec,
    preUpdateState,
    frameTimeState,
    routedTime,
    smoothCloudTimeSec,
  };
}
