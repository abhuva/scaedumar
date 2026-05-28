# RD UI Architecture

## Purpose

Define the long-term architecture for the in-game `RD` control surface before splitting the large panel out of `index.html`.

The goal is not to rewrite the UI for its own sake. The goal is to keep RD maintainable as it keeps growing, while preserving the current lightweight browser-native runtime and explicit owner-module architecture.

## Current State

- `index.html` owns the static application shell and currently contains the full RD panel markup.
- All top-level RD panels have been extracted as static partials through `src/ui/rd/resourceDebugMarkupRuntime.js` and `src/ui/rd/panels/*PanelHtml.js`.
- The RD overlay shortcut rail has been extracted through `src/ui/rd/overlayRailHtml.js`.
- RD top-level panels with nested tabs are further split into nested subpanel partials:
  - `RD > Terrain`: `src/ui/rd/panels/terrain/`
  - `RD > Trail`: `src/ui/rd/panels/trail/`
  - `RD > Agents`: `src/ui/rd/panels/agents/`
  - `RD > Pathing`: `src/ui/rd/panels/pathing/`
  - `RD > Audio`: `src/ui/rd/panels/audio/`
- Their top-level `*PanelHtml.js` files act as assemblers for tab strips and subpanels.
- `index.html` now owns the RD shell, top-level tab strip, overlay-rail host, and panel host placeholders. Extracted markup keeps original DOM IDs in partial modules.
- `RD` is the canonical control surface for tools, debug views, tuning, IO, and subsystem controls.
- `RD` does not own gameplay, rendering, audio, Slime, Swarm, map IO, or pathing state. It exposes controls for owner modules.
- Existing bindings depend on stable DOM IDs. This is intentional and should be preserved through the first extraction step.
- Tool workspaces are still valid for large surfaces. The Audio workspace is the current example: RD owns controls, while the workspace provides large spectrogram/waveform surfaces.

## Design Constraints

- Keep dependencies minimal. Do not introduce a frontend framework only to split markup.
- Keep browser-native loading simple for local/Tauri use.
- Preserve current DOM IDs during extraction so existing bindings stay stable.
- Avoid making RD a state owner. Runtime owners and commands continue to own mutation and validation.
- Keep markup understandable. Generated UI is acceptable only when it reduces complexity without hiding important behavior.
- Support ongoing manual changes. Controls will keep being added, renamed, moved, and removed.

## Architecture Options

### Option A: Keep All RD Markup In `index.html`

Benefits:

- Simplest runtime.
- No injection/bootstrap ordering problem.
- Direct browser inspection maps to the source file.

Costs:

- `index.html` will keep growing into a fragile monolith.
- Moving sections becomes noisy and risky.
- Review diffs are hard because unrelated panels live in one file.
- New contributors have to scan thousands of lines before finding the relevant panel.

Assessment: acceptable only as the current transitional state. Not a good long-term target.

### Option B: Static HTML String Partials

Each top-level RD area moves into a small JS module that exports markup:

- `src/ui/rd/panels/terrainPanelHtml.js`
- `src/ui/rd/panels/agentsPanelHtml.js`
- `src/ui/rd/panels/trailPanelHtml.js`
- `src/ui/rd/panels/gameplayPanelHtml.js`
- `src/ui/rd/panels/audioPanelHtml.js`
- `src/ui/rd/panels/pathingPanelHtml.js`
- `src/ui/rd/panels/ioPanelHtml.js`

An assembly module injects these into the shell before existing `getRequiredElementById(...)` calls:

- `src/ui/rd/resourceDebugMarkupRuntime.js`

Benefits:

- Keeps browser-native/no-build architecture.
- Preserves existing DOM IDs and bindings.
- Splits diffs by domain.
- Allows incremental extraction one panel at a time.
- Does not force a new abstraction over mixed custom controls.

Costs:

- HTML inside template strings has weaker editor validation.
- Bootstrap order matters: injection must happen before binding lookup.
- Very large template strings can still become hard to read if not split by panel/subpanel.

Assessment: best next step. It solves the immediate monolith problem without changing ownership or requiring a framework.

### Option C: Declarative Control Registry

Controls are described as data objects and rendered from schemas:

```js
{
  id: "cloudOpacity",
  type: "range",
  label: "Opacity",
  min: 0,
  max: 1,
  step: 0.01,
  command: "core/renderFx/changed",
}
```

Benefits:

- Good for repeated slider/checkbox/select rows.
- Can reduce repeated markup.
- Could support search, presets, and generated docs later.

Costs:

- Current RD contains many custom sections, nested groups, one-off buttons, overlay rails, waveform controls, sidecar IO, and domain-specific layouts.
- A premature schema would either be too weak or become a second UI framework.
- It risks moving behavior knowledge into generic rendering code, making ownership less explicit.

Assessment: useful later for repetitive rows, not as the next global architecture.

### Option D: Component System Or Frontend Framework

Introduce a component framework or a custom component layer.

Benefits:

- Better component composition.
- Stronger reuse patterns if UI becomes a full application.

Costs:

- Adds dependencies and build/runtime complexity.
- Conflicts with the current no-framework lightweight direction.
- Migration cost is high and would distract from gameplay/rendering work.

Assessment: not appropriate now. Reconsider only if the UI becomes large enough that static partials plus small helpers cannot support it.

## Recommended Long-Term Shape

Use a layered approach:

1. `index.html` remains the application shell.
2. `src/ui/rd/resourceDebugMarkupRuntime.js` assembles the RD markup.
3. `src/ui/rd/panels/*PanelHtml.js` own static panel markup by top-level RD tab.
4. Existing subsystem UI runtimes and bindings continue to own behavior.
5. Optional micro-render helpers can be added later for repeated row patterns.

The RD layer owns navigation and markup placement only. It does not own subsystem state.

## Static Partial Contract

The current extracted markup contract is intentionally simple:

- `index.html` owns the application shell, the RD topic-card shell, the top-level `RD` tab strip, and placeholder hosts.
- `src/ui/rd/resourceDebugMarkupRuntime.js` is the only injection entry point. It must run before `src/main.js` performs top-level `getRequiredElementById(...)` lookups.
- `src/ui/rd/overlayRailHtml.js` owns the RD right-edge overlay shortcut rail markup.
- `src/ui/rd/panels/*PanelHtml.js` own top-level RD panel assemblers.
- Nested tab groups live under matching domain folders such as `src/ui/rd/panels/terrain/` and `src/ui/rd/panels/trail/`.
- Top-level assemblers own their tab strips and call nested subpanel partials in display order.
- Nested subpanel partials own panel bodies only. They should not own runtime state or bind events directly.
- Existing DOM IDs are a binding contract. Preserve them unless the corresponding binding/runtime lookup changes in the same slice.
- New RD markup modules should stay static and dependency-free unless there is a clear reason to introduce a focused helper.

`tests/rdMarkupRuntime.test.js` guards this contract by checking required DOM IDs, shell host injection, overlay shortcuts, relative partial imports, and one-to-one tab `aria-controls` targets.

## Near-Term Extraction Plan

Use small, reversible steps:

1. Create the RD markup assembly runtime with no behavior changes. Done for the first IO slice.
2. Extract `RD > IO` first because it is small and mostly isolated. Done; `index.html` now keeps an `rdDevIoPanelHost` placeholder and the runtime injects the preserved `rdDevIoPanel` DOM before bindings.
3. Extract `RD > Gameplay` next because it is the existing resource-debug panel group with stable binding IDs. Done; `index.html` now keeps `rdDevGameplayPanelHost`.
4. Validate all required DOM IDs still exist before and after bindings.
5. Extract `RD > Audio`. Done; `index.html` now keeps `rdDevAudioPanelHost`.
6. Extract `RD > Pathing`. Done; `index.html` now keeps `rdDevPathingPanelHost`.
7. Extract larger panels: `RD > Agents`, `RD > Trail`, and `RD > Terrain`. Done.
8. Leave `index.html` with only the RD container placeholder. Done for top-level panels; the shell still owns the tab strip plus overlay rail and panel host placeholders.

Each extraction slice should run:

```powershell
node --check src\main.js
node --test tests\*.test.js
npm run lint:md
git diff --check
```

For small slices, targeted JS checks are acceptable first, but full tests should run before committing a multi-panel extraction.

## When To Step Up To A Control Registry

Do not start with a registry. Add it only when repeated markup causes real maintenance cost.

Good candidates:

- Slider rows with label/value/input triplets.
- Checkbox rows with status labels.
- Select rows with fixed labels.
- Repeated sidecar save/load button groups.

Bad candidates:

- Audio waveform/spectrogram surfaces.
- Overlay shortcut rail.
- Pathing route editor controls.
- Slime/Swarm custom runtime panels.
- Any control with bespoke layout or multi-command behavior.

Practical trigger:

- If a future edit changes the same row structure in three or more panels, add a focused helper for that row type.
- If a future feature needs control search/filtering across RD, introduce metadata alongside static markup rather than replacing all markup at once.

## When To Reconsider A Framework

Only reconsider a framework if most of these become true:

- RD needs dynamic panel mounting/unmounting for performance.
- Multiple large tool workspaces need complex shared stateful components.
- Manual DOM binding becomes the dominant source of bugs.
- A build step is already accepted for other reasons.
- The app is moving from prototype tooling into a general application UI.

Until then, static partials plus owner-module bindings are the better fit.

## Rules For Future RD Work

- Preserve DOM IDs during extraction unless the binding is changed in the same slice.
- Keep control mutation routed through existing commands/runtime owners.
- Do not add RD-only state for subsystem values.
- Prefer moving markup before changing behavior.
- Keep top-level panels small enough to review independently.
- Keep tool workspaces for large surfaces, not for ordinary settings.

## Open Questions

- Should RD partials be injected as `innerHTML` from template strings, or should we eventually use `HTMLTemplateElement` helpers?
- Should repeated row helpers emit strings or DOM nodes?
- Should panel metadata include search labels later?
- Should docs generate a control map from IDs after the markup split?

These are step-up questions, not blockers for the first extraction.
