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

- `Agents`: total active agents. Changing it resets GPU resources.
- `Texture Size`: simulation/trail texture resolution. Changing it resets GPU
  resources.
- `Steps / Frame`: simulation ticks per animation frame.
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

When terrain coupling is enabled, each sensor score is:

```txt
trailScore
+ terrainMix * (
    -slope * slopeBias
    + height * heightBias
    - water * waterBias
    - outsideHeightBand * heightBandWeight
  )
```

If sampled slope is above `Slope Cutoff`, the sensor score receives a very large
penalty. If an agent moves onto a slope above the cutoff, it reverts to its
previous position and turns away.

Terrain controls:

- `Terrain Mix`: multiplier for terrain influence relative to trail intensity.
- `Slope Bias`: positive values avoid steep slopes; negative values prefer
  steep slopes.
- `Slope Cutoff`: hard maximum traversable slope sample.
- `Height Bias`: positive values prefer high terrain; negative values prefer low
  terrain.
- `Height Min` / `Height Max`: preferred normalized height band.
- `Height Band Weight`: penalty for sensor samples outside the preferred height
  band.
- `Water Bias`: positive values avoid water; negative values prefer water.
- `Terrain Underlay`: blends a height/slope/water diagnostic under the trail in
  the display pass.

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

## Persistence

Slime settings are registered in the core settings registry under the `slime`
key, but Slime Lab does not currently have a map sidecar file in `Save All` or
map loading. The current map sidecar set still saves terrain/gameplay/audio data,
not Slime Lab experiment state.

If Slime Lab becomes a gameplay system, add an explicit sidecar such as
`slime.json` and decide whether it stores only settings, seeded initial state, or
trail/agent snapshots.

## Integration Guardrails

- Keep full GPU readback rare. Prefer passing trail or influence fields as GPU
  textures to terrain, gameplay, or diagnostic render passes.
- Keep the WebGL2 implementation behind `src/slime/` APIs.
- Do not make core gameplay depend on WebGL2-only internals.
- Treat current terrain coupling as an experiment; future scenario integration
  should use world-coordinate terrain providers, especially once multi-tile maps
  exist.
