function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createScoutCameraSmoothingRuntime(deps = {}) {
  const state = {
    agentId: 0,
    x: Number.NaN,
    y: Number.NaN,
    lastMs: Number.NaN,
  };
  const defaultSmoothing = clamp(finite(deps.defaultPositionSmoothing, 0.35), 0, 1);
  const teleportDistance = Math.max(0, finite(deps.teleportDistance, 512));
  const teleportDistanceSq = teleportDistance * teleportDistance;

  function reset() {
    state.agentId = 0;
    state.x = Number.NaN;
    state.y = Number.NaN;
    state.lastMs = Number.NaN;
  }

  function resolveAlpha(settings, nowMs) {
    const camera = settings && typeof settings === "object" ? settings : {};
    const base = clamp(finite(camera.positionSmoothing, defaultSmoothing), 0, 1);
    if (base >= 1) return 1;
    if (base <= 0) return 0;
    const safeNow = Number(nowMs);
    const safeLast = Number(state.lastMs);
    const frameScale = Number.isFinite(safeNow) && Number.isFinite(safeLast) && safeNow >= safeLast
      ? clamp((safeNow - safeLast) / (1000 / 60), 0, 8)
      : 1;
    return 1 - ((1 - base) ** frameScale);
  }

  function updateTarget(input = {}) {
    const x = Number(input.x);
    const y = Number(input.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return {
        x: Number.isFinite(state.x) ? state.x : 0,
        y: Number.isFinite(state.y) ? state.y : 0,
        snapped: false,
      };
    }

    const agentId = Math.round(Number(input.agentId) || 0);
    const hasState = Number.isFinite(state.x) && Number.isFinite(state.y);
    const dx = hasState ? x - state.x : 0;
    const dy = hasState ? y - state.y : 0;
    const shouldSnap = !hasState
      || state.agentId !== agentId
      || (teleportDistanceSq > 0 && ((dx * dx) + (dy * dy)) > teleportDistanceSq);

    if (shouldSnap) {
      state.agentId = agentId;
      state.x = x;
      state.y = y;
      state.lastMs = Number.isFinite(Number(input.nowMs)) ? Number(input.nowMs) : Number.NaN;
      return { x: state.x, y: state.y, snapped: true };
    }

    const alpha = resolveAlpha(input.settings, input.nowMs);
    state.x += (x - state.x) * alpha;
    state.y += (y - state.y) * alpha;
    state.lastMs = Number.isFinite(Number(input.nowMs)) ? Number(input.nowMs) : state.lastMs;
    return { x: state.x, y: state.y, snapped: false };
  }

  return {
    reset,
    updateTarget,
  };
}
