export function applyPointLightUsagePass(deps) {
  deps.gl.activeTexture(deps.gl.TEXTURE3);
  deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.pointLightTex);
  deps.gl.uniform1i(deps.uniforms.uPointLightTex, 3);

  deps.gl.uniform1f(deps.uniforms.uPointFlickerEnabled, deps.pointFlickerEnabled ? 1 : 0);
  deps.gl.uniform1f(deps.uniforms.uPointFlickerStrength, deps.pointFlickerStrength);
  deps.gl.uniform1f(deps.uniforms.uPointFlickerSpeed, deps.pointFlickerSpeed);
  deps.gl.uniform1f(deps.uniforms.uPointFlickerSpatial, deps.pointFlickerSpatial);
}
