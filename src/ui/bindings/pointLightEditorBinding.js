export function bindPointLightEditorControls(deps) {
  const requiredElements = [
    "pointLightColorInput",
    "pointLightStrengthInput",
    "pointLightIntensityInput",
    "pointLightHeightOffsetInput",
    "pointLightFlickerInput",
    "pointLightFlickerSpeedInput",
    "pointLightLiveUpdateToggle",
    "lightSaveBtn",
    "lightCancelBtn",
    "lightDeleteBtn",
    "pointLightsSaveAllBtn",
    "pointLightsLoadAllBtn",
    "pointLightsLoadInput",
  ];
  for (const key of requiredElements) {
    const element = deps[key];
    if (!element || typeof element.addEventListener !== "function") {
      console.warn(`bindPointLightEditorControls skipped: missing DOM element '${key}'.`);
      return;
    }
  }

  deps.pointLightColorInput.addEventListener("input", () => {
    if (!deps.hasLightEditDraft()) return;
    deps.setLightEditDraftColor(deps.hexToRgb01(deps.pointLightColorInput.value));
    deps.rebakeIfPointLightLiveUpdateEnabled();
    deps.requestOverlayDraw();
  });

  deps.pointLightStrengthInput.addEventListener("input", () => {
    if (!deps.hasLightEditDraft()) return;
    const value = Math.round(deps.clamp(Number(deps.pointLightStrengthInput.value), 1, 200));
    deps.setLightEditDraftStrength(value);
    deps.updatePointLightStrengthLabel(value);
    deps.rebakeIfPointLightLiveUpdateEnabled();
    deps.requestOverlayDraw();
  });

  deps.pointLightIntensityInput.addEventListener("input", () => {
    if (!deps.hasLightEditDraft()) return;
    const value = deps.clamp(Number(deps.pointLightIntensityInput.value), 0, 4);
    deps.setLightEditDraftIntensity(value);
    deps.updatePointLightIntensityLabel(value);
    deps.rebakeIfPointLightLiveUpdateEnabled();
    deps.requestOverlayDraw();
  });

  deps.pointLightHeightOffsetInput.addEventListener("input", () => {
    if (!deps.hasLightEditDraft()) return;
    const value = Math.round(deps.clamp(Number(deps.pointLightHeightOffsetInput.value), -120, 240));
    deps.setLightEditDraftHeightOffset(value);
    deps.updatePointLightHeightOffsetLabel(value);
    deps.rebakeIfPointLightLiveUpdateEnabled();
    deps.requestOverlayDraw();
  });

  deps.pointLightFlickerInput.addEventListener("input", () => {
    if (!deps.hasLightEditDraft()) return;
    const value = deps.clamp(Number(deps.pointLightFlickerInput.value), 0, 1);
    deps.setLightEditDraftFlicker(value);
    deps.updatePointLightFlickerLabel(value);
    deps.rebakeIfPointLightLiveUpdateEnabled();
    deps.requestOverlayDraw();
  });

  deps.pointLightFlickerSpeedInput.addEventListener("input", () => {
    if (!deps.hasLightEditDraft()) return;
    const value = deps.clamp(Number(deps.pointLightFlickerSpeedInput.value), 0, 1);
    deps.setLightEditDraftFlickerSpeed(value);
    deps.updatePointLightFlickerSpeedLabel(value);
    deps.rebakeIfPointLightLiveUpdateEnabled();
    deps.requestOverlayDraw();
  });

  deps.pointLightLiveUpdateToggle.addEventListener("change", () => {
    const liveUpdate = Boolean(deps.pointLightLiveUpdateToggle.checked);
    if (typeof deps.dispatchCoreCommand === "function") {
      deps.dispatchCoreCommand({
        type: "core/pointLights/setLiveUpdate",
        liveUpdate,
      });
    } else if (typeof deps.syncPointLightsStateToStore === "function") {
      deps.syncPointLightsStateToStore(liveUpdate);
    }
    if (liveUpdate) {
      deps.rebakeIfPointLightLiveUpdateEnabled();
      deps.setStatus("Point-light live update enabled.");
      return;
    }
    deps.setStatus("Point-light live update disabled. Changes apply on Save.");
  });

  deps.lightSaveBtn.addEventListener("click", () => {
    const selected = deps.applyDraftToSelectedPointLight();
    if (!selected) return;
    deps.bakePointLightsTexture();
    deps.updateLightEditorUi();
    deps.requestOverlayDraw();
    deps.setStatus(`Saved point light at (${selected.pixelX}, ${selected.pixelY})`);
  });

  deps.lightCancelBtn.addEventListener("click", () => {
    deps.clearLightEditSelection();
    deps.updateLightEditorUi();
    deps.requestOverlayDraw();
    deps.setStatus("Point light edit canceled.");
  });

  deps.lightDeleteBtn.addEventListener("click", () => {
    const selected = deps.getSelectedPointLight();
    if (!selected) return;
    deps.deletePointLightById(selected.id);
    deps.clearLightEditSelection();
    deps.bakePointLightsTexture();
    deps.updateLightEditorUi();
    deps.requestOverlayDraw();
    deps.setStatus(`Deleted point light at (${selected.pixelX}, ${selected.pixelY})`);
  });

  deps.pointLightsSaveAllBtn.addEventListener("click", async () => {
    if (!deps.isPointLightsSaveConfirmArmed()) {
      deps.armPointLightsSaveConfirmation();
      deps.setStatus("Save confirmation armed. Click Save All again within 5 seconds to overwrite/export pointlights.json.");
      return;
    }

    deps.resetPointLightsSaveConfirmation();
    try {
      await deps.savePointLightsJson();
    } catch (error) {
      if (error && error.name === "AbortError") {
        deps.setStatus("Save canceled.");
        return;
      }
      console.error("Failed to save point lights JSON", error);
      const message = error instanceof Error ? error.message : String(error);
      deps.setStatus(`Failed to save point lights JSON: ${message}`);
    }
  });

  deps.pointLightsLoadAllBtn.addEventListener("click", async () => {
    deps.resetPointLightsSaveConfirmation();
    try {
      await deps.loadPointLightsFromAssetsOrPrompt();
    } catch (error) {
      console.error("Failed to load point lights JSON", error);
      const message = error instanceof Error ? error.message : String(error);
      deps.setStatus(`Failed to load point lights JSON: ${message}`);
    }
  });

  deps.pointLightsLoadInput.addEventListener("change", async () => {
    const file = deps.pointLightsLoadInput.files && deps.pointLightsLoadInput.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawData = JSON.parse(text);
      deps.applyLoadedPointLights(rawData, file.name);
    } catch (error) {
      console.error("Failed to parse point lights JSON", error);
      const message = error instanceof Error ? error.message : String(error);
      deps.setStatus(`Failed to parse point lights JSON: ${message}`);
    } finally {
      deps.pointLightsLoadInput.value = "";
    }
  });
}
