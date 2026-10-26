# Working plan

Current bug status is tracked here; implementation rules live in [AGENTS.md](../../AGENTS.md), usage in [README.md](../../README.md).

## Verification — 26 October 2026

- **Bug 4 — partial:** portal/hill tests cover two openings and an intact hill crest. Fixed the CI regression where terrain exactly at a basement ceiling was left uncut (`cutMask`); the existing scene/collider test stays enabled. Visual confirmation against `docs/working-plan/bugs/bug1.jpg` is still required. General basement access and void usability remain bug 3.
- **Bug 5 — implemented, visual check pending:** `cleanHeights` applies median → centred mean → rate limiting to CSV barometer heights; the jittery-descent regression checks for no flat treads. Load `public/guide-demo/flight.csv` with its video and inspect the descent before closing it. Basement notes belong to bug 3, not this flight-path bug.
- **Bug 6 — implemented:** terrain vertices are levelled once from the original grid; higher road classes own overlapping strips. Draw order is railway > road > track > path, with stable same-class ties independent of insertion order. Road decals do not write depth, so one cannot flicker against another; terrain depth testing stays on so hills/buildings occlude them. Meshes sample ground across their full width instead of using only the centre height. Regression tests cover reversed order, crossing heights, priorities and full-width draping on flat/hilly sites. Browser visual confirmation remains pending (no local Chromium available).
- **CI failure:** run `40339576161` failed only the basement cut assertion (412 other tests passed). The fix includes ceiling equality; terrain strictly above the ceiling remains intact. No tests are skipped.

- **Browser CI follow-up:** PR #69 skips the e2e job under the current `inputs.e2e != false` guard. Explicitly include pull-request events in that condition before claiming browser tests run on every PR. No browser verification was performed in this review.

## Bugs

| # | Issue | Details | Priority | Status |
|---|---|---|---|---|
| 1 | Welcome tour | Stop the tour and open the welcome panel. | High | TBC |
| 2 | Root page | Opening the root URL should open the welcome panel. | High | TBC |
| 3 | Gallery / holes / underbasements | Fix incorrect, impractical, or poorly designed holes and underground spaces. | High | Open |
| 4 | Holes and hills | When a tunnel intersects terrain like a hill... (see bug image 1) | High | Partial — see verification above |
| 5 | Flight descent | Example Blackbox CSV descent appears as steps rather than a slope. Smoothing is implemented; compare the rendered path with the video. | High | Implemented — visual check pending |
| 6 | Overlapping roads | Two roads drawn over each other ... zig-zag trough ... (see bug image 2) | High | Implemented — visual check pending |

## Bando Villetta — Specs

Measurements applied to `library/bandos/villetta-no-place.json` (release 3). Original footprint positions, dimensions and rotations remain; no geographic location is published. iPhone measurements are approximate, not survey-grade.

| # | Element | Applied measurement | Interpretation / evidence | Status |
|---|---|---|---|---|
| 1 | Main store facade doors | 4.64 m width | Width confirmed by the pilot; existing heights and bay centres retained. | Applied |
| 2 | Main store facade windows | 2.69 m sill | Closed lower panel height; keep the existing opening tops. | Applied |
| 3 | Greenhouse ribs | 4.61 m pitch | Confirmed as rib spacing along the long sides, not full building width. Last bay is shorter to keep both end frames. | Applied |
| 4 | Annex house columns | 3.43 m centres | Perimeter rows; a shorter terminal bay fits the retained footprint. | Applied |
| 5 | Annex perimeter walkway | 3.11 m | First-floor central void leaves a walkable ring. S/N/W measured; equal east return is a modelling assumption. | Applied; east to verify |
| 6 | Annex first-floor slab underside | 6.20 m | Interpretation confirmed by pilot. Existing 0.20 m slab is centred at 6.30 m, walking surface 6.40 m. | Applied |
| 7 | Multipath racing mode | Separate race clock, per-pilot names/colours/offsets, simultaneous 3D ghosts and shared start gate. | Medium | Implemented — field/browser verification pending |
| 8 | Upload support | Existing multi-file log upload reused; closed-loop lap/best-lap estimates, local-coordinate race package export/import. | Medium | Implemented — field/browser verification pending |
| 9 | Multiuser racing mode | Server-free race-file exchange plus optional self-hosted HTTP/SSE room relay; same exported bando/model scale required. | Medium | Implemented — relay deployment and device verification pending |
| 10 | Multiuser live racing mode | Multiple independent WS/SSE GPS sources, stale detection and retained recordings; opt-in room broadcast at ~1 Hz. SquirrelCast video URLs alone are not telemetry. | Medium | Implemented — real stream/device verification pending |

### Photo interpretation and remaining uncertainty

- `bando-img/IMG_4341.JPG`: broad half-ellipse steel greenhouse frame. Bare ribs remain intact; the artificial torn-glass deformation is only used on glazed frames.
- `bando-img/IMG_4344.JPG`: tall annex colonnade and pitched terracotta roof. Replace the old barrel roof with a shallow gable; retain the upper storey's 3.60 m height and 2 m roof rise because no new dimensions establish them.
- `bando-img/IMG_4352.DNG`: store interior, lower façade panels and the open blue ladder cage. Use the real ring/rail silhouette, not a solid tube or box hood.
- Annex ground-floor support walls are inset behind the S/N/W colonnade; east remains open for access. Exact internal wall ends, roof pitch, column thicknesses and the east walkway require further measurements. The retained rectangular outer footprint is not claimed to be a full measured reconstruction.
- Fresh copies get this release; existing edited copies are not overwritten. Playground is regenerated at release 2 because it also places the upgraded shared ladder.

## Next Steps

| # | Task | Details | Priority | Status |
|---|---|---|---|---|
| 1 | Fix welcome flow | Correct welcome tour termination and root-page behavior. | High | TBC |
| 2 | Redesign holes and underground areas | Review gallery, holes, underbasements, hills, geometry, and walkability. | High | TBC |
| 3 | Verify flight descent | Compare the example CSV path with the video (bug 5). | High | Pending |
| 4 | Finish road overlaps | Add road-class priority and remove overlap flicker; verify slopes in both drawing orders (bug 6). | High | Implemented — visual check pending |
| 5 | Validate Bando Villetta dimensions | Measurements applied with explicit photo interpretations above; check unmeasured east return, roof pitch and interior wall ends. | High | Further survey pending |
| 6 | Implement Bando geometry | Survey refinement applied; compare a fresh release-3 copy with flight video and the reference photos. | Medium | Implemented — visual check pending |
| 7 | Multipath racing mode | Separate race clock, per-pilot names/colours/offsets, simultaneous 3D ghosts and shared start gate. | Medium | Implemented — field/browser verification pending |
| 8 | Upload support | Existing multi-file log upload reused; closed-loop lap/best-lap estimates, local-coordinate race package export/import. | Medium | Implemented — field/browser verification pending |
| 9 | Multiuser racing mode | Server-free race-file exchange plus optional self-hosted HTTP/SSE room relay; same exported bando/model scale required. | Medium | Implemented — relay deployment and device verification pending |
| 10 | Multiuser live racing mode | Multiple independent WS/SSE GPS sources, stale detection and retained recordings; opt-in room broadcast at ~1 Hz. SquirrelCast video URLs alone are not telemetry. | Medium | Implemented — real stream/device verification pending |
| 11 | Mascotte | Pixel pilot/drone, 16 keyframe PNGs, 16-second GIF, Welcome animation and stacked title. Character/equipment rules and extension workflow: [character bible](../mascot/README.md). | Future | Implemented — visual review pending |

## Visual references

- `bugs/bug1.jpg`: holes, terrain, basement and tunnel edges (bugs 3–4).
- `bugs/bug2.jpg`: overlapping roads, class priority and flicker (bug 6).

## Racing verification and remaining field work

See [racing setup and server decision](../racing/README.md). No server is needed for local multipath comparison, exported race-file exchange, or several directly reachable GPS streams. Different devices exchanging tracks over the network use the optional in-memory relay; no service has been deployed automatically.

Before declaring field-ready: open the same exported hidden bando on two devices, align separate pilots, compare offsets/lap estimates with a known clock, connect two real GPS/SquirrelCast-associated telemetry bridges, stop one feed and verify stale hiding, test relay disconnect/rejoin and GPS loss, and inspect crowded ghost paths in every camera. Shared sessions are for trusted token holders, not public ranked races. The selected-flight/video and simulator flows still require a manual regression check. Local Chromium installation failed with a truncated download; the focused race-browser PR check is the browser verification path.
