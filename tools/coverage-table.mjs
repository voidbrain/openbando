// The code coverage table: per folder, how much of the code the tests run (lines, statements, branches, functions)
// and the files no test runs, from the standard coverage summary (`coverage-summary.json`, the "json-summary" reporter
// of Istanbul / V8, which most test runners write). Coverage says what the tests ran, not that the behaviour is
// checked: a table to find untested parts, never a number to hit.
//   node tools/coverage-table.mjs --write   writes the page and its baseline (after a coverage run)
//   node tools/coverage-table.mjs --check   prints the current table and warns (never fails) when a folder dropped
//                                           more than `drop` points against the committed baseline; --github for CI
// Settings: .harness.json "coverage": { summary, folders: ["src/app/core/", …], page?, baseline?, drop? }.
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const stampUrl = new URL('../.harness.json', import.meta.url);
const cfg = (existsSync(stampUrl) ? JSON.parse(readFileSync(stampUrl, 'utf8')).coverage : undefined) ?? {};
const SUMMARY = new URL(`../${cfg.summary ?? 'coverage/coverage-summary.json'}`, import.meta.url);
const PAGE = new URL(`../${cfg.page ?? 'docs/agents/coverage.md'}`, import.meta.url);
const BASELINE = new URL(`../${cfg.baseline ?? 'docs/agents/coverage.json'}`, import.meta.url);
const DROP = cfg.drop ?? 2;
const METRICS = ['lines', 'statements', 'branches', 'functions'];
const args = process.argv.slice(2), github = args.includes('--github');
const say = (text) => console.log(github ? `::warning title=Coverage::${text}` : `! ${text}`);

if (!existsSync(SUMMARY)) {
  say(`No coverage summary at ${relative(root, fileURLToPath(SUMMARY))}: run the tests with coverage (json-summary reporter) first.`);
  process.exit(0);
}
const summary = JSON.parse(readFileSync(SUMMARY, 'utf8'));
// a path in the summary relative to the repository, whether it was written through a symlinked folder or not
const roots = [root, realpathSync(root)];
const rel = (abs) => (roots.map((r) => relative(r, abs)).find((x) => !x.startsWith('..')) ?? relative(root, abs)).split('\\').join('/');
const files = Object.entries(summary).filter(([k]) => k !== 'total').map(([abs, m]) => ({ path: rel(abs), m }));
const folders = Array.isArray(cfg.folders) && cfg.folders.length ? cfg.folders : [...new Set(files.map((f) => f.path.split('/').slice(0, -1).join('/') + '/'))].sort();

/** Covered / total per metric for the files under `prefix` (all files when empty). */
const sum = (list) => Object.fromEntries(METRICS.map((k) => {
  const t = list.reduce((n, f) => n + (f.m[k]?.total ?? 0), 0), c = list.reduce((n, f) => n + (f.m[k]?.covered ?? 0), 0);
  return [k, t ? Math.round((1000 * c) / t) / 10 : null];
}));
const rows = folders.map((folder) => {
  const list = files.filter((f) => f.path.startsWith(folder));
  return { folder, files: list.length, ...sum(list), untested: list.filter((f) => (f.m.lines?.total ?? 0) > 0 && (f.m.lines?.covered ?? 0) === 0).map((f) => f.path) };
});
const total = { folder: 'all', files: files.length, ...sum(files) };
const pct = (v) => (v === null ? '–' : `${v.toFixed(1)} %`);

const table = (title) => {
  let md = `| ${title} | Files | Lines | Statements | Branches | Functions |\n|---|---|---|---|---|---|\n`;
  for (const r of [...rows, total]) md += `| ${r.folder === 'all' ? '**all**' : `\`${r.folder}\``} | ${r.files} | ${pct(r.lines)} | ${pct(r.statements)} | ${pct(r.branches)} | ${pct(r.functions)} |\n`;
  return md;
};

if (args.includes('--write')) {
  let md = '<!-- Written by tools/coverage-table.mjs from the coverage summary: run the tests with coverage, then the script. -->\n\n';
  md += '# Code coverage\n\nHow much of the code the unit tests run, per folder. It says what ran, not that the behaviour is checked; branches say the most. A table to find untested parts, never a number to hit: CI warns when a folder drops, it does not fail.\n\n';
  md += table('Folder');
  const untested = rows.filter((r) => r.untested.length);
  md += `\n## Files no unit test runs\n\n${untested.length ? untested.map((r) => `- \`${r.folder}\`: ${r.untested.slice(0, 25).map((p) => `\`${p.slice(r.folder.length)}\``).join(', ')}${r.untested.length > 25 ? ` and ${r.untested.length - 25} more` : ''}`).join('\n') : '(none)'}\n`;
  mkdirSync(dirname(fileURLToPath(PAGE)), { recursive: true });
  mkdirSync(dirname(fileURLToPath(BASELINE)), { recursive: true });
  writeFileSync(PAGE, md);
  writeFileSync(BASELINE, `${JSON.stringify(Object.fromEntries([...rows, total].map((r) => [r.folder, Object.fromEntries(METRICS.map((k) => [k, r[k]]))])), null, 1)}\n`);
  console.log(`${relative(root, fileURLToPath(PAGE))}: ${rows.length} folder(s); all: ${METRICS.map((k) => `${k} ${pct(total[k])}`).join(', ')}`);
}

if (args.includes('--check')) {
  const base = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : null;
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Code coverage\n\n${table('Folder')}\n`);
  else console.log(table('Folder'));
  if (!base) say(`No coverage baseline (${relative(root, fileURLToPath(BASELINE))}): write one with --write.`);
  else for (const r of [...rows, total]) for (const k of METRICS) {
    const was = base[r.folder]?.[k];
    if (typeof was === 'number' && typeof r[k] === 'number' && was - r[k] > DROP) say(`${r.folder === 'all' ? 'All code' : r.folder}: ${k} ${pct(was)} → ${pct(r[k])} (more than ${DROP} points down).`);
  }
}
