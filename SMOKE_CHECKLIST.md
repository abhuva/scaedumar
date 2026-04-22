# Migration Smoke Checklist

Last updated: 2026-04-22
Purpose: fast behavioral compatibility check during architecture refactor.
Policy: architecture-first; visual drift is acceptable unless it breaks usability/function.

## How To Use

- Run this checklist after meaningful refactor slices (state/scheduler/render/UI extraction).
- Mark each item `pass`, `fail`, or `n/a` with short notes.
- If an item fails, fix or log explicitly before continuing large extraction work.

## Core Runtime

- App starts without runtime errors.
- Default map auto-load works from expected fallback folder sequence.
- Camera controls still work:
  - mouse wheel zoom
  - middle-mouse pan
- Render loop remains interactive (roughly stable fps, no obvious hitch loop).

## Mode + Interaction

- `LM` and `PF` toggles remain mutually exclusive.
- `LM` mode:
  - click adds/selects point light
  - edit/save/delete still applies changes
- `PF` mode:
  - hover path preview appears
  - click-to-move updates player position

## Persistence

- `Load Map` with valid map folder still succeeds.
- `Save All` writes expected JSON files for active map.
- `Load All` / map reload re-applies persisted settings.
- JSON compatibility preserved for existing keys:
  - `pointlights.json`
  - `lighting.json`
  - `parallax.json`
  - `interaction.json`
  - `fog.json`
  - `clouds.json`
  - `waterfx.json`
  - `swarm.json`
  - `npc.json`

## Lighting + FX Behavior

- Day/night cycle slider and cycle speed remain functionally coherent.
- Shadow pipeline remains functional (with and without blur).
- Water FX controls still work (including downhill/invert/tint/flow tuning).
- Cloud/fog toggles still apply without shader/runtime failure.

## Desktop (Tauri) Path

- Map folder picker/path validation still works in desktop runtime.
- JSON save/load via Tauri commands still works.
- `.tauri-dist` refresh workflow still succeeds before Tauri run/build.

## Acceptable Drift

- Non-blocking visual changes:
  - color balance shifts
  - shadow softness/detail changes
  - small lighting/fog/water look differences
- Blocking regressions:
  - broken controls or mode routing
  - failed map/json IO
  - severe performance collapse or crash
  - missing/incorrect save-load behavior
