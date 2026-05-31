# Structure Data Contract

## Purpose

`structures.json` defines authored map/scenario structure defaults.

Structures are stateful map objects such as caches, campfires, shelters, tents,
cairns, drying racks, and buildings. They are not sprite details and are not
runtime decals.

## File Name

```txt
assets/<mapName>/structures.json
```

The sidecar is optional. Missing files load as an empty structure set.
Invalid sidecars currently fail during structure data application. Keep startup
and map-load errors visible if future policy decides invalid structure authoring
should block loading.

## Sprite Asset Folders

Authored structure sprites live under the shared sprite asset root:

```txt
assets/sprites/structures/
  default/
    <sprite>.png
  <mapOrSetName>/
    <sprite>.png
```

Use `assets/sprites/structures/default/` for reusable baseline structure art.
Map-specific or scenario-specific structure sprites can live in a named
subfolder such as `assets/sprites/structures/map3/`.

The runtime may generate an atlas from individual `spriteSrc` files. Artists
should author and edit individual PNGs; runtime atlas generation is an
implementation detail.

## Root Shape

```json
{
  "version": 1,
  "atlas": {
    "src": "",
    "filter": "nearest",
    "slotWidth": 128,
    "slotHeight": 128,
    "gridColumns": 1,
    "gridRows": 1
  },
  "types": [],
  "structures": []
}
```

## Type Shape

```json
{
  "id": "cache",
  "name": "Storage Cache",
  "spriteId": "cache_bundle",
  "spriteSlot": 1,
  "spriteSrc": "assets/sprites/structures/default/cache_bundle.png",
  "visualWidthPx": 2,
  "visualHeightPx": 2,
  "footprint": {
    "width": 2,
    "height": 2,
    "mask": [
      1, 1,
      1, 0
    ]
  },
  "interactionRadiusPx": 3,
  "blocksMovement": false,
  "capabilities": ["container"],
  "stateDefaults": {
    "hidden": false
  }
}
```

Rules:

- `id` is a stable non-empty string.
- `spriteId` is render metadata and must not be treated as the structure type.
- `spriteSlot` is the fixed-grid atlas slot used by the first renderer.
- `spriteSrc` optionally points to an individual source PNG used to generate the
  runtime structure atlas.
- `visualWidthPx` and `visualHeightPx` describe the visual map-space bounds.
- `footprint` describes occupied placement cells.
- `mask` length must equal `width * height`.
- `capabilities` are query tags for gameplay systems.
- `stateDefaults` are merged into newly placed instances.
- `blocksMovement` marks the footprint as impassable for local pathfinding.

## Limits

Initial validation caps keep the sidecar bounded and predictable:

- structure types per map: `256`
- structure instances per map: `4096`
- footprint width/height: `64x64` map cells
- visual width/height: `128x128` map pixels
- sprite atlas slot index: `0..4095`

These are contract limits, not performance targets. Rendering and UI should be
profiled before authoring maps near the upper bounds.

## Instance Shape

```json
{
  "id": "cache_001",
  "type": "cache",
  "pixelX": 430,
  "pixelY": 210,
  "state": {
    "hidden": true
  }
}
```

Rules:

- `id` is stable and unique within the file.
- `type` must reference a declared type.
- `pixelX` and `pixelY` are current single-map pixel coordinates.
- The position is the footprint origin for v1.
- `state` is a shallow object owned by the structure runtime.

## Compatibility

The v1 normalizer is backward-tolerant where intended:

- missing optional fields receive deterministic defaults
- unknown root/type/instance fields are ignored
- unknown `state` and `stateDefaults` keys are preserved
- duplicate IDs, invalid dimensions, invalid masks, missing type references, and
  unsupported versions are rejected

## Placement Rule

Structure footprints must not overlap.

Visual bounds may cover terrain, sprite details, decals, or empty cells below
the structure. Structure-to-structure footprint overlap is rejected on load and
placement.

## Placement Preview

The first editor/debug placement preview is intentionally binary:

- green footprint cells mean the structure can be placed at the hovered anchor
- red footprint cells mean the placement is rejected

This matches an unskilled/player-facing "works or does not work" version.
RD place mode remains active after successful placement so authors can stamp
multiple structures without re-enabling the cursor preview.

Future gameplay can expose richer placement-report levels based on character
skill, tools, or debug mode. Examples:

- per-cell reason colors for occupied, water, slope, out-of-bounds, or reserved
  terrain
- compact textual placement report for the selected structure type
- skill-gated hints that explain why a placement fails
- expert/debug overlays that show all rule checks simultaneously

Those richer reports should build on the same footprint candidate data instead
of moving placement feedback into the structure renderer.

## Pathfinding Rule

Local pathfinding treats cells occupied by structure types with
`blocksMovement: true` as impassable. Non-blocking structures still participate
in placement, lookup, rendering, and selection, but do not affect local path
costs.

Movement execution revalidates the next step against live structure blockers, so
travel stops before entering a structure that became blocked after planning.
Route planning does not yet project structure obstacles into its low-resolution
field.

## Save Behavior

`structures.json` participates in map `Save All` as authored map data.

Mutable run-state separation is still future work. Before player-built,
damaged, moved, or removed structures become campaign state, savegame storage
must be separated from authored map defaults.
