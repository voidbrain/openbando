import { basementPieceBuilding } from '../core/basement';
import * as THREE from 'three';
import type { BuildingSpec, SiteSpec } from '../core/site-spec';
import { levelOnly } from './element-preview';
import { siteGround } from '../core/site-ground';
import type { SitePick } from './site-pick';

export type IndoorFloor = { id: string; li: number };

/** Height shared by floor placement and measurement overlays, in site metres. */
export function indoorFloorHeight(spec: SiteSpec, floor: IndoorFloor | null): number | null {
  const b = floor ? spec.buildings.find(b => b.id === floor.id) : undefined;
  if (!b || !floor || (floor.li === -1 ? !b.basement : !b.levels[floor.li])) return null;
  const local = floor.li === -1 ? b.levels[0]!.baseY - b.basement!.height : b.levels[floor.li]!.baseY;
  return (siteGround(spec).building.get(b.id) ?? 0) + local;
}

/** Isolate the chosen floor without changing the editable site or removing its basement terrain cut. */
export function indoorViewSpec(spec: SiteSpec, floor: IndoorFloor): SiteSpec {
  if (floor.li === -1) {
    const b = spec.buildings.find(building => building.id === floor.id && building.basement);
    if (!b) return spec;
    const ground = siteGround(spec);
    const isolated = levelOnly(b, -1);
    isolated.levels[0]!.baseY += ground.building.get(b.id) ?? 0;
    // separate pieces show beside it (own ids: selection and handles stay on the main basement)
    const pieces = (b.basement?.pieces ?? []).map((_, i) => basementPieceBuilding(b, i)).filter((p): p is BuildingSpec => !!p)
      .map((p, i) => ({ ...p, id: `${b.id}~piece${i}`, levels: [{ ...p.levels[0]!, baseY: p.levels[0]!.baseY + (ground.building.get(b.id) ?? 0) }] }));
    const structures = (spec.structures ?? []).filter(st => (st.kind === 'stairs' || st.kind === 'ramp') && (st.y ?? 0) < 0).map(st => ({ ...st, y: (st.y ?? 0) + ground.at(st.x, st.z) }));
    return { ...spec, buildings: [isolated, ...pieces], structures, trees: [], pads: [], underground: [], terrain: undefined };
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
