import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import type * as THREE from 'three';
import type { CameraView } from '../../core/models';
import { cameraNorthAngle } from '../../core/drawing/camera-compass';
import { FrameLoopService, FrameOrder } from '../../services/frame-loop.service';
import { CalibrationStore } from '../../state/calibration.store';

/** Fixed north indicator and camera orientation control. */
@Component({
  selector: 'app-camera-compass',
  template: `<button type="button" class="dial" [disabled]="!interactive()" aria-label="Orient camera: click for north, drag or use arrow keys to turn" title="Orient camera: click for north, drag or use arrow keys to turn" (pointerdown)="down($event)" (pointermove)="move($event)" (pointerup)="up($event)" (pointercancel)="cancel()" (keydown)="key($event)" (click)="click($event)"><div class="needle" [style.transform]="'rotate(' + angle() + 'deg)'"><span class="north">N</span><span class="arrow">▲</span><span class="south">▼</span></div></button>`,
  styles: `:host {position:absolute;bottom:10px;left:10px;z-index:10}.dial {display:block;padding:0;width:54px;height:54px;border:1px solid var(--line);border-radius:50%;background:var(--panel-solid);color:var(--text);cursor:grab;touch-action:none}.dial:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.needle {position:relative;width:100%;height:100%;pointer-events:none}.north,.arrow,.south {position:absolute;left:0;width:100%;text-align:center;line-height:1}.north{top:2px;font-size:10px;font-weight:700;color:var(--danger)}.arrow{top:14px;font-size:14px;color:var(--danger)}.south{bottom:8px;font-size:12px;color:var(--dim)}`,
})
export class CameraCompass {
  readonly camera = input.required<() => THREE.Camera | null>();
  readonly view = input<CameraView>('orbit');
  readonly interactive = input(true);
  readonly orient = output<number>();
  protected readonly angle = signal(0);
  private readonly cal = inject(CalibrationStore);
  private start: { x: number; y: number; pointer: number; direction: number; angle: number; moved: boolean } | null = null;
  constructor() {
    const stop = inject(FrameLoopService).every(2, FrameOrder.widgets, () => {
      const camera = this.camera()?.();
      if (!camera || document.hidden) return;
      const angle = cameraNorthAngle(this.view(), camera.quaternion, camera.up, this.cal.rot());
      if (Math.abs(angle - this.angle()) > 0.2) this.angle.set(angle);
    });
    inject(DestroyRef).onDestroy(stop);
  }
  private direction(e: PointerEvent): number {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI;
  }
  protected down(e: PointerEvent): void {
    if (e.button !== 0) return;
    e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.start = { x: e.clientX, y: e.clientY, pointer: e.pointerId, direction: this.direction(e), angle: this.angle(), moved: false };
  }
  protected move(e: PointerEvent): void {
    const s = this.start; if (!s || s.pointer !== e.pointerId) return;
    e.stopPropagation();
    if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 3) s.moved = true;
    if (s.moved) this.orient.emit(s.angle + this.direction(e) - s.direction);
  }
  protected up(e: PointerEvent): void {
    const s = this.start; if (!s || s.pointer !== e.pointerId) return;
    e.stopPropagation(); this.start = null;
    if (!s.moved) this.orient.emit(0);
  }
  protected cancel(): void { this.start = null; }
  protected click(e: MouseEvent): void { if (e.detail === 0) this.orient.emit(0); }
  protected key(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); e.stopPropagation(); this.orient.emit(this.angle() + (e.key === 'ArrowRight' ? 5 : -5));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); e.stopPropagation(); this.orient.emit(0);
    }
  }
}
