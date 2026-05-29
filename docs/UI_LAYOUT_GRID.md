# UI Layout Grid

The gameplay HUD uses fixed layout units. Do not size these panels from their current text content.

## Terms

- `Player UI Height`: total height of the bottom-center player HUD.
- `Player UI Row`: one-third of `Player UI Height`.
- `Side Slot`: one half of `Player UI Height`, equal to 1.5 `Player UI Row`.
- `HUD Activity Slot`: the fixed right-side bottom-HUD area that displays primary activity or travel-planning status.
- `HUD Inspect Slot`: the fixed right-side bottom-HUD area that displays Inspect controls and readouts.
- `Wiki/Journal Side Dock`: fixed left/right player-facing article panels above the bottom HUD.

## CSS Contract

These variables live in `styles.css`:

```css
--player-ui-width: 100vw;
--player-ui-height: 108px;
--player-ui-row: calc(var(--player-ui-height) / 3);
--side-slot-height: calc(var(--player-ui-height) / 2);
--side-stack-gap: 0px;
--player-ui-bottom: 0px;
--hud-stats-width: 30.9091vw;
--hud-button-bank-width: 7.2727vw;
--hud-diorama-width: 23.6364vw;
--hud-activity-width: 15.4545vw;
--hud-inspect-width: 15.4545vw;
--hud-effects-height: calc(var(--player-ui-height) * 0.25);
--hud-stats-height: calc(var(--player-ui-height) * 0.75);
--hud-journal-width: 38.1818vw;
--hud-journal-left: var(--hud-stats-width);
--hud-journal-collapsed-height: var(--hud-effects-height);
--hud-journal-expanded-height: var(--hud-stats-height);
--wiki-journal-side-width: var(--hud-stats-width);
--side-stack-x: 69.0909vw;
```

The player HUD spans the full viewport width and is fixed at `Player UI Height`. The Activity panel and Inspect panel each occupy one right-side HUD panel slot. Content must fit inside the slot. If content overflows, reduce or simplify the content; do not make the slot grow.

The horizontal proportions are derived from the Excalidraw mockup's 1100-unit width: `340 / 80 / 260 / 80 / 170 / 170` for stats/effects, left buttons, diorama, right buttons, Activity, and Inspect. These are implemented as viewport-scaled ratios, not fixed pixel widths.

HUD blocks should align as fixed blocks, not as soft cards with spacing. The gameplay HUD, Activity panel, Inspect panel, and side-docked Wiki/Journal panels intentionally use square corners and zero inter-block gap so the UI can move toward a pixel-art/block layout.

## Current Gameplay Panels

- The title screen uses a fullscreen cover image, compact text-fit square-corner pixel buttons vertically centered on the left side, and a staged startup progress bar.
- The bottom player HUD spans the full viewport width and owns stats, active condition effects, system/knowledge actions, the weather/time diorama, utility buttons, Activity status, and Inspect status.
- Condition stats are compact label/bar rows without visible numeric values. The stats area is split into two equal four-row blocks; the second block currently contains placeholders until more stats exist.
- The condition-effect strip occupies the top quarter of the left stats span and must not cover system/knowledge buttons.
- The system/knowledge button bank immediately left of the time diorama uses the same fixed 3x3 action-bank grid as the right utility bank. Current buttons are `RD`, `O`, `Exit`, `?`, `W`, and `J`; unused slots remain empty instead of stretching existing buttons.
- In gameplay mode, the RD topic panel is a fixed-height left rail anchored to the top/left viewport edges above the player HUD. Save RD Settings lives in the panel title row; first-order and second-order RD tab strips stay fixed below the title row, and only the active tab content panel scrolls.
- Wiki and Journal use side docks above the bottom HUD with the same width as the left stats/effects column. Journal defaults left, Wiki defaults right, and their header `Swap` buttons exchange only those two sides. RD-dev stays independent and visually above these docks.
- The compact Journal Feed is centered over the 420-unit middle band covering left buttons, diorama, and right buttons. Collapsed height matches the effect/weather row; expanded height matches the stats row.
- The time diorama sits between the system/knowledge buttons and utility action buttons. Its weather-status row is currently a placeholder; its speed controls include `0x` real pause.
- `Nav`, Inventory, and Center Player remain fixed HUD utility actions. They keep the action-bank's three-column sizing so each button remains one-third of the bank width and the bank can still hold a 3x3 set if needed.
- `PF`, `G`, `W`, `HU`, `SC`, and `R` live in the local terrain activity menu. Neutral terrain clicks open that menu when no active interaction mode consumes the click. Active activities do not block the fallback menu by default, so the player can cancel or switch from the menu unless a specific activity phase owns terrain clicks. A second neutral terrain click closes the visible menu.
- The local terrain activity menu uses up to twelve fixed circular slots. Slot `0` starts left of the click anchor, subsequent visible actions fill clockwise, and locked/hidden actions collapse out without leaving empty slots.
- When an activity, movement, or cancelable interaction is active, the local terrain activity menu shows a center `X` cancel button at the click anchor.
- The local terrain activity menu is stable while open; normal gameplay HUD syncs do not rebuild it. `RD > IO` exposes the menu radius used for the fixed circular slot positions.
- The Activity slot is always visible. It shows `Idle` when no movement/activity/preview is active.
- Inspect is enabled by default. The Inspect slot shows Inspect overlay controls and the selected resource/layer bar; activities such as rest can still block/disable Inspect presentation.
- Primary activity menu actions remain the main cancel/switch mechanism. Side panels should avoid duplicate cancel controls.
- Travel planning uses condition-bar projection overlays for resource/fatigue costs instead of spreadsheet-style numeric cost text.
