import type { CameraView } from './models';

/** Only follow an active subject when the camera is actually following it. */
export function xraySubject(view: CameraView, orbitFollow: boolean, manuallyPanned: boolean, simulatorArmed: boolean, followingReplay: boolean): 'simulator' | 'replay' | null {
  if (view === 'fpv') return null;
  if ((view === 'orbit' || view === 'top') && (!orbitFollow || manuallyPanned)) return null;
  if (simulatorArmed) return 'simulator';
  if (followingReplay) return 'replay';
  return null;
}
