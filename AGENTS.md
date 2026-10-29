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

`main` is protected: a PR merges only when `check`, `e2e (1)`–`e2e (4)` and `race-browser` pass (ruleset "protect main"). Open every PR against `main`, and do not push to a PR once its CI is green (open a new one).

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

- `npm run e2e` (Playwright, also a CI job): every guide step plays alone in a headless browser without errors, and the first visit, the editor with the library and a running guide step pass axe (WCAG 2.1 A / AA). Locate panels by `app-panel[data-id=…]` or by role: component hosts have no box of their own. Software WebGL is slow there: keep the long timeouts.
- A failing test is evidence until shown otherwise: check it against the intended behaviour. Change its expectation only when the requirement deliberately changed, and say which requirement; otherwise fix the code. Tests that encoded the old
  demo site now set their site up explicitly (origin, take-off pad).
- Keep logic in `core/` where possible. Playwright covers selected UI and pointer workflows, but coverage is not exhaustive.
- Do not leave dead code behind when replacing a feature: a panel removed means its store, helpers and tests go too.

### Testing the joins

- Two bugs reached the live site although every unit had tests: flights on generated bandos were turned 90° (the map's projection and the flight's were each right, but the default alignment between them was not), and a timeline click was undone while the video played (seek and video clock each worked alone). A change that touches how two parts meet gets a test across both: `calibration-default.spec.ts` (a GPS fix lands where the map puts the same point), the seek-with-a-playing-video case in `services.spec.ts`.
- Test coordinates are neutral (Milan centre, 45.4642, 9.1900, or open sea at 1°N 1°E for flights). Never use a real bando's place, and never the private one's (see Sharing bandos). The map starts at Milan centre (`DEFAULT_START`) until the pilot searches.
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
| Buildings and example bandos | ruins, generated examples (`npm run examples`), the Villetta measured example |
| Sharing and privacy | hidden/exact export, backup, import, pins and calibration of hidden bandos |
| Flights, replay and racing | log parsing, video sync and Auto-sync, replay smoothing, cameras, paths, racing, Fly entry |
| Welcome, guide and mascot | first visit, the showcase, the guided tour and its timing, the pixel mascot |
| Panels and Views | Views hierarchy, Hide all / Reset UI |
| Languages | `I18nService`, the Italian dictionary, `check:i18n` |
| UI chrome and contrast | theme tokens, control state pairs, contrast tests |
| Future | proposals that are not implemented |

## Privacy

- Villetta's place is private: its coordinates, map data and survey points are not in the repository. Never add them (tests, tour, tools, docs). Hidden bandos never reveal geographic coordinates (see "Sharing and privacy").

## Work tracking

**At the start of every session, before other work, run `npm run check:freshness`** and do what it lists, in the session's first PR:
- the backlog is behind `main`: read the CI of the PRs merged since (`npm run ci:status -- <numbers>`) and review any commit it lists without a PR, update or close their records, archive closed ones, move the header to the current `main`;
- merged branches are still on GitHub: delete them (and their local branches and worktrees);
- the newest audit in `docs/audits/` is older than `freshness.auditDays` in `.harness.json` (7 by default): audit what changed since (docs, tests, guides and clips, design system, accessibility, privacy such as GPS metadata in images) and write `docs/audits/<date>.md`;
- the harness template has a newer release (`.harness.json` names the one this project is on), or its clone is missing, behind or unreachable: pull it first (`git -C ~/Projects/project-harness pull --ff-only --tags`), reconcile it as `~/Projects/project-harness/APPLY.md` ("Reconciling") says, then move `version` forward. `check-backlog`, `check-freshness`, `check-harness`, `ci-status` and `check-conventions` are copies of the template: never edit them here unless one is listed under `forked`; their settings are in `.harness.json` (`core/` imports, the CI workflow, the Auto-sync log note). A generic improvement goes into the template as a new release.

CI prints the same as warnings on every PR (it never blocks), so a person reviewing a PR sees it too. `ci:status` needs a logged-in `gh`; if it is not, say so instead of skipping the step.

- [docs/BACKLOG.md](docs/BACKLOG.md) is the source of truth for status; [docs/BACKLOG-RULES.md](docs/BACKLOG-RULES.md) is the procedure (statuses, human-action cues, record layout, CI reconciliation, closure and archives, documentation ownership and the consistency check every PR records). Update the affected records in the same PR as the change, and run `npm run check:backlog`.
- Keep a confirmed bug, a candidate fix awaiting review, an unimplemented feature and a completed check distinct. A merge is not verification, and a passing unit test is not a verified visual, pointer or device fix. A green CI run establishes the checks it named, not the absence of bugs; keep real-device, pointer/visual and untested tool combinations explicit. Archives (`docs/archive/`: closed backlog records, the old working plan, finished plans) and audits (`docs/audits/`) are dated evidence, not current status; the current audit is the newest file in `docs/audits/`.
- A request that changes a copied tool, or adds a rule that would hold for every project, is a harness change: make it in the template first, then reconcile here, as the template's `APPLY.md` ("Changing the harness from a project") says. Settings and project content in adapted files (this file's project conventions, the area notes, the style guide) stay here; a change only this project needs is a project override, marked or forked as the template's `APPLY.md` ("Project overrides") says.
- Generated guide text changes in `tools/build-guide.mjs` or the tour source, then `node tools/build-guide.mjs`. That is not re-recording: `npm run clips` and `npm run films` are separate browser/media workflows (F-011).
