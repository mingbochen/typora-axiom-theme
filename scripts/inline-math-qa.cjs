/* Real local MathJax with representative native inline wrappers, not live editor QA. */
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'tmp/pdfs'),{recursive:true});
const resources=process.env.TYPORA_RESOURCES;if(!resources)throw new Error('Set TYPORA_RESOURCES');
execFileSync(process.env.PYTHON_PATH||'python',[path.join(__dirname,'extract-dev-assets.py')],{stdio:'inherit'});
const base=['base.css','base-control.css'].map(name=>fs.readFileSync(path.join(resources,'style',name),'utf8')).join('\n');
const theme=fs.readFileSync(path.join(root,'axiom.css'),'utf8');
const longFormula=String.raw`p_\theta(x_t\mid x_1,\ldots,x_{t-1})=\frac{\exp\bigl((Wh_t)_{x_t}\bigr)}{\sum_{v\in\mathcal V}\exp\bigl((Wh_t)_v\bigr)}\quad\text{for }t=1,\ldots,T`;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const report={scope:'Local installed MathJax + inline preview DOM; native editor not tested.',cases:[],errors:[]};
 try{
  for(const width of [1100,640,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${base}\n${theme}</style><style>.baseline-reference #write .md-inline-math,.baseline-reference #write .md-inline-math-container>mjx-container,.baseline-reference #write .md-inline-math-container>mjx-container>svg{max-width:none!important;overflow:visible!important}.baseline-reference #write .md-inline-math-container>mjx-container{display:inline!important}.baseline-marker{display:inline-block;width:0;height:0;vertical-align:baseline}</style></head><body class="baseline-reference"><article id="write"><h1>行内公式与正文的关系</h1><p>普通文字 Agjp <span class="baseline-marker" id="marker"></span><span class="md-inline-math"><span class="md-inline-math-container" id="short"></span></span> 与后面的中文，应该保持自然基线。</p><p>较长的行内表达式：<span class="md-inline-math"><span class="md-inline-math-container" id="long"></span></span>，不能撑宽整个页面。</p><p>后续段落仍然保持正常的字体、行高和阅读宽度。</p></article></body></html>`);
   await page.evaluate(()=>{window.MathJax={startup:{typeset:false}};});
   await page.addScriptTag({path:path.join(root,'artifacts/local-engines/tex-svg-full.js')});
   await page.evaluate(async longFormula=>{await MathJax.startup.promise;document.querySelector('#short').appendChild(await MathJax.tex2svgPromise('x_t^2+g_i',{display:false}));document.querySelector('#long').appendChild(await MathJax.tex2svgPromise(longFormula,{display:false}));const raw=document.createElement('script');raw.type='math/tex';raw.textContent=longFormula;document.querySelector('#long').appendChild(raw);MathJax.startup.document.addStyleSheet();},longFormula);
   await page.evaluate(()=>document.fonts.ready);
   const baseline=await page.evaluate(()=>({shortOffset:document.querySelector('#marker').getBoundingClientRect().top-document.querySelector('#short svg').getBoundingClientRect().bottom,shortWidth:document.querySelector('#short svg').getBoundingClientRect().width}));
   await page.evaluate(()=>document.body.classList.remove('baseline-reference'));
   const result=await page.evaluate(()=>{const container=document.querySelector('#long mjx-container');const p=container.closest('p');const outer=container.closest('.md-inline-math');return{documentWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,shortOffset:document.querySelector('#marker').getBoundingClientRect().top-document.querySelector('#short svg').getBoundingClientRect().bottom,shortWidth:document.querySelector('#short svg').getBoundingClientRect().width,longOuterWidth:outer.getBoundingClientRect().width,longSvgWidth:container.querySelector('svg').getBoundingClientRect().width,paragraphWidth:p.getBoundingClientRect().width,endVisible:container.querySelector('svg').getBoundingClientRect().right<=p.getBoundingClientRect().right+1};});
   const pass=result.scrollWidth<=width+1&&result.longOuterWidth<=result.paragraphWidth+1&&Math.abs(result.shortOffset-baseline.shortOffset)<=0.75&&Math.abs(result.shortWidth-baseline.shortWidth)<=0.75&&result.endVisible;
   report.cases.push({width,baseline,...result,pass});if(!pass)report.errors.push(`Inline math geometry at ${width}px`);
   await page.screenshot({path:path.join(root,'artifacts',`inline-math-${width}.png`),fullPage:true});
   const expansion=await page.evaluate(()=>{const outer=document.querySelector('#long').parentElement;outer.classList.add('md-expand');const state={preview:getComputedStyle(outer.querySelector('mjx-container')).display,raw:getComputedStyle(outer.querySelector('script')).display};outer.classList.remove('md-expand');return state;});
   const expansionPass=expansion.preview==='none'&&expansion.raw==='inline';report.cases.push({name:'Native inline preview expansion CSS',width,...expansion,pass:expansionPass});if(!expansionPass)report.errors.push(`Inline preview expansion at ${width}px`);
   if(width===1100)await page.pdf({path:path.join(root,'tmp/pdfs/inline-math.pdf'),format:'A4',margin:{top:'18mm',right:'16mm',bottom:'18mm',left:'16mm'}});
   await page.close();
  }
  report.pass=!report.errors.length;fs.writeFileSync(path.join(root,'artifacts/inline-math-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
