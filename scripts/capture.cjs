/* Browser layout verification; not native editor / math / Mermaid verification. */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
require('./preview.cjs');

function luminance(hex) {
  const rgb = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x,y) + 0.05) / (Math.min(x,y) + 0.05); }

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const report = { scope: 'Browser fixture only. Native Typora, CodeMirror editing, math and Mermaid are not verified here.', cases: [], contrast: [], referenceContrastExceptions: [], errors: [] };
  let palette;
  try {
    for (const [name, width, height, scale] of [
      ['showcase', 1440, 1050, 1], ['showcase', 1024, 900, 1], ['showcase', 390, 844, 1],
      ['stress-test', 1440, 1050, 1], ['stress-test', 640, 900, 1], ['stress-test', 390, 844, 1],
      ['showcase', 1440, 1050, 1.25], ['showcase', 1440, 1050, 1.5]
    ]) {
      const page = await browser.newPage({ viewport: {width, height}, deviceScaleFactor: scale });
      page.on('pageerror', err => report.errors.push(String(err)));
      const externalRequests = [];
      page.on('request', req => { if (/^https?:/.test(req.url())) externalRequests.push(req.url()); });
      await page.goto(pathToFileURL(path.join(root, 'artifacts/preview', `${name}.html`)).href);
      await page.evaluate(() => document.fonts.ready);
      const measure = await page.evaluate(() => {
        const write = document.querySelector('#write');
        const rect = write.getBoundingClientRect();
        const code = write.querySelector('pre.md-fences:not([lang="mermaid"])');
        const figure = write.querySelector('figure');
        const style = getComputedStyle(write);
        return {
          documentWidth: document.documentElement.clientWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
          contentWidth: rect.width,
          bodyFont: style.fontSize, lineHeight: style.lineHeight,
          codeFont: getComputedStyle(code).fontSize,
          codeClientWidth: code.clientWidth, codeScrollWidth: code.scrollWidth,
          figureClientWidth: figure?.clientWidth, figureScrollWidth: figure?.scrollWidth,
          parsedThemeRules: [...document.styleSheets].filter(s => s.ownerNode.id === 'theme-css').map(s => s.cssRules.length)[0]
        };
      });
      const pass = measure.documentScrollWidth <= width + 1 && measure.parsedThemeRules > 0 && externalRequests.length === 0;
      report.cases.push({ name, width, height, deviceScaleFactor: scale, ...measure, externalRequests, pass });
      if (!pass) report.errors.push(`Layout/resources failed: ${name} @ ${width} / ${scale}`);
      const tag = `${name}-${width}${scale !== 1 ? `-dpr${scale}` : ''}`;
      await page.screenshot({path: path.join(root, 'artifacts', `${tag}.png`), fullPage: true});
      if (name === 'showcase' && width === 1440 && scale === 1) {
        palette = await page.evaluate(() => {
          const style=getComputedStyle(document.documentElement);
          const names=['bg','text','heading','secondary','muted','sidebar','link','code-bg','selection','accent','on-accent','syntax-comment','syntax-keyword','syntax-string','syntax-number','syntax-name','syntax-attribute'];
          return Object.fromEntries(names.map(name=>[name,style.getPropertyValue('--axiom-'+name).trim()]));
        });
        await page.screenshot({path: path.join(root, 'artifacts', 'showcase-first-screen.png')});
        await page.locator('pre.md-fences').first().screenshot({path: path.join(root, 'artifacts', 'code-detail.png')});
        await page.evaluate(() => document.documentElement.style.fontSize = '20px');
        const sizes = await page.evaluate(() => ({body: getComputedStyle(document.querySelector('#write')).fontSize, code: getComputedStyle(document.querySelector('pre.md-fences')).fontSize}));
        report.cases.push({name:'Typora font preference simulation', ...sizes, pass: sizes.body === '20px' && sizes.code === '20px'});
        if (sizes.body !== '20px' || sizes.code !== '20px') report.errors.push('Root font-size preference did not propagate');
      }
      await page.close();
    }
    for (const [label, foreground, background, required=true] of [
      ['body', palette.text, palette.bg], ['secondary', palette.secondary, palette.bg],
      ['sidebar secondary', palette.secondary, palette.sidebar], ['muted', palette.muted, palette.bg],
      ['link', palette.link, palette.bg], ['code comment', palette['syntax-comment'], palette['code-bg']],
      ['code keyword', palette['syntax-keyword'], palette['code-bg']], ['code string', palette['syntax-string'], palette['code-bg'],false],
      ['code number', palette['syntax-number'], palette['code-bg']], ['code definition', palette['syntax-name'], palette['code-bg']],
      ['code attribute', palette['syntax-attribute'], palette['code-bg'],false],
      ['selected text', palette.heading, palette.selection], ['language label', palette.secondary, palette['code-bg']],
      ['accent button',palette['on-accent'],palette.accent]
    ]) {
      const ratio = contrast(foreground, background);
      report.contrast.push({label, foreground, background, ratio: +ratio.toFixed(2), target:4.5, required, pass: ratio >= 4.5});
      if (ratio < 4.5 && required) report.errors.push(`Insufficient text contrast: ${label} (${ratio.toFixed(2)})`);
      if (ratio < 4.5 && !required) report.referenceContrastExceptions.push({label,ratio:+ratio.toFixed(2),reason:'Retained source-verified Codex syntax palette. This pair is not AA normal-text compliant.'});
    }
    report.pass = report.errors.length === 0;
    fs.writeFileSync(path.join(root, 'artifacts', 'browser-qa.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
