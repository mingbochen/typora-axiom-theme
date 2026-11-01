/* Resolve real platform glyph fonts using the reference App's default CSS stacks.
 * This is a local browser probe, not inspection of the App's live DOM.
 */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage();
  await page.setContent('<html><head><meta charset="utf-8"></head><body><span id="ui-latin">Sphinx 123</span><span id="ui-cjk">中文系统字体</span><span id="code-latin">const value = 123;</span><span id="code-cjk">中文代码注释</span></body></html>');
  const stacks={ui:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',code:'ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'};
  await page.evaluate(stacks=>{for(const [key,value] of Object.entries(stacks))for(const element of document.querySelectorAll(`[id^="${key}-"]`)){element.style.fontFamily=value;element.style.fontSize='16px';}},stacks);
  await page.evaluate(()=>document.fonts.ready);
  const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  const {root:dom}=await cdp.send('DOM.getDocument');const results=[];
  for(const id of ['ui-latin','ui-cjk','code-latin','code-cjk']){
   const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:dom.nodeId,selector:'#'+id});
   const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});results.push({sample:id,fonts});
  }
  const report={scope:'Platform fonts resolved in local Chrome using source-verified App default stacks; not live App DOM.',stacks,results};
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/font-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
