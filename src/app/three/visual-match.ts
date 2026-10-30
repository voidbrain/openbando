import * as THREE from 'three';

const W = 160, H = 90;

/** Gray levels of a source drawn into W × H. */
function gray(src: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, g: CanvasRenderingContext2D): Float32Array {
  g.drawImage(src, sx, sy, sw, sh, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, out = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = (d[i * 4]! + d[i * 4 + 1]! + d[i * 4 + 2]!) / 3;
  return out;
}

/** Outlines: Sobel gradient strength, softened over 3 × 3 (the model is flat colours, the video a photo: compare shapes). */
function edges(a: Float32Array): Float32Array {
  const e = new Float32Array(W * H), b = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const p = (dx: number, dy: number): number => a[(y + dy) * W + x + dx]!;
    const gx = p(1, -1) + 2 * p(1, 0) + p(1, 1) - p(-1, -1) - 2 * p(-1, 0) - p(-1, 1);
    const gy = p(-1, 1) + 2 * p(0, 1) + p(1, 1) - p(-1, -1) - 2 * p(0, -1) - p(1, -1);
    e[y * W + x] = Math.hypot(gx, gy);
  }
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    let s = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += e[(y + j) * W + x + i]!;
    b[y * W + x] = s / 9;
  }
  return b;
}

/** Correlation of two images (−1..1). */
function correlate(a: Float32Array, b: Float32Array): number {
  let ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) { ma += a[i]!; mb += b[i]!; }
  ma /= a.length; mb /= b.length;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < a.length; i++) { const x = a[i]! - ma, y = b[i]! - mb; sab += x * y; saa += x * x; sbb += y * y; }
  return sab / Math.sqrt(saa * sbb || 1);
}

/**
 * How well the video frame at a moment matches the model seen from a camera shifted by each candidate (F-041). Renders
 * the site model alone (the drones and paths hidden for the draw) into a small corner of the renderer's canvas and
 * compares outlines. Browser only: it needs WebGL and a video it can seek.
 */
export class VisualMatcher {
  private readonly g: CanvasRenderingContext2D;
  private readonly video: HTMLVideoElement;
  private ready: Promise<void>;

  constructor(private readonly renderer: THREE.WebGLRenderer, private readonly scene: THREE.Scene, private readonly site: THREE.Object3D, videoUrl: string) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    this.g = c.getContext('2d', { willReadFrequently: true })!;
    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.preload = 'auto';
    this.video.src = videoUrl;
    this.ready = new Promise((resolve, reject) => {
      this.video.addEventListener('loadeddata', () => resolve(), { once: true });
      this.video.addEventListener('error', () => reject(new Error('the video cannot be read here')), { once: true });
    });
  }

  /** Outlines of the video frame at `t` seconds of video. */
  async frame(t: number): Promise<Float32Array> {
    await this.ready;
    const v = this.video;
    await new Promise<void>((resolve) => {
      const done = (): void => resolve();
      v.addEventListener('seeked', done, { once: true });
      v.currentTime = Math.max(0, Math.min(t, (v.duration || t) - 0.05));
      setTimeout(done, 3000);
    });
    return edges(gray(v, 0, 0, v.videoWidth, v.videoHeight, this.g));
  }

  /** Scores of `video` against the model seen from `camera` moved by each shift. */
  score(video: Float32Array, camera: THREE.PerspectiveCamera, shifts: readonly { dx: number; dy: number; dz: number }[]): number[] {
    const r = this.renderer, hidden: THREE.Object3D[] = [];
    for (const o of this.scene.children) if (o !== this.site && !(o as THREE.Light).isLight && o.visible) { o.visible = false; hidden.push(o); }
    const size = r.getSize(new THREE.Vector2()), dpr = r.getPixelRatio(), vw = 320, vh = 180;
    const cam = camera.clone();
    cam.aspect = 16 / 9;
    cam.updateProjectionMatrix();
    const base = camera.position.clone(), out: number[] = [];
    try {
      r.setScissorTest(true);
      for (const s of shifts) {
        cam.position.set(base.x + s.dx, base.y + s.dy, base.z + s.dz);
        cam.updateMatrixWorld();
        r.setViewport(0, 0, vw, vh);
        r.setScissor(0, 0, vw, vh);
        r.render(this.scene, cam);
        const ch = r.domElement.height;
        out.push(correlate(video, edges(gray(r.domElement, 0, ch - vh * dpr, vw * dpr, vh * dpr, this.g))));
      }
    } finally {
      r.setScissorTest(false);
      r.setViewport(0, 0, size.x, size.y);
      for (const o of hidden) o.visible = true;
    }
    return out;
  }

  dispose(): void {
    this.video.removeAttribute('src');
    this.video.load();
  }
}
