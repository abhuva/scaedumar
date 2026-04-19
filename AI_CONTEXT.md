# AI_CONTEXT.md

## Purpose

This file is the fast handoff context for AI agents working on this repository.
Use it before changing code.

## Product Intent

Build a self-contained terrain rendering prototype from map textures:
- splat/albedo map
- normal map
- height map for shadowing

No game engine is used.

## Runtime Overview

- Entry point: `index.html`
- Main implementation: `src/main.js`
- Rendering backend: WebGL2 terrain pass + 2D overlay canvas for interaction markers
- Settings UI: left vertical topic-icon dock + single side panel (one topic open at a time)
- Map bundle auto-load tries these folders in order:
  - `assets/map1/`
  - `assets/Map 1/`
  - `assets/`
- Required PNG names in each candidate folder:
  - `splat.png`
  - `normals.png`
  - `height.png`
  - `slope.png`
  - `water.png`
- Optional sidecar JSON files in each candidate folder:
  - `pointlights.json`
  - `lighting.json`
  - `parallax.json`
  - `interaction.json`
  - `fog.json`
  - `clouds.json`
  - `npc.json`
- `Load Map` topic supports loading by folder path or folder picker (map bundle semantics)

## Current Lighting Model

- Day cycle is simulated from keyframes (`SUN_KEYS`) and interpolation.
- Time progresses based on UI slider `cycleSpeed` (`0..1` hours/second).
- UI slider `cycleHour` (`0..24` hours, minute resolution) both live-tracks current simulated time and allows immediate time scrubbing.
- Sun:
  - directional light (`uSunDir`)
  - warm tones at low altitude
- Moon:
  - secondary directional light (`uMoonDir`)
  - cool dim tint to avoid pitch-black nights
- Ambient:
  - blended sun/moon ambient tint and intensity
  - includes a small blue night-ambient floor to avoid pitch-black nights
- Shadows:
  - texture-space raymarch over `uHeight`
  - texel step uses height-map dimensions (`heightSize`)
- Optional point lights:
  - `Lighting Mode` toggle switches click behavior to light placement/selection
  - each point light stores map pixel coordinate + color + range (radius in px) + intensity + height offset + per-light flicker amount + per-light flicker speed
  - default new light: orange, range `30`, intensity `1.0`
  - light source height for baking is `terrainHeightAtLight + heightOffset`
  - editor has `Live Update` toggle (`on` = rebake on edit input, `off` = rebake on explicit save)
  - `Save All` / `Load All` supports JSON persistence (`pointlights.json`)
  - save action uses a two-click confirmation to avoid accidental overwrite/export
  - load first attempts `<currentMapFolder>/pointlights.json`, then falls back to manual file pick
  - linear radial falloff (range) + independent intensity multiplier, with saturating accumulation to avoid overblown overlap
  - normal interaction is baked into a map-space `pointLightTex` on add/edit/delete or normal/height-map update
  - bake alpha channel packs weighted flicker amount + weighted flicker speed (4 bits each)
  - terrain height occlusion is baked by a light-to-surface line-of-sight test (cliffs can block local light spread)
  - main fragment shader samples `uPointLightTex` and applies RGB to base color, with optional runtime flicker modulation from alpha
- Optional cursor light mode:
  - mouse position drives a single live point light in shader uniforms
  - linear falloff + normal interaction
  - supports two elevation modes:
    - terrain-following (`height at cursor + offset`)
    - old fixed-height behavior (derived from light strength)
  - no bake per mouse move (direct fragment shading path)
- Optional parallax mode (toggle in UI):
  - combines continuous height-based UV offset (option 1)
  - plus quantized height-band offset (option 2)
  - effect is anchored to the current view center (focal UV), so relative displacement is stronger away from center
  - effect is scaled by zoom to reduce "strong when zoomed out / weak when zoomed in" mismatch
  - displaced UV is fitted back to map bounds near edges to avoid border holes/cutouts
  - strength is controlled by `parallaxStrength`
  - band count is controlled by `parallaxBands` (default 6)
- Optional height fog mode (toggle in UI):
  - camera-height proxy is derived from zoom (`zoomed out => higher camera`)
  - per-pixel fog is based on `cameraHeightNorm - terrainHeight`
  - fog alpha range is controlled by `fogMinAlpha` / `fogMaxAlpha`
  - fog response curve is controlled by `fogFalloff`
  - fog onset threshold is controlled by `fogStartOffset`
  - fog color defaults to auto light-matched tint and becomes fixed when user edits the color picker
- Optional cloud-shadow mode (toggle in UI):
  - generated seamless repeating noise texture sampled in shader (no external cloud asset)
  - two scrolling noise layers provide cloud-shape motion/parallax
  - controls: coverage, softness, opacity, scale, layer speeds
  - optional sun projection offsets cloud shadows by sun direction with adjustable strength
- Map-level persistence:
  - `Load Map -> Save All` writes `pointlights.json`, `lighting.json`, `parallax.json`, `interaction.json`, `fog.json`, `clouds.json`, and `npc.json`
  - map loading auto-applies these files when present

## Camera/Interaction

- Mouse wheel: zoom (cursor-centered)
- Middle mouse drag: pan
- `LM` dock toggle enables `lighting` interaction mode.
- `PF` dock toggle enables `pathfinding` interaction mode.
- Mode behavior:
  - `lighting`: left click adds/selects point lights.
  - `pathfinding`: hover shows live path preview from player; left click moves player instantly to clicked cell.
  - `none`: left click is no-op.
- Lighting mode on:
  - Left click adds a point light unless one already exists at that map pixel
  - Clicking an existing light selects it and opens the side editor
  - Side editor supports `Color`, `Strength`, `Save`, `Cancel`, `Delete`
- Pathfinding mode:
  - uses local Dijkstra precompute in a square around the player (`30x30 .. 100x100`)
  - move cost uses `slope.png` grayscale + uphill delta from `height.png`
  - preview path is backtracked from hovered pixel via parent links
  - player is loaded from `<mapFolder>/npc.json` and drawn as a 0.5-map-pixel circle
- Cursor light mode on:
  - mouse movement updates live point-light position on terrain
  - optional overlay gizmo shows live cursor-light radius preview
- Player + path preview are drawn on `overlayCanvas` to keep gameplay overlays decoupled from terrain shading
- Render is pixel-sharp while zooming (`NEAREST` texture filtering)

## Shader Uniform Contract

Main light uniforms:
- `uSunDir`, `uSunColor`, `uSunStrength`
- `uMoonDir`, `uMoonColor`, `uMoonStrength`
- `uAmbientColor`, `uAmbient`
- `uPointLightTex`
- `uCloudNoiseTex`
- `uUseCursorLight`, `uCursorLightUv`, `uCursorLightColor`, `uCursorLightStrength`, `uCursorLightHeightOffset`, `uUseCursorTerrainHeight`, `uCursorLightMapSize`
- `uTimeSec`, `uPointFlickerEnabled`, `uPointFlickerStrength`, `uPointFlickerSpeed`, `uPointFlickerSpatial`
- `uUseClouds`, `uCloudCoverage`, `uCloudSoftness`, `uCloudOpacity`, `uCloudScale`, `uCloudSpeed1`, `uCloudSpeed2`, `uCloudSunParallax`, `uCloudUseSunProjection`

Map/camera uniforms:
- `uSplat`, `uNormals`, `uHeight`
- `uMapTexelSize` (must come from height texture size)
- `uMapAspect` (must come from splat texture size)
- `uResolution`, `uViewHalfExtents`, `uPanWorld`
- `uUseParallax`, `uParallaxStrength`, `uParallaxBands`, `uZoom`
- `uUseFog`, `uFogColor`, `uFogMinAlpha`, `uFogMaxAlpha`, `uFogFalloff`, `uFogStartOffset`, `uCameraHeightNorm`

## Change Rules

- Keep branch-only workflow: never commit to default branch.
- Never create/update/trigger PR unless user explicitly asks in current turn.
- Never push unless user explicitly asks.
- Preserve pixel-sharp sampling unless user asks for smooth filtering.
- If lighting behavior changes, update both:
  - `README.md` notes
  - `AGENTS.md` Lighting Model section

## Quick Verification Checklist

After lighting/camera/map-load changes, verify:
1. Default PNGs auto-load from `assets/`.
2. Map aspect ratio is preserved (no stretch).
3. Zoom is sharp (no blur) at high magnification.
4. Daylight looks warm at sunrise/sunset.
5. Night is dim but readable due to moon light.
6. Height-map shadows still react to light direction.
7. LM/PF mode toggles correctly enforce mutual exclusivity and expected click behavior.
8. Point-light edits (save/delete) visibly rebake terrain local lighting.

## Known Non-Goals (Current Prototype)

- No physically accurate astronomy.
- No georeferenced sun position.
- No animated movement yet (currently instant click-to-move).
- No multi-file module architecture yet; all runtime code is in `src/main.js`.
