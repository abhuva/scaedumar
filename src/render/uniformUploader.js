export function createTerrainUniformUploader(deps) {
  function getRect(state, layer, index) {
    const rects = layer === "macro" ? state.macroRects : state.microRects;
    const rect = Array.isArray(rects) ? rects[index] : null;
    return Array.isArray(rect) && rect.length >= 4 ? rect : [0, 0, 1, 1];
  }

  return function uploadUniforms(params, frameTime, input, frameCamera = null) {
    const cameraZoom = frameCamera && Number.isFinite(Number(frameCamera.zoom))
      ? Number(frameCamera.zoom)
      : 1;
    const cameraPanX = frameCamera && Number.isFinite(Number(frameCamera.panX))
      ? Number(frameCamera.panX)
      : 0;
    const cameraPanY = frameCamera && Number.isFinite(Number(frameCamera.panY))
      ? Number(frameCamera.panY)
      : 0;

    deps.gl.useProgram(deps.program);
    deps.gl.activeTexture(deps.gl.TEXTURE0);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.splatTex);
    deps.gl.uniform1i(deps.uniforms.uSplat, 0);

    deps.gl.activeTexture(deps.gl.TEXTURE1);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.normalsTex);
    deps.gl.uniform1i(deps.uniforms.uNormals, 1);

    deps.gl.activeTexture(deps.gl.TEXTURE2);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.heightTex);
    deps.gl.uniform1i(deps.uniforms.uHeight, 2);

    deps.applyPointLightUsagePass({
      gl: deps.gl,
      uniforms: deps.uniforms,
      pointLightTex: deps.pointLightTex,
      pointFlickerEnabled: input.pointFlickerEnabled,
      pointFlickerStrength: input.pointFlickerStrength,
      pointFlickerSpeed: input.pointFlickerSpeed,
      pointFlickerSpatial: input.pointFlickerSpatial,
    });

    deps.gl.activeTexture(deps.gl.TEXTURE4);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.cloudNoiseTex);
    deps.gl.uniform1i(deps.uniforms.uCloudNoiseTex, 4);

    deps.gl.activeTexture(deps.gl.TEXTURE5);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, input.shadowBlurPx > 0.001 ? deps.shadowBlurTex : deps.shadowRawTex);
    deps.gl.uniform1i(deps.uniforms.uShadowTex, 5);

    deps.gl.activeTexture(deps.gl.TEXTURE6);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.waterTex);
    deps.gl.uniform1i(deps.uniforms.uWater, 6);

    deps.gl.activeTexture(deps.gl.TEXTURE7);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.flowMapTex);
    deps.gl.uniform1i(deps.uniforms.uFlowMap, 7);

    deps.gl.activeTexture(deps.gl.TEXTURE8);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.detailMicroColorTex);
    deps.gl.uniform1i(deps.uniforms.uDetailMicroColor, 8);

    deps.gl.activeTexture(deps.gl.TEXTURE9);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.detailMacroColorTex);
    deps.gl.uniform1i(deps.uniforms.uDetailMacroColor, 9);

    const viewHalf = deps.getViewHalfExtents(cameraZoom);
    deps.gl.uniform2f(deps.uniforms.uMapTexelSize, 1 / deps.heightSize.width, 1 / deps.heightSize.height);
    deps.gl.uniform2f(deps.uniforms.uResolution, deps.canvas.width, deps.canvas.height);
    deps.gl.uniform3f(deps.uniforms.uSunDir, params.sunDir[0], params.sunDir[1], params.sunDir[2]);
    deps.gl.uniform3f(deps.uniforms.uSunColor, params.sun.sunColor[0], params.sun.sunColor[1], params.sun.sunColor[2]);
    deps.gl.uniform1f(deps.uniforms.uSunStrength, params.sunStrength);
    deps.gl.uniform3f(deps.uniforms.uMoonDir, params.moonDir[0], params.moonDir[1], params.moonDir[2]);
    deps.gl.uniform3f(deps.uniforms.uMoonColor, params.moonColor[0], params.moonColor[1], params.moonColor[2]);
    deps.gl.uniform1f(deps.uniforms.uMoonStrength, params.moonStrength);
    deps.gl.uniform3f(deps.uniforms.uAmbientColor, params.ambientColor[0], params.ambientColor[1], params.ambientColor[2]);
    deps.gl.uniform1f(deps.uniforms.uAmbient, params.ambientFinal);
    deps.gl.uniform1f(deps.uniforms.uHeightScale, input.heightScale);
    deps.gl.uniform1f(deps.uniforms.uShadowStrength, input.shadowStrength);
    deps.gl.uniform1f(deps.uniforms.uUseShadows, input.useShadows ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uUseParallax, input.useParallax ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uParallaxStrength, input.parallaxStrength);
    deps.gl.uniform1f(deps.uniforms.uParallaxBands, input.parallaxBands);
    deps.gl.uniform1f(deps.uniforms.uZoom, cameraZoom);
    const detailState = deps.detailAtlasState || {};
    const useDetail = input.useDetail && detailState.available;
    const dirtMicroRect = getRect(detailState, "micro", 0);
    const rockMicroRect = getRect(detailState, "micro", 1);
    const dirtMacroRect = getRect(detailState, "macro", 0);
    const rockMacroRect = getRect(detailState, "macro", 1);
    deps.gl.uniform1f(deps.uniforms.uUseDetail, useDetail ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uDetailStartPxPerMeter, input.detailStartPxPerMeter);
    deps.gl.uniform1f(deps.uniforms.uDetailFullPxPerMeter, input.detailFullPxPerMeter);
    deps.gl.uniform1f(deps.uniforms.uDetailWaterSuppression, input.detailWaterSuppression);
    deps.gl.uniform1f(deps.uniforms.uDetailRockSlopeStart, input.detailRockSlopeStart);
    deps.gl.uniform1f(deps.uniforms.uDetailRockSlopeEnd, input.detailRockSlopeEnd);
    deps.gl.uniform1f(deps.uniforms.uDetailRockNoiseScale, input.detailRockNoiseScale);
    deps.gl.uniform1f(deps.uniforms.uDetailRockNoiseStrength, input.detailRockNoiseStrength);
    deps.gl.uniform4f(deps.uniforms.uDetailDirtMicroRect, dirtMicroRect[0], dirtMicroRect[1], dirtMicroRect[2], dirtMicroRect[3]);
    deps.gl.uniform4f(deps.uniforms.uDetailRockMicroRect, rockMicroRect[0], rockMicroRect[1], rockMicroRect[2], rockMicroRect[3]);
    deps.gl.uniform4f(deps.uniforms.uDetailDirtMacroRect, dirtMacroRect[0], dirtMacroRect[1], dirtMacroRect[2], dirtMacroRect[3]);
    deps.gl.uniform4f(deps.uniforms.uDetailRockMacroRect, rockMacroRect[0], rockMacroRect[1], rockMacroRect[2], rockMacroRect[3]);
    deps.gl.uniform4f(
      deps.uniforms.uDetailMicroScales,
      input.detailDirtMicroScale,
      input.detailRockMicroScale,
      input.detailDirtMicroColor,
      input.detailRockMicroColor,
    );
    deps.gl.uniform4f(
      deps.uniforms.uDetailMacroScales,
      input.detailDirtMacroScale,
      input.detailRockMacroScale,
      input.detailDirtMacroColor,
      input.detailRockMacroColor,
    );
    deps.gl.uniform1f(deps.uniforms.uUseFog, input.useFog ? 1 : 0);
    deps.gl.uniform3f(deps.uniforms.uFogColor, params.fogColor[0], params.fogColor[1], params.fogColor[2]);
    deps.gl.uniform1f(deps.uniforms.uFogMinAlpha, input.fogMinAlpha);
    deps.gl.uniform1f(deps.uniforms.uFogMaxAlpha, input.fogMaxAlpha);
    deps.gl.uniform1f(deps.uniforms.uFogFalloff, input.fogFalloff);
    deps.gl.uniform1f(deps.uniforms.uFogStartOffset, input.fogStartOffset);
    deps.gl.uniform1f(deps.uniforms.uCameraHeightNorm, params.cameraHeightNorm);
    deps.gl.uniform1f(deps.uniforms.uUseVolumetric, input.useVolumetric ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uVolumetricStrength, input.volumetricStrength);
    deps.gl.uniform1f(deps.uniforms.uVolumetricDensity, input.volumetricDensity);
    deps.gl.uniform1f(deps.uniforms.uVolumetricAnisotropy, input.volumetricAnisotropy);
    deps.gl.uniform1f(deps.uniforms.uVolumetricLength, input.volumetricLength);
    deps.gl.uniform1f(deps.uniforms.uVolumetricSamples, input.volumetricSamples);
    deps.gl.uniform1f(deps.uniforms.uMapAspect, input.mapAspect);
    deps.gl.uniform1f(deps.uniforms.uUseCursorLight, input.useCursorLight ? 1 : 0);
    deps.gl.uniform2f(deps.uniforms.uCursorLightUv, deps.cursorLightState.uvX, deps.cursorLightState.uvY);
    deps.gl.uniform3f(
      deps.uniforms.uCursorLightColor,
      deps.cursorLightState.color[0],
      deps.cursorLightState.color[1],
      deps.cursorLightState.color[2],
    );
    deps.gl.uniform1f(deps.uniforms.uCursorLightStrength, deps.cursorLightState.strength);
    deps.gl.uniform1f(deps.uniforms.uCursorLightHeightOffset, deps.cursorLightState.heightOffset);
    deps.gl.uniform1f(deps.uniforms.uUseCursorTerrainHeight, deps.cursorLightState.useTerrainHeight ? 1 : 0);
    deps.gl.uniform2f(deps.uniforms.uCursorLightMapSize, deps.splatSize.width, deps.splatSize.height);
    deps.gl.uniform2f(deps.uniforms.uViewHalfExtents, viewHalf.x, viewHalf.y);
    deps.gl.uniform2f(deps.uniforms.uPanWorld, cameraPanX, cameraPanY);

    const nowSec = Math.max(0, Number(frameTime && frameTime.nowSec) || 0);
    deps.gl.uniform1f(deps.uniforms.uTimeSec, nowSec);
    deps.gl.uniform1f(deps.uniforms.uCloudTimeSec, Math.max(0, Number(input.cloudTimeSec) || 0));
    deps.gl.uniform1f(deps.uniforms.uWaterTimeSec, Math.max(0, Number(input.waterTimeSec) || 0));
    deps.gl.uniform1f(deps.uniforms.uUseClouds, input.useClouds ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uCloudCoverage, input.cloudCoverage);
    deps.gl.uniform1f(deps.uniforms.uCloudSoftness, input.cloudSoftness);
    deps.gl.uniform1f(deps.uniforms.uCloudOpacity, input.cloudOpacity);
    deps.gl.uniform1f(deps.uniforms.uCloudScale, input.cloudScale);
    deps.gl.uniform1f(deps.uniforms.uCloudSpeed1, input.cloudSpeed1);
    deps.gl.uniform1f(deps.uniforms.uCloudSpeed2, input.cloudSpeed2);
    deps.gl.uniform1f(deps.uniforms.uCloudSunParallax, input.cloudSunParallax);
    deps.gl.uniform1f(deps.uniforms.uCloudUseSunProjection, input.cloudUseSunProjection ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uUseWaterFx, input.useWaterFx ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowDownhill, input.waterFlowDownhill ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowInvertDownhill, input.waterFlowInvertDownhill ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowDebug, input.waterFlowDebug ? 1 : 0);
    deps.gl.uniform2f(deps.uniforms.uWaterFlowDir, input.waterFlowDirX, input.waterFlowDirY);
    deps.gl.uniform1f(deps.uniforms.uWaterLocalFlowMix, input.waterLocalFlowMix);
    deps.gl.uniform1f(deps.uniforms.uWaterDownhillBoost, input.waterDownhillBoost);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowStrength, input.waterFlowStrength);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowSpeed, input.waterFlowSpeed);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowScale, input.waterFlowScale);
    deps.gl.uniform1f(deps.uniforms.uWaterShimmerStrength, input.waterShimmerStrength);
    deps.gl.uniform1f(deps.uniforms.uWaterGlintStrength, input.waterGlintStrength);
    deps.gl.uniform1f(deps.uniforms.uWaterGlintSharpness, input.waterGlintSharpness);
    deps.gl.uniform1f(deps.uniforms.uWaterShoreFoamStrength, input.waterShoreFoamStrength);
    deps.gl.uniform1f(deps.uniforms.uWaterShoreWidth, input.waterShoreWidth);
    deps.gl.uniform1f(deps.uniforms.uWaterReflectivity, input.waterReflectivity);
    const waterTintColor = input.waterTintColor;
    deps.gl.uniform3f(deps.uniforms.uWaterTintColor, waterTintColor[0], waterTintColor[1], waterTintColor[2]);
    deps.gl.uniform1f(deps.uniforms.uWaterTintStrength, input.waterTintStrength);
    deps.gl.uniform3f(deps.uniforms.uSkyColor, params.skyColor[0], params.skyColor[1], params.skyColor[2]);
  };
}
