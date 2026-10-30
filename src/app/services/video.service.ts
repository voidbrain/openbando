import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { findFirstYawFlick, findFlips } from '../core/flight/analysis';
import { matchVideoToLog, type SyncFeatures } from '../core/sync/matcher';
import { LayoutStore } from '../state/layout.store';
import { FlightStore } from '../state/flight.store';
import { PlaybackStore } from '../state/playback.store';
import { FlightService } from './flight.service';
import { FrameLoopService, FrameOrder } from './frame-loop.service';
import { PlaybackService } from './playback.service';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { scanVideo } from './video-scanner';
import { scanRate } from '../core/sync/features';

const SYNC_KEY_PREFIX = 'abando-sync:';
const MIN_RESTART_INTERVAL_MS = 400;
/** A seek the video has not finished after this long is issued again (B-040: a stalled seek froze the frame). */
const SEEK_STALL_MS = 1000;

/**
 * The flight video (a local file, nothing is uploaded) kept in sync with the replay: a fixed offset
 * (video time = replay time + offset) remembered per video + flight, manual anchors (lift-off / flip / yaw flick), and
 * automatic sync by comparing camera motion with the gyro. While playing forward the video is the master clock.
 */
@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly flights = inject(FlightService);
  private readonly flightStore = inject(FlightStore);
  private readonly playback = inject(PlaybackService);
  private readonly transport = inject(PlaybackStore);
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);

  /** The one <video> element, shared by the Video panel and (when selected) the main page. */
  readonly element: HTMLVideoElement = this.createElement();
  readonly fileName = signal('');
  readonly loaded = signal(false);
  readonly frameReady = signal(false);
  readonly loadFailed = signal(false);
  readonly offset = signal(0);
  /** Scan / sync progress and result line. */
  readonly status = signal('');
  readonly busy = signal(false);
  /** The video and the active flight are synced (found, restored or set by hand): the panel then hides Load video. */
  readonly synced = signal(false);
  /** Data for the alignment plot, set after an auto-sync. */
  readonly features = signal<SyncFeatures | null>(null);
  /** An exact render drives the video itself: normal syncing pauses. */
  suspended = false;

  quietSyncNotifications = false;
  private readonly layout = inject(LayoutStore);

  private objectUrl: string | null = null;
  private fileKey = '';
  private lastPlayAttempt = 0;
  /**
   * The loaded video has been started once (muted, an instant, then paused again). Safari does not redraw a video that
   * never played after a paused seek: the time moved, the picture stayed (B-040: timeline clicks after Auto-sync, before
   * any Play). A priming play while paused is invisible: the replay reads the video's clock only while it plays.
   */
  private primed = false;
  private priming = false;
  /** When the app last asked the video to seek and the video has not said `seeked` since; 0 when none is pending. */
  private seekIssuedAt = 0;
  private lastSeekTarget = -1;
  /** A seek of the video alone (manual sync): the replay must not follow it. */
  private ownSeek = false;

  constructor() {
    this.playback.clock = {
      time: () => {
        const v = this.element;
        return this.loaded() && v.readyState >= 2 && !v.paused && !v.seeking ? v.currentTime - this.offset() : null;
      },
    };
    inject(FrameLoopService).add(FrameOrder.video, () => this.syncFrame());
    // A different flight: pick up the sync saved for this video + flight.
    effect(() => {
      this.flightStore.activeId();
      untracked(() => this.restoreSync());
    });
    // A seek of the replay (timeline click, ±10 s, a guide step) moves the video at once: while it plays the video's
    // clock leads, and it would pull the replay straight back to where the video still was.
    this.playback.onSeek((t) => {
      if (this.suspended || !this.loaded() || this.element.readyState < 1) return;
      const target = Math.max(0, t + this.offset());
      // while a seek is pending `currentTime` reports its target, not the frame shown: never skip on it then
      if (!this.seekIssuedAt && Math.abs(this.element.currentTime - target) < 0.05) return;
      this.ownSeek = true; // not a seek of the video alone: the replay is already there
      this.seekVideo(target);
      this.lastSeekTarget = target;
    });
    // Seeking the video's own bar while paused moves the replay with it.
    this.element.addEventListener('seeked', () => {
      this.seekIssuedAt = 0;
      if (this.ownSeek) {
        this.ownSeek = false;
        return;
      }
      const f = this.flights.active;
      if (this.transport.playing() || !this.loaded() || !f) return;
      const expected = this.playback.time + this.offset();
      if (Math.abs(this.element.currentTime - expected) > 0.25) {
        this.playback.seekTo(this.element.currentTime - this.offset());
        this.lastSeekTarget = this.playback.time + this.offset();
      }
    });
  }

  load(file: File, options: {guided?: boolean} = {}): void {
    if (!options.guided) {
      this.layout.setVisible('flights', true);
      this.layout.setVisible('video', true);
    }
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = URL.createObjectURL(file);
    this.frameReady.set(false);
    this.loadFailed.set(false);
    this.element.src = this.objectUrl;
    this.primed = false;
    this.lastSeekTarget = -1;
    this.fileKey = `${file.name}:${file.size}`;
    this.fileName.set(file.name);
    this.loaded.set(true);
    this.features.set(null);
    this.synced.set(false);
    this.toast.show(`Video loaded: ${file.name}`);
    this.restoreSync(!options.guided);
  }

  setOffset(seconds: number): void {
    const o = isFinite(seconds) ? seconds : 0;
    this.offset.set(o);
    this.synced.set(this.loaded());
    this.lastSeekTarget = -1;
    const key = this.syncKey();
    if (key) this.storage.write(key, String(o));
  }

  /**
   * Move the video alone by `seconds` (the replay pauses and stays where it is): for a manual sync, step the video to a
   * moment, then "Sync here" or "Video here = …". The video has no controls of its own; the timeline drives it.
   */
  stepVideo(seconds: number): void {
    if (!this.loaded()) return;
    if (this.transport.playing()) this.playback.pause();
    const v = this.element;
    this.ownSeek = true;
    this.seekVideo(Math.max(0, Math.min((v.duration || 1e9) - 0.001, v.currentTime + seconds)));
  }

  /** "The video shows the replay's current moment right now": derive the offset from the video's position. */
  syncHere(): void {
    this.setOffset(this.element.currentTime - this.playback.time);
    this.toast.show(`Video offset ${this.offset().toFixed(2)} s`);
  }

  anchorLiftoff(): void {
    const f = this.flights.active;
    const t = f && this.flights.liftoff(f);
    if (t == null || !this.loaded()) return this.toast.show('Need a log with a lift-off and a loaded video');
    this.anchor(t, `lift-off at log ${t.toFixed(2)} s`);
  }

  anchorFlip(): void {
    const f = this.flights.active;
    const flip = f && findFlips(f)[0];
    if (!flip || !this.loaded()) return this.toast.show('Need a log with a flip or roll in the first 25 s of flight, and a loaded video');
    this.anchor(flip.t, `middle of the ${flip.kind} (log ${flip.t.toFixed(2)} s)`);
  }

  anchorYawFlick(): void {
    const f = this.flights.active;
    const t = f && findFirstYawFlick(f);
    if (t == null || !this.loaded()) return this.toast.show('Need a log with a yaw flick after lift-off, and a loaded video');
    this.anchor(t, `first yaw flick at log ${t.toFixed(2)} s`);
  }

  /** Scan the video and find the offset automatically. */
  async autoSync(fromSeconds: number, lengthSeconds: number): Promise<void> {
    const f = this.flights.active;
    if (!this.loaded() || !this.objectUrl) return this.toast.show('Load the video first');
    if (!f) return this.toast.show('Load a log first');
    const lift = this.flights.liftoff(f);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.src = this.objectUrl;
    this.busy.set(true);
    this.status.set('opening video…');
    try {
      await new Promise<void>((resolve, reject) => {
        v.onloadedmetadata = () => resolve();
        v.onerror = () => reject(new Error('this browser cannot decode the video (try a 1080p H.264 proxy)'));
        setTimeout(() => reject(new Error('video did not open')), 15000);
      });
      const from = Math.max(0, fromSeconds || 0);
      const to = Math.min(from + (lengthSeconds || 90), v.duration || 1e9);
      // fast first; when that decodes too few frames or finds no match (a 4K file the browser cannot keep up with), slowly
      const rates = [...new Set([scanRate(v.videoWidth, v.videoHeight), 1])];
      let outcome: ReturnType<typeof matchVideoToLog> | null = null, samples: Awaited<ReturnType<typeof scanVideo>> = [];
      for (const [i, rate] of rates.entries()) {
        const slow = i > 0 ? ' (again, slower)' : '';
        samples = await scanVideo(v, from, to, (t) => this.status.set(`scanning ${t.toFixed(0)} / ${to.toFixed(0)} s${slow}`), rate);
        outcome = samples.length >= 40 ? matchVideoToLog(samples, f) : null;
        if (outcome?.offset != null) break;
      }
      if (samples.length < 40 || !outcome) throw new Error('too few frames decoded (try a 1080p H.264 proxy)');
      this.features.set(outcome.features);
      if (outcome.offset == null) {
        this.status.set(`no reliable match in ${from.toFixed(0)}–${to.toFixed(0)} s of video. Widen “scan s” / set “from s”, or sync manually.`);
        this.toast.show('Auto-sync failed');
        return;
      }
      this.applySync(outcome.offset, outcome.description, lift ?? 0);
    } catch (e) {
      this.status.set('');
      this.toast.show(`Auto-sync: ${(e as Error).message}`);
    } finally {
      this.busy.set(false);
      v.removeAttribute('src');
      v.load();
    }
  }

  /** A sync found: the offset, the replay back to `from` (the lift-off), the video on the same moment, the result line. */
  applySync(offset: number, description: string, from: number): void {
    this.setOffset(offset);
    this.playback.seekTo(from);
    this.seekVideo(Math.max(0, this.playback.time + offset));
    this.status.set(`offset ${offset.toFixed(2)} s · ${description}`);
    this.toast.show(`Auto-synced: offset ${offset.toFixed(2)} s`);
  }

  /** Seek to an exact video time and wait until that frame is ready to be drawn (for frame-exact rendering). */
  async seekExact(t: number): Promise<void> {
    const v = this.element;
    if (!this.loaded() || v.readyState < 1) return;
    const target = Math.max(0, Math.min(t, (v.duration || 1e9) - 0.001));
    if (Math.abs(v.currentTime - target) < 5e-4 && !v.seeking) return;
    await new Promise<void>((resolve) => {
      let done = false;
      const finish = (): void => {
        if (done) return;
        done = true;
        v.removeEventListener('seeked', finish);
        resolve();
      };
      v.addEventListener('seeked', finish);
      this.seekVideo(target);
      setTimeout(finish, 1500);
    });
    if (typeof v.requestVideoFrameCallback === 'function') {
      await new Promise<void>((resolve) => {
        v.requestVideoFrameCallback(() => resolve());
        setTimeout(resolve, 250);
      });
    }
  }

  private anchor(logTime: number, what: string): void {
    this.setOffset(this.element.currentTime - logTime);
    this.playback.seekTo(logTime);
    this.toast.show(`Video time ${this.element.currentTime.toFixed(2)} s = ${what}`);
  }

  private syncKey(): string | null {
    const f = this.flights.active;
    return this.fileKey && f ? `${SYNC_KEY_PREFIX}${this.fileKey}|${f.name}` : null;
  }

  private restoreSync(notify = true): void {
    const key = this.syncKey();
    const saved = key ? this.storage.readRaw(key) : null;
    this.synced.set(saved !== null);
    if (saved === null) return;
    this.offset.set(+saved || 0);
    this.lastSeekTarget = -1;
    if (notify && !this.quietSyncNotifications) this.toast.show(`Restored saved sync (offset ${(+saved).toFixed(2)} s)`);
  }

  /** Per frame: keep the video where the replay is (playing: free-run and correct drift; paused: seek). */
  private syncFrame(): void {
    const v = this.element;
    if (this.suspended || this.priming || !this.loaded() || v.readyState < 1) return;
    const target = this.playback.time + this.offset();
    if (this.transport.playing() && this.transport.direction() > 0) {
      const rate = this.transport.speed();
      if (v.playbackRate !== rate) v.playbackRate = rate;
      const now = performance.now();
      if (v.paused && now - this.lastPlayAttempt > MIN_RESTART_INTERVAL_MS) {
        this.lastPlayAttempt = now;
        void v.play().catch(() => undefined);
      }
      if (Math.abs(v.currentTime - target) > 0.5) v.currentTime = Math.max(0, target);
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(target - this.lastSeekTarget) > (this.transport.playing() ? 0.15 : 0.001)) {
        this.seekVideo(Math.max(0, target));
        this.lastSeekTarget = target;
      } else if (this.seekIssuedAt && performance.now() - this.seekIssuedAt > SEEK_STALL_MS) {
        // the browser dropped the seek (seen after fast timeline drags): the frame stayed old and nothing asked again
        this.seekVideo(Math.max(0, target));
      }
    }
  }

  /** Start the newly loaded video once, muted, and pause it again where the replay is (see {@link primed}). */
  private prime(): void {
    if (this.primed || this.transport.playing()) return;
    this.primed = true;
    this.priming = true;
    const v = this.element;
    // `play()` returns a promise in browsers (not in every test DOM): wrap it either way
    void Promise.resolve(v.play() as Promise<void> | undefined).catch(() => undefined).finally(() => {
      this.priming = false;
      if (this.transport.playing()) return;
      v.pause();
      this.seekVideo(Math.max(0, this.playback.time + this.offset()));
    });
  }

  /** Seek the video and remember it is pending until `seeked`, so a stalled seek is noticed and issued again. */
  private seekVideo(t: number): void {
    this.seekIssuedAt = performance.now();
    this.element.currentTime = t;
  }

  private createElement(): HTMLVideoElement {
    const v = document.createElement('video');
    v.playsInline = true;
    v.muted = true;
    v.preload = 'auto';
    v.addEventListener('loadeddata', () => {
      this.frameReady.set(true);
      this.prime();
    });
    v.addEventListener('canplay', () => this.frameReady.set(true));
    v.addEventListener('error', () => this.loadFailed.set(true));
    return v;
  }
}
