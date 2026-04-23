export function createCursorLightRuntimeState(deps) {
  const defaults = deps.defaults || {};
  const state = {
    uvX: 0.5,
    uvY: 0.5,
    enabled: Boolean(defaults.enabled),
    active: false,
    colorHex: typeof defaults.colorHex === "string" ? defaults.colorHex : "#ff9b2f",
    color: deps.hexToRgb01(typeof defaults.colorHex === "string" ? defaults.colorHex : "#ff9b2f"),
    strength: Math.round(deps.clamp(Number(defaults.strength), 1, 200)),
    heightOffset: Math.round(deps.clamp(Number(defaults.heightOffset), 0, 120)),
    useTerrainHeight: Boolean(defaults.useTerrainHeight),
    showGizmo: Boolean(defaults.showGizmo),
  };

  function clearPointer() {
    state.active = false;
  }

  function setPointerUv(uvX, uvY) {
    state.active = true;
    state.uvX = deps.clamp(Number(uvX), 0, 1);
    state.uvY = deps.clamp(Number(uvY), 0, 1);
  }

  function applyConfigSnapshot(snapshot) {
    const nextColorHex = typeof snapshot.colorHex === "string" ? snapshot.colorHex : "#ff9b2f";
    state.enabled = Boolean(snapshot.enabled);
    state.colorHex = nextColorHex;
    state.color = deps.hexToRgb01(nextColorHex);
    state.strength = Math.round(deps.clamp(Number(snapshot.strength), 1, 200));
    state.heightOffset = Math.round(deps.clamp(Number(snapshot.heightOffset), 0, 120));
    state.useTerrainHeight = Boolean(snapshot.useTerrainHeight);
    state.showGizmo = Boolean(snapshot.showGizmo);
    if (!state.enabled) {
      clearPointer();
    }
  }

  return {
    state,
    clearPointer,
    setPointerUv,
    applyConfigSnapshot,
  };
}
