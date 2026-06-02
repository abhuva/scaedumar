import { normalizeTerrainApronSettings, DEFAULT_TERRAIN_APRON_SETTINGS } from "./terrainApronSettings.js";

const APRON_VERT_SRC = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const APRON_FRAG_SRC = `#version 300 es
precision highp float;
out vec4 outColor;

uniform sampler2D uApron;
uniform sampler2D uApronNormal;
uniform vec2 uResolution;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;
uniform float uMapAspect;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunStrength;
uniform vec3 uMoonDir;
uniform vec3 uMoonColor;
uniform float uMoonStrength;
uniform vec3 uAmbientColor;
uniform float uAmbient;

void main() {
  vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  vec2 world = uPanWorld + ndc * uViewHalfExtents;
  vec2 tile = vec2(world.x / max(0.0001, uMapAspect), world.y) + vec2(1.5);
  if (tile.x < 0.0 || tile.y < 0.0 || tile.x > 3.0 || tile.y > 3.0) {
    discard;
  }
  vec2 uv = tile / 3.0;
  vec4 sampleColor = texture(uApron, uv);
  vec3 n = normalize(texture(uApronNormal, uv).xyz * 2.0 - 1.0);
  float sunDiffuse = max(dot(n, uSunDir), 0.0);
  float moonDiffuse = max(dot(n, uMoonDir), 0.0);
  vec3 lightRgb =
    (uAmbient * uAmbientColor)
    + (sunDiffuse * uSunStrength * uSunColor)
    + (moonDiffuse * uMoonStrength * uMoonColor);
  outColor = vec4(clamp(sampleColor.rgb * lightRgb, 0.0, 1.0), sampleColor.a);
}`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Terrain apron shader compilation failed.");
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
    throw new Error(info || "Terrain apron program linking failed.");
  }
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
}

function hexToRgb01(hex) {
  const text = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000";
  return [
    parseInt(text.slice(1, 3), 16) / 255,
    parseInt(text.slice(3, 5), 16) / 255,
    parseInt(text.slice(5, 7), 16) / 255,
  ];
}

function hash2(x, y) {
  const n = Math.sin((x * 127.1) + (y * 311.7)) * 43758.5453123;
  return n - Math.floor(n);
}

function reflectedUnitCoord(gridCoord) {
  const tile = Math.min(2, Math.max(0, Math.floor(gridCoord)));
  const local = gridCoord - tile;
  return tile % 2 === 0 ? 1 - local : local;
}

function smoothstep(edge0, edge1, value) {
  const span = Math.max(0.00001, edge1 - edge0);
  const t = Math.min(1, Math.max(0, (value - edge0) / span));
  return t * t * (3 - 2 * t);
}

function effectiveDitherScale(settings, width, height) {
  const referenceSize = 1024;
  const sizeScale = Math.max(1, Math.max(Number(width) || 1, Number(height) || 1) / referenceSize);
  return Math.max(1, Math.round(Math.max(1, settings.ditherScalePx) * sizeScale));
}

function createApronImageData(source, settings) {
  const size = settings.resolution;
  const out = new ImageData(size, size);
  const sourceData = source.data;
  const sourceWidth = Math.max(1, source.width || 1);
  const sourceHeight = Math.max(1, source.height || 1);
  const bg = hexToRgb01(settings.backgroundColor);
  const ditherScale = effectiveDitherScale(settings, size, size);
  const ditherStrength = Math.max(0, Math.min(1, settings.ditherStrength));

  for (let y = 0; y < size; y += 1) {
    const gy = ((y + 0.5) / size) * 3;
    const cellY = Math.floor(y / ditherScale);
    for (let x = 0; x < size; x += 1) {
      const gx = ((x + 0.5) / size) * 3;
      let sampleX = reflectedUnitCoord(gx);
      let sampleY = reflectedUnitCoord(gy);
      if (settings.flipX) sampleX = 1 - sampleX;
      if (settings.flipY) sampleY = 1 - sampleY;
      const sx = Math.min(sourceWidth - 1, Math.max(0, Math.floor(sampleX * sourceWidth)));
      const sourceY = Math.min(sourceHeight - 1, Math.max(0, Math.floor(sampleY * sourceHeight)));
      const centerDistance = Math.max(Math.abs(gx - 1.5), Math.abs(gy - 1.5)) / 1.5;
      const apronDistance = Math.max(0, (centerDistance - (1 / 3)) / (2 / 3));
      const fade = smoothstep(settings.fadeStart, settings.fadeEnd, apronDistance);
      const dither = hash2(Math.floor(x / ditherScale), cellY);
      const useBackground = dither < Math.min(1, fade * ditherStrength);
      const srcIndex = ((sourceHeight - 1 - sourceY) * sourceWidth + sx) * 4;
      const outIndex = (y * size + x) * 4;
      out.data[outIndex] = useBackground ? Math.round(bg[0] * 255) : sourceData[srcIndex];
      out.data[outIndex + 1] = useBackground ? Math.round(bg[1] * 255) : sourceData[srcIndex + 1];
      out.data[outIndex + 2] = useBackground ? Math.round(bg[2] * 255) : sourceData[srcIndex + 2];
      out.data[outIndex + 3] = 255;
    }
  }
  return out;
}

function createAuthoredApronImageData(source, settings) {
  const width = Math.max(1, source.width || 1);
  const height = Math.max(1, source.height || 1);
  const out = new ImageData(width, height);
  const sourceData = source.data;
  const bg = hexToRgb01(settings.backgroundColor);
  const ditherScale = effectiveDitherScale(settings, width, height);
  const ditherStrength = Math.max(0, Math.min(1, settings.ditherStrength));
  for (let y = 0; y < height; y += 1) {
    const flippedY = settings.flipY ? y : height - 1 - y;
    const gy = ((y + 0.5) / height) * 3;
    const cellY = Math.floor(y / ditherScale);
    for (let x = 0; x < width; x += 1) {
      const sourceX = settings.flipX ? width - 1 - x : x;
      const srcIndex = (flippedY * width + sourceX) * 4;
      const outIndex = (y * width + x) * 4;
      const gx = ((x + 0.5) / width) * 3;
      const centerDistance = Math.max(Math.abs(gx - 1.5), Math.abs(gy - 1.5)) / 1.5;
      const apronDistance = Math.max(0, (centerDistance - (1 / 3)) / (2 / 3));
      const fade = smoothstep(settings.fadeStart, settings.fadeEnd, apronDistance);
      const dither = hash2(Math.floor(x / ditherScale), cellY);
      const useBackground = dither < Math.min(1, fade * ditherStrength);
      out.data[outIndex] = useBackground ? Math.round(bg[0] * 255) : sourceData[srcIndex];
      out.data[outIndex + 1] = useBackground ? Math.round(bg[1] * 255) : sourceData[srcIndex + 1];
      out.data[outIndex + 2] = useBackground ? Math.round(bg[2] * 255) : sourceData[srcIndex + 2];
      out.data[outIndex + 3] = 255;
    }
  }
  return out;
}

function createAuthoredApronNormalImageData(source, settings) {
  const width = Math.max(1, source.width || 1);
  const height = Math.max(1, source.height || 1);
  const out = new ImageData(width, height);
  const sourceData = source.data;
  for (let y = 0; y < height; y += 1) {
    const flippedY = settings.flipY ? y : height - 1 - y;
    for (let x = 0; x < width; x += 1) {
      const sourceX = settings.flipX ? width - 1 - x : x;
      const srcIndex = (flippedY * width + sourceX) * 4;
      const outIndex = (y * width + x) * 4;
      out.data[outIndex] = sourceData[srcIndex];
      out.data[outIndex + 1] = sourceData[srcIndex + 1];
      out.data[outIndex + 2] = sourceData[srcIndex + 2];
      out.data[outIndex + 3] = 255;
    }
  }
  return out;
}

function resolveApronLighting(lightingParams) {
  const params = lightingParams && typeof lightingParams === "object" ? lightingParams : {};
  return {
    ambientColor: Array.isArray(params.ambientColor) ? params.ambientColor : [1, 1, 1],
    sunColor: params.sun && Array.isArray(params.sun.sunColor) ? params.sun.sunColor : [1, 1, 1],
    moonColor: Array.isArray(params.moonColor) ? params.moonColor : [0.45, 0.55, 0.75],
    sunDir: Array.isArray(params.sunDir) ? params.sunDir : [0, 0, 1],
    moonDir: Array.isArray(params.moonDir) ? params.moonDir : [0, 0, 1],
    ambient: Math.max(0, Math.min(2, Number(params.ambientFinal) || 0.35)),
    sunStrength: Math.max(0, Number(params.sunStrength) || 0),
    moonStrength: Math.max(0, Number(params.moonStrength) || 0),
  };
}

function cameraViewState(deps, frame) {
  const camera = frame && frame.camera ? frame.camera : {};
  const zoom = Number.isFinite(Number(camera.zoom)) ? Number(camera.zoom) : 1;
  const viewHalf = deps.getViewHalfExtents(zoom);
  const panX = Number(camera.panX) || 0;
  const panY = Number(camera.panY) || 0;
  const mapAspect = Math.max(0.0001, deps.getMapAspect());
  const view = {
    left: panX - viewHalf.x,
    right: panX + viewHalf.x,
    bottom: panY - viewHalf.y,
    top: panY + viewHalf.y,
  };
  const center = {
    left: -0.5 * mapAspect,
    right: 0.5 * mapAspect,
    bottom: -0.5,
    top: 0.5,
  };
  const apron = {
    left: -1.5 * mapAspect,
    right: 1.5 * mapAspect,
    bottom: -1.5,
    top: 1.5,
  };
  const fullyInsideCenter = view.left >= center.left
    && view.right <= center.right
    && view.bottom >= center.bottom
    && view.top <= center.top;
  const intersectsApron = view.right > apron.left
    && view.left < apron.right
    && view.top > apron.bottom
    && view.bottom < apron.top;
  return {
    camera,
    viewHalf,
    panX,
    panY,
    mapAspect,
    shouldRender: !fullyInsideCenter && intersectsApron,
  };
}

export function createTerrainApronRenderer(deps) {
  const gl = deps.gl;
  const program = createProgram(gl, APRON_VERT_SRC, APRON_FRAG_SRC);
  const uniforms = {
    uApron: gl.getUniformLocation(program, "uApron"),
    uApronNormal: gl.getUniformLocation(program, "uApronNormal"),
    uResolution: gl.getUniformLocation(program, "uResolution"),
    uViewHalfExtents: gl.getUniformLocation(program, "uViewHalfExtents"),
    uPanWorld: gl.getUniformLocation(program, "uPanWorld"),
    uMapAspect: gl.getUniformLocation(program, "uMapAspect"),
    uSunDir: gl.getUniformLocation(program, "uSunDir"),
    uSunColor: gl.getUniformLocation(program, "uSunColor"),
    uSunStrength: gl.getUniformLocation(program, "uSunStrength"),
    uMoonDir: gl.getUniformLocation(program, "uMoonDir"),
    uMoonColor: gl.getUniformLocation(program, "uMoonColor"),
    uMoonStrength: gl.getUniformLocation(program, "uMoonStrength"),
    uAmbientColor: gl.getUniformLocation(program, "uAmbientColor"),
    uAmbient: gl.getUniformLocation(program, "uAmbient"),
  };
  const vao = gl.createVertexArray();
  const quadBuffer = gl.createBuffer();
  if (!vao || !quadBuffer) {
    throw new Error("Failed to allocate terrain apron quad.");
  }
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
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
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const normalTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, normalTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let lastKey = "";
  let lastSource = null;
  let lastNormalSource = null;
  let available = false;

  function uploadImageDataToTexture(targetTexture, imageData) {
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      imageData.width,
      imageData.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(imageData.data.buffer),
    );
  }

  function uploadFlatNormalTexture() {
    gl.bindTexture(gl.TEXTURE_2D, normalTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([128, 128, 255, 255]),
    );
  }

  function rebuildIfNeeded(source, settings, sourceMode, normalSource) {
    if (!source || !source.data || !source.width || !source.height) {
      available = false;
      return;
    }
    const key = [
      sourceMode,
      source.width,
      source.height,
      source.version || 0,
      settings.resolution,
      settings.fadeStart,
      settings.fadeEnd,
      settings.ditherScalePx,
      settings.ditherStrength,
      settings.flipX,
      settings.flipY,
      settings.backgroundColor,
      normalSource ? normalSource.width : 0,
      normalSource ? normalSource.height : 0,
    ].join("|");
    if (key === lastKey && source === lastSource && normalSource === lastNormalSource && available) return;
    const imageData = sourceMode === "authored"
      ? createAuthoredApronImageData(source, settings)
      : createApronImageData(source, settings);
    uploadImageDataToTexture(texture, imageData);
    if (normalSource && normalSource.data && normalSource.width && normalSource.height) {
      uploadImageDataToTexture(normalTexture, createAuthoredApronNormalImageData(normalSource, settings));
    } else {
      uploadFlatNormalTexture();
    }
    lastKey = key;
    lastSource = source;
    lastNormalSource = normalSource;
    available = true;
  }

  function render(frame) {
    const settings = normalizeTerrainApronSettings(
      typeof deps.getSettings === "function" ? deps.getSettings() : null,
      deps.defaultSettings || DEFAULT_TERRAIN_APRON_SETTINGS,
    );
    if (!settings.enabled) return;
    const viewState = cameraViewState(deps, frame);
    if (!viewState.shouldRender) return;
    const authored = typeof deps.getApronImageData === "function" ? deps.getApronImageData() : null;
    const authoredNormal = typeof deps.getApronNormalImageData === "function" ? deps.getApronNormalImageData() : null;
    const splat = typeof deps.getSplatImageData === "function" ? deps.getSplatImageData() : null;
    const useAuthored = settings.useAuthoredImage && authored && authored.data && authored.width && authored.height;
    const source = useAuthored ? authored : splat;
    rebuildIfNeeded(source, settings, useAuthored ? "authored" : "generated", useAuthored ? authoredNormal : null);
    if (!available) return;
    gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.uApron, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, normalTexture);
    gl.uniform1i(uniforms.uApronNormal, 1);
    gl.uniform2f(uniforms.uResolution, deps.canvas.width, deps.canvas.height);
    gl.uniform2f(uniforms.uViewHalfExtents, viewState.viewHalf.x, viewState.viewHalf.y);
    gl.uniform2f(uniforms.uPanWorld, viewState.panX, viewState.panY);
    gl.uniform1f(uniforms.uMapAspect, viewState.mapAspect);
    const lighting = resolveApronLighting(frame && frame.lightingParams);
    gl.uniform3f(uniforms.uSunDir, lighting.sunDir[0], lighting.sunDir[1], lighting.sunDir[2]);
    gl.uniform3f(uniforms.uSunColor, lighting.sunColor[0], lighting.sunColor[1], lighting.sunColor[2]);
    gl.uniform1f(uniforms.uSunStrength, lighting.sunStrength);
    gl.uniform3f(uniforms.uMoonDir, lighting.moonDir[0], lighting.moonDir[1], lighting.moonDir[2]);
    gl.uniform3f(uniforms.uMoonColor, lighting.moonColor[0], lighting.moonColor[1], lighting.moonColor[2]);
    gl.uniform1f(uniforms.uMoonStrength, lighting.moonStrength);
    gl.uniform3f(uniforms.uAmbientColor, lighting.ambientColor[0], lighting.ambientColor[1], lighting.ambientColor[2]);
    gl.uniform1f(uniforms.uAmbient, lighting.ambient);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  return {
    render,
  };
}
