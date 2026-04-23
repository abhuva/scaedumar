export function serializePointLightsPayload(pointLights, mapSize, deps) {
  return {
    version: 1,
    mapSize: {
      width: mapSize.width,
      height: mapSize.height,
    },
    lights: pointLights.map((light) => ({
      x: light.pixelX,
      y: light.pixelY,
      range: light.strength,
      intensity: light.intensity,
      heightOffset: light.heightOffset,
      flicker: deps.clamp(
        Number.isFinite(Number(light.flicker)) ? Number(light.flicker) : deps.defaultFlicker,
        0,
        1,
      ),
      flickerSpeed: deps.clamp(
        Number.isFinite(Number(light.flickerSpeed)) ? Number(light.flickerSpeed) : deps.defaultFlickerSpeed,
        0,
        1,
      ),
      color: [light.color[0], light.color[1], light.color[2]],
    })),
  };
}

function normalizeImportedPointLightColor(rawColor, clamp) {
  if (!Array.isArray(rawColor) || rawColor.length < 3) return null;
  const channelRaw = [Number(rawColor[0]), Number(rawColor[1]), Number(rawColor[2])];
  if (!channelRaw.every((v) => Number.isFinite(v))) return null;
  const uses255Range = channelRaw.some((v) => v > 1);
  if (uses255Range) {
    return channelRaw.map((v) => clamp(v / 255, 0, 1));
  }
  return channelRaw.map((v) => clamp(v, 0, 1));
}

export function parsePointLightsPayload(rawData, deps) {
  let rawLights = null;
  if (Array.isArray(rawData)) {
    rawLights = rawData;
  } else if (rawData && Array.isArray(rawData.lights)) {
    rawLights = rawData.lights;
  }
  if (!rawLights) {
    throw new Error("JSON must be an array of lights or an object with a lights array.");
  }

  const parsedLights = [];
  let skippedCount = 0;

  for (const rawLight of rawLights) {
    const rawX = rawLight && (rawLight.pixelX ?? rawLight.x);
    const rawY = rawLight && (rawLight.pixelY ?? rawLight.y);
    const rawStrength = rawLight && (rawLight.strength ?? rawLight.range);
    const rawIntensity = rawLight && (rawLight.intensity ?? rawLight.power ?? 1);
    const rawHeightOffset = rawLight && (rawLight.heightOffset ?? rawLight.height ?? 8);
    const rawFlicker = rawLight && (rawLight.flicker ?? rawLight.flickerAmount ?? deps.defaultFlicker);
    const rawFlickerSpeed = rawLight && (rawLight.flickerSpeed ?? rawLight.flickerRate ?? deps.defaultFlickerSpeed);
    const color = normalizeImportedPointLightColor(rawLight && rawLight.color, deps.clamp);
    const pixelX = Math.round(Number(rawX));
    const pixelY = Math.round(Number(rawY));
    const strength = Math.round(Number(rawStrength));
    const intensity = Number(rawIntensity);
    const heightOffset = Math.round(Number(rawHeightOffset));
    const flicker = Number(rawFlicker);
    const flickerSpeed = Number(rawFlickerSpeed);
    if (
      !Number.isFinite(pixelX)
      || !Number.isFinite(pixelY)
      || !Number.isFinite(strength)
      || !Number.isFinite(intensity)
      || !Number.isFinite(heightOffset)
      || !Number.isFinite(flicker)
      || !Number.isFinite(flickerSpeed)
      || !color
    ) {
      skippedCount += 1;
      continue;
    }

    parsedLights.push({
      pixelX: deps.clamp(pixelX, 0, Math.max(0, deps.mapSize.width - 1)),
      pixelY: deps.clamp(pixelY, 0, Math.max(0, deps.mapSize.height - 1)),
      strength: Math.round(deps.clamp(strength, 1, 200)),
      intensity: deps.clamp(intensity, 0, 4),
      heightOffset: Math.round(deps.clamp(heightOffset, -120, 240)),
      flicker: deps.clamp(flicker, 0, 1),
      flickerSpeed: deps.clamp(flickerSpeed, 0, 1),
      color,
    });
  }

  return { parsedLights, skippedCount };
}
