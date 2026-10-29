# FlyChecklist

The guided Fly checklist (F-018): a `Panel` in the Tools group of Views, opened beside the replay workspace by a saved bando's Fly button.

## Use

- A three-way `SegmentedControl` at the top chooses the route: Replay, Simulator, Live. The selected segment fills with `accent` and `accent-ink` at 700; the others are `dim` and take `control-hover` with `text` on hover.
- Below, an ordered list of steps as bordered rows (`line`, `radius-control`). Each row starts with a short `dim` state word: done (in `accent`), skipped, not now, next. The current step has an `accent` border, `aria-current="step"`, its hint in `dim`, its one primary action and Skip when the step allows it. A step that cannot be done yet shows why ("Needs both the log and the video.") instead of its hint.
- Steps are ticked from what the app shows (a loaded log, a video, a sync, an open simulator, a connected link): the list resumes by itself, and the route and skipped steps are remembered locally. Back reopens the last skipped step; Cancel closes the panel and keeps loaded files and edits.
- Nothing in the checklist arms the simulator or connects the live link: the arm step has no button, and Live link connects only from its own panel.

## Voice

Step titles are short imperatives ("Load the flight log", "Arm and fly"); hints say what happens and, for a skippable step, when to skip it.

Source: `src/app/ui/panels/fly-panel.ts` (steps: `src/app/core/fly-guide.ts`).
