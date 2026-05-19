export const WORKSPACE_IDS = ["map", "audio", "slime"];
export const DEFAULT_WORKSPACE_ID = "map";

const WORKSPACE_ID_SET = new Set(WORKSPACE_IDS);

export function normalizeWorkspaceId(workspace) {
  const value = String(workspace || "");
  return WORKSPACE_ID_SET.has(value) ? value : DEFAULT_WORKSPACE_ID;
}

