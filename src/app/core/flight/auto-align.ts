/**
 * Align a replay automatically (F-041): GPS drifts slowly by metres, so at sampled moments of the flight we choose a shift
 * of the drone among a grid of candidates, the cheapest smooth sequence over the whole flight (a Viterbi search, as in
 * map matching). Each candidate costs its distance from the GPS (height dearer: the barometer holds over seconds), being
 * inside a solid (high but finite: the model may lack a gap the drone really flew through) and a poor match between the
 * video frame and the model seen from there; consecutive moments cost the change of shift between them. Pure.
 */
import type { PinOffset } from './moment-pins';

export type AlignCandidate = PinOffset;

/** The evidence at one moment, for every candidate (same order as the candidates). */
export interface AlignMoment {
  /** Seconds from the flight's first fix. */
  t: number;
  /** Fixes of a window around the moment inside a solid with this shift (0 = clear). */
  collisions: readonly number[];
  /** How well the video frame matches the model seen from the shifted camera (−1..1); null where no video was compared. */
  visual: readonly number[] | null;
}

export interface AlignWeights {
  /** Per metre of shift across the ground. */
  ground: number;
  /** Per metre of height shift. */
  height: number;
  /** Per fix inside a solid. */
  solid: number;
  /** Per unit of visual match lost (1 − score). */
  visual: number;
  /** Per metre of change of shift between consecutive moments, per second between them. */
  change: number;
}

export const ALIGN_WEIGHTS: AlignWeights = { ground: 0.15, height: 0.5, solid: 2, visual: 6, change: 1.5 };

/** How sure a moment's choice is: the extra cost of the best candidate more than `apart` metres from the chosen one. */
export type AlignConfidence = 'sure' | 'likely' | 'unsure';

export interface AlignResult {
  t: number;
  offset: PinOffset;
  confidence: AlignConfidence;
  /** Extra cost of the best clearly different candidate (higher = surer). */
  margin: number;
  /** The chosen shift still crosses a solid: the model may lack an opening here (ask). */
  throughSolid: boolean;
}

/** A grid of candidate shifts: across the ground every `step` metres up to `reach`, at the given heights. */
export function alignCandidates(reach = 12, step = 2, heights: readonly number[] = [-2, -1, 0, 1]): AlignCandidate[] {
  const out: AlignCandidate[] = [];
  for (const dy of heights) for (let dx = -reach; dx <= reach + 1e-9; dx += step) for (let dz = -reach; dz <= reach + 1e-9; dz += step) out.push({ dx, dy, dz });
  return out;
}

const dist = (a: PinOffset, b: PinOffset): number => Math.hypot(a.dx - b.dx, a.dy - b.dy, a.dz - b.dz);

/** The cost of a candidate at one moment, on its own. */
export function unaryCost(c: AlignCandidate, m: AlignMoment, i: number, w: AlignWeights = ALIGN_WEIGHTS): number {
  const v = m.visual ? w.visual * (1 - m.visual[i]!) : 0;
  return w.ground * Math.hypot(c.dx, c.dz) + w.height * Math.abs(c.dy) + w.solid * m.collisions[i]! + v;
}

/**
 * The cheapest smooth sequence of shifts (Viterbi), and for each moment how sure it is: `sure` when the best candidate
 * more than `apart` metres away costs at least `sureMargin` more, `likely` above half of it, `unsure` below.
 */
export function alignFlight(
  candidates: readonly AlignCandidate[],
  moments: readonly AlignMoment[],
  w: AlignWeights = ALIGN_WEIGHTS,
  opts: { apart?: number; sureMargin?: number } = {},
): AlignResult[] {
  const n = candidates.length, apart = opts.apart ?? 4, sure = opts.sureMargin ?? 1.5;
  if (!moments.length || !n) return [];
  const unary = moments.map((m) => candidates.map((c, i) => unaryCost(c, m, i, w)));
  const pair: number[][] = candidates.map((a) => candidates.map((b) => dist(a, b)));
  // forward: the cheapest way to reach each candidate at each moment, and where it came from
  const cost: number[][] = [unary[0]!.slice()];
  const from: number[][] = [candidates.map(() => -1)];
  for (let k = 1; k < moments.length; k++) {
    const dt = Math.max(0.5, moments[k]!.t - moments[k - 1]!.t), prev = cost[k - 1]!;
    const row: number[] = [], back: number[] = [];
    for (let j = 0; j < n; j++) {
      let best = Infinity, arg = 0;
      for (let i = 0; i < n; i++) {
        const c = prev[i]! + (w.change / dt) * pair[i]![j]!;
        if (c < best) { best = c; arg = i; }
      }
      row.push(best + unary[k]![j]!);
      back.push(arg);
    }
    cost.push(row);
    from.push(back);
  }
  // backward: the chosen candidate per moment
  const last = cost.at(-1)!;
  let j = last.indexOf(Math.min(...last));
  const chosen: number[] = new Array(moments.length);
  for (let k = moments.length - 1; k >= 0; k--) { chosen[k] = j; j = from[k]![j]!; }
  return moments.map((m, k) => {
    const c = chosen[k]!, u = unary[k]!;
    // how sure: the extra cost, at this moment alone, of the best candidate clearly elsewhere
    let rival = Infinity;
    for (let i = 0; i < n; i++) if (dist(candidates[i]!, candidates[c]!) > apart) rival = Math.min(rival, u[i]!);
    const margin = rival - u[c]!;
    const confidence: AlignConfidence = margin >= sure ? 'sure' : margin >= sure / 2 ? 'likely' : 'unsure';
    return { t: m.t, offset: { dx: candidates[c]!.dx, dy: candidates[c]!.dy, dz: candidates[c]!.dz }, confidence, margin, throughSolid: m.collisions[c]! > 0 };
  });
}
