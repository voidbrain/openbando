# Browser (e2e) tests

Read before you write or change a Playwright test (AGENTS.md, procedures table). Moved from AGENTS.md in the v10.5.0 reconcile.

- `npm run e2e` (Playwright, also a CI job): every guide step plays alone in a headless browser without errors, and the first visit, the editor with the library and a running guide step pass axe (WCAG 2.1 A / AA). Locate panels by `app-panel[data-id=…]` or by role: component hosts have no box of their own. Software WebGL is slow there: keep the long timeouts.
- Tests that encoded the old demo site now set their site up explicitly (origin, take-off pad).
- Playwright covers selected UI and pointer workflows, not every one: keep logic in `core/` and unit-test it there.
