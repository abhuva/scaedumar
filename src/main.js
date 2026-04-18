const canvas = document.getElementById("glCanvas");
const statusEl = document.getElementById("status");
const splatInput = document.getElementById("splatInput");
const normalInput = document.getElementById("normalInput");
const heightInput = document.getElementById("heightInput");
const shadowsToggle = document.getElementById("shadowsToggle");
const heightScaleInput = document.getElementById("heightScale");
const shadowStrengthInput = document.getElementById("shadowStrength");
const ambientInput = document.getElementById("ambient");

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

  float diffuse = max(dot(n, uSunDir), 0.0);
  float shadow = calcShadow(uv, uSunDir);
  float light = clamp(uAmbient + diffuse * shadow, 0.0, 1.0);
  outColor = vec4(base * light, 1.0);
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

const program = createProgram(VERT_SRC, FRAG_SRC);
gl.useProgram(program);

const uniforms = {
  uSplat: gl.getUniformLocation(program, "uSplat"),
  uNormals: gl.getUniformLocation(program, "uNormals"),
  uHeight: gl.getUniformLocation(program, "uHeight"),
  uMapTexelSize: gl.getUniformLocation(program, "uMapTexelSize"),
  uResolution: gl.getUniformLocation(program, "uResolution"),
  uSunDir: gl.getUniformLocation(program, "uSunDir"),
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

const defaultNormalImage = createFlatNormalImage();
const defaultHeightImage = createFlatHeightImage();
const defaultSplatImage = createFallbackSplat();
uploadImageToTexture(normalsTex, defaultNormalImage);
uploadImageToTexture(heightTex, defaultHeightImage);
uploadImageToTexture(splatTex, defaultSplatImage);
setSplatSizeFromImage(defaultSplatImage);
setHeightSizeFromImage(defaultHeightImage);

let sunAzimuth = 0.9;
let sunAltitude = 0.7;
let zoom = 1;
const zoomMin = 0.5;
const zoomMax = 32;
const panWorld = { x: 0, y: 0 };
let isMiddleDragging = false;
let lastDragClient = { x: 0, y: 0 };

function updateSunFromMouse(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const radius = Math.max(32, Math.min(rect.width, rect.height) * 0.5);
  const dist01 = Math.min(1, Math.hypot(dx, dy) / radius);
  sunAzimuth = Math.atan2(dy, dx);
  const minAlt = 8 * (Math.PI / 180);
  const maxAlt = 85 * (Math.PI / 180);
  sunAltitude = maxAlt - dist01 * (maxAlt - minAlt);
}

canvas.addEventListener("mousemove", (e) => {
  if (isMiddleDragging) return;
  updateSunFromMouse(e.clientX, e.clientY);
});

canvas.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (!t) return;
  updateSunFromMouse(t.clientX, t.clientY);
}, { passive: true });

function setSplatSizeFromImage(img) {
  splatSize.width = img.width || 1;
  splatSize.height = img.height || 1;
}

function setHeightSizeFromImage(img) {
  heightSize.width = img.width || 1;
  heightSize.height = img.height || 1;
}

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
  const results = [];
  const loadFirstExisting = async (candidates) => {
    for (const url of candidates) {
      try {
        const image = await loadImageFromUrl(url);
        return { image, url };
      } catch {
        // Try next extension.
      }
    }
    return null;
  };

  const splatLoaded = await loadFirstExisting(["./assets/splat.png", "./assets/splat.jpg", "./assets/splat.jpeg"]);
  if (splatLoaded) {
    uploadImageToTexture(splatTex, splatLoaded.image);
    setSplatSizeFromImage(splatLoaded.image);
    resetCamera();
    results.push(`splat (${splatLoaded.url.split("/").pop()})`);
  } else {
    const fallbackSplat = createFallbackSplat(512);
    uploadImageToTexture(splatTex, fallbackSplat);
    setSplatSizeFromImage(fallbackSplat);
    resetCamera();
  }

  const normalsLoaded = await loadFirstExisting(["./assets/normals.png", "./assets/normals.jpg", "./assets/normals.jpeg"]);
  if (normalsLoaded) {
    uploadImageToTexture(normalsTex, normalsLoaded.image);
    results.push(`normals (${normalsLoaded.url.split("/").pop()})`);
  } else {
    uploadImageToTexture(normalsTex, defaultNormalImage);
  }

  const heightLoaded = await loadFirstExisting(["./assets/height.png", "./assets/height.jpg", "./assets/height.jpeg"]);
  if (heightLoaded) {
    uploadImageToTexture(heightTex, heightLoaded.image);
    setHeightSizeFromImage(heightLoaded.image);
    results.push(`height (${heightLoaded.url.split("/").pop()})`);
  } else {
    uploadImageToTexture(heightTex, defaultHeightImage);
    setHeightSizeFromImage(defaultHeightImage);
  }

  if (results.length > 0) {
    setStatus(`Loaded default assets: ${results.join(", ")}`);
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

function render() {
  resize();
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const cosAlt = Math.cos(sunAltitude);
  const sunDir = [
    Math.cos(sunAzimuth) * cosAlt,
    Math.sin(sunAzimuth) * cosAlt,
    Math.sin(sunAltitude),
  ];

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
  gl.uniform1f(uniforms.uAmbient, Number(ambientInput.value));
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

await tryAutoLoadAssets();
setStatus(`${statusEl.textContent} | Mouse: sun direction, wheel: zoom, middle-drag: pan.`);
render();
