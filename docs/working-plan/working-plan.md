## To be completed and verified

example blackbox csv path whne loaded shows a descent slope as steps, never happened and not visible in the video.
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

this was applied, must be checked

## Bugs

| Issue | Details | Priority | Status |
|---|---|---|---|
| Welcome tour | Stop the tour and open the welcome panel. | High | Open |
| Root page | Opening the root URL should open the welcome panel. | High | Open |
| Gallery / holes / underbasements | Fix incorrect, impractical, or poorly designed holes and underground spaces. | High | Open |
| Holes and hills | Fix geometry and interaction problems involving holes and hills. | High | Open |

## Bando Villetta — Specs

| Element | Measurement / specification | Notes | Status |
|---|---|---|---|
| Main store facade doors | 4.64 m | Approximate iPhone measurement | To verify |
| Main store facade windows | 2.69 m | Height of the closed bottom section | To verify |
| Greenhouse | 4.61 m | Distance between long sides; elliptical structure | To verify |
| Annex house columns | 3.43 m | Distance between columns | To verify |
| Annex perimeter walkway | 3.11 m | Columns to walls on S, N, and probably W sides; creates a walkable path around the large internal void on floor 1 | To verify |
| Annex, first-floor basement | 6.20 m | Exact reference points to be confirmed | To verify |
| Greenhouse height | 9.30 m | Elliptical; retain "greenhouse" as the working name | To verify |
| Main store rounded upper sections | 8.00 m | Height above the indoor floor; four rounded sections | To verify |
| Blue stair → blue ladder | Starts at 2.00 m | Open skeletal cylindrical structure | To verify |
| Central columns | 1.00 m | Distance between the two central rows of columns | To verify |

**Measurement disclaimer:** iPhone measurements may be inaccurate. Apply reasonable tolerances and verify against photos or more reliable measurements before finalizing the geometry.

## Next Steps

| Task | Details | Priority | Status |
|---|---|---|---|
| Fix welcome flow | Correct welcome tour termination and root-page behavior. | High | Pending |
| Redesign holes and underground areas | Review gallery, holes, underbasements, hills, geometry, and walkability. | High | Pending |
| Validate Bando Villetta dimensions | Compare measurements with photos and establish tolerances. | High | Pending |
| Implement Bando geometry | Apply verified measurements to the 3D model. | Medium | Pending |
| Multipath racing mode | Plan and implement racing across multiple paths. | Future | Planned |
| Upload support | 1 device version: Enable uploading of multiple paths; should be distincted so maybe ditch color as speed and use one foreach. "Closed loops" flag enable loop counting / best lap | Future | Planned |
| Multiuser racing mode | Enable uploading of multiple paths from different devices on shared bando; should, should see others as ghosts | Future | Planned |
| Multiuser live racing mode | Enable multiple paths from different devices on shared bando using live multiple stream links; (example 3 squirrelcast broadcast on diff urls. ) | Future | Planned |
| Mascotte | Complete mascotte animated gif and update title: 
title should be big block wall of text as popular today. Mascotte (use the pixel guy in mascotte images folder, radio remove antenna, please note in animation radio must be facing guy, not ground). Mascotte should: - look around (left right)<br>  - run right (on place while drone at ground shifting left)<br>  - low,drone at ground - sit, drone at ground<br>  - drone up<br>  - jump winning pose<br>  - drone flies away right.<br> repeat. | Future | Planned |
