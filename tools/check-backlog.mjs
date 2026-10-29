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
// Archives only grow: every record and closed row an archive has on the published default branch is still there, so a
// rewrite that drops history fails here instead of on review. Skipped without git or a published branch.
const root = fileURLToPath(new URL('..', import.meta.url));
const git = (...args) => { try { return execFileSync('git', ['-C', root, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}); } catch { return null; } };
let stamp = {};
try { stamp = JSON.parse(readFileSync(new URL('../.harness.json', import.meta.url), 'utf8')); } catch { /* no stamp: defaults */ }
const branch = stamp.defaultBranch ?? git('symbolic-ref', '--short', 'refs/remotes/origin/HEAD')?.trim().replace(/^origin\//, '') ?? 'main';
const published = git('ls-tree', '--name-only', `origin/${branch}`, 'docs/archive/')?.split('\n').filter(f => f.endsWith('.md')) ?? [];
const archived = (t) => ({ids: [...t.matchAll(/^### ([BF]-\d+)$/gm)].map(m => m[1]), rows: (t.match(/^\| 🔵 \|/gm) ?? []).length});
for (const file of published) {
  const local = new URL(`../${file}`, import.meta.url);
  assert(existsSync(local), `${file} is on ${branch} but missing here: archives are kept`);
  const was = archived(git('show', `origin/${branch}:${file}`) ?? ''), now = archived(readFileSync(local, 'utf8'));
  for (const id of was.ids) assert(now.ids.includes(id), `${file}: ${id} is archived on ${branch} but missing here: archives only grow`);
  assert(now.rows >= was.rows, `${file}: ${was.rows - now.rows} closed row(s) on ${branch} are missing here: archives only grow`);
}
console.log(`${ids.size} backlog records passed: summary, visible actions, metadata, dates, cues and table widths${published.length ? `; ${published.length} archive file(s) keep everything on ${branch}` : ''}.`);
