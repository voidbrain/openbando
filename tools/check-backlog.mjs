import {existsSync, readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const text = readFileSync(new URL('../docs/BACKLOG.md', import.meta.url), 'utf8');
const cells = line => line.split(/(?<!\\)\|/).slice(1, -1).map(value => value.trim());
let width;
for (const line of text.split('\n')) {
  if (!line.startsWith('|')) { width = undefined; continue; }
  width ??= cells(line).length;
  assert.equal(cells(line).length, width, `Table width: ${line}`);
}
const root = fileURLToPath(new URL('..', import.meta.url));
const git = (...args) => { try { return execFileSync('git', ['-C', root, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}); } catch { return null; } };
let stamp = {};
try { stamp = JSON.parse(readFileSync(new URL('../.harness.json', import.meta.url), 'utf8')); } catch { /* no stamp: defaults */ }
const branch = stamp.defaultBranch ?? git('symbolic-ref', '--short', 'refs/remotes/origin/HEAD')?.trim().replace(/^origin\//, '') ?? 'main';
const mainText = git('show', `origin/${branch}:docs/BACKLOG.md`) ?? '';
const onMain = new Set([...mainText.matchAll(/^### [BF]-\d+\n[\s\S]*?^---\n/gm)].map(m => m[0]));
// docs/BACKLOG-RULES.md is the procedure this enforces; an empty ledger is valid.
const headings = [...text.matchAll(/^### ([BF]-\d+)$/gm)];
const ids = new Set();
const cues = {Open: '🔴', Investigate: '🟠', Implemented: '🟡', Verified: '🟢', Blocked: '🟣', Closed: '🔵'};
for (let i = 0; i < headings.length; i++) {
  const id = headings[i][1];
  assert(!ids.has(id), `Duplicate ${id}`); ids.add(id);
  const block = text.slice(headings[i].index, headings[i + 1]?.index ?? text.length);
  const row = block.split('\n').find(line => line.startsWith('|') && cells(line)[1] === id);
  assert(row, `${id}: missing summary`);
  const [signal, summaryId, priority, status, item] = cells(row);
  assert.equal(cells(row).length, 5, `${id}: summary needs five columns`);
  assert.equal(summaryId, id); assert(item, `${id}: missing title`);
  assert.equal(signal, cues[status], `${id}: status cue mismatch`);
  const level = priority.match(/P([123])$/)?.[1];
  assert(level, `${id}: missing priority`);
  const marker = ['Closed', 'Blocked'].includes(status) ? '◻️' : {1: '🔺', 2: '🔶', 3: '🔹'}[level];
  assert.equal(priority, `${marker} P${level}`, `${id}: priority cue mismatch`);
  assert.equal((block.match(/^\*\*Next action \/ closure evidence:\*\* .+/gm) ?? []).length, 1, `${id}: next action must be visible exactly once`);
  const human = [...block.matchAll(/^(🧑|💻) \*\*→ Human action required: (Yes|No)\*\*<br \/>.+/gm)];
  assert.equal(human.length, 1, `${id}: missing visible human action/cue`);
  assert.equal(human[0][1], human[0][2] === 'Yes' ? '🧑' : '💻', `${id}: human-action cue mismatch`);
  // a record waiting for a person says, right under its human-action line, what the issue is, how to get to it and
  // what to check or decide (BACKLOG-RULES). Required on records this branch adds or changes; older ones as touched.
  const whole = text.slice(headings[i].index).match(/^### [BF]-\d+\n[\s\S]*?^---\n/m)?.[0];
  if (human[0][2] === 'Yes' && !onMain.has(whole)) {
    const after = block.slice(block.indexOf(human[0][0]) + human[0][0].length).split('\n').slice(1, 7);
    const rows = after.slice(3).map(cells);
    assert(after[0] === '' && after[1] === '| | |' && after[2] === '|---|---|' && ['**Issue**', '**Reproduce**', '**Check**'].every((k, r) => rows[r]?.[0] === k && rows[r]?.[1]),
      `${id}: a record waiting for a person needs, under its human-action line, the table | **Issue** | … |, | **Reproduce** | … |, | **Check** | … | (BACKLOG-RULES)`);
  }
  const detail = block.match(/<details>\s*<summary>[^<]+<\/summary>([\s\S]*?)<\/details>/);
  assert(detail, `${id}: missing/broken metadata details`);
  assert(block.indexOf('**Next action') < block.indexOf('<details>'), `${id}: next action hidden in details`);
  assert(block.indexOf('**→ Human action') < block.indexOf('<details>'), `${id}: human action hidden in details`);
  assert(block.indexOf('**→ Human action') < block.indexOf('**Next action'), `${id}: human action must precede next action`);
  assert(/<\/details>\n\n---\n/.test(block), `${id}: end the record with a --- line after its details`);
  for (const field of ['PR / evidence', 'Opened', 'Verification', 'Reviewed']) {
    const value = detail[1].split('\n').filter(line => line.startsWith('|')).map(cells).find(row => row[0] === field)?.[1];
    assert(value, `${id}: missing ${field}`);
    if (['Opened', 'Reviewed'].includes(field)) assert(/^\d{4}-\d{2}-\d{2}$/.test(value), `${id}: invalid ${field}`);
  }
}
assert.equal((text.match(/<details>/g) ?? []).length, headings.length, 'Metadata details count');
assert.equal((text.match(/<\/details>/g) ?? []).length, headings.length, 'Unbalanced metadata details');
// Archives only grow: every line an archive has on the published default branch is still here, unchanged and in the
// same order, so a rewrite that drops or edits history fails here instead of on review. New records may go anywhere; a
// correction is a dated note added, never an edit. Skipped without git or a published branch.
const published = git('ls-tree', '--name-only', `origin/${branch}`, 'docs/archive/')?.split('\n').filter(f => f.endsWith('.md')) ?? [];
for (const file of published) {
  const local = new URL(`../${file}`, import.meta.url);
  assert(existsSync(local), `${file} is on ${branch} but missing here: archives are kept`);
  const was = (git('show', `origin/${branch}:${file}`) ?? '').split('\n');
  let kept = 0; // the published lines found here in order: a greedy match finds them if any order-keeping match does
  for (const line of readFileSync(local, 'utf8').split('\n')) if (line === was[kept]) kept++;
  const record = was.slice(0, kept + 1).findLast(l => /^### [BF]-\d+$/.test(l))?.slice(4);
  assert(kept === was.length, `${file}: line ${kept + 1} on ${branch}${record ? ` (in ${record})` : ''} is changed or missing here: "${was[kept]?.slice(0, 80)}". Archives only grow; add a dated correction instead`);
}
// "this PR" in a line already on the default branch is a placeholder its PR left behind: once merged, a record names
// the PR (#N) instead, or nobody knows which change it meant and the record waits for a closure no one reconciles.
const mainBacklog = new Set(mainText.split('\n'));
// a quoted mention ("this PR", `this PR`) talks about the placeholder, it is not one
const placeholder = /(?<!["“`'])\bthis PR\b(?!["”`'])/i;
const stale = text.split('\n').filter(line => placeholder.test(line) && mainBacklog.has(line));
assert(!stale.length, `docs/BACKLOG.md: ${stale.length} line(s) already on ${branch} still say "this PR": name the merged PR instead (BACKLOG-RULES, Review procedure 7). First: "${stale[0]?.slice(0, 100)}"`);
// On a PR's CI run the number is known: a placeholder the branch adds fails there, before it can reach the default
// branch, where it would fail every other PR (openbando, twice). Write the number right after opening the PR.
const prNumber = process.env.PR_NUMBER || process.env.GITHUB_REF?.match(/^refs\/pull\/(\d+)\//)?.[1];
if (prNumber) {
  const added = text.split('\n').filter(line => placeholder.test(line) && !mainBacklog.has(line));
  assert(!added.length, `docs/BACKLOG.md: ${added.length} line(s) this branch adds say "this PR": write #${prNumber} instead (BACKLOG-RULES, Review procedure 7). First: "${added[0]?.slice(0, 100)}"`);
}
console.log(`${ids.size} backlog records passed: summary, visible actions, metadata, dates, cues and table widths${published.length ? `; ${published.length} archive file(s) keep every line they have on ${branch}` : ''}.`);
