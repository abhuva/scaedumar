export function createPointLightBakeOrchestrator(deps) {
  let bakeScheduled = false;
  let bakeDebounceTimer = null;
  let requestId = 0;
  let pendingRequestId = 0;

  function clearDebounceTimer() {
    if (bakeDebounceTimer !== null) {
      deps.windowEl.clearTimeout(bakeDebounceTimer);
      bakeDebounceTimer = null;
    }
  }

  function scheduleBake() {
    clearDebounceTimer();
    const delayMs = deps.isLiveUpdateEnabled() ? deps.debounceMs : 0;
    bakeDebounceTimer = deps.windowEl.setTimeout(() => {
      bakeDebounceTimer = null;
      if (bakeScheduled) return;
      bakeScheduled = true;
      deps.requestAnimationFrame(() => {
        bakeScheduled = false;
        bakeNow();
      });
    }, delayMs);
  }

  function bakeNow() {
    deps.ensureBakeSize();
    const useReducedResolution = deps.isLiveUpdateEnabled();
    const worker = deps.getWorker();
    if (!worker || !deps.hasBakeInputs()) {
      deps.bakeSync(useReducedResolution);
      return;
    }

    const full = deps.getFullBakeSize();
    const scale = useReducedResolution ? deps.liveScale : 1;
    const bakeWidth = Math.max(1, Math.round(full.width * scale));
    const bakeHeight = Math.max(1, Math.round(full.height * scale));
    const nextRequestId = ++requestId;
    pendingRequestId = nextRequestId;
    worker.postMessage({
      type: "bake",
      requestId: nextRequestId,
      bakeWidth,
      bakeHeight,
      lights: deps.getLights(),
      heightScaleValue: deps.getHeightScaleValue(),
      blendExposure: deps.blendExposure,
    });
  }

  return {
    scheduleBake,
    bakeNow,
    getPendingRequestId() {
      return pendingRequestId;
    },
    setPendingRequestId(value) {
      pendingRequestId = value;
    },
  };
}
