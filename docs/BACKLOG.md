# OpenBando backlog

Current work ledger, reviewed 28 October 2026 against merged PR #148 and its actual CI results. Closed items and their PR history are in [the archive](archive-2026-10-28.md). The [follow-up audit](audits/2026-10-28.md) records current CI evidence and documentation gaps; the [original audit](audits/2026-10-27.md) preserves its historical findings; the [archived working plan](working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

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

Each item has a compact summary, followed immediately by its full-width next action and human dependency. Expand its details for PR history, opened/reviewed dates and verification evidence.

## Bugs and reliability

### B-009

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-009 | 🔶 P2 | Implemented | Simulator and selected-flight/video regression |

**Next action / closure evidence:** Manually exercise simulator entry/exit, collision and selected-flight/video replay and synchronization after editor/racing changes.

**Human action required:** **Yes**<br />Manually check simulator entry, collisions and selected-flight/video replay.

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

**Next action / closure evidence:** User reports truncated Fly, a trailing mascot wait and leaked path after return. Replaced fixed waits with complete card films and three mascot checkpoints; replay now waits for the full flight. Entry restores 3D overview/Follow off and render boundary suppresses paths. Recheck full showcase and visual timing. The #148 eight-second card completion/distributed mascot, reduced-motion and Stop checks passed; full replay reached completion but its continuation assumed a nonexistent saved demo card. Replace that assumption with an imported saved fixture.

**Human action required:** **Yes**<br />Review Welcome timing, presentation and the final Welcome-only screen.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#124](https://github.com/voidbrain/openbando/pull/124) (merged; action-order checks passed in #124 CI); [CI failure](https://github.com/voidbrain/openbando/actions/runs/40650990021/job/122690744193); [#107](https://github.com/voidbrain/openbando/pull/107) (fix; browser checks pending); [#109](https://github.com/voidbrain/openbando/pull/109) (merged; visual/browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending)  [#148](https://github.com/voidbrain/openbando/pull/148);; CI/backlog follow-up PR pending |
| Opened | 2026-10-27 |
| Verification | Unit/integration · 2026-10-28 · new exit/load join passed; Browser/accessibility + Human presentation · Pending for this correction (earlier CI remains historical).; Browser/accessibility · 2026-10-28 · [#148 CI](https://github.com/voidbrain/openbando/actions/runs/40738619197) failed in repeated contrast probes and continuation fixture; fixes pending new browser run. |
| Reviewed | 2026-10-28 |

</details>

### B-017

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟠 | B-017 | 🔶 P2 | Investigate | Villetta replay misalignment with video |

**Next action / closure evidence:** User confirms video and log timing is synchronized and that the greenhouse is approximately 30–40 cm above the surrounding ground; release 11 models an estimated 35 cm raised floor and frame. Investigate spatial displacement around the main store and greenhouse west exit. The [demo investigation](audits/2026-10-27-villetta-replay.md) matches the screenshots and identifies a separate hidden-origin projection defect (B-018), but does not establish its effect in the saved session. The greenhouse arch control uses a dimensionless crown-height-to-half-width ratio; the inspector now labels it and displays the resulting height in metres. Confirm which control was changed.

**Human action required:** **Yes**<br />Provide the affected saved alignment/session and confirm the changed arch control.

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

**Next action / closure evidence:** A fixed local reference corrects the false sideways component and is kept with private local calibration; hidden sharing removes it. Tests cover start alignment, pin shifts, rotation, saved/imported calibration, multiple flights and the common live projection. A follow-up avoids saving a live reference before the first recorded-flight alignment; verify the pilot’s flight and real live devices. See [investigation](audits/2026-10-27-villetta-replay.md).

**Human action required:** **Yes**<br />Compare the corrected path with the real flight and test real GPS devices.

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

**Next action / closure evidence:** Focused editor workflow passed indoor 2D measurements, debug coordinates, basement keyboard editing, 3D view and measure selection. Review indoor 3D measurement placement specifically; this is not every floor/tool combination.

**Human action required:** **Yes**<br />Check measurement placement on basement and upper floors in 3D indoor mode.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#119](https://github.com/voidbrain/openbando/pull/119) (implemented; browser checks pending) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-28 · focused editor checks passed in [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649); Human + 3D indoor placement · Pending |
| Reviewed | 2026-10-28 |

</details>

### B-020

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-020 | 🔶 P2 | Implemented | Shared foreground/background contrast |

**Next action / closure evidence:** Expanded coverage beyond buttons to text, links, inputs, menus and representative hover/focus styles; new shared token/surface CI check. Generic hover changed the lime fill to purple while retaining dark accent text. Every enabled button variant now pairs dark hover fill with light text; browser regression checks computed contrast at rest and hover. Batch representative discovery and reuse one axe engine for same-document hover/focus probes; retain the separate full-page axe checks and all thresholds.

**Human action required:** **No**<br />Run page-text, representative hover/focus and shared palette checks in CI; inspect any contrast failures.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#145](https://github.com/voidbrain/openbando/pull/145); [#146](https://github.com/voidbrain/openbando/pull/146) (green CI); [#148](https://github.com/voidbrain/openbando/pull/148);; CI/backlog follow-up PR pending |
| Opened | 2026-10-28 |
| Verification | Unit/integration + contrast analysis · 2026-10-28 · #145/#146 CI green; 53 shared text/surface pairs passed; broader interaction suite pending; Browser/accessibility · Pending; Browser/accessibility · 2026-10-28 · [#148 CI](https://github.com/voidbrain/openbando/actions/runs/40738619197) failed in repeated contrast probes and continuation fixture; fixes pending new browser run. |
| Reviewed | 2026-10-28 |

</details>

### B-021

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | B-021 | 🔶 P2 | Implemented | Stored model after showcase exit |

**Next action / closure evidence:** After the showcase, closing Welcome and opening a stored bando can leave only the old path in view. Exit now disables orbit Follow and restores the 3D overview. The new integration test loads real model geometry after exit; browser continuation and visual checks remain. The tour model is intentionally temporary, so the browser continuation now imports its own saved fixture before selecting it.

**Human action required:** **No**<br />Check full-showcase continuation and stored-model loading in browser CI.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#148](https://github.com/voidbrain/openbando/pull/148); CI/backlog follow-up PR pending |
| Opened | 2026-10-28 |
| Verification | Unit/integration · 2026-10-28 · exit + visible stored-model join passed; Browser/accessibility · Pending; Browser/accessibility · 2026-10-28 · [#148 CI](https://github.com/voidbrain/openbando/actions/runs/40738619197) failed in repeated contrast probes and continuation fixture; fixes pending new browser run. |
| Reviewed | 2026-10-28 |

</details>



## Features and limitations

### F-001

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-001 | 🔶 P2 | Implemented | Cut/Wing for diagonal basement outlines |

**Next action / closure evidence:** Recovered #117 onto current main: its merge into the former feature branch did not reach main. Diagonal Cut/Wing and 3D floor-height previews are implemented; verify browser editing and persistence. Open perimeter edges remain guarded for Cut/Wing (F-004).

**Human action required:** **Yes**<br />Review diagonal Cut/Wing editing and saved/imported outlines.

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

**Next action / closure evidence:** Design a representation and editing, saving, terrain cuts, floor/wall rendering and collision for courtyards and separate pieces; currently one simple perimeter only. Floor voids are separate and already exist.

**Human action required:** **No**<br />Agent can implement perimeter holes and disconnected basement pieces.

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

**Next action / closure evidence:** 3D indoor −1 now has draggable vertex handles and keyboard move/insert/remove controls using the 2D validation and undo paths. Verify pointer, keyboard, rotated buildings, persistence and accessibility in browser CI.

**Human action required:** **Yes**<br />Drag 3D basement vertices on rotated buildings and confirm save/undo behavior.

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

**Next action / closure evidence:** Cut/Wing passed #141 CI. Length/width now scale the existing outline, preserving edge identity and item world positions; footprint restoration supports matching normalized boundaries with either winding, and validates closed-wall topology replacement. Rejects ambiguous open-wall topology/legacy shaped compass-door data and destructive edits. Resize/restore browser checks passed in #142 CI. Ambiguous open-wall topology changes and legacy shaped compass-door migration remain guarded; investigate safe correspondence before relaxing those guards.

**Human action required:** **No**<br />Investigate safe correspondence for ambiguous open-wall topology and legacy shaped compass doors.

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

**Next action / closure evidence:** Browser-test wall, void, door, window, column and stair placement, rotated buildings, upper floors and −1; exercise move/resize handles and keyboard/accessibility. The #147 floor matrix exposed Wall selection resetting itself to Select on all floors; corrected the indoor-entry order. New real-pointer tests cover column/wall/void placement at −1/G/L1 on a rotated building, column undo/redo, exported floor isolation and axe ([#147](https://github.com/voidbrain/openbando/pull/147); failed historically; corrected in #148). Doors, windows, stairs and full handle coverage remain open.

**Human action required:** **No**<br />Extend coverage to doors, windows, stairs and remaining handles.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#86](https://github.com/voidbrain/openbando/pull/86), [#88](https://github.com/voidbrain/openbando/pull/88), [#95](https://github.com/voidbrain/openbando/pull/95) (implementation and partial browser coverage)  [#148](https://github.com/voidbrain/openbando/pull/148) (Wall selection fix); |
| Opened | 2026-10-27 |
| Verification | Pending — see PR/evidence for partial automated coverage; Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit)  Browser/accessibility · 2026-10-28 · [#147 CI](https://github.com/voidbrain/openbando/actions/runs/40734777783) failed at Wall activation on every floor; corrected in #148 (passing floor matrix below).; Browser/accessibility · 2026-10-28 · #148 −1/G/L1 pointer placement, undo/export floor isolation and axe passed in [shard 3](https://github.com/voidbrain/openbando/actions/runs/40738619197/job/122993847187) and [shard 4](https://github.com/voidbrain/openbando/actions/runs/40738619197/job/122993847284). |
| Reviewed | 2026-10-28 |

</details>

### F-006

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🟡 | F-006 | 🔹 P3 | Implemented | Studio controls and vegetation |

**Next action / closure evidence:** Review compass consistency, expand/dock controls, 3D construction previews, measures and hedge/bramble brush shapes in both views.

**Human action required:** **No**<br />Agent can check Studio controls and vegetation previews in both views.

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

**Next action / closure evidence:** User accepted the animation apart from the Welcome tour timing in B-011; retain responsive and reduced-motion checks.

**Human action required:** **Yes**<br />Review the remaining Welcome timing/presentation points tracked by B-011.

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

**Next action / closure evidence:** Follow the [field checklist](racing/README.md): align two devices, compare timing, connect two real GPS streams, verify stale hiding, GPS loss, relay disconnect/rejoin and crowded paths in every camera. No field-readiness claim until completed.

**Human action required:** **Yes**<br />Run the two-device race/GPS field checklist with real telemetry feeds.

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

**Next action / closure evidence:** README and AGENTS corrected for diagonal Cut/Wing, 3D vertices, release 11 and showcase exit. Regenerated guide pages and corrected generator entry instructions. Clips and Welcome films last changed 24 October; re-record and visually review them against current UI.

**Human action required:** **No**<br />Agent can re-record guide clips/films and review them against the current UI.

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

**Next action / closure evidence:** User accepted compass controls. Hide on every Welcome screen and blank scene, and show with a nonblank model; regression checks passed for initial/final Welcome and model load in [#143 CI](https://github.com/voidbrain/openbando/actions/runs/40729835588) ([#143](https://github.com/voidbrain/openbando/pull/143)). Keep the widget above the version badge.

**Human action required:** **Yes**<br />Confirm compass hiding and clearance during the Welcome tour, as in B-011.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#109](https://github.com/voidbrain/openbando/pull/109) (merged); [#115](https://github.com/voidbrain/openbando/pull/115) (first axe fix failed); [#116](https://github.com/voidbrain/openbando/pull/116) (vector fix; browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending) |
| Opened | 2026-10-27 |
| Verification | Human · 2026-10-28 · compass controls accepted; Browser/accessibility · 2026-10-28 · #143 full CI passed, including final Welcome compass hiding; Browser/accessibility · 2026-10-28 · [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows only; see follow-up audit) |
| Reviewed | 2026-10-28 |

</details>


User-accepted fixes are preserved in the dated archives rather than repeated here. New findings reuse an existing ID when they concern the same behavior.

## Other changes

Completed documentation and backlog changes, with PR links and verification evidence, are in [the maintenance history](archive-2026-10-28.md#completed-maintenance-and-documentation). Product work and pending media checks remain in the bug/feature records above.
