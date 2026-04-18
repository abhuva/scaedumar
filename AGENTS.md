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


## Map Conventions (Current Prototype)

- `assets/splat.(png|jpg|jpeg)`: base color terrain image
- `assets/normals.(png|jpg|jpeg)`: tangent/object-space normal map encoded in RGB
- `assets/height.(png|jpg|jpeg)`: grayscale height map (optional but used for shadows)


## Lighting Model (Prototype)

- Directional sun (not point light)
- Mouse controls:
  - Angle from center sets azimuth
  - Distance from center sets altitude
- Height-based shadow raymarch in texture space


## Quality Bar for Iteration

- Loads PNG maps reliably
- Renders at interactive framerate on typical desktop hardware
- Exposes parameters for ambient, diffuse, shadow strength, and height scale
