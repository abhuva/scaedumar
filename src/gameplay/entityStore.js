export function createEntityStore() {
  const entities = new Map();

  function upsert(entity) {
    if (!entity || typeof entity.id !== "string") return;
    entities.set(entity.id, { ...entity });
  }

  function remove(id) {
    entities.delete(id);
  }

  function get(id) {
    const entity = entities.get(id);
    return entity ? { ...entity } : null;
  }

  function list() {
    return Array.from(entities.values()).map((entity) => ({ ...entity }));
  }

  return {
    upsert,
    remove,
    get,
    list,
  };
}
