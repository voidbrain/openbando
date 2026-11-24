# Reconciliation log 2026

Dated reconciliation entries and archived `Other changes` entries moved from `docs/BACKLOG.md`.

## Archived Other changes (moved from BACKLOG.md on 2026-11-23)

2026-11-24: #284 (harness v10.7.0) merged on green CI. Backlog records moved to source files in [#285](https://github.com/voidbrain/openbando/pull/285) (F-052): `docs/BACKLOG.md` is now generated.

2026-11-24: #282 (Angular 22.3) and #283 (harness v10.5.0) merged on green CI. Harness reconciled to v10.6.1 (friction samples survive worktrees; skills and rule-review guides) and v10.7.0 (the closure rule names `work:close`) in [#284](https://github.com/voidbrain/openbando/pull/284).

2026-11-24: #281 (area notes) and #282 (Angular 22.3) merged on green CI: F-050 and F-051 closed. Harness reconciled to v10.5.0 in [#283](https://github.com/voidbrain/openbando/pull/283): lean AGENTS, always-loaded rules 3,454 / 3,500 tokens.

2026-11-23: #279 (Prettier) and #280 (ESLint) merged on green CI: F-049 closed and archived; `check:tooling` in CI. Angular 22.3 in [#282](https://github.com/voidbrain/openbando/pull/282) (F-051).

2026-11-23: [#278](https://github.com/voidbrain/openbando/pull/278) merged on green CI (harness v10.3.1 and the full audit); F-048 and B-052 closed and archived. Prettier adopted in [#279](https://github.com/voidbrain/openbando/pull/279) (F-049 step 1).

2026-11-23: harness reconciled from v3.1.1 to v10.3.0 (F-048, [#278](https://github.com/voidbrain/openbando/pull/278)): copied tools updated, completion percentages removed, human-action cues name their kind, this section archived. Prettier and ESLint adoption follows in F-049. Same PR: the [23 November full audit](audits/2026-11-23-full-openbando.md) of all eight areas at main `34f90c3` (no new product defect; F-051 opened), carried in #278 because `main` fails the audit gate and #278 holds the fresh maintenance receipt.

2026-10-31: [#275](https://github.com/voidbrain/openbando/pull/275) adopts v3.1.1; its scoped review is [dated here](audits/2026-10-31-harness-v3.1.1.md). F-046 retains #274’s completed v2.2.2 CI evidence and owns current adoption acceptance; F-047 independently tracks full product audit coverage. Product human/device records, approved artwork/media and historical reports remain unchanged.

Harness ownership clarification ([#273](https://github.com/voidbrain/openbando/pull/273), 2.0.1 source): adopted the merged [template #40](https://github.com/voidbrain/project-harness/pull/40), `9c3abc6`, into BACKLOG-RULES and AGENTS. Ownership review rejects foreign Issue/next-action/closure work, including hidden details; masters use owned fixtures/contracts and never wait for derived implementation, deployment or adoption. This project owns only its own reconciliation. Template release tags remain upstream maintenance, not an active OpenBando task. Estimate policy and the 2.0.0 layout are unchanged.

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
