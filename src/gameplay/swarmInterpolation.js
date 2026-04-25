export function createSwarmInterpolation(deps) {
  function capturePreviousState() {
    const count = Math.max(0, deps.swarmState.count | 0);
    if (
      deps.swarmRenderState.prevX.length !== count
      || deps.swarmRenderState.prevY.length !== count
      || deps.swarmRenderState.prevZ.length !== count
    ) {
      deps.swarmRenderState.prevX = new Float32Array(count);
      deps.swarmRenderState.prevY = new Float32Array(count);
      deps.swarmRenderState.prevZ = new Float32Array(count);
    }
    if (count > 0) {
      const srcX = deps.swarmState.x && typeof deps.swarmState.x.subarray === "function"
        ? deps.swarmState.x.subarray(0, count)
        : deps.swarmState.x;
      const srcY = deps.swarmState.y && typeof deps.swarmState.y.subarray === "function"
        ? deps.swarmState.y.subarray(0, count)
        : deps.swarmState.y;
      const srcZ = deps.swarmState.z && typeof deps.swarmState.z.subarray === "function"
        ? deps.swarmState.z.subarray(0, count)
        : deps.swarmState.z;
      deps.swarmRenderState.prevX.set(srcX);
      deps.swarmRenderState.prevY.set(srcY);
      deps.swarmRenderState.prevZ.set(srcZ);
    }
    const hawkCount = deps.swarmState.hawks.length;
    if (
      deps.swarmRenderState.prevHawkX.length !== hawkCount
      || deps.swarmRenderState.prevHawkY.length !== hawkCount
      || deps.swarmRenderState.prevHawkZ.length !== hawkCount
    ) {
      deps.swarmRenderState.prevHawkX = new Float32Array(hawkCount);
      deps.swarmRenderState.prevHawkY = new Float32Array(hawkCount);
      deps.swarmRenderState.prevHawkZ = new Float32Array(hawkCount);
    }
    for (let i = 0; i < hawkCount; i++) {
      const hawk = deps.swarmState.hawks[i];
      deps.swarmRenderState.prevHawkX[i] = hawk.x;
      deps.swarmRenderState.prevHawkY[i] = hawk.y;
      deps.swarmRenderState.prevHawkZ[i] = hawk.z;
    }
    deps.swarmRenderState.hasPrev = true;
  }

  function getInterpolationAlpha() {
    return deps.clamp(Number(deps.swarmRenderState.alpha), 0, 1);
  }

  function writeInterpolatedAgentPos(index, out) {
    out.x = deps.swarmState.x[index];
    out.y = deps.swarmState.y[index];
    out.z = deps.swarmState.z[index];
    if (!deps.swarmRenderState.hasPrev || index < 0 || index >= deps.swarmRenderState.prevX.length) {
      return out;
    }
    const a = getInterpolationAlpha();
    out.x = deps.swarmRenderState.prevX[index] + (out.x - deps.swarmRenderState.prevX[index]) * a;
    out.y = deps.swarmRenderState.prevY[index] + (out.y - deps.swarmRenderState.prevY[index]) * a;
    out.z = deps.swarmRenderState.prevZ[index] + (out.z - deps.swarmRenderState.prevZ[index]) * a;
    return out;
  }

  function writeInterpolatedHawkPos(index, out) {
    const hawk = deps.swarmState.hawks[index];
    if (!hawk) {
      out.x = 0;
      out.y = 0;
      out.z = 0;
      return out;
    }
    out.x = hawk.x;
    out.y = hawk.y;
    out.z = hawk.z;
    if (!deps.swarmRenderState.hasPrev || index < 0 || index >= deps.swarmRenderState.prevHawkX.length) {
      return out;
    }
    const a = getInterpolationAlpha();
    out.x = deps.swarmRenderState.prevHawkX[index] + (hawk.x - deps.swarmRenderState.prevHawkX[index]) * a;
    out.y = deps.swarmRenderState.prevHawkY[index] + (hawk.y - deps.swarmRenderState.prevHawkY[index]) * a;
    out.z = deps.swarmRenderState.prevHawkZ[index] + (hawk.z - deps.swarmRenderState.prevHawkZ[index]) * a;
    return out;
  }

  return {
    capturePreviousState,
    writeInterpolatedAgentPos,
    writeInterpolatedHawkPos,
  };
}
