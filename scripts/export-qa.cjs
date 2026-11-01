/* Representative exported task-list DOM. This does not invoke Typora's exporter. */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
const theme=fs.readFileSync(path.join(root,'axiom.css'),'utf8');
const installed=process.env.TYPORA_RESOURCES;
const tag=installed?'export-native-css':'export';
const base=installed?fs.readFileSync(path.join(installed,'style/base.css'),'utf8'):
 '*{box-sizing:border-box}body{margin:0}#write{margin:auto}li{position:relative}.md-task-list-item>input{position:absolute;top:0;left:0;margin-left:-1.2em}';
const fixture=`<h1>任务清单的导出排版</h1><p>紧凑列表、包含段落的列表和多行任务，都应该让复选框对齐第一行。</p>
<ul>
<li class="task-list-item"><input type="checkbox" checked><span class="task-label">紧凑任务：中文与 English 混排</span></li>
<li class="task-list-item md-task-list-item"><input type="checkbox"><p><span class="task-label">段落任务：第一段的复选框应在同一行</span></p><p>补充说明保留段落间距。</p></li>
<li class="task-list-item md-task-list-item"><input type="checkbox" checked><p><span class="task-label">多行任务：当内容在窄窗口或大字号下换行时，复选框仍应对齐首行，而不是整段文字的中间。</span></p><ul><li class="task-list-item"><input type="checkbox"><span class="task-label">嵌套任务也要维持缩进</span></li></ul></li>
</ul>`;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const report={scope:installed?'Installed Typora base CSS + representative exported task DOM; not native export.':'Portable representative export DOM; not native export.',cases:[],errors:[]};
 try{
  for(const media of ['screen','print'])for(const [width,fontSize] of [[1100,16],[390,16],[390,24]]){
   const page=await browser.newPage({viewport:{width,height:1000}});
   await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${base}\n${theme}</style><style>html{font-size:${fontSize}px!important}</style></head><body class="typora-export"><article id="write">${fixture}</article></body></html>`);
   await page.emulateMedia({media});await page.evaluate(()=>document.fonts.ready);
   const values=await page.evaluate(()=>({pageWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,tasks:[...document.querySelectorAll('.task-list-item')].map(li=>{const input=li.querySelector(':scope>input');const label=li.querySelector(':scope>.task-label,:scope>p>.task-label');const check=input.getBoundingClientRect();const first=label.getClientRects()[0];return{centerOffset:Math.abs(check.top+check.height/2-(first.top+first.height/2)),gap:first.left-check.right,checkboxWidth:check.width,labelTop:first.top,checkboxTop:check.top};})}));
   const pass=values.scrollWidth<=width+1&&values.tasks.every(t=>t.centerOffset<=5&&t.gap>=3&&t.gap<=28);
   report.cases.push({media,width,fontSize,...values,pass});if(!pass)report.errors.push(`Task alignment: ${media},${width}px,${fontSize}px`);
   if(width===390&&fontSize===24&&media==='screen')await page.screenshot({path:path.join(root,'artifacts',`${tag}-tasks-large-font.png`),fullPage:true});
   if(width===1100&&fontSize===16&&media==='screen')await page.screenshot({path:path.join(root,'artifacts',`${tag}-tasks.png`),fullPage:true});
   await page.close();
  }
  report.pass=!report.errors.length;fs.writeFileSync(path.join(root,'artifacts',`${tag}-qa.json`),JSON.stringify(report,null,2));console.log(JSON.stringify({scope:report.scope,cases:report.cases.length,pass:report.pass,errors:report.errors}));if(!report.pass)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
