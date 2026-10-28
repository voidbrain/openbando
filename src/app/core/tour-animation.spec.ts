import {describe,expect,it} from 'vitest';
import {animateTour,TourAnimationClock} from './tour-animation';

describe('guide animation under delayed rendering', () => {
  it('finishes on time with fewer samples when each frame is expensive', async () => {
    for (const frame of [16,700]) {
      let now=0, waits=0;
      const fractions:number[]=[];
      await animateTour(1400,t=>fractions.push(t),{
        now:()=>now,
        wait:async()=>{now+=frame;waits++;},
        skipped:()=>false,
      });
      expect(fractions[0]).toBe(0);expect(fractions.at(-1)).toBe(1);
      expect(now).toBeGreaterThanOrEqual(1400);expect(now).toBeLessThan(1400+frame);
      expect(waits).toBeLessThanOrEqual(Math.ceil(1400/frame));
      expect(fractions.every((t,i)=>i===0||t>=fractions[i-1]!)).toBe(true);
    }
  });
  it('does not consume animation time while paused, including repeated pause/resume', () => {
    const clock=new TourAnimationClock();
    clock.pause(true,100);expect(clock.time(10000)).toBe(100);
    clock.pause(true,500);clock.pause(false,10000);
    expect(clock.time(10300)).toBe(400);
    clock.pause(true,10400);clock.pause(false,11000);
    expect(clock.time(11100)).toBe(600);
  });
  it('Next completes the action without replaying a backlog of intermediate frames', async () => {
    const fractions:number[]=[];
    await animateTour(1400,t=>fractions.push(t),{now:()=>0,wait:async()=>undefined,skipped:()=>true});
    expect(fractions).toEqual([0,1]);
  });
  it('propagates Stop immediately so the caller can release an active pointer', async () => {
    const stop=new Error('stopped'), fractions:number[]=[];
    await expect(animateTour(1400,t=>fractions.push(t),{now:()=>0,wait:async()=>{throw stop;},skipped:()=>false})).rejects.toBe(stop);
    expect(fractions).toEqual([0]);
  });
});
