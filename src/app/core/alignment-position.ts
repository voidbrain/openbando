/** Pinning uses the current video endpoints when video is loaded; without video it uses flight endpoints. */
export function alignmentPosition(hasFlight: boolean, time: number, duration: number, tolerance = 0.1): { start: boolean; end: boolean } {
  if (!hasFlight || !Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) return { start: false, end: false };
  return { start: time >= 0 && time <= tolerance, end: time <= duration && time >= duration - tolerance };
}
