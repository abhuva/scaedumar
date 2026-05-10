# Soundscape Task List

## Phase 1: Breathing Layers

- [x] Add per-layer amplitude drift controls.
- [x] Add per-layer pitch drift controls.
- [x] Add per-layer drift cycle/speed controls.
- [x] Update live soundscape oscillator nodes without restarting playback.
- [x] Keep waveform visualization aligned with base modal layer settings.

## Phase 2: Envelopes

- [x] Add per-layer attack controls.
- [x] Add per-layer release controls.
- [x] Apply attack ramps when soundscape playback starts.
- [x] Apply release ramps when soundscape playback stops.
- [x] Preserve immediate stop behavior for raw synthesis mode.

## Phase 3: Modal Motion

- [x] Add per-layer motion mode: static, wander, call.
- [x] Add per-layer change interval controls.
- [x] Add per-layer change chance controls.
- [x] Add per-layer glide controls.
- [x] Keep motion constrained to the selected root and scale.

## Phase 4: Role Presets

- [x] Make layer roles apply useful defaults.
- [x] Add `Add Drone`, `Add Resonance`, `Add Shimmer`, and `Add Call`.
- [x] Tune role defaults for wilderness, ancient, lonely, mythical ambience.

## Phase 5: Noise Layers

- [x] Add noise source type.
- [x] Add filtered wind texture.
- [x] Add low rumble texture.
- [x] Add high insect/air texture.
- [x] Mix noise layers through the same soundscape transport.

## Phase 6: Constrained Randomization

- [x] Randomize layer settings inside musical constraints.
- [x] Add random soundscape seed controls.
- [x] Add role-aware randomization.
- [x] Avoid dense rhythmic output by default.

## Phase 7: Persistence And Polish

- [x] Keep `audio.json` backward compatible.
- [x] Update `AI_CONTEXT.md` after behavior changes.
- [x] Add targeted unit tests for modal frequency and normalization helpers.
- [x] Add browser smoke notes after manual validation.
- [ ] Add Tauri smoke notes after manual validation.

## Smoke Notes

- 2026-05-10: User validated Soundscape behavior in browser during iterative
  development. Raw Synthesis, Soundscape role layers, live controls, and modal
  evolution were reported working.
- Tauri runtime smoke has not been run for this feature slice.
