import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  MAX_PILOTS,
  MAX_POINTS,
  PILOT_COLORS,
  gateFromTrack,
  lapTimes,
  parseRacePack,
  parseGate,
  type Gate,
  type RacePack,
  type RacePoint,
  type RaceTrack,
} from '../core/racing/race';
import { FlightService } from './flight.service';
import { FlightStore } from '../state/flight.store';
import { CalibrationStore } from '../state/calibration.store';
import { ViewStore } from '../state/view.store';
import { FrameLoopService, FrameOrder } from './frame-loop.service';

interface External {
  track: RaceTrack;
  frame: string;
  received: number;
  owner: string;
}
type TrackOptions = Partial<Pick<RaceTrack, 'name' | 'color' | 'offset' | 'visible' | 'closed'>>;
/** Race clock is independent of the active-flight/video clock. Local logs remain owned by FlightService. */
@Injectable({ providedIn: 'root' })
export class RaceService {
  private readonly flights = inject(FlightService);
  private readonly store = inject(FlightStore);
  private readonly cal = inject(CalibrationStore);
  private readonly view = inject(ViewStore);
  readonly enabled = signal(false);
  readonly playing = signal(false);
  readonly repeat = signal(false);
  readonly gate = signal<Gate | null>(null);
  readonly clock = signal(0);
  readonly siteKey = signal('race-empty');
  readonly frame = computed(() => `${this.siteKey()}:${Math.round(this.cal.modelScale() * 1000)}`);
  private readonly options = signal<Record<string, TrackOptions>>({});
  private readonly external = signal<External[]>([]);
  private readonly now = signal(performance.now());
  time = 0;
  readonly tracks = computed(() => {
    this.store.revision();
    const opts = this.options();
    const local = this.flights.all
      .slice(0, MAX_PILOTS)
      .filter((f) => f.loc.length >= 2)
      .map((f, i): RaceTrack => ({
        id: f.id,
        name: f.name,
        color: PILOT_COLORS[i % PILOT_COLORS.length]!,
        offset: 0,
        visible: true,
        closed: false,
        live: f.live,
        points: Array.from({ length: Math.min(f.loc.length, MAX_POINTS) }, (_, j) => {
          const k = Math.floor((j * (f.loc.length - 1)) / (Math.min(f.loc.length, MAX_POINTS) - 1)),
            p = f.loc[k]!;
          return { x: p.x, y: p.y, z: p.z, t: f.pts[k]!.t - f.pts[0]!.t };
        }),
        ...opts[f.id],
      }));
    const rest = this.external()
      .filter((e) => e.frame === this.frame())
      .map((e) => ({ ...e.track, ...opts[e.track.id] }));
    return [...local, ...rest].slice(0, MAX_PILOTS);
  });
  readonly duration = computed(() =>
    Math.max(
      0,
      ...this.tracks()
        .filter((t) => !t.live)
        .map((t) => Math.max(0, t.points.at(-1)!.t - t.points[0]!.t + t.offset)),
    ),
  );
  readonly rows = computed(() => {
    const gate = this.gate();
    return this.tracks().map((t) => {
      const laps = t.closed && gate ? lapTimes(t.points, gate) : [];
      return { track: t, laps, best: laps.length ? Math.min(...laps.map((l) => l.seconds)) : null };
    });
  });
  constructor() {
    let last = '';
    effect(() => {
      const frame = this.frame();
      if (frame !== last) {
        last = frame;
        untracked(() => {
          this.external.set([]);
          this.gate.set(null);
          this.seek(0);
          this.playing.set(false);
        });
      }
    });
    inject(FrameLoopService).add(FrameOrder.playback, (_dt, raw) => {
      if (performance.now() - this.now() > 1000) this.now.set(performance.now());
      if (!this.enabled() || !this.playing() || document.hidden) return;
      if (!this.tracks().length) {
        this.playing.set(false);
        this.time = 0;
        this.clock.set(0);
        return;
      }
      this.time += raw;
      const max = this.duration();
      if (max > 0 && this.time > max) {
        if (this.repeat()) this.time %= max;
        else {
          this.time = max;
          this.playing.set(false);
        }
      }
      if (Math.abs(this.clock() - this.time) >= 0.1 || !this.playing()) this.clock.set(this.time);
    });
  }
  set(id: string, patch: TrackOptions): void {
    if (patch.offset !== undefined && !Number.isFinite(patch.offset)) return;
    if (patch.color !== undefined && !/^#[0-9a-f]{6}$/i.test(patch.color)) return;
    if (patch.name !== undefined)
      patch = { ...patch, name: patch.name.trim().slice(0, 80) || 'Pilot' };
    this.options.update((o) => ({
      ...o,
      [id]: {
        ...o[id],
        ...patch,
        ...(patch.offset === undefined
          ? {}
          : { offset: Math.max(-86400, Math.min(86400, patch.offset)) }),
      },
    }));
  }
  start(): void {
    this.enabled.set(true);
    this.view.setCameraView('orbit');
    this.playing.set(true);
  }
  seek(t: number): void {
    this.time = Math.max(0, Math.min(this.duration(), Number.isFinite(t) ? t : 0));
    this.clock.set(this.time);
  }
  useGate(id: string): void {
    this.gate.set(gateFromTrack(this.tracks().find((t) => t.id === id)?.points ?? []));
  }
  setGate(patch: Partial<Gate>): void {
    const gate = this.gate();
    if (gate) {
      const checked = parseGate({
        ...gate,
        ...patch,
        ...(patch.height === undefined ? {} : { y: gate.y + (patch.height - gate.height) / 2 }),
      });
      if (checked) this.gate.set(checked);
    }
  }
  stale(id: string, now = this.now()): boolean {
    const e = this.external().find((e) => e.track.id === id);
    return !!e && e.track.live && now - e.received > 5000;
  }
  pack(localOnly = false, preserveLive = false): RacePack {
    const externalIds = new Set(
      this.external()
        .filter((e) => e.owner !== 'direct')
        .map((e) => e.track.id),
    );
    return parseRacePack({
      format: 'openbando-race',
      version: 1,
      frame: this.frame(),
      gate: this.gate(),
      tracks: this.tracks()
        .filter((t) => !localOnly || !externalIds.has(t.id))
        .map((t) => ({ ...t, live: preserveLive && t.live })),
    });
  }
  importPack(raw: unknown): void {
    const pack = parseRacePack(raw);
    if (pack.frame !== this.frame())
      throw new Error('Open the same bando and model scale before importing this race');
    const prefix = crypto.randomUUID();
    if (this.tracks().length + pack.tracks.length > MAX_PILOTS)
      throw new Error('Racing supports at most eight pilots');
    this.external.update((es) => [
      ...es,
      ...pack.tracks.map((track, i) => ({
        track: { ...track, id: `import:${prefix}:${i}`, live: false },
        frame: pack.frame,
        received: performance.now(),
        owner: 'import',
      })),
    ]);
    if (pack.gate) this.gate.set(pack.gate);
    this.enabled.set(true);
  }
  /** Replace just one room publisher atomically; never erase local logs or another publisher. */
  receive(owner: string, frame: string, tracks: RaceTrack[]): void {
    if (frame !== this.frame()) return;
    const other = this.external().filter((e) => e.owner !== owner);
    const localCount = this.flights.all.filter((f) => f.loc.length >= 2).length;
    if (localCount + other.length + tracks.length > MAX_PILOTS)
      throw new Error('Racing supports at most eight pilots');
    const room = tracks.map((t) => ({
      track: { ...t, id: `peer:${owner}:${t.id}`, live: t.live },
      frame,
      received: performance.now(),
      owner,
    }));
    this.external.set([...other, ...room]);
  }
  removeOwner(owner: string): void {
    this.external.update((es) => es.filter((e) => e.owner !== owner));
  }
  clearShared(): void {
    this.external.set([]);
  }
  /** Direct telemetry: caller already projected GPS into this bando. A full trace is bounded, never silently truncated. */
  livePoint(id: string, name: string, p: RacePoint): void {
    const existing = this.external().find((e) => e.track.id === id);
    if (!existing && this.tracks().length >= MAX_PILOTS)
      throw new Error('Racing supports at most eight pilots');
    const points = existing?.track.points ?? [];
    if (points.length >= MAX_POINTS)
      throw new Error('Live trace limit reached; reconnect to start a new recording');
    if (points.length && p.t <= points.at(-1)!.t) return;
    const track: RaceTrack = existing?.track ?? {
      id,
      name,
      color: PILOT_COLORS[this.tracks().length % PILOT_COLORS.length]!,
      points: [],
      offset: 0,
      visible: true,
      closed: false,
      live: true,
    };
    const e = {
      track: { ...track, points: [...points, p], live: true },
      frame: this.frame(),
      received: performance.now(),
      owner: 'direct',
    };
    this.external.update((es) => [...es.filter((e) => e.track.id !== id), e]);
  }
  finishLive(id: string): void {
    this.external.update((es) =>
      es.map((e) => (e.track.id === id ? { ...e, track: { ...e.track, live: false } } : e)),
    );
  }
}
