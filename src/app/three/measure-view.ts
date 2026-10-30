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

/** Label height as a share of the view's height (the sprite ignores distance): the same for every measure and zoom. */
const LABEL_HEIGHT = 0.034;

/**
 * A measure's label as the Readout pill (design-system/components/Readout.md): mono text on `--overlay-soft` with a
 * `--line` border, sized to the text (B-019: a fixed 768 × 100 canvas drew wide bars with small text). Null without a
 * 2D canvas (tests).
 */
function measureLabel(text: string, color: string): { texture: THREE.CanvasTexture; aspect: number } | null {
  const token = (name: string, fallback: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const font = `600 32px ${token('--mono', 'monospace')}`, h = 56, pad = 20;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 2 * pad;
  canvas.width = w * 2; canvas.height = h * 2; // twice the size, for sharp text on HiDPI screens
  ctx.scale(2, 2);
  ctx.beginPath();
  ctx.roundRect(1, 1, w - 2, h - 2, (h - 2) / 2);
  ctx.fillStyle = token('--overlay-soft', 'rgba(15,13,28,0.9)'); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = token('--line', 'rgba(255,255,255,0.12)'); ctx.stroke();
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 1);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, aspect: w / h };
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
    const label = measureLabel(item.label, color);
    if (!label) continue;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: label.texture, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false }));
    const x = (item.seg.a.x + item.seg.b.x) / 2, z = (item.seg.a.z + item.seg.b.z) / 2;
    sprite.position.set(x, height(x, z) + 0.5, z); sprite.scale.set(LABEL_HEIGHT * label.aspect, LABEL_HEIGHT, 1); sprite.renderOrder = 12;
    sprite.userData['measureIndex'] = item.index; sprite.userData['measureLabel'] = true;
    group.add(sprite);
  }
  return group;
}
