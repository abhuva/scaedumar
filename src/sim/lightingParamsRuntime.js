export function createLightingParamsRuntime(deps) {
  function computeLightingParams(coreState = null) {
    const simulation = coreState && coreState.simulation ? coreState.simulation : null;
    const knobs = simulation && simulation.knobs ? simulation.knobs : null;
    const coreCamera = coreState && coreState.camera ? coreState.camera : null;
    const cameraZoom = coreCamera && Number.isFinite(Number(coreCamera.zoom)) ? Number(coreCamera.zoom) : 1;
    const lightingSettings = knobs && knobs.lighting
      ? knobs.lighting
      : deps.getSettingsDefaults("lighting", deps.defaultLightingSettings);
    const fogSettings = knobs && knobs.fog ? knobs.fog : deps.getSettingsDefaults("fog", deps.defaultFogSettings);
    const sun = deps.sampleSunAtHour(deps.cycleState.hour);
    const moonTrack = deps.sampleSunAtHour(deps.wrapHour(deps.cycleState.hour + 12));
    const azimuthRad = sun.azimuthDeg * Math.PI / 180;
    const altitudeRad = sun.altitudeDeg * Math.PI / 180;
    const cosAlt = Math.cos(altitudeRad);
    const sunDir = [
      Math.cos(azimuthRad) * cosAlt,
      Math.sin(azimuthRad) * cosAlt,
      Math.sin(altitudeRad),
    ];
    const moonAzimuthRad = moonTrack.azimuthDeg * Math.PI / 180;
    const moonAltitudeDeg = moonTrack.altitudeDeg * 0.9;
    const moonAltitudeRad = moonAltitudeDeg * Math.PI / 180;
    const moonCosAlt = Math.cos(moonAltitudeRad);
    const moonDir = [
      Math.cos(moonAzimuthRad) * moonCosAlt,
      Math.sin(moonAzimuthRad) * moonCosAlt,
      Math.sin(moonAltitudeRad),
    ];

    const ambientBase = deps.clamp(Number(lightingSettings.ambient), 0, 1);
    const diffuseBase = deps.clamp(Number(lightingSettings.diffuse), 0, 2);
    const sunVisible = deps.smoothstep(-4, 2, sun.altitudeDeg);
    const moonVisible = deps.smoothstep(-10, 6, moonAltitudeDeg);
    const sunStrength = sunVisible * diffuseBase;
    const moonStrength = 0.22 * moonVisible * diffuseBase;

    const moonAmbientColor = [0.20, 0.26, 0.40];
    const sunAmbientWeight = sun.ambientScale;
    const moonAmbientWeight = 0.24 * moonVisible;
    const totalAmbientWeight = sunAmbientWeight + moonAmbientWeight;
    let ambientColor = [0.08, 0.10, 0.14];
    if (totalAmbientWeight > 0.0001) {
      ambientColor = [
        (sun.ambientColor[0] * sunAmbientWeight + moonAmbientColor[0] * moonAmbientWeight) / totalAmbientWeight,
        (sun.ambientColor[1] * sunAmbientWeight + moonAmbientColor[1] * moonAmbientWeight) / totalAmbientWeight,
        (sun.ambientColor[2] * sunAmbientWeight + moonAmbientColor[2] * moonAmbientWeight) / totalAmbientWeight,
      ];
    }
    const nightFactor = 1 - deps.smoothstep(-2, 8, sun.altitudeDeg);
    const nightAmbientColor = [0.14, 0.22, 0.34];
    ambientColor = deps.lerpVec3(ambientColor, nightAmbientColor, 0.45 * nightFactor);
    const ambientFinal = deps.clamp(ambientBase * (sunAmbientWeight + moonAmbientWeight) + 0.05 * nightFactor, 0, 1);
    const moonColor = [0.34, 0.40, 0.54];
    const zoomNorm = deps.clamp((cameraZoom - deps.zoomMin) / (deps.zoomMax - deps.zoomMin), 0, 1);
    const cameraHeightNorm = 1 - zoomNorm;

    const fogSunWeight = 0.16 + 0.28 * sunVisible;
    const fogMoonWeight = 0.10 * moonVisible;
    const fogAmbientWeight = 0.70;
    const fogBaseWeight = 0.35;
    const fogBaseColor = [0.34, 0.40, 0.46];
    const fogWeightSum = fogSunWeight + fogMoonWeight + fogAmbientWeight + fogBaseWeight;
    const fogColorAuto = [
      (sun.sunColor[0] * fogSunWeight + moonColor[0] * fogMoonWeight + ambientColor[0] * fogAmbientWeight + fogBaseColor[0] * fogBaseWeight) / fogWeightSum,
      (sun.sunColor[1] * fogSunWeight + moonColor[1] * fogMoonWeight + ambientColor[1] * fogAmbientWeight + fogBaseColor[1] * fogBaseWeight) / fogWeightSum,
      (sun.sunColor[2] * fogSunWeight + moonColor[2] * fogMoonWeight + ambientColor[2] * fogAmbientWeight + fogBaseColor[2] * fogBaseWeight) / fogWeightSum,
    ];
    const resolvedFogColorManual = fogSettings ? Boolean(fogSettings.fogColorManual) : deps.getFogColorManual();
    const autoFogHex = deps.rgbToHex(fogColorAuto);
    const fogColor = resolvedFogColorManual
      ? deps.hexToRgb01(typeof fogSettings.fogColor === "string" ? fogSettings.fogColor : "#ffffff")
      : fogColorAuto;
    const skySunWeight = 0.65 * sunVisible;
    const skyMoonWeight = 0.35 * moonVisible;
    const skyBaseWeight = 0.45;
    const skyBaseColor = [0.18, 0.24, 0.33];
    const skyWeightSum = skySunWeight + skyMoonWeight + skyBaseWeight;
    const skyColor = [
      (sun.sunColor[0] * skySunWeight + moonColor[0] * skyMoonWeight + skyBaseColor[0] * skyBaseWeight) / skyWeightSum,
      (sun.sunColor[1] * skySunWeight + moonColor[1] * skyMoonWeight + skyBaseColor[1] * skyBaseWeight) / skyWeightSum,
      (sun.sunColor[2] * skySunWeight + moonColor[2] * skyMoonWeight + skyBaseColor[2] * skyBaseWeight) / skyWeightSum,
    ];

    return {
      sun,
      sunDir,
      sunStrength,
      moonDir,
      moonColor,
      moonStrength,
      ambientColor,
      ambientFinal,
      fogColor,
      autoFogHex,
      fogColorManual: resolvedFogColorManual,
      skyColor,
      cameraHeightNorm,
    };
  }

  return {
    computeLightingParams,
  };
}
