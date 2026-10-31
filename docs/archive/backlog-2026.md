# Closed backlog — 2026

Closed records, moved from the [active backlog](../BACKLOG.md) with their full history. Dated evidence, not current status.

One file per year; records follow their closing date, under a heading per day.

## Closed 27–29 October 2026, before the record layout

| ID | Item | Closure evidence | PR |
|---|---|---|---|
| B-004 | Warehouse wall/terrain flicker | User confirmed on 27 October 2026 that the warehouse/ground intersection looks correct. | [#100](https://github.com/voidbrain/openbando/pull/100) |

B-001 was reopened later on 28 October after a new failed browser run. Its earlier acceptance below is historical; the active backlog records the new investigation and correction.

Closed priorities use a neutral grey square (◻️) while retaining their original P1/P2/P3 label. Historical closure records keep this appearance; reopening restores the coloured priority cue in the active backlog.

Opened dates refer to first entry in the backlog, not the potentially earlier original bug report.

User visual/functional acceptance on 28 October 2026 closes these items. B-013 is supported by the complete successful [PR #116 CI run](https://github.com/voidbrain/openbando/actions/runs/40595652166), including all unit and browser jobs. Historical next-action text below is retained as context, not outstanding work. F-008 and F-012 stay active only for the new B-011 notes.

| ID | Priority | Status | Item | Historical scope / evidence | PR / evidence | Opened | Verification | Closed |
|---|---|---|---|---|---|---|---|---|
| B-001 | ◻️ P1 | Closed | [3D guide timeout](../audits/2026-10-27.md#b-001--3d-guide-timeout) | Action-level failure diagnostics now identify the guide operation and phase. Use a complete PR browser run to diagnose any remaining timeout; sharding and a shorter AI prompt did not establish a fix. | [#98](https://github.com/voidbrain/openbando/pull/98), [#99](https://github.com/voidbrain/openbando/pull/99) (mitigations); [#103](https://github.com/voidbrain/openbando/pull/103) (diagnostics); [CI](https://github.com/voidbrain/openbando/actions/runs/40546232814) (failed) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-005 | ◻️ P2 | Closed | Hill gallery road and portals | User reports visible flickering inside the Playground hill tunnel on 27 October 2026 (screenshot shows horizontal stripes). The vault shell and slab duplicated the floor at the same height; the shell no longer draws that bottom face. Verify a close moving view. Review road/terrain junction and both tunnel ends from above, front, rear and both sides on sloped terrain; compare with [bug reference](working-plan/bugs/bug1.jpg). Road draping and cuts have automated tests, but visual confirmation is pending. | [#93](https://github.com/voidbrain/openbando/pull/93) (road); [#96](https://github.com/voidbrain/openbando/pull/96) (tunnel connections); [#109](https://github.com/voidbrain/openbando/pull/109) (merged; visual/browser verification pending) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-006 | ◻️ P2 | Closed | Road overlaps | Check priority and flicker on slopes in both draw orders, including [reference](working-plan/bugs/bug2.jpg); automated geometry/priority coverage exists. | [#70](https://github.com/voidbrain/openbando/pull/70) (road overlaps); [#93](https://github.com/voidbrain/openbando/pull/93) (draping) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-007 | ◻️ P2 | Closed | Basement lighting and connections | User reports the warehouse basement looks correct on 27 October 2026; independently verify other lighting and tunnel/room connections. Inspect shadows under G and through its opening; fly through openings to overlapping box rooms and curved tunnels. Test independently sized and rotated basements. | [#92](https://github.com/voidbrain/openbando/pull/92) (shadows); [#94](https://github.com/voidbrain/openbando/pull/94), [#96](https://github.com/voidbrain/openbando/pull/96) (connections) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-008 | ◻️ P2 | Closed | Flight descent smoothing | Compare the demo CSV descent with its corresponding video; unit coverage does not verify the visual result. | — | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-010 | ◻️ P1 | Closed | Tunnel unit test timeout in CI | The `check` job in PR #103 timed out in `site-model.spec.ts` after 5 seconds. The test now reuses the rendered model and uses a smaller grid containing the whole hill and both tunnel portals; the next check passed, while the complete browser run remains in progress. | [#103 CI](https://github.com/voidbrain/openbando/actions/runs/40555115536) (failed); [#104 CI](https://github.com/voidbrain/openbando/actions/runs/40556707739) (check passed; run in progress) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-012 | ◻️ P2 | Closed | Villetta store central columns and annex walls | Release 10 provides a 1 m clear gap between indoor column faces, removes the duplicate south partition, extends the south wall after its first opening and raises the east segments to the first floor while retaining both openings. Check the fresh example and avoid overwriting saved copies. | [#109](https://github.com/voidbrain/openbando/pull/109) (merged; visual/browser verification pending) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-013 | ◻️ P1 | Closed | Vault floor regression times out in CI | The vault geometry test timed out at five seconds in CI. Test the actual underground geometry directly instead of building the entire scene and meadow; rerun CI without increasing the timeout. | [#111](https://github.com/voidbrain/openbando/pull/111) (test optimization; CI pending) | 2026-10-27 | Unit/integration + Browser/accessibility · 2026-10-27 · [complete CI passed](https://github.com/voidbrain/openbando/actions/runs/40595652166); Human · 2026-10-28 · accepted CI evidence | 2026-10-28 |
| F-007 | ◻️ P2 | Closed | Villetta against survey and photos | Release 9 moves the greenhouse end frame from the annex-side end to the opposite end; review its structure against IMG_4341. Check annex walls/openings, centre roof strip, ladder cabin, east walkway and estimated dimensions against the [archived survey](working-plan/working-plan-2026-10-27.md#bando-villetta--specs) and fresh example. Do not overwrite existing user copies. | [#106](https://github.com/voidbrain/openbando/pull/106) (frame relocation; visual review pending) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-014 | ◻️ P2 | Closed | First video shows Sync again | Saved offsets are restored automatically for a matching flight and file; the action is consistently labelled Auto-sync. Verify first load and restored offsets in the browser. | [#112](https://github.com/voidbrain/openbando/pull/112) (fix; browser checks pending) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |
| B-015 | ◻️ P2 | Closed | Welcome mascot resumes instead of restarting | The mascot restarts at the first frame when Welcome opens. Verify reopening and reduced-motion behavior in a browser. | [#112](https://github.com/voidbrain/openbando/pull/112) (fix; browser checks pending) | 2026-10-27 | Human · 2026-10-28 · accepted in conversation | 2026-10-28 |

### Completed maintenance and documentation

Closed on 28 October after checking the merged documentation and recorded verification evidence. Pending product/media work remains in the active backlog; closing these maintenance records does not close those features.

| Signal | Change | PR / evidence | Status | Verification | Closed |
|:---:|---|---|---|---|---|
| 🔵 | Replace ambiguous Verify/Done statuses with Implemented/Verified/Closed; record verification date, method, result and evidence separately from ledger review. | [#120](https://github.com/voidbrain/openbando/pull/120) | Closed | Documentation · 2026-10-28 · table schema checked | 2026-10-28 |
| 🔵 | Follow-up code/documentation audit; refresh CI evidence and generated guide text without claiming clip regeneration. | [#125](https://github.com/voidbrain/openbando/pull/125); [audit](../audits/2026-10-28.md) | Closed | Documentation · 2026-10-28 · audit report and evidence checked; remaining media work tracked separately in F-011 | 2026-10-28 |
| 🔵 | Add first-column status signals with a legend; retain written status and separate priority, and preserve ID ordering. | [#126](https://github.com/voidbrain/openbando/pull/126) | Closed | Documentation · 2026-10-28 · row/legend consistency checked | 2026-10-28 |
| 🔵 | Add distinct priority shapes beside P1/P2/P3 and document the separate status/priority cues. | [#127](https://github.com/voidbrain/openbando/pull/127) | Closed | Documentation · 2026-10-28 · priority labels, markers and table widths checked | 2026-10-28 |
| 🔵 | Use neutral grey priority markers for Closed and Blocked items, retaining historical P1/P2/P3; apply to the closed archive and document reopening behavior. | [#128](https://github.com/voidbrain/openbando/pull/128) | Closed | Documentation · 2026-10-28 · closed priorities and table widths checked | 2026-10-28 |
| 🔵 | Add compact lifecycle legend with requirements, conditional transitions and priority-cue effects. | [#129](https://github.com/voidbrain/openbando/pull/129) | Closed | Documentation · 2026-10-28 · six statuses and transition/colour rules reviewed | 2026-10-28 |
| 🔵 | Add final Human action required column to bugs/features, retaining user legend edits and distinguishing human dependencies from agent work. | [#130](https://github.com/voidbrain/openbando/pull/130) | Closed | Documentation · 2026-10-28 · all 23 rows and original-field preservation checked | 2026-10-28 |
| 🔵 | Repair maintenance table formatting and archive completed documentation changes. | [#131](https://github.com/voidbrain/openbando/pull/131) | Closed | Documentation · 2026-10-28 · eight contiguous six-column rows checked; active bug/feature rows preserved | 2026-10-28 |
| 🔵 | Consolidate backlog maintenance rules and add a repeatable PR/CI and stale-state review procedure. | [#132](https://github.com/voidbrain/openbando/pull/132) | Closed | Documentation · 2026-10-28 · merged #132 reviewed; rule links and product-row preservation checked | 2026-10-28 |
| 🔵 | Reconcile README, AGENTS, design/mascot/racing guides and backlog ownership, exceptions and stale status references. | [#133](https://github.com/voidbrain/openbando/pull/133) | Closed | Documentation + Browser/accessibility · 2026-10-28 · merged #133 reviewed; all jobs passed in [CI](https://github.com/voidbrain/openbando/actions/runs/40664998050) | 2026-10-28 |
| 🔵 | Adopt the project-harness template: the backlog, freshness, CI-status and conventions tools became its v1.1.1 copies with settings in `.harness.json`, plus `check-harness`; output unchanged. | [#195](https://github.com/voidbrain/openbando/pull/195) | Closed | Script + Browser/accessibility · 2026-10-29 · check output identical before/after; all jobs passed in [CI](https://github.com/voidbrain/openbando/actions/runs/40868129641) | 2026-10-29 |
| 🔵 | Harness template 1.2.0: `tools/check-harness.mjs` copied (warns when the template clone is missing, behind, ahead, dirty or unreachable), the AGENTS Work-tracking bullet reconciled (pull the template first), `.harness.json` on 1.2.0. | [#196](https://github.com/voidbrain/openbando/pull/196) | Closed | Script · 2026-10-29 · `check:freshness` reported "Harness: on template v1.2.0"; all required jobs passed in [CI](https://github.com/voidbrain/openbando/actions/runs/40870198301) | 2026-10-29 |
| 🔵 | Harness template 1.3.0: the AGENTS Work-tracking bullet on harness changes asked from a project, `.harness.json` on 1.3.0; no copied file changed. | [#197](https://github.com/voidbrain/openbando/pull/197) | Closed | Script · 2026-10-29 · `check:freshness` reported "Harness: on template v1.3.0"; all required jobs passed in [CI](https://github.com/voidbrain/openbando/actions/runs/40882878042) | 2026-10-29 |
| 🔵 | Harness template 1.4.0: `tools/check-harness.mjs` copied (forked files, override markers), the AGENTS Work-tracking bullets reconciled, `.harness.json` on 1.4.0 with an empty `forked`. | [#198](https://github.com/voidbrain/openbando/pull/198) | Closed | Script · 2026-10-29 · `check:freshness` reported "Harness: on template v1.4.0"; all required jobs passed in [CI](https://github.com/voidbrain/openbando/actions/runs/40887744213) | 2026-10-29 |

### B-001 closure after reopening

This supersedes the earlier acceptance record: reopening led to the elapsed-time correction in #123 and the complete successful #124 browser run. No required human check remains for this timeout fix.

| Signal | ID | Priority | Status | Item | Resolution / evidence | PR / evidence | Opened | Verification | Closed | Human action required |
|:---:|---|---|---|---|---|---|---|---|---|---|
| 🔵 | B-001 | ◻️ P1 | Closed | 3D guide timeout (reopened) | Resolved after all PR #124 browser shards passed the unchanged timeout; closed on 28 October 2026. | [#121 CI](https://github.com/voidbrain/openbando/actions/runs/40645425377) (failed shard 2); [#123](https://github.com/voidbrain/openbando/pull/123) (animation clock and static shadows) | 2026-10-27 | Unit/integration + Browser/accessibility · 2026-10-28 · 513 tests and all browser jobs passed in [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) | 2026-10-28 | **No**<br />No remaining action; automated acceptance criteria passed. |

### B-016 verified Reset workflow

Closed after checking the focused browser test and every job in PR #134 CI, not from merge alone.

| Signal | ID | Priority | Status | Item | Resolution / evidence | PR / evidence | Opened | Verification | Closed | Human action required |
|:---:|---|---|---|---|---|---|---|---|---|---|
| 🔵 | B-016 | ◻️ P2 | Closed | Reset UI after Hide all | Reset after repeated Hide all restores the working panel set and default geometry/appearance; a subsequent Reset preserves an explicitly closed panel. | [#112](https://github.com/voidbrain/openbando/pull/112) (fix; browser checks pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending)  [#134](https://github.com/voidbrain/openbando/pull/134) (focused Reset workflow); | 2026-10-27 | Unit/integration + Browser/accessibility · 2026-10-28 · focused Reset regression passed (5.3 s); all jobs passed in [#134 CI](https://github.com/voidbrain/openbando/actions/runs/40675787359) | 2026-10-28 | **No**<br />No remaining action; focused automated acceptance passed. |

### Verified automated closure — PR #136

Closed on 28 October after inspecting all jobs and the focused browser log in [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297). All nine focused tests passed, including diagonal export/import at both rotations and the English/Italian credential notice. B-002 also has passing mesh/raycast/collision regression evidence; browser captures are diagnostics rather than a claimed human visual review.

| Signal | ID | Priority | Status | Item | Resolution / evidence | PR / evidence | Opened | Verification | Closed | Human action required |
|:---:|---|---|---|---|---|---|---|---|---|---|
| 🔵 | B-002 | ◻️ P1 | Closed | [Diagonal interior partitions render/collide in the wrong place](../audits/2026-10-27.md#b-002--diagonal-interior-partitions) | Diagonal mesh/raycast/collision checks and real browser plan/3D floor isolation passed on G/−1 at 0° and 37°. Scope is automated geometry and browser regression, not a new human review of every camera angle. | [#103](https://github.com/voidbrain/openbando/pull/103) (fix; merged); [CI](https://github.com/voidbrain/openbando/actions/runs/40555115536) (check failed; see B-010)  [#136](https://github.com/voidbrain/openbando/pull/136) (diagonal browser round trip); [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297) (all jobs passed); | 2026-10-27 | Unit/integration + Browser/accessibility · 2026-10-28 · [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297); focused editor/racing job: 9 tests passed | 2026-10-28 | **No**<br />No remaining action for the recorded acceptance criteria. |
| 🔵 | B-003 | ◻️ P1 | Closed | [Accepted basement outline can be lost on sanitization](../audits/2026-10-27.md#b-003--basement-outline-coordinate-limit) | Browser vertex edit/undo/redo, Save, actual exported-file outline/partition checks, original-fixture deletion and re-import passed at 0° and 37°. | [#103](https://github.com/voidbrain/openbando/pull/103) (fix; merged); [CI](https://github.com/voidbrain/openbando/actions/runs/40555115536) (check failed; see B-010)  [#136](https://github.com/voidbrain/openbando/pull/136) (diagonal browser round trip); [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297) (all jobs passed); | 2026-10-27 | Unit/integration + Browser/accessibility · 2026-10-28 · [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297); focused editor/racing job: 9 tests passed | 2026-10-28 | **No**<br />No remaining action for the recorded acceptance criteria. |
| 🔵 | F-010 | ◻️ P2 | Closed | AI server credential persistence | English and Italian disclosure visibility, accessible input description and actual token persistence passed after correcting test setup. | [#105](https://github.com/voidbrain/openbando/pull/105) (disclosure; browser check pending)  [#135](https://github.com/voidbrain/openbando/pull/135) (credential notice checks);  [#136](https://github.com/voidbrain/openbando/pull/136) (test setup correction); [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297) (all jobs passed); | 2026-10-27 | Browser/accessibility · 2026-10-28 · [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297); focused editor/racing job: 9 tests passed | 2026-10-28 | **No**<br />No remaining action for the recorded acceptance criteria. |
| 🔵 | F-014 | ◻️ P2 | Closed | Dock Inspector by default | Default Inspector docking and reserved plan/3D canvas width passed in the focused editor workflow. | [#119](https://github.com/voidbrain/openbando/pull/119) (implemented; browser checks pending)  [#135](https://github.com/voidbrain/openbando/pull/135) (expanded Studio checks); [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297) (all jobs passed); | 2026-10-28 | Browser/accessibility · 2026-10-28 · [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297); focused editor/racing job: 9 tests passed | 2026-10-28 | **No**<br />No remaining action for the recorded acceptance criteria. |
| 🔵 | F-015 | ◻️ P3 | Closed | Ground coordinate debug mode | Plan and 3D debug checks passed: sample ground while editing −1, update coordinates on another click, retain floor selection and hide output when disabled. | [#119](https://github.com/voidbrain/openbando/pull/119) (implemented; browser checks pending)  [#135](https://github.com/voidbrain/openbando/pull/135) (expanded Studio checks); [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297) (all jobs passed); | 2026-10-28 | Browser/accessibility · 2026-10-28 · [PR #136 CI](https://github.com/voidbrain/openbando/actions/runs/40684523297); focused editor/racing job: 9 tests passed | 2026-10-28 | **No**<br />No remaining action for the recorded acceptance criteria. |

### Completed review-procedure follow-up

| Signal | Change | PR / evidence | Status | Verification | Closed |
|:---:|---|---|---|---|---|
| 🔵 | Require active reassessment of status/actions/verification and execution of authorized feasible next steps on every change/review. | [#136](https://github.com/voidbrain/openbando/pull/136) | Closed | Documentation · 2026-10-28 · merged #136 rules reviewed; CI passed | 2026-10-28 |

### F-013 close-zoom verification

Closed after inspecting every job in [run 40708072276](https://github.com/voidbrain/openbando/actions/runs/40708072276), including the focused log showing all nine tests passed. This closure records the final correction after the earlier failed #137/#138 test setups; their history remains below in the PR evidence. Closure reconciliation: [#140](https://github.com/voidbrain/openbando/pull/140).

| Signal | ID | Priority | Status | Item | Resolution / evidence | PR / evidence | Opened | Verification | Closed | Human action required |
|:---:|---|---|---|---|---|---|---|---|---|---|
| 🔵 | F-013 | ◻️ P2 | Closed | Close editor zoom and drone dimensions | SVG wheel forwarding uses the map limits. Browser checks passed >100 px/metre plan detail and two distinct 3D ground samples less than 10 cm apart. Physical quad versus scaled replay marker is documented in README. | [#119](https://github.com/voidbrain/openbando/pull/119) (implemented; browser checks pending) [#137](https://github.com/voidbrain/openbando/pull/137) (overlay wheel fix); [#138](https://github.com/voidbrain/openbando/pull/138) (ground-target test correction after #137 merge); [#139](https://github.com/voidbrain/openbando/pull/139) (sequential sampling correction); [#139](https://github.com/voidbrain/openbando/pull/139) (sequential sampling correction; merged); | 2026-10-28 | Unit/integration + Browser/accessibility · 2026-10-28 · all jobs passed in [#139 CI](https://github.com/voidbrain/openbando/actions/runs/40708072276); nine focused browser tests passed | 2026-10-28 | **No**<br />No remaining action for the recorded zoom criteria. |

### Completed zoom follow-up

| Signal | Change | PR / evidence | Status | Verification | Closed |
|:---:|---|---|---|---|---|
| 🔵 | Reconcile #136 verification, close five accepted automated items and fix the remaining overlay zoom limit. | [#137](https://github.com/voidbrain/openbando/pull/137) | Closed | Documentation + Browser/accessibility · 2026-10-28 · merged #137/#138/#139 reconciled; final [CI](https://github.com/voidbrain/openbando/actions/runs/40708072276) passed | 2026-10-28 |

### Accepted interface palette — 28 October

| Signal | ID | Priority | Status | Item | Resolution | PR / evidence | Opened | Verification | Reviewed | Human action required |
|:---: |---|---|---|---|---|---|---|---|---|---|
| 🔵 | F-016 | ◻️ P3 | Closed | Indigo/purple interface chrome trial | Dark blue/purple panels, buttons, fields and overlays replace green chrome; lime active controls and existing semantic/data/tool colours retained. Accepted by the user on 28 October; retained as the current palette. Closed after all #144 CI jobs passed. | [#144](https://github.com/voidbrain/openbando/pull/144) | 2026-10-28 | Documentation + contrast checks · 2026-10-28 · semantic/tool tokens unchanged; text, dim, warning and danger >=4.5:1 on opaque surfaces, active buttons 12.49:1; Browser/accessibility · 2026-10-28 · all jobs passed in [#144 CI](https://github.com/voidbrain/openbando/actions/runs/40730326801); Human · 2026-10-28 · “nice, keep new colors” accepted | 2026-10-28 | **No**<br />No action remains. |

## Closed 2026-10-28

### B-021

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-021 | ◻️ P2 | Closed | Stored model after showcase exit |

**Next action / closure evidence:** Closed 2026-10-28: exit/load integration and the full showcase continuation passed, including selecting an imported saved model after Welcome. No remaining action.

**Human action required:** 💻 **No**<br />No action remains.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#150](https://github.com/voidbrain/openbando/pull/150) (closure reconciliation); [#148](https://github.com/voidbrain/openbando/pull/148); [#149](https://github.com/voidbrain/openbando/pull/149) (CI fixes and readable record layout) |
| Opened | 2026-10-28 |
| Verification | Browser/accessibility · 2026-10-28 · [#149 shard 4](https://github.com/voidbrain/openbando/actions/runs/40745098159/job/123016650449) passed full showcase, stopped replay and saved-model continuation; earlier history (resolved by #149): Unit/integration · 2026-10-28 · exit + visible stored-model join passed; Browser/accessibility · Pending; Browser/accessibility · 2026-10-28 · [#148 CI](https://github.com/voidbrain/openbando/actions/runs/40738619197) failed in repeated contrast probes and continuation fixture; fixes pending new browser run. |
| Reviewed | 2026-10-28 |

</details>

### B-020

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-020 | ◻️ P2 | Closed | Shared foreground/background contrast |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-28 after all #150 CI jobs passed. The 53 shared text/surface pairs and page-wide plus representative hover/focus contrast checks passed for Welcome, Views/Guide, the selected editor, Library, assistant and guide caption. No action remains; coverage is representative, not every possible content/state combination.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#151](https://github.com/voidbrain/openbando/pull/151) (closure reconciliation); [#150](https://github.com/voidbrain/openbando/pull/150); [#145](https://github.com/voidbrain/openbando/pull/145); [#146](https://github.com/voidbrain/openbando/pull/146) (green CI); [#148](https://github.com/voidbrain/openbando/pull/148); [#149](https://github.com/voidbrain/openbando/pull/149) (CI fixes and readable record layout) |
| Opened | 2026-10-28 |
| Verification | Browser/accessibility + Unit/integration · 2026-10-28 · all [#150 CI jobs](https://github.com/voidbrain/openbando/actions/runs/40751380759) passed; [shard 1](https://github.com/voidbrain/openbando/actions/runs/40751380759/job/123038674265) passed all four accessibility scenes. Earlier #148/#149 timeouts were corrected by #150. |
| Reviewed | 2026-10-28 |

</details>

**Fly entry, video feedback and Welcome navigation — closed 28 October**

Closed after reading every job of the #154 and #158 CI runs: each item's own browser tests passed in both runs (B-023's in #158, after it existed). Those runs' other failures belong to F-019, F-020 and B-025.

### F-017

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-017 | ◻️ P2 | Closed | Returning-pilot Welcome and Fly workspace |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-28: the returning-pilot and Fly-entry browser workflow passed in #154 and #158 CI; no human check was required. Historical scope: Completed Welcome promotes Open the bandos; replay remains available. Video/log loading exposes the matching panel. Bandos use active badge and Fly opens telemetry except Live link, closes Bandos and selects the 3D model. Flights sits below Video; Views can close and reopen from its menu. New browser workflow and unit checks added; CI pending.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#154 CI](https://github.com/voidbrain/openbando/actions/runs/40765189126); [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395); [#154](https://github.com/voidbrain/openbando/pull/154) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks recorded in PR; Browser/accessibility · 2026-10-28 · "returning pilots open bandos, Fly opens telemetry, and Views can close and reopen" passed in [#154 CI](https://github.com/voidbrain/openbando/actions/runs/40765189126) and [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) |
| Reviewed | 2026-10-28 |

</details>

### B-022

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-022 | ◻️ P2 | Closed | Video first-frame loading feedback |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-28: the loading/undecodable-video browser case passed in #154 and #158 CI. Historical scope: Show Loading video until decoded data/canplay, reset it on replacement and replace it with an error message on decode failure. Unit checks pass; browser presentation remains pending.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#154 CI](https://github.com/voidbrain/openbando/actions/runs/40765189126); [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395); [#154](https://github.com/voidbrain/openbando/pull/154) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks recorded in PR; Browser/accessibility · 2026-10-28 · "loading either recording exposes the other panel and undecodable video has an explanation" passed in [#154 CI](https://github.com/voidbrain/openbando/actions/runs/40765189126) and [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) |
| Reviewed | 2026-10-28 |

</details>

### B-023

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-023 | ◻️ P2 | Closed | Welcome navigation leaves tour overlays; focus detaches on resize |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-28: the navigation-cancellation, destination and resize-focus browser case passed in #158 CI. The Views follow-up (#157) is tracked by F-020. Historical scope: Welcome links and a real user close cancel/clean the tour before navigation, suppressing the tour’s return-to-Welcome restoration. Focus follows its live target bounds each frame and clears if removed. Unit checks cover cancellation during preparation and moving/resizing/detached targets; browser workflow added. Stop remains the separate return-to-Welcome action.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395); [#156](https://github.com/voidbrain/openbando/pull/156) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks passed; Browser/accessibility · 2026-10-28 · "Welcome navigation cancels the tour overlays and keeps the requested destination" (includes viewport resize focus tracking) passed in [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) |
| Reviewed | 2026-10-28 |

</details>

## Closed 2026-10-29

**Welcome countdown and Views hierarchy — closed 29 October**

Closed after reading every job of [#159 CI](https://github.com/voidbrain/openbando/actions/runs/40784413716): all passed without retries.

### F-019

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-019 | ◻️ P2 | Closed | Tour step remaining-time ring |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: every #159 CI job passed with no retries, including the countdown ring, the corrected pause hold and Welcome timing (the B-011 human presentation review stays with B-011). Historical scope: Emptying ring beside the tour title resets per snippet; Welcome uses rendered progress through one 19.7-second mascot loop and replay uses playback progress. Other guides use an explicitly labelled active-time estimate that retains a small remainder while unfinished. Pause holds progress. New browser checks exercise the circle and pause. In CI the pause check failed in #155–#157 and needed a retry in #158: the test read the ring immediately after Pause, before the last mascot frame (≈20 ms of progress) reached it on the next 30 ms refresh. The ring does freeze; the test now waits until two readings 300 ms apart agree, then checks it holds (passed 4/4 locally). Final Welcome presentation review remains B-011.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#159 CI](https://github.com/voidbrain/openbando/actions/runs/40784413716); [#155](https://github.com/voidbrain/openbando/pull/155); [#159](https://github.com/voidbrain/openbando/pull/159) (settled pause read) |
| Opened | 2026-10-28 |
| Verification | Unit/integration · 2026-10-28 · local suite passed; Browser/accessibility · 2026-10-29 · “showcase keeps Welcome open for a complete mascot loop” (ring, pause hold, card films) passed without retry in [#159 CI](https://github.com/voidbrain/openbando/actions/runs/40784413716); earlier history: pause check failed in #155–#157 CI and was flaky in #158 (test read the ring before the last frame landed), corrected in #159 |
| Reviewed | 2026-10-28 |

</details>

### F-020

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-020 | ◻️ P2 | Closed | Views hierarchy and scoped camera options |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: the Views hierarchy test and the Reset UI case passed in #159 CI with no retries. Historical scope: Flights/Timeline/Video then Bandos editor remain directly available; user follow-up: the editor is now a plain `.vis` row at the end (no accent full-width row), the text "Follow replay" label is removed (the Follow icon keeps its replay title/aria-label in Chase/FPV) and Options icons are 18px so the five fit one row. Telemetry, Simulator and Tools default folded, preserving saved preferences; Reset restores default folds. Camera groups hide in Video main mode. Options is closed by default. Quick rows now carry the same Show / Hide title as grouped rows: #156 dropped it, so the Reset UI browser case (and any title lookup) could no longer find Timeline, and Speed is inside the folded Telemetry section. Orbit/Top follow the drone; Chase/FPV reuse the Follow icon for replay-follow. Roof visibility affects shared geometry, satellite has separate main/Studio controls, X-ray retains FPV camera-near fading, and Reset returns to Orbit/parks the simulator. Browser checks pending.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#159 CI](https://github.com/voidbrain/openbando/actions/runs/40784413716); [#156](https://github.com/voidbrain/openbando/pull/156); [#157](https://github.com/voidbrain/openbando/pull/157) (follow-up: quick order, plain editor row, Follow label, 18px icons); [#159](https://github.com/voidbrain/openbando/pull/159) (quick-row titles, Reset UI test) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Documentation · 2026-10-28 · local checks passed; Browser/accessibility · 2026-10-29 · “Views promotes workflow panels…”, “active Views icon buttons retain contrast on hover” and “Reset UI restores hidden panels…” (4–7 s) passed in [#159 CI](https://github.com/voidbrain/openbando/actions/runs/40784413716); earlier history: Reset UI failed in #156–#158 CI (6 min locator wait), the Views test failed in #156 (ambiguous FPV locator, corrected by #157) |
| Reviewed | 2026-10-28 |

</details>

**Harness and maintenance — closed 29 October**

Closed after reading every job of each PR's CI with `npm run ci:status`. Lesson recorded: stacked PRs (#160, #161) merged into feature branches without CI and needed #162 to reach main; PRs now target main.

| Signal | Change | PR / evidence | Status | Verification | Closed |
|:---:|---|---|---|---|---|
| 🔵 | Harness checks: `npm run check:conventions` in CI (AGENTS Angular conventions, `core/` imports, unused exports); Playwright `actionTimeout` 90 s; Welcome wordmark through `NgOptimizedImage`. | [#161](https://github.com/voidbrain/openbando/pull/161), recovered to main by [#162](https://github.com/voidbrain/openbando/pull/162) | Closed | Unit/integration + Browser/accessibility · 2026-10-29 · [#162 CI](https://github.com/voidbrain/openbando/actions/runs/40788710587) all jobs passed | 2026-10-29 |
| 🔵 | AGENTS.md split: conventions, architecture, checks, joins, pitfalls, privacy and work tracking stay; area rules move verbatim to `docs/agents/areas.md`. | [#163](https://github.com/voidbrain/openbando/pull/163) | Closed | Unit/integration + Browser/accessibility · 2026-10-29 · [#163 CI](https://github.com/voidbrain/openbando/actions/runs/40788783214) passed (one Auto-sync retry, B-025) | 2026-10-29 |
| 🔵 | `npm run ci:status` (per-PR jobs, failed and retried tests, PRs not based on main); Verification cells hold the current state. | [#164](https://github.com/voidbrain/openbando/pull/164) | Closed | Unit/integration + Browser/accessibility · 2026-10-29 · [#164 CI](https://github.com/voidbrain/openbando/actions/runs/40789398212) all jobs passed | 2026-10-29 |
| 🔵 | Untrack the `node_modules` symlink #166 committed; `.gitignore` ignores `/node_modules` in either form. | [#169](https://github.com/voidbrain/openbando/pull/169) | Closed | Unit/integration + Browser/accessibility · 2026-10-29 · [#169 CI](https://github.com/voidbrain/openbando/actions/runs/40791582789) all jobs passed, no retries | 2026-10-29 |

### F-011

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-011 | ◻️ P3 | Closed | Guide and historical documentation drift |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: re-recorded media merged in #167 and its CI passed (the one Auto-sync retry is B-025). Re-recorded 2026-10-29: all 13 guide clips (`npm run clips`, GPU) and the three Welcome films (`npm run films`). Reviewed frames at 40 % and 95 % of every clip and 10/50/90 % of every film against the current UI (indigo chrome, caption countdown ring, current Views): the old clips still showed the pre-indigo Views panel. The first fly film filmed the tour caption: the recorder added its hiding style after the page loaded, too late in a parallel run; it now injects it before load (re-recorded, no caption). The place clip types Chiari e Forti's published coordinates (a public example), as before. Clips still end on about a second after the step's panels close, as the old ones did. Guide Markdown unchanged. History: README and AGENTS corrected for diagonal Cut/Wing, 3D vertices, release 11 and showcase exit. Regenerated guide pages and corrected generator entry instructions. Clips and Welcome films last changed 24 October; re-record and visually review them against current UI.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#167](https://github.com/voidbrain/openbando/pull/167) (re-recorded clips and films, recorder fix); [#102](https://github.com/voidbrain/openbando/pull/102) (audit) |
| Opened | 2026-10-27 |
| Verification | Media review · 2026-10-29 · agent frame review of every re-recorded clip and film; Browser/accessibility · 2026-10-29 · [#167 CI](https://github.com/voidbrain/openbando/actions/runs/40790645601) passed |
| Reviewed | 2026-10-29 |

</details>

**Auto-sync on CI and 3D indoor tools — closed 29 October**

Closed after reading every job of the listed runs with `npm run ci:status`.

### B-025

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-025 | ◻️ P1 | Closed | Auto-sync demo offset drifts on CI runners |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: with the averaged motion match (#168) Auto-sync found −0.70, −0.72, −0.72, −0.71 and −0.71 s in five consecutive CI runs (#168, #169, #170, #171, #172), every one a motion match and none retried, against `DEMO_OFFSET` −0.69 s and a 0.15 s tolerance. The check is ready to be required by branch protection. History: Second fix ([#168](https://github.com/voidbrain/openbando/pull/168)): after #162 the check still failed once on CI (#163: −0.84 s, then −0.56 s on retry), from a motion match. Nine local scans (normal, 4× and 6× slowed CPU) were captured and replayed offline: the final refinement on the first flip (10 s window) was the scatter (sd 0.045 s, range 0.15 s), while each motion pair's whole-flight offset was steady (sd 0.010–0.032 s). The matcher now averages the confident motion matches (weighted by r) and skips the flip refinement when it has them (refinement stays the fallback): on the same scans sd 0.016 s, range −0.67 … −0.72 s. `DEMO_OFFSET` −0.69 s (that mean); tolerance unchanged at 0.15 s. Earlier: Cause found with a CPU-throttled probe (local Chromium, 8–9 scans per variant): the result depended on the machine. (1) Motion (pan, diff) is measured between two frames but was dated at the later one, so every sample landed half a frame gap late; a slow machine decodes fewer frames, so the gap and the shift grew with load. (2) With fewer frames the sky/ground brightness match (up vs tb) won and gave about −0.87 s, while motion matches gave −0.60 … −0.66 s; brightness lags because the camera's exposure follows the attitude. Fix: `gridFromSamples` dates motion at the interval midpoint and brightness at its frame; the matcher keeps a high-confidence motion match over brightness. After the fix every scan used a motion match: −0.54 … −0.71 s at normal and 4× slowed CPU (mean −0.64, previously −0.51 … −0.89). `DEMO_OFFSET` is now that mean (it came from one scan); the e2e tolerance stays 0.15 s and the test logs the offset and match it found. A playback-rate back-off when frames drop was tried and dropped (no clearer result, slower scans). Remaining: per-run scatter of about ±0.09 s is the method's precision. Close after the check passes in several CI runs without retries.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#168](https://github.com/voidbrain/openbando/pull/168) (averaged motion match); [#163 CI](https://github.com/voidbrain/openbando/actions/runs/40788783214) (failed −0.84 s, passed on retry −0.56 s); [#162 CI](https://github.com/voidbrain/openbando/actions/runs/40788710587) (passed, −0.61 s); [#162](https://github.com/voidbrain/openbando/pull/162) (recovery: #160 merged into the #159 branch after #159 had merged, without CI, and never reached main); [#160](https://github.com/voidbrain/openbando/pull/160) (midpoint dating, motion preference, measured `DEMO_OFFSET`); [#159 rerun](https://github.com/voidbrain/openbando/actions/runs/40785592494) (failed both attempts, 0.18 s); [#159 CI](https://github.com/voidbrain/openbando/actions/runs/40784413716) (passed); [#154 CI](https://github.com/voidbrain/openbando/actions/runs/40765189126) (fail, pass on retry); [#155](https://github.com/voidbrain/openbando/actions/runs/40765867282), [#156](https://github.com/voidbrain/openbando/actions/runs/40769519651), [#157](https://github.com/voidbrain/openbando/actions/runs/40773605465) (failed); [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) (passed) |
| Opened | 2026-10-28 |
| Verification | Unit/integration · 2026-10-29 · averaging case and 538 tests; offline replay sd 0.016 s; Browser/accessibility · 2026-10-29 · five consecutive clean CI runs: [#168 CI](https://github.com/voidbrain/openbando/actions/runs/40791302389), [#169 CI](https://github.com/voidbrain/openbando/actions/runs/40791582789), [#170 CI](https://github.com/voidbrain/openbando/actions/runs/40792623908), [#171 CI](https://github.com/voidbrain/openbando/actions/runs/40793446722), [#172 CI](https://github.com/voidbrain/openbando/actions/runs/40793669586) |
| Reviewed | 2026-10-29 |

</details>

### F-005

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-005 | ◻️ P2 | Closed | 3D indoor tools and handles |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: 3D indoor placement (walls, voids, columns, stairs, doors, windows) on −1/G/L1 of a rotated building, the automatic stairwell, and the 3D building handles (hover cursor, move with undo/redo, resize) all passed in CI. Keyboard use goes through the inspector fields and the −1 vertex keys (F-003); the 3D handles themselves have no keyboard path, which is recorded rather than required. History: 2026-10-29: #165 added real-pointer door/window placement on −1/G/L1 and the automatic stairwell on −1/G (passed in [#165 CI](https://github.com/voidbrain/openbando/actions/runs/40789259441)). `feat/f005-3d-handle-cursor` gives 3D handles hover feedback (`move` / `grab` / `grabbing` cursor; none before) and a browser test that finds them by that cursor, moves the rotated building (undo/redo checked on the plan) and resizes it outwards. Keyboard: the inspector's fields move and size buildings, and −1 vertices have their arrow-key buttons (F-003); there is no keyboard path on the 3D handles themselves. Earlier: Browser-test wall, void, door, window, column and stair placement, rotated buildings, upper floors and −1; exercise move/resize handles and keyboard/accessibility. The #147 floor matrix exposed Wall selection resetting itself to Select on all floors; corrected the indoor-entry order. New real-pointer tests cover column/wall/void placement at −1/G/L1 on a rotated building, column undo/redo, exported floor isolation and axe ([#147](https://github.com/voidbrain/openbando/pull/147); failed historically; corrected in #148). Added 3D stairs placement on −1/G/L1 with undo/redo, exported floor elevation, rotation and floor-isolation assertions; the optional stairwell is disabled where an upper floor exists; the top-floor test asserts that control is absent. Basement/G passed #152 CI; its L1 test failed on an invalid checkbox expectation, corrected in [#153](https://github.com/voidbrain/openbando/pull/153); L1 passed [#153 CI](https://github.com/voidbrain/openbando/actions/runs/40760899876/job/123072222211). Doors, windows, automatic stairwell creation and full handle coverage remain open.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#171](https://github.com/voidbrain/openbando/pull/171) (handle cursor, handles test); [#165](https://github.com/voidbrain/openbando/pull/165) (openings, stairwell); [#153](https://github.com/voidbrain/openbando/pull/153) (top-floor test correction); [#152](https://github.com/voidbrain/openbando/pull/152) (stair-placement browser coverage); [#86](https://github.com/voidbrain/openbando/pull/86), [#88](https://github.com/voidbrain/openbando/pull/88), [#95](https://github.com/voidbrain/openbando/pull/95) (implementation and partial browser coverage); [#148](https://github.com/voidbrain/openbando/pull/148) (Wall selection fix); history: [#147 CI](https://github.com/voidbrain/openbando/actions/runs/40734777783) failed at Wall activation on every floor (corrected in #148); #152 L1 failed on a stairwell checkbox absent on the top floor (corrected in #153); [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed selected workflows |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-29 · openings and stairwell in [#165 CI](https://github.com/voidbrain/openbando/actions/runs/40789259441); 3D handles in [#171 CI](https://github.com/voidbrain/openbando/actions/runs/40793446722); floor placement matrix in #148 and #153 CI |
| Reviewed | 2026-10-29 |

</details>

### F-006

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-006 | ◻️ P3 | Closed | Studio controls and vegetation |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: the studio layout case passed in [#179 CI](https://github.com/voidbrain/openbando/actions/runs/40829131627) (#179 restored the suite budget after #174 merged with it failing). The whole scope is covered: vegetation brush in both views, 3D gesture previews, measures, compass, expand/dock and the editor inside the window. History: #174 merged while its layout test still failed on CI shard 4 (first a wrong width proxy, fixed in #174; then its own 120 s limit under software WebGL); [#179](https://github.com/voidbrain/openbando/pull/179) restores the suite budget. Agent review 2026-10-29 (`test/f006-vegetation-brush`): a new browser test drags a hedge square in 2D (dashed preview during the drag, shrubs planted, one undo/redo step) and a bramble circle in 3D, then checks the exported materials; its screenshots are kept for review. It found two defects, both fixed: (1) no 3D gesture preview was ever drawn: `effect(() => this.r?.setDrawLine(this.drawLine()))` never read the signal while the renderer was missing, so it never subscribed (fence, bridge, tunnel lines and live 3D measures too); the 3D line is now a polyline and the brush draws its area ring; `check:conventions` flags that effect pattern. (2) The brush hint said “trees” for hedges and brambles, and three of its hints had no Italian. Compass and expand/dock ([#174](https://github.com/voidbrain/openbando/pull/174)): Expand studio fills the window in 2D and 3D with the inspector docked and the 3D compass in its bottom-left corner, and Restore returns the panel to its size. The review found the editor opening wider than the window: widening the studio kept its left edge, so a panel opened right of centre ran 27 px off the right edge and cut the inspector; it now slides back inside. Nothing remains in this item's scope. Earlier scope: Review compass consistency, expand/dock controls, 3D construction previews, measures and hedge/bramble brush shapes in both views.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#179](https://github.com/voidbrain/openbando/pull/179) (test budget); [#174 CI](https://github.com/voidbrain/openbando/actions/runs/40798237127) (failed: layout test timeout); [#174](https://github.com/voidbrain/openbando/pull/174) (expand/dock and compass test, editor inside the window); `test/f006-vegetation-brush` (brush test, 3D preview fix, hints); [#84](https://github.com/voidbrain/openbando/pull/84), [#85](https://github.com/voidbrain/openbando/pull/85), [#90](https://github.com/voidbrain/openbando/pull/90) (partial coverage) |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-29 · vegetation brush and 3D previews in [#170 CI](https://github.com/voidbrain/openbando/actions/runs/40792623908); studio layout in [#179 CI](https://github.com/voidbrain/openbando/actions/runs/40829131627) |
| Reviewed | 2026-10-29 |

</details>

### F-004

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-004 | ◻️ P3 | Closed | More flexible basement vertex edits |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: option A (user decision) merged in #185 and its [CI passed](https://github.com/voidbrain/openbando/actions/runs/40836347241); open-wall footprint restoration passed in #166. History: Decision 2026-10-29 (user): option A, migrate. [#185](https://github.com/voidbrain/openbando/pull/185): `migrateCompassDoors` (run by `sanitizeSpec` on every load) puts each legacy compass door of a shaped basement back where it was on the outline\'s bounding box when that spot is on an outline wall with room for it, as a positioned door that is drawn and collides; the others stay in `doors`, unseen. Edits no longer refuse a shaped basement with leftover compass doors: they keep them untouched. A still-rectangular basement keeps its compass doors as they are. Investigation 2026-10-29. (1) Open-wall topology: footprint restoration with a different topology now reuses the Cut/Wing remap (`reshapePerimeter`): a new edge keeps an old edge's state only where it lies exactly on it, collinear same-state edges are joined, and the restore is allowed only when every open span survives whole; otherwise it is refused unchanged as before (no case that was protected can now lose data). (2) Legacy compass doors on a shaped floor: `listOpenings`, the renderer and colliders ignore `level.doors` once a floor has a footprint, so such doors are invisible data; normal reshaping converts them to `wallOpenings` first, so they come only from old saved files. A safe migration exists (place each on the bounding-box side it was authored on, accept only if that point lies on an outline edge), but it would make doors appear in pilots' saved bandos: a product decision. Until then the guard stays. History: Cut/Wing passed #141 CI. Length/width now scale the existing outline, preserving edge identity and item world positions; footprint restoration supports matching normalized boundaries with either winding, and validates closed-wall topology replacement. Rejects ambiguous open-wall topology/legacy shaped compass-door data and destructive edits. Resize/restore browser checks passed in #142 CI. Ambiguous open-wall topology changes and legacy shaped compass-door migration remain guarded; investigate safe correspondence before relaxing those guards.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#185](https://github.com/voidbrain/openbando/pull/185) (option A); [#101](https://github.com/voidbrain/openbando/pull/101) (context); [#122](https://github.com/voidbrain/openbando/pull/122) (perimeter visibility); [#141](https://github.com/voidbrain/openbando/pull/141) (open-edge Cut/Wing); [#142](https://github.com/voidbrain/openbando/pull/142) (safe resize and footprint restoration); [#166](https://github.com/voidbrain/openbando/pull/166) (open-wall restoration) |
| Opened | 2026-10-27 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-29 · migration and restore cases; all jobs in [#185 CI](https://github.com/voidbrain/openbando/actions/runs/40836347241) |
| Reviewed | 2026-10-29 |

</details>

### F-002

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-002 | ◻️ P3 | Closed | Basement perimeter holes and disconnected islands |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: courtyards and separate pieces are implemented (#178, #180, #181, #182, #183, #186) with every PR's CI passed ([#186 CI](https://github.com/voidbrain/openbando/actions/runs/40837944977)); vertex editing of pieces and openings / floor items in pieces are not planned unless a pilot asks (user decision, option b). History: Decision 2026-10-29 (user, option b): vertex editing of separate pieces and openings / floor items inside pieces are not planned unless a pilot asks (delete and redraw a piece; put doors and items in the main basement). Phase 5 docs done (plan status, README, area notes); no guide step or media shows basements. The record had shown “no human action” while that decision was pending: BACKLOG-RULES now says a pending decision makes the cue Yes. Wall switches ([#186](https://github.com/voidbrain/openbando/pull/186)): each courtyard and piece has a switch per wall in the inspector (`setRingWall`); a switched-off courtyard wall is neither drawn nor solid. Phase 4 ([#183](https://github.com/voidbrain/openbando/pull/183)): separate pieces have their own derived floor (walls, floor, colliders), their own volume (terrain cut, floor under the drone), show in the indoor −1 view and on the plan, and are added by the Basement piece tool and deleted from the inspector. Phase 3 tool ([#182](https://github.com/voidbrain/openbando/pull/182)): a Courtyard tool on −1 only (Room group, colour `tool-courtyard`, 2D and 3D drag) adds courtyards through `addCourtyard` (refused with a reason when invalid); the plan draws them; the inspector lists them with Delete; undo/redo; saved with the bando. Phase 3, guards ([#181](https://github.com/voidbrain/openbando/pull/181)): every basement edit refuses a result that leaves a courtyard outside the outline or crossing it, grows into a separate piece, or puts a floor item in a courtyard (`ringsFit` in vertex moves, resize, restore and Cut/Wing; `ringsKept` in saved floor edits); nothing changes when refused. Phase 2 ([#180](https://github.com/voidbrain/openbando/pull/180)): courtyards are drawn and cut. `basementVolume` passes them as runtime `UndergroundSpec.holes`; `insideVolume` keeps the ground (no cut in `cutMask` or `three/underground-cut.ts`) and gives no basement floor there (`floorUnder`); `basementBuilding` passes them to the derived floor (`LevelSpec.courtyards`), so the scene, the indoor −1 view and previews draw a floor with holes and walls with colliders around each courtyard. Phase 1 ([#178](https://github.com/voidbrain/openbando/pull/178)): `core/basement-rings.ts` with `BasementSpec.courtyards` / `pieces`, shape cleaning and placement rules (courtyard strictly inside, ≥ 1 m, clear of other courtyards and floor items; piece apart from the perimeter and other pieces), applied per building by `sanitizeSpec`; invalid rings are dropped, never reshaped; old files unchanged. Nothing is drawn yet. Design 2026-10-29 ([plan](plans/basement-holes-plan.md), [#176](https://github.com/voidbrain/openbando/pull/176)): `BasementSpec.courtyards` (holes through the basement, walls around, ground kept) and `BasementSpec.pieces` (further perimeters), optional with defaults so old files load; validation and caps; five phases: model and validation, courtyard geometry (slabs, walls, volume holes for terrain cut and floorUnder, colliders), courtyard editing (2D/3D, undo, Cut/Wing/resize guards), separate pieces, docs. Earlier: Design a representation and editing, saving, terrain cuts, floor/wall rendering and collision for courtyards and separate pieces; currently one simple perimeter only. Floor voids are separate and already exist.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#186](https://github.com/voidbrain/openbando/pull/186) (wall switches); [#183](https://github.com/voidbrain/openbando/pull/183) (separate pieces); [#182](https://github.com/voidbrain/openbando/pull/182) (tool, inspector, plan); [#181](https://github.com/voidbrain/openbando/pull/181) (edit guards); [#180](https://github.com/voidbrain/openbando/pull/180) (courtyard geometry; [CI passed](https://github.com/voidbrain/openbando/actions/runs/40829931405) after merge); [#178](https://github.com/voidbrain/openbando/pull/178) (phase 1 model); [#176](https://github.com/voidbrain/openbando/pull/176) (design); [#101](https://github.com/voidbrain/openbando/pull/101) (context; limitation remains) |
| Opened | 2026-10-27 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-29 · geometry, guard, tool and wall-switch cases (geometry cases fail with the change disabled); all jobs in [#186 CI](https://github.com/voidbrain/openbando/actions/runs/40837944977); plan and indoor 3D screenshots reviewed |
| Reviewed | 2026-10-29 |

</details>

### F-003

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-003 | ◻️ P2 | Closed | 3D basement vertex handles |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: the 3D pointer drag on a rotated building with undo, redo and save passed in [#188 CI](https://github.com/voidbrain/openbando/actions/runs/40840075605); keyboard vertex controls are covered by the basement editor regression. History: Pointer check automated 2026-10-29 (user: proceed with the checks; [#188](https://github.com/voidbrain/openbando/pull/188)): on a 37° building, indoor −1 in 3D, a vertex handle found by its hover cursor is dragged outwards; the plan shows the vertex moved, Undo restores it, Redo moves it again, and the export holds the grown outline with the rotation kept (passed 2/2 locally). Keyboard vertex controls are already covered by the basement editor regression. 3D indoor −1 now has draggable vertex handles and keyboard move/insert/remove controls using the 2D validation and undo paths. Verify pointer, keyboard, rotated buildings, persistence and accessibility in browser CI.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#188](https://github.com/voidbrain/openbando/pull/188) (3D pointer drag, undo, redo, save); [#101](https://github.com/voidbrain/openbando/pull/101) (2D); [#116](https://github.com/voidbrain/openbando/pull/116) (merged; [CI](https://github.com/voidbrain/openbando/actions/runs/40595652166) passed; pointer review pending); history: unit + browser passed in [#116 CI](https://github.com/voidbrain/openbando/actions/runs/40595652166), 2026-10-27 |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-29 · 3D vertex drag, undo/redo and save in [#188 CI](https://github.com/voidbrain/openbando/actions/runs/40840075605) |
| Reviewed | 2026-10-29 |

</details>

### F-018

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-018 | ◻️ P2 | Closed | Guided Fly procedure |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: the Fly checklist (#173) and its guide step and live-route case (#177) passed CI; the racing/relay branch points to Flights and there is one guide step for the checklist (recorded limits). History: Implemented 2026-10-29 ([#173](https://github.com/voidbrain/openbando/pull/173)): the Fly checklist panel (`FlyChecklist`, Tools group) with Replay / Simulator / Live routes from the plan. Steps are pure (`core/fly-guide.ts`, unit-tested) and ticked from app state, so the list resumes by itself; route and skipped steps persist; Back reopens the last skip, Cancel closes it and keeps files and edits; missing recordings make sync/alignment explain why they are unavailable; the simulator route opens panels and never arms (the arm step has no button). Saved-bando Fly opens it beside the replay workspace. Browser tests cover a replay with a missing video, Back, a real log ticking its step, the simulator route without arming, a reload resuming route and skips, and axe on the panel. #173 CI passed. Follow-up ([#177](https://github.com/voidbrain/openbando/pull/177)): guide step "Follow the Fly checklist" (Flight section, Full and Fly tours, Italian captions, clip recorded and reviewed, guide pages regenerated) and a live-route browser case (opens Live link, connects nothing). Recorded limits: one guide step for the checklist rather than one per route; the racing/relay branch points to Flights. Earlier: [Workflow proposal](plans/fly-workflow-plan.md) separates bando selection, recording availability, simulator setup and live/multi-pilot branches. Planning only; interactive wizard and guide/media updates are not implemented.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#177](https://github.com/voidbrain/openbando/pull/177) (guide step, live case); [#173](https://github.com/voidbrain/openbando/pull/173) (checklist); [#154](https://github.com/voidbrain/openbando/pull/154) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-29 · checklist cases and axe in [#173 CI](https://github.com/voidbrain/openbando/actions/runs/40794614309); guide step and live route in #177 CI |
| Reviewed | 2026-10-29 |

</details>

### B-027

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-027 | ◻️ P1 | Closed | A survey photo published the private Villetta location |

**→ Human action required:** 💻 **No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-29: the photo is out of the tree ([#191](https://github.com/voidbrain/openbando/pull/191), [#191 CI](https://github.com/voidbrain/openbando/actions/runs/40846131546) passed); by user decision the git history is not purged (removal from now on). History: Found 2026-10-29 while preparing to move the working plan: `docs/working-plan/bando-img/IMG_4352.DNG`, committed 26 October in `6d2f161` to this public repository, carried GPS metadata with the private Villetta position (AGENTS: never in the repository). A scan of every tracked image and video found no other file with GPS metadata. [#191](https://github.com/voidbrain/openbando/pull/191) removes it from the tree; it remains in history, in existing clones and possibly in GitHub's caches. Purging needs a history rewrite of every commit since 26 October and a force push (blocked by "protect main" until relaxed), then GitHub support for cached views. Do not repeat the coordinates anywhere.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#191](https://github.com/voidbrain/openbando/pull/191) (removed from the tree) |
| Opened | 2026-10-29 |
| Verification | Documentation · 2026-10-29 · metadata scan of all tracked media, only this file had GPS; [#191 CI](https://github.com/voidbrain/openbando/actions/runs/40846131546) passed; Human · 2026-10-29 · history purge declined by the user |
| Reviewed | 2026-10-29 |

</details>

## Closed 2026-10-30

### F-036

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-036 | ◻️ P3 | Closed | Fence materials: one list, not three |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Found 2026-10-30 while listing the value couplings (F-033): the same list is written by hand in `core/fences.ts` (`FenceMaterial`), `core/site-spec.ts` (`WallSpec.material`) and the editor's icon map, and nothing keeps them equal. Closes when one source feeds the others (or a test fails when they differ) and the coupling in `.harness.json` says so. Closed 2026-10-30: merged in [#229](https://github.com/voidbrain/openbando/pull/229) with every check green (CodeQL included). Done 2026-10-30 ([#229](https://github.com/voidbrain/openbando/pull/229)): `FENCE_MATERIALS` (core/fences.ts) is the one list; `FenceMaterial` and `WallSpec.material` derive from it, `FENCE_ICON` is typed by it; `fences.spec.ts` checks the menu offers exactly that list.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#229](https://github.com/voidbrain/openbando/pull/229); found in [#224](https://github.com/voidbrain/openbando/pull/224) (F-033) |
| Opened | 2026-10-30 |
| Verification | Unit · 2026-10-30 · the one-list tests passed; [#229](https://github.com/voidbrain/openbando/pull/229) CI passed |
| Reviewed | 2026-10-30 |

</details>

### F-037

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-037 | ◻️ P3 | Closed | Roof kinds: one list, not four |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Found 2026-10-30 while listing the value couplings (F-033): the same list is written by hand in `core/site-spec.ts`, `core/ai-commands.ts`, `core/ai-prompt.ts` and the editor template, and nothing keeps them equal. Closes when one source feeds the others (or a test fails when they differ) and the coupling in `.harness.json` says so. Closed 2026-10-30: merged in [#229](https://github.com/voidbrain/openbando/pull/229) with every check green (CodeQL included). Done 2026-10-30 ([#229](https://github.com/voidbrain/openbando/pull/229)): `ROOF_KINDS` (core/site-spec.ts) is the one list; `LevelSpec.roof`, the AI command type and its check, `AI_SCHEMA` and the editor's Roof → shape menu read it; `ai-commands.spec.ts` checks the schema, `set_roof` for each kind, and that the prompt's prose (which cannot read the list) mentions each.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#229](https://github.com/voidbrain/openbando/pull/229); found in [#224](https://github.com/voidbrain/openbando/pull/224) (F-033) |
| Opened | 2026-10-30 |
| Verification | Unit · 2026-10-30 · the one-list tests passed; [#229](https://github.com/voidbrain/openbando/pull/229) CI passed |
| Reviewed | 2026-10-30 |

</details>

### B-037

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-037 | ◻️ P2 | Closed | The camera can go below the terrain |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30: [#230](https://github.com/voidbrain/openbando/pull/230) merged with every check green ([CI](https://github.com/voidbrain/openbando/actions/runs/41000307747), race-browser with the editor close-up case). History: Reported 2026-10-30. Cause: the orbit keeps its angle above the point it looks at, not above the ground under the camera, so a hill between them (or a pan over a hill) puts the camera inside it; the chase camera sits 2.5 m over and 6 m behind the drone, inside a slope behind; the editor's 3D view has the same orbit limits. A first fix (PR #228, 2026-10-30) lifted every orbit, chase and editor camera to 1.5 m above the terrain surface under it: CI failed the close-up case in `editor-regressions.e2e.ts` (two clicks 0.17 m apart instead of under 0.1 m: the zoomed-in editor camera was lifted), and the same rule would wrongly lift cameras in basements (the indoor view of −1 is below ground on purpose) and in tunnels. The fix was taken out of #228. Reworked 2026-10-30 ([#230](https://github.com/voidbrain/openbando/pull/230)): `keepAbove` (three/camera-rig.ts) lifts the orbit and chase cameras and the editor's 3D view to `SiteCollider.groundAt` under them with the camera's height (terrain, floors, a tunnel or basement floor when inside one) plus `CAMERA_CLEARANCE` 0.3 m, still aimed at the target; a target under the terrain (a drone in a tunnel or basement) is left alone, and the editor's indoor and basement views are not lifted. The Welcome films' chase shots may differ slightly: re-recording them is F-031.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Report 2026-10-30; first fix withdrawn from [#228](https://github.com/voidbrain/openbando/pull/228) after CI (race-browser, editor-regressions close-up); reworked in [#230](https://github.com/voidbrain/openbando/pull/230) |
| Opened | 2026-10-30 |
| Verification | Unit · 2026-10-30 · camera-rig tests (hill, slope, close-up, tunnel) passed; Browser · 2026-10-30 · `editor-regressions.e2e.ts` passed locally (11/11, close-up included); [#230 CI](https://github.com/voidbrain/openbando/actions/runs/41000307747) passed |
| Reviewed | 2026-10-30 |

</details>

### F-035

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-035 | ◻️ P3 | Closed | Drag the take-off pad in the editor's 3D view |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30: [#231](https://github.com/voidbrain/openbando/pull/231) merged with every check green ([#231 CI](https://github.com/voidbrain/openbando/actions/runs/41001725088)). History: Split from F-021 on 2026-10-30 at the user's request: F-021 moves the pad in the 2D plan (select, drag, right-click menus) but not in the 3D view. Done 2026-10-30 ([#231](https://github.com/voidbrain/openbando/pull/231)): the take-off pad and its start marker are pickable in the 3D view (`{ kind: 'pad' }`, the last pad only); a click selects it (the inspector shows the pad), and the selected pad has one move handle that drags it through the plan's `pad` gesture (`moveTakeoff`, one undo step). `e2e/takeoff-pad.e2e.ts` drags it in 3D and checks the export; `site-pick.spec.ts` checks that only the take-off pad is picked.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#231](https://github.com/voidbrain/openbando/pull/231); F-021 ([#210](https://github.com/voidbrain/openbando/pull/210)) did the 2D plan only |
| Opened | 2026-10-30 |
| Verification | Unit · 2026-10-30 · pad pick test passed; Browser · 2026-10-30 · `takeoff-pad.e2e.ts` (3 tests, the 3D drag included) passed locally; [#231 CI](https://github.com/voidbrain/openbando/actions/runs/41001725088) passed |
| Reviewed | 2026-10-30 |

</details>

### B-035

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-035 | ◻️ P2 | Closed | Two buildings flush against each other flicker where their walls meet |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30: [#232](https://github.com/voidbrain/openbando/pull/232) merged with every check green ([#232 CI](https://github.com/voidbrain/openbando/actions/runs/41003866157)). History: Found 2026-10-29 (user screenshot of Bardwell House: the dark wall flickering behind the windows). Each side wall is a 0.5 m box centred on the building's edge, so two buildings snapped flush put two identical boxes in one place, and their faces fight in the depth buffer (z-fighting), visible through windows and doors. Bardwell House is fixed in the example (release 4: the wing has no wall on the shared side). General plan: when the site is built, find sides of two buildings that lie on the same line with opposite faces and overlapping spans, and build that stretch once (or inset one of them), keeping both colliders correct; cover it with a model test (two flush buildings: no coincident wall faces) and a screenshot. Done 2026-10-30 ([#232](https://github.com/voidbrain/openbando/pull/232)): `core/flush-walls.ts` `flushWalls` finds wall edges of two buildings on one line (site coordinates, any rotation, rectangles and shaped buildings, more than 10 cm shared); the later building's wall there is built `FLUSH_INSET` (3 cm) thinner on each face, so it sits inside the other and only one face shows. Colliders keep (almost) the same boxes. `flush-walls.spec.ts` covers the pairs; `site-model.spec.ts` checks two flush buildings draw no two wall boxes in one place (it fails with the inset at 0). Not done: a screenshot test (the WebGL e2e cannot see depth fighting reliably).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#232](https://github.com/voidbrain/openbando/pull/232); report 2026-10-29; Bardwell House worked around earlier (release 4 of the example) |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-30 · flush-walls and site-model tests passed (the model test fails without the fix); [#232 CI](https://github.com/voidbrain/openbando/actions/runs/41003866157) passed |
| Reviewed | 2026-10-29 |

</details>

### B-036

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-036 | ◻️ P2 | Closed | Road curves are angular: a sharp corner at every map point |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30: [#233](https://github.com/voidbrain/openbando/pull/233) merged with every check green ([#233 CI](https://github.com/voidbrain/openbando/actions/runs/41002412627)). History: Reported 2026-10-29 ("roads curves are not very good", with a screenshot). B-033 fixed the wedge-shaped gaps at the bends; the road still turns in straight pieces with a corner at each point of the map's line. The rounding has to be applied where the ground under the road is levelled too (`levelRoad`), or the road and the levelled strip part at the corners. Split from B-033 on 2026-10-30 at the user's request. Done 2026-10-30 ([#233](https://github.com/voidbrain/openbando/pull/233)): `roadLine` (core/layers.ts) rounds every corner with a curve tangent to both segments, `roadRadius` wide (1.5 × the width, at least 3 m), never using more than half of either segment; the 3D strip, the levelled ground and the plan (road and its highlight) all draw it, so road and levelled strip stay together at the bends. `layers.spec.ts` checks the curve (tangent points, no step over 30°), that straight and dense lines stay, and that the ground is levelled along the curve; a local screenshot of the plan showed the rounded corners (not a committed test).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#233](https://github.com/voidbrain/openbando/pull/233); report 2026-10-29; B-033 ([#215](https://github.com/voidbrain/openbando/pull/215)) fixed the gaps only |
| Opened | 2026-10-30 |
| Verification | Unit · 2026-10-30 · road curve tests passed; Visual · 2026-10-30 · local plan screenshot, corners rounded; [#233 CI](https://github.com/voidbrain/openbando/actions/runs/41002412627) passed |
| Reviewed | 2026-10-30 |

</details>

### F-032

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-032 | ◻️ P2 | Closed | Element and impact map, generated from the code |

💻 **→ Human action required: No**<br />No action remains; the tips check continues in F-026.

**Next action / closure evidence:** Closed 2026-10-30: steps 1–5 merged, the last in [#238](https://github.com/voidbrain/openbando/pull/238) with every check green ([#238 CI](https://github.com/voidbrain/openbando/actions/runs/41010015998)). History: Requested 2026-10-29 (decided with the user: element level, generated by a script). Step 1 (this PR): `tools/build-element-map.mjs` (`npm run element-map`) writes `docs/agents/element-map.md`: every control the templates show (406) with its label, `data-tour` mark, the guide steps that show it as a tip on hover (9 controls) and the guide steps whose clips use it (18); CI fails when the page differs from the code. The readable impact table is the harness's `docs/agents/impact-map.md` (1.12.0 and later, F-033), not this page: a first version of this PR had it here too, removed so there is one place. Missing rows added (the user noticed the promised full table and rows had been dropped): README and area notes, panels ↔ Views and guide steps, the element map itself. Lesson recorded in the harness: plans given to the user become records at once (template release after this). Step 2 (2026-10-30, [#235](https://github.com/voidbrain/openbando/pull/235)): the builder also writes `docs/guide/clip-sources.json` (each guide clip's component files: the files of the controls its step acts on, with their siblings), checked by the same CI step; `check:media` names the clips whose own controls changed, besides the set-wide warning, which stays because a clip shows more than its controls. 8 of the 14 clips map to controls; the other 6 act on nothing the templates mark, so they rely on the set-wide warning. Step 3 (2026-10-30, [#236](https://github.com/voidbrain/openbando/pull/236)): the element map has a Keys table, every global key the app handles (`ShortcutsService`, the flight keys in `core/radio/radio-input.ts`) and whether the Help panel names it; the builder fails (and so CI) when one is missing. It found Esc (cancel a pin) missing from Help, now added with its Italian. The editor's own keys are left out: they are named in its hints and titles where they apply. Step 4 (2026-10-30, [#237](https://github.com/voidbrain/openbando/pull/237)): a Design-system guides table, each guide with the files and CSS classes its `Source:` line names; the builder fails when a guide has no Source line or names a file or class the code no longer has (tried: a renamed class fails it). CameraCompass had no Source line and ViewsPanel's was inline: fixed. The element-map impact row now also watches the guides and the two key files (step 3 had missed them); the design-system README says every guide ends with a Source line. Step 5 (2026-10-30, [#238](https://github.com/voidbrain/openbando/pull/238)): a Tips per file table (controls, with a tip on hover, with a title, with neither: 407, 9, 116, 286), the inventory F-026 asked for; the check that fails when a control has no tip depends on the rework F-026 must agree first, so it moves there.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#221](https://github.com/voidbrain/openbando/pull/221) (step 1); [#235](https://github.com/voidbrain/openbando/pull/235) (step 2); [#236](https://github.com/voidbrain/openbando/pull/236) (step 3); [#237](https://github.com/voidbrain/openbando/pull/237) (step 4); [#238](https://github.com/voidbrain/openbando/pull/238) (step 5); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · page generated: 406 controls, 9 with a tip, 116 with a title, 18 in clips, 32 names in bound expressions; CI step added; Script · 2026-10-30 · clip-sources.json written for 8 clips, check:media named 6 clips whose controls changed; Script · 2026-10-30 · Keys table: 19 keys, the builder failed on Esc before it was added to Help; Script · 2026-10-30 · 24 guides resolved, a renamed class made the builder fail; Script · 2026-10-30 · Tips per file table written; [#238 CI](https://github.com/voidbrain/openbando/actions/runs/41010015998) passed |
| Reviewed | 2026-10-30 |

</details>

### F-028

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-028 | ◻️ P2 | Closed | Impact map: what must follow when something changes, reminded on every PR |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30 (late: missed by earlier reconciles): [#216](https://github.com/voidbrain/openbando/pull/216) merged with every check green ([#216 CI](https://github.com/voidbrain/openbando/actions/runs/40953446065)). History: Requested 2026-10-29: the BACKLOG-RULES consistency rule ("for every modification, check README, AGENTS…") names no derived things, so updates depend on memory (today `check:i18n` missed fence labels written in TypeScript). Plan (decided with the user): a harness template feature, an impact-map file where each row says which files trigger it, what must follow, the command and what checks it; `check-freshness` reads it and lists, on every PR, "this branch changes X: update Y" (a warning, never blocking); AGENTS and BACKLOG-RULES point to it. Rows here: tour → guide pages; UI shown by a clip or film → the clip or film; user-facing text → Italian; controls → their tips; keys → Help panel; spec fields and AI commands → AI schema and prompt; example builder → examples and catalogue; tokens and components → design-system guides; features → README and area notes. The automatic checks are F-029, F-030, F-031 and F-026. Done 2026-10-29: harness 1.11.0 (template #14) and nine rows in `.harness.json` here (guide pages, clips and films, texts and tips in templates, texts in TypeScript data, Help panel keys, spec and AI commands, example bandos, catalogue, design system); each names what checks it, or "nothing yet" with the record that will.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#216](https://github.com/voidbrain/openbando/pull/216) (CI green); template [#14](https://github.com/voidbrain/project-harness/pull/14) (v1.11.0); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:freshness` on this branch: harness files listed, no impact row triggered (the branch touches none of their files); template `test:tools` 19/19; [#216 CI](https://github.com/voidbrain/openbando/actions/runs/40953446065) passed |
| Reviewed | 2026-10-29 |

</details>

### F-029

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-029 | ◻️ P3 | Closed | CI fails when the guide pages differ from their source |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30 (late: missed by earlier reconciles): [#219](https://github.com/voidbrain/openbando/pull/219) merged with every check green ([#219 CI](https://github.com/voidbrain/openbando/actions/runs/40966883992)). History: Requested 2026-10-29 (part of F-028): the guide pages are generated from the tour source, and nothing checks they were regenerated. Done 2026-10-29: CI step "Guide pages match the tour" runs `node tools/build-guide.mjs` and fails on any difference in `docs/guide` (the committed pages were current); the impact row now names it.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#219](https://github.com/voidbrain/openbando/pull/219); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | CI · 2026-10-29 · the step passes on current main; it fails on a tour change that is not regenerated (diff); [#219 CI](https://github.com/voidbrain/openbando/actions/runs/40966883992) passed |
| Reviewed | 2026-10-29 |

</details>

### F-030

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-030 | ◻️ P3 | Closed | `check:i18n` also reads texts in TypeScript data |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30 (late: missed by earlier reconciles): [#219](https://github.com/voidbrain/openbando/pull/219) merged with every check green ([#219 CI](https://github.com/voidbrain/openbando/actions/runs/40966883992)). History: Requested 2026-10-29 (part of F-028). Found the same day: fence hints such as "Boards on posts" have no Italian, and the check passed because it reads only templates. Done 2026-10-29: `check:i18n` also reads `label` and `hint` in TypeScript data (comments left out); it found 43 texts without Italian (fence hints, tree and brush hints, context-menu labels, AI model descriptions, Railway, Greenhouse…), all translated now; model names stay English (`keep-english.txt`). The impact row now names it.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#219](https://github.com/voidbrain/openbando/pull/219); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:i18n` 841 texts, 0 missing (43 missing before the translations); [#219 CI](https://github.com/voidbrain/openbando/actions/runs/40966883992) passed |
| Reviewed | 2026-10-29 |

</details>

### F-038

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-038 | ◻️ P3 | Closed | Code coverage table, per folder, with a warning when it drops |

💻 **→ Human action required: No**<br />No action remains; browser-test coverage is F-039.

**Next action / closure evidence:** Closed 2026-10-30 (late: missed by earlier reconciles): steps 1–2 merged in [#227](https://github.com/voidbrain/openbando/pull/227) with every check green ([#227 CI](https://github.com/voidbrain/openbando/actions/runs/40978557648)); step 3 is F-039. History: Requested 2026-10-30. Coverage is evidence of what the tests run, not that behaviour is verified (BACKLOG-RULES); branch coverage says the most; no fixed minimum (a number to hit invites tests written for it): a table to find untested parts, and a warning when a folder drops. Recorded at once (plans become records). Done 2026-10-30: steps 1–2 (template [#26](https://github.com/voidbrain/project-harness/pull/26), here [#227](https://github.com/voidbrain/openbando/pull/227), CI green): `docs/agents/coverage.md` and its baseline, CI warnings on drops; step 3 is F-039.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#227](https://github.com/voidbrain/openbando/pull/227); [#226](https://github.com/voidbrain/openbando/pull/226) (plan); request 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Script · 2026-10-30 · first table written (all 53.8 % of lines; ui 0.8 %, browser tests not counted); CI step runs on every PR; [#227 CI](https://github.com/voidbrain/openbando/actions/runs/40978557648) passed |
| Reviewed | 2026-10-30 |

</details>

### F-034

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-034 | ◻️ P3 | Closed | Merge only when every check passes, CodeQL included |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Closed 2026-10-30: a throwaway PR ([#241](https://github.com/voidbrain/openbando/pull/241)) with a deliberate alert (`js/incomplete-sanitization`) had every other check green and CodeQL failing, and GitHub held it BLOCKED; it was closed without merging and its branch deleted. History: Found 2026-10-30: the required checks (ruleset "protect main") did not include CodeQL, and the agent's merge watcher waited only for the required ones, so a PR could merge with an open code-scanning alert (#221 had four: incomplete sanitization in two build tools, fixed in that PR). Decided 2026-10-30 (user): option (c), CodeQL made a required check of "protect main" through the API (required now: check, e2e (1)–(4), race-browser, CodeQL), so GitHub blocks the merge whoever merges; AGENTS names it (a project line). The watcher, a session script, stops on any failing check too.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Ruleset 25780506 updated 2026-10-30; [#223](https://github.com/voidbrain/openbando/pull/223) (AGENTS); found on [#221](https://github.com/voidbrain/openbando/pull/221) |
| Opened | 2026-10-30 |
| Verification | Settings · 2026-10-30 · the ruleset lists CodeQL among the required checks (API); PR · 2026-10-30 · [#238](https://github.com/voidbrain/openbando/pull/238) lists CodeQL among its checks and merged only after it passed; blocking while it fails · 2026-10-30 · [#241](https://github.com/voidbrain/openbando/pull/241): CodeQL failed, all else green, merge state BLOCKED |
| Reviewed | 2026-10-30 |

</details>

### B-038

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-038 | ◻️ P1 | Closed | The telemetry bridge served the drone's GPS position to the whole network |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30: [#243](https://github.com/voidbrain/openbando/pull/243) merged with every check green ([#243 CI](https://github.com/voidbrain/openbando/actions/runs/41047320294)); the owner chose "won't fix" for alert 1 (the UDP listener must take the backpack's Wi-Fi packets and only receives), dismissed with that reason the same day. History: Found 2026-10-30 while checking main's code-scanning alerts after the F-034 test: alert 1 (`py/bind-socket-all-network-interfaces`, open since 2026-10-26) on `tools/elrs_bridge.py` line 95, the UDP listener. Reading the file showed a bigger exposure CodeQL does not flag: the WebSocket that publishes the telemetry (GPS position included, the pilot's secret) listened on `0.0.0.0`, so anyone on the same Wi-Fi could follow the drone, though the page connects to `localhost`. Fixed in [#243](https://github.com/voidbrain/openbando/pull/243): the WebSocket binds `127.0.0.1` by default, `--ws-host` opens it on purpose (the racing README says when: a bridge on another device); the UDP listener keeps every interface by default (it receives the backpack's packets over Wi-Fi), with `--udp-host` to narrow it. Smoke test: `--simulate` listens on `127.0.0.1` only (`lsof`). 

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#243](https://github.com/voidbrain/openbando/pull/243); code-scanning alert 1 |
| Opened | 2026-10-30 |
| Verification | Manual · 2026-10-30 · the simulated bridge listens on 127.0.0.1 only (`lsof`); compiles; [#243 CI](https://github.com/voidbrain/openbando/actions/runs/41047320294) passed; Human · 2026-10-30 · alert 1 dismissed as won't fix by the owner's decision |
| Reviewed | 2026-10-30 |

</details>

### B-011

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-011 | ◻️ P1 | Closed | Welcome tour presentation and exit |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30: the owner reviewed Welcome on the live site ("B-011 is ok, guy timing is fine"). History: [#155](https://github.com/voidbrain/openbando/pull/155) fits card films into the mascot thirds and holds its final frame during the showcase, preventing the accidental second search/run/sit; Pause holds mascot and film. Ring countdown (F-019) is closed; see the archive. [#154](https://github.com/voidbrain/openbando/pull/154) also suppresses saved-sync restoration notices during the showcase (normal loads retain them). Video first-frame feedback (B-022) is closed; see the [archive](archive/backlog-2026-10-28.md). User reports truncated Fly, a trailing mascot wait and leaked path after return. Replaced fixed waits with complete card films and three mascot checkpoints; replay now waits for the full flight. Entry restores 3D overview/Follow off and render boundary suppresses paths. All #149 showcase browser checks passed; final human presentation review remains. The #148 eight-second card completion/distributed mascot, reduced-motion and Stop checks passed; full replay reached completion but its continuation assumed a nonexistent saved demo card. The #149 saved fixture continuation passed.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#155](https://github.com/voidbrain/openbando/pull/155) (one-loop timing); [#150](https://github.com/voidbrain/openbando/pull/150); [#124](https://github.com/voidbrain/openbando/pull/124) (merged; action-order checks passed in #124 CI); [CI failure](https://github.com/voidbrain/openbando/actions/runs/40650990021/job/122690744193); [#107](https://github.com/voidbrain/openbando/pull/107) (fix; browser checks pending); [#109](https://github.com/voidbrain/openbando/pull/109) (merged; visual/browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending); [#148](https://github.com/voidbrain/openbando/pull/148); [#149](https://github.com/voidbrain/openbando/pull/149) (CI fixes and readable record layout); history: #148 continuation failure, corrected by #149 |
| Opened | 2026-10-27 |
| Verification | Browser/accessibility · 2026-10-28 · [#149 shard 4](https://github.com/voidbrain/openbando/actions/runs/40745098159/job/123016650449) passed full replay/continuation, distributed card films, reduced motion, Stop and Auto-sync; Human presentation review · Pending; Human · 2026-10-30 · the owner: Welcome and the mascot's timing are fine |
| Reviewed | 2026-10-30 |

</details>

### F-008

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-008 | ◻️ P3 | Closed | Welcome mascot and Features |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30: the owner reviewed Welcome on the live site ("B-011 is ok, guy timing is fine"). History: User accepted the animation apart from the Welcome tour timing in B-011; retain responsive and reduced-motion checks.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#108](https://github.com/voidbrain/openbando/pull/108) (timing; browser checks pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending); history: timing/reduced-motion passed in [#119 CI](https://github.com/voidbrain/openbando/actions/runs/40643805473) |
| Opened | 2026-10-27 |
| Verification | Human · 2026-10-28 · mascot accepted; Browser/accessibility · 2026-10-28 · complete showcase and timing/reduced-motion tests passed in [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649); Human · 2026-10-30 · the owner: Welcome and the mascot's timing are fine |
| Reviewed | 2026-10-30 |

</details>

### B-026

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-026 | ◻️ P2 | Closed | Welcome wordmark downloads 902 kB on every first visit |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site: "seems equal to previous, seems ok". History: Approved 2026-10-29 (user: smaller export, sharp pixel edges). [#184](https://github.com/voidbrain/openbando/pull/184): the master has 170,025 colours (a smooth generated image, so no lossless palette); Welcome draws it at most 720 CSS px. Exported at 1440 × 367 px (Lanczos), then 256 colours without dithering: 135 kB instead of 902 kB, NG0913 gone; compared at display size and 2× zoom with the original and a full-colour 1440 px export (499 kB), no visible difference. The master is kept at `docs/mascot/openbando-wordmark-master.png`; the wordmark guide says how to re-export. Earlier: `public/mascot/openbando-wordmark.png` is 2172 × 554 px and 902 kB, drawn at a fraction of that width in Welcome; Angular warns NG0913 (oversized image) on every first visit. The image now uses `NgOptimizedImage` with its intrinsic size and `priority` (`check:conventions` requires it), which does not shrink the file. The generated master is not an exact pixel grid, so a smaller export can change letter edges: prepare candidates (nearest-neighbour at the rendered width × 2, and an optimised PNG at the current size) for the wordmark guide's visual review before replacing the approved file.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#184](https://github.com/voidbrain/openbando/pull/184) (1440 px, 256-colour export); [#162](https://github.com/voidbrain/openbando/pull/162) (NgOptimizedImage, size attributes; recovered #161); [audit](audits/2026-10-28.md) (found 2026-10-28) |
| Opened | 2026-10-29 |
| Verification | Browser/accessibility · 2026-10-29 · Welcome wordmark and first-visit a11y cases passed locally; visual comparison reviewed by the agent; Human look · Pending; Human · 2026-10-30 · the owner on the live site: "seems equal to previous, seems ok" |
| Reviewed | 2026-10-30 |

</details>

### B-030

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-030 | ◻️ P2 | Closed | The tool palette hid half its tools behind long press or right click |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site: every tool is in the palette, no long-press menu: "can close". History: Reported 2026-10-29 (the user could not find Cut and Wing). The palette showed one button per group (paint-program style, from 66dfacb, 2026-10-22, with no record or decision); Merge, Cut, Wing, Tree brush, Surface, Water, Tunnel, Courtyard, Void… opened only by long press, right click or a 10 px corner triangle. Decided 2026-10-29 (user): every tool visible, two columns. Now each tool on offer has its own button (`aria-label`, `aria-pressed`), one 2-column block per group; the tree brush's shape and the terrain operation are picked in the options bar (their menus already existed; the sculpt hint moved there); a short editor scrolls the palette; a hairline separates every category (user, 2026-10-29). The wider palette covered the 3D view's vertex box (top left), which #205's first CI run caught (two editor-regressions cases): that box and the keyboard measure box moved to the top right. The flyout code, its styles, the `z-flyout` token and the "hold or click the corner" texts are gone; `ToolPalette.md`, `tokens.json` and the editor area note updated. Covered by `e2e/tool-palette.e2e.ts` (16 outdoor tools visible, two to a row, one click arms, terrain operation from the options bar); the vegetation, courtyard and indoor-placement cases now click the tool's own button. Not checked: a short editor window on a device.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#205](https://github.com/voidbrain/openbando/pull/205) (CI green on its last run; the first run caught the covered 3D vertex box); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `tool-palette`, vegetation, courtyard and indoor-placement e2e passed locally; screenshot of the 2D editor reviewed by the agent; live-site check · Pending; Human · 2026-10-30 · the owner on the live site: every tool is in the palette, no long-press menu: "can close" |
| Reviewed | 2026-10-30 |

</details>

### B-031

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-031 | ◻️ P2 | Closed | A picture menu near the bottom of the page pushed the page up, leaving a black band |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site: the picture menu opens on top when there is no room below. History: Reported 2026-10-29. `PickMenu` always opened its list below the button, up to 320 px, and moved the focus into it with a plain `focus()` (and `scrollIntoView` for the active choice): with the button near the bottom of the window the browser scrolled the page (and the panel body) to show the list, leaving a black band. Now the list opens above when there is more room there, is as tall as the room in the window allows (it scrolls inside), keeps inside the window's right edge, and takes the focus with `preventScroll`; the active choice is scrolled into view inside the list only. Covered by `e2e/pick-menu.e2e.ts` (window ending just below the Trees options: the list opens upwards inside the window, no element of the page scrolls on opening or on End; fails on the old menu at the opening). `PickMenu.md` updated. Not checked: a phone-sized window. Reopened 2026-10-29 (user): in a Trees options bar dragged to the bottom of the editor the menu still opened downwards, out of sight: the room was measured against the window, but the editor's work area clips it. Now the room is the window cut by every ancestor that clips its content; `e2e/pick-menu-clip.e2e.ts` (fails on the previous fix) covers it.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#205](https://github.com/voidbrain/openbando/pull/205) (CI green); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `pick-menu.e2e.ts` passed locally; live-site check · Pending; Human · 2026-10-30 · the owner on the live site: the picture menu opens on top when there is no room below |
| Reviewed | 2026-10-30 |

</details>

### B-032

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-032 | ◻️ P2 | Closed | A panel expanded near the bottom of the window was cut, and a click inside it scrolled the page |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site: the panel opens on top when there is no room below. History: Reported 2026-10-29. Expanding (or showing) a panel never checked that it still fits the window, so its lower part hung past the bottom edge; a click inside focused a control there and the browser scrolled the page (whose overflow is hidden but can still be scrolled by focus) to show it, so everything jumped up. Now a panel that is shown or expanded and reaches past the bottom moves up until it fits (`Panel` constructor effect, only on show / expand and only when the place changes: a first version looped, NG0103), and the app root undoes any page scroll. Covered by `e2e/panel-fit.e2e.ts` (collapse, drag to the bottom, expand: the panel fits; a click inside keeps the page at 0, 0 and the panel in place; no console errors); fails without the fix. Related: B-031 (the same page scroll from a picture menu).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#211](https://github.com/voidbrain/openbando/pull/211) (replaces [#208](https://github.com/voidbrain/openbando/pull/208): green CI, then a backlog conflict with #206); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `panel-fit`, studio layout, fly entry, a11y, guide, pick menu and new bando e2e passed locally; live-site check · Pending; Human · 2026-10-30 · the owner on the live site: the panel opens on top when there is no room below |
| Reviewed | 2026-10-30 |

</details>

### B-033

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-033 | ◻️ P2 | Closed | Road bends left wedge-shaped gaps |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site: "roads bends better now, seems ok on Bardwell House". History: Reported 2026-10-29 with a screenshot. Each segment of a road was its own strip with square ends, so every bend opened a wedge on its outer side. Now a road is one strip along its whole line, mitred at each bend (`stripFrames` in `core/layers.ts`: the shared frame's normal bisects the two segments, half-width stretched by 1 / cos of half the turn, capped at 2×). Covered by `layers.spec.ts` (straight, right-angle, hairpin, repeated point) and a 3D screenshot reviewed by the agent. The centre line itself is unchanged (the ground is levelled along it); rounding sharp corners is not done.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#215](https://github.com/voidbrain/openbando/pull/215) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · `stripFrames` cases passed; 3D screenshot reviewed; live-site look · Pending; Human · 2026-10-30 · the owner on the live site: "roads bends better now, seems ok on Bardwell House" |
| Reviewed | 2026-10-30 |

</details>

### B-034

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-034 | ◻️ P2 | Closed | Fences did not follow the terrain |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site: "fences seem fine now". History: Requested 2026-10-29. A fence was one level-topped box from the lowest ground under it up to its height above the highest, so on a slope it was too tall at the low end and its pieces stepped at the joints. Now the panel follows the ground (`groundRibbon`: sampled every metre, its foot 30 cm into the ground, its top `height` above it), posts stand on the ground under them at the fence's height, and the collider is a 1 m staircase of boxes each from the ground to its height there. Covered by `site-model.spec.ts` (a fence over a hill: solid at height − 0.2 m and clear at height + 0.6 m all along; fails on the old code).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#215](https://github.com/voidbrain/openbando/pull/215) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · slope case passed (fails on the previous build); 3D screenshot reviewed; live-site look · Pending; Human · 2026-10-30 · the owner on the live site: "fences seem fine now" |
| Reviewed | 2026-10-30 |

</details>

### F-012

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-012 | ◻️ P2 | Closed | Compass visibility and controls |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site: the compass hiding and clearance are fine ("is ok"). History: User accepted compass controls. Hide on every Welcome screen and blank scene, and show with a nonblank model; regression checks passed for initial/final Welcome and model load in [#143 CI](https://github.com/voidbrain/openbando/actions/runs/40729835588) ([#143](https://github.com/voidbrain/openbando/pull/143)). Keep the widget above the version badge.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#109](https://github.com/voidbrain/openbando/pull/109) (merged); [#115](https://github.com/voidbrain/openbando/pull/115) (first axe fix failed); [#116](https://github.com/voidbrain/openbando/pull/116) (vector fix; browser verification pending); [#119](https://github.com/voidbrain/openbando/pull/119) (merged; browser checks pending); history: [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649) passed (selected workflows) |
| Opened | 2026-10-27 |
| Verification | Human · 2026-10-28 · compass controls accepted; Browser/accessibility · 2026-10-28 · [#143](https://github.com/voidbrain/openbando/pull/143) full CI passed, including final Welcome compass hiding; Human · 2026-10-30 · the owner on the live site: the compass hiding and clearance are fine ("is ok") |
| Reviewed | 2026-10-30 |

</details>

### B-019

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-019 | ◻️ P2 | Closed | Indoor measures |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check: measuring works and the 3D labels are fine now (pills). History: 2026-10-30, the owner: measuring works, but the 3D labels were inconsistent (wide dark bars with small text in one bando, rounded pills elsewhere). Cause: each 3D label was a fixed 768 × 100 canvas, filled to the edges, its text centred whatever its length. [#248](https://github.com/voidbrain/openbando/pull/248) draws it as the Readout pill (`--overlay-soft`, `--line` border, `--mono` text), sized to its text, at a fixed share of the view's height; a screenshot of the editor's 3D view showed the pill. History: Focused editor workflow passed indoor 2D measurements, debug coordinates, basement keyboard editing, 3D view and measure selection. Review indoor 3D measurement placement specifically; this is not every floor/tool combination.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#119](https://github.com/voidbrain/openbando/pull/119) (implemented; browser checks pending) |
| Opened | 2026-10-28 |
| Verification | Unit/integration + Browser/accessibility · 2026-10-28 · focused editor checks passed in [PR #124 CI](https://github.com/voidbrain/openbando/actions/runs/40652964649); Human + 3D indoor placement · Pending; Visual · 2026-10-30 · local screenshot of a 3D measure label (pill sized to the text); Human · 2026-10-30 · measuring works (owner); Human · 2026-10-30 · the owner: measuring works and the 3D labels are fine now (pills) |
| Reviewed | 2026-10-30 |

</details>

### B-024

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-024 | ◻️ P1 | Closed | Shown panels stay transparent or invisible (Safari) |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check: Views appears at once in Safari, no half-transparent freeze. History: 2026-10-30, the owner: "still a bit of freeze with partial opacity on Views panel reopening; it happens only with the Views panel". Not reproduced in Playwright WebKit (the first frame after reopening is fully opaque there), so this is a candidate fix: [#249](https://github.com/voidbrain/openbando/pull/249) lets Views appear without the entrance slide (the other panels keep it), since a big blurred panel moving is what Safari composites worst; the opacity regression also checks that Views has no entrance animation (Chromium and WebKit pass). The Panel guide had kept the old 0.7 s fade-in description: corrected. History: WebKit check 2026-10-29 (Playwright WebKit 27.2, the engine behind Safari): the opacity regression, Fly entry (Open the bandos, close Views, reopen from the menu button), Views and Welcome cases pass; sampling every frame for 400 ms after Open the bandos and after the menu button, Views is at opacity 1 from the first frame. Real Safari not run. User report (Safari): Welcome's Open the bandos hid the menu button but Views did not appear; the menu button left the Views area semi-transparent, loading slowly or never. Cause: every panel's 0.7 s entrance animated opacity from 0 with fill both; when frames stall (WebKit entrance on a backdrop-filter element leaving display none, or a busy 3D main thread) the panel stayed near opacity 0 while the app counted it as shown. The entrance is now a 0.35 s transform-only slide. New browser regression freezes entrance animations at their start and requires opacity 1 for Views and Bandos after Open the bandos and after the menu button; it fails on the old fade in Chromium and WebKit and passes with the fix.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#158](https://github.com/voidbrain/openbando/pull/158); history: local Chromium and WebKit (Desktop Safari) regression passed with the fix and failed (opacity 0) without it, 2026-10-28 |
| Opened | 2026-10-28 |
| Verification | Browser/accessibility · 2026-10-28 · opacity regression passed in [#158 CI](https://github.com/voidbrain/openbando/actions/runs/40778367395) shard 1 (Chromium); Browser · 2026-10-29 · WebKit 27.2 locally: 4 cases passed, Views opaque from the first frame on both entry points; real Safari · Pending; Browser · 2026-10-30 · the opacity regression with the no-entrance check passed locally in Chromium and WebKit; real Safari · Pending; Human · 2026-10-30 · the owner: Views appears at once in Safari, no half-transparent freeze |
| Reviewed | 2026-10-30 |

</details>

### B-029

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-029 | ◻️ P2 | Closed | The 1 · Area frame drifts from the map on wheel zoom and can be cut by the map edge |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check: zooming in refines the area as described. History: Changed 2026-10-30 ([#250](https://github.com/voidbrain/openbando/pull/250)), the owner: the margin rule was meant to keep the frame in view, not to stop zooming in to refine it. `refineFrame` shrinks the area when the pilot zooms in past the fit (the frame keeps its place, turn and shape on screen), down to `MIN_HALF`, where the zoom stops; zooming out does not grow it back; a turn or a smaller panel still zooms the map out and keeps the area. Two bugs found on the way: `size` was set as a new object on every map move, so `keepFrame` ran before the refine and undid every zoom (now it changes only on a real resize, and the refine runs first); and zoom limits off the map's 0.25 snap grid left + enabled at the end (now rounded down to the grid). `new-bando.e2e.ts` now checks the refine (the frame inside at every step, the area smaller, unchanged on zooming out, unchanged on a turn and a resize). History: 2026-10-30, the owner: "seems better; is the zoom level the max I can get? seems not enough". The maximum zoom in 1 · Area is the one where the frame reaches `FRAME_MARGIN` from the map's edge (`keepFrame`, the owner's rule: the frame is never cut and never changes size by itself), so it depends on the area's size and the panel's. History: Reported 2026-10-29 (several reports the same day). Causes: the frame is held in metres about the view's centre, while Leaflet's wheel zooms about the cursor, so each wheel step moved the map under the frame; nothing limited zooming in, so the frame grew past the map, was drawn clipped (`fb` capped it at the view) and its handles were out of reach (the pilot had to reload). [#202](https://github.com/voidbrain/openbando/pull/202) shrank the area to fit after each zoom: wrong, the user never asked for the area to change by itself (replaced here). Now (`keepFrame`): the area never changes size by itself; in 1 · Area the wheel and pinch zoom about the view's centre, as the frame does; zooming in stops where the frame would come within `FRAME_MARGIN` (36 px: handles, turn knob, search bar) of the map's edge (`setMaxZoom`, the + button turns off); a turn, a smaller panel or a reopened area zooms the map out instead; an edge drag stops at the margin. Only if even zoom 15 is too close does the area shrink. Covered by `e2e/new-bando.e2e.ts` ("never cut by the map edge and keeps its size": edge past the map, zoom to the limit, off-centre wheel keeps the map's centre, 45° turn, smaller window, size readout unchanged; fails on #202's code). Not checked: pinch zoom on a touch device.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#203](https://github.com/voidbrain/openbando/pull/203) (zoom limit, centred wheel, margin; replaces #202's shrinking; all CI jobs green, no retries); [#202](https://github.com/voidbrain/openbando/pull/202) (all CI jobs green, no retries); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Browser · 2026-10-29 · `new-bando.e2e.ts`, guide, studio layout, a11y and editor regressions passed locally (one editor-regressions case timed out under parallel load and passed alone); live-site check · Pending; Browser · 2026-10-30 · `new-bando.e2e.ts` (3 tests, the refine included) passed locally; unit 588 passed; Human · 2026-10-30 · the owner: zooming in refines the area as described |
| Reviewed | 2026-10-30 |

</details>

### F-022

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-022 | ◻️ P3 | Closed | Gambrel (barn) roof |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check: the gambrel roof looks right. History: Requested 2026-10-29 for Bardwell House (house and barn both have gambrel roofs; decided with the user: a real roof kind rather than an approximation). `LevelSpec.roof` gains `'gambrel'`: the gable's builder takes a cross-section, so a gambrel shares the ridge direction, repeat count, turn, ruin holes and the roof-high collider; its steep lower slope covers 36 % of each half-span and climbs 65 % of `roofRise` (`GAMBREL_KNEE`). Editor Roof → shape lists it; the assistant's `set_roof` accepts it (schema, prompt, normalisation). Older builds read an unknown roof as a vault. Covered by `site-model.spec.ts` (knee point, steeper lower slope, collider to the ridge, starts at the wall top) and `ai-commands.spec.ts` (set_roof gambrel; unknown shapes refused). A 3D screenshot of a gambrel house and barn was reviewed by the agent.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#206](https://github.com/voidbrain/openbando/pull/206) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · roof geometry, collider and AI cases passed locally; 3D screenshot reviewed; live-site check · Pending; Human · 2026-10-30 · the owner: the gambrel roof looks right |
| Reviewed | 2026-10-30 |

</details>

### B-039

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-039 | ◻️ P2 | Closed | Opening a bando during the Welcome showcase left its flight and video playing |

💻 **→ Human action required: No**<br />No action remains.

**Next action / closure evidence:** Verified and closed 2026-10-30 on the owner's check on the live site ("B-039 ok"). History: Reported 2026-10-30 by the owner. Only Welcome's own buttons ended the showcase (`leaveForNavigation`). Now every Bandos action that opens or switches a bando (its title, Fly, Edit, Open a fresh copy, New bando) ends a running guide first when the click is the pilot's (`isTrusted`; the guide's own clicks are synthetic), so the replay and video stop and the pilot stays where they went. `showcase.e2e.ts` reproduces the report (fails without the fix, passes with it).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#253](https://github.com/voidbrain/openbando/pull/253); report 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Browser · 2026-10-30 · `showcase.e2e.ts` (all 6, the new case included), `new-bando.e2e.ts`, `takeoff-pad.e2e.ts` passed locally; the new case fails without the fix; Human · 2026-10-30 · the owner: opening a bando stops the showcase |
| Reviewed | 2026-10-30 |

</details>

## Closed 2026-10-31

### B-040

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-040 | ◻️ P2 | Closed | Dragging the timeline sometimes does not move the video |

💻 **→ Human action required: No**<br />None: closed.

**Next action / closure evidence:** Verified and closed 2026-10-31 on the owner's check on the live site ("b-40 is solved"). A different stuck-video report stays open as B-045. 2026-10-30, the owner (after the first fix): it fails when, after Auto-sync, the timeline is clicked without pressing Play first. In Chromium and WebKit headless the video's time follows those clicks (within 0.04 s), so the time is right and the picture is not: Safari does not redraw a video that never played after a paused seek. Second fix ([#260](https://github.com/voidbrain/openbando/pull/260)): a newly loaded video is started once, muted, and paused again where the replay is (`VideoService.prime`; invisible, the replay reads the video's clock only while playing); a unit test checks it starts once per video and ends paused at the replay's time; the video e2e (timeline drags, the showcase, the Fly checklist) pass. History: Candidate fix 2026-10-30 ([#257](https://github.com/voidbrain/openbando/pull/257)). The owner's details: the Timeline chart, paused, the old frame stays, mid-video; only a seek to the start and Play unstuck it. Not reproduced in Chromium or WebKit headless (the video followed every drag within 0.1 s). Likely cause: the browser dropped a seek after fast drags; the video then reported the target time while showing the old frame, and both guards (`currentTime` already at the target in the timeline seek; the target unchanged in the frame sync) skipped asking again. Now every app seek goes through `seekVideo`, pending until `seeked`; while paused a seek pending for over a second is issued again, and the timeline seek no longer trusts `currentTime` while one is pending. `services.spec.ts` fakes a stalled seek (fails without the fix); `timeline-video.e2e.ts` checks drags keep the video in step with the real demo files. History: Reported 2026-10-30 by the owner, replaying the Villetta demo flight with its video (Auto-sync offset −0.69 s). A related case was fixed before: a timeline click undone while the video played (the seek-with-a-playing-video case in `services.spec.ts`). To check: a drag (many seeks in a row) while playing and while paused, at the speeds used (0.25×), and a drag that ends where the video is still seeking.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | Report 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Unit · 2026-10-30 · the stalled-seek case passes (fails without the fix); Browser · 2026-10-30 · `timeline-video.e2e.ts` passed locally; the real stall not reproduced, owner's check · Pending; Human · 2026-10-31 · the owner: solved |
| Reviewed | 2026-10-31 |

</details>

---

### F-023

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-023 | ◻️ P3 | Closed | Bardwell House example, place hidden |

💻 **→ Human action required: No**<br />None: closed.

**Next action / closure evidence:** Verified and closed 2026-10-31 on the owner's check on the live site ("F-023 seems fine"). Requested 2026-10-29 with the generated bando (private coordinates, never committed), two top views and two oblique photos. Decided with the user: a gambrel roof kind (F-022), the map's "concrete" over the west fields dropped, the real ground baked in. The input is the app's own place-hidden export (`tools/examples/data/bardwell-house.hidden.json`: embedded relative heights, origin 0, 0, no coordinates, terrain key or map names, checked before commit); `npm run examples` builds `library/bandos/bardwell-house-no-place.json` with the refinements measured on the photos (≈ 8 cm a pixel, scaled on the generated house and barn; the store's place agrees within ~2 m between the two top views): gambrel house and flat-roofed wing, gambrel barn, store, three sheds, patio and stepped brick wall, the drive's wooden fence, a camper and a car; duplicate trees removed. The FPV simulators' models of the place are game assets and were not used. Covered by `examples.spec.ts` (listed, hidden, origin 0, 0, no coordinates or names, embedded ground, gambrel roofs, store and sheds, no map surface over the fields). AGENTS' privacy rule names the place as private. Not checked: shapes and heights against the real place beyond the photos (porch, dormers, the wing's exact depth are estimates). Release 2 (user review 2026-10-29, with two more photos): the house turned a quarter (gambrel ends east and west, the flat-roofed wing south), the second drive from the lane to the front of the house under three big trees, the take-off pad in front of the house, the hedge along the south side and the south end of the east side, roads and trees cut to the area of the real heights (the map's roads ran hundreds of metres out) and the grass around ending 5 m past it; trees on a road removed. Release 3 ([#217](https://github.com/voidbrain/openbando/pull/217)): the drive's fence is the white post-and-rail fence (F-027). Release 4 ([#218](https://github.com/voidbrain/openbando/pull/218), user report with a screenshot): the dark wall flickered behind the windows of the house and its wing: the wing's north wall and the main block's south wall stood in one place (z-fighting); the wing has no north wall now (B-035 tracks the general case).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#209](https://github.com/voidbrain/openbando/pull/209) (all CI jobs green), after [#206](https://github.com/voidbrain/openbando/pull/206) (the gambrel roof); [#214](https://github.com/voidbrain/openbando/pull/214) release 2 (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/visual · 2026-10-29 · `examples.spec.ts` passed locally; 2D plan compared with the top views and a 3D view reviewed by the agent; pilot's comparison · Pending; Human · 2026-10-31 · the owner: the model matches |
| Reviewed | 2026-10-31 |

</details>

---

### F-027

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | F-027 | ◻️ P3 | Closed | Post-and-rail fence (white, three planks) |

💻 **→ Human action required: No**<br />None: closed.

**Next action / closure evidence:** Verified and closed 2026-10-31 on the owner's check on the live site ("F-027 ok": the post-and-rail fence looks right). Click A, preview, click B for every line tool is F-043. Requested 2026-10-29 for the library (Bardwell House has one). New fence material `rail`: posts every 2.4 m, three planks (`RAIL_PLANKS`) nailed to their face with open gaps between them, white by default, each plank following the ground; solid for the drone like the other fences. Material menu entry with its own icon and Italian. Covered by `site-model.spec.ts` (6 posts and 3 planks on a 12 m fence, solid). Bardwell House's drive fence is `rail` ([#217](https://github.com/voidbrain/openbando/pull/217), release 3 of the example).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#215](https://github.com/voidbrain/openbando/pull/215) (all CI jobs green); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit · 2026-10-29 · rail case passed; 3D screenshot reviewed; live-site look · Pending; Human · 2026-10-31 · the owner: looks right |
| Reviewed | 2026-10-31 |

</details>

---

### B-042

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-042 | ◻️ P2 | Closed | During the showcase, a panel the pilot opened from Views was closed again by its next step |

💻 **→ Human action required: No**<br />None: closed.

**Next action / closure evidence:** Verified and closed 2026-10-31: [#267](https://github.com/voidbrain/openbando/pull/267) merged with every CI job green ([run 41137304890](https://github.com/voidbrain/openbando/actions/runs/41137304890)), the showcase e2e included; #264 and #266 then passed with it. Found 2026-10-30 when the B-039 showcase e2e failed twice on #264 (a docs-only PR): the pilot opened Bandos from Views during the showcase replay; the showcase's next step rearranged the panels, closing Bandos (and once covering Views with the video panel), so the example to open was hidden. Decided by the owner 2026-10-30: a pilot's own click in Views stops the showcase. A real click on a panel toggle in Views now ends a playing guide or showcase through `leaveForNavigation()` (as opening a bando does: replay stopped, the pilot keeps the layout), then shows or hides the panel. The showcase e2e now checks that: the caption bar goes, the replay stays paused, the Bandos panel stays open, and an example then opens (passed 3 times locally). Area note added (Welcome and showcase sequencing). What follows (impact map): no clip, film or guide step changes (the guide's own clicks are not trusted, so they never end it), the element map is unchanged, no new text.

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#267](https://github.com/voidbrain/openbando/pull/267); found on [#264](https://github.com/voidbrain/openbando/pull/264)'s CI (e2e (4), both attempts) |
| Opened | 2026-10-30 |
| Verification | Browser · 2026-10-30 · showcase e2e (Views click during the replay) passed 3 times locally; Browser · 2026-10-31 · [#267 CI](https://github.com/voidbrain/openbando/actions/runs/41137304890) passed |
| Reviewed | 2026-10-31 |

</details>

---

### B-046

| Signal | ID | Priority | Status | Item |
|:---:|---|---|---|---|
| 🔵 | B-046 | ◻️ P3 | Closed | The version badge's number ignored the pointer: no commit on hover, no selecting it |

💻 **→ Human action required: No**<br />None: closed.

**Next action / closure evidence:** Verified and closed 2026-10-31: [#269](https://github.com/voidbrain/openbando/pull/269) merged with every CI job green ([run 41151599966](https://github.com/voidbrain/openbando/actions/runs/41151599966)), the badge e2e included. Reported 2026-10-31 by the owner: hovering "v1.280" shows no commit and the text cannot be selected; the inspector shows the main 3D canvas under the pointer. Cause: the badge row has `pointer-events: none` (so its corner does not block the view) and only the flag and Views buttons turned them back on; the design guideline even said "No pointer events" for the number, against its own "the commit sha is its `title`". Now the number takes the pointer and its text is selectable; the guideline says so, and says where the number comes from (the deploy workflow writes `src/app/version.ts`: `1.` + its run number, and the short sha). `a11y.e2e.ts` checks the element under the number's centre is the number (fails without the fix: the canvas).

<details>
<summary>PR history, dates and verification</summary>

| Field | Value |
|---|---|
| PR / evidence | [#269](https://github.com/voidbrain/openbando/pull/269); report 2026-10-31 |
| Opened | 2026-10-31 |
| Verification | Browser · 2026-10-31 · the badge e2e passes, and fails without the fix; [#269 CI](https://github.com/voidbrain/openbando/actions/runs/41151599966) passed |
| Reviewed | 2026-10-31 |

</details>

---
