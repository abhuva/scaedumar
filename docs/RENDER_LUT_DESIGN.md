# Render LUT Design

## Purpose

This document defines the reusable render LUT feature set.

The first implemented use case is palette variation for many small agent
sprites, especially birds. The feature is intentionally broader than birds:
LUTs are reusable render data and can later support animals, NPC clothing,
structure state visuals, debug ramps, resource overlays, and authored visual
experiments.

## Core Model

The first supported LUT type is a 1D grayscale ramp:

```txt
input grayscale 0..255 -> output RGB
```

Runtime storage uses one 2D texture only because it stores many 1D LUTs:

```txt
width = 256
height = number of resolved LUT rows
one row = one 1D LUT
```

The shader uses:

```txt
x = grayscale value
y = selected LUT row
```

This is conceptually still a 1D LUT per selected row.

## Current File Contract

Shared global LUT definitions live in:

```txt
assets/data/render_luts.json
```

Maps may optionally provide a map-local override/extension sidecar:

```txt
assets/<mapName>/render_luts.json
```

The runtime owner is:

```txt
src/render/renderLutRuntime.js
```

The runtime keeps the editable source-definition boundary and exposes selected
row state, preview image data, ref resolution, and rebuild APIs. It builds on:

```txt
src/render/renderLutRegistry.js
```

The registry normalizes authored color stops, generates variant rows, builds a
`256xN` RGBA atlas, and exposes ID-to-row lookup data.

It also exposes pure preview helpers that extract a resolved LUT row and repeat
it into image-data-shaped RGBA bytes. RD/UI code should use those helpers for
preview strips instead of reading atlas internals directly.

The reusable RD surface is `RD > Sprites > LUT`. Agent-specific panels may show
consumer status, but LUT inspection and editing controls belong in the LUT
subtab so the tool can support birds, hawks, NPCs, structures, and future sprite
consumers without becoming swarm-specific.

The editor can target either global or map-local source scope. Explicit LUT rows
from the selected source are editable through draggable stop handles and color
pickers. Applying edits rebuilds the runtime registry, RD preview, generated
variant rows that derive from the edited base LUT, and active sprite-render LUT
snapshot data. The editor supports explicit LUT creation, rename, and deletion
in the chosen scope. Map-local LUT IDs override same-ID global LUTs for the
active map only.

The large editor is opened from `RD > Sprites > LUT` and has its own explicit
LUT selector, separate from swarm/agent consumer state. It previews exactly one
selected 1D LUT row. Stop handles are HTML controls over the preview canvas;
dragging a handle changes its grayscale position, selecting a handle exposes the
color picker, and clicking the preview adds a stop at that position using the
current interpolated color. Endpoint stops are locked to positions `0` and
`255` in the first slice. The editor also shows a generated-variant preview for
variant families whose `baseLutId` is the selected explicit LUT; each visible
row is one resolved `256x1` LUT row. Variant-family controls expose family name,
generated ID preview, count, seed, position jitter, brightness jitter, and color
jitter. Every explicit LUT exposes these controls. `count = 0` is the canonical
disabled/no-variants state; while count is zero, seed and jitter controls are
disabled because they have no generated rows to affect. Raising count above zero
enables the remaining controls and generates rows normally. In gameplay RD, the
editor docks directly to the right edge of the RD panel,
matches the RD panel height, and fills the remaining screen width.
Runtime code reparents the editor overlay to `document.body` after markup
injection so the fixed editor is not clipped by RD panel overflow containers.
`Save Global` writes only the global LUT source back to the global
`assets/data/render_luts.json` location. In Tauri, an absolute loaded map path
derives the sibling `assets/data/render_luts.json` path automatically; if that
path points inside `.tauri-dist`, it resolves back to the repo-level
`assets/data/render_luts.json` source file. With a relative map path the editor
asks for the project `assets/data` folder before writing. In a browser/dev-server
session, the editor first uses the browser single-file save picker, then the
directory picker, and only falls back to downloading `render_luts.json` when
direct file/folder writes are unavailable. Map-local LUT data participates in
map `Save All` as `render_luts.json`; global LUT data does not.
The editor tracks draft dirty state separately from runtime/global dirty state:
draft edits must be applied before they affect runtime sprites, and applied
runtime edits keep `Save Global` enabled until a real native/file-picker write
succeeds. Closing the editor or switching editable LUTs warns when draft edits or
runtime-global saves would be lost. The save diagnostics readout reports the
current save mode, target path, active map folder, and browser/Tauri write API
availability. Applied map-local LUT edits show as needing map `Save All`; applied
global LUT edits show as needing `Save Global`.
The lower editor area is split into a usage/debug box and a variant box. The
debug box reports selected LUT ID, variant family, resolved row indexes,
metadata references, and missing references. The variant box owns the generated
row preview and variant sliders.

Bird LUT consumption controls live under `RD > Agents > Swarm` because they
change how the bird swarm consumes available LUT families rather than editing LUT
definitions. The first controls expose a generated family selector and variant
count, then update the bird sprite `palette.lutRefs` at runtime.

Example:

```json
{
  "version": 1,
  "luts": {
    "animal.bird.dark": {
      "type": "grayscale-ramp",
      "stops": [
        { "pos": 0, "rgb": [5, 6, 7] },
        { "pos": 96, "rgb": [42, 35, 27] },
        { "pos": 255, "rgb": [170, 142, 91] }
      ]
    }
  },
  "variants": [
    {
      "family": "animal.bird.dark",
      "baseLutId": "animal.bird.dark",
      "type": "grayscale-ramp",
      "count": 16,
      "seed": 1847,
      "positionJitter": 8,
      "brightnessJitter": 0.12,
      "colorJitter": 0.04
    }
  ]
}
```

## Color Stops

A grayscale ramp is authored as sorted or unsorted color stops:

```json
{ "pos": 123, "rgb": [211, 231, 87] }
```

Rules:

- `pos` is clamped to `0..255`.
- RGB channels are clamped to `0..255`.
- Stops are sorted by `pos`.
- Later stops with the same `pos` replace earlier stops.
- Missing stop lists normalize to a black-to-white identity ramp.
- Runtime rows are generated by linear interpolation between neighboring stops.

Duplicate LUT IDs use first-wins behavior so atlas row numbers remain
deterministic. Duplicates are still reported through registry debug metadata as
`duplicateIds` so RD and validation tooling can surface authoring mistakes.

## Variant IDs

Generated variant IDs use a fixed two-digit naming scheme:

```txt
<family>.variant.<nn>
```

Examples:

```txt
animal.bird.dark.variant.00
animal.bird.dark.variant.01
animal.bird.dark.variant.15
```

The two-digit suffix intentionally caps one generated family at `00..99`. That
is enough for sprite variation while keeping authored references readable.

Variant families should normally derive from an explicit base LUT:

```json
{
  "family": "animal.bird.dark",
  "baseLutId": "animal.bird.dark",
  "count": 16,
  "seed": 1847,
  "positionJitter": 8,
  "brightnessJitter": 0.12,
  "colorJitter": 0.04
}
```

`baseLutId` means generated rows are recalculated from the current explicit
base stops. Runtime-local edits to that base therefore affect its generated
variant preview and the resolved atlas after Apply. Inline `variants[].stops`
remain backward-tolerant fallback input for experiments, but duplicated stops
are not the preferred authoring model.

The default family for a generated variant set is the selected explicit LUT ID.
For example, variants of `animal.bird.dark` default to
`animal.bird.dark.variant.00..99`.

Variant families with `count: 0` are valid and intentionally generate no rows.
This is preferred over a separate no-variant state because the same controls can
disable and re-enable variants without changing the selected LUT or editor
mode.

## Sprite References

Sprites reference reusable LUTs by ID or by variant range. They do not embed
color stops.

Example from bird sprite metadata:

```json
"palette": {
  "mode": "grayscale-lut",
  "selection": "stable-random",
  "lutRefs": [
    { "id": "animal.bird.dark", "weight": 2, "tags": ["forest"] },
    { "id": "animal.bird.pale", "weight": 1 },
    { "range": { "family": "animal.bird.dark", "start": 0, "count": 16 }, "weight": 1 },
    { "id": "animal.bird.rare.white", "rare": true, "tags": ["winter"] }
  ]
}
```

The range expands to:

```txt
animal.bird.dark.variant.00
animal.bird.dark.variant.01
...
animal.bird.dark.variant.15
```

The shipped bird proof set includes the explicit rare ID:

```txt
animal.bird.rare.white
```

For swarm birds, the snapshot owner chooses one available row through a stable
hash of the stable agent ID. The selected row is render metadata only and does
not change swarm simulation, scout possession, hunting, or gameplay truth.

`weight` is optional and defaults to `1`. A range weight applies to every row in
that range. Selection is deterministic for a stable agent ID, but weighted rows
receive proportionally more of the hash space. Rows with weight `0` remain valid
for preview/debug but are not selected unless every available row has weight
`0`, in which case selection falls back to uniform hashing.

`rare: true` is a shorthand for a low default weight of `0.1`. Explicit
`weight` still wins, so `{ "rare": true, "weight": 0.25 }` is valid when a rare
row should be more common than the default rare policy.

`tags` are optional authoring hints for biome, weather, or scenario constrained
selection. A runtime may pass requested palette tags such as `winter` or
`forest`; tagged rows matching any requested tag are preferred. If no tagged row
matches, selection falls back to the full candidate set so visuals never fail
only because a context tag is too specific.

Startup-loaded sprite metadata is validated against the global LUT registry.
Missing explicit IDs or missing generated range members are treated as startup
data errors for shipped assets. Optional map-local LUT behavior is deferred and
may choose a softer policy later.

## Render Integration

The current integration is in:

```txt
src/render/mapSpriteRenderer.js
```

Render items can carry:

```txt
paletteMode = "grayscale-lut"
paletteRow = resolved LUT atlas row
```

The shader flow is:

```txt
sample sprite texel
discard alpha cutout
if grayscale LUT mode:
  grayscale = luminance(sprite.rgb)
  spriteRgb = sample LUT atlas at grayscale and palette row
else:
  spriteRgb = sprite.rgb
apply existing sprite tint
apply existing terrain lighting
```

LUT sampling happens before lighting so recolored sprites remain integrated with
sun, moon, ambient, shadow, and point-light context.

## Current Scope

Implemented now:

- `grayscale-ramp` LUTs.
- Explicit LUT IDs.
- Fixed two-digit generated variant ranges.
- `256xN` runtime LUT atlas.
- Optional grayscale LUT recoloring for agent sprites.
- Stable per-bird LUT row selection.
- Weighted, rare, and tag-preferred LUT row selection.
- Runtime-local RD explicit LUT editing with draggable handles and color picker.
- Base-linked generated variant previews in the large RD LUT editor.
- Runtime-local variant-family sliders for count, seed, position jitter,
  brightness jitter, and color jitter.
- Dedicated global save action for `assets/data/render_luts.json`.
- Optional map-local LUT overrides through `assets/<mapName>/render_luts.json`.
- Map-local LUT data included in map `Save All` when present.

Not implemented now:

- Per-agent unique generated LUT rows.
- Palette-index sprite modes.
- Multi-channel mask recoloring.
- 3D color-grading LUTs.
- Material-output LUTs.

## Current Wrap-Up Gaps

Before closing the current LUT branch, verify or address these remaining items:

- Manual browser smoke test for the large LUT editor: create global and
  map-local LUTs, rename/delete LUTs, edit family name/count, verify generated
  IDs and previews, run `Save Global`, hard-refresh, run map `Save All`, and
  reload a map-local LUT.
- Manual render smoke test: enable swarm sprite mode, confirm bird color
  variation, confirm hawks/player/structures still render normally, and confirm
  sprite lighting still responds to sun, shadow, and point lights.
- Invalid map-local `render_luts.json` handling is not hardened yet. The current
  optional sidecar loader logs parse/apply failures and falls back instead of
  surfacing a blocking title/map-load error.
- Add focused tests for URL and selected-folder map-local LUT loading, clearing
  absent map-local LUT state, map-local override precedence, and the chosen
  invalid-sidecar policy.
- Improve debug/validation reporting for global/map-local duplicate IDs and
  invalid refs so intentional overrides are distinguishable from authoring
  mistakes.
- Optional polish: add a clearer visual badge for active source scope and
  saved/dirty status in the large LUT editor.

## Deferred Experiments

### Palette-Index Remap

Sprite pixels could store discrete palette indexes instead of grayscale values:

```txt
pixel value 0 = outline
pixel value 1 = wing
pixel value 2 = belly
pixel value 3 = beak
```

This is useful for hard part-based recoloring but needs art authored with exact
index values. It is separate from smooth grayscale ramps.

### Multi-Channel Mask Recoloring

Sprite RGB channels could act as masks:

```txt
R = feather mask
G = belly mask
B = beak mask
```

Each channel could sample a different ramp or color. This is useful for clothing
and complex creatures, but the shader and authoring contract are larger than the
bird variation slice.

### UV Lookup Animation

The Astortion-style approach separates animation pixels from final appearance.
An animation sprite stores lookup coordinates into an appearance texture, and
the shader samples final color from that texture.

Potential later uses:

- one body animation with many clothing skins
- wet, injured, dirty, or faction variants
- equipment changes without redrawing every animation frame
- NPC visual variety from shared animation data

This is more powerful than grayscale LUTs but requires a stricter authoring
pipeline and conversion/validation tools. It should not be the next short-term
step unless sprite animation variety becomes a larger bottleneck.

### 3D Color-Grading LUT

A color-grading LUT maps full RGB to RGB:

```txt
input RGB -> output RGB
```

This is useful for whole-scene or material color grading, not for the current
grayscale sprite variation use case.

### Material LUT

A future LUT could output more than color:

```txt
value -> color + emission + roughness + lighting bias
```

That may matter if sprites gain richer material behavior. It is explicitly out
of scope for the first reusable LUT contract.

## Boundaries

LUTs are render presentation data.

Gameplay systems must not infer truth from selected LUT rows. If an animal,
NPC, structure, or resource state needs gameplay semantics, that state must
belong to its gameplay owner and may then choose a LUT for presentation.
