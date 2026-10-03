const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{drive}=require('./expedition.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../play.html'));
 for(const [patron,seed]of [['samael','EXPEDITION-2'],['raphael','EXPEDITION-0']]){
  if(!await page.locator('#welcome').isVisible()){await page.click('#again');}
  await page.click('#choose-direct');
  await page.locator('[data-patron="'+patron+'"]').click();await page.fill('#seed',seed);await page.click('#begin');
  const{state:expected,commands}=drive(patron,seed);
  await page.evaluate(commands=>{
   for(const command of commands){
    if(document.getElementById('info').open)document.getElementById('info-close').click();
    if(command.relic){const index=run.pendingRelics.indexOf(command.relic);document.getElementById('relic-choices').children[index].click();}
    else take(command.action);
   }
  },commands);
  assert.equal(await page.evaluate(()=>run.status),'won');
  assert.equal(await page.evaluate(()=>run.ending),expected.ending);
  assert.equal(await page.evaluate(()=>run.rescued),5);
  assert(await page.locator('#ending').isVisible());
  assert.equal(await page.evaluate(()=>scrollY),0);
  console.log('PASS browser expedition',patron,expected.ending,commands.length,'actions');
 }
 await page.click('#ending-codex');assert.equal(await page.locator('#info-content article').count(),5);await page.click('#info-close');
 const exported=page.waitForEvent('download');await page.click('#export');const download=await exported;
 await download.saveAs('/tmp/aeon-verified-export.json');
 assert.equal(require('../engine.js').deserialize(require('node:fs').readFileSync('/tmp/aeon-verified-export.json','utf8')).status,'won');
 await page.reload();await page.click('#welcome-resume');assert(await page.locator('#ending').isVisible());assert.equal(await page.evaluate(()=>run.ending),'liberation');
 await page.screenshot({path:'/tmp/aeon-ending.png'});assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
