/**
 * Pins at moments of a flight (B-017): GPS drifts by several metres over a flight, in a direction that changes, so no
 * single shift or turn of the path fits it everywhere. The pilot stops the replay where the video shows clearly where the
 * drone is and puts it there; each pin is the offset, in model metres, at its moment. The start is a pin of its own with
 * no offset (the take-off is already placed: on the pad, or by the start pin), unless a pin is within half a second of it;
 * between two pins the offset blends linearly, after the last it holds. Pure.
 */
export interface MomentPin {
  /** Seconds from the flight's first fix (the replay's time). */
  t: number;
  dx: number;
  dz: number;
  /** Height offset, metres (F-040); absent in pins saved before it: 0. */
  dy?: number;
}

/** An offset at a moment: across the ground and in height. */
export interface PinOffset {
  dx: number;
  dy: number;
  dz: number;
}

/** The offset the pins give at time `t`. No pins: none. */
export function pinOffset(pins: readonly MomentPin[], t: number): PinOffset {
  if (!pins.length) return { dx: 0, dy: 0, dz: 0 };
  const start = pins.some((p) => p.t <= 0.5) ? [] : [{ t: 0, dx: 0, dy: 0, dz: 0 }]; // the take-off stays where it was placed
  const sorted = [...start, ...pins].sort((a, b) => a.t - b.t);
  const of = (p: MomentPin): PinOffset => ({ dx: p.dx, dy: p.dy ?? 0, dz: p.dz });
  const first = sorted[0]!, last = sorted.at(-1)!;
  if (t <= first.t) return of(first);
  if (t >= last.t) return of(last);
  const i = sorted.findIndex((p) => p.t > t), a = of(sorted[i - 1]!), b = of(sorted[i]!);
  const u = (t - sorted[i - 1]!.t) / (sorted[i]!.t - sorted[i - 1]!.t);
  return { dx: a.dx + (b.dx - a.dx) * u, dy: a.dy + (b.dy - a.dy) * u, dz: a.dz + (b.dz - a.dz) * u };
}

/**
 * Pin the moment `t` so the drone stands at `at` there: the new pin's offset is what is still missing after the pins
 * already in place (`from` is where the path puts the drone at `t` with them). A pin within half a second of another
 * replaces it.
 */
export function addPin(pins: readonly MomentPin[], t: number, from: { x: number; y?: number; z: number }, at: { x: number; y?: number; z: number }): MomentPin[] {
  const now = pinOffset(pins, t);
  // a height given on both sides moves the drone up or down too (F-040); a click on the ground keeps the height
  const dy = from.y !== undefined && at.y !== undefined ? now.dy + at.y - from.y : now.dy;
  const pin: MomentPin = { t, dx: now.dx + at.x - from.x, dz: now.dz + at.z - from.z, ...(dy ? { dy } : {}) };
  return [...pins.filter((p) => Math.abs(p.t - t) >= 0.5), pin].sort((a, b) => a.t - b.t);
}

/** Pins as saved (a JSON list), kept only when well formed. */
export function sanitizePins(raw: unknown): MomentPin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is MomentPin => !!p && typeof p === 'object' && [p.t, p.dx, p.dz].every((v) => typeof v === 'number' && Number.isFinite(v)))
    .map((p) => ({ t: p.t, dx: Math.max(-500, Math.min(500, p.dx)), dz: Math.max(-500, Math.min(500, p.dz)), ...(typeof p.dy === 'number' && Number.isFinite(p.dy) && p.dy ? { dy: Math.max(-200, Math.min(200, p.dy)) } : {}) }))
    .sort((a, b) => a.t - b.t);
}
