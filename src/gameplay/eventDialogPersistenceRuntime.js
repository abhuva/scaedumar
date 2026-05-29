const DEFAULT_STORAGE_KEY = "terrain:event-dialog-state:v1";
const CURRENT_VERSION = 1;

function normalizeSnapshot(value) {
  return value && typeof value === "object" ? value : {};
}

export function migrateEventDialogPersistencePayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const version = payload.version == null ? 1 : Number(payload.version);
  if (version !== 1) return null;
  return {
    version: CURRENT_VERSION,
    events: normalizeSnapshot(payload.events),
    journal: normalizeSnapshot(payload.journal),
  };
}

export function createEventDialogPersistenceRuntime(deps = {}) {
  const storage = deps.storage || null;
  const key = typeof deps.key === "string" && deps.key ? deps.key : DEFAULT_STORAGE_KEY;
  const eventRuntime = deps.eventRuntime;
  const journalRuntime = deps.journalRuntime;
  const onError = typeof deps.onError === "function" ? deps.onError : () => {};

  function canPersist() {
    return Boolean(
      storage &&
      typeof storage.getItem === "function" &&
      typeof storage.setItem === "function",
    );
  }

  function getPayload() {
    return {
      version: CURRENT_VERSION,
      events: eventRuntime?.getPersistenceSnapshot?.() || {},
      journal: journalRuntime?.getPersistenceSnapshot?.() || {},
    };
  }

  function save() {
    if (!canPersist()) return false;
    try {
      storage.setItem(key, JSON.stringify(getPayload()));
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  function load() {
    if (!canPersist()) return false;
    try {
      const raw = storage.getItem(key);
      if (!raw) return false;
      const payload = migrateEventDialogPersistencePayload(JSON.parse(raw));
      if (!payload) return false;
      eventRuntime?.applyPersistenceSnapshot?.(payload.events || {});
      journalRuntime?.applyPersistenceSnapshot?.(payload.journal || {});
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  function clear() {
    if (!canPersist()) return false;
    try {
      if (typeof storage.removeItem === "function") {
        storage.removeItem(key);
      } else {
        storage.setItem(key, "");
      }
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  return {
    clear,
    load,
    save,
    getPayload,
  };
}

export { DEFAULT_STORAGE_KEY as EVENT_DIALOG_STORAGE_KEY };
export { CURRENT_VERSION as EVENT_DIALOG_PERSISTENCE_VERSION };
