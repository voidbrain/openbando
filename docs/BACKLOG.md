# OpenBando backlog

Current work ledger, reviewed 29 October 2026 against main `460857c` (merged #169), with every CI job of #162–#169 read (`npm run ci:status`). #154–#158 had merged with failing browser shards; their causes were fixed by #159 (Reset UI, countdown pause) and #162/#168 (Auto-sync, B-025). Closed items and their PR history are in [the archive](archive-2026-10-28.md). The [follow-up audit](audits/2026-10-28.md) records current CI evidence and documentation gaps; the [original audit](audits/2026-10-27.md) preserves its historical findings; the [archived working plan](working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

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

Each item has a compact summary, followed by **→ Human action required** first, then the full-width **Next action / closure evidence**. Expand its details for PR history, opened/reviewed dates and verification evidence. Human-action cues: 🧑 **Yes** = a human is needed; 💻 **No** = agent-owned next action, not completion.

## Bugs and reliability

### B-009

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-009 | 🔶 P2 | Implemented | Simulator and selected-flight/video regression |

**→ Human action required:** 🧑 **Yes**<br />Manually check simulator entry, collisions and selected-flight/video replay.

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

### B-011

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-011 | 🔺 P1 | Implemented | Welcome tour presentation and exit |

**→ Human action required:** 🧑 **Yes**<br />Review Welcome timing, presentation and the final Welcome-only screen.

**Next action / closure evidence:** [#155](https://github.com/voidbrain/openbando/pull/155) fits card films into the mascot thirds and holds its final frame during the showcase, preventing the accidental second search/run/sit; Pause holds mascot and film. Ring countdown (F-019) is closed; see the archive. [#154](https://github.com/voidbrain/openbando/pull/154) also suppresses saved-sync restoration notices during the showcase (normal loads retain them). Video first-frame feedback (B-022) is closed; see the [archive](archive-2026-10-28.md). User reports truncated Fly, a trailing mascot wait and leaked path after return. Replaced fixed waits with complete card films and three mascot checkpoints; replay now waits for the full flight. Entry restores 3D overview/Follow off and render boundary suppresses paths. All #149 showcase browser checks passed; final human presentation review remains. The #148 eight-second card completion/distributed mascot, reduced-motion and Stop checks passed; full replay reached completion but its continuation assumed a nonexistent saved demo card. The #149 saved fixture continuation passed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#155](https://github.com/voidbrain/openbando/pull/155) (one-loop timing); [#150](https://github.com/voidbrain/openbando/pull/150); [#124](https://github.com/voidbrain/openbando/pull/124) (merged; action-order checks passed in #124 CI); [CI failure](https://github.com/voidbrain/openbando/actions/runs/40650990021/job/122690744193); [#107](https://github.com/voidbrain/openbando/pull/107) (fix; browser checks pending); [#109](https://github.com/voidbrain/openbando/pull/109) (merged; visual/browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending); [#148](https://github.com/voidbrain/openbando/pull/148); [#149](https://github.com/voidbrain/openbando/pull/149) (CI fixes and readable record layout); history: #148 continuation failure, corrected by #149 |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-28 · [#149 shard 4](https://github.com/voidbrain/openbando/actions/runs/40745098159/job/123016650449) passed full replay/continuation, distributed card films, reduced motion, Stop and Auto-sync; Human presentation review · Pending |
| Reviewed | 2026-10-29 |

</details>

### B-017

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟠 | B-017 | 🔶 P2 | Investigate | Villetta replay misalignment with video |

**→ Human action required:** 🧑 **Yes**<br />Provide the affected saved alignment/session and confirm the changed arch control.

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

### B-018

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-018 | 🔺 P1 | Implemented | Hidden-origin GPS projection distorts flight paths |

**→ Human action required:** 🧑 **Yes**<br />Compare the corrected path with the real flight and test real GPS devices.

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

### B-019

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-019 | 🔶 P2 | Implemented | Indoor measures |

**→ Human action required:** 🧑 **Yes**<br />Check measurement placement on basement and upper floors in 3D indoor mode.

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

### B-024

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-024 | 🔺 P1 | Implemented | Shown panels stay transparent or invisible (Safari) |

**→ Human action required:** 🧑 **Yes**<br />In Safari, open Views from Welcome's Open the bandos and from the menu button and confirm it appears at once.

**Next action / closure evidence:** User report (Safari): Welcome's Open the bandos hid the menu button but Views did not appear; the menu button left the Views area semi-transparent, loading slowly or never. Cause: every panel's 0.7 s entrance animated opacity from 0 with fill both; when frames stall (WebKit entrance on a backdrop-filter element leaving display none, or a busy 3D main thread) the panel stayed near opacity 0 while the app counted it as shown. The entrance is now a 0.35 s transform-only slide. New browser regression freezes entrance animations at their start and requires opacity 1 for Views and Bandos after Open the bandos and after the menu button; it fails on the old fade in Chromium and WebKit and passes with the fix.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#158](https://github.com/voidbrain/openbando/pull/158); history: local Chromium and WebKit (Desktop Safari) regression passed with the fix and failed (opacity 0) without it, 2026-10-28 |
| Opened | 2026-10-28 |
| Verification | Browser/accessibility · 2026-10-28 · opacity regression passed in [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) shard 1 (Chromium); Human Safari check · Pending |
| Reviewed | 2026-10-29 |

</details>

### B-025

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-025 | 🔺 P1 | Implemented | Auto-sync demo offset drifts on CI runners |

**→ Human action required:** 💻 **No**<br />Confirm Auto-sync over several CI runs with no retries, using the offsets the test logs; then close.

**Next action / closure evidence:** Second fix ([#168](https://github.com/voidbrain/openbando/pull/168)): after #162 the check still failed once on CI (#163: −0.84 s, then −0.56 s on retry), from a motion match. Nine local scans (normal, 4× and 6× slowed CPU) were captured and replayed offline: the final refinement on the first flip (10 s window) was the scatter (sd 0.045 s, range 0.15 s), while each motion pair's whole-flight offset was steady (sd 0.010–0.032 s). The matcher now averages the confident motion matches (weighted by r) and skips the flip refinement when it has them (refinement stays the fallback): on the same scans sd 0.016 s, range −0.67 … −0.72 s. `DEMO_OFFSET` −0.69 s (that mean); tolerance unchanged at 0.15 s. Earlier: Cause found with a CPU-throttled probe (local Chromium, 8–9 scans per variant): the result depended on the machine. (1) Motion (pan, diff) is measured between two frames but was dated at the later one, so every sample landed half a frame gap late; a slow machine decodes fewer frames, so the gap and the shift grew with load. (2) With fewer frames the sky/ground brightness match (up vs tb) won and gave about −0.87 s, while motion matches gave −0.60 … −0.66 s; brightness lags because the camera's exposure follows the attitude. Fix: `gridFromSamples` dates motion at the interval midpoint and brightness at its frame; the matcher keeps a high-confidence motion match over brightness. After the fix every scan used a motion match: −0.54 … −0.71 s at normal and 4× slowed CPU (mean −0.64, previously −0.51 … −0.89). `DEMO_OFFSET` is now that mean (it came from one scan); the e2e tolerance stays 0.15 s and the test logs the offset and match it found. A playback-rate back-off when frames drop was tried and dropped (no clearer result, slower scans). Remaining: per-run scatter of about ±0.09 s is the method's precision. Close after the check passes in several CI runs without retries.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#168](https://github.com/voidbrain/openbando/pull/168) (averaged motion match); [#163 CI](https://github.com/voidbrain/openbando/actions/runs/40788783214) (failed −0.84 s, passed on retry −0.56 s); [#162 CI](https://github.com/voidbrain/openbando/actions/runs/40788710587) (passed, −0.61 s); [#162](https://github.com/voidbrain/openbando/pull/162) (recovery: #160 merged into the #159 branch after #159 had merged, without CI, and never reached main); [#160](https://github.com/voidbrain/openbando/pull/160) (midpoint dating, motion preference, measured `DEMO_OFFSET`); [#159 rerun](https://github.com/voidbrain/openbando/actions/runs/40785592494) (failed both attempts, 0.18 s); [#159 CI](https://github.com/voidbrain/openbando/actions/runs/40784413716) (passed); [#154 CI](https://github.com/voidbrain/openbando/actions/runs/40765189126) (fail, pass on retry); [#155](https://github.com/voidbrain/openbando/actions/runs/40765867282), [#156](https://github.com/voidbrain/openbando/actions/runs/40769519651), [#157](https://github.com/voidbrain/openbando/actions/runs/40773605465) (failed); [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) (passed) |
| Opened | 2026-10-28 |
| Verification | Unit/integration · 2026-10-29 · 538 tests incl. the averaging case; offline replay of 9 captured scans: sd 0.016 s (was 0.045 s); Browser/accessibility · CI · Pending |
| Reviewed | 2026-10-29 |

</details>

### B-026

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | B-026 | 🔶 P2 | Open | Welcome wordmark downloads 902 kB on every first visit |

**→ Human action required:** 🧑 **Yes**<br />Approve a smaller wordmark export that keeps sharp pixel edges, or keep the current file.

**Next action / closure evidence:** `public/mascot/openbando-wordmark.png` is 2172 × 554 px and 902 kB, drawn at a fraction of that width in Welcome; Angular warns NG0913 (oversized image) on every first visit. The image now uses `NgOptimizedImage` with its intrinsic size and `priority` (`check:conventions` requires it), which does not shrink the file. The generated master is not an exact pixel grid, so a smaller export can change letter edges: prepare candidates (nearest-neighbour at the rendered width × 2, and an optimised PNG at the current size) for the wordmark guide's visual review before replacing the approved file.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#162](https://github.com/voidbrain/openbando/pull/162) (NgOptimizedImage, size attributes; recovered #161); [audit](audits/2026-10-28.md) (found 2026-10-28) |
| Opened | 2026-10-29 |
| Verification | Pending |
| Reviewed | 2026-10-29 |

</details>

## Features and limitations

### F-001

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-001 | 🔶 P2 | Implemented | Cut/Wing for diagonal basement outlines |

**→ Human action required:** 🧑 **Yes**<br />Review diagonal Cut/Wing editing and saved/imported outlines.

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

### F-002

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-002 | 🔹 P3 | Open | Basement perimeter holes and disconnected islands |

**→ Human action required:** 💻 **No**<br />Implement phase 1 of the plan: courtyard and piece model, validation and sanitizer.

**Next action / closure evidence:** Design 2026-10-29 ([plan](basement-holes-plan.md), `docs/f002-basement-holes-plan`): `BasementSpec.courtyards` (holes through the basement, walls around, ground kept) and `BasementSpec.pieces` (further perimeters), optional with defaults so old files load; validation and caps; five phases: model and validation, courtyard geometry (slabs, walls, volume holes for terrain cut and floorUnder, colliders), courtyard editing (2D/3D, undo, Cut/Wing/resize guards), separate pieces, docs. Earlier: Design a representation and editing, saving, terrain cuts, floor/wall rendering and collision for courtyards and separate pieces; currently one simple perimeter only. Floor voids are separate and already exist.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | `docs/f002-basement-holes-plan` (design); [#101](https://github.com/voidbrain/openbando/pull/101) (context; limitation remains) |
| Opened | 2026-10-27 |
| Verification | Documentation · 2026-10-29 · design written against the current code paths; implementation · Pending |
| Reviewed | 2026-10-29 |

</details>

### F-003

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-003 | 🔶 P2 | Implemented | 3D basement vertex handles |

**→ Human action required:** 🧑 **Yes**<br />Drag 3D basement vertices on rotated buildings and confirm save/undo behavior.

**Next action / closure evidence:** 3D indoor −1 now has draggable vertex handles and keyboard move/insert/remove controls using the 2D validation and undo paths. Verify pointer, keyboard, rotated buildings, persistence and accessibility in browser CI.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (2D); [#116](https://github.com/voidbrain/openbando/pull/116) (merged; [CI](https://github.com/voidbrain/openbando/actions/runs/40595652166) passed; pointer review pending); history: unit + browser passed in [#116 CI](https://github.com/voidbrain/openbando/actions/runs/40595652166), 2026-10-27 |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit); Human pointer review · Pending |
| Reviewed | 2026-10-29 |

</details>

### F-004

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-004 | 🔹 P3 | Implemented | More flexible basement vertex edits |

**→ Human action required:** 🧑 **Yes**<br />Decide whether invisible legacy compass doors on shaped basements should be migrated (they would appear) or stay guarded.

**Next action / closure evidence:** Investigation 2026-10-29. (1) Open-wall topology: footprint restoration with a different topology now reuses the Cut/Wing remap (`reshapePerimeter`): a new edge keeps an old edge's state only where it lies exactly on it, collinear same-state edges are joined, and the restore is allowed only when every open span survives whole; otherwise it is refused unchanged as before (no case that was protected can now lose data). (2) Legacy compass doors on a shaped floor: `listOpenings`, the renderer and colliders ignore `level.doors` once a floor has a footprint, so such doors are invisible data; normal reshaping converts them to `wallOpenings` first, so they come only from old saved files. A safe migration exists (place each on the bounding-box side it was authored on, accept only if that point lies on an outline edge), but it would make doors appear in pilots' saved bandos: a product decision. Until then the guard stays. History: Cut/Wing passed #141 CI. Length/width now scale the existing outline, preserving edge identity and item world positions; footprint restoration supports matching normalized boundaries with either winding, and validates closed-wall topology replacement. Rejects ambiguous open-wall topology/legacy shaped compass-door data and destructive edits. Resize/restore browser checks passed in #142 CI. Ambiguous open-wall topology changes and legacy shaped compass-door migration remain guarded; investigate safe correspondence before relaxing those guards.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (context); [#122](https://github.com/voidbrain/openbando/pull/122) (perimeter visibility); [#141](https://github.com/voidbrain/openbando/pull/141) (open-edge Cut/Wing); [#142](https://github.com/voidbrain/openbando/pull/142) (safe resize and footprint restoration); [#166](https://github.com/voidbrain/openbando/pull/166) (open-wall restoration) |
| Opened | 2026-10-27 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-29 · new open-wall restoration case (survives whole / notch refused / partial refused) and all jobs passed in [#166 CI](https://github.com/voidbrain/openbando/actions/runs/40789909830); Browser/accessibility · 2026-10-28 · resize/restore passed in [#142 CI](https://github.com/voidbrain/openbando/actions/runs/40724736656), open-edge Cut in [#141 CI](https://github.com/voidbrain/openbando/actions/runs/40720066164) |
| Reviewed | 2026-10-29 |

</details>

### F-005

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-005 | 🔶 P2 | Implemented | 3D indoor tools and handles |

**→ Human action required:** 💻 **No**<br />Confirm the 3D handle and opening/stairwell browser cases in CI; keyboard use is covered by inspector fields and the basement vertex keys.

**Next action / closure evidence:** 2026-10-29: #165 added real-pointer door/window placement on −1/G/L1 and the automatic stairwell on −1/G (passed in [#165 CI](https://github.com/voidbrain/openbando/actions/runs/40789259441)). `feat/f005-3d-handle-cursor` gives 3D handles hover feedback (`move` / `grab` / `grabbing` cursor; none before) and a browser test that finds them by that cursor, moves the rotated building (undo/redo checked on the plan) and resizes it outwards. Keyboard: the inspector's fields move and size buildings, and −1 vertices have their arrow-key buttons (F-003); there is no keyboard path on the 3D handles themselves. Earlier: Browser-test wall, void, door, window, column and stair placement, rotated buildings, upper floors and −1; exercise move/resize handles and keyboard/accessibility. The #147 floor matrix exposed Wall selection resetting itself to Select on all floors; corrected the indoor-entry order. New real-pointer tests cover column/wall/void placement at −1/G/L1 on a rotated building, column undo/redo, exported floor isolation and axe ([#147](https://github.com/voidbrain/openbando/pull/147); failed historically; corrected in #148). Added 3D stairs placement on −1/G/L1 with undo/redo, exported floor elevation, rotation and floor-isolation assertions; the optional stairwell is disabled where an upper floor exists; the top-floor test asserts that control is absent. Basement/G passed #152 CI; its L1 test failed on an invalid checkbox expectation, corrected in [#153](https://github.com/voidbrain/openbando/pull/153); L1 passed [#153 CI](https://github.com/voidbrain/openbando/actions/runs/40760899876/job/123072222211). Doors, windows, automatic stairwell creation and full handle coverage remain open.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | `feat/f005-3d-handle-cursor` (handle cursor, handles test); [#165](https://github.com/voidbrain/openbando/pull/165) (openings, stairwell); [#153](https://github.com/voidbrain/openbando/pull/153) (top-floor test correction); [#152](https://github.com/voidbrain/openbando/pull/152) (stair-placement browser coverage); [#86](https://github.com/voidbrain/openbando/pull/86), [#88](https://github.com/voidbrain/openbando/pull/88), [#95](https://github.com/voidbrain/openbando/pull/95) (implementation and partial browser coverage); [#148](https://github.com/voidbrain/openbando/pull/148) (Wall selection fix); history: [#147 CI](https://github.com/voidbrain/openbando/actions/runs/40734777783) failed at Wall activation on every floor (corrected in #148); #152 L1 failed on a stairwell checkbox absent on the top floor (corrected in #153); [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed selected workflows |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-29 · door/window on −1/G/L1 and automatic stairwell on −1/G passed in [#165 CI](https://github.com/voidbrain/openbando/actions/runs/40789259441); 3D handle move/undo/redo/resize passed locally (2/2), CI · Pending |
| Reviewed | 2026-10-29 |

</details>

### F-006

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-006 | 🔹 P3 | Implemented | Studio controls and vegetation |

**→ Human action required:** 💻 **No**<br />Confirm the vegetation and 3D-preview fixes in CI, then review compass and expand/dock controls in both views.

**Next action / closure evidence:** Agent review 2026-10-29 (`test/f006-vegetation-brush`): a new browser test drags a hedge square in 2D (dashed preview during the drag, shrubs planted, one undo/redo step) and a bramble circle in 3D, then checks the exported materials; its screenshots are kept for review. It found two defects, both fixed: (1) no 3D gesture preview was ever drawn: `effect(() => this.r?.setDrawLine(this.drawLine()))` never read the signal while the renderer was missing, so it never subscribed (fence, bridge, tunnel lines and live 3D measures too); the 3D line is now a polyline and the brush draws its area ring; `check:conventions` flags that effect pattern. (2) The brush hint said “trees” for hedges and brambles, and three of its hints had no Italian. Remaining: compass consistency and expand/dock controls in both views. Earlier scope: Review compass consistency, expand/dock controls, 3D construction previews, measures and hedge/bramble brush shapes in both views.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | `test/f006-vegetation-brush` (brush test, 3D preview fix, hints); [#84](https://github.com/voidbrain/openbando/pull/84), [#85](https://github.com/voidbrain/openbando/pull/85), [#90](https://github.com/voidbrain/openbando/pull/90) (partial coverage) |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-29 · new vegetation brush test passed locally; 3D brush ring visible in its mid-drag screenshot (was absent before the fix); CI · Pending; compass and expand/dock review · Pending |
| Reviewed | 2026-10-29 |

</details>

### F-008

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-008 | 🔹 P3 | Implemented | Welcome mascot and Features |

**→ Human action required:** 🧑 **Yes**<br />Review the remaining Welcome timing/presentation points tracked by B-011.

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

### F-009

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-009 | 🔶 P2 | Implemented | Racing on real devices |

**→ Human action required:** 🧑 **Yes**<br />Run the two-device race/GPS field checklist with real telemetry feeds.

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

### F-012

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-012 | 🔶 P2 | Implemented | Compass visibility and controls |

**→ Human action required:** 🧑 **Yes**<br />Confirm compass hiding and clearance during the Welcome tour, as in B-011.

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

### F-018

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-018 | 🔶 P2 | Open | Guided Fly procedure |

**→ Human action required:** 💻 **No**<br />Implement and test the proposed recorded, simulator and live/racing routes.

**Next action / closure evidence:** [Workflow proposal](fly-workflow-plan.md) separates bando selection, recording availability, simulator setup and live/multi-pilot branches. Planning only; interactive wizard and guide/media updates are not implemented.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#154](https://github.com/voidbrain/openbando/pull/154) |
| Opened | 2026-10-28 |
| Verification | Documentation · 2026-10-28 · route proposal recorded; implementation and browser verification not started. |
| Reviewed | 2026-10-28 |

</details>

User-accepted fixes are preserved in the dated archives rather than repeated here. New findings reuse an existing ID when they concern the same behavior.

## Other changes

Completed documentation and backlog changes, with PR links and verification evidence, are in [the maintenance history](archive-2026-10-28.md#completed-maintenance-and-documentation). Product work and pending media checks remain in the bug/feature records above.
