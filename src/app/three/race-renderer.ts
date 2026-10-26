import * as THREE from 'three';
import { racePose, type Gate, type RaceTrack } from '../core/racing/race';
/** Identity colours and non-colliding GPS ghosts. No renderer/DOM needed to build or test. */
export class RaceRenderer {
  readonly group = new THREE.Group();
  private ghosts = new Map<string, THREE.Group>();
  private tracks: readonly RaceTrack[] = [];
  private signature = '';
  private lastBuild = 0;
  synchronize(tracks: readonly RaceTrack[], gate: Gate | null): void {
    const signature = JSON.stringify([tracks.map((t) => [t.id, t.color, t.visible]), gate]),
      now = performance.now();
    if (signature !== this.signature || now - this.lastBuild >= 1000) {
      this.signature = signature;
      this.lastBuild = now;
      this.rebuild(tracks, gate);
    } else this.tracks = tracks;
  }
  constructor(scene: THREE.Scene) {
    scene.add(this.group);
    this.group.visible = false;
  }
  rebuild(tracks: readonly RaceTrack[], gate: Gate | null): void {
    this.clear();
    this.tracks = tracks;
    for (const track of tracks) {
      if (!track.visible) continue;
      const points = track.points.filter(
        (_, i) => i % Math.max(1, Math.ceil(track.points.length / 2000)) === 0,
      );
      if (points.at(-1) !== track.points.at(-1)) points.push(track.points.at(-1)!);
      const geo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
      );
      this.group.add(
        new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: track.color, transparent: true, opacity: 0.7 }),
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
      if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
        geometries.add(o.geometry);
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => materials.add(m));
      }
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    this.group.clear();
    this.ghosts.clear();
  }
  dispose(): void {
    this.clear();
    this.group.removeFromParent();
  }
}
