# Working plan

Current bug status is tracked here; implementation rules live in [AGENTS.md](../../AGENTS.md), usage in [README.md](../../README.md).

## Verification — 26 October 2026

- **Bug 4 — partial:** portal/hill tests cover two openings and an intact hill crest. Fixed the CI regression where terrain exactly at a basement ceiling was left uncut (`cutMask`); the existing scene/collider test stays enabled. Visual confirmation against `docs/working-plan/bugs/bug1.jpg` is still required. General basement access and void usability remain bug 3.
- **Bug 5 — implemented, visual check pending:** `cleanHeights` applies median → centred mean → rate limiting to CSV barometer heights; the jittery-descent regression checks for no flat treads. Load `public/guide-demo/flight.csv` with its video and inspect the descent before closing it. Basement notes belong to bug 3, not this flight-path bug.
- **Bug 6 — partial:** `levelRoads` samples the untouched terrain for all roads and has a crossing regression test. Class priority and flicker are not fully solved: road strips still share the same height offset, terrain roads use depth testing, and no class sorting is applied. Check crossing roads/tracks/paths on slopes in both insertion orders before closing it.
- **CI failure:** run `40339576161` failed only the basement cut assertion (412 other tests passed). The fix includes ceiling equality; terrain strictly above the ceiling remains intact. No tests are skipped.

## Bugs

| # | Issue | Details | Priority | Status |
|---|---|---|---|---|
| 1 | Welcome tour | Stop the tour and open the welcome panel. | High | TBC |
| 2 | Root page | Opening the root URL should open the welcome panel. | High | TBC |
| 3 | Gallery / holes / underbasements | Fix incorrect, impractical, or poorly designed holes and underground spaces. | High | Open |
| 4 | Holes and hills | When a tunnel intersects terrain like a hill... (see bug image 1) | High | Partial — see verification above |
| 5 | Flight descent | Example Blackbox CSV descent appears as steps rather than a slope. Smoothing is implemented; compare the rendered path with the video. | High | Implemented — visual check pending |
| 6 | Overlapping roads | Two roads drawn over each other ... zig-zag trough ... (see bug image 2) | High | Partial — see verification above |

## Bando Villetta — Specs

| # | Element | Measurement / specification | Notes | Status |
|---|---|---|---|---|
| 1 | Main store facade doors | 4.64 m | Approximate iPhone measurement | To verify |
| 2 | Main store facade windows | 2.69 m | Height of the closed bottom section | To verify |
| 3 | Greenhouse | 4.61 m | Distance between long sides; elliptical structure | To verify |
| 4 | Annex house columns | 3.43 m | Distance between columns | To verify |
| 5 | Annex perimeter walkway | 3.11 m | Columns to walls on S, N, and probably W sides; creates a walkable path around the large internal void on floor 1 | To verify |
| 6 | Annex, first-floor basement | 6.20 m | Exact reference points to be confirmed | To verify |
| 7 | Greenhouse height | 9.30 m | Elliptical; retain "greenhouse" as the working name | To verify |
| 8 | Main store rounded upper sections | 8.00 m | Height above the indoor floor; four rounded sections | To verify |
| 9 | Blue stair → blue ladder | Starts at 2.00 m | Open skeletal cylindrical structure | To verify |
| 10 | Central columns | 1.00 m | Distance between the two central rows of columns | To verify |

**Measurement disclaimer:** iPhone measurements may be inaccurate. Apply reasonable tolerances and verify against photos or more reliable measurements before finalizing the geometry.

## Next Steps

| # | Task | Details | Priority | Status |
|---|---|---|---|---|
| 1 | Fix welcome flow | Correct welcome tour termination and root-page behavior. | High | TBC |
| 2 | Redesign holes and underground areas | Review gallery, holes, underbasements, hills, geometry, and walkability. | High | TBC |
| 3 | Verify flight descent | Compare the example CSV path with the video (bug 5). | High | Pending |
| 4 | Finish road overlaps | Add road-class priority and remove overlap flicker; verify slopes in both drawing orders (bug 6). | High | Open |
| 5 | Validate Bando Villetta dimensions | Compare measurements with photos and establish tolerances. | High | Pending |
| 6 | Implement Bando geometry | Apply verified measurements to the 3D model. | Medium | Pending |
| 7 | Multipath racing mode | Plan and implement racing across multiple paths. | Future | Planned |
| 8 | Upload support | 1 device version: Enable uploading of multiple paths; should be distincted so maybe ditch color as speed and use one foreach. "Closed loops" flag enable loop counting / best lap | Future | Planned |
| 9 | Multiuser racing mode | Enable uploading of multiple paths from different devices on shared bando; should, should see others as ghosts | Future | Planned |
| 10 | Multiuser live racing mode | Enable multiple paths from different devices on shared bando using live multiple stream links; (example 3 squirrelcast broadcast on diff urls. ) | Future | Planned |
| 11 | Mascotte | Complete mascotte animated gif and update title: title should be big block wall of text as popular today. Mascotte (use the pixel guy in mascotte images folder, radio remove antenna, please note in animation radio must be facing guy, not ground). Mascotte should: - look around (left right)<br>  - run right (on place while drone at ground shifting left)<br>  - low,drone at ground - sit, drone at ground<br>  - drone up<br>  - jump winning pose<br>  - drone flies away right.<br> repeat. | Future | Planned |

## Visual references

- `bugs/bug1.jpg`: holes, terrain, basement and tunnel edges (bugs 3–4).
- `bugs/bug2.jpg`: overlapping roads, class priority and flicker (bug 6).
