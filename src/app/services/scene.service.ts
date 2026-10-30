import { xraySubject } from '../core/xray-policy';
import { RaceService } from './race.service';
import { RaceRenderer } from '../three/race-renderer';
import { Injectable, effect, inject, signal, untracked, type WritableSignal } from '@angular/core';
import * as THREE from 'three';
import type { CameraView } from '../core/models';
import { rotateCalibrationAbout, turnTowards } from '../core/geo';
import { takeoffSpot } from '../core/takeoff';
import type { SiteModel } from '../three/site-model';
import { CalibrationStore } from '../state/calibration.store';
import { FlightStore } from '../state/flight.store';
import { LayoutStore } from '../state/layout.store';
import { ViewStore } from '../state/view.store';
import type { PanelId } from '../ui/panel-defs';
import { createOrbitState, fovFor, orbitFromCamera, placeCamera, type FollowSubject, type OrbitState, type PlaceOptions } from '../three/camera-rig';
import type { RigContext } from '../three/drone-rig';
import { SceneHost } from '../three/scene-host';
import { XRay } from '../three/xray';
import { FlightService } from './flight.service';
import { FrameLoopService, FrameOrder } from './frame-loop.service';
import { PlaybackService } from './playback.service';
import { positionAt } from '../core/flight/flight';
import { addPin, type MomentPin } from '../core/flight/moment-pins';
import { AdjustGizmo } from '../three/adjust-gizmo';
import { formatClock } from '../core/math';
import { SimulatorService } from './simulator.service';
import { ToastService } from './toast.service';

export type ViewportType = 'orbit' | 'chase' | 'fpv' | 'top';

/** A floating camera panel: its own camera and orbit state, drawing into its own canvas. */
export interface Viewport {
  type: ViewportType;
  panel: PanelId;
  camera: THREE.PerspectiveCamera;
  state: OrbitState;
  canvas: HTMLCanvasElement | null;
}

const VIEWPORT_PANELS: Record<ViewportType, PanelId> = { orbit: 'vpOrbit', chase: 'vpChase', fpv: 'vpFpv', top: 'vpTop' };
const PANEL_MAX_PIXELS = 650_000;

/** A surface that can receive "pick the ground / a building" clicks while an editor tool is armed. */
export interface PickSurface {
  id: string;
  /** Called with client coordinates on a finished click (no drag). */
  onClick(clientX: number, clientY: number): void;
}

/**
 * The 3D world as the rest of the app sees it: creates the {@link SceneHost}, keeps it in step with the stores
 * (roof, model scale, paths, north), places the main camera and every floating view each frame, runs the x-ray and
 * renders. Other services and components never touch three.js directly.
 */
/** How long the main view stays in a look-around after the last drag or wheel before it hands back to the chase camera. */
const LOOK_AROUND_IDLE_MS = 2500;

@Injectable({ providedIn: 'root' })
export class SceneService {
  private readonly race = inject(RaceService);
  private raceRenderer: RaceRenderer | null = null;
  private readonly view = inject(ViewStore);
  private readonly calibration = inject(CalibrationStore);
  private readonly layout = inject(LayoutStore);
  private readonly flightStore = inject(FlightStore);
  private readonly flights = inject(FlightService);
  private readonly playback = inject(PlaybackService);
  private readonly sim = inject(SimulatorService);
  private readonly toast = inject(ToastService);
  private readonly loop = inject(FrameLoopService);

  host: SceneHost | null = null;
  readonly ready = signal(false);
  readonly mainOrbit: OrbitState = createOrbitState();
  /** The main view went from chase to an orbit because the pilot dragged on it (not chosen in Views). */
  private lookingAround = false;
  private lastLook = 0;
  /** The main view turns slowly by itself (the empty world of a first visit); any touch on it stops it. */
  readonly autoOrbit = signal(true);
  readonly viewports: Record<ViewportType, Viewport> = {
    orbit: this.makeViewport('orbit'),
    chase: this.makeViewport('chase'),
    fpv: this.makeViewport('fpv'),
    top: this.makeViewport('top'),
  };
  /**
   * Armed ground pin: the next click on the ground moves the flight's start ('s') or end ('e') there, or puts the drone
   * there at the replay's current moment ('m', a pin against GPS drift, B-017).
   */
  readonly pin = signal<'s' | 'e' | 'm' | null>(null);
  /**
   * The flight's start is fixed: pinned by the pilot, or a bando without its place (flights start on its take-off
   * pad). Then pinning the end turns the path about its start instead of sliding the whole path.
   */
  readonly startFixed = signal(false);
  /**
   * Optional extra pick surface (the Map panel's model overlay). The stage registers itself here; when another
   * surface arms a pick mode it takes over the clicks, so a click inside the map panel selects / draws on the model
   * instead of editing through the full-page scene behind it.
   */
  readonly pickSurface: WritableSignal<PickSurface | null> = signal(null);
  private xray: XRay | null = null;
  private resizeHandler: (() => void) | null = null;
  private stopTasks: (() => void)[] = [];

  constructor() {
    // turning Follow on hands every view back to it: a view the pilot panned away glides back to the drone
    effect(() => {
      if (!this.view.orbitFollow()) return;
      untracked(() => {
        this.mainOrbit.manual = false;
        for (const vp of Object.values(this.viewports)) vp.state.manual = false;
      });
    });
    effect(() => {
      if (!this.ready()) return;
      const k = this.calibration.modelScale();
      this.host?.site.setScale(k);
    });
    effect(() => {
      if (this.ready()) this.host?.site.setRoofHidden(this.view.roofHidden());
    });
    effect(() => {
      const sat = this.view.satGround();
      if (this.ready()) this.host?.site.setGroundStyle(sat ? 'satellite' : 'natural');
    });
    effect(() => {
      if (!this.ready()) return;
      this.flightStore.revision();
      untracked(() => this.host?.paths.rebuild(this.flights.all, this.flights.speedMax));
    });
    effect(() => {
      const welcome = this.layout.panels().welcome.visible;
      const on=this.race.enabled() && !welcome,tracks=on?this.race.tracks():[],gate=on?this.race.gate():null,speedTrails=this.race.speedTrails();
      this.ready();
      if(this.raceRenderer) {this.raceRenderer.group.visible=on;this.raceRenderer.synchronize(on?tracks:[],on?gate:null,speedTrails);}
      if(this.host)this.host.paths.group.visible=!on && !welcome;
    });
    effect(() => {
      const v = this.view.cameraView();
      if (!this.ready() || !this.host) return;
      this.host.mainCamera.fov = fovFor(v);
      this.host.mainCamera.updateProjectionMatrix();
    });
    effect(() => {
      const on = this.view.xray();
      if (!this.xray) return;
      this.xray.enabled = on;
      if (!on) this.xray.reset();
    });
    effect(() => {
      const req = this.flights.frameRequest();
      if (!req) return;
      untracked(() => {
        this.mainOrbit.tg.set(req.center.x, req.center.y, req.center.z);
        this.mainOrbit.rad = req.radius;
        this.mainOrbit.ph = 1.0;
        this.view.setCameraView('orbit');
      });
    });
  }

  /** Create the renderer inside `container` and start rendering. Safe to call once per page. */
  attach(container: HTMLElement): void {
    if (this.host) return;
    const host = new SceneHost(container);
    this.host = host;
    this.raceRenderer = new RaceRenderer(host.scene);
    // The canvas must fill its container: three.js' default style is "display:block" without width/height, so on
    // HiDPI screens it renders at device pixels and covers only a top-left part of the page — the rest stays black.
    Object.assign(host.canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' } as CSSStyleDeclaration);
    this.xray = new XRay(host.site);
    this.xray.enabled = this.view.xray();
    this.sim.world = host.site.collider;
    host.resizeMain(innerWidth, innerHeight);
    this.resizeHandler = () => host.resizeMain(innerWidth, innerHeight);
    addEventListener('resize', this.resizeHandler);

    this.stopTasks = [
      this.loop.add(FrameOrder.camera, (dt) => this.updateCameras(dt)),
      this.loop.add(FrameOrder.xray, (dt) => this.updateXray(dt)),
      this.loop.add(FrameOrder.xray, () => this.host?.paths.setProgress()),
      this.loop.add(FrameOrder.render, (dt) => this.renderAll(dt)),
    ];
    this.ready.set(true);
  }

  /**
   * Re-arm everything that holds a reference to the site object graph after {@link SceneHost.setSite} swapped it:
   * the x-ray fades the new meshes, the simulator collides with the new geometry, the parked drone moves to the
   * new take-off pad and the paths are rebuilt for the new scale.
   */
  rebindSite(site: SiteModel): void {
    if (this.xray) {
      this.xray.reset();
      this.xray.site = site;
      this.xray.enabled = this.view.xray();
    }
    this.sim.world = site.collider;
    site.setGroundStyle(untracked(() => this.view.satGround()) ? 'satellite' : 'natural');
    const t = takeoffSpot();
    this.sim.reposition(t.x, t.z, t.y ?? 0);
    untracked(() => this.host?.paths.rebuild(this.flights.all, this.flights.speedMax));
  }

  detach(): void {
    this.stopTasks.forEach((s) => s());
    this.stopTasks = [];
    if (this.resizeHandler) removeEventListener('resize', this.resizeHandler);
    this.xray?.reset();
    this.raceRenderer?.dispose();
    this.raceRenderer=null;
    this.host?.dispose();
    this.host = null;
    this.xray = null;
    this.sim.world = null;
    this.ready.set(false);
  }

  /** True when chase / FPV / orbit-follow track the replayed drone instead of the simulator drone. */
  followingReplay(): boolean {
    return !this.layout.panels().welcome.visible && this.view.replayFollow() && !!this.flights.active && !this.sim.state.armed;
  }

  subject(): FollowSubject {
    return this.followingReplay() ? { p: this.playback.pose.p, q: this.playback.pose.q } : { p: this.sim.state.p, q: this.sim.state.q };
  }

  rigContext(): RigContext {
    return { followingReplay: this.followingReplay(), flight: this.race.enabled() || this.layout.panels().welcome.visible ? null : this.flights.active, simPosition: this.sim.state.p, replayPosition: this.playback.pose.p };
  }

  /** The drone's own ground (scene units, the collider is scaled with the model): cameras stay above it. */
  private readonly groundAt = (x: number, z: number, y?: number): number => this.host?.site.collider.groundAt(x, z, y) ?? 0;

  private placeOptions(): PlaceOptions {
    const f = this.flights.active;
    return {
      orbitFollow: this.view.orbitFollow(),
      calRotDeg: this.calibration.rot(),
      // the sim drone and replays with attitude data use the camera tilt; GPS-only replays do not
      fpvTiltDeg: !this.followingReplay() || !!(f && (f.tel || f.att)) ? this.view.fpvTiltDeg() : 0,
      groundAt: this.groundAt,
    };
  }

  /**
   * Look around the drone: a drag or wheel on the chase camera switches the main view to an orbit about the drone,
   * starting from where the chase camera is, and following it (a pan stops the follow; Follow or a double-click glides
   * back). FPV keeps the pilot's view: it stays as it is.
   */
  lookAround(): void {
    const cam = this.host?.mainCamera;
    if (!cam || this.view.cameraView() !== 'chase') return;
    const p = this.subject().p;
    orbitFromCamera(this.mainOrbit, cam.position, p);
    if (!this.view.orbitFollow()) this.view.toggleOrbitFollow();
    this.view.setCameraView('orbit');
    this.lookingAround = true;
    this.lastLook = performance.now();
  }

  /** A press, drag or wheel on the main view: keeps a look-around going (it hands back to the chase camera once idle). */
  noteInput(): void {
    this.lastLook = performance.now();
  }

  /** Back to the default overview and park the drone. */
  resetCamera(): void {
    this.sim.reset();
    this.mainOrbit.tg.set(-10, 2, 0);
    this.mainOrbit.manual = false;
    for (const vp of Object.values(this.viewports)) vp.state.manual = false;
    this.mainOrbit.th = -1.1;
    this.mainOrbit.ph = 1;
    this.mainOrbit.rad = this.view.orbitFollow() ? 110 : 330;
    this.view.setCameraView('orbit');
  }

  registerViewportCanvas(type: ViewportType, canvas: HTMLCanvasElement | null): void {
    this.viewports[type].canvas = canvas;
  }

  /**
   * Render an orthographic top-down overlay (no fog) for the Map panel into `canvas`. The map has its own camera:
   * the caller positions it.
   */
  renderOverlay(camera: THREE.OrthographicCamera, canvas: HTMLCanvasElement, cssW: number, cssH: number, maxPixels: number): void {
    const host = this.host;
    if (!host) return;
    const fog = host.scene.fog;
    host.scene.fog = null;
    try {
      host.renderToCanvas(camera, 'top', this.rigContext(), canvas, cssW, cssH, maxPixels);
    } finally {
      host.scene.fog = fog;
    }
  }

  // ---- Adjust position (F-040): a move control on the replay drone, height included ----
  /** The control is out: the moment it pins and the pins it started from (Esc puts them back). */
  readonly adjusting = signal<{ t: number } | null>(null);
  private adjust: { gizmo: AdjustGizmo; t: number; from: THREE.Vector3; before: MomentPin[]; pins: MomentPin[]; keys: (e: KeyboardEvent) => void } | null = null;

  /** A press on the main view the camera must leave alone: it drags the Adjust position control. */
  adjustBlocks(): boolean {
    return !!this.adjust?.gizmo.active;
  }

  startAdjust(): void {
    const f = this.flights.active, host = this.host;
    if (!f || !host) return void this.toast.show('Load a log first');
    if (this.adjust) return this.endAdjust(true);
    this.endPin();
    this.playback.pause();
    const t = this.playback.time, from = positionAt(f, t);
    if (!from) return;
    const before = f.pins ?? [];
    const gizmo = new AdjustGizmo(host.mainCamera, host.canvas, host.scene, new THREE.Vector3(from.x, from.y, from.z), (p) => this.adjustTo(p));
    // while it is out the arrow keys nudge the drone (Shift: up and down), Enter keeps it, Esc puts it back
    const keys = (e: KeyboardEvent): void => {
      if (!this.adjust || (e.target as HTMLElement | null)?.closest?.('input, textarea, select')) return;
      const step = 0.5;
      const k = e.key;
      const d = k === 'ArrowLeft' ? [-step, 0, 0] : k === 'ArrowRight' ? [step, 0, 0] : k === 'ArrowUp' ? (e.shiftKey ? [0, step, 0] : [0, 0, -step]) : k === 'ArrowDown' ? (e.shiftKey ? [0, -step, 0] : [0, 0, step]) : null;
      if (d) this.adjustTo(gizmo.nudge(d[0]!, d[1]!, d[2]!));
      else if (k === 'Enter') this.endAdjust(true);
      else if (k === 'Escape') this.endAdjust(false);
      else return;
      e.preventDefault();
      e.stopImmediatePropagation(); // not the replay's seek, the simulator's arm or the pin's cancel
    };
    addEventListener('keydown', keys, { capture: true });
    this.adjust = { gizmo, t, from: from.clone() as unknown as THREE.Vector3, before, pins: before, keys };
    this.adjusting.set({ t });
    this.toast.show('Drag the arrows (or a square) to where the drone is at this moment; arrows nudge, Shift+↑↓ up and down. Enter keeps it, Esc puts it back.', 6000);
  }

  private adjustTo(p: THREE.Vector3): void {
    const a = this.adjust, f = this.flights.active;
    if (!a || !f) return;
    a.pins = addPin(a.before, a.t, { x: a.from.x, y: a.from.y, z: a.from.z }, { x: p.x, y: p.y, z: p.z });
    this.flights.previewPins(f, a.pins);
  }

  /** Put the control away: keep the moved position as a pin, or put the path back as it was. */
  endAdjust(keep: boolean): void {
    const a = this.adjust, f = this.flights.active;
    if (!a) return;
    this.adjust = null;
    this.adjusting.set(null);
    removeEventListener('keydown', a.keys, { capture: true });
    a.gizmo.dispose();
    if (!f) return;
    if (keep && a.pins !== a.before) {
      this.flights.setPins(f, a.pins);
      this.toast.show(`Pinned at ${formatClock(a.t)}: the drone stays where you put it, the path blends to the next pin.`);
    } else this.flights.previewPins(f, a.before);
  }

  // ---- ground pin ----
  armPin(which: 's' | 'e' | 'm'): void {
    if (!this.flights.active) {
      this.toast.show('Load a log first');
      return;
    }
    if (this.pin() === which) {
      this.endPin();
      return;
    }
    this.pin.set(which);
    if (which === 'm') this.toast.show('Click the ground where the drone is at this moment (the video shows it) — in any 3D view or panel. Esc cancels.');
    else this.toast.show(`Click the ground where the flight ${which === 's' ? 'started' : 'ended'} — in any 3D view or panel. Esc cancels; your view is not changed.`);
  }
  endPin(): void {
    this.pin.set(null);
  }
  /** Move the active flight so its start / end lands where the user clicked on the ground. */
  placePin(clientX: number, clientY: number, camera: THREE.PerspectiveCamera, rect: { left: number; top: number; width: number; height: number }): void {
    const which = this.pin();
    const f = this.flights.active;
    if (!which || !f || !this.host) return;
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    const hit = this.host.groundPoint(camera, nx, ny);
    if (hit) this.pinTo(hit.x, hit.z);
    this.endPin();
  }

  /** Same as {@link placePin} but with a ground point already known in site metres (the map editor's own overlay). */
  placePinAt(x: number, z: number): void {
    this.pinTo(x, z);
    this.endPin();
  }

  /** The armed pin lands on (x, z): the start slides the path there; the end turns it about a fixed start, or slides it. */
  private pinTo(x: number, z: number): void {
    const which = this.pin();
    const f = this.flights.active;
    const start = f?.loc[0], end = f?.loc[f.loc.length - 1];
    if (!which || !f || !start || !end) return;
    if (which === 'm') {
      const t = this.playback.time, from = positionAt(f, t);
      if (!from) return;
      this.flights.setPins(f, addPin(f.pins ?? [], t, from, { x, z }));
      this.toast.show(`Pinned at ${formatClock(t)}: the path around this moment moves there, blending to the next pin.`);
      return;
    }
    if (which === 's') {
      this.calibration.shift(x - start.x, z - start.z);
      this.startFixed.set(true);
      this.toast.show('Start placed. Pin the end to turn the path about it, or use the compass.');
    } else if (this.startFixed() && Math.hypot(end.x - start.x, end.z - start.z) > 1) {
      this.calibration.apply(rotateCalibrationAbout(this.calibration.calibration(), start, turnTowards(start, end, { x, z })));
      this.toast.show('Path turned about its start toward the end you pinned.');
    } else {
      this.calibration.shift(x - end.x, z - end.z);
      this.toast.show('Path placed. Use the compass to rotate it if needed.');
    }
  }

  /** Move the active flight so its start lands on (x, z) in site metres (typed coordinates), like pinning the start. */
  placeStart(x: number, z: number): void {
    const start = this.flights.active?.loc[0];
    if (!start || !isFinite(x) || !isFinite(z)) return;
    this.calibration.shift(x - start.x, z - start.z);
    this.startFixed.set(true);
  }

  /** Turn the active flight's path about its start by `deg` (clockwise seen from above): the orientation knob. */
  turnPath(deg: number): void {
    const start = this.flights.active?.loc[0];
    if (!start || !deg) return;
    this.calibration.apply(rotateCalibrationAbout(this.calibration.calibration(), start, deg));
  }

  // ---- per frame ----
  private updateCameras(dt: number): void {
    const host = this.host;
    if (!host) return;
    host.drones.syncSim(this.sim.state, dt);
    host.drones.syncGhost(this.playback.pose.p, this.playback.pose.q, this.race.enabled() || this.layout.panels().welcome.visible ? null : this.flights.active);
    this.raceRenderer?.update(this.race.time,host.mainCamera,id=>this.race.stale(id));
    if (this.autoOrbit() && this.view.cameraView() === 'orbit') this.mainOrbit.th += dt * 0.07;
    // a look-around the pilot started from the chase camera ends by itself: idle for a moment, back to the chase
    // (its camera glides from where the orbit left it). A camera chosen in Views ends it too, and stays.
    if (this.lookingAround && (this.view.cameraView() !== 'orbit' || performance.now() - this.lastLook > LOOK_AROUND_IDLE_MS)) {
      if (this.view.cameraView() === 'orbit') this.view.setCameraView('chase');
      this.lookingAround = false;
    }
    placeCamera(host.mainCamera, this.view.cameraView(), this.mainOrbit, this.subject(), this.placeOptions(), dt);
  }

  private updateXray(dt: number): void {
    const host = this.host;
    if (!host || !this.xray || !this.view.xray()) return;
    const view = this.view.cameraView();
    const tracked = xraySubject(view, this.view.orbitFollow(), !!this.mainOrbit.manual, this.sim.state.armed, this.followingReplay());
    const p = tracked === 'simulator' ? this.sim.state.p : tracked === 'replay' ? this.playback.pose.p : null;
    const targets = p ? [new THREE.Vector3(p.x, p.y, p.z)] : [];
    this.xray.step(dt, host.mainCamera, targets, this.calibration.modelScale(), view !== 'fpv');
  }

  /** Panels first, then the main page last (it stays in the shared canvas, which exports read from). */
  private renderAll(dt: number): void {
    const host = this.host;
    if (!host) return;
    // Apply at the render boundary too: a scene rebuild and a panel change can happen in the same frame.
    host.paths.group.visible = !this.layout.panels().welcome.visible && !this.race.enabled();
    const ctx = this.rigContext();
    const subject = this.subject();
    const opts = this.placeOptions();
    const panels = this.layout.panels();
    for (const vp of Object.values(this.viewports)) {
      const p = panels[vp.panel];
      if (!p.visible || p.minimized || !vp.canvas) continue;
      const w = vp.canvas.clientWidth;
      const h = vp.canvas.clientHeight;
      if (w < 16 || h < 16) continue;
      placeCamera(vp.camera, vp.type, vp.state, subject, opts, dt);
      const draw = (): void => host.renderToCanvas(vp.camera, vp.type, ctx, vp.canvas!, w, h, PANEL_MAX_PIXELS);
      if (vp.type === 'fpv') this.solidly(draw);
      else draw();
    }
    if (this.view.mainSource() === '3d') {
      // The panels above drew into *corners* of the shared canvas and copied out; the full-page view must then be
      // redrawn at full size, or whatever was in the corner last frame stays stretched over the page (black screen).
      host.resizeMain(innerWidth, innerHeight);
      const draw = (): void => host.renderMain(this.view.cameraView(), ctx);
      if (this.view.cameraView() === 'fpv') this.solidly(draw);
      else draw();
    }
  }

  /** Draw as the pilot sees it: no x-ray fading, and the roofs and upper floors shown even when "hide roofs" is on. */
  private solidly(draw: () => void): void {
    const host = this.host;
    if (!host) return;
    const roof = host.site.roof, shown = roof.visible;
    roof.visible = true;
    try {
      if (this.xray) this.xray.solid(draw);
      else draw();
    } finally {
      roof.visible = shown;
    }
  }

  private makeViewport(type: ViewportType): Viewport {
    const panel = VIEWPORT_PANELS[type];
    return { type, panel, camera: new THREE.PerspectiveCamera(fovFor(type), 1, 0.05, 1200), state: createOrbitState(type === 'top' ? 'top' : 'default'), canvas: null };
  }
}

/** The camera modes, in the order they are offered. */
export const CAMERA_VIEWS: readonly CameraView[] = ['orbit', 'chase', 'fpv', 'top'];
