# OpenBando design system

How the app looks and talks. Read this before changing UI (templates, component styles, `src/styles.scss`, user-facing
text). The values live in code: CSS custom properties in `src/styles.scss` (`:root`) and the tool colours in `tools` in
`src/app/ui/studio/bando-editor.scss`. `tokens.json` names every value (including the literal hex values the component styles
still use) with where it is used; `components/*.md` are the guidelines per component, each naming its source file.

Published copy (for browsing, may lag behind this folder): https://claude.ai/artifact/MH32oVjF7EmKTFnSmP7YoC

OpenBando is a dark, dense instrument for FPV pilots: a 3D map and site editor, a flight log player and a simulator, built from floating panels over a live 3D stage. The interface stays quiet so the map, the video and the flight path carry the colour. Deep indigo and dark purple surfaces replace the green chrome. The existing acid-lime accent marks what is active; every editing tool owns a distinct hue.

## Documentation ownership

This guide governs application UI; [Backlog rules](../docs/BACKLOG-RULES.md) governs repository tracking. Backlog status/priority emoji are documentation cues, not app icons, so the UI no-emoji rule does not prohibit them. Component guides refine the general rules; explicit scoped exceptions below must remain consistent with their component guide. User instructions take precedence. README describes capabilities; AGENTS directs implementation; the active backlog records current evidence and remaining work. Archives/audits are dated history, and generated guides follow their source generator.

## Content fundamentals

- **Voice: a terse field manual.** Short imperatives addressed to the pilot, no "we", no exclamation marks, no emoji. Real hints: "Drag a rectangle on the map; it snaps flush to close neighbours unless auto-align is off", "Click a wall of this floor".
- **Sentence case** for buttons, labels and hints ("Add floor above", "Clear all"). UPPERCASE only through the `panel-title`, `caption` and `section-label` styles, never typed in capitals.
- **Join clauses with " · "** in hints, readouts and secondary lines: "3 fl · 42×18 m", "14.20 m · 90°".
- **Units are metric and always shown:** m, km/h, °. Put units in field labels ("Height (m)"), not in inputs.
- **Floors** are named −1 for the basement, G for level 0, then L1, L2….
- **Languages.** The interface is written in English and translated through `src/app/i18n/<lang>.ts`; Italian keeps the same voice: short, direct, "tu", no exclamation marks. "Bando" is not translated.
- **Credit the data where it shows**: map data © OpenStreetMap contributors on the map; the satellite imagery's credit (`SAT_ATTRIBUTION`) at the bottom right of the 3D view while the satellite ground is on, small `text` on a dark wash, never translated.
- **Say what happened, then what to do.** "Map data is busy (too many requests). Try again in a minute." An AI edit is reported from what actually changed ("3 changes applied"), never from the model's own reply.

## Visual foundations

### Colour

- Dark only (`color-scheme: dark`). Page on `bg`; panels on `panel` (94% opaque over a 6px blur); anything floating over the map that must stay legible on `panel-solid`.
- Text in `text`; secondary text, captions, labels and counts in `dim`.
- `accent` is the only brand hue in chrome. Use it for the active state (`.btn.on`, selected segment, selected row border), the one primary action, links and success text. Anything filled with `accent` carries `accent-ink` text. Every enabled `.btn` hover pairs dark `control-hover` with light `text`, irrespective of variant. Always change fill and foreground as a pair.
- `warn` for problems the pilot can act on (errors, the readout's warning, notice borders). `danger` / `danger-fill` / `danger-line` / `danger-text` for destructive commands, with explicit existing exceptions: red north navigation in CameraCompass and reddish selected measures in Readout. These exceptions do not make navigation or selection destructive.
- Every editing tool has its own `tool-*` colour, used for its palette dot, its active border and the shapes it draws on the plan. Never reuse a tool colour for another tool or for the area frame (accent, dashed, with the `rotate-knob` yellow knob). Unselected measures use `tool-measure` cyan; selected lines and labels use the existing reddish selection treatment described in Readout.
- Hover and active states on transparent buttons are white washes (`wash-hover`, `wash-on`, `wash-menu`), not new colours.

### Type

- System UI faces only: `sans` for the interface, `mono` for telemetry. No webfonts.
- `body` 12px / 1.4 is the base: the UI is dense on purpose. `small` 11px for labels and counts.
- Headings are small uppercase labels, not big type: `panel-title` (11px, 600, 0.04em) for window titles, `caption` (h4, 11px 600, 0.06em, dim) for groups, `section-label` (10px, 0.06em, dim) for inspector sections and menu heads.
- Numbers that move (OSD, readouts, the version) are `mono` 600: `osd`, `readout`, `badge`.

### Spacing and layout

- A 2–12px scale: `space-2` inside palettes, `space-4` toolbars, `space-6` the default row gap, `space-8` panel padding, `space-10` / `space-12` for overlays. Exact values from the code, not a 4px grid (button padding is 4 × 9px, inputs 3 × 6px).
- Panels float over the full-screen stage and remember their place and size. Inside the editor, map controls are pinned 8px from the edges: palette top-left, options bar to its right, compass bottom-left, readout bottom-centre.
- Inspector fields go two to a row (`.sec`); sections are divided by a `line` rule, not by cards.

### Borders, radii, shadows

- Every edge is a 1px `line` border. Separators are 1px `line` (`.sep`, `.psep`).
- Radii step down with size: `radius` 10px panels, `radius-menu` 9px palettes and menus, `radius-box` 8px float boxes and toasts, `radius-btn` 7px buttons, `radius-control` 6px inputs and rows, `radius-thumb` 5px, `radius-knob` 3px.
- Shadows only on things that float: `shadow-panel`, `shadow-box`, `shadow-menu`. Nothing inside a panel has a shadow.
- Plan overlays use dashed strokes (6 4 or 8 5) for previews and measures, solid for what exists.

### States and motion

- Hover: one step lighter (`control-hover`) or a white wash. Disabled: 45% opacity. Selected: `accent` border or fill.
- Motion is functional only: a panel's 0.7s fade and rise when it opens (where it appears is where it stays), the toast's 0.2s rise and fade, the 0.8s spinner, and the guided tour's cursor, click ring and target outline (they show where the action is). Decorative animation is confined to Welcome: the mascot loop has a reduced-motion still and no pause control, while Build/Fly/Share cards use their scoped muted films. Do not add decorative motion to editing or flight instruments.
- Focus: the app relies on the browser's default focus ring today. New work should give interactive elements a visible 2px `accent` outline (about 11:1 on `panel-solid`) so it meets WCAG AA.

### Layering

`zIndex` tokens fix the stack over the map: overlay 700, palette 900, flyouts 950, map UI 1100, float boxes 1200, context menu 1300, toast and version badge on top.

## Iconography

- Tool icons are the app's own: plain outlines on a 24 × 24 grid, drawn at 20px, stroke 1.7, round caps and joins, `currentColor`. Dashed strokes (2.5 2.5) mean "area" or "to be added"; small filled dots mean trees or points. They are `TOOL_ICONS` in `src/app/ui/studio/tool-icon.ts`, drawn by `<app-tool-icon name="…">`; a new tool gets a new entry there.
- Window chrome uses Unicode glyphs, not icons: ⠿ grip, ▾ / ▸ collapse, ◐ transparent, ▲ structure.
- No emoji or icon font. The Welcome pixel mascot and approved wordmark are decorative illustration exceptions; see `docs/mascot/README.md`.

## Logo

Welcome uses the approved transparent pixel-art OPENBANDO wordmark next to the pixel mascot; instrument/window titles retain the existing small type. Follow the wordmark guide in `docs/mascot/wordmark-style-guide.md`.

## Components

Guidelines per component in `components/`: WelcomePanel, Button, SegmentedControl, FormControls, InspectorSection, Panel, FloatBox,
ToolPalette, OptionsBar, PickMenu, BlocksPanel, ContextMenu, Readout, Notice, Toast, Spinner, ElementsList, VersionBadge, RacingControls. Reuse these (the global
classes in `src/styles.scss`, `app-panel`, `app-float-box`) before inventing a new control. In the app the elements-list row
is `.row` scoped to `ElementsBox`; the guideline calls it `.el-row` to keep it apart from the global `.row`.

## Keeping it in step

- A new colour, radius or shadow: prefer an existing token. If one is really needed, add it to `:root` in
  `src/styles.scss` AND to `tokens.json` (name, value, usage) in the same change.
- A new tool: its colour goes in `tools` and in `tokens.json` as `tool-<id>`, distinct from every other tool and the accent.
- A new or changed shared component: update its `components/<Name>.md` (or add one).
- New user-facing text: its Italian goes in `src/app/i18n/it.ts`; a control the guided tour uses keeps its `data-tour` mark.
- Text on a fill keeps 4.5:1 contrast (3:1 for icons, borders and focus rings), as `AGENTS.md` requires.

The main 3D view and the editor 3D view each show the same fixed north compass overlay (`app-camera-compass`) using existing surface and text tokens; it rotates with the camera. North is red; click resets the camera north, drag rotates it, and arrow keys turn it in five-degree steps.

The accepted indigo/purple chrome palette (28 October 2026) preserves warning, danger, success, telemetry, pilot and tool colours. Button and field surfaces use shared `control`, `control-hover` and `field` tokens; active/primary fills keep `accent-ink`. Artwork and world materials are outside the chrome theme.

## Contrast and readability in every state

Treat foreground and background as a pair for every surface: text, links, inputs, selects, textareas, tabs, menus, summaries, badges, notices and controls, not only buttons. Dark `accent-ink` belongs only on the light `accent` fill; dark surfaces use `text` or `dim`. Preserve semantic colours, and check their actual background. Hover, keyboard focus, active, selected, expanded and validation states must retain readable text and a visible focus indicator. Do not apply a blanket white-text override that erases status/tool meanings.

Require WCAG AA text contrast (4.5:1 for ordinary text; 3:1 only for qualifying large text), and 3:1 for meaningful control/focus graphics. Keep text labels and units, usable wrapping/scrolling and the existing typography rules: contrast alone does not establish overall readability. Disabled controls are exempt from contrast requirements, but must remain distinguishable.

`npm run check:contrast` checks shared text/surface pairs (including translucent fills over black and white) and CSS/token-catalog agreement in CI. Page-wide axe covers visible labels, notices and text; `e2e/contrast.ts` probes representative rendered control styles on hover and keyboard focus. Browser-specific, canvas/video and visual readability limits still require their named checks; these tests do not prove every possible content/state combination.

