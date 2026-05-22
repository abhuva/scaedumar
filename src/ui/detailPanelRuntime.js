import { normalizeDetailSettings } from "../gameplay/detailDataSerializer.js";

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

function formatValue(value, format) {
  if (format === "text") return String(value);
  const num = Number(value);
  if (format === "int") return String(Math.round(num));
  if (format === "3") return num.toFixed(3);
  if (format === "1") return num.toFixed(1);
  return num.toFixed(2);
}

function readControlValue(control) {
  if (control.type === "checkbox") return Boolean(control.checked);
  if (control.tagName === "SELECT") {
    return control.dataset.detailFormat === "text" ? control.value : Number(control.value);
  }
  return Number(control.value);
}

export function createDetailPanelRuntime(deps) {
  let rebuildTimer = null;
  let dispatchFrame = null;
  let pendingControl = null;

  function getControls() {
    return Array.from(deps.document.querySelectorAll("[data-detail-path]"));
  }

  function getValueEl(control) {
    const id = control.dataset.detailValue;
    return id ? deps.document.getElementById(id) : null;
  }

  function syncDetailUi() {
    const detail = normalizeDetailSettings(deps.serializeDetailSettings(), deps.defaultDetailSettings);
    for (const control of getControls()) {
      const value = getPathValue(detail, control.dataset.detailPath || "");
      if (value === undefined) continue;
      if (control.type === "checkbox") {
        control.checked = Boolean(value);
      } else if (control.tagName === "SELECT") {
        control.value = String(value);
      } else {
        control.value = String(value);
      }
      const valueEl = getValueEl(control);
      if (valueEl) {
        valueEl.textContent = formatValue(value, control.dataset.detailFormat);
      }
    }
  }

  function dispatchFromControl(control, options = {}) {
    const current = normalizeDetailSettings(deps.serializeDetailSettings(), deps.defaultDetailSettings);
    setPathValue(current, control.dataset.detailPath || "", readControlValue(control));
    deps.dispatchCoreCommand({
      type: "core/renderFx/changed",
      section: "detail",
      patch: current,
      rebuildDetailAtlas: Boolean(options.rebuildDetailAtlas),
      source: "detailPanel",
    });
  }

  function syncControlValueLabel(control) {
    const valueEl = getValueEl(control);
    if (valueEl) {
      valueEl.textContent = formatValue(readControlValue(control), control.dataset.detailFormat);
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
      if (nextControl) {
        dispatchFromControl(nextControl, { rebuildDetailAtlas: false });
      }
    });
  }

  function bindDetailControls() {
    for (const control of getControls()) {
      const eventType = control.type === "checkbox" || control.tagName === "SELECT" ? "change" : "input";
      control.addEventListener(eventType, () => {
        const needsRebuild = control.dataset.detailRebuild === "true";
        syncControlValueLabel(control);
        if (control.type === "checkbox" || control.tagName === "SELECT") {
          dispatchFromControl(control, { rebuildDetailAtlas: false });
        } else {
          scheduleDispatch(control);
        }
        if (!needsRebuild) return;
        if (rebuildTimer) {
          deps.clearTimeout(rebuildTimer);
        }
        rebuildTimer = deps.setTimeout(() => {
          rebuildTimer = null;
          dispatchFromControl(control, { rebuildDetailAtlas: true });
        }, 180);
      });
    }
    syncDetailUi();
  }

  return {
    bindDetailControls,
    syncDetailUi,
  };
}
