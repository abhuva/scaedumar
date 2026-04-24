export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function clampRound(v, min, max, decimals = 2) {
  const clamped = clamp(v, min, max);
  return Number(clamped.toFixed(decimals));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpVec3(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

export function lerpAngleDeg(a, b, t) {
  const delta = ((b - a + 540) % 360) - 180;
  return a + delta * t;
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function wrapHour(hour) {
  const h = hour % 24;
  return h < 0 ? h + 24 : h;
}

export function formatHour(hour) {
  const h = wrapHour(hour);
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
