import { Injectable, inject, signal } from '@angular/core';
import * as THREE from 'three';
import { ALIGN_WEIGHTS, alignCandidates, alignFlight, type AlignMoment, type AlignResult } from '../core/flight/auto-align';
import { pinOffset, type MomentPin } from '../core/flight/moment-pins';
import { ReplayPose } from '../core/flight/replay';
import { Vec3 } from '../core/math3d';
import type { Flight } from '../core/models';
import { CalibrationStore } from '../state/calibration.store';
import { ViewStore } from '../state/view.store';
import { FPV_FOV, createOrbitState, placeCamera } from '../three/camera-rig';
import { VisualMatcher } from '../three/visual-match';
import { FlightService } from './flight.service';
import { SceneService } from './scene.service';
import { ToastService } from './toast.service';
import { VideoService } from './video.service';

/** Seconds between the moments the alignment checks (drift is slow: the search blends between them). */
const EVERY = 2;

/** What automatic alignment proposes: the moments it is sure enough of, and those it asks about. */
export interface AlignProposal {
  pins: MomentPin[];
  sure: number;
  likely: number;
  unsure: number;
  /** Moments where the drone still crosses a solid: the model may lack an opening there. */
  throughSolid: number[];
  /** The visual check ran (a video was loaded). */
  visual: boolean;
}

/**
 * Align the active flight automatically (F-041): at a moment every {@link EVERY} s, the shifts of the drone that keep it
 * out of solids and make the model, seen from its camera, match the video frame; a Viterbi search picks the cheapest
 * smooth sequence ({@link alignFlight}). The result is a proposal, previewed on the path, that the pilot keeps or drops.
 */
@Injectable({ providedIn: 'root' })
export class AutoAlignService {
  private readonly flights = inject(FlightService);
  private readonly scene = inject(SceneService);
  private readonly video = inject(VideoService);
  private readonly cal = inject(CalibrationStore);
  private readonly view = inject(ViewStore);
  private readonly toast = inject(ToastService);

  readonly progress = signal<{ done: number; total: number } | null>(null);
  readonly proposal = signal<AlignProposal | null>(null);
  private stopRequested = false;
  private before: MomentPin[] = [];

  stop(): void {
    this.stopRequested = true;
  }

  async run(): Promise<void> {
    const f = this.flights.active, host = this.scene.host;
    if (!f || !host || this.progress()) return;
    if (this.proposal()) this.discard();
    const url = this.video.url, offset = this.video.offset();
    const fine = alignCandidates(12, 2, [-2, -1, 0, 1]);
    const coarse = fine.map((c, i) => [c, i] as const).filter(([c]) => c.dx % 4 === 0 && c.dz % 4 === 0);
    const start = this.flights.liftoff(f) ?? 0, end = f.dur;
    const times: number[] = [];
    for (let t = start + 1; t < end - 0.5; t += EVERY) times.push(t);
    if (!times.length) return;
    this.stopRequested = false;
    this.progress.set({ done: 0, total: times.length });
    const matcher = url ? new VisualMatcher(host.renderer, host.scene, host.site.group, url) : null;
    const moments: AlignMoment[] = [];
    try {
      for (const t of times) {
        if (this.stopRequested) break;
        const cam = this.cameraAt(f, t);
        const visual = matcher ? await this.visualScores(matcher, await matcher.frame(t + offset), cam, fine, coarse) : null;
        moments.push({ t, visual, collisions: this.collisions(f, t, fine) });
        this.progress.set({ done: moments.length, total: times.length });
        await new Promise((r) => setTimeout(r)); // let the page breathe between moments
      }
    } catch (e) {
      this.toast.show(`Automatic alignment stopped: ${(e as Error).message}`);
    } finally {
      matcher?.dispose();
      this.progress.set(null);
    }
    if (!moments.length) return;
    const res = alignFlight(fine, moments, ALIGN_WEIGHTS);
    this.propose(f, res, !!matcher);
  }

  /** Keep the proposal as pins (marked automatic); the pilot's own pins stay. */
  keep(): void {
    const p = this.proposal(), f = this.flights.active;
    if (!p || !f) return;
    this.flights.setPins(f, f.pins ?? []);
    this.proposal.set(null);
    this.toast.show(`Kept ${p.pins.length} automatic pins. Pins and Adjust position still correct any moment.`);
  }

  /** Drop the proposal: the path as it was. */
  discard(): void {
    const f = this.flights.active;
    if (f && this.proposal()) this.flights.previewPins(f, this.before);
    this.proposal.set(null);
  }

  private propose(f: Flight, results: AlignResult[], visual: boolean): void {
    this.before = f.pins ?? [];
    const own = this.before.filter((p) => !p.auto);
    // the pilot's own pins win: no automatic pin within 2 s of one
    const near = (t: number): boolean => own.some((p) => Math.abs(p.t - t) < 2);
    const kept = results.filter((r) => r.confidence !== 'unsure' && !near(r.t));
    // the search shifts the path as it is now (own pins included): add on top of what is there at that moment
    const pins: MomentPin[] = [...own, ...kept.map((r) => {
      const now = pinOffset(own, r.t);
      return { t: r.t, dx: now.dx + r.offset.dx, dz: now.dz + r.offset.dz, ...(now.dy + r.offset.dy ? { dy: now.dy + r.offset.dy } : {}), auto: true as const };
    })].sort((a, b) => a.t - b.t);
    const count = (c: AlignResult['confidence']): number => results.filter((r) => r.confidence === c).length;
    this.proposal.set({ pins, sure: count('sure'), likely: count('likely'), unsure: count('unsure'), throughSolid: results.filter((r) => r.throughSolid).map((r) => r.t), visual });
    this.flights.previewPins(f, pins);
  }

  /** The FPV camera of the replay at `t`, as the FPV view places it. */
  private cameraAt(f: Flight, t: number): THREE.PerspectiveCamera {
    const pose = new ReplayPose();
    pose.update(f, t, this.cal.calibration(), 1);
    const cam = new THREE.PerspectiveCamera(FPV_FOV, 16 / 9, 0.05, 1200);
    placeCamera(cam, 'fpv', createOrbitState(), { p: pose.p, q: pose.q }, { orbitFollow: false, calRotDeg: this.cal.rot(), fpvTiltDeg: this.view.fpvTiltDeg() }, 0);
    cam.updateMatrixWorld();
    return cam;
  }

  /** Visual scores, coarse to fine: every 4 m first, then every 2 m around the three best; the rest take their coarse neighbour's. */
  private async visualScores(m: VisualMatcher, frame: Float32Array, cam: THREE.PerspectiveCamera, fine: ReturnType<typeof alignCandidates>, coarse: readonly (readonly [ReturnType<typeof alignCandidates>[number], number])[]): Promise<number[]> {
    const cs = m.score(frame, cam, coarse.map(([c]) => c));
    const scores = fine.map((c) => {
      let best = 0, d = Infinity;
      coarse.forEach(([k], i) => { const e = Math.hypot(k.dx - c.dx, k.dy - c.dy, k.dz - c.dz); if (e < d) { d = e; best = cs[i]!; } });
      return best;
    });
    const top = coarse.map(([k], i) => ({ k, s: cs[i]! })).sort((a, b) => b.s - a.s).slice(0, 3);
    const refine = fine.map((c, i) => [c, i] as const).filter(([c]) => top.some(({ k }) => Math.abs(k.dx - c.dx) <= 2 && Math.abs(k.dz - c.dz) <= 2 && k.dy === c.dy));
    const rs = m.score(frame, cam, refine.map(([c]) => c));
    refine.forEach(([, i], j) => (scores[i] = rs[j]!));
    return scores;
  }

  /** Per candidate: fixes within a second of `t` inside a solid when shifted by it. */
  private collisions(f: Flight, t: number, fine: ReturnType<typeof alignCandidates>): number[] {
    const collider = this.scene.host!.site.collider, first = f.pts[0]!.t;
    const idx = f.pts.map((p, i) => [p.t - first, i] as const).filter(([s]) => Math.abs(s - t) <= 1).map(([, i]) => i);
    const v = new Vec3();
    return fine.map((c) => idx.reduce((n, i) => { const p = f.loc[i]!; return n + (collider.hit(v.set(p.x + c.dx, p.y + c.dy, p.z + c.dz)) ? 1 : 0); }, 0));
  }
}
