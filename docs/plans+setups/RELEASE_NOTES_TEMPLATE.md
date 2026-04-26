# TerrainPrototype Release Notes Template

## Release

- Version: `<version>`
- Date: `<YYYY-MM-DD>`
- Branch/Commit: `<branch> / <sha>`
- Targets:
  - Windows MSI: `<path or download link>`
  - Windows NSIS EXE: `<path or download link>`

## Summary

- `<1-3 sentence summary of this release>`

## What Changed

- `<notable change 1>`
- `<notable change 2>`
- `<notable change 3>`

## Map Bundle Format

- Required files in each map folder:
  - `splat.png`
  - `normals.png`
  - `height.png`
  - `slope.png`
  - `water.png`
- Optional sidecar JSON files:
  - `pointlights.json`
  - `lighting.json`
  - `parallax.json`
  - `interaction.json`
  - `fog.json`
  - `clouds.json`
  - `npc.json`

## Save Locations

- In-app `Save All` writes map JSON files to the selected folder.
- Point-light save writes `pointlights.json` in the active map folder (or via fallback save flow).
- App-managed paths (Windows-first decision):
  - Maps root: `appDataDir()/maps`
  - User state/settings: `appDataDir()/state`
  - Logs: `appLogDir()/`

## Known Limitations

- `<known limitation 1>`
- `<known limitation 2>`

## QA Checklist

- [ ] App launches in packaged build.
- [ ] Default map loads.
- [ ] Load map by folder path and folder picker both work.
- [ ] Save All writes expected JSON files.
- [ ] Point-light save/load works.
- [ ] LM/PF interaction modes still behave correctly.

## Upgrade/Compatibility Notes

- `<any breaking or migration notes>`
