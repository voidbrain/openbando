## Project conventions (OpenBando)

The app is **OpenBando** (tagline "Build, Fly, Share."). The repository is `voidbrain/openbando`, the Angular project
`openbando` and the site lives at `https://voidbrain.github.io/openbando/` (`baseHref` in `angular.json`; the deploy workflow uploads `dist/openbando/browser`).

Angular and TypeScript conventions, accessibility requirements (axe, WCAG AA) and Angular pitfalls: [docs/agents/angular.md](docs/agents/angular.md), read before changing Angular code. <!-- project -->

### Architecture

- `core/` is plain TypeScript: from Angular it imports only the signal primitives (`signal`, `computed`, `untracked`), which run without the framework; keep it that way so it stays unit-testable (`npm run check:conventions`). Put logic there, keep
  components thin. `three/` builds Three.js objects from the spec; `services/` and `state/` hold signals; `ui/` is templates.
- The **spec is the source of truth** (`core/site-spec.ts`). The 3D model, the plan overlay, the inspector preview and the
  AI context are all derived from it. Edit the spec through `SiteEditor` (`commitSite` = one undo step; `beginGesture` +
  `live` for drags) and then `SiteService.applyDraft()` to rebuild the 3D scene.
- Coordinates: x east, z south, y up, metres. Building-local frames differ by element (see README, "Data and units"); mixing
  the min-corner frame (partitions, voids, columns) with the centred frame (openings of shaped buildings, footprints) is the
  usual source of bugs. Convert in one place and test it.
- Every wall builder must add `level.baseY`. A new geometry builder needs a collider: the collider only knows axis-aligned
  boxes and vertical cylinders (ground based); cut long or rotated parts into short boxes.

### Design system

- Before any UI change (templates, styles, user-facing text) read [design-system/README.md](design-system/README.md) and the
  guideline of the component you touch in `design-system/components/`. Follow its colours, type styles, spacing, radii and
  voice; use `var(--…)` tokens from `src/styles.scss`, never a new literal colour.
- A new token, tool colour or shared component updates `design-system/` in the same change (see "Keeping it in step" there).

### Adding things

- **A structure kind**: add it to `StructureKind` and `STRUCTURE_DEFAULTS` / `RECT_KINDS` (`three/structures.ts`), build it
  in `buildStructure` (geometry + collider), list it in `structKinds` (`ui/studio/bando-editor.ts`) and draw its plan symbol in `bando-editor.html`,
  add it to `STRUCTURE_KINDS` in `core/ai-commands.ts` if the assistant may place it, optionally map an OSM tag in
  `GeoService.areaData`. Add a case to `three/structures.spec.ts`.
- **An AI command**: add the op to `OPS`, fields to `AiCommand` + `normalizeCommands` (clamp every number), a `case` in
  `runCommands`, the property to `AI_SCHEMA`, a line (and ideally an example) to `SYSTEM_PROMPT`. Cover it in
  `core/ai-commands.spec.ts`. The model's `reply` is only a claim: report from `RunResult`.
- **A spec field**: add it to the type, keep `sanitizeSpec` (it rebuilds the object) and `cloneSpec` (JSON) in step, and
  make old saved specs load (optional field with a default).

### Checks before you finish

`main` is protected: a PR merges only when `check`, `e2e (1)`–`e2e (4)`, `race-browser` and `CodeQL` pass (ruleset "protect main"; a CodeQL alert is fixed, not waited out). <!-- project -->
Before you open, update or merge a PR, read [pull requests](docs/agents/pull-requests.md): PRs against `main`, when a green PR takes new work, conflicts, scoped verification and independent review.

<!-- safety:start -->
**What the agent does on its own, and what it asks first.** These rules load with this file in every session; the procedures below are read when they apply, never in place of these rules.
- On its own: branch from `main` in a separate `git worktree` (every task, single or parallel: the primary checkout stays on `main` with no edits of its own, because a running service, another session or the owner may rely on it; put worktrees in a sibling directory or under `.claude/worktrees/`; a project names what relies on its primary checkout with a project line), commit, push its branches, open PRs against `main` (then name the PR by its number in the records it touches, and push that before the checks finish), resolve conflicts on its own PRs, merge its own PR once every check on it has passed and GitHub can merge it (`node tools/merge-when-green.mjs <PR>…` waits for that and stops on any failing check or conflict), delete merged branches and their worktrees, reconcile and close backlog records.
- Asks first: material changes to an adopted upfront feature plan (BACKLOG-RULES, "Optional upfront feature plans"); a decision or check a record marks 🧑; repository settings (branch protection, required checks, secrets) and dismissing a code-scanning alert; rewriting published history or force-pushing; deleting what it did not create; a harness change it cannot place as project or template ("Changing a harness file").
- Never: merge with a failing or pending check, or bypass the branch protection. A project narrows this list with a project line.
- Optional push guard: `node tools/guard.mjs install` makes git refuse a push to `main`, a force-push and an archive rewrite, citing these rules (APPLY.md, "Push guard"; a Claude Code adapter does the same before the command runs). A refused operation the owner approves runs once with `HARNESS_GUARD_ALLOW=<rule>`; never set it without that approval.
- Never remove a safeguard (an ownership, evidence, privacy or safety rule) because it is old or rarely triggered, and never rewrite governing rules unattended: consolidating rules keeps every requirement ([rule review](docs/agents/rule-review.md), "Periodic rule consolidation").
<!-- safety:end -->

```bash
npm run check:freshness                   # first, at session start: backlog behind main, merged branches, audit age
npx ng test --watch=false
npx ng build
npx tsc -p tsconfig.app.json --noEmit --noUnusedLocals --noUnusedParameters
npx tsc -p tools/examples/tsconfig.json   # the example-bando script
npx tsc -p tools/i18n/tsconfig.json       # the translation check
npm run check:i18n                        # every UI text has its Italian
npm run check:contrast                    # shared text/surface pairs and token consistency
npm run check:backlog                     # active record layout and lifecycle cues
npm run check:conventions                 # Angular conventions (docs/agents/angular.md), core/ imports, unused exports
npm run check:integrations                # optional recommendation metadata, not live connections
npm run check:maintenance                 # current input-bound review evidence
npm run check:audits                      # declared audit scope and freshness
npm run check:rules                       # safety rules live in AGENTS, not only in a procedure
npm run code:map -- <path>                # exports with line ranges: read those lines, not the whole file
```

- Every project formats and lints its source, in CI too: `check:tooling` fails without both. OpenBando adopts Prettier and ESLint in follow-up PRs (F-049); until then `check:tooling` is not in CI and `format:check` / `lint` are not listed above. <!-- project -->
- `npm run e2e` (Playwright, also a CI job): every guide step plays alone in a headless browser without errors, and the first visit, the editor with the library and a running guide step pass axe (WCAG 2.1 A / AA). Locate panels by `app-panel[data-id=…]` or by role: component hosts have no box of their own. Software WebGL is slow there: keep the long timeouts. <!-- project -->
- A failing test is evidence until shown otherwise: check it against the intended behaviour. Change its expectation only when the requirement deliberately changed, and say which requirement; otherwise fix the code.
- Tests that encoded the old demo site now set their site up explicitly (origin, take-off pad). <!-- project -->
- Keep logic in `core/` where possible. Playwright covers selected UI and pointer workflows, but coverage is not exhaustive. <!-- project -->
- Do not leave dead code behind when replacing a feature: its state, helpers and tests go too. A panel removed means its store, helpers and tests go too. <!-- project -->
- A bug fix starts with a committed test that fails without the fix; the fix never edits that test to pass (BACKLOG-RULES, "A bug fix starts with a failing test").
- Coverage: OpenBando keeps `coverage.enforce: false`; the [coverage guide](docs/agents/coverage-guide.md) says how the page in `docs/agents/coverage.md` is read and refreshed. <!-- project -->

### Changing a harness file

Before editing a file listed in `.harness.json` (`copied`, `forked`, `adapted`, or `.harness.json` itself), decide whether the change holds for this project only or for every project. The edit is the trigger, whatever the request's words: an "allow X" that changes how work is done is a rule.
- **This project only**: its content or a setting stays here. A project line inside a section that comes from the template ends with `<!-- project -->`, so a reconcile keeps it; a changed harness rule is an override (APPLY.md, "Project overrides").
- **Every project**: the template first, then reconcile here (APPLY.md, "Changing the harness from a project").
- **Unsure**: ask the user before editing. Never decide silently.

`npm run check:freshness` lists the harness files a branch changes, locally and on every PR.

### Procedures: read before the task

All applicable rules must be known and followed from the start; shorter indexes never defer requirements. The [procedure discovery index](docs/agents/procedures.md) links authorities and expected evidence. Each procedure below is binding when its trigger applies: read it before starting that task. `npm run check:rules` fails when a never or ask-first rule lives only in a procedure.

| Before you | Read |
|---|---|
| start a session (`npm run check:freshness` lists what is due) | [session start](docs/agents/session-start.md) |
| open, update or merge a PR | [pull requests](docs/agents/pull-requests.md) |
| change Angular code | [Angular conventions](docs/agents/angular.md) |
| switch independent tasks or compact/handoff context | [Task context](docs/agents/task-context.md) |
| work on parallel branches or model assignments | [Parallel work](docs/agents/parallel-work.md) |
| reassess architecture, decisions or alternatives | [Architecture reassessment](docs/agents/architecture-review.md) |
| change tests, coverage settings or the coverage page | [coverage guide](docs/agents/coverage-guide.md) |
| change something another output is derived from (generated pages and data, recordings, translations, guides, a value used in two places) | [change impact](docs/agents/change-impact.md); `check:freshness` lists the rows a branch sets off: do each in the same PR, or record in the backlog why not |
| set up the project or change its stack or workflow (capability assessment) | [MCP guidance](docs/agents/mcp.md), "In short" |
| add, configure or rely on an MCP connection | [MCP guidance](docs/agents/mcp.md) |
| edit the project's MCP selections or run the MCP commands | [MCP selections and commands](docs/agents/mcp-commands.md) |
| work across repositories of a solution | [solution profile](docs/agents/solution-profile.md) |
| add or use a shared skill | [skill guidance](docs/agents/skills.md) |
| adopt or reconcile the harness or review maintenance evidence (`node tools/maintenance.mjs check` runs at session start and in CI) | [maintenance guidance](docs/agents/maintenance.md) |
| change AGENTS.md, CLAUDE.md, BACKLOG-RULES or `docs/backlog/` (rerun the agent-behaviour checks when a runner is configured) | [rule review](docs/agents/rule-review.md), "Agent-behaviour checks" |
| measure friction, consolidate rules or run the periodic token review | [rule review](docs/agents/rule-review.md) |
| run an audit (`check:freshness` says when) | [audit procedure](docs/agents/audit.md) |
| record audit findings or improvement proposals | [audit findings](docs/agents/audit-findings.md) |
| update or close a backlog record | [backlog rules](docs/BACKLOG-RULES.md): its table names the one file the change needs |

### Testing the joins

- A change that touches how two parts meet gets a test across both, not one per side. Unit tests on each part did not catch the bugs that reached users.
- Two bugs reached the live site although every unit had tests: flights on generated bandos were turned 90° (the map's projection and the flight's were each right, but the default alignment between them was not), and a timeline click was undone while the video played (seek and video clock each worked alone). Their cross-part tests: `calibration-default.spec.ts` (a GPS fix lands where the map puts the same point), the seek-with-a-playing-video case in `services.spec.ts`. <!-- project -->
- Test coordinates are neutral (Milan centre, 45.4642, 9.1900, or open sea at 1°N 1°E for flights). Never use a real bando's place, and never the private ones' (see Privacy). The map starts at Milan centre (`DEFAULT_START`) until the pilot searches. <!-- project -->
- Typed coordinates are parsed locally (`parseLatLon`) and never sent to the geocoder: a bando's coordinates are the pilot's secret. <!-- project -->

### Known pitfalls

- WebGL canvases (inspector preview, 3D editor view) skip rendering while hidden; they must not be assumed to exist in tests
  (the scene builders are testable without a renderer).
- Overpass answers 429 / 500 without CORS headers: do not treat the browser's "access control" error as a code bug.
- Never claim an AI edit worked from the model's own words.
- `SiteService.applySpec` re-applies the calibration every time (Save, every edit). The pilot's own alignment (pins, compass)
  therefore lives in `SiteSpec.calibration`; an effect in `SiteService` copies live changes into the spec. Do not set the
  calibration anywhere without going through the store, or it will be undone on the next edit.
- The flight view and the 3D editor build the site with `{ merge: true }` (`three/merge.ts`): each building, its roof and each structure become one mesh per material (Chiari: 1,217 meshes → under 100). Transparent and instanced meshes stay apart, and so does any mesh with its own `userData.pick` (columns, partitions: the editor clicks them one by one); the x-ray fades the merged mesh, the collider is unchanged. Previews (`bare`) are not merged.
- Meshes that can be clicked in the 3D editor carry `userData.pick` (`{ kind, id | i }`); keep it when adding a new builder.

## Area notes

Before changing an area, read its section in [docs/agents/areas.md](docs/agents/areas.md): the rules and lessons there are as binding as this file.

| Area | Covers |
|---|---|
| Editor | shell and tool controllers, palette, selection, measures, Elements, modules, blocks and the library, coordinates, water/roads/surfaces, inspector docking |
| Terrain, roads and underground | `siteGround`, terrain styles, road priority and draping, underground cuts, basements and their perimeter walls |
| Buildings and example bandos | ruins, generated examples (`npm run examples`), the Villetta measured example, Bardwell House |
| Sharing and privacy | hidden/exact export, backup, import, pins and calibration of hidden bandos |
| Flights, replay and racing | log parsing, video sync and Auto-sync, replay smoothing, cameras, paths, racing, Fly entry |
| Welcome, guide and mascot | first visit, the showcase, the guided tour and its timing, the pixel mascot |
| Panels and Views | Views hierarchy, Hide all / Reset UI |
| Languages | `I18nService`, the Italian dictionary, `check:i18n` |
| UI chrome and contrast | theme tokens, control state pairs, contrast tests |
| Future | proposals that are not implemented |

## Privacy

- Never commit secrets, tokens or personal data. Test data is neutral and invented.
- Villetta's and Bardwell House's places are private: their coordinates, addresses, map data and survey points are not in the repository. Never add them (tests, tour, tools, docs, commit messages). Hidden bandos never reveal geographic coordinates (see "Sharing and privacy"). <!-- project -->
- Audits check images for GPS metadata, and the outputs' outside dependencies listed under `outside` in `.harness.json`. <!-- project -->

## Work tracking

- Keep single responsibility and dependency inversion across repository boundaries: reusable masters define contracts; derived projects supply their adapters/configuration. A master never depends on derived implementation, deployment or adoption for its release or acceptance. Each backlog owns only its repository’s work; reject foreign next actions and closure conditions (BACKLOG-RULES, Ownership rejection and dependency direction).

**At the start of every session, before other work, run `npm run check:freshness`** and do what it lists, as [session start](docs/agents/session-start.md) says for each finding.

- CI prints ordinary freshness reminders as warnings; required maintenance evidence and invalid audit metadata fail. OpenBando enables seven-day overdue-area enforcement after its 31 October full product baseline review; a blocked area does not count as checked. <!-- project -->
- Keep a confirmed bug, a candidate fix awaiting review, an unimplemented feature and a completed check distinct. A merge is not verification, and a passing unit test is not a verified visual, pointer or device fix. A green CI run establishes the checks it named, not the absence of bugs. Archives (`docs/archive/`) and audits (`docs/audits/`) are dated evidence, not current status; current audit coverage is reported per area by check:audits; a scoped report never resets the full-audit baseline.
- Keep real-device, pointer/visual and untested tool combinations explicit; archives also hold closed backlog records, the old working plan and finished plans. <!-- project -->
- A change to a harness file follows "Changing a harness file" above: this project only, every project (the template first), or ask.
- A plan or promise given to the user (steps, a table to build, a later fix) becomes backlog records in the same change, and the reply names them. Nothing promised lives only in the conversation.
- Generated guide text changes in `tools/build-guide.mjs` or the tour source, then `node tools/build-guide.mjs`. That is not re-recording: `npm run clips` and `npm run films` are separate browser/media workflows (F-011). <!-- project -->
