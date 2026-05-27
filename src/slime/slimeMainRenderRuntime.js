import { createSlimeGpuRuntime } from "./slimeGpuRuntime.js";

export function createSlimeMainRenderRuntime(deps = {}) {
  return createSlimeGpuRuntime({
    ...deps,
    headless: true,
  });
}
