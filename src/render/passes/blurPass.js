export function createBlurPass(deps) {
  return {
    execute() {
      const blurRadiusPx = deps.getBlurRadiusPx();
      if (blurRadiusPx <= 0.001) {
        deps.gl.bindFramebuffer(deps.gl.FRAMEBUFFER, null);
        return;
      }

      deps.gl.viewport(0, 0, deps.shadowSize.width, deps.shadowSize.height);
      deps.gl.bindFramebuffer(deps.gl.FRAMEBUFFER, deps.shadowBlurFbo);
      deps.gl.useProgram(deps.shadowBlurProgram);
      deps.gl.activeTexture(deps.gl.TEXTURE0);
      deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.shadowRawTex);
      deps.gl.uniform1i(deps.shadowBlurUniforms.uShadowRawTex, 0);
      deps.gl.uniform2f(deps.shadowBlurUniforms.uShadowResolution, deps.shadowSize.width, deps.shadowSize.height);
      deps.gl.uniform1f(deps.shadowBlurUniforms.uBlurRadiusPx, blurRadiusPx);
      deps.gl.drawArrays(deps.gl.TRIANGLES, 0, 6);
      deps.gl.bindFramebuffer(deps.gl.FRAMEBUFFER, null);
    },
  };
}
