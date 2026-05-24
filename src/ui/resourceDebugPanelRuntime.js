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
  return layers[layerId] || layers.water || {};
}

export function createResourceDebugPanelRuntime(deps) {
  const stockControls = [
    ["gridSize", deps.stockGridSizeInput, deps.stockGridSizeValue, 0],
    ["depleteAmount", deps.stockDepleteAmountInput, deps.stockDepleteAmountValue, 0],
    ["neighborDepleteAmount", deps.stockNeighborDepleteAmountInput, deps.stockNeighborDepleteAmountValue, 0],
    ["depleteRadius", deps.stockDepleteRadiusInput, deps.stockDepleteRadiusValue, 0],
    ["replenishIntervalTicks", deps.stockReplenishIntervalInput, deps.stockReplenishIntervalValue, 0],
    ["replenishAmount", deps.stockReplenishAmountInput, deps.stockReplenishAmountValue, 0],
  ];
  const discoveryControls = [
    ["gridSize", deps.discoveryGridInput, deps.discoveryGridValue, 0],
    ["movementRevealRadius", deps.revealRadiusInput, deps.revealRadiusValue, 0],
    ["revealFalloff", deps.revealFalloffInput, deps.revealFalloffValue, 2],
    ["maskOverlayOpacity", deps.maskOverlayOpacityInput, deps.maskOverlayOpacityValue, 2],
  ];
  const decayControls = [
    ["intervalTicks", deps.decayIntervalInput, deps.decayIntervalValue, 0],
    ["amount", deps.decayAmountInput, deps.decayAmountValue, 0],
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
    const decay = discovery.decay || {};
    const layer = getActiveLayer(settings);
    if (deps.layerInput) deps.layerInput.value = settings.activeLayer || "water";
    if (deps.renderModeInput) deps.renderModeInput.value = layer.renderMode === "raster" ? "raster" : "marching";
    if (deps.tintColorInput) deps.tintColorInput.value = typeof layer.tintColor === "string" ? layer.tintColor : "#74d7f5";
    for (const [key, input, valueEl, digits] of discoveryControls) {
      setRange(input, valueEl, discovery[key], digits);
    }
    if (deps.decayEnabledInput) deps.decayEnabledInput.checked = decay.enabled !== false;
    if (deps.showMaskOverlayInput) deps.showMaskOverlayInput.checked = discovery.showMaskOverlay === true;
    for (const [key, input, valueEl, digits] of decayControls) {
      setRange(input, valueEl, decay[key], digits);
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
    syncStock();
  }

  function syncStock() {
    const resourceId = deps.stockResourceInput ? deps.stockResourceInput.value : "water";
    const stockSettings = typeof deps.getStockSettings === "function" ? deps.getStockSettings(resourceId) : {};
    for (const [key, input, valueEl, digits] of stockControls) {
      setRange(input, valueEl, stockSettings[key], digits);
    }
    if (deps.stockOverlayModeInput && typeof deps.getStockOverlayMode === "function") {
      deps.stockOverlayModeInput.value = deps.getStockOverlayMode();
    }
    if (deps.stockReadout && typeof deps.getStockReadout === "function") {
      const readout = deps.getStockReadout(resourceId);
      deps.stockReadout.textContent = readout || "Stock: -- | Known: -- | Chance: --";
    }
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

  function bindStockRange(key, input, valueEl, digits) {
    if (!input) return;
    input.addEventListener("input", () => {
      const value = digits === 0 ? Math.round(finite(input.value, 0)) : finite(input.value, 0);
      if (valueEl) valueEl.textContent = digits === 0 ? String(value) : format(value, digits);
      const resourceId = deps.stockResourceInput ? deps.stockResourceInput.value : "water";
      if (typeof deps.updateStockSettings === "function") {
        deps.updateStockSettings(resourceId, { [key]: value });
      }
      syncStock();
    });
  }

  discoveryControls.forEach(([key, input, valueEl, digits]) => bindDiscoveryRange(key, input, valueEl, digits));
  decayControls.forEach(([key, input, valueEl, digits]) => {
    if (!input) return;
    input.addEventListener("input", () => {
      const value = digits === 0 ? Math.round(finite(input.value, 0)) : finite(input.value, 0);
      if (valueEl) valueEl.textContent = digits === 0 ? String(value) : format(value, digits);
      deps.updateDiscoveryDecay({ [key]: value });
    });
  });
  layerControls.forEach(([key, input, valueEl, digits]) => bindLayerRange(key, input, valueEl, digits));
  stockControls.forEach(([key, input, valueEl, digits]) => bindStockRange(key, input, valueEl, digits));

  if (Array.isArray(deps.tabButtons) && Array.isArray(deps.tabPanels)) {
    for (const button of deps.tabButtons) {
      button.addEventListener("click", () => {
        const tab = button.dataset.rdTab || "overlay";
        for (const item of deps.tabButtons) {
          const active = item.dataset.rdTab === tab;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        }
        for (const panel of deps.tabPanels) {
          panel.classList.toggle("active", panel.dataset.rdPanel === tab);
        }
      });
    }
  }

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
  if (deps.decayEnabledInput) {
    deps.decayEnabledInput.addEventListener("change", () => {
      deps.updateDiscoveryDecay({ enabled: deps.decayEnabledInput.checked });
    });
  }
  if (deps.showMaskOverlayInput) {
    deps.showMaskOverlayInput.addEventListener("change", () => {
      deps.updateDiscovery({ showMaskOverlay: deps.showMaskOverlayInput.checked });
    });
  }
  if (deps.coverAllBtn) {
    deps.coverAllBtn.addEventListener("click", () => deps.fillDiscovery(0));
  }
  if (deps.uncoverAllBtn) {
    deps.uncoverAllBtn.addEventListener("click", () => deps.fillDiscovery(1));
  }
  if (deps.saveSettingsBtn) {
    deps.saveSettingsBtn.addEventListener("click", () => {
      if (typeof deps.saveSettings === "function") {
        deps.saveSettings();
      }
    });
  }
  if (deps.stockResourceInput) {
    deps.stockResourceInput.addEventListener("change", syncStock);
  }
  if (deps.stockOverlayModeInput) {
    deps.stockOverlayModeInput.addEventListener("change", () => {
      if (typeof deps.setStockOverlayMode === "function") {
        deps.setStockOverlayMode(deps.stockOverlayModeInput.value);
      }
      syncStock();
    });
  }
  if (deps.stockDepleteHereBtn) {
    deps.stockDepleteHereBtn.addEventListener("click", () => {
      if (typeof deps.depleteStockAtPlayer === "function") {
        deps.depleteStockAtPlayer(deps.stockResourceInput ? deps.stockResourceInput.value : "water");
      }
      syncStock();
    });
  }
  if (deps.stockRevealHereBtn) {
    deps.stockRevealHereBtn.addEventListener("click", () => {
      if (typeof deps.revealStockAtPlayer === "function") {
        deps.revealStockAtPlayer(deps.stockResourceInput ? deps.stockResourceInput.value : "water");
      }
      syncStock();
    });
  }
  if (deps.stockFillFullBtn) {
    deps.stockFillFullBtn.addEventListener("click", () => {
      if (typeof deps.fillStock === "function") deps.fillStock(deps.stockResourceInput ? deps.stockResourceInput.value : "water", 255);
      syncStock();
    });
  }
  if (deps.stockFillEmptyBtn) {
    deps.stockFillEmptyBtn.addEventListener("click", () => {
      if (typeof deps.fillStock === "function") deps.fillStock(deps.stockResourceInput ? deps.stockResourceInput.value : "water", 0);
      syncStock();
    });
  }
  if (deps.stockResetBtn) {
    deps.stockResetBtn.addEventListener("click", () => {
      if (typeof deps.resetStock === "function") deps.resetStock(deps.stockResourceInput ? deps.stockResourceInput.value : "water");
      syncStock();
    });
  }

  sync();

  return {
    sync,
    syncStock,
  };
}
