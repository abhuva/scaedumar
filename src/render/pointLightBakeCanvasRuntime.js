export function createPointLightBakeCanvasRuntime(deps) {
  function ensurePointLightBakeSize() {
    const mapSize = deps.getMapSize();
    const w = Math.max(1, Math.floor(mapSize.width));
    const h = Math.max(1, Math.floor(mapSize.height));
    if (deps.pointLightBakeCanvas.width !== w || deps.pointLightBakeCanvas.height !== h) {
      deps.pointLightBakeCanvas.width = w;
      deps.pointLightBakeCanvas.height = h;
    }
  }

  function applyPointLightBakeRgba(rgba, sourceWidth, sourceHeight) {
    if (sourceWidth === deps.pointLightBakeCanvas.width && sourceHeight === deps.pointLightBakeCanvas.height) {
      deps.pointLightBakeCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
    } else if (deps.pointLightBakeTempCtx) {
      deps.pointLightBakeTempCanvas.width = sourceWidth;
      deps.pointLightBakeTempCanvas.height = sourceHeight;
      deps.pointLightBakeTempCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
      deps.pointLightBakeCtx.imageSmoothingEnabled = false;
      deps.pointLightBakeCtx.clearRect(0, 0, deps.pointLightBakeCanvas.width, deps.pointLightBakeCanvas.height);
      deps.pointLightBakeCtx.drawImage(
        deps.pointLightBakeTempCanvas,
        0,
        0,
        deps.pointLightBakeCanvas.width,
        deps.pointLightBakeCanvas.height,
      );
    } else {
      deps.pointLightBakeCtx.clearRect(0, 0, deps.pointLightBakeCanvas.width, deps.pointLightBakeCanvas.height);
      console.warn(
        "Point-light bake RGBA source size does not match destination canvas and no temp scaling canvas is available; putImageData may crop or pad the result.",
      );
      deps.pointLightBakeCtx.putImageData(new ImageData(rgba, sourceWidth, sourceHeight), 0, 0);
    }
    deps.uploadImageToTexture(deps.pointLightTex, deps.pointLightBakeCanvas);
    deps.requestOverlayDraw();
  }

  return {
    ensurePointLightBakeSize,
    applyPointLightBakeRgba,
  };
}
