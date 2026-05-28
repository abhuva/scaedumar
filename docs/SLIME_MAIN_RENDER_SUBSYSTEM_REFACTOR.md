# Slime Main Render Subsystem Refactor

## Purpose

Move Slime from a separate WebGL2 canvas/context into the main terrain renderer WebGL2 context.

The feature is gameplay-relevant and visually validated. The old separate-context bridge required full-resolution GPU-to-CPU readback for the trail overlay, CPU-side masking, and upload back into the main renderer. That architecture caused gameplay CPU spikes and must not return as the normal visual path.

## Status Legend

- `[x]`: completed and validated enough to keep.
- `[~]`: implemented but still needs browser/runtime proof, tuning, or cleanup.
- `[ ]`: not implemented.
- `[blocked]`: blocked by a known dependency or unresolved design choice.

## Current Status

- Overall status: main-context visual path implemented and accepted for current gameplay use.
- Full-resolution visual trail readback has been removed from normal gameplay/render updates.
- Gameplay still uses low-resolution readbacks for hunting availability and plant stock sync.
- 20x gameplay is stable enough for activity speed after sampled stepping and readback cadence changes.
- 100x fast-forward can still spike, but this is accepted as diagnostic fast-forward rather than normal gameplay speed.

## Target Architecture

```text
Main WebGL context
-> update Slime agent/trail/plant textures
-> terrain shader samples Slime trail texture directly
-> gameplay reads only low-resolution statistical products
```

Rules:

- Full-resolution `simSize` trail texture stays, currently 1024x1024.
- Full-resolution trail is the visual source of truth.
- No full-resolution `readPixels` is allowed for normal visual Tracks rendering.
- Track discovery masking belongs in the terrain shader/composite path.
- Low-resolution readbacks remain allowed for gameplay statistics, hunting, and plant stock sync.
- The old separate-context Slime runtime can remain temporarily for dev comparison, but gameplay must use the main-context subsystem.
- Raw Slime framebuffer textures are Y-flipped at the render-composite boundary in `sampleSlimeTrailOverlay()`; do not move that correction into simulation coordinate math.

## Master Task List

### T0 Documentation And Guardrails

- [x] T0.1 Create `docs/SLIME_MAIN_RENDER_SUBSYSTEM_REFACTOR.md`.
- [x] T0.2 Link the refactor doc from `AI_CONTEXT.md`.
- [x] T0.3 Document the architectural rule: full-map render-time texture layers use the main WebGL renderer texture-compositing path.
- [x] T0.4 Document that full-resolution Slime trail `readPixels` is forbidden for normal visual rendering.
- [x] T0.5 Document that low-resolution readbacks are acceptable for gameplay/statistics only.
- [x] T0.6 Document the Y-axis convention for direct raw Slime texture sampling.
- [x] T0.7 Convert this document to a complete task checklist with status markers.
- [x] T0.8 Keep this document updated after every Slime rendering, readback, Tracks, or performance architecture change.

Dependencies:

- None.

### T1 Main-Context Slime Runtime

- [x] T1.1 Make `src/slime/slimeGpuRuntime.js` accept an external WebGL2 context.
- [x] T1.2 Add headless mode so gameplay Slime does not own its own canvas animation loop.
- [x] T1.3 Instantiate a headless main-context Slime runtime in `src/main.js`.
- [x] T1.4 Route gameplay Slime updates/readbacks through the main-context runtime.
- [x] T1.5 Keep Slime GL state explicit enough for shared-context use.
- [x] T1.6 Bind the default framebuffer before the main terrain pass so Slime offscreen passes cannot leak framebuffer state into terrain rendering.
- [x] T1.7 Audit all Slime passes for renderer-state leakage beyond framebuffer and viewport state.
- [x] T1.8 Add `src/slime/slimeMainRenderRuntime.js` as the gameplay/main-render construction wrapper around the shared GPU backend.

Dependencies:

- T0 guardrails.
- Existing `src/slime/slimeGpuRuntime.js` shader/pass implementation.
- Main renderer GL context availability.

### T2 Terrain Shader Visual Composite

- [x] T2.1 Add Slime trail overlay uniforms in `src/render/shaders.js`.
- [x] T2.2 Bind direct Slime trail textures through `src/render/uniformUploader.js`.
- [x] T2.3 Add shader-side colorization for raw Slime trail textures.
- [x] T2.4 Preserve nearest-neighbor/pixel-sharp rendering for the Slime trail texture.
- [x] T2.5 Composite the Slime trail in the normal terrain shader path.
- [x] T2.6 Disable the overlay-canvas full-map Slime visual path for normal rendering.
- [x] T2.7 Add shader-side Y flip for raw Slime trail sampling so the direct texture path matches the old CPU readback row-flip convention.
- [x] T2.8 Browser-verify alignment against terrain rivers/plants after shader-side coordinate changes.
- [x] T2.9 Preserve the legacy Slime terrain underlay visual in the main terrain shader by sampling height, slope, water, and live Slime plant stock directly in the main WebGL context. Live plant stock is sampled with the same render-boundary Y flip as the raw Slime trail texture.

Dependencies:

- T1 main-context Slime runtime.
- `src/render/uniformUploader.js` texture binding path.
- `src/render/shaders.js` terrain composite path.

### T3 Tracks Discovery Shader Mask

- [x] T3.1 Add a renderer-owned Tracks discovery mask texture.
- [x] T3.2 Upload Tracks discovery snapshots through `src/render/uniformUploader.js`.
- [x] T3.3 Add shader uniforms for Tracks mask enablement and knowledge cutoff.
- [x] T3.4 Apply Tracks knowledge masking in the terrain shader.
- [x] T3.5 Keep Tracks knowledge initialized clear/black on new game or map reset.
- [x] T3.6 Keep player movement as the current Tracks reveal source; scout birds must not reveal Tracks.
- [x] T3.7 Expose RD Slime controls for Tracks `Clear`, `Fill`, `Noise`, and cutoff.
- [ ] T3.8 Implement future hawk-based Tracks reveal when hawks exist.

Dependencies:

- Resource discovery runtime.
- T2 terrain shader composite.

### T4 Remove Full-Resolution Visual Readback

- [x] T4.1 Stop normal Inspect Tracks rendering from depending on `slimeTrailOverlayRaster`.
- [x] T4.2 Remove normal `src/main.js` fallback calls to `readTrailOverlayRaster`.
- [x] T4.3 Remove CPU Tracks raster masking from the normal visual path.
- [x] T4.4 Remove the old overlay-canvas Slime full-map snapshot/draw path.
- [x] T4.5 Remove `readTrailOverlayRaster()` from `slimeGpuRuntime.js`.
- [x] T4.6 Remove the legacy trail overlay readback shader/program allocation/export.

Dependencies:

- T2 direct shader composite.
- T3 shader Tracks mask.

### T5 Low-Resolution Gameplay Readbacks

- [x] T5.1 Keep `readTrailAvailabilityGrid` at low resolution for hunting/readout.
- [x] T5.2 Keep `readPlantStockFactorImageData` at low resolution for plant stock sync.
- [x] T5.3 Confirm normal gameplay does not read the 1024x1024 trail texture to CPU.
- [x] T5.4 Make Inspect Tracks numeric readout use the low-resolution availability grid.
- [x] T5.5 Make Hunting use the low-resolution availability grid.
- [x] T5.6 Add `availabilityUpdateTickInterval` cadence, default `10` actual Slime steps.
- [x] T5.7 Add `plantStockSyncTickInterval` cadence, default `120` actual Slime steps.
- [x] T5.8 Stagger trail availability readback and plant factor readback so both do not run in the same update frame.
- [x] T5.9 Remove the full plant-stock readback fallback so gameplay plant sync only uses low-resolution stock factors.
- [x] T5.10 Browser-profile readback spikes at 20x and 100x after cadence changes.
- [ ] T5.11 If readback spikes remain unacceptable, replace synchronous low-resolution `readPixels` with a cheaper strategy.

Candidate strategies for T5.11:

- [ ] T5.11a Reduce default availability grid size below 128 if gameplay still reads well.
- [ ] T5.11b Add async/staged readback with delayed consumption.
- [ ] T5.11c Move hunting availability sampling to a GPU reduction pass and read a tiny result.
- [ ] T5.11d Run plant stock sync less often or only when plant contours/hunting systems need it.
- [ ] T5.11e Keep plant depletion purely GPU-side for visuals and sync gameplay stock only on activity/resource interactions.

Dependencies:

- T1 main-context runtime.
- Resource stock runtime.
- Player hunting runtime.

### T6 Game-Time Stepping And Fast-Forward Behavior

- [x] T6.1 Route gameplay Slime updates through the existing game-time tick stream.
- [x] T6.2 Keep `gameTicksPerSlimeStep` as the gameplay cadence interval, default `3`.
- [x] T6.3 Keep `stepsPerGameTick` as the per-interval Slime step batch size.
- [x] T6.4 Add `maxGameStepsPerFrame`, default `2`, to cap actual Slime work per rendered frame.
- [x] T6.5 Drop excess fast-forward intervals instead of queueing backlog.
- [x] T6.6 Count readback cadence by actual Slime steps, not raw game ticks.
- [x] T6.7 Document that 100x is fast-forward and does not guarantee smooth ecological simulation.
- [x] T6.8 Tune defaults after browser testing at 1x, 5x, 20x, and 100x.

Dependencies:

- Time router/global game-time stream.
- T5 low-resolution readback cadence.

### T7 Plant Interaction

- [x] T7.1 Preserve GPU plant stock mutation driven by Slime trail pressure.
- [x] T7.2 Keep authored plant potential as the regeneration base.
- [x] T7.3 Prevent same-size plant source refreshes from reinitializing mutable GPU plant stock.
- [x] T7.4 Keep gameplay stock sync depletion-only.
- [x] T7.5 Prevent Slime sync from revealing unknown plants.
- [x] T7.6 Prevent Slime sync from increasing known or live gameplay stock.
- [x] T7.7 Add separate `Plant Sync Tick` UI control.
- [x] T7.8 Browser-verify that visible plant depletion/regeneration remains believable with slower sync cadence.
- [ ] T7.9 If plant stock sync remains a performance issue, redesign it around event-driven or activity-local syncing.

Dependencies:

- Resource stock runtime.
- Resource search/runtime plant maps.
- T5 plant factor readback.

### T8 Hunting Agent Interaction

- [x] T8.1 Hunting success checks actual Slime agents inside the hunt circle.
- [x] T8.2 Award loot only for killed agents.
- [x] T8.3 Respawn killed local agents outside the hunt circle.
- [x] T8.4 Report miss/no game if chance succeeds but no agents are present.
- [x] T8.5 Activate temporary Slime flee field after at least one kill.
- [x] T8.6 Register the flee state as a temporary condition effect so the buff/debuff strip owns status display.
- [x] T8.7 Expose flee steps, weight, and radius controls.
- [x] T8.8 Update only killed agent texels after Hunting success instead of reuploading the full agent texture.
- [x] T8.9 Browser-verify flee strength/radius defaults after performance changes.
- [ ] T8.10 Replace full-agent readback on hunting success with a targeted GPU/local readback if it produces measurable spikes.

Dependencies:

- Player hunting activity runtime.
- Inventory runtime.
- Condition effect runtime.
- T1 Slime runtime.

### T9 Dev UI, Settings, And Presets

- [x] T9.1 Keep existing Slime settings registered in core settings contracts.
- [x] T9.2 Keep `slime.json` save/load support.
- [x] T9.3 Keep named preset flow compatible with Water Trails architecture.
- [x] T9.4 Add `Game Ticks / Slime Step` RD/dev control.
- [x] T9.5 Add `Plant Sync Tick` control.
- [x] T9.6 Forward new Slime controls through all binding assembly layers.
- [x] T9.7 Update current map/preset JSON for changed defaults.
- [x] T9.8 Browser-verify Save Settings and preset round-trip after new cadence fields.
- [~] T9.9 Move Slime UI access into `RD > Trail`: full lab controls are now split across `Trail > Runtime`, `Motion`, `Visual`, `Terrain`, `Plants`, and `Brush`, while trail overlay, Hunting flee, Tracks knowledge, and availability readout controls are under `Trail > Tracks`. Browser validation of the moved controls is still pending.
- [x] T9.10 Add `RD > Trail > Runtime > Warm Up` controls for enabling/disabling map-load warmup and setting warmup step count.

Dependencies:

- Settings registry.
- Main bindings lifecycle/assembly runtimes.
- Slime panel and binding runtimes.

### T10 Legacy Dev Canvas Separation

- [x] T10.1 Keep old dev canvas runtime only as a temporary comparison path.
- [x] T10.2 Ensure gameplay uses the main-context headless runtime.
- [x] T10.3 Separate legacy dev canvas state from main-context gameplay state.
- [x] T10.4 Decide whether the legacy dev canvas should be removed after main-context runtime is proven.

Decision:

- Keep the legacy dev canvas runtime for now as an internal comparison/test path. Gameplay uses the main-context headless runtime and no longer depends on or exposes the legacy canvas.
- Slime is not a user-facing workspace in unified game mode. `RD > Trail` controls the main-context Slime simulation and the world-space terrain overlay; trails render over the existing terrain map instead of opening a detached placeholder Slime view.

Dependencies:

- T1 main-context runtime stability.
- Dev-mode workflow decisions.

### T11 Validation And Proof

- [x] T11.1 Run focused JS syntax checks after changed JS modules.
- [x] T11.2 Run full JS tests after integration changes.
- [x] T11.3 Run markdown lint after doc changes.
- [x] T11.4 Browser smoke test proved the direct texture path renders.
- [x] T11.5 User testing showed 20x became nearly smooth after sampled stepping and readback cadence changes.
- [x] T11.6 Browser-verify Y-axis alignment after shader-side raw texture flip.
- [x] T11.7 Browser-profile 20x and 100x after separate plant sync cadence.
- [x] T11.8 Capture accepted performance numbers in this document.
- [x] T11.9 Add a graphical CPU/GPU/update timing history to the performance overlay for spike hunting.
- [x] T11.10 Commit the refactor once runtime behavior is accepted.

Dependencies:

- All implementation tasks touched by each validation pass.

## Known Risks

- Low-resolution `readPixels` can still stall the CPU because it synchronizes with queued GPU work.
- Plant stock sync may still be too expensive if it runs during heavy GPU work.
- Hunting success still reads the full agent state texture and may spike on successful hunts.
- Legacy dev canvas and main-context gameplay runtime state are now separate, but settings are still shared by design. The legacy canvas path is not user-facing in unified game mode.
- Y-axis alignment can regress if future changes move coordinate flips between simulation, readback, and shader paths.

## Shared GL State Audit

- Slime offscreen passes explicitly bind their framebuffer and viewport through `bindFramebuffer()`.
- Slime deposit temporarily enables additive blending and disables blending again after drawing.
- No other current Slime pass enables blending, depth, stencil, or scissor state.
- Main terrain pass explicitly binds the default framebuffer and resets the viewport before drawing.
- Shadow rendering explicitly disables blending before its pass.
- Remaining shared-state assumptions: shader program, active texture unit, bound textures, and blend function can be overwritten by later passes because those passes bind their own required state. If a future pass enables blending without setting `blendFunc`, revisit this audit.

## Latest Reported Performance

These are user-reported browser/runtime readings during the main-render refactor. They are not synthetic benchmark results.

- Before main-context/readback cadence work at 20x: CPU update spikes were the blocker, with reported examples around `CPU 47.40 ms`, `update 38.52 ms`.
- Before backlog dropping at 100x: reported extreme fast-forward example was `FPS 5.8`, `CPU 348.85 ms`, `update 344.55 ms`.
- After sampled stepping and readback cadence changes at 100x, fully zoomed out: `FPS 39.6`, `Frame 50.52 ms`, `CPU 49.61 ms`, `update 45.27 ms`, `GPU 5.81 ms`.
- After later alignment/runtime cleanup, user reported the feature works and runs better; 20x was previously described as nearly smooth, while 100x remains fast-forward rather than smooth simulation.
- Final accepted profiling pass with graphical timing history: changing to 20x showed only a barely visible mini-spike and then stable timing. 100x showed clear update spikes/system flooding, accepted for now as fast-forward behavior. Stable post-spike readout was approximately `FPS 73.9`, `Frame 14.85 ms`, `CPU 5.70 ms`, `update 0.33 ms`, `GPU 7.88 ms`.
- Map-load warmup is now controlled by `warmupEnabled` plus `warmupSteps`; existing saves without `warmupEnabled` preserve prior enabled behavior.

## Proof Criteria

The refactor is successful when:

- Gameplay Tracks visual uses the full-resolution Slime trail texture.
- Inspect Tracks overlay renders without full-resolution `readPixels`.
- CPU update spikes are acceptable at 20x gameplay activity speed.
- 100x fast-forward remains responsive, accepting less smooth Slime evolution.
- 1000-2500 agents at 1024x1024 remain visually stable.
- Trail overlay aligns with terrain/resource maps.
- Hunting availability and loot behavior still work.
- Plant consumption/regeneration still affect gameplay plant stock.
- Existing save/load and presets still work.
- Full JS tests pass.

## Required Files To Read Before Editing

- `AI_CONTEXT.md`
- `docs/SLIME_SIM.md`
- `src/slime/slimeGpuRuntime.js`
- `src/slime/slimeState.js`
- `src/render/renderPipelineRuntime.js`
- `src/render/uniformUploader.js`
- `src/render/shaders.js`
- `src/render/frameRenderState.js`
- `src/main.js`
- `src/gameplay/resourceDiscoveryRuntime.js`
- `src/gameplay/resourceStockRuntime.js`
- `src/gameplay/playerHuntingActivityRuntime.js`

## Update Rule

Update this document whenever:

- A task is completed.
- A task is deferred.
- A task is split into subtasks.
- The target architecture changes.
- A temporary compatibility path is introduced.
- A performance proof or blocker is discovered.
