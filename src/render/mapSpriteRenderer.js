const MAP_SPRITE_VERT_SRC = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aMapCoord;
layout(location = 1) in vec2 aAtlasUv;
layout(location = 2) in vec4 aColor;

uniform vec2 uMapSize;
uniform vec2 uViewHalfExtents;
uniform vec2 uPanWorld;
uniform float uMapAspect;

out vec2 vAtlasUv;
out vec2 vMapUv;
out vec4 vColor;

void main() {
  vec2 uv = vec2(
    aMapCoord.x / max(1.0, uMapSize.x),
    1.0 - (aMapCoord.y / max(1.0, uMapSize.y))
  );
  vec2 world = vec2((uv.x - 0.5) * uMapAspect, uv.y - 0.5);
  vec2 ndc = (world - uPanWorld) / uViewHalfExtents;
  gl_Position = vec4(ndc, 0.0, 1.0);
  vAtlasUv = aAtlasUv;
  vMapUv = uv;
  vColor = aColor;
}`;

const MAP_SPRITE_FRAG_SRC = `#version 300 es
precision highp float;

uniform sampler2D uAtlas;
uniform sampler2D uNormals;
uniform sampler2D uPointLightTex;
uniform sampler2D uShadowTex;

uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunStrength;
uniform vec3 uMoonDir;
uniform vec3 uMoonColor;
uniform float uMoonStrength;
uniform vec3 uAmbientColor;
uniform float uAmbient;
uniform float uUseShadows;

in vec2 vAtlasUv;
in vec2 vMapUv;
in vec4 vColor;

out vec4 outColor;

void main() {
  vec4 texel = texture(uAtlas, vAtlasUv);
  if (texel.a <= 0.0) {
    discard;
  }
  vec3 spriteRgb = texel.rgb * vColor.rgb;

  vec3 n = texture(uNormals, vMapUv).xyz * 2.0 - 1.0;
  n = normalize(n);
  float sunDiffuse = max(dot(n, uSunDir), 0.0);
  float moonDiffuse = max(dot(n, uMoonDir), 0.0);
  vec2 shadowSample = texture(uShadowTex, vMapUv).rg;
  float sunShadow = (uUseShadows > 0.5 && sunDiffuse > 0.0001 && uSunStrength > 0.0001) ? shadowSample.r : 1.0;
  float moonShadow = (uUseShadows > 0.5 && moonDiffuse > 0.0001 && uMoonStrength > 0.0001) ? shadowSample.g : 1.0;
  vec3 pointLightIntensity = texture(uPointLightTex, vMapUv).rgb;
  vec3 light = uAmbient * uAmbientColor
    + (sunDiffuse * sunShadow * uSunStrength) * uSunColor
    + (moonDiffuse * moonShadow * uMoonStrength) * uMoonColor
    + pointLightIntensity;
  outColor = vec4(clamp(spriteRgb * light, 0.0, 1.0), 1.0);
}`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Map sprite shader compilation failed.");
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
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "Map sprite program linking failed.");
  }
  return program;
}

function hexToRgb01(value) {
  if (typeof value !== "string" || !/^#?[0-9a-fA-F]{6}$/.test(value)) {
    return [1, 1, 1];
  }
  const hex = value.startsWith("#") ? value.slice(1) : value;
  return [
    Number.parseInt(hex.slice(0, 2), 16) / 255,
    Number.parseInt(hex.slice(2, 4), 16) / 255,
    Number.parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function hexToRgb255(value) {
  if (typeof value !== "string" || !/^#?[0-9a-fA-F]{6}$/.test(value)) {
    return null;
  }
  const hex = value.startsWith("#") ? value.slice(1) : value;
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

export function applyTransparentColorKeyToImageData(imageData, color, tolerance = 0) {
  const rgb = hexToRgb255(color);
  if (!rgb || !imageData || !imageData.data) return imageData;
  const data = imageData.data;
  const maxDelta = Math.max(0, Math.round(Number(tolerance) || 0));
  for (let i = 0; i < data.length; i += 4) {
    if (
      Math.abs(data[i] - rgb[0]) <= maxDelta
      && Math.abs(data[i + 1] - rgb[1]) <= maxDelta
      && Math.abs(data[i + 2] - rgb[2]) <= maxDelta
    ) {
      data[i + 3] = 0;
    }
  }
  return imageData;
}

function positiveFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

export function resolveMapSpriteSourceFrameRect(image, source, atlasSlotWidth = 32, atlasSlotHeight = 32) {
  const imageWidth = Math.max(1, Number(image && image.width) || 1);
  const imageHeight = Math.max(1, Number(image && image.height) || 1);
  const slotWidth = Math.max(1, Number(atlasSlotWidth) || 32);
  const slotHeight = Math.max(1, Number(atlasSlotHeight) || 32);
  const frameCount = Math.max(1, Math.floor(Number(source && source.frameCount) || 1));
  const frameIndex = Math.max(0, Math.min(frameCount - 1, Math.floor(Number(source && source.frameIndex) || 0)));
  const explicitSourceSlotWidth = Math.floor(positiveFiniteNumber(source && source.sourceSlotWidth));
  const explicitSourceSlotHeight = Math.floor(positiveFiniteNumber(source && source.sourceSlotHeight));
  const frameWidthBasis = explicitSourceSlotWidth || slotWidth;
  const hasHorizontalStrip = imageWidth >= frameCount * frameWidthBasis;
  const sourceFrameWidth = explicitSourceSlotWidth
    ? (hasHorizontalStrip ? explicitSourceSlotWidth : imageWidth)
    : (hasHorizontalStrip ? Math.max(1, Math.floor(imageWidth / frameCount)) : imageWidth);
  const sourceFrameHeight = explicitSourceSlotHeight
    ? Math.min(imageHeight, explicitSourceSlotHeight)
    : imageHeight;
  const sourceFrameX = hasHorizontalStrip ? frameIndex * sourceFrameWidth : 0;

  return {
    x: sourceFrameX,
    y: 0,
    width: sourceFrameWidth,
    height: sourceFrameHeight,
  };
}

function createPlaceholderAtlas(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const edge = x === 0 || y === 0 || x === size - 1 || y === size - 1;
      data[i] = edge ? 255 : 120;
      data[i + 1] = edge ? 216 : 84;
      data[i + 2] = edge ? 138 : 45;
      data[i + 3] = edge ? 255 : 210;
    }
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return texture;
}

function createCanvas(documentRef, width, height) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("Document dependency is required to build a map sprite atlas.");
  }
  const canvas = documentRef.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function vec3Or(value, fallback) {
  return Array.isArray(value) && value.length >= 3
    ? [
      Number.isFinite(Number(value[0])) ? Number(value[0]) : fallback[0],
      Number.isFinite(Number(value[1])) ? Number(value[1]) : fallback[1],
      Number.isFinite(Number(value[2])) ? Number(value[2]) : fallback[2],
    ]
    : fallback;
}

export function packMapSpriteVertices(structures, options = {}) {
  const items = Array.isArray(structures) ? structures : [];
  const slotWidth = Math.max(1, Number(options.slotWidth) || 32);
  const slotHeight = Math.max(1, Number(options.slotHeight) || 32);
  const atlasWidth = Math.max(slotWidth, Number(options.atlasWidth) || slotWidth);
  const atlasHeight = Math.max(slotHeight, Number(options.atlasHeight) || slotHeight);
  const color = Array.isArray(options.color) ? options.color : [1, 1, 1, 1];
  const vertices = new Float32Array(items.length * 6 * 8);
  let offset = 0;

  function writeVertex(mapX, mapY, u, v, rgba) {
    vertices[offset++] = mapX;
    vertices[offset++] = mapY;
    vertices[offset++] = u;
    vertices[offset++] = v;
    vertices[offset++] = rgba[0];
    vertices[offset++] = rgba[1];
    vertices[offset++] = rgba[2];
    vertices[offset++] = rgba[3];
  }

  function rotatePoint(x, y, originX, originY, angle) {
    if (!Number.isFinite(angle) || Math.abs(angle) <= 0.000001) return [x, y];
    const dx = x - originX;
    const dy = y - originY;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
      originX + (dx * cos) - (dy * sin),
      originY + (dx * sin) + (dy * cos),
    ];
  }

  for (const item of items) {
    const x0 = Number(item.pixelX) || 0;
    const y0 = Number(item.pixelY) || 0;
    const width = Math.max(1, Number(item.visualWidthPx) || 1);
    const height = Math.max(1, Number(item.visualHeightPx) || 1);
    const x1 = x0 + width;
    const y1 = y0 + height;
    const rotationRadians = Number(item.rotationRadians);
    const rotationOriginX = Number.isFinite(Number(item.rotationOriginX))
      ? Number(item.rotationOriginX)
      : x0 + (width * 0.5);
    const rotationOriginY = Number.isFinite(Number(item.rotationOriginY))
      ? Number(item.rotationOriginY)
      : y0 + (height * 0.5);
    const p00 = rotatePoint(x0, y0, rotationOriginX, rotationOriginY, rotationRadians);
    const p10 = rotatePoint(x1, y0, rotationOriginX, rotationOriginY, rotationRadians);
    const p01 = rotatePoint(x0, y1, rotationOriginX, rotationOriginY, rotationRadians);
    const p11 = rotatePoint(x1, y1, rotationOriginX, rotationOriginY, rotationRadians);
    const tint = item.tint ? [...hexToRgb01(item.tint), 1] : [color[0], color[1], color[2], 1];
    const columns = Math.max(1, Math.floor(atlasWidth / slotWidth));
    const rows = Math.max(1, Math.floor(atlasHeight / slotHeight));
    const slot = Math.max(0, Math.floor(Number(item.spriteSlot) || 0)) % Math.max(1, columns * rows);
    const slotX = slot % columns;
    const slotY = Math.floor(slot / columns);
    const u0 = (slotX * slotWidth) / atlasWidth;
    const v0 = (slotY * slotHeight) / atlasHeight;
    const u1 = ((slotX + 1) * slotWidth) / atlasWidth;
    const v1 = ((slotY + 1) * slotHeight) / atlasHeight;

    writeVertex(p00[0], p00[1], u0, v1, tint);
    writeVertex(p10[0], p10[1], u1, v1, tint);
    writeVertex(p01[0], p01[1], u0, v0, tint);
    writeVertex(p01[0], p01[1], u0, v0, tint);
    writeVertex(p10[0], p10[1], u1, v1, tint);
    writeVertex(p11[0], p11[1], u1, v0, tint);
  }

  return vertices;
}

export function createMapSpriteRenderer(deps) {
  const gl = deps.gl;
  const program = createProgram(gl, MAP_SPRITE_VERT_SRC, MAP_SPRITE_FRAG_SRC);
  const uniforms = {
    uAtlas: gl.getUniformLocation(program, "uAtlas"),
    uNormals: gl.getUniformLocation(program, "uNormals"),
    uPointLightTex: gl.getUniformLocation(program, "uPointLightTex"),
    uShadowTex: gl.getUniformLocation(program, "uShadowTex"),
    uMapSize: gl.getUniformLocation(program, "uMapSize"),
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
    uUseShadows: gl.getUniformLocation(program, "uUseShadows"),
  };
  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  if (!vao || !buffer) {
    throw new Error("Failed to allocate map sprite render buffers.");
  }
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const stride = 8 * 4;
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 2 * 4);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 4 * 4);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const placeholderAtlas = createPlaceholderAtlas(gl);
  let atlasTexture = placeholderAtlas;
  let atlasKey = "";
  let atlasLoadingKey = "";
  let atlasSlotWidth = 32;
  let atlasSlotHeight = 32;
  let atlasGridColumns = 1;
  let atlasGridRows = 1;

  function setAtlasTexture(texture) {
    if (atlasTexture && atlasTexture !== placeholderAtlas && atlasTexture !== texture) {
      gl.deleteTexture(atlasTexture);
    }
    atlasTexture = texture;
  }

  function uploadCanvas(canvas, filter) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    return texture;
  }

function collectSpriteSources(snapshot) {
  const bySlot = new Map();
  const items = getSnapshotItems(snapshot);
  for (const item of items) {
    const src = typeof item.spriteSrc === "string" ? item.spriteSrc : "";
    if (!src) continue;
    const slot = Math.max(0, Math.floor(Number(item.spriteSlot) || 0));
    const frameCount = Math.max(1, Math.floor(Number(item.sourceFrameCount) || 1));
    const frameIndex = Math.max(0, Math.min(frameCount - 1, Math.floor(Number(item.sourceFrameIndex) || 0)));
    const sourceSlotWidth = Math.floor(positiveFiniteNumber(item.sourceSlotWidth));
    const sourceSlotHeight = Math.floor(positiveFiniteNumber(item.sourceSlotHeight));
    const transparentColor = typeof item.transparentColor === "string" ? item.transparentColor : "";
    const transparentColorTolerance = Math.max(0, Math.round(Number(item.transparentColorTolerance) || 0));
    const baseSlot = Math.max(0, slot - frameIndex);
    for (let i = 0; i < frameCount; i += 1) {
      const frameSlot = baseSlot + i;
      if (!bySlot.has(frameSlot)) {
        bySlot.set(frameSlot, {
          src,
          frameCount,
          frameIndex: i,
          sourceSlotWidth,
          sourceSlotHeight,
          transparentColor,
          transparentColorTolerance,
        });
      }
    }
  }
  return [...bySlot.entries()].sort((a, b) => a[0] - b[0]);
}

function getSnapshotItems(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return [];
  if (Array.isArray(snapshot.items)) return snapshot.items;
  if (Array.isArray(snapshot.agents)) return snapshot.agents;
  if (Array.isArray(snapshot.structures)) return snapshot.structures;
  return [];
}

  async function rebuildAtlasFromSnapshot(snapshot) {
    if (typeof deps.loadImageFromUrl !== "function") return;
    const atlas = snapshot && snapshot.atlas ? snapshot.atlas : {};
    const slotWidth = Math.max(1, Number(atlas.slotWidth) || 32);
    const slotHeight = Math.max(1, Number(atlas.slotHeight) || 32);
    const gridColumns = Math.max(1, Number(atlas.gridColumns) || 1);
    const gridRows = Math.max(1, Number(atlas.gridRows) || 1);
    const sources = collectSpriteSources(snapshot);
    const key = JSON.stringify({ slotWidth, slotHeight, gridColumns, gridRows, sources });
    if (key === atlasKey || key === atlasLoadingKey) return;
    atlasLoadingKey = key;
    try {
      if (sources.length === 0) {
        setAtlasTexture(placeholderAtlas);
        atlasKey = key;
        atlasSlotWidth = 32;
        atlasSlotHeight = 32;
        atlasGridColumns = 1;
        atlasGridRows = 1;
        return;
      }
      const canvas = createCanvas(deps.document, slotWidth * gridColumns, slotHeight * gridRows);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2D canvas context is required to build structure atlas.");
      ctx.imageSmoothingEnabled = false;
      for (const [slot, source] of sources) {
        const image = await deps.loadImageFromUrl(source.src);
        const slotX = slot % gridColumns;
        const slotY = Math.floor(slot / gridColumns);
        if (slotY >= gridRows) continue;
        const sourceFrame = resolveMapSpriteSourceFrameRect(image, source, slotWidth, slotHeight);
        ctx.drawImage(
          image,
          sourceFrame.x,
          sourceFrame.y,
          sourceFrame.width,
          sourceFrame.height,
          slotX * slotWidth,
          slotY * slotHeight,
          slotWidth,
          slotHeight,
        );
        if (source.transparentColor) {
          const targetX = slotX * slotWidth;
          const targetY = slotY * slotHeight;
          const imageData = ctx.getImageData(targetX, targetY, slotWidth, slotHeight);
          applyTransparentColorKeyToImageData(
            imageData,
            source.transparentColor,
            source.transparentColorTolerance,
          );
          ctx.putImageData(imageData, targetX, targetY);
        }
      }
      const filter = atlas.filter === "linear" ? gl.LINEAR : gl.NEAREST;
      setAtlasTexture(uploadCanvas(canvas, filter));
      atlasKey = key;
      atlasSlotWidth = slotWidth;
      atlasSlotHeight = slotHeight;
      atlasGridColumns = gridColumns;
      atlasGridRows = gridRows;
    } catch (error) {
      console.warn("Failed to build structure atlas; using placeholder.", error);
      setAtlasTexture(placeholderAtlas);
      atlasKey = key;
    } finally {
      atlasLoadingKey = "";
    }
  }

  function render(frame, snapshot) {
    const items = getSnapshotItems(snapshot);
    if (items.length === 0) return;
    void rebuildAtlasFromSnapshot(snapshot);
    const camera = frame && frame.camera ? frame.camera : {};
    const map = frame && frame.map ? frame.map : {};
    const mapWidth = Math.max(1, Number(map.width) || Number(deps.splatSize && deps.splatSize.width) || 1);
    const mapHeight = Math.max(1, Number(map.height) || Number(deps.splatSize && deps.splatSize.height) || 1);
    const zoom = Number.isFinite(Number(camera.zoom)) ? Number(camera.zoom) : 1;
    const viewHalf = deps.getViewHalfExtents(zoom);
    const lightingParams = frame && frame.lightingParams ? frame.lightingParams : {};
    const uniformInput = frame && frame.uniformInput ? frame.uniformInput : {};
    const sunDir = vec3Or(lightingParams.sunDir, [0, 0, 1]);
    const sunColor = vec3Or(lightingParams.sun && lightingParams.sun.sunColor, [1, 1, 1]);
    const moonDir = vec3Or(lightingParams.moonDir, [0, 0, 1]);
    const moonColor = vec3Or(lightingParams.moonColor, [0.34, 0.40, 0.54]);
    const ambientColor = vec3Or(lightingParams.ambientColor, [1, 1, 1]);
    const atlas = snapshot.atlas || {};
    const slotWidth = atlasTexture === placeholderAtlas ? 32 : atlasSlotWidth;
    const slotHeight = atlasTexture === placeholderAtlas ? 32 : atlasSlotHeight;
    const atlasWidth = slotWidth * (atlasTexture === placeholderAtlas ? 1 : atlasGridColumns);
    const atlasHeight = slotHeight * (atlasTexture === placeholderAtlas ? 1 : atlasGridRows);
    const vertices = packMapSpriteVertices(items, {
      slotWidth,
      slotHeight,
      atlasWidth,
      atlasHeight,
      color: [1, 1, 1, 1],
    });

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.uniform1i(uniforms.uAtlas, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, deps.normalsTex || null);
    gl.uniform1i(uniforms.uNormals, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, deps.pointLightTex || null);
    gl.uniform1i(uniforms.uPointLightTex, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(
      gl.TEXTURE_2D,
      Number(uniformInput.shadowBlurPx) > 0.001 ? deps.shadowBlurTex || null : deps.shadowRawTex || null,
    );
    gl.uniform1i(uniforms.uShadowTex, 3);
    gl.uniform2f(uniforms.uMapSize, mapWidth, mapHeight);
    gl.uniform2f(uniforms.uViewHalfExtents, viewHalf.x, viewHalf.y);
    gl.uniform2f(
      uniforms.uPanWorld,
      Number.isFinite(Number(camera.panX)) ? Number(camera.panX) : 0,
      Number.isFinite(Number(camera.panY)) ? Number(camera.panY) : 0,
    );
    gl.uniform1f(uniforms.uMapAspect, deps.getMapAspect());
    gl.uniform3f(uniforms.uSunDir, sunDir[0], sunDir[1], sunDir[2]);
    gl.uniform3f(uniforms.uSunColor, sunColor[0], sunColor[1], sunColor[2]);
    gl.uniform1f(uniforms.uSunStrength, Number(lightingParams.sunStrength) || 0);
    gl.uniform3f(uniforms.uMoonDir, moonDir[0], moonDir[1], moonDir[2]);
    gl.uniform3f(uniforms.uMoonColor, moonColor[0], moonColor[1], moonColor[2]);
    gl.uniform1f(uniforms.uMoonStrength, Number(lightingParams.moonStrength) || 0);
    gl.uniform3f(uniforms.uAmbientColor, ambientColor[0], ambientColor[1], ambientColor[2]);
    gl.uniform1f(uniforms.uAmbient, Number(lightingParams.ambientFinal) || 0.35);
    gl.uniform1f(uniforms.uUseShadows, uniformInput.useShadows ? 1 : 0);

    const blendEnabled = gl.isEnabled(gl.BLEND);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, items.length * 6);
    gl.bindVertexArray(null);
    if (!blendEnabled) gl.disable(gl.BLEND);
  }

  return {
    render,
  };
}
