/* Installed-CSS focus/typewriter print regressions; not native export invocation. */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const resources=process.env.TYPORA_RESOURCES;
if(!resources)throw new Error('Set TYPORA_RESOURCES to an installed Typora resources folder');
const native=['base.css','codemirror.css','base-control.css'].map(f=>fs.readFileSync(path.join(resources,'style',f),'utf8')).join('\n');
const theme=fs.readFileSync(path.join(root,'axiom.css'),'utf8');
const output=path.join(root,'artifacts');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const report={scope:'Installed Typora CSS + representative focus/typewriter DOM in browser print media. Not native export.',cases:[]};
 try{
  const page=await browser.newPage({viewport:{width:900,height:650}});
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${native}\n${theme}</style></head><body class="on-focus-mode"><article id="write"><h1 class="md-end-block md-focus">聚焦编辑后的打印</h1><p class="md-end-block"><strong id="text">这段正文在打印时应当保持正常墨色。</strong></p><ul><li cid="item">未聚焦的列表文字</li><li class="md-task-list-item"><input type="checkbox" checked>已完成任务</li></ul><div class="md-end-block"><img style="width:160px" alt="sample" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='60'%3E%3Crect width='160' height='60' fill='%23f6c543'/%3E%3C/svg%3E"><svg width="180" height="50"><text x="8" y="30">数学/图示预览</text></svg></div><pre class="md-fences md-end-block" lang="python"><div class="CodeMirror cm-s-inner"><pre class="CodeMirror-line"><span class="cm-keyword" id="token">return</span> value</pre></div></pre></article></body></html>`);
  for(const media of ['screen','print']){
   await page.emulateMedia({media});
   const values=await page.evaluate(()=>{const s=q=>getComputedStyle(document.querySelector(q));return{text:s('#text').color,list:s('li[cid]').color,token:s('#token').color,imageOpacity:s('img').opacity,svgOpacity:s('svg').opacity,taskOpacity:s('input').opacity};});
   const pass=media==='screen'
    ? values.text==='rgb(200, 200, 200)'&&values.token===values.text&&values.imageOpacity==='0.3'&&values.svgOpacity==='0.3'&&values.taskOpacity==='0.2'
    : [values.text,values.list,values.token].every(c=>c==='rgb(26, 28, 31)')&&[values.imageOpacity,values.svgOpacity,values.taskOpacity].every(o=>o==='1');
   report.cases.push({media,...values,pass});
   await page.screenshot({path:path.join(output,`focus-${media}.png`)});
  }
  await page.evaluate(()=>document.querySelector('#write').classList.add('typewriter-mode'));
  for(const media of ['screen','print']){
   await page.emulateMedia({media});
   if(media==='screen')await page.waitForFunction(()=>Math.abs(parseFloat(getComputedStyle(document.querySelector('#write')).paddingTop)-document.body.getBoundingClientRect().width/2)<1);
   const paddingTop=await page.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('#write')).paddingTop));
   report.cases.push({name:'Typewriter top spacing',media,paddingTop,pass:media==='screen'?paddingTop>100:paddingTop===0});
   if(media==='print')await page.screenshot({path:path.join(output,'typewriter-print.png')});
  }
  report.pass=report.cases.every(c=>c.pass);
  fs.writeFileSync(path.join(output,'focus-print-qa.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  if(!report.pass)process.exitCode=1;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
