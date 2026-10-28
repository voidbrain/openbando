# OpenBando backlog

Current work ledger, reviewed 28 October 2026 against merged PR #151 (fast checks passed; browser jobs still running) and the earlier recorded CI results. Closed items and their PR history are in [the archive](archive-2026-10-28.md). The [follow-up audit](audits/2026-10-28.md) records current CI evidence and documentation gaps; the [original audit](audits/2026-10-27.md) preserves its historical findings; the [archived working plan](working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

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

**Next action / closure evidence:** [#155](https://github.com/voidbrain/openbando/pull/155) fits card films into the mascot thirds and holds its final frame during the showcase, preventing the accidental second search/run/sit; Pause holds mascot and film. Ring countdown is F-019.  [#154](https://github.com/voidbrain/openbando/pull/154) also suppresses saved-sync restoration notices during the showcase (normal loads retain them). Video first-frame feedback is tracked in B-022. User reports truncated Fly, a trailing mascot wait and leaked path after return. Replaced fixed waits with complete card films and three mascot checkpoints; replay now waits for the full flight. Entry restores 3D overview/Follow off and render boundary suppresses paths. All #149 showcase browser checks passed; final human presentation review remains. The #148 eight-second card completion/distributed mascot, reduced-motion and Stop checks passed; full replay reached completion but its continuation assumed a nonexistent saved demo card. The #149 saved fixture continuation passed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#155](https://github.com/voidbrain/openbando/pull/155) (one-loop timing); [#150](https://github.com/voidbrain/openbando/pull/150); [#124](https://github.com/voidbrain/openbando/pull/124) (merged; action-order checks passed in #124 CI); [CI failure](https://github.com/voidbrain/openbando/actions/runs/40650990021/job/122690744193); [#107](https://github.com/voidbrain/openbando/pull/107) (fix; browser checks pending); [#109](https://github.com/voidbrain/openbando/pull/109) (merged; visual/browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending)  [#148](https://github.com/voidbrain/openbando/pull/148); [#149](https://github.com/voidbrain/openbando/pull/149) (CI fixes and readable record layout) |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-28 · [#149 shard 4](https://github.com/voidbrain/openbando/actions/runs/40745098159/job/123016650449) passed full replay/continuation, distributed card films, reduced motion, Stop and Auto-sync; #148 continuation failure corrected by #149. Human presentation review · Pending. |
| Reviewed | 2026-10-28 |

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




### B-022

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-022 | 🔶 P2 | Implemented | Video first-frame loading feedback |

**→ Human action required:** 💻 **No**<br />Run loading/decoded/error feedback browser checks.

**Next action / closure evidence:** Show Loading video until decoded data/canplay, reset it on replacement and replace it with an error message on decode failure. Unit checks pass; browser presentation remains pending.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#154](https://github.com/voidbrain/openbando/pull/154) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks recorded in PR; Browser/accessibility · Pending |
| Reviewed | 2026-10-28 |

</details>

### B-023

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-023 | 🔶 P2 | Implemented | Welcome navigation leaves tour overlays; focus detaches on resize |

**→ Human action required:** 💻 **No**<br />Run cancellation, destination preservation and resize-focus browser checks.

**Next action / closure evidence:** Welcome links and a real user close cancel/clean the tour before navigation, suppressing the tour’s return-to-Welcome restoration. Focus follows its live target bounds each frame and clears if removed. Unit checks cover cancellation during preparation and moving/resizing/detached targets; browser workflow added. Stop remains the separate return-to-Welcome action.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#156](https://github.com/voidbrain/openbando/pull/156); [#157](https://github.com/voidbrain/openbando/pull/157) (follow-up: quick order, plain editor row, Follow label, 18px icons) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks passed; Browser/accessibility · Pending |
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
| PR / evidence | [#158](https://github.com/voidbrain/openbando/pull/158) |
| Opened | 2026-10-28 |
| Verification | Browser/accessibility · 2026-10-28 · local Playwright Chromium and WebKit (Desktop Safari) regression passed with the fix and failed (opacity 0) without it; CI · Pending; Human Safari check · Pending |
| Reviewed | 2026-10-28 |

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

**→ Human action required:** 💻 **No**<br />Agent can implement perimeter holes and disconnected basement pieces.

**Next action / closure evidence:** Design a representation and editing, saving, terrain cuts, floor/wall rendering and collision for courtyards and separate pieces; currently one simple perimeter only. Floor voids are separate and already exist.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (context; limitation remains) |
| Opened | 2026-10-27 |
| Verification | Pending |
| Reviewed | 2026-10-27 |

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
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (2D); [#116](https://github.com/voidbrain/openbando/pull/116) (merged; [CI](https://github.com/voidbrain/openbando/actions/runs/40595652166) passed; pointer review pending) |
| Opened | 2026-10-27 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-27 · [CI passed](https://github.com/voidbrain/openbando/actions/runs/40595652166); Human pointer review · Pending; Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit) |
| Reviewed | 2026-10-28 |

</details>

### F-004

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-004 | 🔹 P3 | Implemented | More flexible basement vertex edits |

**→ Human action required:** 💻 **No**<br />Investigate safe correspondence for ambiguous open-wall topology and legacy shaped compass doors.

**Next action / closure evidence:** Cut/Wing passed #141 CI. Length/width now scale the existing outline, preserving edge identity and item world positions; footprint restoration supports matching normalized boundaries with either winding, and validates closed-wall topology replacement. Rejects ambiguous open-wall topology/legacy shaped compass-door data and destructive edits. Resize/restore browser checks passed in #142 CI. Ambiguous open-wall topology changes and legacy shaped compass-door migration remain guarded; investigate safe correspondence before relaxing those guards.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (context); [#122](https://github.com/voidbrain/openbando/pull/122) (perimeter visibility)  [#141](https://github.com/voidbrain/openbando/pull/141) (open-edge Cut/Wing);  [#142](https://github.com/voidbrain/openbando/pull/142) (safe resize and footprint restoration); |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-28 · #141 open-edge Cut case passed in [CI](https://github.com/voidbrain/openbando/actions/runs/40720066164); Unit/integration · 2026-10-28 · all 528 tests passed locally (43 basement tests); Browser/accessibility · 2026-10-28 · resize/restore passed in [#142 CI](https://github.com/voidbrain/openbando/actions/runs/40724736656) |
| Reviewed | 2026-10-28 |

</details>

### F-005

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-005 | 🔶 P2 | Implemented | 3D indoor tools and handles |

**→ Human action required:** 💻 **No**<br />Extend doors, windows, automatic stairwells and remaining handles after the passed stair-placement matrix.

**Next action / closure evidence:** Browser-test wall, void, door, window, column and stair placement, rotated buildings, upper floors and −1; exercise move/resize handles and keyboard/accessibility. The #147 floor matrix exposed Wall selection resetting itself to Select on all floors; corrected the indoor-entry order. New real-pointer tests cover column/wall/void placement at −1/G/L1 on a rotated building, column undo/redo, exported floor isolation and axe ([#147](https://github.com/voidbrain/openbando/pull/147); failed historically; corrected in #148). Added 3D stairs placement on −1/G/L1 with undo/redo, exported floor elevation, rotation and floor-isolation assertions; the optional stairwell is disabled where an upper floor exists; the top-floor test asserts that control is absent. Basement/G passed #152 CI; its L1 test failed on an invalid checkbox expectation, corrected in [#153](https://github.com/voidbrain/openbando/pull/153); L1 passed [#153 CI](https://github.com/voidbrain/openbando/actions/runs/40760899876/job/123072222211). Doors, windows, automatic stairwell creation and full handle coverage remain open.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#153](https://github.com/voidbrain/openbando/pull/153) (top-floor test correction); [#152](https://github.com/voidbrain/openbando/pull/152) (stair-placement browser coverage); [#86](https://github.com/voidbrain/openbando/pull/86), [#88](https://github.com/voidbrain/openbando/pull/88), [#95](https://github.com/voidbrain/openbando/pull/95) (implementation and partial browser coverage)  [#148](https://github.com/voidbrain/openbando/pull/148) (Wall selection fix); |
| Opened | 2026-10-27 |
| Verification | Test-source validation · 2026-10-28 · strict TypeScript and discovery of all three extended cases passed; −1/G stair placement passed in #152; L1 failed waiting for a stairwell checkbox absent on the top floor. Follow-up asserts its absence; L1 passed in #153 shard 4; all #153 jobs passed.  Pending — see PR/evidence for partial automated coverage; Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit)  Browser/accessibility · 2026-10-28 · [#147 CI](https://github.com/voidbrain/openbando/actions/runs/40734777783) failed at Wall activation on every floor; corrected in #148 (passing floor matrix below).; Browser/accessibility · 2026-10-28 · #148 −1/G/L1 pointer placement, undo/export floor isolation and axe passed in [shard 3](https://github.com/voidbrain/openbando/actions/runs/40738619197/job/122993847187) and [shard 4](https://github.com/voidbrain/openbando/actions/runs/40738619197/job/122993847284). |
| Reviewed | 2026-10-28 |

</details>

### F-006

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-006 | 🔹 P3 | Implemented | Studio controls and vegetation |

**→ Human action required:** 💻 **No**<br />Agent can check Studio controls and vegetation previews in both views.

**Next action / closure evidence:** Review compass consistency, expand/dock controls, 3D construction previews, measures and hedge/bramble brush shapes in both views.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#84](https://github.com/voidbrain/openbando/pull/84), [#85](https://github.com/voidbrain/openbando/pull/85), [#90](https://github.com/voidbrain/openbando/pull/90) (partial coverage) |
| Opened | 2026-10-27 |
| Verification | Pending — see PR/evidence for partial automated coverage; Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit) |
| Reviewed | 2026-10-28 |

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
| PR / evidence | [#108](https://github.com/voidbrain/openbando/pull/108) (timing; browser checks pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending) |
| Opened | 2026-10-27 |
| Verification | Human · 2026-10-28 · mascot accepted; Browser/accessibility · 2026-10-28 · timing/reduced-motion tests passed in [#119 CI](https://github.com/voidbrain/openbando/actions/runs/40643805473); complete showcase passed in #124 CI; Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit) |
| Reviewed | 2026-10-28 |

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

### F-011

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔴 | F-011 | 🔹 P3 | Open | Guide and historical documentation drift |

**→ Human action required:** 💻 **No**<br />Agent can re-record guide clips/films and review them against the current UI.

**Next action / closure evidence:** README and AGENTS corrected for diagonal Cut/Wing, 3D vertices, release 11 and showcase exit. Regenerated guide pages and corrected generator entry instructions. Clips and Welcome films last changed 24 October; re-record and visually review them against current UI.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#102](https://github.com/voidbrain/openbando/pull/102) (audit; review remains open) |
| Opened | 2026-10-27 |
| Verification | Documentation · 2026-10-28 · source/history audit and guide regeneration; media visual verification · Pending |
| Reviewed | 2026-10-28 |

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
| PR / evidence | [#109](https://github.com/voidbrain/openbando/pull/109) (merged); [#115](https://github.com/voidbrain/openbando/pull/115) (first axe fix failed); [#116](https://github.com/voidbrain/openbando/pull/116) (vector fix; browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending) |
| Opened | 2026-10-27 |
| Verification | Human · 2026-10-28 · compass controls accepted; Browser/accessibility · 2026-10-28 · #143 full CI passed, including final Welcome compass hiding; Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit) |
| Reviewed | 2026-10-28 |

</details>


### F-017

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-017 | 🔶 P2 | Implemented | Returning-pilot Welcome and Fly workspace |

**→ Human action required:** 💻 **No**<br />Run new entry-workspace browser checks and inspect CI.

**Next action / closure evidence:** Completed Welcome promotes Open the bandos; replay remains available. Video/log loading exposes the matching panel. Bandos use active badge and Fly opens telemetry except Live link, closes Bandos and selects the 3D model. Flights sits below Video; Views can close and reopen from its menu. New browser workflow and unit checks added; CI pending.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#154](https://github.com/voidbrain/openbando/pull/154) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks recorded in PR; Browser/accessibility · Pending |
| Reviewed | 2026-10-28 |

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

### F-019

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-019 | 🔶 P2 | Implemented | Tour step remaining-time ring |

**→ Human action required:** 💻 **No**<br />Run countdown, pause and Welcome timing browser checks.

**Next action / closure evidence:** Emptying ring beside the tour title resets per snippet; Welcome uses rendered progress through one 19.7-second mascot loop and replay uses playback progress. Other guides use an explicitly labelled active-time estimate that retains a small remainder while unfinished. Pause holds progress. New browser checks exercise the circle and pause; CI pending. Final Welcome presentation review remains B-011.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#155](https://github.com/voidbrain/openbando/pull/155) |
| Opened | 2026-10-28 |
| Verification | Unit/integration · 2026-10-28 · local suite passed; Browser/accessibility · Pending |
| Reviewed | 2026-10-28 |

</details>

### F-020

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-020 | 🔶 P2 | Implemented | Views hierarchy and scoped camera options |

**→ Human action required:** 💻 **No**<br />Confirm the follow-up Views browser test and full suite in PR CI.

**Next action / closure evidence:** Flights/Timeline/Video then Bandos editor remain directly available; user follow-up: the editor is now a plain `.vis` row at the end (no accent full-width row), the text "Follow replay" label is removed (the Follow icon keeps its replay title/aria-label in Chase/FPV) and Options icons are 18px so the five fit one row. Telemetry, Simulator and Tools default folded, preserving saved preferences; Reset restores default folds. Camera groups hide in Video main mode. Options is closed by default. Orbit/Top follow the drone; Chase/FPV reuse the Follow icon for replay-follow. Roof visibility affects shared geometry, satellite has separate main/Studio controls, X-ray retains FPV camera-near fading, and Reset returns to Orbit/parks the simulator. Browser checks pending.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#156](https://github.com/voidbrain/openbando/pull/156) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks passed; Browser/accessibility · 2026-10-28 · local Playwright run of the Views test passed after the follow-up (quick order, plain editor row, 18px Options icons, no Follow replay text); the #156 version failed locally on an ambiguous FPV locator, now scoped to the camera group; CI · Pending |
| Reviewed | 2026-10-28 |

</details>

User-accepted fixes are preserved in the dated archives rather than repeated here. New findings reuse an existing ID when they concern the same behavior.

## Other changes

Completed documentation and backlog changes, with PR links and verification evidence, are in [the maintenance history](archive-2026-10-28.md#completed-maintenance-and-documentation). Product work and pending media checks remain in the bug/feature records above.
