# OpenBando backlog

Current work ledger, reviewed 27 October 2026 against `main` at `45d9475`. The [audit](audits/2026-10-27.md) records the scope and evidence; the [archived working plan](working-plan/working-plan-2026-10-27.md) preserves earlier requirements, survey measurements and decisions. IDs are stable: do not reuse them.

## How to use this file

- **Open:** reproduced problem or unimplemented capability. **Investigate:** reported but root cause or current behavior is not established. **Verify:** implementation exists but the stated check has not passed. **Blocked:** the next step needs something specified in the item. **Done:** acceptance evidence and date are recorded; move closed items to a dated archive rather than deleting their history.
- Priority is impact, not a promise of completion: **P1** affects data integrity, reliable CI or core simulator behavior; **P2** affects important workflows or reported visual defects; **P3** is an enhancement or narrower review.
- Each item needs a reproducible trigger or a clear request, the next action, and evidence before closing. Links to PRs, CI runs, images and relevant code belong in the item. Update this ledger when a PR merges or a check changes status. A passing unit test does not establish visual, field or end-to-end behavior.
- This file is suitable for a small project. When individual ownership, discussion, notifications or cross-PR automation become important, create one GitHub issue per item and keep its issue link here; do not maintain two competing descriptions of status.

## Bugs and reliability

| ID | Priority | Status | Item | Next action / closure evidence |
|---|---|---|---|---|
| B-001 | P1 | Open | [3D guide timeout](audits/2026-10-27.md#b-001--3d-guide-timeout) | Action-level failure diagnostics now identify the guide operation and phase. Use a complete PR browser run to diagnose any remaining timeout; sharding and a shorter AI prompt did not establish a fix. |
| B-002 | P1 | Verify | [Diagonal interior partitions render/collide in the wrong place](audits/2026-10-27.md#b-002--diagonal-interior-partitions) | The wall mesh, preview and segmented collider follow both endpoints; automated checks cover rotated/unrotated G and basement floors. Verify visually and in the browser before closure. |
| B-003 | P1 | Verify | [Accepted basement outline can be lost on sanitization](audits/2026-10-27.md#b-003--basement-outline-coordinate-limit) | Vertex and floor/outline edits reject coordinates that saved-file sanitization would discard. Unit checks cover limits, wing, shifted items, save/import and undo; verify the editor/import flow in browser CI. |
| B-004 | P2 | Investigate | Warehouse wall/terrain flicker | PR #100 applied depth bias to a proven coplanar junction. The [orbit report](https://github.com/voidbrain/openbando/actions/runs/40546232814/artifacts/12754055891) captures the scene, but sampled frames are too distant to determine motion flicker. Review a close moving view at multiple distances on real hardware; do not close on stills. |
| B-005 | P2 | Verify | Hill gallery road and portals | Review road/terrain junction and both tunnel ends from above, front, rear and both sides on sloped terrain; compare with [bug reference](working-plan/bugs/bug1.jpg). Road draping and cuts have automated tests, but visual confirmation is pending. |
| B-006 | P2 | Verify | Road overlaps | Check priority and flicker on slopes in both draw orders, including [reference](working-plan/bugs/bug2.jpg); automated geometry/priority coverage exists. |
| B-007 | P2 | Verify | Basement lighting and connections | Inspect shadows under G and through its opening; fly through openings to overlapping box rooms and curved tunnels. Test independently sized and rotated basements. |
| B-008 | P2 | Verify | Flight descent smoothing | Compare the demo CSV descent with its corresponding video; unit coverage does not verify the visual result. |
| B-009 | P2 | Verify | Simulator and selected-flight/video regression | Manually exercise simulator entry/exit, collision and selected-flight/video replay and synchronization after editor/racing changes. |

## Features and limitations

| ID | Priority | Status | Item | Next action / closure evidence |
|---|---|---|---|---|
| F-001 | P2 | Open | Cut/Wing for diagonal basement outlines | Implement polygon-aware union/subtraction without corrupting openings, floor items, collision or undo; currently these tools reject non-rectilinear outlines. |
| F-002 | P3 | Open | Basement perimeter holes and disconnected islands | Design a representation and editing, saving, terrain cuts, floor/wall rendering and collision for courtyards and separate pieces; currently one simple perimeter only. Floor voids are separate and already exist. |
| F-003 | P2 | Open | 3D basement vertex handles | Add accessible move/insert/remove interaction in 3D with the same validation and undo semantics as the 2D plan. |
| F-004 | P3 | Open | More flexible basement vertex edits | Support edits with disabled perimeter sides and handle affected openings and floor items explicitly; currently operations are conservatively rejected to avoid data loss. |
| F-005 | P2 | Verify | 3D indoor tools and handles | Browser-test wall, void, door, window, column and stair placement, rotated buildings, upper floors and −1; exercise move/resize handles and keyboard/accessibility. The focused browser test covers part of the −1 workflow and axe, not every tool. |
| F-006 | P3 | Verify | Studio controls and vegetation | Review compass consistency, expand/dock controls, 3D construction previews, measures and hedge/bramble brush shapes in both views. |
| F-007 | P2 | Verify | Villetta against survey and photos | Check annex walls/openings, greenhouse east frame, centre roof strip, ladder cabin, east walkway and estimated dimensions against the [archived survey](working-plan/working-plan-2026-10-27.md#bando-villetta--specs) and fresh example. Do not overwrite existing user copies. |
| F-008 | P3 | Verify | Welcome mascot and Features | Verify full animation, grounded pokes, right-facing drone/propellers, colour approval and responsive Features panel in a browser; check reduced motion. |
| F-009 | P2 | Verify | Racing on real devices | Follow the [field checklist](racing/README.md): align two devices, compare timing, connect two real GPS streams, verify stale hiding, GPS loss, relay disconnect/rejoin and crowded paths in every camera. No field-readiness claim until completed. |
| F-010 | P2 | Investigate | AI server credential persistence | Server configuration including its optional bearer token is stored in browser `localStorage` (`src/app/services/ai.service.ts`). Review whether persistence and user disclosure match the intended privacy model; do not treat browser storage as a secret vault. |
| F-011 | P3 | Open | Guide and historical documentation drift | Review generated guide clips and remaining documentation against current UI; the audit corrected identified stale claims but did not visually validate every clip. |
