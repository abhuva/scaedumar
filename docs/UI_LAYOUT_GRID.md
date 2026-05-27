# UI Layout Grid

The gameplay HUD uses fixed layout units. Do not size these panels from their current text content.

## Terms

- `Player UI Height`: total height of the bottom-center player HUD.
- `Player UI Row`: one-third of `Player UI Height`.
- `Side Slot`: one half of `Player UI Height`, equal to 1.5 `Player UI Row`.
- `Side Stack`: the right-side stack aligned to the player HUD.
- `Top Side Slot`: activity / travel-planning info panel.
- `Bottom Side Slot`: Inspect panel.

## CSS Contract

These variables live in `styles.css`:

```css
--player-ui-width: 1024px;
--player-ui-height: 108px;
--player-ui-row: calc(var(--player-ui-height) / 3);
--side-slot-height: calc(var(--player-ui-height) / 2);
--side-stack-gap: 0px;
--player-ui-bottom: 0px;
--side-stack-x: calc(50% + 512px);
```

The player HUD is fixed at `Player UI Height`. The Activity panel and Inspect panel each occupy one `Side Slot`. Content must fit inside the slot. If content overflows, reduce or simplify the content; do not make the slot grow.

HUD blocks should align as fixed blocks, not as soft cards with spacing. The gameplay HUD, Activity panel, and Inspect panel intentionally use square corners and zero inter-block gap so the UI can move toward a pixel-art/block layout.

## Current Gameplay Panels

- The title screen uses a fullscreen cover image, compact text-fit square-corner pixel buttons vertically centered on the left side, and a staged startup progress bar.
- The bottom-center player HUD owns stats, active condition effects, system actions, the time diorama/time-speed controls, utility actions, primary activities, and the Inspect toggle.
- Condition stats are compact left-anchored label/bar rows without visible numeric values.
- The `RD` resource-debug topic button, `O` performance overlay button, and `Exit` button sit in a separated vertical system-action column immediately left of the time diorama.
- In gameplay mode, the RD topic panel is a fixed-height left rail anchored to the top/left viewport edges above the player HUD. Save RD Settings lives in the panel title row; first-order and second-order RD tab strips stay fixed below the title row, and only the active tab content panel scrolls.
- The system-action column, time diorama, and activity/action buttons are right-anchored, leaving an expandable center cap for future stat blocks.
- The time diorama sits between the center cap and action buttons. Its speed controls are inside the top of the diorama and include `0x` real pause.
- The top side slot shows primary activity state or pathfinding travel planning.
- The bottom side slot shows Inspect overlay controls and the selected resource/layer bar.
- Primary activity buttons remain the main cancel/switch mechanism. Side panels should avoid duplicate cancel controls.
- Travel planning uses condition-bar projection overlays for resource/fatigue costs instead of spreadsheet-style numeric cost text.
