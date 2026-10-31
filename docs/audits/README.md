# Audits

One file per audit, named `<YYYY-MM-DD>.md` (a suffix is allowed: `<date>-<topic>.md`). The newest file is the current audit; `npm run check:freshness` warns when it is more than 7 days old.

An audit records, for what changed since the previous one: what was checked (docs, tests, style guide, accessibility, privacy, CI), how, the result with evidence, and the backlog records it opened or updated. It is dated evidence, never rewritten later.

Audit age is a reminder, not the only trigger. Restart a pending full audit against the current baseline when intervening changes alter its scope (for example new profiles or workflow capabilities). Reuse still-valid evidence explicitly, recheck affected rules and joins, and name residual gaps; never infer exhaustive acceptance from green structural checks. No audit promises the absence of every conflict or defect.
