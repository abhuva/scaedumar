export function createSettingsRegistry() {
  const subsystems = new Map();

  function register(key, contract) {
    if (!key || typeof key !== "string") {
      throw new Error("Settings key must be a non-empty string.");
    }
    if (!contract || typeof contract.defaults !== "function") {
      throw new Error("Settings contract must provide defaults().");
    }
    subsystems.set(key, contract);
  }

  function has(key) {
    return subsystems.has(key);
  }

  function getDefaults(key) {
    const contract = subsystems.get(key);
    if (!contract) return null;
    return contract.defaults();
  }

  function serialize(key, state) {
    const contract = subsystems.get(key);
    if (!contract || typeof contract.serialize !== "function") return null;
    return contract.serialize(state);
  }

  function apply(key, input, state) {
    const contract = subsystems.get(key);
    if (!contract || typeof contract.apply !== "function") return state;
    return contract.apply(input, state);
  }

  function validate(key, input) {
    const contract = subsystems.get(key);
    if (!contract || typeof contract.validate !== "function") return true;
    return contract.validate(input);
  }

  function keys() {
    return Array.from(subsystems.keys());
  }

  return {
    register,
    has,
    getDefaults,
    serialize,
    apply,
    validate,
    keys,
  };
}
