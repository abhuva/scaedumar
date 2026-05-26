export const DEFAULT_WATER_TRAIL_SETTINGS = {
  enabled: false,
  particleCount: 400,
  speedPxPerSec: 45,
  simSpeed: 1,
  resolutionScale: 0.5,
  flowInfluence: 1,
  trailStrength: 1.4,
  agentOpacity: 0.18,
  trailHeadroom: 4,
  trailFade: 0.92,
  diffusion: 0,
  currentDrag: 0.18,
  stampRadius: 0.6,
  spawnInheritRadius: 24,
  spawnWarmupSec: 0.8,
  channelPair: "rg",
  flipX: false,
  flipY: false,
  useMagnitude: false,
  debug: false,
  tintColor: "#7ed7ff",
  glitterStrength: 0,
  glitterDensity: 0.04,
  glitterSpeed: 3.5,
  glitterSize: 2,
  glitterSharpness: 10,
  glitterWakeSuppression: 0.75,
};

const WAKE_UPDATE_VERT_SRC = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 pos[6] = vec2[6](
    vec2(-1.0, -1.0),
    vec2(1.0, -1.0),
    vec2(-1.0, 1.0),
    vec2(-1.0, 1.0),
    vec2(1.0, -1.0),
    vec2(1.0, 1.0)
  );
  vec2 p = pos[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const WAKE_UPDATE_FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uPrevWake;
uniform sampler2D uDeposit;
uniform sampler2D uFlowField;
uniform vec2 uResolution;
uniform float uDtSec;
uniform float uTrailFade;
uniform float uWakeSpread;
uniform float uCurrentDrag;

vec2 decodeDir(vec2 packedDir) {
  vec2 dir = packedDir * 2.0 - 1.0;
  float len = length(dir);
  if (len <= 0.0001) return vec2(0.0, 1.0);
  return dir / len;
}

vec2 encodeDir(vec2 dir) {
  float len = length(dir);
  if (len <= 0.0001) return vec2(0.5, 0.5);
  return dir / len * 0.5 + 0.5;
}

void main() {
  vec4 flowSample = texture(uFlowField, vUv);
  float waterMask = flowSample.a;
  vec2 flowDir = decodeDir(flowSample.rg);
  if (waterMask < 0.5) {
    outColor = vec4(encodeDir(flowDir), 0.0, 1.0);
    return;
  }

  vec2 texel = 1.0 / max(vec2(1.0), uResolution);
  vec4 center = texture(uPrevWake, vUv);
  vec2 centerDir = decodeDir(center.rg);
  float centerStrength = center.b;
  float spread = clamp(uWakeSpread, 0.0, 1.0);
  float stepPx = spread * 42.0 * max(0.0, uDtSec);
  vec2 transportDir = normalize(mix(centerDir, flowDir, clamp(uCurrentDrag, 0.0, 1.0)));
  vec2 sourceUv = clamp(vUv - transportDir * texel * stepPx, vec2(0.0), vec2(1.0));
  vec4 upstream = texture(uPrevWake, sourceUv);
  vec2 upstreamDir = decodeDir(upstream.rg);
  float fadePerSecond = pow(clamp(uTrailFade, 0.0, 1.0), 60.0);
  float fade = pow(fadePerSecond, max(0.0, uDtSec));
  float baseStrength = mix(centerStrength, upstream.b, spread) * fade;
  vec2 baseDir = normalize(mix(centerDir, upstreamDir, spread));

  vec4 deposit = texture(uDeposit, vUv);
  vec2 depositDir = decodeDir(deposit.rg);
  float depositStrength = deposit.b;
  float nextStrength = clamp(baseStrength + depositStrength, 0.0, 1.0);
  vec2 nextDir = flowDir;
  if (nextStrength > 0.0001) {
    nextDir = normalize(baseDir * baseStrength + depositDir * depositStrength);
  }

  outColor = vec4(encodeDir(nextDir), nextStrength, 1.0);
}`;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb01(hex) {
  const value = String(hex || "#7ed7ff").replace(/^#/, "");
  const full = value.length === 3
    ? value.split("").map((ch) => ch + ch).join("")
    : value.padEnd(6, "f").slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return [0.494, 0.843, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function normalizeResolutionScale(input) {
  const value = Number(input);
  if (value === 1 || value === 0.5 || value === 0.25 || value === 0.125) return value;
  return DEFAULT_WATER_TRAIL_SETTINGS.resolutionScale;
}

function readFlowChannel(channels, channel) {
  if (channel === "r") return channels.r;
  if (channel === "g") return channels.g;
  if (channel === "b") return channels.b;
  return 0.5;
}

function normalizeSettings(input = {}) {
  function numberOr(value, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  return {
    enabled: Boolean(input.enabled),
    particleCount: Math.round(clamp(numberOr(input.particleCount, DEFAULT_WATER_TRAIL_SETTINGS.particleCount), 1, 2000)),
    speedPxPerSec: clamp(numberOr(input.speedPxPerSec, DEFAULT_WATER_TRAIL_SETTINGS.speedPxPerSec), 1, 240),
    simSpeed: clamp(numberOr(input.simSpeed, DEFAULT_WATER_TRAIL_SETTINGS.simSpeed), 0, 4),
    resolutionScale: normalizeResolutionScale(input.resolutionScale),
    flowInfluence: clamp(numberOr(input.flowInfluence, DEFAULT_WATER_TRAIL_SETTINGS.flowInfluence), 0, 4),
    trailStrength: clamp(numberOr(input.trailStrength, DEFAULT_WATER_TRAIL_SETTINGS.trailStrength), 0, 6),
    agentOpacity: clamp(numberOr(input.agentOpacity, DEFAULT_WATER_TRAIL_SETTINGS.agentOpacity), 0.01, 1),
    trailHeadroom: clamp(numberOr(input.trailHeadroom, DEFAULT_WATER_TRAIL_SETTINGS.trailHeadroom), 1, 12),
    trailFade: clamp(numberOr(input.trailFade, DEFAULT_WATER_TRAIL_SETTINGS.trailFade), 0.5, 0.995),
    diffusion: clamp(numberOr(input.diffusion, DEFAULT_WATER_TRAIL_SETTINGS.diffusion), 0, 1),
    currentDrag: clamp(numberOr(input.currentDrag, DEFAULT_WATER_TRAIL_SETTINGS.currentDrag), 0, 1),
    stampRadius: clamp(numberOr(input.stampRadius, DEFAULT_WATER_TRAIL_SETTINGS.stampRadius), 0.1, 8),
    spawnInheritRadius: clamp(numberOr(input.spawnInheritRadius, DEFAULT_WATER_TRAIL_SETTINGS.spawnInheritRadius), 0, 80),
    spawnWarmupSec: clamp(numberOr(input.spawnWarmupSec, DEFAULT_WATER_TRAIL_SETTINGS.spawnWarmupSec), 0, 2),
    channelPair: input.channelPair === "gb" || input.channelPair === "rb" ? input.channelPair : "rg",
    flipX: Boolean(input.flipX),
    flipY: Boolean(input.flipY),
    useMagnitude: Boolean(input.useMagnitude),
    debug: Boolean(input.debug),
    tintColor: typeof input.tintColor === "string" ? input.tintColor : DEFAULT_WATER_TRAIL_SETTINGS.tintColor,
    glitterStrength: clamp(numberOr(input.glitterStrength, DEFAULT_WATER_TRAIL_SETTINGS.glitterStrength), 0, 2),
    glitterDensity: clamp(numberOr(input.glitterDensity, DEFAULT_WATER_TRAIL_SETTINGS.glitterDensity), 0.001, 0.25),
    glitterSpeed: clamp(numberOr(input.glitterSpeed, DEFAULT_WATER_TRAIL_SETTINGS.glitterSpeed), 0, 12),
    glitterSize: Math.round(clamp(numberOr(input.glitterSize, DEFAULT_WATER_TRAIL_SETTINGS.glitterSize), 1, 12)),
    glitterSharpness: clamp(numberOr(input.glitterSharpness, DEFAULT_WATER_TRAIL_SETTINGS.glitterSharpness), 1, 24),
    glitterWakeSuppression: clamp(numberOr(input.glitterWakeSuppression, DEFAULT_WATER_TRAIL_SETTINGS.glitterWakeSuppression), 0, 1),
  };
}

function createPrng(seed = 0x5f3759df) {
  let state = seed >>> 0;
  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Water wake shader compilation failed.");
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "Water wake program linking failed.");
  }
  return program;
}

export function createWaterParticleTrailRuntime(deps) {
  const settings = normalizeSettings(DEFAULT_WATER_TRAIL_SETTINGS);
  const random = createPrng();
  const particles = [];
  const gl = deps.gl;
  let width = 1;
  let height = 1;
  let depositUpload = new Uint8Array(width * height * 4);
  let flowUpload = new Uint8Array(width * height * 4);
  let waterMask = new Uint8Array(width * height);
  let flowXField = new Float32Array(width * height);
  let flowYField = new Float32Array(width * height);
  let flowMagnitudeField = new Float32Array(width * height);
  let waterSpawnPixels = [];
  let depositTexture = null;
  let prevWakeTexture = null;
  let flowFieldTexture = null;
  let updateFbo = null;
  let updateProgram = null;
  let updateUniforms = null;
  let initialized = false;
  let statsFrame = 0;
  let simAccumulatorSec = 0;
  const minUpdateIntervalSec = 1 / 60;
  const maxSimulationTimeSec = 0.12;
  let lastDepositMax = 0;
  let lastStats = {
    enabled: false,
    particles: 0,
    waterPixels: 0,
    flowLoaded: false,
    activeParticles: 0,
    trailMax: 0,
  };

  function resetStats() {
    lastDepositMax = 0;
    lastStats = {
      enabled: false,
      particles: 0,
      waterPixels: 0,
      flowLoaded: false,
      activeParticles: 0,
      trailMax: 0,
    };
    updateStatsText();
  }

  function createWakeTexture() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  function ensureGpuObjects() {
    if (!depositTexture) depositTexture = createWakeTexture();
    if (!prevWakeTexture) prevWakeTexture = createWakeTexture();
    if (!flowFieldTexture) flowFieldTexture = createWakeTexture();
    if (!updateFbo) updateFbo = gl.createFramebuffer();
    if (!updateProgram) {
      updateProgram = createProgram(gl, WAKE_UPDATE_VERT_SRC, WAKE_UPDATE_FRAG_SRC);
      updateUniforms = {
        uPrevWake: gl.getUniformLocation(updateProgram, "uPrevWake"),
        uDeposit: gl.getUniformLocation(updateProgram, "uDeposit"),
        uFlowField: gl.getUniformLocation(updateProgram, "uFlowField"),
        uResolution: gl.getUniformLocation(updateProgram, "uResolution"),
        uDtSec: gl.getUniformLocation(updateProgram, "uDtSec"),
        uTrailFade: gl.getUniformLocation(updateProgram, "uTrailFade"),
        uWakeSpread: gl.getUniformLocation(updateProgram, "uWakeSpread"),
        uCurrentDrag: gl.getUniformLocation(updateProgram, "uCurrentDrag"),
      };
    }
  }

  function sourceToWakeSize(sourceWidth, sourceHeight) {
    const scale = normalizeResolutionScale(settings.resolutionScale);
    return {
      width: Math.max(1, Math.round((sourceWidth || 1) * scale)),
      height: Math.max(1, Math.round((sourceHeight || 1) * scale)),
    };
  }

  function getSettings() {
    return { ...settings };
  }

  function serializeSettings() {
    return {
      version: 1,
      ...getSettings(),
    };
  }

  function applySettings(rawData = {}) {
    const source = rawData && typeof rawData === "object" ? rawData : {};
    patchSettings({
      ...DEFAULT_WATER_TRAIL_SETTINGS,
      ...source,
    });
  }

  function patchSettings(patch) {
    const wasEnabled = settings.enabled;
    const previousResolutionScale = settings.resolutionScale;
    const previousDecodeKey = `${settings.channelPair}:${settings.flipX}:${settings.flipY}:${settings.useMagnitude}`;
    Object.assign(settings, normalizeSettings({ ...settings, ...patch }));
    const nextDecodeKey = `${settings.channelPair}:${settings.flipX}:${settings.flipY}:${settings.useMagnitude}`;
    if (settings.resolutionScale !== previousResolutionScale) {
      initialized = false;
      const water = deps.getWaterImageData();
      ensureTextureSize(water ? water.width : 1, water ? water.height : 1);
    } else if (nextDecodeKey !== previousDecodeKey) {
      rebuildFlowField();
      clearWakeTextures();
    }
    ensureParticleCount();
    if (settings.enabled !== wasEnabled) {
      clear();
    }
    syncControls();
  }

  function ensureTextureSize(nextWidth, nextHeight) {
    const size = sourceToWakeSize(nextWidth, nextHeight);
    if (size.width === width && size.height === height && initialized) return;
    width = size.width;
    height = size.height;
    depositUpload = new Uint8Array(width * height * 4);
    flowUpload = new Uint8Array(width * height * 4);
    waterMask = new Uint8Array(width * height);
    flowXField = new Float32Array(width * height);
    flowYField = new Float32Array(width * height);
    flowMagnitudeField = new Float32Array(width * height);
    ensureGpuObjects();
    particles.length = 0;
    initialized = true;
    allocateTexture(deps.texture, null);
    allocateTexture(prevWakeTexture, null);
    allocateTexture(depositTexture, depositUpload);
    allocateTexture(flowFieldTexture, flowUpload);
    rebuildWaterSpawnPixels();
    rebuildFlowField();
    clearWakeTextures();
    ensureParticleCount();
  }

  function allocateTexture(texture, data) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  function clearWakeTextures() {
    const empty = new Uint8Array(width * height * 4);
    for (let i = 0, j = 0; i < width * height; i += 1, j += 4) {
      empty[j] = flowUpload[j];
      empty[j + 1] = flowUpload[j + 1];
      empty[j + 2] = 0;
      empty[j + 3] = 255;
    }
    gl.bindTexture(gl.TEXTURE_2D, deps.texture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, empty);
    gl.bindTexture(gl.TEXTURE_2D, prevWakeTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, empty);
  }

  function clear() {
    resetStats();
    simAccumulatorSec = 0;
    rebuildWaterSpawnPixels();
    rebuildFlowField();
    depositUpload.fill(0);
    particles.length = 0;
    ensureParticleCount();
    if (initialized) {
      gl.bindTexture(gl.TEXTURE_2D, depositTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, depositUpload);
      clearWakeTextures();
    }
  }

  function sampleGray(imageData, u, v) {
    if (!imageData || !imageData.data || !imageData.width || !imageData.height) return 0;
    const x = clamp(Math.floor(u * imageData.width), 0, imageData.width - 1);
    const y = clamp(Math.floor(v * imageData.height), 0, imageData.height - 1);
    return imageData.data[(y * imageData.width + x) * 4] / 255;
  }

  function rebuildWaterSpawnPixels() {
    const water = deps.getWaterImageData();
    waterSpawnPixels = [];
    waterMask.fill(0);
    if (!water || !water.data || !water.width || !water.height) return;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const u = (x + 0.5) / width;
        const v = (y + 0.5) / height;
        if (sampleGray(water, u, v) > 0.46) {
          waterMask[y * width + x] = 1;
          waterSpawnPixels.push({ x, y });
        }
      }
    }
  }

  function isWater(u, v) {
    const x = clamp(Math.floor(u * width), 0, width - 1);
    const y = clamp(Math.floor(v * height), 0, height - 1);
    return waterMask[y * width + x] > 0;
  }

  function decodeFlowImageAt(u, v) {
    const flow = deps.getFlowImageData();
    if (!flow || !flow.data || !flow.width || !flow.height) return [0, 1, 1];
    const x = clamp(Math.floor(u * flow.width), 0, flow.width - 1);
    const y = clamp(Math.floor(v * flow.height), 0, flow.height - 1);
    const index = (y * flow.width + x) * 4;
    const r = flow.data[index] / 255;
    const g = flow.data[index + 1] / 255;
    const b = flow.data[index + 2] / 255;
    const channels = { r, g, b };
    const pair = String(settings.channelPair || "rg");
    const xChannel = pair[0] || "r";
    const yChannel = pair[1] || "g";
    let a = readFlowChannel(channels, xChannel);
    let c = readFlowChannel(channels, yChannel);
    let magnitude = 1;
    if (settings.useMagnitude) {
      magnitude = b;
      if (xChannel === "b" || yChannel === "b") {
        a = xChannel === "r" || yChannel === "r" ? r : 0.5;
        c = xChannel === "g" || yChannel === "g" ? g : 0.5;
      }
    }
    let dx = a * 2 - 1;
    let dy = c * 2 - 1;
    if (settings.flipX) dx = -dx;
    if (settings.flipY) dy = -dy;
    const len = Math.hypot(dx, dy);
    if (len <= 0.0001) return [0, 0, 0];
    return [dx / len, dy / len, magnitude];
  }

  function rebuildFlowField() {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = y * width + x;
        const j = i * 4;
        const [dx, dy, magnitude] = decodeFlowImageAt((x + 0.5) / width, (y + 0.5) / height);
        flowXField[i] = dx;
        flowYField[i] = dy;
        flowMagnitudeField[i] = magnitude;
        flowUpload[j] = Math.round(clamp(0.5 + dx * 0.5, 0, 1) * 255);
        flowUpload[j + 1] = Math.round(clamp(0.5 + dy * 0.5, 0, 1) * 255);
        flowUpload[j + 2] = Math.round(clamp(magnitude, 0, 1) * 255);
        flowUpload[j + 3] = waterMask[i] ? 255 : 0;
      }
    }
    if (flowFieldTexture) {
      gl.bindTexture(gl.TEXTURE_2D, flowFieldTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, flowUpload);
    }
  }

  function sampleFlow(u, v) {
    const px = clamp(Math.floor(u * width), 0, width - 1);
    const py = clamp(Math.floor(v * height), 0, height - 1);
    const index = py * width + px;
    return [flowXField[index], flowYField[index], flowMagnitudeField[index]];
  }

  function spawnParticle(particle) {
    if (waterSpawnPixels.length > 0) {
      const spawn = waterSpawnPixels[Math.floor(random() * waterSpawnPixels.length)];
      particle.u = (spawn.x + random()) / width;
      particle.v = (spawn.y + random()) / height;
      particle.prevU = particle.u;
      particle.prevV = particle.v;
      inheritParticleVelocity(particle);
      particle.age = 0;
      return;
    }
    particle.u = random();
    particle.v = random();
    particle.prevU = particle.u;
    particle.prevV = particle.v;
    inheritParticleVelocity(particle);
    particle.age = 0;
  }

  function inheritParticleVelocity(particle) {
    const radiusPx = settings.spawnInheritRadius;
    const radiusUv = radiusPx / Math.max(1, Math.min(width, height));
    let best = null;
    let bestDistSq = radiusUv * radiusUv;
    if (radiusPx > 0) {
      for (const other of particles) {
        if (other === particle || other.age <= 0.05) continue;
        const dx = other.u - particle.u;
        const dy = other.v - particle.v;
        const distSq = dx * dx + dy * dy;
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          best = other;
        }
      }
    }
    if (best) {
      particle.vx = best.vx;
      particle.vy = best.vy;
      return;
    }
    const [dx, dy] = sampleFlow(particle.u, particle.v);
    particle.vx = dx;
    particle.vy = dy;
  }

  function ensureParticleCount() {
    while (particles.length < settings.particleCount) {
      const particle = {};
      spawnParticle(particle);
      particles.push(particle);
    }
    if (particles.length > settings.particleCount) {
      particles.length = settings.particleCount;
    }
  }

  function addDeposit(idx, amount, vx, vy) {
    const addStrength = clamp(amount, 0, 1);
    const j = idx * 4;
    const oldStrength = depositUpload[j + 2] / 255;
    const oldVx = depositUpload[j] / 255 * 2 - 1;
    const oldVy = depositUpload[j + 1] / 255 * 2 - 1;
    const nextStrength = clamp(oldStrength + addStrength, 0, 1);
    if (nextStrength <= 0.00001) return;
    const nextVx = (oldVx * oldStrength + vx * addStrength) / nextStrength;
    const nextVy = (oldVy * oldStrength + vy * addStrength) / nextStrength;
    depositUpload[j] = Math.round(clamp(0.5 + nextVx * 0.5, 0, 1) * 255);
    depositUpload[j + 1] = Math.round(clamp(0.5 + nextVy * 0.5, 0, 1) * 255);
    depositUpload[j + 2] = Math.round(nextStrength * 255);
    depositUpload[j + 3] = 255;
    lastDepositMax = Math.max(lastDepositMax, depositUpload[j + 2]);
  }

  function stamp(x, y, amount, vx, vy) {
    const radiusFloat = settings.stampRadius;
    if (radiusFloat < 0.75) {
      const xx = clamp(x, 0, width - 1);
      const yy = clamp(y, 0, height - 1);
      addDeposit(yy * width + xx, amount * radiusFloat, vx, vy);
      return;
    }
    const radius = Math.max(1, Math.ceil(radiusFloat));
    const r2 = radius * radius;
    for (let oy = -radius; oy <= radius; oy += 1) {
      const yy = y + oy;
      if (yy < 0 || yy >= height) continue;
      for (let ox = -radius; ox <= radius; ox += 1) {
        const xx = x + ox;
        const distSq = ox * ox + oy * oy;
        if (xx < 0 || xx >= width || distSq > r2) continue;
        const falloff = 1 - Math.sqrt(distSq) / Math.max(0.0001, radiusFloat);
        addDeposit(yy * width + xx, amount * clamp(falloff, 0, 1), vx, vy);
      }
    }
  }

  function drawLine(u0, v0, u1, v1, amount) {
    const x0 = Math.round(clamp(u0, 0, 1) * (width - 1));
    const y0 = Math.round(clamp(v0, 0, 1) * (height - 1));
    const x1 = Math.round(clamp(u1, 0, 1) * (width - 1));
    const y1 = Math.round(clamp(v1, 0, 1) * (height - 1));
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.max(0.0001, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;
    const sideOffset = Math.max(1, settings.stampRadius + 0.5);
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = x0 + dx * t;
      const y = y0 + dy * t;
      stamp(Math.round(x + nx * sideOffset), Math.round(y + ny * sideOffset), amount, nx, ny);
      stamp(Math.round(x - nx * sideOffset), Math.round(y - ny * sideOffset), amount, -nx, -ny);
      stamp(Math.round(x), Math.round(y), amount * 0.25, nx, ny);
    }
  }

  function updateParticles(dt) {
    let activeParticles = 0;
    const amount = clamp((settings.agentOpacity * settings.trailStrength) / Math.max(1, settings.trailHeadroom), 0.001, 1);
    for (const particle of particles) {
      particle.prevU = particle.u;
      particle.prevV = particle.v;
      const [dx, dy, magnitude] = sampleFlow(particle.u, particle.v);
      if (magnitude <= 0.0001 || !isWater(particle.u, particle.v)) {
        spawnParticle(particle);
        continue;
      }
      const steering = clamp(settings.flowInfluence, 0, 4);
      particle.vx = particle.vx * 0.72 + dx * steering * 0.28;
      particle.vy = particle.vy * 0.72 + dy * steering * 0.28;
      const len = Math.hypot(particle.vx, particle.vy);
      if (len > 0.0001) {
        particle.vx /= len;
        particle.vy /= len;
      }
      const warmup = settings.spawnWarmupSec <= 0
        ? 1
        : clamp(particle.age / settings.spawnWarmupSec, 0.08, 1);
      particle.u += (particle.vx * settings.speedPxPerSec * magnitude * dt * warmup) / width;
      particle.v += (particle.vy * settings.speedPxPerSec * magnitude * dt * warmup) / height;
      particle.age += dt;
      if (particle.u < 0 || particle.v < 0 || particle.u > 1 || particle.v > 1 || particle.age > 12 || !isWater(particle.u, particle.v)) {
        spawnParticle(particle);
        continue;
      }
      activeParticles += 1;
      drawLine(particle.prevU, particle.prevV, particle.u, particle.v, amount);
    }
    return activeParticles;
  }

  function runWakeGpuPass(dt) {
    gl.bindTexture(gl.TEXTURE_2D, depositTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, depositUpload);

    gl.viewport(0, 0, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, updateFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, deps.texture, 0);
    gl.useProgram(updateProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, prevWakeTexture);
    gl.uniform1i(updateUniforms.uPrevWake, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, depositTexture);
    gl.uniform1i(updateUniforms.uDeposit, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, flowFieldTexture);
    gl.uniform1i(updateUniforms.uFlowField, 2);
    gl.uniform2f(updateUniforms.uResolution, width, height);
    gl.uniform1f(updateUniforms.uDtSec, dt);
    gl.uniform1f(updateUniforms.uTrailFade, settings.trailFade);
    gl.uniform1f(updateUniforms.uWakeSpread, settings.diffusion);
    gl.uniform1f(updateUniforms.uCurrentDrag, settings.currentDrag);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, prevWakeTexture);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function update(dtSec) {
    const water = deps.getWaterImageData();
    if (!water || !water.width || !water.height) {
      resetStats();
      return;
    }
    ensureTextureSize(water.width, water.height);
    if (!settings.enabled) {
      resetStats();
      simAccumulatorSec = 0;
      return;
    }
    ensureParticleCount();
    const inputDt = Math.max(0, Number(dtSec) || 0);
    simAccumulatorSec = Math.min(maxSimulationTimeSec, simAccumulatorSec + inputDt);
    if (simAccumulatorSec < minUpdateIntervalSec) return;
    const dt = clamp(simAccumulatorSec * settings.simSpeed, 0, maxSimulationTimeSec);
    simAccumulatorSec = 0;
    if (dt <= 0) return;
    depositUpload.fill(0);
    lastDepositMax = 0;
    const activeParticles = updateParticles(dt);
    runWakeGpuPass(dt);
    statsFrame += 1;
    if (statsFrame % 10 === 0) {
      updateStats(activeParticles);
    }
  }

  function getUniformState() {
    return {
      enabled: settings.enabled,
      strength: settings.trailStrength,
      headroom: settings.trailHeadroom,
      debug: settings.debug,
      tintColor: hexToRgb01(settings.tintColor),
      glitterStrength: settings.glitterStrength,
      glitterDensity: settings.glitterDensity,
      glitterSpeed: settings.glitterSpeed,
      glitterSize: settings.glitterSize,
      glitterSharpness: settings.glitterSharpness,
      glitterWakeSuppression: settings.glitterWakeSuppression,
    };
  }

  function bindControl(id, eventName, patchFactory) {
    const element = deps.document.getElementById(id);
    if (!element) return null;
    element.addEventListener(eventName, () => patchSettings(patchFactory(element)));
    return element;
  }

  const controls = {
    enabled: bindControl("waterTrailToggle", "change", (el) => ({ enabled: el.checked })),
    particleCount: bindControl("waterTrailParticleCount", "input", (el) => ({ particleCount: Number(el.value) })),
    speedPxPerSec: bindControl("waterTrailSpeed", "input", (el) => ({ speedPxPerSec: Number(el.value) })),
    simSpeed: bindControl("waterTrailSimSpeed", "input", (el) => ({ simSpeed: Number(el.value) })),
    resolutionScale: bindControl("waterTrailResolution", "change", (el) => ({ resolutionScale: Number(el.value) })),
    flowInfluence: bindControl("waterTrailFlowInfluence", "input", (el) => ({ flowInfluence: Number(el.value) })),
    trailStrength: bindControl("waterTrailStrength", "input", (el) => ({ trailStrength: Number(el.value) })),
    agentOpacity: bindControl("waterTrailAgentOpacity", "input", (el) => ({ agentOpacity: Number(el.value) })),
    trailHeadroom: bindControl("waterTrailHeadroom", "input", (el) => ({ trailHeadroom: Number(el.value) })),
    trailFade: bindControl("waterTrailFade", "input", (el) => ({ trailFade: Number(el.value) })),
    diffusion: bindControl("waterTrailDiffusion", "input", (el) => ({ diffusion: Number(el.value) })),
    currentDrag: bindControl("waterTrailCurrentDrag", "input", (el) => ({ currentDrag: Number(el.value) })),
    stampRadius: bindControl("waterTrailStampRadius", "input", (el) => ({ stampRadius: Number(el.value) })),
    spawnInheritRadius: bindControl("waterTrailSpawnInheritRadius", "input", (el) => ({ spawnInheritRadius: Number(el.value) })),
    spawnWarmupSec: bindControl("waterTrailWarmup", "input", (el) => ({ spawnWarmupSec: Number(el.value) })),
    channelPair: bindControl("waterTrailChannelPair", "change", (el) => ({ channelPair: el.value })),
    flipX: bindControl("waterTrailFlipXToggle", "change", (el) => ({ flipX: el.checked })),
    flipY: bindControl("waterTrailFlipYToggle", "change", (el) => ({ flipY: el.checked })),
    useMagnitude: bindControl("waterTrailUseMagnitudeToggle", "change", (el) => ({ useMagnitude: el.checked })),
    debug: bindControl("waterTrailDebugToggle", "change", (el) => ({ debug: el.checked })),
    tintColor: bindControl("waterTrailTintColor", "input", (el) => ({ tintColor: el.value })),
    glitterStrength: bindControl("waterGlitterStrength", "input", (el) => ({ glitterStrength: Number(el.value) })),
    glitterDensity: bindControl("waterGlitterDensity", "input", (el) => ({ glitterDensity: Number(el.value) })),
    glitterSpeed: bindControl("waterGlitterSpeed", "input", (el) => ({ glitterSpeed: Number(el.value) })),
    glitterSize: bindControl("waterGlitterSize", "input", (el) => ({ glitterSize: Number(el.value) })),
    glitterSharpness: bindControl("waterGlitterSharpness", "input", (el) => ({ glitterSharpness: Number(el.value) })),
    glitterWakeSuppression: bindControl("waterGlitterWakeSuppression", "input", (el) => ({ glitterWakeSuppression: Number(el.value) })),
  };

  function setText(id, text) {
    const element = deps.document.getElementById(id);
    if (element) element.textContent = text;
  }

  function setControlValue(control, value) {
    if (!control) return;
    const text = String(value);
    if (control.type === "range") {
      const num = Number(value);
      if (Number.isFinite(num)) {
        control.valueAsNumber = num;
      }
    }
    control.value = text;
    control.setAttribute("value", text);
  }

  function updateLabels() {
    setText("waterTrailParticleCountValue", String(settings.particleCount));
    setText("waterTrailSpeedValue", `${settings.speedPxPerSec.toFixed(0)} px/s`);
    setText("waterTrailSimSpeedValue", `${settings.simSpeed.toFixed(2)}x`);
    setText("waterTrailFlowInfluenceValue", settings.flowInfluence.toFixed(2));
    setText("waterTrailStrengthValue", settings.trailStrength.toFixed(2));
    setText("waterTrailAgentOpacityValue", settings.agentOpacity.toFixed(2));
    setText("waterTrailHeadroomValue", `${settings.trailHeadroom.toFixed(1)}x`);
    setText("waterTrailFadeValue", settings.trailFade.toFixed(3));
    setText("waterTrailDiffusionValue", settings.diffusion.toFixed(2));
    setText("waterTrailCurrentDragValue", settings.currentDrag.toFixed(2));
    setText("waterTrailSpawnInheritRadiusValue", `${Math.round(settings.spawnInheritRadius)} px`);
    setText("waterTrailWarmupValue", `${settings.spawnWarmupSec.toFixed(2)} s`);
    setText("waterTrailStampRadiusValue", `${settings.stampRadius.toFixed(1)} px`);
    setText("waterGlitterStrengthValue", settings.glitterStrength.toFixed(2));
    setText("waterGlitterDensityValue", settings.glitterDensity.toFixed(3));
    setText("waterGlitterSpeedValue", settings.glitterSpeed.toFixed(2));
    setText("waterGlitterSizeValue", `${settings.glitterSize} px`);
    setText("waterGlitterSharpnessValue", settings.glitterSharpness.toFixed(1));
    setText("waterGlitterWakeSuppressionValue", settings.glitterWakeSuppression.toFixed(2));
    updateStatsText();
  }

  function updateStats(activeParticles = lastStats.activeParticles) {
    lastStats = {
      enabled: settings.enabled,
      particles: particles.length,
      waterPixels: waterSpawnPixels.length,
      flowLoaded: Boolean(deps.getFlowImageData()),
      activeParticles,
      trailMax: lastDepositMax,
    };
    updateStatsText();
  }

  function updateStatsText() {
    setText(
      "waterTrailStats",
      `Trail stats: ${lastStats.enabled ? "on" : "off"}, GPU ${width}x${height}, particles ${lastStats.activeParticles}/${lastStats.particles}, water px ${lastStats.waterPixels}, flow ${lastStats.flowLoaded ? "loaded" : "missing"}, deposit max ${lastStats.trailMax}`,
    );
  }

  function syncControls() {
    if (controls.enabled) controls.enabled.checked = settings.enabled;
    setControlValue(controls.particleCount, settings.particleCount);
    setControlValue(controls.speedPxPerSec, settings.speedPxPerSec);
    setControlValue(controls.simSpeed, settings.simSpeed);
    setControlValue(controls.resolutionScale, settings.resolutionScale);
    setControlValue(controls.flowInfluence, settings.flowInfluence);
    setControlValue(controls.trailStrength, settings.trailStrength);
    setControlValue(controls.agentOpacity, settings.agentOpacity);
    setControlValue(controls.trailHeadroom, settings.trailHeadroom);
    setControlValue(controls.trailFade, settings.trailFade);
    setControlValue(controls.diffusion, settings.diffusion);
    setControlValue(controls.currentDrag, settings.currentDrag);
    setControlValue(controls.stampRadius, settings.stampRadius);
    setControlValue(controls.spawnInheritRadius, settings.spawnInheritRadius);
    setControlValue(controls.spawnWarmupSec, settings.spawnWarmupSec);
    setControlValue(controls.channelPair, settings.channelPair);
    if (controls.flipX) controls.flipX.checked = settings.flipX;
    if (controls.flipY) controls.flipY.checked = settings.flipY;
    if (controls.useMagnitude) controls.useMagnitude.checked = settings.useMagnitude;
    if (controls.debug) controls.debug.checked = settings.debug;
    setControlValue(controls.tintColor, settings.tintColor);
    setControlValue(controls.glitterStrength, settings.glitterStrength);
    setControlValue(controls.glitterDensity, settings.glitterDensity);
    setControlValue(controls.glitterSpeed, settings.glitterSpeed);
    setControlValue(controls.glitterSize, settings.glitterSize);
    setControlValue(controls.glitterSharpness, settings.glitterSharpness);
    setControlValue(controls.glitterWakeSuppression, settings.glitterWakeSuppression);
    updateLabels();
  }

  ensureTextureSize(1, 1);
  syncControls();

  return {
    applySettings,
    clear,
    getSettings,
    getUniformState,
    patchSettings,
    serializeSettings,
    syncControls,
    update,
  };
}
