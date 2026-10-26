import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { RaceRenderer } from './race-renderer';
import type { RaceTrack } from '../core/racing/race';
describe('simultaneous racing ghosts', () => {
  it('keeps pilot colour, independent delays and stale live visibility across the renderer join', () => {
    const a: RaceTrack = {
      id: 'a',
      name: 'A',
      color: '#38bdf8',
      offset: 0,
      visible: true,
      closed: false,
      live: false,
      points: [
        { x: 0, y: 2, z: 0, t: 0 },
        { x: 10, y: 2, z: 0, t: 2 },
      ],
    };
    const b = { ...a, id: 'b', color: '#fb923c', offset: 1 };
    const scene = new THREE.Scene(),
      r = new RaceRenderer(scene),
      camera = new THREE.PerspectiveCamera();
    r.rebuild([a, b], null);
    r.update(1, camera, () => false);
    const ghosts = r.group.children.filter((o) => o.userData['raceId']);
    expect(ghosts.map((g) => g.position.x)).toEqual([5, 0]);
    const materials = ghosts.map(
      (g) => (g.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial,
    );
    expect(materials.map((m) => `#${m.color.getHexString()}`)).toEqual([a.color, b.color]);
    r.update(1, camera, (id) => id === 'b');
    expect(ghosts[1]!.visible).toBe(false);
    r.dispose();
    expect(scene.children).toHaveLength(0);
  });
});
