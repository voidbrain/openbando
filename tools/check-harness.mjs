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
  // CI has no template clone: skipped quietly there; locally a missing clone is something to fix
  const text = `Harness template not found at ${home}${stamp.template?.repo ? `: clone it (git clone ${stamp.template.repo} ${home})` : ''}; template check skipped.`;
  if (process.env.CI) console.log(text); else warn(text);
  done();
}

const git = (...args) => { try { return execFileSync('git', ['-C', home, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } };
// Online first: compare against the template's published releases, never only a local clone's. A clone that cannot
// reach its remote, is behind it or has local edits is reported, because applying or changing it would use stale files.
if (git('remote', 'get-url', 'origin')) {
  if (git('fetch', '--tags', '--prune', '--quiet', 'origin') === null)
    warn(`Could not reach the template's remote from ${home}: releases below are the local ones and may be stale.`);
  const [ahead, behindBy] = (git('rev-list', '--left-right', '--count', 'HEAD...@{upstream}') ?? '0 0').trim().split(/\s+/).map(Number);
  if (behindBy) warn(`The template clone at ${home} is ${behindBy} commit(s) behind its remote: git -C ${home} pull --ff-only --tags before applying or changing it.`);
  if (ahead) warn(`The template clone at ${home} has ${ahead} unpushed commit(s): push them (or open their PR) before applying them to a project.`);
  if (git('status', '--porcelain')?.trim()) warn(`The template clone at ${home} has uncommitted changes: projects are checked against release tags only.`);
} else warn(`The template clone at ${home} has no remote${stamp.template?.repo ? ` (expected ${stamp.template.repo})` : ''}: releases cannot be checked online.`);
const tags = (git('tag', '--list', 'v*', '--sort=-v:refname') ?? '').split('\n').filter(Boolean).map((t) => t.slice(1));
const latest = tags[0];
const base = stamp.version;
if (!latest) { warn(`The template at ${home} has no release tags (vX.Y.Z): tag a release before checking projects against it.`); done(); }
if (!tags.includes(base)) { warn(`.harness.json names version ${base}, which the template at ${home} has no tag for (latest v${latest}): set it to the release this project was last reconciled with, or tag the release if it is pending.`); done(); }

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
      if (at(base, source) === null && at(latest, source) !== null) warn(`${path}: ${source} is new in the template since v${base}; adopt it if it fits (git -C ${home} show v${latest}:${source}).`);
      else if (at(base, source) !== at(latest, source)) warn(`${path}: its template source ${source} changed since v${base}; reconcile by hand (${diff(source)}).`);
  const log = git('log', '--format=  %s', `v${base}..v${latest}`)?.trim();
  warn(`Harness template v${latest} is out (this project is on v${base}). See CHANGELOG.md in the template${log ? `; changes:\n${log}` : ''}\nReconcile the files above (APPLY.md, "Reconciling"), then set "version" in .harness.json to "${latest}".`);
}
done(`Harness: on template v${latest}; copied files match it.`);
