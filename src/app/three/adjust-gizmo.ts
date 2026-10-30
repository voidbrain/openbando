import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/**
 * The Adjust position control (F-040): three axes and three planes on the replay drone in a 3D view. Dragging moves a
 * proxy point; the caller turns its position into a pin at the current moment of the flight.
 */
export class AdjustGizmo {
  readonly proxy = new THREE.Object3D();
  private readonly controls: TransformControls;
  private readonly helper: THREE.Object3D;

  constructor(camera: THREE.Camera, dom: HTMLElement, private readonly scene: THREE.Scene, at: THREE.Vector3, onMove: (p: THREE.Vector3) => void) {
    this.proxy.position.copy(at);
    scene.add(this.proxy);
    this.controls = new TransformControls(camera, dom);
    this.controls.setMode('translate');
    this.controls.setSize(0.9);
    this.controls.attach(this.proxy);
    this.helper = this.controls.getHelper();
    scene.add(this.helper);
    this.controls.addEventListener('objectChange', () => onMove(this.proxy.position));
  }

  /** The pointer is on one of its handles: a press there drags the control, not the camera. */
  get active(): boolean {
    return this.controls.axis !== null || this.controls.dragging;
  }

  /** Move the point by a step (keyboard), as a drag would. */
  nudge(dx: number, dy: number, dz: number): THREE.Vector3 {
    this.proxy.position.add(new THREE.Vector3(dx, dy, dz));
    return this.proxy.position;
  }

  dispose(): void {
    this.controls.detach();
    this.controls.dispose();
    this.scene.remove(this.helper, this.proxy);
  }
}
