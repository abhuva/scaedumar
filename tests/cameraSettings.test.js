import test from "node:test";
import assert from "node:assert/strict";

import {
  createCameraSettingsSerializer,
  normalizeCameraSettings,
} from "../src/gameplay/cameraSettings.js";

test("camera settings preserve optional startup pixel pose", () => {
  assert.deepEqual(
    normalizeCameraSettings({
      zoomMin: 0.1,
      zoomMax: 512,
      pixelX: 374,
      pixelY: 833,
      zoom: 25,
    }),
    {
      version: 1,
      zoomMin: 0.1,
      zoomMax: 512,
      pixelX: 374,
      pixelY: 833,
      zoom: 25,
    },
  );
});

test("camera settings applier centers pixel pose through map transform", () => {
  const calls = [];
  const serializer = createCameraSettingsSerializer({
    getCameraSettings: () => ({ zoomMin: 0.1, zoomMax: 512 }),
    defaultCameraSettings: { zoomMin: 0.1, zoomMax: 512 },
    getCameraState: () => ({ zoom: 1 }),
    mapPixelToWorld: (x, y) => ({ x: x / 100, y: y / 100 }),
    setCameraPoseToStore: (...args) => calls.push(args),
  });

  serializer.applyCameraSettingsCompat({ pixelX: 374, pixelY: 833, zoom: 25 });

  assert.deepEqual(calls, [[3.74, 8.33, 25]]);
});
