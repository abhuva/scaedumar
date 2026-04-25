export function createShadowPipelineRuntime(deps) {
  const {
    gl,
    shadowSize,
    shadowRawTex,
    shadowBlurTex,
    shadowRawFbo,
    shadowBlurFbo,
    shadowProgram,
    shadowUniforms,
    heightTex,
    getHeightSize,
    getLightingSettings,
    getShadowMapScale,
  } = deps;

  function resizeRenderTexture(tex, width, height) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Math.max(1, width), Math.max(1, height), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

  function attachColorTexture(fbo, tex) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer incomplete: ${status}`);
    }
  }

  function ensureShadowTargets() {
    const heightSize = getHeightSize();
    const shadowMapScale = getShadowMapScale();
    const targetW = Math.max(1, Math.floor(heightSize.width * shadowMapScale));
    const targetH = Math.max(1, Math.floor(heightSize.height * shadowMapScale));
    if (shadowSize.width === targetW && shadowSize.height === targetH) {
      return;
    }
    shadowSize.width = targetW;
    shadowSize.height = targetH;
    resizeRenderTexture(shadowRawTex, targetW, targetH);
    resizeRenderTexture(shadowBlurTex, targetW, targetH);
    attachColorTexture(shadowRawFbo, shadowRawTex);
    attachColorTexture(shadowBlurFbo, shadowBlurTex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function renderShadowPipeline(params) {
    const lightingSettings = getLightingSettings();
    const heightSize = getHeightSize();
    ensureShadowTargets();
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, shadowSize.width, shadowSize.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowRawFbo);
    gl.useProgram(shadowProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, heightTex);
    gl.uniform1i(shadowUniforms.uHeight, 0);
    gl.uniform2f(shadowUniforms.uMapTexelSize, 1 / heightSize.width, 1 / heightSize.height);
    gl.uniform2f(shadowUniforms.uShadowResolution, shadowSize.width, shadowSize.height);
    gl.uniform3f(shadowUniforms.uSunDir, params.sunDir[0], params.sunDir[1], params.sunDir[2]);
    gl.uniform3f(shadowUniforms.uMoonDir, params.moonDir[0], params.moonDir[1], params.moonDir[2]);
    gl.uniform1f(shadowUniforms.uHeightScale, Number(lightingSettings.heightScale));
    gl.uniform1f(shadowUniforms.uShadowStrength, Number(lightingSettings.shadowStrength));
    gl.uniform1f(shadowUniforms.uUseShadows, lightingSettings.useShadows ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  return {
    ensureShadowTargets,
    renderShadowPipeline,
  };
}
