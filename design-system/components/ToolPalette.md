# ToolPalette

ToolPalette is the editor's vertical tool strip: one 32px icon button per tool, two to a row, one block per group.

## Use

- Each tool has its own colour (`tool-*`), shown as a 6px dot in the button's corner and as the active border. Never reuse a tool colour for another tool or for the area frame.
- Every tool on offer has its own button; nothing hides behind another button, a long press or a right click (B-030: the old one-button-per-group flyouts hid Cut, Wing, Water…). Groups are 2-column grid blocks with 4px between them; a variant of a tool (the tree brush's shape, the terrain operation) is picked in the options bar. A short editor scrolls the palette. It sits top left of the plan and of the 3D view: other boxes in the view (vertex and measure keyboard access) go top right.
- Active: `wash-on` fill and a border in the tool colour. Hover: `wash-hover`.
- `.psep` hairlines separate outdoor, indoor and measuring groups.
- Icons are 20px outlines (the `size` input, used at 18px only in Views Options) on a 24 grid, stroke 1.7, round caps, in `currentColor` (see the Icons assets).
- It shares one stacking order with the options bar and the float boxes (`ui/stacking.ts`): whatever was opened or
  clicked last is on top.
- A `⠿` grip (`.tgrip`) at the top drags it anywhere in the editor; the place is remembered (`abando-float-palette`) and
  double-clicking the grip, or Reset UI, puts it back top-left.
- Tools that need a selected building (Merge, Cut, Wing) stay in the palette; picking one without a building says so in
  a toast instead of hiding.
- The Trees tools also offer hedge and bramble: a click places one editable living wall; the brush supports pen, square, circle and lasso placement as a single undo step.

## Consumer provides

The tool list (id, icon, name, colour, hint, group), the active tool (`.on`, `aria-pressed`), and on each button an `aria-label` with the tool's name and a `title` with its name and hint.

Source: `src/app/ui/studio/bando-editor.scss (.palette, .pg, .pbtn), tool-icon.ts`.
