export const VERT_SRC = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uSplat;
uniform sampler2D uNormals;
uniform sampler2D uHeight;
uniform sampler2D uPointLightTex;
uniform sampler2D uCloudNoiseTex;
uniform sampler2D uShadowTex;
uniform sampler2D uWater;
uniform sampler2D uFlowMap;
uniform float uUseCursorLight;
uniform vec2 uCursorLightUv;
uniform vec3 uCursorLightColor;
uniform float uCursorLightStrength;
uniform float uCursorLightHeightOffset;
uniform float uUseCursorTerrainHeight;
uniform vec2 uCursorLightMapSize;
uniform vec2 uMapTexelSize;
uniform vec2 uResolution;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunStrength;
uniform vec3 uMoonDir;
uniform vec3 uMoonColor;
uniform float uMoonStrength;
uniform vec3 uAmbientColor;
uniform float uAmbient;
uniform float uHeightScale;
uniform float uShadowStrength;
uniform float uUseShadows;
uniform float uUseParallax;
uniform float uParallaxStrength;
uniform float uParallaxBands;
uniform float uZoom;
uniform float uUseFog;
uniform vec3 uFogColor;
uniform float uFogMinAlpha;
uniform float uFogMaxAlpha;
uniform float uFogFalloff;
uniform float uFogStartOffset;
uniform float uCameraHeightNorm;
uniform float uUseVolumetric;
uniform float uVolumetricStrength;
uniform float uVolumetricDensity;
uniform float uVolumetricAnisotropy;
uniform float uVolumetricLength;
uniform float uVolumetricSamples;
uniform float uMapAspect;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;
uniform float uTimeSec;
uniform float uCloudTimeSec;
uniform float uWaterTimeSec;
uniform float uPointFlickerEnabled;
uniform float uPointFlickerStrength;
uniform float uPointFlickerSpeed;
uniform float uPointFlickerSpatial;
uniform float uUseClouds;
uniform float uCloudCoverage;
uniform float uCloudSoftness;
uniform float uCloudOpacity;
uniform float uCloudScale;
uniform float uCloudSpeed1;
uniform float uCloudSpeed2;
uniform float uCloudSunParallax;
uniform float uCloudUseSunProjection;
uniform float uUseWaterFx;
uniform float uWaterFlowDownhill;
uniform float uWaterFlowInvertDownhill;
uniform float uWaterFlowDebug;
uniform vec2 uWaterFlowDir;
uniform float uWaterLocalFlowMix;
uniform float uWaterDownhillBoost;
uniform float uWaterFlowStrength;
uniform float uWaterFlowSpeed;
uniform float uWaterFlowScale;
uniform float uWaterShimmerStrength;
uniform float uWaterGlintStrength;
uniform float uWaterGlintSharpness;
uniform float uWaterShoreFoamStrength;
uniform float uWaterShoreWidth;
uniform float uWaterReflectivity;
uniform vec3 uWaterTintColor;
uniform float uWaterTintStrength;
uniform vec3 uSkyColor;

float readHeight(vec2 uv) {
  return texture(uHeight, uv).r * uHeightScale;
}

vec2 applyParallax(vec2 baseUv, vec2 focalUv) {
  if (uUseParallax < 0.5) return baseUv;

  float hRaw = texture(uHeight, baseUv).r;
  vec2 fromFocal = baseUv - focalUv;
  float dist = length(fromFocal);
  float edgeBoost = smoothstep(0.0, 0.9, dist);
  float zoomNorm = max(0.35, uZoom);
  float amount = uParallaxStrength * (0.35 + 0.65 * edgeBoost) * zoomNorm;

  float centeredHeight = hRaw - 0.5;
  vec2 continuousOffset = -fromFocal * (centeredHeight * amount * 0.48);

  float bandSteps = max(2.0, uParallaxBands);
  float bandNorm = floor(hRaw * bandSteps) / max(1.0, bandSteps - 1.0);
  float centeredBand = bandNorm - 0.5;
  vec2 bandOffset = -fromFocal * (centeredBand * amount * 0.70);

  return baseUv + continuousOffset + bandOffset;
}

vec2 fitUvOffsetToBounds(vec2 baseUv, vec2 displacedUv) {
  vec2 offset = displacedUv - baseUv;
  float scale = 1.0;

  if (offset.x > 0.0) {
    scale = min(scale, (1.0 - baseUv.x) / max(0.000001, offset.x));
  } else if (offset.x < 0.0) {
    scale = min(scale, baseUv.x / max(0.000001, -offset.x));
  }

  if (offset.y > 0.0) {
    scale = min(scale, (1.0 - baseUv.y) / max(0.000001, offset.y));
  } else if (offset.y < 0.0) {
    scale = min(scale, baseUv.y / max(0.000001, -offset.y));
  }

  scale = clamp(scale, 0.0, 1.0);
  return baseUv + offset * scale;
}

float uvHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float fogAmountAtUv(vec2 uv) {
  float terrainHeight = texture(uHeight, uv).r;
  float heightDelta = max(0.0, uCameraHeightNorm - terrainHeight);
  float adjustedDelta = max(0.0, heightDelta - uFogStartOffset);
  float fogBase = smoothstep(0.02, 0.92, adjustedDelta);
  return pow(clamp(fogBase, 0.0, 1.0), max(0.05, uFogFalloff));
}

float fogAlphaFromAmount(float fogAmount) {
  float fogMin = min(uFogMinAlpha, uFogMaxAlpha);
  float fogMax = max(uFogMinAlpha, uFogMaxAlpha);
  return mix(fogMin, fogMax, clamp(fogAmount, 0.0, 1.0));
}

float cloudMaskAtUv(vec2 uv, float timeSec, vec3 sunDir) {
  if (uUseClouds < 0.5 || uCloudOpacity <= 0.0001) return 0.0;
  float cloudScale = max(0.05, uCloudScale);
  float soft = max(0.001, uCloudSoftness);
  float threshold = clamp(uCloudCoverage, 0.0, 1.0);
  vec2 sunShift = vec2(0.0);
  if (uCloudUseSunProjection > 0.5) {
    float sunZ = max(0.12, sunDir.z);
    sunShift = -sunDir.xy / sunZ * (uCloudSunParallax * 0.03);
  }
  vec2 cloudUvA = fract((uv + sunShift + vec2(timeSec * uCloudSpeed1, timeSec * uCloudSpeed1 * 0.63)) * cloudScale);
  vec2 cloudUvB = fract((uv + sunShift * 1.55 + vec2(-timeSec * uCloudSpeed2 * 0.74, timeSec * uCloudSpeed2)) * (cloudScale * 1.93));
  float noiseA = texture(uCloudNoiseTex, cloudUvA).r;
  float noiseB = texture(uCloudNoiseTex, cloudUvB).r;
  float maskA = smoothstep(threshold - soft, threshold + soft, noiseA);
  float maskB = smoothstep(threshold - soft, threshold + soft, noiseB);
  return clamp(maskA * 0.66 + maskB * 0.34, 0.0, 1.0);
}

vec3 applyWaterFx(vec2 uv, vec3 baseLit, vec3 terrainN, float timeSec, float sunVisibility) {
  if (uUseWaterFx < 0.5) return baseLit;
  // Lock water evaluation to terrain texel centers so each map pixel gets one water result.
  vec2 waterUv = (floor(uv / uMapTexelSize) + vec2(0.5)) * uMapTexelSize;
  waterUv = clamp(waterUv, vec2(0.0), vec2(1.0));
  float waterRaw = texture(uWater, waterUv).r;
  float waterMask = smoothstep(0.46, 0.54, waterRaw);
  if (waterMask <= 0.0001) return baseLit;

  vec2 flowDir = normalize(uWaterFlowDir);
  if (uWaterFlowDownhill > 0.5) {
    vec2 mapDir = texture(uFlowMap, waterUv).xy * 2.0 - 1.0;
    float mapLen = length(mapDir);
    float hL = texture(uHeight, clamp(waterUv - vec2(uMapTexelSize.x, 0.0), vec2(0.0), vec2(1.0))).r;
    float hR = texture(uHeight, clamp(waterUv + vec2(uMapTexelSize.x, 0.0), vec2(0.0), vec2(1.0))).r;
    float hD = texture(uHeight, clamp(waterUv - vec2(0.0, uMapTexelSize.y), vec2(0.0), vec2(1.0))).r;
    float hU = texture(uHeight, clamp(waterUv + vec2(0.0, uMapTexelSize.y), vec2(0.0), vec2(1.0))).r;
    vec2 localDir = vec2(0.0);
    float localLen = length(vec2(hR - hL, hU - hD));
    if (localLen > 0.00002) {
      localDir = normalize(-vec2(hR - hL, hU - hD));
    }

    // In downhill mode, do not seed direction from the fixed-direction slider.
    if (mapLen > 0.00002 && localLen > 0.00002) {
      flowDir = normalize(mix(mapDir / mapLen, localDir, clamp(uWaterLocalFlowMix, 0.0, 1.0)));
    } else if (localLen > 0.00002) {
      flowDir = localDir;
    } else if (mapLen > 0.00002) {
      flowDir = mapDir / mapLen;
    } else {
      flowDir = vec2(0.0, 1.0);
    }
    if (uWaterFlowInvertDownhill > 0.5) {
      flowDir = -flowDir;
    }
  }

  float flowScale = max(0.05, uWaterFlowScale);
  float flowSpeed = max(0.0, uWaterFlowSpeed);
  float downhillBoost = (uWaterFlowDownhill > 0.5) ? max(0.0, uWaterDownhillBoost) : 1.0;
  float flowStrength = uWaterFlowStrength * downhillBoost;
  vec2 flowOffset = flowDir * (timeSec * flowSpeed * 0.045);
  vec2 sideDir = vec2(-flowDir.y, flowDir.x);
  float nA = texture(uCloudNoiseTex, fract(waterUv * flowScale + flowOffset)).r;
  float nB = texture(uCloudNoiseTex, fract(waterUv * (flowScale * 1.73) + sideDir * 0.29 - flowOffset * 1.31)).r;
  float nC = texture(uCloudNoiseTex, fract(waterUv * (flowScale * 3.4) + flowOffset * 2.2)).r;
  float shimmer = ((nA * 0.5 + nB * 0.35 + nC * 0.15) - 0.5) * 2.0;

  float alongCoord = dot(waterUv * (flowScale * 2.1), flowDir);
  float lineWave = 0.5 + 0.5 * sin(alongCoord * 48.0 + timeSec * flowSpeed * 6.0 + (nB - 0.5) * 5.0);
  float flowLines = smoothstep(0.58, 0.96, lineWave * 0.7 + nA * 0.3);

  vec3 waterN = normalize(vec3(
    terrainN.x + shimmer * flowStrength * 1.9,
    terrainN.y + (nB - 0.5) * flowStrength * 1.6,
    max(0.05, terrainN.z)
  ));

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVecSun = normalize(uSunDir + viewDir);
  float glintPow = mix(14.0, 190.0, clamp(uWaterGlintSharpness, 0.0, 1.0));
  float sunGlintCore = pow(max(dot(waterN, halfVecSun), 0.0), glintPow);
  float lowSunBoost = pow(1.0 - clamp(uSunDir.z, 0.0, 1.0), 0.6);
  float sunGlint = sunGlintCore * uWaterGlintStrength * lowSunBoost * max(0.0, uSunStrength) * sunVisibility;

  vec3 halfVecMoon = normalize(uMoonDir + viewDir);
  float moonGlintCore = pow(max(dot(waterN, halfVecMoon), 0.0), mix(20.0, 120.0, clamp(uWaterGlintSharpness, 0.0, 1.0)));
  float moonGlint = moonGlintCore * (uWaterGlintStrength * 0.16) * max(0.0, uMoonStrength);

  float hEdge = abs(texture(uWater, clamp(waterUv - vec2(uMapTexelSize.x * uWaterShoreWidth, 0.0), vec2(0.0), vec2(1.0))).r - waterRaw);
  float vEdge = abs(texture(uWater, clamp(waterUv - vec2(0.0, uMapTexelSize.y * uWaterShoreWidth), vec2(0.0), vec2(1.0))).r - waterRaw);
  float shoreline = smoothstep(0.02, 0.33, max(hEdge, vEdge)) * waterMask;
  float foamPulse = 0.45 + 0.55 * (0.5 + 0.5 * sin(timeSec * (2.2 + flowSpeed * 1.6) + nC * 6.2831853));
  float foam = shoreline * uWaterShoreFoamStrength * foamPulse;

  float fakeFresnel = 0.10 + 0.55 * (1.0 - clamp(waterN.z, 0.0, 1.0));
  vec3 reflection = uSkyColor * uWaterReflectivity * (0.24 + 0.76 * fakeFresnel);
  vec3 flowTint = vec3(shimmer * uWaterShimmerStrength * 0.55 + flowLines * flowStrength * 0.35);
  vec3 glintColor = mix(uSunColor, vec3(1.0), 0.35) * sunGlint + uMoonColor * moonGlint;
  vec3 shoreFoamColor = vec3(0.78, 0.86, 0.92) * foam;

  vec3 waterLit = baseLit;
  waterLit = waterLit + flowTint + reflection + glintColor + shoreFoamColor;
  waterLit = mix(waterLit, waterLit * uWaterTintColor, clamp(uWaterTintStrength, 0.0, 1.0));
  if (uWaterFlowDebug > 0.5) {
    vec3 debugColor = vec3(0.5 + 0.5 * flowDir.x, 0.5 + 0.5 * flowDir.y, 0.22 + 0.78 * flowLines);
    return mix(baseLit, debugColor, waterMask);
  }
  return mix(baseLit, waterLit, waterMask);
}

vec3 computeVolumetricScattering(vec2 uv, float timeSec, float sunVisibility) {
  if (uUseVolumetric < 0.5 || uVolumetricStrength <= 0.0001 || sunVisibility <= 0.0001) return vec3(0.0);
  float sunPlanarLen = length(uSunDir.xy);
  if (sunPlanarLen < 0.0001) return vec3(0.0);
  float sunLateral = clamp(sunPlanarLen, 0.0, 1.0);
  float altitudeStretch = mix(0.18, 1.0, pow(sunLateral, 0.85));
  float altitudeScatterGain = mix(0.22, 1.0, pow(sunLateral, 0.65));
  float sampleCount = max(1.0, floor(clamp(uVolumetricSamples, 4.0, 24.0) + 0.5));
  vec2 rayDir = -uSunDir.xy / sunPlanarLen;
  float rayLengthPx = clamp(uVolumetricLength * altitudeStretch, 2.0, 160.0);
  vec2 rayStepUv = rayDir * uMapTexelSize * (rayLengthPx / sampleCount);
  float g = clamp(uVolumetricAnisotropy, 0.0, 0.95);
  float cosTheta = clamp(uSunDir.z, 0.0, 1.0);
  float phaseDenom = pow(max(0.001, 1.0 + g * g - 2.0 * g * cosTheta), 1.5);
  float phase = (1.0 - g * g) / phaseDenom;
  float extinctionScale = 0.08;
  float accum = 0.0;
  float transmittance = 1.0;
  for (int i = 0; i < 24; i++) {
    if (float(i) >= sampleCount) break;
    vec2 sampleUv = uv + rayStepUv * (float(i) + 1.0);
    if (sampleUv.x <= 0.0 || sampleUv.y <= 0.0 || sampleUv.x >= 1.0 || sampleUv.y >= 1.0) break;
    float fogAmount = fogAmountAtUv(sampleUv);
    float fogAlpha = fogAlphaFromAmount(fogAmount);
    float localDensity = clamp(fogAlpha * uVolumetricDensity, 0.0, 1.5);
    if (localDensity <= 0.0001) continue;
    float localCloudMask = cloudMaskAtUv(sampleUv, timeSec, uSunDir);
    float localSun = 1.0 - localCloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility;
    float scatter = localSun * localDensity * phase;
    accum += transmittance * scatter;
    transmittance *= exp(-localDensity * extinctionScale);
    if (transmittance <= 0.0005) break;
  }
  vec3 scatterColor = mix(uFogColor, uSunColor, 0.72);
  float scatterEnergy = accum * uVolumetricStrength * altitudeScatterGain * 0.16;
  float compressedEnergy = scatterEnergy / (1.0 + scatterEnergy * 1.85);
  return scatterColor * compressedEnergy;
}

void main() {
  vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  vec2 world = uPanWorld + ndc * uViewHalfExtents;
  vec2 baseUv = vec2(world.x / uMapAspect + 0.5, world.y + 0.5);

  if (baseUv.x < 0.0 || baseUv.y < 0.0 || baseUv.x > 1.0 || baseUv.y > 1.0) {
    outColor = vec4(0.02, 0.025, 0.03, 1.0);
    return;
  }

  vec2 focalUv = vec2(uPanWorld.x / uMapAspect + 0.5, uPanWorld.y + 0.5);
  vec2 uv = fitUvOffsetToBounds(baseUv, applyParallax(baseUv, focalUv));

  vec3 base = texture(uSplat, uv).rgb;
  vec3 n = texture(uNormals, uv).xyz * 2.0 - 1.0;
  n = normalize(n);

  float sunDiffuse = max(dot(n, uSunDir), 0.0);
  float moonDiffuse = max(dot(n, uMoonDir), 0.0);
  vec2 shadowSample = texture(uShadowTex, uv).rg;
  float sunShadow = (uUseShadows > 0.5 && sunDiffuse > 0.0001 && uSunStrength > 0.0001) ? shadowSample.r : 1.0;
  float moonShadow = (uUseShadows > 0.5 && moonDiffuse > 0.0001 && uMoonStrength > 0.0001) ? shadowSample.g : 1.0;

  vec3 ambientLit = base * (uAmbient * uAmbientColor);
  vec3 sunLit = base * (sunDiffuse * sunShadow * uSunStrength) * uSunColor;
  vec3 moonLit = base * (moonDiffuse * moonShadow * uMoonStrength) * uMoonColor;
  vec4 pointLightSample = texture(uPointLightTex, uv);
  vec3 pointLightIntensity = pointLightSample.rgb;
  float packedFlicker = floor(pointLightSample.a * 255.0 + 0.5);
  float pointFlickerMask = floor(packedFlicker / 16.0) / 15.0;
  float pointFlickerSpeedLocal = 0.35 + 2.65 * (mod(packedFlicker, 16.0) / 15.0);
  float pointFlickerFactor = 1.0;
  if (uPointFlickerEnabled > 0.5 && pointFlickerMask > 0.0001 && uPointFlickerStrength > 0.0001) {
    float phase = uvHash(uv * 809.3) * 6.2831853 * max(0.0, uPointFlickerSpatial);
    float t = max(0.0, uTimeSec) * max(0.01, uPointFlickerSpeed) * pointFlickerSpeedLocal;
    float waveA = 0.5 + 0.5 * sin(t * 6.2831853 + phase);
    float waveB = 0.5 + 0.5 * sin(t * 11.3097336 + phase * 1.618);
    float wave = clamp(waveA * 0.65 + waveB * 0.35, 0.0, 1.0);
    pointFlickerFactor = 1.0 - clamp(uPointFlickerStrength * pointFlickerMask * wave, 0.0, 0.98);
  }
  vec3 pointLit = base * (pointLightIntensity * pointFlickerFactor);
  vec3 cursorLit = vec3(0.0);
  if (uUseCursorLight > 0.5 && uCursorLightStrength > 0.001) {
    vec2 deltaPx = (uCursorLightUv - uv) * uCursorLightMapSize;
    float distPx = length(deltaPx);
    float atten = max(0.0, 1.0 - distPx / uCursorLightStrength);
    if (atten > 0.0) {
      float dz = max(1.5, uCursorLightStrength * 0.2);
      if (uUseCursorTerrainHeight > 0.5) {
        float surfaceHeight = readHeight(uv);
        float lightGroundHeight = readHeight(uCursorLightUv);
        float lightHeight = lightGroundHeight + uCursorLightHeightOffset;
        dz = max(0.5, lightHeight - surfaceHeight);
      }
      vec3 toCursorLight = normalize(vec3(deltaPx, dz));
      float cursorDiffuse = max(dot(n, toCursorLight), 0.0);
      cursorLit = base * (atten * cursorDiffuse) * uCursorLightColor;
    }
  }
  vec3 lit = clamp(ambientLit + sunLit + moonLit + pointLit + cursorLit, 0.0, 1.0);
  float cloudTimeSec = max(0.0, uCloudTimeSec);
  float waterTimeSec = max(0.0, uWaterTimeSec);
  float sunVisibility = smoothstep(-0.04, 0.15, uSunDir.z);

  if (sunVisibility > 0.0001) {
    float cloudMask = cloudMaskAtUv(uv, cloudTimeSec, uSunDir);
    float cloudShade = 1.0 - (cloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility);
    lit *= cloudShade;
  }

  lit = applyWaterFx(uv, lit, n, waterTimeSec, sunVisibility);

  float fogAmount = fogAmountAtUv(uv);
  float fogAlpha = fogAlphaFromAmount(fogAmount);
  vec3 volumetricScatter = computeVolumetricScattering(uv, cloudTimeSec, sunVisibility);

  if (uUseFog > 0.5) {
    lit = mix(lit, uFogColor, fogAlpha);
  }

  lit = clamp(lit + volumetricScatter * (1.0 - lit), 0.0, 1.0);
  outColor = vec4(lit, 1.0);
}`;

export const SWARM_VERT_SRC = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aMapPos;
layout(location = 1) in float aAgentType;
layout(location = 2) in float aSunShadow;
layout(location = 3) in float aMoonShadow;

uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform float uMapAspect;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;

out vec2 vUv;
out float vSwarmZ;
flat out float vAgentType;
out float vSunShadow;
out float vMoonShadow;

void main() {
  vec2 uv = vec2(
    (aMapPos.x + 0.5) / max(1.0, uMapSize.x),
    1.0 - (aMapPos.y + 0.5) / max(1.0, uMapSize.y)
  );
  vec2 world = vec2((uv.x - 0.5) * uMapAspect, uv.y - 0.5);
  vec2 ndc = (world - uPanWorld) / uViewHalfExtents;
  gl_Position = vec4(ndc, 0.0, 1.0);
  float pxPerWorldX = uResolution.x / max(0.001, (2.0 * uViewHalfExtents.x));
  float pxPerWorldY = uResolution.y / max(0.001, (2.0 * uViewHalfExtents.y));
  float texelWorldX = uMapAspect / max(1.0, uMapSize.x);
  float texelWorldY = 1.0 / max(1.0, uMapSize.y);
  gl_PointSize = max(1.0, max(texelWorldX * pxPerWorldX, texelWorldY * pxPerWorldY));
  vUv = uv;
  vSwarmZ = aMapPos.z;
  vAgentType = aAgentType;
  vSunShadow = aSunShadow;
  vMoonShadow = aMoonShadow;
}`;

export const SWARM_FRAG_SRC = `#version 300 es
precision highp float;

out vec4 outColor;

uniform sampler2D uNormals;
uniform sampler2D uHeight;
uniform sampler2D uPointLightTex;
uniform sampler2D uCloudNoiseTex;

uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunStrength;
uniform vec3 uMoonDir;
uniform vec3 uMoonColor;
uniform float uMoonStrength;
uniform vec3 uAmbientColor;
uniform float uAmbient;

uniform float uUseShadows;
uniform float uUseFog;
uniform vec3 uFogColor;
uniform float uFogMinAlpha;
uniform float uFogMaxAlpha;
uniform float uFogFalloff;
uniform float uFogStartOffset;
uniform float uCameraHeightNorm;
uniform float uUseVolumetric;
uniform float uVolumetricStrength;
uniform float uVolumetricDensity;
uniform float uVolumetricAnisotropy;
uniform float uVolumetricLength;
uniform float uVolumetricSamples;
uniform float uMapAspect;
uniform vec2 uMapTexelSize;
uniform float uTimeSec;
uniform float uCloudTimeSec;
uniform float uPointFlickerEnabled;
uniform float uPointFlickerStrength;
uniform float uPointFlickerSpeed;
uniform float uPointFlickerSpatial;
uniform float uUseClouds;
uniform float uCloudCoverage;
uniform float uCloudSoftness;
uniform float uCloudOpacity;
uniform float uCloudScale;
uniform float uCloudSpeed1;
uniform float uCloudSpeed2;
uniform float uCloudSunParallax;
uniform float uCloudUseSunProjection;
uniform vec3 uHawkColor;
uniform float uSwarmHeightMax;
uniform float uPointLightEdgeMin;
uniform float uSwarmAlpha;

in vec2 vUv;
in float vSwarmZ;
flat in float vAgentType;
in float vSunShadow;
in float vMoonShadow;

float uvHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float fogAmountAtUv(vec2 uv) {
  float terrainHeight = texture(uHeight, uv).r;
  float heightDelta = max(0.0, uCameraHeightNorm - terrainHeight);
  float adjustedDelta = max(0.0, heightDelta - uFogStartOffset);
  float fogBase = smoothstep(0.02, 0.92, adjustedDelta);
  return pow(clamp(fogBase, 0.0, 1.0), max(0.05, uFogFalloff));
}

float fogAlphaFromAmount(float fogAmount) {
  float fogMin = min(uFogMinAlpha, uFogMaxAlpha);
  float fogMax = max(uFogMinAlpha, uFogMaxAlpha);
  return mix(fogMin, fogMax, clamp(fogAmount, 0.0, 1.0));
}

float cloudMaskAtUv(vec2 uv, float timeSec, vec3 sunDir) {
  if (uUseClouds < 0.5 || uCloudOpacity <= 0.0001) return 0.0;
  float cloudScale = max(0.05, uCloudScale);
  float soft = max(0.001, uCloudSoftness);
  float threshold = clamp(uCloudCoverage, 0.0, 1.0);
  vec2 sunShift = vec2(0.0);
  if (uCloudUseSunProjection > 0.5) {
    float sunZ = max(0.12, sunDir.z);
    sunShift = -sunDir.xy / sunZ * (uCloudSunParallax * 0.03);
  }
  vec2 cloudUvA = fract((uv + sunShift + vec2(timeSec * uCloudSpeed1, timeSec * uCloudSpeed1 * 0.63)) * cloudScale);
  vec2 cloudUvB = fract((uv + sunShift * 1.55 + vec2(-timeSec * uCloudSpeed2 * 0.74, timeSec * uCloudSpeed2)) * (cloudScale * 1.93));
  float noiseA = texture(uCloudNoiseTex, cloudUvA).r;
  float noiseB = texture(uCloudNoiseTex, cloudUvB).r;
  float maskA = smoothstep(threshold - soft, threshold + soft, noiseA);
  float maskB = smoothstep(threshold - soft, threshold + soft, noiseB);
  return clamp(maskA * 0.66 + maskB * 0.34, 0.0, 1.0);
}

vec3 computeVolumetricScattering(vec2 uv, float timeSec, float sunVisibility) {
  if (uUseVolumetric < 0.5 || uVolumetricStrength <= 0.0001 || sunVisibility <= 0.0001) return vec3(0.0);
  float sunPlanarLen = length(uSunDir.xy);
  if (sunPlanarLen < 0.0001) return vec3(0.0);
  float sunLateral = clamp(sunPlanarLen, 0.0, 1.0);
  float altitudeStretch = mix(0.18, 1.0, pow(sunLateral, 0.85));
  float altitudeScatterGain = mix(0.22, 1.0, pow(sunLateral, 0.65));
  float sampleCount = max(1.0, floor(clamp(uVolumetricSamples, 4.0, 24.0) + 0.5));
  vec2 rayDir = -uSunDir.xy / sunPlanarLen;
  float rayLengthPx = clamp(uVolumetricLength * altitudeStretch, 2.0, 160.0);
  vec2 rayStepUv = rayDir * uMapTexelSize * (rayLengthPx / sampleCount);
  float g = clamp(uVolumetricAnisotropy, 0.0, 0.95);
  float cosTheta = clamp(uSunDir.z, 0.0, 1.0);
  float phaseDenom = pow(max(0.001, 1.0 + g * g - 2.0 * g * cosTheta), 1.5);
  float phase = (1.0 - g * g) / phaseDenom;
  float extinctionScale = 0.08;
  float accum = 0.0;
  float transmittance = 1.0;
  for (int i = 0; i < 24; i++) {
    if (float(i) >= sampleCount) break;
    vec2 sampleUv = uv + rayStepUv * (float(i) + 1.0);
    if (sampleUv.x <= 0.0 || sampleUv.y <= 0.0 || sampleUv.x >= 1.0 || sampleUv.y >= 1.0) break;
    float fogAmount = fogAmountAtUv(sampleUv);
    float fogAlpha = fogAlphaFromAmount(fogAmount);
    float localDensity = clamp(fogAlpha * uVolumetricDensity, 0.0, 1.5);
    if (localDensity <= 0.0001) continue;
    float localCloudMask = cloudMaskAtUv(sampleUv, timeSec, uSunDir);
    float localSun = 1.0 - localCloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility;
    float scatter = localSun * localDensity * phase;
    accum += transmittance * scatter;
    transmittance *= exp(-localDensity * extinctionScale);
    if (transmittance <= 0.0005) break;
  }
  vec3 scatterColor = mix(uFogColor, uSunColor, 0.72);
  float scatterEnergy = accum * uVolumetricStrength * altitudeScatterGain * 0.16;
  float compressedEnergy = scatterEnergy / (1.0 + scatterEnergy * 1.85);
  return scatterColor * compressedEnergy;
}

void main() {
  vec3 base = (vAgentType > 0.5)
    ? uHawkColor
    : vec3(clamp(0.28 + (vSwarmZ / max(1.0, uSwarmHeightMax)) * 0.72, 0.0, 1.0));
  // Swarm agents are airborne markers, so use a stable normal instead of terrain normals.
  vec3 n = vec3(0.0, 0.0, 1.0);

  float sunDiffuse = max(dot(n, uSunDir), 0.0);
  float moonDiffuse = max(dot(n, uMoonDir), 0.0);
  float sunShadow = (uUseShadows > 0.5 && sunDiffuse > 0.0001 && uSunStrength > 0.0001) ? vSunShadow : 1.0;
  float moonShadow = (uUseShadows > 0.5 && moonDiffuse > 0.0001 && uMoonStrength > 0.0001) ? vMoonShadow : 1.0;

  vec3 ambientLit = base * (uAmbient * uAmbientColor);
  vec3 sunLit = base * (sunDiffuse * sunShadow * uSunStrength) * uSunColor;
  vec3 moonLit = base * (moonDiffuse * moonShadow * uMoonStrength) * uMoonColor;
  vec4 pointLightSample = texture(uPointLightTex, vUv);
  vec3 pointLightIntensity = pointLightSample.rgb;
  float packedFlicker = floor(pointLightSample.a * 255.0 + 0.5);
  float pointFlickerMask = floor(packedFlicker / 16.0) / 15.0;
  float pointFlickerSpeedLocal = 0.35 + 2.65 * (mod(packedFlicker, 16.0) / 15.0);
  float pointFlickerFactor = 1.0;
  if (uPointFlickerEnabled > 0.5 && pointFlickerMask > 0.0001 && uPointFlickerStrength > 0.0001) {
    float phase = uvHash(vUv * 809.3) * 6.2831853 * max(0.0, uPointFlickerSpatial);
    float t = max(0.0, uTimeSec) * max(0.01, uPointFlickerSpeed) * pointFlickerSpeedLocal;
    float waveA = 0.5 + 0.5 * sin(t * 6.2831853 + phase);
    float waveB = 0.5 + 0.5 * sin(t * 11.3097336 + phase * 1.618);
    float wave = clamp(waveA * 0.65 + waveB * 0.35, 0.0, 1.0);
    pointFlickerFactor = 1.0 - clamp(uPointFlickerStrength * pointFlickerMask * wave, 0.0, 0.98);
  }

  // Height-aware point-light attenuation for swarm:
  // brightness (0..255) is treated as vertical reach from terrain height to agent height.
  float brightnessRange = max(pointLightIntensity.r, max(pointLightIntensity.g, pointLightIntensity.b)) * 255.0;
  float terrainHeight = texture(uHeight, vUv).r * uSwarmHeightMax;
  float aboveTerrain = max(0.0, vSwarmZ - terrainHeight);
  float withinReach = step(aboveTerrain, brightnessRange);
  float rangeNorm = aboveTerrain / max(0.001, brightnessRange);
  float rangeFalloff = 1.0 - clamp(rangeNorm, 0.0, 1.0);
  float pointHeightAtten = withinReach * (uPointLightEdgeMin + (1.0 - uPointLightEdgeMin) * rangeFalloff);

  vec3 pointLit = base * (pointLightIntensity * pointFlickerFactor * pointHeightAtten);
  vec3 lit = clamp(ambientLit + sunLit + moonLit + pointLit, 0.0, 1.0);
  float cloudTimeSec = max(0.0, uCloudTimeSec);
  float sunVisibility = smoothstep(-0.04, 0.15, uSunDir.z);
  if (sunVisibility > 0.0001) {
    float cloudMask = cloudMaskAtUv(vUv, cloudTimeSec, uSunDir);
    float cloudShade = 1.0 - (cloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility);
    lit *= cloudShade;
  }

  float fogAmount = fogAmountAtUv(vUv);
  float fogAlpha = fogAlphaFromAmount(fogAmount);
  vec3 volumetricScatter = computeVolumetricScattering(vUv, cloudTimeSec, sunVisibility);
  if (uUseFog > 0.5) {
    lit = mix(lit, uFogColor, fogAlpha);
  }
  lit = clamp(lit + volumetricScatter * (1.0 - lit), 0.0, 1.0);
  outColor = vec4(lit, uSwarmAlpha);
}`;

export const SHADOW_FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uHeight;
uniform vec2 uMapTexelSize;
uniform vec2 uShadowResolution;
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform float uHeightScale;
uniform float uShadowStrength;
uniform float uUseShadows;

float readHeight(vec2 uv) {
  return texture(uHeight, uv).r * uHeightScale;
}

float calcShadow(vec2 uv, vec3 lightDir) {
  if (uUseShadows < 0.5) return 1.0;
  if (lightDir.z <= 0.01) return 0.0;
  float dirLen = length(lightDir.xy);
  if (dirLen < 0.0001) return 1.0;
  vec2 dir2 = lightDir.xy / dirLen;
  float h0 = readHeight(uv);
  float slope = lightDir.z / max(dirLen, 0.0001);
  float bias = 0.7;
  float stepPixels = 1.5;
  vec2 stepUv = dir2 * uMapTexelSize * stepPixels;
  vec2 p = uv;
  float traveledPixels = 0.0;
  for (int i = 0; i < 120; i++) {
    p += stepUv;
    traveledPixels += stepPixels;
    if (p.x <= 0.0 || p.y <= 0.0 || p.x >= 1.0 || p.y >= 1.0) {
      break;
    }
    float h = readHeight(p);
    float rayH = h0 + slope * traveledPixels;
    if (h > rayH + bias) {
      return 1.0 - uShadowStrength;
    }
  }
  return 1.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uShadowResolution;
  float sunShadow = calcShadow(uv, uSunDir);
  float moonShadow = calcShadow(uv, uMoonDir);
  outColor = vec4(sunShadow, moonShadow, 0.0, 1.0);
}`;

export const SHADOW_BLUR_FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uShadowRawTex;
uniform vec2 uShadowResolution;
uniform float uBlurRadiusPx;

void main() {
  vec2 uv = gl_FragCoord.xy / uShadowResolution;
  float radius = max(0.0, uBlurRadiusPx);
  if (radius <= 0.001) {
    outColor = texture(uShadowRawTex, uv);
    return;
  }

  vec2 texel = vec2(1.0) / uShadowResolution;
  vec2 offset = texel * radius;
  vec2 sum = vec2(0.0);
  float weight = 0.0;

  float centerW = 0.36;
  sum += texture(uShadowRawTex, uv).rg * centerW;
  weight += centerW;

  float axisW = 0.14;
  sum += texture(uShadowRawTex, clamp(uv + vec2(offset.x, 0.0), vec2(0.0), vec2(1.0))).rg * axisW;
  sum += texture(uShadowRawTex, clamp(uv - vec2(offset.x, 0.0), vec2(0.0), vec2(1.0))).rg * axisW;
  sum += texture(uShadowRawTex, clamp(uv + vec2(0.0, offset.y), vec2(0.0), vec2(1.0))).rg * axisW;
  sum += texture(uShadowRawTex, clamp(uv - vec2(0.0, offset.y), vec2(0.0), vec2(1.0))).rg * axisW;
  weight += axisW * 4.0;

  if (radius >= 1.6) {
    float diagW = 0.02;
    sum += texture(uShadowRawTex, clamp(uv + vec2(offset.x, offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    sum += texture(uShadowRawTex, clamp(uv + vec2(-offset.x, offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    sum += texture(uShadowRawTex, clamp(uv + vec2(offset.x, -offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    sum += texture(uShadowRawTex, clamp(uv + vec2(-offset.x, -offset.y), vec2(0.0), vec2(1.0))).rg * diagW;
    weight += diagW * 4.0;
  }

  vec2 blurred = sum / max(0.0001, weight);
  outColor = vec4(blurred, 0.0, 1.0);
}`;
