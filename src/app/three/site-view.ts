import * as THREE from 'three';
import type { Flight } from '../core/models';
import { emptySpec, type SiteSpec } from '../core/site-spec';
import { ghost, levelOnly } from './element-preview';
import { PathRenderer } from './path-renderer';
import { buildSiteFromSpec, type GroundStyle, type SiteModel } from './site-model';
import { rayGround } from '../core/terrain';
import { buildMeasureView, type MeasureViewItem } from './measure-view';

import {pickModel,type SitePick} from './site-pick';
import { floorPoint, indoorFloorHeight, indoorSourcePick, indoorViewSpec, type IndoorFloor } from './indoor-view';
import { basementHandles, buildingHandles, type BuildingHandle } from './building-handles';
import { siteGround } from '../core/site-ground';

/** A gesture preview on the ground: a line through `pts`, closed into a ring for an area. */
export interface DrawLine { pts: readonly { x: number; z: number }[]; closed?: boolean; color: string; height?: number }
export type {SitePick} from './site-pick';

/**
 * The whole bando in 3D inside the editor: the same model the main view builds, with a mouse-orbit camera.
 * Drag = orbit, right-drag / Shift-drag = pan, wheel = zoom, click = select. With a drawing tool active, left-drag
 * works on the ground instead (see {@link mode}). Rebuild with {@link show} whenever the spec changes.
 */
export class SiteViewRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(50, 1, 0.02, 6000);
  get compassCamera(): THREE.Camera { return this.camera; }
  orientCompass(angle: number, calibration: number): void { this.yaw = (angle - calibration) * Math.PI / 180; }
  private model: SiteModel | null = null;
  private yaw = 0.6;
  private pitch = 0.75;
  private dist = 120;
  private readonly target = new THREE.Vector3();
  private drag: { x: number; y: number; pan: boolean } | null = null;
  private raf = 0;
  private framed = '';
  private readonly off: (() => void)[] = [];
  private spec: SiteSpec | null = null;
  private indoorFloor: IndoorFloor | null = null;
  drawPlaneY: number | null = null;
  private selection: SitePick | null = null;
  private box: THREE.Box3Helper | null = null;
  private readonly paths: PathRenderer;
  private readonly ray = new THREE.Raycaster();
  /** 'select': drag orbits and a click selects. 'draw': left-drag reports ground points instead (right-drag / Shift still orbit). */
  mode: 'select' | 'draw' = 'select';
  debugGround = false;
  onPick: (p: SitePick | null) => void = () => undefined;
  onGround: (phase: 'down' | 'move' | 'up' | 'hover', x: number, z: number) => void = () => undefined;
  /** How the terrain is drawn (natural, height map, wireframe). */
  groundStyle: GroundStyle = 'natural';
  /** A ring on the ground under the pointer (a terrain brush), or none. */
  private cursor: THREE.LineLoop | null = null;
  private drawLine: THREE.Line | null = null;
  private measures: THREE.Group | null = null;
  private handles: THREE.Group | null = null;
  private transform: BuildingHandle | null = null;
  handlesEnabled = false;
  onTransform: (phase: 'down' | 'move' | 'up', handle: BuildingHandle, x: number, z: number) => void = () => undefined;
  onMeasurePick: (index: number, label: boolean) => void = () => undefined;
  private press: { x: number; y: number; moved: boolean; ground: boolean } | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setClearColor(0x9fc3d8);
    this.renderer.shadowMap.enabled = true;
    // The world and sun are static between spec rebuilds; orbiting only changes the camera.
    this.renderer.shadowMap.autoUpdate = false;
    this.scene.add(new THREE.HemisphereLight(0xdfeeff, 0x4a5a40, 1.1));
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.2);
    sun.position.set(120, 220, 90);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -200, right: 200, top: 200, bottom: -200, near: 10, far: 700 });
    this.scene.add(sun);
    this.paths = new PathRenderer(this.scene);
    const on = <K extends keyof HTMLElementEventMap>(t: K, f: (e: HTMLElementEventMap[K]) => void, o?: AddEventListenerOptions): void => {
      canvas.addEventListener(t, f as EventListener, o);
      this.off.push(() => canvas.removeEventListener(t, f as EventListener));
    };
    on('pointerdown', (e) => {
      if (this.mode === 'select' && e.button === 0 && !e.shiftKey && this.handles) {
        const rect = canvas.getBoundingClientRect();
        this.ray.setFromCamera(new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), this.camera);
        const hit = this.ray.intersectObjects(this.handles.children)[0];
        const handle = hit?.object.userData['handle'] as BuildingHandle | undefined;
        const point = handle ? floorPoint(this.ray.ray, handle.y) : null;
        if (handle && point) {
          this.transform = handle;
          canvas.setPointerCapture(e.pointerId);
          this.onTransform('down', handle, point.x, point.z);
          return;
        }
      }
      const ground = this.mode === 'draw' && e.button === 0 && !e.shiftKey;
      this.press = { x: e.clientX, y: e.clientY, moved: false, ground };
      canvas.setPointerCapture(e.pointerId);
      if (ground) {
        const g = this.groundPoint(e);
        if (g) this.onGround('down', g.x, g.z);
      } else this.drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey };
    });
    on('pointermove', (e) => {
      if (this.transform) {
        const point = this.pointAtHeight(e, this.transform.y);
        if (point) this.onTransform('move', this.transform, point.x, point.z);
        return;
      }
      if (this.press && Math.hypot(e.clientX - this.press.x, e.clientY - this.press.y) > 4) this.press.moved = true;
      if (this.press?.ground) {
        const g = this.groundPoint(e);
        if (g) this.onGround('move', g.x, g.z);
        return;
      }
      if (!this.press && this.mode === 'draw') {
        // drawing tools: where the pointer is on the ground (the height readout, the brush ring)
        const g = this.groundPoint(e);
        if (g) this.onGround('hover', g.x, g.z);
      }
      const d = this.drag;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (d.pan) {
        const k = this.dist * 0.0016;
        const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
        const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        this.target.addScaledVector(right, -dx * k).addScaledVector(fwd, dy * k);
      } else {
        this.yaw -= dx * 0.008;
        this.pitch = Math.min(1.5, Math.max(0.05, this.pitch + dy * 0.006));
      }
      this.drag = { ...d, x: e.clientX, y: e.clientY };
    });
    const release = (e: PointerEvent): void => {
      if (this.transform) {
        const handle = this.transform;
        this.transform = null;
        const point = this.pointAtHeight(e, handle.y);
        this.onTransform('up', handle, point?.x ?? handle.x, point?.z ?? handle.z);
        return;
      }
      const p = this.press;
      this.press = null;
      this.drag = null;
      if (!p) return;
      if (p.ground) {
        const g = this.groundPoint(e);
        if (g) this.onGround('up', g.x, g.z);
        else this.onGround('up', Number.NaN, Number.NaN);
      } else if (!p.moved && e.type === 'pointerup' && this.mode === 'select' && e.button === 0) {
        const measure = this.measureAt(e);
        if (measure) this.onMeasurePick(measure.index, measure.label);
        else this.onPick(this.pickAt(e));
      }
    };
    on('pointerup', release);
    on('pointercancel', release);
    on('contextmenu', (e) => e.preventDefault());
    on('wheel', (e) => {
      e.preventDefault();
      this.dist = Math.min(2500, Math.max(0.25, this.dist * (1 + e.deltaY * 0.001)));
    }, { passive: false });
    this.raf = requestAnimationFrame(this.tick);
  }

  setGroundStyle(style: GroundStyle): void {
    this.groundStyle = style;
    this.model?.setGroundStyle(style);
  }

  /** A dashed ring of radius `r` lying on the ground at (x, z), or none (null). */
  setCursor(c: { x: number; z: number; r: number; color: string } | null): void {
    if (!c || !this.model) {
      if (this.cursor) this.cursor.visible = false;
      return;
    }
    if (!this.cursor) {
      this.cursor = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: c.color, depthTest: false, transparent: true }));
      this.cursor.renderOrder = 10;
      this.scene.add(this.cursor);
    }
    const pts: number[] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2, x = c.x + Math.cos(a) * c.r, z = c.z + Math.sin(a) * c.r;
      pts.push(x, this.model.ground.at(x, z) + 0.3, z);
    }
    this.cursor.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    (this.cursor.material as THREE.LineBasicMaterial).color.set(c.color);
    this.cursor.visible = true;
  }

  /** Preview a ground gesture while it is being drawn: a line through `pts` (a closed ring when `closed`) on the ground. */
  setDrawLine(line: DrawLine | null): void {
    if (!line || !this.model) {
      if (this.drawLine) this.drawLine.visible = false;
      return;
    }
    if (!this.drawLine) {
      this.drawLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: line.color, depthTest: false }));
      this.drawLine.renderOrder = 10;
      this.scene.add(this.drawLine);
    }
    const pts: number[] = [], ring = line.closed && line.pts.length > 2 ? [...line.pts, line.pts[0]!] : line.pts;
    const steps = Math.max(2, Math.ceil(32 / Math.max(1, ring.length - 1))); // follow the ground along each edge
    for (let k = 0; k + 1 < ring.length; k++) {
      const a = ring[k]!, b = ring[k + 1]!;
      for (let i = k ? 1 : 0; i <= steps; i++) {
        const u = i / steps, x = a.x + (b.x - a.x) * u, z = a.z + (b.z - a.z) * u;
        pts.push(x, (line.height ?? this.model.ground.at(x, z)) + 0.3, z);
      }
    }
    this.drawLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    (this.drawLine.material as THREE.LineBasicMaterial).color.set(line.color);
    this.drawLine.visible = true;
  }

  setMeasures(items: readonly MeasureViewItem[]): void {
    this.clearMeasures();
    if (!this.model || !items.length) return;
    const y = this.spec ? indoorFloorHeight(this.spec, this.indoorFloor) : null;
    this.measures = buildMeasureView(items, (x, z) => y ?? this.model!.ground.at(x, z));
    this.scene.add(this.measures);
  }

  private clearMeasures(): void {
    if (!this.measures) return;
    this.scene.remove(this.measures);
    this.measures.traverse((o) => {
      if (o instanceof THREE.Sprite) { o.material.map?.dispose(); o.material.dispose(); }
      else if (o instanceof THREE.Line) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
    });
    this.measures = null;
  }

  private measureAt(e: { clientX: number; clientY: number }): { index: number; label: boolean } | null {
    if (!this.measures) return null;
    const r = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    this.ray.params.Line = { threshold: Math.max(0.2, this.dist * 0.004) };
    const hit = this.ray.intersectObjects(this.measures.children).find((h) => typeof h.object.userData['measureIndex'] === 'number' && h.object.userData['measureIndex'] >= 0);
    return hit ? { index: hit.object.userData['measureIndex'] as number, label: !!hit.object.userData['measureLabel'] } : null;
  }

  /** Rebuild from the spec. The camera re-frames only when `frameKey` changes (a different bando). */
  show(spec: SiteSpec, roofHidden: boolean, frameKey: string, focus: { id: string; li: number } | null = null, indoorFloor: IndoorFloor | null = null): void {
    if (this.model) {
      this.scene.remove(this.model.group);
      dispose(this.model.group);
    }
    this.spec = spec;
    this.indoorFloor = indoorFloor;
    this.model = buildSiteFromSpec(indoorFloor ? indoorViewSpec(spec, indoorFloor) : spec, { merge: true, bare: indoorFloor?.li === -1 });
    this.model.setRoofHidden?.(roofHidden);
    this.model.setGroundStyle(this.groundStyle);
    if (focus && !indoorFloor) this.focusFloor(spec, focus);
    this.scene.add(this.model.group);
    this.renderer.shadowMap.needsUpdate = true;
    this.refreshSelection();
    if (frameKey !== this.framed) {
      this.framed = frameKey;
      this.target.set(0, 0, 0);
      this.dist = Math.max(60, Math.min(900, spec.extent * 0.9));
    }
  }

  /** One floor of a building in focus: the building turns see-through and that floor is drawn solid in place. */
  private focusFloor(spec: SiteSpec, f: { id: string; li: number }): void {
    const b = spec.buildings.find((x) => x.id === f.id);
    if (!b || (b.levels.length < 2 && f.li !== -1) || !this.model) return;
    this.model.group.traverse((o) => {
      const p = o.userData['pick'] as SitePick | undefined;
      if (p && p.kind === 'building' && p.id === f.id) ghost(o);
    });
    const mini = emptySpec(spec.origin, 'focus');
    mini.buildings = [levelOnly(b, f.li)];
    mini.extent = spec.extent;
    this.model.group.add(buildSiteFromSpec(mini, { bare: true }).group);
  }

  private pointAtHeight(e: { clientX: number; clientY: number }, height: number): { x: number; z: number } | null {
    const r = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    return floorPoint(this.ray.ray, height);
  }

  /** The point on the ground (the terrain, or y = 0) under the pointer, in site coordinates. */
  private groundPoint(e: { clientX: number; clientY: number }): { x: number; z: number } | null {
    const r = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    if (!this.debugGround && this.drawPlaneY !== null) return floorPoint(this.ray.ray, this.drawPlaneY);
    const grid = this.debugGround && this.spec ? siteGround(this.spec).grid : this.model?.ground.grid;
    if (grid) return rayGround(grid, this.ray.ray.origin, this.ray.ray.direction);
    const p = new THREE.Vector3();
    return this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p) ? { x: p.x, z: p.z } : null;
  }

  /** What is under the pointer: a building / structure / fence by the tag on its meshes, a tree by distance on the ground. */
  private pickAt(e: { clientX: number; clientY: number }): SitePick | null {
    if (!this.model || !this.spec) return null;
    const r = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    return indoorSourcePick(pickModel(this.ray,this.model,this.spec), this.indoorFloor);


  }

  setSelection(sel: SitePick | null): void {
    this.selection = sel;
    this.refreshSelection();
    if (this.box && !this.transform) {
      this.box.box.getCenter(this.target);
      this.dist=Math.max(25,Math.min(300,this.box.box.getSize(new THREE.Vector3()).length()*2));
    }
  }

  /** A yellow box and draggable handles around the selected thing. */
  private refreshSelection(): void {
    if (this.handles) { this.scene.remove(this.handles); dispose(this.handles); this.handles = null; }
    if (this.box) {
      this.scene.remove(this.box);
      this.box.geometry.dispose();
      this.box = null;
    }
    const sel = this.selection;
    if (!sel || !this.model || !this.spec) return;
    const b = new THREE.Box3();
    if (sel.kind === 'tree') {
      const t = this.spec.trees[sel.i];
      if (!t) return;
      b.set(new THREE.Vector3(t.x - t.r, 0, t.z - t.r), new THREE.Vector3(t.x + t.r, t.h, t.z + t.r));
    } else {
      this.model.group.traverse((o) => {
        const p = indoorSourcePick((o.userData['pick'] as SitePick | undefined) ?? null, this.indoorFloor);
        if (p && p.kind === sel.kind && (('id' in p && 'id' in sel && p.id === sel.id && (!('li' in p) || ('li' in sel && p.li === sel.li && p.i === sel.i))) || ('i' in p && 'i' in sel && !('id' in p) && p.i === sel.i))) b.expandByObject(o);
      });
    }
    if (b.isEmpty()) return;
    this.box = new THREE.Box3Helper(b, 0xffd166);
    this.scene.add(this.box);
    if (this.handlesEnabled) {
      const basementId = this.indoorFloor?.li === -1 ? this.indoorFloor.id : null;
      const id = basementId ?? (sel.kind === 'building' && !this.indoorFloor ? sel.id : null);
      const building = id ? this.spec.buildings.find(item => item.id === id) : undefined;
      if (building) {
        this.handles = new THREE.Group();
        const size = Math.max(0.6, Math.min(2, Math.max(building.length, building.width) * 0.035));
        const items = basementId ? basementHandles(building, siteGround(this.spec).building.get(building.id) ?? 0)
          : buildingHandles(building, this.model.ground.building.get(building.id) ?? 0);
        for (const handle of items) {
          const geometry = handle.kind === 'basementVertex' ? new THREE.SphereGeometry(size * 0.6, 12, 8) : new THREE.BoxGeometry(size, size, size);
          const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: handle.kind === 'move' ? 0x38d6ff : 0xffd166, depthTest: false }));
          mesh.position.set(handle.x, handle.y, handle.z);
          mesh.renderOrder = 20;
          mesh.userData['handle'] = handle;
          this.handles.add(mesh);
        }
        this.scene.add(this.handles);
      }
    }
  }

  setPaths(flights: Flight[], speedMax: number): void {
    this.paths.rebuild(flights, speedMax);
  }

  private readonly tick = (): void => {
    this.raf = requestAnimationFrame(this.tick);
    const c = this.canvas;
    if (!c.isConnected || c.clientWidth < 8 || c.clientHeight < 8 || document.hidden || !c.offsetParent) return;
    const w = c.clientWidth, h = c.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    const cp = Math.cos(this.pitch);
    this.camera.position.set(this.target.x + this.dist * cp * Math.sin(this.yaw), this.target.y + this.dist * Math.sin(this.pitch), this.target.z + this.dist * cp * Math.cos(this.yaw));
    this.camera.lookAt(this.target);
    this.paths.setProgress();
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    cancelAnimationFrame(this.raf);
    for (const f of this.off) f();
    if (this.model) dispose(this.model.group);
    if (this.drawLine) dispose(this.drawLine);
    if (this.handles) dispose(this.handles);
    this.clearMeasures();
    this.renderer.dispose();
  }
}

function dispose(o: THREE.Object3D): void {
  o.traverse((x) => {
    const m = x as THREE.Mesh;
    m.geometry?.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((q) => q.dispose());
    else mat?.dispose();
  });
}
