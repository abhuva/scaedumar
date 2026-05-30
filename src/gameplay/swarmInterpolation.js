export function createSwarmInterpolation(deps) {
  function getAgentId(index) {
    return deps.swarmState.agentId && Number.isFinite(Number(deps.swarmState.agentId[index]))
      ? Math.round(Number(deps.swarmState.agentId[index]))
      : index + 1;
  }

  function capturePreviousState() {
    const count = Math.max(0, deps.swarmState.count | 0);
    if (
      deps.swarmRenderState.prevX.length !== count
      || deps.swarmRenderState.prevY.length !== count
      || deps.swarmRenderState.prevZ.length !== count
      || deps.swarmRenderState.prevAgentId?.length !== count
    ) {
      deps.swarmRenderState.prevX = new Float32Array(count);
      deps.swarmRenderState.prevY = new Float32Array(count);
      deps.swarmRenderState.prevZ = new Float32Array(count);
      deps.swarmRenderState.prevAgentId = new Int32Array(count);
    }
    if (count > 0) {
      deps.swarmRenderState.prevX.set(deps.swarmState.x.subarray(0, count));
      deps.swarmRenderState.prevY.set(deps.swarmState.y.subarray(0, count));
      deps.swarmRenderState.prevZ.set(deps.swarmState.z.subarray(0, count));
      for (let i = 0; i < count; i++) {
        deps.swarmRenderState.prevAgentId[i] = getAgentId(i);
      }
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

  function lerp(a, b, alpha) {
    return a + ((b - a) * alpha);
  }

  function writeInterpolatedAgentPos(index, out) {
    out.x = deps.swarmState.x[index];
    out.y = deps.swarmState.y[index];
    out.z = deps.swarmState.z[index];
    const render = deps.swarmRenderState;
    if (!render.hasPrev || index < 0 || index >= render.prevX.length) return out;
    if (render.prevAgentId && render.prevAgentId[index] !== getAgentId(index)) return out;
    const alpha = getInterpolationAlpha();
    out.x = lerp(render.prevX[index], out.x, alpha);
    out.y = lerp(render.prevY[index], out.y, alpha);
    out.z = lerp(render.prevZ[index], out.z, alpha);
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
    const render = deps.swarmRenderState;
    if (!render.hasPrev || index < 0 || index >= render.prevHawkX.length) return out;
    const alpha = getInterpolationAlpha();
    out.x = lerp(render.prevHawkX[index], hawk.x, alpha);
    out.y = lerp(render.prevHawkY[index], hawk.y, alpha);
    out.z = lerp(render.prevHawkZ[index], hawk.z, alpha);
    return out;
  }

  return {
    capturePreviousState,
    writeInterpolatedAgentPos,
    writeInterpolatedHawkPos,
  };
}
