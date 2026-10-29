// Is the backlog behind the default branch, are merged branches left over, does this branch change harness files or files
// the impact map names, is the last audit too old, and is the harness template newer? Prints what to do first (AGENTS: session start). Never fails: with --github it prints GitHub
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
// A failed fetch (offline, no access) never fails the check, but the cached refs may be old: say so instead of "Fresh".
if (git('remote')?.split('\n').includes('origin') && git('fetch', '--prune', '--quiet', 'origin') === null)
  warn('Could not fetch origin (offline or no access): compared with origin as last fetched, so anything merged since is not seen.');
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
  // every commit on the branch's first-parent line changed the default branch, whatever its message says: a merge
  // commit ("Merge pull request #N"), a squash merge ("Title (#N)"), or a rebase merge or direct push with no number,
  // which gh looks up when it can; a commit no PR is found for is listed by its hash
  const gh = (...args) => { try { return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000 }).trim() || null; } catch { return null; } };
  const landed = git('log', '--first-parent', '--format=%H %s', `${sha}..${tip}`)?.split('\n').filter(Boolean) ?? [];
  const prs = new Set(), commits = [];
  for (const line of landed) {
    const hash = line.split(' ')[0];
    if (recordsOnly(hash)) continue;
    const pr = line.match(/^\S+ Merge pull request #(\d+)/)?.[1] ?? line.match(/\(#(\d+)\)$/)?.[1]
      ?? gh('api', `repos/{owner}/{repo}/commits/${hash}/pulls`, '--jq', '.[0].number // empty');
    if (pr) prs.add(pr); else commits.push(hash.slice(0, 7));
  }
  const n = [...prs];
  if (n.length || commits.length) warn(`The backlog is behind ${branch} by ${[n.length && `${n.length} merged PR(s) (#${n.join(', #')})`, commits.length && `${commits.length} commit(s) with no PR found (${commits.join(', ')})`].filter(Boolean).join(' and ')}: ${n.length ? `read their CI (npm run ci:status -- ${n.join(' ')}), ` : ''}${commits.length ? 'review the commits without a PR (git show <hash>), ' : ''}update or close the records, archive closed ones, move the header to the current ${branch}.`);
}

// 2. branches already merged into the default branch but still on the remote
const merged = git('branch', '-r', '--merged', tip)?.split('\n').map((b) => b.trim()).filter((b) => b && b !== `origin/${branch}` && !/^origin\/HEAD\b/.test(b)) ?? [];
if (merged.length) warn(`Merged branches are still on the remote (${merged.join(', ')}): delete them (git push origin --delete <branch>) and their local branches and worktrees.`);

// 3. what this branch changes, against the default branch (committed or not): harness files and the impact map
const base = git('merge-base', tip, 'HEAD');
const changed = base ? [git('diff', '--name-only', base), git('ls-files', '--others', '--exclude-standard')].join('\n').split('\n').filter(Boolean) : [];
const isTemplate = existsSync(new URL('../core/tools/', import.meta.url));

// 3a. harness files: each change is either this project's (its content, a setting, a line marked <!-- project -->, an
// override) or every project's (the template first). Asking is the rule when that is unclear (AGENTS, "Changing a
// harness file"). Files that hold project content by design are not listed (README, backlog records, area notes); nor
// is anything in the template repository itself, whose tools/ are release copies of core/.
const PROJECT_CONTENT = new Set(['README.md', 'docs/BACKLOG.md', 'docs/agents/areas.md']);
const kind = (f) => (stamp.copied?.[f] ? 'copied' : stamp.forked?.[f] ? 'forked' : f === '.harness.json' ? 'settings' : stamp.adapted?.[f] && !PROJECT_CONTENT.has(f) ? 'adapted' : null);
const touched = isTemplate ? [] : changed.filter((f) => kind(f));
if (touched.length) warn(`This branch changes harness files: ${touched.map((f) => `${f} (${kind(f)})`).join(', ')}. Decide for each change: this project only (its content, a setting, a line marked <!-- project -->, an override) or every project (the template first). If unsure, ask before going on (AGENTS, "Changing a harness file").`);

// 3b. the impact map (.harness.json "impact"): what must follow when a file it names changes (a generated page, a
// translation, a recording). A row: { when: [globs], then: "what to do", run?: "command", checked?: "what verifies it" }.
// `*` matches within a path segment, `**` across segments.
const glob = (g) => new RegExp(`^${g.split('**').map((p) => p.split('*').map((q) => q.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*')}$`);
for (const row of Array.isArray(stamp.impact) ? stamp.impact : []) {
  const res = (Array.isArray(row?.when) ? row.when : []).map(glob);
  const hit = changed.filter((f) => res.some((re) => re.test(f)));
  if (hit.length && row.then) warn(`This branch changes ${hit.slice(0, 3).join(', ')}${hit.length > 3 ? ` (+${hit.length - 3})` : ''}: ${row.then}${row.run ? ` (${row.run})` : ''}${row.checked ? `; checked by ${row.checked}` : '; nothing checks it'}.`);
}

// 4. the newest dated audit
const auditDir = new URL('../docs/audits/', import.meta.url);
const audits = (existsSync(auditDir) ? readdirSync(auditDir) : []).map((f) => f.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]).filter(Boolean).sort();
const last = audits.at(-1);
const today = new Date(process.env.FRESHNESS_TODAY ?? Date.now());
const days = last ? Math.floor((today - new Date(`${last}T00:00:00Z`)) / 86_400_000) : Infinity;
if (days > MAX_AUDIT_DAYS) warn(`The last audit (docs/audits/${last ?? 'none'}) is ${Number.isFinite(days) ? `${days} days` : 'missing'} old (limit ${MAX_AUDIT_DAYS}, freshness.auditDays in .harness.json): audit what changed since (docs, tests, style guide, accessibility, privacy) and write docs/audits/<date>.md.`);

if (!notes.length) console.log(`Fresh: backlog reconciled against current ${branch}; last audit ${last} (${days} day(s) ago).`);
for (const n of notes) console.log(github ? `::warning title=Backlog freshness::${n}` : `! ${n}`);

// 5. the harness template this project was applied from (tools/check-harness.mjs; skipped without a local template)
const harness = fileURLToPath(new URL('./check-harness.mjs', import.meta.url));
if (existsSync(harness)) execFileSync(process.execPath, [harness, ...(github ? ['--github'] : [])], { stdio: 'inherit' });
