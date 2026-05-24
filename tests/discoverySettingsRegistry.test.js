import test from "node:test";
import assert from "node:assert/strict";

import { normalizeDiscoverySettings } from "../src/gameplay/discoverySettingsRegistry.js";

test("normalizeDiscoverySettings clamps scout and day-night reveal settings", () => {
  const settings = normalizeDiscoverySettings({
    timeOfDay: {
      dayRevealMultiplier: 2,
      nightRevealMultiplier: 0.4,
    },
    maps: {
      water: {
        decay: {
          enabled: false,
          intervalTicks: 250,
          amount: 3,
        },
      },
      tracks: {
        decay: {
          intervalTicks: 100,
          amount: 8,
        },
      },
    },
    scout: {
      scanRadius: 45,
      revealRadius: 80,
      camera: {
        speedZoomEnabled: false,
        zoomIn: 60,
        zoomOut: 8,
        speedForZoomOut: 180,
        speedSmoothing: 0.2,
        zoomSmoothing: 0.3,
      },
    },
  });

  assert.equal(settings.timeOfDay.dayRevealMultiplier, 2);
  assert.equal(settings.timeOfDay.nightRevealMultiplier, 0.4);
  assert.equal(settings.maps.water.decay.enabled, false);
  assert.equal(settings.maps.water.decay.intervalTicks, 250);
  assert.equal(settings.maps.water.decay.amount, 3);
  assert.equal(settings.maps.tracks.decay.enabled, true);
  assert.equal(settings.maps.tracks.decay.intervalTicks, 100);
  assert.equal(settings.maps.tracks.decay.amount, 8);
  assert.equal(settings.scout.scanRadius, 45);
  assert.equal(settings.scout.revealRadius, 80);
  assert.equal(settings.scout.camera.speedZoomEnabled, false);
  assert.equal(settings.scout.camera.zoomIn, 60);
  assert.equal(settings.scout.camera.zoomOut, 8);
  assert.equal(settings.scout.camera.speedForZoomOut, 180);
  assert.equal(settings.scout.camera.speedSmoothing, 0.2);
  assert.equal(settings.scout.camera.zoomSmoothing, 0.3);
});
