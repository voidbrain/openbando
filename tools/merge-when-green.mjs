#!/usr/bin/env node
// Merge each listed PR as soon as every check on it has passed and GitHub says it can merge; stop on the first
// conflict or failing check, so a person (or the agent) looks before anything else happens. What the agent may merge
// on its own is in AGENTS.md ("What the agent does on its own"). Needs a logged-in `gh`.
//
//   node tools/merge-when-green.mjs 12 13 [--every 60]
//
// Exit 0: every PR merged (or was already closed). 2: one conflicts with the default branch. 3: a check failed.
// Every check counts, not only the required ones: a failing optional check (code scanning, say) still stops it.
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const every = Number(args[args.indexOf('--every') + 1]) || 60;
let prs = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== '--every');
if (!prs.length) {
  console.error('usage: node tools/merge-when-green.mjs <PR number>... [--every seconds]');
  process.exit(64);
}
const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** One check's outcome: 'pass', 'fail' or 'wait', from a check run (status, conclusion) or a commit status (state). */
const outcome = (c) => {
  const v = String(c.conclusion || c.state || '').toUpperCase(), done = !c.status || c.status === 'COMPLETED';
  if (!done || ['', 'PENDING', 'EXPECTED', 'QUEUED', 'IN_PROGRESS'].includes(v)) return 'wait';
  return ['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(v) ? 'pass' : 'fail';
};

for (;;) {
  const left = [];
  for (const pr of prs) {
    const p = JSON.parse(gh('pr', 'view', pr, '--json', 'state,mergeable,isDraft,statusCheckRollup'));
    if (p.state !== 'OPEN') { console.log(`#${pr}: ${p.state.toLowerCase()}`); continue; }
    const checks = p.statusCheckRollup ?? [];
    const failed = checks.filter((c) => outcome(c) === 'fail').map((c) => c.name || c.context);
    if (failed.length) { console.log(`#${pr}: failed: ${failed.join(', ')}`); process.exit(3); }
    if (p.mergeable === 'CONFLICTING') { console.log(`#${pr}: conflicts with the default branch`); process.exit(2); }
    if (!p.isDraft && p.mergeable === 'MERGEABLE' && checks.length && checks.every((c) => outcome(c) === 'pass')) {
      try { gh('pr', 'merge', pr, '--merge', '--delete-branch'); console.log(`#${pr}: merged`); continue; } catch { /* not yet: retry */ }
    }
    left.push(pr);
  }
  prs = left;
  if (!prs.length) break;
  await new Promise((r) => setTimeout(r, every * 1000));
}
console.log('all done');
