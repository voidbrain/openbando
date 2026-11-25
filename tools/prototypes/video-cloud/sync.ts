// Browser side of sync.mjs: the app's own auto-sync (scanVideo + matchVideoToLog) on a video and its log.
import { createFlight, prepareFlight } from '../../../src/app/core/flight/flight';
import { parseLog } from '../../../src/app/core/flight/log-parser';
import { matchVideoToLog } from '../../../src/app/core/sync/matcher';
import type { Calibration } from '../../../src/app/core/models';
import { scanVideo } from '../../../src/app/services/video-scanner';

declare global {
  interface Window {
    sync: () => Promise<{ offset: number | null; confidence: string | null; description: string; duration: number }>;
  }
}

window.sync = async () => {
  const log = await (await fetch('/log')).text();
  const { pts, tel } = parseLog(log);
  const f = createFlight('survey', pts, tel);
  const cal: Calibration = { rot: 0, dx: 0, dz: 0, reference: { lat: pts[0]!.lat, lon: pts[0]!.lon } };
  prepareFlight(f, cal);
  const v = document.createElement('video');
  v.muted = true;
  v.playsInline = true;
  v.src = '/video';
  document.body.append(v);
  await new Promise<void>((r, e) => {
    v.onloadeddata = () => r();
    v.onerror = () => e(new Error('the video does not decode in Chrome'));
  });
  // as the app does: fast first; when decoding stalls or nothing matches (a busy machine, a 4K file), again at 1×
  let out = null as ReturnType<typeof matchVideoToLog> | null;
  let error = '';
  for (const rate of [undefined, 1]) {
    try {
      const samples = await scanVideo(v, 0, v.duration, () => undefined, rate);
      if (samples.length >= 40) out = matchVideoToLog(samples, f);
      if (out?.offset != null) break;
    } catch (e) {
      error = (e as Error).message;
    }
  }
  if (!out) throw new Error(error || 'too few frames decoded');
  return { offset: out.offset, confidence: out.confidence, description: out.description, duration: v.duration };
};
