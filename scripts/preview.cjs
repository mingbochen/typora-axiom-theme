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

/* Alert label icons mirror the Octicon glyphs Typora 1.8+ renders (MIT, Copyright GitHub, Inc.).
 * They appear only in the development fixture; the shipped theme uses Typora's own DOM. */
const alertIcon = pathData => `<svg viewBox="0 0 16 16" version="1.1" width="1em" height="1em" aria-hidden="true"><path d="${pathData}"></path></svg>`;
const ALERT_ICONS = {
  note: alertIcon('M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'),
  tip: alertIcon('M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z'),
  important: alertIcon('M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'),
  warning: alertIcon('M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'),
  caution: alertIcon('M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z')
};
const ALERT_LABEL = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };

/* Convert Typora/GitHub alert blockquotes into Typora's exported alert DOM. */
function alerts(html) {
  return html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]([\s\S]*?)<\/p>([\s\S]*?)<\/blockquote>/gi, (match, type, rest, tail) => {
    const name = type.toLowerCase();
    const label = `<span class="md-alert-text md-alert-text-${name}">${ALERT_ICONS[name]}${ALERT_LABEL[name]}</span>`;
    const inlineBody = rest.replace(/^\s+/, '').split(/\n+/).map(line => line.trim()).filter(Boolean).join('<br>');
    return `<div class="md-alert md-alert-${name}"><p>${label}${inlineBody ? `<br>${inlineBody}` : ''}</p>${tail.trim()}</div>`;
  });
}

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
  html = alerts(html);
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
.preview-titlebar span:last-child{margin-left:auto}.preview-layout{display:flex}.preview-sidebar{width:232px;flex-shrink:0;padding:24px 12px;background:var(--axiom-sidebar);border-right:1px solid var(--axiom-border);font-size:14px;min-height:calc(100vh - 44px)}
.preview-sidebar .brand{font-size:15px;font-weight:600;color:var(--axiom-heading);padding:0 12px 24px}.preview-sidebar .label{font-size:11px;letter-spacing:.08em;color:var(--axiom-muted);padding:12px;text-transform:uppercase}.preview-sidebar .item{padding:8px 12px;border-radius:6px;color:var(--axiom-secondary);margin-bottom:3px}.preview-sidebar .item.active{background:var(--axiom-active);color:var(--axiom-heading)}
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
