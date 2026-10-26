import * as THREE from 'three';
import { racePose, type Gate, type RaceTrack } from '../core/racing/race';
/** Metres/second from original fixes, before display decimation. */
export function raceSpeeds(track: RaceTrack): number[] {
  return track.points.map((_, i, points) => {
    const a = points[i ? i - 1 : 0]!,
      b = points[i || points.length < 2 ? i : 1]!;
    const dt = b.t - a.t;
    return dt > 0 ? Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / dt : 0;
  });
}

/** Camera-facing name; user text is drawn, never interpreted as markup. */
function pilotLabel(track: RaceTrack): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 96;
  const g = canvas.getContext('2d');
  if (g) {
    g.fillStyle = '#14221c';
    g.fillRect(0, 0, 1024, 96);
    g.fillStyle = track.color;
    g.fillRect(0, 0, 18, 96);
    g.fillStyle = '#eff7e8';
    g.font = '600 48px system-ui';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(track.name, 524, 48, 960);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false }),
  );
  label.position.y = 1.7;
  label.scale.set(8, 0.75, 1);
  label.userData['pilotName'] = track.name;
  label.userData['pilotColor'] = track.color;
  return label;
}
/** Identity colours and non-colliding GPS ghosts. */
export class RaceRenderer {
  readonly group = new THREE.Group();
  private ghosts = new Map<string, THREE.Group>();
  private tracks: readonly RaceTrack[] = [];
  private signature = '';
  private lastBuild = 0;
  synchronize(tracks: readonly RaceTrack[], gate: Gate | null, speedTrails = true): void {
    const signature = JSON.stringify([
        tracks.map((t) => [t.id, t.name, t.color, t.visible]),
        gate,
        speedTrails,
      ]),
      now = performance.now();
    if (signature !== this.signature || now - this.lastBuild >= 1000) {
      this.signature = signature;
      this.lastBuild = now;
      this.rebuild(tracks, gate, speedTrails);
    } else this.tracks = tracks;
  }
  constructor(scene: THREE.Scene) {
    scene.add(this.group);
    this.group.visible = false;
  }
  rebuild(tracks: readonly RaceTrack[], gate: Gate | null, speedTrails = true): void {
    this.clear();
    this.tracks = tracks;
    const speeds = tracks.map(raceSpeeds);
    let speedMax = 1;
    tracks.forEach((t, i) => {
      if (t.visible) for (const v of speeds[i]!) speedMax = Math.max(speedMax, v);
    });
    for (const [trackIndex, track] of tracks.entries()) {
      if (!track.visible) continue;
      const step = Math.max(1, Math.ceil(track.points.length / 2000));
      const indices = track.points.map((_, i) => i).filter((i) => i % step === 0);
      if (indices.at(-1) !== track.points.length - 1) indices.push(track.points.length - 1);
      const points = indices.map((i) => track.points[i]!);
      const geo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
      );
      if (speedTrails) {
        const colors = indices.flatMap((i) => {
          const c = new THREE.Color().setHSL(
            (1 - Math.min(1, speeds[trackIndex]![i]! / speedMax)) * 0.62,
            1,
            0.5,
          );
          return [c.r, c.g, c.b];
        });
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      }
      this.group.add(
        new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: speedTrails ? '#ffffff' : track.color,
            vertexColors: speedTrails,
            transparent: true,
            opacity: 0.7,
          }),
        ),
      );
      const ghost = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({
        color: track.color,
        transparent: true,
        opacity: 0.7,
      });
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 4).rotateX(-Math.PI / 2), mat);
      ghost.add(nose);
      for (const turn of [-Math.PI / 4, Math.PI / 4]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.15), mat);
        arm.rotation.y = turn;
        ghost.add(arm);
      }
      ghost.add(pilotLabel(track));
      ghost.userData['raceId'] = track.id;
      this.ghosts.set(track.id, ghost);
      this.group.add(ghost);
    }
    if (gate) {
      const tangent = new THREE.Vector3(-gate.nz, 0, gate.nx),
        centre = new THREE.Vector3(gate.x, gate.y, gate.z);
      const a = centre.clone().addScaledVector(tangent, -gate.width / 2),
        b = centre.clone().addScaledVector(tangent, gate.width / 2);
      const points = [
        a.clone().add(new THREE.Vector3(0, -gate.height / 2, 0)),
        a.clone().add(new THREE.Vector3(0, gate.height / 2, 0)),
        b.clone().add(new THREE.Vector3(0, gate.height / 2, 0)),
        b.clone().add(new THREE.Vector3(0, -gate.height / 2, 0)),
      ];
      this.group.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(gate.nx, 0, gate.nz),
          new THREE.Vector3(gate.x, gate.y - gate.height / 2 + 0.5, gate.z),
          2.5,
          0xffffff,
        ),
      );
      this.group.add(
        new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: '#ffffff' }),
        ),
      );
    }
  }
  update(time: number, camera: THREE.Camera, stale: (id: string) => boolean): void {
    for (const track of this.tracks) {
      const ghost = this.ghosts.get(track.id);
      if (!ghost) continue;
      const pose = stale(track.id) ? null : racePose(track, time);
      ghost.visible = !!pose;
      if (!pose) continue;
      ghost.position.set(pose.x, pose.y, pose.z);
      ghost.rotation.y = pose.heading;
      ghost.scale.setScalar(Math.max(1, camera.position.distanceTo(ghost.position) * 0.012));
    }
  }
  private clear(): void {
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>();
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Sprite) {
        if (!(o instanceof THREE.Sprite)) geometries.add(o.geometry);
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => materials.add(m));
      }
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => {
      if (m instanceof THREE.SpriteMaterial) m.map?.dispose();
      m.dispose();
    });
    this.group.clear();
    this.ghosts.clear();
  }
  dispose(): void {
    this.clear();
    this.group.removeFromParent();
  }
}
