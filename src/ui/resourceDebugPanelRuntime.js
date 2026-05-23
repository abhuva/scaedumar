function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function format(value, digits = 2) {
  return finite(value, 0).toFixed(digits);
}

function setRange(input, valueEl, value, digits = 2) {
  if (input) input.value = String(value);
  if (valueEl) valueEl.textContent = digits === 0 ? String(Math.round(finite(value, 0))) : format(value, digits);
}

function getActiveLayer(settings) {
  const layerId = settings && settings.activeLayer;
  const layers = settings && settings.layers ? settings.layers : {};
  return layers[layerId] || layers.wetness || {};
}

export function createResourceDebugPanelRuntime(deps) {
  const discoveryControls = [
    ["gridSize", deps.discoveryGridInput, deps.discoveryGridValue, 0],
    ["movementRevealRadius", deps.revealRadiusInput, deps.revealRadiusValue, 0],
  ];
  const layerControls = [
    ["sampleStep", deps.sampleStepInput, deps.sampleStepValue, 0],
    ["knowledgeThreshold", deps.knowledgeThresholdInput, deps.knowledgeThresholdValue, 2],
    ["lineWidth", deps.lineWidthInput, deps.lineWidthValue, 2],
    ["bandWidth", deps.bandWidthInput, deps.bandWidthValue, 3],
  ];
  const bandControls = [
    { input: deps.band1Input, value: deps.band1Value, enabled: deps.band1EnabledInput },
    { input: deps.band2Input, value: deps.band2Value, enabled: deps.band2EnabledInput },
    { input: deps.band3Input, value: deps.band3Value, enabled: deps.band3EnabledInput },
    { input: deps.band4Input, value: deps.band4Value, enabled: deps.band4EnabledInput },
    { input: deps.band5Input, value: deps.band5Value, enabled: deps.band5EnabledInput },
  ];

  function sync() {
    const settings = deps.getSettings();
    const discovery = settings.discovery || {};
    const layer = getActiveLayer(settings);
    if (deps.layerInput) deps.layerInput.value = settings.activeLayer || "wetness";
    if (deps.renderModeInput) deps.renderModeInput.value = layer.renderMode === "raster" ? "raster" : "marching";
    if (deps.tintColorInput) deps.tintColorInput.value = typeof layer.tintColor === "string" ? layer.tintColor : "#74d7f5";
    for (const [key, input, valueEl, digits] of discoveryControls) {
      setRange(input, valueEl, discovery[key], digits);
    }
    for (const [key, input, valueEl, digits] of layerControls) {
      setRange(input, valueEl, layer[key], digits);
    }
    const bands = Array.isArray(layer.bands) ? layer.bands : [];
    bandControls.forEach((control, index) => {
      const band = bands[index] || {};
      setRange(control.input, control.value, band.threshold, 2);
      if (control.enabled) control.enabled.checked = band.enabled !== false;
    });
  }

  function bindDiscoveryRange(key, input, valueEl, digits) {
    if (!input) return;
    input.addEventListener("input", () => {
      const value = digits === 0 ? Math.round(finite(input.value, 0)) : finite(input.value, 0);
      if (valueEl) valueEl.textContent = digits === 0 ? String(value) : format(value, digits);
      deps.updateDiscovery({ [key]: value });
    });
  }

  function bindLayerRange(key, input, valueEl, digits) {
    if (!input) return;
    input.addEventListener("input", () => {
      const value = digits === 0 ? Math.round(finite(input.value, 0)) : finite(input.value, 0);
      if (valueEl) valueEl.textContent = digits === 0 ? String(value) : format(value, digits);
      deps.updateActiveLayer({ [key]: value });
    });
  }

  discoveryControls.forEach(([key, input, valueEl, digits]) => bindDiscoveryRange(key, input, valueEl, digits));
  layerControls.forEach(([key, input, valueEl, digits]) => bindLayerRange(key, input, valueEl, digits));

  bandControls.forEach((control, index) => {
    if (control.input) {
      control.input.addEventListener("input", () => {
        const threshold = finite(control.input.value, 0);
        if (control.value) control.value.textContent = format(threshold, 2);
        deps.updateActiveBand(index, { threshold });
      });
    }
    if (control.enabled) {
      control.enabled.addEventListener("change", () => {
        deps.updateActiveBand(index, { enabled: control.enabled.checked });
      });
    }
  });

  if (deps.layerInput) {
    deps.layerInput.addEventListener("change", () => {
      deps.setActiveLayer(deps.layerInput.value);
      sync();
    });
  }
  if (deps.renderModeInput) {
    deps.renderModeInput.addEventListener("change", () => {
      deps.updateActiveLayer({ renderMode: deps.renderModeInput.value === "raster" ? "raster" : "marching" });
    });
  }
  if (deps.tintColorInput) {
    deps.tintColorInput.addEventListener("input", () => {
      deps.updateActiveLayer({ tintColor: deps.tintColorInput.value });
    });
  }
  if (deps.coverAllBtn) {
    deps.coverAllBtn.addEventListener("click", () => deps.fillDiscovery(0));
  }
  if (deps.uncoverAllBtn) {
    deps.uncoverAllBtn.addEventListener("click", () => deps.fillDiscovery(1));
  }

  sync();

  return {
    sync,
  };
}
