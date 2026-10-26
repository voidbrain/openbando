## To be completed and verified

Bug 5: example blackbox csv path when loaded shows a descent slope as steps, never happened and not visible in the video.
This was the point:

```
  it('draws a jittery descent as a slope, not a staircase', () => {
    // 2 m/s down, the barometer jittering ±1.2 m as it does in prop wash
    const t = Array.from({ length: 40 }, (_, i) => i * 0.1);
    const h = t.map((x, i) => 12 - 2 * x + [1.2, -1.1, 0.4, -1.2, 0.9, -0.3][i % 6]!);
    const c = cleanHeights(h, t);
    let flat = 0;
    for (let i = 4; i < 36; i++) if (Math.abs(c[i]! - c[i - 1]!) < 0.02) flat++;
    expect(flat).toBe(0); // no treads: every step goes down
    for (let i = 4; i < 36; i++) expect(c[i]!).toBeLessThan(c[i - 1]! + 0.05);
  });
```

```
/**
 * A barometer trace made usable: prop wash in flips throws spikes of tens of metres into it, and it jitters a metre or
 * two around any climb or descent. A running median over 7 fixes (~0.7 s at 10 Hz) drops the spikes, a centred mean
 * over 7 then turns the median's flat runs into a slope (alone, the median drew a steady descent as a staircase), and
 * no step may be faster than `maxRate` m/s.
 */
export function cleanHeights(h: readonly number[], t: readonly number[], maxRate = 25): number[] {
  // windows centred on the fix, narrower at the ends
  const around = (a: readonly number[], i: number, half: number): number[] => {
    const k = Math.min(half, i, a.length - 1 - i);
    return a.slice(i - k, i + k + 1);
  };
  const med = h.map((_, i) => {
    const w = around(h, i, 3).sort((a, b) => a - b);
    return w[w.length >> 1]!;
  });
  const mean = med.map((_, i) => {
    const w = around(med, i, 3);
    return w.reduce((s, v) => s + v, 0) / w.length;
  });
```

this was applied — needs human verification (TBC). Automated checks so far: `cleanHeights` (running median over 7 → centred mean over 7 → rate limit ≤25 m/s) is present in `src/app/core/flight/log-parser.ts` and applied to baroAlt heights in `parseCsv()`. The spec test above passes (no flat treads on a jittery descent), and running the algorithm over the real example CSV (`public/guide-demo/flight.csv`, 1025 fixes) shows the worst descent (~12.7 m over 3 s) drawn as strictly decreasing heights at every fix with zero flat steps; spikes are removed while real climbs/descents are preserved. Remaining: load the example path in the app and confirm visually that the descent renders as a slope, not a staircase.

## Bugs

|   | Issue | Details | Priority | Status |
|---|---|---|---|---|
| 1 | Welcome tour | Stop the tour and open the welcome panel. | High | TBC |
| 2 | Root page | Opening the root URL should open the welcome panel. | High | TBC |
| 3 | Gallery / holes / underbasements | Fix incorrect, impractical, or poorly designed holes and underground spaces. | High | Open |
| 4 | Holes and hills | When a tunnel intersects terrain like a hill, its cut generates a wrong alignment between them: hole is opened, I can see trough and see void. Also happens with building basements. (see bug image 1) | High | Fixed — see solution below |
| 5 | fix path | example blackbox csv path when loaded shows a descent slope as steps, never happened and not visible in the video. | High | TBC |
| 6 | Overlapping roads | Two roads drawn over each other are levelled one after the other into a zig-zag trough at the crossing; the strips also render overlapping. (see bug image 2) | High | Fixed — see solution below |

## Bug 4 — Solution (holes and hills)

**Symptom (bug image 1):** a tunnel through a hill opens a hole whose walls do not line up with the slope — looking through it you see the trough of the cut and the void where the hill should continue; the same misalignment appears where a building's basement meets sloped ground.

**Cause:** `cutMask` (`src/app/core/underground.ts`) flagged every grid vertex inside the volume whose raw height lay between floor and ceiling + wall. On a slope those vertices form a ragged diagonal band, but the terrain mesh (`terrainMesh` in `src/app/three/site-model.ts`) drops any cell touching one flagged vertex — so whole cells were removed far outside the true portal openings, tearing the hillside open around the tunnel instead of leaving two clean portals. Where a cut cell was dropped, no terrain stood between the tunnel mouth and the hill above it: the void seen through the hole.

**Fix:**
- A vertex counts as cut only when the *volume's own footprint* covers it — the outline inset by half a grid cell plus the wall thickness — so the opening always lies inside the built tube, never bleeding onto neighbouring slopes.
- A vertex is cut only when the ground there genuinely passes through the inside (between floor and ceiling): on a hill high enough over the tunnel nothing is flagged and the ridge stays intact.
- The mask is grown outwards by one ring of vertices that lie inside the un-inset outline and are crossed by the surface (the ground just outside is still between floor and ceiling). This turns the ragged diagonal band into aligned, contiguous portal quads whose edges follow the tunnel walls, so the hole lines up with the tube and the hill keeps its shape over and beside it.
- Basements sit on their levelled pad (ceiling = pad height), so the same rule gives one tidy rectangular opening around each basement instead of scattered cut cells.

**Tests:** `src/app/core/underground.spec.ts` — a tunnel through a hill now yields exactly two aligned portal blocks (west/east mouths, flush with the tube's ends and within its width), the hill top over the middle stays uncut, cells beside the tunnel are never cut, and a shallow buried box gets portals while a deep one under a high hill gets none.

## Bug 6 — Solution (overlapping roads)

**Symptom (bug image 2):** drawing a road across another road leaves a trench at the crossing: the flattened strips do not align, the ground dips in a zig-zag and the two road ribbons overlap each other.

**Cause:** `siteGround` (`src/app/core/site-ground.ts`) called `levelRoad` once per road, in order. Each pass samples heights from the grid as it finds it, so the second road blends towards the centre-line heights the first pass had already written along its own strip; near the crossing those samples sit off the second road's centre line and the two levellings fight each other — producing the misaligned depression.

**Fix:** all roads are now levelled together in a single pass (`levelRoads` in `src/app/core/layers.ts`): every affected cell takes the height of the nearest point of the nearest road (sampled from the untouched grid), blended over 2 m beside the strips. One crossing cannot contradict itself any more: both roads meet at a common, smooth level patch. `levelRoad` remains as the single-road wrapper.

**Tests:** `src/app/core/layers.spec.ts` — levelling two crossing roads leaves the crossing flat (no dip below either centre line) and the ground still climbs along the roads away from it.

## Bando Villetta — Specs

| - | Element | Measurement / specification | Notes | Status |
| - |---|---|---|---|
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

| Task | Details | Priority | Status |
|---|---|---|---|
| 1 | Fix welcome flow | Correct welcome tour termination and root-page behavior. | High | TBC |
| 2 | Redesign holes and underground areas | Review gallery, holes, underbasements, hills, geometry, and walkability. | High | TBC |
| 3 | Validate Bando Villetta dimensions | Compare measurements with photos and establish tolerances. | High | Pending |
| 4 | Implement Bando geometry | Apply verified measurements to the 3D model. | Medium | Pending |
| 5 | Multipath racing mode | Plan and implement racing across multiple paths. | Future | Planned |
| 6 | Upload support | 1 device version: Enable uploading of multiple paths; should be distincted so maybe ditch color as speed and use one foreach. "Closed loops" flag enable loop counting / best lap | Future | Planned |
| 7 | Multiuser racing mode | Enable uploading of multiple paths from different devices on shared bando; should, should see others as ghosts | Future | Planned |
| 8 | Multiuser live racing mode | Enable multiple paths from different devices on shared bando using live multiple stream links; (example 3 squirrelcast broadcast on diff urls. ) | Future | Planned |
| 9 | Mascotte | Complete mascotte animated gif and update title: title should be big block wall of text as popular today. Mascotte (use the pixel guy in mascotte images folder, radio remove antenna, please note in animation radio must be facing guy, not ground). Mascotte should: - look around (left right)<br>  - run right (on place while drone at ground shifting left)<br>  - low,drone at ground - sit, drone at ground<br>  - drone up<br>  - jump winning pose<br>  - drone flies away right.<br> repeat. | Future | Planned |
