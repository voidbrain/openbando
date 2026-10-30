#!/usr/bin/env node
/**
 * The element map: every control the templates show (buttons, inputs, selects, picture menus), with its label, its
 * `data-tour` mark, the guide steps that show it as a tip on hover and the guide steps (clips) that use it. Generated
 * from the code, so it cannot fall behind: CI rebuilds it and fails when the committed page differs (F-032, F-026).
 * It also writes docs/guide/clip-sources.json: for each guide clip, the component files of the controls it uses (with
 * their .html / .scss / .ts siblings), so tools/check-media.mjs can name the clips whose own controls changed.
 * Run: node tools/build-element-map.mjs   (writes both; --json prints the data instead)
 */
import { buildSync } from 'esbuild';
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(tmpdir(), `abando-element-map-${process.pid}.mjs`);
buildSync({ entryPoints: [join(root, 'src/app/core/tour.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
const { SNIPPETS } = await import(pathToFileURL(out).href);
rmSync(out);

// the tour: which steps show a mark as a hover tip, which steps act on it (and so appear in its clip)
const tips = new Map(), uses = new Map();
const add = (m, k, v) => m.set(k, [...new Set([...(m.get(k) ?? []), v])]);
for (const s of SNIPPETS) {
  for (const h of s.hover ?? []) add(tips, h, s.id);
  for (const b of s.beats) for (const a of b.actions ?? []) if (a.at) add(uses, a.at, s.id);
}
const forMark = (m, marks) => [...new Set(marks.flatMap((k) => [...m].filter(([t]) => t === k || (k.endsWith('*') && t.startsWith(k.slice(0, -1)))).flatMap(([, v]) => v)))].sort();

const files = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? files(p) : /\.(html|ts)$/.test(f) && !f.endsWith('.spec.ts') ? [p] : [];
});
const templates = (p, src) => (p.endsWith('.html') ? [src] : [...src.matchAll(/template:\s*`([\s\S]*?)`/g)].map((m) => m[1]));
const attr = (tag, name) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
const bound = (tag, name) => tag.match(new RegExp(`\\[${name}\\]="([^"]*)"`))?.[1];
const lit = (e) => e?.match(/'([^']+)'/)?.[1];
/**
 * Cut every stretch from an opening marker to its closing text (an unclosed one to the end), scanning by index: a
 * one-pass regex replace could leave a marker behind (nested or broken), which CodeQL rightly flags.
 */
const cut = (s, open, close) => {
  let out = '', i = 0;
  for (;;) {
    const m = open.exec(s.slice(i));
    if (!m) return out + s.slice(i);
    const a = i + m.index;
    out += s.slice(i, a);
    const end = typeof close === 'function' ? close(m) : close;
    const b = s.indexOf(end, a + m[0].length);
    if (b < 0) return out;
    i = b + end.length;
  }
};
const noComments = (s) => cut(s, /<!--/, '-->');

const rows = [];
for (const p of files(join(root, 'src/app'))) {
  const rel = relative(root, p);
  for (const tpl of templates(p, readFileSync(p, 'utf8'))) {
    const t = noComments(tpl);
    for (const m of t.matchAll(/<(button|input|select|textarea|app-pick-menu|a)\b([^>]*)>([\s\S]{0,400}?)(?:<\/\1>|(?=<))/g)) {
      const [, el, tag, inner] = m;
      if (el === 'input' && /type="(hidden)"/.test(tag)) continue;
      if (el === 'a' && !/href|routerLink|\(click\)/.test(tag)) continue;
      const markStatic = attr(tag, 'data-tour');
      const markExpr = bound(tag, 'attr.data-tour');
      const marks = markStatic ? markStatic.split(/\s+/) : markExpr ? [`${lit(markExpr) ?? '?'}*`] : [];
      // a control inside a <label> is named by the label's own text
      const before = t.lastIndexOf('<label', m.index), closed = t.lastIndexOf('</label>', m.index);
      const wrap = before > closed ? t.slice(before, t.indexOf('</label>', m.index) + 8) : '';
      const wrapText = wrap.replace(/<input[^>]*>|<select[\s\S]*?<\/select>|<app-pick-menu[^>]*>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\{\{[^}]*\}\}/g, '…').replace(/\s+/g, ' ').trim().slice(0, 60);
      const text = el === 'input' || el === 'select' ? '' : inner.replace(/<[^>]*>/g, ' ').replace(/\{\{[^}]*\}\}/g, '…').replace(/@\w+[^{]*\{|[{}]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
      const label = attr(tag, 'aria-label') ?? lit(bound(tag, 'attr.aria-label')) ?? attr(tag, 'label') ?? (wrapText || attr(tag, 'title') || lit(bound(tag, 'title')) || text);
      const title = attr(tag, 'title') ?? (bound(tag, 'title') ? lit(bound(tag, 'title')) ?? '(bound)' : undefined);
      rows.push({ file: rel, el: el === 'app-pick-menu' ? 'menu' : el, label: label || '', mark: marks.join(' '), title: title ? 'yes' : '', tips: forMark(tips, marks), clips: forMark(uses, marks) });
    }
  }
}
rows.sort((a, b) => a.file.localeCompare(b.file) || a.label.localeCompare(b.label));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 1));
  process.exit(0);
}
const n = rows.length, withTip = rows.filter((r) => r.tips.length).length, withTitle = rows.filter((r) => r.title).length;
const noName = rows.filter((r) => !r.label).length, inClips = rows.filter((r) => r.clips.length).length;
const cell = (s) => String(s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n/g, ' ');
let md = `<!-- Written by tools/build-element-map.mjs from the templates and src/app/core/tour.ts: change those, then run the script. -->\n\n`;
md += `# Element map\n\nThe element-level part of the impact map ([impact-map.md](impact-map.md), from the harness, lists what must follow a change). `;
md += `Every control the templates show, with its label, its \`data-tour\` mark, the guide steps that show it as a tip on hover and the guide steps whose clips use it (F-032). Generated; CI fails when this page differs from the code.\n\n`;
md += `**${n} controls** · ${withTip} with a tip on hover · ${withTitle} with a title · ${inClips} shown in a clip · ${noName} whose name the script cannot read (a bound expression; axe checks the real names)\n\n`;
for (const file of [...new Set(rows.map((r) => r.file))]) {
  const rs = rows.filter((r) => r.file === file);
  md += `### ${file}\n\n| Control | Element | Mark | Title | Tip (guide step) | In clips |\n|---|---|---|---|---|---|\n`;
  for (const r of rs) md += `| ${cell(r.label || '(none)')} | ${r.el} | ${cell(r.mark)} | ${r.title} | ${r.tips.join(', ')} | ${r.clips.join(', ')} |\n`;
  md += '\n';
}
// keys (F-032 step 3): every global key the app handles (ShortcutsService, the flight keys of the pilot input) and
// whether the Help panel names it; the script fails when one is missing, so a new shortcut gets its Help line
const read = (f) => readFileSync(join(root, f), 'utf8');
const shown = (code) => ({ Enter: 'Enter', Escape: 'Esc', Space: 'Space', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', ShiftLeft: 'Shift', ShiftRight: 'Shift' })[code] ?? code.replace(/^Key/, '');
const keys = [
  ...[...read('src/app/services/shortcuts.service.ts').matchAll(/case '(\w+)':/g)].map((m) => ({ code: m[1], from: 'src/app/services/shortcuts.service.ts' })),
  ...[...read('src/app/core/radio/radio-input.ts').matchAll(/k\('(\w+)'\)/g)].map((m) => ({ code: m[1], from: 'src/app/core/radio/radio-input.ts' })),
];
const help = noComments(templates('help-panel.ts', read('src/app/ui/panels/help-panel.ts')).join(' ')).replace(/<[^>]*>/g, ' ');
const inHelp = (k) => new RegExp(`(^|[\\s/·(])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s/·)]|$)`).test(help);
const keyRows = [...new Map(keys.map((k) => [shown(k.code), { key: shown(k.code), codes: keys.filter((o) => shown(o.code) === shown(k.code)).map((o) => o.code), from: k.from }])).values()];
md += `## Keys\n\nEvery global key the app handles and whether the Help panel names it (F-032 step 3). The script fails when one is missing. The editor's own keys (Delete, Esc, Ctrl+Z, arrows on a selected point) are shown where they apply, in its hints and titles, and are not listed here.\n\n| Key | Codes | Handled in | In Help |\n|---|---|---|---|\n`;
for (const k of keyRows) md += `| ${cell(k.key)} | ${k.codes.join(', ')} | ${k.from} | ${inHelp(k.key) ? 'yes' : '**no**'} |\n`;
md += '\n';
const missing = keyRows.filter((k) => !inHelp(k.key));

// design-system guides (F-032 step 4): each guide's `Source:` line names its files and the CSS classes it describes;
// the script fails when a guide has no Source line, or names a file or class the code no longer has (a stale guide)
const guideDir = join(root, 'design-system/components');
const guides = readdirSync(guideDir).filter((f) => f.endsWith('.md')).sort().map((f) => {
  const line = readFileSync(join(guideDir, f), 'utf8').match(/^Source: (.+)$/m)?.[1] ?? '';
  const srcs = [];
  let base = 'src/app';
  for (const m of line.matchAll(/`([^`]+)`/g)) for (const part of m[1].split(/,\s*(?![^(]*\))/)) {
    const pm = part.trim().match(/^([\w./-]+\.(?:ts|scss|html))(?:\s*\(([^)]*)\))?/);
    if (!pm) continue;
    const path = pm[1].startsWith('src/') ? pm[1] : pm[1].includes('/') ? `src/app/${pm[1]}` : `${base}/${pm[1]}`;
    base = dirname(path);
    srcs.push({ path, classes: (pm[2] ?? '').split(/,\s*/).filter((c) => c.startsWith('.')) });
  }
  const problems = [];
  if (!srcs.length) problems.push('no Source line');
  for (const { path, classes } of srcs) {
    if (!existsSync(join(root, path))) { problems.push(`${path} is gone`); continue; }
    const code = readFileSync(join(root, path), 'utf8');
    for (const c of classes) if (!new RegExp(`\\${c}(?![\\w-])`).test(code)) problems.push(`${c} is not in ${path}`);
  }
  return { name: f.replace(/\.md$/, ''), srcs, problems };
});
md += `## Design-system guides\n\nEach guide in \`design-system/components/\` and the code its \`Source:\` line names (F-032 step 4). The script fails when a guide has no Source line or names a file or CSS class the code no longer has. A change to one of these files should be checked against its guide (design-system/README.md, "Keeping it in step").\n\n| Guide | Source files (classes) | Status |\n|---|---|---|\n`;
for (const g of guides) md += `| [${g.name}](../../design-system/components/${g.name}.md) | ${cell(g.srcs.map((x) => x.path + (x.classes.length ? ` (${x.classes.join(', ')})` : '')).join('; '))} | ${g.problems.length ? `**${cell(g.problems.join('; '))}**` : 'ok'} |\n`;
md += '\n';
const stale = guides.filter((g) => g.problems.length);

writeFileSync(join(root, 'docs/agents/element-map.md'), md);

// each clip's component files: the file of every control it uses, and that component's other files (same stem)
const siblings = (f) => ['.html', '.scss', '.ts'].map((x) => f.replace(/\.(html|scss|ts)$/, x)).filter((g) => existsSync(join(root, g)));
const sources = {};
for (const r of rows) for (const c of r.clips) sources[c] = [...new Set([...(sources[c] ?? []), ...siblings(r.file)])].sort();
const clipSources = Object.fromEntries(Object.keys(sources).sort().filter((c) => existsSync(join(root, `docs/guide/clips/${c}.webm`))).map((c) => [c, sources[c]])); // showcase steps have no clip
if (stale.length) {
  console.error(`Design-system guides out of step with the code: ${stale.map((g) => `${g.name} (${g.problems.join('; ')})`).join(', ')}.`);
  process.exitCode = 1;
}
if (missing.length) {
  console.error(`The Help panel (src/app/ui/panels/help-panel.ts) does not name these keys: ${missing.map((k) => k.key).join(', ')}. Add them (and their Italian).`);
  process.exitCode = 1;
}
writeFileSync(join(root, 'docs/guide/clip-sources.json'), `${JSON.stringify({ about: 'Written by tools/build-element-map.mjs: the component files of the controls each guide clip uses (F-032 step 2). tools/check-media.mjs names the clips whose files changed since they were recorded.', clips: clipSources }, null, 2)}\n`);
console.log(`docs/agents/element-map.md: ${n} controls, ${withTip} with a tip, ${withTitle} with a title, ${inClips} in clips, ${noName} unnamed; docs/guide/clip-sources.json: ${Object.keys(clipSources).length} clips`);
