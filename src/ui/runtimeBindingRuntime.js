import { bindRuntimeControls } from "./bindings/runtimeBinding.js";

export function bindRuntimeBindingRuntime(deps) {
  bindRuntimeControls({
    windowEl: deps.windowEl,
    heightScaleInput: deps.heightScaleInput,
    schedulePointLightBake: deps.schedulePointLightBake,
    resize: deps.resize,
  });
}
