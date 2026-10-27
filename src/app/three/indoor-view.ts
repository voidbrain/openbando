import * as THREE from 'three';
import type { SiteSpec } from '../core/site-spec';
import { levelOnly } from './element-preview';
import type { SitePick } from './site-pick';

export type IndoorFloor = { id: string; li: number };

/** Isolate the chosen floor without changing the editable site or removing its basement terrain cut. */
export function indoorViewSpec(spec: SiteSpec, floor: IndoorFloor): SiteSpec {
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
