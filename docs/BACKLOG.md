# OpenBando backlog

Current work ledger, reviewed 29 October 2026 against main `a598a23` (merged #258), with every CI job of #162–#258 read (`npm run ci:status`). #154–#158 had merged with failing browser shards; their causes were fixed by #159 (Reset UI, countdown pause) and #162/#168 (Auto-sync, B-025). Closed items and their PR history are in [the archive](archive/backlog-2026-10-28.md). The [follow-up audit](audits/2026-10-28.md) records current CI evidence and documentation gaps; the [original audit](audits/2026-10-27.md) preserves its historical findings; the [archived working plan](archive/working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

## How to use this file


| Status | Requirements | Next statuses and conditions | Priority cue |
|---|---|---|---|
| **🔴 Open** | Reproducible bug or agreed capability; scope and next action recorded. | - **Investigate** if cause/scope is uncertain<br>- **Implemented** when code is complete<br>- **Blocked** if a named dependency prevents progress<br>- **Closed** if cancelled/superseded, with reason. | Coloured |
| **🟠 Investigate** | Report and unanswered question recorded; next diagnostic identified. | - **Open** when scope/cause is established<br>- **Implemented** when fixed<br>- **Blocked** if evidence/dependency is unavailable<br>- **Closed** if duplicate/not reproducible after documented investigation, with reason. | Coloured |
| **🟡 Implemented** | Code exists; required verification remains pending. | - **Verified** when all acceptance checks pass (automated ones: the merged PR's green CI run)<br>- Open or Investigate if a check fails<br>- **Blocked** if a required check cannot proceed. | Coloured |
| **🟢 Verified** | All acceptance checks passed; date, method and evidence recorded, including human/device checks when required. | - **Closed** when no action remains and resolution is recorded<br>- **Open** or **Investigate** if new evidence invalidates verification. Do not leave completed items here indefinitely. | Coloured |
| **🟣 Blocked** | Specific blocker, affected work/check and resume condition recorded. | - Return to **Open**, **Investigate** or **Implemented** when unblocked, according to remaining work<br>- **Verified** only after all checks pass<br>- **Closed** if cancelled/superseded, with reason. | Grey ◻️ |
| **🔵 Closed** | Resolution recorded and item archived; fixes normally pass through Verified, while cancellation/supersession records its reason. | - **Open** or **Investigate** if reopened by new evidence<br>Retain ID, original Opened date and historical closure record. | Grey ◻️ |


Follow [Backlog rules](BACKLOG-RULES.md) for updating records, reconciling PR/CI evidence, stale-state review, closure/archiving, human dependencies and table validation. The lifecycle table above is the quick reference. Preserve stable IDs and existing user edits.

Each item has a compact summary, followed by its human-action line (icon first: 🧑 **→ Human action required: Yes** = a human is needed, including a decision; 💻 **→ Human action required: No** = agent-owned next action, not completion), then, when a person is needed, a small table saying the issue, how to reproduce it and what to check, then the full-width **Next action / closure evidence**. Expand its details for PR history, opened/reviewed dates and verification evidence. A `---` line ends every item.

## Bugs and reliability

### B-009

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-009 | 🔶 P2 | Implemented | Simulator and selected-flight/video regression |

🧑 **→ Human action required: Yes**<br />Manually check simulator entry, collisions and selected-flight/video replay.

| | |
|---|---|
| **Issue** | Simulator entry, collisions and a selected flight with its video might regress after editor and racing changes. |
| **Reproduce** | Live site: open a bando, Fly the simulator, hit a wall; then select a recorded flight with its video and play it. |
| **Check** | The simulator starts on the pad, a crash stops it, the flight replays in step with its video. |

**Next action / closure evidence:** Manually exercise simulator entry/exit, collision and selected-flight/video replay and synchronization after editor/racing changes.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-27 |
| Verification | Pending — see PR/evidence for partial automated coverage |
| Reviewed | 2026-10-27 |

</details>

---

### B-017

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-017 | 🔶 P2 | Implemented | Villetta replay misalignment with video |

🧑 **→ Human action required: Yes**<br />Pin the demo flight at your three moments on the live site (since #258) and say whether the replay then follows the video.

| | |
|---|---|
| **Issue** | The Villetta replay is displaced from the video by GPS drift: 14 m at the greenhouse's west face, 8 m mid-greenhouse, 6 m at the store. |
| **Reproduce** | Live site, Villetta with the demo flight and its video: pause at 0:27.6, Path panel → Pin this moment, click the bottom of the west face; again at 1:13.1 (middle of the greenhouse) and 1:35.9 (leaving the store). |
| **Check** | At each pinned moment the drone is where the video shows it, the path between them follows the flight, the take-off stays on its pad; the pins come back after reloading the log, and × removes them. |

**Next action / closure evidence:** Implemented 2026-10-30 ([#258](https://github.com/voidbrain/openbando/pull/258)): Path panel → Pin this moment (arm, then click the ground in any 3D view): `core/flight/moment-pins.ts` keeps offsets in model metres per moment, blended linearly from the take-off (left where it was placed) and held after the last pin; `prepareFlight` applies them before laying the path on the ground; saved per bando, log name and fix count in local storage (model metres, no coordinates) and restored when the log is loaded again; × removes them. Tests: the offsets (`moment-pins.spec.ts`), a pinned moment lands exactly where pinned and survives reloading the log (`services.spec.ts`), the workflow in the browser (`moment-pins.e2e.ts`). History: 2026-10-30, measured on the demo flight against three moments the owner named in the video (0:27.6 out through the greenhouse's west-face bottom hole; 1:13.1 in the middle of the greenhouse; 1:35.9 leaving the store): the replay is about 14 m short along the greenhouse and 4 m aside at the first, 8 m towards its north edge at the second, 6 m inside the store's edge at the third. Not timing: the GPS horizontal acceleration matches the IMU's (accelerometer turned by the attitude) best at a 0.1 s lag (r 0.84), so the GPS is on time and the video offset (Auto-sync, r 0.88) is right; a 1.2 s GPS delay first suggested by fitting the three moments was ruled out by this test. Not a single shift or turn either: the errors change size and direction within the flight. It is GPS drift (5–15 m over a minute or two). Plan, agreed: pins at chosen moments: stop the replay where the video shows clearly where the drone is, drag it there; each pin corrects the path around its moment, blending to the next pin (start and end pins become the first two cases); pins are saved with the flight. Also release 13 raises the greenhouse crown to 11.2 m (ratio 1.1), the owner's estimate, which also brings the arch above the replayed path at the west face. History: User confirms video and log timing is synchronized and that the greenhouse is approximately 30–40 cm above the surrounding ground; release 11 models an estimated 35 cm raised floor and frame. Investigate spatial displacement around the main store and greenhouse west exit. The [demo investigation](audits/2026-10-27-villetta-replay.md) matches the screenshots and identifies a separate hidden-origin projection defect (B-018), but does not establish its effect in the saved session. The greenhouse arch control uses a dimensionless crown-height-to-half-width ratio; the inspector now labels it and displays the resulting height in metres. Confirm which control was changed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#112](https://github.com/voidbrain/openbando/pull/112) (report and arch label; alignment remains open); [#114](https://github.com/voidbrain/openbando/pull/114) (raised greenhouse; visual review pending); [#113](https://github.com/voidbrain/openbando/pull/113) (spatial investigation) |
| Opened | 2026-10-27 |
| Verification | Pending; Unit + Browser · 2026-10-30 · pin offsets, pinned moment and restore, workflow e2e passed locally; owner's check with the demo flight · Pending |
| Reviewed | 2026-10-30 |

</details>

---

### B-018

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-018 | 🔺 P1 | Implemented | Hidden-origin GPS projection distorts flight paths |

🧑 **→ Human action required: Yes**<br />Compare the corrected path with the real flight and test real GPS devices.

| | |
|---|---|
| **Issue** | Bandos without their place drew GPS paths with a false sideways bend. |
| **Reproduce** | A hidden bando with your own recorded flight; then a live GPS device. |
| **Check** | The path follows the real flight, and a live drone shows where it really is. |

**Next action / closure evidence:** A fixed local reference corrects the false sideways component and is kept with private local calibration; hidden sharing removes it. Tests cover start alignment, pin shifts, rotation, saved/imported calibration, multiple flights and the common live projection. A follow-up avoids saving a live reference before the first recorded-flight alignment; verify the pilot’s flight and real live devices. See [investigation](audits/2026-10-27-villetta-replay.md).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#113](https://github.com/voidbrain/openbando/pull/113) (investigation); [#115](https://github.com/voidbrain/openbando/pull/115) (merged projection fix); [#118](https://github.com/voidbrain/openbando/pull/118) (merged live-first correction; real-flight verification pending) |
| Opened | 2026-10-27 |
| Verification | Unit/integration · 2026-10-27 · regression tests in #118; Human + Real-device · Pending |
| Reviewed | 2026-10-27 |

</details>

---

### B-028

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-028 | 🔶 P2 | Implemented | New bando: grey map after a hidden bando, full addresses not found, Generate before a place |

🧑 **→ Human action required: Yes**<br />On the live site after merge: open a hidden bando, then New; search a full street address; check the map, the matches list and Generate.

| | |
|---|---|
| **Issue** | New bando: grey map after a hidden bando, full street addresses not found, Generate before a place. |
| **Reproduce** | Live site: open a hidden bando, then New; search a full street address. |
| **Check** | The map shows, the matches list fills (first match chosen), Generate waits for a place. |

**Next action / closure evidence:** Reported 2026-10-29 on the live site (Bandos → New → search). Causes and fixes: (1) the editor's "place hidden" state read the draft of the bando open before, so New after a hidden bando showed a grey map, "no map · place hidden" and a disabled Area step: a new bando is never place-hidden. (2) Nominatim answers nothing when OpenStreetMap lacks the street or its number (checked against the reported address): the search now retries without the house number, then without the leading parts (`coarserQueries`, two parts kept), at one request a second (Nominatim policy), and says the exact address was not found. (3) Go with several matches only opened a list: it now moves to the first match and lists all matches, the shown one marked (`aria-pressed`); another row moves the map there; the list closes with ✕ or a map drag. (4) Generate 3D was enabled before any place was chosen: on a new bando it waits for a picked match, typed coordinates or a map drag (the standalone guide step sets the place). Covered by `coarserQueries` and map-search unit cases and `e2e/new-bando.e2e.ts` (which fails with the old place-hidden check). Not checked: a real geocoder answer for a coarse fallback in a browser, pointer use on a device.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#201](https://github.com/voidbrain/openbando/pull/201) (all CI jobs green, no retries); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-29 · unit suite, `new-bando.e2e.ts` and the guide steps passed locally and in #201's CI; live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-039

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-039 | 🔶 P2 | Implemented | Opening a bando during the Welcome showcase left its flight and video playing |

🧑 **→ Human action required: Yes**<br />Open a bando while Welcome plays, on the live site (since #253).

| | |
|---|---|
| **Issue** | With Welcome playing, opening Views, then the Bandos, then an example kept the showcase's Villetta flight and video playing. |
| **Reproduce** | Live site: start Welcome; during the replay open Views (menu button), Bandos, and open an example (or Fly, Edit, New bando). |
| **Check** | Welcome's caption bar goes, the video and the replay stop, and you stay on the bando you chose. |

**Next action / closure evidence:** Reported 2026-10-30 by the owner. Only Welcome's own buttons ended the showcase (`leaveForNavigation`). Now every Bandos action that opens or switches a bando (its title, Fly, Edit, Open a fresh copy, New bando) ends a running guide first when the click is the pilot's (`isTrusted`; the guide's own clicks are synthetic), so the replay and video stop and the pilot stays where they went. `showcase.e2e.ts` reproduces the report (fails without the fix, passes with it).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#253](https://github.com/voidbrain/openbando/pull/253); report 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Browser · 2026-10-30 · `showcase.e2e.ts` (all 6, the new case included), `new-bando.e2e.ts`, `takeoff-pad.e2e.ts` passed locally; the new case fails without the fix |
| Reviewed | 2026-10-30 |

</details>

---

### B-040

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-040 | 🔶 P2 | Implemented | Dragging the timeline sometimes does not move the video |

🧑 **→ Human action required: Yes**<br />Drag the timeline again on the live site (since #257) and say whether the video still sticks.

| | |
|---|---|
| **Issue** | After timeline drags, paused, the video kept its old frame until a jump to the start and Play. |
| **Reproduce** | Live site, Villetta demo flight with its video, paused: drag the Timeline chart back and forth several times, fast, in the middle of the flight. |
| **Check** | The video frame follows every drag; if it ever sticks, it catches up within about a second by itself. |

**Next action / closure evidence:** Candidate fix 2026-10-30 ([#257](https://github.com/voidbrain/openbando/pull/257)). The owner's details: the Timeline chart, paused, the old frame stays, mid-video; only a seek to the start and Play unstuck it. Not reproduced in Chromium or WebKit headless (the video followed every drag within 0.1 s). Likely cause: the browser dropped a seek after fast drags; the video then reported the target time while showing the old frame, and both guards (`currentTime` already at the target in the timeline seek; the target unchanged in the frame sync) skipped asking again. Now every app seek goes through `seekVideo`, pending until `seeked`; while paused a seek pending for over a second is issued again, and the timeline seek no longer trusts `currentTime` while one is pending. `services.spec.ts` fakes a stalled seek (fails without the fix); `timeline-video.e2e.ts` checks drags keep the video in step with the real demo files. History: Reported 2026-10-30 by the owner, replaying the Villetta demo flight with its video (Auto-sync offset −0.69 s). A related case was fixed before: a timeline click undone while the video played (the seek-with-a-playing-video case in `services.spec.ts`). To check: a drag (many seeks in a row) while playing and while paused, at the speeds used (0.25×), and a drag that ends where the video is still seeking.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Report 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Unit · 2026-10-30 · the stalled-seek case passes (fails without the fix); Browser · 2026-10-30 · `timeline-video.e2e.ts` passed locally; the real stall not reproduced, owner's check · Pending |
| Reviewed | 2026-10-30 |

</details>

---

### B-041

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-041 | 🔶 P2 | Implemented | A pin armed while the Bandos editor showed its 3D view did nothing |

🧑 **→ Human action required: Yes**<br />Pin start (or a moment) with the editor in 3D on the live site (since this PR).

| | |
|---|---|
| **Issue** | With the Bandos editor open in 3D, Pin start / end / this moment from the Path panel armed, but a click in the editor's 3D view selected things instead of pinning. |
| **Reproduce** | Live site: a bando in the editor, 3D; load a flight; Path panel → Pin start (replay at its start) or Pin this moment; click the ground in the editor's 3D view. |
| **Check** | The path moves (toast "Start placed" or "Pinned at …"); on the editor's plan it already worked. |

**Next action / closure evidence:** Reported 2026-10-30 by the owner ("tried path pin start on studio and main 3D model, seems to do nothing"). Checked in the browser: on the main 3D view and on the editor's plan Pin start works (the start moves, toast "Start placed"); in the editor's 3D view the view stayed in its select mode, so the click picked instead of reporting the ground point. Now an armed pin puts the editor's 3D view in its ground mode. The editor's hint also had no text for Pin this moment (it said "where the flight ended"): fixed. `moment-pins.e2e.ts` pins the start on the editor's plan and a moment in its 3D view (the 3D part fails without the fix). Note for the owner's questions: Pin start moves the flight's path (where the log's first fix lands), it does not sync the video; Move the take-off pad moves the bando's take-off spot, and on a bando without its place a flight is put on the pad only when it is first loaded, so moving the pad afterwards leaves a loaded flight where it was.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | This PR; report 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Browser · 2026-10-30 · `moment-pins.e2e.ts` 2/2 locally (the editor 3D part fails without the fix); Pin start on the main 3D view checked |
| Reviewed | 2026-10-30 |

</details>

---

## Features and limitations

### F-001

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-001 | 🔶 P2 | Implemented | Cut/Wing for diagonal basement outlines |

🧑 **→ Human action required: Yes**<br />Review diagonal Cut/Wing editing and saved/imported outlines.

| | |
|---|---|
| **Issue** | Cut and Wing on diagonal basement outlines. |
| **Reproduce** | Editor: a building with a diagonal basement, Indoors −1, Cut and Wing; save, export, import. |
| **Check** | The edits work and the outline survives saving and importing. |

**Next action / closure evidence:** Recovered #117 onto current main: its merge into the former feature branch did not reach main. Diagonal Cut/Wing and 3D floor-height previews are implemented; verify browser editing and persistence. Open perimeter edges remain guarded for Cut/Wing (F-004).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (context); [#117](https://github.com/voidbrain/openbando/pull/117) (merged to former feature branch); [#121](https://github.com/voidbrain/openbando/pull/121) (recovery targeting main) |
| Opened | 2026-10-27 |
| Verification | Unit/integration · 2026-10-28 · 504 tests passed locally; Browser/accessibility + Human · Pending |
| Reviewed | 2026-10-28 |

</details>

---

### F-009

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-009 | 🔶 P2 | Implemented | Racing on real devices |

🧑 **→ Human action required: Yes**<br />Run the two-device race/GPS field checklist with real telemetry feeds.

| | |
|---|---|
| **Issue** | Racing on real devices has never been checked in the field. |
| **Reproduce** | Two devices with real telemetry, following docs/racing/README.md (field checklist). |
| **Check** | Timing, GPS loss, relay disconnect and rejoin, crowded paths in every camera behave as the checklist says. |

**Next action / closure evidence:** Follow the [field checklist](racing/README.md): align two devices, compare timing, connect two real GPS streams, verify stale hiding, GPS loss, relay disconnect/rejoin and crowded paths in every camera. No field-readiness claim until completed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-27 |
| Verification | Real-device · Pending |
| Reviewed | 2026-10-27 |

</details>

---

User-accepted fixes are preserved in the dated archives rather than repeated here. New findings reuse an existing ID when they concern the same behavior.

### F-023

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-023 | 🔹 P3 | Implemented | Bardwell House example, place hidden |

🧑 **→ Human action required: Yes**<br />On the live site after merge: Bandos → Examples → Bardwell House → Open a copy; compare the model with your photos and say what to correct.

| | |
|---|---|
| **Issue** | The Bardwell House example, place hidden. |
| **Reproduce** | Live site: Bandos → Examples → Bardwell House → Open a copy. |
| **Check** | Compare with your photos and say what to correct. |

**Next action / closure evidence:** Requested 2026-10-29 with the generated bando (private coordinates, never committed), two top views and two oblique photos. Decided with the user: a gambrel roof kind (F-022), the map's "concrete" over the west fields dropped, the real ground baked in. The input is the app's own place-hidden export (`tools/examples/data/bardwell-house.hidden.json`: embedded relative heights, origin 0, 0, no coordinates, terrain key or map names, checked before commit); `npm run examples` builds `library/bandos/bardwell-house-no-place.json` with the refinements measured on the photos (≈ 8 cm a pixel, scaled on the generated house and barn; the store's place agrees within ~2 m between the two top views): gambrel house and flat-roofed wing, gambrel barn, store, three sheds, patio and stepped brick wall, the drive's wooden fence, a camper and a car; duplicate trees removed. The FPV simulators' models of the place are game assets and were not used. Covered by `examples.spec.ts` (listed, hidden, origin 0, 0, no coordinates or names, embedded ground, gambrel roofs, store and sheds, no map surface over the fields). AGENTS' privacy rule names the place as private. Not checked: shapes and heights against the real place beyond the photos (porch, dormers, the wing's exact depth are estimates). Release 2 (user review 2026-10-29, with two more photos): the house turned a quarter (gambrel ends east and west, the flat-roofed wing south), the second drive from the lane to the front of the house under three big trees, the take-off pad in front of the house, the hedge along the south side and the south end of the east side, roads and trees cut to the area of the real heights (the map's roads ran hundreds of metres out) and the grass around ending 5 m past it; trees on a road removed. Release 3 ([#217](https://github.com/voidbrain/openbando/pull/217)): the drive's fence is the white post-and-rail fence (F-027). Release 4 ([#218](https://github.com/voidbrain/openbando/pull/218), user report with a screenshot): the dark wall flickered behind the windows of the house and its wing: the wing's north wall and the main block's south wall stood in one place (z-fighting); the wing has no north wall now (B-035 tracks the general case).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#209](https://github.com/voidbrain/openbando/pull/209) (all CI jobs green), after [#206](https://github.com/voidbrain/openbando/pull/206) (the gambrel roof); [#214](https://github.com/voidbrain/openbando/pull/214) release 2 (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/visual · 2026-10-29 · `examples.spec.ts` passed locally; 2D plan compared with the top views and a 3D view reviewed by the agent; pilot's comparison · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-021

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-021 | 🔹 P3 | Implemented | Move the take-off pad in the editor |

🧑 **→ Human action required: Yes**<br />Check the take-off pad again on the live site (since #254), and whether the 2D trail still shows in Safari.

| | |
|---|---|
| **Issue** | The take-off pad: 3D box too big and no drag, a 2D drag trail, no pad preview, a stale preview, two verbose fields. |
| **Reproduce** | Live site, Playground (its start is off every pad) and Bardwell House (its start is on its pad): Edit, select the take-off pad in 2D and in 3D, drag it, look at the inspector. |
| **Check** | The selection fits the pad (or the yellow start marker) and drags in 3D; the inspector previews the pad and has one "at (x, z)" field; in Safari, say whether dragging in 2D still leaves a trail. |

**Next action / closure evidence:** Done 2026-10-30 ([#254](https://github.com/voidbrain/openbando/pull/254)): (1) `takeoffPadIndex` (core/site-spec.ts) is the one source: the pad under the start, or none, then the start marker (`START_MARKER`, 4 m, shared by 2D and 3D) is the take-off spot; `moveTakeoff`, the 3D pick and box, the 2D drawing (`takeoffRect`), the take-off height and area trimming read it; a new browser case (start off every pad) picks and drags the marker in 2D and 3D and keeps the slab where it is; (3) and (4) the inspector preview has a `pad` target, checked before the selected building (a screenshot of Playground shows the marker); (5) one `at (x, z) m` field with its Italian. A bare start marker is drawn under the buildings, a real pad over them: on the first CI run the marker covered the centre of buildings in three editor tests and took their click. (2) not reproduced: in Chromium and WebKit headless one pad element exists during a drag and no trail shows; left to the owner's Safari check. `areas.spec.ts` set up its take-off pad by the old rule (a pad away from the start): the fixture now puts the start on it. Reopened 2026-10-30 (owner, live site, with two screenshots): (1) in 3D the selection box is much bigger than the pad and the pad cannot be dragged; (2) in 2D a drag leaves a trail of pad copies; (3) the inspector shows no 3D preview of the pad; (4) selecting the pad sometimes leaves the previous object in the inspector's preview; (5) the two x / z fields are verbose. Cause of (1), found: the code takes the last pad as the take-off pad and assumes it stands at `droneStart`, but in Playground (pad at −14, 0; start at −30, 128) and Villetta (pad at 0, 0; start at 40, −50) it does not, and Chiari e Forti has no pad: the box spans a slab and the far start marker. Plan: (1) the take-off pad is the pad under `droneStart`, or none (then the start marker alone is the take-off spot); `moveTakeoff`, the 3D pick and box, the 2D drawing and the take-off height use that one source; (2) reproduce the trail (not seen in Chromium or WebKit headless; maybe a Safari repaint of the moved SVG rect); (3) and (4) the inspector preview gets a pad target and follows the pick; (5) a compact position readout with a Move to coordinates action instead of two fields. History: Requested 2026-10-29: the take-off pad (where flights start, `droneStart`, drawn as the last pad) could not be selected or moved in the editor; a never-called `SiteService.setTakeoffAt` moved the start without the drawn pad. Now `moveTakeoff` (core) moves the last pad and the drone start together, keeping their offset (older bandos' road pads stay). In 2D the pad has a red outline; Select picks it (the inspector shows x / z in metres) and drags it in one undo step; its right-click menu has "Move to coordinates…", and the ground's right-click menu has "Move the take-off pad here". `setTakeoffAt` removed. Covered by a `layers.spec.ts` case and `e2e/takeoff-pad.e2e.ts` (drag, ground menu: the pad lands under the click, export has pad and start together). Not done: moving it in the 3D editor view.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#210](https://github.com/voidbrain/openbando/pull/210) (replaces [#207](https://github.com/voidbrain/openbando/pull/207): green CI, then a backlog conflict with #206); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-29 · `layers.spec.ts` and `takeoff-pad.e2e.ts` passed locally; live-site check · Pending; Unit + Browser · 2026-10-30 · 591 unit (take-off pad choice, move off a pad, pad preview); `takeoff-pad.e2e.ts` 4/4 and `editor-regressions.e2e.ts` 11/11 locally; inspector screenshot on Playground |
| Reviewed | 2026-10-30 |

</details>

---

### F-024

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-024 | 🔹 P3 | Implemented | Take-off pad indoors, on an upper floor or on a flat roof |

🧑 **→ Human action required: Yes**<br />On the live site after merge: put the pad inside a building with a flat roof, choose "stands on: roof" (or an upper floor), Fly, and take off from there.

| | |
|---|---|
| **Issue** | The take-off pad can stand on an upper floor or a flat roof. |
| **Reproduce** | Live site: pad inside a flat-roofed building, inspector stands on: roof (or L1), Fly. |
| **Check** | The drone starts on the roof (or floor) and takes off from there. |

**Next action / closure evidence:** Restored 2026-10-30: this record was set Implemented in #225 and put back to Open by a later backlog conflict resolution (the agent's merge helper; fixed). Requested 2026-10-29: the take-off pad (F-021) can stand inside a building on any floor, or on a flat roof; other roofs and more complex cases only on request. Plan: an optional take-off level in the spec (absent = ground, old bandos unchanged), set from the editor (Indoors on a floor, or the pad's menu "on the roof" for a flat roof), the pad and the drone drawn and started at that height, the ground under it not levelled for it. Closes with unit cases (height per level and roof, old specs) and a browser case placing it on a floor and a roof. Done 2026-10-30 ([#225](https://github.com/voidbrain/openbando/pull/225), every check green): `SiteSpec.takeoffOn` (`{ building, level }`, absent = ground, older bandos unchanged); `core/takeoff-place.ts`: `standingLevels` (upper floors, a flat roof; none for open shells or deep ruins) is the one source for the inspector's "stands on" menu, `takeoffHeight` and the model's standing surfaces; the collider's `groundAt` returns a floor or flat roof under the drone, so it rests, takes off and lands there; a roof stands `ROOF_CLEARANCE` (0.15 m, the collider margin) above its box, or every move from the pad would be a collision; the pad and the start marker are drawn at that height and the simulator starts there; in the 2D plan the take-off pad is now drawn over the buildings (it could not be picked inside one). Covered by `takeoff-place.spec.ts` (choices and heights, a vanished floor falls back to the ground, old specs, a drone resting on a roof stays clear of it and takes off) and `takeoff-pad.e2e.ts` (the menu offers ground / floor L1 / roof, the export keeps it). Not done: holes in floors (a stairwell) still count as floor; a drone flying up from below still passes through upper slabs (they are not solid); dragging the pad in 3D (F-035, since done in [#231](https://github.com/voidbrain/openbando/pull/231)).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#225](https://github.com/voidbrain/openbando/pull/225); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-30 · `takeoff-place.spec.ts` and `takeoff-pad.e2e.ts` passed locally; [#225 CI](https://github.com/voidbrain/openbando/actions/runs/40977633280) passed; flying from a roof on the live site · Pending |
| Reviewed | 2026-10-30 |

</details>

---

### F-025

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-025 | 🔹 P3 | Open | Rework the Fly checklist |

🧑 **→ Human action required: Yes**<br />Say what the Fly checklist should do differently (steps, order, what it checks, when it opens).

| | |
|---|---|
| **Issue** | The Fly checklist needs a rework. |
| **Reproduce** | Live site: Fly panel, the checklist. |
| **Check** | Say what it should do differently: steps, order, checks, when it opens. |

**Next action / closure evidence:** Requested 2026-10-29 ("the Fly checklist must be worked"). The current checklist is the Fly panel's guide (`core/fly-guide.ts`, `ui/panels/fly-panel.ts`, guide snippet `fly-checklist`). Waiting for the pilot's direction before changing it.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Not started |
| Reviewed | 2026-10-29 |

</details>

---

### F-026

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-026 | 🔹 P3 | Open | Rework the panels' "?" tips: what they cover, checked automatically |

🧑 **→ Human action required: Yes**<br />Choose the tips rework: A (recommended), B or C, described under Next action.

| | |
|---|---|
| **Issue** | The panels' "?" tips explain 9 of 407 controls. |
| **Reproduce** | docs/agents/element-map.md, Tips per file; the "?" in any panel title. |
| **Check** | Choose A (titles as tips, recommended), B (a tip for every control) or C (drop "?"). |

**Next action / closure evidence:** Requested 2026-10-29. The "?" button in every panel's title bar turns tips on hover on and off (`TourService.tips`); nobody has checked which controls they cover. Plan: an inventory per panel (controls with and without a tip), a proposal for the rework, and an automated check (unit or browser) that every control of a panel has its tip, like `check:i18n` for texts. Closes when the inventory is done, the rework is agreed and the check runs in CI. Part of F-028 (2026-10-29: the user asked whether the tips were mapped to controls; not yet). Inventory done 2026-10-30 (F-032 step 5, [#238](https://github.com/voidbrain/openbando/pull/238)): `docs/agents/element-map.md`, Tips per file: of 407 controls, 9 have a tip on hover (a guide step's `hover`), 116 a `title` (the browser's tooltip, which "?" does not use) and 286 neither, most in the editor (135), the racing controls (29) and the Elements box (19). Proposal (A, recommended): with "?" on, a control no guide step explains shows its `title` (or its accessible name) in the same tip box, so "?" covers every titled control at once; then add titles where they are missing, and a check in the element-map builder fails for an icon-only control with neither title nor tip (labelled controls explain themselves). (B) a written tip (guide step) for every control: complete but about 400 texts, each translated. (C) drop "?" and rely on titles. Waiting for the choice.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#238](https://github.com/voidbrain/openbando/pull/238) (inventory); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Inventory · 2026-10-30 · Tips per file table (element map) |
| Reviewed | 2026-10-30 |

</details>

---

### F-027

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-027 | 🔹 P3 | Implemented | Post-and-rail fence (white, three planks) |

🧑 **→ Human action required: Yes**<br />On the live site after merge: draw a fence and pick Post-and-rail in its material menu; Bardwell House's drive fence uses it.

| | |
|---|---|
| **Issue** | A white post-and-rail fence with three planks. |
| **Reproduce** | Live site: draw a fence, pick Post-and-rail; Bardwell House's drive fence. |
| **Check** | Three white planks between posts, following the ground. |

**Next action / closure evidence:** Requested 2026-10-29 for the library (Bardwell House has one). New fence material `rail`: posts every 2.4 m, three planks (`RAIL_PLANKS`) nailed to their face with open gaps between them, white by default, each plank following the ground; solid for the drone like the other fences. Material menu entry with its own icon and Italian. Covered by `site-model.spec.ts` (6 posts and 3 planks on a 12 m fence, solid). Bardwell House's drive fence is `rail` ([#217](https://github.com/voidbrain/openbando/pull/217), release 3 of the example).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#215](https://github.com/voidbrain/openbando/pull/215) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · rail case passed; 3D screenshot reviewed; live-site look · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-031

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-031 | 🔹 P3 | Implemented | Clips and films say when their sources changed since recording |

🧑 **→ Human action required: Yes**<br />Re-record the guide clips and Welcome films on a machine with the GPU and ffmpeg (`npm run clips`, `npm run films`) and review them: both sets show files changed since (the new palette among them).

| | |
|---|---|
| **Issue** | The guide clips and Welcome films are older than the code they show. |
| **Reproduce** | A machine with the GPU and ffmpeg: npm run clips, npm run films. |
| **Check** | Watch the new recordings; check:media then reports them current. |

**Next action / closure evidence:** Requested 2026-10-29 (part of F-028): clips and films are recorded in a browser (`npm run clips`, `npm run films`), so CI cannot regenerate them, and nothing says one is out of date. Done 2026-10-29: `docs/guide/media.json` (per set: the commit it was recorded at, the source globs it shows), `tools/check-media.mjs` (`npm run check:media`; a CI warning, never blocking; test files left out), and `npm run clips` / `films` stamp their set after recording. First run: the guide clips (recorded at d35f0d3) show 12 changed files and the Welcome films (73aee6e) 15, so both are due for re-recording.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#220](https://github.com/voidbrain/openbando/pull/220); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:media` lists 12 / 15 changed files; `--stamp` writes the current commit (tried and restored); re-recording · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-033

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-033 | 🔶 P2 | Implemented | Full impact map: chains, content, couplings, outside the repository, as a readable page |

🧑 **→ Human action required: Yes**<br />Read `docs/agents/impact-map.md` and say what is missing or wrong: it is meant to list everything that follows a change.

| | |
|---|---|
| **Issue** | The impact map is meant to list everything that follows a change. |
| **Reproduce** | docs/agents/impact-map.md. |
| **Check** | Say what is missing or wrong. |

**Next action / closure evidence:** Restored 2026-10-30: [#224](https://github.com/voidbrain/openbando/pull/224) set this record Implemented, and a later backlog conflict resolution put the old version back (the agent's merge helper kept main's record; fixed to merge record by record). Requested 2026-10-29: the user asked which dependencies a file trigger misses (a mascot animation synced with the Welcome films, a film that records an example bando, a theme colour that changes everything visual) and asked for a readable list of content dependencies and value couplings, plus what lies outside the repository if useful to people. Template rules already released: 1.12.0 (chains, the map page, plans become records) and 1.13.0 (inputs, wide-reach settings, couplings, audits look outside). Recorded here at once because a plan given in the conversation is otherwise forgotten (BACKLOG-RULES). Done 2026-10-30 ([#224](https://github.com/voidbrain/openbando/pull/224), harness 1.15.0): 17 rows with ids, inputs and chains (block → catalogue → examples; Chiari e Forti, Bando Villetta and the demo flight → clips → guide pages, films; theme → art, design system, clips, films; library upgrades → clips, films), 6 value couplings (film length, `DEMO_OFFSET`, theme tokens, fence materials, roof kinds, structure kinds), 8 outside sources, links to the element map, the guide and the design system. A dry run gives the user's examples: a block → catalogue, examples; Chiari e Forti → clips, guide, films; `styles.scss` → theme, art, design system, clips, guide, films and the token coupling; the tour service → the film-length and demo-offset couplings. The two couplings nothing keeps equal have their own records (F-036, F-037).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#224](https://github.com/voidbrain/openbando/pull/224) (steps 2–4; all CI jobs green after the CodeQL fix of 1.15.1); template [#16](https://github.com/voidbrain/project-harness/pull/16), [#18](https://github.com/voidbrain/project-harness/pull/18), [#20](https://github.com/voidbrain/project-harness/pull/20), [#22](https://github.com/voidbrain/project-harness/pull/22), [#24](https://github.com/voidbrain/project-harness/pull/24); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-30 · page generated (17 rows, 6 couplings, 8 outside); chains and couplings dry-run on four changes; user's reading · Pending |
| Reviewed | 2026-10-30 |

</details>

---

### F-039

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-039 | 🔹 P3 | Open | Coverage of the browser tests in the coverage table |

💻 **→ Human action required: No**<br />Next steps, in order: (1) template release: optional browser and combined coverage in `coverage-table.mjs`; (2) template, every stack with Playwright: an optional coverage fixture and merge script; (3) reconcile here, the e2e shards collect and a CI job merges.

**Next action / closure evidence:** Split from F-038 (step 3) on 2026-10-30: the unit coverage table shows `ui/` at under 1 % of lines, though its panels and editors are tested in the browser (Playwright). Until browser coverage is counted, the table says so above the numbers. Plan (2026-10-30, the user: a template thing, optional, since any project can have Playwright): (1) template `core/tools/coverage-table.mjs` reads two optional summaries besides the unit one, `coverage.browser` and `coverage.combined` in `.harness.json`; with them the table shows unit, browser and combined lines per folder, and the drop warning follows the combined numbers; without them nothing changes. (2) Template, optional for a project with Playwright: a test fixture that collects V8 coverage in Chromium when `COVERAGE=1`, and a script that turns it into the standard summary through the source maps and merges it with the unit coverage (`monocart-coverage-reports`, one dev dependency). (3) Here: the e2e tests take the fixture, each e2e shard uploads its raw coverage, a CI job after the shards merges them and prints the table (a warning, never a failure), and the baseline is refreshed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Split from F-038, 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Not implemented |
| Reviewed | 2026-10-30 |

</details>

---

## Other changes

`main` protection active 2026-10-29 (user request, set through the API): ruleset "protect main" requires `check`, `e2e (1)`–`e2e (4)` and `race-browser` and refuses force pushes and deletion. B-025 (the flaky Auto-sync check) was closed first so the required checks are reliable.

Harness templates 1.5.0 and 1.6.0 (2026-10-29, [#199](https://github.com/voidbrain/openbando/pull/199)): `check-backlog` (archives only grow: a record or closed row on `main` missing locally fails), `check-freshness` (compares with `origin/main`, counts squash merges, `freshness.auditDays`), `check-harness`, `ci-status` and `check-conventions` copied; the AGENTS failing-test and audit bullets reconciled; `.harness.json` on 1.6.0, audit cadence left at 7 days. The new tools were tried here before release: same output. CI green.

Harness template 1.7.0 (2026-10-29, [#200](https://github.com/voidbrain/openbando/pull/200)): `check-backlog` and `check-freshness` copied (freshness lists commits without a PR to review); AGENTS and BACKLOG-RULES reconciled. CI green.

Harness templates 1.8.0 and 1.9.0 (2026-10-29, [#204](https://github.com/voidbrain/openbando/pull/204)): BACKLOG-RULES gains "One repository, one backlog" (a record never waits for another repository); `check-harness` copied (comments only); the CI workflow clones the public template and runs `check:freshness` with `HARNESS_HOME`, so a PR on a project behind a release shows warnings (never blocking; a failed clone is a warning). `.harness.json` on 1.9.0. CI green; its freshness step read the cloned template ("on template v1.9.0").

The Villetta example is renamed "Bando Villetta" (2026-10-29, user request; [#210](https://github.com/voidbrain/openbando/pull/210)): its file, the guide's flight bando and the examples test. Same release: copies keep their own name.

AGENTS: a green PR that conflicts with `main` may get a push that only resolves the conflict (2026-10-29, user; [#211](https://github.com/voidbrain/openbando/pull/211), then made a template rule in 1.10.0, below); its checks run again before it can merge. Before this, #207 and #208 were replaced by new PRs for a backlog conflict.

Harness template 1.10.0 (2026-10-29, [#212](https://github.com/voidbrain/openbando/pull/212); template [#12](https://github.com/voidbrain/project-harness/pull/12)): found here, after a rule for every project (conflict-only pushes to green PRs) was first written into this project's AGENTS without asking whether it belonged to the template. AGENTS gains "Changing a harness file" (the edit is the trigger; unsure: ask before editing) and the template's PR rules (no stacked PRs, no new work on a green PR, conflict-only pushes allowed); project lines inside template sections are marked `<!-- project -->` (12 in AGENTS); the Work tracking bullet points to the new section; BACKLOG-RULES: parallel PRs' backlog conflicts are resolved in the conflicting PR; `check-freshness` copied (it lists the harness files a branch changes); `.harness.json` on 1.10.0. CI green.

Harness template 1.11.0 (2026-10-29, [#216](https://github.com/voidbrain/openbando/pull/216), CI green; template [#14](https://github.com/voidbrain/project-harness/pull/14)): the impact map (F-028); AGENTS gains "What follows a change", BACKLOG-RULES points to the map; `check-freshness` copied; `.harness.json` on 1.11.0 with nine rows. Harness 1.10.0 ([#212](https://github.com/voidbrain/openbando/pull/212)): CI green.

Harness templates 1.12.0 – 1.15.1 (2026-10-30, [#224](https://github.com/voidbrain/openbando/pull/224), CI green; 1.15.1 escapes backslashes in the impact map's cells, found by CodeQL on #224): `tools/impact-map.mjs` copied and `check-freshness` updated; AGENTS ("What follows a change", the plans-become-records bullet, audits look outside) and BACKLOG-RULES reconciled; the CI step and `npm run impact-map`; `.harness.json` on 1.15.1 with the full map (F-033).

Harness template 1.16.0 (2026-10-30, [#227](https://github.com/voidbrain/openbando/pull/227), CI green; template [#26](https://github.com/voidbrain/project-harness/pull/26)): the code coverage table (F-038 steps 1–2). `@vitest/coverage-v8` added, `npm run coverage` (every app file included, so untested files count at 0 %), CI runs the tests with coverage and `coverage-table --check` (warnings only); `docs/agents/coverage.md` and its baseline committed: core 93.8 % of lines, state 90.3 %, three 69.3 %, services 39.8 %, ui 0.8 % (its parts are tested in the browser, not counted yet), all 53.8 %; the page is linked from the impact map and has its impact row. `.harness.json` on 1.16.0.

Harness template 1.17.0 (2026-10-30, [#244](https://github.com/voidbrain/openbando/pull/244), the owner's review of the harness; template [#28](https://github.com/voidbrain/project-harness/pull/28)): AGENTS gains "What the agent does on its own, and what it asks first", the backlog-conflict sentence (`tools/merge-backlog.mjs`) and coverage refreshed only on purpose; BACKLOG-RULES steps 4 and 7 (close only from Verified; automated acceptance is the merged PR's green CI run; once merged, a line names its PR by number) and the legend; `check-backlog`, `merge-backlog` and `merge-when-green` copied. The new check found 10 such placeholders already on main: each now names its PR. B-038 closed (#243 green, alert 1 dismissed as won't fix by the owner).

Harness template 1.17.1 (2026-10-30, template [#30](https://github.com/voidbrain/project-harness/pull/30)): `check-backlog` ignores a quoted mention of the placeholder phrase; the 1.17.0 note here had quoted it and failed every PR until [#245](https://github.com/voidbrain/openbando/pull/245) reworded it.

Harness template 1.18.0 (2026-10-30, requested by the owner; template [#32](https://github.com/voidbrain/project-harness/pull/32)): a record waiting for a person shows an Issue / Reproduce / Check table under its human-action line; `check-backlog` requires it on records a branch touches. All 25 waiting records got it at once. B-011 and F-008 closed on the owner's review of Welcome.

Harness templates 1.19.0 and 1.19.1 (2026-10-30, decided with the owner after a merged placeholder twice failed `check:backlog` on every PR; template [#34](https://github.com/voidbrain/project-harness/pull/34), [#35](https://github.com/voidbrain/project-harness/pull/35)): on a PR's CI run `check-backlog` fails on a placeholder the branch adds and names the number; the rule is to write the number right after opening the PR. `merge-when-green` retries GitHub timeouts and ignores a stale failure after a push; `merge-backlog` keeps archived records gone.

Villetta release 12 (2026-10-30, the owner's photo): a deciduous tree at the greenhouse's south-west corner, 7 m with a 3.2 m crown, placed 4 m out on the corner's diagonal; copies are offered the update. The Welcome films and the clips that show Villetta follow it (F-031).

Villetta release 13 (2026-10-30, the owner): the greenhouse crown is 11.2 m (ratio 1.1) instead of the 9.3 m estimated from below; the two tests that held the old value now hold this one, with the reason.

Completed documentation and backlog changes, with PR links and verification evidence, are in [the maintenance history](archive/backlog-2026-10-28.md#completed-maintenance-and-documentation). Product work and pending media checks remain in the bug/feature records above.
