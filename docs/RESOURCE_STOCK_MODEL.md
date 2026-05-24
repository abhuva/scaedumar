# Resource Stock Model

## Purpose

Resource stock models temporary availability for broad resource categories such as water, berries, herbs, or forage.

Authored terrain maps still describe baseline suitability. Stock describes current renewable pressure on top of that suitability.

The model exists to make repeated harvesting reduce local availability, then slowly replenish it over simulation time, without mutating authored map textures.

## Layers

Resource availability is split into four layers:

- Authored suitability: static map-local source such as `wetness.png`, sampled through `assets/data/resource_search.json`.
- Live stock: mutable low-resolution truth field, `0..255`.
- Known stock: mutable low-resolution player belief field, `0..255`.
- Discovery: mutable low-resolution knowledge/confidence mask, owned by `src/gameplay/resourceDiscoveryRuntime.js`.

The real search chance is:

```txt
effective chance = authored search chance * live stock factor
```

The player-facing discovered overlay uses:

```txt
visible availability = authored suitability * known stock factor * discovery knowledge
```

This means the player can know where a resource usually exists, while still needing to revisit or scout to refresh stale knowledge about local depletion and regrowth.

## Runtime Ownership

The stock runtime is:

```txt
src/gameplay/resourceStockRuntime.js
```

It owns:

- one live stock field per broad resource id
- one known stock field per broad resource id
- low-resolution field allocation based on current map dimensions
- depletion kernels after successful harvest
- replenishment over processed simulation ticks
- refreshing known stock when the player or scout reveals an area
- stock versioning for overlay cache invalidation

The stock config loader is:

```txt
src/gameplay/resourceStockRegistry.js
```

The current data file is:

```txt
assets/data/resource_stock.json
```

`Save All` persists both resource-stock tuning and the current live/known stock fields into map-local `resource_stock.json`. Saved fields are restored only when their saved dimensions match the current map and stock grid; otherwise the runtime falls back to initialized fields from the saved settings.

## Default Behavior

Missing stock maps initialize as:

- live stock: `255`
- known stock: `0`

This is safe because authored suitability is still multiplied in. A fully stocked area with zero authored suitability still has zero effective chance.

Known stock starts unknown. When discovery reveals an area, the current live stock is copied into known stock for the revealed cells.

## Depletion

For now, stock depletes only on successful resource acquisition.

The default depletion kernel is:

```txt
center cell: -50
surrounding 8 cells: -25
```

With a `128x128` stock field over a `1024x1024` terrain map, one stock cell covers about `8x8` terrain pixels. A radius-1 kernel covers a `3x3` stock patch, roughly `24x24` terrain pixels.

On harvest, both live stock and known stock are updated for the affected kernel. This represents the player knowing they just depleted that local patch.

## Replenishment

Each resource has:

- `replenishIntervalTicks`
- `replenishAmount`

Every interval, live stock increases by the amount and clamps at `255`.

Known stock does not automatically replenish. It remains the player's last-known estimate until the player or a possessed scout bird reveals the area again.

The current water tuning uses the same model as other resources:

```json
{
  "replenishIntervalTicks": 50,
  "replenishAmount": 250
}
```

This makes water recover very quickly while still exercising the shared stock path.

## Discovery And Scouting

Player movement and processed idle-time tick batches reveal discovery around the player and refresh known stock in the same area.

Possessed scout birds reveal discovery around the bird and refresh known stock in the same area.

Important ownership rule:

```txt
Discovery mutation must use canonical simulation coordinates, not camera interpolation.
```

Camera interpolation can smooth the view while following a bird, but stock/discovery mutation should use the real swarm simulation position.

## Overlay Modes

The gameplay-facing contour overlay uses the Resource Debug `Overlay Stock` mode.

Current modes:

- `Known`: `authored suitability * known stock * discovery`
- `Live`: `authored suitability * live stock * discovery`
- `Ignore`: `authored suitability * discovery`

The runtime already exposes both sample paths:

```txt
sampleFactor(resourceId, x, y)
sampleKnownFactor(resourceId, x, y)
```

## Resource Debug Controls

The `RD` topic panel is tabbed:

- `Overlay`: discovery/contour controls for the active inspect overlay (`Water`, `Plants`, `Height`, or `Slope`). Water and Plants have separate visual tuning even if they currently sample the same authored wetness source.
- `Stock`: runtime stock controls with a resource selector for Water and Plants.

The `Stock` tab exposes:

- resource selector
- overlay stock mode (`Known`, `Live`, `Ignore`)
- stock grid size
- center depletion amount
- neighbor depletion amount
- depletion radius
- replenish interval ticks
- replenish amount
- player-position readout for live stock, known stock, current chance, baseline map value, and active grid size
- debug actions to deplete, reveal, fill, empty, or reset the selected stock field

Water currently replenishes by `250` every `50` processed ticks. This is intentionally fast, but it can hide depletion during normal movement/gathering because the field may refill before inspection. For debugging visible depletion, temporarily set `Regen Amount` to `0` or raise `Regen Ticks`.

Plants are also configured as a stock-backed resource search. They currently use `wetness.png` as a provisional authored suitability map, so the runtime path can be exercised before a dedicated plant/herb map exists.

The `Overlay` tab exposes discovery/contour tuning, including discovery grid size, reveal radius, reveal falloff, discovery decay, mask overlay debug view, contour render mode, knowledge gate, line width, tint, and band thresholds. `Reveal Falloff = 0` preserves the hard full-white reveal brush; `1` is linear falloff.

## Current Limitations

- Water gathering and generic gathering use stock-backed resource searches directly.
- Plants currently use a single default loot band with weighted entries for berries, medicinal herbs, and plant fiber; authored band textures can be added later.
- Water gathering fills carried water-container items; the current waterskin uses stack quantity as fill level instead of item instances.
- Stock field persistence is JSON-based and may become large as more resources or larger stock grids are added.
- Stock tuning UI is debug-facing, but its settings and current fields are persisted through map `Save All`.

## Future Work

- Split broad plants into more specific resources such as `berries` or `herbs` once dedicated authored maps or reward tables exist.
- Add authored plant band maps so different areas can point at different weighted loot bands.
- Consider item instances for refillable containers once empty container weight, multiple skins, quality, or damage need to matter.
- Add an RD debug control for known vs live stock visualization.
- Consider skills or tools modifying depletion amount, depletion radius, success chance, or known-stock accuracy.
