# Slime Sim Mechanics

## Purpose

Slime Lab is a dev workspace for GPU Physarum-style transport experiments. It is
currently isolated from core gameplay and exists to test high-density field
simulation, terrain coupling, and future GPU-texture-driven gameplay systems.

The implementation is intentionally WebGL2-first for the current browser/Tauri
prototype. If the experiment becomes gameplay-critical at larger scale, the
runtime boundary in `src/slime/` should allow a later WebGPU or native WGPU
backend without rewriting UI or settings integration.

## Runtime Ownership

- Workspace entry: `Slime` in the top workspace switcher.
- Runtime owner: `src/slime/slimeGpuRuntime.js`.
- Settings/defaults: `DEFAULT_SLIME_SETTINGS` in
  `src/core/mainSettingsContracts.js`.
- Normalization: `src/slime/slimeState.js`.
- UI reflection: `src/ui/slimePanelRuntime.js`.
- UI bindings/commands: `src/ui/slimeBindingRuntime.js` and
  `core/slime/*` command handlers in `src/core/registerMainCommands.js`.

## Simulation Model

The simulation stores agent state in floating-point textures and advances agents
with ping-pong WebGL passes.

Each agent stores:

- `x`, `y`: simulation-space position.
- `angle`: heading in radians.
- `seed`: per-agent random seed.

Each simulation tick:

- Agents sample trail intensity with left, front, and right sensors.
- Sensor samples can include random sensor noise.
- The strongest sensor direction drives steering.
- Equal or ambiguous samples fall back to randomized turning.
- Optional wandering applies a random heading perturbation before sensor-based
  steering.
- Agents move by `stepSize`.
- Edges either wrap or bounce depending on `wrapEdges`.
- Agents deposit trail points into an additive deposit texture.
- The trail texture diffuses and decays, then receives the new deposit field.
- The display pass colorizes the trail with the selected palette.

The main behavior loop is therefore:

```txt
agent sensors -> steering -> movement -> deposit -> trail diffuse/decay -> display
```

## Core Controls

- `Agents`: total active agents, capped to 20k in the dev slider. Changing it
  resets GPU resources.
- `Texture Size`: simulation/trail texture resolution. Changing it resets GPU
  resources.
- `Steps / Frame`: simulation ticks per animation frame.
- `Game Ticks / Slime Step`: gameplay-mode cadence interval, default `3`.
  Slime advances only after this many game ticks have accumulated.
- `Max Game Steps / Frame`: hidden/default gameplay work budget, default `2`.
  At high game speeds Slime discards excess elapsed intervals instead of
  queueing a catch-up backlog. This keeps 20x/100x fast-forward responsive and
  intentionally trades away smooth ecological simulation at fast-forward speed.
- `Grid Tick`: low-resolution availability readback cadence in actual Slime
  steps, default `10`.
- `Plant Sync Tick`: low-resolution plant stock factor sync cadence in actual
  Slime steps, default `120`. It is staggered away from availability readback so
  both `readPixels` calls do not stall the same update frame.
- `Warmup Steps`: startup GPU simulation steps, default `3000`, run once after
  map sidecars and terrain/resource textures are loaded when Slime is enabled.
- `Sensor Distance`: distance from an agent to its left/front/right sensor
  sample points.
- `Sensor Angle`: angular separation between front and side sensors.
- `Sensor Size`: square sample radius around each sensor point.
- `Sensor Noise`: random additive noise applied to sensor readings.
- `Step Size`: movement distance per tick.
- `Turn Angle`: heading change when side sensors win or tie-breaking turns.
- `Wander Chance`: per-tick chance to apply a random heading perturbation.
- `Wander Strength`: maximum random perturbation magnitude.
- `Deposit Amount`: trail strength emitted by each agent.
- `Deposit Size`: point size for deposits.
- `Diffusion`: blend from current trail to neighboring blur.
- `Decay`: per-tick trail retention.
- `Trail Gain`: display brightness multiplier.
- `Trail Gamma`: display contrast curve.
- `Palette`: display color ramp (`fire`, `ice`, `mono`, `toxic`).
- `Wrap Edges`: wrap positions across simulation edges instead of bouncing.
- `Seed`: deterministic initial-state seed.

## Spawn Modes

Spawn mode controls initial placement and brush reset placement.

- `full`: distributes agents across the whole simulation area.
- `disk`: places agents in a central disk.
- `ring`: places agents around a central ring band.
- `line`: places agents near a horizontal center line.
- `edge`: places agents near the simulation boundary.

Changing spawn mode or seed resets the simulation.

## Terrain Coupling

Terrain coupling is optional and is enabled by `Use Terrain`. It samples the
current map textures as simulation fields when available:

- `height.png`: height preference or avoidance.
- `slope.png`: slope penalty and hard slope cutoff.
- `water.png`: water preference or avoidance.
- live plant resource field: plant attraction or avoidance. The Slime
  regeneration base is generated from the configured plant resource map, while
  the mutable stock texture can be initialized from that base multiplied by
  live plant stock.

Map `ImageData` rows are top-left ordered. Slime uploads terrain/resource
fields into its own WebGL context with rows Y-flipped so simulation UVs,
map-pixel coordinates, and the main terrain renderer agree. Do not remove this
flip or river/plant shapes will appear mirrored relative to the terrain.
- slime plant consumption/regeneration mutates a GPU plant-stock texture using
  the trail texture as a pressure field. In gameplay time mode, this plant
  availability is first rendered into the small resource-stock grid as a stock
  factor and then applied to `resourceStockRuntime` for plants as a
  depletion-only sync. Slime can lower gameplay plant stock, but it cannot raise
  it above the current gameplay stock value. It can also lower already-known
  stock so known plant contours reflect observed depletion, but it cannot raise
  known stock or reveal unknown resources. Normal resource-stock regeneration
  remains the gameplay regrowth owner. The gameplay cadence path must not read
  back the full plant texture. Same-size plant source refreshes must not
  reinitialize the mutable GPU plant stock, because that would erase the tuned
  Slime depletion/regrowth pattern.

When terrain coupling is enabled, each sensor score is:

```txt
trailScore
+ terrainMix * (
    -slope * slopeBias
    + height * heightBias
    - water * waterBias
    + (plant - plantFloor) * plantBias
    - outsideHeightBand * heightBandWeight
  )
```

If sampled slope is above `Slope Cutoff`, the sensor score receives a very large
penalty. If an agent moves onto a slope above the cutoff, it reverts to its
previous position and turns away.

Terrain controls:

- `Terrain Mix`: multiplier for terrain influence relative to trail intensity;
  defaults to `10.0` for strong terrain/resource steering.
- `Slope Bias`: positive values avoid steep slopes; negative values prefer
  steep slopes.
- `Slope Cutoff`: hard maximum traversable slope sample.
- `Height Bias`: positive values prefer high terrain; negative values prefer low
  terrain.
- `Height Min` / `Height Max`: preferred normalized height band.
- `Height Band Weight`: penalty for sensor samples outside the preferred height
  band.
- `Water Bias`: positive values avoid water; negative values prefer water.
- `Plant Bias`: positive values prefer plant-rich live resource areas; negative
  values avoid them. Slime agents use the true live plant field for this dev
  experiment, not the player's known resource map.
- `Plant Floor`: normalized plant-stock threshold. Plant samples below this
  value become repulsive when `Plant Bias` is positive.
- `Eat Amount`: trail-weighted plant stock amount removed from the mutable GPU
  plant texture on each eat tick.
- `Eat Tick`: slime simulation-step interval for batched plant consumption.
  Consumption is a fullscreen GPU pass driven by the existing trail texture.
- `Plant Regen`: flat plant stock amount restored toward the base plant texture
  on regen ticks.
- `Regen Tick`: slime simulation-step interval for plant regeneration.
- `Hunt Flee Steps`: number of Slime simulation steps that the player repulsion
  field remains active after a successful Hunting kill.
- `Hunt Flee Weight`: strength of that temporary player repulsion field. It is
  added directly to sensor scoring so high values can override terrain/resource
  attraction.
- `Hunt Flee Radius`: map-pixel radius around the player where the flee field
  affects agents.
- `Terrain Underlay`: blends a height/slope/water/plant diagnostic under the
  trail in the display pass.

Terrain UVs currently map simulation coordinates directly to normalized texture
coordinates. This makes Slime Lab a same-sized field experiment, not a full
scenario-world simulation yet.

## Brush Interaction

Clicking the Slime Lab canvas runs a GPU brush operation.

- Agents inside `Brush Radius` are respawned using the active spawn mode.
- The brush increments an internal seed so repeated clicks produce different
  placements.
- The trail texture inside the brush is weakened by `Brush Trail Clear`.
- The operation happens on GPU textures; no full CPU readback is required.

The brush is a local perturbation/reset tool for testing stability, terrain
response, and attractor recovery.

## Gameplay Trail Overlay

The gameplay/debug visual trail overlay must use the same render-time texture
layer architecture as the existing terrain overlays. The Slime runtime owns the
simulation texture. In gameplay, a headless Slime runtime instance runs inside
the main terrain WebGL context, so the terrain shader samples the full-resolution
trail texture directly. Shader-side colorization applies the configured
threshold, gain, gamma, opacity, and palette-style ramp. The trail texture uses
nearest-neighbor filtering to preserve the pixel-sharp map style.

Tracks knowledge masking also happens in the terrain shader by sampling the
renderer-owned `tracks` discovery texture and applying the configured knowledge
cutoff. Normal gameplay rendering must not use full-resolution Slime trail
`readPixels`, CPU masking, or an overlay-canvas full-map fallback. Low-resolution
readbacks remain acceptable for gameplay statistics and diagnostics.

Raw Slime framebuffer textures are sampled with a Y flip in
`sampleSlimeTrailOverlay()` to match the row flip that the former CPU
`readPixels` bridge performed. Keep that correction at the render-composite
boundary; do not compensate by changing map-pixel-to-simulation coordinate math.

Do not replace this with a parallel 2D canvas overlay for the full trail map.
Canvas overlays are appropriate for markers, vectors, UI gizmos, or explicit
debug fallbacks. The low-resolution Slime availability grid is rendered and
read at grid resolution, then flipped from WebGL `readPixels` row order into
top-left map coordinates. It is for Hunting availability sampling and numeric
readout, not the primary visual overlay. Its values use the same
threshold/gain/gamma normalization as the visible track overlay, so Hunting
availability follows what the player sees instead of raw internal trail energy.
Hunting uses a hotspot aggregate, currently the top half of cells inside the
activity circle, so strong blobs are not erased by empty edge cells.

On a Hunting success, gameplay reads the current GPU agent positions once,
counts agents inside the hunt circle, and awards loot only for agents actually
present. Killed agents are locally removed by respawning them outside the hunt
circle. If the probabilistic hunt succeeds but no agents are in the circle, no
loot is awarded and the panel reports a missed shot/no game. After at least one
kill, the player activates a temporary Slime flee field for the configured
number of steps so nearby agents visibly scatter instead of the system relying
on immediate trail deletion. Existing trail is left to decay naturally. That
flee field is registered as a temporary condition effect, so its player-facing
status lives in the normal buff/debuff strip and its remaining duration is
decremented by actual Slime simulation steps. The flee field is radius-limited:
agents inside the radius penalize sensor samples near the player and also apply
a direct away-from-player steering force with a proximity-scaled temporary
speed boost.

Inspect exposes Tracks as the `T` layer. Its readout samples the low-resolution
availability grid, while rendering gates visibility through a separate `tracks`
discovery map in the terrain shader. That map initializes clear/black on new
game or map reset; player movement updates the tracks discovery map, while
scout birds do not. Future hawk possession can reveal/update the same tracks
map without coupling it to the shared world Knowledge Map.

The RD Slime tab can initialize/test the tracks discovery map directly:

- `Clear`: fills tracks knowledge with `0`.
- `Fill`: fills tracks knowledge with `1`.
- `Noise`: populates tracks knowledge with the current discovery noise settings.
- `Track Knowledge Cutoff`: render-only threshold; trail pixels below this
  knowledge value are hidden without mutating the tracks map.

## Persistence

Slime settings are registered in the core settings registry under the `slime`
key. Map `Save All` writes `slime.json`, map loading applies `slime.json` when
present and falls back to defaults when absent, and the Slime Lab panel has a
dedicated `Save Map Settings` action for writing only `slime.json`.

Slime Lab also uses the shared module preset flow, matching Water Trails:
presets are indexed under `assets/presets/slime/index.json` and individual
setup files live beside that index. In browser/dev mode, newly saved named
presets are also stored in local browser storage so they remain available after
reload even when the runtime cannot write directly into `assets/presets/slime`.
Presets store settings only, not mutable GPU trail or agent snapshots.

## Integration Guardrails

- Keep full GPU readback rare. Prefer passing trail or influence fields as
  renderer-owned textures to terrain, gameplay, or diagnostic render passes.
- Full-map visual trail layers should be composited through the main terrain
  shader. CPU/readback products should serve gameplay sampling, diagnostics, or
  WebGL-context bridging only.
- Keep the WebGL2 implementation behind `src/slime/` APIs.
- Do not make core gameplay depend on WebGL2-only internals.
- Treat current terrain coupling as an experiment; future scenario integration
  should use world-coordinate terrain providers, especially once multi-tile maps
  exist.
