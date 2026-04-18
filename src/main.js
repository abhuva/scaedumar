const canvas = document.getElementById("glCanvas");
const statusEl = document.getElementById("status");
const cycleInfoEl = document.getElementById("cycleInfo");
const splatInput = document.getElementById("splatInput");
const normalInput = document.getElementById("normalInput");
const heightInput = document.getElementById("heightInput");
const cycleSpeedInput = document.getElementById("cycleSpeed");
const shadowsToggle = document.getElementById("shadowsToggle");
const heightScaleInput = document.getElementById("heightScale");
const shadowStrengthInput = document.getElementById("shadowStrength");
const ambientInput = document.getElementById("ambient");
const diffuseInput = document.getElementById("diffuse");

const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL2 is required for this prototype.");
}

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
uniform float uMapAspect;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;

float readHeight(vec2 uv) {
  return texture(uHeight, uv).r * uHeightScale;
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
  vec2 uv = vec2(world.x / uMapAspect + 0.5, world.y + 0.5);

  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
    outColor = vec4(0.02, 0.025, 0.03, 1.0);
    return;
  }

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
  vec3 lit = clamp(ambientLit + sunLit + moonLit, 0.0, 1.0);
  float diffuse = max(dot(n, uSunDir), 0.0);
  float shadow = calcShadow(uv, uSunDir);

  vec3 ambientLit = base * (uAmbient * uAmbientColor);
  vec3 sunLit = base * (diffuse * shadow) * uSunColor;
  vec3 lit = clamp(ambientLit + sunLit, 0.0, 1.0);
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
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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

const splatSize = { width: 1, height: 1 };
const heightSize = { width: 1, height: 1 };

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
  splatSize.width = img.width || 1;
  splatSize.height = img.height || 1;
}

function setHeightSizeFromImage(img) {
  heightSize.width = img.width || 1;
  heightSize.height = img.height || 1;
}

const defaultNormalImage = createFlatNormalImage();
const defaultHeightImage = createFlatHeightImage();
const defaultSplatImage = createFallbackSplat();
uploadImageToTexture(normalsTex, defaultNormalImage);
uploadImageToTexture(heightTex, defaultHeightImage);
uploadImageToTexture(splatTex, defaultSplatImage);
setSplatSizeFromImage(defaultSplatImage);
setHeightSizeFromImage(defaultHeightImage);

let zoom = 1;
const zoomMin = 0.5;
const zoomMax = 32;
const panWorld = { x: 0, y: 0 };
let isMiddleDragging = false;
let lastDragClient = { x: 0, y: 0 };

const cycleState = {
  hour: 9.5,
  lastRenderMs: null,
};

function resetCamera() {
  zoom = 1;
  panWorld.x = 0;
  panWorld.y = 0;
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

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const ndc = clientToNdc(e.clientX, e.clientY);
  const worldBefore = worldFromNdc(ndc, zoom, panWorld);
  const nextZoom = Math.min(zoomMax, Math.max(zoomMin, zoom * Math.exp(-e.deltaY * 0.0015)));
  const worldAfter = worldFromNdc(ndc, nextZoom, panWorld);
  panWorld.x += worldBefore.x - worldAfter.x;
  panWorld.y += worldBefore.y - worldAfter.y;
  zoom = nextZoom;
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
  if (!isMiddleDragging) return;
  const prevNdc = clientToNdc(lastDragClient.x, lastDragClient.y);
  const currNdc = clientToNdc(e.clientX, e.clientY);
  const worldPrev = worldFromNdc(prevNdc, zoom, panWorld);
  const worldCurr = worldFromNdc(currNdc, zoom, panWorld);
  panWorld.x += worldPrev.x - worldCurr.x;
  panWorld.y += worldPrev.y - worldCurr.y;
  lastDragClient.x = e.clientX;
  lastDragClient.y = e.clientY;
});

canvas.addEventListener("auxclick", (e) => {
  if (e.button === 1) e.preventDefault();
});

async function tryAutoLoadAssets() {
  const loaded = [];
  const failed = [];

  try {
    const splat = await loadImageFromUrl("./assets/splat.png");
    uploadImageToTexture(splatTex, splat);
    setSplatSizeFromImage(splat);
    resetCamera();
    loaded.push("splat.png");
  } catch {
  } catch (err) {
    console.warn("Failed to load splat.png", err);
    failed.push("splat.png");
    const fallbackSplat = createFallbackSplat(512);
    uploadImageToTexture(splatTex, fallbackSplat);
    setSplatSizeFromImage(fallbackSplat);
    resetCamera();
  }

  try {
    const normals = await loadImageFromUrl("./assets/normals.png");
    uploadImageToTexture(normalsTex, normals);
    loaded.push("normals.png");
  } catch {
  } catch (err) {
    console.warn("Failed to load normals.png", err);
    failed.push("normals.png");
    uploadImageToTexture(normalsTex, defaultNormalImage);
  }

  try {
    const height = await loadImageFromUrl("./assets/height.png");
    uploadImageToTexture(heightTex, height);
    setHeightSizeFromImage(height);
    loaded.push("height.png");
  } catch {
  } catch (err) {
    console.warn("Failed to load height.png", err);
    failed.push("height.png");
    uploadImageToTexture(heightTex, defaultHeightImage);
    setHeightSizeFromImage(defaultHeightImage);
  }

  if (loaded.length > 0) {
    setStatus(`Loaded default assets: ${loaded.join(", ")}`);
  if (loaded.length > 0 && failed.length > 0) {
    setStatus(`Loaded defaults: ${loaded.join(", ")} | Fallback used for: ${failed.join(", ")}`);
  } else if (loaded.length > 0) {
    setStatus(`Loaded default assets: ${loaded.join(", ")}`);
  } else if (failed.length > 0) {
    setStatus(`Using fallback textures for: ${failed.join(", ")}. Add PNGs to assets/ or load via file pickers.`);
  } else {
    setStatus("Using fallback textures. Add PNGs to assets/ or load via file pickers.");
  }
}

splatInput.addEventListener("change", async () => {
  const file = splatInput.files && splatInput.files[0];
  if (!file) return;
  try {
    const image = await loadImageFromFile(file);
    uploadImageToTexture(splatTex, image);
    setSplatSizeFromImage(image);
    resetCamera();
    setStatus(`Loaded splat: ${file.name} (${image.width}x${image.height})`);
  } catch (error) {
    console.error("Failed to load splat file:", file.name, error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to load splat '${file.name}': ${message}`);
  }
});

normalInput.addEventListener("change", async () => {
  const file = normalInput.files && normalInput.files[0];
  if (!file) return;
  try {
    const image = await loadImageFromFile(file);
    uploadImageToTexture(normalsTex, image);
    setStatus(`Loaded normals: ${file.name}`);
  } catch (error) {
    console.error("Failed to load normals file:", file.name, error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to load normals '${file.name}': ${message}`);
  }
});

heightInput.addEventListener("change", async () => {
  const file = heightInput.files && heightInput.files[0];
  if (!file) return;
  try {
    const image = await loadImageFromFile(file);
    uploadImageToTexture(heightTex, image);
    setHeightSizeFromImage(image);
    setStatus(`Loaded height: ${file.name}`);
  } catch (error) {
    console.error("Failed to load height file:", file.name, error);
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Failed to load height '${file.name}': ${message}`);
  }
});

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function render(nowMs) {
  resize();

  if (cycleState.lastRenderMs === null) {
    cycleState.lastRenderMs = nowMs;
  }
  const dtSec = Math.min(0.25, Math.max(0, (nowMs - cycleState.lastRenderMs) * 0.001));
  cycleState.lastRenderMs = nowMs;

  const cycleSpeedHoursPerSec = clamp(Number(cycleSpeedInput.value), 0, 1);
  if (cycleSpeedHoursPerSec > 0) {
    cycleState.hour = wrapHour(cycleState.hour + cycleSpeedHoursPerSec * dtSec);
  }

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
  const ambientFinal = ambientBase * (sunAmbientWeight + moonAmbientWeight);
  const moonColor = [0.34, 0.40, 0.54];

  cycleInfoEl.textContent = `Time: ${formatHour(cycleState.hour)} | Speed: ${cycleSpeedHoursPerSec.toFixed(2)} h/s`;

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const ambientBase = Number(ambientInput.value);
  const ambientFinal = ambientBase * sun.ambientScale;

  cycleInfoEl.textContent = `Time: ${formatHour(cycleState.hour)} | Speed: ${cycleSpeedHoursPerSec.toFixed(2)} h/s`;

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

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

  const viewHalf = getViewHalfExtents();
  gl.uniform2f(uniforms.uMapTexelSize, 1 / heightSize.width, 1 / heightSize.height);
  gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
  gl.uniform3f(uniforms.uSunDir, sunDir[0], sunDir[1], sunDir[2]);
  gl.uniform3f(uniforms.uSunColor, sun.sunColor[0], sun.sunColor[1], sun.sunColor[2]);
  gl.uniform1f(uniforms.uSunStrength, sunStrength);
  gl.uniform3f(uniforms.uMoonDir, moonDir[0], moonDir[1], moonDir[2]);
  gl.uniform3f(uniforms.uMoonColor, moonColor[0], moonColor[1], moonColor[2]);
  gl.uniform1f(uniforms.uMoonStrength, moonStrength);
  gl.uniform3f(uniforms.uAmbientColor, ambientColor[0], ambientColor[1], ambientColor[2]);
  gl.uniform3f(uniforms.uAmbientColor, sun.ambientColor[0], sun.ambientColor[1], sun.ambientColor[2]);
  gl.uniform1f(uniforms.uAmbient, ambientFinal);
  gl.uniform1f(uniforms.uHeightScale, Number(heightScaleInput.value));
  gl.uniform1f(uniforms.uShadowStrength, Number(shadowStrengthInput.value));
  gl.uniform1f(uniforms.uUseShadows, shadowsToggle.checked ? 1 : 0);
  gl.uniform1f(uniforms.uMapAspect, getMapAspect());
  gl.uniform2f(uniforms.uViewHalfExtents, viewHalf.x, viewHalf.y);
  gl.uniform2f(uniforms.uPanWorld, panWorld.x, panWorld.y);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

void tryAutoLoadAssets().catch((error) => {
  console.error("Auto-load failed:", error);
  const message = error instanceof Error ? error.message : String(error);
  setStatus(`Auto-load failed: ${message}`);
});
setStatus(`${statusEl.textContent} | Day cycle: speed slider (0..1 h/s), diffuse slider, wheel zoom, middle-drag pan.`);
requestAnimationFrame(render);
await tryAutoLoadAssets();
setStatus(`${statusEl.textContent} | Day cycle: speed slider (0..1 h/s), wheel zoom, middle-drag pan.`);
requestAnimationFrame(render);
