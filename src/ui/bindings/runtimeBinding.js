export function bindRuntimeControls(deps) {
  deps.heightScaleInput.addEventListener("input", deps.schedulePointLightBake);
  deps.windowEl.addEventListener("resize", deps.resize);

  return () => {
    deps.heightScaleInput.removeEventListener("input", deps.schedulePointLightBake);
    deps.windowEl.removeEventListener("resize", deps.resize);
  };
}
