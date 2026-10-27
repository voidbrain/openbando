import { DestroyRef, Injectable, effect, inject, signal, untracked } from '@angular/core';
import { normalizeLive, hasFix } from '../core/live/live-normalizer';
import { toLocal } from '../core/geo';
import { activeGround, hiddenSite } from '../core/takeoff';
import { MAX_PILOTS, parseRacePack } from '../core/racing/race';
import { CalibrationStore } from '../state/calibration.store';
import { RaceService } from './race.service';

interface Link {
  id: string;
  name: string;
  url: string;
  status: string;
}
@Injectable({ providedIn: 'root' })
export class RaceLinksService {
  readonly race = inject(RaceService);
  private readonly cal = inject(CalibrationStore);
  readonly links = signal<Link[]>([]);
  readonly roomStatus = signal('');
  readonly joined = signal(false);
  readonly broadcastLive = signal(false);
  private readonly sources = new Map<string, WebSocket | EventSource>();
  private abort: AbortController | null = null;
  private roomUrl = '';
  private roomToken = '';
  private readonly clientId = crypto.randomUUID();
  private owners = new Map<string, number>();
  private posting = false;
  constructor() {
    let frame = this.race.frame();
    effect(() => {
      const next = this.race.frame();
      if (next !== frame) {
        frame = next;
        untracked(() => {
          this.leave();
          for (const id of [...this.sources.keys()]) this.disconnect(id);
        });
      }
    });
    const timer = setInterval(() => {
      if (this.joined() && this.broadcastLive() && this.race.tracks().some((t) => t.live))
        void this.publish();
    }, 1000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.leave();
      for (const id of [...this.sources.keys()]) this.disconnect(id);
    });
  }
  private status(id: string, status: string): void {
    this.links.update((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)));
  }
  connect(name: string, url: string): void {
    if (this.links().length >= MAX_PILOTS) throw new Error('Racing supports at most eight pilots');
    const target = new URL(url);
    if (
      !['ws:', 'wss:', 'http:', 'https:'].includes(target.protocol) ||
      target.username ||
      target.password
    )
      throw new Error('Use a WebSocket or event-stream URL');
    const id = `live:${crypto.randomUUID()}`,
      label = name.trim().slice(0, 80) || 'Pilot';
    const src = /^https?:$/.test(target.protocol)
      ? new EventSource(target.href)
      : new WebSocket(target.href);
    this.sources.set(id, src);
    this.links.update((xs) => [...xs, { id, name: label, url: target.href, status: 'Connecting' }]);
    let start: number | null = null,
      last = -Infinity,
      base = 0;
    src.onopen = () => {
      if (this.sources.get(id) === src) this.status(id, 'Waiting for GPS');
    };
    src.onmessage = (e: MessageEvent) => {
      if (this.sources.get(id) !== src || typeof e.data !== 'string' || e.data.length > 65536)
        return;
      for (const line of e.data.split('\n')) {
        let m;
        try {
          m = normalizeLive(JSON.parse(line));
        } catch {
          continue;
        }
        if (
          !m ||
          !hasFix(m) ||
          !Number.isFinite(m.lat) ||
          !Number.isFinite(m.lon) ||
          Math.abs(m.lat) > 90 ||
          Math.abs(m.lon) > 180 ||
          !Number.isFinite(m.alt ?? 0)
        )
          continue;
        const now = performance.now() / 1000;
        if (now - last < 0.2) continue;
        let [x, z] = toLocal(m.lat, m.lon, this.cal.calibration());
        if (Math.abs(x) > 20000 || Math.abs(z) > 20000) continue;
        if (hiddenSite() && !this.cal.calibration().reference) {
          this.cal.setReference({ lat: m.lat, lon: m.lon });
          [x, z] = toLocal(m.lat, m.lon, this.cal.calibration());
        }
        if (start === null) {
          start = now;
          base = (activeGround()?.(x, z) ?? 0) - (m.alt ?? 0) + 0.3;
        }
        last = now;
        const y = Math.max((activeGround()?.(x, z) ?? 0) + 0.2, base + (m.alt ?? 0));
        if (Math.abs(y) > 20000) continue;
        try {
          this.race.livePoint(id, label, { x, y, z, t: now - start });
          this.status(id, 'Receiving');
        } catch (e) {
          this.disconnect(id);
          this.links.update((xs) => [
            ...xs,
            { id, name: label, url: target.href, status: (e as Error).message },
          ]);
          return;
        }
      }
    };
    src.onerror = () => {
      if (this.sources.get(id) === src) this.status(id, 'Connection error');
    };
    if (src instanceof WebSocket)
      src.onclose = () => {
        if (this.sources.get(id) === src) {
          this.sources.delete(id);
          this.race.finishLive(id);
          this.status(id, 'Disconnected');
        }
      };
  }
  disconnect(id: string): void {
    const src = this.sources.get(id);
    this.sources.delete(id);
    if (src) {
      src.onopen = null;
      src.onmessage = null;
      src.onerror = null;
      if (src instanceof WebSocket) src.onclose = null;
      src.close();
    }
    this.race.finishLive(id);
    this.links.update((xs) => xs.filter((x) => x.id !== id));
  }
  async join(base: string, room: string, token: string): Promise<void> {
    this.leave();
    const target = new URL(base);
    if (
      !['http:', 'https:'].includes(target.protocol) ||
      target.username ||
      target.password ||
      target.search ||
      target.hash
    )
      throw new Error('Use an HTTP relay base URL');
    if (!/^[a-zA-Z0-9_-]{1,48}$/.test(room) || token.length < 16)
      throw new Error('Room needs a name and a token of at least 16 characters');
    this.roomUrl = `${target.href.replace(/\/$/, '')}/rooms/${encodeURIComponent(room)}`;
    this.roomToken = token;
    const controller = new AbortController();
    this.abort = controller;
    this.roomStatus.set('Connecting');
    try {
      const response = await fetch(
        `${this.roomUrl}?frame=${encodeURIComponent(this.race.frame())}`,
        {
          headers: { Authorization: `Bearer ${token}`, 'X-Race-Client': this.clientId },
          signal: controller.signal,
        },
      );
      if (!response.ok || !response.body) throw new Error(`Relay HTTP ${response.status}`);
      this.joined.set(true);
      this.race.enabled.set(true);
      this.roomStatus.set('Connected');
      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      let pending = '';
      while (!controller.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        pending += decoder.decode(value, { stream: true });
        if (pending.length > 8 * 1024 * 1024) throw new Error('Relay snapshot is too large');
        let boundary;
        while ((boundary = pending.indexOf('\n\n')) >= 0) {
          const event = pending.slice(0, boundary);
          pending = pending.slice(boundary + 2);
          const data = event
            .split('\n')
            .filter((l) => l.startsWith('data: '))
            .map((l) => l.slice(6))
            .join('\n');
          if (data) this.snapshot(JSON.parse(data));
        }
      }
      if (!controller.signal.aborted)
        this.roomStatus.set('Relay disconnected; join again to reconnect');
    } catch (e) {
      if (!controller.signal.aborted) this.roomStatus.set((e as Error).message);
    } finally {
      if (this.abort === controller) {
        controller.abort();
        this.joined.set(false);
        this.abort = null;
      }
    }
  }
  private snapshot(raw: unknown): void {
    if (
      !raw ||
      typeof raw !== 'object' ||
      !('owners' in raw) ||
      !Array.isArray(raw.owners) ||
      raw.owners.length > 8
    )
      throw new Error('Invalid relay snapshot');
    const seen = new Set<string>();
    for (const row of raw.owners) {
      if (
        !row ||
        typeof row !== 'object' ||
        typeof row.id !== 'string' ||
        !/^[a-zA-Z0-9_-]{1,64}$/.test(row.id) ||
        !Number.isSafeInteger(row.updated)
      )
        throw new Error('Invalid relay publisher');
      if (row.id === this.clientId) continue;
      const pack = parseRacePack(row.pack);
      seen.add(row.id);
      if (this.owners.get(row.id) === row.updated) continue;
      this.race.receive(row.id, pack.frame, pack.tracks);
      this.owners.set(row.id, row.updated);
    }
    for (const owner of this.owners.keys())
      if (!seen.has(owner)) {
        this.race.removeOwner(owner);
        this.owners.delete(owner);
      }
  }
  async publish(): Promise<void> {
    if (!this.joined() || this.posting) return;
    this.posting = true;
    try {
      const pack = this.race.pack(true, true),
        body = JSON.stringify({ id: this.clientId, pack });
      if (body.length > 2 * 1024 * 1024)
        throw new Error('Race upload exceeds the relay limit; share fewer paths');
      const response = await fetch(this.roomUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.roomToken}`, 'Content-Type': 'application/json' },
        body,
        signal: this.abort?.signal,
      });
      if (!response.ok) throw new Error(`Relay HTTP ${response.status}`);
      this.roomStatus.set('Local paths shared');
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError'))
        this.roomStatus.set((e as Error).message);
    } finally {
      this.posting = false;
    }
  }
  leave(): void {
    this.abort?.abort();
    this.abort = null;
    this.joined.set(false);
    this.broadcastLive.set(false);
    this.roomUrl = '';
    this.roomToken = '';
    for (const owner of this.owners.keys()) this.race.removeOwner(owner);
    this.owners.clear();
    this.roomStatus.set('');
  }
}
