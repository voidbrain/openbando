# Editor: coordinates, outlines, water and ground, precision

Area notes for OpenBando ([index](../areas.md)); the editor is in three files: [Editor: layout, tools, selection, aids](editor.md) · [Editor: Elements, modules, blocks and the library](editor-library.md). Read before you change this area; the rules and lessons here are as binding as AGENTS.md.

### Coordinates, outlines, preview, satellite ground

- Right-click a building / structure / tree → "Move … to coordinates…", the ground → "New building at coordinates…" and "Copy the coordinates of this point" (`parseLatLon` reads decimal and DMS, `siteFromLatLon` / `latLonText` in core/geo; only for bandos with a place, drawn north-up).
- Roads, surfaces and water selected with Select show their points: drag one, Alt-click removes it, double-click the line adds one (`nearestEdge` / `insertPoint` / `removePoint` in core/layers; drag `layerPt`).
- Inspector preview: ⤢ makes it as big as the inspector allows; a building with fixtures gets a "zoom to" list (`PreviewRenderer.zoomTo`; fixture objects carry `userData.fixture`).
- Satellite ground: `GroundStyle 'satellite'` lays the Esri World Imagery tiles on the terrain (`core/satellite.ts` picks the tiles, `three/satellite-ground.ts` draws them on a canvas, cached per place and grid; the terrain has uv for it). Editor: ground → "satellite (3D)"; flight view: the satellite icon in Views. Not for hidden places or bandos without real ground.
- `npm run clips` (local, needs ffmpeg): records each guide step with the GPU, cuts the set-up (`TourState.preparing`), compresses to VP9 / 960 px into `docs/guide/clips/`.
- `docs/guide/media.json` says, for the guide clips and the Welcome films, the commit each set was recorded at and the source files it shows; `npm run check:media` (a CI warning, never blocking) lists what changed since, and `npm run clips` / `films` stamp the set after recording (F-031). Add a watched file there when a recording starts to show a new part of the app.
- Per clip (F-032 step 2): `tools/build-element-map.mjs` also writes `docs/guide/clip-sources.json`, each guide clip's component files (the files of the controls its step acts on, with their .html / .scss / .ts siblings); `check:media` then names the clips whose own controls changed, besides the set-wide warning, which stays (a clip shows more than its controls: the panel around them, the 3D view, the styles). Only clips whose step acts on a `data-tour` mark found in a template are listed (8 of 14); the others rely on the set-wide warning.
- Keys (F-032 step 3): the element map lists every global key (`ShortcutsService` `case` codes and the `k('…')` flight keys of `core/radio/radio-input.ts`) and fails the build of the page when the Help panel does not name one. A new global shortcut gets its Help line (and Italian) in the same change. The builder reads the code by pattern: keep shortcuts as `case 'KeyX':` in `ShortcutsService`.
- Design-system guides (F-032 step 4): the element map lists each guide with the files and CSS classes of its `Source:` line and fails when a guide has none or names something the code lost. Renaming a CSS class or moving a component means updating its guide's Source line (and the guide) in the same change.
- Tips per file (F-032 step 5): the element map counts, per file, the controls "?" can explain (a guide step's `hover`), those with only a browser `title`, and those with neither. The rework and its check are F-026's, waiting for the user's choice.
- `docs/article/medium-draft.md`: the Medium article draft.

### Water and ground layers

- The Water tool draws an outline by hand or, in "Line" mode, a canal along a centre line (`stripOutline`, `waterWidth`). "Merge overlapping" in the inspector joins the selected water with every water it overlaps or touches (`mergeWaters` → `unionOutline`, a grid trace, in `core/layers.ts`).
- Water, roads and surfaces are listed in ☰ Elements ("Water, roads, ground"); a row selects the element (`goTo`, kinds `water` / `road` / `surface`). On the plan they are still picked by their edge, so a click inside them pans the map.

### Studio precision

- The indigo/purple palette is accepted (F-016, 28 October); retain it. Indoor floor browser coverage lives in `e2e/indoor-placement.e2e.ts`: verify exported floor data after real 3D pointer placement, rather than treating a visible canvas as proof of placement. The floor matrix also checks stairs placement, undo/redo and saved elevation with automatic stairwells disabled; new assertions require their own browser CI result. Keep uncovered tools explicit.
- Inspector is docked right by default; `.work` owns the map, SVG, 3D canvas and compass. Use its bounds for pointer conversion and map sizing. The inspector must never consume invisible editing space beneath itself.
- Ground-coordinate debug mode is transient and does not edit the spec. Coordinates are local x east, y up, z south in metres; ignore buildings and indoor floor planes when sampling ground. Do not reveal hidden geographic coordinates.
- Inner SVG handlers delegate to `bgDown`; it must stop propagation so an indoor measure is processed once. 3D measure lines and placement use the selected floor height, including basement −1.

### Moved from AGENTS.md, Known pitfalls and Testing the joins (2026-11-23, F-050)

- WebGL canvases (inspector preview, 3D editor view) skip rendering while hidden; they must not be assumed to exist in tests
  (the scene builders are testable without a renderer).
- The flight view and the 3D editor build the site with `{ merge: true }` (`three/merge.ts`): each building, its roof and each structure become one mesh per material (Chiari: 1,217 meshes → under 100). Transparent and instanced meshes stay apart, and so does any mesh with its own `userData.pick` (columns, partitions: the editor clicks them one by one); the x-ray fades the merged mesh, the collider is unchanged. Previews (`bare`) are not merged.
- Meshes that can be clicked in the 3D editor carry `userData.pick` (`{ kind, id | i }`); keep it when adding a new builder.
