# Terrain Prototype (Self-Contained)

Prototype goals:
- Load a terrain splat PNG and render it
- Load normals PNG and apply directional sunlight
- Load height PNG and compute directional shadows
- Simulate a full day/night sun cycle with adjustable speed

## Files

- `index.html`: app shell and control panel
- `src/main.js`: WebGL2 renderer + shaders
- `styles.css`: UI styling
- `assets/`: optional default PNG location
- `AI_CONTEXT.md`: implementation map and workflow notes for AI agents

## Expected auto-load names

- `assets/splat.png`
- `assets/normals.png`
- `assets/height.png`

If these are not present, the app starts with fallback textures. You can load files manually with the file inputs.

## Run

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

## Notes

- Directional light is modeled as a sun direction vector.
- Sun azimuth/altitude are sampled from a daily keyframe table and interpolated.
- Day-cycle speed slider runs from `0.00` to `1.00` hours/second (`0` = paused).
- Low sun angles use warmer sunlight/ambient colors for sunrise/sunset ambience.
- A moon directional light and moon ambient tint keep nights dim but readable.
- Mouse wheel controls zoom.
- Middle mouse drag pans the map.
- Height shadowing is a texture-space raymarch for prototype quality.
- Texture sampling is nearest-neighbor for pixel-sharp zoomed rendering.
