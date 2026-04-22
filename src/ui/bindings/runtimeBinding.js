export function bindRuntimeControls(deps) {
  deps.heightScaleInput.addEventListener("input", deps.schedulePointLightBake);
  deps.windowEl.addEventListener("resize", deps.resize);
}
