import { normalizeDetailSettings } from "../gameplay/detailDataSerializer.js";

const MATERIALS = ["dirt", "rock"];
const LAYERS = ["micro", "macro"];
const DEFAULT_LAYER_SIZE = {
  micro: 32,
  macro: 512,
};

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function getContext2d(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("2D canvas context is required for detail atlas generation.");
  }
  return ctx;
}

function resolveLayer(settings, material, layer) {
  return settings.materials?.[material]?.[layer] || {};
}

function createResizedSourceImageData(image, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = getContext2d(canvas);
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

function createNeutralImageData(width, height) {
  const canvas = createCanvas(width, height);
  const ctx = getContext2d(canvas);
  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = 128;
    imageData.data[i + 1] = 128;
    imageData.data[i + 2] = 128;
    imageData.data[i + 3] = 255;
  }
  return imageData;
}

function drawPaddedTile(ctx, imageData, x, y, padding) {
  const tileCanvas = createCanvas(imageData.width, imageData.height);
  getContext2d(tileCanvas).putImageData(imageData, 0, 0);
  ctx.drawImage(tileCanvas, x, y);
  if (padding <= 0) return;
  ctx.drawImage(tileCanvas, 0, 0, 1, imageData.height, x - padding, y, padding, imageData.height);
  ctx.drawImage(tileCanvas, imageData.width - 1, 0, 1, imageData.height, x + imageData.width, y, padding, imageData.height);
  ctx.drawImage(tileCanvas, 0, 0, imageData.width, 1, x, y - padding, imageData.width, padding);
  ctx.drawImage(tileCanvas, 0, imageData.height - 1, imageData.width, 1, x, y + imageData.height, imageData.width, padding);
  ctx.drawImage(tileCanvas, 0, 0, 1, 1, x - padding, y - padding, padding, padding);
  ctx.drawImage(tileCanvas, imageData.width - 1, 0, 1, 1, x + imageData.width, y - padding, padding, padding);
  ctx.drawImage(tileCanvas, 0, imageData.height - 1, 1, 1, x - padding, y + imageData.height, padding, padding);
  ctx.drawImage(tileCanvas, imageData.width - 1, imageData.height - 1, 1, 1, x + imageData.width, y + imageData.height, padding, padding);
}

function makeNeutralCanvas(color = "rgb(128, 128, 128)") {
  const canvas = createCanvas(1, 1);
  const ctx = getContext2d(canvas);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return canvas;
}

function uploadCanvasToTexture(gl, texture, canvas, filter) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
}

export function createDetailAtlasRuntime(deps) {
  const state = deps.state;

  async function tryLoadImage(src) {
    try {
      return await deps.loadImageFromUrl(src);
    } catch {
      return null;
    }
  }

  async function loadSources(settings) {
    const entries = {};
    let loadedCount = 0;
    for (const material of MATERIALS) {
      entries[material] = {};
      for (const layer of LAYERS) {
        const config = resolveLayer(settings, material, layer);
        const image = config.src ? await tryLoadImage(config.src) : null;
        if (image) loadedCount += 1;
        entries[material][layer] = image;
      }
    }
    return { entries, loadedCount };
  }

  function buildLayerAtlas(settings, sources, layer) {
    const padding = layer === "micro"
      ? settings.atlas.microPaddingPx
      : settings.atlas.macroPaddingPx;
    const filterName = layer === "micro"
      ? settings.atlas.microFilter
      : settings.atlas.macroFilter;
    const filter = filterName === "nearest" ? deps.gl.NEAREST : deps.gl.LINEAR;
    const sourceImages = MATERIALS.map((material) => sources[material][layer]).filter(Boolean);
    const tileSize = sourceImages.length > 0
      ? Math.max(...sourceImages.map((image) => Math.max(image.width || 1, image.height || 1)))
      : DEFAULT_LAYER_SIZE[layer];
    const slotSize = tileSize + padding * 2;
    const atlasWidth = slotSize * MATERIALS.length;
    const atlasHeight = slotSize;
    const colorCanvas = createCanvas(atlasWidth, atlasHeight);
    const colorCtx = getContext2d(colorCanvas);
    colorCtx.fillStyle = "rgb(128, 128, 128)";
    colorCtx.fillRect(0, 0, atlasWidth, atlasHeight);

    const rects = [];
    for (let index = 0; index < MATERIALS.length; index += 1) {
      const material = MATERIALS[index];
      const image = sources[material][layer];
      const colorData = image
        ? createResizedSourceImageData(image, tileSize, tileSize)
        : createNeutralImageData(tileSize, tileSize);
      const x = index * slotSize + padding;
      const y = padding;
      drawPaddedTile(colorCtx, colorData, x, y, padding);
      rects.push([
        x / atlasWidth,
        y / atlasHeight,
        tileSize / atlasWidth,
        tileSize / atlasHeight,
      ]);
    }

    return {
      colorCanvas,
      rects,
      filter,
    };
  }

  async function rebuild(rawSettings) {
    const settings = normalizeDetailSettings(rawSettings, deps.defaultDetailSettings);
    const { entries, loadedCount } = await loadSources(settings);
    const micro = buildLayerAtlas(settings, entries, "micro");
    const macro = buildLayerAtlas(settings, entries, "macro");
    uploadCanvasToTexture(deps.gl, deps.microColorTex, micro.colorCanvas, micro.filter);
    uploadCanvasToTexture(deps.gl, deps.macroColorTex, macro.colorCanvas, macro.filter);
    state.available = loadedCount === MATERIALS.length * LAYERS.length;
    state.loadedSourceCount = loadedCount;
    state.microRects = micro.rects;
    state.macroRects = macro.rects;
    state.settings = settings;
    return state;
  }

  function uploadNeutral() {
    const neutralColor = makeNeutralCanvas();
    uploadCanvasToTexture(deps.gl, deps.microColorTex, neutralColor, deps.gl.LINEAR);
    uploadCanvasToTexture(deps.gl, deps.macroColorTex, neutralColor, deps.gl.LINEAR);
  }

  uploadNeutral();

  return {
    rebuild,
  };
}
