# Terrain Prototype (Self-Contained)

Prototype goals:
- Load a terrain splat PNG and render it
- Load normals PNG and apply directional sunlight
- Load height PNG and compute directional shadows
- Control sun azimuth + altitude by mouse position

## Files
- `index.html`: app shell and control panel
- `src/main.js`: WebGL2 renderer + shaders
- `styles.css`: UI styling
- `assets/`: optional default PNG location

## Expected PNG names (optional auto-load)
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
- Mouse angle from center controls sun azimuth.
- Mouse distance from center controls sun altitude.
- Height shadowing is a texture-space raymarch for prototype quality.
