## Project conventions (OpenBando)

The app is **OpenBando** (tagline "Build, Fly, Share."). The repository is `voidbrain/openbando`, the Angular project
`openbando` and the site lives at `https://voidbrain.github.io/openbando/` (`baseHref` in `angular.json`; the deploy workflow uploads `dist/openbando/browser`).

### Architecture

- `core/` is plain TypeScript: from Angular it imports only the signal primitives (`signal`, `computed`, `untracked`), which run without the framework; keep it that way so it stays unit-testable (`npm run check:conventions`). Put logic there, keep
  components thin. `three/` builds Three.js objects from the spec; `services/` and `state/` hold signals; `ui/` is templates.
- The **spec is the source of truth** (`core/site-spec.ts`): the 3D model, plan overlay, inspector preview and AI context derive from it. Edit the spec through `SiteEditor` (`commitSite` = one undo step; `beginGesture` +
  `live` for drags) and then `SiteService.applyDraft()` to rebuild the 3D scene.
- Coordinates: x east, z south, y up, metres. Building-local frames differ (README, "Data and units"): mixing the min-corner
  frame (partitions, voids, columns) with the centred one (openings of shaped buildings, footprints) is the usual bug. Convert in one place and test it.
- Every wall builder must add `level.baseY`. A new geometry builder needs a collider: the collider only knows axis-aligned
  boxes and vertical cylinders (ground based); cut long or rotated parts into short boxes.
- Meshes that can be clicked in the 3D editor carry `userData.pick` (`{ kind, id | i }`); keep it when adding a new builder (merged meshes: [editor geometry](docs/agents/areas/editor-geometry.md)). <!-- project -->
- `SiteService.applySpec` re-applies the calibration every time (Save, every edit). The pilot's own alignment (pins, compass)
  therefore lives in `SiteSpec.calibration`; an effect in `SiteService` copies live changes into the spec. Do not set the
  calibration anywhere without going through the store, or it will be undone on the next edit. <!-- project -->

### Design system

- Before any UI change (templates, styles, user-facing text) read [design-system/README.md](design-system/README.md) and the guide of the component you touch (`design-system/components/`): colours, type, spacing, radii, voice; `var(--…)` tokens from `src/styles.scss`, never a new literal colour. A new token, tool colour or shared component updates `design-system/` in the same change ("Keeping it in step" there). <!-- project -->

### Checks before you finish

`main` is protected: a PR merges only when `check`, `e2e (1)`–`e2e (4)`, `race-browser` and `CodeQL` pass (ruleset "protect main"; a CodeQL alert is fixed, not waited out). <!-- project -->
Before you open, update or merge a PR, read [pull requests](docs/agents/pull-requests.md).

<!-- safety:start -->
**What the agent does on its own, and what it asks first.** These rules load with this file in every session; the procedures below are read when they apply, never in place of these rules.
- On its own: branch from `main` in a separate `git worktree` (every task, single or parallel: the primary checkout stays on `main` with no edits of its own, because a running service, another session or the owner may rely on it; put worktrees in a sibling directory or under `.claude/worktrees/`; a project names what relies on its primary checkout with a project line), commit, push its branches, open PRs against `main` (then name the PR by its number in the records it touches, and push that before the checks finish), resolve conflicts on its own PRs, land its own PR through the landing queue once every check on it has passed and GitHub can merge it: one lander merges ready PRs one at a time, with at most two in CI ([parallel work](docs/agents/parallel-work.md), "Landing queue"; `node tools/merge-when-green.mjs <PR>…` waits for the checks and stops on any failing check or conflict), delete merged branches and their worktrees, reconcile and close backlog records.
- Asks first: material changes to an adopted upfront feature plan (BACKLOG-RULES, "Optional upfront feature plans"); a decision or check a record marks 🧑; repository settings (branch protection, required checks, secrets) and dismissing a code-scanning alert; rewriting published history or force-pushing; deleting what it did not create; a harness change it cannot place as project or template ("Changing a harness file").
- Never: merge with a failing or pending check, or bypass the branch protection. A project narrows this list with a project line.
- Optional push guard: `node tools/guard.mjs install` makes git refuse a push to `main`, a force-push and an archive rewrite, citing these rules (APPLY.md, "Push guard"; a Claude Code adapter does the same before the command runs). A refused operation the owner approves runs once with `HARNESS_GUARD_ALLOW=<rule>`; never set it without that approval.
- Never remove a safeguard (an ownership, evidence, privacy or safety rule) because it is old or rarely triggered, and never rewrite governing rules unattended: consolidating rules keeps every requirement ([rule review](docs/agents/rule-review.md), "Periodic rule consolidation").
<!-- safety:end -->

```bash
npm run check:freshness        # first, at session start
npx ng test --watch=false && npx ng build && npm run lint && npm run format:check
npx tsc -p tsconfig.app.json --noEmit --noUnusedLocals --noUnusedParameters
npx tsc -p tools/examples/tsconfig.json && npx tsc -p tools/i18n/tsconfig.json && npx tsc -p tools/racing/tsconfig.json
npm run check:i18n             # also check:contrast, check:backlog, check:work, check:conventions, check:rules, check:tooling,
                               # check:integrations, check:maintenance, check:audits (all in CI)
npm run code:map -- <path>     # exports with line ranges: read those lines, not the whole file
```

- Format and lint in CI too (`check:tooling`; a project with no source code records `tooling.exempt` with its reason).
- A failing test is evidence until shown otherwise: change its expectation only when the requirement deliberately changed, and say which; otherwise fix the code.
- A bug fix starts with a committed test that fails without the fix; the fix never edits that test to pass (BACKLOG-RULES, "A bug fix starts with a failing test").
- Replacing a feature removes its state, helpers and tests too: no dead code.
- A lint rule is disabled only on its line, with the reason after `--`; the copied harness tools and `tools/prototypes/` are not linted. <!-- project -->
- A panel removed means its store, helpers and tests go too. <!-- project -->
- Coverage: OpenBando sets `coverage.enforce: true` (owner, 2026-11-26), so a folder that drops more than `coverage.drop` points fails CI; the [coverage guide](docs/agents/coverage-guide.md) says how the page in `docs/agents/coverage.md` is read and refreshed. <!-- project -->

### Changing a harness file

Before editing a file listed in `.harness.json` (`copied`, `forked`, `adapted`, or `.harness.json` itself), decide: this project only, or every project. The edit is the trigger, whatever the request's words: an "allow X" that changes how work is done is a rule.
- **This project only**: content or a setting stays here; a project line in a template section ends with `<!-- project -->`; a changed harness rule is an override (APPLY.md, "Project overrides").
- **Every project**: the template first, then reconcile here (APPLY.md, "Changing the harness from a project").
- **Unsure**: ask the user before editing. Never decide silently. (`check:freshness` lists the harness files a branch changes.)

### Procedures: read before the task

Each procedure is binding when its trigger applies: read it before the task; a short index never defers a requirement. All of them: [procedure index](docs/agents/procedures.md). `npm run check:rules` fails when a never or ask-first rule lives only in a procedure.

| Before you | Read |
|---|---|
| start a session | [session start](docs/agents/session-start.md) |
| open, update or merge a PR | [pull requests](docs/agents/pull-requests.md) |
| update or close a backlog record | [backlog rules](docs/BACKLOG-RULES.md) (it names the one file a change needs) |
| write or change documentation | [documentation](docs/backlog/documentation.md) |
| change Angular code | [Angular conventions](docs/agents/angular.md) |
| write or change a browser (e2e) test | [e2e conventions](docs/agents/e2e.md) |
| add a structure kind, an AI command or a spec field | [adding things](docs/agents/adding-things.md) |
| change something an output is derived from (generated pages and data, recordings, translations, guides, a value used in two places) | [change impact](docs/agents/change-impact.md); do each row `check:freshness` lists, or record why not |
| change tests or coverage | [coverage guide](docs/agents/coverage-guide.md) |
| switch tasks or hand off context | [task context](docs/agents/task-context.md) |
| work in parallel: claimed tasks, branches, model assignments | [parallel work](docs/agents/parallel-work.md) (claims inside) |
| reassess architecture or decisions | [architecture review](docs/agents/architecture-review.md) |
| set up the project or change its stack or workflow (capability assessment) | [MCP guidance](docs/agents/mcp.md), "In short" |
| add, configure or rely on an MCP connection, or edit MCP selections | [MCP guidance](docs/agents/mcp.md) (commands inside) |
| work across repositories of a solution | [solution profile](docs/agents/solution-profile.md) (refresh inside) |
| add or use a shared skill | [skills](docs/agents/skills.md) |
| adopt or reconcile the harness, or review maintenance evidence | [maintenance](docs/agents/maintenance.md) |
| change AGENTS.md, CLAUDE.md, BACKLOG-RULES or `docs/backlog/`; measure friction; consolidate rules | [rule review](docs/agents/rule-review.md) (agent-behaviour checks when a runner is set) |
| run an audit, or record its findings or an improvement proposal | [audit](docs/agents/audit.md) ([findings](docs/agents/audit-findings.md)) |

### Testing the joins

- A change that touches how two parts meet gets a test across both, not one per side. Unit tests on each part did not catch the bugs that reached users.
- The two bugs that taught this, and their cross-part tests: [flights](docs/agents/areas/flights.md). <!-- project -->
- Test coordinates are neutral (Milan centre, 45.4642, 9.1900, or open sea at 1°N 1°E for flights). Never use a real bando's place, and never the private ones' (see Privacy). The map starts at Milan centre (`DEFAULT_START`) until the pilot searches. <!-- project -->
- Typed coordinates are parsed locally (`parseLatLon`) and never sent to the geocoder: a bando's coordinates are the pilot's secret. <!-- project -->

### Known pitfalls

- Never claim an AI edit worked from the model's own words: its `reply` is a claim; report from `RunResult`.

## Area notes

Before changing an area, read its section in [docs/agents/areas.md](docs/agents/areas.md): the rules and lessons there are as binding as this file.

OpenBando keeps one file per area under `docs/agents/areas/`, linked in the table below; harness capabilities and reconciliation: [areas/harness.md](docs/agents/areas/harness.md). <!-- project -->

| Area | Covers |
|---|---|
| Editor: [tools](docs/agents/areas/editor.md), [library](docs/agents/areas/editor-library.md), [geometry](docs/agents/areas/editor-geometry.md) | tools, selection, library, coordinates, water and ground |
| [Terrain, roads and underground](docs/agents/areas/terrain.md) | ground, roads, underground, basements |
| [Buildings and example bandos](docs/agents/areas/buildings.md) | ruins, generated and measured examples |
| [Sharing and privacy](docs/agents/areas/sharing.md) | export, backup, import, hidden bandos |
| [Flights, replay and racing](docs/agents/areas/flights.md) | logs, video sync, replay, cameras, racing, Fly |
| [Welcome, guide and mascot](docs/agents/areas/welcome.md) | first visit, showcase, guide and its tests, mascot |
| [Panels and Views](docs/agents/areas/panels.md) | Views hierarchy, Hide all / Reset UI |
| [Languages](docs/agents/areas/languages.md) | the Italian dictionary, `check:i18n` |
| [UI chrome and contrast](docs/agents/areas/ui-chrome.md) | tokens, control states, contrast |
| [Future](docs/agents/areas/future.md) | proposals that are not implemented |

## Privacy

- Never commit secrets, tokens or personal data. Test data is neutral and invented.
- Villetta's and Bardwell House's places are private: their coordinates, addresses, map data and survey points are not in the repository. Never add them (tests, tour, tools, docs, commit messages). Hidden bandos never reveal geographic coordinates (see "Sharing and privacy"). <!-- project -->

## Work tracking

**At the start of every session, before other work, run `npm run check:freshness`** and do what it lists, as [session start](docs/agents/session-start.md) says.


- This backlog owns only this repository's work: reject foreign next actions and closure conditions; a master never waits on what derives from it (BACKLOG-RULES, "One repository, one backlog").
- Keep a confirmed bug, a candidate fix, an unimplemented feature and a completed check distinct: a merge is not verification, a unit test is not a visual, pointer or device check, a green CI run proves only the checks it ran. Archives and audits are dated evidence, not current status.
- A plan or promise given to the user (steps, a table to build, a later fix) becomes backlog records in the same change, and the reply names them. Nothing promised lives only in the conversation.
- Keep real-device, pointer/visual and untested tool combinations explicit. <!-- project -->
