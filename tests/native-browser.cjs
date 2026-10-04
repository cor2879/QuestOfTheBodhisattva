const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true});
 for(const [viewport,entry]of [[{width:1280,height:720},'index.html'],[{width:844,height:390},'play.html'],[{width:390,height:844},'index.html']]){
  const p=await b.newPage({viewport,hasTouch:viewport.width<1000}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.resolve(__dirname,'../'+entry));await p.waitForSelector('#welcome[open]');
  // A real ceremony initializes the native Lilith character, including saved choices.
  await p.click('#start-reading');for(let i=0;i<4;i++){const c=await p.evaluate(()=>{const pair=Fortune.pair(CreationUI.reading);return pair.includes('lilith')?'lilith':pair[0]});await p.click('[data-choice="'+c+'"]');}
  await p.fill('#character-name','Coast Walker');await p.click('#begin');let s=await p.evaluate(()=>nativeSnapshot());assert.equal(s.monad,4);assert.equal(s.agility,20);assert.equal(s.charisma,18);assert.equal(s.x,40);
  await p.evaluate(()=>nativeCanvas.focus());await p.keyboard.press('ArrowRight');s=await p.evaluate(()=>nativeSnapshot());assert.equal(s.x,41);assert.equal(s.turn,1);assert.equal(s.food,99.5);assert.equal(s.time,1);
  for(let i=0;i<2;i++)await p.click('[data-native="4"]');await p.click('[data-native="6"]');assert((await p.locator('#native-message').textContent()).includes("Haven."));assert.equal(await p.evaluate(()=>nativeSnapshot().turn),3);
  const saved=await p.evaluate(()=>JSON.stringify(nativeSaveData()));await p.reload();await p.waitForSelector('#welcome[open]');await p.click('#welcome-resume');assert.equal(await p.evaluate(()=>nativeSnapshot().x),43);assert.equal(await p.locator('#native-name').textContent(),'Coast Walker');assert.equal(await p.evaluate(()=>nativeCharacter.choices.length),4);
  await p.locator('#native-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(saved.replace('"x":43','"x":0'))});await p.waitForFunction(()=>document.getElementById('native-message').textContent.includes('Invalid'));assert.equal(await p.evaluate(()=>JSON.stringify(nativeSaveData())),saved);
  // Upstream movement crosses both native region seams, and blocks mountains/water without spending a turn.
  await p.evaluate(()=>nativeCall('quest_restore','number',Array(7).fill('number'),[4,85,85,100,100,0,0]));await p.click('[data-native="4"]');await p.click('[data-native="2"]');s=await p.evaluate(()=>nativeSnapshot());assert.equal(s.x,86);assert.equal(s.y,86);assert.equal(s.turn,2);
  await p.evaluate(()=>nativeCall('quest_restore','number',Array(7).fill('number'),[4,57,40,100,100,0,0]));await p.click('[data-native="4"]');assert.equal(await p.evaluate(()=>nativeSnapshot().turn),0);assert((await p.locator('#native-message').textContent()).includes('mountains'));
  await p.evaluate(()=>nativeCall('quest_restore','number',Array(7).fill('number'),[4,12,30,100,100,0,0]));await p.click('[data-native="3"]');assert.equal(await p.evaluate(()=>nativeSnapshot().x),12);assert.equal(await p.evaluate(()=>nativeSnapshot().turn),0);
  await p.click('#native-new');const before=await p.evaluate(()=>nativeSnapshot().turn);await p.keyboard.press('ArrowUp');assert.equal(await p.evaluate(()=>nativeSnapshot().turn),before);await p.click('#welcome-cancel');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(viewport.width>=650){assert.equal(await p.evaluate(()=>scrollY),0);assert((await p.locator('canvas').boundingBox()).y+(await p.locator('canvas').boundingBox()).height<=viewport.height);}
  await p.screenshot({path:'/tmp/quest-native-'+viewport.width+'.png'});assert.deepEqual(errors,[]);console.log('PASS native browser',viewport,entry);await p.close();
 }
 const p=await b.newPage();await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForSelector('#welcome[open]');
 for(const[id,expect]of [['ariel',['stamina',20]],['samael',['strength',20]],['raphael',['intelligence',18]],['jophiel',['intelligence',20]],['lilith',['agility',20]]]){await p.click('#choose-direct');await p.click('[data-monad="'+id+'"]');await p.click('#begin');assert.equal(await p.evaluate(key=>nativeSnapshot()[key],expect[0]),expect[1]);await p.click('#native-new');}
 await p.click('#welcome-cancel');await p.evaluate(()=>{const data=nativeSaveData();data.state.food=0;nativeRestore(JSON.stringify(data));});assert.equal(await p.evaluate(()=>nativeSnapshot().food),0);await p.click('[data-native="4"]');assert.equal(await p.evaluate(()=>nativeSnapshot().turn),0);console.log('PASS five native Monads and exhausted save');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
