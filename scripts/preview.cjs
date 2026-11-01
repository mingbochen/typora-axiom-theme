/* Development-only browser fixture. This is not a replacement for native Typora QA. */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const markedModule = require('marked');
const marked = markedModule.marked || markedModule;
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'artifacts', 'preview');
fs.mkdirSync(out, { recursive: true });
const escape = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function highlight(code) {
  // Small fixture highlighter; native Typora uses CodeMirror's own tokenizer.
  return code.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#[^\n]*|\/\/[^\n]*|\b(?:from|import|class|def|return|const|let|function|true|false|None|int|for|in|if)\b|\b\d+(?:\.\d+)?\b)/g).map(part => {
    const safe = escape(part);
    if (/^["']/.test(part)) return `<span class="cm-string">${safe}</span>`;
    if (/^(#|\/\/)/.test(part)) return `<span class="cm-comment">${safe}</span>`;
    if (/^\d/.test(part)) return `<span class="cm-number">${safe}</span>`;
    if (/^(from|import|class|def|return|const|let|function|true|false|None|int|for|in|if)$/.test(part)) return `<span class="cm-keyword">${safe}</span>`;
    return safe;
  }).join('');
}

function render(md) {
  // Raw math/Mermaid are retained for native QA; browser preview is explicitly illustrative.
  md = md.replace(/^---\n[\s\S]*?\n---\n/, match => `<pre class="md-meta-block">${escape(match.trim())}</pre>\n\n`);
  let html = (marked.parse || marked)(md, { gfm: true });
  html = html.replace(/<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g, (_, lang = '', source) => {
    const code = source.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    if (lang === 'mermaid') return `<pre class="md-fences" lang="mermaid"><img src="${pathToFileURL(path.join(root, 'examples/assets/request-flow.svg'))}" alt="Diagram fixture; actual Mermaid requires native Typora"/></pre>`;
    return `<pre class="md-fences mock-cm cm-s-inner"${lang ? ` lang="${escape(lang)}"` : ''}>${highlight(code.replace(/\n$/, ''))}</pre>`;
  });
  html = html.replace(/<table>/g, '<figure class="md-table-fig"><table>').replace(/<\/table>/g, '</table></figure>');
  html = html.replace(/<li>(\s*<input[^>]*type="checkbox"[^>]*>)/g, '<li class="task-list-item">$1');
  html = html.replace(/src="\.\/assets\//g, `src="${pathToFileURL(path.join(root, 'examples/assets')).href}/`);
  html = html.replace(/==([^=]+)==/g, '<mark>$1</mark>');
  return html;
}

const fixtureCSS = `
*{box-sizing:border-box} body{margin:0} #write{position:relative} p,h1,h2,h3,h4,h5,h6{position:relative}
pre{position:relative;white-space:pre-wrap} pre.mock-cm{white-space:pre;overflow-x:auto} img{max-width:100%} figure{margin:0;overflow-x:auto}table{border-collapse:collapse}thead{text-align:left}
.task-list-item{position:relative}.task-list-item>input{position:absolute;left:-1.5rem;top:.05rem}.task-list-item>p{margin:0}
.preview-frame{min-height:100vh}.preview-titlebar{position:sticky;top:0;height:44px;display:flex;align-items:center;padding:0 20px;border-bottom:1px solid var(--axiom-border);background:white;color:var(--axiom-secondary);font-size:12px;z-index:10}
.preview-titlebar span:last-child{margin-left:auto}.preview-layout{display:flex}.preview-sidebar{width:232px;flex-shrink:0;padding:24px 12px;background:var(--axiom-subtle);border-right:1px solid var(--axiom-border);font-size:14px;min-height:calc(100vh - 44px)}
.preview-sidebar .brand{font-size:15px;font-weight:650;color:var(--axiom-heading);padding:0 12px 24px}.preview-sidebar .label{font-size:11px;letter-spacing:.08em;color:var(--axiom-muted);padding:12px;text-transform:uppercase}.preview-sidebar .item{padding:8px 12px;border-radius:6px;color:var(--axiom-secondary);margin-bottom:3px}.preview-sidebar .item.active{background:var(--axiom-active);color:var(--axiom-heading)}
.preview-main{min-width:0;flex:1}.preview-notice{max-width:var(--axiom-content-width);margin:0 auto;padding:0 24px 24px;color:var(--axiom-muted);font-size:12px}.preview-notice a{color:inherit}
@media(max-width:800px){.preview-sidebar{display:none}}@media print{.preview-titlebar,.preview-sidebar,.preview-notice{display:none}.preview-layout{display:block}}
`;

for (const name of ['showcase', 'stress-test']) {
  const content = render(fs.readFileSync(path.join(root, 'examples', `${name}.md`), 'utf8'));
  const themeCSS = fs.readFileSync(path.join(root, 'axiom.css'), 'utf8');
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Axiom · ${name} · Browser fixture</title><style id="theme-css">${themeCSS}</style><style>${fixtureCSS}</style></head><body><div class="preview-frame"><div class="preview-titlebar"><span>Axiom</span><span>${name}.md · Browser fixture</span></div><div class="preview-layout"><aside class="preview-sidebar"><div class="brand">笔记与思考</div><div class="label">文档</div><div class="item ${name === 'showcase' ? 'active' : ''}">主题演示</div><div class="item ${name === 'stress-test' ? 'active' : ''}">排版压力测试</div><div class="label">大纲</div><div class="item">从一个请求开始</div><div class="item">用合适的结构表达信息</div><div class="item">公式与图示</div></aside><main class="preview-main"><article id="write">${content}</article><div class="preview-notice">浏览器排版样张 · 侧栏和代码编辑器为开发夹具；公式与 Mermaid 的真实效果需在 Typora 中验证。</div></main></div></div></body></html>`;
  fs.writeFileSync(path.join(out, `${name}.html`), html);
}
console.log(`Browser fixtures: ${out}`);
