/* Fast release hygiene checks. Browser/native behavior is validated separately. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'axiom.css'), 'utf8');
const pkg = require('../package.json');
const failures = [];
if (/@import|@font-face|url\s*\(/i.test(css)) failures.push('Theme must remain fully offline and self-contained');
if (!css.includes(`v${pkg.version}`)) failures.push('CSS banner and package version differ');
const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
for (const [, variable] of css.matchAll(/var\((--[\w-]+)/g)) if (!defined.has(variable)) failures.push(`Undefined variable: ${variable}`);
for (const file of ['LICENSE', 'README.md', 'CHANGELOG.md', 'examples/showcase.md', 'examples/stress-test.md']) if (!fs.existsSync(path.join(root, file))) failures.push(`Missing release file: ${file}`);
if (/\*\s*\{[^}]*!important/s.test(css)) failures.push('Universal !important override would risk native editor controls');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Release hygiene OK · ${pkg.version} · ${defined.size} CSS variables · offline theme`);
