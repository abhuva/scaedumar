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
        positionSmoothing: 0.4,
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
  assert.equal(settings.scout.camera.positionSmoothing, 0.4);

  const clamped = normalizeDiscoverySettings({
    timeOfDay: {
      dayRevealMultiplier: 999,
      nightRevealMultiplier: -10,
    },
    maps: {
      water: {
        decay: {
          intervalTicks: -100,
          amount: 999,
        },
      },
      tracks: {
        decay: {
          intervalTicks: 0,
          amount: -5,
        },
      },
    },
    scout: {
      scanRadius: 99999,
      revealRadius: -20,
      camera: {
        zoomIn: -1,
        zoomOut: 9999,
        speedForZoomOut: -100,
        speedSmoothing: 9,
        zoomSmoothing: -9,
        positionSmoothing: 9,
      },
    },
  });

  assert.equal(clamped.timeOfDay.dayRevealMultiplier, 4);
  assert.equal(clamped.timeOfDay.nightRevealMultiplier, 0);
  assert.equal(clamped.maps.water.decay.intervalTicks, 1);
  assert.equal(clamped.maps.water.decay.amount, 255);
  assert.equal(clamped.maps.tracks.decay.intervalTicks, 1);
  assert.equal(clamped.maps.tracks.decay.amount, 0);
  assert.equal(clamped.scout.scanRadius, 4096);
  assert.equal(clamped.scout.revealRadius, 0);
  assert.equal(clamped.scout.camera.zoomIn, 0.05);
  assert.equal(clamped.scout.camera.zoomOut, 512);
  assert.equal(clamped.scout.camera.speedForZoomOut, 1);
  assert.equal(clamped.scout.camera.speedSmoothing, 1);
  assert.equal(clamped.scout.camera.zoomSmoothing, 0);
  assert.equal(clamped.scout.camera.positionSmoothing, 1);
});
