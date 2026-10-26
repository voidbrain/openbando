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
    const droneRight = new Image(); droneRight.src = 'mascot/drone-right.png';
    let ms = 0, last = performance.now(), painted = false;
    const stop = this.loop.add(FrameOrder.widgets, () => {
      const now = performance.now(), dt = Math.min(100, now - last); last = now;
      const panel = this.layout.panels().welcome;
      if (!panel.visible || panel.minimized || document.hidden) return;
      const still = this.paused();
      if (still && painted) return;
      const f = mascotFrame(ms), pilot = images[f.pose]!;
      const quad = f.droneRight ? droneRight : drone;
      if (!pilot.complete || !pilot.naturalWidth || !quad.complete || !quad.naturalWidth) return;
      const g = this.cv()?.nativeElement.getContext('2d'); if (!g) return;
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, 320, 160);
      // Cover the fallback image only after every required asset has loaded.
      this.cv()!.nativeElement.previousElementSibling?.setAttribute('hidden', '');
      g.save();
      if (f.mirror) { g.translate(176, 0); g.scale(-1, 1); }
      g.drawImage(pilot, 24, 24 + f.y); g.restore();
      if (f.droneVisible) {
        const x=f.droneX-quad.width/2, y=f.droneY-quad.height/2;
        g.drawImage(quad,x,y);
        if(f.propellersSpinning) {
          g.fillStyle=f.propellerFrame ? '#ffad35' : '#ff7a00';
          for(const [px,py] of [[0.23,0.16],[0.77,0.16],[0.23,0.59],[0.77,0.59]]) {
            const cx=Math.round(x+quad.width*px),cy=Math.round(y+quad.height*py);
            g.fillRect(cx-(f.propellerFrame?5:3),cy, f.propellerFrame?10:6,1);
            g.fillRect(cx-2,cy-1,4,3);
          }
        }
      }
      painted = true;
      if (!still) { ms += dt; painted = false; }
    });
    this.destroy.onDestroy(() => { stop(); media.removeEventListener('change', change); });
  }
}
