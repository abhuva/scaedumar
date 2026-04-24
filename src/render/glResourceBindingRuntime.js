import { createGlResourceRuntime } from "./glResourceRuntime.js";

export function createGlResourceBindingRuntime(deps) {
  const glResourceRuntime = createGlResourceRuntime({
    gl: deps.gl,
  });
  return {
    createShader: (type, src) => glResourceRuntime.createShader(type, src),
    createProgram: (vsSrc, fsSrc) => glResourceRuntime.createProgram(vsSrc, fsSrc),
    createTexture: () => glResourceRuntime.createTexture(),
    createLinearTexture: () => glResourceRuntime.createLinearTexture(),
    uploadImageToTexture: (tex, image) => glResourceRuntime.uploadImageToTexture(tex, image),
  };
}
