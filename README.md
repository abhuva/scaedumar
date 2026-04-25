# Terrain Prototype (Self-Contained)

Prototype goals:
- Load a terrain splat PNG and render it
- Load normals PNG and apply directional sunlight
- Load height PNG and compute directional shadows
- Simulate a full day/night sun cycle with adjustable speed
- Add editable point lights in a dedicated lighting placement mode
- Add a player (`npc.json`) with local-cost path preview and click-to-move

## Files

- `index.html`: app shell and control panel
- `src/main.js`: composition/orchestration entry point
- `src/core/`: command bus, scheduler, state store, settings contracts
- `src/render/`: render resources, frame state assembly, render passes, and uniform upload orchestration
- `src/gameplay/`: interaction commands, movement/swarm helpers, point-light editor state/controller
- `styles.css`: UI styling
- `assets/`: map bundle root (`assets/<mapName>/...`)
- `src-tauri/`: Tauri desktop wrapper (Rust commands + app packaging)
- `.tauri-dist/`: packaged frontend assets used by Tauri build
- `AI_CONTEXT.md`: implementation map and workflow notes for AI agents

Current architecture baseline:
- modular, core-state-driven runtime with `src/main.js` used primarily for composition/orchestration

## Expected auto-load names

Auto-load checks these folders in order:

1. `assets/Map 1/`
2. `assets/`

Each candidate folder should contain:

- `splat.png`
- `normals.png`
- `height.png`
- `slope.png`
- `water.png`
- optional: `pointlights.json`
- optional: `lighting.json`
- optional: `parallax.json`
- optional: `interaction.json`
- optional: `fog.json`
- optional: `clouds.json`
- optional: `waterfx.json`
- optional but recommended: `npc.json`

If no candidate folder contains the required PNGs, the app starts with fallback textures. You can load a map by folder path or folder picker in the `Load Map` panel.

## Run (Browser)

Serve the folder over HTTP (do not use `file://`).

PowerShell examples:

```powershell
# Option A: Python
python -m http.server 8000

# Option B: Node (if installed)
npx serve .
```

Then open:
- `http://localhost:8000` (Python)
- or URL printed by `serve`

## Run (Desktop / Tauri)

From repository root:

```powershell
# optional but recommended before build/dev:
New-Item -ItemType Directory -Force .tauri-dist | Out-Null
Copy-Item index.html .tauri-dist\ -Force
Copy-Item styles.css .tauri-dist\ -Force
Copy-Item src .tauri-dist\src -Recurse -Force
Copy-Item assets .tauri-dist\assets -Recurse -Force

# dev desktop app
cargo tauri dev

# release bundles (MSI + NSIS EXE)
cargo tauri build
```

Release outputs:
- `src-tauri/target/release/bundle/msi/TerrainPrototype_0.1.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/TerrainPrototype_0.1.0_x64-setup.exe`
- optional portable zip: `src-tauri/target/release/bundle/portable/TerrainPrototype_0.1.0_x64_portable.zip`

One-command helper:

```powershell
# sync + run desktop dev
.\build-tauri.ps1 -Mode dev

# sync + build desktop release bundles
.\build-tauri.ps1 -Mode build
```

## Tests

Run targeted architecture migration tests with Node's built-in test runner:

```powershell
node --test tests/*.test.js
```

Current tests cover:
- mode capability gating contracts
- weather-system deterministic normalization output
- settings-registry contract wiring/roundtrip behavior
- main runtime-state binding ownership
- swarm runtime sync/follow ownership
- movement system and movement store sync
- architecture ownership guard checks

Architecture map:
- `docs/ARCHITECTURE.md`
- visual diagnostic checklist/baselines:
  - `SMOKE_CHECKLIST.md`
  - `docs/visual-baselines/README.md`

## Notes

- Directional light is modeled as a sun direction vector.
- Sun azimuth/altitude are sampled from a daily keyframe table and interpolated.
- Day-cycle speed slider runs from `0.00` to `1.00` hours/second (`0` = paused).
- `Time of Day` slider supports minute-level scrubbing across `0..24` hours.
- While time is advancing, the `Time of Day` slider live-updates to track the simulation clock.
- Moving/clicking `Time of Day` jumps the simulation time immediately.
- Low sun angles use warmer sunlight/ambient colors for sunrise/sunset ambience.
- A moon directional light and moon ambient tint keep nights dim but readable, with a small blue night-ambient floor so nights do not go pitch black.
- Mouse wheel controls zoom.
- Middle mouse drag pans the map.
- `LM` (left dock) enables `Lighting Mode`: left click adds/selects point lights.
- `PF` (left dock) enables `Pathfinding Mode`:
  - hover shows a live Dijkstra path preview from player to hovered cell
  - click moves player instantly to clicked cell
- With both mode toggles off (`none`), map clicks are currently ignored.
- `Path Window` slider controls local Dijkstra field size (`30x30 .. 100x100`).
- Player state is read from `<mapFolder>/npc.json` (`charID`, `pixelX`, `pixelY`, `color`) and rendered as a map-pixel circle.
- `Cursor Light` mode turns the mouse into a live point light (no bake per mouse move).
- `Fully Lit Swarm` toggle renders swarm agents through the terrain lighting stack (sun/moon, point lights, cloud shading, fog, volumetric scattering).
- Lit swarm shadows are evaluated per agent via directional height-map ray tests (sun + moon), avoiding false blinking from terrain shadow-map micro crevice detail.
- When `Fully Lit Swarm` is off, swarm uses the previous unlit overlay shading.
- In lit mode, baked point-light brightness is treated as swarm vertical reach in height units:
  - full effect at terrain height
  - linear falloff with altitude above terrain
  - reaches a small minimum at the brightness edge, then drops to zero above the reach
- Cursor light supports:
  - terrain-following elevation (`cursor terrain height + offset`)
  - old fixed-height behavior (height derived from light strength)
- `Cursor Gizmo` toggle controls whether the cursor-light preview ring/dot is drawn.
- Point lights are stored as map pixel coordinates + color + range + intensity.
- New lights default to orange with range `30` px and intensity `1.00`.
- Each point light has `Flicker` and `Flicker Speed` controls (`0..1` each), both packed into the point-light texture alpha channel (4-bit + 4-bit) per baked pixel.
- Clicking an existing light coordinate selects it instead of creating a duplicate.
- Point-light edits are done in the `Editor` topic panel (`Color`, `Range`, `Intensity`, `Height`, `Flicker`, `Flicker Speed`, `Save`, `Cancel`, `Delete`).
- Point lights include a `Height` offset (terrain sample + offset = light source height used for baking).
- Point-light bake accumulation now uses a saturating blend curve, avoiding runaway overbright results from many overlapping lights.
- `Live Update` toggle in the point-light editor controls whether color/range/intensity/height edits rebake immediately or only on `Save`.
- Main lighting includes global flicker controls (`Light Flicker`, `Flicker Amount`, `Flicker Speed`, `Flicker Chaos`) that modulate baked point-light RGB at runtime from the baked alpha mask.
- Point-light sets can be exported/imported as `pointlights.json` via `Save All` / `Load All`.
- `Save All` uses a two-step confirmation (click once to arm, click again within 5s to confirm).
- `Load All` first tries `<current map folder>/pointlights.json` and falls back to manual JSON file selection.
- For persistence across reloads, save the JSON as `<current map folder>/pointlights.json` (for example `assets/Map 1/pointlights.json`).
- In desktop runtime, map path can be left empty and `Load` opens a native folder picker.
- `Load Map` includes a map-level `Save All` action that writes:
  - `pointlights.json`
  - `lighting.json` (`heightScale`, `shadowStrength`, `shadowBlur`, `useShadows`, `ambient`, `diffuse`, volumetric-scatter controls, cycle + point-flicker controls)
  - `parallax.json` (`useParallax`, `parallaxStrength`, `parallaxBands`)
  - `interaction.json` (pathfinding window/weights/cutoff/base-cost + cursor-light UI settings)
  - `fog.json` (`useFog`, color, alpha/falloff/start settings)
  - `clouds.json` (`useClouds`, coverage/softness/opacity/scale, two-layer scroll speeds, sun-projection controls)
  - `waterfx.json` (`useWaterFx`, downhill/fixed flow, `waterFlowInvertDownhill`, `waterDownhillBoost`, local-mix, trend radii/weights, debug overlay, shimmer/specular/shore/reflection controls, `waterTintColor`, `waterTintStrength`)
  - `npc.json` (`charID`, `pixelX`, `pixelY`, `color`)
- Map loading automatically applies these JSON files when present in the selected map folder.
- Point lighting is baked into a map-space light texture only when lights or normal/height inputs change.
- Point-light baking also uses height-map line-of-sight occlusion so steep terrain can block local light spread.
- Terrain shading samples that baked texture during normal rendering, so frame-time cost stays low.
- Settings are opened from a left vertical icon dock, one topic panel at a time.
- `Parallax` toggle enables a combined depth illusion from the height map:
  - continuous height-based UV offset while panning
  - quantized height-band offset for layered depth separation
  - anchored to the current view center to produce stronger relative motion toward screen edges
  - normalized by current zoom so perceived effect stays more consistent across zoom levels
  - edge-safe displacement fitting keeps parallax inside map bounds to avoid border cutouts
- `Parallax Strength` controls the blend intensity of both effects.
- `Parallax Bands` controls the number of quantized height bands (default `6`, range `2..256`).
- `Height Fog` toggle enables a camera-height-vs-terrain-height fog illusion:
  - camera height is derived from zoom (zoomed out = higher camera)
  - per-pixel fog amount is based on height difference between camera and terrain
  - low terrain gets fog sooner than high terrain, improving top-down depth cues
- `Fog Min Alpha` and `Fog Max Alpha` define transparency range.
- `Fog Falloff` controls how quickly fog ramps with camera-height minus terrain-height.
- `Fog Start Offset` delays fog onset by subtracting a threshold from the camera-vs-terrain height difference.
- `Fog Color` is user-pickable; by default it auto-tracks current lighting tint until manually changed.
- `Cloud Shadows` uses a generated seamless repeating noise texture sampled in two scrolling layers.
- Cloud controls include `Coverage`, `Softness`, `Opacity`, `Scale`, `Layer A/B Speed`, plus optional `Sun Projection` with `Sun Offset` to shift cloud shadows with sun direction.
- `Water FX` (Water panel, masked by `water.png`) combines:
  - animated flow shimmer + anisotropic flow-line modulation
  - altitude-aware sun/moon glints
  - shoreline foam/lapping near water-land transitions
  - sky-tint reflection blended by reflectivity
- Flow can use fixed direction or downhill mode.
- Downhill flow includes an `Invert Downhill` toggle to quickly flip detected flow direction.
- Downhill mode samples a precomputed multi-scale flow map (from `height.png`) and can be blended with local 1-texel downhill flow via `Local Flow Mix`.
- `Downhill Boost` amplifies downhill water-motion intensity without changing fixed-direction mode.
- `Water Tint` color plus `Tint Strength` (`0..1`) applies controllable water color tinting.
- Water shading is now evaluated at map-texel centers (pixel-locked), so water influence is resolved per map pixel instead of per screen fragment.
- Trend precompute is tunable with `Trend Radius 1/2/3` + `Trend Weight 1/2/3`.
- `Flow Debug` renders direction overlay on water to inspect computed flow behavior.
- `Volumetric Scatter` (Main Lighting panel) adds a lightweight single-pass in-scattering estimate:
  - raymarches along projected sun direction in texture space
  - reuses cloud shadow occlusion + fog density shaping per sample
  - tints toward sun/fog color blend and supports anisotropy
- Volumetric controls: `Scatter Strength`, `Scatter Density`, `Anisotropy`, `Ray Length`, `Ray Samples`.
- Height shadowing now uses a map-space shadow texture pass (sun + moon channels) generated by texture-space raymarch.
- `Shadow Blur` is a second pass over that shadow texture before terrain shading (`0.00 px` = off).
- Texture sampling is nearest-neighbor for pixel-sharp zoomed rendering.
- Desktop file I/O behavior:
  - Tauri runtime prefers native commands for JSON save/load + folder validation/picking.
  - If native desktop save/load fails, browser-compatible fallback flow is used where possible (`showDirectoryPicker`, `showSaveFilePicker`, or file download).
