import type { CameraView } from '../models';
import { cameraUpAngle } from './compass';

/** Clockwise north direction on screen, in degrees, using the camera and model calibration. */
export function cameraNorthAngle(view: CameraView, q: {x:number;y:number;z:number;w:number}, up: {x:number;z:number}, calibrationDeg: number): number {
  const fx = -2 * (q.x * q.z + q.w * q.y);
  const fz = -(1 - 2 * (q.x * q.x + q.y * q.y));
  const a = cameraUpAngle(view, up, {x:fx,z:fz});
  return calibrationDeg - a * 180 / Math.PI;
}
