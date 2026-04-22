function normalizeDirDeg(value) {
  const deg = Number(value);
  if (!Number.isFinite(deg)) return 0;
  const wrapped = deg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function createWeatherSystem(deps) {
  return {
    update(ctx, state) {
      const input = state && state.simulation && state.simulation.weather ? state.simulation.weather : {};
      const windDirDeg = normalizeDirDeg(input.windDirDeg);
      const windSpeed = deps.clamp(Number(input.windSpeed), 0, 1);
      const localModulation = deps.clamp(Number(input.localModulation), 0, 1);
      const weatherType = typeof input.type === "string" ? input.type : "clear";

      const windDirRad = (windDirDeg * Math.PI) / 180;
      const weatherState = {
        type: weatherType,
        intensity: deps.clamp(Number(input.intensity), 0, 1),
        windDirDeg,
        windSpeed,
        localModulation,
        windDirX: Math.cos(windDirRad),
        windDirY: Math.sin(windDirRad),
        timeSec: ctx.nowMs * 0.001,
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
