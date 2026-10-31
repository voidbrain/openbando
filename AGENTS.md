You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Project conventions (OpenBando)

The app is **OpenBando** (tagline "Build, Fly, Share."). The repository is `voidbrain/openbando`, the Angular project
`openbando` and the site lives at `https://voidbrain.github.io/openbando/` (`baseHref` in `angular.json`; the deploy workflow uploads `dist/openbando/browser`).

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
Open every PR against `main`, never on another PR's branch (merging it would not reach `main`). Once a PR's CI is green the owner may merge it at any moment: push no new work to it, open a new PR. Exception: a green PR that conflicts with `main` cannot merge, so it may get a push that only resolves the conflict; its checks run again before it can merge. A conflict in `docs/BACKLOG.md` is resolved record by record with `node tools/merge-backlog.mjs`, never by keeping one side's record (that silently drops the other side's edits).

**What the agent does on its own, and what it asks first.**
- On its own: branch from `main`, commit, push its branches, open PRs against `main` (then name the PR by its number in the records it touches, and push that before the checks finish), resolve conflicts on its own PRs, merge its own PR once every check on it has passed and GitHub can merge it (`node tools/merge-when-green.mjs <PR>…` waits for that and stops on any failing check or conflict), delete merged branches, reconcile and close backlog records.
- Asks first: a decision or check a record marks 🧑; repository settings (branch protection, required checks, secrets) and dismissing a code-scanning alert; rewriting published history or force-pushing; deleting what it did not create; a harness change it cannot place as project or template ("Changing a harness file").
- Never: merge with a failing or pending check, or bypass the branch protection. A project narrows this list with a project line.

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
npm run check:conventions                 # Angular conventions above, core/ imports, unused exports
```

- `npm run e2e` (Playwright, also a CI job): every guide step plays alone in a headless browser without errors, and the first visit, the editor with the library and a running guide step pass axe (WCAG 2.1 A / AA). Locate panels by `app-panel[data-id=…]` or by role: component hosts have no box of their own. Software WebGL is slow there: keep the long timeouts. <!-- project -->
- A failing test is evidence until shown otherwise: check it against the intended behaviour. Change its expectation only when the requirement deliberately changed, and say which requirement; otherwise fix the code.
- Tests that encoded the old demo site now set their site up explicitly (origin, take-off pad). <!-- project -->
- Keep logic in `core/` where possible. Playwright covers selected UI and pointer workflows, but coverage is not exhaustive. <!-- project -->
- Do not leave dead code behind when replacing a feature: a panel removed means its store, helpers and tests go too. <!-- project -->

### Code coverage

`docs/agents/coverage.md` shows, per folder, how much of the code the unit tests run (lines, statements, branches, functions) and the files no test runs; `npm run coverage` (or the stack's coverage run, then `node tools/coverage-table.mjs --write`) refreshes it and its baseline. CI prints the current table and warns, never fails, when a folder drops more than `coverage.drop` points. Coverage says what ran, not that the behaviour is checked: a table to find untested parts, never a number to hit. The committed page and baseline change only in a PR that changes coverage on purpose (code removed, tests added for it) and in audits, never as a side effect of other work: CI prints the live table on every PR anyway, and parallel PRs that each rewrite the page conflict.

### Changing a harness file

Before editing a file listed in `.harness.json` (`copied`, `forked`, `adapted`, or `.harness.json` itself), decide whether the change holds for this project only or for every project. The edit is the trigger, whatever the request's words: an "allow X" that changes how work is done is a rule.
- **This project only**: its content or a setting stays here. A project line inside a section that comes from the template ends with `<!-- project -->`, so a reconcile keeps it; a changed harness rule is an override (APPLY.md, "Project overrides").
- **Every project**: the template first, then reconcile here (APPLY.md, "Changing the harness from a project").
- **Unsure**: ask the user before editing. Never decide silently.

`npm run check:freshness` lists the harness files a branch changes, locally and on every PR.

### What follows a change

Everything derived from something else is a row of the impact map, `impact` in `.harness.json`: generated pages and data, recordings (clips, screenshots, films), translations, guides and tours, docs that describe a feature. A row: `{ "id", "when": [file globs], "then": "what must follow", "run": "command", "checked": "what verifies it", "after": [ids] }`. `after` makes chains: when a row it names must run again, so must this one (a catalogue rebuilt → the examples that use it → their pages).
- Rows are as fine as the code can name things (a recording per step, not "all recordings"), and complete: a derived thing you find without a row gets one in the same PR.
- A row watches what its output is made of, not only code: the data a recording or a generated page loads (an example, a demo file, a fixture) goes in its `inputs`, which set it off like `when`. A setting with a wide reach (a theme colour, a font, a scale) has its own row chained to every output it shows in, art included.
- **Couplings.** A value used in two places (a timing, a colour, an offset, a size) has one source that both read. If it cannot, a test asserts the relation. Either way it is listed in `couplings` (`{ value, places: [{ file, what }], kept }`), and `check:freshness` names the other places when a branch changes one. A value copied by hand is a bug waiting to happen.
- What can change an output with no commit here (library upgrades, the CI browser and machine, external services and data) is listed in `outside` (`{ what, affects, noticed }`) and reviewed by the audit.
- `npm run check:freshness` lists, locally and on every PR, the rows a branch sets off and the order to run them. Do each in the same PR, or record in the backlog why not.
- `node tools/impact-map.mjs` writes the readable page (`docs/agents/impact-map.md`): what must follow a change, content dependencies, value couplings and what lies outside the repository, with links to the project's own detailed maps (`pages`: `{ title, path, about }`). CI keeps it equal to `.harness.json`. A row that nothing checks is a candidate for a check.

### Testing the joins

- Two bugs reached the live site although every unit had tests: flights on generated bandos were turned 90° (the map's projection and the flight's were each right, but the default alignment between them was not), and a timeline click was undone while the video played (seek and video clock each worked alone). A change that touches how two parts meet gets a test across both: `calibration-default.spec.ts` (a GPS fix lands where the map puts the same point), the seek-with-a-playing-video case in `services.spec.ts`.
- Test coordinates are neutral (Milan centre, 45.4642, 9.1900, or open sea at 1°N 1°E for flights). Never use a real bando's place, and never the private ones' (see Privacy). The map starts at Milan centre (`DEFAULT_START`) until the pilot searches.
- Typed coordinates are parsed locally (`parseLatLon`) and never sent to the geocoder: a bando's coordinates are the pilot's secret.

### Known pitfalls

- Angular signals in `effect()` that write other signals are fine in v22, but wrap reads you do not want tracked in
  `untracked()`.
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

## Work tracking

- Keep single responsibility and dependency inversion across repository boundaries: reusable masters define contracts; derived projects supply their adapters/configuration. A master never depends on derived implementation, deployment or adoption for its release or acceptance. Each backlog owns only its repository’s work; reject foreign next actions and closure conditions (BACKLOG-RULES, Ownership rejection and dependency direction).

**At the start of every session, before other work, run `npm run check:freshness`** and do what it lists, in the session's first PR:
- the backlog is behind `main`: read the CI of the PRs merged since (`npm run ci:status -- <numbers>`) and review any commit it lists without a PR, update or close their records, archive closed ones, move the header to the current `main`;
- merged branches are still on GitHub: delete them (and their local branches and worktrees);
- the newest audit in `docs/audits/` is older than `freshness.auditDays` in `.harness.json` (7 by default): audit what changed since (docs, tests, guides and clips, design system, accessibility, privacy such as GPS metadata in images, and what the outputs rely on outside the repository: dependency upgrades, the CI browser and machine, external services and data, the `outside` list of `.harness.json`) and write `docs/audits/<date>.md`; <!-- project -->
- the harness template has a newer release (`.harness.json` names the one this project is on), or its clone is missing, behind or unreachable: pull it first (`git -C ~/Projects/project-harness pull --ff-only --tags`), reconcile it as `~/Projects/project-harness/APPLY.md` ("Reconciling") says, then move `version` forward. `check-backlog`, `check-freshness`, `check-harness`, `ci-status` and `check-conventions` are copies of the template: never edit them here unless one is listed under `forked`; their settings are in `.harness.json` (`core/` imports, the CI workflow, the Auto-sync log note). A generic improvement goes into the template as a new release. <!-- project -->

CI prints the same as warnings on every PR (it never blocks), so a person reviewing a PR sees it too. <!-- project --> `ci:status` needs a logged-in `gh`; if it is not, say so instead of skipping the step.

- [docs/BACKLOG.md](docs/BACKLOG.md) is the source of truth for status; [docs/BACKLOG-RULES.md](docs/BACKLOG-RULES.md) is the procedure (statuses, human-action cues, record layout, CI reconciliation, closure and archives, documentation ownership and the consistency check every PR records). Update the affected records in the same PR as the change, and run `npm run check:backlog`.
- Keep a confirmed bug, a candidate fix awaiting review, an unimplemented feature and a completed check distinct. A merge is not verification, and a passing unit test is not a verified visual, pointer or device fix. A green CI run establishes the checks it named, not the absence of bugs; keep real-device, pointer/visual and untested tool combinations explicit. Archives (`docs/archive/`: closed backlog records, the old working plan, finished plans) and audits (`docs/audits/`) are dated evidence, not current status; the current audit is the newest file in `docs/audits/`. <!-- project -->
- A change to a harness file follows "Changing a harness file" above: this project only, every project (the template first), or ask.
- A plan or promise given to the user (steps, a table to build, a later fix) becomes backlog records in the same change, and the reply names them. Nothing promised lives only in the conversation.
- Generated guide text changes in `tools/build-guide.mjs` or the tour source, then `node tools/build-guide.mjs`. That is not re-recording: `npm run clips` and `npm run films` are separate browser/media workflows (F-011). <!-- project -->
