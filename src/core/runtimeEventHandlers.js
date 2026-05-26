import { RuntimeEvents } from "./eventBus.js";

export function registerRuntimeEventHandlers(eventBus, deps = {}) {
  const subscriptions = [
    eventBus.on(RuntimeEvents.RESOURCE_STOCK_CHANGED, () => {
      deps.invalidateResourceContourOverlay?.();
      deps.syncResourceStockPanel?.();
      deps.refreshInspectSample?.();
      deps.requestOverlayDraw?.();
    }),
    eventBus.on(RuntimeEvents.RESOURCE_DISCOVERY_CHANGED, () => {
      deps.invalidateResourceContourOverlay?.();
      deps.refreshInspectSample?.();
      deps.requestOverlayDraw?.();
    }),
    eventBus.on(RuntimeEvents.INSPECT_CHANGED, () => {
      deps.refreshInspectSample?.();
      deps.syncGameplayHud?.();
      deps.updateMovementStatusPanel?.();
      deps.requestOverlayDraw?.();
    }),
    eventBus.on(RuntimeEvents.ACTIVITY_CHANGED, () => {
      deps.updateMovementStatusPanel?.();
      deps.syncGameplayHud?.();
      deps.requestOverlayDraw?.();
    }),
    eventBus.on(RuntimeEvents.TRAVEL_PLANNING_CHANGED, () => {
      deps.updateMovementStatusPanel?.();
      deps.syncGameplayHud?.();
      deps.requestOverlayDraw?.();
    }),
  ];

  return () => {
    for (const unsubscribe of subscriptions) {
      unsubscribe();
    }
  };
}
