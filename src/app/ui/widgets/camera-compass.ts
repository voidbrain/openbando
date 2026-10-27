import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import type * as THREE from 'three';
import type { CameraView } from '../../core/models';
import { cameraNorthAngle } from '../../core/drawing/camera-compass';
import { FrameLoopService, FrameOrder } from '../../services/frame-loop.service';
import { CalibrationStore } from '../../state/calibration.store';

/** Fixed north indicator and camera orientation control. */
@Component({
  selector: 'app-camera-compass',
  template: `<button type="button" class="dial" [disabled]="!interactive()" aria-label="Orient camera: click for north, drag or use arrow keys to turn" title="Orient camera: click for north, drag or use arrow keys to turn" (pointerdown)="down($event)" (pointermove)="move($event)" (pointerup)="up($event)" (pointercancel)="cancel()" (keydown)="key($event)" (click)="click($event)"><div class="needle" aria-hidden="true" [style.transform]="'rotate(' + angle() + 'deg)'"><svg viewBox="0 0 54 54" aria-hidden="true" focusable="false"><path class="north" d="M23 11V3L30 11V3"/><path class="arrow" d="M27 14L20 25H34Z"/><path class="south" d="M27 45L21 35H33Z"/></svg></div></button>`,
  styles: `:host {position:absolute;bottom:10px;left:10px;z-index:10}.dial {display:block;padding:0;width:54px;height:54px;border:1px solid var(--line);border-radius:50%;background:var(--panel-solid);color:var(--text);cursor:grab;touch-action:none}.dial:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.needle {position:relative;width:100%;height:100%;pointer-events:none}.needle svg{display:block;width:100%;height:100%}.north{fill:none;stroke:var(--danger);stroke-width:2}.arrow{fill:var(--danger)}.south{fill:var(--dim)}`,
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
