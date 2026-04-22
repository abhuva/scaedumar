export function createCommandBus() {
  const handlers = new Map();

  function register(type, handler) {
    if (typeof handler !== "function") {
      throw new Error("Command handler must be a function.");
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
