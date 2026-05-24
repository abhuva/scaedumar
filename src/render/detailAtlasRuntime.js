import { normalizeDetailSettings } from "../gameplay/detailDataSerializer.js";

const DEFAULT_MICRO_SIZE = 32;

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

function createResizedSourceImageData(image, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = getContext2d(canvas);
  ctx.imageSmoothingEnabled = false;
  if ("imageSmoothingQuality" in ctx) {
    ctx.imageSmoothingQuality = "low";
  }
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

function makeSolidCanvas(color) {
  const canvas = createCanvas(1, 1);
  const ctx = getContext2d(canvas);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return canvas;
}

function uploadCanvasToTexture(gl, texture, canvas, filter) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
}

function uploadImageToTexture(gl, texture, image, filter) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
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
    const materialImagePromises = settings.materials.map((material) => {
      const config = material.micro || {};
      return config.src ? tryLoadImage(config.src) : Promise.resolve(null);
    });
    const splatImagePromise = settings.splat.src ? tryLoadImage(settings.splat.src) : Promise.resolve(null);
    const [materialImages, splatImage] = await Promise.all([
      Promise.all(materialImagePromises),
      splatImagePromise,
    ]);
    const entries = settings.materials.map((material, index) => ({ material, image: materialImages[index] || null }));
    const loadedCount = materialImages.filter(Boolean).length;
    return { entries, loadedCount, splatImage };
  }

  function buildMicroAtlas(settings, sources) {
    const padding = settings.atlas.microPaddingPx;
    const filterName = settings.atlas.microFilter;
    const filter = filterName === "nearest" ? deps.gl.NEAREST : deps.gl.LINEAR;
    const sourceImages = sources.map((entry) => entry.image).filter(Boolean);
    const tileSize = sourceImages.length > 0
      ? Math.max(...sourceImages.map((image) => Math.max(image.width || 1, image.height || 1)))
      : DEFAULT_MICRO_SIZE;
    const slotSize = tileSize + padding * 2;
    const atlasWidth = slotSize * settings.materials.length;
    const atlasHeight = slotSize;
    const colorCanvas = createCanvas(atlasWidth, atlasHeight);
    const colorCtx = getContext2d(colorCanvas);
    colorCtx.fillStyle = "rgb(128, 128, 128)";
    colorCtx.fillRect(0, 0, atlasWidth, atlasHeight);

    const rects = new Array(settings.materials.length).fill(null).map(() => [0, 0, 1, 1]);
    for (let index = 0; index < settings.materials.length; index += 1) {
      const entry = sources[index];
      const image = entry.image;
      const colorData = image
        ? createResizedSourceImageData(image, tileSize, tileSize)
        : createNeutralImageData(tileSize, tileSize);
      const x = index * slotSize + padding;
      const y = padding;
      drawPaddedTile(colorCtx, colorData, x, y, padding);
      rects[entry.material.slot] = [
        x / atlasWidth,
        y / atlasHeight,
        tileSize / atlasWidth,
        tileSize / atlasHeight,
      ];
    }

    return {
      colorCanvas,
      rects,
      filter,
    };
  }

  async function rebuild(rawSettings) {
    const settings = normalizeDetailSettings(rawSettings, deps.defaultDetailSettings);
    const { entries, loadedCount, splatImage } = await loadSources(settings);
    const micro = buildMicroAtlas(settings, entries);
    uploadCanvasToTexture(deps.gl, deps.microColorTex, micro.colorCanvas, micro.filter);
    if (splatImage) {
      const splatFilter = settings.splat.filter === "nearest" ? deps.gl.NEAREST : deps.gl.LINEAR;
      uploadImageToTexture(deps.gl, deps.materialSplatTex, splatImage, splatFilter);
    } else {
      uploadCanvasToTexture(deps.gl, deps.materialSplatTex, makeSolidCanvas("rgba(255, 0, 0, 1)"), deps.gl.LINEAR);
    }
    state.available = loadedCount > 0;
    state.loadedSourceCount = loadedCount;
    state.materialSplatAvailable = Boolean(splatImage);
    state.microRects = micro.rects;
    state.settings = settings;
    return state;
  }

  function uploadNeutral() {
    const neutralColor = makeSolidCanvas("rgb(128, 128, 128)");
    const redSplat = makeSolidCanvas("rgba(255, 0, 0, 1)");
    uploadCanvasToTexture(deps.gl, deps.microColorTex, neutralColor, deps.gl.LINEAR);
    uploadCanvasToTexture(deps.gl, deps.materialSplatTex, redSplat, deps.gl.LINEAR);
  }

  uploadNeutral();

  return {
    rebuild,
  };
}
