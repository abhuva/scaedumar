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
const mapPathInput = getRequiredElementById("mapPathInput");
const mapPathLoadBtn = getRequiredElementById("mapPathLoadBtn");
const mapFolderInput = getRequiredElementById("mapFolderInput");
const mapSaveAllBtn = getRequiredElementById("mapSaveAllBtn");
const circleRadiusInput = getRequiredElementById("circleRadius");
const circleRadiusValue = getRequiredElementById("circleRadiusValue");
const lightingModeToggle = getRequiredElementById("lightingModeToggle");
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
const heightScaleInput = getRequiredElementById("heightScale");
const shadowStrengthInput = getRequiredElementById("shadowStrength");
const ambientInput = getRequiredElementById("ambient");
const diffuseInput = getRequiredElementById("diffuse");
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
  vec3 pointLightIntensity = texture(uPointLightTex, uv).rgb;
  vec3 pointLit = base * pointLightIntensity;
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

async function applyMapImages(splatImage, normalsImage, heightImage) {
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

function createMapDataFileTexts() {
  return {
    "pointlights.json": `${JSON.stringify(serializePointLights(), null, 2)}\n`,
    "lighting.json": `${JSON.stringify(serializeLightingSettings(), null, 2)}\n`,
    "fog.json": `${JSON.stringify(serializeFogSettings(), null, 2)}\n`,
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
  const [splat, normals, height] = await Promise.all([
    loadImageFromUrl(`${folder}/splat.png`),
    loadImageFromUrl(`${folder}/normals.png`),
    loadImageFromUrl(`${folder}/height.png`),
  ]);

  await applyMapImages(splat, normals, height);
  currentMapFolderPath = folder;
  mapPathInput.value = folder;

  clearPointLights();
  bakePointLightsTexture();
  updateLightEditorUi();
  applyLightingSettings(DEFAULT_LIGHTING_SETTINGS);
  applyFogSettings(DEFAULT_FOG_SETTINGS);
  requestOverlayDraw();

  let loadedPointLights = false;
  let loadedLighting = false;
  let loadedFog = false;

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
    const fogJson = await tryLoadJsonFromUrl(`${folder}/fog.json`);
    applyFogSettings(fogJson);
    loadedFog = true;
  } catch (err) {
    console.warn(`No fog.json found in ${folder}`, err);
  }

  setStatus(`Loaded map ${folder} | pointlights: ${loadedPointLights ? "yes" : "no"} | lighting: ${loadedLighting ? "yes" : "no"} | fog: ${loadedFog ? "yes" : "no"}`);
}

async function loadMapFromFolderSelection(fileList) {
  const files = Array.from(fileList || []);
  const splatFile = getFileFromFolderSelection(files, "splat.png");
  const normalsFile = getFileFromFolderSelection(files, "normals.png");
  const heightFile = getFileFromFolderSelection(files, "height.png");
  if (!splatFile || !normalsFile || !heightFile) {
    throw new Error("Folder must contain splat.png, normals.png, and height.png.");
  }

  const [splat, normals, height] = await Promise.all([
    loadImageFromFile(splatFile),
    loadImageFromFile(normalsFile),
    loadImageFromFile(heightFile),
  ]);
  await applyMapImages(splat, normals, height);

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
  applyFogSettings(DEFAULT_FOG_SETTINGS);
  requestOverlayDraw();

  let loadedPointLights = false;
  let loadedLighting = false;
  let loadedFog = false;

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

  setStatus(`Loaded map folder | pointlights: ${loadedPointLights ? "yes" : "no"} | lighting: ${loadedLighting ? "yes" : "no"} | fog: ${loadedFog ? "yes" : "no"}`);
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
let pointLightBakeScheduled = false;
let pointLightBakeDebounceTimer = null;
let pointLightBakeRequestId = 0;
let pointLightBakePendingRequestId = 0;
const POINT_LIGHT_BLEND_EXPOSURE = 0.65;
const POINT_LIGHT_SELECT_RADIUS = 3;
const POINT_LIGHT_BAKE_LIVE_SCALE = 0.5;
const POINT_LIGHT_BAKE_DEBOUNCE_MS = 80;
let overlayDirty = true;
const DEFAULT_MAP_FOLDER = "assets/map1/";
let currentMapFolderPath = DEFAULT_MAP_FOLDER;
const DEFAULT_MAP_FOLDER_CANDIDATES = ["assets/map1/", "assets/Map 1/", "assets/"];
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
const defaultSplatImage = createFallbackSplat();
uploadImageToTexture(normalsTex, defaultNormalImage);
uploadImageToTexture(heightTex, defaultHeightImage);
uploadImageToTexture(splatTex, defaultSplatImage);
setSplatSizeFromImage(defaultSplatImage);
setHeightSizeFromImage(defaultHeightImage);
setNormalsSizeFromImage(defaultNormalImage);
normalsImageData = extractImageData(defaultNormalImage);
heightImageData = extractImageData(defaultHeightImage);
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
    const color = normalizeImportedPointLightColor(rawLight && rawLight.color);
    const pixelX = Math.round(Number(rawX));
    const pixelY = Math.round(Number(rawY));
    const strength = Math.round(Number(rawStrength));
    const intensity = Number(rawIntensity);
    const heightOffset = Math.round(Number(rawHeightOffset));
    if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY) || !Number.isFinite(strength) || !Number.isFinite(intensity) || !Number.isFinite(heightOffset) || !color) {
      skippedCount += 1;
      continue;
    }

    parsedLights.push({
      pixelX: clamp(pixelX, 0, Math.max(0, splatSize.width - 1)),
      pixelY: clamp(pixelY, 0, Math.max(0, splatSize.height - 1)),
      strength: Math.round(clamp(strength, 1, 200)),
      intensity: clamp(intensity, 0, 4),
      heightOffset: Math.round(clamp(heightOffset, -120, 240)),
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
  const mapScaleAvg = (mapScaleX + mapScaleY) * 0.5;
  const heightScaleValue = Math.max(1, Number(heightScaleInput.value) || 1);
  const pixelCount = w * h;
  const rgba = new Uint8ClampedArray(pixelCount * 4);
  const accumColor = new Float32Array(pixelCount * 3);
  const accumWeight = new Float32Array(pixelCount);

  for (let i = 3; i < rgba.length; i += 4) {
    rgba[i] = 255;
  }

  if (pointLights.length > 0) {
    for (const light of pointLights) {
      const radiusMapPx = Math.max(1, Number(light.strength) || 1);
      const intensityMul = clamp(Number(light.intensity), 0, 4);
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
  updatePointLightStrengthLabel();
  updatePointLightIntensityLabel();
  updatePointLightHeightOffsetLabel();
}

function beginLightEdit(light) {
  selectedLightId = light.id;
  lightEditDraft = {
    color: [...light.color],
    strength: light.strength,
    intensity: light.intensity,
    heightOffset: light.heightOffset,
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
let lastMarker = null;
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

function updateRadiusLabel() {
  const value = Number(circleRadiusInput.value);
  const display = Number.isInteger(value) ? String(value) : value.toFixed(1);
  circleRadiusValue.textContent = `${display} px`;
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

  if (lightingModeToggle.checked) {
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

  if (!lastMarker || lightingModeToggle.checked) return;

  const centerWorld = mapPixelToWorld(lastMarker.pixelX, lastMarker.pixelY);
  const centerScreen = worldToScreen(centerWorld);
  const radiusMapPx = clamp(Number(circleRadiusInput.value), 0.5, 50);
  const edgeWorld = { x: centerWorld.x + worldPerMapPixel * radiusMapPx, y: centerWorld.y };
  const edgeScreen = worldToScreen(edgeWorld);
  const screenRadius = Math.max(0.001, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));

  overlayCtx.beginPath();
  overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
  overlayCtx.fillStyle = "rgb(255,0,0)";
  overlayCtx.fill();
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
  if (!isMiddleDragging) {
    if (cursorLightModeToggle.checked) {
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
  if (lightingModeToggle.checked) {
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

  const pixelCenterUv = mapPixelIndexToUv(pixel.x, pixel.y);
  lastMarker = { uvX: pixelCenterUv.x, uvY: pixelCenterUv.y, pixelX: pixel.x, pixelY: pixel.y };
  setStatus(`Marker map coords: (${lastMarker.pixelX}, ${lastMarker.pixelY}) | uv=(${lastMarker.uvX.toFixed(4)}, ${lastMarker.uvY.toFixed(4)})`);
  requestOverlayDraw();
});

canvas.addEventListener("auxclick", (e) => {
  if (e.button === 1) e.preventDefault();
});

canvas.addEventListener("mouseleave", () => {
  if (!cursorLightModeToggle.checked) return;
  cursorLightState.active = false;
  requestOverlayDraw();
});

circleRadiusInput.addEventListener("input", () => {
  updateRadiusLabel();
  requestOverlayDraw();
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

lightingModeToggle.addEventListener("change", () => {
  setStatus(lightingModeToggle.checked ? "Lighting mode enabled: click terrain to add/select point lights." : "Lighting mode disabled: click terrain to set marker.");
  requestOverlayDraw();
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
fogMinAlphaInput.addEventListener("input", updateFogAlphaLabels);
fogMaxAlphaInput.addEventListener("input", updateFogAlphaLabels);
fogFalloffInput.addEventListener("input", updateFogFalloffLabel);
fogStartOffsetInput.addEventListener("input", updateFogStartOffsetLabel);
fogToggle.addEventListener("change", updateFogUi);
fogColorInput.addEventListener("input", () => {
  fogColorManual = true;
});

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

function uploadUniforms(params) {
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
}

function render(nowMs) {
  resize();
  const cycleSpeedHoursPerSec = updateCycleTime(nowMs);
  const lightingParams = computeLightingParams();
  cycleInfoEl.textContent = `Time: ${formatHour(cycleState.hour)} | Speed: ${cycleSpeedHoursPerSec.toFixed(2)} h/s`;
  updateCycleHourLabel();

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  uploadUniforms(lightingParams);
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
updateRadiusLabel();
updateParallaxStrengthLabel();
updateParallaxBandsLabel();
updateFogAlphaLabels();
updateFogFalloffLabel();
updateFogStartOffsetLabel();
updatePointLightStrengthLabel();
updatePointLightIntensityLabel();
updatePointLightHeightOffsetLabel();
updateCursorLightStrengthLabel();
updateCursorLightHeightOffsetLabel();
setCycleHourSliderFromState();
updateCycleHourLabel();
mapPathInput.value = currentMapFolderPath;
updateLightEditorUi();
updateCursorLightModeUi();
updateParallaxUi();
updateFogUi();
setActiveTopic("");
setStatus(`${statusEl.textContent} | Load maps by folder/path, then use wheel zoom, middle-drag pan, lighting mode for placed lights, and cursor light for live preview.`);
requestAnimationFrame(render);
