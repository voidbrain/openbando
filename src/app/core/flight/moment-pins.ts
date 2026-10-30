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
}

/** The offset the pins give at time `t`. No pins: none. */
export function pinOffset(pins: readonly MomentPin[], t: number): { dx: number; dz: number } {
  if (!pins.length) return { dx: 0, dz: 0 };
  const start = pins.some((p) => p.t <= 0.5) ? [] : [{ t: 0, dx: 0, dz: 0 }]; // the take-off stays where it was placed
  const sorted = [...start, ...pins].sort((a, b) => a.t - b.t);
  const first = sorted[0]!, last = sorted.at(-1)!;
  if (t <= first.t) return { dx: first.dx, dz: first.dz };
  if (t >= last.t) return { dx: last.dx, dz: last.dz };
  const i = sorted.findIndex((p) => p.t > t), a = sorted[i - 1]!, b = sorted[i]!;
  const u = (t - a.t) / (b.t - a.t);
  return { dx: a.dx + (b.dx - a.dx) * u, dz: a.dz + (b.dz - a.dz) * u };
}

/**
 * Pin the moment `t` so the drone stands at `at` there: the new pin's offset is what is still missing after the pins
 * already in place (`from` is where the path puts the drone at `t` with them). A pin within half a second of another
 * replaces it.
 */
export function addPin(pins: readonly MomentPin[], t: number, from: { x: number; z: number }, at: { x: number; z: number }): MomentPin[] {
  const now = pinOffset(pins, t);
  const pin = { t, dx: now.dx + at.x - from.x, dz: now.dz + at.z - from.z };
  return [...pins.filter((p) => Math.abs(p.t - t) >= 0.5), pin].sort((a, b) => a.t - b.t);
}

/** Pins as saved (a JSON list), kept only when well formed. */
export function sanitizePins(raw: unknown): MomentPin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is MomentPin => !!p && typeof p === 'object' && [p.t, p.dx, p.dz].every((v) => typeof v === 'number' && Number.isFinite(v)))
    .map((p) => ({ t: p.t, dx: Math.max(-500, Math.min(500, p.dx)), dz: Math.max(-500, Math.min(500, p.dz)) }))
    .sort((a, b) => a.t - b.t);
}
