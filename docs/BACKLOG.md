# OpenBando backlog

Current work ledger, reviewed 29 October 2026 against main `be3e910` (merged #196), with every CI job of #162–#195 read (`npm run ci:status`). #154–#158 had merged with failing browser shards; their causes were fixed by #159 (Reset UI, countdown pause) and #162/#168 (Auto-sync, B-025). Closed items and their PR history are in [the archive](archive/backlog-2026-10-28.md). The [follow-up audit](audits/2026-10-28.md) records current CI evidence and documentation gaps; the [original audit](audits/2026-10-27.md) preserves its historical findings; the [archived working plan](archive/working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

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

## Other changes

`main` protection active 2026-10-29 (user request, set through the API): ruleset "protect main" requires `check`, `e2e (1)`–`e2e (4)` and `race-browser` and refuses force pushes and deletion. B-025 (the flaky Auto-sync check) was closed first so the required checks are reliable.

Harness template 1.3.0 (2026-10-29, this PR): the AGENTS Work-tracking bullet on harness changes asked from a project reconciled from the template (a copied tool or a rule for every project changes in the template first; settings and project content stay here), `.harness.json` on 1.3.0; no copied file changed. Pending: this PR's CI.

Completed documentation and backlog changes, with PR links and verification evidence, are in [the maintenance history](archive/backlog-2026-10-28.md#completed-maintenance-and-documentation). Product work and pending media checks remain in the bug/feature records above.
