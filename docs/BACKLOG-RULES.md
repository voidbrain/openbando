# Backlog maintenance rules

This is the authoritative update and review procedure for [OpenBando backlog](BACKLOG.md). AGENTS and README link here; keep procedural changes here rather than adding competing instructions elsewhere. The backlog's lifecycle table is the status quick reference. Archived working plans and audits preserve dated evidence, not current state.

## When to update and review

- Every code, documentation or asset change and every PR updates the affected bug/feature records. Add a stable ID if needed; maintenance-only changes belong in Other changes. Do not create a new product ID for each follow-up PR.
- At PR creation, add its actual link and distinguish implementation, investigation, partial fix and verification. Replace temporary PR placeholders once the PR exists.
- After a PR merges, when CI/verification finishes, when the user supplies acceptance or a new failure, and at the start of work on a related item, reconcile the affected records using the procedure below.
- When asked for backlog status or an audit, review every active record. During ordinary work, review related items and any contradictions encountered; a row's age alone is never evidence that it is fixed, abandoned or invalid.
- These are event-driven agent instructions, not a scheduled background process. Do not claim continuous monitoring or automatic CI updates without an actual automation.

## Review procedure

1. Read current main and preserve the user's edits. Identify every item affected by the PR/change, including shared dependencies and maintenance records.
2. Check the actual PR target, merged state, commit and CI jobs (`npm run ci:status -- <PR numbers>` lists each job, failed and retried tests, and PRs not based on main). Read failures or selected test results when needed. A merge is not verification; a green workflow only establishes checks it actually ran. Skipped jobs, mocked devices and captured screenshots do not establish the behavior they did not test.
3. Compare acceptance requirements, status, next action and verification evidence. Remove obsolete present-tense pending claims after their checks pass; move relevant earlier failures to PR / evidence as labelled history. Record unresolved checks explicitly. If a requirement is ambiguous, investigate rather than invent acceptance or claim closure.
4. Choose the supported state using the lifecycle legend. Implemented means required checks remain. Verified requires all recorded acceptance checks to pass with dated evidence. When no action remains, record the resolution and close/archive; agents need no extra permission unless the item explicitly requires human acceptance. Failed checks return the item to Open/Investigate as appropriate; record a named blocker only when it actually prevents the next action.
5. Reassess Human action required and blockers. Yes means the next action depends on explicit human acceptance, a human decision (choosing an option or a scope), private session evidence or real devices. When an agent asks the user to decide before continuing an item, set that item's cue to Yes in the same change, naming the decision; set it back once answered. No means an agent can advance the next step, not that the item is done. Do not require a human for ordinary coding or automated/browser checks. A blocked row states the missing input/dependency and the condition for resuming.
6. Update PR/evidence, verification, next action and Reviewed together. Check related rows for contradictions, such as a passed check still described as pending, a Verified item awaiting a required human check, or a completed maintenance change left yellow indefinitely.
7. Validate table structure, markers, links and dates before publishing. Add the actual follow-up PR link, and reconcile again when its checks finish or it merges.

Staleness prompts review, not a status change by itself. During a full review, flag unresolved dependencies, outdated PR placeholders, missing next actions, old pending claims and long-held Verified records. Keep the last honest evidence date if no new check ran; Reviewed may advance only after actually reviewing the row. Do not reset Opened or fabricate implementation/verification dates to make a record look current.

## Record and evidence requirements

- Keep IDs stable and in ID order within each section; never reuse an ID. Opened is the first known date that ID entered the ledger, not a guessed original-report date. Preserve it through reopening. Existing audited IDs began on 27 October 2026; later IDs keep their actual dates.
- Each item records a reproducible trigger/request, scope, next action and closure requirements. Active records use a compact five-column summary (Signal, ID, Priority, Status, Item), then full-width **→ Human action required** first and **Next action / closure evidence** second. PR / evidence, Opened, Verification and Reviewed remain in a two-column Field/Value table inside expandable details. This keeps the next action readable without horizontal scrolling; never move it back into the wide metadata table. Priority measures impact: P1 data integrity/reliable CI/core simulator behavior; P2 important workflows/visual defects; P3 enhancements/narrower review.
- PR / evidence identifies actual changes or checks with links and labels. Use `—` if no PR is known. Link latest relevant evidence without discarding important historical context.
- Verification records date, method, result and evidence separately from Reviewed. Methods: Human, Unit/integration, Browser/accessibility, Real-device and Documentation. Use Pending where applicable; different checks may have different dates. Verification states the current result: one entry per method, the latest check of it. Earlier results (a failure since fixed, a superseded pass) belong in PR / evidence, labelled with their PR or run, so the cell never reads “Pending; … passed” for the same check. A unit test does not prove visual/field behavior, and an overall CI result does not replace checking which jobs ran.
- Reviewed is when status/evidence were actually reconciled, not an inferred merge date. Preserve existing dated history; do not invent dates.
- **→ Human action required** is a visible paragraph immediately before Next action in every active bug/feature record: `🧑 **Yes**<br />One short sentence naming the human action.` or `💻 **No**<br />One short sentence naming the agent's next action.` Reassess whenever the next step changes. One manual review can cover related IDs; reference the shared item instead of implying separate approvals.

## Visual cues and table integrity

| Cue | Rule |
|---|---|
| First-column status | 🔴 Open · 🟠 Investigate · 🟡 Implemented · 🟢 Verified · 🟣 Blocked · 🔵 Closed; match the written Status. |
| Active priority | 🔺 P1 · 🔶 P2 · 🔹 P3; keep its written label and value. |
| Closed or Blocked priority | ◻️ P1 / ◻️ P2 / ◻️ P3; only the marker changes. Verified priorities retain colour until Closed. |
| Reopened or unblocked | Restore the colour for the retained priority; preserve ID, Opened and previous evidence. |

Colour never replaces status text, priority labels or evidence. Table rows must be contiguous: a blank line terminates a Markdown table. Every table row needs its own header's number of cells: five for active summary rows, two for metadata, and the original width in historical archives. Escape literal pipes inside cells. Use `<br />` for an in-cell line break. Keep a blank line before a table and after its last row. Validate all affected rows, not just the added row, and check local links and status/priority consistency. For documentation-only changes these structural checks and a deliberate review are sufficient; do not invent application test coverage.

## Closure and archives

Close fixes after their recorded criteria pass and no action remains; Verified is a transition, not a permanent holding pen. Human/device acceptance is required only where specified. Cancelled, duplicate or superseded items can close without a verified implementation when the reason and replacement link, if any, are explicit. Do not close a reported bug simply because one attempt could not reproduce it without recording the investigation and remaining uncertainty.

Move closed records, including completed maintenance-only changes, into a dated archive linked from the active ledger. Preserve each complete record (visible actions plus metadata) when archiving the new layout; historical archives keep their original table formats. Retain original ID/priority, PR history, evidence, resolution and closure date. Preserve the bug/feature human-action field when archiving newer records; older archives need not invent missing historical fields. Historical Closed records keep their closure cues if an item is later reopened; the active record describes the new work and links its prior history.

Closing a documentation audit or recording change does not close a product/media feature whose checks remain pending. Put that pending work on its own active item rather than keeping the completed maintenance entry yellow indefinitely.

## Documentation consistency

README summarizes capabilities; AGENTS directs repository work, with per-area rules in [docs/agents/areas.md](agents/areas.md); this file owns backlog maintenance procedure; BACKLOG holds current records and the quick lifecycle legend. Design-system guides own application UI conventions and explicitly scoped component exceptions; mascot/wordmark guides own art requirements. User instructions take precedence. Dated archives, audits and draft articles preserve context and do not override current rules. Generated guide pages follow the tour/generator source; regenerating Markdown does not regenerate clips.

When changing shared rules, reconcile linked summaries and component exceptions in the same PR. Scope the app no-emoji rule to application UI: repository backlog markers are permitted. Scope red navigation/selection exceptions explicitly; do not generalize them into new UI colours. Keep historical evidence dated rather than rewriting it as current verification.

For **every modification**, including a backlog-only edit, check README, AGENTS and its area notes, BACKLOG, BACKLOG-RULES, design-system/component guides and applicable mascot/style guides for affected claims, rules, links and exceptions. Update every affected document in the same PR; do not edit an unaffected file merely to mark it reviewed. Preserve user changes. State the consistency check and any outstanding discrepancy in the PR validation notes. A backlog state/evidence change can require README or guide corrections even when application code did not change.

On every change or review, actively reassess whether each affected bug/feature status, next action, human dependency, blocker, verification result/date and PR evidence can advance. When the next action is authorized and feasible, perform it; do not merely rewrite an “Agent can…” reminder or stop at a review. Continue agent-owned checks/implementation and close items whose criteria pass. Pause only for an actual dependency or missing required human evidence, record it explicitly, and continue independent authorized work. Never advance a state without the required evidence.

For the active record layout, also validate one summary per stable ID, exactly one visible arrow-prefixed Human action paragraph before its Next action paragraph per item, and a complete metadata table with PR/evidence, Opened, Verification and Reviewed. Keep expandable details balanced. Reformatting must preserve content, dates and evidence; it is not verification of the product.

Run `npm run check:backlog` after every ledger edit. CI validates active summary widths, visible next/human actions, metadata fields, date formats, unique IDs, status/priority cues and balanced details. Historical archives remain outside this active-layout schema.

Human-action cues identify the next actor: 🧑 Yes requires a human; 💻 No is agent-owned and does not mean complete. Keep the written Yes/No and recap; do not infer status or priority from this cue. Validate cue/value agreement. Historical archives retain their original cues.

The arrow belongs before the field label: `**→ Human action required:** 🧑 **Yes**<br />Recap` (or 💻 No). Keep this field above Next action; the validator enforces the prefix and order. Historical archive layouts remain unchanged.
