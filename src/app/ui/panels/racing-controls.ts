import { Component, inject, signal } from '@angular/core';
import { RaceService } from '../../services/race.service';
import { RaceLinksService } from '../../services/race-links.service';
import { DownloadService } from '../../services/download.service';
import { checkedFrom, numberFrom, textFrom } from '../dom';

@Component({
  selector: 'app-racing-controls',
  template: `
    <details>
      <summary>Racing and ghosts</summary>
      <p class="dim small">
        Up to eight pilots. Import logs above, or exchange race packages. Open the same bando and
        model scale on every device.
      </p>
      <label class="check"
        ><input
          type="checkbox"
          [checked]="race.enabled()"
          (change)="race.enabled.set(check($event))"
        />Show racing ghosts</label
      >
      @if (race.enabled()) {
        <label class="check"><input type="checkbox" [checked]="race.speedTrails()"
          (change)="race.speedTrails.set(check($event))" />Colour trails by speed</label>
        <p class="dim small">Speed trails: blue slow → red fast. Drones and labels keep pilot colours.</p>
        <div class="row">
          <button class="btn" (click)="race.playing() ? race.playing.set(false) : race.start()">
            {{ race.playing() ? 'Pause race' : 'Play race' }}
          </button>
          <button class="btn" (click)="race.seek(0)">Restart race</button>
          <label class="check"
            ><input
              type="checkbox"
              [checked]="race.repeat()"
              (change)="race.repeat.set(check($event))"
            />Repeat replay</label
          >
        </div>
        <label
          >Race time (s)<input
            type="range"
            min="0"
            step="0.1"
            [max]="race.duration() || 1"
            [value]="race.clock()"
            (input)="race.seek(num($event))"
        /></label>
        <div class="mono small">
          {{ race.clock().toFixed(1) }} s
          @if (race.duration()) {
            / {{ race.duration().toFixed(1) }} s
          }
        </div>
        @for (row of race.rows(); track row.track.id) {
          <div class="pilot">
            <div class="row">
              <input
                type="checkbox"
                [attr.aria-label]="'Show pilot: ' + row.track.name"
                [checked]="row.track.visible"
                (change)="race.set(row.track.id, { visible: check($event) })"
              />
              <input
                type="color"
                [attr.aria-label]="'Pilot colour: ' + row.track.name"
                [value]="row.track.color"
                (input)="race.set(row.track.id, { color: text($event) })"
              />
              <input
                class="grow"
                type="text"
                maxlength="80"
                [attr.aria-label]="'Pilot name: ' + row.track.name"
                [value]="row.track.name"
                (change)="race.set(row.track.id, { name: text($event) })"
              />
              @if (row.track.live) {
                <span class="dim small">{{ race.stale(row.track.id) ? 'Stale GPS' : 'Live' }}</span>
              }
            </div>
            <div class="row">
              <label
                >Start delay (s)<input
                  class="mini"
                  type="number"
                  min="-86400"
                  max="86400"
                  step="0.1"
                  [value]="row.track.offset"
                  (change)="race.set(row.track.id, { offset: num($event) })"
              /></label>
              <label class="check"
                ><input
                  type="checkbox"
                  [checked]="row.track.closed"
                  (change)="race.set(row.track.id, { closed: check($event) })"
                />Closed loop</label
              >
              <button class="btn" (click)="race.useGate(row.track.id)">Set start gate</button>
            </div>
            @if (row.track.closed) {
              <div class="small">
                <span>Laps</span>: {{ row.laps.length }} · <span>Best lap (s)</span>:
                {{ row.best?.toFixed(2) ?? '—' }} · <span>Last lap (s)</span>:
                {{ row.laps.at(-1)?.seconds?.toFixed(2) ?? '—' }}
              </div>
            }
          </div>
        }
        @if (race.gate(); as gate) {
          <div class="row">
            <label
              >Gate width (m)<input
                class="mini"
                type="number"
                min="1"
                max="100"
                [value]="gate.width"
                (change)="race.setGate({ width: num($event) })"
            /></label>
            <label
              >Gate height (m)<input
                class="mini"
                type="number"
                min="1"
                max="100"
                [value]="gate.height"
                (change)="race.setGate({ height: num($event) })"
            /></label>
            <label
              >Minimum lap (s)<input
                class="mini"
                type="number"
                min="1"
                max="600"
                [value]="gate.minSeconds"
                (change)="race.setGate({ minSeconds: num($event) })"
            /></label>
            <label
              >Minimum lap distance (m)<input
                class="mini"
                type="number"
                min="5"
                max="10000"
                [value]="gate.minDistance"
                (change)="race.setGate({ minDistance: num($event) })"
            /></label>
          </div>
        }
        <p class="dim small">
          Set one shared start gate from a path that starts on the line and moves forward. GPS lap
          times are estimates, not official race timing.
        </p>
      }
      <div class="row">
        <button class="btn" [disabled]="!race.tracks().length" (click)="exportRace()">
          Export race
        </button>
        <label class="btn"
          >Import race<input type="file" accept=".json" hidden (change)="importRace($event)"
        /></label>
        <button class="btn" (click)="race.clearShared()">Clear shared paths</button>
      </div>
      <details>
        <summary>Multiple live sources</summary>
        <label
          >Pilot name<input
            type="text"
            maxlength="80"
            [value]="pilot()"
            (input)="pilot.set(text($event))"
        /></label>
        <label
          >Telemetry URL<input type="url" [value]="url()" (input)="url.set(text($event))"
        /></label>
        <button class="btn" (click)="addSource()">Add live source</button>
        @for (link of links.links(); track link.id) {
          <div class="row">
            <span class="grow">{{ link.name }} · {{ link.status }}</span
            ><button class="btn" (click)="links.disconnect(link.id)">Disconnect</button>
          </div>
        }
        <p class="dim small">
          Each source must expose GPS JSON over WebSocket or an HTTP event stream. Video-only
          SquirrelCast links are not telemetry. HTTPS pages need reachable HTTPS/WSS sources with
          the required browser permissions.
        </p>
      </details>
      <details>
        <summary>Shared race room</summary>
        <p class="dim small">
          Optional self-hosted relay. The same exported bando must be open on every device. Sharing
          sends pilot names and local path coordinates; it does not send GPS coordinates, logs or
          video.
        </p>
        <label
          >Relay URL<input
            type="url"
            [value]="relay()"
            (input)="relay.set(text($event))"
            [disabled]="links.joined()"
        /></label>
        <label
          >Room<input
            type="text"
            maxlength="48"
            [value]="room()"
            (input)="room.set(text($event))"
            [disabled]="links.joined()"
        /></label>
        <label
          >Relay token<input
            type="password"
            autocomplete="off"
            [value]="token()"
            (input)="token.set(text($event))"
            [disabled]="links.joined()"
        /></label>
        <div class="row">
          <button class="btn" (click)="links.joined() ? links.leave() : join()">
            {{ links.joined() ? 'Leave room' : 'Join room' }}
          </button>
          <button class="btn" [disabled]="!links.joined()" (click)="links.publish()">
            Share local paths
          </button>
        </div>
        <label class="check"
          ><input
            type="checkbox"
            [disabled]="!links.joined()"
            [checked]="links.broadcastLive()"
            (change)="links.broadcastLive.set(check($event))"
          />Broadcast live paths</label
        >
        <div class="dim small" role="status">{{ links.roomStatus() }}</div>
      </details>
      @if (error()) {
        <p class="err" role="alert">{{ error() }}</p>
      }
    </details>
  `,
  styles: `
    :host {
      display: block;
      border-top: 1px solid var(--line);
      margin-top: 8px;
      padding-top: 6px;
    }
    details {
      margin: 6px 0;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
      margin-bottom: 6px;
    }
    label:not(.check):not(.btn) {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    input {
      max-width: 100%;
      box-sizing: border-box;
    }
    input[type='color'] {
      width: 28px;
      height: 26px;
      padding: 1px;
    }
    .row {
      flex-wrap: wrap;
      gap: 6px;
      margin: 5px 0;
    }
    .grow {
      min-width: 65px;
    }
    .pilot {
      border-top: 1px solid var(--line);
      margin: 8px 0;
      padding-top: 4px;
    }
    .err {
      color: var(--warn);
    }
    .mini {
      width: 70px;
    }
  `,
})
export class RacingControls {
  protected readonly race = inject(RaceService);
  protected readonly links = inject(RaceLinksService);
  private readonly download = inject(DownloadService);
  protected readonly text = textFrom;
  protected readonly num = numberFrom;
  protected readonly check = checkedFrom;
  protected readonly error = signal('');
  protected readonly pilot = signal('Pilot');
  protected readonly url = signal('ws://localhost:8765');
  protected readonly relay = signal('http://localhost:8787');
  protected readonly room = signal('race');
  protected readonly token = signal('');
  protected addSource(): void {
    this.error.set('');
    try {
      this.links.connect(this.pilot(), this.url());
      this.race.enabled.set(true);
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  protected join(): void {
    this.error.set('');
    void this.links
      .join(this.relay(), this.room(), this.token())
      .catch((e) => this.error.set((e as Error).message));
  }
  protected exportRace(): void {
    this.error.set('');
    try {
      this.download.save(
        'openbando.race.json',
        JSON.stringify(this.race.pack()),
        'application/json',
      );
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  protected async importRace(event: Event): Promise<void> {
    const el = event.target as HTMLInputElement,
      file = el.files?.[0];
    el.value = '';
    if (!file) return;
    this.error.set('');
    try {
      if (file.size > 12 * 1024 * 1024) throw new Error('Race package exceeds 12 MB');
      this.race.importPack(JSON.parse(await file.text()));
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
