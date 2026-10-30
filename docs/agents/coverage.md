<!-- Written by tools/coverage-table.mjs from the coverage summary: run the tests with coverage, then the script. -->

# Code coverage

How much of the code the unit tests run, per folder. It says what ran, not that the behaviour is checked; branches say the most. A table to find untested parts, never a number to hit: CI warns when a folder drops, it does not fail.

| Folder | Files | Lines | Statements | Branches | Functions |
|---|---|---|---|---|---|
| `src/app/core/` | 74 | 93.9 % | 90.9 % | 82.0 % | 90.0 % |
| `src/app/three/` | 21 | 69.6 % | 70.4 % | 60.2 % | 68.4 % |
| `src/app/services/` | 33 | 39.8 % | 38.7 % | 33.9 % | 40.1 % |
| `src/app/state/` | 7 | 90.3 % | 84.2 % | 73.7 % | 81.2 % |
| `src/app/ui/` | 49 | 0.8 % | 0.8 % | 0.7 % | 0.7 % |
| **all** | 189 | 54.0 % | 54.1 % | 48.2 % | 50.6 % |

## Files no unit test runs

- `src/app/three/`: `orbit-controls.ts`, `site-view.ts`
- `src/app/services/`: `backup.service.ts`, `example-bandos.service.ts`, `export.service.ts`, `live-link.service.ts`, `log-parse.worker.ts`, `race-links.service.ts`, `shortcuts.service.ts`
- `src/app/ui/`: `dom.ts`, `float-box.ts`, `mascot.ts`, `stacking.ts`, `toast-host.ts`, `tour-overlay.ts`, `version-badge.ts`, `panel/canvas-widget.ts`, `panel/panel.ts`, `panels/attitude-panel.ts`, `panels/blackbox-panel.ts`, `panels/compass-panel.ts`, `panels/features-panel.ts`, `panels/flights-panel.ts`, `panels/fly-panel.ts`, `panels/guide-panel.ts`, `panels/help-panel.ts`, `panels/live-panel.ts`, `panels/path-panel.ts`, `panels/racing-controls.ts`, `panels/radio-panel.ts`, `panels/render-panel.ts`, `panels/simulator-panel.ts`, `panels/speed-panel.ts`, `panels/timeline-panel.ts` and 21 more
