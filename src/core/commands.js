export function createCommandBus() {
  const handlers = new Map();

  function register(type, handler) {
    const validType = typeof type === "string" ? type.length > 0 : typeof type === "symbol";
    if (!validType) {
      throw new Error("Command type must be a non-empty string or symbol.");
    }
    if (typeof handler !== "function") {
      throw new Error("Command handler must be a function.");
    }
    if (handlers.has(type)) {
      throw new Error(`Command handler already registered for type: ${String(type)}`);
    }
    handlers.set(type, handler);
  }

  function dispatch(command, ctx) {
    if (!command || typeof command.type !== "string") {
      throw new Error("Command must include a string `type`.");
    }
    const handler = handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }
    return handler(command, ctx);
  }

  function has(type) {
    return handlers.has(type);
  }

  return {
    register,
    dispatch,
    has,
  };
}
