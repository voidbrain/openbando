# Panel

Panel is the app's floating window: a translucent `panel` box with a draggable title bar, transparent (◐), tips on hover (?, `accent` while on), collapse (▾) and close (×, including Views; the bottom menu reopens Views) buttons, and projected content.

## Use

- Every tool of the app lives in a panel (Studio, Flights, Radio, Timeline...). The title is one or two words, set in `panel-title` (uppercase).
- Fill `panel` over `backdrop-filter: blur(6px)`, border `line`, `radius`, `shadow-panel`; body padding `space-8`.
- Collapsed (`.min`): only the title bar shows. Ghost: background and border go; only content marked `.keep` stays.
- Resizable panels add a bottom-left grip of two `dim` diagonal hairlines.
- A panel that shows eases in (0.7 s, fading up 18 px from scale 0.97; none with reduced motion).
- Panels that open at the same first place step 26 px aside (down, and right for right-anchored ones) for each one already there.
- Show / hide toggles in lists use the eye icons (`eye`, `eyeOff`, `eyeHalf` for a mixed section) from `tool-icon.ts`, `accent` when shown.

## Consumer provides

The title, the content, and (in the app) an id in `PANEL_BY_ID` with its anchor and default size. Position and size are remembered by `LayoutStore`. Flights defaults to the right below Video; opening their joint workspace places Flights below Video. Reset UI restores default positions and sizes while preserving which panels are open; after Hide all it restores the previously visible panels; the timeline retains its bottom anchor when flight panels open.

Source: `src/app/ui/panel/panel.ts`.

Chrome uses the shared indigo/purple surface tokens. Keep status colours unchanged and pair lime active fills with `accent-ink`; do not reintroduce literal green control backgrounds.
