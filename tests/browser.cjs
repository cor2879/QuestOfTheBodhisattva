const {chromium}=require('playwright'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{for(const viewport of [{width:1920,height:1080},{width:1280,height:720},{width:844,height:390},{width:390,height:844}]){
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true}),page=await browser.newPage({viewport,hasTouch:viewport.width<1000});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../legacy/index.html'));
 assert(await page.locator('#welcome').isVisible());await page.click('#choose-direct');assert.equal(await page.locator('[data-patron]').count(),5);
 await page.locator('[data-patron="jophiel"]').click();await page.fill('#seed','BROWSER-TEST');await page.click('#begin');
 assert.equal(await page.evaluate(()=>run.patron),'jophiel');
 const initial=await page.locator('canvas').boundingBox();await page.keyboard.press('f');assert.equal(await page.evaluate(()=>run.turn),1);assert.equal(await page.evaluate(()=>run.light),8);
 // Real keyboard and pointer controls, not just direct rule calls.
 const direction=await page.evaluate(()=>Aeon.DIRS.find(([dx,dy])=>run.floor.tiles[Aeon.key(run.x+dx,run.y+dy)]===1));
 await page.locator('[data-move="'+direction.join(',')+'"]').click();assert.equal(await page.evaluate(()=>run.turn),2);
 await page.click('#help');await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>run.turn),2);await page.click('#info-close');
 await page.click('#save');await page.reload();await page.click('#welcome-resume');assert.equal(await page.evaluate(()=>run.turn),2);
 assert.equal(await page.evaluate(()=>run.patron),'jophiel');
 // Import restores a legal generated state and invalid input preserves it.
 const valid=await page.evaluate(()=>Aeon.serialize(run));
 await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"game":"wrong"}')});
 await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('Invalid'));
 assert.equal(await page.evaluate(()=>Aeon.serialize(run)),valid);
 await page.locator('#import-file').setInputFiles({name:'saved.json',mimeType:'application/json',buffer:Buffer.from(valid)});
 await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('Imported'));
 await page.click('#codex');await page.click('#info-close');
 const geometry=await page.evaluate(()=>({scroll:scrollY,w:document.documentElement.scrollWidth,screen:innerWidth,bottom:canvas.getBoundingClientRect().bottom}));
 assert(geometry.w<=geometry.screen);if(viewport.width>=650){assert.equal(geometry.scroll,0);assert(geometry.bottom<=viewport.height);assert.deepEqual(await page.locator('canvas').boundingBox(),initial);}
 await page.screenshot({path:'/tmp/aeon-'+viewport.width+'.png',fullPage:true});assert.deepEqual(errors,[]);console.log('PASS browser',viewport,geometry);await browser.close();
}})().catch(e=>{console.error(e);process.exit(1)});
