import timeline from '../../../public/mascot/timeline.json';

export const MASCOT_POSES = ['idle', 'look-quarter-a', 'look-quarter-b', 'side', 'run-a', 'run-pass', 'run-b', 'crouch', 'low', 'sit', 'rise', 'look-up', 'anticipate', 'jump', 'victory', 'back'] as const;
export const MASCOT_DURATION = timeline.duration;
/** Same timeline used by the GIF exporter: milliseconds, a 320×160 logical pixel stage. */
export function mascotFrame(ms: number) {
  const t = ((ms % MASCOT_DURATION) + MASCOT_DURATION) % MASCOT_DURATION;
  const p = timeline.phases.find((p) => t >= p.start && t < p.end)!;
  const u = (t - p.start) / (p.end - p.start);
  return {
    pose: p.poses[Math.floor((t - p.start) / 120) % p.poses.length]!,
    mirror: 'mirror' in p && !!p.mirror,
    y: 'jump' in p && p.jump ? Math.round(-18 * Math.sin(u * Math.PI)) : 0,
    droneX: Math.round(p.drone[0]! + (p.drone[2]! - p.drone[0]!) * u),
    droneY: Math.round(p.drone[1]! + (p.drone[3]! - p.drone[1]!) * u),
    phase: p.name,
  };
}
