# OpenBando backlog

Active bugs and features. Reviewed 31 October 2026 against main `5eb8b3d`. [Rules](BACKLOG-RULES.md) · [Archive](archive/backlog-2026.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability

### B-009

**Simulator and selected-flight/video regression**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small | ~80% |

🧑 **→ Human action required: Yes**<br />Manually check simulator entry, collisions and selected-flight/video replay.

| | |
|---|---|
| **Issue** | Simulator entry, collisions and a selected flight with its video might regress after editor and racing changes. |
| **Reproduce** | Live site: open a bando, Fly the simulator, hit a wall; then select a recorded flight with its video and play it. |
| **Check** | The simulator starts on the pad, a crash stops it, the flight replays in step with its video. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Manually exercise simulator entry/exit, collision and selected-flight/video replay and synchronization after editor/racing changes.

**Estimates:** Small remaining effort; ~80% complete. Implementation exists; the recorded manual regression checklist remains. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-27 |
| Verification | Pending — see PR/evidence for partial automated coverage |
| Reviewed | 2026-10-27 |

</details>

---

### B-017

**Villetta replay misalignment with video**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small | ~80% |

🧑 **→ Human action required: Yes**<br />Pin the demo flight at your three moments on the live site (since #258) and say whether the replay then follows the video.

| | |
|---|---|
| **Issue** | The Villetta replay is displaced from the video by GPS drift: 14 m at the greenhouse's west face, 8 m mid-greenhouse, 6 m at the store. |
| **Reproduce** | Live site, Villetta with the demo flight and its video: pause at 0:27.6, Path panel → Pin this moment, click the bottom of the west face; again at 1:13.1 (middle of the greenhouse) and 1:35.9 (leaving the store). |
| **Check** | At each pinned moment the drone is where the video shows it, the path between them follows the flight, the take-off stays on its pad; the pins come back after reloading the log, and × removes them. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Implemented 2026-10-30 ([#258](https://github.com/voidbrain/openbando/pull/258)): Path panel → Pin this moment (arm, then click the ground in any 3D view): `core/flight/moment-pins.ts` keeps offsets in model metres per moment, blended linearly from the take-off (left where it was placed) and held after the last pin; `prepareFlight` applies them before laying the path on the ground; saved per bando, log name and fix count in local storage (model metres, no coordinates) and restored when the log is loaded again; × removes them. Tests: the offsets (`moment-pins.spec.ts`), a pinned moment lands exactly where pinned and survives reloading the log (`services.spec.ts`), the workflow in the browser (`moment-pins.e2e.ts`). History: 2026-10-30, measured on the demo flight against three moments the owner named in the video (0:27.6 out through the greenhouse's west-face bottom hole; 1:13.1 in the middle of the greenhouse; 1:35.9 leaving the store): the replay is about 14 m short along the greenhouse and 4 m aside at the first, 8 m towards its north edge at the second, 6 m inside the store's edge at the third. Not timing: the GPS horizontal acceleration matches the IMU's (accelerometer turned by the attitude) best at a 0.1 s lag (r 0.84), so the GPS is on time and the video offset (Auto-sync, r 0.88) is right; a 1.2 s GPS delay first suggested by fitting the three moments was ruled out by this test. Not a single shift or turn either: the errors change size and direction within the flight. It is GPS drift (5–15 m over a minute or two). Plan, agreed: pins at chosen moments: stop the replay where the video shows clearly where the drone is, drag it there; each pin corrects the path around its moment, blending to the next pin (start and end pins become the first two cases); pins are saved with the flight. Also release 13 raises the greenhouse crown to 11.2 m (ratio 1.1), the owner's estimate, which also brings the arch above the replayed path at the west face. History: User confirms video and log timing is synchronized and that the greenhouse is approximately 30–40 cm above the surrounding ground; release 11 models an estimated 35 cm raised floor and frame. Investigate spatial displacement around the main store and greenhouse west exit. The [demo investigation](audits/2026-10-27-villetta-replay.md) matches the screenshots and identifies a separate hidden-origin projection defect (B-018), but does not establish its effect in the saved session. The greenhouse arch control uses a dimensionless crown-height-to-half-width ratio; the inspector now labels it and displays the resulting height in metres. Confirm which control was changed.

**Estimates:** Small remaining effort; ~80% complete. Moment pins and automated coverage exist; the owner’s three-moment comparison remains. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#112](https://github.com/voidbrain/openbando/pull/112) (report and arch label; alignment remains open); [#114](https://github.com/voidbrain/openbando/pull/114) (raised greenhouse; visual review pending); [#113](https://github.com/voidbrain/openbando/pull/113) (spatial investigation) |
| Opened | 2026-10-27 |
| Verification | Pending; Unit + Browser · 2026-10-30 · pin offsets, pinned moment and restore, workflow e2e passed locally; owner's check with the demo flight · Pending |
| Reviewed | 2026-10-30 |

</details>

---

### B-018

**Hidden-origin GPS projection distorts flight paths**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔺 P1 | Implemented | 🟡 Medium | ~80% |

🧑 **→ Human action required: Yes**<br />Compare the corrected path with the real flight and test real GPS devices.

| | |
|---|---|
| **Issue** | Bandos without their place drew GPS paths with a false sideways bend. |
| **Reproduce** | A hidden bando with your own recorded flight; then a live GPS device. |
| **Check** | The path follows the real flight, and a live drone shows where it really is. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** A fixed local reference corrects the false sideways component and is kept with private local calibration; hidden sharing removes it. Tests cover start alignment, pin shifts, rotation, saved/imported calibration, multiple flights and the common live projection. A follow-up avoids saving a live reference before the first recorded-flight alignment; verify the pilot’s flight and real live devices. See [investigation](audits/2026-10-27-villetta-replay.md).

**Estimates:** Medium remaining effort; ~80% complete. Projection and automated cases exist; private-flight comparison and real GPS checks remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#113](https://github.com/voidbrain/openbando/pull/113) (investigation); [#115](https://github.com/voidbrain/openbando/pull/115) (merged projection fix); [#118](https://github.com/voidbrain/openbando/pull/118) (merged live-first correction; real-flight verification pending) |
| Opened | 2026-10-27 |
| Verification | Unit/integration · 2026-10-27 · regression tests in #118; Human + Real-device · Pending |
| Reviewed | 2026-10-27 |

</details>

---

### B-028

**New bando: grey map after a hidden bando, full addresses not found, Generate before a place**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small | ~80% |

🧑 **→ Human action required: Yes**<br />On the live site after merge: open a hidden bando, then New; search a full street address; check the map, the matches list and Generate.

| | |
|---|---|
| **Issue** | New bando: grey map after a hidden bando, full street addresses not found, Generate before a place. |
| **Reproduce** | Live site: open a hidden bando, then New; search a full street address. |
| **Check** | The map shows, the matches list fills (first match chosen), Generate waits for a place. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Reported 2026-10-29 on the live site (Bandos → New → search). Causes and fixes: (1) the editor's "place hidden" state read the draft of the bando open before, so New after a hidden bando showed a grey map, "no map · place hidden" and a disabled Area step: a new bando is never place-hidden. (2) Nominatim answers nothing when OpenStreetMap lacks the street or its number (checked against the reported address): the search now retries without the house number, then without the leading parts (`coarserQueries`, two parts kept), at one request a second (Nominatim policy), and says the exact address was not found. (3) Go with several matches only opened a list: it now moves to the first match and lists all matches, the shown one marked (`aria-pressed`); another row moves the map there; the list closes with ✕ or a map drag. (4) Generate 3D was enabled before any place was chosen: on a new bando it waits for a picked match, typed coordinates or a map drag (the standalone guide step sets the place). Covered by `coarserQueries` and map-search unit cases and `e2e/new-bando.e2e.ts` (which fails with the old place-hidden check). Not checked: a real geocoder answer for a coarse fallback in a browser, pointer use on a device.

**Estimates:** Small remaining effort; ~80% complete. Four fixes and automated cases exist; real geocoder and device pointer checks remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#201](https://github.com/voidbrain/openbando/pull/201) (all CI jobs green, no retries); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-29 · unit suite, `new-bando.e2e.ts` and the guide steps passed locally and in #201's CI; live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-041

**A pin armed while the Bandos editor showed its 3D view did nothing**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium | ~50% |

💻 **→ Human action required: No**<br />Next: make Pin start / end work while another pin mode was armed, and make the pin modes cancel each other.

| | |
|---|---|
| **Issue** | A pin armed while the Bandos editor showed its 3D view did nothing. |
| **Reproduce** | Arm Adjust position or Pin this moment, then Pin start or Pin end and click the ground in each view. |
| **Check** | Pin modes cancel each other; the selected start/end moves in the main 3D view, editor plan and editor 3D view. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The owner 2026-10-31, on the live site: it still fails. Clicking Pin start or Pin end does nothing; if Adjust position or Pin this moment was selected before, they stay selected. So the pin modes do not cancel each other, and one left armed seems to block the others. Next: reproduce it in a browser case (Adjust position or Pin this moment, then Pin start, then a click on the ground), make each pin button end the others, and check Pin start / end alone in the main 3D view, the editor's plan and its 3D view. Reported 2026-10-30 by the owner ("tried path pin start on studio and main 3D model, seems to do nothing"). Checked in the browser: on the main 3D view and on the editor's plan Pin start works (the start moves, toast "Start placed"); in the editor's 3D view the view stayed in its select mode, so the click picked instead of reporting the ground point. Now an armed pin puts the editor's 3D view in its ground mode. The editor's hint also had no text for Pin this moment (it said "where the flight ended"): fixed. `moment-pins.e2e.ts` pins the start on the editor's plan and a moment in its 3D view (the 3D part fails without the fix). Note for the owner's questions: Pin start moves the flight's path (where the log's first fix lands), it does not sync the video; Move the take-off pad moves the bando's take-off spot, and on a bando without its place a flight is put on the pad only when it is first loaded, so moving the pad afterwards leaves a loaded flight where it was.

**Estimates:** Medium remaining effort; ~50% complete. Prior view fixes exist; the owner reports a remaining mode conflict across views. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#259](https://github.com/voidbrain/openbando/pull/259); report 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Browser · 2026-10-30 · `moment-pins.e2e.ts` 2/2 locally (the editor 3D part fails without the fix); Pin start on the main 3D view checked; Human · 2026-10-31 · the owner: fails (Pin start / end do nothing; earlier modes stay selected) |
| Reviewed | 2026-10-31 |

</details>

---

### B-044

**Obstacles stop the 3D camera; it should pass through them, only the ground stops it**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟢 Small | ~0% |

💻 **→ Human action required: No**<br />Next: find where the 3D camera collides with buildings and obstacles and limit it to the ground.

| | |
|---|---|
| **Issue** | Obstacles stop the 3D camera; it should pass through them, only the ground stops it. |
| **Reproduce** | Orbit around a building or obstacle in the main and editor 3D views. |
| **Check** | The camera passes through model obstacles; the ground still limits it. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The owner 2026-10-31: obstacles should not stop the camera but let it pass through; the ground can stop it. Next: find which views clamp the camera against the model (orbit in the main 3D view, the editor's 3D view), keep only the ground limit, and cover it with a unit case on the camera rig; ask the owner which view if both behave correctly.

**Estimates:** Small remaining effort; ~0% complete. A new camera constraint request; no implementation recorded. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#268](https://github.com/voidbrain/openbando/pull/268) (recorded); Report 2026-10-31 |
| Opened | 2026-10-31 |
| Verification | Pending |
| Reviewed | 2026-10-31 |

</details>

---

### B-045

**After a timeline click the video can stay stuck on an old frame**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟠 | 🔶 P2 | Investigate | 🟡 Medium | ~10% |

💻 **→ Human action required: No**<br />Next: reproduce the stuck video after a timeline click (Safari and Chromium) and find the cause.

| | |
|---|---|
| **Issue** | After a timeline click the video can stay stuck on an old frame. |
| **Reproduce** | Load a flight and video; click the timeline repeatedly while paused and playing in Safari and Chromium. |
| **Check** | Each seek presents the matching video frame; Play resumes without returning to the first frame. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The owner 2026-10-31: "there still is the timeline click-video-stuck problem; don't know if Safari, needs investigation" (B-040, the Safari repaint after Auto-sync, is solved). Earlier report 2026-10-30: Timeline panel, paused, an old frame in the middle of the video; to unlock it, ⏮ back to the first frame and Play, then the video follows again. Next: a browser case that clicks the timeline repeatedly while paused and playing and checks the video's time and that a new frame was presented (`requestVideoFrameCallback`), in Chromium and WebKit; then the fix.

**Estimates:** Medium remaining effort; ~10% complete. The symptom and recovery are known; reproduction, diagnosis and browser fix remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#268](https://github.com/voidbrain/openbando/pull/268) (recorded); Report 2026-10-31 (and 2026-10-30) |
| Opened | 2026-10-31 |
| Verification | Pending |
| Reviewed | 2026-10-31 |

</details>

---

## Features and limitations

### F-001

**Cut/Wing for diagonal basement outlines**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small | ~80% |

🧑 **→ Human action required: Yes**<br />Review diagonal Cut/Wing editing and saved/imported outlines.

| | |
|---|---|
| **Issue** | Cut and Wing on diagonal basement outlines. |
| **Reproduce** | Editor: a building with a diagonal basement, Indoors −1, Cut and Wing; save, export, import. |
| **Check** | The edits work and the outline survives saving and importing. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Recovered #117 onto current main: its merge into the former feature branch did not reach main. Diagonal Cut/Wing and 3D floor-height previews are implemented; verify browser editing and persistence. Open perimeter edges remain guarded for Cut/Wing (F-004).

**Estimates:** Small remaining effort; ~80% complete. Recovered implementation exists; diagonal editing and persistence acceptance remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (context); [#117](https://github.com/voidbrain/openbando/pull/117) (merged to former feature branch); [#121](https://github.com/voidbrain/openbando/pull/121) (recovery targeting main) |
| Opened | 2026-10-27 |
| Verification | Unit/integration · 2026-10-28 · 504 tests passed locally; Browser/accessibility + Human · Pending |
| Reviewed | 2026-10-28 |

</details>

---

### F-009

**Racing on real devices**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟡 Medium | ~70% |

🧑 **→ Human action required: Yes**<br />Run the two-device race/GPS field checklist with real telemetry feeds.

| | |
|---|---|
| **Issue** | Racing on real devices has never been checked in the field. |
| **Reproduce** | Two devices with real telemetry, following docs/racing/README.md (field checklist). |
| **Check** | Timing, GPS loss, relay disconnect and rejoin, crowded paths in every camera behave as the checklist says. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Follow the [field checklist](racing/README.md): align two devices, compare timing, connect two real GPS streams, verify stale hiding, GPS loss, relay disconnect/rejoin and crowded paths in every camera. No field-readiness claim until completed.

**Estimates:** Medium remaining effort; ~70% complete. Racing implementation exists; two-device field scenarios have never been checked. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-27 |
| Verification | Real-device · Pending |
| Reviewed | 2026-10-27 |

</details>

---

### F-021

**Move the take-off pad in the editor**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟡 Medium | ~60% |

💻 **→ Human action required: No**<br />Next: three fixes from the owner's check (live preview in 3D, drag the pad itself, the pad on a raised building).

| | |
|---|---|
| **Issue** | Move the take-off pad in the editor. |
| **Reproduce** | Select and drag the take-off pad slab in editor 3D, including onto the raised greenhouse. |
| **Check** | The slab itself drags with live preview, remains visible on drop, and moves in one undo step. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The owner 2026-10-31, on the live site: it works, but (1) dragging in 3D shows no preview: the result appears only on release (the same issue other drags had; the rule: every drag previews its result live); (2) only the blue box on top of the pad can be grabbed: the pad itself should be what drags (and the box avoided); (3) dragging it onto the greenhouse, which stands above the ground, makes the pad disappear. Next: each one fixed with a browser case (the 3D drag previews; a press on the pad slab drags it; a drop on a raised building keeps it visible, on the ground or its roof as F-024 decides). Done 2026-10-30 ([#254](https://github.com/voidbrain/openbando/pull/254)): (1) `takeoffPadIndex` (core/site-spec.ts) is the one source: the pad under the start, or none, then the start marker (`START_MARKER`, 4 m, shared by 2D and 3D) is the take-off spot; `moveTakeoff`, the 3D pick and box, the 2D drawing (`takeoffRect`), the take-off height and area trimming read it; a new browser case (start off every pad) picks and drags the marker in 2D and 3D and keeps the slab where it is; (3) and (4) the inspector preview has a `pad` target, checked before the selected building (a screenshot of Playground shows the marker); (5) one `at (x, z) m` field with its Italian. A bare start marker is drawn under the buildings, a real pad over them: on the first CI run the marker covered the centre of buildings in three editor tests and took their click. (2) not reproduced: in Chromium and WebKit headless one pad element exists during a drag and no trail shows; left to the owner's Safari check. `areas.spec.ts` set up its take-off pad by the old rule (a pad away from the start): the fixture now puts the start on it. Reopened 2026-10-30 (owner, live site, with two screenshots): (1) in 3D the selection box is much bigger than the pad and the pad cannot be dragged; (2) in 2D a drag leaves a trail of pad copies; (3) the inspector shows no 3D preview of the pad; (4) selecting the pad sometimes leaves the previous object in the inspector's preview; (5) the two x / z fields are verbose. Cause of (1), found: the code takes the last pad as the take-off pad and assumes it stands at `droneStart`, but in Playground (pad at −14, 0; start at −30, 128) and Villetta (pad at 0, 0; start at 40, −50) it does not, and Chiari e Forti has no pad: the box spans a slab and the far start marker. Plan: (1) the take-off pad is the pad under `droneStart`, or none (then the start marker alone is the take-off spot); `moveTakeoff`, the 3D pick and box, the 2D drawing and the take-off height use that one source; (2) reproduce the trail (not seen in Chromium or WebKit headless; maybe a Safari repaint of the moved SVG rect); (3) and (4) the inspector preview gets a pad target and follows the pick; (5) a compact position readout with a Move to coordinates action instead of two fields. History: Requested 2026-10-29: the take-off pad (where flights start, `droneStart`, drawn as the last pad) could not be selected or moved in the editor; a never-called `SiteService.setTakeoffAt` moved the start without the drawn pad. Now `moveTakeoff` (core) moves the last pad and the drone start together, keeping their offset (older bandos' road pads stay). In 2D the pad has a red outline; Select picks it (the inspector shows x / z in metres) and drags it in one undo step; its right-click menu has "Move to coordinates…", and the ground's right-click menu has "Move the take-off pad here". `setTakeoffAt` removed. Covered by a `layers.spec.ts` case and `e2e/takeoff-pad.e2e.ts` (drag, ground menu: the pad lands under the click, export has pad and start together). Not done: moving it in the 3D editor view.

**Estimates:** Medium remaining effort; ~60% complete. Pad identity, preview and editing work partly; three concrete drag/visibility defects remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#210](https://github.com/voidbrain/openbando/pull/210) (replaces [#207](https://github.com/voidbrain/openbando/pull/207): green CI, then a backlog conflict with #206); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-29 · `layers.spec.ts` and `takeoff-pad.e2e.ts` passed locally; live-site check · Pending; Unit + Browser · 2026-10-30 · 591 unit (take-off pad choice, move off a pad, pad preview); `takeoff-pad.e2e.ts` 4/4 and `editor-regressions.e2e.ts` 11/11 locally; inspector screenshot on Playground; Human · 2026-10-31 · the owner: works; no 3D preview, only the box drags, vanishes over the greenhouse |
| Reviewed | 2026-10-31 |

</details>

---

### F-024

**Take-off pad indoors, on an upper floor or on a flat roof**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟢 Small | ~80% |

💻 **→ Human action required: No**<br />Next: when the pad moves from indoors onto the roof, show the roof again (and the pad on it).

| | |
|---|---|
| **Issue** | Take-off pad indoors, on an upper floor or on a flat roof. |
| **Reproduce** | Hide a building roof while indoors; move the take-off pad onto its flat roof. |
| **Check** | The roof becomes visible again and the pad stands visibly at the correct height; older ground pads still work. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The owner 2026-10-31, on the live site: the pad indoors with the roof hidden; moved onto the roof, the view still shows the indoors, and the pad moves but cannot be seen. The roof should appear when the pad stands on it. Next: a pad set on the roof turns the hidden roof back on (or draws the pad over it), with a browser case. Restored 2026-10-30: this record was set Implemented in #225 and put back to Open by a later backlog conflict resolution (the agent's merge helper; fixed). Requested 2026-10-29: the take-off pad (F-021) can stand inside a building on any floor, or on a flat roof; other roofs and more complex cases only on request. Plan: an optional take-off level in the spec (absent = ground, old bandos unchanged), set from the editor (Indoors on a floor, or the pad's menu "on the roof" for a flat roof), the pad and the drone drawn and started at that height, the ground under it not levelled for it. Closes with unit cases (height per level and roof, old specs) and a browser case placing it on a floor and a roof. Done 2026-10-30 ([#225](https://github.com/voidbrain/openbando/pull/225), every check green): `SiteSpec.takeoffOn` (`{ building, level }`, absent = ground, older bandos unchanged); `core/takeoff-place.ts`: `standingLevels` (upper floors, a flat roof; none for open shells or deep ruins) is the one source for the inspector's "stands on" menu, `takeoffHeight` and the model's standing surfaces; the collider's `groundAt` returns a floor or flat roof under the drone, so it rests, takes off and lands there; a roof stands `ROOF_CLEARANCE` (0.15 m, the collider margin) above its box, or every move from the pad would be a collision; the pad and the start marker are drawn at that height and the simulator starts there; in the 2D plan the take-off pad is now drawn over the buildings (it could not be picked inside one). Covered by `takeoff-place.spec.ts` (choices and heights, a vanished floor falls back to the ground, old specs, a drone resting on a roof stays clear of it and takes off) and `takeoff-pad.e2e.ts` (the menu offers ground / floor L1 / roof, the export keeps it). Not done: holes in floors (a stairwell) still count as floor; a drone flying up from below still passes through upper slabs (they are not solid); dragging the pad in 3D (F-035, since done in [#231](https://github.com/voidbrain/openbando/pull/231)).

**Estimates:** Small remaining effort; ~80% complete. Floor and roof placement exist; roof visibility on moving from indoors remains. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#225](https://github.com/voidbrain/openbando/pull/225); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-30 · `takeoff-place.spec.ts` and `takeoff-pad.e2e.ts` passed locally; [#225 CI](https://github.com/voidbrain/openbando/actions/runs/40977633280) passed; flying from a roof on the live site · Pending; Human · 2026-10-31 · the owner: on the roof the pad is not visible, the roof stays hidden |
| Reviewed | 2026-10-31 |

</details>

---

### F-025

**Rework the Fly checklist**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟡 Medium | ~0% |

🧑 **→ Human action required: Yes**<br />Say what the Fly checklist should do differently (steps, order, what it checks, when it opens).

| | |
|---|---|
| **Issue** | The Fly checklist needs a rework. |
| **Reproduce** | Live site: Fly panel, the checklist. |
| **Check** | Say what it should do differently: steps, order, checks, when it opens. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-10-29 ("the Fly checklist must be worked"). The current checklist is the Fly panel's guide (`core/fly-guide.ts`, `ui/panels/fly-panel.ts`, guide snippet `fly-checklist`). Waiting for the pilot's direction before changing it.

**Estimates:** Medium remaining effort; ~0% complete. The rework is unscoped pending the pilot’s direction; effort is provisional. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | Request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Not started |
| Reviewed | 2026-10-29 |

</details>

---

### F-026

**Rework the panels' "?" tips: what they cover, checked automatically**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟡 Medium | ~20% |

🧑 **→ Human action required: Yes**<br />Choose A (title-based tips), B (a tip per control) or C (remove tips).

| | |
|---|---|
| **Issue** | The panels' "?" tips explain 9 of 407 controls. |
| **Reproduce** | docs/agents/element-map.md, Tips per file; the "?" in any panel title. |
| **Check** | Choose A (titles as tips, recommended), B (a tip for every control) or C (drop "?"). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-10-29. The "?" button in every panel's title bar turns tips on hover on and off (`TourService.tips`); nobody has checked which controls they cover. Plan: an inventory per panel (controls with and without a tip), a proposal for the rework, and an automated check (unit or browser) that every control of a panel has its tip, like `check:i18n` for texts. Closes when the inventory is done, the rework is agreed and the check runs in CI. Part of F-028 (2026-10-29: the user asked whether the tips were mapped to controls; not yet). Inventory done 2026-10-30 (F-032 step 5, [#238](https://github.com/voidbrain/openbando/pull/238)): `docs/agents/element-map.md`, Tips per file: of 407 controls, 9 have a tip on hover (a guide step's `hover`), 116 a `title` (the browser's tooltip, which "?" does not use) and 286 neither, most in the editor (135), the racing controls (29) and the Elements box (19). Proposal (A, recommended): with "?" on, a control no guide step explains shows its `title` (or its accessible name) in the same tip box, so "?" covers every titled control at once; then add titles where they are missing, and a check in the element-map builder fails for an icon-only control with neither title nor tip (labelled controls explain themselves). (B) a written tip (guide step) for every control: complete but about 400 texts, each translated. (C) drop "?" and rely on titles. Waiting for the choice.<br />Previous next-action summary: Choose the tips rework: A (recommended), B or C, described under Next action.

**Estimates:** Reassessed after the example info control: it has a title and accessible name; the dated inventory remains historical. Scope and estimates unchanged. Medium remaining effort; ~20% complete. Inventory and options exist; the owner’s choice, implementation and coverage check remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#238](https://github.com/voidbrain/openbando/pull/238) (inventory); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Inventory · 2026-10-30 · Tips per file table (element map) |
| Reviewed | 2026-10-30 |

</details>

---

### F-031

**Clips and films say when their sources changed since recording**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔹 P3 | Implemented | 🟡 Medium | ~70% |

🧑 **→ Human action required: Yes**<br />Re-record and review the guide clips and Welcome films.

| | |
|---|---|
| **Issue** | The guide clips and Welcome films are older than the code they show. |
| **Reproduce** | A machine with the GPU and ffmpeg: npm run clips, npm run films. |
| **Check** | Watch the new recordings; check:media then reports them current. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-10-29 (part of F-028): clips and films are recorded in a browser (`npm run clips`, `npm run films`), so CI cannot regenerate them, and nothing says one is out of date. Done 2026-10-29: `docs/guide/media.json` (per set: the commit it was recorded at, the source globs it shows), `tools/check-media.mjs` (`npm run check:media`; a CI warning, never blocking; test files left out), and `npm run clips` / `films` stamp their set after recording. First run: the guide clips (recorded at d35f0d3) show 12 changed files and the Welcome films (73aee6e) 15, so both are due for re-recording.<br />Previous next-action summary: Re-record the guide clips and Welcome films on a machine with the GPU and ffmpeg (`npm run clips`, `npm run films`) and review them: both sets show files changed since (the new palette among them).

**Estimates:** Reassessed after moving example descriptions into a tooltip: review/re-record any Bandos clip showing the examples. Local Playwright browser download failed, so recording remains pending; estimates unchanged. Medium remaining effort; ~70% complete. Freshness tooling exists; recording and review of both media sets remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#220](https://github.com/voidbrain/openbando/pull/220); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:media` lists 12 / 15 changed files; `--stamp` writes the current commit (tried and restored); re-recording · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-033

**Full impact map: chains, content, couplings, outside the repository, as a readable page**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small | ~90% |

🧑 **→ Human action required: Yes**<br />Read `docs/agents/impact-map.md` and say what is missing or wrong: it is meant to list everything that follows a change.

| | |
|---|---|
| **Issue** | The impact map is meant to list everything that follows a change. |
| **Reproduce** | docs/agents/impact-map.md. |
| **Check** | Say what is missing or wrong. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Restored 2026-10-30: [#224](https://github.com/voidbrain/openbando/pull/224) set this record Implemented, and a later backlog conflict resolution put the old version back (the agent's merge helper kept main's record; fixed to merge record by record). Requested 2026-10-29: the user asked which dependencies a file trigger misses (a mascot animation synced with the Welcome films, a film that records an example bando, a theme colour that changes everything visual) and asked for a readable list of content dependencies and value couplings, plus what lies outside the repository if useful to people. Template rules already released: 1.12.0 (chains, the map page, plans become records) and 1.13.0 (inputs, wide-reach settings, couplings, audits look outside). Recorded here at once because a plan given in the conversation is otherwise forgotten (BACKLOG-RULES). Done 2026-10-30 ([#224](https://github.com/voidbrain/openbando/pull/224), harness 1.15.0): 17 rows with ids, inputs and chains (block → catalogue → examples; Chiari e Forti, Bando Villetta and the demo flight → clips → guide pages, films; theme → art, design system, clips, films; library upgrades → clips, films), 6 value couplings (film length, `DEMO_OFFSET`, theme tokens, fence materials, roof kinds, structure kinds), 8 outside sources, links to the element map, the guide and the design system. A dry run gives the user's examples: a block → catalogue, examples; Chiari e Forti → clips, guide, films; `styles.scss` → theme, art, design system, clips, guide, films and the token coupling; the tour service → the film-length and demo-offset couplings. The two couplings nothing keeps equal have their own records (F-036, F-037).

**Estimates:** Small remaining effort; ~90% complete. The generated map and dry runs exist; the requested owner review remains. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#224](https://github.com/voidbrain/openbando/pull/224) (steps 2–4; all CI jobs green after the CodeQL fix of 1.15.1); template [#16](https://github.com/voidbrain/project-harness/pull/16), [#18](https://github.com/voidbrain/project-harness/pull/18), [#20](https://github.com/voidbrain/project-harness/pull/20), [#22](https://github.com/voidbrain/project-harness/pull/22), [#24](https://github.com/voidbrain/project-harness/pull/24); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-30 · page generated (17 rows, 6 couplings, 8 outside); chains and couplings dry-run on four changes; user's reading · Pending |
| Reviewed | 2026-10-30 |

</details>

---

### F-039

**Coverage of the browser tests in the coverage table**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🔴 Large | ~10% |

💻 **→ Human action required: No**<br />Next steps, in order: (1) template release: optional browser and combined coverage in `coverage-table.mjs`; (2) template, every stack with Playwright: an optional coverage fixture and merge script; (3) reconcile here, the e2e shards collect and a CI job merges.

| | |
|---|---|
| **Issue** | Coverage of the browser tests in the coverage table. |
| **Reproduce** | Run unit and Chromium browser coverage, then generate the coverage table; repeat without browser coverage configured. |
| **Check** | Configured projects show unit/browser/combined coverage; unconfigured projects retain current output and warning-only behaviour. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Split from F-038 (step 3) on 2026-10-30: the unit coverage table shows `ui/` at under 1 % of lines, though its panels and editors are tested in the browser (Playwright). Until browser coverage is counted, the table says so above the numbers. Plan (2026-10-30, the user: a template thing, optional, since any project can have Playwright): (1) template `core/tools/coverage-table.mjs` reads two optional summaries besides the unit one, `coverage.browser` and `coverage.combined` in `.harness.json`; with them the table shows unit, browser and combined lines per folder, and the drop warning follows the combined numbers; without them nothing changes. (2) Template, optional for a project with Playwright: a test fixture that collects V8 coverage in Chromium when `COVERAGE=1`, and a script that turns it into the standard summary through the source maps and merges it with the unit coverage (`monocart-coverage-reports`, one dev dependency). (3) Here: the e2e tests take the fixture, each e2e shard uploads its raw coverage, a CI job after the shards merges them and prints the table (a warning, never a failure), and the baseline is refreshed.

**Estimates:** Large remaining effort; ~10% complete. The integration plan exists; template options, collection, conversion and CI integration remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | Split from F-038, 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Not implemented |
| Reviewed | 2026-10-30 |

</details>

---

### F-040

**Adjust the replay drone's position in 3D, height included**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium | ~60% |

💻 **→ Human action required: No**<br />Next: find why a height set with Adjust position goes back to the wrong height about a metre later.

| | |
|---|---|
| **Issue** | Adjust the replay drone's position in 3D, height included. |
| **Reproduce** | Villetta demo: Adjust position at 0:28, correct height, then replay about a metre onward; also try editor 3D. |
| **Check** | Height follows the intended pin blend without an unexplained reset; adjustment works in the agreed 3D views. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The owner 2026-10-31, on the live site: Adjust position works; at 0:28 (one of the marked moments) the height was corrected and held, but about a metre of flight later the path went back to the wrong height. Not yet known whether that is the pin's blend toward the next pin (or the implicit take-off anchor), a later pin with no height, or the clamp that keeps the path above the ground. Next: reproduce on the demo flight with one height pin at 0:28, plot `pinOffset` dy around it, fix and cover it in `moment-pins.spec.ts`. Implemented 2026-10-30 ([#262](https://github.com/voidbrain/openbando/pull/262)): pins carry `dy` (blended like `dx`, `dz`; older saved pins read 0; the path never goes under the ground); Path panel → Adjust position puts a three.js TransformControls on the replay drone in the main 3D view (`three/adjust-gizmo.ts`); the orbit steps aside while the pointer is on it (`ControlTarget.blocked`); dragging previews the path live (`FlightService.previewPins`), Enter or the button again keeps one pin, Esc restores; arrow keys nudge 0.5 m (Shift+↑↓ vertical), captured so they do not seek the replay. The Path panel's pin buttons sit two to a row (the column had grown taller than the panel). Not done yet: the control in the editor's 3D view (Pin this moment works there). Tests: height in `moment-pins.spec.ts`; the keyboard path in `moment-pins.e2e.ts` (a pin, the replay not moved). History: Requested 2026-10-30 by the owner after trying Pin this moment (B-017): pins only move the drone across the ground, and its height still comes from the barometer and the ground under it. Plan: pins carry `dy` too (blended the same way, the take-off still at 0); "Adjust position" puts a move control (three axes and three planes, three.js TransformControls) on the replay drone in the main 3D view and the editor's 3D view; dragging moves the drone at this moment, Enter or a click elsewhere confirms (one pin), Esc cancels; arrow keys nudge it (Shift: vertical) for keyboard use. The automatic proposals of F-041 are pins of this kind, accepted or corrected with the same control.

**Estimates:** Medium remaining effort; ~60% complete. Main-view height pins and controls exist; the reported height reset and editor control remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | Request 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Unit + Browser · 2026-10-30 · height pins, keyboard adjust e2e passed locally (the mouse drag is the owner's check); the keyboard e2e read the replay time before the seek reached the caption and failed on #264's CI, fixed in [#265](https://github.com/voidbrain/openbando/pull/265) (test only); Human · 2026-10-31 · the owner: the height holds at the pin, then returns about a metre later |
| Reviewed | 2026-10-31 |

</details>

---

### F-041

**Align a replay to the model automatically, with a confidence level**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🔴 Large | ~20% |

💻 **→ Human action required: No**<br />Build the collision detector, then measure the learned-feature experiment.

| | |
|---|---|
| **Issue** | Align a replay to the model automatically, with a confidence level. |
| **Reproduce** | Demo flight: inspect solid-crossing stretches; measure local vision candidates at 0:27.6, 1:13.1 and 1:35.9. |
| **Check** | Detector lists and seeks to suspect stretches; learned-feature experiment meets the recorded ~3 m criterion before any alignment button ships. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Steps, decided by the owner 2026-10-30 after the full run below:<br />Previous next-action summary: Next, decided by the owner 2026-10-30: step 1, the detector (moments where the replay goes through a solid, one click to fix them by hand); then step 2, learned image features in place of edges, measured on the three moments before any UI.
1. **Detector** (to implement): the Path panel lists the moments where the replayed path goes through a solid (the collisions of the work-in-progress service, grouped into stretches: on the demo flight 0:05–0:07, 1:17–1:19, 1:33–1:37); a click seeks there with Adjust position on. It tells the pilot where to look; the pilot corrects. A unit test on the stretch grouping and an e2e on the list and the jump.
2. **Learned image features** (to implement, an experiment first): a small vision encoder (DINOv2-small or similar, ~90 MB, run in the browser with WebGPU/ONNX, frames never leave the machine) scores candidates instead of edges, as a re-ranker of the few best per moment. Measured on the three moments with `tools/prototypes/align-measure.e2e.ts` before any button: it must land within ~3 m of the owner's shifts on their axes, or the button does not ship.

Full run 2026-10-30 (branch `feat/align-automatically`, not merged: Viterbi search `core/flight/auto-align.ts` with tests, FPV render-and-compare `three/visual-match.ts`, `AutoAlignService`, an Align automatically row in the Path panel): 49 moments every 2 s in 793 s (16 s each, coarse-to-fine). It proposed nothing useful: 47 unsure, 2 "likely" with no shift, no shift at the three moments. Per-moment logs: the edge score's spread over all 1,156 candidates is often 0.05–0.2 (of −1..1), its best shift jumps between moments and often sits on the ±12 m edge of the grid, and near the owner's moments it disagrees with them (27.6: +4, +8 vs −14, +2.6; 73.1: +12, +4 vs z +7.7; 95.9: +12, −12 vs x −4.9). The search then rightly keeps the path: small inconsistent gains never pay for distance and smoothness. Edges of the untextured model against real footage are not a usable signal over a whole flight; the three hand-picked moments of the prototype were the favourable case. The collision signal is real (19 fixes inside a solid at 1:17–1:19: the owner's "leaving the store, the model still has me indoors") but says where, not which way: hence step 1. IMU + GPS smoothing (Kalman, the log's accelerometer) was also considered: it fixes the drift's shape, not its absolute position; not chosen.

Prototypes 2026-10-30 ([#263](https://github.com/voidbrain/openbando/pull/263), `tools/prototypes/`, not part of the app or CI), on the demo flight against the owner's three moments, converted to site shifts (x east, z south): 0:27.6 ≈ (−14, +2.6), low; 1:13.1 ≈ +7.7 across the greenhouse (z); 1:35.9 ≈ −4.9 across the store (x). Geometric (`align-collisions.ts`, the simulator's collider): the path passes through solids in six stretches, only one of them an owner's moment (1:35.9; the greenhouse is an open frame, so its drift hits nothing); there the cheapest clearing shift (height shifts weighted 3×, the barometer holds over seconds) is 0.9 m out and 3.5 m down, against ~5 m out observed, and "4 m up" costs almost the same: a detector of impossible stretches, not a measure; with two near-equal options the confidence rule would ask, as intended. Visual (`visual-probe.e2e.ts`): the model alone rendered from the replay's FPV camera on a grid of shifts (±16 m, four heights), edges compared with the video frame. The unshifted render scores −0.05 / 0.07 / 0.14, the best 0.24 / 0.31 / 0.26: at 0:27.6 x −10, z +10, 3 m lower (the tree and the end-frame legs line up as in the video); at 1:13.1 z +4 (half of +7.7) plus 12 m along the tunnel; at 1:35.9 x −8 (−4.9 observed) with the along-store axis flat. Right direction every time, 3–4 m off on the axis it sees, blind along the view and along repeated structure (the 4.6 m ribs). One moment cannot fix the position in 3D; moments together can, because the heading changes along the flight and the drift is slow. Cost: about 1.7 min per moment (1156 renders, headless): over an hour per flight at this grid, minutes with a coarse-to-fine search; not real time. Pathfinding (the owner asked): the fusion is map matching, a Viterbi search over candidate shifts per fix: costs for distance from the GPS (height dearer), for being inside a solid (high but finite, so a gap missing from the model can still be crossed, and that is when to ask about it), and for a poor video match; the shift may change only slowly between fixes. History: Requested 2026-10-30 by the owner. Two signals together. Geometric: where the replayed path passes through something solid, look for the smallest smooth shift that threads a nearby opening of the model. Visual: at that moment, render the FPV view at the shifted and unshifted positions and compare each with the video frame (local, no service). The model may lack small gaps that exist, so a path through a wall is evidence about the model as much as about the GPS. Confidence decides: both agree → go (automatic pins, marked, undoable); one sure, the other neutral → propose (dashed path, accept or reject); they disagree (through a wall, no opening near, the video prefers the unshifted path) → ask ("the flight goes through here, the model has no opening: add one?"). Prototype first: on the demo flight, how close the suggestions land to the owner's pins (0:27.6 west-face hole, 1:13.1 mid-greenhouse, 1:35.9 leaving the store), and whether hiding one opening in a copy of the model makes it ask instead of forcing a detour. A vision-language model on frame pairs was considered: hints rather than metres, seconds per call, and it would send frames of a private place to a service; only ever an opt-in experiment, if the local signals fall short. Not real time.

**Estimates:** Large remaining effort; ~20% complete. Prototypes established limits; detector and learned-feature experiment remain with uncertain outcome. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#263](https://github.com/voidbrain/openbando/pull/263) (prototypes); branch `feat/align-automatically` (full run, not merged); [#266](https://github.com/voidbrain/openbando/pull/266) (findings, steps); request 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Prototype · 2026-10-30 · geometric and visual probes on the demo flight; full run on the whole flight: no usable shift (numbers above) |
| Reviewed | 2026-10-30 |

</details>

---

### F-042

**Right-click in the editor's 3D view: the same context menu as on the plan**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟡 Medium | ~0% |

💻 **→ Human action required: No**<br />Next: open the plan's context menu on a right-click on any element (or the ground) in the 3D view.

| | |
|---|---|
| **Issue** | Right-click in the editor's 3D view: the same context menu as on the plan. |
| **Reproduce** | Editor 3D view: right-click a building, another element and empty ground. |
| **Check** | The same contextual actions as the plan open for the picked element or ground point. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The owner 2026-10-31: a right-click on the ground (on every element) in 3D does nothing; it could open the contextual menu as in 2D. Next: reuse the plan's menu with the 3D pick (`userData.pick`, the ground point), a browser case for a building and the ground.

**Estimates:** Medium remaining effort; ~0% complete. New request; context-menu picking and browser coverage remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#268](https://github.com/voidbrain/openbando/pull/268) (recorded); Request 2026-10-31 |
| Opened | 2026-10-31 |
| Verification | Pending |
| Reviewed | 2026-10-31 |

</details>

---

### F-043

**Line tools also draw by click A, live preview, click B (keeping the drag)**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🔴 | 🔹 P3 | Open | 🔴 Large | ~10% |

💻 **→ Human action required: No**<br />Implement two-click drawing alongside drag for every line tool.

| | |
|---|---|
| **Issue** | Line tools also draw by click A, live preview, click B (keeping the drag). |
| **Reproduce** | Editor: Fence, Wall, Road, Water line, Tunnel and Bridge; click A, move, click B; also drag. |
| **Check** | Both gestures draw once with live preview; Esc/right-click cancels the pending segment. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-10-31 by the owner, checking F-027 ("it works only on drag, aren't other segment elements also click A (preview) click B?"). Checked in the code (`bando-editor.ts`, the tool list and the pointer-up handlers): only Measure takes clicks (a chain, with a live preview); Fence, interior Wall, Road, Water in line mode, Tunnel and Bridge draw by press–drag–release with a live preview, and a click shorter than 0.5 m is dropped; Surface and Water outlines are drawn by hand. So the fence is not the odd one: the request is click–click for every line tool. Plan: a press released within a few pixels starts a line at A, the preview follows the pointer, the next click ends it at B (Esc or a right-click cancels); a longer drag still draws as today; one shared handler for all the line tools; the hints and their Italian updated; a browser case per tool (click–click and drag), and the guide steps whose clips show drawing checked (impact map). Chaining (B of one fence is A of the next, as in Measure) is a question for the owner when it is built. Made a project rule by the owner (2026-10-31): Editor area notes, "Tool palette": every line tool takes click A, live preview, click B, and every drag previews live.<br />Previous next-action summary: Next: let Fence, Wall, Road, Water (line), Tunnel and Bridge draw by two clicks with a live preview, as Measure does; a press-drag-release still works.

**Estimates:** Large remaining effort; ~10% complete. Tool inventory and gesture plan exist; shared handling, six tool cases and guide review remain. Estimated 2026-10-31; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#268](https://github.com/voidbrain/openbando/pull/268) (recorded); request 2026-10-31 |
| Opened | 2026-10-31 |
| Verification | Pending |
| Reviewed | 2026-10-31 |

</details>

---

### F-044

**Compact backlog records, mandatory recaps and maintained estimates**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔹 P3 | Implemented | 🟢 Small | ~90% |

💻 **→ Human action required: No**<br />Run this project’s CI, merge when green, then reconcile the record.

| | |
|---|---|
| **Issue** | Some records omit the recap; long actions and introduction obscure active work. |
| **Reproduce** | Open this ledger and run check:backlog, including agent-owned and unchanged records. |
| **Check** | Every active record has visible title, signals, human cue and all three recap rows; details stay collapsed; estimates are reassessed on direct and collateral updates. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Template 2.0.0 merged first in [project-harness #39](https://github.com/voidbrain/project-harness/pull/39), commit da681770b0bc2ba34b911d6ed57d63fe10bdf049, with [CI 41196190379](https://github.com/voidbrain/project-harness/actions/runs/41196190379) and all job steps green. User authorized template publication. The owner explicitly requested updating OpenBando before the upstream tag was available (2026-10-31): reconciled directly from that merged commit, with the untagged source noted in .harness.json; it is not a published release. Next: project CI, merge and close this documentation/tooling record on its green CI. The missing upstream tag is tracked in the template repository and does not block this authorized project update. No product status was advanced by formatting. All 20 prior records retain their actions and historical metadata; recaps and estimate rationale added. Introduction trimmed and guidance/history moved to the end.

**Estimates:** Small remaining effort; ~90% complete. Migration and 29 harness fixtures pass; template CI passed and #39 merged. Reassessed after that collateral update: ~90% remains valid because project browser verification and CI remain; upstream tagging is separate template work. Estimated 2026-10-31.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-10-31; branch `fix/compact-backlog-info`; [#272](https://github.com/voidbrain/openbando/pull/272) |
| Opened | 2026-10-31 |
| Verification | Documentation/tooling · 2026-10-31 · backlog checks pass; 29 template fixtures pass; publishing and CI pending |
| Reviewed | 2026-10-31 |

</details>

---

### F-045

**Example descriptions in an info tooltip beside the bando title**

| Signal | Priority | Status | Effort | Complete |
|:---:|---|---|---|---|
| 🟡 | 🔹 P3 | Implemented | 🟢 Small | ~80% |

💻 **→ Human action required: No**<br />Verify tooltip interactions and accessibility in browser CI, then merge when green.

| | |
|---|---|
| **Issue** | Always-visible example descriptions make the Bandos list long. |
| **Reproduce** | Bandos → Examples: hover or focus the i beside an example name; tap it and dismiss with Escape. |
| **Check** | The description opens without a permanent text row, stays readable on hover, and is accessible from keyboard and touch. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Implemented locally with existing tokens and Italian text. Browser regression includes hover, focus, Escape, click and axe. Local browser download returned invalid/truncated archives; browser acceptance awaits a working Playwright installation or project CI. The owner authorized applying the merged template commit directly (F-044); no template-tag dependency remains here. Media regeneration remains tracked under F-031.

**Estimates:** Small remaining effort; ~80% complete. Tooltip implementation, translation and regression case exist; browser verification and project CI remain. Estimated 2026-10-31.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-10-31; branch `fix/compact-backlog-info`; [#272](https://github.com/voidbrain/openbando/pull/272) |
| Opened | 2026-10-31 |
| Verification | Unit/integration · 2026-10-31 · 597 tests pass; build, type checks, i18n, contrast and conventions pass. Browser/accessibility · Pending (Playwright browser download returned invalid archives); publishing and CI pending |
| Reviewed | 2026-10-31 |

</details>

---

## Other changes

Harness 2.0.0, 2026-10-31: applied the merged [template #39](https://github.com/voidbrain/project-harness/pull/39) at commit `da68177` on the owner’s explicit instruction, with its release tag still pending. Copied check-backlog, reconciled the rules and migrated every active record; F-044 tracks this project’s verification.

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

The "Map north" panel removed (2026-10-30, the owner: the compass widget is on the main view and in the editor's 3D view): the panel, its drawing (`core/drawing/compass.ts`, its `cameraUpAngle` moved to `camera-compass.ts`) and its test go; old saved layouts drop it. What follows, by the impact map: Views lists panels from `PANELS` (gone there); no guide step, README line or clip source names it (guide pages and element map unchanged); the clips that show the Views list show its old row until they are re-recorded (F-031); coverage table refreshed (code removed).

Harness template 1.20.0 (2026-10-30, decided with the owner: records closed on 29 and 30 October had been appended to the 28 October archive; template [#37](https://github.com/voidbrain/project-harness/pull/37)): one archive per year. The 27 and 28 October files moved into [backlog-2026.md](archive/backlog-2026.md): the earlier tables under a heading of their own, every record under its closing day (5 on 28, 11 on 29, 27 on 30 October), nothing dropped (`check:backlog` counts every published line across the archives). `check-backlog` copied, BACKLOG-RULES archive paragraph reconciled, `version` 1.20.0.

Harness template 1.20.1 (2026-10-31, the owner's find; template [#38](https://github.com/voidbrain/project-harness/pull/38)): a loose paragraph between F-009 and F-021, left from the old table layout (the note under the bugs table, 28 October), was the only place of the rule "a new finding about the same behaviour goes into its record"; next to "never reuse an ID" it read as a contradiction. The rule is now in BACKLOG-RULES beside the ID rule, the paragraph is gone, `version` 1.20.1.

Completed documentation and backlog changes, with PR links and verification evidence, are in [the maintenance history](archive/backlog-2026.md#completed-maintenance-and-documentation). Product work and pending media checks remain in the bug/feature records above.

## Reconciliation history

2026-10-31: reviewed through `5eb8b3d` (#271). Its [CI 41154114412](https://github.com/voidbrain/openbando/actions/runs/41154114412) is green; B-046 remains closed in the existing archive. Historical reconciliation notes below are preserved.

Current work ledger, reviewed 31 October 2026 against main `37e2545` (merged #270), with every CI job of #162–#270 read (`npm run ci:status`). #154–#158 had merged with failing browser shards; their causes were fixed by #159 (Reset UI, countdown pause) and #162/#168 (Auto-sync, B-025). Closed items and their PR history are in [the archive](archive/backlog-2026.md). The [follow-up audit](audits/2026-10-28.md) records current CI evidence and documentation gaps; the [original audit](audits/2026-10-27.md) preserves its historical findings; the [archived working plan](archive/working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

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

Each item shows its ID and title, a signal table (priority, status, remaining effort and estimated completion), Human action required (🧑 Yes / 💻 No), and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Completion is a coarse estimate, not verification; pending acceptance stays below 100%. A `---` line ends every item.
