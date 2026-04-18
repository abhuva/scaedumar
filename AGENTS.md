# AGENTS.md

## Project Goal

Build a self-contained prototype for top-down terrain rendering from Gaea-exported maps:
- Splat/albedo map for terrain appearance
- Normal map for directional sunlight response
- Height map for directional shadowing


## Technical Direction

- No game engines (no Unity, Godot, Unreal)
- Keep runtime lightweight and understandable
- Prefer browser-native stack first: HTML + JavaScript + WebGL2


## Working Agreement

- Keep dependencies minimal
- Prefer small, testable increments over large rewrites
- Preserve existing user changes; never revert unrelated edits
- Document run steps in `README.md`
- CRITICAL git workflow: always work on a branch, never commit directly to `main` (or other default branch), and only open PRs when the user explicitly requests it.
- CRITICAL collaboration rule: never create, update, or trigger a PR unless the user explicitly asks in the current turn.
- CRITICAL collaboration rule: never push to remote unless the user explicitly asks to push.


## Map Conventions (Current Prototype)

- `assets/splat.png`: base color terrain image
- `assets/normals.png`: tangent/object-space normal map encoded in RGB
- `assets/height.png`: grayscale height map (optional but used for shadows)


## Lighting Model (Prototype)

- Directional sun (not point light)
- Simulated day/night cycle:
  - Hour over day drives azimuth and altitude from a simple lookup table
  - Cycle speed is adjustable from `0` to `1` hour per second
  - Lower altitudes add warm sunrise/sunset ambience
- Moon phase:
  - Secondary directional moon light keeps nights readable
  - Moon ambient tint is cool and dim, with dusk/dawn overlap
- Height-based shadow raymarch in texture space


## Quality Bar for Iteration

- Loads PNG maps reliably
- Renders at interactive framerate on typical desktop hardware
- Exposes parameters for ambient, diffuse, shadow strength, and height scale
- Maintains pixel-sharp rendering under zoom (nearest-neighbor sampling)
- Keep `AI_CONTEXT.md` aligned with behavior when changing rendering logic
