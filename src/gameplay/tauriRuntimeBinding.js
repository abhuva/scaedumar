import { resolveTauriInvoke, createTauriRuntimeHelpers } from "./tauriRuntime.js";

export function createTauriRuntimeBinding(deps) {
  const tauriInvoke = resolveTauriInvoke(deps.windowEl);
  const tauriRuntimeHelpers = createTauriRuntimeHelpers({
    tauriInvoke,
    normalizeMapFolderPath: deps.normalizeMapFolderPath,
    isAbsoluteFsPath: deps.isAbsoluteFsPath,
  });
  return {
    tauriInvoke,
    invokeTauri: (command, args) => tauriRuntimeHelpers.invokeTauri(command, args),
    pickMapFolderViaTauri: () => tauriRuntimeHelpers.pickMapFolderViaTauri(),
    validateMapFolderViaTauri: (folderPath) => tauriRuntimeHelpers.validateMapFolderViaTauri(folderPath),
  };
}
