const DAY_SAMPLE_COUNT = 96;
const DEFAULT_DAY_START = 6;
const DEFAULT_DAY_END = 18;

export const GAME_TIME_SPEED_PRESETS = [
  { label: "0x", cycleSpeed: 0 },
  { label: "1x", cycleSpeed: 0.01 },
  { label: "5x", cycleSpeed: 0.05 },
  { label: "20x", cycleSpeed: 0.2 },
  { label: "100x", cycleSpeed: 1 },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapHour(hour) {
  const value = Number(hour);
  if (!Number.isFinite(value)) return 0;
  return ((value % 24) + 24) % 24;
}

function shortestForwardHours(fromHour, toHour) {
  return (wrapHour(toHour) - wrapHour(fromHour) + 24) % 24;
}

function interpolateCrossing(aHour, aAlt, bHour, bAlt) {
  const denom = aAlt - bAlt;
  const t = Math.abs(denom) > 0.000001 ? clamp(aAlt / denom, 0, 1) : 0;
  return wrapHour(aHour + shortestForwardHours(aHour, bHour) * t);
}

function getAltitude(sampleSunAtHour, hour) {
  const sample = sampleSunAtHour(wrapHour(hour));
  return Number(sample && sample.altitudeDeg) || 0;
}

export function findDaylightWindow(sampleSunAtHour) {
  if (typeof sampleSunAtHour !== "function") {
    return { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END };
  }

  const step = 24 / DAY_SAMPLE_COUNT;
  let sunrise = null;
  let sunset = null;
  let prevHour = 0;
  let prevAlt = getAltitude(sampleSunAtHour, prevHour);

  for (let i = 1; i <= DAY_SAMPLE_COUNT; i++) {
    const hour = i * step;
    const alt = getAltitude(sampleSunAtHour, hour);
    if (prevAlt <= 0 && alt > 0 && sunrise == null) {
      sunrise = interpolateCrossing(prevHour, prevAlt, hour, alt);
    }
    if (prevAlt > 0 && alt <= 0 && sunset == null) {
      sunset = interpolateCrossing(prevHour, prevAlt, hour, alt);
    }
    prevHour = hour;
    prevAlt = alt;
  }

  if (sunrise == null || sunset == null || sunrise === sunset) {
    return { start: DEFAULT_DAY_START, end: DEFAULT_DAY_END };
  }
  return { start: sunrise, end: sunset };
}

function getArcPosition(progress, topY, horizonY) {
  const arc = Math.sin(clamp(progress, 0, 1) * Math.PI);
  return horizonY - arc * (horizonY - topY);
}

function getPhase(hour, sunVisible, dayProgress, nightProgress) {
  if (sunVisible && dayProgress < 0.18) return "dawn";
  if (sunVisible && dayProgress > 0.82) return "dusk";
  if (sunVisible) return "day";
  if (nightProgress < 0.2) return "nightfall";
  if (nightProgress > 0.82) return "predawn";
  return "night";
}

function getSkyPalette(phase) {
  if (phase === "dawn") {
    return { top: "#65445f", mid: "#d07c48", bottom: "#f0b35f", glow: "rgba(248, 170, 82, 0.62)" };
  }
  if (phase === "dusk") {
    return { top: "#3d355c", mid: "#b7574c", bottom: "#e79a4e", glow: "rgba(232, 122, 70, 0.58)" };
  }
  if (phase === "day") {
    return { top: "#6ca7c9", mid: "#99c6d4", bottom: "#f2d68a", glow: "rgba(255, 225, 143, 0.38)" };
  }
  if (phase === "predawn") {
    return { top: "#17243e", mid: "#314466", bottom: "#8b5f68", glow: "rgba(178, 104, 90, 0.34)" };
  }
  if (phase === "nightfall") {
    return { top: "#121936", mid: "#273254", bottom: "#6b465b", glow: "rgba(128, 80, 116, 0.34)" };
  }
  return { top: "#071126", mid: "#101d36", bottom: "#25324a", glow: "rgba(72, 101, 150, 0.22)" };
}

export function computeGameTimeDioramaState(input) {
  const hour = wrapHour(input && input.hour);
  const sampleSunAtHour = input && input.sampleSunAtHour;
  const daylightWindow = input && input.daylightWindow
    ? input.daylightWindow
    : findDaylightWindow(sampleSunAtHour);
  const daylightDuration = Math.max(0.001, shortestForwardHours(daylightWindow.start, daylightWindow.end));
  const hoursSinceSunrise = shortestForwardHours(daylightWindow.start, hour);
  const sunSample = typeof sampleSunAtHour === "function" ? sampleSunAtHour(hour) : null;
  const sunAltitude = Number(sunSample && sunSample.altitudeDeg) || 0;
  const sunVisible = sunAltitude > 0 && hoursSinceSunrise <= daylightDuration;
  const dayProgress = clamp(hoursSinceSunrise / daylightDuration, 0, 1);

  const nightDuration = Math.max(0.001, 24 - daylightDuration);
  const nightProgress = clamp(shortestForwardHours(daylightWindow.end, hour) / nightDuration, 0, 1);
  const phase = getPhase(hour, sunVisible, dayProgress, nightProgress);
  const sky = getSkyPalette(phase);
  const sunX = 11 + dayProgress * 78;
  const moonX = 11 + nightProgress * 78;

  return {
    daylightStart: daylightWindow.start,
    daylightEnd: daylightWindow.end,
    sunVisible,
    sunX,
    sunY: getArcPosition(dayProgress, 17, 78),
    moonVisible: !sunVisible,
    moonX,
    moonY: getArcPosition(nightProgress, 22, 74),
    phase,
    skyTop: sky.top,
    skyMid: sky.mid,
    skyBottom: sky.bottom,
    horizonGlow: sky.glow,
  };
}

export function findNearestGameTimeSpeedPreset(cycleSpeed, presets = GAME_TIME_SPEED_PRESETS) {
  const speed = Number(cycleSpeed);
  if (!Number.isFinite(speed)) return null;
  let nearest = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const preset of presets) {
    const distance = Math.abs(speed - preset.cycleSpeed);
    if (distance < nearestDistance) {
      nearest = preset;
      nearestDistance = distance;
    }
  }
  return nearest && nearestDistance <= 0.005 ? nearest : null;
}

export function createGameTimeDioramaRuntime(deps) {
  const daylightWindow = findDaylightWindow(deps.sampleSunAtHour);
  const speedButtons = Array.from(deps.speedButtons || []);

  function applyState(state) {
    deps.rootEl.style.setProperty("--time-sky-top", state.skyTop);
    deps.rootEl.style.setProperty("--time-sky-mid", state.skyMid);
    deps.rootEl.style.setProperty("--time-sky-bottom", state.skyBottom);
    deps.rootEl.style.setProperty("--time-horizon-glow", state.horizonGlow);
    deps.rootEl.style.setProperty("--sun-x", `${state.sunX}%`);
    deps.rootEl.style.setProperty("--sun-y", `${state.sunY}%`);
    deps.rootEl.style.setProperty("--moon-x", `${state.moonX}%`);
    deps.rootEl.style.setProperty("--moon-y", `${state.moonY}%`);
    deps.rootEl.dataset.phase = state.phase;
    deps.sunEl.hidden = !state.sunVisible;
    deps.moonEl.hidden = !state.moonVisible;
  }

  function syncSpeedButtons(cycleSpeed) {
    const activePreset = findNearestGameTimeSpeedPreset(cycleSpeed);
    for (const button of speedButtons) {
      const isActive = Boolean(activePreset && button.dataset.speedPreset === activePreset.label);
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    }
  }

  function update(hour, cycleSpeed) {
    applyState(computeGameTimeDioramaState({
      hour,
      sampleSunAtHour: deps.sampleSunAtHour,
      daylightWindow,
    }));
    syncSpeedButtons(cycleSpeed);
  }

  function bind() {
    for (const button of speedButtons) {
      button.addEventListener("click", () => {
        const preset = GAME_TIME_SPEED_PRESETS.find((candidate) => candidate.label === button.dataset.speedPreset);
        if (!preset) return;
        deps.dispatchCoreCommand({
          type: "core/time/setCycleSpeed",
          cycleSpeed: preset.cycleSpeed,
        });
      });
    }
  }

  return {
    bind,
    update,
  };
}
