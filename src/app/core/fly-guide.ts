/**
 * The guided Fly checklist (F-018, docs/archive/plans/fly-workflow-plan.md): a route (replay a recording, fly the simulator, follow
 * live telemetry) and its steps, each done from what the app already shows, so the list resumes by itself.
 */
export type FlyRoute = 'replay' | 'sim' | 'live';

/** Where the pilot is, read from the app: nothing here starts, arms or connects anything. */
export interface FlyState {
  bando: boolean;
  logs: number;
  video: boolean;
  synced: boolean;
  controller: boolean;
  simulatorOpen: boolean;
  armed: boolean;
  live: 'idle' | 'connecting' | 'connected' | 'error';
}

/** A panel or action a step offers; the panel resolves it. */
export type FlyAction = 'bandos' | 'flights' | 'video' | 'path' | 'radio' | 'simulator' | 'live';

export interface FlyStep {
  id: string;
  title: string;
  hint: string;
  /** What the app shows has completed it. */
  done: boolean;
  /** Why it cannot be done now (it is then neither current nor skippable). */
  unavailable?: string;
  /** The pilot may skip it (a recording they do not have, an optional step). */
  skippable: boolean;
  action?: { kind: FlyAction; label: string };
}

export const FLY_ROUTES: readonly { id: FlyRoute; label: string; hint: string }[] = [
  { id: 'replay', label: 'Replay', hint: 'Replay a recorded flight: its log, its DVR video or both' },
  { id: 'sim', label: 'Simulator', hint: 'Practise in the simulator over this bando' },
  { id: 'live', label: 'Live', hint: 'Follow live telemetry from a receiver bridge' },
];

const bando = (s: FlyState): FlyStep => ({
  id: 'bando', title: 'Open a bando', hint: 'Create one or open a saved one; the model and your alignment stay as you move on.',
  done: s.bando, skippable: false, action: { kind: 'bandos', label: 'Open the bandos' },
});

/** The steps of a route, in order. `skipped` holds the ids the pilot chose to skip. */
export function flySteps(route: FlyRoute, s: FlyState, skipped: ReadonlySet<string>): FlyStep[] {
  if (route === 'replay') {
    const log = s.logs > 0, both = log && s.video;
    return [
      bando(s),
      { id: 'log', title: 'Load the flight log', hint: 'A Betaflight Blackbox CSV, a GPX or a JSON. Skip it if you only have the DVR video.',
        done: log, skippable: true, action: { kind: 'flights', label: 'Open Flights' } },
      { id: 'video', title: 'Load its DVR video', hint: 'The video of the same flight; it stays on this computer. Skip it if you only have the log.',
        done: s.video, skippable: true, action: { kind: 'video', label: 'Open Video' } },
      { id: 'sync', title: 'Sync the video with the log', hint: 'Press Auto-sync in Video: it lines them up in time from how the picture moves.',
        done: s.synced, skippable: true,
        unavailable: both ? undefined : skipped.has('log') || skipped.has('video') ? 'Needs both the log and the video.' : undefined,
        action: { kind: 'video', label: 'Open Video' } },
      { id: 'align', title: 'Align the path with the model', hint: 'Time sync does not place the path: pin its start and end, or turn it, in Flight path.',
        done: false, skippable: true, unavailable: log ? undefined : 'Needs a flight log.', action: { kind: 'path', label: 'Open Flight path' } },
      { id: 'more', title: 'Compare more flights', hint: 'Load other logs of this bando to replay them together, or exchange race files in Flights.',
        done: s.logs > 1, skippable: true, action: { kind: 'flights', label: 'Open Flights' } },
    ];
  }
  if (route === 'sim') return [
    bando(s),
    { id: 'controller', title: 'Connect a controller', hint: 'A radio over USB or a gamepad; the keyboard works too (WASD, QE, arrows, space). Skip it to use the keyboard.',
      done: s.controller, skippable: true, action: { kind: 'radio', label: 'Open Radio controller' } },
    { id: 'simulator', title: 'Open the simulator', hint: 'Arming is up to you: nothing arms on its own. Collisions can be switched off in the Simulator panel.',
      done: s.simulatorOpen, skippable: false, action: { kind: 'simulator', label: 'Open Simulator' } },
    { id: 'arm', title: 'Arm and fly', hint: 'Arm with the switch or the button when you are ready; disarm to land.',
      done: s.armed, skippable: true, unavailable: s.simulatorOpen ? undefined : 'Open the simulator first.' },
  ];
  return [
    bando(s),
    { id: 'connect', title: 'Connect the live link', hint: 'Run the telemetry bridge (tools/elrs_bridge.py) and connect to its WebSocket or event stream.',
      done: s.live === 'connected', skippable: false, action: { kind: 'live', label: 'Open Live link' } },
    { id: 'watch', title: 'Watch the link', hint: 'The status line says when data goes stale, GPS is lost or the link drops; reconnect from Live link.',
      done: false, skippable: true, unavailable: s.live === 'connected' ? undefined : 'Connect first.' },
    { id: 'others', title: 'Fly with others', hint: 'Several live sources show as separate pilots in Flights; a relay is optional and only for people you trust.',
      done: false, skippable: true, action: { kind: 'flights', label: 'Open Flights' } },
  ];
}

/** The step to work on: the first one neither done, skipped nor unavailable (-1 when the route is complete). */
export function currentStep(steps: readonly FlyStep[], skipped: ReadonlySet<string>): number {
  return steps.findIndex((st) => !st.done && !skipped.has(st.id) && !st.unavailable);
}
