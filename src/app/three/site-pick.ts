import * as THREE from 'three';
import type { SiteSpec } from '../core/site-spec';
import type { SiteModel } from './site-model';
export type SitePick =
  | { kind: 'building' | 'basement' | 'structure' | 'underground'; id: string }
  | { kind: 'column' | 'wall'; id: string; li: number; i: number }
  | { kind: 'fence' | 'tree' | 'road' | 'surface' | 'water'; i: number }
  | { kind: 'pad' };
/** Nearest visible surface only: terrain occludes underground selections. */
export function pickModel(ray: THREE.Raycaster, model: SiteModel, spec: SiteSpec): SitePick | null {
  model.group.updateMatrixWorld(true);
  for (const hit of ray.intersectObject(model.group, true)) {
    if (!(hit.object instanceof THREE.Mesh)) continue;
    let hidden = false;
    for (let o: THREE.Object3D | null = hit.object; o; o = o.parent) if (!o.visible) hidden = true;
    if (hidden) continue;
    if (hit.instanceId !== undefined) {
      const f = model.trees,
        i = hit.instanceId;
      const tree =
        hit.object === f.crownsDec
          ? f.dec[i]
          : hit.object === f.crownsCon
            ? f.con[i]
            : hit.object === f.trunks
              ? [...f.dec, ...f.con][i]
              : undefined;
      if (tree) {
        const index = spec.trees.indexOf(tree);
        if (index >= 0) return { kind: 'tree', i: index };
      }
    }
    for (let o: THREE.Object3D | null = hit.object; o; o = o.parent) {
      const p = o.userData['pick'] as SitePick | undefined;
      if (p) return p;
    }
    // An unlabelled surface (ground, a plain pad) blocks elements behind it.
    return null;
  }
  return null;
}
