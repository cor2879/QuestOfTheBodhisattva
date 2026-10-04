const{chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
async function walk(p,gx,gy){await p.evaluate(({gx,gy})=>{
 const layout=['###########','#.........#','#.###.###.#','#...#...#.#','###.#.#.#.#','#...#.#...#','#.###.###.#','#.....#...#','#.#####.#.#','#.........#','###########'];
 const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
 for(let step=0;step<200;step++){
  let s=nativeSnapshot(),d=nativeCall('quest_dungeon','string',[],[]).split(',').map(Number);if(s.hp<=0)throw Error('Fell in combat');if(s.px===gx&&s.py===gy)return;
  const adjacent=[0,1,2].find(i=>d[6+i*3]>0&&Math.abs(d[4+i*3]-s.px)+Math.abs(d[5+i*3]-s.py)===1);
  let desired,attack=adjacent!==undefined;
  if(attack)desired=dirs.findIndex(([x,y])=>s.px+x===d[4+adjacent*3]&&s.py+y===d[5+adjacent*3]);
  else{const q=[{x:s.px,y:s.py,path:[]}],seen=new Set([s.px+','+s.py]);let route;
   for(let k=0;k<q.length;k++){const a=q[k];if(a.x===gx&&a.y===gy){route=a.path;break;}dirs.forEach(([dx,dy],i)=>{const x=a.x+dx,y=a.y+dy,key=x+','+y;if(seen.has(key)||!layout[y]||layout[y][x]!=='.')return;seen.add(key);q.push({x,y,path:[...a.path,i]});});}
   if(!route)throw Error('No route');desired=route[0];
  }
  const delta=(desired-d[3]+4)%4;if(delta)nativeAct(delta===3?3:delta===2?2:4);else nativeAct(attack?8:1);
 }
 throw Error('Navigation exceeded budget');
},{gx,gy});}
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,headless:true});
 for(const[width,height,entry,monad,outcome]of [[1280,720,'index.html','ariel',9],[844,390,'play.html','samael',10],[390,844,'index.html','raphael',9],[1280,720,'index.html','jophiel',10],[1280,720,'index.html','lilith',9]]){
  const p=await b.newPage({viewport:{width,height},hasTouch:width<1000}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.resolve(__dirname,'../'+entry));await p.waitForSelector('#welcome[open]');await p.click('#choose-direct');await p.click('[data-monad="'+monad+'"]');await p.click('#begin');
  // Gate requires completed Haven investigation; a valid checkpoint avoids repeating town coverage.
  await p.evaluate(()=>{const d=nativeSaveData();Object.assign(d.state,{x:51,y:47});nativeRestore(JSON.stringify(d));nativeAct(6);});assert.equal(await p.evaluate(()=>nativeSnapshot().location),0);
  await p.evaluate(()=>{const d=nativeSaveData();Object.assign(d.state,{quest:3,clue:1,blessing:1,resolution:1});nativeRestore(JSON.stringify(d));nativeAct(6);});let s=await p.evaluate(()=>nativeSnapshot());assert.equal(s.location,2);assert.equal(s.px,1);assert.equal(s.py,9);
  const entrance=await p.evaluate(()=>JSON.stringify(nativeSaveData()));
  await p.evaluate(()=>{const d=nativeSaveData();Object.assign(d.state,{px:2,py:7,hp:60,tonics:1});d.dungeon='1,0,0,1,3,7,16,7,5,18,9,3,20';nativeRestore(JSON.stringify(d));});
  const tonicTime=await p.evaluate(()=>nativeSnapshot().time);await p.click('[data-native="7"]');assert.equal(await p.evaluate(()=>nativeSnapshot().hp),81);assert.equal(await p.evaluate(()=>nativeSnapshot().time),tonicTime+0.5);assert.equal(await p.evaluate(()=>nativeSnapshot().tonics),0);await p.evaluate(entrance=>nativeRestore(entrance),entrance);
  const before=await p.evaluate(()=>nativeSnapshot().turn);await p.evaluate(()=>nativeAct(3));await p.evaluate(()=>nativeAct(1));assert.equal(await p.evaluate(()=>nativeSnapshot().turn),before+1); // west wall costs no additional turn
  await p.evaluate(()=>nativeAct(4));await walk(p,1,7);await p.evaluate(()=>nativeAct(4));await p.screenshot({path:'/tmp/quest-sanctuary-'+width+'-'+monad+'.png'});
  await walk(p,3,3);await p.evaluate(()=>nativeAct(6));assert.equal((await p.evaluate(()=>nativeSaveData().dungeon)).split(',')[1],'1');const gold=await p.evaluate(()=>nativeSnapshot().gold);await p.evaluate(()=>nativeAct(6));assert.equal(await p.evaluate(()=>nativeSnapshot().gold),gold);
  const saved=await p.evaluate(()=>JSON.stringify(nativeSaveData()));await p.reload();await p.waitForSelector('#welcome[open]');await p.click('#welcome-resume');assert.equal(await p.evaluate(()=>JSON.stringify(nativeSaveData())),saved);
  for(const change of [{px:0},{x:43},{dungeon:'1,0,0,0,3,7,999999999999999999999999999999,7,5,18,9,3,20'},{dungeon:'1,0,0,0,3,7,16,3,7,18,9,3,20'}]){assert(await p.evaluate(change=>{const d=nativeSaveData();if(change.dungeon)d.dungeon=change.dungeon;else Object.assign(d.state,change);try{nativeRestore(JSON.stringify(d));return false;}catch{return true;}},change));assert.equal(await p.evaluate(()=>JSON.stringify(nativeSaveData())),saved);}
  await walk(p,9,1);await p.evaluate(()=>nativeAct(6));assert((await p.locator('#native-message').textContent()).includes('captive memory'));await p.evaluate(outcome=>nativeAct(outcome),outcome);s=await p.evaluate(()=>nativeSnapshot());const wonGold=s.gold,wonXP=s.experience;assert((await p.locator('#native-message').textContent()).includes(monad[0].toUpperCase()+monad.slice(1)));await p.evaluate(outcome=>nativeAct(outcome),outcome);assert.equal(await p.evaluate(()=>nativeSnapshot().gold),wonGold);assert.equal(await p.evaluate(()=>nativeSnapshot().experience),wonXP);
  await walk(p,1,9);await p.evaluate(()=>nativeAct(6));assert.equal(await p.evaluate(()=>nativeSnapshot().location),0);assert.equal(await p.evaluate(()=>nativeSnapshot().x),51);await p.evaluate(()=>nativeAct(6));assert.equal((await p.evaluate(()=>nativeSaveData().dungeon)).split(',')[2],outcome===9?'1':'2');
  // Rescue makes death/exhaustion recoverable and retains encounter state.
  await p.evaluate(()=>{const d=nativeSaveData();d.state.hp=0;nativeRestore(JSON.stringify(d));nativeAct(6);});s=await p.evaluate(()=>nativeSnapshot());assert.equal(s.x,43);assert.equal(s.location,0);assert.equal(s.hp,50);assert.equal(s.food,20);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width>=650){assert.equal(await p.evaluate(()=>scrollY),0);const box=await p.locator('canvas').boundingBox();assert(box.y+box.height<=height);}assert.deepEqual(errors,[]);console.log('PASS sanctuary',monad,width,height,'outcome',outcome);await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
