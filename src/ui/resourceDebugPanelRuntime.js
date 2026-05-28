function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function format(value, digits = 2) {
  return finite(value, 0).toFixed(digits);
}

function setRange(input, valueEl, value, digits = 2) {
  if (input) {
    const numeric = Number(value);
    input.value = value != null && Number.isFinite(numeric) ? String(value) : "";
  }
  if (valueEl) {
    const numeric = finite(value, 0);
    valueEl.textContent = digits === 0 ? String(Math.round(numeric)) : format(numeric, digits);
  }
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
  const visibilityControls = [
    ["ditherScale", deps.discoveryVisibilityDitherScaleInput, deps.discoveryVisibilityDitherScaleValue, 2],
    ["knowledgeGamma", deps.discoveryVisibilityKnowledgeGammaInput, deps.discoveryVisibilityKnowledgeGammaValue, 2],
    ["baseVisibility", deps.discoveryVisibilityBaseInput, deps.discoveryVisibilityBaseValue, 2],
    ["fullVisibilityThreshold", deps.discoveryVisibilityFullThresholdInput, deps.discoveryVisibilityFullThresholdValue, 2],
    ["unknownDarkness", deps.discoveryVisibilityUnknownDarknessInput, deps.discoveryVisibilityUnknownDarknessValue, 2],
    ["noiseSeed", deps.discoveryNoiseSeedInput, deps.discoveryNoiseSeedValue, 0],
    ["noiseScale", deps.discoveryNoiseScaleInput, deps.discoveryNoiseScaleValue, 0],
    ["noiseMin", deps.discoveryNoiseMinInput, deps.discoveryNoiseMinValue, 2],
    ["noiseMax", deps.discoveryNoiseMaxInput, deps.discoveryNoiseMaxValue, 2],
  ];
  const layerControls = [
    ["sampleStep", deps.sampleStepInput, deps.sampleStepValue, 0],
    ["knowledgeThreshold", deps.knowledgeThresholdInput, deps.knowledgeThresholdValue, 2],
    ["lineWidth", deps.lineWidthInput, deps.lineWidthValue, 2],
  ];
  const routeControls = [
    ["arrowSpacing", deps.routeArrowSpacingInput, deps.routeArrowSpacingValue, 0],
    ["arrowOpacity", deps.routeArrowOpacityInput, deps.routeArrowOpacityValue, 2],
    ["arrowSize", deps.routeArrowSizeInput, deps.routeArrowSizeValue, 1],
    ["endpointSkipRatio", deps.routeEndpointSkipRatioInput, deps.routeEndpointSkipRatioValue, 2],
    ["previewPointRadius", deps.routePreviewPointRadiusInput, deps.routePreviewPointRadiusValue, 1],
    ["previewOpacity", deps.routePreviewOpacityInput, deps.routePreviewOpacityValue, 2],
    ["discoveryCutoff", deps.routeDiscoveryCutoffInput, deps.routeDiscoveryCutoffValue, 2],
    ["planningSlopeMul", deps.routePlanningSlopeMulInput, deps.routePlanningSlopeMulValue, 2],
    ["planningHeightMul", deps.routePlanningHeightMulInput, deps.routePlanningHeightMulValue, 2],
    ["planningWaterMul", deps.routePlanningWaterMulInput, deps.routePlanningWaterMulValue, 2],
    ["planningSlopeCutoffAdd", deps.routePlanningSlopeCutoffAddInput, deps.routePlanningSlopeCutoffAddValue, 2],
  ];
  const bandControls = [
    { input: deps.band1Input, value: deps.band1Value, enabled: deps.band1EnabledInput },
    { input: deps.band2Input, value: deps.band2Value, enabled: deps.band2EnabledInput },
    { input: deps.band3Input, value: deps.band3Value, enabled: deps.band3EnabledInput },
    { input: deps.band4Input, value: deps.band4Value, enabled: deps.band4EnabledInput },
    { input: deps.band5Input, value: deps.band5Value, enabled: deps.band5EnabledInput },
  ];

  function bindTabList(buttons, panels, buttonDatasetKey, panelDatasetKey, fallbackTab) {
    if (!Array.isArray(buttons) || !Array.isArray(panels)) return;
    const selectTab = (tab, options = {}) => {
      for (const item of buttons) {
        const active = item.dataset[buttonDatasetKey] === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
        item.setAttribute("tabindex", active ? "0" : "-1");
      }
      for (const panel of panels) {
        const active = panel.dataset[panelDatasetKey] === tab;
        panel.classList.toggle("active", active);
        panel.setAttribute("aria-hidden", active ? "false" : "true");
      }
      if (options.focus) {
        const activeButton = buttons.find((button) => button.dataset[buttonDatasetKey] === tab);
        activeButton?.focus?.();
      }
    };
    for (const button of buttons) {
      button.addEventListener("click", () => {
        selectTab(button.dataset[buttonDatasetKey] || fallbackTab);
      });
      button.addEventListener("keydown", (event) => {
        const currentIndex = buttons.indexOf(button);
        if (currentIndex < 0) return;
        let nextIndex = currentIndex;
        if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
        else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = buttons.length - 1;
        else return;
        event.preventDefault();
        selectTab(buttons[nextIndex].dataset[buttonDatasetKey] || fallbackTab, { focus: true });
      });
    }
  }

  function bindScopedTabGroups(groups) {
    if (!Array.isArray(groups)) return false;
    let boundAny = false;
    for (const group of groups) {
      const buttons = Array.from(group.querySelectorAll("[data-rd-tab]"));
      const panels = buttons
        .map((button) => {
          const id = button.getAttribute("aria-controls");
          return id ? document.getElementById(id) : null;
        })
        .filter(Boolean);
      if (buttons.length === 0 || panels.length === 0) continue;
      const fallbackTab = group.dataset.rdTabFallback || buttons[0].dataset.rdTab || "knowledge";
      bindTabList(buttons, panels, "rdTab", "rdPanel", fallbackTab);
      boundAny = true;
    }
    return boundAny;
  }

  function sync() {
    const settings = deps.getSettings();
    const discovery = settings.discovery || {};
    const decay = discovery.decay || {};
    const visibility = discovery.terrainVisibility || {};
    const layer = getActiveLayer(settings);
    if (deps.layerInput) deps.layerInput.value = settings.activeLayer || "water";
    if (deps.tintColorInput) deps.tintColorInput.value = typeof layer.tintColor === "string" ? layer.tintColor : "#74d7f5";
    for (const [key, input, valueEl, digits] of discoveryControls) {
      setRange(input, valueEl, discovery[key], digits);
    }
    if (deps.decayEnabledInput) deps.decayEnabledInput.checked = decay.enabled !== false;
    if (deps.showMaskOverlayInput) deps.showMaskOverlayInput.checked = discovery.showMaskOverlay === true;
    if (deps.discoveryVisibilityEnabledInput) deps.discoveryVisibilityEnabledInput.checked = visibility.enabled === true;
    if (deps.discoveryVisibilityResourceInput) deps.discoveryVisibilityResourceInput.value = visibility.resourceId || "world";
    if (deps.discoveryVisibilityModeInput) deps.discoveryVisibilityModeInput.value = visibility.mode || "black";
    for (const [key, input, valueEl, digits] of decayControls) {
      setRange(input, valueEl, decay[key], digits);
    }
    for (const [key, input, valueEl, digits] of visibilityControls) {
      setRange(input, valueEl, visibility[key], digits);
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
    syncRoute();
  }

  function syncStock() {
    const resourceId = deps.stockResourceInput ? deps.stockResourceInput.value : "water";
    const rawStockSettings = typeof deps.getStockSettings === "function" ? deps.getStockSettings(resourceId) : {};
    const stockSettings = rawStockSettings && typeof rawStockSettings === "object" ? rawStockSettings : {};
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

  function syncRoute() {
    const settings = typeof deps.getRouteSettings === "function" ? deps.getRouteSettings() : {};
    if (deps.routeArrowColorInput) deps.routeArrowColorInput.value = settings.arrowColor || "#ffffff";
    if (deps.routeDebugOverlayModeInput) deps.routeDebugOverlayModeInput.value = settings.debugOverlayMode || "none";
    for (const [key, input, valueEl, digits] of routeControls) {
      setRange(input, valueEl, settings[key], digits);
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
  visibilityControls.forEach(([key, input, valueEl, digits]) => {
    if (!input) return;
    input.addEventListener("input", () => {
      const value = digits === 0 ? Math.round(finite(input.value, 0)) : finite(input.value, 0);
      if (valueEl) valueEl.textContent = digits === 0 ? String(value) : format(value, digits);
      deps.updateDiscoveryVisibility?.({ [key]: value });
    });
  });
  layerControls.forEach(([key, input, valueEl, digits]) => bindLayerRange(key, input, valueEl, digits));
  stockControls.forEach(([key, input, valueEl, digits]) => bindStockRange(key, input, valueEl, digits));
  routeControls.forEach(([key, input, valueEl, digits]) => {
    if (!input) return;
    input.addEventListener("input", () => {
      const value = digits === 0 ? Math.round(finite(input.value, 0)) : finite(input.value, 0);
      if (valueEl) valueEl.textContent = digits === 0 ? String(value) : format(value, digits);
      deps.updateRouteSettings?.({ [key]: value });
    });
  });
  bindTabList(deps.devTabButtons, deps.devTabPanels, "rdDevTab", "rdDevPanel", "gameplay");
  if (!bindScopedTabGroups(deps.tabGroups)) {
    bindTabList(deps.tabButtons, deps.tabPanels, "rdTab", "rdPanel", "knowledge");
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
  if (deps.discoveryVisibilityEnabledInput) {
    deps.discoveryVisibilityEnabledInput.addEventListener("change", () => {
      deps.updateDiscoveryVisibility?.({ enabled: deps.discoveryVisibilityEnabledInput.checked });
    });
  }
  if (deps.discoveryVisibilityResourceInput) {
    deps.discoveryVisibilityResourceInput.addEventListener("change", () => {
      deps.updateDiscoveryVisibility?.({ resourceId: deps.discoveryVisibilityResourceInput.value || "world" });
      sync();
    });
  }
  if (deps.discoveryVisibilityModeInput) {
    deps.discoveryVisibilityModeInput.addEventListener("change", () => {
      deps.updateDiscoveryVisibility?.({ mode: deps.discoveryVisibilityModeInput.value || "black" });
    });
  }
  if (deps.discoveryNoiseApplyBtn) {
    deps.discoveryNoiseApplyBtn.addEventListener("click", () => {
      deps.fillDiscoveryNoise?.();
      sync();
    });
  }
  if (deps.discoveryFillKnownBtn) {
    deps.discoveryFillKnownBtn.addEventListener("click", () => {
      deps.fillVisibilityDiscovery?.(1);
      sync();
    });
  }
  if (deps.discoveryFillUnknownBtn) {
    deps.discoveryFillUnknownBtn.addEventListener("click", () => {
      deps.fillVisibilityDiscovery?.(0);
      sync();
    });
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
  if (deps.routeArrowColorInput) {
    deps.routeArrowColorInput.addEventListener("input", () => {
      deps.updateRouteSettings?.({ arrowColor: deps.routeArrowColorInput.value });
    });
  }
  if (deps.routeDebugOverlayModeInput) {
    deps.routeDebugOverlayModeInput.addEventListener("change", () => {
      deps.updateRouteSettings?.({ debugOverlayMode: deps.routeDebugOverlayModeInput.value });
    });
  }
  if (deps.routeClearBtn) {
    deps.routeClearBtn.addEventListener("click", () => {
      deps.clearRoute?.();
      syncRoute();
    });
  }

  sync();

  return {
    sync,
    syncStock,
    syncRoute,
  };
}
