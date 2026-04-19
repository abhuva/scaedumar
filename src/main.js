function getRequiredElementById(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing required element with id '${id}'.`);
  }
  return el;
}

function getRequiredElements(selector) {
  const els = Array.from(document.querySelectorAll(selector));
  if (els.length === 0) {
    throw new Error(`Missing required elements for selector '${selector}'.`);
  }
  return els;
}
const canvas = getRequiredElementById("glCanvas");
const overlayCanvas = getRequiredElementById("overlayCanvas");
const topicButtons = getRequiredElements(".topic-btn");
const topicPanelEl = getRequiredElementById("topicPanel");
const topicPanelTitleEl = getRequiredElementById("topicPanelTitle");
const topicPanelCloseBtn = getRequiredElementById("topicPanelClose");
const topicCards = getRequiredElements(".topic-card");
const statusEl = getRequiredElementById("status");
const cycleInfoEl = getRequiredElementById("cycleInfo");
const playerInfoEl = getRequiredElementById("playerInfo");
const pathInfoEl = getRequiredElementById("pathInfo");
const mapPathInput = getRequiredElementById("mapPathInput");
const mapPathLoadBtn = getRequiredElementById("mapPathLoadBtn");
const mapFolderInput = getRequiredElementById("mapFolderInput");
const mapSaveAllBtn = getRequiredElementById("mapSaveAllBtn");
const dockLightingModeToggle = getRequiredElementById("dockLightingModeToggle");
const dockPathfindingModeToggle = getRequiredElementById("dockPathfindingModeToggle");
const pathfindingRangeInput = getRequiredElementById("pathfindingRange");
const pathfindingRangeValue = getRequiredElementById("pathfindingRangeValue");
const pathWeightSlopeInput = getRequiredElementById("pathWeightSlope");
const pathWeightSlopeValue = getRequiredElementById("pathWeightSlopeValue");
const pathWeightHeightInput = getRequiredElementById("pathWeightHeight");
const pathWeightHeightValue = getRequiredElementById("pathWeightHeightValue");
const pathWeightWaterInput = getRequiredElementById("pathWeightWater");
const pathWeightWaterValue = getRequiredElementById("pathWeightWaterValue");
const pathSlopeCutoffInput = getRequiredElementById("pathSlopeCutoff");
const pathSlopeCutoffValue = getRequiredElementById("pathSlopeCutoffValue");
const pathBaseCostInput = getRequiredElementById("pathBaseCost");
const pathBaseCostValue = getRequiredElementById("pathBaseCostValue");
const cursorLightModeToggle = getRequiredElementById("cursorLightModeToggle");
const cursorLightFollowHeightToggle = getRequiredElementById("cursorLightFollowHeightToggle");
const cursorLightColorInput = getRequiredElementById("cursorLightColor");
const cursorLightStrengthInput = getRequiredElementById("cursorLightStrength");
const cursorLightStrengthValue = getRequiredElementById("cursorLightStrengthValue");
const cursorLightHeightOffsetInput = getRequiredElementById("cursorLightHeightOffset");
const cursorLightHeightOffsetValue = getRequiredElementById("cursorLightHeightOffsetValue");
const cursorLightGizmoToggle = getRequiredElementById("cursorLightGizmoToggle");
const cycleSpeedInput = getRequiredElementById("cycleSpeed");
const cycleHourInput = getRequiredElementById("cycleHour");
const cycleHourValue = getRequiredElementById("cycleHourValue");
const shadowsToggle = getRequiredElementById("shadowsToggle");
const parallaxToggle = getRequiredElementById("parallaxToggle");
const parallaxStrengthInput = getRequiredElementById("parallaxStrength");
const parallaxStrengthValue = getRequiredElementById("parallaxStrengthValue");
const parallaxBandsInput = getRequiredElementById("parallaxBands");
const parallaxBandsValue = getRequiredElementById("parallaxBandsValue");
const fogToggle = getRequiredElementById("fogToggle");
const fogColorInput = getRequiredElementById("fogColor");
const fogMinAlphaInput = getRequiredElementById("fogMinAlpha");
const fogMinAlphaValue = getRequiredElementById("fogMinAlphaValue");
const fogMaxAlphaInput = getRequiredElementById("fogMaxAlpha");
const fogMaxAlphaValue = getRequiredElementById("fogMaxAlphaValue");
const fogFalloffInput = getRequiredElementById("fogFalloff");
const fogFalloffValue = getRequiredElementById("fogFalloffValue");
const fogStartOffsetInput = getRequiredElementById("fogStartOffset");
const fogStartOffsetValue = getRequiredElementById("fogStartOffsetValue");
const cloudToggle = getRequiredElementById("cloudToggle");
const cloudCoverageInput = getRequiredElementById("cloudCoverage");
const cloudCoverageValue = getRequiredElementById("cloudCoverageValue");
const cloudSoftnessInput = getRequiredElementById("cloudSoftness");
const cloudSoftnessValue = getRequiredElementById("cloudSoftnessValue");
const cloudOpacityInput = getRequiredElementById("cloudOpacity");
const cloudOpacityValue = getRequiredElementById("cloudOpacityValue");
const cloudScaleInput = getRequiredElementById("cloudScale");
const cloudScaleValue = getRequiredElementById("cloudScaleValue");
const cloudSpeed1Input = getRequiredElementById("cloudSpeed1");
const cloudSpeed1Value = getRequiredElementById("cloudSpeed1Value");
const cloudSpeed2Input = getRequiredElementById("cloudSpeed2");
const cloudSpeed2Value = getRequiredElementById("cloudSpeed2Value");
const cloudSunParallaxInput = getRequiredElementById("cloudSunParallax");
const cloudSunParallaxValue = getRequiredElementById("cloudSunParallaxValue");
const cloudSunProjectToggle = getRequiredElementById("cloudSunProjectToggle");
const heightScaleInput = getRequiredElementById("heightScale");
const shadowStrengthInput = getRequiredElementById("shadowStrength");
const ambientInput = getRequiredElementById("ambient");
const diffuseInput = getRequiredElementById("diffuse");
const pointFlickerToggle = getRequiredElementById("pointFlickerToggle");
const pointFlickerStrengthInput = getRequiredElementById("pointFlickerStrength");
const pointFlickerStrengthValue = getRequiredElementById("pointFlickerStrengthValue");
const pointFlickerSpeedInput = getRequiredElementById("pointFlickerSpeed");
const pointFlickerSpeedValue = getRequiredElementById("pointFlickerSpeedValue");
const pointFlickerSpatialInput = getRequiredElementById("pointFlickerSpatial");
const pointFlickerSpatialValue = getRequiredElementById("pointFlickerSpatialValue");
const lightEditorEmptyEl = getRequiredElementById("lightEditorEmpty");
const lightEditorFieldsEl = getRequiredElementById("lightEditorFields");
const lightCoordEl = getRequiredElementById("lightCoord");
const pointLightColorInput = getRequiredElementById("pointLightColor");
const pointLightStrengthInput = getRequiredElementById("pointLightStrength");
const pointLightStrengthValue = getRequiredElementById("pointLightStrengthValue");
const pointLightIntensityInput = getRequiredElementById("pointLightIntensity");
const pointLightIntensityValue = getRequiredElementById("pointLightIntensityValue");
const pointLightHeightOffsetInput = getRequiredElementById("pointLightHeightOffset");
const pointLightHeightOffsetValue = getRequiredElementById("pointLightHeightOffsetValue");
const pointLightFlickerInput = getRequiredElementById("pointLightFlicker");
const pointLightFlickerValue = getRequiredElementById("pointLightFlickerValue");
const pointLightFlickerSpeedInput = getRequiredElementById("pointLightFlickerSpeed");
const pointLightFlickerSpeedValue = getRequiredElementById("pointLightFlickerSpeedValue");
const pointLightLiveUpdateToggle = getRequiredElementById("pointLightLiveUpdateToggle");
const lightSaveBtn = getRequiredElementById("lightSaveBtn");
const lightCancelBtn = getRequiredElementById("lightCancelBtn");
const lightDeleteBtn = getRequiredElementById("lightDeleteBtn");
const pointLightsSaveAllBtn = getRequiredElementById("pointLightsSaveAllBtn");
const pointLightsLoadAllBtn = getRequiredElementById("pointLightsLoadAllBtn");
const pointLightsLoadInput = getRequiredElementById("pointLightsLoadInput");
const overlayCtx = overlayCanvas.getContext("2d");
if (!overlayCtx) {
  throw new Error("2D overlay context is required for this prototype.");
}

const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL2 is required for this prototype.");
}
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

const VERT_SRC = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uSplat;
uniform sampler2D uNormals;
uniform sampler2D uHeight;
uniform sampler2D uPointLightTex;
uniform sampler2D uCloudNoiseTex;
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
uniform float uMapAspect;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;
uniform float uTimeSec;
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

float calcShadow(vec2 uv, vec3 sunDir) {
  if (uUseShadows < 0.5) return 1.0;
  if (sunDir.z <= 0.01) return 0.0;

  float dirLen = length(sunDir.xy);
  if (dirLen < 0.0001) return 1.0;
  vec2 dir2 = sunDir.xy / dirLen;

  float h0 = readHeight(uv);
  float slope = sunDir.z / max(dirLen, 0.0001);
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

float uvHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
  float sunShadow = calcShadow(uv, uSunDir);
  float moonShadow = calcShadow(uv, uMoonDir);

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

  if (uUseClouds > 0.5 && uCloudOpacity > 0.0001) {
    float sunVisibility = smoothstep(-0.04, 0.15, uSunDir.z);
    if (sunVisibility > 0.0001) {
      float cloudScale = max(0.05, uCloudScale);
      float soft = max(0.001, uCloudSoftness);
      float threshold = clamp(uCloudCoverage, 0.0, 1.0);
      float timeSec = max(0.0, uTimeSec);
      vec2 sunShift = vec2(0.0);
      if (uCloudUseSunProjection > 0.5) {
        float sunZ = max(0.12, uSunDir.z);
        sunShift = -uSunDir.xy / sunZ * (uCloudSunParallax * 0.03);
      }
      vec2 cloudUvA = fract((uv + sunShift + vec2(timeSec * uCloudSpeed1, timeSec * uCloudSpeed1 * 0.63)) * cloudScale);
      vec2 cloudUvB = fract((uv + sunShift * 1.55 + vec2(-timeSec * uCloudSpeed2 * 0.74, timeSec * uCloudSpeed2)) * (cloudScale * 1.93));
      float noiseA = texture(uCloudNoiseTex, cloudUvA).r;
      float noiseB = texture(uCloudNoiseTex, cloudUvB).r;
      float maskA = smoothstep(threshold - soft, threshold + soft, noiseA);
      float maskB = smoothstep(threshold - soft, threshold + soft, noiseB);
      float cloudMask = clamp(maskA * 0.66 + maskB * 0.34, 0.0, 1.0);
      float cloudShade = 1.0 - (cloudMask * clamp(uCloudOpacity, 0.0, 1.0) * sunVisibility);
      lit *= cloudShade;
    }
  }

  if (uUseFog > 0.5) {
    float terrainHeight = texture(uHeight, uv).r;
    float heightDelta = max(0.0, uCameraHeightNorm - terrainHeight);
    float adjustedDelta = max(0.0, heightDelta - uFogStartOffset);
    float fogBase = smoothstep(0.02, 0.92, adjustedDelta);
    float fogAmount = pow(clamp(fogBase, 0.0, 1.0), max(0.05, uFogFalloff));
    float fogMin = min(uFogMinAlpha, uFogMaxAlpha);
    float fogMax = max(uFogMinAlpha, uFogMaxAlpha);
    float fogAlpha = mix(fogMin, fogMax, fogAmount);
    lit = mix(lit, uFogColor, fogAlpha);
  }

  outColor = vec4(lit, 1.0);
}`;

function createShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Shader compilation failed.");
  }
  return shader;
}

function createProgram(vsSrc, fsSrc) {
  const vs = createShader(gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "Program linking failed.");
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

function createTexture() {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function uploadImageToTexture(tex, image) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function fract(v) {
  return v - Math.floor(v);
}

function valueNoise2D(x, y, seed) {
  const n = Math.sin((x + seed * 17.13) * 127.1 + (y + seed * 31.7) * 311.7) * 43758.5453123;
  return fract(n);
}

function wrapInt(value, period) {
  const p = Math.max(1, Math.floor(period));
  const v = Math.floor(value) % p;
  return v < 0 ? v + p : v;
}

function periodicValueNoise2D(ix, iy, period, seed) {
  return valueNoise2D(wrapInt(ix, period), wrapInt(iy, period), seed);
}

function smoothPeriodicValueNoise2D(x, y, period, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const n00 = periodicValueNoise2D(x0, y0, period, seed);
  const n10 = periodicValueNoise2D(x0 + 1, y0, period, seed);
  const n01 = periodicValueNoise2D(x0, y0 + 1, period, seed);
  const n11 = periodicValueNoise2D(x0 + 1, y0 + 1, period, seed);
  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;
}

function createCloudNoiseImage(size = 128) {
  const imageData = new ImageData(size, size);
  const data = imageData.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let f = 0;
      let amp = 0.58;
      let ampSum = 0;
      for (let octave = 0; octave < 4; octave++) {
        const period = 8 * (1 << octave);
        const nx = (x / size) * period;
        const ny = (y / size) * period;
        f += smoothPeriodicValueNoise2D(nx, ny, period, 2.31 + octave * 13.7) * amp;
        ampSum += amp;
        amp *= 0.5;
      }
      const v = Math.round(clamp(f / Math.max(0.0001, ampSum), 0, 1) * 255);
      const idx = (y * size + x) * 4;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }
  return imageData;
}

function uploadCloudNoiseTexture() {
  gl.bindTexture(gl.TEXTURE_2D, cloudNoiseTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  const cloudNoiseImage = createCloudNoiseImage();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cloudNoiseImage.width, cloudNoiseImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, cloudNoiseImage.data);
}

async function loadImageFromUrl(url) {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return image;
}

async function loadImageFromFile(file) {
  const image = new Image();
  image.decoding = "async";
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  image.src = dataUrl;
  await image.decode();
  return image;
}

function normalizeMapFolderPath(path) {
  const text = String(path || "").trim();
  if (!text) return DEFAULT_MAP_FOLDER;
  return text.replace(/[\\/]+$/, "");
}

async function applyMapImages(splatImage, normalsImage, heightImage, slopeImage, waterImage) {
  uploadImageToTexture(splatTex, splatImage);
  const sizeChanged = setSplatSizeFromImage(splatImage);
  applyMapSizeChangeIfNeeded(sizeChanged);
  resetCamera();

  uploadImageToTexture(normalsTex, normalsImage);
  setNormalsSizeFromImage(normalsImage);
  normalsImageData = extractImageData(normalsImage);

  uploadImageToTexture(heightTex, heightImage);
  setHeightSizeFromImage(heightImage);
  heightImageData = extractImageData(heightImage);
  slopeImageData = extractImageData(slopeImage);
  waterImageData = extractImageData(waterImage);
  syncPointLightWorkerMapData();
}

function syncPointLightWorkerMapData() {
  if (!pointLightBakeWorker || !normalsImageData || !heightImageData) return;
  pointLightBakeWorker.postMessage({
    type: "setMapData",
    splatWidth: splatSize.width,
    splatHeight: splatSize.height,
    normalsWidth: normalsSize.width,
    normalsHeight: normalsSize.height,
    heightWidth: heightSize.width,
    heightHeight: heightSize.height,
    normalsData: normalsImageData.data,
    heightData: heightImageData.data,
  });
}

function getFileFromFolderSelection(files, fileName) {
  const lower = fileName.toLowerCase();
  for (const file of files) {
    if (String(file.name || "").toLowerCase() === lower) {
      return file;
    }
  }
  return null;
}

async function tryLoadJsonFromUrl(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

const DEFAULT_LIGHTING_SETTINGS = {
  useShadows: true,
  heightScale: 80,
  shadowStrength: 0.6,
  ambient: 0.35,
  diffuse: 1,
  cycleHour: 9.5,
  cycleSpeed: 0.08,
  pointFlickerEnabled: true,
  pointFlickerStrength: 0.55,
  pointFlickerSpeed: 2.4,
  pointFlickerSpatial: 1.0,
};

const DEFAULT_FOG_SETTINGS = {
  useFog: false,
  fogColor: "#7f8d99",
  fogColorManual: false,
  fogMinAlpha: 0.06,
  fogMaxAlpha: 0.55,
  fogFalloff: 1.2,
  fogStartOffset: 0,
};

const DEFAULT_PARALLAX_SETTINGS = {
  useParallax: false,
  parallaxStrength: 0.35,
  parallaxBands: 6,
};

const DEFAULT_CLOUD_SETTINGS = {
  useClouds: false,
  cloudCoverage: 0.58,
  cloudSoftness: 0.12,
  cloudOpacity: 0.35,
  cloudScale: 2.2,
  cloudSpeed1: 0.045,
  cloudSpeed2: -0.028,
  cloudSunParallax: 0.45,
  cloudUseSunProjection: true,
};

const DEFAULT_INTERACTION_SETTINGS = {
  pathfindingRange: 30,
  pathWeightSlope: 1.8,
  pathWeightHeight: 3.0,
  pathWeightWater: 0.0,
  pathSlopeCutoff: 90,
  pathBaseCost: 1.0,
  cursorLightEnabled: false,
  cursorLightFollowHeight: true,
  cursorLightColor: "#ff9b2f",
  cursorLightStrength: 30,
  cursorLightHeightOffset: 8,
  cursorLightGizmo: false,
  pointLightLiveUpdate: false,
};

function serializeLightingSettings() {
  return {
    version: 1,
    useShadows: shadowsToggle.checked,
    heightScale: clamp(Number(heightScaleInput.value), 1, 300),
    shadowStrength: clamp(Number(shadowStrengthInput.value), 0, 1),
    ambient: clamp(Number(ambientInput.value), 0, 1),
    diffuse: clamp(Number(diffuseInput.value), 0, 2),
    cycleHour: clamp(Number(cycleState.hour), 0, 24),
    cycleSpeed: clamp(Number(cycleSpeedInput.value), 0, 1),
    pointFlickerEnabled: pointFlickerToggle.checked,
    pointFlickerStrength: clamp(Number(pointFlickerStrengthInput.value), 0, 1),
    pointFlickerSpeed: clamp(Number(pointFlickerSpeedInput.value), 0.1, 12),
    pointFlickerSpatial: clamp(Number(pointFlickerSpatialInput.value), 0, 4),
  };
}

function applyLightingSettings(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useShadows === "boolean") {
    shadowsToggle.checked = data.useShadows;
  }
  if (Number.isFinite(Number(data.heightScale))) {
    heightScaleInput.value = String(clamp(Number(data.heightScale), 1, 300));
  }
  if (Number.isFinite(Number(data.shadowStrength))) {
    shadowStrengthInput.value = String(clamp(Number(data.shadowStrength), 0, 1));
  }
  if (Number.isFinite(Number(data.ambient))) {
    ambientInput.value = String(clamp(Number(data.ambient), 0, 1));
  }
  if (Number.isFinite(Number(data.diffuse))) {
    diffuseInput.value = String(clamp(Number(data.diffuse), 0, 2));
  }
  if (Number.isFinite(Number(data.cycleHour))) {
    cycleState.hour = clamp(Number(data.cycleHour), 0, 24);
    cycleState.lastRenderMs = null;
  }
  if (Number.isFinite(Number(data.cycleSpeed))) {
    cycleSpeedInput.value = String(clamp(Number(data.cycleSpeed), 0, 1));
  }
  if (typeof data.pointFlickerEnabled === "boolean") {
    pointFlickerToggle.checked = data.pointFlickerEnabled;
  }
  if (Number.isFinite(Number(data.pointFlickerStrength))) {
    pointFlickerStrengthInput.value = String(clamp(Number(data.pointFlickerStrength), 0, 1));
  }
  if (Number.isFinite(Number(data.pointFlickerSpeed))) {
    pointFlickerSpeedInput.value = String(clamp(Number(data.pointFlickerSpeed), 0.1, 12));
  }
  if (Number.isFinite(Number(data.pointFlickerSpatial))) {
    pointFlickerSpatialInput.value = String(clamp(Number(data.pointFlickerSpatial), 0, 4));
  }
  updatePointFlickerLabels();
  updatePointFlickerUi();
  setCycleHourSliderFromState();
  updateCycleHourLabel();
  schedulePointLightBake();
}

function serializeFogSettings() {
  return {
    version: 1,
    useFog: fogToggle.checked,
    fogColor: fogColorInput.value,
    fogColorManual,
    fogMinAlpha: clamp(Number(fogMinAlphaInput.value), 0, 1),
    fogMaxAlpha: clamp(Number(fogMaxAlphaInput.value), 0, 1),
    fogFalloff: clamp(Number(fogFalloffInput.value), 0.2, 4),
    fogStartOffset: clamp(Number(fogStartOffsetInput.value), 0, 1),
  };
}

function serializeParallaxSettings() {
  return {
    version: 1,
    useParallax: parallaxToggle.checked,
    parallaxStrength: clamp(Number(parallaxStrengthInput.value), 0, 1),
    parallaxBands: Math.round(clamp(Number(parallaxBandsInput.value), 2, 256)),
  };
}

function serializeCloudSettings() {
  return {
    version: 1,
    useClouds: cloudToggle.checked,
    cloudCoverage: clamp(Number(cloudCoverageInput.value), 0, 1),
    cloudSoftness: clamp(Number(cloudSoftnessInput.value), 0.01, 0.35),
    cloudOpacity: clamp(Number(cloudOpacityInput.value), 0, 1),
    cloudScale: clamp(Number(cloudScaleInput.value), 0.5, 8),
    cloudSpeed1: clamp(Number(cloudSpeed1Input.value), -0.3, 0.3),
    cloudSpeed2: clamp(Number(cloudSpeed2Input.value), -0.3, 0.3),
    cloudSunParallax: clamp(Number(cloudSunParallaxInput.value), 0, 2),
    cloudUseSunProjection: cloudSunProjectToggle.checked,
  };
}

function serializeInteractionSettings() {
  return {
    version: 1,
    pathfindingRange: Math.round(clamp(Number(pathfindingRangeInput.value), 30, 300)),
    pathWeightSlope: clamp(Number(pathWeightSlopeInput.value), 0, 10),
    pathWeightHeight: clamp(Number(pathWeightHeightInput.value), 0, 10),
    pathWeightWater: clamp(Number(pathWeightWaterInput.value), 0, 100),
    pathSlopeCutoff: Math.round(clamp(Number(pathSlopeCutoffInput.value), 0, 90)),
    pathBaseCost: clamp(Number(pathBaseCostInput.value), 0, 2),
    cursorLightEnabled: cursorLightModeToggle.checked,
    cursorLightFollowHeight: cursorLightFollowHeightToggle.checked,
    cursorLightColor: cursorLightColorInput.value,
    cursorLightStrength: Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200)),
    cursorLightHeightOffset: Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120)),
    cursorLightGizmo: cursorLightGizmoToggle.checked,
    pointLightLiveUpdate: pointLightLiveUpdateToggle.checked,
  };
}

function serializeNpcState() {
  return {
    version: 1,
    charID: playerState.charID,
    pixelX: playerState.pixelX,
    pixelY: playerState.pixelY,
    color: playerState.color,
  };
}

function applyFogSettings(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useFog === "boolean") {
    fogToggle.checked = data.useFog;
  }
  if (typeof data.fogColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(data.fogColor)) {
    fogColorInput.value = data.fogColor.startsWith("#") ? data.fogColor : `#${data.fogColor}`;
  }
  fogColorManual = Boolean(data.fogColorManual);
  if (Number.isFinite(Number(data.fogMinAlpha))) {
    fogMinAlphaInput.value = String(clamp(Number(data.fogMinAlpha), 0, 1));
  }
  if (Number.isFinite(Number(data.fogMaxAlpha))) {
    fogMaxAlphaInput.value = String(clamp(Number(data.fogMaxAlpha), 0, 1));
  }
  if (Number.isFinite(Number(data.fogFalloff))) {
    fogFalloffInput.value = String(clamp(Number(data.fogFalloff), 0.2, 4));
  }
  if (Number.isFinite(Number(data.fogStartOffset))) {
    fogStartOffsetInput.value = String(clamp(Number(data.fogStartOffset), 0, 1));
  }
  updateFogAlphaLabels();
  updateFogFalloffLabel();
  updateFogStartOffsetLabel();
  updateFogUi();
}

function applyParallaxSettings(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useParallax === "boolean") {
    parallaxToggle.checked = data.useParallax;
  }
  if (Number.isFinite(Number(data.parallaxStrength))) {
    parallaxStrengthInput.value = String(clamp(Number(data.parallaxStrength), 0, 1));
  }
  if (Number.isFinite(Number(data.parallaxBands))) {
    parallaxBandsInput.value = String(Math.round(clamp(Number(data.parallaxBands), 2, 256)));
  }
  updateParallaxStrengthLabel();
  updateParallaxBandsLabel();
  updateParallaxUi();
}

function applyCloudSettings(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (typeof data.useClouds === "boolean") {
    cloudToggle.checked = data.useClouds;
  }
  if (Number.isFinite(Number(data.cloudCoverage))) {
    cloudCoverageInput.value = String(clamp(Number(data.cloudCoverage), 0, 1));
  }
  if (Number.isFinite(Number(data.cloudSoftness))) {
    cloudSoftnessInput.value = String(clamp(Number(data.cloudSoftness), 0.01, 0.35));
  }
  if (Number.isFinite(Number(data.cloudOpacity))) {
    cloudOpacityInput.value = String(clamp(Number(data.cloudOpacity), 0, 1));
  }
  if (Number.isFinite(Number(data.cloudScale))) {
    cloudScaleInput.value = String(clamp(Number(data.cloudScale), 0.5, 8));
  }
  if (Number.isFinite(Number(data.cloudSpeed1))) {
    cloudSpeed1Input.value = String(clamp(Number(data.cloudSpeed1), -0.3, 0.3));
  }
  if (Number.isFinite(Number(data.cloudSpeed2))) {
    cloudSpeed2Input.value = String(clamp(Number(data.cloudSpeed2), -0.3, 0.3));
  }
  if (Number.isFinite(Number(data.cloudSunParallax))) {
    cloudSunParallaxInput.value = String(clamp(Number(data.cloudSunParallax), 0, 2));
  }
  if (typeof data.cloudUseSunProjection === "boolean") {
    cloudSunProjectToggle.checked = data.cloudUseSunProjection;
  }
  updateCloudLabels();
  updateCloudUi();
}

function applyInteractionSettings(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  if (Number.isFinite(Number(data.pathfindingRange))) {
    pathfindingRangeInput.value = String(Math.round(clamp(Number(data.pathfindingRange), 30, 300)));
  }
  if (Number.isFinite(Number(data.pathWeightSlope))) {
    pathWeightSlopeInput.value = String(clamp(Number(data.pathWeightSlope), 0, 10));
  }
  if (Number.isFinite(Number(data.pathWeightHeight))) {
    pathWeightHeightInput.value = String(clamp(Number(data.pathWeightHeight), 0, 10));
  }
  if (Number.isFinite(Number(data.pathWeightWater))) {
    pathWeightWaterInput.value = String(clamp(Number(data.pathWeightWater), 0, 100));
  }
  if (Number.isFinite(Number(data.pathSlopeCutoff))) {
    pathSlopeCutoffInput.value = String(Math.round(clamp(Number(data.pathSlopeCutoff), 0, 90)));
  }
  if (Number.isFinite(Number(data.pathBaseCost))) {
    pathBaseCostInput.value = String(clamp(Number(data.pathBaseCost), 0, 2));
  }
  if (typeof data.cursorLightEnabled === "boolean") {
    cursorLightModeToggle.checked = data.cursorLightEnabled;
  }
  if (typeof data.cursorLightFollowHeight === "boolean") {
    cursorLightFollowHeightToggle.checked = data.cursorLightFollowHeight;
  }
  if (typeof data.cursorLightColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(data.cursorLightColor)) {
    cursorLightColorInput.value = data.cursorLightColor.startsWith("#") ? data.cursorLightColor : `#${data.cursorLightColor}`;
  }
  if (Number.isFinite(Number(data.cursorLightStrength))) {
    cursorLightStrengthInput.value = String(Math.round(clamp(Number(data.cursorLightStrength), 1, 200)));
  }
  if (Number.isFinite(Number(data.cursorLightHeightOffset))) {
    cursorLightHeightOffsetInput.value = String(Math.round(clamp(Number(data.cursorLightHeightOffset), 0, 120)));
  }
  if (typeof data.cursorLightGizmo === "boolean") {
    cursorLightGizmoToggle.checked = data.cursorLightGizmo;
  }
  if (typeof data.pointLightLiveUpdate === "boolean") {
    pointLightLiveUpdateToggle.checked = data.pointLightLiveUpdate;
  }

  updatePathfindingRangeLabel();
  updatePathWeightLabels();
  updatePathSlopeCutoffLabel();
  updatePathBaseCostLabel();
  cursorLightState.color = hexToRgb01(cursorLightColorInput.value);
  cursorLightState.strength = Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200));
  cursorLightState.heightOffset = Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120));
  cursorLightState.useTerrainHeight = cursorLightFollowHeightToggle.checked;
  cursorLightState.showGizmo = cursorLightGizmoToggle.checked;
  if (!cursorLightModeToggle.checked) {
    cursorLightState.active = false;
  }
  updateCursorLightStrengthLabel();
  updateCursorLightHeightOffsetLabel();
  updateCursorLightModeUi();
}

function createMapDataFileTexts() {
  return {
    "pointlights.json": `${JSON.stringify(serializePointLights(), null, 2)}\n`,
    "lighting.json": `${JSON.stringify(serializeLightingSettings(), null, 2)}\n`,
    "parallax.json": `${JSON.stringify(serializeParallaxSettings(), null, 2)}\n`,
    "interaction.json": `${JSON.stringify(serializeInteractionSettings(), null, 2)}\n`,
    "fog.json": `${JSON.stringify(serializeFogSettings(), null, 2)}\n`,
    "clouds.json": `${JSON.stringify(serializeCloudSettings(), null, 2)}\n`,
    "npc.json": `${JSON.stringify(serializeNpcState(), null, 2)}\n`,
  };
}

function downloadTextFile(fileName, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function saveAllMapDataFiles() {
  const files = createMapDataFileTexts();
  const folder = normalizeMapFolderPath(currentMapFolderPath);
  const names = Object.keys(files).join(", ");
  const confirmed = window.confirm(`Save map data files (${names}) for ${folder}?`);
  if (!confirmed) {
    setStatus("Save all canceled.");
    return;
  }

  if (typeof window.showDirectoryPicker === "function") {
    const dir = await window.showDirectoryPicker();
    for (const [name, text] of Object.entries(files)) {
      const handle = await dir.getFileHandle(name, { create: true });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
    }
    setStatus(`Saved map data (${names}) to selected folder. Recommended map path: ${folder}`);
    return;
  }

  for (const [name, text] of Object.entries(files)) {
    downloadTextFile(name, text);
  }
  setStatus(`Downloaded ${names}. Move them to ${folder}.`);
}

async function loadMapFromPath(mapFolderPath) {
  const folder = normalizeMapFolderPath(mapFolderPath);
  const [splat, normals, height, slope, water] = await Promise.all([
    loadImageFromUrl(`${folder}/splat.png`),
    loadImageFromUrl(`${folder}/normals.png`),
    loadImageFromUrl(`${folder}/height.png`),
    loadImageFromUrl(`${folder}/slope.png`),
    loadImageFromUrl(`${folder}/water.png`),
  ]);

  await applyMapImages(splat, normals, height, slope, water);
  currentMapFolderPath = folder;
  mapPathInput.value = folder;

  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
  applyLightingSettings(DEFAULT_LIGHTING_SETTINGS);
  applyParallaxSettings(DEFAULT_PARALLAX_SETTINGS);
  applyInteractionSettings(DEFAULT_INTERACTION_SETTINGS);
  applyFogSettings(DEFAULT_FOG_SETTINGS);
  applyCloudSettings(DEFAULT_CLOUD_SETTINGS);
  requestOverlayDraw();

  let loadedPointLights = false;
  let loadedLighting = false;
  let loadedParallax = false;
  let loadedInteraction = false;
  let loadedFog = false;
  let loadedClouds = false;
  let loadedNpc = false;

  try {
    const pointLightsJson = await tryLoadJsonFromUrl(`${folder}/pointlights.json`);
    applyLoadedPointLights(pointLightsJson, `${folder}/pointlights.json`, { suppressStatus: true });
    loadedPointLights = true;
  } catch (err) {
    console.warn(`No pointlights.json found in ${folder}`, err);
  }

  try {
    const lightingJson = await tryLoadJsonFromUrl(`${folder}/lighting.json`);
    applyLightingSettings(lightingJson);
    loadedLighting = true;
  } catch (err) {
    console.warn(`No lighting.json found in ${folder}`, err);
  }

  try {
    const parallaxJson = await tryLoadJsonFromUrl(`${folder}/parallax.json`);
    applyParallaxSettings(parallaxJson);
    loadedParallax = true;
  } catch (err) {
    console.warn(`No parallax.json found in ${folder}`, err);
  }

  try {
    const interactionJson = await tryLoadJsonFromUrl(`${folder}/interaction.json`);
    applyInteractionSettings(interactionJson);
    loadedInteraction = true;
  } catch (err) {
    console.warn(`No interaction.json found in ${folder}`, err);
  }

  try {
    const fogJson = await tryLoadJsonFromUrl(`${folder}/fog.json`);
    applyFogSettings(fogJson);
    loadedFog = true;
  } catch (err) {
    console.warn(`No fog.json found in ${folder}`, err);
  }

  try {
    const cloudsJson = await tryLoadJsonFromUrl(`${folder}/clouds.json`);
    applyCloudSettings(cloudsJson);
    loadedClouds = true;
  } catch (err) {
    console.warn(`No clouds.json found in ${folder}`, err);
  }

  try {
    const npcJson = await tryLoadJsonFromUrl(`${folder}/npc.json`);
    applyLoadedNpc(npcJson);
    loadedNpc = true;
  } catch (err) {
    applyLoadedNpc(DEFAULT_PLAYER);
    console.warn(`No npc.json found in ${folder}`, err);
  }

  rebuildMovementField();
  setStatus(`Loaded map ${folder} | pointlights: ${loadedPointLights ? "yes" : "no"} | lighting: ${loadedLighting ? "yes" : "no"} | parallax: ${loadedParallax ? "yes" : "no"} | interaction: ${loadedInteraction ? "yes" : "no"} | fog: ${loadedFog ? "yes" : "no"} | clouds: ${loadedClouds ? "yes" : "no"} | npc: ${loadedNpc ? "yes" : "default"}`);
}

async function loadMapFromFolderSelection(fileList) {
  const files = Array.from(fileList || []);
  const splatFile = getFileFromFolderSelection(files, "splat.png");
  const normalsFile = getFileFromFolderSelection(files, "normals.png");
  const heightFile = getFileFromFolderSelection(files, "height.png");
  const slopeFile = getFileFromFolderSelection(files, "slope.png");
  const waterFile = getFileFromFolderSelection(files, "water.png");
  if (!splatFile || !normalsFile || !heightFile || !slopeFile || !waterFile) {
    throw new Error("Folder must contain splat.png, normals.png, height.png, slope.png, and water.png.");
  }

  const [splat, normals, height, slope, water] = await Promise.all([
    loadImageFromFile(splatFile),
    loadImageFromFile(normalsFile),
    loadImageFromFile(heightFile),
    loadImageFromFile(slopeFile),
    loadImageFromFile(waterFile),
  ]);
  await applyMapImages(splat, normals, height, slope, water);

  const relPath = String(splatFile.webkitRelativePath || "");
  const firstFolder = relPath.includes("/") ? relPath.split("/")[0] : "";
  if (firstFolder) {
    currentMapFolderPath = `assets/${firstFolder}/`;
    mapPathInput.value = currentMapFolderPath;
  }

  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
  applyLightingSettings(DEFAULT_LIGHTING_SETTINGS);
  applyParallaxSettings(DEFAULT_PARALLAX_SETTINGS);
  applyInteractionSettings(DEFAULT_INTERACTION_SETTINGS);
  applyFogSettings(DEFAULT_FOG_SETTINGS);
  applyCloudSettings(DEFAULT_CLOUD_SETTINGS);
  requestOverlayDraw();

  let loadedPointLights = false;
  let loadedLighting = false;
  let loadedParallax = false;
  let loadedInteraction = false;
  let loadedFog = false;
  let loadedClouds = false;
  let loadedNpc = false;

  const pointLightsFile = getFileFromFolderSelection(files, "pointlights.json");
  if (pointLightsFile) {
    try {
      const rawData = JSON.parse(await pointLightsFile.text());
      applyLoadedPointLights(rawData, pointLightsFile.name, { suppressStatus: true });
      loadedPointLights = true;
    } catch (err) {
      console.warn("Failed to parse pointlights.json from selected folder", err);
    }
  } else {
    console.warn("No pointlights.json found in selected folder");
  }

  const lightingFile = getFileFromFolderSelection(files, "lighting.json");
  if (lightingFile) {
    try {
      const rawData = JSON.parse(await lightingFile.text());
      applyLightingSettings(rawData);
      loadedLighting = true;
    } catch (err) {
      console.warn("Failed to parse lighting.json from selected folder", err);
    }
  }

  const parallaxFile = getFileFromFolderSelection(files, "parallax.json");
  if (parallaxFile) {
    try {
      const rawData = JSON.parse(await parallaxFile.text());
      applyParallaxSettings(rawData);
      loadedParallax = true;
    } catch (err) {
      console.warn("Failed to parse parallax.json from selected folder", err);
    }
  }

  const interactionFile = getFileFromFolderSelection(files, "interaction.json");
  if (interactionFile) {
    try {
      const rawData = JSON.parse(await interactionFile.text());
      applyInteractionSettings(rawData);
      loadedInteraction = true;
    } catch (err) {
      console.warn("Failed to parse interaction.json from selected folder", err);
    }
  }

  const fogFile = getFileFromFolderSelection(files, "fog.json");
  if (fogFile) {
    try {
      const rawData = JSON.parse(await fogFile.text());
      applyFogSettings(rawData);
      loadedFog = true;
    } catch (err) {
      console.warn("Failed to parse fog.json from selected folder", err);
    }
  }

  const cloudsFile = getFileFromFolderSelection(files, "clouds.json");
  if (cloudsFile) {
    try {
      const rawData = JSON.parse(await cloudsFile.text());
      applyCloudSettings(rawData);
      loadedClouds = true;
    } catch (err) {
      console.warn("Failed to parse clouds.json from selected folder", err);
    }
  }

  const npcFile = getFileFromFolderSelection(files, "npc.json");
  if (npcFile) {
    try {
      const rawData = JSON.parse(await npcFile.text());
      applyLoadedNpc(rawData);
      loadedNpc = true;
    } catch (err) {
      console.warn("Failed to parse npc.json from selected folder", err);
      applyLoadedNpc(DEFAULT_PLAYER);
    }
  } else {
    applyLoadedNpc(DEFAULT_PLAYER);
  }

  rebuildMovementField();
  setStatus(`Loaded map folder | pointlights: ${loadedPointLights ? "yes" : "no"} | lighting: ${loadedLighting ? "yes" : "no"} | parallax: ${loadedParallax ? "yes" : "no"} | interaction: ${loadedInteraction ? "yes" : "no"} | fog: ${loadedFog ? "yes" : "no"} | clouds: ${loadedClouds ? "yes" : "no"} | npc: ${loadedNpc ? "yes" : "default"}`);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec3(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

function lerpAngleDeg(a, b, t) {
  const delta = ((b - a + 540) % 360) - 180;
  return a + delta * t;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function wrapHour(hour) {
  const h = hour % 24;
  return h < 0 ? h + 24 : h;
}

function formatHour(hour) {
  const h = wrapHour(hour);
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function setCycleHourSliderFromState() {
  cycleHourInput.value = String(clamp(cycleState.hour, 0, 24));
}

const SUN_KEYS = [
  { hour: 0, azimuthDeg: -170, altitudeDeg: -60, sunColor: [0.08, 0.10, 0.20], ambientColor: [0.06, 0.08, 0.12], ambientScale: 0.18 },
  { hour: 4, azimuthDeg: -135, altitudeDeg: -22, sunColor: [0.35, 0.26, 0.22], ambientColor: [0.14, 0.10, 0.12], ambientScale: 0.22 },
  { hour: 6, azimuthDeg: -108, altitudeDeg: 3, sunColor: [1.00, 0.50, 0.30], ambientColor: [0.42, 0.22, 0.15], ambientScale: 0.30 },
  { hour: 8, azimuthDeg: -72, altitudeDeg: 24, sunColor: [1.00, 0.82, 0.62], ambientColor: [0.44, 0.34, 0.28], ambientScale: 0.45 },
  { hour: 12, azimuthDeg: 0, altitudeDeg: 64, sunColor: [1.00, 0.98, 0.92], ambientColor: [0.58, 0.62, 0.68], ambientScale: 0.70 },
  { hour: 16, azimuthDeg: 72, altitudeDeg: 26, sunColor: [1.00, 0.84, 0.65], ambientColor: [0.44, 0.35, 0.30], ambientScale: 0.50 },
  { hour: 18, azimuthDeg: 108, altitudeDeg: 4, sunColor: [1.00, 0.48, 0.28], ambientColor: [0.45, 0.23, 0.16], ambientScale: 0.32 },
  { hour: 20, azimuthDeg: 138, altitudeDeg: -14, sunColor: [0.42, 0.25, 0.24], ambientColor: [0.18, 0.10, 0.14], ambientScale: 0.22 },
  { hour: 24, azimuthDeg: 190, altitudeDeg: -60, sunColor: [0.08, 0.10, 0.20], ambientColor: [0.06, 0.08, 0.12], ambientScale: 0.18 },
];

function sampleSunAtHour(hour) {
  const h = wrapHour(hour);
  for (let i = 0; i < SUN_KEYS.length - 1; i++) {
    const a = SUN_KEYS[i];
    const b = SUN_KEYS[i + 1];
    if (h >= a.hour && h <= b.hour) {
      const span = Math.max(0.0001, b.hour - a.hour);
      const t = (h - a.hour) / span;
      return {
        azimuthDeg: lerpAngleDeg(a.azimuthDeg, b.azimuthDeg, t),
        altitudeDeg: lerp(a.altitudeDeg, b.altitudeDeg, t),
        sunColor: lerpVec3(a.sunColor, b.sunColor, t),
        ambientColor: lerpVec3(a.ambientColor, b.ambientColor, t),
        ambientScale: lerp(a.ambientScale, b.ambientScale, t),
      };
    }
  }
  return SUN_KEYS[0];
}

const program = createProgram(VERT_SRC, FRAG_SRC);
gl.useProgram(program);

const uniforms = {
  uSplat: gl.getUniformLocation(program, "uSplat"),
  uNormals: gl.getUniformLocation(program, "uNormals"),
  uHeight: gl.getUniformLocation(program, "uHeight"),
  uPointLightTex: gl.getUniformLocation(program, "uPointLightTex"),
  uCloudNoiseTex: gl.getUniformLocation(program, "uCloudNoiseTex"),
  uUseCursorLight: gl.getUniformLocation(program, "uUseCursorLight"),
  uCursorLightUv: gl.getUniformLocation(program, "uCursorLightUv"),
  uCursorLightColor: gl.getUniformLocation(program, "uCursorLightColor"),
  uCursorLightStrength: gl.getUniformLocation(program, "uCursorLightStrength"),
  uCursorLightHeightOffset: gl.getUniformLocation(program, "uCursorLightHeightOffset"),
  uUseCursorTerrainHeight: gl.getUniformLocation(program, "uUseCursorTerrainHeight"),
  uCursorLightMapSize: gl.getUniformLocation(program, "uCursorLightMapSize"),
  uMapTexelSize: gl.getUniformLocation(program, "uMapTexelSize"),
  uResolution: gl.getUniformLocation(program, "uResolution"),
  uSunDir: gl.getUniformLocation(program, "uSunDir"),
  uSunColor: gl.getUniformLocation(program, "uSunColor"),
  uSunStrength: gl.getUniformLocation(program, "uSunStrength"),
  uMoonDir: gl.getUniformLocation(program, "uMoonDir"),
  uMoonColor: gl.getUniformLocation(program, "uMoonColor"),
  uMoonStrength: gl.getUniformLocation(program, "uMoonStrength"),
  uAmbientColor: gl.getUniformLocation(program, "uAmbientColor"),
  uAmbient: gl.getUniformLocation(program, "uAmbient"),
  uHeightScale: gl.getUniformLocation(program, "uHeightScale"),
  uShadowStrength: gl.getUniformLocation(program, "uShadowStrength"),
  uUseShadows: gl.getUniformLocation(program, "uUseShadows"),
  uUseParallax: gl.getUniformLocation(program, "uUseParallax"),
  uParallaxStrength: gl.getUniformLocation(program, "uParallaxStrength"),
  uParallaxBands: gl.getUniformLocation(program, "uParallaxBands"),
  uZoom: gl.getUniformLocation(program, "uZoom"),
  uUseFog: gl.getUniformLocation(program, "uUseFog"),
  uFogColor: gl.getUniformLocation(program, "uFogColor"),
  uFogMinAlpha: gl.getUniformLocation(program, "uFogMinAlpha"),
  uFogMaxAlpha: gl.getUniformLocation(program, "uFogMaxAlpha"),
  uFogFalloff: gl.getUniformLocation(program, "uFogFalloff"),
  uFogStartOffset: gl.getUniformLocation(program, "uFogStartOffset"),
  uCameraHeightNorm: gl.getUniformLocation(program, "uCameraHeightNorm"),
  uMapAspect: gl.getUniformLocation(program, "uMapAspect"),
  uViewHalfExtents: gl.getUniformLocation(program, "uViewHalfExtents"),
  uPanWorld: gl.getUniformLocation(program, "uPanWorld"),
  uTimeSec: gl.getUniformLocation(program, "uTimeSec"),
  uPointFlickerEnabled: gl.getUniformLocation(program, "uPointFlickerEnabled"),
  uPointFlickerStrength: gl.getUniformLocation(program, "uPointFlickerStrength"),
  uPointFlickerSpeed: gl.getUniformLocation(program, "uPointFlickerSpeed"),
  uPointFlickerSpatial: gl.getUniformLocation(program, "uPointFlickerSpatial"),
  uUseClouds: gl.getUniformLocation(program, "uUseClouds"),
  uCloudCoverage: gl.getUniformLocation(program, "uCloudCoverage"),
  uCloudSoftness: gl.getUniformLocation(program, "uCloudSoftness"),
  uCloudOpacity: gl.getUniformLocation(program, "uCloudOpacity"),
  uCloudScale: gl.getUniformLocation(program, "uCloudScale"),
  uCloudSpeed1: gl.getUniformLocation(program, "uCloudSpeed1"),
  uCloudSpeed2: gl.getUniformLocation(program, "uCloudSpeed2"),
  uCloudSunParallax: gl.getUniformLocation(program, "uCloudSunParallax"),
  uCloudUseSunProjection: gl.getUniformLocation(program, "uCloudUseSunProjection"),
};

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]),
  gl.STATIC_DRAW
);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

const splatTex = createTexture();
const normalsTex = createTexture();
const heightTex = createTexture();
const pointLightTex = createTexture();
const cloudNoiseTex = gl.createTexture();
uploadCloudNoiseTexture();

const splatSize = { width: 1, height: 1 };
const heightSize = { width: 1, height: 1 };
const normalsSize = { width: 1, height: 1 };

const pointLightBakeCanvas = document.createElement("canvas");
const pointLightBakeCtx = pointLightBakeCanvas.getContext("2d");
if (!pointLightBakeCtx) {
  throw new Error("Point-light bake canvas 2D context is required.");
}

const pointLights = [];
let selectedLightId = null;
let lightEditDraft = null;
let nextPointLightId = 1;
let pointLightsSaveConfirmArmed = false;
let pointLightsSaveConfirmTimer = null;
let normalsImageData = null;
let heightImageData = null;
let slopeImageData = null;
let waterImageData = null;
let pointLightBakeScheduled = false;
let pointLightBakeDebounceTimer = null;
let pointLightBakeRequestId = 0;
let pointLightBakePendingRequestId = 0;
const POINT_LIGHT_BLEND_EXPOSURE = 0.65;
const POINT_LIGHT_SELECT_RADIUS = 3;
const POINT_LIGHT_BAKE_LIVE_SCALE = 0.5;
const POINT_LIGHT_BAKE_DEBOUNCE_MS = 80;
const DEFAULT_POINT_LIGHT_FLICKER = 0.7;
const DEFAULT_POINT_LIGHT_FLICKER_SPEED = 0.5;
let overlayDirty = true;
const DEFAULT_MAP_FOLDER = "assets/map1/";
let currentMapFolderPath = DEFAULT_MAP_FOLDER;
const DEFAULT_MAP_FOLDER_CANDIDATES = ["assets/map1/", "assets/Map 1/", "assets/"];
const DEFAULT_PLAYER = {
  charID: "player",
  pixelX: 120,
  pixelY: 96,
  color: "#ff69b4",
};
const playerState = {
  charID: DEFAULT_PLAYER.charID,
  pixelX: DEFAULT_PLAYER.pixelX,
  pixelY: DEFAULT_PLAYER.pixelY,
  color: DEFAULT_PLAYER.color,
};
const movePreviewState = {
  hoverPixel: null,
  pathPixels: [],
};
let interactionMode = "none";
let movementField = null;
const pointLightBakeTempCanvas = document.createElement("canvas");
const pointLightBakeTempCtx = pointLightBakeTempCanvas.getContext("2d");
let pointLightBakeWorker = null;
try {
  pointLightBakeWorker = new Worker(new URL("./pointLightBakeWorker.js", import.meta.url), { type: "module" });
} catch (err) {
  console.warn("Point-light bake worker unavailable; falling back to main-thread baking.", err);
}
if (pointLightBakeWorker) {
  pointLightBakeWorker.addEventListener("message", (event) => {
    const { requestId, width, height, rgbaBuffer, error } = event.data || {};
    if (error) {
      console.warn("Point-light bake worker error:", error);
      if (requestId === pointLightBakePendingRequestId) {
        bakePointLightsTextureSync(false);
      }
      return;
    }
    if (!Number.isFinite(requestId) || requestId < pointLightBakePendingRequestId) {
      return;
    }
    pointLightBakePendingRequestId = requestId;
    applyPointLightBakeRgba(new Uint8ClampedArray(rgbaBuffer), width, height);
  });
}

function createFlatNormalImage(size = 2) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(128,128,255)";
  ctx.fillRect(0, 0, size, size);
  return c;
}

function createFlatHeightImage(size = 2) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, size, size);
  return c;
}

function createFlatSlopeImage(size = 2) {
  return createFlatHeightImage(size);
}

function createFlatWaterImage(size = 2) {
  return createFlatHeightImage(size);
}

function createFallbackSplat(size = 512) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0.0, "#567d46");
  g.addColorStop(0.5, "#7a8f5a");
  g.addColorStop(1.0, "#b2a87a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1 + Math.random() * 2;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(70,92,58,0.35)" : "rgba(147,132,91,0.25)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function setSplatSizeFromImage(img) {
  const prevW = splatSize.width;
  const prevH = splatSize.height;
  splatSize.width = img.width || 1;
  splatSize.height = img.height || 1;
  return splatSize.width !== prevW || splatSize.height !== prevH;
}

function setHeightSizeFromImage(img) {
  heightSize.width = img.width || 1;
  heightSize.height = img.height || 1;
}

function setNormalsSizeFromImage(img) {
  normalsSize.width = img.width || 1;
  normalsSize.height = img.height || 1;
}

function extractImageData(source) {
  const width = source.width || 1;
  const height = source.height || 1;
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  ctx.drawImage(source, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

const defaultNormalImage = createFlatNormalImage();
const defaultHeightImage = createFlatHeightImage();
const defaultSlopeImage = createFlatSlopeImage();
const defaultWaterImage = createFlatWaterImage();
const defaultSplatImage = createFallbackSplat();
uploadImageToTexture(normalsTex, defaultNormalImage);
uploadImageToTexture(heightTex, defaultHeightImage);
uploadImageToTexture(splatTex, defaultSplatImage);
setSplatSizeFromImage(defaultSplatImage);
setHeightSizeFromImage(defaultHeightImage);
setNormalsSizeFromImage(defaultNormalImage);
normalsImageData = extractImageData(defaultNormalImage);
heightImageData = extractImageData(defaultHeightImage);
slopeImageData = extractImageData(defaultSlopeImage);
waterImageData = extractImageData(defaultWaterImage);
syncPointLightWorkerMapData();

function getSelectedPointLight() {
  return pointLights.find((light) => light.id === selectedLightId) || null;
}

function clearPointLights() {
  pointLights.length = 0;
  selectedLightId = null;
  lightEditDraft = null;
  resetPointLightsSaveConfirmation();
}

function resetPointLightsSaveConfirmation() {
  pointLightsSaveConfirmArmed = false;
  pointLightsSaveAllBtn.textContent = "Save All";
  if (pointLightsSaveConfirmTimer !== null) {
    window.clearTimeout(pointLightsSaveConfirmTimer);
    pointLightsSaveConfirmTimer = null;
  }
}

function armPointLightsSaveConfirmation() {
  pointLightsSaveConfirmArmed = true;
  pointLightsSaveAllBtn.textContent = "Confirm Save";
  if (pointLightsSaveConfirmTimer !== null) {
    window.clearTimeout(pointLightsSaveConfirmTimer);
  }
  pointLightsSaveConfirmTimer = window.setTimeout(() => {
    resetPointLightsSaveConfirmation();
  }, 5000);
}

function normalizeImportedPointLightColor(rawColor) {
  if (!Array.isArray(rawColor) || rawColor.length < 3) return null;
  const channelRaw = [Number(rawColor[0]), Number(rawColor[1]), Number(rawColor[2])];
  if (!channelRaw.every((v) => Number.isFinite(v))) return null;
  const uses255Range = channelRaw.some((v) => v > 1);
  if (uses255Range) {
    return channelRaw.map((v) => clamp(v / 255, 0, 1));
  }
  return channelRaw.map((v) => clamp(v, 0, 1));
}

function serializePointLights() {
  return {
    version: 1,
    mapSize: {
      width: splatSize.width,
      height: splatSize.height,
    },
    lights: pointLights.map((light) => ({
      x: light.pixelX,
      y: light.pixelY,
      range: light.strength,
      intensity: light.intensity,
      heightOffset: light.heightOffset,
      flicker: clamp(Number.isFinite(Number(light.flicker)) ? Number(light.flicker) : DEFAULT_POINT_LIGHT_FLICKER, 0, 1),
      flickerSpeed: clamp(Number.isFinite(Number(light.flickerSpeed)) ? Number(light.flickerSpeed) : DEFAULT_POINT_LIGHT_FLICKER_SPEED, 0, 1),
      color: [light.color[0], light.color[1], light.color[2]],
    })),
  };
}

function parsePointLightsFromJson(rawData) {
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
    const rawFlicker = rawLight && (rawLight.flicker ?? rawLight.flickerAmount ?? DEFAULT_POINT_LIGHT_FLICKER);
    const rawFlickerSpeed = rawLight && (rawLight.flickerSpeed ?? rawLight.flickerRate ?? DEFAULT_POINT_LIGHT_FLICKER_SPEED);
    const color = normalizeImportedPointLightColor(rawLight && rawLight.color);
    const pixelX = Math.round(Number(rawX));
    const pixelY = Math.round(Number(rawY));
    const strength = Math.round(Number(rawStrength));
    const intensity = Number(rawIntensity);
    const heightOffset = Math.round(Number(rawHeightOffset));
    const flicker = Number(rawFlicker);
    const flickerSpeed = Number(rawFlickerSpeed);
    if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY) || !Number.isFinite(strength) || !Number.isFinite(intensity) || !Number.isFinite(heightOffset) || !Number.isFinite(flicker) || !Number.isFinite(flickerSpeed) || !color) {
      skippedCount += 1;
      continue;
    }

    parsedLights.push({
      pixelX: clamp(pixelX, 0, Math.max(0, splatSize.width - 1)),
      pixelY: clamp(pixelY, 0, Math.max(0, splatSize.height - 1)),
      strength: Math.round(clamp(strength, 1, 200)),
      intensity: clamp(intensity, 0, 4),
      heightOffset: Math.round(clamp(heightOffset, -120, 240)),
      flicker: clamp(flicker, 0, 1),
      flickerSpeed: clamp(flickerSpeed, 0, 1),
      color,
    });
  }

  return { parsedLights, skippedCount };
}

function applyLoadedPointLights(rawData, sourceLabel, options = {}) {
  const suppressStatus = Boolean(options.suppressStatus);
  const { parsedLights, skippedCount } = parsePointLightsFromJson(rawData);

  clearPointLights();
  for (const light of parsedLights) {
    pointLights.push({
      id: nextPointLightId++,
      pixelX: light.pixelX,
      pixelY: light.pixelY,
      strength: light.strength,
      intensity: light.intensity,
      heightOffset: light.heightOffset,
      flicker: light.flicker,
      flickerSpeed: light.flickerSpeed,
      color: [...light.color],
    });
  }

  bakePointLightsTexture();
  updateLightEditorUi();
  requestOverlayDraw();

  if (!suppressStatus) {
    const skippedNote = skippedCount > 0 ? ` | Skipped invalid entries: ${skippedCount}` : "";
    setStatus(`Loaded point lights from ${sourceLabel}: ${parsedLights.length}${skippedNote}`);
  }

  return { loadedCount: parsedLights.length, skippedCount };
}

async function savePointLightsJson() {
  const payload = serializePointLights();
  const text = `${JSON.stringify(payload, null, 2)}\n`;

  if (typeof window.showSaveFilePicker === "function") {
    const handle = await window.showSaveFilePicker({
      suggestedName: "pointlights.json",
      types: [
        {
          description: "JSON",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    setStatus(`Saved ${payload.lights.length} point lights. Place pointlights.json in ${normalizeMapFolderPath(currentMapFolderPath)} for map reloads.`);
    return;
  }

  downloadTextFile("pointlights.json", text);
  setStatus(`Downloaded pointlights.json with ${payload.lights.length} point lights. Place it in ${normalizeMapFolderPath(currentMapFolderPath)}.`);
}

async function loadPointLightsFromAssetsOrPrompt() {
  const pointLightsPath = `${normalizeMapFolderPath(currentMapFolderPath)}/pointlights.json`;
  try {
    const response = await fetch(pointLightsPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const rawData = await response.json();
    applyLoadedPointLights(rawData, pointLightsPath);
    return;
  } catch (err) {
    console.warn(`Failed to load ${pointLightsPath}`, err);
  }

  setStatus(`${pointLightsPath} not found. Select a pointlights JSON file to load.`);
  pointLightsLoadInput.value = "";
  pointLightsLoadInput.click();
}

function ensurePointLightBakeSize() {
  const w = Math.max(1, Math.floor(splatSize.width));
  const h = Math.max(1, Math.floor(splatSize.height));
  if (pointLightBakeCanvas.width !== w || pointLightBakeCanvas.height !== h) {
    pointLightBakeCanvas.width = w;
    pointLightBakeCanvas.height = h;
  }
}

function normalize3(x, y, z) {
  const len = Math.hypot(x, y, z);
  if (len < 0.000001) return [0, 0, 1];
  return [x / len, y / len, z / len];
}

function sampleNormalAtMapPixel(pixelX, pixelY) {
  if (!normalsImageData || !normalsImageData.data) {
    return [0, 0, 1];
  }
  const nx = clamp(Math.round((pixelX + 0.5) / splatSize.width * normalsSize.width - 0.5), 0, normalsSize.width - 1);
  const ny = clamp(Math.round((pixelY + 0.5) / splatSize.height * normalsSize.height - 0.5), 0, normalsSize.height - 1);
  const idx = (ny * normalsSize.width + nx) * 4;
  const d = normalsImageData.data;
  const vx = (d[idx] / 255) * 2 - 1;
  const vy = (d[idx + 1] / 255) * 2 - 1;
  const vz = (d[idx + 2] / 255) * 2 - 1;
  return normalize3(vx, vy, vz);
}

function sampleHeightAtMapPixel(pixelX, pixelY) {
  if (!heightImageData || !heightImageData.data) {
    return 0;
  }
  const hx = clamp(Math.round((pixelX + 0.5) / splatSize.width * heightSize.width - 0.5), 0, heightSize.width - 1);
  const hy = clamp(Math.round((pixelY + 0.5) / splatSize.height * heightSize.height - 0.5), 0, heightSize.height - 1);
  const idx = (hy * heightSize.width + hx) * 4;
  return heightImageData.data[idx] / 255;
}

function hasLineOfSightToLight(surfaceX, surfaceY, surfaceH, lightX, lightY, lightH, heightScaleValue) {
  const dx = lightX - surfaceX;
  const dy = lightY - surfaceY;
  const dist = Math.hypot(dx, dy);
  if (dist <= 1.0) return true;

  const stepSize = 1.0;
  const stepCount = Math.max(1, Math.floor(dist / stepSize));
  const invSteps = 1 / stepCount;
  const heightBias = 0.7;

  for (let i = 1; i < stepCount; i++) {
    const t = i * invSteps;
    const sx = surfaceX + dx * t;
    const sy = surfaceY + dy * t;
    const rayH = surfaceH + (lightH - surfaceH) * t;
    const terrainH = sampleHeightAtMapPixel(sx, sy) * heightScaleValue;
    if (terrainH > rayH + heightBias) {
      return false;
    }
  }

  return true;
}

function applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight) {
  if (sourceWidth === pointLightBakeCanvas.width && sourceHeight === pointLightBakeCanvas.height) {
    pointLightBakeCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
  } else if (pointLightBakeTempCtx) {
    pointLightBakeTempCanvas.width = sourceWidth;
    pointLightBakeTempCanvas.height = sourceHeight;
    pointLightBakeTempCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
    pointLightBakeCtx.imageSmoothingEnabled = false;
    pointLightBakeCtx.clearRect(0, 0, pointLightBakeCanvas.width, pointLightBakeCanvas.height);
    pointLightBakeCtx.drawImage(pointLightBakeTempCanvas, 0, 0, pointLightBakeCanvas.width, pointLightBakeCanvas.height);
  } else {
    pointLightBakeCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
  }
  uploadImageToTexture(pointLightTex, pointLightBakeCanvas);
  requestOverlayDraw();
}

function schedulePointLightBake() {
  if (pointLightBakeDebounceTimer !== null) {
    window.clearTimeout(pointLightBakeDebounceTimer);
    pointLightBakeDebounceTimer = null;
  }
  const delayMs = pointLightLiveUpdateToggle.checked ? POINT_LIGHT_BAKE_DEBOUNCE_MS : 0;
  pointLightBakeDebounceTimer = window.setTimeout(() => {
    pointLightBakeDebounceTimer = null;
    if (pointLightBakeScheduled) return;
    pointLightBakeScheduled = true;
    requestAnimationFrame(() => {
      pointLightBakeScheduled = false;
      bakePointLightsTexture();
    });
  }, delayMs);
}

function bakePointLightsTexture() {
  ensurePointLightBakeSize();
  const useReducedResolution = pointLightLiveUpdateToggle.checked;
  if (!pointLightBakeWorker || !normalsImageData || !heightImageData) {
    bakePointLightsTextureSync(useReducedResolution);
    return;
  }

  const fullWidth = pointLightBakeCanvas.width;
  const fullHeight = pointLightBakeCanvas.height;
  const scale = useReducedResolution ? POINT_LIGHT_BAKE_LIVE_SCALE : 1;
  const bakeWidth = Math.max(1, Math.round(fullWidth * scale));
  const bakeHeight = Math.max(1, Math.round(fullHeight * scale));
  const requestId = ++pointLightBakeRequestId;
  pointLightBakePendingRequestId = requestId;
  pointLightBakeWorker.postMessage({
    type: "bake",
    requestId,
    bakeWidth,
    bakeHeight,
    lights: pointLights,
    heightScaleValue: Math.max(1, Number(heightScaleInput.value) || 1),
    blendExposure: POINT_LIGHT_BLEND_EXPOSURE,
  });
}

function bakePointLightsTextureSync(useReducedResolution = false) {
  const fullWidth = pointLightBakeCanvas.width;
  const fullHeight = pointLightBakeCanvas.height;
  const scale = useReducedResolution ? POINT_LIGHT_BAKE_LIVE_SCALE : 1;
  const w = Math.max(1, Math.round(fullWidth * scale));
  const h = Math.max(1, Math.round(fullHeight * scale));
  const mapScaleX = fullWidth / w;
  const mapScaleY = fullHeight / h;
  const heightScaleValue = Math.max(1, Number(heightScaleInput.value) || 1);
  const pixelCount = w * h;
  const rgba = new Uint8ClampedArray(pixelCount * 4);
  const accumColor = new Float32Array(pixelCount * 3);
  const accumWeight = new Float32Array(pixelCount);
  const accumFlicker = new Float32Array(pixelCount);
  const accumFlickerSpeed = new Float32Array(pixelCount);

  if (pointLights.length > 0) {
    for (const light of pointLights) {
      const radiusMapPx = Math.max(1, Number(light.strength) || 1);
      const intensityMul = clamp(Number(light.intensity), 0, 4);
      const flickerRaw = Number(light.flicker);
      const flickerMul = clamp(Number.isFinite(flickerRaw) ? flickerRaw : DEFAULT_POINT_LIGHT_FLICKER, 0, 1);
      const flickerSpeedRaw = Number(light.flickerSpeed);
      const flickerSpeedMul = clamp(Number.isFinite(flickerSpeedRaw) ? flickerSpeedRaw : DEFAULT_POINT_LIGHT_FLICKER_SPEED, 0, 1);
      if (intensityMul <= 0.0001) continue;
      const lightTerrainHeight = sampleHeightAtMapPixel(light.pixelX, light.pixelY) * heightScaleValue;
      const lightHeight = lightTerrainHeight + (Number(light.heightOffset) || 0);
      const minX = Math.max(0, Math.floor((light.pixelX - radiusMapPx) / mapScaleX));
      const maxX = Math.min(w - 1, Math.ceil((light.pixelX + radiusMapPx) / mapScaleX));
      const minY = Math.max(0, Math.floor((light.pixelY - radiusMapPx) / mapScaleY));
      const maxY = Math.min(h - 1, Math.ceil((light.pixelY + radiusMapPx) / mapScaleY));
      const radiusSq = radiusMapPx * radiusMapPx;

      for (let y = minY; y <= maxY; y++) {
        const mapY = (y + 0.5) * mapScaleY - 0.5;
        const dy = light.pixelY - mapY;
        for (let x = minX; x <= maxX; x++) {
          const mapX = (x + 0.5) * mapScaleX - 0.5;
          const dx = light.pixelX - mapX;
          const distSq = dx * dx + dy * dy;
          if (distSq > radiusSq) continue;
          const falloff = Math.max(0, 1 - Math.sqrt(distSq) / radiusMapPx);
          if (falloff <= 0) continue;
          const surfaceHeight = sampleHeightAtMapPixel(mapX, mapY) * heightScaleValue;
          if (!hasLineOfSightToLight(mapX, mapY, surfaceHeight, light.pixelX, light.pixelY, lightHeight, heightScaleValue)) {
            continue;
          }
          const normal = sampleNormalAtMapPixel(mapX, mapY);
          const toLight = normalize3(dx, dy, lightHeight - surfaceHeight);
          const ndotl = Math.max(0, normal[0] * toLight[0] + normal[1] * toLight[1] + normal[2] * toLight[2]);
          const contribution = falloff * ndotl * intensityMul;
          if (contribution <= 0) continue;
          const pixelIdx = y * w + x;
          const baseIdx = pixelIdx * 3;
          accumWeight[pixelIdx] += contribution;
          accumFlicker[pixelIdx] += contribution * flickerMul;
          accumFlickerSpeed[pixelIdx] += contribution * flickerSpeedMul;
          accumColor[baseIdx] += light.color[0] * contribution;
          accumColor[baseIdx + 1] += light.color[1] * contribution;
          accumColor[baseIdx + 2] += light.color[2] * contribution;
        }
      }
    }
  }

  for (let pixelIdx = 0, j = 0; pixelIdx < accumWeight.length; pixelIdx++, j += 4) {
    const weight = accumWeight[pixelIdx];
    if (weight <= 0.000001) continue;
    const baseIdx = pixelIdx * 3;
    const intensityR = 1 - Math.exp(-accumColor[baseIdx] * POINT_LIGHT_BLEND_EXPOSURE);
    const intensityG = 1 - Math.exp(-accumColor[baseIdx + 1] * POINT_LIGHT_BLEND_EXPOSURE);
    const intensityB = 1 - Math.exp(-accumColor[baseIdx + 2] * POINT_LIGHT_BLEND_EXPOSURE);
    rgba[j] = Math.round(clamp(accumColor[baseIdx] * intensityR, 0, 1) * 255);
    rgba[j + 1] = Math.round(clamp(accumColor[baseIdx + 1] * intensityG, 0, 1) * 255);
    rgba[j + 2] = Math.round(clamp(accumColor[baseIdx + 2] * intensityB, 0, 1) * 255);
    const flickerAvg = clamp(accumFlicker[pixelIdx] / weight, 0, 1);
    const flickerSpeedAvg = clamp(accumFlickerSpeed[pixelIdx] / weight, 0, 1);
    const flickerNibble = Math.round(flickerAvg * 15);
    const flickerSpeedNibble = Math.round(flickerSpeedAvg * 15);
    rgba[j + 3] = flickerNibble * 16 + flickerSpeedNibble;
  }

  applyPointLightBakeRgba(rgba, w, h);
}

function updatePointLightStrengthLabel() {
  const value = Math.round(clamp(Number(pointLightStrengthInput.value), 1, 200));
  pointLightStrengthValue.textContent = `${value} px`;
}

function updatePointLightIntensityLabel() {
  const value = clamp(Number(pointLightIntensityInput.value), 0, 4);
  pointLightIntensityValue.textContent = `${value.toFixed(2)}x`;
}

function updatePointLightHeightOffsetLabel() {
  const value = Math.round(clamp(Number(pointLightHeightOffsetInput.value), -120, 240));
  pointLightHeightOffsetValue.textContent = `${value} px`;
}

function updatePointLightFlickerLabel() {
  const value = clamp(Number(pointLightFlickerInput.value), 0, 1);
  pointLightFlickerValue.textContent = value.toFixed(2);
}

function updatePointLightFlickerSpeedLabel() {
  const value = clamp(Number(pointLightFlickerSpeedInput.value), 0, 1);
  pointLightFlickerSpeedValue.textContent = value.toFixed(2);
}

function updateCursorLightStrengthLabel() {
  const value = Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200));
  cursorLightStrengthValue.textContent = `${value} px`;
}

function updateCursorLightHeightOffsetLabel() {
  const value = Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120));
  cursorLightHeightOffsetValue.textContent = `${value}`;
}

function updateCursorLightModeUi() {
  const followTerrain = cursorLightFollowHeightToggle.checked;
  cursorLightHeightOffsetInput.disabled = !followTerrain;
}

function setTopicPanelVisible(visible) {
  topicPanelEl.classList.toggle("hidden", !visible);
}

function setActiveTopic(topicName) {
  let opened = false;
  for (const btn of topicButtons) {
    const active = btn.dataset.topic === topicName;
    btn.classList.toggle("active", active);
    if (active) opened = true;
  }
  for (const card of topicCards) {
    const active = card.dataset.topic === topicName;
    card.classList.toggle("active", active);
    if (active) {
      topicPanelTitleEl.textContent = card.dataset.title || "Settings";
    }
  }
  setTopicPanelVisible(opened);
}

function updateCursorLightFromPointer(clientX, clientY) {
  if (!cursorLightModeToggle.checked) {
    cursorLightState.active = false;
    return;
  }
  const ndc = clientToNdc(clientX, clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  const inside = uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1;
  cursorLightState.active = inside;
  if (!inside) return;
  cursorLightState.uvX = uv.x;
  cursorLightState.uvY = uv.y;
}

function updateLightEditorUi() {
  const selected = getSelectedPointLight();
  if (!selected || !lightEditDraft) {
    lightEditorEmptyEl.style.display = "block";
    lightEditorFieldsEl.classList.remove("active");
    lightCoordEl.textContent = "Coord: (-, -)";
    return;
  }

  lightEditorEmptyEl.style.display = "none";
  lightEditorFieldsEl.classList.add("active");
  lightCoordEl.textContent = `Coord: (${selected.pixelX}, ${selected.pixelY})`;
  pointLightColorInput.value = rgbToHex(lightEditDraft.color);
  pointLightStrengthInput.value = String(Math.round(lightEditDraft.strength));
  pointLightIntensityInput.value = String(clamp(lightEditDraft.intensity, 0, 4));
  pointLightHeightOffsetInput.value = String(Math.round(lightEditDraft.heightOffset));
  pointLightFlickerInput.value = String(clamp(lightEditDraft.flicker, 0, 1));
  pointLightFlickerSpeedInput.value = String(clamp(lightEditDraft.flickerSpeed, 0, 1));
  updatePointLightStrengthLabel();
  updatePointLightIntensityLabel();
  updatePointLightHeightOffsetLabel();
  updatePointLightFlickerLabel();
  updatePointLightFlickerSpeedLabel();
}

function beginLightEdit(light) {
  const flickerRaw = Number(light.flicker);
  const flickerSpeedRaw = Number(light.flickerSpeed);
  selectedLightId = light.id;
  lightEditDraft = {
    color: [...light.color],
    strength: light.strength,
    intensity: light.intensity,
    heightOffset: light.heightOffset,
    flicker: clamp(Number.isFinite(flickerRaw) ? flickerRaw : DEFAULT_POINT_LIGHT_FLICKER, 0, 1),
    flickerSpeed: clamp(Number.isFinite(flickerSpeedRaw) ? flickerSpeedRaw : DEFAULT_POINT_LIGHT_FLICKER_SPEED, 0, 1),
  };
  updateLightEditorUi();
}

function applyDraftToSelectedPointLight() {
  const selected = getSelectedPointLight();
  if (!selected || !lightEditDraft) return null;
  selected.color = [...lightEditDraft.color];
  selected.strength = Math.round(clamp(lightEditDraft.strength, 1, 200));
  selected.intensity = clamp(Number(lightEditDraft.intensity), 0, 4);
  selected.heightOffset = Math.round(clamp(lightEditDraft.heightOffset, -120, 240));
  selected.flicker = clamp(Number(lightEditDraft.flicker), 0, 1);
  selected.flickerSpeed = clamp(Number(lightEditDraft.flickerSpeed), 0, 1);
  return selected;
}

function rebakeIfPointLightLiveUpdateEnabled() {
  if (!pointLightLiveUpdateToggle.checked) return;
  if (!applyDraftToSelectedPointLight()) return;
  schedulePointLightBake();
}

function findPointLightAtPixel(pixelX, pixelY, radiusPx = POINT_LIGHT_SELECT_RADIUS) {
  const maxDistSq = radiusPx * radiusPx;
  let best = null;
  let bestDistSq = Infinity;
  for (const light of pointLights) {
    const dx = light.pixelX - pixelX;
    const dy = light.pixelY - pixelY;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxDistSq || distSq >= bestDistSq) continue;
    bestDistSq = distSq;
    best = light;
  }
  return best;
}

function createPointLight(pixelX, pixelY) {
  const light = {
    id: nextPointLightId++,
    pixelX,
    pixelY,
    strength: 30,
    intensity: 1,
    heightOffset: 8,
    flicker: DEFAULT_POINT_LIGHT_FLICKER,
    flickerSpeed: DEFAULT_POINT_LIGHT_FLICKER_SPEED,
    color: hexToRgb01("#ff9b2f"),
  };
  pointLights.push(light);
  bakePointLightsTexture();
  beginLightEdit(light);
  setStatus(`Created point light at (${pixelX}, ${pixelY})`);
}

function applyMapSizeChangeIfNeeded(changed) {
  if (!changed) return;
  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
}
bakePointLightsTexture();
updateLightEditorUi();

let zoom = 1;
const zoomMin = 0.5;
const zoomMax = 32;
const panWorld = { x: 0, y: 0 };
let isMiddleDragging = false;
let lastDragClient = { x: 0, y: 0 };
let fogColorManual = false;
const cursorLightState = {
  uvX: 0.5,
  uvY: 0.5,
  active: false,
  color: hexToRgb01(cursorLightColorInput.value),
  strength: Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200)),
  heightOffset: Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120)),
  useTerrainHeight: cursorLightFollowHeightToggle.checked,
  showGizmo: cursorLightGizmoToggle.checked,
};

const cycleState = {
  hour: 9.5,
  lastRenderMs: null,
};
let isCycleHourScrubbing = false;

function resetCamera() {
  zoom = 1;
  panWorld.x = 0;
  panWorld.y = 0;
  requestOverlayDraw();
}

function getScreenAspect() {
  return canvas.width > 0 && canvas.height > 0 ? canvas.width / canvas.height : 1;
}

function getMapAspect() {
  return splatSize.width / splatSize.height;
}

function getBaseViewHalfExtents() {
  const screenAspect = getScreenAspect();
  const mapAspect = getMapAspect();
  if (screenAspect >= mapAspect) {
    return { x: screenAspect, y: 1 };
  }
  return { x: mapAspect, y: mapAspect / screenAspect };
}

function getViewHalfExtents(zoomValue = zoom) {
  const base = getBaseViewHalfExtents();
  return {
    x: base.x / zoomValue,
    y: base.y / zoomValue,
  };
}

function clientToNdc(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((clientY - rect.top) / rect.height) * 2;
  return { x, y };
}

function worldFromNdc(ndc, zoomValue = zoom, pan = panWorld) {
  const ext = getViewHalfExtents(zoomValue);
  return {
    x: pan.x + ndc.x * ext.x,
    y: pan.y + ndc.y * ext.y,
  };
}

function worldToUv(world) {
  return {
    x: world.x / getMapAspect() + 0.5,
    y: world.y + 0.5,
  };
}

function uvToMapPixelIndex(uv) {
  return {
    x: Math.floor(clamp(uv.x, 0, 0.999999) * splatSize.width),
    y: Math.floor((1 - clamp(uv.y, 0, 0.999999)) * splatSize.height),
  };
}

function mapPixelIndexToUv(pixelX, pixelY) {
  return {
    x: (pixelX + 0.5) / splatSize.width,
    y: 1 - (pixelY + 0.5) / splatSize.height,
  };
}

function mapPixelToWorld(pixelX, pixelY) {
  const uv = mapPixelIndexToUv(pixelX, pixelY);
  return {
    x: (uv.x - 0.5) * getMapAspect(),
    y: uv.y - 0.5,
  };
}

function worldToScreen(world) {
  const viewHalf = getViewHalfExtents();
  const ndcX = (world.x - panWorld.x) / viewHalf.x;
  const ndcY = (world.y - panWorld.y) / viewHalf.y;
  return {
    x: (ndcX * 0.5 + 0.5) * overlayCanvas.width,
    y: (1 - (ndcY * 0.5 + 0.5)) * overlayCanvas.height,
  };
}

function updatePathfindingRangeLabel() {
  const value = Math.round(clamp(Number(pathfindingRangeInput.value), 30, 300));
  pathfindingRangeValue.textContent = `${value} x ${value}`;
}

function updatePathWeightLabels() {
  const slopeWeight = clamp(Number(pathWeightSlopeInput.value), 0, 10);
  const heightWeight = clamp(Number(pathWeightHeightInput.value), 0, 10);
  const waterWeight = clamp(Number(pathWeightWaterInput.value), 0, 100);
  pathWeightSlopeValue.textContent = slopeWeight.toFixed(1);
  pathWeightHeightValue.textContent = heightWeight.toFixed(1);
  pathWeightWaterValue.textContent = waterWeight.toFixed(1);
}

function updatePathSlopeCutoffLabel() {
  const cutoff = Math.round(clamp(Number(pathSlopeCutoffInput.value), 0, 90));
  pathSlopeCutoffValue.textContent = `${cutoff} deg`;
}

function updatePathBaseCostLabel() {
  const baseCost = clamp(Number(pathBaseCostInput.value), 0, 2);
  pathBaseCostValue.textContent = baseCost.toFixed(1);
}

function setInteractionMode(mode) {
  const nextMode = mode === "lighting" || mode === "pathfinding" ? mode : "none";
  interactionMode = nextMode;
  dockLightingModeToggle.classList.toggle("active", nextMode === "lighting");
  dockPathfindingModeToggle.classList.toggle("active", nextMode === "pathfinding");
  dockLightingModeToggle.setAttribute("aria-pressed", nextMode === "lighting" ? "true" : "false");
  dockPathfindingModeToggle.setAttribute("aria-pressed", nextMode === "pathfinding" ? "true" : "false");
  if (nextMode !== "pathfinding") {
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
  }
  requestOverlayDraw();
}

function setPlayerPosition(pixelX, pixelY) {
  playerState.pixelX = clamp(Math.round(Number(pixelX)), 0, Math.max(0, splatSize.width - 1));
  playerState.pixelY = clamp(Math.round(Number(pixelY)), 0, Math.max(0, splatSize.height - 1));
}

function parseNpcPlayer(rawData) {
  const data = rawData && typeof rawData === "object" ? rawData : {};
  const charID = String(data.charID || DEFAULT_PLAYER.charID);
  const color = /^#?[0-9a-fA-F]{6}$/.test(String(data.color || "")) ? String(data.color).replace(/^([^#])/, "#$1") : DEFAULT_PLAYER.color;
  const pixelX = Number.isFinite(Number(data.pixelX)) ? Number(data.pixelX) : DEFAULT_PLAYER.pixelX;
  const pixelY = Number.isFinite(Number(data.pixelY)) ? Number(data.pixelY) : DEFAULT_PLAYER.pixelY;
  return {
    charID,
    color,
    pixelX: clamp(Math.round(pixelX), 0, Math.max(0, splatSize.width - 1)),
    pixelY: clamp(Math.round(pixelY), 0, Math.max(0, splatSize.height - 1)),
  };
}

function applyLoadedNpc(rawData) {
  const player = parseNpcPlayer(rawData);
  playerState.charID = player.charID;
  playerState.color = player.color;
  setPlayerPosition(player.pixelX, player.pixelY);
}

function getGrayAt(imageData, x, y, sourceWidth = splatSize.width, sourceHeight = splatSize.height) {
  if (!imageData || !imageData.data) return 0;
  const w = imageData.width || 1;
  const h = imageData.height || 1;
  const srcW = Math.max(1, Number(sourceWidth) || 1);
  const srcH = Math.max(1, Number(sourceHeight) || 1);
  const nx = (Number(x) + 0.5) / srcW;
  const ny = (Number(y) + 0.5) / srcH;
  const sx = clamp(Math.round(nx * w - 0.5), 0, Math.max(0, w - 1));
  const sy = clamp(Math.round(ny * h - 0.5), 0, Math.max(0, h - 1));
  const idx = (sy * w + sx) * 4;
  return imageData.data[idx] / 255;
}

function movementWindowBounds() {
  const size = Math.round(clamp(Number(pathfindingRangeInput.value), 30, 300));
  const halfA = Math.floor((size - 1) / 2);
  const halfB = size - halfA - 1;
  return {
    minX: clamp(playerState.pixelX - halfA, 0, Math.max(0, splatSize.width - 1)),
    maxX: clamp(playerState.pixelX + halfB, 0, Math.max(0, splatSize.width - 1)),
    minY: clamp(playerState.pixelY - halfA, 0, Math.max(0, splatSize.height - 1)),
    maxY: clamp(playerState.pixelY + halfB, 0, Math.max(0, splatSize.height - 1)),
  };
}

function computeMoveStepCost(fromX, fromY, toX, toY) {
  const isDiag = fromX !== toX && fromY !== toY;
  const dist = isDiag ? Math.SQRT2 : 1;
  const slope = getGrayAt(slopeImageData, toX, toY);
  const sourceHeight = getGrayAt(heightImageData, fromX, fromY);
  const destHeight = getGrayAt(heightImageData, toX, toY);
  const heightDelta = destHeight - sourceHeight;
  const uphill = Math.max(heightDelta, 0);
  const water = getGrayAt(waterImageData, toX, toY);
  const slopeDeg = slope * 90;
  const slopeCutoffDeg = clamp(Number(pathSlopeCutoffInput.value), 0, 90);
  if (slopeDeg > slopeCutoffDeg) {
    return Number.POSITIVE_INFINITY;
  }
  const slopeWeight = clamp(Number(pathWeightSlopeInput.value), 0, 10);
  const heightWeight = clamp(Number(pathWeightHeightInput.value), 0, 10);
  const waterWeight = clamp(Number(pathWeightWaterInput.value), 0, 100);
  const baseCost = clamp(Number(pathBaseCostInput.value), 0, 2);
  const weightedCost = slopeWeight * slope + heightWeight * uphill + waterWeight * water;
  return dist * (baseCost + weightedCost);
}

class MinHeap {
  constructor() {
    this.items = [];
  }

  push(node) {
    this.items.push(node);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.items[p].dist <= node.dist) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = node;
  }

  pop() {
    if (this.items.length === 0) return null;
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length === 0 || !last) return root;
    let i = 0;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      if (l >= this.items.length) break;
      let c = l;
      if (r < this.items.length && this.items[r].dist < this.items[l].dist) c = r;
      if (this.items[c].dist >= last.dist) break;
      this.items[i] = this.items[c];
      i = c;
    }
    this.items[i] = last;
    return root;
  }
}

function rebuildMovementField() {
  const bounds = movementWindowBounds();
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  if (width <= 0 || height <= 0) {
    movementField = null;
    movePreviewState.pathPixels = [];
    return;
  }

  const len = width * height;
  const dist = new Float64Array(len);
  const parent = new Int32Array(len);
  dist.fill(Number.POSITIVE_INFINITY);
  parent.fill(-1);

  const indexOf = (x, y) => (y - bounds.minY) * width + (x - bounds.minX);
  const startIdx = indexOf(playerState.pixelX, playerState.pixelY);
  dist[startIdx] = 0;

  const heap = new MinHeap();
  heap.push({ x: playerState.pixelX, y: playerState.pixelY, dist: 0 });
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];

  while (true) {
    const current = heap.pop();
    if (!current) break;
    const idx = indexOf(current.x, current.y);
    if (current.dist > dist[idx]) continue;
    for (const dir of dirs) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      if (nx < bounds.minX || nx > bounds.maxX || ny < bounds.minY || ny > bounds.maxY) continue;
      const nIdx = indexOf(nx, ny);
      const stepCost = computeMoveStepCost(current.x, current.y, nx, ny);
      if (!Number.isFinite(stepCost)) continue;
      const nextDist = dist[idx] + stepCost;
      if (nextDist < dist[nIdx]) {
        dist[nIdx] = nextDist;
        parent[nIdx] = idx;
        heap.push({ x: nx, y: ny, dist: nextDist });
      }
    }
  }

  movementField = {
    ...bounds,
    width,
    height,
    dist,
    parent,
  };
  refreshPathPreview();
}

function extractPathTo(pixelX, pixelY) {
  if (!movementField) return [];
  if (pixelX < movementField.minX || pixelX > movementField.maxX || pixelY < movementField.minY || pixelY > movementField.maxY) return [];
  const indexOf = (x, y) => (y - movementField.minY) * movementField.width + (x - movementField.minX);
  const indexToPixel = (idx) => ({
    x: movementField.minX + (idx % movementField.width),
    y: movementField.minY + Math.floor(idx / movementField.width),
  });
  const targetIdx = indexOf(pixelX, pixelY);
  if (!Number.isFinite(movementField.dist[targetIdx])) return [];
  const path = [];
  let cursor = targetIdx;
  const maxSteps = movementField.width * movementField.height;
  for (let i = 0; i < maxSteps && cursor >= 0; i++) {
    const p = indexToPixel(cursor);
    path.push({ x: p.x, y: p.y });
    if (p.x === playerState.pixelX && p.y === playerState.pixelY) break;
    cursor = movementField.parent[cursor];
  }
  if (path.length === 0) return [];
  path.reverse();
  return path;
}

function refreshPathPreview() {
  if (interactionMode !== "pathfinding" || !movePreviewState.hoverPixel) {
    movePreviewState.pathPixels = [];
    requestOverlayDraw();
    return;
  }
  movePreviewState.pathPixels = extractPathTo(movePreviewState.hoverPixel.x, movePreviewState.hoverPixel.y);
  requestOverlayDraw();
}

function updatePathPreviewFromPointer(clientX, clientY) {
  if (interactionMode !== "pathfinding") {
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
    return;
  }
  const ndc = clientToNdc(clientX, clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
    requestOverlayDraw();
    return;
  }
  const pixel = uvToMapPixelIndex(uv);
  if (movePreviewState.hoverPixel && movePreviewState.hoverPixel.x === pixel.x && movePreviewState.hoverPixel.y === pixel.y) {
    return;
  }
  movePreviewState.hoverPixel = { x: pixel.x, y: pixel.y };
  refreshPathPreview();
}

function getCurrentPathMetrics() {
  if (!movementField || !movePreviewState.hoverPixel || movePreviewState.pathPixels.length === 0) return null;
  const targetX = movePreviewState.hoverPixel.x;
  const targetY = movePreviewState.hoverPixel.y;
  if (targetX < movementField.minX || targetX > movementField.maxX || targetY < movementField.minY || targetY > movementField.maxY) return null;
  const idx = (targetY - movementField.minY) * movementField.width + (targetX - movementField.minX);
  const totalCost = movementField.dist[idx];
  if (!Number.isFinite(totalCost)) return null;
  const nodeCount = movePreviewState.pathPixels.length;
  if (nodeCount <= 0) return null;
  const steps = Math.max(0, nodeCount - 1);
  return {
    steps,
    totalCost,
    avgPerStep: steps > 0 ? totalCost / steps : 0,
  };
}

function updateInfoPanel() {
  playerInfoEl.textContent = `Player: (${playerState.pixelX}, ${playerState.pixelY})`;
  const metrics = getCurrentPathMetrics();
  if (!metrics) {
    pathInfoEl.textContent = "Path: len -- | cost -- | avg --";
    return;
  }
  pathInfoEl.textContent = `Path: len ${metrics.steps} | cost ${metrics.totalCost.toFixed(2)} | avg ${metrics.avgPerStep.toFixed(2)}`;
}

function updateParallaxStrengthLabel() {
  const value = clamp(Number(parallaxStrengthInput.value), 0, 1);
  parallaxStrengthValue.textContent = value.toFixed(2);
}

function updateParallaxBandsLabel() {
  const value = Math.round(clamp(Number(parallaxBandsInput.value), 2, 256));
  parallaxBandsValue.textContent = String(value);
}

function updateFogAlphaLabels() {
  fogMinAlphaValue.textContent = clamp(Number(fogMinAlphaInput.value), 0, 1).toFixed(2);
  fogMaxAlphaValue.textContent = clamp(Number(fogMaxAlphaInput.value), 0, 1).toFixed(2);
}

function updateFogFalloffLabel() {
  fogFalloffValue.textContent = clamp(Number(fogFalloffInput.value), 0.2, 4).toFixed(2);
}

function updateFogStartOffsetLabel() {
  fogStartOffsetValue.textContent = clamp(Number(fogStartOffsetInput.value), 0, 1).toFixed(2);
}

function updatePointFlickerLabels() {
  pointFlickerStrengthValue.textContent = clamp(Number(pointFlickerStrengthInput.value), 0, 1).toFixed(2);
  pointFlickerSpeedValue.textContent = `${clamp(Number(pointFlickerSpeedInput.value), 0.1, 12).toFixed(2)} Hz`;
  pointFlickerSpatialValue.textContent = clamp(Number(pointFlickerSpatialInput.value), 0, 4).toFixed(2);
}

function updatePointFlickerUi() {
  const enabled = pointFlickerToggle.checked;
  pointFlickerStrengthInput.disabled = !enabled;
  pointFlickerSpeedInput.disabled = !enabled;
  pointFlickerSpatialInput.disabled = !enabled;
}

function updateCloudLabels() {
  cloudCoverageValue.textContent = clamp(Number(cloudCoverageInput.value), 0, 1).toFixed(2);
  cloudSoftnessValue.textContent = clamp(Number(cloudSoftnessInput.value), 0.01, 0.35).toFixed(2);
  cloudOpacityValue.textContent = clamp(Number(cloudOpacityInput.value), 0, 1).toFixed(2);
  cloudScaleValue.textContent = clamp(Number(cloudScaleInput.value), 0.5, 8).toFixed(2);
  cloudSpeed1Value.textContent = clamp(Number(cloudSpeed1Input.value), -0.3, 0.3).toFixed(3);
  cloudSpeed2Value.textContent = clamp(Number(cloudSpeed2Input.value), -0.3, 0.3).toFixed(3);
  cloudSunParallaxValue.textContent = clamp(Number(cloudSunParallaxInput.value), 0, 2).toFixed(2);
}

function updateParallaxUi() {
  parallaxStrengthInput.disabled = !parallaxToggle.checked;
  parallaxBandsInput.disabled = !parallaxToggle.checked;
}

function updateFogUi() {
  const enabled = fogToggle.checked;
  fogColorInput.disabled = !enabled;
  fogMinAlphaInput.disabled = !enabled;
  fogMaxAlphaInput.disabled = !enabled;
  fogFalloffInput.disabled = !enabled;
  fogStartOffsetInput.disabled = !enabled;
}

function updateCloudUi() {
  const enabled = cloudToggle.checked;
  cloudCoverageInput.disabled = !enabled;
  cloudSoftnessInput.disabled = !enabled;
  cloudOpacityInput.disabled = !enabled;
  cloudScaleInput.disabled = !enabled;
  cloudSpeed1Input.disabled = !enabled;
  cloudSpeed2Input.disabled = !enabled;
  cloudSunParallaxInput.disabled = !enabled;
  cloudSunProjectToggle.disabled = !enabled;
}

function updateCycleHourLabel() {
  cycleHourValue.textContent = formatHour(cycleState.hour);
}

function requestOverlayDraw() {
  overlayDirty = true;
}

function rgbToHex(rgb) {
  const r = Math.round(clamp(rgb[0], 0, 1) * 255);
  const g = Math.round(clamp(rgb[1], 0, 1) * 255);
  const b = Math.round(clamp(rgb[2], 0, 1) * 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb01(hex) {
  const text = String(hex || "").trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(text);
  if (!match) return [0.5, 0.5, 0.5];
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

function drawOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  const worldPerMapPixel = getMapAspect() / splatSize.width;

  if (interactionMode === "lighting") {
    for (const light of pointLights) {
      const selected = light.id === selectedLightId;
      const displayStrength = selected && lightEditDraft ? lightEditDraft.strength : light.strength;
      const displayColor = selected && lightEditDraft ? lightEditDraft.color : light.color;
      const centerWorld = mapPixelToWorld(light.pixelX, light.pixelY);
      const centerScreen = worldToScreen(centerWorld);
      const edgeWorld = { x: centerWorld.x + worldPerMapPixel * displayStrength, y: centerWorld.y };
      const edgeScreen = worldToScreen(edgeWorld);
      const screenRadius = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      const rgb = displayColor.map((v) => Math.round(clamp(v, 0, 1) * 255));

      overlayCtx.beginPath();
      overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
      overlayCtx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${selected ? 0.95 : 0.7})`;
      overlayCtx.lineWidth = selected ? 2 : 1;
      overlayCtx.stroke();

      overlayCtx.beginPath();
      overlayCtx.arc(centerScreen.x, centerScreen.y, selected ? 5 : 4, 0, Math.PI * 2);
      overlayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      overlayCtx.fill();

      if (selected) {
        overlayCtx.beginPath();
        overlayCtx.arc(centerScreen.x, centerScreen.y, 7, 0, Math.PI * 2);
        overlayCtx.strokeStyle = "rgba(255,255,255,0.85)";
        overlayCtx.lineWidth = 1.5;
        overlayCtx.stroke();
      }
    }
  }

  if (cursorLightModeToggle.checked && cursorLightState.active && cursorLightState.showGizmo) {
    const cursorPixelX = clamp(Math.floor(cursorLightState.uvX * splatSize.width), 0, splatSize.width - 1);
    const cursorPixelY = clamp(Math.floor((1 - cursorLightState.uvY) * splatSize.height), 0, splatSize.height - 1);
    const centerWorld = mapPixelToWorld(cursorPixelX, cursorPixelY);
    const centerScreen = worldToScreen(centerWorld);
    const edgeWorld = { x: centerWorld.x + worldPerMapPixel * cursorLightState.strength, y: centerWorld.y };
    const edgeScreen = worldToScreen(edgeWorld);
    const screenRadius = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
    const rgb = cursorLightState.color.map((v) => Math.round(clamp(v, 0, 1) * 255));

    overlayCtx.beginPath();
    overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
    overlayCtx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`;
    overlayCtx.lineWidth = 2;
    overlayCtx.stroke();

    overlayCtx.beginPath();
    overlayCtx.arc(centerScreen.x, centerScreen.y, 4.5, 0, Math.PI * 2);
    overlayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    overlayCtx.fill();
  }

  const drawMapDot = (pixelX, pixelY, color, radiusMapPx = 0.5) => {
    const centerWorld = mapPixelToWorld(pixelX, pixelY);
    const centerScreen = worldToScreen(centerWorld);
    const edgeWorld = { x: centerWorld.x + worldPerMapPixel * radiusMapPx, y: centerWorld.y };
    const edgeScreen = worldToScreen(edgeWorld);
    const screenRadius = Math.max(0.001, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
    overlayCtx.beginPath();
    overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
    overlayCtx.fillStyle = color;
    overlayCtx.fill();
  };

  if (interactionMode === "pathfinding" && movePreviewState.pathPixels.length > 0) {
    for (const node of movePreviewState.pathPixels) {
      drawMapDot(node.x, node.y, "rgba(112, 214, 255, 0.9)");
    }
  }

  drawMapDot(playerState.pixelX, playerState.pixelY, playerState.color);
}

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const ndc = clientToNdc(e.clientX, e.clientY);
  const worldBefore = worldFromNdc(ndc, zoom, panWorld);
  const nextZoom = Math.min(zoomMax, Math.max(zoomMin, zoom * Math.exp(-e.deltaY * 0.0015)));
  const worldAfter = worldFromNdc(ndc, nextZoom, panWorld);
  panWorld.x += worldBefore.x - worldAfter.x;
  panWorld.y += worldBefore.y - worldAfter.y;
  zoom = nextZoom;
  requestOverlayDraw();
}, { passive: false });

canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 1) return;
  e.preventDefault();
  isMiddleDragging = true;
  lastDragClient.x = e.clientX;
  lastDragClient.y = e.clientY;
});

window.addEventListener("mouseup", (e) => {
  if (e.button !== 1) return;
  isMiddleDragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  updateCursorLightFromPointer(e.clientX, e.clientY);
  updatePathPreviewFromPointer(e.clientX, e.clientY);
  if (!isMiddleDragging) {
    if (cursorLightModeToggle.checked || interactionMode === "pathfinding") {
      requestOverlayDraw();
    }
    return;
  }
  const prevNdc = clientToNdc(lastDragClient.x, lastDragClient.y);
  const currNdc = clientToNdc(e.clientX, e.clientY);
  const worldPrev = worldFromNdc(prevNdc, zoom, panWorld);
  const worldCurr = worldFromNdc(currNdc, zoom, panWorld);
  panWorld.x += worldPrev.x - worldCurr.x;
  panWorld.y += worldPrev.y - worldCurr.y;
  lastDragClient.x = e.clientX;
  lastDragClient.y = e.clientY;
  requestOverlayDraw();
});

canvas.addEventListener("click", (e) => {
  if (e.button !== 0) return;
  const ndc = clientToNdc(e.clientX, e.clientY);
  const world = worldFromNdc(ndc);
  const uv = worldToUv(world);
  if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {
    return;
  }

  const pixel = uvToMapPixelIndex(uv);
  if (interactionMode === "lighting") {
    const existing = findPointLightAtPixel(pixel.x, pixel.y);
    if (existing) {
      beginLightEdit(existing);
      setStatus(`Selected point light at (${existing.pixelX}, ${existing.pixelY})`);
    } else {
      createPointLight(pixel.x, pixel.y);
    }
    requestOverlayDraw();
    return;
  }

  if (interactionMode === "pathfinding") {
    movePreviewState.hoverPixel = { x: pixel.x, y: pixel.y };
    movePreviewState.pathPixels = extractPathTo(pixel.x, pixel.y);
    if (!movePreviewState.pathPixels.length) {
      setStatus("No reachable preview path at clicked cell.");
      return;
    }
    setPlayerPosition(pixel.x, pixel.y);
    rebuildMovementField();
    setStatus(`Player moved to (${playerState.pixelX}, ${playerState.pixelY})`);
    return;
  }

  setPlayerPosition(pixel.x, pixel.y);
  rebuildMovementField();
  setStatus(`Player moved to (${playerState.pixelX}, ${playerState.pixelY})`);
});

canvas.addEventListener("auxclick", (e) => {
  if (e.button === 1) e.preventDefault();
});

canvas.addEventListener("mouseleave", () => {
  if (cursorLightModeToggle.checked) {
    cursorLightState.active = false;
  }
  if (interactionMode === "pathfinding") {
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
  }
  requestOverlayDraw();
});

pathfindingRangeInput.addEventListener("input", () => {
  updatePathfindingRangeLabel();
  if (interactionMode === "pathfinding") {
    rebuildMovementField();
  }
});
pathWeightSlopeInput.addEventListener("input", () => {
  updatePathWeightLabels();
  if (interactionMode === "pathfinding") {
    rebuildMovementField();
  }
});
pathWeightHeightInput.addEventListener("input", () => {
  updatePathWeightLabels();
  if (interactionMode === "pathfinding") {
    rebuildMovementField();
  }
});
pathWeightWaterInput.addEventListener("input", () => {
  updatePathWeightLabels();
  if (interactionMode === "pathfinding") {
    rebuildMovementField();
  }
});
pathSlopeCutoffInput.addEventListener("input", () => {
  updatePathSlopeCutoffLabel();
  if (interactionMode === "pathfinding") {
    rebuildMovementField();
  }
});
pathBaseCostInput.addEventListener("input", () => {
  updatePathBaseCostLabel();
  if (interactionMode === "pathfinding") {
    rebuildMovementField();
  }
});
heightScaleInput.addEventListener("input", schedulePointLightBake);

for (const btn of topicButtons) {
  btn.addEventListener("click", () => {
    const topic = btn.dataset.topic || "";
    const isAlreadyActive = btn.classList.contains("active");
    setActiveTopic(isAlreadyActive ? "" : topic);
  });
}

topicPanelCloseBtn.addEventListener("click", () => {
  setActiveTopic("");
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    setActiveTopic("");
  }
});

dockLightingModeToggle.addEventListener("click", () => {
  if (interactionMode === "lighting") {
    setInteractionMode("none");
    setStatus("Lighting mode disabled.");
    return;
  }
  setInteractionMode("lighting");
  movePreviewState.hoverPixel = null;
  movePreviewState.pathPixels = [];
  setStatus("Lighting mode enabled: click terrain to add/select point lights.");
});

dockPathfindingModeToggle.addEventListener("click", () => {
  if (interactionMode === "pathfinding") {
    setInteractionMode("none");
    movePreviewState.hoverPixel = null;
    movePreviewState.pathPixels = [];
    setStatus("Pathfinding mode disabled.");
    return;
  }
  setInteractionMode("pathfinding");
  rebuildMovementField();
  setStatus("Pathfinding mode enabled: hover for path preview, click to move player.");
});

cursorLightModeToggle.addEventListener("change", () => {
  if (!cursorLightModeToggle.checked) {
    cursorLightState.active = false;
    requestOverlayDraw();
    setStatus("Cursor light disabled.");
    return;
  }
  setStatus("Cursor light enabled: move mouse over terrain for live point light.");
});

cursorLightFollowHeightToggle.addEventListener("change", () => {
  cursorLightState.useTerrainHeight = cursorLightFollowHeightToggle.checked;
  updateCursorLightModeUi();
});

cursorLightColorInput.addEventListener("input", () => {
  cursorLightState.color = hexToRgb01(cursorLightColorInput.value);
  requestOverlayDraw();
});

cursorLightStrengthInput.addEventListener("input", () => {
  cursorLightState.strength = Math.round(clamp(Number(cursorLightStrengthInput.value), 1, 200));
  updateCursorLightStrengthLabel();
  requestOverlayDraw();
});

cursorLightHeightOffsetInput.addEventListener("input", () => {
  cursorLightState.heightOffset = Math.round(clamp(Number(cursorLightHeightOffsetInput.value), 0, 120));
  updateCursorLightHeightOffsetLabel();
  requestOverlayDraw();
});

cursorLightGizmoToggle.addEventListener("change", () => {
  cursorLightState.showGizmo = cursorLightGizmoToggle.checked;
  requestOverlayDraw();
});

pointLightColorInput.addEventListener("input", () => {
  if (!lightEditDraft) return;
  lightEditDraft.color = hexToRgb01(pointLightColorInput.value);
  rebakeIfPointLightLiveUpdateEnabled();
  requestOverlayDraw();
});

pointLightStrengthInput.addEventListener("input", () => {
  if (!lightEditDraft) return;
  lightEditDraft.strength = Math.round(clamp(Number(pointLightStrengthInput.value), 1, 200));
  updatePointLightStrengthLabel();
  rebakeIfPointLightLiveUpdateEnabled();
  requestOverlayDraw();
});

pointLightIntensityInput.addEventListener("input", () => {
  if (!lightEditDraft) return;
  lightEditDraft.intensity = clamp(Number(pointLightIntensityInput.value), 0, 4);
  updatePointLightIntensityLabel();
  rebakeIfPointLightLiveUpdateEnabled();
  requestOverlayDraw();
});

pointLightHeightOffsetInput.addEventListener("input", () => {
  if (!lightEditDraft) return;
  lightEditDraft.heightOffset = Math.round(clamp(Number(pointLightHeightOffsetInput.value), -120, 240));
  updatePointLightHeightOffsetLabel();
  rebakeIfPointLightLiveUpdateEnabled();
  requestOverlayDraw();
});

pointLightFlickerInput.addEventListener("input", () => {
  if (!lightEditDraft) return;
  lightEditDraft.flicker = clamp(Number(pointLightFlickerInput.value), 0, 1);
  updatePointLightFlickerLabel();
  rebakeIfPointLightLiveUpdateEnabled();
  requestOverlayDraw();
});

pointLightFlickerSpeedInput.addEventListener("input", () => {
  if (!lightEditDraft) return;
  lightEditDraft.flickerSpeed = clamp(Number(pointLightFlickerSpeedInput.value), 0, 1);
  updatePointLightFlickerSpeedLabel();
  rebakeIfPointLightLiveUpdateEnabled();
  requestOverlayDraw();
});

pointLightLiveUpdateToggle.addEventListener("change", () => {
  if (pointLightLiveUpdateToggle.checked) {
    rebakeIfPointLightLiveUpdateEnabled();
    setStatus("Point-light live update enabled.");
    return;
  }
  setStatus("Point-light live update disabled. Changes apply on Save.");
});

lightSaveBtn.addEventListener("click", () => {
  const selected = applyDraftToSelectedPointLight();
  if (!selected) return;
  bakePointLightsTexture();
  updateLightEditorUi();
  requestOverlayDraw();
  setStatus(`Saved point light at (${selected.pixelX}, ${selected.pixelY})`);
});

lightCancelBtn.addEventListener("click", () => {
  selectedLightId = null;
  lightEditDraft = null;
  updateLightEditorUi();
  requestOverlayDraw();
  setStatus("Point light edit canceled.");
});

lightDeleteBtn.addEventListener("click", () => {
  const selected = getSelectedPointLight();
  if (!selected) return;
  const idx = pointLights.findIndex((light) => light.id === selected.id);
  if (idx >= 0) {
    pointLights.splice(idx, 1);
  }
  selectedLightId = null;
  lightEditDraft = null;
  bakePointLightsTexture();
  updateLightEditorUi();
  requestOverlayDraw();
  setStatus(`Deleted point light at (${selected.pixelX}, ${selected.pixelY})`);
});

pointLightsSaveAllBtn.addEventListener("click", async () => {
  if (!pointLightsSaveConfirmArmed) {
    armPointLightsSaveConfirmation();
    setStatus("Save confirmation armed. Click Save All again within 5 seconds to overwrite/export pointlights.json.");
    return;
  }

  resetPointLightsSaveConfirmation();
  try {
    await savePointLightsJson();
  } catch (error) {
    if (error && error.name === "AbortError") {
      setStatus("Save canceled.");
      return;
    }
    console.error("Failed to save point lights JSON", error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to save point lights JSON: ${message}`);
  }
});

pointLightsLoadAllBtn.addEventListener("click", async () => {
  resetPointLightsSaveConfirmation();
  try {
    await loadPointLightsFromAssetsOrPrompt();
  } catch (error) {
    console.error("Failed to load point lights JSON", error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to load point lights JSON: ${message}`);
  }
});

pointLightsLoadInput.addEventListener("change", async () => {
  const file = pointLightsLoadInput.files && pointLightsLoadInput.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const rawData = JSON.parse(text);
    applyLoadedPointLights(rawData, file.name);
  } catch (error) {
    console.error("Failed to parse point lights JSON", error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to parse point lights JSON: ${message}`);
  } finally {
    pointLightsLoadInput.value = "";
  }
});

parallaxStrengthInput.addEventListener("input", updateParallaxStrengthLabel);
parallaxBandsInput.addEventListener("input", updateParallaxBandsLabel);
parallaxToggle.addEventListener("change", updateParallaxUi);
pointFlickerStrengthInput.addEventListener("input", updatePointFlickerLabels);
pointFlickerSpeedInput.addEventListener("input", updatePointFlickerLabels);
pointFlickerSpatialInput.addEventListener("input", updatePointFlickerLabels);
pointFlickerToggle.addEventListener("change", updatePointFlickerUi);
fogMinAlphaInput.addEventListener("input", updateFogAlphaLabels);
fogMaxAlphaInput.addEventListener("input", updateFogAlphaLabels);
fogFalloffInput.addEventListener("input", updateFogFalloffLabel);
fogStartOffsetInput.addEventListener("input", updateFogStartOffsetLabel);
fogToggle.addEventListener("change", updateFogUi);
fogColorInput.addEventListener("input", () => {
  fogColorManual = true;
});
cloudCoverageInput.addEventListener("input", updateCloudLabels);
cloudSoftnessInput.addEventListener("input", updateCloudLabels);
cloudOpacityInput.addEventListener("input", updateCloudLabels);
cloudScaleInput.addEventListener("input", updateCloudLabels);
cloudSpeed1Input.addEventListener("input", updateCloudLabels);
cloudSpeed2Input.addEventListener("input", updateCloudLabels);
cloudSunParallaxInput.addEventListener("input", updateCloudLabels);
cloudToggle.addEventListener("change", updateCloudUi);

cycleHourInput.addEventListener("pointerdown", () => {
  isCycleHourScrubbing = true;
});

window.addEventListener("pointerup", () => {
  isCycleHourScrubbing = false;
});

cycleHourInput.addEventListener("change", () => {
  isCycleHourScrubbing = false;
});

cycleHourInput.addEventListener("input", () => {
  cycleState.hour = clamp(Number(cycleHourInput.value), 0, 24);
  cycleState.lastRenderMs = null;
  updateCycleHourLabel();
});

async function tryAutoLoadDefaultMap() {
  for (const candidate of DEFAULT_MAP_FOLDER_CANDIDATES) {
    try {
      await loadMapFromPath(candidate);
      return;
    } catch (err) {
      console.warn(`Failed to load default map folder ${candidate}`, err);
    }
  }

  setStatus("Using fallback textures. Load a map folder to begin.");
}

mapPathLoadBtn.addEventListener("click", async () => {
  const targetPath = normalizeMapFolderPath(mapPathInput.value);
  try {
    await loadMapFromPath(targetPath);
  } catch (error) {
    console.error(`Failed to load map from ${targetPath}`, error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to load map '${targetPath}': ${message}`);
  }
});

mapSaveAllBtn.addEventListener("click", async () => {
  try {
    await saveAllMapDataFiles();
  } catch (error) {
    if (error && error.name === "AbortError") {
      setStatus("Save all canceled.");
      return;
    }
    console.error("Failed to save all map data files", error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to save map data: ${message}`);
  }
});

mapPathInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  mapPathLoadBtn.click();
});

mapFolderInput.addEventListener("change", async () => {
  const files = mapFolderInput.files;
  if (!files || files.length === 0) return;
  try {
    await loadMapFromFolderSelection(files);
  } catch (error) {
    console.error("Failed to load selected map folder", error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to load selected map folder: ${message}`);
  } finally {
    mapFolderInput.value = "";
  }
});

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  let overlayResized = false;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  if (overlayCanvas.width !== w || overlayCanvas.height !== h) {
    overlayCanvas.width = w;
    overlayCanvas.height = h;
    overlayResized = true;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  if (overlayResized) {
    requestOverlayDraw();
  }
}

function updateCycleTime(nowMs) {
  if (cycleState.lastRenderMs === null) {
    cycleState.lastRenderMs = nowMs;
  }
  const dtSec = Math.min(0.25, Math.max(0, (nowMs - cycleState.lastRenderMs) * 0.001));
  cycleState.lastRenderMs = nowMs;

  const cycleSpeedHoursPerSec = clamp(Number(cycleSpeedInput.value), 0, 1);
  if (cycleSpeedHoursPerSec > 0 && !isCycleHourScrubbing) {
    cycleState.hour = wrapHour(cycleState.hour + cycleSpeedHoursPerSec * dtSec);
  }
  if (!isCycleHourScrubbing) {
    setCycleHourSliderFromState();
  }
  return cycleSpeedHoursPerSec;
}

function computeLightingParams() {
  const sun = sampleSunAtHour(cycleState.hour);
  const moonTrack = sampleSunAtHour(wrapHour(cycleState.hour + 12));
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

  const ambientBase = Number(ambientInput.value);
  const diffuseBase = clamp(Number(diffuseInput.value), 0, 2);
  const sunVisible = smoothstep(-4, 2, sun.altitudeDeg);
  const moonVisible = smoothstep(-10, 6, moonAltitudeDeg);
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
  const nightFactor = 1 - smoothstep(-2, 8, sun.altitudeDeg);
  const nightAmbientColor = [0.14, 0.22, 0.34];
  ambientColor = lerpVec3(ambientColor, nightAmbientColor, 0.45 * nightFactor);
  const ambientFinal = clamp(ambientBase * (sunAmbientWeight + moonAmbientWeight) + 0.05 * nightFactor, 0, 1);
  const moonColor = [0.34, 0.40, 0.54];
  const zoomNorm = clamp((zoom - zoomMin) / (zoomMax - zoomMin), 0, 1);
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
  if (!fogColorManual) {
    fogColorInput.value = rgbToHex(fogColorAuto);
  }
  const fogColor = fogColorManual ? hexToRgb01(fogColorInput.value) : fogColorAuto;

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
    cameraHeightNorm,
  };
}

function uploadUniforms(params, nowSec) {
  gl.useProgram(program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, splatTex);
  gl.uniform1i(uniforms.uSplat, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, normalsTex);
  gl.uniform1i(uniforms.uNormals, 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, heightTex);
  gl.uniform1i(uniforms.uHeight, 2);

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, pointLightTex);
  gl.uniform1i(uniforms.uPointLightTex, 3);

  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, cloudNoiseTex);
  gl.uniform1i(uniforms.uCloudNoiseTex, 4);

  const viewHalf = getViewHalfExtents();
  gl.uniform2f(uniforms.uMapTexelSize, 1 / heightSize.width, 1 / heightSize.height);
  gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
  gl.uniform3f(uniforms.uSunDir, params.sunDir[0], params.sunDir[1], params.sunDir[2]);
  gl.uniform3f(uniforms.uSunColor, params.sun.sunColor[0], params.sun.sunColor[1], params.sun.sunColor[2]);
  gl.uniform1f(uniforms.uSunStrength, params.sunStrength);
  gl.uniform3f(uniforms.uMoonDir, params.moonDir[0], params.moonDir[1], params.moonDir[2]);
  gl.uniform3f(uniforms.uMoonColor, params.moonColor[0], params.moonColor[1], params.moonColor[2]);
  gl.uniform1f(uniforms.uMoonStrength, params.moonStrength);
  gl.uniform3f(uniforms.uAmbientColor, params.ambientColor[0], params.ambientColor[1], params.ambientColor[2]);
  gl.uniform1f(uniforms.uAmbient, params.ambientFinal);
  gl.uniform1f(uniforms.uHeightScale, Number(heightScaleInput.value));
  gl.uniform1f(uniforms.uShadowStrength, Number(shadowStrengthInput.value));
  gl.uniform1f(uniforms.uUseShadows, shadowsToggle.checked ? 1 : 0);
  gl.uniform1f(uniforms.uUseParallax, parallaxToggle.checked ? 1 : 0);
  gl.uniform1f(uniforms.uParallaxStrength, clamp(Number(parallaxStrengthInput.value), 0, 1));
  gl.uniform1f(uniforms.uParallaxBands, Math.round(clamp(Number(parallaxBandsInput.value), 2, 256)));
  gl.uniform1f(uniforms.uZoom, zoom);
  gl.uniform1f(uniforms.uUseFog, fogToggle.checked ? 1 : 0);
  gl.uniform3f(uniforms.uFogColor, params.fogColor[0], params.fogColor[1], params.fogColor[2]);
  gl.uniform1f(uniforms.uFogMinAlpha, clamp(Number(fogMinAlphaInput.value), 0, 1));
  gl.uniform1f(uniforms.uFogMaxAlpha, clamp(Number(fogMaxAlphaInput.value), 0, 1));
  gl.uniform1f(uniforms.uFogFalloff, clamp(Number(fogFalloffInput.value), 0.2, 4));
  gl.uniform1f(uniforms.uFogStartOffset, clamp(Number(fogStartOffsetInput.value), 0, 1));
  gl.uniform1f(uniforms.uCameraHeightNorm, params.cameraHeightNorm);
  gl.uniform1f(uniforms.uMapAspect, getMapAspect());
  gl.uniform1f(uniforms.uUseCursorLight, cursorLightModeToggle.checked && cursorLightState.active ? 1 : 0);
  gl.uniform2f(uniforms.uCursorLightUv, cursorLightState.uvX, cursorLightState.uvY);
  gl.uniform3f(uniforms.uCursorLightColor, cursorLightState.color[0], cursorLightState.color[1], cursorLightState.color[2]);
  gl.uniform1f(uniforms.uCursorLightStrength, cursorLightState.strength);
  gl.uniform1f(uniforms.uCursorLightHeightOffset, cursorLightState.heightOffset);
  gl.uniform1f(uniforms.uUseCursorTerrainHeight, cursorLightState.useTerrainHeight ? 1 : 0);
  gl.uniform2f(uniforms.uCursorLightMapSize, splatSize.width, splatSize.height);
  gl.uniform2f(uniforms.uViewHalfExtents, viewHalf.x, viewHalf.y);
  gl.uniform2f(uniforms.uPanWorld, panWorld.x, panWorld.y);
  gl.uniform1f(uniforms.uTimeSec, Math.max(0, Number(nowSec) || 0));
  gl.uniform1f(uniforms.uPointFlickerEnabled, pointFlickerToggle.checked ? 1 : 0);
  gl.uniform1f(uniforms.uPointFlickerStrength, clamp(Number(pointFlickerStrengthInput.value), 0, 1));
  gl.uniform1f(uniforms.uPointFlickerSpeed, clamp(Number(pointFlickerSpeedInput.value), 0.1, 12));
  gl.uniform1f(uniforms.uPointFlickerSpatial, clamp(Number(pointFlickerSpatialInput.value), 0, 4));
  gl.uniform1f(uniforms.uUseClouds, cloudToggle.checked ? 1 : 0);
  gl.uniform1f(uniforms.uCloudCoverage, clamp(Number(cloudCoverageInput.value), 0, 1));
  gl.uniform1f(uniforms.uCloudSoftness, clamp(Number(cloudSoftnessInput.value), 0.01, 0.35));
  gl.uniform1f(uniforms.uCloudOpacity, clamp(Number(cloudOpacityInput.value), 0, 1));
  gl.uniform1f(uniforms.uCloudScale, clamp(Number(cloudScaleInput.value), 0.5, 8));
  gl.uniform1f(uniforms.uCloudSpeed1, clamp(Number(cloudSpeed1Input.value), -0.3, 0.3));
  gl.uniform1f(uniforms.uCloudSpeed2, clamp(Number(cloudSpeed2Input.value), -0.3, 0.3));
  gl.uniform1f(uniforms.uCloudSunParallax, clamp(Number(cloudSunParallaxInput.value), 0, 2));
  gl.uniform1f(uniforms.uCloudUseSunProjection, cloudSunProjectToggle.checked ? 1 : 0);
}

function render(nowMs) {
  resize();
  const cycleSpeedHoursPerSec = updateCycleTime(nowMs);
  const lightingParams = computeLightingParams();
  cycleInfoEl.textContent = `Time: ${formatHour(cycleState.hour)} | Speed: ${cycleSpeedHoursPerSec.toFixed(2)} h/s`;
  updateInfoPanel();
  updateCycleHourLabel();

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  uploadUniforms(lightingParams, nowMs * 0.001);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  if (overlayDirty) {
    drawOverlay();
    overlayDirty = false;
  }
  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

void tryAutoLoadDefaultMap().catch((error) => {
  console.error("Default map auto-load failed:", error);
  const message = error instanceof Error ? error.message : String(error);
  setStatus(`Default map auto-load failed: ${message}`);
});
updatePathfindingRangeLabel();
updatePathWeightLabels();
updatePathSlopeCutoffLabel();
updatePathBaseCostLabel();
updateParallaxStrengthLabel();
updateParallaxBandsLabel();
updatePointFlickerLabels();
updateFogAlphaLabels();
updateFogFalloffLabel();
updateFogStartOffsetLabel();
updateCloudLabels();
updatePointLightStrengthLabel();
updatePointLightIntensityLabel();
updatePointLightHeightOffsetLabel();
updatePointLightFlickerLabel();
updatePointLightFlickerSpeedLabel();
updateCursorLightStrengthLabel();
updateCursorLightHeightOffsetLabel();
setCycleHourSliderFromState();
updateCycleHourLabel();
mapPathInput.value = currentMapFolderPath;
updateLightEditorUi();
updateCursorLightModeUi();
updateParallaxUi();
updatePointFlickerUi();
updateFogUi();
updateCloudUi();
setActiveTopic("");
setInteractionMode("none");
setStatus(`${statusEl.textContent} | Load maps by folder/path, use left dock mode toggles (LM/PF), wheel zoom, middle-drag pan, and cursor light for live preview.`);
requestAnimationFrame(render);
