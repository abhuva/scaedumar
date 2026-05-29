const SIDES = new Set(["left", "right"]);

function normalizeSide(side, fallback = "left") {
  const value = String(side || "");
  return SIDES.has(value) ? value : fallback;
}

function getOpenPanels(panels) {
  return [...panels.values()].filter((panel) => Boolean(panel.isOpen?.()));
}

function getPanelSide(panel) {
  return normalizeSide(panel.side || panel.preferredSide, "left");
}

export function resolveSideDockOpen(panels, panelId, requestedSide = "") {
  const panel = panels.get(panelId);
  if (!panel) return { ok: false, reason: "unknown-panel" };
  const preferredSide = normalizeSide(requestedSide || panel.preferredSide, "left");
  const candidateSides = [
    preferredSide,
    preferredSide === "left" ? "right" : "left",
  ];
  const openPanels = getOpenPanels(panels).filter((item) => item.id !== panelId);

  for (const side of candidateSides) {
    const occupants = openPanels.filter((item) => getPanelSide(item) === side);
    const blocked = occupants.some((item) => Number(item.priority || 0) >= Number(panel.priority || 0));
    if (blocked) continue;
    return {
      ok: true,
      side,
      displaced: occupants.map((item) => item.id),
    };
  }
  return { ok: false, reason: "blocked-by-priority" };
}

export function createSideDockRuntime() {
  const panels = new Map();

  function registerPanel(input = {}) {
    const id = String(input.id || "");
    if (!id) return false;
    panels.set(id, {
      id,
      priority: Number(input.priority || 0),
      preferredSide: normalizeSide(input.preferredSide, "left"),
      side: normalizeSide(input.side || input.preferredSide, "left"),
      isOpen: typeof input.isOpen === "function" ? input.isOpen : () => false,
      open: typeof input.open === "function" ? input.open : () => {},
      close: typeof input.close === "function" ? input.close : () => {},
      setSide: typeof input.setSide === "function" ? input.setSide : () => {},
    });
    return true;
  }

  function setPanelSide(panel, side) {
    panel.side = normalizeSide(side, panel.preferredSide);
    panel.setSide(panel.side);
  }

  function openPanel(panelId, options = {}) {
    const resolution = resolveSideDockOpen(panels, panelId, options.side || "");
    if (!resolution.ok) return resolution;
    for (const displacedId of resolution.displaced) {
      const displaced = panels.get(displacedId);
      displaced?.close?.("side-dock-displaced");
    }
    const panel = panels.get(panelId);
    setPanelSide(panel, resolution.side);
    panel.open("side-dock-open");
    return resolution;
  }

  function closePanel(panelId, reason = "side-dock-close") {
    const panel = panels.get(panelId);
    if (!panel) return false;
    panel.close(reason);
    return true;
  }

  function setPanelPreferredSide(panelId, side) {
    const panel = panels.get(panelId);
    if (!panel) return false;
    panel.preferredSide = normalizeSide(side, panel.preferredSide);
    if (!panel.isOpen()) {
      setPanelSide(panel, panel.preferredSide);
    }
    return true;
  }

  return {
    registerPanel,
    openPanel,
    closePanel,
    setPanelPreferredSide,
    getSnapshot: () => ({
      panels: [...panels.values()].map((panel) => ({
        id: panel.id,
        priority: panel.priority,
        preferredSide: panel.preferredSide,
        side: panel.side,
        open: Boolean(panel.isOpen()),
      })),
    }),
  };
}
