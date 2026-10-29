# Basement courtyards and separate pieces (F-002)

Status: done (F-002). Phases 1–4 and per-wall switches are implemented (#178, #180, #181, #182, #183, #186). By decision (29 October), vertex editing of separate pieces and openings / floor items inside pieces are not planned unless a pilot asks: delete and redraw a piece to change it, and put doors and floor items in the main basement. Phase 5 is this file, README, the area notes and the backlog; no guide step or media shows basements, so nothing to re-record.
the building's own outline when absent) plus rectangular floor voids. This plan adds **courtyards** (holes through the
whole basement: the ground is kept inside, walls around them; the ground floor above still covers them) and **separate pieces** (more than one perimeter
under the same building), without breaking saved bandos or the existing perimeter rules (`wallEdges`, Cut/Wing remaps,
vertex edits, footprint restoration).

## How the basement is built today

- `basementBuilding(b)` turns the basement into a derived one-level building whose `footprint` is the outline; the
  ordinary building pipeline draws its walls (`buildPolyWalls`, one wall per edge, `wallEdges` hides open edges), its
  floor and ceiling (`slabs(footprint)`: a rectangle decomposition), and its colliders.
- `basementVolume` turns the same outline into an `UndergroundSpec` (`siteGround().vols`): `cutMask` and
  `three/underground-cut.ts` remove terrain inside it, `floorUnder` puts the drone on its floor. Floor voids become
  runtime `floorHoles`.
- Editing: 2D plan and 3D indoor −1 (vertex handles, Insert / Delete, Cut / Wing, dimension fields, footprint
  restoration), all validated by `moveBasementVertices` / `replaceBasementOutline` so openings and floor items survive.

## Representation

```ts
interface BasementSpec {
  // existing: outline?, wallEdges?, sides?, doors?, wallOpenings?, columns?, partitions?, voids?, height
  /** Holes through the basement, building frame, each a simple polygon strictly inside `outline`. */
  courtyards?: { outline: Vec2[]; wallEdges?: boolean[] }[];
  /** Further perimeters under the same building, each with its own walls; floor items stay with the main one. */
  pieces?: { outline: Vec2[]; wallEdges?: boolean[]; wallOpenings?: WallOpening[] }[];
}
```

- Optional fields with defaults (absent = none): old files load unchanged; `cloneSpec` (JSON) needs nothing;
  `sanitizeSpec` rebuilds and validates both lists (it already rebuilds the basement).
- Validation (pure, `core/basement.ts`): every ring simple and valid (`validOutline`), inside the coordinate limit; a
  courtyard strictly inside the main outline (no shared edge: a courtyard that touches the perimeter is a Cut), at
  least 1 m across, courtyards pairwise disjoint and clear of columns, partitions and voids; pieces pairwise disjoint
  and disjoint from the main outline (touching pieces should be one outline: Wing). Caps: 16 courtyards, 8 pieces,
  64 vertices per ring. Anything invalid is dropped by the sanitizer with the rest kept, never silently reshaped.
- Courtyard `wallEdges` follow the main perimeter's rule (one flag per edge, absent = all walls).

## Phases (one PR each, every phase testable on its own)

1. **Model and validation.** Types, validators, sanitizer, old-file compatibility; unit tests only. No visible change.
2. **Courtyard geometry.** Floor and ceiling slabs minus courtyards (`slabs` on the outline with holes, or subtract
   courtyard rectangles/polygons from each slab); a wall along each courtyard edge facing in (respect its
   `wallEdges`); the volume excludes them (`UndergroundSpec` gains `holes` used by `cutMask`, `underground-cut.ts`
   and `floorUnder`, so the ground stays and the drone flies up through a courtyard); colliders per piece.
   Tests: mesh, raycast and collision through a courtyard; terrain kept inside; a column cannot sit in one.
3. **Courtyard editing.** A Courtyard tool on −1 (2D rectangle, then vertex edits with the same validation and undo
   as the perimeter, 3D handles); inspector list with delete and per-edge wall switches. Cut / Wing and resize must
   keep courtyards inside or refuse, as they do for openings and items. Browser tests in 2D and 3D, Italian text,
   design-system note.
4. **Separate pieces.** Each piece is its own derived floor and volume (rendering, terrain, collision, indoor view);
   select a piece to edit it with the existing vertex tools; add / delete piece in the inspector; floor items stay in
   the main outline in this phase. Tests as in phases 2–3.
5. **Docs and media.** README, area notes, guide snippet if useful, backlog closure; re-record clips only if a guide
   step shows basements.

Out of scope: courtyards in the floors above (upper floors keep the building outline), curved rings, items moving
between pieces.

## Risks

- Every place that assumes one outline (`basementOutline` users listed by `grep basementOutline`) must either take a
  ring list or stay main-outline only and say so; phase 1 adds no caller, so phases 2–4 change them deliberately.
- `slabs` assumes a hole-free rectilinear-ish decomposition: courtyards may need a polygon-with-holes triangulation
  for diagonal outlines; collision stays boxes (cut diagonal parts into short boxes as AGENTS requires).
