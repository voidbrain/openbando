# OpenBando backlog

Full review: 31 October 2026 against main `3f7b844` (#275); its CI 41245176140 and CodeQL passed. [Full audit](audits/2026-10-31-full-openbando.md) records current findings and limits.

Current work ledger, reviewed 24 November 2026 against main `6202363` (#287; CI 45352748147 green). [Rules](BACKLOG-RULES.md) · [Archive](archive/backlog-2026.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability

### <a id="b-009"></a>[🐞 B-009](#top)

**Simulator and selected-flight/video regression**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | — | 🧑‍🔧 | — |

🧑 **→** Manually check simulator entry, collisions and selected-flight/video replay.

| | |
|---|---|
| **Issue** | Simulator entry, collisions and a selected flight with its video might regress after editor and racing changes. |
| **Reproduce** | Live site: open a bando, Fly the simulator, hit a wall; then select a recorded flight with its video and play it. |
| **Check** | The simulator starts on the pad, a crash stops it, the flight replays in step with its video. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-009.md)

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-27 |
| Verification | Pending — see PR/evidence for partial automated coverage |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="b-017"></a>[🐞 B-017](#top)

**Villetta replay misalignment with video**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | — | 🧑‍🔧 | — |

🧑 **→** Pin the demo flight at your three moments on the live site (since #258) and say whether the replay then follows the video.

| | |
|---|---|
| **Issue** | The Villetta replay is displaced from the video by GPS drift: 14 m at the greenhouse's west face, 8 m mid-greenhouse, 6 m at the store. |
| **Reproduce** | Live site, Villetta with the demo flight and its video: pause at 0:27.6, Path panel → Pin this moment, click the bottom of the west face; again at 1:13.1 (middle of the greenhouse) and 1:35.9 (leaving the store). |
| **Check** | At each pinned moment the drone is where the video shows it, the path between them follows the flight, the take-off stays on its pad; the pins come back after reloading the log, and × removes them. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-017.md)

| Field | Value |
|---|---|
| PR / evidence | [#112](https://github.com/voidbrain/openbando/pull/112) (report and arch label; alignment remains open); [#114](https://github.com/voidbrain/openbando/pull/114) (raised greenhouse; visual review pending); [#113](https://github.com/voidbrain/openbando/pull/113) (spatial investigation) |
| Opened | 2026-10-27 |
| Verification | Pending; Unit + Browser · 2026-10-30 · pin offsets, pinned moment and restore, workflow e2e passed locally; owner's check with the demo flight · Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="b-018"></a>[🐞 B-018](#top)

**Hidden-origin GPS projection distorts flight paths**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔺 P1 | 🟡 Medium | — | 🧑‍🔧 | — |

🧑 **→** Compare the corrected path with the real flight and test real GPS devices.

| | |
|---|---|
| **Issue** | Bandos without their place drew GPS paths with a false sideways bend. |
| **Reproduce** | A hidden bando with your own recorded flight; then a live GPS device. |
| **Check** | The path follows the real flight, and a live drone shows where it really is. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-018.md)

| Field | Value |
|---|---|
| PR / evidence | [#113](https://github.com/voidbrain/openbando/pull/113) (investigation); [#115](https://github.com/voidbrain/openbando/pull/115) (merged projection fix); [#118](https://github.com/voidbrain/openbando/pull/118) (merged live-first correction; real-flight verification pending) |
| Opened | 2026-10-27 |
| Verification | Unit/integration · 2026-10-27 · regression tests in #118; Human + Real-device · Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="b-028"></a>[🐞 B-028](#top)

**New bando: grey map after a hidden bando, full addresses not found, Generate before a place**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | — | 🧑‍🔧 | — |

🧑 **→** On the live site after merge: open a hidden bando, then New; search a full street address; check the map, the matches list and Generate.

| | |
|---|---|
| **Issue** | New bando: grey map after a hidden bando, full street addresses not found, Generate before a place. |
| **Reproduce** | Live site: open a hidden bando, then New; search a full street address. |
| **Check** | The map shows, the matches list fills (first match chosen), Generate waits for a place. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-028.md)

| Field | Value |
|---|---|
| PR / evidence | [#201](https://github.com/voidbrain/openbando/pull/201) (all CI jobs green, no retries); report 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-29 · unit suite, `new-bando.e2e.ts` and the guide steps passed locally and in #201's CI; live-site check · Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="b-045"></a>[🐞 B-045](#top)

**After a timeline click the video can stay stuck on an old frame**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟠 Investigate | 🔶 P2 | 🟡 Medium | — | — | — |

💻 **→** Next: reproduce the stuck video after a timeline click (Safari and Chromium) and find the cause.

| | |
|---|---|
| **Issue** | After a timeline click the video can stay stuck on an old frame. |
| **Reproduce** | Load a flight and video; click the timeline repeatedly while paused and playing in Safari and Chromium. |
| **Check** | Each seek presents the matching video frame; Play resumes without returning to the first frame. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-045.md)

| Field | Value |
|---|---|
| PR / evidence | [#268](https://github.com/voidbrain/openbando/pull/268) (recorded); Report 2026-10-31 (and 2026-10-30) |
| Opened | 2026-10-31 |
| Verification | Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="b-050"></a>[🐞 B-050](#top)

**Investigate delayed AI replies against a changed editor draft**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟠 Investigate | 🔶 P2 | 🟢 Small | — | — | — |

💻 **→** Write the deferred-completion regression to confirm or refute the stale-response hypothesis; fix only if reproduced.

| | |
|---|---|
| **Issue** | Source captures the initial spec for AI context but commits commands to the current draft after awaiting a response; no draft-generation guard is apparent. This is a hypothesis, not a reproduced defect. |
| **Reproduce** | Hold an AI completion, switch or edit the bando, then release the deferred reply in a service test. |
| **Check** | A stale reply cannot modify another bando or silently overwrite intervening edits; unchanged-draft responses still apply through undo. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-050.md)

| Field | Value |
|---|---|
| PR / evidence | [#276](https://github.com/voidbrain/openbando/pull/276); [Full audit](audits/2026-10-31-full-openbando.md) |
| Opened | 2026-10-31 |
| Verification | Source review · 2026-10-31 · async boundary identified; reproduction and fix not established |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="b-051"></a>[🐞 B-051](#top)

**Investigate an Auto-sync result after changing its video/log pair**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟠 Investigate | 🔶 P2 | 🟢 Small | — | — | — |

💻 **→** Add a deferred-scan service/browser test to confirm or refute stale pair application; keep separate from the fixed saved-offset leak B-047.

| | |
|---|---|
| **Issue** | Auto-sync captures its initial flight/video but later applySync uses current selection; a pair-generation guard is not apparent. UI entry paths need a deferred-scan test. |
| **Reproduce** | Hold an Auto-sync scan, load a different video or select another flight, then release the scan. |
| **Check** | Old work cannot store an offset or diagnostics on the new pair; cancellation cleans decoding resources and busy state. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-051.md)

| Field | Value |
|---|---|
| PR / evidence | [#276](https://github.com/voidbrain/openbando/pull/276); [Full audit](audits/2026-10-31-full-openbando.md) |
| Opened | 2026-10-31 |
| Verification | Source review · 2026-10-31 · async boundary identified; reproduction and fix not established |
| Reviewed | 2026-10-31 |

</details>

---

## Features and limitations

### <a id="f-001"></a>[✨ F-001](#top)

**Cut/Wing for diagonal basement outlines**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | — | 🧑‍🔧 | — |

🧑 **→** Review diagonal Cut/Wing editing and saved/imported outlines.

| | |
|---|---|
| **Issue** | Cut and Wing on diagonal basement outlines. |
| **Reproduce** | Editor: a building with a diagonal basement, Indoors −1, Cut and Wing; save, export, import. |
| **Check** | The edits work and the outline survives saving and importing. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-001.md)

| Field | Value |
|---|---|
| PR / evidence | [#101](https://github.com/voidbrain/openbando/pull/101) (context); [#117](https://github.com/voidbrain/openbando/pull/117) (merged to former feature branch); [#121](https://github.com/voidbrain/openbando/pull/121) (recovery targeting main) |
| Opened | 2026-10-27 |
| Verification | Unit/integration · 2026-10-28 · 504 tests passed locally; Browser/accessibility + Human · Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-009"></a>[✨ F-009](#top)

**Racing on real devices**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟡 Medium | — | 🧑‍🔧 | — |

🧑 **→** Run the two-device race/GPS field checklist with real telemetry feeds.

| | |
|---|---|
| **Issue** | Racing on real devices has never been checked in the field. |
| **Reproduce** | Two devices with real telemetry, following docs/racing/README.md (field checklist). |
| **Check** | Timing, GPS loss, relay disconnect and rejoin, crowded paths in every camera behave as the checklist says. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-009.md)

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-10-27 |
| Verification | Real-device · Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-021"></a>[✨ F-021](#top)

**Move the take-off pad in the editor**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | — | — | — |

💻 **→** Next: three fixes from the owner's check (live preview in 3D, drag the pad itself, the pad on a raised building).

| | |
|---|---|
| **Issue** | Move the take-off pad in the editor. |
| **Reproduce** | Select and drag the take-off pad slab in editor 3D, including onto the raised greenhouse. |
| **Check** | The slab itself drags with live preview, remains visible on drop, and moves in one undo step. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-021.md)

| Field | Value |
|---|---|
| PR / evidence | [#210](https://github.com/voidbrain/openbando/pull/210) (replaces [#207](https://github.com/voidbrain/openbando/pull/207): green CI, then a backlog conflict with #206); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-29 · `layers.spec.ts` and `takeoff-pad.e2e.ts` passed locally; live-site check · Pending; Unit + Browser · 2026-10-30 · 591 unit (take-off pad choice, move off a pad, pad preview); `takeoff-pad.e2e.ts` 4/4 and `editor-regressions.e2e.ts` 11/11 locally; inspector screenshot on Playground; Human · 2026-10-31 · the owner: works; no 3D preview, only the box drags, vanishes over the greenhouse |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-024"></a>[✨ F-024](#top)

**Take-off pad indoors, on an upper floor or on a flat roof**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | — | — | — |

💻 **→** Next: when the pad moves from indoors onto the roof, show the roof again (and the pad on it).

| | |
|---|---|
| **Issue** | Take-off pad indoors, on an upper floor or on a flat roof. |
| **Reproduce** | Hide a building roof while indoors; move the take-off pad onto its flat roof. |
| **Check** | The roof becomes visible again and the pad stands visibly at the correct height; older ground pads still work. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-024.md)

| Field | Value |
|---|---|
| PR / evidence | [#225](https://github.com/voidbrain/openbando/pull/225); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Unit/browser · 2026-10-30 · `takeoff-place.spec.ts` and `takeoff-pad.e2e.ts` passed locally; [#225 CI](https://github.com/voidbrain/openbando/actions/runs/40977633280) passed; flying from a roof on the live site · Pending; Human · 2026-10-31 · the owner: on the roof the pad is not visible, the roof stays hidden |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-025"></a>[✨ F-025](#top)

**Rework the Fly checklist**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | — | — | 🤔 |

🧑 **→** Say what the Fly checklist should do differently (steps, order, what it checks, when it opens).

| | |
|---|---|
| **Issue** | The Fly checklist needs a rework. |
| **Reproduce** | Live site: Fly panel, the checklist. |
| **Check** | Say what it should do differently: steps, order, checks, when it opens. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-025.md)

| Field | Value |
|---|---|
| PR / evidence | Request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Not started |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-026"></a>[✨ F-026](#top)

**Rework the panels' "?" tips: what they cover, checked automatically**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | — | — | 🤔 |

🧑 **→** Choose A (title-based tips), B (a tip per control) or C (remove tips).

| | |
|---|---|
| **Issue** | The panels' "?" tips explain 9 of 407 controls. |
| **Reproduce** | docs/agents/element-map.md, Tips per file; the "?" in any panel title. |
| **Check** | Choose A (titles as tips, recommended), B (a tip for every control) or C (drop "?"). |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-026.md)

| Field | Value |
|---|---|
| PR / evidence | [#238](https://github.com/voidbrain/openbando/pull/238) (inventory); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Inventory · 2026-10-30 · Tips per file table (element map) |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-031"></a>[✨ F-031](#top)

**Clips and films say when their sources changed since recording**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔹 P3 | 🟡 Medium | — | 🧑‍🔧 | — |

🧑 **→** Re-record and review the guide clips and Welcome films.

| | |
|---|---|
| **Issue** | The guide clips and Welcome films are older than the code they show. |
| **Reproduce** | A machine with the GPU and ffmpeg: npm run clips, npm run films. |
| **Check** | Watch the new recordings; check:media then reports them current. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-031.md)

| Field | Value |
|---|---|
| PR / evidence | [#220](https://github.com/voidbrain/openbando/pull/220); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-29 · `check:media` lists 12 / 15 changed files; `--stamp` writes the current commit (tried and restored); re-recording · Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-033"></a>[✨ F-033](#top)

**Full impact map: chains, content, couplings, outside the repository, as a readable page**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | — | 🧑‍🔧 | — |

🧑 **→** Read `docs/agents/impact-map.md` and say what is missing or wrong: it is meant to list everything that follows a change.

| | |
|---|---|
| **Issue** | The impact map is meant to list everything that follows a change. |
| **Reproduce** | docs/agents/impact-map.md. |
| **Check** | Say what is missing or wrong. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-033.md)

| Field | Value |
|---|---|
| PR / evidence | [#224](https://github.com/voidbrain/openbando/pull/224) (steps 2–4; all CI jobs green after the CodeQL fix of 1.15.1); template [#16](https://github.com/voidbrain/project-harness/pull/16), [#18](https://github.com/voidbrain/project-harness/pull/18), [#20](https://github.com/voidbrain/project-harness/pull/20), [#22](https://github.com/voidbrain/project-harness/pull/22), [#24](https://github.com/voidbrain/project-harness/pull/24); request 2026-10-29 |
| Opened | 2026-10-29 |
| Verification | Script · 2026-10-30 · page generated (18 rows, 6 couplings, 8 outside); chains and couplings dry-run on four changes; user's reading · Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-039"></a>[✨ F-039](#top)

**Coverage of the browser tests in the coverage table**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🟣 Blocked | ◻️ P3 | 🔴 Large | — | — | — |

💻 **→** Waiting for an upstream published browser-coverage contract; then wire OpenBando’s collection and CI.

| | |
|---|---|
| **Issue** | Coverage of the browser tests in the coverage table. |
| **Reproduce** | Run unit and Chromium browser coverage, then generate the coverage table; repeat without browser coverage configured. |
| **Check** | Configured projects show unit/browser/combined coverage; unconfigured projects retain current output and warning-only behaviour. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-039.md)

| Field | Value |
|---|---|
| PR / evidence | Split from F-038, 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Not implemented |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-040"></a>[✨ F-040](#top)

**Adjust the replay drone's position in 3D, height included**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | — | — | — |

💻 **→** Next: find why a height set with Adjust position goes back to the wrong height about a metre later.

| | |
|---|---|
| **Issue** | Adjust the replay drone's position in 3D, height included. |
| **Reproduce** | Villetta demo: Adjust position at 0:28, correct height, then replay about a metre onward; also try editor 3D. |
| **Check** | Height follows the intended pin blend without an unexplained reset; adjustment works in the agreed 3D views. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-040.md)

| Field | Value |
|---|---|
| PR / evidence | Request 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Unit + Browser · 2026-10-30 · height pins, keyboard adjust e2e passed locally (the mouse drag is the owner's check); the keyboard e2e read the replay time before the seek reached the caption and failed on #264's CI, fixed in [#265](https://github.com/voidbrain/openbando/pull/265) (test only); Human · 2026-10-31 · the owner: the height holds at the pin, then returns about a metre later |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-041"></a>[✨ F-041](#top)

**Align a replay to the model automatically, with a confidence level**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | — | — | — |

💻 **→** Build the collision detector, then measure the learned-feature experiment.

| | |
|---|---|
| **Issue** | Align a replay to the model automatically, with a confidence level. |
| **Reproduce** | Demo flight: inspect solid-crossing stretches; measure local vision candidates at 0:27.6, 1:13.1 and 1:35.9. |
| **Check** | Detector lists and seeks to suspect stretches; learned-feature experiment meets the recorded ~3 m criterion before any alignment button ships. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-041.md)

| Field | Value |
|---|---|
| PR / evidence | [#263](https://github.com/voidbrain/openbando/pull/263) (prototypes); branch `feat/align-automatically` (full run, not merged); [#266](https://github.com/voidbrain/openbando/pull/266) (findings, steps); request 2026-10-30 |
| Opened | 2026-10-30 |
| Verification | Prototype · 2026-10-30 · geometric and visual probes on the demo flight; full run on the whole flight: no usable shift (numbers above) |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-042"></a>[✨ F-042](#top)

**Right-click in the editor's 3D view: the same context menu as on the plan**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | — | — | — |

💻 **→** Next: open the plan's context menu on a right-click on any element (or the ground) in the 3D view.

| | |
|---|---|
| **Issue** | Right-click in the editor's 3D view: the same context menu as on the plan. |
| **Reproduce** | Editor 3D view: right-click a building, another element and empty ground. |
| **Check** | The same contextual actions as the plan open for the picked element or ground point. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-042.md)

| Field | Value |
|---|---|
| PR / evidence | [#268](https://github.com/voidbrain/openbando/pull/268) (recorded); Request 2026-10-31 |
| Opened | 2026-10-31 |
| Verification | Pending |
| Reviewed | 2026-10-31 |

</details>

---

### <a id="f-043"></a>[✨ F-043](#top)

**Line tools also draw by click A, live preview, click B (keeping the drag)**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | — | — | — |

💻 **→** Implement two-click drawing alongside drag for every line tool.

| | |
|---|---|
| **Issue** | Line tools also draw by click A, live preview, click B (keeping the drag). |
| **Reproduce** | Editor: Fence, Wall, Road, Water line, Tunnel and Bridge; click A, move, click B; also drag. |
| **Check** | Both gestures draw once with live preview; Esc/right-click cancels the pending segment. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-043.md)

| Field | Value |
|---|---|
| PR / evidence | [#268](https://github.com/voidbrain/openbando/pull/268) (recorded); request 2026-10-31 |
| Opened | 2026-10-31 |
| Verification | Pending |
| Reviewed | 2026-10-31 |

</details>

---





### <a id="f-053"></a>[✨ F-053](#top)

**Rebuild a bando as a point cloud from a flight's video, placed by its blackbox and GPS**

| Status | Priority | Effort | Remaining | Procedures | Decisions |
|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | — | — | — |

💻 **→** Run route (a): COLMAP's browser port and Brush on the demo flight's frames, with scale and north from the log.

| | |
|---|---|
| **Issue** | Measured bandos are modelled by hand from photos and top views; a flight's video already holds the geometry, and its blackbox and GPS hold the camera's attitude, scale and place. |
| **Reproduce** | Take one flight with video, blackbox log and GPS (the demo flight); make a point cloud from the video in each approach of the trial and lay it over the bando in the editor. |
| **Check** | A trial note names, per approach, whether it runs on a Mac without CUDA, its time per minute of video, and whether walls and roof lines can be traced within about 0.5 m; the owner then decides whether to build it. |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-053.md)

| Field | Value |
|---|---|
| PR / evidence | this PR (route (b) trial and prototype, 2026-11-24); [#287](https://github.com/voidbrain/openbando/pull/287) (proposal recorded 2026-11-24; [Future](agents/areas/future.md) area note) |
| Opened | 2026-11-24 |
| Verification | Pending (route (b) measured 2026-11-24: not traceable; the decision waits on route (a)) |
| Reviewed | 2026-11-24 |

</details>

---
## Other changes

Older entries: [reconciliation log](archive/reconciliation-2026.md).

2026-11-24: [#287](https://github.com/voidbrain/openbando/pull/287) (F-053 proposal) merged on green CI (run 45352748147). F-053's first trial route (telemetry poses and in-browser depth) measured: fast, not traceable; the record names the next route.

## Reconciliation history

2026-10-31: full review against main `3f7b844` (#275). CI [41245176140](https://github.com/voidbrain/openbando/actions/runs/41245176140) and all CodeQL checks passed; F-046 verified, closed and archived. Audit fixes and new browser assertions have their own pending CI. Every active record was reviewed without advancing human/device acceptance.

2026-10-31: reviewed main `23273a3` (#274). Run 41222711890 passed check, all four browser shards and race-browser; prior v2.2.2 acceptance is established. The requested v3.1.1 adoption extends F-046 with its own current PR checks; F-047 separately owns full product audit coverage. Earlier pending-CI notes below describe their original review baseline.

2026-10-31: reviewed through `84c93de` (#273), with #272/#273 runs/jobs read through the authenticated GitHub connector because `gh` is unavailable here. [#272 CI](https://github.com/voidbrain/openbando/actions/runs/41196898791) and [#273 CI](https://github.com/voidbrain/openbando/actions/runs/41198496665): check, all four browser shards and race-browser green. Existing F-044/F-045 closures remain; no human/device record was advanced. F-046 owns current v2.2.2 adoption and its pending CI.


2026-10-31: reviewed through `b8bcc08` (#272). [CI 41196898791](https://github.com/voidbrain/openbando/actions/runs/41196898791): check, all four browser shards and race-browser green; CodeQL green. Tooltip interactions/axe passed. Shard 4 had one showcase-panel test that passed on retry. F-044/F-045 closed and archived; outstanding human checks on other records were not advanced.

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

Each item shows its ID and title, a summary table (status with its colour, priority, effort size), the human or next action (🧑 Procedure / Decision / Both, or 💻 No), and Issue / Reproduce / Check. Expand the closed details for PR history, dates and verification; next actions and estimate rationale are in each record's source (“Full notes & evidence”). Effort, work still estimated in days: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
