# AGENTS.md

ALWAYS read AI_CONTEXT.md first.

## Project Goal

Build a self-contained prototype for top-down terrain rendering from Gaea-exported maps:
- Splat/albedo map for terrain appearance
- Normal map for directional sunlight response
- Height map for directional shadowing


## Technical Direction

- No game engines (no Unity, Godot, Unreal)
- Keep runtime lightweight and understandable
- Prefer browser-native stack first: HTML + JavaScript + WebGL2
- Desktop distribution path (current): Tauri wrapper around existing frontend
- Runtime architecture status: modular, core-state-driven runtime is now the baseline; new work should preserve that ownership model instead of rebuilding `main.js`-centric state paths


## Working Agreement

- Keep dependencies minimal
- Prefer small, testable increments over large rewrites
- Preserve existing user changes; never revert unrelated edits
- Document run steps in `README.md`
- Tauri packaging rule: always refresh `.tauri-dist` from current frontend files before running `cargo tauri dev` or `cargo tauri build`.
  - PowerShell sync:
    - `if (Test-Path .tauri-dist) { Remove-Item .tauri-dist -Recurse -Force }`
    - `New-Item -ItemType Directory -Force .tauri-dist | Out-Null`
    - `Copy-Item index.html .tauri-dist\ -Force`
    - `Copy-Item styles.css .tauri-dist\ -Force`
    - `Copy-Item src .tauri-dist\src -Recurse -Force`
    - `Copy-Item assets .tauri-dist\assets -Recurse -Force`
- CRITICAL git workflow: always work on a branch, never commit directly to `main` (or other default branch), and only open PRs when the user explicitly requests it.
- CRITICAL collaboration rule: never create, update, or trigger a PR unless the user explicitly asks in the current turn.
- CRITICAL collaboration rule: never push to remote unless the user explicitly asks to push.

## Terminal Reliability Rules

- Keep terminal checks small and isolated:
  - Prefer one fast command at a time for quick validation.
  - Do not combine slow checks (for example `cargo check`) with quick checks in one command batch.
- Do not use parallel tool execution for shell checks that may block or run long:
  - Run shell diagnostics sequentially so one slow command cannot stall all results.
- Run expensive Rust checks only when needed:
  - Use `cargo check` separately.
  - Use explicit timeouts for long-running commands.
- Avoid over-escaped PowerShell command strings:
  - Do not use `\"...\"`-style escaped quote wrappers in inline PowerShell unless absolutely necessary.
  - Prefer simple string formatting and straightforward command syntax to reduce parser errors.
- Never provide tool-payload JSON arrays as terminal commands:
  - Do not emit command snippets like `["powershell.exe","-Command","..."]` for manual execution.
  - Provide plain PowerShell commands only.
- Prefer quote-stable PowerShell patterns:
  - Use single-quoted string literals and `-f` formatting instead of embedded escaped double quotes.
  - Avoid fragile redirection/escaping constructs inside heavily quoted command text.
- If a command appears stalled:
  - Stop chaining additional commands.
  - Retry with a simpler equivalent command and report the exact failure mode.
- Timeout rule for JS/Node checks:
  - Always run `node --check ...` and similar quick validation commands with an explicit timeout.
  - Do not run these checks without `timeout_ms`.
- Lint rule (docs):
  - Do not rely on point-in-time global tool installs; use package scripts.
  - If a markdown linter is available, run it on changed `.md` files before commit.
  - Preferred command: `npm run lint:md`.
  - Full lint command: `npm run lint`.
  - If unavailable, explicitly state in the commit/PR notes that markdown lint was not run due to missing tool.
- Markdown prose style:
  - Do not hard-wrap prose to a fixed line length; `MD013` is intentionally disabled.
  - Let paragraphs flow naturally unless existing local formatting or readability clearly benefits from manual line breaks.


## Map Conventions (Current Prototype)

- Use per-map subfolders: `assets/<mapName>/`
- `assets/<mapName>/splat.png`: base color terrain image
- `assets/<mapName>/normals.png`: tangent/object-space normal map encoded in RGB
- `assets/<mapName>/height.png`: grayscale height map (required in current prototype)
- `assets/<mapName>/slope.png`: grayscale slope cost map for movement/pathfinding
- `assets/<mapName>/water.png`: grayscale/water influence map (required in current prototype)
- `assets/<mapName>/flow.png`: optional authored water flowmap (`R/G = signed XY direction by default`, neutral `128/128`)
- `assets/<mapName>/pointlights.json`: optional saved point-light set for that map
- `assets/<mapName>/lighting.json`: optional saved lighting controls (`heightScale`, `shadowStrength`, `shadowBlur`, `useShadows`, `ambient`, `diffuse`, volumetric scattering)
- `assets/<mapName>/interaction.json`: optional saved interaction/pathfinding + cursor-light controls
- `assets/<mapName>/fog.json`: optional saved fog controls
- `assets/<mapName>/clouds.json`: optional saved cloud-shadow controls
- `assets/<mapName>/waterfx.json`: optional saved water animation/reflectance controls
- `assets/<mapName>/watertrails.json`: optional saved water particle trail controls
- `assets/<mapName>/detail.json`: optional saved zoom-detail material controls; points at an RGBA material splat map and global micro-detail source sprites default to `assets/detail/default/*`
- `assets/<mapName>/camera.json`: optional saved camera controls (`zoomMin`, `zoomMax`)
- `assets/<mapName>/audio.json`: optional saved Audio Lab settings (spectrogram/scribble/playback controls)
- `assets/<mapName>/npc.json`: player state (`charID`, `pixelX`, `pixelY`, `color`)


## Lighting Model (Prototype)

- Directional sun/moon + optional baked point lights
- Simulated day/night cycle:
  - Hour over day drives azimuth and altitude from a simple lookup table
  - Cycle speed is adjustable from `0` to `1` hour per second
  - A minute-resolution `Time of Day` slider (`0..24`) live-tracks the clock and supports immediate time jumps on user scrub
  - Lower altitudes add warm sunrise/sunset ambience
- Moon phase:
  - Secondary directional moon light keeps nights readable
  - Moon ambient tint is cool and dim, with dusk/dawn overlap
  - A small blue ambient night-floor prevents fully black nights
- Height-based shadow raymarch in texture space
- Optional shadow blur smoothing:
  - sun/moon shadow visibility is first generated into a map-space shadow texture, then optionally blurred in a second pass
  - configurable blur radius softens that shadow texture before sun/moon light is applied
  - default `0` keeps previous sharp behavior
- Optional editable point-light system:
  - Placement mode via UI toggle
  - Point lights are map-pixel anchored (`x`, `y`, `range`, `intensity`, `color`, `heightOffset`, `flicker`, `flickerSpeed`)
  - Light source bake height is `terrain height at light + heightOffset`
  - Linear radius falloff uses `range`; brightness is controlled independently via `intensity` (default range `30`, intensity `1.0`, color orange)
  - Overlap accumulation uses a saturating blend to prevent additive overblown colors
  - Editor supports live rebake-on-edit toggle vs save-only apply
  - `Save All`/`Load All` JSON persistence via `pointlights.json` (save has explicit confirmation step)
  - Per-light normal interaction baked into a map-space texture on change
  - Bake alpha packs weighted per-pixel flicker amount + flicker speed (4 bits each)
  - Main render pass samples baked point-light texture for fast runtime
  - Optional global runtime flicker modulation (speed/amount/chaos) uses that alpha mask (no per-frame rebake)
- Optional live cursor-light mode:
  - Cursor position is used as a single real-time point light
  - Rendered directly in shader (no per-move bake)
  - Uses linear falloff and normal interaction
- Core zoom-detail material layer:
  - optional `detail.json` uses version `3` and tunes RGBA splat-driven dirt/rock/grass/snow micro color detail
  - default is enabled; missing individual micro sprites use neutral gray slots, and a missing material splat falls back to the dirt slot
  - runtime builds one micro color atlas from `assets/detail/default/*`
  - material splat weights are normalized in the shader; channels map to `R=dirt`, `G=rock`, `B=grass`, `A=snow`
  - micro detail samples continuous map coordinates; each material's Tile px value is the terrain-map-pixel width/height covered by one full source texture tile
  - each material's Color slider is a `0..1` contribution scalar; `0` skips that material/layer contribution and preserves the base terrain color
  - zoom fade is computed once per frame and uploaded as `uDetailBlend` instead of recomputed per terrain fragment
  - detail mixes color before lighting and does not affect normals or cast shadows
  - dev map mode exposes a `D` panel for live tuning four material slots
- Optional height fog illusion based on zoom-derived camera height vs terrain height
- Optional cloud-shadow illusion from generated seamless noise texture (two scrolling layers + optional sun-direction projection)
- Optional water FX (masked by `water.png`):
  - animated shimmer + flow-line cues
  - flow source can be fixed direction, height-generated, or authored `flow.png`
  - flow rendering can use older procedural modulation or authored-vector streamlines with density/sharpness controls
  - height-generated flow uses a precomputed multi-scale height-derived flow map (broader trend) mixed with optional local 1-texel downhill component
  - authored `flow.png` defaults to `R/G` signed direction; decode controls can switch channel pair, flip X/Y, and use B as magnitude; optional debug overlay can display sampled flow direction
  - precompute radii/weights are user-tunable for height-generated mode
  - water opacity blends an independent base water color over underlying terrain before scene lighting, so water receives ambient, sun/moon, shadows, point lights, cursor light, and cloud shade with terrain
  - flow-line color, shoreline foam, and particle-trail tint apply as pre-lighting material edits; sun/moon glints, sky-tint reflection, and glitter remain post-lighting specular-style terms gated by scene light
- Optional water particle trails (`WT` topic, separate from Water FX):
  - CPU particles spawn on `water.png`, sample authored `flow.png`, and write a fading trail texture
  - the terrain shader samples that trail texture as a water-only tint/brightness overlay
  - wake simulation can run at full/half/quarter/eighth map resolution, defaults to recommended `1/2`, and precomputes water/flow fields at that active resolution
  - wake propagation/decay/current-drag update runs as a GPU ping-pong pass; CPU particles only upload the per-frame deposit texture
  - trail headroom compresses deposits before RGBA8 wake storage and expands them in the terrain shader to retain more overlap brightness range
  - shader-only glitter can add animated water sparkle, optionally suppressed by strong wake/trail pixels
  - `Save All` persists controls to map-local `watertrails.json`; missing sidecars reset WT to defaults on map load
- Optional volumetric scattering in the main lighting pass:
  - samples fog density + cloud sun-occlusion along projected sun direction
  - exposes `strength`, `density`, `anisotropy`, `ray length`, `sample count`
- Map-level `Save All` writes point lights + lighting + interaction + fog + clouds + waterfx + swarm + npc JSON alongside map textures

## Gameplay Prototype (Current)

- Interaction modes are mutually exclusive via left dock toggles:
  - `LM` = lighting placement/edit mode
  - `PF` = pathfinding preview/click-to-move mode
  - neither = click no-op
- Player is loaded from map-local `npc.json` and rendered as a map-pixel circle.
- Swarm rendering supports two modes from the Agent Swarm panel:
  - unlit overlay mode (existing behavior)
  - `Fully Lit Swarm` mode (swarm shaded with terrain lighting pipeline: sun/moon, per-agent ray-tested shadows, point lights, cloud shade, fog, volumetrics)
- In `Fully Lit Swarm`, baked point-light brightness is used as vertical reach from terrain height to swarm altitude, with linear falloff (full at terrain height, minimum at edge, zero above reach).
- Pathfinding uses a local Dijkstra field centered on player.
- Path window is configurable in UI (`30x30` up to `100x100`).
- Move cost is continuous (no hard blocking), currently based on:
  - slope grayscale (`slope.png`)
  - uphill delta from `height.png`


## Quality Bar for Iteration

- Loads PNG maps reliably
- Renders at interactive framerate on typical desktop hardware
- Exposes parameters for ambient, diffuse, shadow strength, and height scale
- Maintains pixel-sharp rendering under zoom (nearest-neighbor sampling)
- Keep `AI_CONTEXT.md` aligned with behavior when changing rendering logic
