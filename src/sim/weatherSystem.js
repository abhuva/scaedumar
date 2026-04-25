function normalizeDirDeg(value) {
  const deg = Number(value);
  if (!Number.isFinite(deg)) return 0;
  const wrapped = deg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function createWeatherSystem(deps) {
  function finite(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safeClamp(value, min, max) {
    if (typeof deps.clamp === "function") {
      return deps.clamp(value, min, max);
    }
    return Math.max(min, Math.min(max, value));
  }

  return {
    update(ctx, state) {
      const input = state && state.simulation && state.simulation.weather ? state.simulation.weather : {};
      const windDirDeg = normalizeDirDeg(finite(input.windDirDeg, 0));
      const windSpeed = safeClamp(finite(input.windSpeed, 0), 0, 1);
      const localModulation = safeClamp(finite(input.localModulation, 0), 0, 1);
      const weatherType = typeof input.type === "string" ? input.type : "clear";

      const windDirRad = (windDirDeg * Math.PI) / 180;
      const routedWeatherTimeSec = ctx && ctx.time && ctx.time.systems && ctx.time.systems.weather
        ? finite(ctx.time.systems.weather.timeSec, NaN)
        : NaN;
      const nowMs = finite(ctx && ctx.nowMs, 0);
      const weatherState = {
        type: weatherType,
        intensity: safeClamp(finite(input.intensity, 0), 0, 1),
        windDirDeg,
        windSpeed,
        localModulation,
        windDirX: Math.cos(windDirRad),
        windDirY: Math.sin(windDirRad),
        timeSec: Number.isFinite(routedWeatherTimeSec) ? routedWeatherTimeSec : (nowMs * 0.001),
      };

      if (typeof deps.setWeatherState === "function") {
        deps.setWeatherState(weatherState);
      }
      if (typeof deps.updateStoreWeather === "function") {
        deps.updateStoreWeather(weatherState);
      }
    },
  };
}
