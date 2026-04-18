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
- Rendering backend: WebGL2, single full-screen quad + fragment shader
- Assets loaded by default:
  - `assets/splat.png`
  - `assets/normals.png`
  - `assets/height.png`

## Current Lighting Model

- Day cycle is simulated from keyframes (`SUN_KEYS`) and interpolation.
- Time progresses based on UI slider `cycleSpeed` (`0..1` hours/second).
- Sun:
  - directional light (`uSunDir`)
  - warm tones at low altitude
- Moon:
  - secondary directional light (`uMoonDir`)
  - cool dim tint to avoid pitch-black nights
- Ambient:
  - blended sun/moon ambient tint and intensity
- Shadows:
  - texture-space raymarch over `uHeight`
  - texel step uses height-map dimensions (`heightSize`)

## Camera/Interaction

- Mouse wheel: zoom (cursor-centered)
- Middle mouse drag: pan
- Render is pixel-sharp while zooming (`NEAREST` texture filtering)

## Shader Uniform Contract

Main light uniforms:
- `uSunDir`, `uSunColor`, `uSunStrength`
- `uMoonDir`, `uMoonColor`, `uMoonStrength`
- `uAmbientColor`, `uAmbient`

Map/camera uniforms:
- `uSplat`, `uNormals`, `uHeight`
- `uMapTexelSize` (must come from height texture size)
- `uMapAspect` (must come from splat texture size)
- `uResolution`, `uViewHalfExtents`, `uPanWorld`

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

## Known Non-Goals (Current Prototype)

- No physically accurate astronomy.
- No georeferenced sun position.
- No gameplay logic yet (movement cost/pathfinding).
- No multi-file module architecture yet; all runtime code is in `src/main.js`.
