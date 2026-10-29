// The AGENTS.md conventions a script can check, and exports nothing uses. A rule nobody checks drifts.
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join, relative} from 'node:path';

const root = new URL('..', import.meta.url).pathname;
// Framework-free folders (relative to the repo root) and the @angular/core names each may import, from .harness.json
// (conventions.pureDirs), e.g. [["src/app/core/", ["signal", "computed", "untracked"]]]. Signal primitives run without
// the framework, so a folder may allow them and stay unit-testable. None: no framework-free layer.
const stamp = join(root, '.harness.json');
const PURE_DIRS = (existsSync(stamp) ? JSON.parse(readFileSync(stamp, 'utf8')).conventions?.pureDirs : undefined) ?? [];
const ts = createRequire(join(root, 'package.json'))('typescript');
const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|html|mjs)$/.test(name)) out.push(path);
  }
  return out;
};
const files = [...walk(join(root, 'src')), ...walk(join(root, 'tools')), ...walk(join(root, 'e2e'))];
const text = Object.fromEntries(files.map(f => [f, readFileSync(f, 'utf8')]));
const app = files.filter(f => f.includes('/src/') && !f.endsWith('.spec.ts') && !f.includes('/testing/'));
const problems = [];
const report = (file, index, message) => {
  const line = text[file].slice(0, index).split('\n').length;
  if (/^\s*(\/\/|\*|\/\*)/.test(text[file].split('\n')[line - 1])) return; // prose in a comment
  problems.push(`${relative(root, file)}:${line}: ${message}`);
};

const RULES = [
  [/standalone:\s*true/g, 'standalone: true is the default'],
  [/ChangeDetectionStrategy\.OnPush/g, 'OnPush is the default'],
  [/@(HostBinding|HostListener)\(/g, 'use the host object of the decorator'],
  [/@(Input|Output)\(/g, 'use input() / output()'],
  [/\b(ngClass|ngStyle|CommonModule)\b/g, 'use class / style bindings and import only what the template uses'],
  [/\*ng(If|For|Switch)\b/g, 'use @if / @for / @switch'],
  [/:\s*any\b|\bas any\b|<any>/g, 'avoid any; use unknown'],
  // a static image needs NgOptimizedImage; bound sources (thumbnails, data URLs) are exempt
  [/<img\b[^>]*\ssrc="[^"]+"/g, 'static images use NgOptimizedImage (ngSrc)'],
  // `this.r?.f(this.sig())` skips sig() while r is missing: the effect never subscribes (AGENTS known pitfall)
  [/effect\(\(\) => this\.\w+\?\.\w+\([^)]*\b\w+\(\)/g, 'read signals before an optional-chained call in effect()'],
];
for (const file of app) {
  for (const [pattern, message] of RULES)
    for (const m of text[file].matchAll(pattern)) report(file, m.index, message);
  for (const [dir, allowed] of PURE_DIRS)
    if (file.includes(`/${dir}`))
      for (const m of text[file].matchAll(/import\s+([^;]*?)\s+from '@angular\/([^']+)'/g))
        if (m[2] !== 'core' || !/^\{[^}]*\}$/.test(m[1]) || m[1].slice(1, -1).split(',').some(n => !allowed.includes(n.trim())))
          report(file, m.index, `${dir} stays plain TypeScript${allowed.length ? ` (only ${allowed.join(' / ')} from @angular/core)` : ' (no Angular imports)'}`);
  // injectable classes use inject(); plain classes (tool controllers, renderers) may take constructor parameters
  if (/@(Component|Directive|Injectable|Service|Pipe)\(/.test(text[file]))
    for (const m of text[file].matchAll(/constructor\((private|public|protected|readonly)\s/g)) report(file, m.index, 'use inject() instead of constructor injection');
}

// An exported function, class or constant whose name appears nowhere but its own declaration is dead code.
for (const file of app.filter(f => f.endsWith('.ts'))) {
  const source = ts.createSourceFile(file, text[file], ts.ScriptTarget.Latest, true);
  for (const statement of source.statements) {
    if (!ts.getModifiers(statement)?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    const names = ts.isVariableStatement(statement)
      ? statement.declarationList.declarations.map(d => d.name).filter(ts.isIdentifier)
      : statement.name && ts.isIdentifier(statement.name) && !ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement) ? [statement.name] : [];
    for (const name of names) {
      const word = new RegExp(`\\b${name.text}\\b`, 'g');
      const uses = files.reduce((n, f) => n + (text[f].match(word)?.length ?? 0), 0);
      if (uses <= 1) report(file, name.getStart(), `${name.text} is exported but never used`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`${problems.length} convention problem(s); see AGENTS.md.`);
  process.exit(1);
}
console.log(`${app.length} files follow the checked AGENTS.md conventions; no unused exports.`);
