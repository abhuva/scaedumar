export function createPointLightEditorController(deps) {
  function notifySelectionChanged() {
    if (typeof deps.onSelectionChanged === "function") {
      deps.onSelectionChanged();
    }
  }

  function getSelectedPointLight() {
    return deps.editorState.getSelectedLight(deps.pointLights);
  }

  function clearLightEditSelection() {
    deps.editorState.clearSelection();
    notifySelectionChanged();
  }

  function setLightEditSelection(light) {
    deps.editorState.setSelection(light);
    notifySelectionChanged();
  }

  function beginLightEdit(light) {
    setLightEditSelection(light);
  }

  function applyDraftToSelectedPointLight() {
    const selected = getSelectedPointLight();
    return deps.editorState.applyDraftToLight(selected);
  }

  function rebakeIfPointLightLiveUpdateEnabled() {
    if (!deps.isPointLightLiveUpdateEnabled()) return;
    if (!applyDraftToSelectedPointLight()) return;
    deps.schedulePointLightBake();
  }

  function findPointLightAtPixel(pixelX, pixelY, radiusPx = deps.selectRadiusPx) {
    if (!Number.isFinite(radiusPx)) return null;
    const maxDistSq = radiusPx * radiusPx;
    let best = null;
    let bestDistSq = Infinity;
    for (const light of deps.pointLights) {
      const dx = light.pixelX - pixelX;
      const dy = light.pixelY - pixelY;
      const distSq = dx * dx + dy * dy;
      if (distSq > maxDistSq || distSq >= bestDistSq) continue;
      bestDistSq = distSq;
      best = light;
    }
    return best;
  }

  function createPointLight(pixelX, pixelY) {
    const light = {
      id: deps.nextLightId(),
      pixelX,
      pixelY,
      strength: 30,
      intensity: 1,
      heightOffset: 8,
      flicker: deps.defaultFlicker,
      flickerSpeed: deps.defaultFlickerSpeed,
      color: deps.hexToRgb01("#ff9b2f"),
    };
    deps.pointLights.push(light);
    deps.bakePointLightsTexture();
    beginLightEdit(light);
    deps.setStatus(`Created point light at (${pixelX}, ${pixelY})`);
  }

  function deletePointLightById(id) {
    const idx = deps.pointLights.findIndex((light) => light.id === id);
    if (idx < 0) return false;
    const removedWasSelected = deps.editorState.isSelectedLight(deps.pointLights[idx]);
    deps.pointLights.splice(idx, 1);
    deps.bakePointLightsTexture();
    const nextSelected = removedWasSelected
      ? (deps.pointLights[Math.min(idx, Math.max(0, deps.pointLights.length - 1))] || null)
      : getSelectedPointLight();
    if (removedWasSelected) {
      if (nextSelected) {
        deps.editorState.setSelection(nextSelected);
      } else {
        deps.editorState.clearSelection();
      }
    }
    applyDraftToSelectedPointLight();
    notifySelectionChanged();
    deps.setStatus("Point light deleted");
    return true;
  }

  return {
    getSelectedPointLight,
    clearLightEditSelection,
    setLightEditSelection,
    beginLightEdit,
    applyDraftToSelectedPointLight,
    rebakeIfPointLightLiveUpdateEnabled,
    findPointLightAtPixel,
    createPointLight,
    deletePointLightById,
  };
}
