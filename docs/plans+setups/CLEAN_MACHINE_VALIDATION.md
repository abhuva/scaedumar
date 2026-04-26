# Clean Machine Validation (Windows)

## Goal
Validate that packaged builds run on a fresh Windows machine without Python, Node, or local dev servers.

## Test Environment
- Windows version: `<fill>`
- New local user profile: `<yes/no>`
- Preinstalled runtimes: `<fill>`

## Artifacts Under Test
- MSI: `src-tauri/target/release/bundle/msi/TerrainPrototype_0.1.0_x64_en-US.msi`
- NSIS EXE: `src-tauri/target/release/bundle/nsis/TerrainPrototype_0.1.0_x64-setup.exe`
- Portable ZIP (optional): `src-tauri/target/release/bundle/portable/TerrainPrototype_0.1.0_x64_portable.zip`

## Pre-Checks
- Ensure Python is not required by uninstalling/ignoring it.
- Ensure Node/npm are not installed (or not used).
- Ensure no local static server is running.

## Install + Launch
1. Install MSI and launch app from Start menu.
2. Install NSIS build on a fresh snapshot (or separate VM) and launch app.
3. Optional: unpack portable zip and run `app.exe`.

## Functional Smoke Tests
- App opens and renders terrain.
- Default map loads.
- Map path load works for packaged app paths.
- Map folder picker load works.
- `Save All` writes JSON files.
- Point light `Save All` / `Load All` works.
- LM/PF toggles function correctly.

## Result Log
- MSI result: `<pass/fail + notes>`
- NSIS result: `<pass/fail + notes>`
- Portable result: `<pass/fail + notes>`
- Blocking issues: `<list>`

