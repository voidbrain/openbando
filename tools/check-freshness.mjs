// Is the backlog behind the default branch, are merged branches left over, is the last audit too old, and is the harness
// template newer? Prints what to do first (AGENTS: session start). Never fails: with --github it prints GitHub
// warnings, so a PR shows them without being blocked.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const github = process.argv.includes('--github');
const git = (...args) => { try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const notes = [];
const warn = (text) => notes.push(text);
let stamp = {};
try { if (existsSync(new URL('../.harness.json', import.meta.url))) stamp = JSON.parse(readFileSync(new URL('../.harness.json', import.meta.url), 'utf8')); }
catch (e) { warn(`.harness.json is not valid JSON (${e.message}): defaults used.`); }
const MAX_AUDIT_DAYS = stamp.freshness?.auditDays ?? 7;

// Compare with the published default branch, never the local checkout: a local branch that is behind (or a feature
// branch) would hide merged PRs. The branch is .harness.json defaultBranch, else the remote's HEAD, else main.
git('fetch', '--prune', '--quiet', 'origin'); // ignored when offline
const branch = stamp.defaultBranch ?? git('symbolic-ref', '--short', 'refs/remotes/origin/HEAD')?.replace(/^origin\//, '') ?? 'main';
const tip = git('rev-parse', '--verify', '--quiet', `origin/${branch}`) ? `origin/${branch}` : branch;
if (tip === branch) warn(`No origin/${branch}: comparing with the local ${branch}, which may be behind GitHub.`);

// 1. the backlog header names the default-branch commit it was last reconciled against
const backlog = new URL('../docs/BACKLOG.md', import.meta.url);
const header = existsSync(backlog) ? readFileSync(backlog, 'utf8').split('\n').find((l) => l.startsWith('Current work ledger')) : undefined;
const sha = header?.match(/against [^\s`]+ `([0-9a-f]{7,40})`/)?.[1];
if (!sha) warn(`The backlog header names no ${branch} commit ("against ${branch} \`<sha>\`"): reconcile it against ${branch}.`);
else if (git('cat-file', '-e', `${sha}^{commit}`) === null) warn(`The backlog's commit ${sha} is not in this checkout (shallow clone or rewritten history): fetch ${branch} or reconcile by hand.`);
else {
  // a PR that only records evidence (backlog, archive, audits) needs no reconciling of its own: otherwise every
  // reconciliation would leave the backlog one PR behind forever
  const recordsOnly = (merge) => (git('diff', '--name-only', `${merge}^1`, merge)?.split('\n').filter(Boolean) ?? ['?'])
    .every((f) => /^docs\/(BACKLOG\.md|archive\/|audits\/)/.test(f));
  // every commit on the branch's first-parent line is a PR landing: a merge commit ("Merge pull request #N") or a
  // squash or rebase merge ("Title (#N)"); a commit without a PR number was pushed directly and is not a PR
  const landed = git('log', '--first-parent', '--format=%H %s', `${sha}..${tip}`)?.split('\n').filter(Boolean) ?? [];
  const prs = landed.filter((l) => !recordsOnly(l.split(' ')[0]))
    .map((l) => l.match(/^\S+ Merge pull request #(\d+)/)?.[1] ?? l.match(/\(#(\d+)\)$/)?.[1]).filter(Boolean);
  if (prs.length) warn(`The backlog is ${prs.length} merged PR(s) behind ${branch} (#${prs.join(', #')}): read their CI (npm run ci:status -- ${prs.join(' ')}), update or close the records, archive closed ones, move the header to the current ${branch}.`);
}

// 2. branches already merged into the default branch but still on the remote
const merged = git('branch', '-r', '--merged', tip)?.split('\n').map((b) => b.trim()).filter((b) => b && b !== `origin/${branch}` && !/^origin\/HEAD\b/.test(b)) ?? [];
if (merged.length) warn(`Merged branches are still on the remote (${merged.join(', ')}): delete them (git push origin --delete <branch>) and their local branches and worktrees.`);

// 3. the newest dated audit
const auditDir = new URL('../docs/audits/', import.meta.url);
const audits = (existsSync(auditDir) ? readdirSync(auditDir) : []).map((f) => f.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]).filter(Boolean).sort();
const last = audits.at(-1);
const today = new Date(process.env.FRESHNESS_TODAY ?? Date.now());
const days = last ? Math.floor((today - new Date(`${last}T00:00:00Z`)) / 86_400_000) : Infinity;
if (days > MAX_AUDIT_DAYS) warn(`The last audit (docs/audits/${last ?? 'none'}) is ${Number.isFinite(days) ? `${days} days` : 'missing'} old (limit ${MAX_AUDIT_DAYS}, freshness.auditDays in .harness.json): audit what changed since (docs, tests, style guide, accessibility, privacy) and write docs/audits/<date>.md.`);

if (!notes.length) console.log(`Fresh: backlog reconciled against current ${branch}; last audit ${last} (${days} day(s) ago).`);
for (const n of notes) console.log(github ? `::warning title=Backlog freshness::${n}` : `! ${n}`);

// 4. the harness template this project was applied from (tools/check-harness.mjs; skipped without a local template)
const harness = fileURLToPath(new URL('./check-harness.mjs', import.meta.url));
if (existsSync(harness)) execFileSync(process.execPath, [harness, ...(github ? ['--github'] : [])], { stdio: 'inherit' });
