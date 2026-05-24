# Scaedumar

https://abhuva.github.io/scaedumar/

early game prototype, 2d top-down roquelike, survival, low-fantasy, simulation


## Files

- `index.html`: app shell and control panel
- `src/main.js`: composition/orchestration entry point
- `src/core/`: command bus, scheduler, state store, settings contracts
- `src/render/`: render resources, frame state assembly, render passes, and uniform upload orchestration
- `src/gameplay/`: interaction commands, movement/swarm helpers, point-light editor state/controller
- `src/ui/`: UI runtime components, panels, bindings, label helpers, and settings appliers
- `src/sim/`: simulation helpers and models such as `sunModel.js`, `timeSystem.js`, and `lightingParamsRuntime.js`
- `src/audio/`: Audio Studio runtime modules (WebAudio engine, offline STFT/FFT analysis, spectrogram renderer, scribble grid/input, resynthesis, raw synthesis, soundscape generation)
- `src/slime/`: Slime Lab runtime modules for GPU Physarum experiments
- `styles.css`: UI styling
- `assets/`: map bundle root (`assets/<mapName>/...`)
- `src-tauri/`: Tauri desktop wrapper (Rust commands + app packaging)
- `.tauri-dist/`: packaged frontend assets used by Tauri build
- `AI_CONTEXT.md`: implementation map and workflow notes for AI agents

Current architecture baseline:

- modular, core-state-driven runtime with `src/main.js` used primarily for
  composition/orchestration
- top-level dev workspaces are registry-driven (`map`, `audio`, `slime`) and
  should keep domain logic in owner modules

## Expected auto-load names

Auto-load checks these folders in order:

1. `assets/Map 3/`
2. `assets/`

Each candidate folder should contain:

- `splat.png`
- `normals.png`
- `height.png`
- `slope.png`
- `water.png`
- optional: `flow.png` (authored water flowmap, `R/G = XY direction by default`, neutral `128/128`)
- optional: `pointlights.json`
- optional: `lighting.json`
- optional: `interaction.json`
- optional: `fog.json`
- optional: `clouds.json`
- optional: `waterfx.json`
- optional: `detail.json`
- optional: `camera.json`
- optional: `audio.json`
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

## Documentation Site (Zensical + GitHub Pages)

Documentation source files live under `docs/`.

Local preview/build:

```powershell
# live preview
zensical serve

# production build output in ./site
zensical build --clean
```

Automatic GitHub Pages deploy:

- Workflow file: `.github/workflows/docs.yml`
- Trigger: push to `main`
- Output: `site/` uploaded and deployed via GitHub Pages Actions
- Expected URL: `https://abhuva.github.io/scaedumar/`

One-time GitHub repo setting:

- `Settings -> Pages -> Build and deployment -> Source: GitHub Actions`

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


## Copy Tauri Folders

```
if (Test-Path .tauri-dist) { Remove-Item .tauri-dist -Recurse -Force }
New-Item -ItemType Directory -Force .tauri-dist | Out-Null
Copy-Item index.html .tauri-dist\ -Force
Copy-Item styles.css .tauri-dist\ -Force
Copy-Item src .tauri-dist\src -Recurse -Force
Copy-Item assets .tauri-dist\assets -Recurse -Force
```

## Tests

Install local development tooling once:

```powershell
npm install
```

Run lint checks through package scripts so local runs, review tools, and CI use
the same pinned toolchain:

```powershell
npm run lint
npm run lint:js
npm run lint:md
```

Run targeted architecture migration tests with Node's built-in test runner:

```powershell
npm test
```

Current tests cover:
- mode capability gating contracts
- weather-system deterministic normalization output
- settings-registry contract wiring/roundtrip behavior
- main runtime-state binding ownership
- swarm runtime sync/follow ownership
- movement system and movement store sync
- architecture ownership guard checks
- audio settings contract registration/gating integration

## Rendering Direction

- Current terrain and first Slime Lab prototypes use WebGL2 because it fits
  the existing browser/Tauri frontend and keeps iteration lightweight.
- WebGL2 is the prototype backend, not the long-term performance ceiling.
- Slime simulation is intentionally isolated behind `src/slime/` runtime APIs
  so a later backend can move to WebGPU or native Rust/WGPU without rewriting
  the UI/settings/gameplay integration.
- CPU readback from GPU simulations should be occasional and targeted. For
  gameplay integration, prefer keeping fields such as slime trails as GPU
  textures and sampling them in render/game shaders.

Architecture map:

- `docs/ARCHITECTURE.md`
- slime simulation:
  - `docs/SLIME_SIM.md`
- sound design:
  - `docs/SOUND_DESIGN.md`
  - `docs/SOUNDSCAPE_TASKS.md`
- visual diagnostic checklist/baselines:
  - `docs/plans+setups/SMOKE_CHECKLIST.md`
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
  - click commits the preview path and starts explicit travel
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
- For persistence across reloads, save the JSON as `<current map folder>/pointlights.json` (for example `assets/Map 3/pointlights.json`).
- In desktop runtime, map path can be left empty and `Load` opens a native folder picker.
- `Load Map` includes a map-level `Save All` action that writes:
  - `pointlights.json`
  - `lighting.json` (`heightScale`, `shadowStrength`, `shadowBlur`, `useShadows`, `ambient`, `diffuse`, volumetric-scatter controls, cycle + point-flicker controls)
  - `interaction.json` (pathfinding window/weights/cutoff/base-cost + cursor-light UI settings)
  - `fog.json` (`useFog`, color, alpha/falloff/start settings)
  - `clouds.json` (`useClouds`, coverage/softness/opacity/scale, two-layer scroll speeds, sun-projection controls)
  - `waterfx.json` (`useWaterFx`, `waterFlowSource` fixed/height/image, `waterFlowInvertDownhill`, `waterDownhillBoost`, local-mix, trend radii/weights, debug overlay, flow visibility, opacity/base-color, shimmer/specular/shore/reflection controls, `waterTintColor`, `waterTintStrength`)
  - `watertrails.json` (water particle trail controls, wake/glitter settings, flow channel decode settings)
  - `detail.json` (core zoom-detail material tuning for RGBA splat-driven dirt/rock/grass/snow micro color sprites)
  - `camera.json` (`zoomMin`, `zoomMax`)
  - `audio.json` (spectrogram settings, scribble/playback controls)
  - `npc.json` (`charID`, `pixelX`, `pixelY`, `color`)
  - `resource_debug.json` (resource discovery/overlay tuning)
  - `resource_stock.json` (resource stock tuning and live/known stock fields)
- Map loading automatically applies these JSON files when present in the selected map folder. Map-specific JSONs such as `watertrails.json` live under `assets/<mapName>/`, following the `assets/*/*.json` sidecar convention.
- Dev map mode exposes a `D` panel for live zoom-detail tuning. Detail is color-only for performance: the current terrain color map remains the base, while a normalized RGBA material splat (`R=dirt`, `G=rock`, `B=grass`, `A=snow`) drives micro material detail over it by zoom fade.
- `detail.json` is a version `3` micro-only contract. Each material has one `micro` source, tile scale, and color strength; `0` strength contributes nothing and `1` contributes fully according to material-splat influence and zoom fade.
- Detail material transitions can be compared in `Smooth`, `Dithered`, and `Priority Dither` modes. The experiment runs shader-side only: optional weight quantization, minimum visible weight, sub-map-pixel hash dithering, raw material-splat debug channel view, and per-material priority values sharpen close-zoom material identity without changing source asset formats.
- Material micro tile size controls are snapped to discrete map-pixel values: `1`, `2`, `4`, `8`, `16`, and `32`.
- Detail is not suppressed by authored water masks. Zoom-detail materials are applied before water material rendering, so visible water overlays detailed terrain instead of disabling the detail pass.
- The terrain shader receives zoom fade as a frame-level `uDetailBlend` uniform, so the per-fragment detail path only samples water/material/detail textures after detail is active at the current zoom.
- Missing individual micro sprites are replaced by neutral gray atlas slots. If the material splat cannot load, detail falls back to the dirt slot so available micro detail still renders instead of disabling the whole pass.
- `Audio Studio` is a top-level workspace beside the map workspace.
- `Audio Lab` currently provides canonical `audio` settings key with command-routed UI.
- `Audio Lab` can load browser-decodable audio files, compute an offline STFT spectrogram, and play the original decoded buffer.
- `Audio Lab` scribble mode paints a separate time/frequency amplitude grid over the original spectrogram; `Play Scribble` resynthesizes only that painted grid.
- `Audio Lab` can auto-paint strong source spectrogram bins into the scribble layer using threshold/contrast/gain controls.
- `Audio Lab` authoring defaults to log-frequency with editable `Min Hz`/`Max Hz`, so low/mid detail gets more vertical workspace than high-frequency bands.
- `Audio Lab` can approximate dense scribbles with a bounded number of brush-like ellipse strokes for compact, replayable sound gestures.
- `Audio Studio` includes a raw `Synthesis` mode for additive oscillator experiments with live waveform playback/editing.
- `Audio Studio` includes a constrained `Soundscape` mode for modal ambient generation:
  - root/scale constraints
  - role preset layers (`Drone`, `Resonance`, `Shimmer`, `Call`, `Wind`, `Rumble`, `Air`)
  - attack/release, drift, modal motion, glide, and seeded randomization
  - filtered noise layers mixed through the same WebAudio transport
- `Slime Lab` is a top-level dev workspace for a WebGL2 Physarum-style
  simulation. See `docs/SLIME_SIM.md` for mechanics.
- Slime agents live in GPU float textures, sense trail intensity with
  left/front/right sensors, steer toward stronger signals, deposit additive
  trails, and evolve through trail diffusion/decay.
- Slime controls include agent count, simulation texture size, steps/frame,
  sensor distance/angle/size/noise, step size, turn angle, stochastic wandering,
  deposit amount/size, diffusion, decay, display gain/gamma, palette, edge
  wrapping, seed, and spawn mode.
- Slime spawn modes are `full`, `disk`, `ring`, `line`, and `edge`; changing
  spawn mode or seed resets the simulation.
- Slime terrain coupling can sample current `height.png`, `slope.png`, and
  `water.png` as optional movement biases: slope can repel and hard-block,
  height can attract/repel or enforce a preferred band, and water can
  attract/repel.
- Clicking the Slime Lab canvas applies a GPU brush: agents inside the radius
  are respawned with the active spawn mode and local trail strength is cleared.
- Slime settings are registered under the core `slime` settings key, but there
  is no `slime.json` map sidecar yet; `Save All` does not persist Slime Lab
  experiment state.
- Point lighting is baked into a map-space light texture only when lights or normal/height inputs change.
- Point-light baking also uses height-map line-of-sight occlusion so steep terrain can block local light spread.
- Terrain shading samples that baked texture during normal rendering, so frame-time cost stays low.
- Settings are opened from a left vertical icon dock, one topic panel at a time.
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
- Flow source can be fixed direction, height-generated, or an authored `flow.png` image.
- `Flow Render` switches between the older procedural flow modulation and authored-vector streamlines; line density/sharpness tune the streamline overlay.
- Image flowmaps default to `R/G` as signed XY direction (`128/128` is neutral); decode controls can switch channel pair, flip X/Y, and optionally use B as vector magnitude.
- Height-generated mode samples a precomputed multi-scale flow map from `height.png` and can blend with local 1-texel downhill flow via `Local Flow Mix`.
- `Downhill Boost` amplifies generated/image water-motion intensity without changing fixed-direction mode.
- `Water Opacity` blends in an independent water base color before scene lighting, so underlying terrain can be reduced or fully hidden while water still receives ambient, sun/moon, shadow, point-light, cursor-light, and cloud lighting.
- `Water Tint` color plus `Tint Strength` (`0..1`) applies controllable water color tinting as a pre-lighting material color.
- Flow-line color, shoreline foam, and particle-trail tint are also treated as material edits before lighting; water glints, sky reflection, and glitter remain post-lighting specular-style terms gated by scene light.
- Water shading is now evaluated at map-texel centers (pixel-locked), so water influence is resolved per map pixel instead of per screen fragment.
- Trend precompute is tunable with `Trend Radius 1/2/3` + `Trend Weight 1/2/3`.
- `Flow Debug` renders direction overlay on water to inspect computed flow behavior.
- `Water Particle Trails` (separate `WT` topic) is independent from the Water FX controls:
  - CPU particles spawn on `water.png`, sample the authored `flow.png` direction field, and write a fading trail texture.
  - The main terrain shader samples that trail texture as a water-only tint/brightness overlay.
  - Wake simulation can run at full, half, quarter, or eighth map resolution; `1/2` is the recommended quality/performance default.
  - Flow/water masks are precomputed at the active wake resolution, and a GPU ping-pong pass updates wake propagation/decay/current drag.
  - `Simulation Speed` controls the wake simulation independently from agent movement speed.
  - Controls include particle count, speed, simulation speed, wake resolution, flow influence, wake spread/current drag, trail strength/headroom/fade/width, flow channel pair, flips, B magnitude, tint color, and shader-only glitter.
  - `Trail Headroom` compresses deposits before storing them in the 8-bit wake texture, then expands them in the terrain shader so overlapping trails have more visible brightness range before saturation.
  - Glitter is a lightweight animated sparkle layer masked to water; the wake texture can suppress sparkle where particle trails are already strong.
  - `Save All` persists the panel to map-local `watertrails.json`; missing sidecars reset WT controls to defaults on map load.
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
