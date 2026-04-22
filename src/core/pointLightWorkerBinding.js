export function bindPointLightWorker(pointLightBakeWorker, deps) {
  if (!pointLightBakeWorker) return;

  function isValidRgbaBuffer(rgbaBuffer, expectedByteLength) {
    const sharedArrayBufferAvailable = typeof SharedArrayBuffer !== "undefined";
    if (
      rgbaBuffer instanceof ArrayBuffer
      || (sharedArrayBufferAvailable && rgbaBuffer instanceof SharedArrayBuffer)
    ) {
      return rgbaBuffer.byteLength === expectedByteLength;
    }
    if (ArrayBuffer.isView(rgbaBuffer)) {
      return rgbaBuffer.byteLength === expectedByteLength;
    }
    return false;
  }

  function failPendingRequest(requestId, reason) {
    console.warn(`Point-light bake worker payload ignored: ${reason}`);
    if (requestId === deps.getPendingRequestId()) {
      deps.bakePointLightsTextureSync(false);
    }
  }

  pointLightBakeWorker.addEventListener("message", (event) => {
    const { requestId, width, height, rgbaBuffer, error } = event.data || {};
    if (error) {
      console.warn("Point-light bake worker error:", error);
      if (requestId === deps.getPendingRequestId()) {
        deps.bakePointLightsTextureSync(false);
      }
      return;
    }
    if (!Number.isFinite(requestId) || requestId < deps.getPendingRequestId()) {
      return;
    }
    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      failPendingRequest(requestId, "invalid texture dimensions");
      return;
    }
    const expectedByteLength = width * height * 4;
    if (!Number.isFinite(expectedByteLength) || expectedByteLength <= 0 || !isValidRgbaBuffer(rgbaBuffer, expectedByteLength)) {
      failPendingRequest(requestId, "invalid RGBA buffer payload");
      return;
    }
    const rgba = rgbaBuffer instanceof Uint8ClampedArray
      ? new Uint8ClampedArray(rgbaBuffer.buffer, rgbaBuffer.byteOffset, rgbaBuffer.byteLength)
      : new Uint8ClampedArray(rgbaBuffer);
    deps.setPendingRequestId(requestId);
    deps.applyPointLightBakeRgba(rgba, width, height);
  });
}
