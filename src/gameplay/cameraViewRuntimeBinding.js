import { createCameraViewRuntime } from "./cameraViewRuntime.js";

export function createCameraViewRuntimeBinding(deps) {
  const cameraViewRuntime = createCameraViewRuntime({
    dispatchCoreCommand: deps.dispatchCoreCommand,
    canvas: deps.canvas,
    splatSize: deps.splatSize,
  });
  return {
    resetCamera: () => cameraViewRuntime.resetCamera(),
    getScreenAspect: () => cameraViewRuntime.getScreenAspect(),
    getMapAspect: () => cameraViewRuntime.getMapAspect(),
  };
}
