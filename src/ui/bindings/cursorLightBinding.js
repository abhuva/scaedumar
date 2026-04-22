export function bindCursorLightControls(deps) {
  deps.cursorLightModeToggle.addEventListener("change", () => {
    const enabled = deps.cursorLightModeToggle.checked;
    deps.dispatchCoreCommand({
      type: "core/cursorLight/setEnabled",
      enabled,
    });
    if (!enabled) {
      deps.setStatus("Cursor light disabled.");
      return;
    }
    deps.setStatus("Cursor light enabled: move mouse over terrain for live point light.");
  });

  deps.cursorLightFollowHeightToggle.addEventListener("change", () => {
    deps.dispatchCoreCommand({
      type: "core/cursorLight/setTerrainFollow",
      useTerrainHeight: deps.cursorLightFollowHeightToggle.checked,
    });
  });

  deps.cursorLightColorInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({
      type: "core/cursorLight/setColor",
      colorHex: deps.cursorLightColorInput.value,
    });
  });

  deps.cursorLightStrengthInput.addEventListener("input", () => {
    const strength = Number(deps.cursorLightStrengthInput.value);
    if (!Number.isFinite(strength)) return;
    deps.dispatchCoreCommand({
      type: "core/cursorLight/setStrength",
      strength,
    });
  });

  deps.cursorLightHeightOffsetInput.addEventListener("input", () => {
    const heightOffset = Number(deps.cursorLightHeightOffsetInput.value);
    if (!Number.isFinite(heightOffset)) return;
    deps.dispatchCoreCommand({
      type: "core/cursorLight/setHeightOffset",
      heightOffset,
    });
  });

  deps.cursorLightGizmoToggle.addEventListener("change", () => {
    deps.dispatchCoreCommand({
      type: "core/cursorLight/setGizmo",
      showGizmo: deps.cursorLightGizmoToggle.checked,
    });
  });
}
