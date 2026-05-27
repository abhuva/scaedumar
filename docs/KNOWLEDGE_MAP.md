# Knowledge Map Naming

The runtime has one shared world Knowledge Map plus a separate Tracks Knowledge Map. These are low-resolution masks that store how much the player knows about specific world layers. Older code may still use `discovery` in identifiers, but UI and documentation should call these Knowledge Maps.

## Terms

- `Knowledge Map`: the shared low-resolution world knowledge mask owned by `resourceDiscoveryRuntime`.
- `Tracks Knowledge Map`: separate low-resolution tracks mask owned by `resourceDiscoveryRuntime` under the `tracks` map id.
- `Known View`: gameplay visualization that combines the Knowledge Map with a resource or terrain map, for example known water contours.
- `NAV Knowledge`: the route-planning view of the Knowledge Map sampled onto the low-resolution route grid.
- `Terrain Visibility`: the NAV-only dither presentation driven by NAV Knowledge.
- `Resource Stock`: live and known stock/recovery data owned by `resourceStockRuntime`; this is separate from the Knowledge Map.

## Mutation Rules

- Slider changes must not repaint or reset the Knowledge Map.
- Direct Knowledge Map edits happen through explicit actions such as `Apply Noise`, `Fill Known`, `Fill Unknown`, and `Reveal Player`.
- Movement/scout gameplay can reveal the shared Knowledge Map as part of normal gameplay.
- Player movement can update the Tracks Knowledge Map. Scout birds do not update it; future hawks can.
- Map sidecar settings load and passive Inspect layer sync must not reset or reveal the Knowledge Map. The final map-loaded hook performs one reset/noise seed/player reveal after all sidecars, including `npc.json`, have applied.
- Resource stock actions must not be described as Knowledge Map edits.

## Current Sharing Model

Water, plants, terrain visibility, and NAV all resolve to the same shared world Knowledge Map. Tracks resolve to the separate `tracks` map. Future resource-specific maps can be added by changing the resolver, but UI should not imply additional separate maps until they exist.
