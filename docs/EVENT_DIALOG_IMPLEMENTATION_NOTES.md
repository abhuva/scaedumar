# Event/Dialog Implementation Notes

Living notes for the wiki, journal, tutorial, event, and dialog feature.

## Scope

- Build the feature direction from `docs/WIKI_EVENT_DIALOG_DESIGN.md`.
- Keep content/prose separate from structural encounter/event data.
- Keep player-facing scenario/dialog encounters separate from the existing technical `EventBus`.
- Preserve explicit runtime ownership; dialog choices dispatch commands instead of mutating gameplay owners directly.
- Keep this note as a compact implementation compass, not a detailed changelog.

## Current State

- Wiki prose lives in `docs/wiki/` and is loaded through `src/content/contentRegistry.js`.
- Authored wiki links use Obsidian/Zensical-compatible CommonMark file links like `[Travel](gameplay/travel.md)`.
- Runtime content identity uses stable frontmatter IDs; import rewrites resolved wiki file links to runtime article IDs.
- Global event files are loaded from `GLOBAL_EVENT_DEFINITION_PATHS` in `src/content/eventDefinitionLoader.js`.
- Optional map-local encounter definitions load from `events.json` in the current map folder during map finalization.
- Duplicate event IDs are rejected across global and map-local files; map-local files may only add IDs.
- Startup/map-load validation checks wiki `related` IDs, wiki file links, encounter `contentId` references, and semantic UI highlight targets before encounter definitions are used.
- Content validation failures are surfaced on the title screen with multiline details; default-map startup treats these as fatal authoring errors instead of falling through to fallback textures.
- Runtime owners are `wikiRuntime`, `journalRuntime`, `eventRuntime`, `eventDialogPersistenceRuntime`, `conditionEventTriggerRuntime`, `wikiPanelRuntime`, `journalPanelRuntime`, `encounterPanelRuntime`, `uiHighlightRuntime`, and `eventDebugPanelRuntime`.
- Player-facing terminology is Encounter for blocking/tutorial/dialog definitions; internal module names, DOM IDs, storage keys, and data folders still use `event`/`eventDebug` naming short-term for compatibility.
- Blocking player-facing definitions are now presented as center-screen Encounters through `encounterPanelRuntime`; the Wiki side dock is reference-only and no longer renders active encounter choices.
- Encounter definitions can request temporary semantic UI highlights through `presentation.uiHighlights`; `uiHighlightRuntime` maps semantic target IDs to DOM elements and owns color, thickness, pulse, and source-based clearing.
- Encounter triggers may use `trigger.exclusive: true` so the highest-priority eligible exclusive definition consumes a trigger call and skips lower-priority matching definitions. This is the intended map-local override path.
- First-use tutorial triggers currently cover `gameplay_started`, `pathfinding_started`, `travel_committed`, `inspect_started`, `gathering_started`, `water_started`, `rest_started`, and `hunting_started`.
- Event/journal state persists locally through `terrain:event-dialog-state:v1`; unsupported future payload versions are ignored.
- The wiki panel includes a `Reset Tutorials` prototyping action that clears event state, journal entries, and the local persistence payload.
- Wiki and Journal are separate player-facing panels opened by HUD `W` and `J`; the wiki panel no longer owns a journal side list.
- In gameplay mode, Wiki, Journal, Inventory, and RD use fixed side-dock slots derived from the left stats width. Side-dock visibility is priority-resolved by `src/ui/sideDockRuntime.js` in increasing priority order: Journal, Inventory, Wiki, RD.
- A compact HUD Journal Feed spans the center 420-unit mockup band directly above the HUD, shows the latest entry when collapsed, and expands upward into a short scrollable journal list.
- HUD `J` toggles the Journal panel open/closed. The condition-effect strip is constrained so it does not cover the `RD`/knowledge system buttons.
- The full Journal panel has a category filter populated from current entries; the HUD `J` button and Journal Feed show a lightweight entry-present indicator. Clicking a journal entry opens its wiki article without closing the Journal panel.
- RD-dev remains an independent debug panel with the same side-dock width and highest side-dock priority.
- The bottom HUD spans the full viewport width and uses viewport-scaled Excalidraw ratios: `340 / 80 / 260 / 80 / 170 / 170` for stats/effects, system/knowledge buttons, time/weather diorama, activity buttons, Activity status, and Inspect status.
- The left stats area is split into two equal four-row blocks; the second block currently contains placeholders for future stats.
- Activity status is always visible and shows an `Idle` baseline when no movement/activity/preview is active.
- Inspect is enabled by default and no longer has a dedicated HUD toggle button; blocking/disabled presentation remains available for activities such as rest.
- `RD > Encounters > Debug` provides debug-only encounter trigger buttons and readouts for active encounter, queue, definitions, seen/repeat/flag state, and journal entries.
- `RD > Encounters > Debug` also shows a read-only Content Health card with article/global/map-local/active encounter counts, current validation status, last validation details, and a `VC` button that re-runs active wiki/encounter reference validation.
- The first explicit debug encounter definition is `debug.sample_dialog`, backed by `tutorial.event_debug`; `debug.sample_notice` covers non-blocking notice behavior.
- `RD > Encounters > Debug` also shows the last trigger result, including matched definitions and skip reasons such as already seen, repeat policy, queued, active, or no matching definition.
- Survival warning events live in `assets/data/events/survival.json`; hydration crossing down through 50 and fatigue crossing up through 50 create one-shot notice/journal entries.
- `assets/map3/events.json` is intentionally kept as a temporary map-local proof fixture. It uses obvious test copy from `map.map3_gathering_test` and should be removed or rewritten when map-specific production content begins.
- Content creation/polish is intentionally deferred. Current prose exists only where needed to exercise architecture and catch runtime/content-contract issues.

## Closure Status

The Encounter/Wiki/Journal architecture is stable enough to treat the implementation slice as complete.

Completed architecture:

- Wiki, Journal, Encounter, side-dock, highlight, persistence, and RD debug owners are separated.
- Blocking Encounters are no longer mixed into the Wiki side panel.
- Journal entries are content references and can link to Wiki articles without closing the Journal.
- Global and map-local definitions load through one validated definition set.
- Map-local definitions can add new IDs and can override default trigger behavior with `trigger.exclusive`.
- Content reload paths bypass browser cache for authored Markdown and event JSON.
- Validation catches article links, related IDs, event content references, duplicate IDs, and semantic UI highlight targets.
- RD Encounters debug provides preview, validation health, trigger diagnostics, queue/active state, seen/repeat/flag state, and journal readouts.

Deferred intentionally:

- Final tutorial/survival/map content.
- Savegame/scenario-state integration beyond the temporary local browser persistence.
- Broad schema tooling beyond current runtime validation and tests.
- Large UI target expansion for highlights/help until content actually needs those targets.

## Remaining Work

These are not blockers for the current architecture slice. They are follow-up improvements for later development.

- Improve Markdown rendering only if wiki content needs more structure; keep arbitrary HTML/script execution disallowed.
- Add article search/filter if wiki content volume makes manual navigation awkward.
- Add responsive/mobile layout for Wiki, Journal, and Encounter surfaces if mobile or small-window support becomes a target.
- Expand contextual help and semantic highlight targets across Inventory, route menus, condition bars, RD panels, terrain, resources, tracks, and entities when authored content needs them.
- Add journal summaries/snippets, visual variants, and richer de-duplication policies once journal entries are more than linked field notes.
- Move Encounter/Journal persistence from temporary `localStorage` into savegame or scenario-state storage when that layer exists.
- Persist active Encounter/node/queue/choice history only if mid-encounter save becomes required.
- Decide whether encounter authoring remains JSON or gains a YAML/build normalization step.
- Add discovery/resource/track/scenario triggers when those gameplay signals have stable meaning.
- Add survival warning escalation or repeat policies when the survival loop needs more than one-shot threshold notices.
- Add standalone validation tooling if content validation needs to run outside app startup, map reload, RD debug, and tests.
- Replace or remove the `assets/map3/events.json` proof fixture when real map-local content begins.
## Decisions

- `docs/wiki/` is the canonical authoring location for now. `build-tauri.ps1` copies it into `.tauri-dist/docs/wiki/` for packaged desktop runtime fetches.
- Article IDs are stable frontmatter IDs. Derived IDs are development-only and must not be used by authored encounter definitions.
- Authored wiki prose links must be CommonMark `.md` file links, not runtime IDs.
- `contentRegistry` resolves wiki file links to frontmatter IDs during import and rewrites loaded runtime bodies for in-game navigation.
- `docs/wiki/index.md` remains manually authored for now; generation is deferred until article count or navigation complexity makes manual upkeep error-prone.
- Global event definition files are listed in `GLOBAL_EVENT_DEFINITION_PATHS` and merged in order by `eventDefinitionLoader`.
- Map-local event files are optional `events.json` files in the current map folder. They may only add event IDs; duplicate IDs are authoring errors.
- First-use tutorial triggers are emitted after the owning command path succeeds. They must not preempt, validate, or mutate gameplay state.
- Event/dialog local persistence uses an explicit payload version. Unsupported versions are ignored rather than partially applied.
- The wiki panel may expose reset/debug actions for tutorial/event prototyping, but reset behavior is owned by runtime modules and persistence, not by the UI renderer.
- Generated wiki panel controls should carry explicit accessible labels because their visible text can be compact article IDs or short choice labels.
- The scenario/dialog encounter runtime is not the technical `EventBus`; internally it is still named `eventRuntime` for compatibility, but it owns player-facing encounter queue state.
- Journal entries store content references, not copied article bodies.
- Local browser persistence is temporary until a proper savegame/scenario-state layer exists.
- Gameplay mutations from dialog choices must route through explicit command dispatch.
- Non-command choice outcomes are intentionally narrow: `journal/add`, `event/setFlag`, and `event/clearFlag`.
- Wiki/event content reference validation is an authoring guard, not a runtime recovery path.
- Startup and map-local content validation failures use a typed content-validation error so default-map fallback does not hide broken authored wiki/encounter data.
- Missing-article UI remains useful for runtime/dev safety even though shipped content should validate cleanly.
- Wiki panel keyboard, focus, help-click, generated-control labels, and reset-button behavior are owned by `wikiPanelRuntime`.
- Encounter panel keyboard, focus trap, backdrop, choice labels, and close behavior are owned by `encounterPanelRuntime`.
- UI highlights are presentation-only. Authored encounters reference semantic target IDs, not DOM IDs; highlights decorate visible controls and never change gameplay availability.
- Journal panel and HUD Journal Feed rendering are owned by `journalPanelRuntime`; `journalRuntime` remains the state/persistence owner.
- HUD knowledge buttons are split from system/debug shell buttons: `?` enables contextual help, `W` opens the wiki, and `J` opens the journal.
- Encounter debug trigger/readout UI lives under `RD > Encounters > Debug` so it does not compete with player-facing journal/wiki UX.
- Content health validation in `RD > Encounters > Debug` is read-only; it may update debug/status text but must not mutate encounter, journal, wiki, or gameplay state.
- Condition warning triggers are post-change observers owned by `conditionEventTriggerRuntime`; condition mutation stays in `conditionRuntime` and activity/resource owners.
- Hydration/fatigue threshold warning events are one-shot notices for now. Repeating/escalating warnings are deferred until the survival loop needs them.
- Wiki/Journal side placement is presentation state only. It is not persisted yet and does not affect RD-dev, which remains the always-on-top debug surface.
- The current weather-status HUD row is a layout placeholder until a weather/runtime owner exists.

## Future Improvements

- Decide whether some blocking encounters require an explicit final action instead of marking seen on close.
- Move long-term Encounter/Journal persistence from `localStorage` into a savegame or scenario-state layer.
- Decide whether non-blocking notices need toast-style presentation in addition to Journal/feed/status feedback.
- Decide whether authoring stays JSON or gains a YAML/build normalization step.
- Add discovery/resource/track triggers once those gameplay signals have stable meaning.
- Add warning escalation/repeat policy for survival conditions once the survival loop needs it.
- Add journal summaries/snippets and visual variants when journal content grows beyond linked field notes.
- Expand semantic highlight/help targets across Inventory, route menus, condition bars, and RD only when authored content needs them.
- Add standalone content validation tooling if validation needs to run outside the app/test harness.
- Replace or remove the `assets/map3/events.json` proof fixture when real map-local content begins.

## Stabilization Notes

- Owner-module boundaries are in good shape. `eventRuntime` owns player-facing queue/trigger/choice state, `encounterPanelRuntime` owns blocking presentation, `wikiRuntime` owns reference article navigation, `journalRuntime` owns journal state, `sideDockRuntime` owns panel arbitration, `uiHighlightRuntime` owns semantic highlight application, and content modules own loading/validation.
- `main.js` remains the integration/composition surface, but the Encounter/Wiki/Journal behavior is not implemented as ad-hoc `main.js` state paths.
- Dialog choices dispatch commands through the injected dispatcher; Encounter runtime does not directly mutate gameplay owners.
- Content creation is intentionally out of scope for this closure pass.

## Historical Handoff

- Current branch: `feature/event-dialog-system`.
- Latest checkpoint before this layout slice: `36cb99e Add event dialog and journal systems`.
- The gameplay HUD layout is now proportional to the Excalidraw mockup, scaled to viewport width instead of hardcoded 1100px.
- Horizontal HUD ratios are `340 / 80 / 260 / 80 / 170 / 170`, mapped as `30.9091vw / 7.2727vw / 23.6364vw / 7.2727vw / 15.4545vw / 15.4545vw`.
- Left stat/effect side width equals Wiki/Journal side dock width.
- Stats area is split into two equal four-row blocks; only the first block has live stats for now, and the second block contains inert placeholders.
- Effects occupy the top quarter of the left stat area. Stats occupy the lower three quarters.
- Journal feed spans the 420-unit center band above the left buttons, diorama, and right buttons. Collapsed height matches the effects/weather row; expanded height matches the stats row.
- Activity and Inspect panels are equal width and sit inside the bottom HUD right side.
- The right activity button area intentionally stays in the 80-unit mockup slot and uses a compact `3x3` grid for the current nine controls.
- Inspect has no HUD toggle button now. `inspectPerceptionRuntime` initializes enabled by default, while rest/scout can still block Inspect presentation.
- Wiki/Journal side placement is presentation-only and not persisted. Header `Swap` exchanges preferred Wiki/Journal sides subject to side-dock priority.
- RD-dev is independent from Wiki/Journal side swapping and has highest side-dock priority.
- Weather Status is a layout placeholder only; no weather owner is wired into that row yet.
- This session added category filtering to the full Journal panel, entry-present indicators on HUD `J` plus the compact Journal Feed, kept Journal open when opening linked articles, aligned RD panel width with Wiki/Journal, moved Inventory into the same side-dock layout, and added side-dock priority arbitration.
- This session split blocking tutorial/dialog presentation out of the Wiki panel into the centered Encounter panel. Markdown articles remain shared content; structural definitions choose `presentation.surface`.
- Untracked mockup files were intentionally left uncommitted: `Excalidraw/` and `Screenshot 2026-05-29 031220.png`.

Recommended first browser checks next session:

- Start gameplay and confirm the bottom HUD visually matches the Excalidraw ratios across the full viewport.
- Confirm left stats form two equal blocks of four rows, with placeholders only in block two.
- Confirm Activity and Inspect are equal width.
- Confirm journal collapsed/expanded feed aligns only over the middle 420-unit band.
- Confirm Wiki/Journal side docks match the left/right yellow mockup columns and swap correctly.
- Confirm RD-dev opens above the left side dock.
- Confirm Inspect is active on startup and becomes visually disabled during blocking activities like rest/scout.

## Milestones

- Added wiki article loading, safe Markdown rendering, help mode, and baseline wiki content.
- Added journal entries as content references with local persistence.
- Added article-backed blocking encounters, notice/silent events, queueing, time behavior, repeat policy, and flags.
- Added node-based dialog choices, command dispatch, event-owned outcomes, consequence visibility, and failure feedback.
- Switched wiki authoring links to Obsidian/Zensical-compatible `.md` file links with import-time ID resolution.
- Added content reference validation for wiki and encounter data.
- Added global and map-local event definition loading with duplicate-ID rejection.
- Added first-use tutorial triggers for gameplay start, pathfinding, travel, inspect, gathering, water, rest, and hunting.
- Added local persistence versioning, migration handling, and reset/debug behavior.
- Added keyboard/focus/accessibility behavior for the Wiki and Encounter panels.
- Added `RD > Encounters > Debug` plus sample blocking dialog and notice encounters.
- Split Wiki and Journal into separate panels and added the compact/expandable HUD Journal Feed.
- Added last-trigger diagnostics and first survival warning events for hydration/fatigue thresholds.

## Latest Validation

- Stabilization closure pass:
  - `node --check src\content\contentRegistry.js`: pass.
  - `node --check src\gameplay\eventRuntime.js`: pass.
  - `node --check src\ui\eventDebugPanelRuntime.js`: pass.
  - `node --check src\ui\uiHighlightRuntime.js`: pass.
  - `node --check src\main.js`: pass.
  - `node --test tests\*.test.js`: pass, 350 tests.
  - Targeted markdown lint for touched docs: pass.
  - Full `npm run lint:md` is currently blocked by unrelated trailing whitespace in `docs/notes.md`.

Previous validation checkpoint:

- `node --check src\ui\eventDebugPanelRuntime.js`: pass.
- `node --check src\gameplay\eventRuntime.js`: pass.
- `node --check src\ui\encounterPanelRuntime.js`: pass.
- `node --check src\gameplay\conditionEventTriggerRuntime.js`: pass.
- `node --check src\ui\journalPanelRuntime.js`: pass.
- `node --check src\ui\wikiPanelRuntime.js`: pass.
- `node --check src\ui\bindings\canvasBinding.js`: pass.
- `node --check src\ui\rd\resourceDebugMarkupRuntime.js`: pass.
- `node --check src\main.js`: pass.
- JSON parse for `assets\data\events\tutorials.json`: pass.
- Focused event/wiki/encounter/content tests: pass, 42 tests.
- `node --test tests\*.test.js`: pass, 323 tests.
- `npm run lint:md`: pass.
