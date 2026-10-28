import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const text = readFileSync(new URL('../docs/BACKLOG.md', import.meta.url), 'utf8');
const cells = line => line.split(/(?<!\\)\|/).slice(1, -1).map(value => value.trim());
let width;
for (const line of text.split('\n')) {
  if (!line.startsWith('|')) { width = undefined; continue; }
  width ??= cells(line).length;
  assert.equal(cells(line).length, width, `Table width: ${line}`);
}
const headings = [...text.matchAll(/^### ([BF]-\d+)$/gm)];
assert(headings.length > 0, 'No active backlog records found');
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
  const human = [...block.matchAll(/^\*\*→ Human action required:\*\* (🧑|💻) \*\*(Yes|No)\*\*<br \/>.+/gm)];
  assert.equal(human.length, 1, `${id}: missing visible human action/cue`);
  assert.equal(human[0][1], human[0][2] === 'Yes' ? '🧑' : '💻', `${id}: human-action cue mismatch`);
  const detail = block.match(/<details>\s*<summary>[^<]+<\/summary>([\s\S]*?)<\/details>/);
  assert(detail, `${id}: missing/broken metadata details`);
  assert(block.indexOf('**Next action') < block.indexOf('<details>'), `${id}: next action hidden in details`);
  assert(block.indexOf('**→ Human action') < block.indexOf('<details>'), `${id}: human action hidden in details`);
  assert(block.indexOf('**→ Human action') < block.indexOf('**Next action'), `${id}: human action must precede next action`);
  for (const field of ['PR / evidence', 'Opened', 'Verification', 'Reviewed']) {
    const value = detail[1].split('\n').filter(line => line.startsWith('|')).map(cells).find(row => row[0] === field)?.[1];
    assert(value, `${id}: missing ${field}`);
    if (['Opened', 'Reviewed'].includes(field)) assert(/^\d{4}-\d{2}-\d{2}$/.test(value), `${id}: invalid ${field}`);
  }
}
assert.equal((text.match(/<details>/g) ?? []).length, headings.length, 'Metadata details count');
assert.equal((text.match(/<\/details>/g) ?? []).length, headings.length, 'Unbalanced metadata details');
console.log(`${ids.size} backlog records passed: summary, visible actions, metadata, dates, cues and table widths.`);
