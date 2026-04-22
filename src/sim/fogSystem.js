export function createFogSystem(deps) {
  return {
    update() {
      deps.setFogState({
        useFog: deps.fogToggle.checked,
        fogMinAlpha: deps.clamp(Number(deps.fogMinAlphaInput.value), 0, 1),
        fogMaxAlpha: deps.clamp(Number(deps.fogMaxAlphaInput.value), 0, 1),
        fogFalloff: deps.clamp(Number(deps.fogFalloffInput.value), 0.2, 4),
        fogStartOffset: deps.clamp(Number(deps.fogStartOffsetInput.value), 0, 1),
      });
    },
  };
}
