import * as THREE from 'three';
import type { SiteSpec } from '../core/site-spec';
import { levelOnly } from './element-preview';
import { siteGround } from '../core/site-ground';
import type { SitePick } from './site-pick';

export type IndoorFloor = { id: string; li: number };

/** Isolate the chosen floor without changing the editable site or removing its basement terrain cut. */
export function indoorViewSpec(spec: SiteSpec, floor: IndoorFloor): SiteSpec {
  if (floor.li === -1) {
    const b = spec.buildings.find(building => building.id === floor.id && building.basement);
    if (!b) return spec;
    const ground = siteGround(spec);
    const isolated = levelOnly(b, -1);
    isolated.levels[0]!.baseY += ground.building.get(b.id) ?? 0;
    const structures = (spec.structures ?? []).filter(st => (st.kind === 'stairs' || st.kind === 'ramp') && (st.y ?? 0) < 0).map(st => ({ ...st, y: (st.y ?? 0) + ground.at(st.x, st.z) }));
    return { ...spec, buildings: [isolated], structures, trees: [], pads: [], underground: [], terrain: undefined };
  }
  return { ...spec, buildings: spec.buildings.map((building) => {
    if (building.id !== floor.id || !building.levels[floor.li]) return building;
    const isolated = levelOnly(building, floor.li);
    isolated.levels[0]!.roof = 'none';
    isolated.basement = building.basement;
    return isolated;
  }) };
}

/** The isolated floor is rendered at index zero; its pick must refer to the original floor. */
export function indoorSourcePick(pick: SitePick | null, floor: IndoorFloor | null): SitePick | null {
  if (floor && pick && (pick.kind === 'column' || pick.kind === 'wall') && pick.id === floor.id)
    return { ...pick, li: floor.li };
  return pick;
}

export function floorPoint(ray: THREE.Ray, height: number): { x: number; z: number } | null {
  const point = new THREE.Vector3();
  return ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -height), point) ? { x: point.x, z: point.z } : null;
}
