export function createRenderer(deps) {
  if (!deps || typeof deps !== "object") {
    throw new Error("createRenderer requires a deps object.");
  }
  if (!deps.resources || typeof deps.resources !== "object") {
    throw new Error("createRenderer requires deps.resources.");
  }
  if (typeof deps.resources.setViewport !== "function") {
    throw new Error("createRenderer requires deps.resources.setViewport().");
  }
  if (typeof deps.resources.hasDrawableSurface !== "function") {
    throw new Error("createRenderer requires deps.resources.hasDrawableSurface().");
  }

  const passes = new Map();
  const gpuProfiler = createGpuProfiler(deps.gl);

  function registerPass(id, pass) {
    if (!id || typeof id !== "string") {
      throw new Error("Render pass id must be a non-empty string.");
    }
    if (!pass || typeof pass.execute !== "function") {
      throw new Error(`Render pass '${id}' must provide execute(frame).`);
    }
    if (passes.has(id)) {
      throw new Error(`Render pass '${id}' is already registered.`);
    }
    passes.set(id, pass);
  }

  function executePass(id, frame) {
    const pass = passes.get(id);
    if (!pass) {
      throw new Error(`Render pass '${id}' is not registered.`);
    }
    gpuProfiler.begin(id);
    pass.execute(frame);
    gpuProfiler.end();
  }

  return {
    registerPass,
    hasPass(id) {
      return passes.has(id);
    },
    listPasses() {
      return Array.from(passes.keys());
    },
    renderTerrainFrame(frame) {
      gpuProfiler.poll();
      if (!frame || typeof frame !== "object") {
        throw new TypeError("renderTerrainFrame requires a valid frame object.");
      }
      if (!deps.resources.hasDrawableSurface()) {
        return;
      }
      deps.resources.setViewport();
      if (frame.showTerrain) {
        executePass("shadow", frame);
        executePass("shadowBlur", frame);
        executePass("mainTerrain", frame);
        return;
      }
      executePass("backgroundClear", frame);
    },
    getGpuProfile() {
      return gpuProfiler.getProfile();
    },
  };
}

function createGpuProfiler(gl) {
  const ext = gl && typeof gl.getExtension === "function"
    ? gl.getExtension("EXT_disjoint_timer_query_webgl2")
    : null;
  const pending = [];
  const latest = {};
  let active = null;
  if (!gl || !ext || typeof gl.createQuery !== "function") {
    return {
      begin() {},
      end() {},
      poll() {},
      getProfile() {
        return { supported: false, passes: {} };
      },
    };
  }

  function poll() {
    const disjoint = Boolean(gl.getParameter(ext.GPU_DISJOINT_EXT));
    for (let index = pending.length - 1; index >= 0; index -= 1) {
      const item = pending[index];
      const available = gl.getQueryParameter(item.query, gl.QUERY_RESULT_AVAILABLE);
      if (!available) continue;
      if (!disjoint) {
        const elapsedNs = gl.getQueryParameter(item.query, gl.QUERY_RESULT);
        latest[item.id] = Number(elapsedNs) / 1000000;
      }
      gl.deleteQuery(item.query);
      pending.splice(index, 1);
    }
  }

  return {
    begin(id) {
      if (active) return;
      const query = gl.createQuery();
      if (!query) return;
      active = { id, query };
      gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
    },
    end() {
      if (!active) return;
      gl.endQuery(ext.TIME_ELAPSED_EXT);
      pending.push(active);
      active = null;
    },
    poll,
    getProfile() {
      poll();
      return {
        supported: true,
        passes: { ...latest },
      };
    },
  };
}
