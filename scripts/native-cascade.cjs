/* Optional local integration fixture: loads installed Typora base CSS, never redistributes it.
 * This catches cascade conflicts in representative editor DOM, not app interaction bugs.
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const resources = process.env.TYPORA_RESOURCES;
if (!resources) throw new Error('Set TYPORA_RESOURCES to an installed Typora resources folder');
require('node:child_process').execFileSync(process.env.PYTHON_PATH || 'python',[path.join(__dirname,'extract-dev-assets.py')],{stdio:'inherit'});
const bootstrap=fs.readFileSync(path.join(root,'artifacts/local-engines/bootstrap.css'),'utf8');
const nativeCSS = ['base.css', 'codemirror.css'].map(name => fs.readFileSync(path.join(resources, 'style', name), 'utf8')).join('\n');
const theme = fs.readFileSync(path.join(root, 'axiom.css'), 'utf8');
const dom = `<h1>编辑状态也应该保持整洁</h1><p>这是使用本机 Typora 基础 CSS 的静态 DOM 夹具。<code>inline code</code> 应当与正文协调。</p>
<pre class="md-fences md-end-block ty-contain-cm" lang="python"><div class="CodeMirror cm-s-inner" style="height:auto"><div class="CodeMirror-scroll" style="overflow:auto"><div class="CodeMirror-sizer"><div class="CodeMirror-lines"><div class="CodeMirror-code"><div style="position:relative"><pre class="CodeMirror-line"><span role="presentation"><span class="cm-keyword">def</span> estimate(tokens):</span></pre></div><div style="position:relative"><pre class="CodeMirror-line"><span role="presentation">    <span class="cm-comment"># 每行不应该变成独立卡片</span></span></pre></div><div style="position:relative"><pre class="CodeMirror-line"><span role="presentation">    <span class="cm-keyword">return</span> tokens * <span class="cm-number">128</span></span></pre></div></div></div></div></div></div></pre>
<p>代码结束后恢复正文。下面检查原生任务列表的复选框几何：</p>
<ul><li class="task-list-item md-task-list-item"><input type="checkbox" checked><p>第一项：已完成的任务</p></li><li class="task-list-item md-task-list-item"><input type="checkbox"><p>第二项：未完成的任务</p></li></ul>
<figure class="md-table-fig"><table class="md-table"><thead><tr><th>内容</th><th>检查点</th></tr></thead><tbody><tr><td>原生表格</td><td>保留合理的间距与边界</td></tr></tbody></table></figure>
<pre class="md-fences mock-cm" lang="text">失焦时的代码块\n同一套背景、字体和边距。</pre>`;

(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  const report = {scope:'Installed Typora base CSS + representative static DOM only. Not native app interaction QA.',cases:[],errors:[]};
  try {
    for (const width of [1100, 640, 390]) {
      const page = await browser.newPage({viewport:{width,height:1000}});
      await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${nativeCSS}</style></head><body><article id="write">${dom}</article></body></html>`);
      const baseline = await page.evaluate(() => { const s=getComputedStyle(document.querySelector('.CodeMirror-line')); return {border:s.borderWidth,margin:s.margin,padding:s.padding,background:s.backgroundColor}; });
      await page.addStyleTag({content:theme});
      const values = await page.evaluate(() => {
        const line = document.querySelector('.CodeMirror-line');
        const style = getComputedStyle(line);
        const lines = [...document.querySelectorAll('.CodeMirror-line')].map(e => ({height:e.getBoundingClientRect().height,margin:getComputedStyle(e).margin,border:getComputedStyle(e).borderWidth}));
        const check = document.querySelector('.md-task-list-item > input').getBoundingClientRect();
        const text = document.querySelector('.md-task-list-item > p').getBoundingClientRect();
        return {scrollWidth:document.documentElement.scrollWidth, width:document.documentElement.clientWidth,codeFont:getComputedStyle(document.querySelector('.CodeMirror')).fontSize,lineBorder:style.borderWidth,lineMargin:style.margin,lineBackground:style.backgroundColor,lines,checkbox:{width:check.width,height:check.height,top:check.top},taskText:{top:text.top,height:text.height}};
      });
      const pass = values.scrollWidth <= width + 1 && values.lineBorder === baseline.border && values.lineMargin === baseline.margin && values.lineBackground === baseline.background && values.lines.every(line => line.height < 32) && values.codeFont === '16px' && values.checkbox.width === 16;
      report.cases.push({viewport:width,baseline,...values,pass});
      if (!pass) report.errors.push(`Native CSS cascade conflict at ${width}px`);
      await page.screenshot({path:path.join(root,'artifacts',`native-cascade-${width}.png`),fullPage:true});
      await page.close();
    }
    // Source mode uses a full-width editor and a centered text region, not a narrow scroll root.
    const controls = bootstrap+'\n'+fs.readFileSync(path.join(resources,'style/base-control.css'),'utf8');
    const source = await browser.newPage({viewport:{width:1100,height:900}});
    await source.setContent(`<!doctype html><html><head><style>${nativeCSS}\n${controls}\n${theme}</style></head><body class="typora-sourceview-on"><div id="typora-source" style="display:block"><div class="CodeMirror cm-s-inner"><div class="CodeMirror-scroll"><div class="CodeMirror-sizer"><div class="CodeMirror-lines"><div class="CodeMirror-code"><pre class="CodeMirror-line"><span class="cm-header"># 源码模式：让光标与滚动保持自然</span></pre><pre class="CodeMirror-line">Source mode should preserve the full-width editor.</pre><pre class="CodeMirror-line">正文和代码都使用 16px 基准字号。</pre></div></div></div></div></div></div></body></html>`);
    const sourceValues=await source.evaluate(()=>({editorWidth:document.querySelector('.CodeMirror').getBoundingClientRect().width,linesWidth:document.querySelector('.CodeMirror-lines').getBoundingClientRect().width,paddingLeft:getComputedStyle(document.querySelector('.CodeMirror-lines')).paddingLeft,font:getComputedStyle(document.querySelector('.CodeMirror')).fontSize}));
    const sourcePass=sourceValues.editorWidth===1100&&sourceValues.linesWidth<=848&&sourceValues.font==='16px'&&sourceValues.paddingLeft==='60px';
    report.cases.push({name:'Source mode static geometry',...sourceValues,pass:sourcePass});
    if(!sourcePass)report.errors.push('Source editor viewport / gutter geometry changed');
    await source.screenshot({path:path.join(root,'artifacts/source-cascade.png')});
    await source.close();

    const ui = await browser.newPage({viewport:{width:1000,height:760}});
    await ui.setContent(`<!doctype html><html><head><style>${nativeCSS}\n${controls}\n${theme}</style><style>body{padding:32px}#typora-sidebar{display:block;position:relative;top:auto;left:auto;width:250px;height:650px;float:left;padding:20px}.file-node-content{padding:8px 12px}.qa-main{margin-left:290px;padding-top:12px}.modal-content{position:relative;padding:24px;margin-top:24px}.outline-item{padding-left:12px}#file-library-search-input{width:100%;padding:8px}</style></head><body><aside id="typora-sidebar"><div class="sidebar-tabs"><div class="sidebar-tab active">文件</div></div><p><input id="file-library-search-input" placeholder="搜索笔记"></p><div class="file-tree-node active"><div class="file-node-content">主题演示.md</div></div><div class="file-tree-node"><div class="file-node-content" id="hover-file">技术笔记.md</div></div><div class="outline-content"><p class="outline-item outline-active">从一个请求开始</p><p class="outline-item">公式与图示</p></div></aside><main class="qa-main"><h2>界面状态检查</h2><p>检查选中文件、悬停、输入框和按钮的灰阶关系。</p><div class="modal-content"><h3>导出文档</h3><p>弹窗保持白色表面和轻量边框。</p><button class="btn btn-default">取消</button> <button class="btn btn-primary">确定</button></div></main></body></html>`);
    await ui.locator('#hover-file').hover();
    await ui.locator('#file-library-search-input').focus();
    const uiValues=await ui.evaluate(()=>({active:getComputedStyle(document.querySelector('.file-tree-node.active>.file-node-content')).backgroundColor,hover:getComputedStyle(document.querySelector('#hover-file')).backgroundColor,searchBorder:getComputedStyle(document.querySelector('#file-library-search-input')).borderTopColor,primaryText:getComputedStyle(document.querySelector('.btn-primary')).color,primaryBackground:getComputedStyle(document.querySelector('.btn-primary')).backgroundColor,fileCursor:getComputedStyle(document.querySelector('#hover-file')).cursor,outlineCursor:getComputedStyle(document.querySelector('.outline-item')).cursor,searchCursor:getComputedStyle(document.querySelector('#file-library-search-input')).cursor}));
    const uiPass=uiValues.active==='rgb(240, 239, 236)'&&uiValues.hover==='rgb(245, 243, 240)'&&uiValues.searchBorder==='rgb(246, 197, 67)'&&uiValues.primaryText==='rgb(26, 28, 31)'&&uiValues.fileCursor==='pointer'&&uiValues.outlineCursor==='pointer'&&uiValues.searchCursor!=='pointer';
    report.cases.push({name:'Sidebar and dialog static states',...uiValues,pass:uiPass});
    if(!uiPass)report.errors.push('Sidebar / UI state cascade conflict');
    await ui.screenshot({path:path.join(root,'artifacts/ui-cascade.png')});
    await ui.close();
    report.pass = !report.errors.length;
    fs.writeFileSync(path.join(root,'artifacts/native-cascade-qa.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if (!report.pass) process.exitCode=1;
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
