export function createRenderResources(deps) {
  function isPlainObject(input) {
    return Object.prototype.toString.call(input) === "[object Object]";
  }

  let weatherFieldMeta = {
    width: 0,
    height: 0,
    updatedAtSec: 0,
  };

  return {
    setViewport() {
      deps.gl.viewport(0, 0, deps.canvas.width, deps.canvas.height);
    },
    clearColor(r, g, b, a = 1) {
      deps.gl.clearColor(r, g, b, a);
      deps.gl.clear(deps.gl.COLOR_BUFFER_BIT);
    },
    setWeatherFieldMeta(meta) {
      if (!isPlainObject(meta)) {
        return;
      }
      weatherFieldMeta = {
        ...weatherFieldMeta,
        ...meta,
      };
    },
    getWeatherFieldMeta() {
      return { ...weatherFieldMeta };
    },
  };
}
