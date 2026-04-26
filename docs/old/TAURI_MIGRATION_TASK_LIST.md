# Tauri Migration Task List

## Working Agreement For This Branch

- This file is the active task manager for `tauri-migration`.
- Add discoveries, blockers, and decisions directly here while we work.
- Current scope: Windows-only release path first.

## Rendering Work During Migration: Safe vs Risky

### Safe (can continue without much migration risk)

- Tuning existing slider ranges/defaults/text labels.
- Small visual bug fixes that do not change file I/O or app bootstrap.
- Isolated shader/math fixes that preserve current input/output contract.
- Map content additions (`assets/<mapName>/...`) and JSON value tuning.
- Overlay/UI polish that does not alter save/load behavior.

### Risky (likely to slow migration or cause merge pain)

- New rendering subsystems (new textures/passes/workers/pipelines).
- Refactors that move or split core render loop / shader uniform contract.
- Changes to map file conventions or Save/Load JSON schema.
- Broad architecture changes in `src/main.js` unrelated to Tauri bootstrapping.
- Cross-cutting features touching both rendering and filesystem behavior.

### Practical Rule

- Keep rendering changes to bug fixes and low-scope tuning until Phase 2
  (file I/O migration) is stable.
- If a rendering task is bigger than ~1 file or changes schema/contracts,
  park it in backlog.

## Current Status Snapshot (2026-04-20)

- Target platform: Windows first.
- Branch: `tauri-migration`.
- Baseline synced to latest `main` merge: `bdc2e49`.
- Dev tools check:
  - Node: `v23.6.1` (installed)
  - npm: `10.9.2` (installed)
  - Rust toolchain: installed and working (`rustc`/`cargo` available)
  - Tauri CLI: installed via Cargo and usable (`cargo tauri ...`)

## Immediate Next Actions

- [x] Resolve Rust PATH visibility in terminal session (`rustc`, `cargo`,
  `rustup` must resolve in this shell).
- [x] Re-check Tauri CLI availability after Rust is visible in shell.
- [x] Initialize Tauri scaffold only after the above checks pass.
- [x] Record every command/result here as migration notes.

## Context Reset Handoff (Fresh-Window Resume)

- Branch: `tauri-migration`
- Current code baseline: `bdc2e49` (includes latest rendering + Map 2 merge
  from `main`)
- Local working tree note: this migration file is currently untracked until
  first commit
- Migration constraints:
  - Windows-only target for first release
  - Major rendering/system changes are paused; only low-risk fixes/tuning allowed
- First command to run in fresh context:
  - verify `rustc --version`, `cargo --version`, `rustup --version`
  - then run Tauri init/scaffold steps from Phase 1

## Tauri Overview (From Previous Answer)

### What Tauri is

- Desktop app shell for web apps.
- The current HTML/JS/WebGL app can stay mostly unchanged.
- Backend is Rust (small native launcher + command bridge).
- Uses OS WebView (Edge WebView2 on Windows, WebKit on macOS, WebKitGTK on Linux).

### Why it fits this terrain prototype

- Small install size vs Electron.
- Good performance for WebGL2 apps.
- Native file access and dialogs (good for map/json workflow).
- Can package installers for normal users.

### What we need to add

- Tauri project scaffold:
  - Add `src-tauri/` (Rust app).
  - Configure window, app metadata, icons.

- File I/O migration:
  - Replace browser-only save/load flows with Tauri APIs where needed.
  - Use app data directories for persistence.
  - Keep folder picker UX with native dialogs.

- Build/release pipeline:
  - Windows installer generation.
  - Code signing setup (later, but recommended before wide sharing).

- Dependency prerequisites (dev machine):
  - Rust toolchain.
  - Node/npm.
  - WebView2 runtime on Windows (usually already installed).

### Tradeoffs to know

- Uses system WebView version, so rendering behavior can vary slightly across
  machines/OS versions.
- Rust is required for native commands.
- Packaging/signing is more setup than browser-only, but worth it for distribution.

### Suggested rollout

1. Phase 1: Wrap current app in Tauri, no logic changes.
1. Phase 2: Move save/load to Tauri file APIs.
1. Phase 3: Add proper installers + update mechanism.
1. Phase 4: Optional sandbox/hardening/signing.

---

## Tauri For This Repo: Concrete Checklist

### Phase 0 - Prep

- [x] Confirm branch strategy for migration work (`tauri-migration` -> future
  PR to `main`).
- [x] Freeze policy clarified (safe vs risky rendering work documented above).
- [x] Confirm target platforms for first release:
  - [x] Windows only first pass
  - [ ] macOS
  - [ ] Linux

### Phase 1 - Bootstrap Tauri Wrapper (No Behavior Change)

- [x] Initialize Tauri in this repo (keep existing frontend files):
  - [x] `index.html`
  - [x] `src/main.js`
  - [x] `styles.css`
- [x] Create `src-tauri/` with default Rust app.
- [x] Configure Tauri window:
  - [x] title
  - [x] initial size
  - [x] minimum size
  - [x] resizable behavior
- [x] Add app icons and metadata in Tauri config.
- [x] Verify app launches and renders terrain exactly as browser build.

### Phase 2 - File and Map I/O Migration

- [x] Audit current browser APIs used for file access:
  - [x] `showSaveFilePicker`
  - [x] `showDirectoryPicker`
  - [x] `<input type="file" webkitdirectory>`
  - [x] direct `fetch` path loading for local assets
- [x] Define app data layout for desktop runtime:
  - [x] maps directory
  - [x] user save/settings directory
  - [x] logs/crash output location
- [x] Implement Tauri command(s) for:
  - [x] save JSON files
  - [x] load JSON files
  - [x] pick map folder
  - [x] validate required map files exist
- [x] Preserve existing map bundle conventions:
  - [x] `assets/<mapName>/splat.png`
  - [x] `normals.png`, `height.png`, `slope.png`, `water.png`
  - [x] sidecar JSONs (`pointlights`, `lighting`, `parallax`, `interaction`,
    `fog`, `clouds`, `npc`)
- [x] Add fallback behavior if desktop file APIs fail.

### Phase 3 - Security and Runtime Hardening

- [x] Lock down Tauri allowlist/capabilities to only required APIs.
- [x] Disable unnecessary shell/command access.
- [x] Review file-path handling and sanitize user-selected paths.
- [x] Add error boundaries and user-facing status for filesystem failures.

### Phase 4 - Packaging and Distribution

- [x] Create release builds:
  - [x] Windows installer (`.msi` or `.exe` bundle)
  - [x] portable zip (optional)
- [x] Validate clean-machine install/run without Python or manual local server.
- [x] Add code-signing plan:
  - [ ] Windows signing cert
  - [ ] macOS signing/notarization (if macOS release)
- [x] Add release notes template for map format and save-location notes.

### Phase 5 - QA Checklist (Repo-Specific)

- [x] Rendering parity with browser version:
  - [x] map aspect preserved
  - [x] zoom remains pixel-sharp
  - [x] day/night + moon lighting unchanged
  - [x] point-light bake and flicker unchanged
  - [x] cloud shadows behave identically
- [x] Interaction parity:
  - [x] LM/PF mode toggles
  - [x] cursor light behavior
  - [x] point-light editor save/cancel/delete
  - [x] map-level Save All / Load behavior
- [x] Map loading parity:
  - [x] `assets/Map 1/` auto-load
  - [x] `assets/` fallback
  - [x] manual map folder loading (including new maps like `Map 2`)

### Effort Estimate (Initial)

- Phase 1: 0.5-1 day
- Phase 2: 1-2 days
- Phase 3: 0.5 day
- Phase 4: 0.5-1 day (without full signing)
- Phase 5: 0.5-1 day
- Total: ~3-5 working days for a solid first Windows release

## Migration Notes (2026-04-20)

- `cargo tauri init` completed.
- Set unique Tauri app identifier in `src-tauri/tauri.conf.json` (no default `com.tauri.dev`).
- Isolated frontend assets into `../.tauri-dist` for `build.frontendDist`.
- `cargo tauri dev` launches the app window.
- Added window minimum size (`minWidth: 800`, `minHeight: 600`).

## Phase 2 Discovery Notes (2026-04-20)

- Browser file API usage audit (confirmed):
  - `showDirectoryPicker` for Save All JSON export (around `src/main.js:923`).
  - `showSaveFilePicker` for point light save flow (around `src/main.js:1648`).
  - `<input type="file" webkitdirectory multiple>` for map folder import
    (`index.html:39`, handled in `src/main.js:3102`).
  - `fetch(...)` for map JSON/asset sidecar loading from selected map path
    (`src/main.js:563`, `src/main.js:1672`).
- Desktop app data layout decision (Windows-first):
  - Managed maps root: `appDataDir()/maps`.
  - User state/settings root: `appDataDir()/state`.
  - Logs/crash diagnostics: `appLogDir()/`.
- Next implementation target: first Rust command set for JSON save/load +
  required map file validation.

## Phase 2 Implementation Notes (2026-04-20)

- Added Tauri invoke commands in `src-tauri/src/lib.rs`:
  - `save_json_file(path, content)`
  - `load_json_file(path)`
  - `validate_map_folder(path)`
- `pick_map_folder()` now returns a selected folder path or `null` on cancel.
- Commands are registered via `tauri::generate_handler!`.
- Frontend now prefers Tauri invoke for:
  - map folder pick (when map path is empty and user clicks `Load`)
  - pointlight/map JSON save to absolute map folders
  - JSON load from absolute map folders
- Added failover behavior:
  - if Tauri save/load commands fail, browser `showDirectoryPicker` /
    `showSaveFilePicker` / download fallback still runs
  - if absolute-path JSON load via Tauri fails, app tries `file://` fetch fallback
- Added pre-load validation for absolute map folders via `validate_map_folder`
  to enforce required files (`splat.png`, `normals.png`, `height.png`,
  `slope.png`, `water.png`).
- Added path sanitization and JSON-file restrictions in Rust commands:
  - reject null-byte paths
  - reject parent traversal segments (`..`)
  - require `.json` extension for `save_json_file` / `load_json_file`
- Reduced Tauri capability scope for `main` window from broad `core:default`
  to explicit minimum set:
  - `core:app:default`
  - `core:event:default`
  - `core:window:default`
  - `core:webview:default`
  - omitted unused core bundles (`path`, `image`, `resources`, `menu`, `tray`)
- Shell command execution remains disabled (no shell plugin or shell invoke
  command exposed).
- Added user-facing status messages when native desktop save operations fail and
  the app falls back to browser save flows.
- `cargo check --manifest-path src-tauri/Cargo.toml` passes for current Rust changes.
- Refreshed `.tauri-dist` and produced Windows release bundles successfully:
  - `src-tauri/target/release/bundle/msi/TerrainPrototype_0.1.0_x64_en-US.msi`
  - `src-tauri/target/release/bundle/nsis/TerrainPrototype_0.1.0_x64-setup.exe`
- Created optional portable zip:
  - `src-tauri/target/release/bundle/portable/TerrainPrototype_0.1.0_x64_portable.zip`
- Added signing strategy document: `CODE_SIGNING_PLAN.md`.
- Clean-machine validation completed successfully (user-verified) — 2026-04-20.

## Phase 5 Local QA Pass (2026-04-20)

- Completed non-interactive verification in this environment:
  - Build integrity:
    - `cargo check --manifest-path src-tauri/Cargo.toml` passes.
    - `node --check src/main.js` passes.
  - UI wiring integrity:
    - `getRequiredElementById(...)` IDs in `src/main.js` are present in
      `index.html` (`OK`).
  - Rendering constraints from code:
    - Pixel-sharp sampling path uses `gl.NEAREST` for min/mag filters (`src/main.js:407-408`).
  - Interaction parity from code:
    - LM/PF mutual-exclusion path present via `setInteractionMode(...)` and
      dock handlers (`src/main.js:2342-2348`, `src/main.js:2951-2971`).
- Map loading parity from code + assets:
  - Default candidates include `assets/Map 1/`, `assets/` (`src/main.js:1482`).
  - `assets/Map 1` and `assets/Map 2` contain required map PNG set.
  - Manual folder load handler is wired (`src/main.js:3245-3255`).
- Interactive runtime verification (manual): Completed by user — visual parity
  and interaction behavior checks pass.

## Linter Tool Detection (2026-04-20)

- `markdownlint-cli2`: resolved via `npm exec --package=markdownlint-cli2`
- `markdownlint`: not found globally on PATH
- `pymarkdown` / `mdformat` / `ruff`: not found in current Python environment
