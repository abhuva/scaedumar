import { clamp } from "./mathUtils.js";

export function rgbToHex(rgb) {
  const r = Math.round(clamp(rgb[0], 0, 1) * 255);
  const g = Math.round(clamp(rgb[1], 0, 1) * 255);
  const b = Math.round(clamp(rgb[2], 0, 1) * 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgb01(hex, fallback = [0.5, 0.5, 0.5]) {
  const text = String(hex || "").trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(text);
  if (!match) return [...fallback];
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}
