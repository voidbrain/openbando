# Editor: Elements, modules, blocks and the library

Area notes for OpenBando ([index](../areas.md)); the editor is in three files: [Editor: layout, tools, selection, aids](editor.md) · [Editor: coordinates, outlines, water and ground, precision](editor-geometry.md). Read before you change this area; the rules and lessons here are as binding as AGENTS.md.

### Elements panel

- `core/elements.ts` holds the grouping (pure, tested): `treeZones` (single-linkage, 14 m: one brush stroke stays one zone), `columnGroups` (rows of one floor; stragglers "loose"), `stairsIn` (stairs / ramps inside a building and their floor), `convexHull`.
- `ui/studio/elements-box.ts` has two tabs: by category (buildings, structures, walls, columns per row, trees per zone) and as a tree (building → floor → doors & windows, interior walls, voids, column rows, stairs). Columns are never listed one by one. Rows emit `ElementGo`; `goTo` in the editor selects the building, opens the floor and selects the thing. Hovering a tree zone outlines it on the map (`zoneHover`), clicking keeps it (`zoneSel`, cleared by any other selection / Esc), "show tree zones" outlines all of them.

### Modules and the tree brush

- `core/modules.ts`: façade patterns (`doors` / `panels` / `store` = 2 lower-panel bays + 1 full-height door, repeated), column rows and the "industrial store" preset. They only write ordinary openings and columns, and replace what was there, so applying twice never stacks. AI ops: `set_facade`, `set_columns`, `industrial_store`.
- `core/scatter.ts`: random trees inside a pen strip / square / circle / lasso outline (dart throwing, seedable). One stroke = one undo step.
- Level 0 is labelled "G" in the UI (`levelName`), the others L1, L2 ...

### Blocks and the library

- `core/blocks.ts`: `BlockSpec` (params, content with `{ "$": key, mul, add }` references), `sanitizeBlock` (every block from a file, the catalogue or the AI goes through it), `placeBlock` (writes ordinary elements tagged `block: BlockRef`), `applyPattern`, `updateInstance` / `detachInstance` / `removeInstance`, `blockFrom` (selection → block). `core/shapes.ts`: primitives for the `shapes` structure kind, capped, with colliders.
- The catalogue lives in `library/blocks/*.json` (see `library/README.md`); `tools/build-catalog.mjs` writes `public/library/catalog.json`, and `core/catalog.spec.ts` imports it and checks every block. Add a block = a file + a version bump when changing one.
- `LibraryStore` (IndexedDB, localStorage fallback in tests) is loaded by an app initializer before anything reads it. `SiteLibraryService` and `BlockLibraryService` read it synchronously from memory. The pilot's own blocks are `local/…` and are never touched by a sync.
- The Library panel (`ui/studio/blocks-box.ts`, button "▦ Library") arms a placement (`armed` in the editor: the next click on the map places it, Esc stops); patterns apply to the selected building's current floor.

### Library groups, gates, living fences

- `core/catalog.ts` `BLOCK_CATEGORIES` / `blockCategory` / `groupBlocks`: the Library is grouped by the blocks' tags (FPV gates and poles, lines, vegetation, vehicles, street, yard, towers, industrial, ruins; then buildings, patterns, other). A new catalogue block needs a tag a group knows. Rows show the block's size (`three/block-size.ts`, measured once from the built model and cached by id + version).
- The Gates tool (group `fpv`, colour `tool-gate`) places any FPV-group block on a click, turned by the options' "turn"; it is a shortcut over `blocks.place`, the result is an ordinary placed block.
- Fence materials with a `look` (`core/fences.ts`): `hedge` / `bramble` are lumpy living walls (`hedgeLumps`), `wires` is a phone / power line, poles every `post` m with sagging wires between them (`wireSag`); `buildLine` in `site-model.ts` draws both, with colliders (the wires as short boxes). The `bush` block is the single shrub.
