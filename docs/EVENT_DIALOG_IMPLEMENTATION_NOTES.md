# Event/Dialog Implementation Notes

Living notes for the wiki, journal, tutorial, event, and dialog feature.

## Scope

- Build the feature direction from `docs/WIKI_EVENT_DIALOG_DESIGN.md`.
- Keep content/prose separate from structural event data.
- Keep player-facing scenario/dialog events separate from the existing technical `EventBus`.
- Preserve explicit runtime ownership; dialog choices dispatch commands instead of mutating gameplay owners directly.
- Keep this note as a compact implementation compass, not a detailed changelog.

## Current State

- Wiki prose lives in `docs/wiki/` and is loaded through `src/content/contentRegistry.js`.
- Authored wiki links use Obsidian/Zensical-compatible CommonMark file links like `[Travel](gameplay/travel.md)`.
- Runtime content identity uses stable frontmatter IDs; import rewrites resolved wiki file links to runtime article IDs.
- Global event files are loaded from `GLOBAL_EVENT_DEFINITION_PATHS` in `src/content/eventDefinitionLoader.js`.
- Optional map-local event definitions load from `events.json` in the current map folder during map finalization.
- Duplicate event IDs are rejected across global and map-local files; map-local files may only add IDs.
- Startup/map-load validation checks wiki `related` IDs, wiki file links, and event `contentId` references before event definitions are used.
- Runtime owners are `wikiRuntime`, `journalRuntime`, `eventRuntime`, `eventDialogPersistenceRuntime`, `conditionEventTriggerRuntime`, `wikiPanelRuntime`, `journalPanelRuntime`, and `eventDebugPanelRuntime`.
- First-use tutorial triggers currently cover `gameplay_started`, `pathfinding_started`, `travel_committed`, `inspect_started`, `gathering_started`, `water_started`, `rest_started`, and `hunting_started`.
- Event/journal state persists locally through `terrain:event-dialog-state:v1`; unsupported future payload versions are ignored.
- The wiki panel includes a `Reset Tutorials` prototyping action that clears event state, journal entries, and the local persistence payload.
- Wiki and Journal are separate player-facing panels opened by HUD `W` and `J`; the wiki panel no longer owns a journal side list.
- A compact HUD Journal Feed spans the full HUD width directly above the HUD, shows the latest entry when collapsed, and expands upward into a short scrollable journal list.
- HUD `J` toggles the Journal panel open/closed. The condition-effect strip is constrained so it does not cover the `RD`/knowledge system buttons.
- `RD > Events > Debug` provides debug-only event trigger buttons and readouts for active event, queue, definitions, seen/repeat/flag state, and journal entries.
- The first explicit debug event is `debug.sample_dialog`, backed by `tutorial.event_debug`; `debug.sample_notice` covers non-blocking notice behavior.
- `RD > Events > Debug` also shows the last trigger result, including matched definitions and skip reasons such as already seen, repeat policy, queued, active, or no matching definition.
- Survival warning events live in `assets/data/events/survival.json`; hydration crossing down through 50 and fatigue crossing up through 50 create one-shot notice/journal entries.

## Full Integration Plan

### Phase 0: Guardrails And Tracking

- [x] Create this living implementation note.
- [x] Keep `AI_CONTEXT.md` aligned when ownership, persistence, packaging, or UI contracts change.
- [ ] Keep `docs/WIKI_EVENT_DIALOG_DESIGN.md` as the design source; record implementation deviations here.
- [x] Keep each slice independently testable and avoid broad quest-engine behavior before concrete gameplay needs exist.

### Phase 1: Content Foundation

- [x] Establish `docs/wiki/` as canonical Markdown authoring location.
- [x] Add seed articles for index, first tutorial, travel, inspect, and time.
- [x] Parse frontmatter metadata: `id`, `title`, `summary`, `category`, `tags`, `related`.
- [x] Resolve articles by stable frontmatter ID instead of path.
- [x] Reject duplicate article IDs.
- [x] Add richer authoring validation for missing referenced file links, `related` IDs, and event content IDs.
- [x] Decide whether `docs/wiki/index.md` remains manually authored or becomes generated.
- [x] Add more baseline articles for gathering, water, rest, hunting, fatigue, hydration, nutrition, terrain, tracks, and knowledge map.

### Phase 2: Wiki Runtime And Panel

- [x] Add `wikiRuntime` for current article, history, and help mode state.
- [x] Add `wikiPanelRuntime` with a safe initial Markdown subset.
- [x] Add authored CommonMark file links that resolve to runtime article IDs.
- [x] Add journal side list inside the wiki panel.
- [x] Split journal display out of the wiki panel into its own panel and HUD feed.
- [ ] Improve Markdown support without allowing arbitrary HTML/script execution.
- [x] Add missing-state UI for unresolved article IDs.
- [ ] Add article search/filter if content volume warrants it.
- [x] Add keyboard handling: Escape close, Backspace history, focus trap for blocking event panels.
- [ ] Add responsive/mobile layout for the wiki panel.

### Phase 3: Contextual Help Mode

- [x] Add HUD `?` help mode button.
- [x] Add `data-wiki-id` to key HUD, time, and inspect controls.
- [x] Resolve DOM target clicks through `data-wiki-id`.
- [x] Add fallback behavior when help mode click has no target.
- [ ] Add more UI target IDs across inventory, RD panels, activity panel, route menu, and condition bars.
- [x] Add specific HUD and Inspect target IDs for current baseline wiki articles.
- [ ] Add world/map target resolution for terrain, resource, tracks, route, and entity context.
- [x] Ensure help mode does not accidentally trigger the clicked control's normal action.

### Phase 4: Journal

- [x] Add `journalRuntime` for entries and snapshots.
- [x] Store journal entries as content references, not copied article bodies.
- [x] Render a minimal journal list.
- [x] Persist journal entries locally.
- [ ] Add journal categories and filtering UI.
- [ ] Add journal summaries or snippets if full articles are too long for journal use.
- [ ] Add decision/objective/warning entry display variants.
- [ ] Add journal entry de-duplication policies beyond source-event ID.
- [ ] Move journal persistence into the future savegame/scenario-state layer when that exists.

### Phase 5: Event Runtime Foundation

- [x] Add `eventRuntime` for structural event definitions.
- [x] Support `trigger.type`.
- [x] Support `once` seen-state.
- [x] Support blocking article events with queueing.
- [x] Support pause/restore time behavior for blocking events.
- [x] Support journal-on-close.
- [x] Support `notice` presentation level as non-blocking journal/status entries.
- [x] Support `silent` presentation level as state/journal-only events.
- [x] Support trigger payload conditions such as `minStrength`.
- [x] Add priority tie-break rules and tests.
- [x] Add repeatable event policy: cooldowns and max count.
- [x] Add event-local flags.
- [ ] Persist queued/active event state if mid-event save becomes required.

### Phase 6: Dialog And Choice Model

- [x] Normalize article-only events into one-node internal dialog shape.
- [x] Add event nodes with `contentId`, choices, next-node transitions, and close behavior.
- [x] Render choices in the event/wiki panel without breaking article-only events.
- [x] Add consequence visibility modes: exact, hinted, hidden, knowledgeBased.
- [x] Add command outcome support for explicit command dispatch only.
- [x] Add non-command outcomes owned by the event/journal runtime: `journal/add`, `event/setFlag`, and `event/clearFlag`.
- [x] Add command result handling and failure feedback for choices that dispatch gameplay commands.
- [ ] Persist active event/node/choice history when savegame support exists.

### Phase 7: Persistence And Save-State Integration

- [x] Persist seen event IDs locally.
- [x] Persist journal entries locally.
- [x] Restore persisted state before startup triggers run.
- [ ] Decide transition path from `localStorage` to savegame or `scenario_state.json`.
- [ ] Include active event/node and queue state if mid-event save is required.
- [x] Include event-local flags and cooldowns.
- [ ] Include important choice history if future scenario logic needs it.
- [x] Add migration/version handling for stored event-dialog state.
- [x] Add user-facing reset/debug path for tutorial/event state.

### Phase 8: Data Loading And Packaging

- [x] Load global structural event definitions from `assets/data/events/`.
- [x] Copy `docs/wiki/` into `.tauri-dist/docs/wiki/` through `build-tauri.ps1`.
- [x] Add multiple global event files under `assets/data/events/`.
- [x] Add map-local event definition loading from `assets/<mapName>/events.json` or equivalent.
- [ ] Decide whether authoring should stay JSON or add a YAML build/normalization step.
- [x] Validate duplicate event IDs across global definition files.
- [x] Validate duplicate event IDs across global and map-local definitions.
- [x] Decide whether map-local event files may override global event IDs or only add new IDs.
- [ ] Keep startup/map-load errors visible on title screen when content/event loading fails.

### Phase 9: Gameplay Trigger Integration

- [x] Trigger `gameplay_started` after starting a new game.
- [x] Add low-risk tutorial triggers for first pathfinding activation and first inspect activation.
- [x] Add low-risk tutorial triggers for first travel commit, first gather/water/rest/hunt start.
- [ ] Add discovery triggers from tracks/resource/knowledge changes when meaningful gameplay signals exist.
- [ ] Add warning triggers from condition thresholds and inventory/resource constraints.
- [x] Add first warning triggers from hydration/fatigue condition thresholds.
- [ ] Add scenario/objective triggers after structural event loading supports map-local definitions.
- [x] Keep triggers explicit owner calls or post-change listener reactions; do not use Markdown metadata for gameplay behavior.

### Phase 10: UI Polish And Accessibility

- [x] Add first blocking panel visual style.
- [x] Fit the HUD `?` button into the system-action column with fixed-height buttons.
- [x] Add `RD > Events > Debug` for event trigger/readout testing.
- [x] Add last-trigger diagnostics to `RD > Events > Debug`.
- [x] Split HUD system actions into RD/O/Exit and ?/W/J columns.
- [x] Add compact/expandable HUD Journal Feed above the full player HUD.
- [x] Keep condition-effect strip hit area out of the system/knowledge button columns.
- [x] Make HUD `J` toggle the Journal panel.
- [ ] Add explicit blocking backdrop or focus treatment if interactions behind the event panel remain confusing.
- [ ] Add better title/status text for blocking tutorial vs normal wiki browse.
- [ ] Add journal/open-state indicators.
- [x] Add accessible labels for choice buttons and article links.
- [x] Add keyboard navigation for close, back, and active-event focus trap.
- [x] Add focus restoration after closing events.

### Phase 11: Validation And Tooling

- [x] Add focused tests for content registry, event runtime, journal runtime, persistence runtime, wiki runtime, and wiki panel behavior.
- [x] Run full JS tests after `main.js` startup integration.
- [x] Run markdown lint after docs/wiki and implementation-note changes.
- [ ] Add tests for wiki panel rendering behavior with DOM fixtures if panel complexity grows.
- [x] Add tests for help-mode click interception.
- [x] Add tests for map-local/global event merge behavior.
- [ ] Add standalone validation tooling for article/event cross-reference integrity.
- [x] Add runtime startup/map-load validation for article/event cross-reference integrity.

## Decisions

- `docs/wiki/` is the canonical authoring location for now. `build-tauri.ps1` copies it into `.tauri-dist/docs/wiki/` for packaged desktop runtime fetches.
- Article IDs are stable frontmatter IDs. Derived IDs are development-only and must not be used by authored events.
- Authored wiki prose links must be CommonMark `.md` file links, not runtime IDs.
- `contentRegistry` resolves wiki file links to frontmatter IDs during import and rewrites loaded runtime bodies for in-game navigation.
- `docs/wiki/index.md` remains manually authored for now; generation is deferred until article count or navigation complexity makes manual upkeep error-prone.
- Global event definition files are listed in `GLOBAL_EVENT_DEFINITION_PATHS` and merged in order by `eventDefinitionLoader`.
- Map-local event files are optional `events.json` files in the current map folder. They may only add event IDs; duplicate IDs are authoring errors.
- First-use tutorial triggers are emitted after the owning command path succeeds. They must not preempt, validate, or mutate gameplay state.
- Event/dialog local persistence uses an explicit payload version. Unsupported versions are ignored rather than partially applied.
- The wiki panel may expose reset/debug actions for tutorial/event prototyping, but reset behavior is owned by runtime modules and persistence, not by the UI renderer.
- Generated wiki panel controls should carry explicit accessible labels because their visible text can be compact article IDs or short choice labels.
- The scenario/dialog event runtime is not the technical `EventBus`; it owns player-facing event queue state.
- Journal entries store content references, not copied article bodies.
- Local browser persistence is temporary until a proper savegame/scenario-state layer exists.
- Gameplay mutations from dialog choices must route through explicit command dispatch.
- Non-command choice outcomes are intentionally narrow: `journal/add`, `event/setFlag`, and `event/clearFlag`.
- Wiki/event content reference validation is an authoring guard, not a runtime recovery path.
- Missing-article UI remains useful for runtime/dev safety even though shipped content should validate cleanly.
- Wiki/event panel keyboard, focus, help-click, generated-control labels, and reset-button behavior are owned by `wikiPanelRuntime`.
- Journal panel and HUD Journal Feed rendering are owned by `journalPanelRuntime`; `journalRuntime` remains the state/persistence owner.
- HUD knowledge buttons are split from system/debug shell buttons: `?` enables contextual help, `W` opens the wiki, and `J` opens the journal.
- Event debug trigger/readout UI lives under `RD > Events > Debug` so it does not compete with player-facing journal/wiki UX.
- Condition warning triggers are post-change observers owned by `conditionEventTriggerRuntime`; condition mutation stays in `conditionRuntime` and activity/resource owners.
- Hydration/fatigue threshold warning events are one-shot notices for now. Repeating/escalating warnings are deferred until the survival loop needs them.

## Open Questions

- Should closing a blocking article always mark the event seen, or should some events require an explicit final action?
- Where should long-term event/journal persistence live once a full savegame layer exists?
- Should first-version notices appear as toasts, or only as journal entries?
- Should event authoring stay JSON, or should there be a YAML/build normalization step?
- What is the first meaningful discovery/warning trigger beyond simple tutorial first-use events?
- What should the first player-facing journal categories and visual variants be once the journal moves beyond link-list scaffolding?

## Milestones

- Added wiki article loading, safe Markdown rendering, help mode, and baseline wiki content.
- Added journal entries as content references with local persistence.
- Added article-backed blocking events, notice/silent events, queueing, time behavior, repeat policy, and flags.
- Added node-based dialog choices, command dispatch, event-owned outcomes, consequence visibility, and failure feedback.
- Switched wiki authoring links to Obsidian/Zensical-compatible `.md` file links with import-time ID resolution.
- Added content reference validation for wiki and event data.
- Added global and map-local event definition loading with duplicate-ID rejection.
- Added first-use tutorial triggers for gameplay start, pathfinding, travel, inspect, gathering, water, rest, and hunting.
- Added local persistence versioning, migration handling, and reset/debug behavior.
- Added keyboard/focus/accessibility behavior for the wiki/event panel.
- Added `RD > Events > Debug` plus sample blocking dialog and notice events.
- Split Wiki and Journal into separate panels and added the compact/expandable HUD Journal Feed.
- Added last-trigger diagnostics and first survival warning events for hydration/fatigue thresholds.

## Latest Validation

- `node --check src\ui\eventDebugPanelRuntime.js`: pass.
- `node --check src\gameplay\eventRuntime.js`: pass.
- `node --check src\gameplay\conditionEventTriggerRuntime.js`: pass.
- `node --check src\ui\journalPanelRuntime.js`: pass.
- `node --check src\ui\wikiPanelRuntime.js`: pass.
- `node --check src\ui\bindings\canvasBinding.js`: pass.
- `node --check src\ui\rd\resourceDebugMarkupRuntime.js`: pass.
- `node --check src\main.js`: pass.
- JSON parse for `assets\data\events\tutorials.json`: pass.
- Focused event/debug/content tests: pass, 32 tests.
- `node --test tests\*.test.js`: pass, 312 tests.
- `npm run lint:md`: pass.
