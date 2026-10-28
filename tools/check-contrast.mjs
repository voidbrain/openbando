import {readFileSync} from 'node:fs';

const css = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../design-system/tokens.json', import.meta.url), 'utf8'));
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
const rgb = value => {
  if (/^#[0-9a-f]{6}$/i.test(value)) return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16)).concat(1);
  if (/^rgba?\(/.test(value)) { const parts = value.match(/[\d.]+/g).map(Number); return [...parts.slice(0, 3), parts[3] ?? 1]; }
  throw new Error(`Unsupported contrast colour: ${value}`);
};
const over = (front, back) => front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3])).concat(1);
const luminance = color => color.slice(0, 3).reduce((sum, value, i) => {
  const v = value / 255;
  return sum + [.2126, .7152, .0722][i] * (v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
}, 0);
const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
let checked = 0;
const check = (ink, fill, backdrop = '#000000') => {
  const background = over(rgb(tokens[fill]), rgb(backdrop));
  const foreground = over(rgb(tokens[ink]), background);
  const contrast = ratio(foreground, background);
  if (contrast < 4.5) throw new Error(`${ink} on ${fill} over ${backdrop}: ${contrast.toFixed(2)}:1 < 4.5:1`);
  checked++;
};
for (const fill of ['bg', 'panel-solid', 'control', 'control-hover', 'field', 'panel', 'overlay', 'overlay-soft', 'badge']) {
  for (const ink of ['text', 'dim', 'warn', 'danger']) {
    check(ink, fill);
    if (rgb(tokens[fill])[3] < 1) check(ink, fill, '#ffffff');
  }
}
check('accent-ink', 'accent');
for (const {name, value} of catalog.color.tokens) {
  if (tokens[name] && JSON.stringify(rgb(tokens[name])) !== JSON.stringify(rgb(value))) throw new Error(`Token catalog drift: ${name}`);
}
console.log(`${checked} shared text/surface contrast pairs passed (AA 4.5:1); token catalog matches CSS.`);
