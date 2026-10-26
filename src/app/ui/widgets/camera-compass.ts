import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import type * as THREE from 'three';
import type { CameraView } from '../../core/models';
import { cameraNorthAngle } from '../../core/drawing/camera-compass';
import { FrameLoopService, FrameOrder } from '../../services/frame-loop.service';
import { CalibrationStore } from '../../state/calibration.store';

/** A fixed overlay that follows the current 3D camera, independently of model scale. */
@Component({
  selector: 'app-camera-compass',
  template: `<div class="dial" role="img" aria-label="North direction" title="North direction"><div class="needle" [style.transform]="'rotate(' + angle() + 'deg)'"><span class="north">N</span><span class="arrow">▲</span><span class="south">▼</span></div></div>`,
  styles: `:host {position:absolute;top:10px;right:10px;z-index:10;pointer-events:none}.dial {width:54px;height:54px;border:1px solid var(--line);border-radius:50%;background:var(--panel-solid);color:var(--text)}.needle {position:relative;width:100%;height:100%}.north,.arrow,.south {position:absolute;left:0;width:100%;text-align:center;line-height:1}.north{top:2px;font-size:10px;font-weight:700;color:var(--danger-text)}.arrow{top:14px;font-size:14px;color:var(--danger-text)}.south{bottom:8px;font-size:12px;color:var(--dim)}`,
})
export class CameraCompass {
  readonly camera = input.required<() => THREE.Camera | null>();
  readonly view = input<CameraView>('orbit');
  protected readonly angle = signal(0);
  private readonly cal = inject(CalibrationStore);
  constructor() {
    const stop = inject(FrameLoopService).every(2, FrameOrder.widgets, () => {
      const camera = this.camera()?.();
      if (!camera || document.hidden) return;
      const angle = cameraNorthAngle(this.view(), camera.quaternion, camera.up, this.cal.rot());
      if (Math.abs(angle - this.angle()) > 0.2) this.angle.set(angle);
    });
    inject(DestroyRef).onDestroy(stop);
  }
}
