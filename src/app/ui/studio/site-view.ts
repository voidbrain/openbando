import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { CameraCompass } from '../widgets/camera-compass';
import { CalibrationStore } from '../../state/calibration.store';
import { basementOutline } from '../../core/basement';
import type { Flight } from '../../core/models';
import type { SiteSpec } from '../../core/site-spec';
import { SiteViewRenderer, type DrawLine, type SitePick } from '../../three/site-view';
import type { GroundStyle } from '../../three/site-model';
import type { MeasureViewItem } from '../../three/measure-view';
import type { BuildingHandle } from '../../three/building-handles';

/** The editor's 3D mode: orbit the site, edit the selected indoor floor and share tool/undo paths with the plan. */
@Component({
  selector: 'app-site-view',
  imports: [CameraCompass],
  template: `
    <canvas #cv></canvas>
    @if (measures().length) {
      <div class="measure-access" role="group" aria-label="Measures" (keydown)="$event.stopPropagation()">
        @for (m of measures(); track m.index) {
          <button [attr.aria-pressed]="m.selected" (click)="measurePicked.emit({ index: m.index, label: true })">{{ m.label }}</button>
        }
      </div>
    }
    @if (basementVertices().length) {
      <details class="vertex-access" (keydown)="$event.stopPropagation()">
        <summary>Basement vertices</summary>
        @for (index of basementVertices(); track index) {
          <span class="vertex-row">
            <button class="vertex-key" type="button" [attr.aria-label]="'Move basement vertex ' + (index + 1)" title="Drag or use arrows to move; Insert adds and Delete removes a vertex" (keydown)="basementVertexKey.emit({event: $event, index})">{{ index + 1 }}</button>
            <button type="button" aria-label="Insert basement vertex" (click)="basementVertexInsert.emit(index)"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M6 1V11M1 6H11" fill="none" stroke="currentColor"/></svg></button>
            <button type="button" aria-label="Remove basement vertex" (click)="basementVertexRemove.emit(index)"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M2 2L10 10M10 2L2 10" fill="none" stroke="currentColor"/></svg></button>
          </span>
        }
      </details>
    }
    @if (!failed()) { <app-camera-compass [camera]="compassCamera" (orient)="orientCompass($event)" /> }
    @if (failed()) {
      <div class="fail dim">3D view unavailable (WebGL could not start).</div>
    } @else {
      <div class="cap dim small">{{ mode() === 'select' ? 'click: select · drag handles: move / resize · drag: orbit · wheel: zoom' : 'drag / click on the ground to draw or place · right-drag or Shift-drag: orbit · wheel: zoom' }}</div>
    }
  `,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      z-index: 650;
      display: block;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      touch-action: none;
      cursor: grab;
    }
    .cap {
      position: absolute;
      left: 8px;
      bottom: 68px;
      background: var(--badge);
      padding: 1px 7px;
      border-radius: 6px;
      pointer-events: none;
    }
    /* top right: the tool palette sits top left */
    .vertex-access { position: absolute; top: 8px; right: 8px; z-index: 21; max-width: 220px; max-height: 50%; overflow: auto; background: var(--panel-solid); color: var(--text); border: 1px solid var(--line); border-radius: var(--radius-control); padding: 4px; }
    .vertex-access summary { cursor: pointer; }
    .vertex-row { display: inline-flex; gap: 2px; margin: 2px; }
    .vertex-access button { color: var(--text); background: var(--panel-solid); border: 1px solid var(--line); padding: 4px; }
    .vertex-access button:focus-visible, .vertex-access summary:focus-visible { outline: 2px solid var(--accent); }
    .measure-access { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .measure-access:focus-within { width: auto; height: auto; clip-path: none; overflow: auto; top: 8px; right: 8px; z-index: 20; background: var(--panel-solid); padding: 4px; }
    .measure-access button { color: var(--text); background: var(--panel-solid); border: 1px solid var(--line); padding: 4px; }
    .fail {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
    }
  `,
})
export class SiteView {
  readonly spec = input.required<SiteSpec>();
  readonly roofHidden = input(false);
  readonly frameKey = input('');
  /** 'select': a click selects what is under it. 'draw': left-drag on the ground reports points for the active tool. */
  readonly mode = input<'select' | 'draw'>('select');
  readonly debugGround = input(false);
  readonly selection = input<SitePick | null>(null);
  /** One floor of one building to show solid, the rest of that building ghosted. */
  readonly focus = input<{ id: string; li: number } | null>(null);
  readonly indoorFloor = input<{ id: string; li: number } | null>(null);
  readonly drawPlaneY = input<number | null>(null);
  readonly handlesEnabled = input(false);
  readonly basementVertexKey = output<{event: KeyboardEvent; index: number}>();
  readonly basementVertexInsert = output<number>();
  readonly basementVertexRemove = output<number>();
  protected readonly basementVertices = computed(() => {
    const f = this.indoorFloor();
    const b = f?.li === -1 && this.handlesEnabled() ? this.spec().buildings.find(item => item.id === f.id) : undefined;
    return b?.basement ? basementOutline(b).map((_, index) => index) : [];
  });
  readonly transformed = output<{ phase: 'down' | 'move' | 'up'; handle: BuildingHandle; x: number; z: number }>();
  readonly flights = input<Flight[]>([]);
  readonly speedMax = input(10);
  readonly picked = output<SitePick | null>();
  readonly ground = output<{ phase: 'down' | 'move' | 'up' | 'hover'; x: number; z: number }>();
  /** How the terrain is drawn. */
  readonly groundStyle = input<GroundStyle>('natural');
  /** A brush ring on the ground (terrain tools), or none. */
  readonly cursor = input<{ x: number; z: number; r: number; color: string } | null>(null);
  readonly drawLine = input<DrawLine | null>(null);
  readonly measures = input<readonly MeasureViewItem[]>([]);
  readonly measurePicked = output<{ index: number; label: boolean }>();
  protected readonly failed = signal(false);
  private readonly cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private r: SiteViewRenderer | null = null;
  private readonly calibration = inject(CalibrationStore);
  protected orientCompass(angle: number): void { this.r?.orientCompass(angle, this.calibration.rot()); }
  protected readonly compassCamera = () => this.r?.compassCamera ?? null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => {
      try {
        this.r = new SiteViewRenderer(this.cv().nativeElement);
      } catch {
        this.failed.set(true);
        return;
      }
      this.r.mode = this.mode();
      this.r.debugGround = this.debugGround();
      this.r.drawPlaneY = this.drawPlaneY();
      this.r.handlesEnabled = this.handlesEnabled();
      this.r.onTransform = (phase, handle, x, z) => this.transformed.emit({ phase, handle, x, z });
      this.r.groundStyle = untracked(() => this.groundStyle());
      this.r.onPick = (p) => this.picked.emit(p);
      this.r.onGround = (phase, x, z) => this.ground.emit({ phase, x, z });
      this.r.onMeasurePick = (index, label) => this.measurePicked.emit({ index, label });
      this.schedule(0);
    });
    effect(() => {
      const debug = this.debugGround();
      if (this.r) this.r.debugGround = debug;
      const m = this.mode();
      if (this.r) this.r.mode = m;
    });
    effect(() => {
      const enabled = this.handlesEnabled();
      if (this.r) { this.r.handlesEnabled = enabled; this.r.setSelection(this.selection()); }
    });
    effect(() => {
      const y = this.drawPlaneY();
      if (this.r) this.r.drawPlaneY = y;
    });
    effect(() => {
      const st = this.groundStyle();
      this.r?.setGroundStyle(st);
    });
    effect(() => {
      const c = this.cursor();
      this.r?.setCursor(c);
    });
    // read the signal before the renderer guard: `this.r?.f(sig())` never reads sig() while r is missing, so the effect
    // never subscribed and the 3D gesture line (fence, bridge, tunnel, brush area) and live measures were never drawn
    effect(() => {
      const line = this.drawLine();
      this.r?.setDrawLine(line);
    });
    effect(() => {
      const items = this.measures();
      this.r?.setMeasures(items);
    });
    effect(() => {
      const sel = this.selection();
      this.spec(); // a rebuild invalidates the box: redraw it after
      untracked(() => this.r?.setSelection(sel));
    });
    effect(() => {
      const f = this.flights(), m = this.speedMax();
      untracked(() => this.r?.setPaths(f, m));
    });
    effect(() => {
      this.spec();
      this.roofHidden();
      this.focus();
      this.indoorFloor();
      untracked(() => this.schedule(220)); // an edit drag changes the spec many times a second
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.r?.dispose();
      this.r = null;
    });
  }

  private schedule(ms: number): void {
    if (!this.r) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      try {
        this.r?.show(this.spec(), this.roofHidden(), this.frameKey(), this.focus(), this.indoorFloor());
        this.r?.setDrawLine(this.drawLine());
        this.r?.setMeasures(this.measures());
        this.r?.setSelection(this.selection());
        this.r?.setPaths(this.flights(), this.speedMax());
      } catch {
        this.failed.set(true);
      }
    }, ms);
  }
}
