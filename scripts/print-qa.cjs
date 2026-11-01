/* Browser print fixture; Typora's native PDF exporter still needs its own check. */
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const root=path.resolve(__dirname,'..');
require('./preview.cjs');
const output=path.join(root,'tmp/pdfs');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const report={scope:'Browser print layout only; not a native Typora export.',cases:[]};
  try{
    for(const name of ['showcase','stress-test']){
      const page=await browser.newPage({viewport:{width:1100,height:1000}});
      await page.goto(pathToFileURL(path.join(root,`artifacts/preview/${name}.html`)).href);
      await page.emulateMedia({media:'print'});
      await page.evaluate(()=>document.fonts.ready);
      const measurements=await page.evaluate(()=>({bodyFont:getComputedStyle(document.querySelector('#write')).fontSize,sidebar:getComputedStyle(document.querySelector('.preview-sidebar')).display,titlebar:getComputedStyle(document.querySelector('.preview-titlebar')).display,codeWhitespace:getComputedStyle(document.querySelector('pre.md-fences')).whiteSpace}));
      await page.pdf({path:path.join(output,`${name}.pdf`),format:'A4',printBackground:true,margin:{top:'18mm',right:'16mm',bottom:'18mm',left:'16mm'}});
      report.cases.push({name,...measurements,pass:measurements.sidebar==='none'&&measurements.titlebar==='none'&&measurements.codeWhitespace==='pre-wrap'});
      await page.close();
    }
    report.pass=report.cases.every(c=>c.pass);
    fs.writeFileSync(path.join(root,'artifacts/print-qa.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if(!report.pass)process.exitCode=1;
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
