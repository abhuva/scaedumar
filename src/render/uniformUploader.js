export function createTerrainUniformUploader(deps) {
  function finite(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getRect(state, index) {
    const rects = state.microRects;
    const rect = Array.isArray(rects) ? rects[index] : null;
    return Array.isArray(rect) && rect.length >= 4 ? rect : [0, 0, 1, 1];
  }

  function uploadRect(uniform, rect) {
    deps.gl.uniform4f(uniform, rect[0], rect[1], rect[2], rect[3]);
  }

  function smoothstepValue(edge0, edge1, value) {
    const span = Math.max(0.0001, Number(edge1) - Number(edge0));
    const t = Math.min(1, Math.max(0, (Number(value) - Number(edge0)) / span));
    return t * t * (3 - 2 * t);
  }

  function discoveryVisibilityModeToUniform(mode) {
    if (mode === "greyscale") return 1;
    if (mode === "desaturate") return 2;
    if (mode === "debug") return 3;
    return 0;
  }

  function uploadDiscoveryMask(snapshot) {
    if (!deps.discoveryMaskTex || !snapshot || !snapshot.cells || !snapshot.width || !snapshot.height) return false;
    const width = Math.max(1, Math.round(finite(snapshot.width, 1)));
    const height = Math.max(1, Math.round(finite(snapshot.height, 1)));
    const version = snapshot.version == null ? 0 : snapshot.version;
    const versionKey = `${snapshot.resourceId || ""}|${width}x${height}|${version}`;
    const state = deps.discoveryMaskTextureState || {};
    deps.gl.activeTexture(deps.gl.TEXTURE11);
    if (state.versionKey !== versionKey) {
      const pixelCount = width * height;
      const upload = new Uint8Array(pixelCount * 4);
      for (let i = 0, j = 0; i < pixelCount; i += 1, j += 4) {
        const value = snapshot.cells[i] || 0;
        upload[j] = value;
        upload[j + 1] = value;
        upload[j + 2] = value;
        upload[j + 3] = 255;
      }
      deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.discoveryMaskTex);
      deps.gl.texImage2D(deps.gl.TEXTURE_2D, 0, deps.gl.RGBA, width, height, 0, deps.gl.RGBA, deps.gl.UNSIGNED_BYTE, upload);
      state.width = width;
      state.height = height;
      state.versionKey = versionKey;
    }
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.discoveryMaskTex);
    deps.gl.uniform1i(deps.uniforms.uDiscoveryMask, 11);
    return true;
  }

  function uploadDiscoveryVisibilityUniforms() {
    const settings = typeof deps.getDiscoveryVisibilitySettings === "function"
      ? deps.getDiscoveryVisibilitySettings()
      : {};
    const snapshot = settings && typeof deps.getDiscoveryVisibilitySnapshot === "function"
      ? deps.getDiscoveryVisibilitySnapshot(settings.resourceId)
      : null;
    const hasMask = uploadDiscoveryMask(snapshot);
    const enabled = settings && settings.enabled === true && hasMask;
    deps.gl.uniform1f(deps.uniforms.uDiscoveryVisibilityEnabled, enabled ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uDiscoveryVisibilityMode, discoveryVisibilityModeToUniform(settings && settings.mode));
    deps.gl.uniform1f(deps.uniforms.uDiscoveryDitherScale, Math.max(0.03125, finite(settings && settings.ditherScale, 1)));
    deps.gl.uniform1f(deps.uniforms.uDiscoveryKnowledgeGamma, Math.max(0.1, finite(settings && settings.knowledgeGamma, 1)));
    deps.gl.uniform1f(deps.uniforms.uDiscoveryUnknownDarkness, clamp(finite(settings && settings.unknownDarkness, 1), 0, 1));
  }

  function uploadSlimeTrailOverlayUniforms() {
    const snapshot = typeof deps.getSlimeTrailOverlaySnapshot === "function"
      ? deps.getSlimeTrailOverlaySnapshot()
      : null;
    if (!deps.slimeTrailOverlayTex || !snapshot || !snapshot.data || !snapshot.width || !snapshot.height) {
      deps.gl.uniform1f(deps.uniforms.uSlimeTrailOverlayEnabled, 0);
      return;
    }
    const width = Math.max(1, Math.round(finite(snapshot.width, 1)));
    const height = Math.max(1, Math.round(finite(snapshot.height, 1)));
    const version = Math.max(0, Math.round(finite(snapshot.version, 0)));
    const state = deps.slimeTrailOverlayTextureState || {};
    deps.gl.activeTexture(deps.gl.TEXTURE12);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.slimeTrailOverlayTex);
    deps.gl.texParameteri(deps.gl.TEXTURE_2D, deps.gl.TEXTURE_MIN_FILTER, deps.gl.NEAREST);
    deps.gl.texParameteri(deps.gl.TEXTURE_2D, deps.gl.TEXTURE_MAG_FILTER, deps.gl.NEAREST);
    if (state.width !== width || state.height !== height || state.version !== version) {
      deps.gl.pixelStorei(deps.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      deps.gl.pixelStorei(deps.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, deps.gl.NONE);
      deps.gl.texImage2D(deps.gl.TEXTURE_2D, 0, deps.gl.RGBA, width, height, 0, deps.gl.RGBA, deps.gl.UNSIGNED_BYTE, snapshot.data);
      state.width = width;
      state.height = height;
      state.version = version;
    }
    deps.gl.uniform1i(deps.uniforms.uSlimeTrailOverlay, 12);
    deps.gl.uniform1f(deps.uniforms.uSlimeTrailOverlayEnabled, 1);
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
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.materialSplatTex);
    deps.gl.uniform1i(deps.uniforms.uMaterialSplat, 8);

    deps.gl.activeTexture(deps.gl.TEXTURE9);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.detailMicroColorTex);
    deps.gl.uniform1i(deps.uniforms.uDetailMicroColor, 9);

    deps.gl.activeTexture(deps.gl.TEXTURE10);
    deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.waterTrailTex);
    deps.gl.uniform1i(deps.uniforms.uWaterTrailTex, 10);

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
    const detailState = deps.detailAtlasState || {};
    const useDetail = input.useDetail && detailState.available;
    const mapPixelWorldSize = 1 / Math.max(1, Number(deps.heightSize.height) || 1);
    const pxPerMeterX = (deps.canvas.width * mapPixelWorldSize) / Math.max(0.001, 2 * viewHalf.x);
    const pxPerMeterY = (deps.canvas.height * mapPixelWorldSize) / Math.max(0.001, 2 * viewHalf.y);
    const pxPerMeter = Math.min(pxPerMeterX, pxPerMeterY);
    const fullPxPerMeter = Math.max(input.detailStartPxPerMeter + 0.001, input.detailFullPxPerMeter);
    const detailBlend = useDetail
      ? smoothstepValue(input.detailStartPxPerMeter, fullPxPerMeter, pxPerMeter)
      : 0;
    deps.gl.uniform1f(deps.uniforms.uUseDetail, useDetail ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uDetailBlend, detailBlend);
    const detailBlendMode = input.detailBlendMode === "priorityDither"
      ? 2
      : (input.detailBlendMode === "dithered" ? 1 : 0);
    const detailDebugMode = input.detailDebugChannel === "rgba"
      ? 1
      : (input.detailDebugChannel === "red"
        ? 2
        : (input.detailDebugChannel === "green"
          ? 3
          : (input.detailDebugChannel === "blue"
            ? 4
            : (input.detailDebugChannel === "alpha" ? 5 : 0))));
    const detailPriorities = Array.isArray(input.detailMaterialPriorities) ? input.detailMaterialPriorities : [0, 0, 0, 0];
    deps.gl.uniform1f(deps.uniforms.uDetailBlendMode, detailBlendMode);
    deps.gl.uniform1f(deps.uniforms.uDetailDebugMode, detailDebugMode);
    deps.gl.uniform1f(deps.uniforms.uDetailWeightQuantization, input.detailQuantizationSteps);
    deps.gl.uniform1f(deps.uniforms.uDetailDitherScale, input.detailDitherScale);
    deps.gl.uniform1f(deps.uniforms.uDetailDitherStrength, input.detailDitherStrength);
    deps.gl.uniform1f(deps.uniforms.uDetailMinWeight, input.detailMinWeight);
    uploadDiscoveryVisibilityUniforms();
    uploadSlimeTrailOverlayUniforms();
    deps.gl.uniform4f(
      deps.uniforms.uDetailMaterialPriority,
      Number(detailPriorities[0]) || 0,
      Number(detailPriorities[1]) || 0,
      Number(detailPriorities[2]) || 0,
      Number(detailPriorities[3]) || 0,
    );
    uploadRect(deps.uniforms.uDetailMicroRect0, getRect(detailState, 0));
    uploadRect(deps.uniforms.uDetailMicroRect1, getRect(detailState, 1));
    uploadRect(deps.uniforms.uDetailMicroRect2, getRect(detailState, 2));
    uploadRect(deps.uniforms.uDetailMicroRect3, getRect(detailState, 3));
    deps.gl.uniform4f(
      deps.uniforms.uDetailMicroScale0,
      input.detailMaterial0MicroScale,
      input.detailMaterial0MicroColor,
      input.detailMaterial1MicroScale,
      input.detailMaterial1MicroColor,
    );
    deps.gl.uniform4f(
      deps.uniforms.uDetailMicroScale1,
      input.detailMaterial2MicroScale,
      input.detailMaterial2MicroColor,
      input.detailMaterial3MicroScale,
      input.detailMaterial3MicroColor,
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
    const waterFlowSource = input.waterFlowSource === "image" ? 2 : (input.waterFlowSource === "height" ? 1 : 0);
    const waterFlowRenderMode = input.waterFlowRenderMode === "procedural" ? 0 : 1;
    const waterFlowChannelPair = input.waterFlowChannelPair === "gb" ? 1 : (input.waterFlowChannelPair === "rb" ? 2 : 0);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowSource, waterFlowSource);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowRenderMode, waterFlowRenderMode);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowDownhill, waterFlowSource > 0 ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowChannelPair, waterFlowChannelPair);
    deps.gl.uniform2f(deps.uniforms.uWaterFlowFlip, input.waterFlowFlipX ? -1 : 1, input.waterFlowFlipY ? -1 : 1);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowUseMagnitude, input.waterFlowUseMagnitude ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowMapStrength, input.waterFlowMapStrength);
    deps.gl.uniform1f(deps.uniforms.uWaterFlowVisibility, input.waterFlowVisibility);
    deps.gl.uniform1f(deps.uniforms.uWaterStreamlineDensity, input.waterStreamlineDensity);
    deps.gl.uniform1f(deps.uniforms.uWaterStreamlineSharpness, input.waterStreamlineSharpness);
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
    deps.gl.uniform3f(deps.uniforms.uWaterBaseColor, input.waterBaseColor[0], input.waterBaseColor[1], input.waterBaseColor[2]);
    deps.gl.uniform1f(deps.uniforms.uWaterOpacity, input.waterOpacity);
    deps.gl.uniform1f(deps.uniforms.uUseWaterTrail, input.useWaterTrail ? 1 : 0);
    deps.gl.uniform1f(deps.uniforms.uWaterTrailStrength, input.waterTrailStrength);
    deps.gl.uniform1f(deps.uniforms.uWaterTrailHeadroom, input.waterTrailHeadroom);
    deps.gl.uniform1f(deps.uniforms.uWaterTrailDebug, input.waterTrailDebug ? 1 : 0);
    deps.gl.uniform3f(deps.uniforms.uWaterTrailColor, input.waterTrailColor[0], input.waterTrailColor[1], input.waterTrailColor[2]);
    deps.gl.uniform1f(deps.uniforms.uWaterGlitterStrength, input.waterGlitterStrength);
    deps.gl.uniform1f(deps.uniforms.uWaterGlitterDensity, input.waterGlitterDensity);
    deps.gl.uniform1f(deps.uniforms.uWaterGlitterSpeed, input.waterGlitterSpeed);
    deps.gl.uniform1f(deps.uniforms.uWaterGlitterSize, input.waterGlitterSize);
    deps.gl.uniform1f(deps.uniforms.uWaterGlitterSharpness, input.waterGlitterSharpness);
    deps.gl.uniform1f(deps.uniforms.uWaterGlitterWakeSuppression, input.waterGlitterWakeSuppression);
    const waterTintColor = input.waterTintColor;
    deps.gl.uniform3f(deps.uniforms.uWaterTintColor, waterTintColor[0], waterTintColor[1], waterTintColor[2]);
    deps.gl.uniform1f(deps.uniforms.uWaterTintStrength, input.waterTintStrength);
    deps.gl.uniform3f(deps.uniforms.uSkyColor, params.skyColor[0], params.skyColor[1], params.skyColor[2]);
  };
}
