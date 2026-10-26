import { NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { mascotFrame, MASCOT_POSES } from '../core/mascot';
import { FrameLoopService, FrameOrder } from '../services/frame-loop.service';
import { LayoutStore } from '../state/layout.store';

/** Welcome-only pixel animation. No timers or decoding while hidden; reduced motion is a still pose. */
@Component({
  selector: 'app-mascot',
  imports: [NgOptimizedImage],
  template: `
    <div class="stage" aria-hidden="true"><img ngSrc="mascot/poster.png" width="128" height="128" alt=""/><canvas #canvas width="320" height="160"></canvas></div>
    <button class="btn" type="button" [attr.aria-pressed]="paused()" (click)="paused.set(!paused())">{{ paused() ? 'Play' : 'Pause' }}</button>
  `,
  styles: `
    :host { display: flex; flex-direction: column; align-items: flex-end; max-width: 100%; }
    .stage { width: 320px; max-width: 100%; aspect-ratio: 2; position: relative; }
    img { position: absolute; left: 7.5%; bottom: 10%; width: 40%; height: auto; image-rendering: pixelated; }
    canvas { width: 100%; height: 100%; position: absolute; inset: 0; image-rendering: pixelated; }
    button { font-size: 11px; }
    button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  `,
})
export class Mascot implements AfterViewInit {
  protected readonly paused = signal(false);
  private readonly cv = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly loop = inject(FrameLoopService);
  private readonly layout = inject(LayoutStore);
  private readonly destroy = inject(DestroyRef);
  ngAfterViewInit(): void {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.paused.set(media.matches);
    const change = () => { if (media.matches) this.paused.set(true); };
    media.addEventListener('change', change);
    const images = MASCOT_POSES.map((name, i) => { const im = new Image(); im.src = `mascot/poses/${String(i).padStart(2, '0')}-${name}.png`; return im; });
    const drone = new Image(); drone.src = 'mascot/drone.png';
    let ms = 0, last = performance.now(), painted = false;
    const stop = this.loop.add(FrameOrder.widgets, () => {
      const now = performance.now(), dt = Math.min(100, now - last); last = now;
      const panel = this.layout.panels().welcome;
      if (!panel.visible || panel.minimized || document.hidden) return;
      const still = this.paused();
      if (still && painted) return;
      const f = mascotFrame(ms), pilot = images[f.pose]!;
      if (!pilot.complete || !pilot.naturalWidth || !drone.complete || !drone.naturalWidth) return;
      const g = this.cv()?.nativeElement.getContext('2d'); if (!g) return;
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, 320, 160);
      // Cover the fallback image only after every required asset has loaded.
      this.cv()!.nativeElement.previousElementSibling?.setAttribute('hidden', '');
      g.save();
      if (f.mirror) { g.translate(176, 0); g.scale(-1, 1); }
      g.drawImage(pilot, 24, 24 + f.y); g.restore();
      g.drawImage(drone, f.droneX - drone.width / 2, f.droneY - drone.height / 2);
      painted = true;
      if (!still) { ms += dt; painted = false; }
    });
    this.destroy.onDestroy(() => { stop(); media.removeEventListener('change', change); });
  }
}
