# Full OpenBando audit — 23 November 2026

## Baseline and scope

Full review of all eight required areas at main **34f90c3f341ce78595d577b31bd9243ed58c66cd** (merged #277). Review date: 23 November 2026. It follows the [31 October full audit](2026-10-31-full-openbando.md) at `3f7b844`. Since then, 7 commits reached `main`: #276 (that audit's own fixes and the B-052 e2e stabilisation) and #277 (backlog reconcile). They changed 28 files; 14 of them are under `src/` and `e2e/`. Evidence from 31 October is reused only for code that has not changed since; the changed code is named below. The audit ran in an isolated worktree with a clean `npm ci`. It is a repository audit: source and diff review, the full unit suite with coverage, build and types, regenerated outputs, dependency and alert queries, image metadata and actual CI/deploy runs. It is not a penetration test, a real-device check or visual acceptance of media.

Open work in other branches at review time, named so this report does not claim it: the harness reconcile to v10.3.0 ([#278](https://github.com/voidbrain/openbando/pull/278), F-048–F-050) and the template fix it waits on ([project-harness #234](https://github.com/voidbrain/project-harness/pull/234), B-048 there).

## Results by area

| Area | Result and method | Evidence and limitations |
|---|---|---|
| Code | Checked. Reviewed the 14 source/e2e files changed since `3f7b844` (the 31 October fixes: video offset, library migration, camera ground, pin/adjust, unused math helpers, the showcase e2e). Searched for unfinished markers; ran the unused-export check. | `git grep TODO\|FIXME\|XXX\|HACK` over `src`, `tools`, `e2e`: 0. `check:conventions`: 189 files, no unused exports. The changed files were reviewed and CI-verified in #276; no new defect found. Unchanged code keeps the 31 October evidence. |
| Logic | Checked. Traced the #276 state fixes again against their regressions (pair-owned video offset, durable migration commit, camera-only ground sampling, pin arming cancels Adjust). | Regressions pass in the full suite. B-050 and B-051 (async-result hypotheses) remain uninvestigated: no new evidence, still Investigate. B-045 unchanged. |
| Tests | Checked. Full unit suite with coverage; relay integration; CI history of #276, #277 and the #278 run; retries. | 602 tests in 88 files pass; coverage identical to 31 October (core 93.9 % lines, three 69.1, services 40.9, state 90.3, UI 0.7, all 54.0). `test:race-relay` passes. #276 and #277: every job green. B-052's fixed check passed e2e (4) on both runs since; a third run (#278) was in progress. No local browser run. |
| Documentation | Checked. Regenerated the catalogue, examples, impact map, element map and guide pages and compared them; ran the media checker; compared README and area notes against the changed code. | All generated outputs equal the committed ones. `check-media`: guide clips (recorded at `d35f0d3`) and Welcome films (`73aee6e`) show 17 and 21 source files changed since. Unchanged since 31 October; F-031 owns re-recording. `check:i18n` 852 texts, `check:contrast` 53 AA pairs pass. |
| Harness | Checked. Compared the stamp with the template; read the maintenance workflow history and the audit gate. | The project is on template v3.1.1; v10.3.0 is published: reconciled in #278 (F-048). That PR's CodeQL run found an escaping bug in a copied tool, fixed upstream as template B-048 (v10.3.1). The daily Maintenance freshness workflow failed on all 15 runs from 8 November: the review receipt went past 7 days, and #278 records a new one. Since 7 November the audit gate fails `check` on every PR, including `main`; this report clears it. See the proposal below. |
| Security | Checked. `npm audit`; open code-scanning, Dependabot and secret-scanning alerts on `main`; secret-pattern search; EXIF/GPS search of every committed image. | `npm audit`: 0 vulnerabilities. Code scanning, Dependabot and secret scanning: 0 open on `main`; #278's CodeQL alert is that branch's and is tracked there. No key or token patterns in tracked files. All 38 committed images were parsed: one JPEG has EXIF (orientation and resolution only), and none has a GPS block. No penetration test, no live relay or server test. |
| Delivery | Checked. Build, types, deploy and Pages status, dependency drift, the `outside` list. | Production build and the four `tsc` projects pass. The last deploy (2026-11-04, `34f90c3`) succeeded and Pages is built, so the live site matches `main`. Builder 22.3.0 now ships Vite 8.3.8, so the Vite 8.3.5 override (B-049) can be dropped with an Angular update: F-051. Minor updates are available (three 0.187, Playwright 1.65, vitest 5.1). The `outside` list's eight sources were not re-measured live; no change was observed through the repository. |
| Backlog | Checked. Read every active record's status, cue, next action and evidence; checked whether any can advance. | 21 active records. Nothing advanced from CI alone, because no product change merged since 4 November. B-052 stays Implemented until its third green run. The human/device acceptance records (B-009, B-017, B-018, B-028, F-001, F-009, F-031, F-033) and decisions (F-025, F-026) are unchanged. The open features (F-021, F-024, F-040–F-043) and F-039 (blocked upstream) are unchanged. New: F-051. |

## Findings

| Classification | Area / location | Evidence | Impact, recommendation | Owner |
|---|---|---|---|---|
| Missing agreed follow-up | delivery / `package.json` overrides | `npm view @angular/build@22.3.0 dependencies.vite` → 8.3.8; installed builder 22.2.2 is pinned to Vite 8.3.5 by override (B-049, 31 October) | Low risk today (0 advisories). Update Angular to 22.3.x and remove the override; the `lockfile` impact row then asks for browser tests and a look at the 3D views | F-051 |
| Confirmed tooling defect (upstream) | harness / `tools/check-rules.mjs` (copied) | CodeQL js/incomplete-sanitization on #278 | Blocks #278's merge; fixed in the template with a failing test first | template B-048; F-048 here |
| Annotation | harness, delivery / scheduled checks | 15 failing Maintenance freshness runs (8–22 November) and an audit gate failing every PR since 7 November | The gates worked as designed; nothing merged meanwhile. Recorded so the cause is clear | report only |
| Proposal, report only | harness / audit and maintenance cadence | As above | A 7-day hard gate means any idle week blocks the next PR behind a full audit. Options: keep it (the owner's choice on 31 October), lengthen `audit.days`, or let the daily workflow open an issue when it fails. Not adopted; the owner decides | report only |

## Validation

- `npm ci` (clean), `npm audit` 0, `npm outdated` reviewed.
- `ng test` with coverage: 602/602; `coverage-table --check`; `test:race-relay`.
- `ng build`; `tsc` for app (no unused locals/parameters), examples, i18n, racing.
- Catalogue, examples, impact map, element map and guide pages regenerated: no diff.
- `check-media`, `check:i18n`, `check:contrast`, `check:conventions`.
- GitHub: `ci:status` for #276 and #277 (all green), the #278 run, code-scanning/Dependabot/secret-scanning alerts, Maintenance freshness history, deploy runs, Pages status.

No claim is made that all bugs, dead code or missing features have been found. Real-device, visual and media acceptance remain on their records.
