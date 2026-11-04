# Full OpenBando audit — 31 October 2026

## Baseline and scope

Full review of all eight required areas, at main **3f7b844e5305b4c3a399b07d2b2382697f03ec57** (merged #275), plus the fixes explicitly listed below. Review date: 31 October 2026. The matching manifest declares performed review, not that every product defect is fixed. This is a repository audit using source tracing, regression experiments, tests, dependency metadata, generated-output checks and actual CI inspection. It is not a line-by-line proof, penetration test, photogrammetric survey or real-device field certification.

The prior [scoped harness review](2026-10-31-harness-v3.1.1.md) and earlier [28 October audit](2026-10-28.md) remain immutable historical evidence. Their former pending statements retain their original context. Current status is the [backlog](../BACKLOG.md). Original checkout transfer leftovers were excluded: the audit uses an isolated worktree and clean dependency installation, leaving unrelated untracked files untouched. No private survey imagery or geographic metadata was copied into evidence.

## Results by area

| Area | Result and method | Evidence and limitations |
|---|---|---|
| Code | Checked runtime/service/geometry boundaries, cleanup/error paths, explicit unfinished markers, exports and dependency graph. | Confirmed video-offset and migration defects, existing camera and pin defects; fixes below. Removed two genuinely unused math exports. AST/reference search is not a proof of every dynamic/framework use. |
| Logic | Traced spec → sanitization/editor undo → render/collider, hidden sharing/calibration, library migration and flight/video/pin state transitions. | Tests exercise invalid offsets, durable migration commit/failure/retry and camera-versus-aircraft ground. Basement ring rendering is implemented; ring comment was obsolete. Async stale-result hypotheses remain separately tracked. |
| Tests | Reviewed assertion intent, unit/browser distinctions, joins, coverage, retries and required CI. | Clean 602 tests in 88 files; production build/types pass. Baseline #275 CI and CodeQL passed. New pin browser assertion requires this audit PR’s own CI. No human/device acceptance inferred. |
| Documentation | Compared README, area notes, source comments, generated guide/catalogue/element/impact maps, design/component guidance and media provenance. | Corrected palette, outline, compass, Views close/reset and greenhouse descriptions. No artwork/theme changed. Existing clips/films are stale; F-031 remains. Generated text is not rerecording. |
| Harness | Reviewed ownership, copied parity, adapted rules, maintenance evidence, impact/coupling maps, scope-aware audit policy and optional integrations. | Published v3.1.1 helpers remain unmodified copies. Full baseline now enables the seven-day area gate; coverage remains warning-only. Receipt regenerated for reviewed inputs. F-039’s generic work moved upstream; OpenBando owns adoption/CI only. |
| Security | Inspected npm advisory graph, hidden export boundaries, input sanitization, AI/server configuration and relay authentication/resource limits. | Clean lockfile install and npm audit zero after targeted Vite fix. Hidden export strips origin/reference/calibration; tests use neutral positions. Opt-in server AI/token persistence is the existing disclosed design, not a new claim of anonymity. No external penetration or private-device test performed. |
| Delivery | Reviewed lockfile/tool versions, CI/deployment/workflow permissions and actual merged run/jobs. | #275 run 41245176140: check, e2e (1–4), race-browser success; CodeQL three languages and aggregate success. Main remains protected; audit PR requires its own green checks. Pages deployment reuses fast checks without browser jobs; PR browser evidence is separate. |
| Backlog | Read every active record, acceptance/next action/human cue/evidence and ownership. | F-046 closed on actual #275 evidence; F-047 owns this report independently of product fixes. New findings B-047–B-051; B-041/B-044 fixed pending new CI. Human checks, agreed missing features and investigation uncertainty preserved. |

## Confirmed defects and changes

| ID / classification | Trigger and evidence | Impact, fix and acceptance |
|---|---|---|
| B-047 — confirmed defect | Restore pair A at 12.5 s, select an unsaved video/log pair B. Original regression expected 0 and received 12.5. | B retained A’s offset despite unsynced state. Restore only a finite pair-owned offset, otherwise zero; reset diagnostics and video seek state. Regression checks B, restoring A, switching flight and invalid Infinity. Full suite passes; current CI pending. Distinct from B-045’s paused-frame report. |
| B-048 — confirmed defect | Legacy migration with localStorage quota failure originally deleted recovery sources before a durable replacement existed. | Potential loss after reload (P1). Keep legacy source/index until successful localStorage write or IndexedDB transaction commit. Preserve corrupt recovery entries and newer valid records; count error/abort once. Quota/retry and explicit deferred IDB commit/error/abort tests pass. Browser durability beyond these fixtures is not claimed. |
| B-044 — confirmed existing defect | Camera ground sampler reused aircraft standing floors/roofs. Real collider/camera test shows a camera just above a roof being lifted. | Both main and Studio camera callbacks use terrain/underground-only cameraGroundAt; aircraft groundAt retains standing surfaces. Regression preserves terrain clearance and existing underground behavior. Full suite passes; current browser CI pending. |
| B-041 — confirmed existing defect | startAdjust cancels pins, but armPin did not cancel Adjust position. Existing owner report describes blocked pin selection. | Arming a pin now cancels the unfinished adjustment preview. Added browser assertion for Adjust position → Pin start, retaining existing plan/Studio placement checks. Do not relax start/end transport-position requirements. Current browser result pending. |
| B-049 — confirmed dependency finding | Baseline npm audit: two affected package entries, six advisories on builder’s Vite 8.3.2, including high severity. | Development tooling, not proof of compromise of the deployed static site. Override only builder’s Vite to 8.3.5; regenerate lockfile, clean npm ci, npm audit zero, build/tests pass. No force/legacy-peer workaround or Angular runtime upgrade. Reassess override when compatible builder supplies fixed Vite. |
| Report-only cleanup | Corrected AST reference scan: 633 runtime exports; most of the 101 without outside production/tool consumers have internal/test use. Only math.ts lerp and median had no references. | Removed those two helpers only; retained test-contract/internal exports. Similar names on Three.js vectors or metric fields were not evidence of helper use. Compiler and full suite check removal; scan does not establish zero dead code everywhere. |

Dependency advisories observed: GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm, GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22 and GHSA-vfpm-58rq-9qcg. Registry/advisory results are dated evidence, not a promise that future npm audit stays empty.

## Investigations, limits and proposals

| Classification / owner | Evidence and next step | Value, effort, risk and success criterion |
|---|---|---|
| Hypothesis B-050 | AI send captures an initial draft, awaits completion, then applies commands against current draft without an apparent generation guard. Reproduce with deferred completion and a bando switch/edit. | Avoid stale edits; small diagnostic first. Do not change working response behavior before reproduction. Success: stale replies cannot mutate another/interveningly edited draft; ordinary undo still works. |
| Hypothesis B-051 | Auto-sync captures an initial pair but final applySync uses current state. Reproduce changing video/flight during a deferred scan. | Avoid misassigned offsets; small diagnostic first. Success: old scan cannot update a new pair and cleanup remains bounded. Not claimed fixed by B-047. |
| Agreed missing feature F-039 | Unit coverage excludes browser execution. Generic collector/combined-summary request is now project-harness F-032 ([#59](https://github.com/voidbrain/project-harness/pull/59), merged after CI 41248646440). | Large optional integration; OpenBando waits for published contract, then supplies its own fixture/CI wiring. No foreign implementation or downstream release gate. |
| Annotation F-031 | Media checker reports changed sources against guide clips recorded at d35f0d3 and Welcome films at 73aee6e. | Re-record/review separately; existing dates cannot be refreshed by text generation. Human visual acceptance remains explicit. |
| Proposal, report-only | Expand focused service boundary tests before pursuing global coverage; services have 34.5% unit branches, UI execution is mostly browser-only. | Medium incremental cost, high value around persistence and async operations. Prefer B-050/B-051 regressions; avoid UI mirror tests or a mandatory percentage rise. Success: reproduce/fix state races with meaningful failure assertions. Not authorization for wholesale service refactoring. |
| Proposal, report-only | SceneService/editor remain broad orchestration surfaces despite existing controller splits. | Any further extraction should follow a concrete recurring defect/change cluster, preserve contracts/undo and prove behavior. Medium/large risk of churn; retain present architecture until evidence justifies a specific refactor. No speculative rewrite added to backlog. |

Relay review checked constant-time bearer matching, allowed origins, bounded room/payload/client resources and in-memory lifetime. These support trusted shared sessions, not public ranked racing or real-network readiness. Input sanitizers intentionally repair malformed optional elements; a diagnostic expecting a null building to invalidate an entire valid backup was rejected as an incorrect test assumption, not recorded as a product defect.

## Complete active-ledger review

| Disposition | IDs and remaining action |
|---|---|
| Implemented; human/device acceptance remains | B-009 simulator/selected-flight regression; B-017 real video/model comparison at three moments; B-018 real GPS comparison; B-028 live map/address workflow; F-001 diagonal Cut/Wing acceptance; F-009 two-device racing; F-031 media rerecord/review; F-033 impact-map owner review. None advanced from CI alone. |
| Human product decision remains | F-025 Fly-checklist scope; F-026 tips approach. Do not invent acceptance or quietly remove these decisions. |
| Agreed incomplete implementation | F-021 take-off pad live preview/direct drag/raised building; F-024 roof visibility after moving pad; F-040 height adjustment and Studio gizmo; F-041 automated alignment experiments; F-042 3D context menu; F-043 non-Measure two-click line tools. Existing partial work is not completion. |
| Investigate | B-045 paused stale video frame; new B-050/B-051 async-result hypotheses. Source suspicion is not a reproduced defect. |
| Named upstream blocker | F-039 optional browser coverage contract/release. Human action No does not mean completed. |
| Current implementation awaiting own CI | B-041, B-044, B-047, B-048, B-049; F-047 audit outcome. Close only once their recorded checks and merge are established. |
| Closed in this reconciliation | F-046: #275 merged at 3f7b844, all required CI and CodeQL passed; complete record appended to annual archive. |

Reviewed dates mean the record was read/reconciled, not that its pending acceptance ran. Original Opened dates and user edits/history remain. Closed archives and previous reports were not rewritten.

## Validation and reproducibility

- Independent locked npm install succeeds; patched dependency audit reports **0 vulnerabilities**.
- **602 tests / 88 files pass**, including the newly failing-before/passing-after state regressions, durable commit/error tests and real collider/camera join. Coverage run also passes all 602.
- Production build, strict app/examples/i18n types and conventions pass; 852 translated texts, 53 AA contrast pairs, all 3 relay integration tests and generated-output checks pass. Static token contrast and browser axe are complementary; neither proves every rendered interaction state readable.
- Refreshed intentional audit unit-coverage snapshot: core 93.9% lines / 82.1% branches; three 69.1 / 60.0; services 40.9 / 34.5; state 90.3 / 73.7; UI 0.7 / 0.7; all 54.0 / 48.2. This is executed code, not quality or combined browser coverage. Coverage enforcement remains off; the new audit-age gate is a different policy.
- Catalogue, examples, impact/element maps and generated guide are regenerated and compared. Source changes still invalidate recordings: no media stamp or screenshot is treated as new visual acceptance.
- Published v3.1.1 copied helpers are byte-compared; source harness fixtures previously passed all 72. No copied generic helper is locally forked. Maintenance outcomes are bound to the actual project inputs.
- Local Playwright execution was attempted but could not launch: the required Chromium headless-shell executable is absent. No local browser pass is claimed; the PR CI installs its own browser.
- Baseline CI inspected via authenticated GitHub connector and public check-runs API: [#275](https://github.com/voidbrain/openbando/pull/275), [41245176140](https://github.com/voidbrain/openbando/actions/runs/41245176140), all six app jobs plus CodeQL success. The audit PR must establish its own checks; prior green results do not validate new code.

This report closes the review/tracking scope once its own checks and merge are complete. Product backlog work, real telemetry, surveyed geometry, media review and untested browser/device combinations remain distinct. No claim is made that all bugs, dead code, slopes or missing features have been eliminated.
