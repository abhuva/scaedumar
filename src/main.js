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
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uSplat;
uniform sampler2D uNormals;
uniform sampler2D uHeight;
uniform vec2 uMapTexelSize;
uniform vec3 uSunDir;
uniform float uAmbient;
uniform float uHeightScale;
uniform float uShadowStrength;
uniform float uUseShadows;

float readHeight(vec2 uv) {
  return texture(uHeight, uv).r * uHeightScale;
}

float calcShadow(vec2 uv, vec3 sunDir) {
  if (uUseShadows < 0.5) return 1.0;
  if (sunDir.z <= 0.01) return 0.0;

  vec2 dir2 = normalize(sunDir.xy);
  if (length(dir2) < 0.0001) return 1.0;

  float h0 = readHeight(uv);
  float slope = sunDir.z / max(length(sunDir.xy), 0.0001);
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
  vec3 base = texture(uSplat, vUv).rgb;
  vec3 n = texture(uNormals, vUv).xyz * 2.0 - 1.0;
  n = normalize(n);

  float diffuse = max(dot(n, uSunDir), 0.0);
  float shadow = calcShadow(vUv, uSunDir);
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
  uSunDir: gl.getUniformLocation(program, "uSunDir"),
  uAmbient: gl.getUniformLocation(program, "uAmbient"),
  uHeightScale: gl.getUniformLocation(program, "uHeightScale"),
  uShadowStrength: gl.getUniformLocation(program, "uShadowStrength"),
  uUseShadows: gl.getUniformLocation(program, "uUseShadows"),
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

const mapSize = { width: 1, height: 1 };

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

uploadImageToTexture(normalsTex, createFlatNormalImage());
uploadImageToTexture(heightTex, createFlatHeightImage());
uploadImageToTexture(splatTex, createFallbackSplat());

let sunAzimuth = 0.9;
let sunAltitude = 0.7;

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
  updateSunFromMouse(e.clientX, e.clientY);
});

canvas.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (!t) return;
  updateSunFromMouse(t.clientX, t.clientY);
}, { passive: true });

function setMapSizeFromImage(img) {
  mapSize.width = img.width || 1;
  mapSize.height = img.height || 1;
}

async function tryAutoLoadAssets() {
  const results = [];

  try {
    const img = await loadImageFromUrl("./assets/splat.png");
    uploadImageToTexture(splatTex, img);
    setMapSizeFromImage(img);
    results.push("splat");
  } catch {
    setMapSizeFromImage(createFallbackSplat(512));
  }

  try {
    const img = await loadImageFromUrl("./assets/normals.png");
    uploadImageToTexture(normalsTex, img);
    results.push("normals");
  } catch {
    uploadImageToTexture(normalsTex, createFlatNormalImage());
  }

  try {
    const img = await loadImageFromUrl("./assets/height.png");
    uploadImageToTexture(heightTex, img);
    results.push("height");
  } catch {
    uploadImageToTexture(heightTex, createFlatHeightImage());
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
  const image = await loadImageFromFile(file);
  uploadImageToTexture(splatTex, image);
  setMapSizeFromImage(image);
  setStatus(`Loaded splat: ${file.name} (${image.width}x${image.height})`);
});

normalInput.addEventListener("change", async () => {
  const file = normalInput.files && normalInput.files[0];
  if (!file) return;
  const image = await loadImageFromFile(file);
  uploadImageToTexture(normalsTex, image);
  setStatus(`Loaded normals: ${file.name}`);
});

heightInput.addEventListener("change", async () => {
  const file = heightInput.files && heightInput.files[0];
  if (!file) return;
  const image = await loadImageFromFile(file);
  uploadImageToTexture(heightTex, image);
  setStatus(`Loaded height: ${file.name}`);
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

  gl.uniform2f(uniforms.uMapTexelSize, 1 / mapSize.width, 1 / mapSize.height);
  gl.uniform3f(uniforms.uSunDir, sunDir[0], sunDir[1], sunDir[2]);
  gl.uniform1f(uniforms.uAmbient, Number(ambientInput.value));
  gl.uniform1f(uniforms.uHeightScale, Number(heightScaleInput.value));
  gl.uniform1f(uniforms.uShadowStrength, Number(shadowStrengthInput.value));
  gl.uniform1f(uniforms.uUseShadows, shadowsToggle.checked ? 1 : 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

await tryAutoLoadAssets();
setStatus(`${statusEl.textContent} | Move mouse over the map to steer the sun.`);
render();
