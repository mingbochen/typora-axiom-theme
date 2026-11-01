/* Render actual local Typora math/diagram engines in a browser integration fixture.
 * Not a live Typora editor test. Local third-party assets remain ignored artifacts.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname,'..');
if (!process.env.TYPORA_RESOURCES) throw new Error('Set TYPORA_RESOURCES');
execFileSync(process.env.PYTHON_PATH || 'python',[path.join(__dirname,'extract-dev-assets.py')],{stdio:'inherit'});
const engines = path.join(root,'artifacts/local-engines');
fs.mkdirSync(path.join(root,'tmp/pdfs'),{recursive:true});
const theme = fs.readFileSync(path.join(root,'axiom.css'),'utf8');
const base = fs.readFileSync(path.join(process.env.TYPORA_RESOURCES,'style/base.css'),'utf8');
const showcase = fs.readFileSync(path.join(root,'examples/showcase.md'),'utf8');
const stress = fs.readFileSync(path.join(root,'examples/stress-test.md'),'utf8');
const formulas = [...`${showcase}\n${stress}`.matchAll(/^\$\$\n([\s\S]*?)\n\$\$/gm)].map(m=>m[1]);
const diagram = showcase.match(/```mermaid\n([\s\S]*?)\n```/)[1];

(async()=>{
  const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const report={scope:'Installed Typora MathJax / Mermaid engines + base CSS in headless Chrome. Native application not tested.',cases:[],errors:[]};
  try {
    for(const width of [1100,640,390]) {
      const page=await browser.newPage({viewport:{width,height:1100}});
      page.on('pageerror',err=>report.errors.push(String(err)));
      const external=[];
      page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
      await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${base}</style><style>${theme}</style></head><body><article id="write"><h1>公式与流程，也要清楚</h1><p>使用本机 Typora 自带的 MathJax 与 Mermaid 引擎，检查公式和图示与正文的关系。这里是集成夹具，尚非原生编辑器测试。</p><h2>注意力与缓存</h2><p>行内表达式 <span id="inline-math"></span> 与中文混排。</p><div id="math-blocks"></div><h2>请求的数据流</h2><pre class="md-fences" lang="mermaid"><div class="md-diagram-panel-preview" id="diagram"></div></pre><p>图示之后的正文，应该自然地接回阅读节奏。</p></article></body></html>`);
      await page.evaluate(()=>{window.MathJax={startup:{typeset:false},tex:{packages:{'[+]':['ams']}}};});
      await page.addScriptTag({path:path.join(engines,'tex-svg-full.js')});
      await page.evaluate(async formulas=>{
        await MathJax.startup.promise;
        document.querySelector('#inline-math').appendChild(await MathJax.tex2svgPromise('T = T_{queue} + T_{compute}',{display:false}));
        for(const tex of formulas){const div=document.createElement('div');div.className='md-math-block mathjax-block';div.appendChild(await MathJax.tex2svgPromise(tex,{display:true}));document.querySelector('#math-blocks').appendChild(div);}
        // Typora's own content loader installs these styles after startup too.
        MathJax.startup.document.addStyleSheet();
      },formulas);
      await page.addScriptTag({path:path.join(engines,'mermaid.min.js')});
      await page.evaluate(async diagram=>{
        const engine=window.mermaid?.default||window.mermaid;
        engine.initialize({startOnLoad:false,theme:'neutral',fontFamily:'Segoe UI, Microsoft YaHei, sans-serif',securityLevel:'strict'});
        const output=await engine.render('request-diagram',diagram);
        document.querySelector('#diagram').innerHTML=typeof output==='string'?output:output.svg;
      },diagram);
      await page.evaluate(()=>document.fonts.ready);
      const values=await page.evaluate(()=>{
        const last=document.querySelector('#math-blocks').lastElementChild;
        last.scrollLeft=last.scrollWidth;
        const wideMath={clientWidth:last.clientWidth,scrollWidth:last.scrollWidth,scrollLeft:last.scrollLeft,endVisible:last.querySelector('svg').getBoundingClientRect().right<=last.getBoundingClientRect().right+1};
        last.scrollLeft=0;
        return{width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,formulaCount:document.querySelectorAll('mjx-container').length,formulaErrors:document.querySelectorAll('[data-mml-node="merror"]').length,diagramCount:document.querySelectorAll('#diagram svg').length,diagramWidth:document.querySelector('#diagram svg')?.getBoundingClientRect().width,contentWidth:document.querySelector('#write').getBoundingClientRect().width,diagramHeader:getComputedStyle(document.querySelector('pre[lang="mermaid"]'),'::before').content,mathAssistivePositions:[...document.querySelectorAll('mjx-assistive-mml')].map(el=>getComputedStyle(el).position),wideMath};
      });
      const pass=values.scrollWidth<=width+1&&values.formulaCount===formulas.length+1&&values.formulaErrors===0&&values.diagramCount===1&&external.length===0&&values.diagramHeader==='none'&&values.mathAssistivePositions.every(position=>position==='absolute')&&values.wideMath.endVisible;
      report.cases.push({viewport:width,...values,externalRequests:external,pass});
      if(!pass)report.errors.push(`Engine/layout issue at ${width}px`);
      await page.screenshot({path:path.join(root,'artifacts',`engines-${width}.png`),fullPage:true});
      if(width===1100){
        await page.emulateMedia({media:'print'});
        const printMath=await page.evaluate(()=>[...document.querySelectorAll('#math-blocks .mathjax-block')].map(el=>({available:el.clientWidth,svgWidth:el.querySelector('svg').getBoundingClientRect().width})));
        const printPass=printMath.every(m=>m.svgWidth<=m.available+1);
        report.cases.push({name:'Math print sizing',formulas:printMath,pass:printPass});
        if(!printPass)report.errors.push('Wide formula does not fit print container');
        await page.pdf({path:path.join(root,'tmp/pdfs/engine-math.pdf'),format:'A4',printBackground:true,margin:{top:'18mm',right:'16mm',bottom:'18mm',left:'16mm'}});
      }
      await page.close();
    }
    report.pass=report.errors.length===0;
    fs.writeFileSync(path.join(root,'artifacts/engine-qa.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if(!report.pass)process.exitCode=1;
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
