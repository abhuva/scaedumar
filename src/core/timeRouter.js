import { DEFAULT_TIME_ROUTING } from "./state.js";

export const DEFAULT_SIM_TICK_HOURS = 0.01;
export const BASE_GLOBAL_HOURS_PER_SECOND = 0.08;
export const SIM_SECONDS_PER_HOUR = 1 / BASE_GLOBAL_HOURS_PER_SECOND;

const ROUTE_GLOBAL = "global";
const ROUTE_DETACHED = "detached";

// Fixed-timestep routing model:
// BASE_GLOBAL_HOURS_PER_SECOND and SIM_SECONDS_PER_HOUR convert simulation
// ticks into wall-clock seconds. globalDtSec and globalTimeSec are advanced
// only by whole ticks, so globalDtSec can be 0 on frames that process no
// ticks. interpolationAlpha carries the fractional remainder for smoothing
// between those discrete updates. ROUTE_GLOBAL consumers should use the
// integer-tick values plus interpolationAlpha, while ROUTE_DETACHED consumers
// should use the continuous detachedDtSec path from getRoutedSystemTime.

function finite(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRoutingMode(value, fallback = ROUTE_GLOBAL) {
  const mode = String(value || "").toLowerCase();
  if (mode === ROUTE_DETACHED) return ROUTE_DETACHED;
  if (mode === ROUTE_GLOBAL) return ROUTE_GLOBAL;
  return fallback === ROUTE_DETACHED ? ROUTE_DETACHED : ROUTE_GLOBAL;
}

export function normalizeTimeRouting(rawRouting) {
  const source = rawRouting && typeof rawRouting === "object" ? rawRouting : {};
  return {
    movement: normalizeRoutingMode(source.movement, DEFAULT_TIME_ROUTING.movement),
    swarm: normalizeRoutingMode(source.swarm, DEFAULT_TIME_ROUTING.swarm),
    clouds: normalizeRoutingMode(source.clouds, DEFAULT_TIME_ROUTING.clouds),
    water: normalizeRoutingMode(source.water, DEFAULT_TIME_ROUTING.water),
    weather: normalizeRoutingMode(source.weather, DEFAULT_TIME_ROUTING.weather),
  };
}

export function normalizeSimTickHours(value) {
  return clamp(finite(value, DEFAULT_SIM_TICK_HOURS), 0.001, 0.1);
}

export function buildFrameTimeState(input) {
  const prev = input && input.prevTimeState ? input.prevTimeState : {};
  const dtSec = clamp(finite(input && input.dtSec, 0), 0, 0.25);
  const cycleSpeedHoursPerSec = clamp(finite(input && input.cycleSpeedHoursPerSec, 0), 0, 1);
  const simTickHours = normalizeSimTickHours(
    input && input.simTickHours != null ? input.simTickHours : prev.simTickHours,
  );
  const routing = normalizeTimeRouting(
    input && input.routing != null ? input.routing : prev.routing,
  );
  const prevRemainder = clamp(finite(prev.tickRemainder, 0), 0, 1);
  const prevGlobalTimeHours = Math.max(0, finite(prev.globalTimeHours, 0));
  const prevDetachedTimeSec = Math.max(0, finite(prev.detachedTimeSec, 0));

  const rawTickDelta = (cycleSpeedHoursPerSec * dtSec) / simTickHours;
  const tickAccumulator = prevRemainder + rawTickDelta;
  const ticksProcessed = Math.max(0, Math.floor(tickAccumulator + 1e-9));
  const tickRemainder = clamp(tickAccumulator - ticksProcessed, 0, 1);
  const globalHoursAdvanced = ticksProcessed * simTickHours;
  const globalTimeHours = prevGlobalTimeHours + globalHoursAdvanced;
  const detachedTimeSec = prevDetachedTimeSec + dtSec;

  return {
    cycleSpeedHoursPerSec,
    simTickHours,
    tickRemainder,
    ticksProcessed,
    globalHoursAdvanced,
    globalTimeHours,
    globalPaused: cycleSpeedHoursPerSec <= 0,
    detachedTimeSec,
    routing,
    tickDelta: rawTickDelta,
  };
}

export function getRoutedSystemTime(frameTimeState, systemName, frameDtSec) {
  const state = frameTimeState && typeof frameTimeState === "object" ? frameTimeState : {};
  const routing = normalizeTimeRouting(state.routing);
  const route = normalizeRoutingMode(routing[systemName], DEFAULT_TIME_ROUTING[systemName] || ROUTE_GLOBAL);
  const detachedDtSec = clamp(finite(frameDtSec, 0), 0, 0.25);
  const globalTicks = Math.max(0, Math.round(finite(state.ticksProcessed, 0)));
  const simTickHours = normalizeSimTickHours(state.simTickHours);
  const globalDtSec = globalTicks * simTickHours * SIM_SECONDS_PER_HOUR;
  const globalTimeSec = Math.max(0, finite(state.globalTimeHours, 0) * SIM_SECONDS_PER_HOUR);
  const detachedTimeSec = Math.max(0, finite(state.detachedTimeSec, 0));
  const interpolationAlpha = route === ROUTE_GLOBAL
    ? clamp(finite(state.tickRemainder, 0), 0, 1)
    : 1;

  return {
    route,
    ticksProcessed: route === ROUTE_GLOBAL ? globalTicks : 0,
    dtSec: route === ROUTE_GLOBAL ? globalDtSec : detachedDtSec,
    timeSec: route === ROUTE_GLOBAL ? globalTimeSec : detachedTimeSec,
    interpolationAlpha,
    simTickHours,
  };
}
