import test from "node:test";
import assert from "node:assert/strict";

import { createWeatherSystem } from "../src/sim/weatherSystem.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

test("weatherSystem normalizes and clamps weather state", () => {
  let frameWeather = null;
  let storeWeather = null;
  const system = createWeatherSystem({
    clamp,
    setWeatherState: (value) => {
      frameWeather = value;
    },
    updateStoreWeather: (value) => {
      storeWeather = value;
    },
  });

  system.update(
    { nowMs: 2000 },
    {
      simulation: {
        weather: {
          type: "rain",
          intensity: 1.4,
          windDirDeg: -45,
          windSpeed: 4,
          localModulation: -2,
        },
      },
    },
  );

  assert.ok(frameWeather);
  assert.equal(frameWeather.type, "rain");
  assert.equal(frameWeather.intensity, 1);
  assert.equal(frameWeather.windDirDeg, 315);
  assert.equal(frameWeather.windSpeed, 1);
  assert.equal(frameWeather.localModulation, 0);
  assert.equal(frameWeather.timeSec, 2);
  assert.ok(Math.abs(frameWeather.windDirX - Math.cos((315 * Math.PI) / 180)) < 1e-9);
  assert.ok(Math.abs(frameWeather.windDirY - Math.sin((315 * Math.PI) / 180)) < 1e-9);

  assert.deepEqual(storeWeather, frameWeather);
});
