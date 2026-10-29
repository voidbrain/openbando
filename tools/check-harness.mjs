// Is this project behind the harness template it was applied from? Compares .harness.json with the template's release
// tags and says, per file, what to reconcile. Never fails: run by check-freshness at session start; --github prints
// GitHub warnings. The template is a local clone (HARNESS_HOME, else template.path in .harness.json); without one the
// check is skipped, as in CI.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const github = process.argv.includes('--github');
const root = new URL('..', import.meta.url).pathname;
const notes = [];
const warn = (text) => notes.push(text);
const done = (ok) => {
  if (!notes.length && ok) console.log(ok);
  for (const n of notes) console.log(github ? `::warning title=Harness template::${n}` : `! ${n}`);
  process.exit(0);
};

const stampFile = join(root, '.harness.json');
if (!existsSync(stampFile)) done('No .harness.json: this project was not applied from the harness template.');
const stamp = JSON.parse(readFileSync(stampFile, 'utf8'));
const home = (process.env.HARNESS_HOME ?? stamp.template?.path ?? '~/Projects/project-harness').replace(/^~(?=\/|$)/, homedir());
if (!existsSync(join(home, 'VERSION'))) {
  console.log(`Harness template not found at ${home}${stamp.template?.repo ? ` (clone ${stamp.template.repo})` : ''}: template check skipped.`);
  process.exit(0);
}

const git = (...args) => { try { return execFileSync('git', ['-C', home, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } };
git('fetch', '--tags', '--quiet'); // a template with a remote: its newest releases (ignored offline or without one)
const tags = (git('tag', '--list', 'v*', '--sort=-v:refname') ?? '').split('\n').filter(Boolean).map((t) => t.slice(1));
const latest = tags[0];
const base = stamp.version;
if (!latest) done(`The template at ${home} has no release tags (vX.Y.Z): tag a release before checking projects against it.`);
if (!tags.includes(base)) done(`.harness.json names version ${base}, which the template at ${home} has no tag for: set it to the release this project was last reconciled with.`);

const at = (version, path) => git('show', `v${version}:${path}`);
const mine = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : null);
const list = (value) => (Array.isArray(value) ? value : [value]);
const diff = (path) => `git -C ${home} diff v${base} v${latest} -- ${path}`;
const behind = tags.indexOf(base) > 0;

// Copied files are byte-identical to the template; project settings live in .harness.json, not in the files.
for (const [path, source] of Object.entries(stamp.copied ?? {})) {
  const was = at(base, source), now = at(latest, source), here = mine(path);
  if (here === null) warn(`${path} is missing: copy ${source} from template v${latest}.`);
  else if (here === now) continue;
  else if (here === was) warn(`${path}: template v${latest} updated it; copy ${source} from the template (${diff(source)}).`);
  else if (was === now) warn(`${path} differs from template v${base}: keep project settings in .harness.json; a generic improvement goes back into the template.`);
  else warn(`${path}: CONFLICT, changed here and in the template since v${base}; merge by hand (${diff(source)}).`);
}

// Adapted files were rewritten for the project: when their template source changes, reconcile the change by hand.
if (behind) {
  for (const [path, sources] of Object.entries(stamp.adapted ?? {}))
    for (const source of list(sources))
      if (at(base, source) !== at(latest, source)) warn(`${path}: its template source ${source} changed since v${base}; reconcile by hand (${diff(source)}).`);
  const log = git('log', '--format=  %s', `v${base}..v${latest}`)?.trim();
  warn(`Harness template v${latest} is out (this project is on v${base}). See CHANGELOG.md in the template${log ? `; changes:\n${log}` : ''}\nReconcile the files above (APPLY.md, "Reconciling"), then set "version" in .harness.json to "${latest}".`);
}
done(`Harness: on template v${latest}; copied files match it.`);
