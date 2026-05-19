import test from "node:test";
import assert from "node:assert/strict";

import {
  computeGameTimeDioramaState,
  findDaylightWindow,
  findNearestGameTimeSpeedPreset,
} from "../src/ui/gameTimeDioramaRuntime.js";

function makeSunModel(startHour, endHour) {
  return (hour) => {
    const daylight = endHour - startHour;
    const progress = (hour - startHour) / daylight;
    return {
      altitudeDeg: Math.sin(progress * Math.PI) * 64,
    };
  };
}

test("findDaylightWindow derives horizon crossings from the sun model", () => {
  const daylightWindow = findDaylightWindow(makeSunModel(4, 22));
  assert.equal(Math.round(daylightWindow.start), 4);
  assert.equal(Math.round(daylightWindow.end), 22);
});

test("computeGameTimeDioramaState hides sun outside model daylight", () => {
  const sampleSunAtHour = makeSunModel(4, 22);
  const daytime = computeGameTimeDioramaState({ hour: 13, sampleSunAtHour });
  const nighttime = computeGameTimeDioramaState({ hour: 23, sampleSunAtHour });

  assert.equal(daytime.sunVisible, true);
  assert.equal(daytime.moonVisible, false);
  assert.equal(nighttime.sunVisible, false);
  assert.equal(nighttime.moonVisible, true);
});

test("findNearestGameTimeSpeedPreset only marks close preset speeds active", () => {
  assert.equal(findNearestGameTimeSpeedPreset(0.01).label, "1x");
  assert.equal(findNearestGameTimeSpeedPreset(1).label, "100x");
  assert.equal(findNearestGameTimeSpeedPreset(0.123), null);
});
