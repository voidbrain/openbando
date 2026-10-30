// Recordings made in a browser (guide clips, Welcome films) cannot be redone in CI: say which ones show source files
// that changed since they were recorded (docs/guide/media.json: the commit each set was recorded at and the files it
// shows). Never fails; with --github it prints GitHub warnings. `--stamp <name>` records the current commit for a set
// (npm run clips / films do it after recording). F-031.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../docs/guide/media.json', import.meta.url);
const media = JSON.parse(readFileSync(FILE, 'utf8'));
const git = (...args) => { try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const args = process.argv.slice(2);

const stamp = args.indexOf('--stamp');
if (stamp >= 0) {
  const name = args[stamp + 1], set = media.sets.find((s) => s.name.toLowerCase().includes(String(name).toLowerCase()));
  if (!set) throw new Error(`no media set named like "${name}"`);
  set.recordedAt = git('rev-parse', '--short', 'HEAD');
  writeFileSync(FILE, `${JSON.stringify(media, null, 2)}\n`);
  console.log(`${set.name}: recorded at ${set.recordedAt}`);
  process.exit(0);
}

// `*` within a path segment, `**` across segments (the same globs as the impact map in .harness.json)
const glob = (g) => new RegExp(`^${g.split('**').map((p) => p.split('*').map((q) => q.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*')}$`);
const github = args.includes('--github');
for (const set of media.sets) {
  const watch = set.watch.map(glob);
  const changed = git('diff', '--name-only', set.recordedAt, 'HEAD');
  if (changed === null) {
    console.log(github ? `::warning title=Recordings::${set.name}: commit ${set.recordedAt} not found (shallow clone?)` : `! ${set.name}: commit ${set.recordedAt} not found`);
    continue;
  }
  const hit = changed.split('\n').filter((f) => f && !f.endsWith('.spec.ts') && watch.some((re) => re.test(f))); // tests show nothing
  const msg = hit.length
    ? `${set.name} (${set.files}) were recorded at ${set.recordedAt}; ${hit.length} file(s) they show changed since: ${hit.slice(0, 5).join(', ')}${hit.length > 5 ? ', …' : ''}. Watch them and re-record the ones that show a change (${set.run}).`
    : null;
  if (msg) console.log(github ? `::warning title=Recordings::${msg}` : `! ${msg}`);
  else console.log(`${set.name}: nothing they show changed since ${set.recordedAt}.`);
  // per recording, when the set names its sources (clip-sources.json): the ones whose own controls changed, for sure.
  // The warning above stays: a clip shows more than its controls (the panel around them, the 3D view, the styles).
  if (!set.perFile || !hit.length) continue;
  const per = JSON.parse(readFileSync(new URL(`../${set.perFile}`, import.meta.url), 'utf8')).clips;
  const changedSet = new Set(changed.split('\n'));
  const sure = Object.entries(per).map(([id, fs]) => [id, fs.filter((f) => changedSet.has(f))]).filter(([, fs]) => fs.length);
  if (!sure.length) continue;
  const list = sure.map(([id, fs]) => `${id} (${fs.map((f) => f.split('/').pop()).join(', ')})`).join('; ');
  const one = `${set.name}: these show controls whose component changed: ${list}.`;
  console.log(github ? `::warning title=Recordings::${one}` : `! ${one}`);
}
