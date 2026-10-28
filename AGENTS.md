You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Project conventions (OpenBando)

The app is **OpenBando** (tagline "Build, Fly, Share."). The repository is `voidbrain/openbando`, the Angular project
`openbando` and the site lives at `https://voidbrain.github.io/openbando/` (`baseHref` in `angular.json`; the deploy workflow uploads `dist/openbando/browser`).

### Architecture

- `core/` is plain TypeScript with no Angular imports: keep it that way so it stays unit-testable. Put logic there, keep
  components thin. `three/` builds Three.js objects from the spec; `services/` and `state/` hold signals; `ui/` is templates.
- The **spec is the source of truth** (`core/site-spec.ts`). The 3D model, the plan overlay, the inspector preview and the
  AI context are all derived from it. Edit the spec through `SiteEditor` (`commitSite` = one undo step; `beginGesture` +
  `live` for drags) and then `SiteService.applyDraft()` to rebuild the 3D scene.
- Coordinates: x east, z south, y up, metres. Building-local frames differ by element (see README, "Data and units"); mixing
  the min-corner frame (partitions, voids, columns) with the centred frame (openings of shaped buildings, footprints) is the
  usual source of bugs. Convert in one place and test it.
- Every wall builder must add `level.baseY`. A new geometry builder needs a collider: the collider only knows axis-aligned
  boxes and vertical cylinders (ground based); cut long or rotated parts into short boxes.

### Design system

- Before any UI change (templates, styles, user-facing text) read [design-system/README.md](design-system/README.md) and the
  guideline of the component you touch in `design-system/components/`. Follow its colours, type styles, spacing, radii and
  voice; use `var(--…)` tokens from `src/styles.scss`, never a new literal colour.
- A new token, tool colour or shared component updates `design-system/` in the same change (see "Keeping it in step" there).

### Adding things

- **A structure kind**: add it to `StructureKind` and `STRUCTURE_DEFAULTS` / `RECT_KINDS` (`three/structures.ts`), build it
  in `buildStructure` (geometry + collider), list it in `structKinds` (`ui/studio/bando-editor.ts`) and draw its plan symbol in `bando-editor.html`,
  add it to `STRUCTURE_KINDS` in `core/ai-commands.ts` if the assistant may place it, optionally map an OSM tag in
  `GeoService.areaData`. Add a case to `three/structures.spec.ts`.
- **An AI command**: add the op to `OPS`, fields to `AiCommand` + `normalizeCommands` (clamp every number), a `case` in
  `runCommands`, the property to `AI_SCHEMA`, a line (and ideally an example) to `SYSTEM_PROMPT`. Cover it in
  `core/ai-commands.spec.ts`. The model's `reply` is only a claim: report from `RunResult`.
- **A spec field**: add it to the type, keep `sanitizeSpec` (it rebuilds the object) and `cloneSpec` (JSON) in step, and
  make old saved specs load (optional field with a default).

### Checks before you finish

```bash
npx ng test --watch=false
npx ng build
npx tsc -p tsconfig.app.json --noEmit --noUnusedLocals --noUnusedParameters
npx tsc -p tools/examples/tsconfig.json   # the example-bando script
npx tsc -p tools/i18n/tsconfig.json       # the translation check
npm run check:i18n                        # every UI text has its Italian
```

- `npm run e2e` (Playwright, also a CI job): every guide step plays alone in a headless browser without errors, and the first visit, the editor with the library and a running guide step pass axe (WCAG 2.1 A / AA). Locate panels by `app-panel[data-id=…]` or by role: component hosts have no box of their own. Software WebGL is slow there: keep the long timeouts.
- A test that fails because the code changed is stale: fix the test deliberately and say why. Tests that encoded the old
  demo site now set their site up explicitly (origin, take-off pad).
- Keep logic in `core/` where possible. Playwright covers selected UI and pointer workflows, but coverage is not exhaustive.
- Do not leave dead code behind when replacing a feature: a panel removed means its store, helpers and tests go too.

### Testing the joins

- Two bugs reached the live site although every unit had tests: flights on generated bandos were turned 90° (the map's projection and the flight's were each right, but the default alignment between them was not), and a timeline click was undone while the video played (seek and video clock each worked alone). A change that touches how two parts meet gets a test across both: `calibration-default.spec.ts` (a GPS fix lands where the map puts the same point), the seek-with-a-playing-video case in `services.spec.ts`.
- Test coordinates are neutral (Milan centre, 45.4642, 9.1900, or open sea at 1°N 1°E for flights). Never use a real bando's place, and never the private one's (see Sharing bandos). The map starts at Milan centre (`DEFAULT_START`) until the pilot searches.
- Typed coordinates are parsed locally (`parseLatLon`) and never sent to the geocoder: a bando's coordinates are the pilot's secret.

### Known pitfalls

- Angular signals in `effect()` that write other signals are fine in v22, but wrap reads you do not want tracked in
  `untracked()`.
- WebGL canvases (inspector preview, 3D editor view) skip rendering while hidden; they must not be assumed to exist in tests
  (the scene builders are testable without a renderer).
- Overpass answers 429 / 500 without CORS headers: do not treat the browser's "access control" error as a code bug.
- Never claim an AI edit worked from the model's own words.
- `SiteService.applySpec` re-applies the calibration every time (Save, every edit). The pilot's own alignment (pins, compass)
  therefore lives in `SiteSpec.calibration`; an effect in `SiteService` copies live changes into the spec. Do not set the
  calibration anywhere without going through the store, or it will be undone on the next edit.
- The flight view and the 3D editor build the site with `{ merge: true }` (`three/merge.ts`): each building, its roof and each structure become one mesh per material (Chiari: 1,217 meshes → under 100). Transparent and instanced meshes stay apart, and so does any mesh with its own `userData.pick` (columns, partitions: the editor clicks them one by one); the x-ray fades the merged mesh, the collider is unchanged. Previews (`bare`) are not merged.
- Meshes that can be clicked in the 3D editor carry `userData.pick` (`{ kind, id | i }`); keep it when adding a new builder.

## Editor layout
- `ui/studio/bando-editor.ts` is the shell (selection, pointer gestures, map, context menu); its template and styles are `bando-editor.html` / `.scss`.
- Tool controllers live in `ui/studio/editor/`: plain classes handed an `EditorHost` (the draft, pick, drag, scale, ground and a few actions). `LayerTool` (Road / Surface / Water), `UndergroundTool` (Tunnel), `TerrainTool` (brushes, contours, height map), `MeasureTool`, `BlockTool` (library box, armed block, patterns, the selected placement), `ToolbarDock` (palette and options bar: dragged places, stacking). The template reaches them as `layers.…`, `under.…`, `terrain.…`, `measure.…`, `blocks.…`, `dock.…`. Their pure parts are in `core/` (`layerShape`, `pathLength`, `newRoom`, `sectionDrawing`, `cutCellsPath`, `brushStroke`, `heightPixels`, `chainClick`, `shiftEnds`, `measureLabel`, `placedHead`; `palettePlace` / `optionsPlace` next to the dock) and tested. A new tool with its own options gets a controller there.

## Modules and the tree brush
- `core/modules.ts`: façade patterns (`doors` / `panels` / `store` = 2 lower-panel bays + 1 full-height door, repeated), column rows and the "industrial store" preset. They only write ordinary openings and columns, and replace what was there, so applying twice never stacks. AI ops: `set_facade`, `set_columns`, `industrial_store`.
- `core/scatter.ts`: random trees inside a pen strip / square / circle / lasso outline (dart throwing, seedable). One stroke = one undo step.
- Level 0 is labelled "G" in the UI (`levelName`), the others L1, L2 ...

## Aids, measures, review
- `core/align.ts`: `snapBeside` / `autoAlign` put a (new or merging) building flush against close neighbours (closes gaps up to 3 m, straightens angles up to 10°, lines up almost-aligned edges). `mergeBuildings` uses it first and restores the building if the merge fails.
- `core/measure.ts`: magnet targets (corners, wall middles, columns, trees, structures, wall ends, other measures), axis straightening and the angle between measures that share a point. The editor keeps the measures (cyan, `meas`): every click continues the chain (B of one is A of the next; the same point twice, Esc, a right click or closing on the chain's start ends it). A line click selects (`measSel`) and drags it, the white knobs move one end (measures sharing the point follow), Delete / the Delete button removes the selection, Clear all removes everything. Angles between measures sharing a point are drawn as a filled arc with the value inside (`arcOf`). The area frame stays yellow.
- Area frame: `half` + `off` (centre offset in the frame's own axes) + `rot`. Dragging an edge moves only that edge. `ZoneSpec.rotDeg` is carried to `GeoService.areaData`, which asks for the bounding box and keeps only what is inside the turned rectangle.
- Columns: `colSet` (+ primary pick) is the selection; `duplicateColumns` copies it as a module, `fillModule` continues its lattice over the floor. Dragging on the empty floor with Select rubber-bands them (Shift adds); there is no separate pick tool.
- `AiService.changes`: one entry per command that changed something, with a link (`show`) that selects the building, opens the floor and flies the map there, a reviewed flag and `acceptAll`.
- `ui/studio/elements-box.ts`: list of all elements with outline thumbnails; trees are grouped in 60 m cells.

## Tool palette, modules, picking, menus
- The 2D/3D editor has a vertical tool palette. `tools` in `bando-editor.ts` lists every tool with an icon key (`ui/studio/tool-icon.ts`, plain SVG strokes on a 24 grid), a colour (`tc(id)`; never reuse a colour between tools or with the area frame) and a `group`. The palette shows ONE button per group (the active tool of the group, else the last used); the others are in a flyout opened by the corner mark, a long press or a right click (`groups`, `pickEntry`, `fly`). The tree brush is expanded to four entries (pen / square / circle / lasso) in the Trees group. Tool options show in the `.opts` chip bar. A new tool = a `tools` entry + an icon + (maybe) a group.
- Select is the default tool: click selects, drag on empty floor = marquee (columns indoors), drag on the map = pan.
- Right click opens a context menu (`onContext` / `ctxItems`) built from what is under the pointer: hit elements carry `data-pk="kind:id"`; no `data-pk` = the ground. A capture-phase listener drops right-button `pointerdown`s so a right click can never start a drag, and `move()` ends any drag whose mouse button is no longer down.
- Repeatable blocks live in the Modules section (columns rows, façade pattern, bay). "Main store preset" (`applyStore`: 4 rows at `storeRows`, a quarter in from each long wall and a close pair in the middle, under the valleys of a four-barrel roof; a column every third pier unless a step is given; `ColumnOpts.cross` puts rows anywhere) is only a shortcut composing those blocks; it is not applied to every building.
- Floors: clicking a floor button (`pickLevel`) sets `floorFocus`: the inspector preview and the 3D view (`SiteView.focus` → `focusFloor`) show that floor solid and the rest of the building ghosted; clicking it again, or selecting another building, clears it. Indoor mode always focuses the edited floor.
- 3D picks: columns and partitions carry `userData.pick` (`SitePick` kinds `column`/`wall`); the inspector preview forwards clicks through `onPick`.
- Inspector: sections (`.sec`, caption `.st`, fields `.fld` two to a row). `FloatBox` has `right` (default x measured from the right edge). Remember: Angular's emulated encapsulation does not apply a component's CSS to projected content, so layout CSS for projected children lives in the component that owns them.
- Lesson: `buildSide` in `site-model.ts` once built wall segments too long when a side had 2+ openings (walls reached neighbouring buildings). Covered by "walls with several openings stay inside the building outline".
- Building fixtures (`BuildingSpec.fixtures`): structures in the building's own frame (a roof ladder, a chimney on it). `fixturesInSite` turns them into site structures when the scene is built; they move, turn and are deleted with the building, show in its inspector preview, and a click on one selects the building. Use them for anything that belongs to a building rather than to the site.
- Greenhouses: `BuildingSpec.glass === false` leaves only the steel skeleton (no glass, no roof colliders: it can be flown through); inspector "glass".
- Building pads (`flattenPad`) are levelled to the median ground height under the footprint, and the ground blends to them over 2–15 m depending on the slope they absorb (the lowest height buried long buildings on a slope at their high end).
- Barrel vaults are closed at both ends by a half-ellipse wall in the building's colour (`vaultEnd`), where that end wall exists (an open side, like a colonnade, stays open).
- Lesson: panel height must be bound as `[style.height.px]`; a unit-less `[style.height]` is ignored.
- Lesson: in an `effect`, read the signal BEFORE any `if (renderer)` guard (`const on = this.spin(); if (r) r.spin = on`); a signal read behind a false guard is never tracked and the effect never re-runs.
- Views panel: foldable sections like the inspector (remembered in `abando-float-views-closed`, reopened by Reset UI): Main page, 3D camera (icon buttons: the four cameras; Follow, which means Orbit & Top follow the drone or Chase & FPV follow the replay depending on the camera; hide roofs; X-ray; reset camera), then the panels grouped by work (`PanelDef.group`; telemetry split by `PanelDef.sub` into Controls and Views). An eye toggles one panel, the eye on a section all of them (half eye when mixed). Show all / Hide all / Reset UI are the three icons at the top; they never hide Views itself. "Collisions" lives in the Simulator panel.
- Panels opened at the same first place step aside by `CASCADE_STEP` (`cascadeIndex` in `ui/panel-defs.ts`, applied in `Panel.at`), right anchors towards the edge, so a new one never covers the last exactly.
- Layout: the studio panel defaults to 760 × 540; "Reset UI" clears all remembered sizes. Showing a panel (`LayoutStore.setVisible/toggle`) also raises it.
- Patches: when diffing a working copy, exclude `node_modules` (a symlink there gets into the diff and breaks `git apply` on a real folder).

## Elements panel
- `core/elements.ts` holds the grouping (pure, tested): `treeZones` (single-linkage, 14 m: one brush stroke stays one zone), `columnGroups` (rows of one floor; stragglers "loose"), `stairsIn` (stairs / ramps inside a building and their floor), `convexHull`.
- `ui/studio/elements-box.ts` has two tabs: by category (buildings, structures, walls, columns per row, trees per zone) and as a tree (building → floor → doors & windows, interior walls, voids, column rows, stairs). Columns are never listed one by one. Rows emit `ElementGo`; `goTo` in the editor selects the building, opens the floor and selects the thing. Hovering a tree zone outlines it on the map (`zoneHover`), clicking keeps it (`zoneSel`, cleared by any other selection / Esc), "show tree zones" outlines all of them.

## Selection, pickers, toolbars, areas
- Selection: Shift-click adds trees / columns; a drag selects with a box or a lasso (`selShape`, Select options): indoors on the floor (columns), outdoors with Shift held (trees; `shiftHeld` makes the plan take the pointer, Leaflet box-zoom is off). `pointsInside` / `columnsInLine` (`core/elements.ts`) do the hits; a column's row / line / "all alike" is in the inspector, the context menu and on double-click. `treeSet` is cleared whenever the pick is not a tree.
- Option choices between kinds of things use `PickMenu` (`ui/studio/pick-menu.ts`) with tool-icon pictures. Tree species for new trees: broadleaf / conifer / mixed (`treeMix`); more species belong in the shared library. Fence materials: `core/fences.ts` (`WallSpec.material`, absent = masonry; posts and a see-through mesh for chain-link in `site-model.ts`).
- The palette and the options bar are draggable by their `⠿` grip (positions in `abando-float-palette` / `-opts`, cleared by Reset UI through `uiResets`). The options bar sits beside the active tool's button unless dragged. They share one stacking order with the float boxes (`ui/stacking.ts` `raiseZ`): the last opened or clicked is on top; context menus are z 9000.
- Magnet (Select options): moving a building runs `autoAlign` live (reach ~16 px), rotating sticks to neighbours' and the map's axes (`magnetAngle`); Alt drags freely. The outline turns cyan while it holds.
- Toasts render in `app-toast-host`, last in the app root: a toast inside `position: fixed` stage was trapped under the panels.
- Several map areas (`StudioService.areas`, "Add area"): one Overpass request for `boundingZone`, then `keepInsideAreas` unless "fill the gaps". Stored as `SiteSpec.areas` / `fillGaps`. Pinned outlines need their own Leaflet renderer created at init (a lazily created one clipped the first outline away).

## Terrain
- `core/terrain.ts`: the height grid (`TerrainSpec`: cell, half, base, strokes). The base heights are NOT in the spec (it is JSON-cloned on every edit): `setTerrainBase(key, heights)` registers them; `ElevationService` downloads (AWS terrarium tiles), caches them in IndexedDB and re-registers them when a saved bando opens.
- `core/site-ground.ts` `siteGround(spec)` is the one place the ground is built, in order: base + strokes (edges feathered to 0 only when there is no real ground; real ground keeps its heights, and `heightAt` continues the nearest edge outside the grid, drawn by `skirtMesh`) → water basins dug → roads levelled across → building / take-off pads levelled → underground cut mask. It is memoised on its inputs; everything (3D model, collider, editor contours, height readout, flight paths through `activeGround`) reads it. A spec without `terrain` is flat at y = 0 unless underground volumes or basements require an automatically generated flat terrain for cuts.
- OSM ways can come back with null points where they cross the query box: `areaData` drops them first.
- `core/layers.ts`: roads (`RoadSpec`, centre lines), surfaces, water; `sanitizeLayers` checks them and migrates old road pads. All roads are levelled together in ONE pass (`levelRoads`; `levelRoad` is the single-road wrapper): every cell takes the height of the nearest point of the nearest road, sampled from the untouched grid — levelling one road after the other used to carve a zig-zag trough where two crossed. `core/underground.ts`: `cutMask` flags vertices within the footprint (including a half-cell border) where `floor < ground <= ceiling`, then fills each connected band's grid bounding box clipped to that footprint. Ceiling equality is essential for basement pads; ground above the ceiling stays intact. Portal alignment still needs visual review on slopes. `floorUnder` gives the floor inside one; the collider's `groundAt(x, z, y)` uses it, so physics passes the drone's y.
- A new element that stands on the ground lifts its mesh AND its collider boxes by `ground.at(...)` (see `liftSolids`, `liftCylinder`).
- Editor: Terrain group (Sculpt + 7 brushes + Tunnel), Layers group (Road, Surface, Water). One drag = one undo step; layers and tunnels create a flat terrain when the bando has none.
- Sculpt (the default terrain brush, Populous-style): hold the left button to raise, the right one to lower; the stroke grows while held (`sculptStroke`: strength = speed × seconds, radius +⅓ a second, up to ×4), moving past half the radius starts a new stroke there. It is a gesture of plain raise / lower strokes (no new stroke kind in the spec); the right button is let through and the context menu skipped while it is armed. Drawing a ramp, hill, crater or flatten shows construction lines (`TerrainTool.guide`, `rampGuide`): the ramp's band, arrow, rise, length and slope; the stamp's circle and height; the flatten level.

## Blocks and the library
- `core/blocks.ts`: `BlockSpec` (params, content with `{ "$": key, mul, add }` references), `sanitizeBlock` (every block from a file, the catalogue or the AI goes through it), `placeBlock` (writes ordinary elements tagged `block: BlockRef`), `applyPattern`, `updateInstance` / `detachInstance` / `removeInstance`, `blockFrom` (selection → block). `core/shapes.ts`: primitives for the `shapes` structure kind, capped, with colliders.
- The catalogue lives in `library/blocks/*.json` (see `library/README.md`); `tools/build-catalog.mjs` writes `public/library/catalog.json`, and `core/catalog.spec.ts` imports it and checks every block. Add a block = a file + a version bump when changing one.
- `LibraryStore` (IndexedDB, localStorage fallback in tests) is loaded by an app initializer before anything reads it. `SiteLibraryService` and `BlockLibraryService` read it synchronously from memory. The pilot's own blocks are `local/…` and are never touched by a sync.
- The Library panel (`ui/studio/blocks-box.ts`, button "▦ Library") arms a placement (`armed` in the editor: the next click on the map places it, Esc stops); patterns apply to the selected building's current floor.

## Sharing bandos
- `core/share.ts` `shareCopy(spec, 'exact' | 'hidden', heights)`: a hidden copy drops the zone, areas, GPS landmarks, the pilot's calibration and the datum, puts the origin at 0, 0 and carries its real ground as `terrain.base.data` (Int16 decimetres, base64, source `embedded`). A bando whose place is already hidden is always exported hidden. Export: each card of the Bandos list has Export (follows the bando) and, for a placed bando, Export hidden (`SiteService.exportShared`). The old `'rounded'` (~1 km) option is gone; saved specs with it open as hidden.
- Backup: "Back up all" / "Restore…" in the Bandos list (`BackupService`, pure part `core/backup.ts`, tested): one file with every bando (and its save time) and the pilot's own blocks; embedded ground travels inside. Restore adds missing bandos, replaces an older copy, keeps a newer one; own blocks keep the higher version.
- Import (`SiteService.importJson`) moves `data` out of the spec into the elevation cache (`cacheBase`): the spec is JSON-cloned on every edit, a 1 MB string in it would slow every drag. A clashing id gets a new one; the import is saved.
- `spec.privacy === 'hidden'`: no map under the editor (the map controls are replaced by "no map · place hidden"), no Area mode, no map data. Names that came from OSM carry `nameFromMap` (buildings, structures): a hidden copy replaces them with plain names, and always renames bridges and steps (they bear road names). The example `library/bandos/villetta-no-place.json` is such a copy, made with the app's own export (its ground is embedded). Villetta's place is private: its public example, its map data and survey points are not in the repository (only in the maintainer's local backup); do not add coordinates of it anywhere (tests, tour, tools).
- Pins: pinning the start slides the path; pinning the end turns it about its start when the start is fixed (`SceneService.startFixed`: pinned, or a bando without its place, whose flights start on the take-off pad), else slides it. `rotateCalibrationAbout` / `turnTowards` (`core/geo.ts`) do the turn; the result is the pilot's calibration, saved in the bando.
- With `privacy` set and no pilot calibration yet, the next loaded flight is shifted so its first fix lands on the take-off pad (`autoAlignFlights`, once).
- The inspector's Modules section lists the library's pattern blocks (`kind: 'pattern'`); there are no hard-coded presets any more. The catalogue syncs in the background at start-up.
- Basements use separate `BuildingSpec.basement` data and `basementVolume` (core/underground.ts), added to `SiteGround.vols` for terrain cuts and floor collision. The −1 floor is editable in 2D and 3D indoor mode; its outline vertices are editable in 2D and 3D. See `docs/BACKLOG.md` for current limitations and known defects.
- Ground styles: `SiteModel.setGroundStyle('natural' | 'height' | 'wire')` recolours the terrain mesh from `heightColor` / toggles wireframe; the editor's "ground" picker also draws the height map under the 2D plan. The 3D editor view reports `hover` ground points in draw mode (height readout, `SiteViewRenderer.setCursor` brush ring).
- `SiteEditor.canUndo / canRedo` read the draft signal on purpose: the history lists are plain arrays. Each history step keeps the selected building too: undo / redo bring the selection back, never one that no longer exists.
- Storage: `LibraryStore.health` counts writes the browser refused (IndexedDB errors and aborts, localStorage quota) and says why (`storageProblem`); the app tells the pilot once per kind, and the Bandos panel shows the way out (Back up all). Never swallow a failed write silently.
- `tools/ai-proxy.php` refuses to run with the placeholder or a short token (`OPENBANDO_AI_TOKEN` / `OPENBANDO_AI_KEY` can come from the environment).
- Deploy runs fast CI checks first (`workflow_call` with `e2e: false`: unit, types, translations, examples, build). Pull requests run the complete Playwright suite in four shards and the focused racing/editor job. Browser tests do not block the deploy workflow directly; the full PR #124 browser suite passed on 28 October (see `docs/BACKLOG.md` for evidence and remaining checks).

## Ruins, example bandos
- `BuildingSpec.ruin` (0..1, absent = intact) is a property, not a kind (`core/ruin.ts`). The roof goes first: `roofRuns` / `roofCells` leave holes in gable, vault and flat roofs (each kept part has its own collider, so the holes can be flown through), gone from `ROOFLESS` (0.6); upper slabs go from `NO_SLABS` (0.75). Once the building is open to the sky (past `ROOFLESS`, or `roofless`), each wall loses its upper part along one smooth broken line over the whole building height (`wallTop`, seeded per wall; `wallPieces` cuts each stretch to it) and never has holes lower down. `BuildingSpec.ruinWalls` gives single walls of a rectangle their own level (local sides n/s/e/w; inspector "ruin by wall", AI `set_ruin` with `side`). `BuildingSpec.roofless` makes an open shell at any level; `crenels` adds battlements, none where a wall's top has fallen. Inspector: "ruined %", "open shell", "battlements"; AI: `set_ruin` (ruin percent, roofless, crenels).
- `playground.json` (Playground) is a made-up place built entirely by its section of `build-examples.ts`: hidden, origin 0, 0, ground from brush strokes only (no `terrain.base`), a tunnel, a basement under a floor hole, ruins, seeded trees, and every catalogue block (the script throws if one is unused, so a new block needs a spot there). `core/examples.spec.ts` checks it.
- Example bandos are generated: `npm run examples` (`tools/examples/build-examples.ts`, inputs in `tools/examples/data/`) rebuilds `library/bandos/*.json` byte for byte (ids are renumbered stably), and CI fails when they differ. Change the script, never the JSON.
- Examples carry a `release` (raise it when an example changes in a way its copies should hear about; `finish(…, release)` in the builder, by hand for `villetta-no-place.json`). "Open a copy" stamps the copy with `derivedFrom: { example, release }`; the Bandos list then says when a newer release is out and offers a fresh copy (`newerExample`). Copies are never changed under the pilot's edits.
- Example bandos live in `library/bandos/*.json` (a SiteSpec plus an `about` line); `tools/build-catalog.mjs` copies them to `public/library/bandos/` and lists them in `public/library/bandos.json`. The Bandos list offers them under Examples ("Open a copy" imports them like a file). The blocks they use (`abando/vault-shed`, `abando/sign-tower`, `abando/water-tower`, `abando/cage-ladder`, `abando/bridge`) are ordinary catalogue blocks. `core/examples.spec.ts` checks every published example loads.

## Languages
- The templates stay in English. `I18nService` (`services/i18n.service.ts`) rewrites what the page shows (text nodes, `title`, `placeholder`, `aria-label`) through a dictionary (`src/app/i18n/<lang>.ts`) with a MutationObserver, keeps the English to restore it, and skips `textarea`, `svg`, `[contenteditable]` and `[translate="no"]` (the chat, the pilot's own text). Choice: saved setting (`abando-lang`) → browser language → English; the flag next to the version badge changes it.
- `core/i18n.ts` (pure, tested): exact entries, `{0}` patterns (holes may move), and " · " lists translated part by part. New UI text: add its Italian to `i18n/it.ts`; `npm run check:i18n` (also in CI) lists what is missing: static template text, `title` / `aria-label` / `placeholder`, bound strings, toasts and `tr()`, checked with the app's own `translate()`. The app translates each text node on its own, so text split by an inline element (`Press <b>New</b>, then…`) needs a key per piece. Text that stays English on purpose goes in `tools/i18n/keep-english.txt`. Text built in code elsewhere is still only seen at run time (`I18nService.missing`). Native `confirm` / `prompt` text goes through `tr()`.
- The AI answers in the chosen language: `replyLanguage(lang)` is appended to `SYSTEM_PROMPT` and `BLOCK_PROMPT`; JSON keys and command names stay English.

## Guided tour and help
- `core/tour.ts` is the script: snippets (one feature each, beats = caption + actions: point, click, press, type, drag, wait, hook) grouped in sections, and tours made of snippets. Targets are `data-tour` marks in the templates (`[data-tour~=name]`, a palette button carries `tool-<id>` for every tool of its group) or CSS selectors starting with `#`, `.`, `[` or `app-`. Keep a mark when you move a control; `checkGuide` and `core/tour.spec.ts` keep the data consistent, and `core/i18n.spec.ts` that every caption has its Italian.
- `TourService` plays it on the real UI with synthetic events, a drawn cursor and a caption bar (`ui/tour-overlay.ts`; Esc stops). ‹ Back (`backTarget` in `core/tour.ts`) plays the current snippet again from its start, or from a snippet's start the one before: a single earlier beat cannot be replayed safely once the app has moved on, a whole snippet can (it prepares its own `needs`). Slow / online work is a hook that shows a real result instead: `fakeGenerate` opens the Chiari e Forti example as "Chiari e Forti (tour)" (id `tour-chiari`, replaced on every run; the model steps edit its "Boat house"), `ai` sends a scripted answer through the real `AiService.send` (with `AiService.demo` showing the chat without a model). Flight steps replay on "Villetta (tour)", a copy of the example without its place (id `tour-flight`), and load `public/guide-demo/flight.csv` / `flight.mp4`: a 100 s cut of a real flight (log thinned to ~100 Hz with its GPS moved to open sea at 1°N 1°E, shape kept, video 720p / 60 fps at 2.5 Mbit/s with a key frame every half second, so the sync can jump without stalling). Do not move fixes near 0, 0: the parser reads coordinates under 90 / 180 as degrees, not 1e-7 degrees, published with the app. `public/demo/` (the full-size originals) stays git-ignored.
- Every snippet must play on its own: it lists what it expects in `needs` (`zone` = the map of a new bando, `model` = the tour's model open in the 2D editor with the inspector unfolded, `site` = the demo flight's bando open, `log` / `video` = the demo flight loaded) and `TourService.prepare` sets that up before its first beat (a no-op inside a tour). When you add a snippet, play it alone from the Bandos list before committing.
- The editor registers a `TourEditor` with the service (tool, select by name, model tab, close boxes): the tour never reaches into protected state otherwise.
- Every panel's title bar has `?` (hover tips on / off, the same setting as Guide me) and `×` (close; not on Views). The caption bar sits centred near the bottom, pinned by its bottom edge (a longer caption grows upwards, the bar never moves), and can be dragged by its grip (for the visit); it does not follow the action, the outline and the cursor point at it. `TourService.open` shows a panel a step needs in the middle of the window, and `run` restores the whole layout (`LayoutStore.restore`) when an ordinary guide ends; the Welcome showcase instead halts replay and returns only Welcome. Wait with `sleep`, never `requestAnimationFrame`: frames stop in a background tab and the guide would hang.
- "Guide me" (`ui/panels/guide-panel.ts`, opened from Welcome or Views) plays tours and single snippets in foldable sections, and turns on hover tips (a marked control shows its snippet after 0.7 s). Keep only steps that show how to do something: no welcome or "where next" steps, and no pointing at captions. `npm run clips` records every step with Playwright into `docs/guide/clips/<step>.webm` and runs `node tools/build-guide.mjs`, which writes `docs/guide/` from the tour.

## Flight logs and video sync
- The replay follows the video's clock smoothly (`followClock` in `core/flight/replay.ts`: steer towards it, jump only past 0.3 s), because that clock stalls and jumps when the decoder falls behind; the attitude is blended between the two log samples around the moment (`ReplayPose`), never the nearest one alone (the drone looked shaky at 60 frames a second).
- The video has no controls of its own: the timeline drives it. For a manual sync, Advanced has "video alone" steps (−1 s, ±1 frame, +1 s; `VideoService.stepVideo`, the replay does not follow), then "Sync here" or "Video here = …".
- Flight alignment: a generated bando is north-up (x east, z south), which is a turn of 0 in `toLocalAt`; `calibrationForSpec` gives `rot: -bearingDeg` (it was `+ 90`, from the first hand-built demo site, which turned every flight on a generated bando a quarter turn). The pilot's own alignment (`SiteSpec.calibration`) still wins.
- Flight path panel: Top / Side / Front / 3D / Fit are icon buttons; under them the start of the replayed flight, typed or read as latitude, longitude on a placed bando (`latLonText` / `siteFromLatLon`), as site metres x / z on a bando without its place; typing moves the path (`SceneService.placeStart`, like pinning the start). The knob's arrow keys do not reach the replay's seek shortcut.
- The main view's chase camera ignores the mouse; a drag or wheel on it switches to an orbit about the drone from the same place (`lookAround`, `orbitFromCamera`) that keeps following it, and hands back to the chase camera 2.5 s after the last input (`LOOK_AROUND_IDLE_MS`). A camera chosen in Views stays. A pan stops the follow; turning Follow on (or a double-click) glides back.
- The replay and the drawn path follow a Catmull-Rom curve through the fixes (`curvePoint` in `core/flight/flight.ts`; `PathRenderer` draws 4 pieces per segment, `SUB`), not straight chords between them.
- Seeking the replay (timeline click or drag, ±10 s, a guide step) moves the video at once (`VideoService` listens to `PlaybackService.onSeek`); a click or drag on the timeline chart also pauses.
- The showcase's replay screen (`arrange('replay')`) is placed as soon as the log loads, FPV view included: each panel gets its size and place before it shows (first guesses are the measured sizes), so nothing moves afterwards; the timeline is placed above the caption bar before it shows (`timelineAt`). Guide panels opened in the middle (`TourService.open`) are centred before they show too. Panels fade in over 0.7 s; the axe e2e waits for that.
- Welcome films (`npm run films`): build = Chiari turning, the drag driven from inside the page one step per frame (moves sent from Playwright stuttered); fly = the showcase's replay screen; share = the bando editor (plan, inspector, then its 3D view).
- Heights: Betaflight logs with `baroAlt` take the replay's height from the barometer (GPS altitude wanders tens of metres), cleaned by `cleanHeights` (running median over 7 fixes, centred mean over 7, at most 25 m/s).
- The FPV camera (main page and FPV window) is drawn solid: no x-ray fading (`XRay.solid`) and roofs shown even with "hide roofs" (`SceneService.solidly`).
- Views → 3D camera: a segmented "camera" switch (which camera the main page uses) and a row of "view" toggles (follow, roofs, satellite, x-ray, reset).
- A new log loaded from the Flights panel opens its instruments with it (path, speed; Blackbox and attitude with telemetry) through `PanelPlacer`; Timeline keeps its bottom anchor instead of joining the arranged rows. Reset UI restores positions and sizes while preserving panel visibility.
- Villetta check (demo flight, 1:16.5): the path's position matches the video (greenhouse frame left, Annex right, looking north); the camera heading is about 10–15° right of the video's. Re-check once the model is refined from photos.
- With the Views panel closed, a menu button next to the language flag opens it (`VersionBadge`).
- Paths: the whole path is a thin washed-out line (`aheadColor`), the part already flown a thick line in the speed colours drawn up to the playhead (`Line2`, `PathRenderer.setProgress`); the Flight path panel draws the same (`drawFlightPath(…, replayed)`). Its side column has Pin start / Pin end icons and a knob that turns the path about its start (`SceneService.turnPath`; arrow keys ±1°, Shift ±10°).
- Logs are parsed in a Web Worker (`services/log-parse.worker.ts` via `parseLogFile`; the parser itself is the pure `parseLog`); without `Worker` (tests) it parses in place.
- Auto-sync plays the video fast to measure its motion (`scanVideo`): `scanRate` (core/sync) picks 3× up to 1080p, 2× up to 1440p, 1× for 4K so frames are not dropped. A watchdog ends the scan when no frame arrives for 8 s (a background tab stops decoding) instead of hanging.

## Water and ground layers
- The Water tool draws an outline by hand or, in "Line" mode, a canal along a centre line (`stripOutline`, `waterWidth`). "Merge overlapping" in the inspector joins the selected water with every water it overlaps or touches (`mergeWaters` → `unionOutline`, a grid trace, in `core/layers.ts`).
- Water, roads and surfaces are listed in ☰ Elements ("Water, roads, ground"); a row selects the element (`goTo`, kinds `water` / `road` / `surface`). On the plan they are still picked by their edge, so a click inside them pans the map.

## Coordinates, outlines, preview, satellite ground
- Right-click a building / structure / tree → "Move … to coordinates…", the ground → "New building at coordinates…" and "Copy the coordinates of this point" (`parseLatLon` reads decimal and DMS, `siteFromLatLon` / `latLonText` in core/geo; only for bandos with a place, drawn north-up).
- Roads, surfaces and water selected with Select show their points: drag one, Alt-click removes it, double-click the line adds one (`nearestEdge` / `insertPoint` / `removePoint` in core/layers; drag `layerPt`).
- Inspector preview: ⤢ makes it as big as the inspector allows; a building with fixtures gets a "zoom to" list (`PreviewRenderer.zoomTo`; fixture objects carry `userData.fixture`).
- Satellite ground: `GroundStyle 'satellite'` lays the Esri World Imagery tiles on the terrain (`core/satellite.ts` picks the tiles, `three/satellite-ground.ts` draws them on a canvas, cached per place and grid; the terrain has uv for it). Editor: ground → "satellite (3D)"; flight view: the satellite icon in Views. Not for hidden places or bandos without real ground.
- `npm run clips` (local, needs ffmpeg): records each guide step with the GPU, cuts the set-up (`TourState.preparing`), compresses to VP9 / 960 px into `docs/guide/clips/`.
- `docs/article/medium-draft.md`: the Medium article draft.

## First visit, Welcome, the showcase
- The showcase is called "Welcome" in every language (a name: `translate="no"` in the caption bar and the Welcome button). Toasts stack above everything (z 100010) and drop in from the top centre while a guide plays; the timeline, when a guide shows it, is placed centred just above the caption bar before it appears and keeps its bottom edge while its contents fill in (`placeTimeline`). The cameras step shows only the FPV view, as wide as the video.
- A first visit shows only the empty world (`isVoidSpec`: no buildings, trees, structures, walls or terrain) drawn as a wireframe floor to the horizon (`SceneHost.voidFloor`; north is shown in the fixed camera compass widget), turning slowly (`SceneService.autoOrbit`, stopped by any press or wheel on the page and off as soon as a bando with something in it opens), and the Welcome panel. Every other panel is hidden by default (`PANELS`); closing Welcome brings Views.
- Welcome (`ui/panels/welcome-panel.ts`, centred with `anchor.center`): OpenBando, then Build / Fly / Share, each with a short film (`public/welcome/{build,fly,share}.webm`, recorded by `npm run films` from the app itself: Chiari turning, and two moments of the showcase with the overlay hidden) and links that open the right panels. The film of the column in focus plays.
- The showcase (`SHOWCASE` in core/tour.ts, section `showcase`, kept out of Guide me and the docs) plays the welcome tour (about a minute): Welcome, the place-hidden Villetta, the demo log and video, Auto-sync (faked: `DEMO_OFFSET`, checked against a real scan in `e2e/showcase.e2e.ts`), the replay screen arranged against the window (`arrange('replay')`), the four cameras appearing one by one (`arrange('cameras')`), every panel turned to glass. `returnToWelcome`: completion and Stop halt replay and restore only Welcome over the empty world. `?tour=showcase&lang=it|en` (or the same in the hash) plays it on load (`showcaseLink`). Such a link opens straight on the empty world with only Welcome: `SiteService` does not restore the bando opened last and `LayoutStore` starts from the defaults, so nothing flashes before the tour's first step.
- Flights on a bando without its place: `toLocalAt` measures east metres at the point's own latitude, so a flight far from the origin (0, 0) keeps its shape until it is moved onto the take-off pad. (It used the origin's latitude, which stretched such flights about 1.4× east–west at 45°.)

## Library groups, gates, living fences
- `core/catalog.ts` `BLOCK_CATEGORIES` / `blockCategory` / `groupBlocks`: the Library is grouped by the blocks' tags (FPV gates and poles, lines, vegetation, vehicles, street, yard, towers, industrial, ruins; then buildings, patterns, other). A new catalogue block needs a tag a group knows. Rows show the block's size (`three/block-size.ts`, measured once from the built model and cached by id + version).
- The Gates tool (group `fpv`, colour `tool-gate`) places any FPV-group block on a click, turned by the options' "turn"; it is a shortcut over `blocks.place`, the result is an ordinary placed block.
- Fence materials with a `look` (`core/fences.ts`): `hedge` / `bramble` are lumpy living walls (`hedgeLumps`), `wires` is a phone / power line, poles every `post` m with sagging wires between them (`wireSag`); `buildLine` in `site-model.ts` draws both, with colliders (the wires as short boxes). The `bush` block is the single shrub.

## Not done yet (future)
- National elevation data: the terrain uses the free worldwide AWS terrarium tiles; per-country high-resolution DEMs could replace them where available (an `ElevationService` source).
- Multi-user authoring: the catalogue is published only by the maintainer (`library/` in this repo, read-only in the app). Letting any pilot publish blocks or bandos needs accounts, per-user rights and moderation (a server such as Supabase), plus queued offline edits that never overwrite another pilot's work.
- Smarter AI editing: preview an edit before it is applied, a visual diff of what changed, overlap detection, multi-step
  plans with rollback, and saying why a command was rejected. Already there: the review list (`AiService.changes`, one
  entry per real change, Undo) and reports from `RunResult`, never from the model's words.
- Site and block workflows: search / filter / bulk actions in the Elements tree; align and distribute for a selection;
  more parametric blocks; collision previews while placing; an asset validation report for the catalogue. Already
  there: block parameters, Library groups and sizes, `sanitizeBlock` and `core/catalog.spec.ts` checking every block.
- Presentation and sharing: camera bookmarks, cinematic camera paths, saved scenes (panel layout + camera + time),
  shareable packages (bando + flight + video), video overlays, a guided first flight in the simulator. Already there:
  the welcome tour, MP4 render, hidden / rounded exports, example releases.
- Roadmap: (1) stabilize: done in large part (storage failures reported, undo restores the selection, the AI proxy fails
  closed, deploy runs every check); PR #124 passed all browser shards after the elapsed-time guide fix; keep future failures in the backlog. (2) Validate core behaviour: a
  regression matrix of the example bandos (load, build, collide, export / import round trip) on top of
  `core/examples.spec.ts`. (3) Maintainability: keep splitting `bando-editor.ts` into tools under `ui/studio/editor/`
  (terrain, layers, underground, measure, blocks and the host are split already).

## Maintenance status

- Keep current bug status and pending visual checks in [the backlog](docs/BACKLOG.md). Do not equate a passing unit test with a verified visual fix.

## Road overlap rules

- `orderedRoads` / `roadPriority` in `core/layers.ts` define railway > road > track > path, with stable same-class ties. Both `levelRoads` and the scene builder use this order. Each terrain vertex is written once from an untouched grid; overlapping core strips choose the higher class, shoulders blend from the original height.
- Road meshes sample across their width at <=1 m spacing, use explicit draw order and `depthWrite: false`. On terrain keep `depthTest: true` so hills and buildings hide them; flat sites retain the existing decal depth-test policy. Never fix road-road flicker by disabling terrain occlusion or by accumulating arbitrary height offsets.

## Villetta measured example

- `library/bandos/villetta-no-place.json` remains the place-hidden source (no private coordinate inputs). Its release 11 raises the greenhouse floor and end frame by an estimated 0.35 m above its levelled pad; release 10 applies the October survey, facade, central roof-strip and revised clear column spacing; interpretations live in the archived working plan and remaining checks in the backlog. Keep its exported counterpart in `public/library/` generated with `tools/build-catalog.mjs`.
- Greenhouse `BuildingSpec.ribSpacing` optionally sets a measured pitch; absent = the old evenly spaced ~2.5 m ribs. `vaultK` sets the ellipse crown (`width / 2 * vaultK + baseY`), not `height`. Bare frames are intact; only glazed frames get a torn stretch.
- Store vault crown is wall height + `((width - roofCenterStrip) / roofCount / 2) * vaultK` when `roofTurn` is true; `roofRise` alone does not set a barrel crown. Annex slabs are centred on `baseY` with thickness 0.20 m; a measured underside of 6.20 m means baseY 6.30 m.
- `abando/cage-ladder` v2 is the reusable open cage, not a solid cylinder. Refresh Villetta's fixture from this block, never maintain an independent ladder shape list. Regenerate Playground and bump its release when this shared placement changes.

## Pixel mascot

- `docs/mascot/README.md` is the character bible. Do not replace the approved coarse pixel direction with smooth chibi art. Radio: ergonomic, mostly black, orange details, no antenna, controls face the pilot. Goggles: continuous 360° head strap. Cap emblem black; shirt emblem white. Drone: exposed-prop freestyle quad.
- `public/mascot/timeline.json` drives `core/mascot.ts` and `tools/mascot/build.py` (Pillow). Keep generated poses/GIF in step. Preserve reviewed source rectangles: the imagegen master is not an exact grid.
- `ui/mascot.ts` uses the shared frame loop only while Welcome is shown, with reduced-motion and a still fallback; Welcome has no animation pause control, and opening it restarts the mascot from the first pose. Decorative art never appears over the flight/editor work surfaces. Keep its design-system exception scoped to Welcome.

## Multipath racing

- `core/racing/race.ts` defines bounded local-metre packages, common gate lap detection, interpolation and compatibility tags. Never put GPS fields or stream credentials into a race package. Tags catch accidental geometry/model-scale mismatches; they are not authentication.
- `RaceService` has its own clock/metadata and derives local tracks from FlightService. Do not advance PlaybackService/video clocks from racing. Shared tracks retain their exported coordinates: never re-project them through local GPS calibration. A site geometry/scale change clears external tracks and disconnects links.
- `RaceLinksService` owns independent WS/SSE sources and optional authenticated room snapshots. Incoming/outgoing limits, stale hiding, disconnect cleanup and opt-in broadcasting are part of the feature. The single LiveLinkService remains unchanged. Tokens live in memory and Authorization headers, never query strings/localStorage.
- `RaceRenderer` draws identity-colour non-colliding ghosts in every scene view; normal path heat colours remain outside racing. Throttle trail rebuilds, not live ghost freshness. Closed-loop timings are GPS estimates, not official timing or anti-cheat.
- `docs/racing/README.md` documents the server-free and optional relay workflows and field limitations. Relay runs separately via `npm run race:relay`; no server is provisioned by the app. `npm run test:race-relay` and `npx tsc -p tools/racing/tsconfig.json` are required alongside normal checks. The focused race-browser PR job runs alongside the full-guide browser shards.

## Work tracking

- `docs/BACKLOG.md` is the active status ledger; follow [Backlog rules](docs/BACKLOG-RULES.md) for required updates, evidence reconciliation and review. Historical working plans are archived in `docs/working-plan/` and are not current status.
- Preserve the distinction between a confirmed bug, a candidate fix awaiting review, an unimplemented feature and a completed check. Do not mark a visual or device-dependent item done on unit tests alone.

## Terrain and editor regression rules

- `three/underground-cut.ts` clips terrain and road triangles against actual 3D volume interiors, interpolating UVs/colours. Do not replace this with dropping all cells touching `ground.cut`; that mask is only a coarse overlay. `core/underground.ts:tunnelSection` is shared by linings, cuts and shell colliders. Portal ends stay open for pipes/vaults.
- Basement parameters live separately from `BuildingSpec.levels` to keep G/L1 indices compatible. `core/basement.ts` derives the −1 preview/building. Keep `siteGround`, rendering, sanitizer, preview and inspector in step. Dimension controls scale the existing outline about its own centre, retaining edge identity and item world positions; the 2D indoor plan can move, insert and remove vertices of a simple diagonal outline. Cut/Wing support simple diagonal basement outlines and reject holes, disconnected islands and loss of openings or floor items. The tools are available in 2D and basement indoor 3D; keep their tool filtering, floor projection and construction preview in step. In 3D indoor −1, vertex handles use the same outline validation, gesture undo and keyboard operations as the 2D plan. Preserve simulator, rendering, opening and saved-file consistency.
- `three/site-pick.ts` resolves the nearest visible mesh for both stage and editor, including instanced trees. Do not select buried elements through terrain. Stage selection requests use `StudioService.focus` and are consumed after the editor map is ready.
- Choosing a roof explicitly restores it by clearing open shell and lowering global ruin to at most 55%; explain this effect in the inspector. A high-ruin roof shape is otherwise intentionally invisible.
- Speed-trail colours never change racing drone identity colours or name-label colours. Labels are drawn as plain canvas text.
- Mascot sources and exports must agree with `timeline.json`; index 16 is the held cross-legged confused pose. The loop starts with no drone. Use the approved pixel-art concrete-and-brick wordmark in Welcome and README; follow `docs/mascot/wordmark-style-guide.md`. Keep colour approval (true orange versus red-orange) and multi-angle terrain/browser verification pending until actually reviewed.

- Villetta uses `BuildingSpec.archShape = 'parabola'`; absent retains the original elliptical greenhouse. Crown height and rib pitch remain measured values; do not overwrite pilots’ saved copies.
- Road vertices sample the rendered terrain triangles and use polygon offset; cut coplanar basement-ceiling triangles without treating them as outside fragments. Confirm terrain seams visually before closing the bugs.
- The mascot pokes the grounded drone twice (pose 17), retracting his hand between pokes (pose 18), then sits for takeoff. Keep canvas and GIF placement in step.

- Villetta store north is the rotated building’s local east (`doors.e`); keep its two covered windows and one exposed eastern door. Release 10 removes the duplicate annex south partition, retains the first south opening with the wall closed to its east end, and raises the three door-separated east wall sections to the 6.20 m slab underside. The central column rows leave a 1 m clear gap between their faces. Verify these placements against the survey photographs.

- X-ray uses only the actively followed replay or armed simulator; free orbit, manual pan and an idle parked simulator do not trace to a parked drone; a surface immediately in front of the camera can still fade. See `core/xray-policy.ts`.

- `ui/widgets/camera-compass.ts` is the fixed north widget in the main stage and editor 3D view; it follows each camera and calibration. Keep the old ground north marker removed.

- A hidden site's flight calibration may contain a private GPS `reference` established from the first accepted flight or live fix after alignment. Do not save a live reference while the initial recorded-flight alignment is still pending. Replay, pin/rotation, inverse projection and live GPS use the same fixed local frame. Keep the reference through local save/import and remove the entire calibration when sharing hidden sites. Never include the reference in race packages. Existing calibrations without a reference migrate by preserving the first fix.

## Studio precision and Welcome regression checks

- Inspector is docked right by default; `.work` owns the map, SVG, 3D canvas and compass. Use its bounds for pointer conversion and map sizing. The inspector must never consume invisible editing space beneath itself.
- Ground-coordinate debug mode is transient and does not edit the spec. Coordinates are local x east, y up, z south in metres; ignore buildings and indoor floor planes when sampling ground. Do not reveal hidden geographic coordinates.
- Inner SVG handlers delegate to `bgDown`; it must stop propagation so an indoor measure is processed once. 3D measure lines and placement use the selected floor height, including basement −1.
- Welcome tour card highlights run alongside the mascot; the loop gate is last, before closing Welcome. Count rendered animation time from the entry-screen restart. Hide the main compass while Welcome is open, during its tour and while the model is blank; hide replay/race paths while Welcome is open. Keep the main compass above the version badge.
- Hide all records the visible workspace. Reset restores that set with default geometry. Repeated Hide all must not replace it with an empty snapshot.

- Backlog status vocabulary: Open, Investigate, Implemented (checks pending), Verified (all stated checks passed), Blocked, Closed (accepted/resolved). Each item records its Opened date (first ledger entry, preserved on reopening) and a separate Verification entry with date, method, result and evidence. Human acceptance, unit/integration, browser/accessibility, real-device and documentation checks are distinct; Reviewed is when status/evidence were actually checked, not merely a formatting-edit date. Do not promote a pending implementation to Verified or Closed based on a merge.

## Basement perimeter wall identity

- `basement.wallEdges` stores one boolean per outline edge. The isolated `LevelSpec.wallEdges` carries it to preview/indoor rendering. Convert legacy compass flags before a vertex edit; clockwise and counterclockwise outlines must agree. Never silently re-enable a wall when its edge becomes diagonal.
- Split edges inherit their old flag. Removing a corner between different flags is rejected; openings and floor items keep the existing preservation checks. Cut/Wing remaps perimeter flags geometrically: preserve old boundary breakpoints and surviving edge state; new edges are solid. Do not merge collinear spans with different flags. Dimension edits preserve open-edge identity. Footprint restoration may move/reorder matching normalized boundaries; remap flags to the canonical building order and retain an explicit outline when a wallEdges mask requires it for sanitization. Reject ambiguous open-wall topology replacement and compass-indexed doors on already shaped floors rather than losing data.
- Inspector uses per-edge switches for polygonal or converted basements. Hidden walls retain existing opening data for later re-enabling, but new openings cannot be placed on absent edges. Keep saved-file sanitization, save/undo, rendering and collision in step.

## Guide animation timing

- Drive guide glides and drags from elapsed active time, not a fixed number of awaited frame delays: software WebGL can delay every timer by seconds. Pause time must be excluded, Next must finish without replaying missed samples, and Stop must release an active drag in a finally block. Keep the existing browser time budget as the acceptance check.
- Studio shadows are static between scene rebuilds: disable automatic shadow-map updates and invalidate the map when rebuilding model/floor/roof state. Camera orbit must not recompute identical shadows every frame.

## Documentation and media audit

- The current scoped follow-up audit is `docs/audits/2026-10-28.md`. A green CI run establishes its named checks, not absence of bugs or dead exported code. Keep real-device, pointer/visual and untested tool combinations explicit.
- Change generated guide text in `tools/build-guide.mjs` or the tour source, then regenerate with `node tools/build-guide.mjs`. Do not describe that as re-recording clips: `npm run clips` and `npm run films` are separate browser/media workflows. Clips/films last changed on 24 October and still need review against the current UI (F-011).

## Backlog maintenance

Follow [docs/BACKLOG-RULES.md](docs/BACKLOG-RULES.md), the authoritative maintenance procedure, for every change and PR. Update the active ledger, reconcile merged PRs with actual CI and acceptance evidence, review stale/contradictory states, close and archive finished work, reassess human dependencies/blockers, and validate tables and markers. Preserve user edits and historical IDs/dates; age alone never closes an item. The lifecycle legend in [docs/BACKLOG.md](docs/BACKLOG.md) is the quick reference.

- Documentation ownership: `docs/BACKLOG-RULES.md` owns maintenance procedure; BACKLOG owns current status and its quick lifecycle legend; design-system owns UI rules and scoped component exceptions; mascot guides own approved art. README summarizes capabilities. Historical archives/audits do not override current rules, and generated guide pages are edited through their generator/source. Backlog emoji are repository-documentation cues, outside the app no-emoji rule.

- Every modification, including backlog-only changes, requires a consistency check across README, AGENTS, BACKLOG, BACKLOG-RULES, design-system/component guides and applicable mascot/style guides. Sync affected claims and rules in the same PR, preserve user edits, and record the check/remaining discrepancies in PR validation. Unaffected documents need no cosmetic edit.

- Every change/review must reassess affected item status, actions, next action, human dependency/blocker, verification and evidence. Perform authorized feasible next steps rather than leaving “Agent can…” notes; close/archive when criteria pass. Only actual dependencies or required missing human evidence block dependent work; continue independent work. Follow `docs/BACKLOG-RULES.md`.
