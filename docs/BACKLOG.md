# OpenBando backlog

Current work ledger, reviewed 29 October 2026 against main `f0c9fd3` (merged #217), with every CI job of #162–#217 read (`npm run ci:status`). #154–#158 had merged with failing browser shards; their causes were fixed by #159 (Reset UI, countdown pause) and #162/#168 (Auto-sync, B-025). Closed items and their PR history are in [the archive](archive/backlog-2026-10-28.md). The [follow-up audit](audits/2026-10-28.md) records current CI evidence and documentation gaps; the [original audit](audits/2026-10-27.md) preserves its historical findings; the [archived working plan](archive/working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

## How to use this file


| Status | Requirements | Next statuses and conditions | Priority cue |
|---|---|---|---|
| **🔴 Open** | Reproducible bug or agreed capability; scope and next action recorded. | - **Investigate** if cause/scope is uncertain<br>- **Implemented** when code is complete<br>- **Blocked** if a named dependency prevents progress<br>- **Closed** if cancelled/superseded, with reason. | Coloured |
| **🟠 Investigate** | Report and unanswered question recorded; next diagnostic identified. | - **Open** when scope/cause is established<br>- **Implemented** when fixed<br>- **Blocked** if evidence/dependency is unavailable<br>- **Closed** if duplicate/not reproducible after documented investigation, with reason. | Coloured |
| **🟡 Implemented** | Code exists; required verification remains pending. | - **Verified** when all acceptance checks pass<br>- Open or Investigate if a check fails<br>- **Blocked** if a required check cannot proceed. | Coloured |
| **🟢 Verified** | All acceptance checks passed; date, method and evidence recorded, including human/device checks when required. | - **Closed** when no action remains and resolution is recorded<br>- **Open** or **Investigate** if new evidence invalidates verification. Do not leave completed items here indefinitely. | Coloured |
| **🟣 Blocked** | Specific blocker, affected work/check and resume condition recorded. | - Return to **Open**, **Investigate** or **Implemented** when unblocked, according to remaining work<br>- **Verified** only after all checks pass<br>- **Closed** if cancelled/superseded, with reason. | Grey ◻️ |
| **🔵 Closed** | Resolution recorded and item archived; fixes normally pass through Verified, while cancellation/supersession records its reason. | - **Open** or **Investigate** if reopened by new evidence<br>Retain ID, original Opened date and historical closure record. | Grey ◻️ |


Follow [Backlog rules](BACKLOG-RULES.md) for updating records, reconciling PR/CI evidence, stale-state review, closure/archiving, human dependencies and table validation. The lifecycle table above is the quick reference. Preserve stable IDs and existing user edits.

Each item has a compact summary, followed by its human-action line (icon first: 🧑 **→ Human action required: Yes** = a human is needed, including a decision; 💻 **→ Human action required: No** = agent-owned next action, not completion), then the full-width **Next action / closure evidence**. Expand its details for PR history, opened/reviewed dates and verification evidence. A `---` line ends every item.

## Bugs and reliability

### B-009

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-009 | 🔶 P2 | Implemented | Simulator and selected-flight/video regression |

🧑 **→ Human action required: Yes**<br />Manually check simulator entry, collisions and selected-flight/video replay.

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

### B-011

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-011 | 🔺 P1 | Implemented | Welcome tour presentation and exit |

🧑 **→ Human action required: Yes**<br />Review Welcome timing, presentation and the final Welcome-only screen.

**Next action / closure evidence:** [#155](https://github.com/voidbrain/openbando/pull/155) fits card films into the mascot thirds and holds its final frame during the showcase, preventing the accidental second search/run/sit; Pause holds mascot and film. Ring countdown (F-019) is closed; see the archive. [#154](https://github.com/voidbrain/openbando/pull/154) also suppresses saved-sync restoration notices during the showcase (normal loads retain them). Video first-frame feedback (B-022) is closed; see the [archive](archive/backlog-2026-10-28.md). User reports truncated Fly, a trailing mascot wait and leaked path after return. Replaced fixed waits with complete card films and three mascot checkpoints; replay now waits for the full flight. Entry restores 3D overview/Follow off and render boundary suppresses paths. All #149 showcase browser checks passed; final human presentation review remains. The #148 eight-second card completion/distributed mascot, reduced-motion and Stop checks passed; full replay reached completion but its continuation assumed a nonexistent saved demo card. The #149 saved fixture continuation passed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#155](https://github.com/voidbrain/openbando/pull/155) (one-loop timing); [#150](https://github.com/voidbrain/openbando/pull/150); [#124](https://github.com/voidbrain/openbando/pull/124) (merged; action-order checks passed in #124 CI); [CI failure](https://github.com/voidbrain/openbando/actions/runs/40650990021/job/122690744193); [#107](https://github.com/voidbrain/openbando/pull/107) (fix; browser checks pending); [#109](https://github.com/voidbrain/openbando/pull/109) (merged; visual/browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending); [#148](https://github.com/voidbrain/openbando/pull/148); [#149](https://github.com/voidbrain/openbando/pull/149) (CI fixes and readable record layout); history: #148 continuation failure, corrected by #149 |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-28 · [#149 shard 4](https://github.com/voidbrain/openbando/actions/runs/40745098159/job/123016650449) passed full replay/continuation, distributed card films, reduced motion, Stop and Auto-sync; Human presentation review · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-017

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟠 | B-017 | 🔶 P2 | Investigate | Villetta replay misalignment with video |

🧑 **→ Human action required: Yes**<br />Provide the affected saved alignment/session and confirm the changed arch control.

**Next action / closure evidence:** User confirms video and log timing is synchronized and that the greenhouse is approximately 30–40 cm above the surrounding ground; release 11 models an estimated 35 cm raised floor and frame. Investigate spatial displacement around the main store and greenhouse west exit. The [demo investigation](audits/2026-10-27-villetta-replay.md) matches the screenshots and identifies a separate hidden-origin projection defect (B-018), but does not establish its effect in the saved session. The greenhouse arch control uses a dimensionless crown-height-to-half-width ratio; the inspector now labels it and displays the resulting height in metres. Confirm which control was changed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#112](https://github.com/voidbrain/openbando/pull/112) (report and arch label; alignment remains open); [#114](https://github.com/voidbrain/openbando/pull/114) (raised greenhouse; visual review pending); [#113](https://github.com/voidbrain/openbando/pull/113) (spatial investigation) |
| Opened | 2026-10-27 |
| Verification | Pending |
| Reviewed | 2026-10-27 |

</details>

---

### B-018

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-018 | 🔺 P1 | Implemented | Hidden-origin GPS projection distorts flight paths |

🧑 **→ Human action required: Yes**<br />Compare the corrected path with the real flight and test real GPS devices.

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

### B-019

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-019 | 🔶 P2 | Implemented | Indoor measures |

🧑 **→ Human action required: Yes**<br />Check measurement placement on basement and upper floors in 3D indoor mode.

**Next action / closure evidence:** Focused editor workflow passed indoor 2D measurements, debug coordinates, basement keyboard editing, 3D view and measure selection. Review indoor 3D measurement placement specifically; this is not every floor/tool combination.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#119](https://github.com/voidbrain/openbando/pull/119) (implemented; browser checks pending) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-28 · focused editor checks passed in [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649); Human + 3D indoor placement · Pending |
| Reviewed | 2026-10-28 |

</details>

---

### B-024

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-024 | 🔺 P1 | Implemented | Shown panels stay transparent or invisible (Safari) |

🧑 **→ Human action required: Yes**<br />Decide whether the WebKit evidence is enough to close, or open Views in real Safari once.

**Next action / closure evidence:** WebKit check 2026-10-29 (Playwright WebKit 27.2, the engine behind Safari): the opacity regression, Fly entry (Open the bandos, close Views, reopen from the menu button), Views and Welcome cases pass; sampling every frame for 400 ms after Open the bandos and after the menu button, Views is at opacity 1 from the first frame. Real Safari not run. User report (Safari): Welcome's Open the bandos hid the menu button but Views did not appear; the menu button left the Views area semi-transparent, loading slowly or never. Cause: every panel's 0.7 s entrance animated opacity from 0 with fill both; when frames stall (WebKit entrance on a backdrop-filter element leaving display none, or a busy 3D main thread) the panel stayed near opacity 0 while the app counted it as shown. The entrance is now a 0.35 s transform-only slide. New browser regression freezes entrance animations at their start and requires opacity 1 for Views and Bandos after Open the bandos and after the menu button; it fails on the old fade in Chromium and WebKit and passes with the fix.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#158](https://github.com/voidbrain/openbando/pull/158); history: local Chromium and WebKit (Desktop Safari) regression passed with the fix and failed (opacity 0) without it, 2026-10-28 |
| Opened | 2026-10-28 |
| Verification | Browser/accessibility · 2026-10-28 · opacity regression passed in [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) shard 1 (Chromium); Browser · 2026-10-29 · WebKit 27.2 locally: 4 cases passed, Views opaque from the first frame on both entry points; real Safari · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-026

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-026 | 🔶 P2 | Implemented | Welcome wordmark downloads 902 kB on every first visit |

🧑 **→ Human action required: Yes**<br />Glance at the new wordmark in Welcome and confirm it looks the same.

**Next action / closure evidence:** Approved 2026-10-29 (user: smaller export, sharp pixel edges). [#184](https://github.com/voidbrain/openbando/pull/184): the master has 170,025 colours (a smooth generated image, so no lossless palette); Welcome draws it at most 720 CSS px. Exported at 1440 × 367 px (Lanczos), then 256 colours without dithering: 135 kB instead of 902 kB, NG0913 gone; compared at display size and 2× zoom with the original and a full-colour 1440 px export (499 kB), no visible difference. The master is kept at `docs/mascot/openbando-wordmark-master.png`; the wordmark guide says how to re-export. Earlier: `public/mascot/openbando-wordmark.png` is 2172 × 554 px and 902 kB, drawn at a fraction of that width in Welcome; Angular warns NG0913 (oversized image) on every first visit. The image now uses `NgOptimizedImage` with its intrinsic size and `priority` (`check:conventions` requires it), which does not shrink the file. The generated master is not an exact pixel grid, so a smaller export can change letter edges: prepare candidates (nearest-neighbour at the rendered width × 2, and an optimised PNG at the current size) for the wordmark guide's visual review before replacing the approved file.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#184](https://github.com/voidbrain/openbando/pull/184) (1440 px, 256-colour export); [#162](https://github.com/voidbrain/openbando/pull/162) (NgOptimizedImage, size attributes; recovered #161); [audit](audits/2026-10-28.md) (found 2026-10-28) |
| Opened | 2026-10-29 |
| Verification | Browser/accessibility · 2026-10-29 · Welcome wordmark and first-visit a11y cases passed locally; visual comparison reviewed by the agent; Human look · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-028

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-028 | 🔶 P2 | Implemented | New bando: grey map after a hidden bando, full addresses not found, Generate before a place |

🧑 **→ Human action required: Yes**<br />On the live site after merge: open a hidden bando, then New; search a full street address; check the map, the matches list and Generate.

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

### B-029

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-029 | 🔶 P2 | Implemented | The 1 · Area frame drifts from the map on wheel zoom and can be cut by the map edge |

🧑 **→ Human action required: Yes**<br />On the live site after merge: frame an area, drag an edge past the map, wheel-zoom in and out, turn the frame, resize the panel; the frame stays whole, on the same streets, and keeps its size.

**Next action / closure evidence:** Reported 2026-10-29 (several reports the same day). Causes: the frame is held in metres about the view's centre, while Leaflet's wheel zooms about the cursor, so each wheel step moved the map under the frame; nothing limited zooming in, so the frame grew past the map, was drawn clipped (`fb` capped it at the view) and its handles were out of reach (the pilot had to reload). [#202](https://github.com/voidbrain/openbando/pull/202) shrank the area to fit after each zoom: wrong, the user never asked for the area to change by itself (replaced here). Now (`keepFrame`): the area never changes size by itself; in 1 · Area the wheel and pinch zoom about the view's centre, as the frame does; zooming in stops where the frame would come within `FRAME_MARGIN` (36 px: handles, turn knob, search bar) of the map's edge (`setMaxZoom`, the + button turns off); a turn, a smaller panel or a reopened area zooms the map out instead; an edge drag stops at the margin. Only if even zoom 15 is too close does the area shrink. Covered by `e2e/new-bando.e2e.ts` ("never cut by the map edge and keeps its size": edge past the map, zoom to the limit, off-centre wheel keeps the map's centre, 45° turn, smaller window, size readout unchanged; fails on #202's code). Not checked: pinch zoom on a touch device.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#203](https://github.com/voidbrain/openbando/pull/203) (zoom limit, centred wheel, margin; replaces #202's shrinking; all CI jobs green, no retries); [#202](https://github.com/voidbrain/openbando/pull/202) (all CI jobs green, no retries); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `new-bando.e2e.ts`, guide, studio layout, a11y and editor regressions passed locally (one editor-regressions case timed out under parallel load and passed alone); live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-030

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-030 | 🔶 P2 | Implemented | The tool palette hid half its tools behind long press or right click |

🧑 **→ Human action required: Yes**<br />On the live site after merge: open a bando in 2 · Model; every tool shows in the palette, two to a row.

**Next action / closure evidence:** Reported 2026-10-29 (the user could not find Cut and Wing). The palette showed one button per group (paint-program style, from 66dfacb, 2026-10-22, with no record or decision); Merge, Cut, Wing, Tree brush, Surface, Water, Tunnel, Courtyard, Void… opened only by long press, right click or a 10 px corner triangle. Decided 2026-10-29 (user): every tool visible, two columns. Now each tool on offer has its own button (`aria-label`, `aria-pressed`), one 2-column block per group; the tree brush's shape and the terrain operation are picked in the options bar (their menus already existed; the sculpt hint moved there); a short editor scrolls the palette; a hairline separates every category (user, 2026-10-29). The wider palette covered the 3D view's vertex box (top left), which #205's first CI run caught (two editor-regressions cases): that box and the keyboard measure box moved to the top right. The flyout code, its styles, the `z-flyout` token and the "hold or click the corner" texts are gone; `ToolPalette.md`, `tokens.json` and the editor area note updated. Covered by `e2e/tool-palette.e2e.ts` (16 outdoor tools visible, two to a row, one click arms, terrain operation from the options bar); the vegetation, courtyard and indoor-placement cases now click the tool's own button. Not checked: a short editor window on a device.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#205](https://github.com/voidbrain/openbando/pull/205); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `tool-palette`, vegetation, courtyard and indoor-placement e2e passed locally; screenshot of the 2D editor reviewed by the agent; live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-031

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-031 | 🔶 P2 | Implemented | A picture menu near the bottom of the page pushed the page up, leaving a black band |

🧑 **→ Human action required: Yes**<br />On the live site after merge: move a panel with a picture menu (Trees options, for example) to the bottom of the page and open the menu.

**Next action / closure evidence:** Reported 2026-10-29. `PickMenu` always opened its list below the button, up to 320 px, and moved the focus into it with a plain `focus()` (and `scrollIntoView` for the active choice): with the button near the bottom of the window the browser scrolled the page (and the panel body) to show the list, leaving a black band. Now the list opens above when there is more room there, is as tall as the room in the window allows (it scrolls inside), keeps inside the window's right edge, and takes the focus with `preventScroll`; the active choice is scrolled into view inside the list only. Covered by `e2e/pick-menu.e2e.ts` (window ending just below the Trees options: the list opens upwards inside the window, no element of the page scrolls on opening or on End; fails on the old menu at the opening). `PickMenu.md` updated. Not checked: a phone-sized window. Reopened 2026-10-29 (user): in a Trees options bar dragged to the bottom of the editor the menu still opened downwards, out of sight: the room was measured against the window, but the editor's work area clips it. Now the room is the window cut by every ancestor that clips its content; `e2e/pick-menu-clip.e2e.ts` (fails on the previous fix) covers it.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#205](https://github.com/voidbrain/openbando/pull/205); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `pick-menu.e2e.ts` passed locally; live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-032

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-032 | 🔶 P2 | Implemented | A panel expanded near the bottom of the window was cut, and a click inside it scrolled the page |

🧑 **→ Human action required: Yes**<br />On the live site after merge: collapse a panel, drag it to the bottom, expand it, click inside.

**Next action / closure evidence:** Reported 2026-10-29. Expanding (or showing) a panel never checked that it still fits the window, so its lower part hung past the bottom edge; a click inside focused a control there and the browser scrolled the page (whose overflow is hidden but can still be scrolled by focus) to show it, so everything jumped up. Now a panel that is shown or expanded and reaches past the bottom moves up until it fits (`Panel` constructor effect, only on show / expand and only when the place changes: a first version looped, NG0103), and the app root undoes any page scroll. Covered by `e2e/panel-fit.e2e.ts` (collapse, drag to the bottom, expand: the panel fits; a click inside keeps the page at 0, 0 and the panel in place; no console errors); fails without the fix. Related: B-031 (the same page scroll from a picture menu).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | This PR (replaces [#208](https://github.com/voidbrain/openbando/pull/208): green CI, then a backlog conflict with #206); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `panel-fit`, studio layout, fly entry, a11y, guide, pick menu and new bando e2e passed locally; live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-033

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-033 | 🔶 P2 | Implemented | Road bends left wedge-shaped gaps |

🧑 **→ Human action required: Yes**<br />On the live site after merge: look at a bending road in 3D.

**Next action / closure evidence:** Reported 2026-10-29 with a screenshot. Each segment of a road was its own strip with square ends, so every bend opened a wedge on its outer side. Now a road is one strip along its whole line, mitred at each bend (`stripFrames` in `core/layers.ts`: the shared frame's normal bisects the two segments, half-width stretched by 1 / cos of half the turn, capped at 2×). Covered by `layers.spec.ts` (straight, right-angle, hairpin, repeated point) and a 3D screenshot reviewed by the agent. The centre line itself is unchanged (the ground is levelled along it); rounding sharp corners is not done.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#215](https://github.com/voidbrain/openbando/pull/215) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · `stripFrames` cases passed; 3D screenshot reviewed; live-site look · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-034

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-034 | 🔶 P2 | Implemented | Fences did not follow the terrain |

🧑 **→ Human action required: Yes**<br />On the live site after merge: a fence across a slope keeps its height above the ground all along.

**Next action / closure evidence:** Requested 2026-10-29. A fence was one level-topped box from the lowest ground under it up to its height above the highest, so on a slope it was too tall at the low end and its pieces stepped at the joints. Now the panel follows the ground (`groundRibbon`: sampled every metre, its foot 30 cm into the ground, its top `height` above it), posts stand on the ground under them at the fence's height, and the collider is a 1 m staircase of boxes each from the ground to its height there. Covered by `site-model.spec.ts` (a fence over a hill: solid at height − 0.2 m and clear at height + 0.6 m all along; fails on the old code).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#215](https://github.com/voidbrain/openbando/pull/215) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · slope case passed (fails on the previous build); 3D screenshot reviewed; live-site look · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### B-035

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-035 | 🔶 P2 | Open | Two buildings flush against each other flicker where their walls meet |

💻 **→ Human action required: No**<br />Draw one wall where two buildings' sides coincide (the magnet snaps buildings flush, so any pilot can make this), and test it.

**Next action / closure evidence:** Found 2026-10-29 (user screenshot of Bardwell House: the dark wall flickering behind the windows). Each side wall is a 0.5 m box centred on the building's edge, so two buildings snapped flush put two identical boxes in one place, and their faces fight in the depth buffer (z-fighting), visible through windows and doors. Bardwell House is fixed in the example (release 4: the wing has no wall on the shared side). General plan: when the site is built, find sides of two buildings that lie on the same line with opposite faces and overlapping spans, and build that stretch once (or inset one of them), keeping both colliders correct; cover it with a model test (two flush buildings: no coincident wall faces) and a screenshot.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Report 2026-10-29; Bardwell House worked around in this PR |
| Opened | 2026-10-29 |
| Verification | Not implemented |
| Reviewed | 2026-10-29 |

</details>

---

## Features and limitations

### F-001

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-001 | 🔶 P2 | Implemented | Cut/Wing for diagonal basement outlines |

🧑 **→ Human action required: Yes**<br />Review diagonal Cut/Wing editing and saved/imported outlines.

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

### F-008

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-008 | 🔹 P3 | Implemented | Welcome mascot and Features |

🧑 **→ Human action required: Yes**<br />Review the remaining Welcome timing/presentation points tracked by B-011.

**Next action / closure evidence:** User accepted the animation apart from the Welcome tour timing in B-011; retain responsive and reduced-motion checks.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#108](https://github.com/voidbrain/openbando/pull/108) (timing; browser checks pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending); history: timing/reduced-motion passed in [#119 CI](https://github.com/voidbrain/openbando/actions/runs/40643805473) |
| Opened | 2026-10-27 |
| Verification | Human · 2026-10-28 · mascot accepted; Browser/accessibility · 2026-10-28 · complete showcase and timing/reduced-motion tests passed in [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) |
| Reviewed | 2026-10-29 |

</details>

---

### F-009

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-009 | 🔶 P2 | Implemented | Racing on real devices |

🧑 **→ Human action required: Yes**<br />Run the two-device race/GPS field checklist with real telemetry feeds.

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

### F-012

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-012 | 🔶 P2 | Implemented | Compass visibility and controls |

🧑 **→ Human action required: Yes**<br />Confirm compass hiding and clearance during the Welcome tour, as in B-011.

**Next action / closure evidence:** User accepted compass controls. Hide on every Welcome screen and blank scene, and show with a nonblank model; regression checks passed for initial/final Welcome and model load in [#143 CI](https://github.com/voidbrain/openbando/actions/runs/40729835588) ([#143](https://github.com/voidbrain/openbando/pull/143)). Keep the widget above the version badge.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#109](https://github.com/voidbrain/openbando/pull/109) (merged); [#115](https://github.com/voidbrain/openbando/pull/115) (first axe fix failed); [#116](https://github.com/voidbrain/openbando/pull/116) (vector fix; browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending); history: [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows) |
| Opened | 2026-10-27 |
| Verification | Human · 2026-10-28 · compass controls accepted; Browser/accessibility · 2026-10-28 · [#143](https://github.com/voidbrain/openbando/pull/143) full CI passed, including final Welcome compass hiding |
| Reviewed | 2026-10-29 |

</details>

---

User-accepted fixes are preserved in the dated archives rather than repeated here. New findings reuse an existing ID when they concern the same behavior.

### F-022

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-022 | 🔹 P3 | Implemented | Gambrel (barn) roof |

🧑 **→ Human action required: Yes**<br />On the live site after merge: give a building a gambrel roof in the inspector (Roof → shape) and look at it in 3D.

**Next action / closure evidence:** Requested 2026-10-29 for Bardwell House (house and barn both have gambrel roofs; decided with the user: a real roof kind rather than an approximation). `LevelSpec.roof` gains `'gambrel'`: the gable's builder takes a cross-section, so a gambrel shares the ridge direction, repeat count, turn, ruin holes and the roof-high collider; its steep lower slope covers 36 % of each half-span and climbs 65 % of `roofRise` (`GAMBREL_KNEE`). Editor Roof → shape lists it; the assistant's `set_roof` accepts it (schema, prompt, normalisation). Older builds read an unknown roof as a vault. Covered by `site-model.spec.ts` (knee point, steeper lower slope, collider to the ridge, starts at the wall top) and `ai-commands.spec.ts` (set_roof gambrel; unknown shapes refused). A 3D screenshot of a gambrel house and barn was reviewed by the agent.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#206](https://github.com/voidbrain/openbando/pull/206) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · roof geometry, collider and AI cases passed locally; 3D screenshot reviewed; live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-023

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-023 | 🔹 P3 | Implemented | Bardwell House example, place hidden |

🧑 **→ Human action required: Yes**<br />On the live site after merge: Bandos → Examples → Bardwell House → Open a copy; compare the model with your photos and say what to correct.

**Next action / closure evidence:** Requested 2026-10-29 with the generated bando (private coordinates, never committed), two top views and two oblique photos. Decided with the user: a gambrel roof kind (F-022), the map's "concrete" over the west fields dropped, the real ground baked in. The input is the app's own place-hidden export (`tools/examples/data/bardwell-house.hidden.json`: embedded relative heights, origin 0, 0, no coordinates, terrain key or map names, checked before commit); `npm run examples` builds `library/bandos/bardwell-house-no-place.json` with the refinements measured on the photos (≈ 8 cm a pixel, scaled on the generated house and barn; the store's place agrees within ~2 m between the two top views): gambrel house and flat-roofed wing, gambrel barn, store, three sheds, patio and stepped brick wall, the drive's wooden fence, a camper and a car; duplicate trees removed. The FPV simulators' models of the place are game assets and were not used. Covered by `examples.spec.ts` (listed, hidden, origin 0, 0, no coordinates or names, embedded ground, gambrel roofs, store and sheds, no map surface over the fields). AGENTS' privacy rule names the place as private. Not checked: shapes and heights against the real place beyond the photos (porch, dormers, the wing's exact depth are estimates). Release 2 (user review 2026-10-29, with two more photos): the house turned a quarter (gambrel ends east and west, the flat-roofed wing south), the second drive from the lane to the front of the house under three big trees, the take-off pad in front of the house, the hedge along the south side and the south end of the east side, roads and trees cut to the area of the real heights (the map's roads ran hundreds of metres out) and the grass around ending 5 m past it; trees on a road removed. Release 3 ([#217](https://github.com/voidbrain/openbando/pull/217)): the drive's fence is the white post-and-rail fence (F-027). Release 4 (this PR, user report with a screenshot): the dark wall flickered behind the windows of the house and its wing: the wing's north wall and the main block's south wall stood in one place (z-fighting); the wing has no north wall now (B-035 tracks the general case).

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

🧑 **→ Human action required: Yes**<br />On the live site after merge: in 2 · Model 2D, drag the take-off pad with Select, and right-click the ground: Move the take-off pad here.

**Next action / closure evidence:** Requested 2026-10-29: the take-off pad (where flights start, `droneStart`, drawn as the last pad) could not be selected or moved in the editor; a never-called `SiteService.setTakeoffAt` moved the start without the drawn pad. Now `moveTakeoff` (core) moves the last pad and the drone start together, keeping their offset (older bandos' road pads stay). In 2D the pad has a red outline; Select picks it (the inspector shows x / z in metres) and drags it in one undo step; its right-click menu has "Move to coordinates…", and the ground's right-click menu has "Move the take-off pad here". `setTakeoffAt` removed. Covered by a `layers.spec.ts` case and `e2e/takeoff-pad.e2e.ts` (drag, ground menu: the pad lands under the click, export has pad and start together). Not done: moving it in the 3D editor view.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#210](https://github.com/voidbrain/openbando/pull/210) (replaces [#207](https://github.com/voidbrain/openbando/pull/207): green CI, then a backlog conflict with #206); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-29 · `layers.spec.ts` and `takeoff-pad.e2e.ts` passed locally; live-site check · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-024

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-024 | 🔹 P3 | Open | Take-off pad indoors, on an upper floor or on a flat roof |

💻 **→ Human action required: No**<br />Ready (F-021 is merged): a take-off height for the pad (ground, a floor of the building under it, or its flat roof), with the drone starting there.

**Next action / closure evidence:** Requested 2026-10-29: the take-off pad (F-021) can stand inside a building on any floor, or on a flat roof; other roofs and more complex cases only on request. Plan: an optional take-off level in the spec (absent = ground, old bandos unchanged), set from the editor (Indoors on a floor, or the pad's menu "on the roof" for a flat roof), the pad and the drone drawn and started at that height, the ground under it not levelled for it. Closes with unit cases (height per level and roof, old specs) and a browser case placing it on a floor and a roof.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Not implemented |
| Reviewed | 2026-10-29 |

</details>

---

### F-025

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-025 | 🔹 P3 | Open | Rework the Fly checklist |

🧑 **→ Human action required: Yes**<br />Say what the Fly checklist should do differently (steps, order, what it checks, when it opens).

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

💻 **→ Human action required: No**<br />List which controls of each panel have a tip on hover and which do not, then propose the rework and a check that fails when a control has none.

**Next action / closure evidence:** Requested 2026-10-29. The "?" button in every panel's title bar turns tips on hover on and off (`TourService.tips`); nobody has checked which controls they cover. Plan: an inventory per panel (controls with and without a tip), a proposal for the rework, and an automated check (unit or browser) that every control of a panel has its tip, like `check:i18n` for texts. Closes when the inventory is done, the rework is agreed and the check runs in CI. Part of F-028 (2026-10-29: the user asked whether the tips were mapped to controls; not yet).

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

### F-027

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-027 | 🔹 P3 | Implemented | Post-and-rail fence (white, three planks) |

🧑 **→ Human action required: Yes**<br />On the live site after merge: draw a fence and pick Post-and-rail in its material menu; Bardwell House's drive fence uses it.

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

### F-028

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-028 | 🔶 P2 | Implemented | Impact map: what must follow when something changes, reminded on every PR |

💻 **→ Human action required: No**<br />Done with this PR; the checks the rows name as missing are F-026, F-029, F-030 and F-031.

**Next action / closure evidence:** Requested 2026-10-29: the BACKLOG-RULES consistency rule ("for every modification, check README, AGENTS…") names no derived things, so updates depend on memory (today `check:i18n` missed fence labels written in TypeScript). Plan (decided with the user): a harness template feature, an impact-map file where each row says which files trigger it, what must follow, the command and what checks it; `check-freshness` reads it and lists, on every PR, "this branch changes X: update Y" (a warning, never blocking); AGENTS and BACKLOG-RULES point to it. Rows here: tour → guide pages; UI shown by a clip or film → the clip or film; user-facing text → Italian; controls → their tips; keys → Help panel; spec fields and AI commands → AI schema and prompt; example builder → examples and catalogue; tokens and components → design-system guides; features → README and area notes. The automatic checks are F-029, F-030, F-031 and F-026. Done 2026-10-29: harness 1.11.0 (template #14) and nine rows in `.harness.json` here (guide pages, clips and films, texts and tips in templates, texts in TypeScript data, Help panel keys, spec and AI commands, example bandos, catalogue, design system); each names what checks it, or "nothing yet" with the record that will.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#216](https://github.com/voidbrain/openbando/pull/216) (CI green); template [#14](https://github.com/voidbrain/project-harness/pull/14) (v1.11.0); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:freshness` on this branch: harness files listed, no impact row triggered (the branch touches none of their files); template `test:tools` 19/19 |
| Reviewed | 2026-10-29 |

</details>

---

### F-029

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-029 | 🔹 P3 | Implemented | CI fails when the guide pages differ from their source |

💻 **→ Human action required: No**<br />Close when this PR merges on a green CI: the check then runs on every PR.

**Next action / closure evidence:** Requested 2026-10-29 (part of F-028): the guide pages are generated from the tour source, and nothing checks they were regenerated. Done 2026-10-29: CI step "Guide pages match the tour" runs `node tools/build-guide.mjs` and fails on any difference in `docs/guide` (the committed pages were current); the impact row now names it.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | This PR; request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | CI · 2026-10-29 · the step passes on current main; it fails on a tour change that is not regenerated (diff) |
| Reviewed | 2026-10-29 |

</details>

---

### F-030

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-030 | 🔹 P3 | Implemented | `check:i18n` also reads texts in TypeScript data |

💻 **→ Human action required: No**<br />Close when this PR merges on a green CI: the check then runs on every PR.

**Next action / closure evidence:** Requested 2026-10-29 (part of F-028). Found the same day: fence hints such as "Boards on posts" have no Italian, and the check passed because it reads only templates. Done 2026-10-29: `check:i18n` also reads `label` and `hint` in TypeScript data (comments left out); it found 43 texts without Italian (fence hints, tree and brush hints, context-menu labels, AI model descriptions, Railway, Greenhouse…), all translated now; model names stay English (`keep-english.txt`). The impact row now names it.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | This PR; request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:i18n` 841 texts, 0 missing (43 missing before the translations) |
| Reviewed | 2026-10-29 |

</details>

---

### F-031

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-031 | 🔹 P3 | Implemented | Clips and films say when their sources changed since recording |

🧑 **→ Human action required: Yes**<br />Re-record the guide clips and Welcome films on a machine with the GPU and ffmpeg (`npm run clips`, `npm run films`) and review them: both sets show files changed since (the new palette among them).

**Next action / closure evidence:** Requested 2026-10-29 (part of F-028): clips and films are recorded in a browser (`npm run clips`, `npm run films`), so CI cannot regenerate them, and nothing says one is out of date. Done 2026-10-29: `docs/guide/media.json` (per set: the commit it was recorded at, the source globs it shows), `tools/check-media.mjs` (`npm run check:media`; a CI warning, never blocking; test files left out), and `npm run clips` / `films` stamp their set after recording. First run: the guide clips (recorded at d35f0d3) show 12 changed files and the Welcome films (73aee6e) 15, so both are due for re-recording.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | This PR; request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:media` lists 12 / 15 changed files; `--stamp` writes the current commit (tried and restored); re-recording · Pending |
| Reviewed | 2026-10-29 |

</details>

---

### F-033

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-033 | 🔶 P2 | Open | Full impact map: chains, content, couplings, outside the repository, as a readable page |

💻 **→ Human action required: No**<br />Next steps, in order: (1) done: harness 1.14.0 (template [#20](https://github.com/voidbrain/project-harness/pull/20): content dependencies, value couplings, outside the repository; coupling warnings) and 1.15.0 (template [#22](https://github.com/voidbrain/project-harness/pull/22): `pages`, the impact map links the project's own maps); (2) reconcile here to 1.12.0 – 1.15.0, after #221 (the element map) merges: `docs/agents/impact-map.md` from the harness tool is the one readable impact page and lists the element map in `pages` (the element map lists controls only and links back), and: every row with an `id` and its `after` chains (blocks → catalogue → examples; tour → guide pages; UI → clips → guide pages; UI → Welcome films; `.harness.json` → map page), the theme-colour row chained to every visual output and the art, a `package-lock.json` row (renderer upgrades → recordings), each recording's inputs read from its script (Chiari e Forti → Welcome film 1 and the tour's clips; Bando Villetta and the demo flight → the flight clips); (3) list the value couplings (mascot timing ↔ the three Welcome films, `DEMO_OFFSET` ↔ the demo video, tour waits ↔ animation lengths, others found) and give each one source or a relation test, one record each; (4) the outside list: library upgrades, CI browser and GPU, OSM / Overpass, terrain tiles, Nominatim, AI models, each with what it affects and how it is noticed.

**Next action / closure evidence:** Requested 2026-10-29: the user asked which dependencies a file trigger misses (a mascot animation synced with the Welcome films, a film that records an example bando, a theme colour that changes everything visual) and asked for a readable list of content dependencies and value couplings, plus what lies outside the repository if useful to people. Template rules already released: 1.12.0 (chains, the map page, plans become records) and 1.13.0 (inputs, wide-reach settings, couplings, audits look outside). Recorded here at once because a plan given in the conversation is otherwise forgotten (BACKLOG-RULES).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Request 2026-10-29; template [#16](https://github.com/voidbrain/project-harness/pull/16) (1.12.0), [#18](https://github.com/voidbrain/project-harness/pull/18) (1.13.0) |
| Opened | 2026-10-29 |
| Verification | Not implemented |
| Reviewed | 2026-10-29 |

</details>

---

### F-034

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-034 | 🔹 P3 | Open | Merge only when every check passes, CodeQL included |

🧑 **→ Human action required: Yes**<br />Decide whether "no merge while any check fails, CodeQL included" becomes a written rule, and where (the harness template for every project, or this project only).

**Next action / closure evidence:** Found 2026-10-30: the required checks (ruleset "protect main") do not include CodeQL, and the agent's merge watcher waited only for the required ones, so a PR could merge with an open code-scanning alert (#221 had four: incomplete sanitization in two build tools, fixed in that PR). The watcher, a session script, now stops on any failing check; the rule itself is written nowhere. Options: a line in AGENTS (merging) in the template for every project, or here only; or add CodeQL to the required checks of "protect main" (a GitHub setting).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Found 2026-10-30 on [#221](https://github.com/voidbrain/openbando/pull/221) |
| Opened | 2026-10-30 |
| Verification | Not decided |
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

Harness template 1.10.0 (2026-10-29, this PR; template [#12](https://github.com/voidbrain/project-harness/pull/12)): found here, after a rule for every project (conflict-only pushes to green PRs) was first written into this project's AGENTS without asking whether it belonged to the template. AGENTS gains "Changing a harness file" (the edit is the trigger; unsure: ask before editing) and the template's PR rules (no stacked PRs, no new work on a green PR, conflict-only pushes allowed); project lines inside template sections are marked `<!-- project -->` (12 in AGENTS); the Work tracking bullet points to the new section; BACKLOG-RULES: parallel PRs' backlog conflicts are resolved in the conflicting PR; `check-freshness` copied (it lists the harness files a branch changes); `.harness.json` on 1.10.0. CI green.

Harness template 1.11.0 (2026-10-29, [#216](https://github.com/voidbrain/openbando/pull/216), CI green; template [#14](https://github.com/voidbrain/project-harness/pull/14)): the impact map (F-028); AGENTS gains "What follows a change", BACKLOG-RULES points to the map; `check-freshness` copied; `.harness.json` on 1.11.0 with nine rows. Harness 1.10.0 ([#212](https://github.com/voidbrain/openbando/pull/212)): CI green.

Completed documentation and backlog changes, with PR links and verification evidence, are in [the maintenance history](archive/backlog-2026-10-28.md#completed-maintenance-and-documentation). Product work and pending media checks remain in the bug/feature records above.
