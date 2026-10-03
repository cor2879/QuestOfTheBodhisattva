const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true});
 for(const viewport of [{width:1280,height:720},{width:844,height:390},{width:390,height:844}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<1000}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../play.html'));await page.screenshot({path:'/tmp/aeon-fortune-intro-'+viewport.width+'.png'});
  await page.click('#choose-direct');
  await page.locator('#patrons img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>img.decode()));});
  assert.equal(await page.locator('#patrons img').count(),5);
  await page.screenshot({path:'/tmp/aeon-fortune-deck-'+viewport.width+'.png'});await page.reload();
  for(const id of ['samael','raphael','jophiel','ariel','lilith']){
   await page.click('#start-reading');if(id==='samael')await page.screenshot({path:'/tmp/aeon-fortune-question-'+viewport.width+'.png'});const first=await page.evaluate(()=>JSON.stringify(CreationUI.reading));
   await page.locator('[data-choice]').first().click();await page.click('#reading-back');assert.equal(await page.evaluate(()=>JSON.stringify(CreationUI.reading)),first);
   for(let i=0;i<4;i++){
    const choice=await page.evaluate(id=>{const p=Fortune.pair(CreationUI.reading);return p.includes(id)?id:p[0]},id);
    await page.locator('[data-choice="'+choice+'"]').click();
   }
   assert.equal(await page.locator('#revealed-name').textContent(),id.charAt(0).toUpperCase()+id.slice(1));
   assert.equal(await page.locator('#reading-summary li').count(),4);
   assert(await page.locator('#revealed-card img').evaluate(img=>img.complete&&img.naturalWidth>0));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(id==='lilith'){
    await page.screenshot({path:'/tmp/aeon-fortune-reveal-'+viewport.width+'.png'});
    await page.fill('#character-name','Night Wanderer');await page.fill('#seed','EXPEDITION-2');await page.click('#begin');
    assert.equal(await page.evaluate(()=>run.patron),'lilith');assert.equal(await page.locator('#character-label').textContent(),'Night Wanderer');
    assert.equal(await page.evaluate(()=>run.creation.choices.length),4);await page.reload();await page.click('#welcome-resume');assert.equal(await page.evaluate(()=>run.creation.name),'Night Wanderer');
   }else{
    await page.reload();
   }
  }
  assert.deepEqual(errors,[]);console.log('PASS Fortune browser',viewport);await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
