# AGENTS.md

ALWAYS read `AI_CONTEXT.md` first.
Gamedesign and Architectural Overview: read [[moc]]

## Project Goal

Build a self-contained prototype for top-down terrain rendering and survival-gameplay experiments from Gaea-exported maps.

Core terrain inputs:

- splat/albedo map for terrain appearance
- normal map for directional light response
- height map for shadows and terrain sampling

## Technical Direction

- No game engines: no Unity, Godot, Unreal.
- Prefer browser-native runtime: HTML + JavaScript + WebGL2.
- Desktop distribution path: Tauri wrapper around the existing frontend.
- Keep runtime lightweight and understandable.
- Runtime architecture baseline: modular, owner-module, core-state-driven. New work should preserve explicit ownership instead of rebuilding `main.js`-centric state paths.
- Events are for post-change refresh/invalidation only. Commands/runtime owners handle mutation and success/failure.

## Working Agreement

- Keep dependencies minimal.
- Prefer small, testable increments over large rewrites.
- Preserve existing user changes; never revert unrelated edits.
- Document run steps in `README.md` when they change.
- Keep `AI_CONTEXT.md` aligned when changing architecture, ownership, UI contracts, save/load behavior, or major gameplay systems.
- Always work on a branch; never commit directly to `main` or another default branch.
- Never create, update, or trigger a PR unless the user explicitly asks in the current turn.
- Never push to remote unless the user explicitly asks to push.

## Terminal Reliability Rules

- Keep terminal checks small and isolated.
- Prefer one fast command at a time for quick validation.
- Do not combine slow checks with quick checks in one command batch.
- Do not use parallel tool execution for shell checks that may block or run long.
- Run expensive Rust checks only when needed, separately, with explicit timeouts.
- Avoid over-escaped PowerShell strings. Prefer simple commands and single-quoted literals where practical.
- Never provide tool-payload JSON arrays as terminal commands.
- If a command appears stalled, stop chaining commands, retry with a simpler equivalent, and report the failure mode.
- Always run `node --check ...` and similar quick JS validation commands with explicit `timeout_ms`.
- For docs lint, use package scripts rather than relying on global installs: preferred `npm run lint:md`, full lint `npm run lint`.
- Markdown prose is not hard-wrapped; `MD013` is intentionally disabled.

## Tauri Packaging Rule

Before running `cargo tauri dev` or `cargo tauri build`, refresh `.tauri-dist` from the current frontend files:

```powershell
if (Test-Path .tauri-dist) { Remove-Item .tauri-dist -Recurse -Force }
New-Item -ItemType Directory -Force .tauri-dist | Out-Null
Copy-Item index.html .tauri-dist\ -Force
Copy-Item styles.css .tauri-dist\ -Force
Copy-Item src .tauri-dist\src -Recurse -Force
Copy-Item assets .tauri-dist\assets -Recurse -Force
```

Use `.\build-tauri.ps1 dev` or `.\build-tauri.ps1 build` for normal Tauri runs so this sync stays consistent.

Tauri asset caveats:

- Avoid spaces in packaged asset URLs used by the desktop default path. Source and packaged map folders should use names like `assets/map1`, `assets/map2`, and `assets/map3`.
- Do not reintroduce Tauri-only map folder aliases; fix source map paths instead.
- `src-tauri/tauri.conf.json` must keep `app.withGlobalTauri = true`; the title Quit button and desktop file commands rely on `window.__TAURI__.core.invoke`.
- Startup/map-load errors must be visible on the title screen, not only in the hidden dev/status panel. This is required for diagnosing desktop load failures before entering dev or gameplay mode.

## Map Conventions

Use per-map subfolders: `assets/<mapName>/`.

Required/current core textures:

- `splat.png`
- `normals.png`
- `height.png`
- `slope.png`
- `water.png`

Optional authored/runtime sidecars include:

- `flow.png`
- `pointlights.json`
- `lighting.json`
- `interaction.json`
- `fog.json`
- `clouds.json`
- `waterfx.json`
- `watertrails.json`
- `detail.json`
- `camera.json`
- `audio.json`
- `npc.json`
- `swarm.json`
- `resource_debug.json`
- `resource_stock.json`

Shared gameplay data lives under `assets/data/`.

## Gameplay/UI Direction

- Gameplay activities and condition/resource systems are prototype gameplay, but should still have clear owner modules and tests.
- Primary activities are mutually exclusive; Inspect is a secondary perception toggle.
- The gameplay HUD uses a fixed layout grid. Use the vocabulary and CSS variables documented in `docs/UI_LAYOUT_GRID.md`.
- Side panels should fit fixed slots. If content overflows, reduce or simplify content instead of resizing the panel.

## Quality Bar

- Loads PNG maps reliably.
- Renders at interactive framerate on typical desktop hardware.
- Maintains pixel-sharp rendering under zoom unless explicitly changed.
- Keeps gameplay mutations explicit and testable.
- Keeps save/load sidecars backward-tolerant where practical.

## Common Validation

Use targeted checks for focused changes and full checks for integration changes:

```powershell
node --check src\main.js
node --test tests\*.test.js
npm run lint:md
```

Run full JS tests after changes touching `main.js`, command routing, runtime events, activity/movement, resource systems, or save/load paths.
