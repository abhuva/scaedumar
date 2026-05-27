import { normalizeSlimeSettings } from "./slimeState.js";

const FULLSCREEN_VERT = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vec2 pos = POS[gl_VertexID];
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const AGENT_UPDATE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uAgents;
uniform sampler2D uTrail;
uniform sampler2D uHeight;
uniform sampler2D uSlope;
uniform sampler2D uWater;
uniform sampler2D uPlant;
uniform int uAgentCount;
uniform ivec2 uAgentTexSize;
uniform vec2 uSimSize;
uniform float uSensorDistance;
uniform float uSensorAngle;
uniform int uSensorSize;
uniform float uSensorNoise;
uniform float uStepSize;
uniform float uTurnAngle;
uniform float uWanderChance;
uniform float uWanderStrength;
uniform bool uUseTerrain;
uniform float uTerrainMix;
uniform float uSlopeBias;
uniform float uSlopeCutoff;
uniform float uHeightBias;
uniform float uHeightMin;
uniform float uHeightMax;
uniform float uHeightBandWeight;
uniform float uWaterBias;
uniform float uPlantBias;
uniform float uPlantFloor;
uniform bool uFleeActive;
uniform vec2 uFleeCenter;
uniform float uFleeWeight;
uniform float uFleeRadius;
uniform bool uWrapEdges;
uniform float uFrame;
in vec2 vUv;
out vec4 outState;

float hash(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p, p.yxz + 19.19);
  return fract((p.x + p.y) * p.z);
}

float fleeSensorScore(vec2 center) {
  if (!uFleeActive || uFleeRadius <= 0.0 || uFleeWeight <= 0.0) {
    return 0.0;
  }
  float dist = distance(center, uFleeCenter);
  if (dist >= uFleeRadius) {
    return 0.0;
  }
  float proximity = 1.0 - dist / uFleeRadius;
  return -proximity * proximity * uFleeWeight;
}

float sampleTrail(vec2 pos, float angle) {
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 center = pos + dir * uSensorDistance;
  float sum = 0.0;
  int radius = min(uSensorSize, 5);
  for (int y = -5; y <= 5; y++) {
    for (int x = -5; x <= 5; x++) {
      if (abs(x) <= radius && abs(y) <= radius) {
        vec2 p = center + vec2(float(x), float(y));
        vec2 uv = uWrapEdges ? fract(p / uSimSize) : clamp(p / uSimSize, vec2(0.0), vec2(1.0));
        sum += texture(uTrail, uv).r;
      }
    }
  }
  if (!uUseTerrain) {
    return sum + fleeSensorScore(center);
  }
  vec2 terrainUv = uWrapEdges ? fract(center / uSimSize) : clamp(center / uSimSize, vec2(0.0), vec2(1.0));
  float slope = texture(uSlope, terrainUv).r;
  float height = texture(uHeight, terrainUv).r;
  float water = texture(uWater, terrainUv).r;
  float plant = texture(uPlant, terrainUv).r;
  float minHeight = min(uHeightMin, uHeightMax);
  float maxHeight = max(uHeightMin, uHeightMax);
  float outsideBand = max(max(minHeight - height, height - maxHeight), 0.0);
  float plantPreference = plant - uPlantFloor;
  float terrainScore = -slope * uSlopeBias
    + height * uHeightBias
    - water * uWaterBias
    + plantPreference * uPlantBias
    - outsideBand * uHeightBandWeight;
  if (slope > uSlopeCutoff) {
    terrainScore -= 1000.0;
  }
  return sum + terrainScore * uTerrainMix + fleeSensorScore(center);
}

void main() {
  ivec2 pixel = ivec2(gl_FragCoord.xy);
  int index = pixel.y * uAgentTexSize.x + pixel.x;
  vec4 state = texelFetch(uAgents, pixel, 0);
  if (index >= uAgentCount) {
    outState = state;
    return;
  }

  vec2 pos = state.xy;
  float angle = state.z;
  float seed = state.w;
  float left = sampleTrail(pos, angle + uSensorAngle);
  float front = sampleTrail(pos, angle);
  float right = sampleTrail(pos, angle - uSensorAngle);
  float randomA = hash(vec3(pos * 0.013, seed + uFrame));
  float randomB = hash(vec3(pos.yx * 0.017, seed * 3.31 + uFrame));
  float randomC = hash(vec3(pos * 0.019 + 11.7, seed * 7.13 + uFrame));
  left += (randomA * 2.0 - 1.0) * uSensorNoise;
  front += (randomB * 2.0 - 1.0) * uSensorNoise;
  right += (randomC * 2.0 - 1.0) * uSensorNoise;
  float randomTurn = randomA < 0.5 ? -1.0 : 1.0;

  if (randomB < uWanderChance) {
    angle += (randomC * 2.0 - 1.0) * uWanderStrength;
  } else if (front > left && front > right) {
    angle += 0.0;
  } else if (left > right) {
    angle += uTurnAngle;
  } else if (right > left) {
    angle -= uTurnAngle;
  } else {
    angle += randomTurn * uTurnAngle;
  }

  float stepMultiplier = 1.0;
  if (uFleeActive && uFleeRadius > 0.0 && uFleeWeight > 0.0) {
    vec2 away = pos - uFleeCenter;
    float dist = length(away);
    if (dist < uFleeRadius) {
      if (dist < 0.001) {
        float fallbackAngle = angle + randomC * 6.2831853;
        away = vec2(cos(fallbackAngle), sin(fallbackAngle));
        dist = 1.0;
      }
      float proximity = 1.0 - dist / uFleeRadius;
      float force = proximity * proximity * uFleeWeight;
      float fleeAngle = atan(away.y, away.x);
      float delta = atan(sin(fleeAngle - angle), cos(fleeAngle - angle));
      float maxTurn = min(3.14159265, uTurnAngle + force * 0.03);
      angle += clamp(delta, -maxTurn, maxTurn);
      stepMultiplier += clamp(force * 0.02, 0.0, 4.0);
    }
  }

  vec2 prevPos = pos;
  pos += vec2(cos(angle), sin(angle)) * uStepSize * stepMultiplier;
  if (uWrapEdges) {
    pos = mod(pos + uSimSize, uSimSize);
  } else {
    if (pos.x < 0.0 || pos.x >= uSimSize.x) {
      angle = 3.14159265 - angle;
      pos.x = clamp(pos.x, 0.0, uSimSize.x - 1.0);
    }
    if (pos.y < 0.0 || pos.y >= uSimSize.y) {
      angle = -angle;
      pos.y = clamp(pos.y, 0.0, uSimSize.y - 1.0);
    }
  }
  if (uUseTerrain) {
    vec2 terrainUv = uWrapEdges ? fract(pos / uSimSize) : clamp(pos / uSimSize, vec2(0.0), vec2(1.0));
    if (texture(uSlope, terrainUv).r > uSlopeCutoff) {
      pos = prevPos;
      angle += 3.14159265 * (0.65 + randomC * 0.7);
    }
  }
  outState = vec4(pos, angle, seed);
}
`;

const DEPOSIT_VERT = `#version 300 es
precision highp float;
uniform sampler2D uAgents;
uniform int uAgentCount;
uniform ivec2 uAgentTexSize;
uniform vec2 uSimSize;
uniform float uDepositSize;
void main() {
  int index = gl_VertexID;
  int x = index - (index / uAgentTexSize.x) * uAgentTexSize.x;
  int y = index / uAgentTexSize.x;
  vec4 state = texelFetch(uAgents, ivec2(x, y), 0);
  vec2 uv = (state.xy + 0.5) / uSimSize;
  gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = uDepositSize;
}
`;

const DEPOSIT_FRAG = `#version 300 es
precision highp float;
uniform float uDepositAmount;
out vec4 outColor;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float mask = smoothstep(0.5, 0.0, length(d));
  outColor = vec4(uDepositAmount * mask, 0.0, 0.0, 1.0);
}
`;

const AGENT_BRUSH_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uAgents;
uniform int uAgentCount;
uniform ivec2 uAgentTexSize;
uniform vec2 uSimSize;
uniform vec2 uBrushCenter;
uniform float uBrushRadius;
uniform float uSeed;
uniform int uSpawnMode;
in vec2 vUv;
out vec4 outState;

float hash(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p, p.yxz + 19.19);
  return fract((p.x + p.y) * p.z);
}

vec2 sampleSpawn(float index) {
  float a = hash(vec3(index, uSeed, 1.31));
  float b = hash(vec3(index, uSeed, 2.71));
  float c = hash(vec3(index, uSeed, 5.43));
  float d = hash(vec3(index, uSeed, 9.17));
  vec2 center = uSimSize * 0.5;
  if (uSpawnMode == 1) {
    float angle = a * 6.2831853;
    float dist = sqrt(b) * min(uSimSize.x, uSimSize.y) * 0.18;
    return center + vec2(cos(angle), sin(angle)) * dist;
  }
  if (uSpawnMode == 2) {
    float angle = a * 6.2831853;
    float dist = min(uSimSize.x, uSimSize.y) * (0.24 + b * 0.08);
    return clamp(center + vec2(cos(angle), sin(angle)) * dist, vec2(0.0), uSimSize - vec2(1.0));
  }
  if (uSpawnMode == 3) {
    return vec2(uSimSize.x * (0.12 + a * 0.76), center.y + (b - 0.5) * uSimSize.y * 0.06);
  }
  if (uSpawnMode == 4) {
    int side = int(floor(a * 4.0));
    float t = b * (uSimSize.x - 1.0);
    float inset = c * min(uSimSize.x, uSimSize.y) * 0.04;
    if (side == 0) return vec2(t, inset);
    if (side == 1) return vec2(uSimSize.x - 1.0 - inset, b * (uSimSize.y - 1.0));
    if (side == 2) return vec2(t, uSimSize.y - 1.0 - inset);
    return vec2(inset, b * (uSimSize.y - 1.0));
  }
  return vec2(a * (uSimSize.x - 1.0), b * (uSimSize.y - 1.0));
}

void main() {
  ivec2 pixel = ivec2(gl_FragCoord.xy);
  int index = pixel.y * uAgentTexSize.x + pixel.x;
  vec4 state = texelFetch(uAgents, pixel, 0);
  if (index >= uAgentCount) {
    outState = state;
    return;
  }
  if (distance(state.xy, uBrushCenter) <= uBrushRadius) {
    float idx = float(index);
    vec2 pos = sampleSpawn(idx);
    float angle = hash(vec3(idx, uSeed, 13.7)) * 6.2831853;
    float seed = hash(vec3(idx, uSeed, 23.1));
    outState = vec4(pos, angle, seed);
    return;
  }
  outState = state;
}
`;

const TRAIL_BRUSH_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTrail;
uniform vec2 uSimSize;
uniform vec2 uBrushCenter;
uniform float uBrushRadius;
uniform float uClearStrength;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 trail = texture(uTrail, vUv);
  vec2 pos = vUv * uSimSize;
  float dist = distance(pos, uBrushCenter);
  float falloff = smoothstep(uBrushRadius, 0.0, dist);
  float keep = 1.0 - clamp(uClearStrength, 0.0, 1.0) * falloff;
  outColor = vec4(trail.r * keep, 0.0, 0.0, 1.0);
}
`;

const DIFFUSE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTrail;
uniform sampler2D uDeposit;
uniform vec2 uTexelSize;
uniform float uDiffusion;
uniform float uDecay;
in vec2 vUv;
out vec4 outColor;
void main() {
  float sum = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      sum += texture(uTrail, vUv + vec2(float(x), float(y)) * uTexelSize).r;
    }
  }
  float current = texture(uTrail, vUv).r;
  float blurred = sum / 9.0;
  float deposit = texture(uDeposit, vUv).r;
  float trail = mix(current, blurred, uDiffusion) * uDecay + deposit;
  outColor = vec4(trail, 0.0, 0.0, 1.0);
}
`;

const PLANT_STOCK_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPlantStock;
uniform sampler2D uPlantBase;
uniform sampler2D uTrail;
uniform float uEatAmount;
uniform float uRegenAmount;
uniform bool uDoEat;
uniform bool uDoRegen;
in vec2 vUv;
out vec4 outColor;
void main() {
  float stock = texture(uPlantStock, vUv).r;
  float base = texture(uPlantBase, vUv).r;
  if (uDoEat) {
    float trail = texture(uTrail, vUv).r;
    stock = max(0.0, stock - trail * uEatAmount);
  }
  if (uDoRegen) {
    stock = min(base, stock + uRegenAmount);
  }
  outColor = vec4(stock, stock, stock, 1.0);
}
`;

const TRAIL_AVAILABILITY_READBACK_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTrail;
uniform float uGain;
uniform float uGamma;
uniform float uThreshold;
in vec2 vUv;
out vec4 outColor;
void main() {
  float raw = max(0.0, texture(uTrail, vUv).r);
  float availability = 0.0;
  if (raw > uThreshold) {
    availability = pow(min(1.0, raw * max(0.001, uGain)), 1.0 / max(0.001, uGamma));
  }
  outColor = vec4(availability, availability, availability, 1.0);
}
`;

const PLANT_STOCK_FACTOR_READBACK_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPlantStock;
uniform sampler2D uPlantBase;
in vec2 vUv;
out vec4 outColor;
void main() {
  float stock = max(0.0, texture(uPlantStock, vUv).r);
  float base = max(0.0, texture(uPlantBase, vUv).r);
  float factor = base > 0.0001 ? clamp(stock / base, 0.0, 1.0) : 1.0;
  outColor = vec4(factor, factor, factor, 1.0);
}
`;

const DISPLAY_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTrail;
uniform sampler2D uHeight;
uniform sampler2D uSlope;
uniform sampler2D uWater;
uniform sampler2D uPlant;
uniform float uGain;
uniform float uGamma;
uniform int uPalette;
uniform bool uShowTerrainUnderlay;
in vec2 vUv;
out vec4 outColor;
vec3 palette(float v) {
  if (uPalette == 1) {
    return vec3(v * 0.22, pow(v, 0.8) * 0.72, v);
  }
  if (uPalette == 2) {
    return vec3(v);
  }
  if (uPalette == 3) {
    return vec3(v * 0.4, v, v * 0.18);
  }
  return vec3(pow(v, 1.45), v * 0.44, v * 0.08);
}
void main() {
  float trail = texture(uTrail, vUv).r;
  float v = pow(clamp(trail * uGain, 0.0, 1.0), 1.0 / max(uGamma, 0.001));
  vec3 color = palette(v);
  if (uShowTerrainUnderlay) {
    float height = texture(uHeight, vUv).r;
    float slope = texture(uSlope, vUv).r;
    float water = texture(uWater, vUv).r;
    float plant = texture(uPlant, vUv).r;
    vec3 terrain = vec3(height * 0.42 + slope * 0.28, height * 0.5 + plant * 0.5, height * 0.32 + water * 0.85);
    color = mix(terrain, color, clamp(v * 1.35, 0.28, 1.0));
  }
  outColor = vec4(color, 1.0);
}
`;

export function createSlimeGpuRuntime(deps) {
  const canvas = deps.canvas;
  const state = deps.state;
  const externalGl = deps.gl || null;
  const headless = deps.headless === true;
  let gl = externalGl;
  let extensionChecked = false;
  let settings = null;
  let frameId = null;
  let frameCounter = 0;
  let lastFpsTime = 0;
  let frameTicks = 0;
  let resources = null;
  let terrainRefs = null;
  let brushSeed = 1;
  let simulationTick = 0;
  let gameTickAccumulator = 0;
  let availabilityVersion = 0;
  const fleeState = {
    stepsRemaining: 0,
    centerX: 0,
    centerY: 0,
    weight: 0,
  };

  function start(rawSettings) {
    state.running = true;
    state.error = "";
    if (!tryEnsureInitialized(rawSettings)) return;
    if (!headless && settings.timeMode === "free") schedule();
  }

  function stop() {
    state.running = false;
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function reset(rawSettings) {
    stop();
    clearFleeState();
    disposeResources();
    if (!tryEnsureInitialized(rawSettings)) return false;
    renderDisplay();
    return true;
  }

  function brushResetAtClient(clientX, clientY, rawSettings) {
    if (!tryEnsureInitialized(rawSettings || settings)) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const u = (clientX - rect.left) / rect.width;
    const v = (clientY - rect.top) / rect.height;
    if (u < 0 || u > 1 || v < 0 || v > 1) return;
    const center = {
      x: u * settings.simSize,
      y: (1 - v) * settings.simSize,
    };
    brushSeed += 1;
    applyAgentBrush(center);
    applyTrailBrush(center);
    renderDisplay();
  }

  function applySettings(rawSettings) {
    const next = normalizeSlimeSettings(rawSettings, settings || rawSettings);
    const requiresReset = !settings
      || next.agentCount !== settings.agentCount
      || next.simSize !== settings.simSize
      || next.spawnMode !== settings.spawnMode
      || next.seed !== settings.seed;
    settings = next;
    if (requiresReset && state.initialized) {
      const wasRunning = state.running;
      if (reset(settings) && (settings.enabled || wasRunning)) start(settings);
      return;
    }
    if (state.initialized) renderDisplay();
    if (!headless && state.running && settings.timeMode === "free") {
      schedule();
    } else if (settings.timeMode === "gameTick" && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function tryEnsureInitialized(rawSettings) {
    try {
      ensureInitialized(rawSettings);
      return true;
    } catch (error) {
      state.running = false;
      state.error = error instanceof Error ? error.message : String(error);
      console.warn("Slime initialization failed.", error);
      return false;
    }
  }

  function ensureInitialized(rawSettings) {
    settings = normalizeSlimeSettings(rawSettings, settings || rawSettings);
    if (!gl) {
      gl = canvas.getContext("webgl2", {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      });
      if (!gl) throwRuntimeError("WebGL2 is not available.");
    }
    if (!extensionChecked) {
      if (!gl.getExtension("EXT_color_buffer_float")) {
        throwRuntimeError("EXT_color_buffer_float is required for GPU slime state.");
      }
      extensionChecked = true;
    }
    if (!resources) {
      resources = createResources(settings);
      state.initialized = true;
      state.capabilities = `${settings.simSize}x${settings.simSize}, ${settings.agentCount} agents, agentTex ${resources.agentTexSize}`;
    }
    syncTerrainTextures();
    resizeCanvas();
  }

  function schedule() {
    if (frameId !== null) return;
    frameId = requestAnimationFrame(tick);
  }

  function tick(nowMs) {
    frameId = null;
    if (!state.running) return;
    try {
      ensureInitialized(settings);
      resizeCanvas();
      for (let i = 0; i < settings.stepsPerFrame; i++) {
        step();
      }
      renderDisplay();
      markFrameAdvanced();
      frameTicks += 1;
      state.frame = frameCounter;
      if (!lastFpsTime) lastFpsTime = nowMs;
      const elapsed = nowMs - lastFpsTime;
      if (elapsed >= 500) {
        state.fps = frameTicks * 1000 / elapsed;
        frameTicks = 0;
        lastFpsTime = nowMs;
      }
      if (typeof deps.onFrame === "function") deps.onFrame();
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
      stop();
      if (typeof deps.onFrame === "function") deps.onFrame();
      return;
    }
    schedule();
  }

  function step() {
    updateAgents();
    simulationTick += 1;
    depositAgents();
    diffuseTrail();
    updatePlantStockFromTrail();
    if (fleeState.stepsRemaining > 0) {
      fleeState.stepsRemaining -= 1;
    }
  }

  function markFrameAdvanced() {
    frameCounter += 1;
    state.frame = frameCounter;
  }

  function stepGameTicks(ticks, rawSettings) {
    const safeTicks = Math.max(0, Math.round(Number(ticks) || 0));
    if (safeTicks <= 0) return 0;
    if (!tryEnsureInitialized(rawSettings || settings)) return 0;
    const gameTicksPerStep = Math.max(1, Math.round(Number(settings.gameTicksPerSlimeStep) || 1));
    gameTickAccumulator += safeTicks;
    const elapsedIntervals = Math.floor(gameTickAccumulator / gameTicksPerStep);
    if (elapsedIntervals <= 0) return 0;
    gameTickAccumulator -= elapsedIntervals * gameTicksPerStep;
    const requestedSteps = elapsedIntervals * Math.max(1, Math.round(Number(settings.stepsPerGameTick) || 1));
    const maxSteps = Math.max(1, Math.round(Number(settings.maxGameStepsPerFrame) || 1));
    const steps = Math.min(requestedSteps, maxSteps);
    if (steps <= 0) {
      renderDisplay();
      return 0;
    }
    for (let i = 0; i < steps; i++) {
      step();
    }
    renderDisplay();
    markFrameAdvanced();
    if (typeof deps.onFrame === "function") deps.onFrame();
    return steps;
  }

  function warmupSteps(stepCount, rawSettings) {
    const steps = Math.max(0, Math.round(Number(stepCount) || 0));
    if (steps <= 0) return 0;
    if (!tryEnsureInitialized(rawSettings || settings)) return 0;
    for (let i = 0; i < steps; i++) {
      step();
    }
    renderDisplay();
    markFrameAdvanced();
    if (typeof deps.onFrame === "function") deps.onFrame();
    return steps;
  }

  function updatePlantStockFromTrail() {
    if (
      !resources
      || !resources.hasTerrain
      || (!shouldEatPlantsThisTick() && !shouldRegeneratePlantsThisTick())
    ) {
      return;
    }
    const r = resources;
    gl.useProgram(r.plantStockProgram.program);
    bindFramebuffer(r.plantStockFramebuffers[1 - r.plantStockIndex], r.plantMapWidth, r.plantMapHeight);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.plantStockTextures[r.plantStockIndex]);
    gl.uniform1i(r.plantStockProgram.uPlantStock, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, r.plantBaseTexture);
    gl.uniform1i(r.plantStockProgram.uPlantBase, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, r.trailTextures[r.trailIndex]);
    gl.uniform1i(r.plantStockProgram.uTrail, 2);
    gl.uniform1f(r.plantStockProgram.uEatAmount, settings.plantEatAmount / 255);
    gl.uniform1f(r.plantStockProgram.uRegenAmount, settings.plantRegenAmount / 255);
    gl.uniform1i(r.plantStockProgram.uDoEat, shouldEatPlantsThisTick() ? 1 : 0);
    gl.uniform1i(r.plantStockProgram.uDoRegen, shouldRegeneratePlantsThisTick() ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    r.plantStockIndex = 1 - r.plantStockIndex;
  }

  function shouldEatPlantsThisTick() {
    return settings.plantEatAmount > 0
      && simulationTick % Math.max(1, Math.round(settings.plantEatTickInterval)) === 0;
  }

  function shouldRegeneratePlantsThisTick() {
    return settings.plantRegenAmount > 0
      && simulationTick % Math.max(1, Math.round(settings.plantRegenTickInterval)) === 0;
  }

  function updateAgents() {
    const r = resources;
    gl.useProgram(r.agentProgram.program);
    bindFramebuffer(r.agentFramebuffers[1 - r.agentIndex], r.agentTexSize, r.agentTexSize);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.agentTextures[r.agentIndex]);
    gl.uniform1i(r.agentProgram.uAgents, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, r.trailTextures[r.trailIndex]);
    gl.uniform1i(r.agentProgram.uTrail, 1);
    bindTerrainUniforms(r.agentProgram, 2);
    gl.uniform1i(r.agentProgram.uAgentCount, settings.agentCount);
    gl.uniform2i(r.agentProgram.uAgentTexSize, r.agentTexSize, r.agentTexSize);
    gl.uniform2f(r.agentProgram.uSimSize, settings.simSize, settings.simSize);
    gl.uniform1f(r.agentProgram.uSensorDistance, settings.sensorDistance);
    gl.uniform1f(r.agentProgram.uSensorAngle, settings.sensorAngleDeg * Math.PI / 180);
    gl.uniform1i(r.agentProgram.uSensorSize, settings.sensorSize);
    gl.uniform1f(r.agentProgram.uSensorNoise, settings.sensorNoise);
    gl.uniform1f(r.agentProgram.uStepSize, settings.stepSize);
    gl.uniform1f(r.agentProgram.uTurnAngle, settings.turnAngleDeg * Math.PI / 180);
    gl.uniform1f(r.agentProgram.uWanderChance, settings.wanderChance);
    gl.uniform1f(r.agentProgram.uWanderStrength, settings.wanderStrengthDeg * Math.PI / 180);
    gl.uniform1i(r.agentProgram.uUseTerrain, settings.useTerrain && hasTerrainTextures() ? 1 : 0);
    gl.uniform1f(r.agentProgram.uTerrainMix, settings.terrainMix);
    gl.uniform1f(r.agentProgram.uSlopeBias, settings.slopeBias);
    gl.uniform1f(r.agentProgram.uSlopeCutoff, settings.slopeCutoff);
    gl.uniform1f(r.agentProgram.uHeightBias, settings.heightBias);
    gl.uniform1f(r.agentProgram.uHeightMin, settings.heightMin);
    gl.uniform1f(r.agentProgram.uHeightMax, settings.heightMax);
    gl.uniform1f(r.agentProgram.uHeightBandWeight, settings.heightBandWeight);
    gl.uniform1f(r.agentProgram.uWaterBias, settings.waterBias);
    gl.uniform1f(r.agentProgram.uPlantBias, settings.plantBias);
    gl.uniform1f(r.agentProgram.uPlantFloor, settings.plantFloor);
    gl.uniform1i(r.agentProgram.uFleeActive, fleeState.stepsRemaining > 0 && fleeState.weight > 0 ? 1 : 0);
    gl.uniform2f(r.agentProgram.uFleeCenter, fleeState.centerX, fleeState.centerY);
    gl.uniform1f(r.agentProgram.uFleeWeight, fleeState.weight);
    gl.uniform1f(r.agentProgram.uFleeRadius, settings.huntingFleeRadius);
    gl.uniform1i(r.agentProgram.uWrapEdges, settings.wrapEdges ? 1 : 0);
    gl.uniform1f(r.agentProgram.uFrame, frameCounter);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    r.agentIndex = 1 - r.agentIndex;
  }

  function depositAgents() {
    const r = resources;
    bindFramebuffer(r.depositFramebuffer, settings.simSize, settings.simSize);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(r.depositProgram.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.agentTextures[r.agentIndex]);
    gl.uniform1i(r.depositProgram.uAgents, 0);
    gl.uniform1i(r.depositProgram.uAgentCount, settings.agentCount);
    gl.uniform2i(r.depositProgram.uAgentTexSize, r.agentTexSize, r.agentTexSize);
    gl.uniform2f(r.depositProgram.uSimSize, settings.simSize, settings.simSize);
    gl.uniform1f(r.depositProgram.uDepositSize, settings.depositSize);
    gl.uniform1f(r.depositProgram.uDepositAmount, settings.depositAmount);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, settings.agentCount);
    gl.disable(gl.BLEND);
  }

  function diffuseTrail() {
    const r = resources;
    gl.useProgram(r.diffuseProgram.program);
    bindFramebuffer(r.trailFramebuffers[1 - r.trailIndex], settings.simSize, settings.simSize);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.trailTextures[r.trailIndex]);
    gl.uniform1i(r.diffuseProgram.uTrail, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, r.depositTexture);
    gl.uniform1i(r.diffuseProgram.uDeposit, 1);
    gl.uniform2f(r.diffuseProgram.uTexelSize, 1 / settings.simSize, 1 / settings.simSize);
    gl.uniform1f(r.diffuseProgram.uDiffusion, settings.diffusion);
    gl.uniform1f(r.diffuseProgram.uDecay, settings.decay);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    r.trailIndex = 1 - r.trailIndex;
  }

  function applyAgentBrush(center) {
    const r = resources;
    gl.useProgram(r.agentBrushProgram.program);
    bindFramebuffer(r.agentFramebuffers[1 - r.agentIndex], r.agentTexSize, r.agentTexSize);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.agentTextures[r.agentIndex]);
    gl.uniform1i(r.agentBrushProgram.uAgents, 0);
    gl.uniform1i(r.agentBrushProgram.uAgentCount, settings.agentCount);
    gl.uniform2i(r.agentBrushProgram.uAgentTexSize, r.agentTexSize, r.agentTexSize);
    gl.uniform2f(r.agentBrushProgram.uSimSize, settings.simSize, settings.simSize);
    gl.uniform2f(r.agentBrushProgram.uBrushCenter, center.x, center.y);
    gl.uniform1f(r.agentBrushProgram.uBrushRadius, settings.brushRadius);
    gl.uniform1f(r.agentBrushProgram.uSeed, brushSeed + settings.seed);
    gl.uniform1i(r.agentBrushProgram.uSpawnMode, spawnModeIndex(settings.spawnMode));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    r.agentIndex = 1 - r.agentIndex;
  }

  function applyTrailBrush(center) {
    if (settings.brushTrailClear <= 0) return;
    const r = resources;
    gl.useProgram(r.trailBrushProgram.program);
    bindFramebuffer(r.trailFramebuffers[1 - r.trailIndex], settings.simSize, settings.simSize);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.trailTextures[r.trailIndex]);
    gl.uniform1i(r.trailBrushProgram.uTrail, 0);
    gl.uniform2f(r.trailBrushProgram.uSimSize, settings.simSize, settings.simSize);
    gl.uniform2f(r.trailBrushProgram.uBrushCenter, center.x, center.y);
    gl.uniform1f(r.trailBrushProgram.uBrushRadius, settings.brushRadius);
    gl.uniform1f(r.trailBrushProgram.uClearStrength, settings.brushTrailClear);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    r.trailIndex = 1 - r.trailIndex;
  }

  function brushResetAtMapPixel(pixelX, pixelY, mapWidth, mapHeight, options = {}) {
    if (!tryEnsureInitialized(settings)) return false;
    const width = Math.max(1, Number(mapWidth) || 1);
    const height = Math.max(1, Number(mapHeight) || 1);
    const previousRadius = settings.brushRadius;
    const previousClear = settings.brushTrailClear;
    if (Number.isFinite(Number(options.radius))) {
      settings.brushRadius = Math.max(1, Number(options.radius));
    }
    if (Number.isFinite(Number(options.trailClear))) {
      settings.brushTrailClear = Math.max(0, Math.min(1, Number(options.trailClear)));
    }
    const center = {
      x: Math.max(0, Math.min(settings.simSize - 1, (Number(pixelX) || 0) / width * settings.simSize)),
      y: Math.max(0, Math.min(settings.simSize - 1, (1 - (Number(pixelY) || 0) / height) * settings.simSize)),
    };
    brushSeed += 1;
    applyAgentBrush(center);
    applyTrailBrush(center);
    settings.brushRadius = previousRadius;
    settings.brushTrailClear = previousClear;
    renderDisplay();
    return true;
  }

  function activateFleeAtMapPixel(pixelX, pixelY, mapWidth, mapHeight, options = {}) {
    if (!tryEnsureInitialized(settings)) return false;
    const center = mapPixelToSimPoint(pixelX, pixelY, mapWidth, mapHeight);
    fleeState.centerX = center.x;
    fleeState.centerY = center.y;
    fleeState.stepsRemaining = Math.max(0, Math.round(Number(options.steps) || 0));
    fleeState.weight = Math.max(0, Number(options.weight) || 0);
    return fleeState.stepsRemaining > 0 && fleeState.weight > 0;
  }

  function clearFleeState() {
    fleeState.stepsRemaining = 0;
    fleeState.centerX = 0;
    fleeState.centerY = 0;
    fleeState.weight = 0;
  }

  function huntAgentsAtMapPixel(pixelX, pixelY, mapWidth, mapHeight, options = {}) {
    if (!tryEnsureInitialized(settings)) return { available: 0, killed: 0 };
    const r = resources;
    const width = Math.max(1, Number(mapWidth) || 1);
    const height = Math.max(1, Number(mapHeight) || 1);
    const radius = Math.max(0, Number(options.radius) || 0);
    const maxKills = Math.max(0, Math.round(Number(options.maxKills) || 0));
    if (radius <= 0 || maxKills <= 0) return { available: 0, killed: 0 };
    const targetX = Number(pixelX) || 0;
    const targetY = Number(pixelY) || 0;
    const radiusSq = radius * radius;
    const data = new Float32Array(r.agentTexSize * r.agentTexSize * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, r.agentFramebuffers[r.agentIndex]);
    gl.readPixels(0, 0, r.agentTexSize, r.agentTexSize, gl.RGBA, gl.FLOAT, data);
    const candidates = [];
    for (let i = 0; i < settings.agentCount; i++) {
      const offset = i * 4;
      const mapX = data[offset] / settings.simSize * width;
      const mapY = (1 - data[offset + 1] / settings.simSize) * height;
      const dx = mapX - targetX;
      const dy = mapY - targetY;
      const distSq = dx * dx + dy * dy;
      if (distSq <= radiusSq) {
        candidates.push({ index: i, distSq });
      }
    }
    candidates.sort((a, b) => a.distSq - b.distSq);
    const killed = Math.min(maxKills, candidates.length);
    brushSeed += 1;
    for (let i = 0; i < killed; i++) {
      respawnAgentOutsideCircle(data, candidates[i].index, targetX, targetY, width, height, radiusSq);
    }
    if (killed > 0) {
      gl.bindTexture(gl.TEXTURE_2D, r.agentTextures[r.agentIndex]);
      for (let i = 0; i < killed; i++) {
        const agentIndex = candidates[i].index;
        const offset = agentIndex * 4;
        const texX = agentIndex % r.agentTexSize;
        const texY = Math.floor(agentIndex / r.agentTexSize);
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          texX,
          texY,
          1,
          1,
          gl.RGBA,
          gl.FLOAT,
          data.subarray(offset, offset + 4),
        );
      }
      renderDisplay();
    }
    return { available: candidates.length, killed };
  }

  function mapPixelToSimPoint(pixelX, pixelY, mapWidth, mapHeight) {
    const width = Math.max(1, Number(mapWidth) || 1);
    const height = Math.max(1, Number(mapHeight) || 1);
    return {
      x: Math.max(0, Math.min(settings.simSize - 1, (Number(pixelX) || 0) / width * settings.simSize)),
      y: Math.max(0, Math.min(settings.simSize - 1, (1 - (Number(pixelY) || 0) / height) * settings.simSize)),
    };
  }

  function respawnAgentOutsideCircle(data, agentIndex, targetX, targetY, mapWidth, mapHeight, radiusSq) {
    let seed = ((settings.seed + 1) * 2654435761 + (brushSeed + 17) * 1013904223 + agentIndex * 374761393) >>> 0;
    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    const center = settings.simSize * 0.5;
    const spawnRadius = settings.simSize * 0.18;
    let position = null;
    for (let attempt = 0; attempt < 32; attempt++) {
      const candidate = sampleSpawnPosition(settings, rand, center, spawnRadius);
      const mapX = candidate.x / settings.simSize * mapWidth;
      const mapY = (1 - candidate.y / settings.simSize) * mapHeight;
      const dx = mapX - targetX;
      const dy = mapY - targetY;
      if (dx * dx + dy * dy > radiusSq) {
        position = candidate;
        break;
      }
    }
    if (!position) {
      position = {
        x: targetX < mapWidth * 0.5 ? settings.simSize - 1 : 0,
        y: targetY < mapHeight * 0.5 ? 0 : settings.simSize - 1,
      };
    }
    const offset = agentIndex * 4;
    data[offset] = position.x;
    data[offset + 1] = position.y;
    data[offset + 2] = rand() * Math.PI * 2;
    data[offset + 3] = rand();
  }

  function readTrailAvailabilityGrid(options = {}) {
    if (!tryEnsureInitialized(settings)) {
      return null;
    }
    const r = resources;
    const gridSize = Math.max(1, Math.round(Number(options.gridSize ?? settings.availabilityGridSize) || settings.availabilityGridSize));
    const effectiveMax = Math.max(0.0001, Number(options.effectiveMax ?? settings.availabilityEffectiveMax) || settings.availabilityEffectiveMax);
    const gain = Math.max(0.001, Number(options.gain ?? settings.trailGain) || 1);
    const gamma = Math.max(0.001, Number(options.gamma ?? settings.trailGamma) || 1);
    const threshold = Math.max(0, Number(options.threshold ?? 0) || 0);
    ensureReadbackTarget(gridSize, gridSize);
    gl.useProgram(r.trailAvailabilityReadbackProgram.program);
    bindFramebuffer(r.readbackFramebuffer, gridSize, gridSize);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.trailTextures[r.trailIndex]);
    gl.uniform1i(r.trailAvailabilityReadbackProgram.uTrail, 0);
    gl.uniform1f(r.trailAvailabilityReadbackProgram.uGain, gain);
    gl.uniform1f(r.trailAvailabilityReadbackProgram.uGamma, gamma);
    gl.uniform1f(r.trailAvailabilityReadbackProgram.uThreshold, threshold);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const raw = new Uint8Array(gridSize * gridSize * 4);
    gl.readPixels(0, 0, gridSize, gridSize, gl.RGBA, gl.UNSIGNED_BYTE, raw);
    const data = new Float32Array(gridSize * gridSize);
    const rawData = new Float32Array(gridSize * gridSize);
    for (let y = 0; y < gridSize; y++) {
      const targetY = gridSize - y - 1;
      for (let x = 0; x < gridSize; x++) {
        const sourceIndex = (y * gridSize + x) * 4;
        const targetIndex = targetY * gridSize + x;
        const availability = raw[sourceIndex] / 255;
        data[targetIndex] = availability;
        rawData[targetIndex] = availability * effectiveMax;
      }
    }
    availabilityVersion += 1;
    return { width: gridSize, height: gridSize, data, rawData, version: availabilityVersion, effectiveMax };
  }

  function readPlantStockFactorImageData(options = {}) {
    if (!tryEnsureInitialized(settings) || !resources || !resources.hasTerrain) {
      return null;
    }
    const r = resources;
    const width = Math.max(1, Math.round(Number(options.width) || r.plantMapWidth || 1));
    const height = Math.max(1, Math.round(Number(options.height) || r.plantMapHeight || 1));
    ensureReadbackTarget(width, height);
    gl.useProgram(r.plantStockFactorReadbackProgram.program);
    bindFramebuffer(r.readbackFramebuffer, width, height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.plantStockTextures[r.plantStockIndex]);
    gl.uniform1i(r.plantStockFactorReadbackProgram.uPlantStock, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, r.plantBaseTexture);
    gl.uniform1i(r.plantStockFactorReadbackProgram.uPlantBase, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const raw = new Uint8Array(width * height * 4);
    const data = new Uint8ClampedArray(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, raw);
    for (let y = 0; y < height; y++) {
      const targetY = height - y - 1;
      const sourceRow = y * width * 4;
      const targetRow = targetY * width * 4;
      data.set(raw.subarray(sourceRow, sourceRow + width * 4), targetRow);
    }
    return { width, height, data };
  }

  function renderDisplay() {
    if (!gl || !resources || headless) return;
    resizeCanvas();
    const r = resources;
    gl.useProgram(r.displayProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.trailTextures[r.trailIndex]);
    gl.uniform1i(r.displayProgram.uTrail, 0);
    bindTerrainUniforms(r.displayProgram, 1);
    gl.uniform1f(r.displayProgram.uGain, settings.trailGain);
    gl.uniform1f(r.displayProgram.uGamma, settings.trailGamma);
    gl.uniform1i(r.displayProgram.uPalette, paletteIndex(settings.palette));
    gl.uniform1i(r.displayProgram.uShowTerrainUnderlay, settings.showTerrainUnderlay && hasTerrainTextures() ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function createResources(config) {
    const agentTexSize = Math.ceil(Math.sqrt(config.agentCount));
    const agentData = createAgentData(config, agentTexSize);
    const agentTextures = [
      createFloatTexture(agentTexSize, agentTexSize, agentData),
      createFloatTexture(agentTexSize, agentTexSize, null),
    ];
    const trailTextures = [
      createFloatTexture(config.simSize, config.simSize, null),
      createFloatTexture(config.simSize, config.simSize, null),
    ];
    const depositTexture = createFloatTexture(config.simSize, config.simSize, null);
    const nextResources = {
      agentTexSize,
      agentTextures,
      trailTextures,
      depositTexture,
      agentFramebuffers: agentTextures.map((texture) => createFramebuffer(texture)),
      trailFramebuffers: trailTextures.map((texture) => createFramebuffer(texture)),
      depositFramebuffer: createFramebuffer(depositTexture),
      heightTexture: createByteTexture(1, 1, new Uint8Array([0, 0, 0, 255])),
      slopeTexture: createByteTexture(1, 1, new Uint8Array([0, 0, 0, 255])),
      waterTexture: createByteTexture(1, 1, new Uint8Array([0, 0, 0, 255])),
      plantBaseTexture: createByteTexture(1, 1, new Uint8Array([0, 0, 0, 255])),
      plantStockTextures: [
        createByteTexture(1, 1, new Uint8Array([0, 0, 0, 255])),
        createByteTexture(1, 1, new Uint8Array([0, 0, 0, 255])),
      ],
      plantStockFramebuffers: [],
      plantStockIndex: 0,
      plantMapWidth: 1,
      plantMapHeight: 1,
      plantStockInitialized: false,
      readbackTexture: null,
      readbackFramebuffer: null,
      readbackWidth: 0,
      readbackHeight: 0,
      hasTerrain: false,
      agentIndex: 0,
      trailIndex: 0,
      agentProgram: createProgramInfo(FULLSCREEN_VERT, AGENT_UPDATE_FRAG, [
        "uAgents", "uTrail", "uHeight", "uSlope", "uWater", "uPlant", "uAgentCount", "uAgentTexSize", "uSimSize", "uSensorDistance", "uSensorAngle",
        "uSensorSize", "uSensorNoise", "uStepSize", "uTurnAngle", "uWanderChance", "uWanderStrength",
        "uUseTerrain", "uTerrainMix", "uSlopeBias", "uSlopeCutoff", "uHeightBias", "uHeightMin", "uHeightMax",
        "uHeightBandWeight", "uWaterBias", "uPlantBias", "uPlantFloor", "uFleeActive", "uFleeCenter", "uFleeWeight", "uFleeRadius", "uWrapEdges", "uFrame",
      ]),
      depositProgram: createProgramInfo(DEPOSIT_VERT, DEPOSIT_FRAG, [
        "uAgents", "uAgentCount", "uAgentTexSize", "uSimSize", "uDepositSize", "uDepositAmount",
      ]),
      agentBrushProgram: createProgramInfo(FULLSCREEN_VERT, AGENT_BRUSH_FRAG, [
        "uAgents", "uAgentCount", "uAgentTexSize", "uSimSize", "uBrushCenter", "uBrushRadius", "uSeed", "uSpawnMode",
      ]),
      trailBrushProgram: createProgramInfo(FULLSCREEN_VERT, TRAIL_BRUSH_FRAG, [
        "uTrail", "uSimSize", "uBrushCenter", "uBrushRadius", "uClearStrength",
      ]),
      diffuseProgram: createProgramInfo(FULLSCREEN_VERT, DIFFUSE_FRAG, [
        "uTrail", "uDeposit", "uTexelSize", "uDiffusion", "uDecay",
      ]),
      plantStockProgram: createProgramInfo(FULLSCREEN_VERT, PLANT_STOCK_FRAG, [
        "uPlantStock", "uPlantBase", "uTrail", "uEatAmount", "uRegenAmount", "uDoEat", "uDoRegen",
      ]),
      trailAvailabilityReadbackProgram: createProgramInfo(FULLSCREEN_VERT, TRAIL_AVAILABILITY_READBACK_FRAG, [
        "uTrail", "uGain", "uGamma", "uThreshold",
      ]),
      plantStockFactorReadbackProgram: createProgramInfo(FULLSCREEN_VERT, PLANT_STOCK_FACTOR_READBACK_FRAG, [
        "uPlantStock", "uPlantBase",
      ]),
      displayProgram: createProgramInfo(FULLSCREEN_VERT, DISPLAY_FRAG, [
        "uTrail", "uHeight", "uSlope", "uWater", "uPlant", "uGain", "uGamma", "uPalette", "uShowTerrainUnderlay",
      ]),
    };
    nextResources.plantStockFramebuffers = nextResources.plantStockTextures.map((texture) => createFramebuffer(texture));
    return nextResources;
  }

  function createAgentData(config, texSize) {
    const data = new Float32Array(texSize * texSize * 4);
    let seed = Math.max(1, config.seed);
    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    const center = config.simSize * 0.5;
    const radius = config.simSize * 0.18;
    for (let i = 0; i < config.agentCount; i++) {
      const position = sampleSpawnPosition(config, rand, center, radius);
      const offset = i * 4;
      data[offset] = position.x;
      data[offset + 1] = position.y;
      data[offset + 2] = rand() * Math.PI * 2;
      data[offset + 3] = rand();
    }
    return data;
  }

  function sampleSpawnPosition(config, rand, center, radius) {
    const size = config.simSize;
    if (config.spawnMode === "disk") {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * radius;
      return {
        x: center + Math.cos(angle) * dist,
        y: center + Math.sin(angle) * dist,
      };
    }
    if (config.spawnMode === "ring") {
      const angle = rand() * Math.PI * 2;
      const dist = size * (0.24 + rand() * 0.08);
      const x = center + Math.cos(angle) * dist;
      const y = center + Math.sin(angle) * dist;
      return {
        x: Math.max(0, Math.min(size - 1, x)),
        y: Math.max(0, Math.min(size - 1, y)),
      };
    }
    if (config.spawnMode === "line") {
      return {
        x: size * (0.12 + rand() * 0.76),
        y: center + (rand() - 0.5) * size * 0.06,
      };
    }
    if (config.spawnMode === "edge") {
      const side = Math.floor(rand() * 4);
      const t = rand() * (size - 1);
      const inset = rand() * size * 0.04;
      if (side === 0) return { x: t, y: inset };
      if (side === 1) return { x: size - 1 - inset, y: t };
      if (side === 2) return { x: t, y: size - 1 - inset };
      return { x: inset, y: t };
    }
    return {
      x: rand() * (size - 1),
      y: rand() * (size - 1),
    };
  }

  function createFloatTexture(width, height, data) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, data);
    return texture;
  }

  function createByteTexture(width, height, data) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return texture;
  }

  function syncTerrainTextures() {
    if (!resources || typeof deps.getTerrainSource !== "function") return;
    const source = deps.getTerrainSource() || {};
    const nextRefs = {
      height: source.heightImageData || null,
      slope: source.slopeImageData || null,
      water: source.waterImageData || null,
      plantBase: source.plantBaseImageData || source.plantImageData || null,
      plantStock: source.plantStockImageData || source.plantImageData || null,
    };
    if (
      terrainRefs
      && terrainRefs.height === nextRefs.height
      && terrainRefs.slope === nextRefs.slope
      && terrainRefs.water === nextRefs.water
      && terrainRefs.plantBase === nextRefs.plantBase
      && terrainRefs.plantStock === nextRefs.plantStock
    ) {
      return;
    }
    terrainRefs = nextRefs;
    resources.hasTerrain = Boolean(
      nextRefs.height && nextRefs.height.data
      && nextRefs.slope && nextRefs.slope.data
      && nextRefs.water && nextRefs.water.data,
    );
    if (!resources.hasTerrain) {
      state.capabilities = `${settings.simSize}x${settings.simSize}, ${settings.agentCount} agents, no terrain bound`;
      return;
    }
    uploadImageDataToTexture(resources.heightTexture, nextRefs.height);
    uploadImageDataToTexture(resources.slopeTexture, nextRefs.slope);
    uploadImageDataToTexture(resources.waterTexture, nextRefs.water);
    if (nextRefs.plantBase && nextRefs.plantBase.data) {
      const stockImageData = nextRefs.plantStock && nextRefs.plantStock.data ? nextRefs.plantStock : nextRefs.plantBase;
      const plantWidth = Math.max(1, Math.round(Number(nextRefs.plantBase.width) || 1));
      const plantHeight = Math.max(1, Math.round(Number(nextRefs.plantBase.height) || 1));
      const shouldResetMutablePlantStock = !resources.plantStockInitialized
        || resources.plantMapWidth !== plantWidth
        || resources.plantMapHeight !== plantHeight;
      uploadImageDataToTexture(resources.plantBaseTexture, nextRefs.plantBase);
      if (shouldResetMutablePlantStock) {
        uploadImageDataToTexture(resources.plantStockTextures[0], stockImageData);
        uploadImageDataToTexture(resources.plantStockTextures[1], stockImageData);
        resources.plantStockIndex = 0;
        resources.plantStockInitialized = true;
      }
      resources.plantMapWidth = plantWidth;
      resources.plantMapHeight = plantHeight;
    } else {
      const emptyPlant = { width: 1, height: 1, data: new Uint8Array([0, 0, 0, 255]) };
      uploadImageDataToTexture(resources.plantBaseTexture, emptyPlant);
      uploadImageDataToTexture(resources.plantStockTextures[0], emptyPlant);
      uploadImageDataToTexture(resources.plantStockTextures[1], emptyPlant);
      resources.plantStockIndex = 0;
      resources.plantStockInitialized = false;
      resources.plantMapWidth = nextRefs.height.width;
      resources.plantMapHeight = nextRefs.height.height;
    }
    const plantStatus = nextRefs.plantBase && nextRefs.plantBase.data ? ", plants bound" : ", no plants bound";
    state.capabilities = `${settings.simSize}x${settings.simSize}, ${settings.agentCount} agents, terrain ${nextRefs.height.width}x${nextRefs.height.height}${plantStatus}`;
  }

  function uploadImageDataToTexture(texture, imageData) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      imageData.width,
      imageData.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      flipTopLeftRowsForTexture(imageData),
    );
  }

  function flipTopLeftRowsForTexture(imageData) {
    const width = Math.max(1, Math.round(Number(imageData && imageData.width) || 1));
    const height = Math.max(1, Math.round(Number(imageData && imageData.height) || 1));
    const source = imageData && imageData.data;
    if (!source || height <= 1) return source;
    const rowSize = width * 4;
    const flipped = new Uint8Array(rowSize * height);
    for (let y = 0; y < height; y++) {
      const sourceRow = y * rowSize;
      const targetRow = (height - y - 1) * rowSize;
      flipped.set(source.subarray(sourceRow, sourceRow + rowSize), targetRow);
    }
    return flipped;
  }

  function ensureReadbackTarget(width, height) {
    if (!resources) return;
    const safeWidth = Math.max(1, Math.round(Number(width) || 1));
    const safeHeight = Math.max(1, Math.round(Number(height) || 1));
    if (resources.readbackTexture && resources.readbackWidth === safeWidth && resources.readbackHeight === safeHeight) {
      return;
    }
    if (resources.readbackFramebuffer) {
      gl.deleteFramebuffer(resources.readbackFramebuffer);
      resources.readbackFramebuffer = null;
    }
    if (resources.readbackTexture) {
      gl.deleteTexture(resources.readbackTexture);
      resources.readbackTexture = null;
    }
    resources.readbackTexture = createByteTexture(safeWidth, safeHeight, null);
    resources.readbackFramebuffer = createFramebuffer(resources.readbackTexture);
    resources.readbackWidth = safeWidth;
    resources.readbackHeight = safeHeight;
  }

  function bindTerrainUniforms(programInfo, firstUnit) {
    gl.activeTexture(gl.TEXTURE0 + firstUnit);
    gl.bindTexture(gl.TEXTURE_2D, resources.heightTexture);
    gl.uniform1i(programInfo.uHeight, firstUnit);
    gl.activeTexture(gl.TEXTURE0 + firstUnit + 1);
    gl.bindTexture(gl.TEXTURE_2D, resources.slopeTexture);
    gl.uniform1i(programInfo.uSlope, firstUnit + 1);
    gl.activeTexture(gl.TEXTURE0 + firstUnit + 2);
    gl.bindTexture(gl.TEXTURE_2D, resources.waterTexture);
    gl.uniform1i(programInfo.uWater, firstUnit + 2);
    gl.activeTexture(gl.TEXTURE0 + firstUnit + 3);
    gl.bindTexture(gl.TEXTURE_2D, resources.plantStockTextures[resources.plantStockIndex]);
    gl.uniform1i(programInfo.uPlant, firstUnit + 3);
  }

  function hasTerrainTextures() {
    return Boolean(resources && resources.hasTerrain);
  }

  function createFramebuffer(texture) {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throwRuntimeError(`Incomplete slime framebuffer: ${status}`);
    }
    return framebuffer;
  }

  function bindFramebuffer(framebuffer, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, width, height);
  }

  function createProgramInfo(vertexSource, fragmentSource, uniformNames) {
    const program = createProgram(vertexSource, fragmentSource);
    const info = { program };
    for (const name of uniformNames) {
      info[name] = gl.getUniformLocation(program, name);
    }
    return info;
  }

  function createProgram(vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "Program link failed";
      gl.deleteProgram(program);
      throwRuntimeError(message);
    }
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
  }

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Shader compile failed";
      gl.deleteShader(shader);
      throwRuntimeError(message);
    }
    return shader;
  }

  function resizeCanvas() {
    if (headless) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
    const height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function disposeResources() {
    if (!gl || !resources) return;
    for (const texture of [
      ...resources.agentTextures,
      ...resources.trailTextures,
      resources.depositTexture,
      resources.heightTexture,
      resources.slopeTexture,
      resources.waterTexture,
      resources.plantBaseTexture,
      ...resources.plantStockTextures,
      resources.readbackTexture,
    ]) {
      if (texture) gl.deleteTexture(texture);
    }
    for (const framebuffer of [
      ...resources.agentFramebuffers,
      ...resources.trailFramebuffers,
      ...resources.plantStockFramebuffers,
      resources.depositFramebuffer,
      resources.readbackFramebuffer,
    ]) {
      if (framebuffer) gl.deleteFramebuffer(framebuffer);
    }
    for (const programInfo of [
      resources.agentProgram,
      resources.depositProgram,
      resources.agentBrushProgram,
      resources.trailBrushProgram,
      resources.diffuseProgram,
      resources.plantStockProgram,
      resources.trailAvailabilityReadbackProgram,
      resources.plantStockFactorReadbackProgram,
      resources.displayProgram,
    ]) {
      gl.deleteProgram(programInfo.program);
    }
    resources = null;
    terrainRefs = null;
    simulationTick = 0;
    gameTickAccumulator = 0;
    clearFleeState();
    state.initialized = false;
    state.capabilities = "Not initialized";
    if (externalGl) {
      gl = externalGl;
    }
  }

  function paletteIndex(palette) {
    return { ice: 1, mono: 2, toxic: 3 }[palette] || 0;
  }

  function spawnModeIndex(spawnMode) {
    return { disk: 1, ring: 2, line: 3, edge: 4 }[spawnMode] || 0;
  }

  function throwRuntimeError(message) {
    state.error = message;
    throw new Error(message);
  }

  return {
    start,
    stop,
    reset,
    applySettings,
    brushResetAtClient,
    brushResetAtMapPixel,
    huntAgentsAtMapPixel,
    activateFleeAtMapPixel,
    readTrailAvailabilityGrid,
    readPlantStockFactorImageData,
    getTrailTexture: () => (resources ? resources.trailTextures[resources.trailIndex] : null),
    getPlantTexture: () => (resources ? resources.plantStockTextures[resources.plantStockIndex] : null),
    getTrailTextureVersion: () => availabilityVersion + frameCounter,
    stepGameTicks,
    warmupSteps,
    renderDisplay,
  };
}
