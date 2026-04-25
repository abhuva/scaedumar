export function updateWeatherFieldMeta(deps) {
  const splatWidth = Number(deps.splatSize && deps.splatSize.width);
  const splatHeight = Number(deps.splatSize && deps.splatSize.height);
  const width = Math.max(1, Math.floor((Number.isFinite(splatWidth) ? splatWidth : 1) * 0.25));
  const height = Math.max(1, Math.floor((Number.isFinite(splatHeight) ? splatHeight : 1) * 0.25));
  const weatherTimeSec = Number(deps.simulationWeather && deps.simulationWeather.timeSec);
  const nowSec = Number(deps.nowMs) * 0.001;
  deps.renderResources.setWeatherFieldMeta({
    width,
    height,
    updatedAtSec: Number.isFinite(weatherTimeSec) ? weatherTimeSec : (Number.isFinite(nowSec) ? nowSec : 0),
  });
}
