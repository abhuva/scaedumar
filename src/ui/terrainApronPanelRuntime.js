import { normalizeTerrainApronSettings } from "../render/terrainApronSettings.js";

function getPathValue(source, path) {
  return path.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), source);
}

function setPathValue(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[parts[parts.length - 1]] = value;
}

function readControlValue(control) {
  if (control.type === "checkbox") return Boolean(control.checked);
  if (control.dataset.apronFormat === "text") return control.value;
  return Number(control.value);
}

function formatValue(value, format) {
  if (format === "text") return String(value);
  if (format === "int") return String(Math.round(Number(value)));
  return Number(value).toFixed(2);
}

export function createTerrainApronPanelRuntime(deps) {
  let dispatchFrame = null;
  let pendingControl = null;

  function getControls() {
    return Array.from(deps.document.querySelectorAll("[data-apron-path]"));
  }

  function getValueEl(control) {
    const id = control.dataset.apronValue;
    return id ? deps.document.getElementById(id) : null;
  }

  function syncApronUi() {
    const settings = normalizeTerrainApronSettings(deps.serializeApronSettings(), deps.defaultApronSettings);
    for (const control of getControls()) {
      const value = getPathValue(settings, control.dataset.apronPath || "");
      if (value === undefined) continue;
      if (control.type === "checkbox") {
        control.checked = Boolean(value);
      } else {
        control.value = String(value);
      }
      const valueEl = getValueEl(control);
      if (valueEl) {
        valueEl.textContent = formatValue(value, control.dataset.apronFormat);
      }
    }
    syncApronStatus();
  }

  function syncApronStatus() {
    const statusEl = deps.document.getElementById("terrainApronStatus");
    if (!statusEl || typeof deps.getApronDebugInfo !== "function") return;
    const info = deps.getApronDebugInfo();
    if (!info || typeof info !== "object") {
      statusEl.textContent = "Status: unavailable.";
      return;
    }
    if (!info.enabled) {
      statusEl.textContent = "Status: disabled.";
      return;
    }
    if (!info.hasSplatData) {
      statusEl.textContent = "Status: enabled, but no terrain splat data is available for baking.";
      return;
    }
    if (info.useAuthoredImage && !info.hasAuthoredImage) {
      statusEl.textContent = "Status: enabled, but apron.png is missing; generated apron fallback is used.";
      return;
    }
    const normalText = info.useAuthoredImage
      ? (info.hasAuthoredNormalImage ? " with apron_normals.png" : " with flat fallback normals")
      : "";
    const sourceText = info.useAuthoredImage
      ? `apron.png${info.authoredImageSize ? ` ${info.authoredImageSize}` : ""}`
      : "generated apron";
    if (info.culled) {
      const reason = info.cullReason === "terrain-covers-view"
        ? "terrain covers the full camera view"
        : "camera does not intersect the apron footprint";
      statusEl.textContent = `Status: enabled; culled because ${reason}.`;
      return;
    }
    statusEl.textContent = info.cameraSeesApron
      ? `Status: enabled; ${sourceText}${normalText} is visible in the current camera view.`
      : `Status: enabled; ${sourceText}${normalText} is active, but current camera is inside the real map.`;
  }

  function dispatchFromControl(control) {
    const current = normalizeTerrainApronSettings(deps.serializeApronSettings(), deps.defaultApronSettings);
    setPathValue(current, control.dataset.apronPath || "", readControlValue(control));
    deps.dispatchCoreCommand({
      type: "core/renderFx/changed",
      section: "apron",
      patch: current,
      source: "terrainApronPanel",
    });
  }

  function syncControlValueLabel(control) {
    const valueEl = getValueEl(control);
    if (valueEl) {
      valueEl.textContent = formatValue(readControlValue(control), control.dataset.apronFormat);
    }
  }

  function scheduleDispatch(control) {
    pendingControl = control;
    if (dispatchFrame) return;
    const schedule = deps.requestAnimationFrame || ((callback) => deps.setTimeout(callback, 16));
    dispatchFrame = schedule(() => {
      dispatchFrame = null;
      const nextControl = pendingControl;
      pendingControl = null;
      if (nextControl) dispatchFromControl(nextControl);
    });
  }

  function bindApronControls() {
    for (const control of getControls()) {
      const eventType = control.type === "checkbox" || control.tagName === "SELECT" || control.type === "color" ? "change" : "input";
      control.addEventListener(eventType, () => {
        syncControlValueLabel(control);
        if (control.type === "checkbox" || control.tagName === "SELECT" || control.type === "color") {
          dispatchFromControl(control);
        } else {
          scheduleDispatch(control);
        }
        syncApronStatus();
      });
    }
    syncApronUi();
  }

  return {
    bindApronControls,
    syncApronUi,
    syncApronStatus,
  };
}
