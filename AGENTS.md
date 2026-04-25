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
- Lint rule (docs):
  - Do not rely on point-in-time global tool installs; follow project migration/checklist for required linters.
  - If a markdown linter is available, run it on changed `.md` files before commit.
  - Preferred command when available: `npx markdownlint-cli2 "**/*.md"`.
  - If unavailable, explicitly state in the commit/PR notes that markdown lint was not run due to missing tool.


## Map Conventions (Current Prototype)

- Use per-map subfolders: `assets/<mapName>/`
- `assets/<mapName>/splat.png`: base color terrain image
- `assets/<mapName>/normals.png`: tangent/object-space normal map encoded in RGB
- `assets/<mapName>/height.png`: grayscale height map (required in current prototype)
- `assets/<mapName>/slope.png`: grayscale slope cost map for movement/pathfinding
- `assets/<mapName>/water.png`: grayscale/water influence map (required in current prototype)
- `assets/<mapName>/pointlights.json`: optional saved point-light set for that map
- `assets/<mapName>/lighting.json`: optional saved lighting controls (`heightScale`, `shadowStrength`, `shadowBlur`, `useShadows`, `ambient`, `diffuse`, volumetric scattering)
- `assets/<mapName>/parallax.json`: optional saved parallax controls (`useParallax`, `parallaxStrength`, `parallaxBands`)
- `assets/<mapName>/interaction.json`: optional saved interaction/pathfinding + cursor-light controls
- `assets/<mapName>/fog.json`: optional saved fog controls
- `assets/<mapName>/clouds.json`: optional saved cloud-shadow controls
- `assets/<mapName>/waterfx.json`: optional saved water animation/reflectance controls
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
- Optional parallax illusion from height map (continuous + banded)
- Optional height fog illusion based on zoom-derived camera height vs terrain height
- Optional cloud-shadow illusion from generated seamless noise texture (two scrolling layers + optional sun-direction projection)
- Optional water FX (masked by `water.png`):
  - animated shimmer + flow-line cues
  - downhill flow uses a precomputed multi-scale height-derived flow map (broader trend) mixed with optional local 1-texel downhill component
  - precompute radii/weights are user-tunable; optional debug overlay can display computed water flow direction
  - sun/moon glints, shoreline foam band, and sky-tint reflection
- Optional volumetric scattering in the main lighting pass:
  - samples fog density + cloud sun-occlusion along projected sun direction
  - exposes `strength`, `density`, `anisotropy`, `ray length`, `sample count`
- Map-level `Save All` writes point lights + lighting + parallax + interaction + fog + clouds + waterfx + swarm + npc JSON alongside map textures

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
