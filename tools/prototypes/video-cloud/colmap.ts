// Route (a) of the F-053 trial: COLMAP's poses come from matching the frames; the log only gives scale, north and place.
// Usage (README.md):
//   node colmap.mjs refs  <log.csv> <colmapDir> [fps] [offset]   writes <colmapDir>/refs.txt (frame name, x y z in
//                                                               metres from the first fix; no geographic coordinates)
//   node colmap.mjs score <log.csv> <colmapDir> <points3D.txt> <outPrefix> [offset]
import fs from 'node:fs';
import { createFlight, prepareFlight } from '../../../src/app/core/flight/flight';
import { parseLog } from '../../../src/app/core/flight/log-parser';
import { ReplayPose } from '../../../src/app/core/flight/replay';
import type { Calibration } from '../../../src/app/core/models';
import { score, type CloudPoint } from './score';

const [, , mode, logFile, dir, a4, a5, a6] = process.argv;
const { pts, tel } = parseLog(fs.readFileSync(logFile!, 'utf8'));
const f = createFlight('survey', pts, tel);
const cal: Calibration = { rot: 0, dx: 0, dz: 0, reference: { lat: pts[0]!.lat, lon: pts[0]!.lon } };
prepareFlight(f, cal);
// the site projection puts the open-sea test fix ~100 km out: start the flight at the origin
const ox = f.loc[0]!.x,
  oz = f.loc[0]!.z;
for (const l of f.loc) {
  l.x -= ox;
  l.z -= oz;
}
const groundY = f.loc[0]!.y - 0.3;

if (mode === 'refs') {
  const fps = +(a4 ?? 3),
    offset = +(a5 ?? -0.69);
  const pose = new ReplayPose();
  const names = fs.readdirSync(`${dir}/images`).filter((n) => n.endsWith('.jpg')).sort();
  const rows: string[] = [];
  names.forEach((name, i) => {
    const t = i / fps - offset; // ffmpeg's fps filter: frame i at i / fps seconds of video
    if (t < 0 || t > f.dur) return;
    pose.update(f, t, cal, 1);
    rows.push(`${name} ${pose.p.x.toFixed(3)} ${pose.p.y.toFixed(3)} ${pose.p.z.toFixed(3)}`);
  });
  fs.writeFileSync(`${dir}/refs.txt`, rows.join('\n') + '\n');
  console.log(`${rows.length} of ${names.length} frames have a position from the log`);
} else if (mode === 'score') {
  const cloud: CloudPoint[] = [];
  let all = 0;
  for (const line of fs.readFileSync(a4!, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const v = line.split(' ');
    all++;
    const err = +v[7]!,
      track = (v.length - 8) / 2;
    if (err > 2 || track < 3) continue;
    cloud.push({ x: +v[1]!, y: +v[2]! - groundY, z: +v[3]!, r: +v[4]!, g: +v[5]!, b: +v[6]! });
  }
  const sc = score(cloud, f.loc, a5!);
  console.log(JSON.stringify({ points: all, kept: cloud.length, offset: +(a6 ?? -0.69), ...sc }, null, 1));
}
