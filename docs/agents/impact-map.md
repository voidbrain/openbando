<!-- Written by tools/impact-map.mjs from the "impact" rows of .harness.json: change the rows, then run it. -->

# Impact map

What must follow a change, and what must run again after it (AGENTS, "What follows a change"). `npm run check:freshness` lists, on every PR, the rows a branch sets off and the order to run them.

**More detail:** [Element map](element-map.md) (every control, its tip, the clips that show it) · [Guide](../guide/README.md) (generated from the tour) · [Design system](../../design-system/README.md) · [Code coverage](coverage.md) (unit tests, per folder; browser tests not counted)

| Id | When these change | Made of (content) | This must follow | Command | Runs again after | Checked by |
|---|---|---|---|---|---|---|
| lockfile | `package-lock.json` |  | a library was upgraded (three.js, Angular, Playwright): run the browser tests and look at the 3D views; if rendering changed, the recordings below follow |  |  | the e2e jobs (behaviour); nothing for looks |
| theme | `src/styles.scss`, `design-system/tokens.json` |  | a theme colour, font or size reaches every visual output: the design-system guides, the recordings and the art below follow |  |  | check:contrast (tokens and text/surface pairs) |
| art | `public/mascot/**`, `docs/mascot/**` |  | the mascot and wordmark art follow the theme and the Welcome films (re-export from their masters, see the mascot and wordmark guides) |  | theme | nothing |
| design-system | `src/app/ui/**/*.scss` |  | a new token, tool colour or shared component updates design-system/ (tokens.json, the component's guide) |  | theme | check:contrast (tokens) |
| clips | `src/app/core/tour.ts`, `src/app/services/tour.service.ts`, `src/styles.scss`, `e2e/clips.record.ts`, `src/app/ui/**/*.html`, `src/app/ui/**/*.scss`, `src/app/ui/**/*.ts` | `library/bandos/chiari-e-forti.json`, `library/bandos/villetta-no-place.json`, `public/guide-demo/**` | re-record the guide clips whose step shows what changed (a browser workflow, not done by CI) | `npm run clips` | theme, lockfile | check:media (warns when what a clip shows changed since) |
| guide | `src/app/core/tour.ts`, `tools/build-guide.mjs` |  | regenerate the guide pages in docs/guide/ (they embed the clips) | `node tools/build-guide.mjs` | clips | CI (guide pages match the tour) |
| films | `src/app/ui/panels/welcome-panel.ts`, `src/app/ui/studio/**`, `src/app/three/**`, `src/app/services/tour.service.ts`, `src/styles.scss`, `e2e/welcome-films.record.ts` | `library/bandos/chiari-e-forti.json`, `library/bandos/villetta-no-place.json`, `public/guide-demo/**` | re-record the three Welcome films (build and share film Chiari e Forti, fly plays the showcase flight) | `npm run films` | theme, lockfile | check:media; the showcase test checks the films' length against the mascot loop |
| i18n | `src/app/**/*.html`, `src/app/**/*.ts` |  | every new user-facing text (templates, toasts, labels and hints in TypeScript data) has its Italian in src/app/i18n/it.ts | `npm run check:i18n` |  | check:i18n |
| tips | `src/app/**/*.html` |  | a new control gets its tip (a title, or a guide step that shows it on hover) |  |  | nothing yet (F-026) |
| element-map | `src/app/**/*.html`, `src/app/ui/**/*.ts`, `src/app/core/tour.ts` |  | regenerate the element map (docs/agents/element-map.md) | `node tools/build-element-map.mjs` |  | CI (element map matches the code) |
| help-keys | `src/app/services/shortcuts.service.ts` |  | the Help panel lists the keys (ui/panels/help-panel.ts) |  |  | nothing |
| spec-ai | `src/app/core/site-spec.ts`, `src/app/core/ai-commands.ts`, `src/app/core/ai-prompt.ts` |  | a new spec field or AI command keeps sanitizeSpec, cloneSpec, AI_SCHEMA, SYSTEM_PROMPT and normalizeCommands in step (AGENTS, Adding things) |  |  | ai-commands.spec.ts, partly |
| catalogue | `library/blocks/**`, `tools/build-catalog.mjs` |  | republish the catalogue | `node tools/build-catalog.mjs` |  | CI (catalogue) |
| examples | `tools/examples/**`, `src/app/core/site-spec.ts`, `src/app/three/**` | `tools/examples/data/**` | rebuild the example bandos (they place catalogue blocks) | `npm run examples` | catalogue | CI (generated examples must match) |
| panels | `src/app/ui/panel-defs.ts`, `src/app/ui/panels/**` |  | a new or renamed panel gets its Views entry, its guide step (core/tour.ts) and its line in the README |  |  | nothing |
| docs | `src/app/ui/**`, `src/app/three/**`, `src/app/core/**`, `src/app/services/**` |  | a new or changed feature updates the README (what the app does) and the area's notes in docs/agents/areas.md |  |  | nothing (BACKLOG-RULES, Documentation consistency) |
| impact-page | `.harness.json` |  | regenerate the impact map page | `node tools/impact-map.mjs` |  | CI (impact map page matches the rows) |
| coverage | `src/app/**/*.ts` |  | when coverage changes on purpose (code removed, tests added), refresh the coverage table and its baseline | `npm run coverage` |  | CI (warns when a folder drops more than 2 points) |

## Content dependencies

What each output is made of, besides code: change one of these and the output is out of date.

| Output | Made of | Redo with |
|---|---|---|
| re-record the guide clips whose step shows what changed (a browser workflow, not done by CI) | `library/bandos/chiari-e-forti.json`, `library/bandos/villetta-no-place.json`, `public/guide-demo/**` | `npm run clips` |
| re-record the three Welcome films (build and share film Chiari e Forti, fly plays the showcase flight) | `library/bandos/chiari-e-forti.json`, `library/bandos/villetta-no-place.json`, `public/guide-demo/**` | `npm run films` |
| rebuild the example bandos (they place catalogue blocks) | `tools/examples/data/**` | `npm run examples` |

## Value couplings

A value that lives in more than one place: change it in one, change it in all. Best kept by one shared source, else by a test.

| Value | Where | Kept equal by |
|---|---|---|
| Welcome film length (8 s) | `e2e/welcome-films.record.ts` (cut(…, 8))<br>`e2e/showcase.e2e.ts` (films progress > 7.5 s)<br>`src/app/services/tour.service.ts` (each film fitted to its third of MASCOT_DURATION) | the showcase test (films play to their end within the mascot loop) |
| Demo flight offset (DEMO_OFFSET) | `src/app/services/tour.service.ts` (DEMO_OFFSET)<br>`public/guide-demo/**` (the demo flight and video)<br>`e2e/showcase.e2e.ts` (-0.69 ± 0.15) | the showcase test (a real Auto-sync scan finds the same offset) |
| Theme tokens | `src/styles.scss` (--tokens)<br>`design-system/tokens.json` | check:contrast (token catalogue matches CSS) |
| Fence materials | `src/app/core/fences.ts` (FenceMaterial, FENCES)<br>`src/app/core/site-spec.ts` (WallSpec.material)<br>`src/app/ui/studio/bando-editor.ts` (FENCE_ICON) | TypeScript for FENCE_ICON only; nothing for WallSpec.material (F-036) |
| Roof kinds | `src/app/core/site-spec.ts` (LevelSpec.roof)<br>`src/app/core/ai-commands.ts` (AiCommand.roof, normalizeCommands)<br>`src/app/core/ai-prompt.ts` (AI_SCHEMA roof enum, SYSTEM_PROMPT)<br>`src/app/ui/studio/bando-editor.html` (Roof → shape options) | ai-commands.spec.ts, partly; nothing for the editor menu (F-037) |
| Structure kinds | `src/app/core/site-spec.ts` (StructureKind)<br>`src/app/three/structures.ts` (STRUCTURE_DEFAULTS, RECT_KINDS)<br>`src/app/ui/studio/bando-editor.ts` (structKinds)<br>`src/app/core/ai-commands.ts` (STRUCTURE_KINDS) | AGENTS (Adding things) and structures.spec.ts, partly |

## Outside the repository

What can change an output with no commit here, and how we would notice.

| What | Affects | Noticed by |
|---|---|---|
| Library upgrades (three.js, Angular, Playwright; package-lock.json) | rendering, the UI, the recordings, browser-test timing | the impact row "lockfile"; the e2e jobs; the audit |
| The CI browser and machine (Playwright browsers, software WebGL on the runner) | browser-test timing and what the tests see | CI failures and retries (ci:status); the audit |
| OpenStreetMap / Overpass | new bandos generated from the map (the examples use stored data) | pilots' reports; generation errors in the app |
| Terrain tiles (AWS Terrarium) | the real ground of new bandos | generation errors; the audit |
| Nominatim (place search) | the New bando search | the app's toast (no location / unreachable) |
| Satellite imagery (Esri) | the satellite ground and map | looking at it; the audit |
| AI models (the assistant) | what the AI assistant does with a request | ai-commands tests use fixed replies; the audit |
| GitHub (Actions, Pages) | CI and the live site | failed runs and deploys |
