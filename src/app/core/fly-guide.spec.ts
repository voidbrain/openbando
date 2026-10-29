import { currentStep, flySteps, type FlyState } from './fly-guide';

const empty: FlyState = { bando: false, logs: 0, video: false, synced: false, controller: false, simulatorOpen: false, armed: false, live: 'idle' };
const none = new Set<string>();

describe('fly guide', () => {
  it('starts every route with the bando', () => {
    for (const route of ['replay', 'sim', 'live'] as const) {
      const steps = flySteps(route, empty, none);
      expect(steps[0]!.id).toBe('bando');
      expect(currentStep(steps, none)).toBe(0);
    }
  });

  it('follows a replay with both recordings: log, video, sync, then alignment', () => {
    let s: FlyState = { ...empty, bando: true };
    expect(flySteps('replay', s, none)[currentStep(flySteps('replay', s, none), none)]!.id).toBe('log');
    s = { ...s, logs: 1 };
    expect(flySteps('replay', s, none)[currentStep(flySteps('replay', s, none), none)]!.id).toBe('video');
    s = { ...s, video: true };
    expect(flySteps('replay', s, none)[currentStep(flySteps('replay', s, none), none)]!.id).toBe('sync');
    s = { ...s, synced: true };
    expect(flySteps('replay', s, none)[currentStep(flySteps('replay', s, none), none)]!.id).toBe('align');
  });

  it('a missing recording makes sync unavailable instead of blocking the route', () => {
    const skipped = new Set(['video']);
    const steps = flySteps('replay', { ...empty, bando: true, logs: 1 }, skipped);
    expect(steps.find((st) => st.id === 'sync')!.unavailable).toBe('Needs both the log and the video.');
    expect(steps[currentStep(steps, skipped)]!.id).toBe('align');
    const videoOnly = new Set(['log']);
    const v = flySteps('replay', { ...empty, bando: true, video: true }, videoOnly);
    expect(v.find((st) => st.id === 'align')!.unavailable).toBe('Needs a flight log.');
  });

  it('the simulator route never arms: arming is a step the pilot does', () => {
    const steps = flySteps('sim', { ...empty, bando: true, controller: true, simulatorOpen: true }, none);
    const arm = steps.find((st) => st.id === 'arm')!;
    expect(arm.done).toBe(false);
    expect(arm.action).toBeUndefined(); // no button that arms
    expect(steps[currentStep(steps, none)]!.id).toBe('arm');
  });

  it('live waits for a connection and is complete only when the pilot moves past watching', () => {
    const steps = flySteps('live', { ...empty, bando: true, live: 'connecting' }, none);
    expect(steps[currentStep(steps, none)]!.id).toBe('connect');
    const connected = flySteps('live', { ...empty, bando: true, live: 'connected' }, none);
    expect(connected[currentStep(connected, none)]!.id).toBe('watch');
    expect(currentStep(connected, new Set(['watch', 'others']))).toBe(-1);
  });
});
