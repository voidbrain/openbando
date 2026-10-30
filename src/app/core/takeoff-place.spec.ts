import { describe, expect, it } from 'vitest';
import { Vec3 } from './math3d';
import { SiteCollider } from './sim/collider';
import { createDroneState, stepDrone, type PilotInput } from './sim/drone-physics';
import { emptySpec, sanitizeSpec, type BuildingSpec, type SiteSpec } from './site-spec';
import { ROOF_CLEARANCE, standingLevels, takeoffChoices, takeoffHeight } from './takeoff-place';

const level = (baseY: number, roof: 'flat' | 'gable' | 'none') => ({ baseY, height: 3, sides: { n: true, s: true, e: true, w: true }, doors: {}, partitions: [], roof, roofRise: roof === 'gable' ? 2 : 0 });
const site = (roof: 'flat' | 'gable' = 'flat'): SiteSpec => {
  const s = emptySpec({ lat: 45.4642, lon: 9.19 }, 't');
  const b: BuildingSpec = { id: 'h', name: 'House', pos: { x: 0, z: 0 }, rotDeg: 30, length: 12, width: 8, levels: [level(0, 'none'), level(3, 'none'), level(6, roof)] };
  s.buildings = [b];
  s.pads = [{ x: 1, z: 1, w: 4, d: 4 }];
  s.droneStart = { x: 1, z: 1 };
  return s;
};

describe('the take-off pad on a floor or a flat roof', () => {
  it('offers the upper floors and a flat roof of the building under the pad, nothing on open ground', () => {
    const s = site();
    expect(takeoffChoices(s).map((c) => [c.label, c.level, +c.height.toFixed(2)])).toEqual([['L1', 1, 3.1], ['L2', 2, 6.1], ['Roof', 3, +(9.3 + ROOF_CLEARANCE).toFixed(2)]]);
    expect(takeoffChoices(site('gable')).map((c) => c.label)).toEqual(['L1', 'L2']); // a pitched roof is no pad
    expect(takeoffChoices(s, { x: 40, z: 40 })).toEqual([]);
    expect(standingLevels({ ...s.buildings[0]!, roofless: true })).toEqual([]); // an open shell has no floors left
  });

  it('stands at the chosen floor; back on the ground when that floor or the building is gone; old bandos on the ground', () => {
    const s = site();
    expect(takeoffHeight(s)).toBe(0);
    s.takeoffOn = { building: 'h', level: 2 };
    expect(takeoffHeight(s)).toBeCloseTo(6.1, 6);
    expect(sanitizeSpec(JSON.parse(JSON.stringify(s)))!.takeoffOn).toEqual({ building: 'h', level: 2 });
    s.buildings[0]!.levels.pop();
    s.buildings[0]!.levels.pop(); // only the ground floor left
    expect(takeoffHeight(s)).toBe(0);
    expect(sanitizeSpec({ ...site(), takeoffOn: { building: 'h', level: 0 } })!.takeoffOn).toBeUndefined(); // level 0 is the ground
  });

  it('a drone resting on a flat roof stays there, unharmed, and can take off', () => {
    const top = 9.3; // the roof box: from the wall top (9) to 0.3 above it
    const pts = [{ x: -6, z: -4 }, { x: 6, z: -4 }, { x: 6, z: 4 }, { x: -6, z: 4 }];
    const world = new SiteCollider([[-6, 6, 9, top, -4, 4, true]], [], null, [], [], [], [{ pts, top: top + ROOF_CLEARANCE, roof: true }]);
    expect(world.groundAt(0, 0, top + 1)).toBeCloseTo(top + ROOF_CLEARANCE, 6); // above the roof: the roof is the ground
    expect(world.groundAt(0, 0, 2)).toBe(0); // inside, under it: the floor below
    world.roofHidden = true;
    expect(world.groundAt(0, 0, top + 1)).toBe(0); // hidden roofs are not there
    world.roofHidden = false;
    const d = createDroneState(1, { x: 0, z: 0, y: top + ROOF_CLEARANCE });
    const idle: PilotInput = { roll: 0, pitch: 0, yaw: 0, throttle: 0, gamepad: false, spring: false };
    let crashed = false;
    for (let i = 0; i < 240; i++) crashed = stepDrone(d, 1 / 120, idle, { rate: 400, expo: 0.3 }, world).crashed || crashed;
    expect(crashed).toBe(false);
    expect(d.p.y).toBeGreaterThan(top);
    expect(world.hit(new Vec3(d.p.x, d.p.y, d.p.z))).toBe(false); // clear of the roof's collider
    d.armed = true;
    for (let i = 0; i < 120; i++) stepDrone(d, 1 / 120, { ...idle, throttle: 1 }, { rate: 400, expo: 0.3 }, world);
    expect(d.p.y).toBeGreaterThan(top + 2); // it takes off
  });
});
