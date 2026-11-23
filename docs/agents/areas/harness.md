# Harness capabilities and reconciliation

Area notes for OpenBando ([index](../areas.md)). Read before you change this area; the rules and lessons here are as binding as AGENTS.md.

- `.harness.json` owns OpenBando’s template version, copied/adapted provenance, impact rows and optional integration selections. Copy helpers byte-for-byte from the published tag; generic fixes belong upstream.
- Capability assessment reads actual project code/tooling first. GitHub connector access can replace unavailable `gh` for evidence reads; name the actual source. Existing Playwright CI remains the browser acceptance path; a tool listing is not proof of a browser connection.
- MCP recommendations: `tools/mcp.mjs` and its catalogue are copied. Validate metadata with `npm run check:integrations`; recommendations/configuration are optional and never imply installation or connectivity. See [MCP guidance](../mcp.md).
- Solution context: no role is selected here. Consult [solution guidance](../solution-profile.md) only for actual coordination work; components retain their own acceptance and missing optional coordinator access does not block independent work.
- Shared skills: the canonical apply-harness skill stays in the template at the reviewed tag; follow [skills guidance](../skills.md) before client registration or adding another skill. No personal installations were changed.

- Maintenance: the shared [guide](../maintenance.md) owns timing, local measurement privacy, input-bound receipts and rule consolidation. Copy helpers from the published tag; metadata/hash checks do not prove semantic review. Daily CI only reports; no unattended repair loop or extra installed service.
- Audits: the shared [procedure](../audit.md) owns required areas, dated report/manifest and findings classification. Preserve old reports; declare a scoped reconciliation honestly. The 31 October full product baseline is recorded separately from harness adoption; it is not a condition on the reusable harness release or proof that product bugs are fixed.
- Quality: OpenBando keeps aggregate coverage warning-only. Prefer meaningful regression/interaction tests and existing strict types, translations, contrast, browser and security checks. Changing enforcement/tolerance is an explicit policy decision, not part of routine baseline refresh.

### Full audit corrections (31 October 2026)

- Camera constraints use `SiteCollider.cameraGroundAt`: terrain and underground floors, never building floors or roofs. Aircraft `groundAt` retains standing surfaces. Keep both main and Studio camera callbacks on the camera sampler (B-044).
- A newly selected video/log pair restores only its own finite saved offset; otherwise reset offset to zero, synced state, diagnostics and seek state. Do not reuse the previous pair’s sync (B-047). This does not establish a fix for the paused stale-frame report B-045.
- Legacy library sources are recovery data: remove a source/index entry only after its replacement commits in IndexedDB or localStorage. Memory-only success is not durable success. Error followed by abort counts as one failed write; corrupt legacy entries remain recoverable (B-048).
- Arming a path pin cancels an unfinished Adjust position preview with `endAdjust(false)`; starting Adjust position cancels pins. Preserve the original start/end transport-position requirements (B-041).

### Moved from AGENTS.md (2026-11-24, harness 10.5.0 reconcile)

- CI prints ordinary freshness reminders as warnings; required maintenance evidence and invalid audit metadata fail. OpenBando enables seven-day overdue-area enforcement after its 31 October full product baseline review; a blocked area does not count as checked.
- Audits also cover the guides and their clips, the design system and accessibility, images' GPS metadata, and the outputs' outside dependencies listed under `outside` in `.harness.json`.
