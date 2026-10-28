// CI evidence for the backlog: each pull request's CI jobs and, for failed or retried jobs, the tests involved.
// Usage: npm run ci:status -- [PR numbers…]   (default: the 8 most recently updated PRs). Needs an authenticated gh.
import {execFileSync} from 'node:child_process';

const gh = (...args) => execFileSync('gh', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
const json = (...args) => JSON.parse(gh(...args));

let numbers = process.argv.slice(2).map(Number).filter(Boolean);
if (!numbers.length)
  numbers = json('pr', 'list', '--state', 'all', '--limit', '8', '--json', 'number').map(p => p.number);

for (const n of numbers) {
  const pr = json('pr', 'view', String(n), '--json', 'number,title,state,baseRefName,headRefOid,mergedAt,url');
  console.log(`\n#${pr.number} ${pr.title}\n  ${pr.state.toLowerCase()} into ${pr.baseRefName}${pr.mergedAt ? ` at ${pr.mergedAt}` : ''} · ${pr.url}`);
  if (pr.baseRefName !== 'main') console.log('  ! not based on main: CI does not run, and merging does not reach main');
  const runs = json('run', 'list', '--commit', pr.headRefOid, '--workflow', 'CI', '--json', 'databaseId,status,conclusion,url');
  if (!runs.length) { console.log('  no CI run for its head commit'); continue; }
  for (const run of runs) {
    console.log(`  CI ${run.status === 'completed' ? run.conclusion : run.status} · ${run.url}`);
    for (const job of json('run', 'view', String(run.databaseId), '--json', 'jobs').jobs) {
      const state = job.status === 'completed' ? job.conclusion : job.status;
      console.log(`    ${state.padEnd(10)} ${job.name}`);
      if (job.status !== 'completed' || !/e2e|browser/.test(job.name)) continue;
      // Playwright's list reporter: ✘ failed, retries, flaky summary
      let log;
      try { log = gh('run', 'view', '--job', String(job.databaseId), '--log').split('\n').map(l => l.replace(/^.*?Z /, '')); }
      catch { console.log('               (test details once the whole run has finished)'); continue; } // GitHub serves logs per run

      const tests = log.filter(l => /^\s+✘ |\(retry #\d\)|^\s+\d+ (flaky|failed)/.test(l)).map(l => l.trim());
      for (const t of [...new Set(tests)]) console.log(`               ${t}`);
      for (const note of log.filter(l => /^auto-sync found/.test(l))) console.log(`               ${note.trim()}`);
    }
  }
}
