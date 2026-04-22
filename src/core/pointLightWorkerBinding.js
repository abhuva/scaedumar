export function bindPointLightWorker(pointLightBakeWorker, deps) {
  if (!pointLightBakeWorker) return;
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
    deps.setPendingRequestId(requestId);
    deps.applyPointLightBakeRgba(new Uint8ClampedArray(rgbaBuffer), width, height);
  });
}
