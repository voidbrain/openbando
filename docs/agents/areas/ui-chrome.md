# UI chrome and contrast

Area notes for OpenBando ([index](../areas.md)). Read before you change this area; the rules and lessons here are as binding as AGENTS.md.

The design system owns UI rules ([design-system/README.md](../../../design-system/README.md)); these are the implementation and test lessons.

- Chrome theme: use shared indigo/purple surface tokens for panels, fields, menus and buttons. Keep the existing lime accent/ink pair and all semantic, telemetry, tool and pilot palettes unchanged. Art and model materials are separate from UI chrome.
- Shared control rules must pair fill and foreground in every state: enabled `.btn` hover uses `control-hover` + `text`, lime-filled states use `accent` + `accent-ink`. Contrast checks must exercise rendered control states, including ordinary, primary, active and icon button hover. Palette-pair calculations and axe on an unhovered page do not establish hover contrast.
- Contrast rules apply to all text and controls, not only buttons. Pair foreground/background tokens in every state; use page-wide axe plus representative hover/focus checks in `e2e/contrast.ts`, and run `check:contrast`. Do not treat palette calculations or idle-page axe as proof of all interaction states.
- Contrast probes reuse one in-page axe engine and discover style representatives in a single DOM pass; keep full-page accessibility checks separate. Do not inflate browser budgets or drop contrast thresholds to hide slow test orchestration. Showcase examples are temporary; continuation tests must create their own saved bando fixture.
- UI contrast fixtures use a small real model to avoid unrelated software-rendering load. Running-guide probes target the caption; static Views/Guide and editor cases cover their own controls. Label each hover/focus probe and bound actionability waits so occluded controls fail diagnostically.
