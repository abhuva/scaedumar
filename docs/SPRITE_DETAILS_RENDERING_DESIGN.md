## Sprite Details Rendering Design

### Purpose

This document defines the first planned sprite-detail rendering layer.

Sprite details are static, precomputed, map-space visual details used to make
the terrain richer at close and mid zoom. They are not runtime decals, not
stateful structures, and not the existing terrain material detail system.

The guiding constraint is:

> At any map pixel, the sprite-detail layer has at most one resolved visual
> contribution.

This restriction removes overlap, sorting, rotation, and per-instance runtime
state from the first implementation. In exchange, the layer can render as a
simple texture-driven terrain overlay instead of a large dynamic quad system.

### Terminology

- Material detail: the existing terrain material modulation path driven by
  `detail.json`, material splats, and repeated micro textures.
- Sprite detail: a static indexed scenery/detail overlay resolved per map
  pixel.
- Runtime decal: a future dynamic mark system for temporary tracks, blood, ash,
  disturbed soil, or similar gameplay evidence.
- Structure: an implemented stateful gameplay object such as a cache, shelter,
  hearth, drying rack, cairn, tent, or building. The current implementation is
  specified in `docs/STRUCTURE_DATA_CONTRACT.md` and tracked in
  `docs/STRUCTURES_IMPLEMENTATION_PLAN.md`.

Sprite details intentionally sit between material detail and structures:

- More concrete than material modulation because they use authored sprite art.
- Less stateful than structures because they do not own gameplay identity.

### Use Cases

Good first uses:

- herbs
- reeds
- stones
- leaves
- small branches
- moss patches
- mud flecks
- small shrubs if they read acceptably as top-down scenery
- other static ground-level visual enrichment

Defer or handle separately:

- temporary tracks and blood with lifetime or stacking behavior
- selected or interactable objects
- inventory containers
- structures with footprints or gameplay state
- tall objects that must sort in front of or behind agents
- animated vegetation or wind-reactive sprite props

### Core Model

The sprite-detail layer is represented by two primary textures and one metadata
file:

```txt
sprite_details.png
sprite_details_atlas.png
sprite_details.json
```

`sprite_details.png` is a map-aligned packed data texture. It has the same
pixel dimensions as the current terrain map in the first implementation.

For a `1024x1024` terrain, the initial sprite-detail texture is also
`1024x1024`.

The initial encoding is unpacked `RGBA8`:

```txt
R = sprite id, 0 means empty
G = local sprite U, 0..255
B = local sprite V, 0..255
A = opacity or flags, 0..255
```

The unpacked format is intentionally chosen over a packed `512x512 RGBA`
four-ID format for the first implementation. The packed format is attractive
for ID-only layers, but it spends all channels on sprite IDs and removes useful
per-pixel metadata. The unpacked format is simpler, easier to debug, and leaves
room for arbitrary precomputed sprite footprints.

### Why Not Runtime Quads

Classic decals and sprites are often rendered as quads. That gives strong
freedom:

- overlap
- rotation
- per-instance tint
- per-instance lifetime
- arbitrary transforms
- sorting
- individual interaction

That freedom is not needed for static sprite details. Rendering thousands of
individual quads would add complexity and cost that this layer is explicitly
designed to avoid.

Sprite details instead behave like resolved terrain coloring:

```txt
for this terrain fragment:
  sample sprite_details.png
  if sprite id is empty:
    keep terrain
  else:
    sample sprite_details_atlas.png at the encoded sprite/local coordinate
    composite the sprite pixel into the terrain output
```

This keeps runtime cost close to other texture-layer work already proven in the
renderer.

### Difference From Existing Material Detail

The existing material detail path chooses or blends repeated material textures
for the current terrain fragment. It answers:

```txt
What surface material modulation should this terrain pixel use?
```

Sprite details answer:

```txt
Has precomputation resolved a sprite pixel onto this exact map pixel?
```

The important design point is that `sprite_details.png` stores the resolved
pixel ownership, not sprite anchors. The shader does not need to discover which
nearby sprite might cover the current pixel. That expensive object-awareness
problem is solved offline or during precompute.

### Atlas Contract

The first implementation uses a fixed-grid atlas with `32x32` sprite slots.
This matches the current visual baseline from the terrain material detail
system: `grass_micro.png` is `512x512` and repeats over `16` terrain pixels,
so one terrain pixel currently contains `32x32` detail texture pixels.

The sprite-detail slot size is therefore fixed for the first implementation:

```txt
sprite slot width = 32 px
sprite slot height = 32 px
```

Atlas dimensions are map-configurable. This lets small maps or focused
biomes use a smaller atlas while preserving the same shader path.

Example:

```txt
256x256 atlas = 8 x 8 slots = 64 possible sprite ids
512x512 atlas = 16 x 16 slots = 256 possible sprite ids
sprite id 0 = empty
sprite ids 1..255 = usable ids for one 8-bit placement layer
```

For one `R = sprite id` channel, `512x512` is the largest useful fixed-slot
atlas with `32x32` slots because it exposes exactly `256` slots. A `1024x1024`
atlas would hold `1024` slots, but the current one-byte sprite id could not
address them without changing the placement encoding.

The preferred default is:

```txt
256x256 atlas
32x32 slots
64 slots total
0 = empty
1..63 = usable sprite details
```

Maps that need more visual variety can opt into:

```txt
512x512 atlas
32x32 slots
256 slots total
0 = empty
1..255 = usable sprite details
```

This avoids uploading a large atlas or a 256-entry atlas-rect metadata table
when a map only needs a smaller sprite set.

`sprite_details.json` maps sprite IDs to authoring metadata and can still
record names, source assets, and generation hints:

```json
{
  "version": 1,
  "placement": {
    "src": "assets/map3/sprite_details.png",
    "format": "rgba-id-localuv-alpha"
  },
  "atlas": {
    "src": "assets/detail/sprite_details/default_atlas.png",
    "filter": "nearest",
    "gridColumns": 8,
    "gridRows": 8,
    "slotWidth": 32,
    "slotHeight": 32
  },
  "sprites": {
    "1": {
      "id": "grass_tuft_01",
      "name": "Grass Tuft 01",
      "slot": 1,
      "layer": "ground",
      "composite": "alpha"
    },
    "2": {
      "id": "stone_small_01",
      "name": "Small Stone 01",
      "slot": 2,
      "layer": "ground",
      "composite": "alpha"
    }
  }
}
```

Future atlas versions can support arbitrary packed rectangles through a metadata
texture if fixed-grid slots become too wasteful. That is deliberately deferred
because fixed `32x32` slots keep the shader and authoring contract simple.

### Render Integration

Sprite details should use the existing main WebGL terrain-rendering path.

The first planned integration point is inside or directly adjacent to the main
terrain shader after base terrain color and material detail have been resolved,
but before fog, discovery visibility, and UI overlays.

Conceptual order:

```txt
base terrain splat/albedo
material detail modulation
sprite detail composite
terrain lighting and render effects, or a clearly chosen nearby point
fog/discovery visibility
runtime overlays and UI
```

The exact placement relative to lighting needs testing:

- If sprite details are composited before lighting, they inherit terrain
  lighting and feel embedded.
- If composited after lighting, sprite colors stay closer to authored art and
  are easier to read.

The first implementation should choose the simpler path and document it in
`AI_CONTEXT.md` once implemented.

### Runtime Updates

The layer is static in normal gameplay, but runtime/editor updates are allowed.

Use a CPU-side `Uint8Array` backing store and dirty-rectangle uploads:

```txt
edit pixel or region in CPU backing store
mark dirty rect
merge dirty rects where practical
upload patches with texSubImage2D
```

Small occasional updates are acceptable. Avoid:

- full texture uploads every frame
- one `texSubImage2D` call per pixel for many scattered edits
- readback/synchronization around updates
- re-decoding PNGs for runtime edits

For an unpacked `1024x1024 RGBA8` texture:

```txt
full texture = 4 MiB
64x64 patch = 16 KiB
1x1 patch = 4 bytes plus WebGL call overhead
```

Batching dirty regions matters more than the raw byte count for small edits.

### 512x512 Packed Alternative

A possible future optimization is an ID-only packed texture:

```txt
512x512 RGBA8 over a 1024x1024 terrain
R/G/B/A each store one sprite ID for one of the four covered terrain pixels
```

This reduces an ID-only `1024x1024 RGBA8` layer from `4 MiB` to `1 MiB`.

The packed format is not the first implementation because it cannot also store
local sprite UV and opacity/flags per terrain pixel. It is only appropriate if
the layer contract becomes:

```txt
one byte of sprite ID per map pixel is enough
local sprite UV can be derived procedurally from map coordinates
```

Keep this as a future optimization, not the baseline.

### Precompute Rules

The precompute step owns visual clarity.

Rules should enforce:

- one resolved detail contribution per map pixel
- deterministic output from seed and map inputs
- stable priority ordering when multiple candidate detail types match
- clear spacing for large-looking detail shapes
- no accidental noisy overlap

Potential inputs:

- wetness map
- slope map
- height map
- water mask
- material/detail splat maps
- authored masks
- deterministic coordinate noise

Example priority flow:

```txt
for each map pixel or generation candidate:
  evaluate rules against terrain/masks/noise
  reject failed candidates
  resolve by priority
  write final sprite id, local U, local V, and opacity/flags
```

The runtime should not need to know why a pixel received a sprite detail. It
only consumes the resolved texture and metadata.

### Boundaries

Do not use sprite details for gameplay identity.

If something needs to be selected, owned, damaged, looted, path-blocking,
time-limited, or event-addressable, it should be represented by an owning
gameplay runtime even if it also contributes pixels to a visual layer.

Examples:

- A decorative stone can be a sprite detail.
- A sacred cairn that triggers events should be a structure.
- Ambient ground clutter can be sprite detail.
- A dropped inventory bundle should be a structure/container entity.
- Static grass can be sprite detail.
- Fresh animal tracks with lifetime and knowledge gameplay probably need a
  runtime mark/decal system or a separate dynamic texture layer.

## Runtime Decals

Runtime decals are separate from sprite details.

Sprite details are static, resolved texture data. Runtime decals are dynamic
map-space sprite instances rendered as quads. They are used when overlap,
individual lifetime, or movement history is visually important enough to justify
the extra render cost.

Good decal uses:

- footprints
- overlapping tracks
- blood drops and splashes
- red footprints after stepping in blood
- drag marks
- disturbed soil
- ash or scorch marks
- temporary event aftermath

Do not use runtime decals for static scenery that can be represented by
`sprite_details.png`.

### Decal Rendering Model

Runtime decals render as atlas-backed quads.

They support:

- true overlap
- independent lifetime
- per-decal opacity
- per-decal sort/order priority
- optional tint
- optional rotation if it fits the pixel-art style
- range and zoom based render filtering

The first implementation should render decals after terrain and sprite details.
The exact order relative to agents should be chosen by the use case. Ground
marks such as blood and footprints should render below agents.

Conceptual order:

```txt
base terrain splat/albedo
material detail modulation
sprite detail composite
runtime ground decals
agents / objects
fog/discovery visibility or a clearly chosen nearby point
runtime overlays and UI
```

Rotation should be supported in the data path, but art direction may restrict
actual authored decals to cardinal rotations or pre-rotated sprite variants.
Nearest-neighbor rotated pixel art can shimmer or become visually noisy.

### Decal Cost Controls

The decal runtime must be built around explicit render-budget controls from the
start.

Each decal has policy data that decides whether it is considered for rendering:

```txt
render range around player or camera
minimum zoom
maximum zoom
importance
sort order
lifetime/freshness
```

This allows thousands of decals to exist in memory while only a bounded subset
is submitted to the GPU.

Render filtering should follow this shape:

```txt
discard expired decals
discard decals outside their render range
discard decals outside their zoom range
rank remaining decals by importance, freshness, and distance
draw at most maxVisibleDecals
```

The first implementation should expose a conservative visible cap. The cap can
be tuned after profiling.

### Decal Data Layout

Runtime decals must use typed/parallel arrays from the start.

Do not store the active decal set as a JSON-style array of objects. That shape
is convenient for authoring, but it is the wrong runtime representation for
large mutable instance sets.

Recommended runtime layout:

```txt
capacity
count
freeList
ids              Uint32Array
spriteIds        Uint16Array
pixelX           Float32Array
pixelY           Float32Array
widthPx          Float32Array
heightPx         Float32Array
rotationSin      Float32Array
rotationCos      Float32Array
opacity          Float32Array
tintR            Float32Array
tintG            Float32Array
tintB            Float32Array
createdTick      Uint32Array
expiresTick      Uint32Array
importance       Uint16Array
sortOrder        Uint16Array
renderRangePx    Float32Array
minZoom          Float32Array
maxZoom          Float32Array
flags            Uint32Array
```

This is not premature optimization. It is the correct data type for a runtime
system that may hold thousands of small, similarly-shaped instances.

Advantages:

- compact memory
- predictable iteration cost
- direct visible-list filtering
- direct GPU instance-buffer packing
- no per-decal object allocation churn
- easier future pooling and free-list reuse

Authoring, debug export, or save data may still serialize through JSON-shaped
objects at the boundary. The owner runtime should normalize that data into the
typed-array layout immediately after load/import.

### Decal Atlas

Runtime decals should use a fixed-grid atlas, matching sprite details where
practical.

Initial atlas recommendation:

```txt
32x32 slots
256x256 atlas = 64 decal sprites
512x512 atlas = 256 decal sprites
nearest filtering
```

Decals and sprite details may use separate atlases even if they share the same
slot size. Separate atlases keep static scenery art and temporary evidence art
independent.

### Decal Ownership

Recommended owner modules:

```txt
src/gameplay/decalRuntime.js
src/render/decalRenderer.js
```

`decalRuntime` owns:

- typed-array storage
- allocation/free-list behavior
- add/remove/update APIs
- lifetime expiration
- visible decal filtering
- render cap policy
- snapshot or buffer data for the renderer

`decalRenderer` owns:

- WebGL program and buffers
- atlas binding
- instance upload
- alpha blending
- drawing visible quads

Gameplay systems may create decals through explicit owner APIs or commands.
The renderer must not mutate decal state.

### Decal Boundaries

Decals are visual evidence, not gameplay truth by default.

Examples:

- A tracking field or trail runtime should own true trail/freshness gameplay.
- The decal runtime can visualize footprints or blood trails created from that
  gameplay.
- Hunting, pathfinding, or events should not infer truth by reading rendered
  decal pixels.

If a mark must be selected, inspected as a unique object, looted, or referenced
by an event, it should have a gameplay owner in addition to any decal visuals.

## Structures

Structures are the third sprite-backed category.

They are permanent or semi-permanent stateful map objects that often span
multiple terrain pixels. The main difference between structures and decals is
not necessarily the rendering technique. The main difference is ownership and
data structure.

Implementation status:

- `structures.json` is implemented as an optional map sidecar.
- `src/gameplay/structureRuntime.js` owns structure identity, state, footprint
  occupancy, no-overlap placement validation, movement blocking queries, and
  render/query snapshots.
- Structure rendering uses `src/render/mapSpriteRenderer.js` and the structure
  render pass, with a runtime atlas generated from individual `spriteSrc` PNGs.
- `RD > Sprites > Structures` owns the current authoring/debug surface,
  including repeated cursor place mode, green/red footprint preview, selection,
  removal, render visibility, and occupancy overlay.
- Local pathfinding treats `blocksMovement: true` structure footprints as
  impassable. Route-planning obstacle projection is still future work.

Examples:

- campfires and hearths
- tents and shelters
- drying racks
- storage caches
- cairns and spirit poles
- buildings
- animal pens
- placed worksites
- interactable corpses or remains

Structures should not be represented as sprite details, because they own
gameplay identity. Structures should not be owned by the decal runtime, because
they are not temporary overlapping marks.

Structure sprite source art lives under:

```txt
assets/sprites/structures/default/
assets/sprites/structures/<mapOrSetName>/
```

Structure sidecars can reference individual source PNGs through `spriteSrc`.
The runtime can generate an atlas from these individual images so artists do
not need to edit atlas sheets directly.

### Structure Rules

The first implementation should not allow structure-to-structure overlap.

A structure occupies a clear footprint. Placement validation should reject
overlap with existing structures and can later reject invalid terrain such as
deep water, over-steep slopes, blocked cells, or scenario-reserved zones.

Visual overlap over terrain, sprite details, and decals is expected. A tent or
hearth can hide the visual information below it. Structure overlap with other
structures is the part that is disallowed.

### Structure Rendering

Structures can reuse the same low-level map-space quad rendering backend as
runtime decals.

They should not use the decal runtime as their owner.

Recommended split:

```txt
structureRuntime
  owns identity, footprint, state, placement rules, persistence

decalRuntime
  owns temporary overlapping visual marks

map sprite / quad renderer
  draws atlas-backed map-space quads for both structures and decals
```

The shared renderer can draw both categories because both are ultimately
textured map-space quads. The owner runtimes remain separate because their data
contracts and gameplay responsibilities are different.

For first rendering:

```txt
terrain
material detail
sprite details
runtime ground decals
structures
agents / UI overlays
```

Structure sprites use normal atlas image orientation from authored PNGs. The
renderer flips atlas V coordinates during vertex packing so artists do not need
to save vertically inverted source images.

The first structure lighting pass should stay lightweight: sample the terrain
normal, shadow, and point-light textures at the structure fragment's map UV,
then apply the current sun, moon, and ambient frame lighting to the sprite
color. This does not make structures true 3D geometry, but it keeps them in the
same lighting context as the terrain.

If agents later need to walk visually in front of or behind tall structures,
structures and agents may need a shared y-sort pass. That is not required for
the first slice.

### Structure Data

Structures need more semantic state than decals.

Important concepts:

- stable structure id
- structure type
- sprite id or state-derived sprite variant
- anchor position
- visual width and height in map pixels
- footprint mask or footprint rectangle
- interaction radius or interaction points
- placement validity rules
- optional inventory/container id
- optional condition/damage state
- optional activity/event hooks

Example serialized shape:

```json
{
  "id": "structure_001",
  "type": "campfire",
  "spriteId": "campfire_unlit",
  "pixelX": 430,
  "pixelY": 210,
  "visualWidthPx": 3,
  "visualHeightPx": 3,
  "footprint": {
    "width": 3,
    "height": 3,
    "mask": [
      1, 1, 1,
      1, 1, 1,
      0, 1, 0
    ]
  },
  "interactionRadiusPx": 3,
  "state": {
    "lit": false,
    "fuelTicks": 0,
    "condition": 1
  }
}
```

The runtime can store common placement/render fields in arrays and type-specific
state in side tables if needed. Structure counts are expected to be low enough
that the first implementation does not need the same compact typed-array
discipline as decals, but the owner should still keep common state explicit and
testable.

### Structure Precompute

Do not precompute structure visuals into sprite-detail textures for normal
runtime use.

Visual precompute helps when instances are numerous, static, non-interactive,
and have no identity. Structures are low-count, stateful, and interactable, so
visual precompute would remove useful flexibility while saving little render
cost.

The useful precompute/cache for structures is occupancy, not color.

Maintain or rebuild a structure occupancy grid:

```txt
0 = empty
>0 = structure index or structure id reference
```

This supports:

- placement validation
- no-overlap enforcement
- click/hover lookup
- interaction lookup
- pathing or movement-cost integration

The occupancy grid can be rebuilt after placement/removal at first. Dirty
footprint updates can be added later if structure counts grow.

### Structure Persistence

Structures should persist as data, not as baked pixels.

Long-term there should be a distinction between:

- authored scenario/map defaults
- mutable run or savegame state

`structures.json` now defines authored map/scenario structures and participates
in map `Save All`.

Mutable player-built or damaged structures should eventually belong to savegame
state, not be blindly written back into authored map defaults. That separation
is still future work.

## Agents

Agents are the fourth sprite-backed category.

They include the player, NPCs, ground animals, birds, hawks, and later other
moving creatures. Agents are not sprite details, decals, or structures. They are
stateful entities owned by their gameplay or simulation runtimes.

Rendering can still reuse the same atlas-backed map-space quad backend used by
decals and structures.

### Agent Position Model

Agents should use continuous map-space render positions.

Do not lock agent rendering to integer terrain pixels. Smooth movement and
flying-agent behavior both need fractional positions.

Separate these concepts:

```txt
simulation position
gameplay/interaction position
render position
```

Examples:

- Birds and hawks already simulate continuous `x`, `y`, and `z` positions.
- The player may remain gameplay-grid or path-step driven, but can render at an
  interpolated position between movement steps.
- Ground animals can use continuous simulation positions even if some gameplay
  queries snap them to cells.

The renderer should consume render positions from the owning runtime, not derive
gameplay truth by itself.

### Agent Height

Agents may have height.

Birds and hawks already use height information in simulation. Sprite rendering
should preserve that information visually instead of only encoding it through
color.

Height can affect:

- sprite scale
- optional opacity
- optional tint or lighting response
- optional future shadow/ground-projection effects

Recommended first height effect:

```txt
heightNorm = clamp(z / maxAgentHeight, 0, 1)
visualScale = baseScale * mix(1.0, maxHeightScale, heightNorm)
```

The scale range should be modest so altitude reads as height rather than the
animal changing size. A range such as `1.0x` to `1.5x` or `1.6x` is a safer
starting point than extreme scaling.

Flying agents can render above structures because they are airborne. Ground
agents may later need ordering against structures if tall objects become common.

### Agent Visual Footprint

Do not use a hard "one map pixel" rule for agents.

Use separate footprints:

```txt
render footprint
gameplay footprint
```

The render footprint is the visible sprite size in map-space or screen-space
terms. It can be continuous, offset, scaled by height, and animated.

The gameplay footprint is owned by the gameplay system. It can be one grid cell,
a radius, an explicit collision shape, or no blocking footprint at all.

Examples:

- A bird may have no ground-blocking gameplay footprint, but a visible flying
  sprite with height-based scale.
- The player may occupy one gameplay cell while rendering smoothly between
  cells.
- A wolf may use a small gameplay radius but a larger readable sprite.
- A structure uses an explicit footprint mask and is not an agent.

### Agent Sprite Rules

Initial sprite constraints:

```txt
atlas slot size = 32x32
positions = continuous map coordinates
height = optional
scale = per-agent or height-derived
offset = optional visual pivot/anchor adjustment
direction = cardinal/discrete direction index or explicit render rotation
```

Cardinal or 8-way direction is preferred over arbitrary free rotation for the
first version. Free rotation can make pixel sprites shimmer or lose readability.
Pre-authored directional frames usually read better.

Exception for the first swarm sprite slice: birds and hawks use one authored
sprite slot and rotate the quad from their simulation velocity vector. Their
movement vector already exists, the sprites are small, and flight direction is
more important than preserving atlas slots for pre-rotated variants. The
rotation is render-only and happens around the sprite pivot/origin; it does not
change simulation, possession, hunting, or gameplay footprints.

Future animation can be selected CPU-side by the owning runtime:

```txt
agent type + movement state + direction + animation frame -> sprite id
```

The shader should not need to own gameplay animation state.

For simple swarm sprite animation, use horizontal strips with metadata-defined
frame counts:

```txt
frameCount = authored frame count, for example 3, 6, or 40
animationFps = visual frames per real/render second
animationMode = renderTime
animationPhase = stableId
```

Example: a `6` frame bird strip uses a `192x32` PNG when the slot size is
`32x32`. The runtime chooses `spriteSlot + directionFrameOffset +
animationFrameIndex`, while the atlas builder crops all frames from the
horizontal strip into consecutive fixed-grid atlas slots. This keeps runtime
rendering as cheap UV slot selection and avoids rebuilding the atlas when the
current frame or direction changes.

The frame count is not fixed to `6`. A `3` frame strip, `40` frame strip, or any
other positive frame count follows the same rule. The atlas metadata must reserve
enough consecutive slots; the first swarm implementation keeps `16` columns and
adds rows as needed for larger strips.

Directional source spans use the same reservation rule. A cardinal sprite with
`directionCount = 4` and `frameCount = 1` reserves four consecutive atlas slots.
If the source PNG has only one authored frame, the atlas builder repeats that
image into every reserved direction slot. If the source is a horizontal strip
wide enough for all reserved slots, each direction/frame slot is cropped from
the strip. This keeps a moving player or NPC visible while its direction
changes.

Agent render items may include explicit `sourceSlotWidth` and
`sourceSlotHeight`. These values describe the authored source-frame crop size,
not the gameplay footprint and not necessarily the final runtime atlas slot
size. This is required for mixed-size atlases: for example, a `32x32` bird strip
can be cropped frame-by-frame and then packed into a `64x64` combined agent
atlas when the player also uses `64x64` art. Sources without explicit source
slot metadata are treated as whole-image sprites and scaled into their atlas
slot; this keeps structure PNGs such as `128x128` tents from being accidentally
cropped by agent defaults.

Render-time animation is the default for wing flaps because game time can be
accelerated and simulation steps may be budgeted. Gameplay-tick animation can
still be added later for actions that must communicate simulation state.

Agent sprites use binary alpha cutouts in the shared map-sprite renderer. Source
pixels with alpha `0` are discarded; any non-zero alpha is rendered fully opaque
after lighting. This avoids unintended soft/semitransparent birds when authored
sprite edges contain partial alpha.

Sprite definitions may also opt into source color-keying during atlas
construction:

```txt
transparentColor = "#ffffff"
transparentColorTolerance = 0
```

With tolerance `0`, only exact full-white source pixels become alpha `0` in the
generated atlas. This lets crisp pixel-art strips use a white background without
an alpha channel while keeping the renderer itself unchanged. The current bird
sprite definition uses this exact-white import key.

Agent sprites may also opt into reusable grayscale LUT recoloring. Shared render
LUT definitions live in:

```txt
assets/data/render_luts.json
```

The first supported LUT type is `grayscale-ramp`:

```txt
input grayscale 0..255 -> output RGB
```

`src/render/renderLutRegistry.js` normalizes authored color stops, generates
fixed two-digit variant IDs, and builds a compact `256xN` RGBA atlas where each
row is one 1D LUT. Sprite definitions reference LUTs by ID or by variant range;
they do not embed color stops.

Example:

```json
"palette": {
  "mode": "grayscale-lut",
  "selection": "stable-random",
  "lutRefs": [
    { "id": "animal.bird.dark" },
    { "range": { "family": "animal.bird", "start": 0, "count": 16 } }
  ]
}
```

Variant range IDs follow this fixed scheme:

```txt
<family>.variant.<nn>
```

Example:

```txt
animal.bird.dark.variant.00
animal.bird.dark.variant.01
```

Swarm birds choose a stable LUT row from their stable agent ID. The map-sprite
shader samples the LUT before applying the existing terrain lighting path, so
palette variation still sits in the scene lighting context.

### Agent Rendering Order

Initial order:

```txt
terrain
material detail
sprite details
runtime ground decals
structures
ground agents
flying agents
UI overlays
```

This prioritizes agent readability.

Future options:

- shared y-sort for ground agents and tall structures
- separate airborne pass for birds and hawks
- optional ground shadow decal or projected marker for flying agents

### Agent Ownership

Agent sprite rendering should be fed by owner runtimes:

```txt
player runtime -> player sprite render data
swarm/animal runtime -> animal sprite render data
future NPC runtime -> NPC sprite render data
```

The renderer owns only drawing. It should not mutate agent simulation, gameplay,
selection, possession, or movement state.

The existing swarm interpolation pattern is a useful precedent: authoritative
simulation coordinates remain the source of truth, while rendering can consume
smoothed/interpolated positions.

### Agent Sprite Definition Files

Agent sprites use one shared definition schema, split into separate JSON files by
owner/lifecycle:

```txt
assets/data/agents/player_sprites.json
assets/data/agents/swarm_sprites.json
```

The player file currently defines one `player` sprite. The current source image
is a single `64x64` PNG, so it uses `slotWidth: 64`, `slotHeight: 64`,
`directionCount: 1`, and `frameCount: 1`. Source-art slot size is separate from
gameplay footprint and from `visualWidthPx`/`visualHeightPx`.

The swarm file currently defines `bird` and `hawk`. Bird metadata owns the
`6`-frame strip, render-time animation settings, velocity rotation, height
scaling, exact-white source color key, and reusable grayscale LUT recoloring
refs. Hawk metadata currently owns one velocity-rotated frame.

The split is intentional: player/NPC visuals and swarm/animal visuals share the
same renderer-facing schema, but their gameplay owners and future override
lifecycles differ.

### Agent Debug Visibility

The first debug implementation keeps legacy swarm square rendering as a
fallback, but it must not render at the same time as swarm sprites.

Use one shared swarm render-mode setting:

```txt
swarm square mode -> legacy lit/unlit swarm renderer may draw
swarm sprite mode -> agent sprite pass draws birds/hawks and square paths are suppressed
```

This setting is exposed in both useful debug locations:

- `RD > Agents > Swarm`, next to the existing fully lit swarm control
- `RD > Sprites > Agents`, next to player/agent sprite controls

The two controls mirror the same runtime setting. They are developer visibility
controls only; they do not change swarm simulation, scout possession, hunting,
or any gameplay query.

Player sprite visibility follows the same single-visual-path rule. The
`RD > Sprites > Agents` player toggle controls the authored player sprite; while
it is visible, the old 2D overlay player marker is suppressed. Disabling the
player sprite leaves the marker available as a debug fallback. The authored
player sprite should not inherit the player debug color as a tint unless a
future explicit styling/debug control is added.

### Player Readability Options

The terrain is intentionally noisy and high-detail, so player visibility should
not rely on the sprite art alone. These are the current options under
consideration:

- Ground halo or selection shadow: draw a small ellipse under the player, about
  `1.2` to `1.5` map pixels wide. This is cheap, diegetic enough for top-down
  RPG presentation, and should render under the player sprite but above terrain,
  details, and decals.
- Sprite outline or stroke: render a one-pixel dark or light outline around the
  player. This is very effective for pixel art, but needs either shader support
  or authored outlines on every sprite. Dynamic outline support is better
  long-term than manually baking it into every player asset.
- Slightly larger visual scale: keep the gameplay footprint at one map pixel,
  but render the player at `1.25x` or possibly `1.5x`. This is a JSON-level
  visual change through `visualWidthPx` and `visualHeightPx`, but too much scale
  can make the player feel detached from map-pixel size.
- Player lighting bias: prevent the player from fully inheriting dark/warm
  terrain lighting by adding a small minimum brightness or emissive term. This
  should be subtle, not a glow effect.
- Color and value art rule: player sprites need stronger silhouette/value
  contrast than terrain. The current terrain is mostly orange, brown, green, and
  high-frequency texture; player art should reserve darker silhouettes, brighter
  highlights, or colder accents such as blue/cyan/off-white that are rare in the
  terrain.
- Low-zoom UI marker: show a tiny chevron, diamond, vertical pip, or brief pulse
  above the player only when zoomed out. This helps navigation but is less
  diegetic, so it should fade out when zoomed in.

Recommended first implementation: add a player-only ground halo/shadow and then
evaluate whether `visualWidthPx`/`visualHeightPx` should move from `1.0` to
`1.25`. Keep the authored sprite untinted. Add a true outline shader only if the
halo plus improved art is not enough.

### Sprite Source Cache Policy

Runtime-generated sprite atlases load individual PNGs from paths such as
`assets/sprites/agents/default/player.png`. Browser-served image URLs must use a
cache-busting query token during development so replacing a PNG on disk is
visible after a reload. Non-browser schemes such as `file:`, `asset:`, `blob:`,
and `data:` are left unchanged.

## Open Questions

- Should sprite details be lit with terrain lighting or composited after
  lighting for readability?
- Should `A` start as opacity, flags, or both through quantized packing?
- Should tree-like scenery be excluded until a separate object-detail layer
  exists?
- Should the precompute tool live in the browser runtime, a Node script, or
  both?
- Should `sprite_details.png` be authored directly, generated from rules, or
  regenerated only through RD tooling?
- Should runtime ground decals render before or after fog/discovery visibility?
- Should actual decal rotation be freeform, cardinal-only, or mostly represented
  through pre-rotated atlas variants?
- What should the first `maxVisibleDecals` cap be for the prototype?
- Should structures render before agents for readability, or should structures
  and agents move toward a shared y-sort once taller objects exist?
- Should flying agents get a ground shadow/projection mark in the first sprite
  pass, or should height scaling alone prove the idea first?
- Should first agent directions be cardinal-only or 8-way?

## First Implementation Slice

Recommended first slice:

1. Add optional `sprite_details.png`, `sprite_details_atlas.png`, and
   `sprite_details.json` loading.
2. Upload placement and atlas textures through the main WebGL renderer.
3. Add shader support for `rgba-id-localuv-alpha` with fixed `32x32`
   atlas slots.
4. Composite sprite details in the terrain render path behind a feature flag.
5. Add a raw debug view for the sprite-detail placement texture.
6. Add a tiny authored proof layer for one map.
7. Document the implemented render order and file contract in `AI_CONTEXT.md`.

Defer:

- runtime decal lifetimes
- sprite animation
- atlas packing beyond fixed-grid slots
- placement editor UI
- multiple sprite-detail layers
- agent/object sorting
