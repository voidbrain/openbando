import * as THREE from 'three';
import type { Seg } from '../core/measure';

export interface MeasureViewItem { seg: Seg; label: string; selected: boolean; index: number }

/** Sample a measure along the same terrain surface used by the 3D model. */
export function measureVertices(seg: Seg, height: (x: number, z: number) => number): number[] {
  const pts: number[] = [];
  for (let i = 0; i <= 32; i++) {
    const u = i / 32, x = seg.a.x + (seg.b.x - seg.a.x) * u, z = seg.a.z + (seg.b.z - seg.a.z) * u;
    pts.push(x, height(x, z) + 0.3, z);
  }
  return pts;
}

/** Create non-colliding line and label overlays in site coordinates. */
export function buildMeasureView(items: readonly MeasureViewItem[], height: (x: number, z: number) => number): THREE.Group {
  const group = new THREE.Group();
  for (const item of items) {
    const color = item.selected ? '#ff7777' : '#38d6ff';
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(measureVertices(item.seg, height), 3));
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, depthTest: false }));
    line.renderOrder = 11;
    line.userData['measureIndex'] = item.index;
    group.add(line);
    if (item.index < 0) continue; // the in-progress line has no selectable label
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.fillStyle = 'rgba(15,24,19,0.88)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color; ctx.font = '600 38px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(item.label, 384, 50, 748);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false }));
    const x = (item.seg.a.x + item.seg.b.x) / 2, z = (item.seg.a.z + item.seg.b.z) / 2;
    sprite.position.set(x, height(x, z) + 0.5, z); sprite.scale.set(0.24, 0.03125, 1); sprite.renderOrder = 12;
    sprite.userData['measureIndex'] = item.index; sprite.userData['measureLabel'] = true;
    group.add(sprite);
  }
  return group;
}
