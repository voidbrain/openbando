#!/usr/bin/env node
/**
 * The element and impact map: the impact rows of .harness.json as a table (what must follow a change), then every
 * control the templates show (buttons, inputs, selects, picture menus), with its label, its
 * `data-tour` mark, the guide steps that show it as a tip on hover and the guide steps (clips) that use it. Generated
 * from the code, so it cannot fall behind: CI rebuilds it and fails when the committed page differs (F-032, F-026).
 * Run: node tools/build-element-map.mjs   (writes docs/agents/element-map.md; --json prints the data instead)
 */
import { buildSync } from 'esbuild';
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
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

const rows = [];
for (const p of files(join(root, 'src/app'))) {
  const rel = relative(root, p);
  for (const tpl of templates(p, readFileSync(p, 'utf8'))) {
    const t = tpl.replace(/<!--[\s\S]*?-->/g, '');
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
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const impact = JSON.parse(readFileSync(join(root, '.harness.json'), 'utf8')).impact ?? [];
let md = `<!-- Written by tools/build-element-map.mjs from .harness.json, the templates and src/app/core/tour.ts: change those, then run the script. -->\n\n`;
md += `# Element and impact map\n\n## What must follow a change\n\nThe impact rows of \`.harness.json\` (AGENTS, "What follows a change"). \`npm run check:freshness\` lists the rows a branch triggers, on every PR.\n\n| When these change | This must follow | Command | Checked by |\n|---|---|---|---|\n`;
for (const r of impact) md += `| ${cell((r.when ?? []).map((w) => `\`${w}\``).join(', '))} | ${cell(r.then ?? '')} | ${r.run ? `\`${cell(r.run)}\`` : ''} | ${cell(r.checked ?? 'nothing')} |\n`;
md += `\n## Controls\n\nEvery control the templates show, with its label, its \`data-tour\` mark, the guide steps that show it as a tip on hover and the guide steps whose clips use it (F-032). Generated; CI fails when this page differs from the code.\n\n`;
md += `**${n} controls** · ${withTip} with a tip on hover · ${withTitle} with a title · ${inClips} shown in a clip · ${noName} whose name the script cannot read (a bound expression; axe checks the real names)\n\n`;
for (const file of [...new Set(rows.map((r) => r.file))]) {
  const rs = rows.filter((r) => r.file === file);
  md += `### ${file}\n\n| Control | Element | Mark | Title | Tip (guide step) | In clips |\n|---|---|---|---|---|---|\n`;
  for (const r of rs) md += `| ${cell(r.label || '(none)')} | ${r.el} | ${cell(r.mark)} | ${r.title} | ${r.tips.join(', ')} | ${r.clips.join(', ')} |\n`;
  md += '\n';
}
writeFileSync(join(root, 'docs/agents/element-map.md'), md);
console.log(`docs/agents/element-map.md: ${n} controls, ${withTip} with a tip, ${withTitle} with a title, ${inClips} in clips, ${noName} unnamed`);
