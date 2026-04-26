export function createPointLightIoUiRuntime(deps) {
  return {
    clearPointLightsLoadInput: () => {
      if (deps.pointLightsLoadInput) {
        deps.pointLightsLoadInput.value = "";
      }
    },
    openPointLightsLoadInput: () => {
      if (deps.pointLightsLoadInput) {
        deps.pointLightsLoadInput.click();
      }
    },
    setSaveButtonText: (text) => {
      if (deps.pointLightsSaveAllBtn) {
        deps.pointLightsSaveAllBtn.textContent = text;
      }
    },
  };
}
