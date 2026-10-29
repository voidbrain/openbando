import { Component, computed, inject, signal } from '@angular/core';
import { FLY_ROUTES, currentStep, flySteps, type FlyAction, type FlyRoute, type FlyState } from '../../core/fly-guide';
import { LiveLinkService } from '../../services/live-link.service';
import { RadioService } from '../../services/radio.service';
import { SimulatorService } from '../../services/simulator.service';
import { SiteService } from '../../services/site.service';
import { StudioService } from '../../services/studio.service';
import { VideoService } from '../../services/video.service';
import { FlightStore } from '../../state/flight.store';
import { LayoutStore } from '../../state/layout.store';
import { isVoidSpec } from '../../three/scene-host';
import type { PanelId } from '../panel-defs';
import { Panel } from '../panel/panel';

const KEY = 'abando-fly-guide';

/** The guided Fly checklist: pick a route, then each step is ticked from what the app already shows (F-018). */
@Component({
  selector: 'app-fly-panel',
  imports: [Panel],
  template: `
    <app-panel id="fly">
      <div class="seg" role="group" aria-label="What are you doing?">
        @for (r of routes; track r.id) {
          <button [class.on]="route() === r.id" [attr.aria-pressed]="route() === r.id" [title]="r.hint" (click)="choose(r.id)">{{ r.label }}</button>
        }
      </div>
      <ol class="steps">
        @for (st of steps(); track st.id; let i = $index) {
          <li [class.now]="i === current()" [class.done]="st.done" [class.off]="!!st.unavailable || skipped().has(st.id)" [attr.aria-current]="i === current() ? 'step' : null">
            <div class="head">
              <span class="state small">{{ st.done ? 'done' : skipped().has(st.id) ? 'skipped' : st.unavailable ? 'not now' : i === current() ? 'next' : '' }}</span>
              <span class="title">{{ st.title }}</span>
            </div>
            @if (i === current() || (!st.done && !skipped().has(st.id))) {
              <div class="dim small">{{ st.unavailable ?? st.hint }}</div>
            }
            @if (i === current()) {
              <div class="row">
                @if (st.action; as a) { <button class="btn primary" (click)="act(a.kind)">{{ a.label }}</button> }
                @if (st.skippable) { <button class="btn" (click)="skip(st.id)">Skip</button> }
              </div>
            }
          </li>
        }
      </ol>
      @if (current() < 0) { <div class="small ok">This route is complete. Choose another, or reopen a skipped step.</div> }
      <div class="row foot">
        <button class="btn" [disabled]="!skipped().size" (click)="back()" title="Reopen the last skipped step">Back</button>
        <button class="btn" (click)="layout.setVisible('fly', false)" title="Close the checklist; loaded files and edits stay">Cancel</button>
      </div>
    </app-panel>
  `,
  styles: `
    .seg { display: flex; margin-bottom: 8px; border: 1px solid var(--line); border-radius: var(--radius-control); overflow: hidden; }
    .seg button { flex: 1; background: none; border: 0; padding: 4px 7px; cursor: pointer; color: var(--dim); }
    .seg button + button { border-left: 1px solid var(--line); }
    .seg button.on { background: var(--accent); color: var(--accent-ink); font-weight: 700; }
    .seg button:not(.on):hover { background: var(--control-hover); color: var(--text); }
    .seg button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
    .steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .steps li { border: 1px solid var(--line); border-radius: var(--radius-control); padding: 6px 8px; }
    .steps li.now { border-color: var(--accent); }
    .steps li.off .title { color: var(--dim); }
    .head { display: flex; gap: 6px; align-items: baseline; }
    .state { min-width: 44px; color: var(--dim); }
    .done .state, .ok { color: var(--accent); }
    .row { display: flex; gap: 6px; margin-top: 6px; }
    .foot { justify-content: flex-end; margin-top: 8px; }
  `,
})
export class FlyPanel {
  protected readonly layout = inject(LayoutStore);
  private readonly site = inject(SiteService);
  private readonly studio = inject(StudioService);
  private readonly flights = inject(FlightStore);
  private readonly video = inject(VideoService);
  private readonly radio = inject(RadioService);
  private readonly sim = inject(SimulatorService);
  private readonly live = inject(LiveLinkService);
  protected readonly routes = FLY_ROUTES;

  // the route and the skipped steps survive a reload: the checklist resumes where it was
  private readonly saved = load();
  protected readonly route = signal<FlyRoute>(this.saved.route);
  protected readonly skipped = signal<ReadonlySet<string>>(new Set(this.saved.skipped));
  private readonly order = signal<readonly string[]>(this.saved.skipped);

  private readonly state = computed<FlyState>(() => {
    const status = this.live.status();
    return {
      bando: !isVoidSpec(this.site.active()),
      logs: this.flights.count(),
      video: this.video.loaded(),
      synced: this.video.synced(),
      controller: !!this.radio.padName(),
      simulatorOpen: this.layout.panels().simulator.visible,
      armed: this.sim.armed(),
      live: status === 'connected' || status === 'receiving' ? 'connected' : status === 'connecting' ? 'connecting' : status === 'idle' ? 'idle' : 'error',
    };
  });
  protected readonly steps = computed(() => flySteps(this.route(), this.state(), this.skipped()));
  protected readonly current = computed(() => currentStep(this.steps(), this.skipped()));

  protected choose(route: FlyRoute): void {
    this.route.set(route);
    this.skipped.set(new Set());
    this.order.set([]);
    this.save();
  }

  protected skip(id: string): void {
    this.skipped.update((s) => new Set([...s, id]));
    this.order.update((o) => [...o, id]);
    this.save();
  }

  protected back(): void {
    const last = this.order().at(-1);
    if (!last) return;
    this.order.update((o) => o.slice(0, -1));
    this.skipped.update((s) => new Set([...s].filter((id) => id !== last)));
    this.save();
  }

  /** Open what a step needs. Nothing here arms the simulator or connects the live link: the pilot does that. */
  protected act(kind: FlyAction): void {
    if (kind === 'bandos') {
      this.studio.view.set('list');
      this.layout.setVisible('studio', true);
      return;
    }
    const panel: Record<Exclude<FlyAction, 'bandos'>, PanelId> = { flights: 'flights', video: 'video', path: 'path', radio: 'radio', simulator: 'simulator', live: 'live' };
    this.layout.setVisible(panel[kind], true);
  }

  private save(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify({ route: this.route(), skipped: this.order() }));
    } catch {
      /* no storage: the checklist simply starts over next time */
    }
  }
}

function load(): { route: FlyRoute; skipped: string[] } {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { route?: unknown; skipped?: unknown } | null;
    const route = FLY_ROUTES.some((r) => r.id === v?.route) ? (v!.route as FlyRoute) : 'replay';
    const skipped = Array.isArray(v?.skipped) ? v!.skipped.filter((x): x is string => typeof x === 'string') : [];
    return { route, skipped };
  } catch {
    return { route: 'replay', skipped: [] };
  }
}
