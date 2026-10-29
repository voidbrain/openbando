# OpenBando

The accepted interface palette uses dark indigo/purple surfaces with lime active controls; status, telemetry, tool and pilot colours retain their existing meanings.

![OPENBANDO pixel-art concrete and brick wordmark](public/mascot/openbando-wordmark.png)

[![Pixel pilot and drone: look, sit, confusion, run, takeoff and fly away.](public/mascot/openbando-mascot.gif)](docs/mascot/README.md)

[Still mascot](public/mascot/poster.png) · [Pose keyframes and character rules](docs/mascot/README.md)

**Build, Fly, Share.** A browser app for **FPV pilots who fly abandoned places** ("bandos"): build the place in 3D from the
map, fly it (replay your real flights from Betaflight Blackbox logs and their DVR, or the simulator with your radio), and
share it, with or without its address.

The core app runs in the browser (Angular 22, Three.js, signals), with no required backend. Optional AI-server and race-relay connections are described separately. Bandos, blocks and the cached real ground
stay in the browser (IndexedDB); videos and logs are read from your disk and never uploaded.

**The welcome tour**, including the complete demo flight, played by itself:
[English](https://voidbrain.github.io/openbando/?tour=showcase&lang=en) ·
[Italiano](https://voidbrain.github.io/openbando/?tour=showcase&lang=it). Any address of the app takes
`?tour=showcase` and `lang=en` / `lang=it`.

## What it does

- **Flights**: load blackbox / telemetry logs, replay them in several camera views (orbit, top, chase, FPV), with instruments
  (speed, attitude, compass, timeline, radio sticks). The path is coloured by speed; the part already flown is dimmed.
- **Simulator**: fly the same site with a physics model and a radio / gamepad; collisions use the real model.
- **Bandos** (the map and model editor): create a site from OpenStreetMap, then edit it.
  1. *Area*: search a place, pan the map, drag the dashed frame's edges to set the area (metres, independent of the window
     size). **Generate** pulls buildings, trees, roads, greenhouses, towers, bridges, steps and cranes from OpenStreetMap.
  2. *Model*: the 3D model's plan is drawn over the map (street / satellite / hidden, adjustable opacity) in its real position.
     Move, resize, rotate and reshape buildings (cut notches, add wings, merge), plant trees, draw fences, place structures.
     **Edit indoors** takes the roof off and edits one floor at a time: interior walls, doors and windows (open or closed),
     voids (water on the ground floor), columns (duplicate, row, fill the floor), stairs and ramps (with the stairwell cut in the
     floor above). While placing, a ghost shows where the thing will go, on a grid in the building's own axes, with guides to
     other columns (same line, equal spacing, rhythm) and distances to walls and neighbours. Only the tools that make sense
     are shown: outdoor tools while outdoors, floor tools while editing a floor. The palette groups related tools Photoshop-style (hold or use the corner mark for the others) and a right click offers what can be done with whatever is under the pointer. 2D / 3D switch (3D: click to select, draw and place on the ground, roofs on / off), compass, chained measures with angle arcs (select, move, delete), the flight path with start / end markers,
     flight-path start / end pins, floating inspector with a 3D preview of the selection.
- **Vegetation**: the Trees tools place broadleaf, conifer, hedge and bramble with a click or a brush; the lasso fills an area. Each hedge or bramble remains an editable living wall, and one undo removes a whole brush stroke.
- **Terrain**: the real ground (AWS Terrain Tiles) under every bando, sculpted by holding the mouse (left raises, right
  lowers) or with brushes (raise, lower, smooth, flatten, hill, crater, ramp, with construction lines); roads, surfaces and water (drawn as an outline or along a canal's centre line); tunnels and basements.
- **Library**: ready-made blocks (objects, buildings, façade and column patterns, FPV gates) from an online catalogue that
  works offline, plus your own blocks made from a selection.
- **Ruins**: any building can be ruined (holes in the roof, then walls broken along their top), an open shell, or carry
  battlements; one wall at a time if needed.
- **Examples**: ready bandos to open as a copy: Chiari e Forti; Villetta, shared without its place; and Playground, a made-up works with every block of the library, hills, water and a tunnel.
- **Sharing**: export a bando with its exact place or hidden (no coordinates, no map names; its real
  ground travels inside the file); a bando whose place is hidden stays hidden. Flights on a bando without its place start on its take-off pad; pins fit them.
- **Backup**: save every bando and your own blocks in one file, and restore it (the newer copy of a bando wins).
- **Video**: load the flight's video, sync it with the log automatically, replay both together, render an MP4.
- **AI assistant** (optional): a chat that turns sentences like "3 rooms with doors, close the north windows, add a crane"
  into editor commands. See *AI assistant* below.
- **Welcome**: a first visit opens on the empty world turning slowly, with Build / Fly / Share and their short films
  (`public/welcome/`, recorded by `npm run films`), and the welcome tour.
- **Guide me**: animated tours that use the real interface, every step on its own too, hover tips; help pages and clips in
  `docs/guide/` (`npm run clips`).
- **Languages**: English and Italian (the flag next to the version); the AI answers in the chosen language.

## Structure types

| Kind | Notes |
|---|---|
| Building | rectangle or shaped (L, T, U, H: rectilinear outline), several floors, gable / vault / flat roof (turnable, repeatable) |
| Greenhouse | the arched steel-skeleton tunnel (`frame: 'greenhouse'`); convert to / from a building (loses the interior) |
| Tower | chimney, silo, storage tank, water tower (fly under the tank), lattice mast / pylon, tower crane |
| Bridge | beam on piers or arch, you can fly under it |
| Stairs, ramp | optionally raised (`y`), e.g. on a floor |
| Container, car, truck, excavator | stackable with `y` |
| Fence | free-standing wall (masonry, concrete, brick, wood, metal, chain-link) |
| Fixture | a structure that belongs to a building (a roof ladder): moves and turns with it |

Collision uses axis-aligned boxes and vertical cylinders only; long or rotated parts are cut into short boxes.

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm test           # Vitest through the Angular builder
npm run build      # production build into dist/
npx tsc -p tsconfig.app.json --noEmit --noUnusedLocals --noUnusedParameters   # dead-code check
```

## Where things are

```
src/app/
  core/        framework-free logic (pure TypeScript, unit-tested): site spec, footprints, openings, building ops,
               AI commands, flight analysis, sim physics, geo / calibration
  three/       Three.js: site builder (site-model), structures, path renderer, camera rig, 3D previews
  state/       signal stores (layout, view, calibration, playback, flights, radio)
  services/    services: SiteService (generate / library), GeoService (Overpass), AiService, StudioService, SceneService ...
  ui/          panels and widgets; ui/studio is the Bandos editor
  i18n/        translations (Italian), applied by services/i18n.service.ts
library/       the online catalogue: blocks/*.json and example bandos/*.json (built by tools/build-catalog.mjs)
docs/guide/    help pages, written from the guided tour by tools/build-guide.mjs
design-system/ colours, type, spacing and component guidelines (read before UI changes)
```

Key files: `core/site-spec.ts` (the data model), `three/site-model.ts` (spec to 3D + colliders), `ui/studio/bando-editor.ts`
(the editor), `services/geo.service.ts` (OpenStreetMap), `core/ai-commands.ts` (what the assistant may do).

## Data and units

- Site coordinates: metres, **x east, z south** (north is up the map), y up. `SiteSpec.origin` is the lat / lon of (0, 0).
- Generated bandos are not rotated, so the plan lines up with the map; `bearingDeg` is only non-zero for old specs.
- Buildings: `pos` is the centre, `rotDeg` follows the SVG convention (x axis to (cos, sin) in x, z). Interior elements
  (partitions, voids, columns) are in a frame **from the bounding box's min corner**; openings of shaped buildings and
  footprints are **centred** on the building.
- A floor's walls stand on `levels[i].baseY`. Only the top floor has a roof (the others use `roof: 'none'`).

## OpenStreetMap data (Overpass)

`GeoService.areaData` makes one Overpass request for the whole area (buildings, trees, roads, structures), caches it for 12 h
in the browser, and falls back to buildings only. The public servers are often busy and answer 429 / 500 without CORS
headers; the browser then shows an opaque "access control" error. Mitigations:

- several mirrors are tried in turn;
- **Data server...** in the Area tab sets your own endpoint, e.g. [`tools/overpass-proxy.php`](tools/overpass-proxy.php) on shared hosting
  (it caches answers on disk and adds CORS for your site).

## AI assistant

The assistant never writes geometry. A language model answers with JSON `{ reply, commands }`; the app validates the commands
(`core/ai-commands.ts`), runs them through the same helpers the mouse tools use, and records one undo step. Only the
application result counts: the chat shows "Nothing was changed" when no command ran, and "what I understood" lists the commands.

Two providers, one chat:

- **In this browser**: WebLLM on WebGPU (Qwen2.5 / Llama / Phi / Qwen3). Nothing leaves the machine; the first load downloads
  the model (1 to 5 GB, cached). Loaded lazily, so it does not affect the normal start-up.
- **Server / home PC**: any OpenAI-compatible endpoint: Ollama or LM Studio on your PC over HTTPS (e.g. Tailscale; set
  `OLLAMA_ORIGINS` to your site), or [`tools/ai-proxy.php`](tools/ai-proxy.php) on shared hosting, which keeps an API key off the browser.
  The token typed in the app is stored in `localStorage`.

The model sees text only (building names, sizes, floors, counts, structures), not images.

## Deploying to GitHub Pages

This repository includes a GitHub Actions workflow
([`.github/workflows/deploy-gh-pages.yml`](.github/workflows/deploy-gh-pages.yml))
that builds the app and publishes it to GitHub Pages automatically on every
push to `main` (it can also be triggered manually from the **Actions** tab).

### One-time setup

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

No further configuration is required — the workflow uses the built-in
`GITHUB_TOKEN`, so no secrets are needed.

### How it works

- Runs the reusable CI checks (catalogue, generated examples, unit tests, race relay, Italian translations, backlog layout, shared contrast, AGENTS conventions and unused exports, strict types and production build) before publishing. Browser e2e runs on pull requests; deployment calls the fast checks without browser e2e. `main` is protected (ruleset "protect main"): a pull request merges only when `check`, `e2e (1)`–`e2e (4)` and `race-browser` pass; force pushes and deleting `main` are refused. The guide timeout correction passed all PR #124 browser shards; the backlog records current verification and remaining checks. The production build uses
  `"baseHref": "/openbando/"` set in `angular.json` so asset URLs
  resolve correctly under the project-page subpath.
- Adds a `.nojekyll` file so GitHub Pages does **not** process the bundle
  with Jekyll (without it, Pages renders the README instead of the app).
- Uploads `dist/openbando/browser` as the Pages artifact.
- Deploys it with `actions/deploy-pages`.

The site will be available at `https://<username>.github.io/<repo>/`.

### Alternative: deploy from your machine

A `deploy` target backed by
[`angular-cli-ghpages`](https://github.com/angular/angular-cli-ghpages) is
already configured in `angular.json`. To use it locally:

```bash
npm i -D angular-cli-ghpages   # one-time install of the builder dependency
npx ng deploy --base-href /<repo-name>/
```

This pushes the production build to the `gh-pages` branch. Note that if you go
this route, set **Settings → Pages → Source** to the `gh-pages` branch instead
of GitHub Actions.

## Known limits

- Rectilinear footprints only (no diagonal walls); shaped buildings have flat roofs.
- Curved bridges become one straight deck; bell / observation towers are not imported.
- The AI does not check for overlapping buildings.
- Satellite tiles come from Esri World Imagery; check its terms before any bulk or automated use.

## Project maintenance

- [Backlog](docs/BACKLOG.md): current bugs, features and verification status. [Archived working plan](docs/working-plan/working-plan-2026-10-27.md): history and Villetta measurements.
- [Agent instructions](AGENTS.md): architecture, conventions and required checks; [area notes](docs/agents/areas.md): rules and lessons per part of the app.
- [User guide](docs/guide/README.md): generated feature walkthroughs.

Road overlaps use class priority (railway > road > track > path), stable draw order and full-width terrain draping. Regression coverage checks reversed drawing order; B-005 and B-008 record the user’s acceptance of the hill-road and descent fixes in the backlog archive; this does not establish every slope/intersection combination.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

### Villetta survey model

The place-hidden Villetta example now includes the measured façade widths and panel heights, 8 m store roof crowns, a 9.30 m parabolic greenhouse with 4.61 m rib spacing, and the tall annex with a first-floor walkway around its central void. The blue ladder uses the reusable open-cage library block. Open a fresh example copy for release 11 (including the estimated 0.35 m raised greenhouse floor); edited copies remain yours. Measurements and photo interpretations are recorded in the [archived working plan](docs/working-plan/working-plan-2026-10-27.md); open checks are in the [backlog](docs/BACKLOG.md).

### Pixel mascot

Welcome includes the pixel pilot and freestyle quad with an animation and reduced-motion still; there is no animation pause button. [Character bible and keyframes](docs/mascot/README.md) define equipment orientation, the 360° goggle strap, palette, choreography and rules for new poses. The [animated GIF](public/mascot/openbando-mascot.gif) is generated from the same timeline as the app.

## Multipath racing

Flights → Racing and ghosts compares up to eight pilots in individual colours, with start delays, a separate race clock, simultaneous non-colliding ghosts and estimated lap / best-lap timing through a shared gate. Exchange local-coordinate race files without a server, connect several GPS WebSocket/SSE sources directly, or use the optional self-hosted room relay to exchange tracks between devices. Video/selected-flight replay keeps its own clock.

[Setup, limits and the server decision](docs/racing/README.md). Shared rooms require a reachable relay; local recordings, file exchange and multiple direct streams do not require an additional race server. No relay is deployed automatically.

### Terrain openings, basements and selection

Tunnel linings and terrain/road cuts use the same upright cross-section, including rotated mouths. Terrain meets the lining without deleting whole surrounding grid cells. The coarse cut overlay is an editing aid, not the render boundary. Basements also create a cuttable flat terrain for older sites without terrain data.

In the building inspector choose **−1** to inspect a basement. Change its depth, independent length/width, perimeter walls or interior wall endpoints; **Use building footprint** restores the current building outline when openings, floor items and wall identity can be preserved. Length/width scale the existing outline about its centre rather than replacing a shaped basement with a rectangle. Interior items retain their building coordinates; opening centres follow their walls and keep their dimensions. In 2D or 3D indoor Select mode, drag basement vertices for diagonal walls. Double-click an outline edge to insert a midpoint; Alt-click a vertex to remove it. A focused vertex also accepts arrow keys, Insert and Delete. Edits that would cross the outline, leave floor items outside or split an opening are rejected. Partitions use metres from the basement's north-west corner. Existing ground-floor voids remain the route down. Cut and Wing support simple diagonal basement outlines and preserve open/closed state on surviving perimeter segments; newly created edges are solid; separate islands and holes in the perimeter are not supported.

Ruin at 60% or an open shell removes the roof. Choosing a roof shape explicitly restores it and caps global ruin at 55%; wall damage may therefore lessen. With the editor open, clicking an element on the main 3D page selects and frames it in the editor.

Racing can colour trails by speed while drones and pilot-name labels retain each pilot's identity colour. Disable **Colour trails by speed** for solid pilot-coloured trails.

The mascot loop now includes the cross-legged confused keyframe and starts with the drone invisible, then introduces it on the ground before takeoff. Sources and timing are in [the character guide](docs/mascot/README.md). Browser visual verification of these changes is pending; local Chromium installation failed.

The main 3D view and the editor’s 3D view show a fixed north compass that follows the camera. X-ray fades obstructions for the active followed drone and for surfaces immediately in front of the camera, rather than tracking an inactive parked drone while orbiting.

### Precision in Studio

The Inspector starts docked on the right; the plan and 3D canvas occupy the remaining space. Undock it with its header button. The plan supports zoom level 25 (imagery is enlarged beyond its native detail); the 3D editor can approach to 25 cm with a 2 cm near clipping plane.

Enable **Debug coordinates** in the Studio top bar and click to read local x (east), y (up), z (south), in metres. It samples ground through buildings, including in indoor mode, and does not change the model or expose a hidden bando’s geographic location. Indoor measures use the edited floor’s height.

The simulator quad geometry spans approximately 0.39 m on each horizontal axis before display scaling. The replay quad starts at four times that size, and both scene markers enlarge with camera distance for readability. Their visible dimensions do not define the simulator collision size.

Basement vertex edits preserve each perimeter wall’s visibility, including diagonal walls. Polygonal basements expose **Perimeter edge** switches in the Inspector. Splitting an edge copies its wall state; removing a corner between an open and closed edge is rejected. Existing doors/windows remain stored while their wall is hidden. Cut/Wing preserves surviving open/closed spans, retaining collinear state boundaries and creating solid new edges. Dimension edits retain perimeter flags. Footprint restoration maps open walls when the normalized boundary has an unambiguous correspondence, including reversed vertex order. A footprint restore that would close an open wall is refused, and closed-wall replacements still require all openings and floor items to survive. Old saved basements whose doors were stored by compass side after the outline became a shape get those doors back on their walls when the bando opens; a door whose spot was cut away stays in the file, unseen.

On the −1 floor the **Courtyard** tool drags a courtyard into the basement: the ground stays there, walls go around it, and the drone cannot land on a basement floor inside it. The inspector lists courtyards with Delete; edits to the outline or the floor that would break a courtyard are refused. The **Basement piece** tool adds a separate piece of basement beside it (its own walls, floor and terrain cut, shown with the basement in −1); pieces are listed with Delete too, and each courtyard or piece has a switch per wall.

The [28 October follow-up audit](docs/audits/2026-10-28.md) records current CI evidence, remaining implementation limits and documentation/clip freshness. Guide clips and Welcome films were re-recorded on 29 October against the current UI (F-011).

Backlog maintenance follows [Backlog rules](docs/BACKLOG-RULES.md): evidence-based status updates, PR/CI reconciliation, stale-item review and closure/archiving. Current work remains in [the backlog](docs/BACKLOG.md).

The main compass appears with a nonblank model and stays hidden while Welcome is open, including after the showcase finishes.

The Welcome showcase plays each introductory card film and the complete demo flight before returning to Welcome. It restores an overview rather than following the old replay; loaded logs remain available. Shared contrast checks (`npm run check:contrast`) complement browser axe checks of page text and representative hover/focus states.

The backlog shows **→ Human action required** first below each compact item summary, followed by **Next action**; PR/date/verification history remains expandable.

Backlog human-action cues use 🧑 Yes for human input and 💻 No for agent-owned work; neither replaces the item status.

After a completed Welcome showcase, Open the bandos becomes the primary Welcome action. Fly on a saved bando opens the model and telemetry workspace (excluding Live link) and the Fly checklist; it does not arm the simulator. Loading a log or video exposes its matching panel. Views can close and reopen from the bottom menu; Flights opens below Video. Video decoding shows loading/error feedback instead of an unexplained black frame.

The **Fly checklist** walks the pilot through one of three routes: replay a recording (log, DVR video, sync, alignment, more flights), the simulator (controller, opening it, arming by hand) or live telemetry (connect, watch the link, flying with others). Each step ticks itself from what the app shows, so it resumes where you left it; it never arms the simulator or connects a link for you. The guide step "Follow the Fly checklist" shows it ([plan](docs/fly-workflow-plan.md)).

The tour caption shows a circular remaining-time indicator. Welcome uses one rendered mascot loop with card films fitted across its thirds; it holds the final pose instead of beginning another search/run/sit before closing. Other guides show estimated timing, held while paused.

Welcome links stop the running tour and clear its overlays before opening their destination; Stop still returns to Welcome. Tour outlines follow resized/moved targets. Views promotes Flights, Timeline, Video and the Bandos editor, with other groups folded by default and camera Options closed. Camera controls are shown for the 3D main page. Existing fold preferences are preserved.
