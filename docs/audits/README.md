# Audits

Follow the authoritative [audit procedure](../agents/audit.md). Each new audit produces a dated Markdown report and a matching .audit.json manifest declaring full/scoped coverage, actual baseline, area results, evidence and limits. Published reports remain immutable; corrections are dated addenda.

Full audits cover code, logic, tests, documentation, harness, security, delivery and backlog. Scoped reports refresh only their declared areas; blocked reviews do not count as completed. A recent narrow review cannot make the whole repository freshly audited. Historical narrative-only reports remain dated evidence but unclassified until an explicit evidence-backed manifest maps their actual scope.

Run check:audits and session freshness. The default review interval is 7 days; invalid manifests fail, due areas warn unless audit.enforce is enabled after a valid baseline exists. Maintenance review receipts are separate and never substitute for product audits. Record actionable findings on the owning backlog, with report-only context and unaccepted proposals clearly identified.

Latest full baseline: [31 October 2026 — OpenBando](2026-10-31-full-openbando.md), main `3f7b844` plus explicitly listed fixes. The manifest establishes eight reviewed areas; outstanding product acceptance remains in the backlog.
