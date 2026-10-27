# Working plan

Current bug status is tracked here; implementation rules live in [AGENTS.md](../../AGENTS.md), usage in [README.md](../../README.md).

## Verification — 26 October 2026

- **Bug 4 — reopened after user screenshots:** portal/hill tests cover two openings and an intact hill crest. Fixed the CI regression where terrain exactly at a basement ceiling was left uncut (`cutMask`); the existing scene/collider test stays enabled. Visual confirmation against `docs/working-plan/bugs/bug1.jpg` is still required. General basement access and void usability remain bug 3.
- **Bug 5 — implemented, visual check pending:** `cleanHeights` applies median → centred mean → rate limiting to CSV barometer heights; the jittery-descent regression checks for no flat treads. Load `public/guide-demo/flight.csv` with its video and inspect the descent before closing it. Basement notes belong to bug 3, not this flight-path bug.
- **Bug 6 — implemented:** terrain vertices are levelled once from the original grid; higher road classes own overlapping strips. Draw order is railway > road > track > path, with stable same-class ties independent of insertion order. Road decals do not write depth, so one cannot flicker against another; terrain depth testing stays on so hills/buildings occlude them. Meshes sample ground across their full width instead of using only the centre height. Regression tests cover reversed order, crossing heights, priorities and full-width draping on flat/hilly sites. Browser visual confirmation remains pending (no local Chromium available).
- **CI failure:** run `40339576161` failed only the basement cut assertion (412 other tests passed). The fix includes ceiling equality; terrain strictly above the ceiling remains intact. No tests are skipped.

- **Browser CI follow-up:** the PR guard explicitly includes pull-request events; confirmation from the next GitHub Actions run remains pending. No browser verification was performed locally.

## Bugs

| # | Issue | Details | Priority | Status |
|---|---|---|---|---|
| 1 | Welcome tour | Stop the tour and open the welcome panel. | High | TBC |
| 2 | Root page | Opening the root URL should open the welcome panel. | High | TBC |
| 3 | Gallery / holes / underbasements | Fix incorrect, impractical, or poorly designed holes and underground spaces. | High | Open |
| 4 | Holes and hills | Upright vault cross-section; exact terrain/road cuts and open curved-tunnel shell collisions. User screenshots showed the previous fix was insufficient. | High | Revised implementation — multi-angle visual verification pending |
| 5 | Flight descent | Example Blackbox CSV descent appears as steps rather than a slope. Smoothing is implemented; compare the rendered path with the video. | High | Implemented — visual check pending |
| 6 | Overlapping roads | Two roads drawn over each other ... zig-zag trough ... (see bug image 2) | High | Implemented — visual check pending |

## Bando Villetta — Specs

Measurements applied to `library/bandos/villetta-no-place.json` (release 8). Original footprint positions, dimensions and rotations remain; no geographic location is published. iPhone measurements are approximate, not survey-grade.

| # | Element | Applied measurement | Interpretation / evidence | Status |
|---|---|---|---|---|
| 1 | Main store facade doors | 4.64 m width | Width confirmed by the pilot; existing heights and bay centres retained. | Applied |
| 2 | Main store facade windows | 2.69 m sill | Closed lower panel height; keep the existing opening tops. | Applied |
| 3 | Greenhouse ribs | 4.61 m pitch | Confirmed as rib spacing along the long sides, not full building width. Last bay is shorter to keep both end frames. | Applied |
| 4 | Annex house columns | 3.43 m centres | Perimeter rows; a shorter terminal bay fits the retained footprint. | Applied |
| 5 | Annex perimeter walkway | 3.11 m | First-floor central void leaves a walkable ring. S/N/W measured; equal east return is a modelling assumption. | Applied; east to verify |
| 6 | Annex first-floor slab underside | 6.20 m | Interpretation confirmed by pilot. Existing 0.20 m slab is centred at 6.30 m, walking surface 6.40 m. | Applied |
| 7 | Greenhouse crown | 9.30 m | Parabolic approximation from the reference photograph; crown and rib pitch retained. | Applied; visual check pending |
| 8 | Main store roof crowns | 8 m | Four barrel roofs, 6 m wall height and 2 m rise. | Applied |
| 9 | Blue roof ladder | Open cage above 2 m | Shared `abando/cage-ladder` v2, mounted as a building fixture. | Applied |

### Photo interpretation and remaining uncertainty

- `bando-img/IMG_4341.JPG`: broad steel greenhouse frame, approximated with a parabolic arch. Bare ribs remain intact; the artificial torn-glass deformation is only used on glazed frames.
- `bando-img/IMG_4344.JPG`: tall annex colonnade and pitched terracotta roof. Replace the old barrel roof with a shallow gable; retain the upper storey's 3.60 m height and 2 m roof rise because no new dimensions establish them.
- `bando-img/IMG_4352.DNG`: store interior, lower façade panels and the open blue ladder cage. Use the real ring/rail silhouette, not a solid tube or box hood.
- Release 6 restores the south interior partition, three eastern door-separated wall sections and the first-floor end wall; review their placement against the photos. The longer door-bearing wall segments extend to the 6.20 m underside of the first-floor slab. Exact roof pitch, column thicknesses and the east walkway require further measurements. The retained rectangular outer footprint is not claimed to be a full measured reconstruction.
- Fresh copies get this release; existing edited copies are not overwritten. Playground also places the upgraded shared ladder.

## Next Steps

| # | Task | Details | Priority | Status |
|---|---|---|---|---|
| 1 | Fix welcome flow | Correct welcome tour termination and root-page behavior. | High | Implemented — browser check pending |
| 2 | Redesign holes and underground areas | Review gallery, holes, underbasements, hills, geometry, and walkability. | High | TBC |
| 3 | Verify flight descent | Compare the example CSV path with the video (bug 5). | High | Pending |
| 4 | Finish road overlaps | Add road-class priority and remove overlap flicker; verify slopes in both drawing orders (bug 6). | High | Implemented — visual check pending |
| 5 | Validate Bando Villetta dimensions | Measurements applied with explicit photo interpretations above; check unmeasured east return, roof pitch and interior wall ends. | High | Further survey pending |
| 6 | Implement Bando geometry | Survey refinement applied; compare a fresh release-8 copy with flight video and the reference photos. | Medium | Implemented — visual check pending |
| 7 | Multipath racing mode | Separate race clock, per-pilot names/colours/offsets, simultaneous 3D ghosts and shared start gate. | Medium | Implemented — field verification pending |
| 8 | Upload support | Existing multi-file log upload reused; closed-loop lap/best-lap estimates, local-coordinate race package export/import. | Medium | Implemented — field verification pending |
| 9 | Multiuser racing mode | Server-free race-file exchange plus optional self-hosted HTTP/SSE room relay; same exported bando/model scale required. | Medium | Implemented — relay deployment and device verification pending |
| 10 | Multiuser live racing mode | Multiple independent WS/SSE GPS sources, stale detection and retained recordings; opt-in room broadcast at ~1 Hz. SquirrelCast video URLs alone are not telemetry. | Medium | Implemented — real stream/device verification pending |
| 11 | Mascotte | Pixel pilot and drone, 19 poses, 19.7-second GIF, grounded pokes with a retraction frame, and approved concrete-and-brick pixel wordmark. [Character rules](../mascot/README.md) and [wordmark guide](../mascot/wordmark-style-guide.md). | Future | Implemented — browser visual review pending |

## Visual references

- `bugs/bug1.jpg`: holes, terrain, basement and tunnel edges (bugs 3–4).
- `bugs/bug2.jpg`: overlapping roads, class priority and flicker (bug 6).

## Racing verification and remaining field work

See [racing setup and server decision](../racing/README.md). No server is needed for local multipath comparison, exported race-file exchange, or several directly reachable GPS streams. Different devices exchanging tracks over the network use the optional in-memory relay; no service has been deployed automatically.

Before declaring field-ready: open the same exported hidden bando on two devices, align separate pilots, compare offsets/lap estimates with a known clock, connect two real GPS/SquirrelCast-associated telemetry bridges, stop one feed and verify stale hiding, test relay disconnect/rejoin and GPS loss, and inspect crowded ghost paths in every camera. Shared sessions are for trusted token holders, not public ranked races. The selected-flight/video and simulator flows still require a manual regression check. Local Chromium installation failed with a truncated download; GitHub CI run `40362635101` passed the focused race-browser tests (two-log export/import and two independent mocked telemetry URLs, including axe), all 434 unit/service/render tests, three relay integration tests, types, translations, example consistency and production build. The old full-guide job remains skipped by its existing guard.

## Follow-up regression work — 26 October 2026 (historical; later corrections below take precedence)

1. **Hills / holes (bugs 3–4):** replace the flattened vault rotation with an extruded upright section; cut terrain and roads precisely against the interior rather than removing whole surrounding cells. Shell colliders follow the curved section and leave its ends open. Verify Playground from above, front, rear and both sides before closing.
2. **Basement:** selectable −1 preview, depth, independent rectangle dimensions, perimeter and interior walls; changes survive save/import. Exact terrain boundary removes the old moat. Arbitrary polygon vertex manipulation and full indoor-tool parity remain open.
3. **Farmhouse:** its 70% ruin hides the roof by design; inspector now explains this and choosing a roof restores it, reducing global ruin to at most 55%. Playground release 3 lowers its default farmhouse ruin to 45% so its gable is visible. Existing copies can use Restore roof. Verify gable/flat/vault visually.
4. **Main page → editor:** nearest visible picks, merged buildings and instanced trees share a picker; select and frame the element while the editor is open.
5. **Mascot / title / racing:** ASCII OPENBANDO wall; held confused seated frame; revised loop; optional speed trails with stable drone colours and pilot-name labels. The earlier orange read too red: true-orange palette approval remains pending.

Local checks and CI results are recorded in the associated PR. Chromium installation failed locally; no browser or multi-angle visual pass is claimed here. No tests are skipped.

### Welcome and Features follow-up

- The root opens only Welcome; saved positions are preserved. `?panel=features` opens the nine-card Features panel, which is excluded from Views.
- The mascot loop now searches, runs with the grounded drone, sits perplexed, watches takeoff, jumps and celebrates before the drone exits. The Welcome pause button was removed as requested; reduced-motion preference still shows a still image.
- **Open:** visually verify the right-facing drone, propeller animation, complete sequence and responsive Features panel in a browser.

### Follow-up — Welcome and underground surfaces (historical)

- The Welcome wordmark is a single-line ASCII wall; the Features button is labelled “Features”.
- The pilot pokes the grounded quad twice after the perplexed pose, then sits as it takes off. The grounded quad and subsequent flight are shifted 20 px left. The poke keyframe is aligned so the finger reaches the drone.
- Terrain triangles coplanar with a basement ceiling are removed; the road uses the rendered terrain triangles and depth bias, and building walls use depth bias to reduce surface flicker. Visual browser checks of the hill road and warehouse remain pending.
- Villetta release 5 uses a parabolic greenhouse profile, retaining 9.30 m crown height, 4.61 m rib spacing and the current footprint. Open a fresh example copy to see release 5; existing edited copies are not overwritten.

### Villetta façade and annex correction (historical; see release 6 below)

- The greenhouse-facing end of the annex is open; the duplicate unbroken interior partitions and short end returns are removed. Door-bearing outer wall segments stop at the first-floor slab underside.
- The main store's site-north facade is local `e` after the store rotation. Its covered section has two windows; its exposed eastern section has one 4.64 m door. Window positions are estimates within the covered section, pending precise measurements.
- The store's roof uses the annex's terracotta colour. Existing edited copies remain unchanged; open a fresh Villetta release 5.

- X-ray follows only the active tracked subject; free orbit, manual pan and a disarmed parked simulator no longer fade the annex based on a distant parked drone; surfaces immediately in front of the camera can still fade. Verify close-camera and flight behaviour visually.

- Both the main 3D view and editor 3D view show a fixed compass widget that follows the camera and calibration; the old ground landmark was removed. Verify its placement and direction in the browser.

### Villetta and Studio follow-up — 27 October 2026

- Restored the annex south interior partition, three door-separated eastern wall sections, and the first-floor end wall in Villetta release 6. These corrections supersede the release 5 assumption that these walls should be removed. Their precise appearance still needs visual review against the survey photographs.
- The main store's two central column rows are 1 m apart; release 8 adds the matching 1 m roof strip and retains the 8 m vault crown. The greenhouse east end, ladder cabin, terrain/road and warehouse seams and basement lighting still require visual review.
- In Studio, empty-ground selection now clears the selected building too; the ground context menu offers a disabled-aware Clear all measures action; Space/Enter dismiss an active tool when the editor canvas has keyboard focus. Other requested Studio view, measurement, layout and flight-alignment changes remain open.

#### Outstanding requests from the 27 October review

- Villetta: verify restored annex walls and their openings against photos; verify the release 7 greenhouse east frame against IMG_4341 (support dimensions are estimates); verify the release 8 centre roof strip and separate blue-ladder cabin; cabin dimensions and placement are estimates.
- Terrain: investigate the gallery road/terrain and warehouse perimeter/terrain flicker; the ground-floor slab now casts shadows over the basement except through its opening; verify the lighting and seams visually from multiple viewpoints.
- Studio: 2D and 3D now share compass styling, closing Studio exits indoor mode, the editor can expand, and the inspector can dock right at full height. Verify these visually. 3D indoor editing is implemented for above-ground floors; browser verification remains open.
- Measures: 2D and 3D share chains, Select-mode highlighting and expandable labels; 3D supports drawing points and selecting lines or labels. Verify interaction visually and review other 2D/3D feature differences.
- 3D placement: two-point fences, bridges and tunnels show a ground-following construction line; visually verify. Hedge and bramble now support click and brush/lasso placement in the Trees tools; verify their appearance and editing in the browser.
- Flight alignment: endpoint availability and explanatory text are implemented in the path panel and Studio; verify with real video, offsets and a flight without video.
- Visually review the mascot loop, title, responsive Welcome, editor layout and restored annex geometry in a browser. Space/Enter tool cancellation currently applies when the editor canvas has keyboard focus.

### Follow-up — greenhouse end and 2D measures

- Villetta release 7 adds an open steel east-end frame based on IMG_4341. Column spacing and rail heights are photo estimates; verify against the actual building. Existing edited copies remain unchanged.
- In 2D, measure lines can be selected in Select mode, use a contrasting selected colour, and expose their terrain details through an expandable label. The 3D measure view is still open.

### Follow-up — Studio layout and browser CI

- 2D and 3D compass widgets share the same appearance; closing Studio exits indoor mode. The editor has an expand/restore control and the Inspector can dock at the right edge at full height. Browser verification is pending.
- The browser CI condition explicitly enables the job on pull requests; confirm the actual GitHub Actions result after opening the PR. Indoor editing in 3D remains open; 3D measures were added in a later follow-up.

### Follow-up — central roof and 3D drawing

- Villetta release 8 adds an editable one-metre solid strip between barrel roofs 2 and 3, keeping the eight-metre crown, and a separately selectable ladder cabin. The cabin has an open base and doorway; its dimensions are estimates. The layout and collision are covered by model checks; visual review against the site remains pending. Existing edited copies remain unchanged.
- Fence, bridge and tunnel two-point gestures show a terrain-following preview in 3D while drawing. Browser review remains pending.

### Follow-up — flight alignment endpoints

- Start pin and start angle are enabled at the video start; end pin is enabled at the video end. Without video the flight endpoints are used. Moving away from an endpoint cancels an armed pin. Endpoint decisions have unit and service coverage; verify in the browser with real video and sync offsets.

### Follow-up — measures in 3D

- The 3D editor displays the same measure chains as the plan, permits point-by-point drawing, shows a live preview, and lets the Select tool highlight a line or expand its label. Terrain-following coordinates have automated coverage; browser interaction, label readability and accessibility still need verification.

### Follow-up — hedge and bramble placement

- The Trees and Tree brush selectors include hedge and bramble. A click creates one editable living wall; pen, square, circle and lasso fill the area with individual objects in one undo step. Placement avoids buildings and existing walls and remains within the brush outline. Browser and visual review are pending.

### Follow-up — 3D indoor editing

- Indoors and floor controls are available in the 3D editor. The selected building is displayed one floor at a time, with its roof removed; floor tools place onto that floor’s elevation. Selection of a rendered wall or column maps to the corresponding original floor.
- Verify wall, void, door, window, column and stair placement in a browser, including rotated buildings and upper floors. Basement floor tools are implemented in 2D and 3D; browser verification remains open. A basement floor opening connects to an overlapping room or curved tunnel directly below; browser verification remains open. 3D move/resize handles for rectangular buildings are implemented and await browser verification. Shaped-building move and edge handles are implemented; browser verification remains open.
- Full guide E2E on PR #85 failed on Look around in 3D, Draw a building, Plant trees with the brush and Edit with the AI assistant; showcase was flaky. The cause is not yet established and these failures remain open.

### Follow-up — 3D building handles

- In 3D Select mode, rectangular buildings have a cyan move handle and four yellow resize handles. They reuse the 2D overlap guard, snapping and single-gesture undo. Shaped buildings use a move handle and one resize handle per outline edge. Browser interaction and accessibility verification remain pending.

### Follow-up — basement floor label and height

- The indoor hint and selected void show −1 for the basement. The inspector wall-height control updates basement depth while editing −1, without changing G. A focused browser regression covers switching floors and checking both heights; GitHub browser verification remains pending.

### Follow-up — basement floor tools

- The −1 floor can be edited with walls, openings, columns, floor voids and stairs in 2D and 3D. Its data is stored separately from G, survives sanitization and participates in undo/redo. Placing basement stairs with stairwell enabled cuts a hole in G in the same undo step.
- Browser interaction and multi-angle visual checks remain pending, including independently sized and rotated basements. A basement floor opening connects to the overlapping portion of a room or curved tunnel directly below; without a lower volume, soil directly under the slab remains solid. Arbitrary basement outline editing remains open.

### Follow-up — basement floor collision

- A basement slab opening now links rendering and collision to a box room immediately below when the whole opening fits inside it. The lower ceiling is cut, the drone can pass through, and its ground height becomes the lower room floor. Unconnected openings expose solid soil below the slab rather than creating an invented underground void. Rotated opening coordinates are covered by tests.
- Curved tunnel connections have automated geometry and collision coverage; browser verification remains open. Basement outlines now support rectilinear cut, wing and edge edits in 2D; freeform diagonal outlines remain open. Visual checks of the gallery/warehouse seams and basement lighting remain pending.

### Follow-up — shaped-building 3D handles

- Shaped buildings expose a move handle and one handle per outline edge in 3D Select mode. Edge drags use the same reshape, overlap checks and undo path as 2D. Browser interaction and accessibility verification remain pending.

### Follow-up — basement outline editing

- In 2D indoor mode, the basement has edge handles and supports Cut and Wing to build rectilinear outlines independently of G. Non-centred outlines are re-centred for floor editing and rendering without moving the building above; rotated basement collision centers follow the rendered geometry. Undo and save/import are covered by tests.
- Browser verification remains pending. The underlying building geometry supports rectilinear outlines, so freeform diagonal vertex editing and holes or disconnected outline pieces remain open.

### Follow-up — basement shadow

- The ground-floor slab above a basement casts shadows, with the stairwell opening left clear. An automated ray test verifies the shadow-casting surface and opening; browser lighting verification remains pending. Gallery-road draping now follows terrain triangles; browser verification remains pending. Warehouse-perimeter flicker remains open.

### Follow-up — road and terrain seam

- Road triangles are split along the rendered terrain triangle edges, preserving their 6 cm clearance even across steep diagonal slopes. A regression checks clearance between vertices and retained road area. Verify the gallery and tunnel portals visually; warehouse-perimeter flicker remains open.

### Follow-up — partially overlapping rooms

- A basement opening can connect to an overlapping box room directly below, including when it crosses the room boundary. The room ceiling is clipped to the overlap and collision follows it; regression coverage includes the remaining intact ceiling and soil outside the lower room. Browser verification remains pending.

### Follow-up — curved tunnel connections

- Basement openings also cut overlapping pipe and vault tunnel shells directly below. The corresponding collision boxes allow passage within the opening, while the tunnel floor and surrounding shell remain solid. Pipe and vault ray/collision tests pass; multi-angle browser review remains pending.

### Follow-up — indoor browser regression

- The focused browser suite now exercises placing a basement column in 2D, switching to 3D with −1 selected, an axe scan of the 3D view, and switching between G and −1 without leaking the column. The focused browser job passed in GitHub Actions run 40502283521; manual 3D placement, handles, lighting and gallery/warehouse visual checks remain open. The cloud browser could inspect the 2D basement controls but its WebGL could not start.
