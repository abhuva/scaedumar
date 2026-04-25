export function createSwarmLitRenderer(deps) {
  let swarmPointVertexData = new Float32Array(0);

  function ensureSwarmPointVertexCapacity(vertexCount) {
    const required = Math.max(0, vertexCount) * 6;
    if (swarmPointVertexData.length >= required) return;
    swarmPointVertexData = new Float32Array(required);
  }

  return function renderSwarmLit(params, timeState, settings, uniformInput, frameCamera = null) {
    const hawkCount = settings.useHawk ? deps.swarmState.hawks.length : 0;
    const totalCount = deps.swarmState.count + hawkCount;
    if (totalCount <= 0) return;

    ensureSwarmPointVertexCapacity(totalCount);
    const useAgentRayShadows = Boolean(uniformInput && uniformInput.useShadows);
    const blockedShadowFactor = 1 - deps.clamp(Number(uniformInput && uniformInput.shadowStrength), 0, 1);
    let writeIndex = 0;

    for (let i = 0; i < deps.swarmState.count; i++) {
      const agentPos = deps.writeInterpolatedSwarmAgentPos(i, deps.swarmLitAgentScratch);
      const mapX = agentPos.x;
      const mapY = agentPos.y;
      const agentZ = agentPos.z;
      const sunShadow = useAgentRayShadows
        ? deps.computeSwarmDirectionalShadow(mapX, mapY, agentZ, params.sunDir, blockedShadowFactor)
        : 1;
      const moonShadow = useAgentRayShadows
        ? deps.computeSwarmDirectionalShadow(mapX, mapY, agentZ, params.moonDir, blockedShadowFactor)
        : 1;
      swarmPointVertexData[writeIndex++] = mapX;
      swarmPointVertexData[writeIndex++] = mapY;
      swarmPointVertexData[writeIndex++] = agentZ;
      swarmPointVertexData[writeIndex++] = 0;
      swarmPointVertexData[writeIndex++] = sunShadow;
      swarmPointVertexData[writeIndex++] = moonShadow;
    }

    if (settings.useHawk) {
      for (let i = 0; i < deps.swarmState.hawks.length; i++) {
        const hawkPos = deps.writeInterpolatedSwarmHawkPos(i, deps.swarmLitHawkScratch);
        const sunShadow = useAgentRayShadows
          ? deps.computeSwarmDirectionalShadow(hawkPos.x, hawkPos.y, hawkPos.z, params.sunDir, blockedShadowFactor)
          : 1;
        const moonShadow = useAgentRayShadows
          ? deps.computeSwarmDirectionalShadow(hawkPos.x, hawkPos.y, hawkPos.z, params.moonDir, blockedShadowFactor)
          : 1;
        swarmPointVertexData[writeIndex++] = hawkPos.x;
        swarmPointVertexData[writeIndex++] = hawkPos.y;
        swarmPointVertexData[writeIndex++] = hawkPos.z;
        swarmPointVertexData[writeIndex++] = 1;
        swarmPointVertexData[writeIndex++] = sunShadow;
        swarmPointVertexData[writeIndex++] = moonShadow;
      }
    }

    const cameraZoom = frameCamera && Number.isFinite(Number(frameCamera.zoom)) ? Number(frameCamera.zoom) : 1;
    const cameraPanX = frameCamera && Number.isFinite(Number(frameCamera.panX)) ? Number(frameCamera.panX) : 0;
    const cameraPanY = frameCamera && Number.isFinite(Number(frameCamera.panY)) ? Number(frameCamera.panY) : 0;
    const viewHalf = deps.getViewHalfExtents(cameraZoom);
    const hawkColor = deps.hexToRgb01(settings.hawkColor);
    const gl = deps.gl;
    const swarmUniforms = deps.swarmUniforms;

    gl.useProgram(deps.swarmProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, deps.normalsTex);
    gl.uniform1i(swarmUniforms.uNormals, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, deps.heightTex);
    gl.uniform1i(swarmUniforms.uHeight, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, deps.pointLightTex);
    gl.uniform1i(swarmUniforms.uPointLightTex, 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, deps.cloudNoiseTex);
    gl.uniform1i(swarmUniforms.uCloudNoiseTex, 3);

    gl.uniform3f(swarmUniforms.uSunDir, params.sunDir[0], params.sunDir[1], params.sunDir[2]);
    gl.uniform3f(swarmUniforms.uSunColor, params.sun.sunColor[0], params.sun.sunColor[1], params.sun.sunColor[2]);
    gl.uniform1f(swarmUniforms.uSunStrength, params.sunStrength);
    gl.uniform3f(swarmUniforms.uMoonDir, params.moonDir[0], params.moonDir[1], params.moonDir[2]);
    gl.uniform3f(swarmUniforms.uMoonColor, params.moonColor[0], params.moonColor[1], params.moonColor[2]);
    gl.uniform1f(swarmUniforms.uMoonStrength, params.moonStrength);
    gl.uniform3f(swarmUniforms.uAmbientColor, params.ambientColor[0], params.ambientColor[1], params.ambientColor[2]);
    gl.uniform1f(swarmUniforms.uAmbient, params.ambientFinal);
    gl.uniform1f(swarmUniforms.uUseShadows, uniformInput && uniformInput.useShadows ? 1 : 0);
    gl.uniform1f(swarmUniforms.uUseFog, uniformInput && uniformInput.useFog ? 1 : 0);
    gl.uniform3f(swarmUniforms.uFogColor, params.fogColor[0], params.fogColor[1], params.fogColor[2]);
    gl.uniform1f(swarmUniforms.uFogMinAlpha, deps.clamp(Number(uniformInput && uniformInput.fogMinAlpha), 0, 1));
    gl.uniform1f(swarmUniforms.uFogMaxAlpha, deps.clamp(Number(uniformInput && uniformInput.fogMaxAlpha), 0, 1));
    gl.uniform1f(swarmUniforms.uFogFalloff, deps.clamp(Number(uniformInput && uniformInput.fogFalloff), 0.2, 4));
    gl.uniform1f(swarmUniforms.uFogStartOffset, deps.clamp(Number(uniformInput && uniformInput.fogStartOffset), 0, 1));
    gl.uniform1f(swarmUniforms.uCameraHeightNorm, params.cameraHeightNorm);
    gl.uniform1f(swarmUniforms.uUseVolumetric, uniformInput && uniformInput.useVolumetric ? 1 : 0);
    gl.uniform1f(swarmUniforms.uVolumetricStrength, deps.clamp(Number(uniformInput && uniformInput.volumetricStrength), 0, 1));
    gl.uniform1f(swarmUniforms.uVolumetricDensity, deps.clamp(Number(uniformInput && uniformInput.volumetricDensity), 0, 2));
    gl.uniform1f(swarmUniforms.uVolumetricAnisotropy, deps.clamp(Number(uniformInput && uniformInput.volumetricAnisotropy), 0, 0.95));
    gl.uniform1f(swarmUniforms.uVolumetricLength, Math.round(deps.clamp(Number(uniformInput && uniformInput.volumetricLength), 8, 160)));
    gl.uniform1f(swarmUniforms.uVolumetricSamples, Math.round(deps.clamp(Number(uniformInput && uniformInput.volumetricSamples), 4, 24)));
    gl.uniform1f(swarmUniforms.uMapAspect, deps.getMapAspect());
    gl.uniform2f(swarmUniforms.uMapTexelSize, 1 / deps.heightSize.width, 1 / deps.heightSize.height);
    gl.uniform2f(swarmUniforms.uMapSize, deps.splatSize.width, deps.splatSize.height);
    gl.uniform2f(swarmUniforms.uResolution, deps.canvas.width, deps.canvas.height);
    gl.uniform2f(swarmUniforms.uViewHalfExtents, viewHalf.x, viewHalf.y);
    gl.uniform2f(swarmUniforms.uPanWorld, cameraPanX, cameraPanY);
    gl.uniform1f(swarmUniforms.uTimeSec, Math.max(0, Number(timeState && timeState.nowSec) || 0));
    gl.uniform1f(swarmUniforms.uCloudTimeSec, Math.max(0, Number(timeState && timeState.cloudTimeSec) || 0));
    gl.uniform1f(swarmUniforms.uPointFlickerEnabled, uniformInput && uniformInput.pointFlickerEnabled ? 1 : 0);
    gl.uniform1f(swarmUniforms.uPointFlickerStrength, deps.clamp(Number(uniformInput && uniformInput.pointFlickerStrength), 0, 1));
    gl.uniform1f(swarmUniforms.uPointFlickerSpeed, deps.clamp(Number(uniformInput && uniformInput.pointFlickerSpeed), 0.1, 12));
    gl.uniform1f(swarmUniforms.uPointFlickerSpatial, deps.clamp(Number(uniformInput && uniformInput.pointFlickerSpatial), 0, 4));
    gl.uniform1f(swarmUniforms.uUseClouds, uniformInput && uniformInput.useClouds ? 1 : 0);
    gl.uniform1f(swarmUniforms.uCloudCoverage, deps.clamp(Number(uniformInput && uniformInput.cloudCoverage), 0, 1));
    gl.uniform1f(swarmUniforms.uCloudSoftness, deps.clamp(Number(uniformInput && uniformInput.cloudSoftness), 0.01, 0.35));
    gl.uniform1f(swarmUniforms.uCloudOpacity, deps.clamp(Number(uniformInput && uniformInput.cloudOpacity), 0, 1));
    gl.uniform1f(swarmUniforms.uCloudScale, deps.clamp(Number(uniformInput && uniformInput.cloudScale), 0.5, 8));
    gl.uniform1f(swarmUniforms.uCloudSpeed1, deps.clamp(Number(uniformInput && uniformInput.cloudSpeed1), -0.3, 0.3));
    gl.uniform1f(swarmUniforms.uCloudSpeed2, deps.clamp(Number(uniformInput && uniformInput.cloudSpeed2), -0.3, 0.3));
    gl.uniform1f(swarmUniforms.uCloudSunParallax, deps.clamp(Number(uniformInput && uniformInput.cloudSunParallax), 0, 2));
    gl.uniform1f(swarmUniforms.uCloudUseSunProjection, uniformInput && uniformInput.cloudUseSunProjection ? 1 : 0);
    gl.uniform3f(swarmUniforms.uHawkColor, hawkColor[0], hawkColor[1], hawkColor[2]);
    gl.uniform1f(swarmUniforms.uSwarmHeightMax, deps.swarmHeightMax);
    gl.uniform1f(swarmUniforms.uPointLightEdgeMin, deps.pointLightEdgeMin);
    gl.uniform1f(swarmUniforms.uSwarmAlpha, 1.0);

    gl.bindVertexArray(deps.swarmPointVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, deps.swarmPointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, swarmPointVertexData.subarray(0, totalCount * 6), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, totalCount);
    gl.bindVertexArray(null);
  };
}
