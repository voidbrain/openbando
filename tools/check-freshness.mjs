// Is the backlog behind main, are merged branches left over, and is the last audit more than a week old? Prints what to do first (AGENTS: session
// start). Never fails: with --github it prints GitHub warnings, so a PR shows them without being blocked.
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const MAX_AUDIT_DAYS = 7;
const github = process.argv.includes('--github');
const git = (...args) => { try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
git('fetch', '--prune', '--quiet', 'origin'); // current remote branches and main (ignored when offline)
const notes = [];
const warn = (text) => notes.push(text);

// 1. the backlog header names the main commit it was last reconciled against
const header = readFileSync(new URL('../docs/BACKLOG.md', import.meta.url), 'utf8').split('\n').find((l) => l.startsWith('Current work ledger'));
const sha = header?.match(/against main `([0-9a-f]{7,40})`/)?.[1];
if (!sha) warn('The backlog header names no main commit ("against main `<sha>`"): reconcile it against main.');
else if (git('cat-file', '-e', `${sha}^{commit}`) === null) warn(`The backlog's commit ${sha} is not in this checkout (shallow clone or rewritten history): fetch main or reconcile by hand.`);
else {
  const merged = git('log', '--merges', '--first-parent', '--format=%s', `${sha}..HEAD`)?.split('\n').filter(Boolean) ?? [];
  const prs = merged.map((s) => s.match(/#(\d+)/)?.[1]).filter(Boolean);
  if (prs.length) warn(`The backlog is ${prs.length} merged PR(s) behind main (#${prs.join(', #')}): read their CI (npm run ci:status -- ${prs.join(' ')}), update or close the records, archive closed ones, move the header to the current main.`);
}

// 2. branches already merged into main but still on the remote
const merged = git('branch', '-r', '--merged', 'origin/main')?.split('\n').map((b) => b.trim()).filter((b) => b && !/^origin\/(main|HEAD)\b/.test(b)) ?? [];
if (merged.length) warn(`Merged branches are still on the remote (${merged.join(', ')}): delete them (git push origin --delete <branch>) and their local branches and worktrees.`);

// 3. the newest dated audit
const audits = readdirSync(new URL('../docs/audits/', import.meta.url)).map((f) => f.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]).filter(Boolean).sort();
const last = audits.at(-1);
const today = new Date(process.env.FRESHNESS_TODAY ?? Date.now());
const days = last ? Math.floor((today - new Date(`${last}T00:00:00Z`)) / 86_400_000) : Infinity;
if (days > MAX_AUDIT_DAYS) warn(`The last audit (docs/audits/${last ?? 'none'}) is ${Number.isFinite(days) ? `${days} days` : 'missing'} old (limit ${MAX_AUDIT_DAYS}): audit what changed since (docs, tests, guides and clips, design system, accessibility, privacy) and write docs/audits/<date>.md.`);

if (!notes.length) console.log(`Fresh: backlog reconciled against current main; last audit ${last} (${days} day(s) ago).`);
for (const n of notes) console.log(github ? `::warning title=Backlog freshness::${n}` : `! ${n}`);
